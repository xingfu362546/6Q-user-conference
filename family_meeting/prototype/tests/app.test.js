const assert = require('assert');
const { createApp } = require('../assets/app.js');

function makeHarness(initialState, confirmResult = true) {
  let state = JSON.parse(JSON.stringify(initialState));
  let saves = 0;
  let confirmationMessage = null;
  const rendered = { views: [], roles: [], sheets: [] };
  const callbacks = [];

  const app = createApp({
    store: {
      load: () => state,
      save: (nextState) => {
        state = JSON.parse(JSON.stringify(nextState));
        saves += 1;
      },
    },
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
    },
  });

  app.onRoleChange.push((member) => callbacks.push(member));
  return {
    app,
    rendered,
    callbacks,
    getState: () => state,
    getSaves: () => saves,
    getConfirmationMessage: () => confirmationMessage,
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

  assert.strictEqual(app.showView('meet'), true);
  assert.strictEqual(app.currentViewId, 'meet');
  assert.deepStrictEqual(rendered.views, ['family', 'meet']);
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

console.log('app.test.js OK');
