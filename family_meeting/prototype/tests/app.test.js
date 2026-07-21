const assert = require('assert');
const { createApp, memberLabel } = require('../assets/app.js');

assert.strictEqual(memberLabel({ role: '妈', nickname: '妈妈' }), '妈妈');
assert.strictEqual(memberLabel({ name: '旧成员' }), '旧成员');

function makeHarness(initialState, confirmResult = true) {
  let state = JSON.parse(JSON.stringify(initialState));
  let saves = 0;
  let resets = 0;
  let confirmationMessage = null;
  const rendered = {
    views: [], roles: [], sheets: [], families: [], reviews: [],
  };
  const callbacks = [];

  const app = createApp({
    store: {
      load: () => state,
      save: (nextState) => {
        state = JSON.parse(JSON.stringify(nextState));
        saves += 1;
      },
      reset: () => {
        resets += 1;
        state = {
          family: null,
          currentMemberId: null,
          meetings: [],
          todos: [],
          draftMeeting: null,
        };
      },
    },
    createDemoState: () => ({
      family: {
        id: 'family-demo',
        defaultHostId: 'demo-mother',
        members: [{ id: 'demo-mother', nickname: '妈妈' }],
      },
      currentMemberId: 'demo-mother',
    }),
    confirmLeave: (message) => {
      confirmationMessage = message;
      return confirmResult;
    },
    ui: {
      renderView: (viewId) => rendered.views.push(viewId),
      renderRole: (member) => rendered.roles.push(member),
      renderRoleSheet: (members, currentMemberId, open) => {
        rendered.sheets.push({ members, currentMemberId, open });
      },
      renderFamily: (nextState) => rendered.families.push(nextState.family),
      renderReview: (nextState) => rendered.reviews.push(nextState),
    },
  });

  app.onRoleChange.push((member) => callbacks.push(member));
  return {
    app,
    rendered,
    callbacks,
    getState: () => state,
    getSaves: () => saves,
    getResets: () => resets,
    getConfirmationMessage: () => confirmationMessage,
    setStoredState: (nextState) => {
      state = JSON.parse(JSON.stringify(nextState));
    },
  };
}

const baseState = {
  family: {
    id: 'family-1',
    name: '测试家庭',
    members: [
      { id: 'member-1', name: '妈妈' },
      { id: 'member-2', name: '孩子' },
    ],
  },
  currentMemberId: 'member-1',
  meetings: [],
  todos: [],
  draftMeeting: null,
};

{
  const { app, rendered } = makeHarness(baseState);
  assert.strictEqual(app.currentViewId, 'family');
  assert.deepStrictEqual(rendered.views, ['family']);
  assert.strictEqual(rendered.families.length, 1);

  assert.strictEqual(app.showView('meet'), true);
  assert.strictEqual(app.currentViewId, 'meet');
  assert.deepStrictEqual(rendered.views, ['family', 'meet']);
}

{
  const { app, rendered } = makeHarness(baseState);
  const nextState = {
    ...baseState,
    currentMemberId: 'member-2',
    family: {
      ...baseState.family,
      name: '更新后的家庭',
    },
  };
  app.replaceState(nextState);
  assert.strictEqual(app.getCurrentMember().id, 'member-2');
  assert.strictEqual(rendered.roles.at(-1).id, 'member-2');
  assert.strictEqual(rendered.families.at(-1).name, '更新后的家庭');
}

{
  const { app, callbacks, getState, getSaves } = makeHarness(baseState);
  assert.strictEqual(app.getCurrentMember().name, '妈妈');
  assert.strictEqual(app.setCurrentMember('member-2'), true);
  assert.strictEqual(app.getCurrentMember().name, '孩子');
  assert.strictEqual(getState().currentMemberId, 'member-2');
  assert.strictEqual(getSaves(), 1);
  assert.strictEqual(callbacks.length, 1);
  assert.strictEqual(callbacks[0].id, 'member-2');
  assert.strictEqual(app.setCurrentMember('missing'), false);
}

{
  const harness = makeHarness(baseState);
  harness.setStoredState({
    ...baseState,
    meetings: [{ id: 'meeting-live', transcript: [{ id: 'line-1', text: '刚写入的转写' }] }],
    draftMeeting: { id: 'meeting-live', transcript: [{ id: 'line-1', text: '刚写入的转写' }] },
  });
  harness.app.setCurrentMember('member-2');
  assert.strictEqual(
    harness.getState().meetings[0].transcript[0].text,
    '刚写入的转写',
    '切换角色不得覆盖其他模块刚写入的会议数据',
  );
}

{
  const { app, rendered } = makeHarness({ ...baseState, family: null, currentMemberId: null });
  assert.strictEqual(app.getCurrentMember(), null);
  assert.strictEqual(rendered.roles.at(-1), null);
}

{
  const activeState = {
    ...baseState,
    draftMeeting: { id: 'draft-1', status: 'active' },
  };
  const denied = makeHarness(activeState, false);
  denied.app.showView('meeting-room');
  assert.strictEqual(denied.app.showView('todos'), false);
  assert.strictEqual(denied.app.currentViewId, 'meeting-room');
  assert.strictEqual(denied.getConfirmationMessage(), '离开会议室？进度已自动保存。');

  const allowed = makeHarness(activeState, true);
  allowed.app.showView('meeting-room');
  assert.strictEqual(allowed.app.showView('review'), true);
  assert.strictEqual(allowed.app.currentViewId, 'review');
}

{
  const activeById = {
    ...baseState,
    activeMeetingId: 'meeting-1',
    meetings: [{ id: 'meeting-1', status: 'active' }],
  };
  const denied = makeHarness(activeById, false);
  denied.app.showView('meeting-room');
  assert.strictEqual(denied.app.showView('family'), false);
}

{
  const harness = makeHarness(baseState);
  harness.setStoredState({
    ...baseState,
    todos: [{ id: 'todo-1', status: 'done' }],
  });
  harness.app.showView('review');
  assert.strictEqual(
    harness.rendered.reviews.at(-1).todos[0].status,
    'done',
    '切换视图时应读取待办保存后的最新状态',
  );
}

{
  const harness = makeHarness({
    ...baseState,
    meetings: [{ id: 'old-meeting', status: 'archived' }],
    todos: [{ id: 'old-todo', status: 'done' }],
  });
  const resetState = harness.app.resetDemo();
  assert.strictEqual(harness.getResets(), 1, '重置演示应先清空存储');
  assert.strictEqual(resetState.family.id, 'family-demo');
  assert.strictEqual(resetState.currentMemberId, 'demo-mother');
  assert.deepStrictEqual(resetState.meetings, []);
  assert.deepStrictEqual(resetState.todos, []);
}

console.log('app.test.js OK');
