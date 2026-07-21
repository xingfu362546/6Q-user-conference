const assert = require('assert');
const MeetingTypes = require('../assets/meeting-types.js');
const MeetingEngine = require('../assets/meeting-engine.js');
const Consensus = require('../assets/consensus.js');
const Todos = require('../assets/todos.js');
const { createMeetingFlow } = require('../assets/meeting-flow.js');

function makeHarness(initialState, now = 1720000000000) {
  let state = JSON.parse(JSON.stringify(initialState));
  const shownViews = [];
  const transcriptStarts = [];
  const whiteboardMounts = [];
  const whiteboardSnapshots = [];
  const distillRenders = [];
  const flow = createMeetingFlow({
    meetingTypes: MeetingTypes,
    engine: MeetingEngine,
    transcript: {
      start: (meeting, options) => transcriptStarts.push({ meeting, options }),
      edit: () => {},
      tag: () => {},
    },
    whiteboard: {
      mount: (canvas, meeting, options) => {
        whiteboardMounts.push({ canvas, meeting, options });
        return { setTool: () => {}, redraw: () => {} };
      },
      clearOwn: (meeting, memberId) => {
        meeting.whiteboard.strokes = meeting.whiteboard.strokes
          .filter((stroke) => stroke.memberId !== memberId);
      },
      snapshot: (canvas, meeting) => {
        meeting.whiteboard.snapshot = 'data:image/png;base64,test';
        whiteboardSnapshots.push({ canvas, meeting });
        return meeting.whiteboard.snapshot;
      },
    },
    distill: {
      render: (container, meeting, options) => {
        distillRenders.push({ container, meeting, options });
      },
    },
    consensus: Consensus,
    todos: Todos,
    store: {
      load: () => JSON.parse(JSON.stringify(state)),
      save: (nextState) => {
        state = JSON.parse(JSON.stringify(nextState));
      },
    },
    app: {
      getCurrentMember: () => state.family?.members[0] || null,
      replaceState: (nextState) => {
        state = JSON.parse(JSON.stringify(nextState));
      },
      showView: (viewId) => shownViews.push(viewId),
    },
    now: () => now,
    random: () => 0.1234,
  });
  return {
    flow,
    getState: () => state,
    shownViews,
    transcriptStarts,
    whiteboardMounts,
    whiteboardSnapshots,
    distillRenders,
    setState: (nextState) => {
      state = JSON.parse(JSON.stringify(nextState));
    },
  };
}

const familyState = {
  family: {
    id: 'family-1',
    defaultHostId: 'member-2',
    members: [
      { id: 'member-1', nickname: '妈妈' },
      { id: 'member-2', nickname: '爸爸' },
    ],
  },
  currentMemberId: 'member-1',
  meetings: [],
  todos: [],
  draftMeeting: null,
};

{
  const { flow, getState, shownViews } = makeHarness(familyState);
  const meeting = flow.startMeeting({
    typeId: '01',
    topicId: '01-2',
    hostId: 'member-2',
  });

  assert.deepStrictEqual(meeting, {
    id: 'meeting-1720000000000-4fxc',
    typeId: '01',
    topicId: '01-2',
    hostId: 'member-2',
    memberIds: ['member-1', 'member-2'],
    status: 'active',
    step: 'opening',
    moodRoundDone: true,
    transcript: [],
    whiteboard: { strokes: [] },
    insights: null,
    actionPlan: null,
    createdAt: 1720000000000,
  });
  assert.deepStrictEqual(getState().meetings, [meeting]);
  assert.deepStrictEqual(getState().draftMeeting, meeting);
  assert.strictEqual(getState().activeMeetingId, meeting.id);
  assert.deepStrictEqual(shownViews, ['meeting-room']);
}

{
  const { flow } = makeHarness(familyState);
  const meeting = flow.startMeeting({ typeId: '04', topicId: null, hostId: 'member-1' });
  assert.strictEqual(meeting.topicId, null);
  assert.strictEqual(meeting.moodRoundDone, false);
}

{
  const { flow } = makeHarness(familyState);
  assert.throws(
    () => flow.startMeeting({ typeId: '01', topicId: '01-1', hostId: null }),
    /请选择主持人/,
  );
}

{
  const rejectedPlan = {
    candidates: [{ id: 'action-1', title: '一起散步', assigneeId: 'member-1' }],
    selectedIds: ['action-1'],
    agreedTime: '周六 10:00',
    votes: {},
    memberIds: ['member-1', 'member-2'],
    locked: false,
    votingStarted: true,
  };
  rejectedPlan.votes['member-2'] = {
    choice: 'reject',
    signature: Consensus.signature(rejectedPlan),
  };
  const activeMeeting = {
    id: 'meeting-skip',
    typeId: '01',
    topicId: '01-1',
    hostId: 'member-1',
    memberIds: ['member-1', 'member-2'],
    status: 'active',
    step: 'consensus',
    moodRoundDone: true,
    transcript: [],
    whiteboard: { strokes: [] },
    actionPlan: rejectedPlan,
  };
  const state = {
    ...familyState,
    meetings: [activeMeeting],
    draftMeeting: activeMeeting,
    activeMeetingId: activeMeeting.id,
  };
  let skipHandler;
  const consensusPanel = {
    innerHTML: '',
    querySelector: (selector) => {
      if (selector === '[data-consensus-action="skip"]') {
        return {
          addEventListener: (type, handler) => {
            if (type === 'click') skipHandler = handler;
          },
        };
      }
      return null;
    },
    querySelectorAll: () => [],
  };
  const container = {
    innerHTML: '',
    querySelector: (selector) => (
      selector === '[data-consensus-panel]' ? consensusPanel : null
    ),
    querySelectorAll: () => [],
  };
  const { flow, getState, shownViews } = makeHarness(state);

  flow.renderRoom(container);
  skipHandler();

  const ending = getState().draftMeeting;
  assert.strictEqual(ending.status, 'active');
  assert.strictEqual(ending.step, 'end');
  assert.strictEqual(ending.actionPlan.skipped, true);
  assert.strictEqual(ending.actionPlan.locked, false);
  assert.strictEqual(ending.actionPlan.votes['member-2'].choice, 'reject');
  assert.deepStrictEqual(getState().todos, []);
  assert.deepStrictEqual(shownViews, []);

  let archiveHandler;
  const endContainer = {
    innerHTML: '',
    querySelector: (selector) => {
      if (selector === '[data-meeting-room-action="archive"]') {
        return {
          addEventListener: (type, handler) => {
            if (type === 'click') archiveHandler = handler;
          },
        };
      }
      return null;
    },
    querySelectorAll: () => [],
  };
  flow.renderRoom(endContainer);
  assert.match(endContainer.innerHTML, /完成并归档/);
  archiveHandler();

  const archived = getState().draftMeeting;
  assert.strictEqual(archived.status, 'archived');
  assert.strictEqual(archived.archivedAt, 1720000000000);
  assert.match(archived.whiteboard.snapshot, /^data:image\/svg\+xml/);
  assert.deepStrictEqual(archived.insights, { common: [], core: [] });
  assert.strictEqual(getState().activeMeetingId, null);
  assert.deepStrictEqual(shownViews, ['review']);
}

{
  const activeMeeting = {
    id: 'meeting-active',
    typeId: '01',
    topicId: '01-1',
    hostId: 'member-1',
    memberIds: ['member-1', 'member-2'],
    status: 'active',
    step: 'collect',
    moodRoundDone: true,
    transcript: [{
      id: 'line-1',
      text: '测试转写',
      at: 1720000000000,
      tags: [],
    }],
  };
  const state = {
    ...familyState,
    meetings: [activeMeeting],
    draftMeeting: activeMeeting,
    activeMeetingId: activeMeeting.id,
  };
  const container = {
    innerHTML: '',
    querySelector: (selector) => (
      selector === '[data-whiteboard-canvas]' ? { isConnected: true } : null
    ),
    querySelectorAll: () => [],
  };
  const { flow, transcriptStarts, whiteboardMounts } = makeHarness(state);

  flow.renderRoom(container);

  assert.strictEqual(transcriptStarts.length, 1, '进入会议室应自动启动转写');
  assert.strictEqual(whiteboardMounts.length, 1, 'collect 阶段应挂载共享画板');
  assert.match(container.innerHTML, /data-whiteboard-canvas/);
  assert.match(container.innerHTML, /data-whiteboard-tool="pen"/);
  assert.match(container.innerHTML, /data-whiteboard-action="clear-own"/);
  assert.match(container.innerHTML, /data-transcript-list/);
  assert.match(container.innerHTML, /data-transcript-action="edit"/);
  assert.match(container.innerHTML, /开场/);
  assert.match(container.innerHTML, /表达收集/);
  assert.match(container.innerHTML, /讨论/);
  assert.match(container.innerHTML, /提炼/);
  assert.match(container.innerHTML, /行动共识/);
  assert.match(container.innerHTML, /结束/);
  assert.match(container.innerHTML, /<h1>表达收集<\/h1>/);
  assert.doesNotMatch(container.innerHTML, /<h1>collect<\/h1>|>opening<|>discuss<|>distill<|>consensus<|>end</);
  assert.doesNotMatch(container.innerHTML, /转写开关|停止转写|开始转写/);
}

{
  const activeMeeting = {
    id: 'meeting-discuss',
    typeId: '01',
    topicId: '01-1',
    hostId: 'member-1',
    memberIds: ['member-1', 'member-2'],
    status: 'active',
    step: 'discuss',
    moodRoundDone: true,
    transcript: [],
    whiteboard: { strokes: [] },
  };
  const state = {
    ...familyState,
    meetings: [activeMeeting],
    draftMeeting: activeMeeting,
    activeMeetingId: activeMeeting.id,
  };
  let nextHandler;
  const canvas = { isConnected: true };
  const nextButton = {
    addEventListener: (type, handler) => {
      if (type === 'click') nextHandler = handler;
    },
  };
  const container = {
    innerHTML: '',
    querySelector: (selector) => {
      if (selector === '[data-whiteboard-canvas]') return canvas;
      if (selector === '[data-meeting-room-action="next"]') return nextButton;
      return null;
    },
    querySelectorAll: () => [],
  };
  const { flow, getState, whiteboardSnapshots } = makeHarness(state);

  flow.renderRoom(container);
  nextHandler();

  assert.strictEqual(whiteboardSnapshots.length, 1, '进入 distill 前应保存画板快照');
  assert.strictEqual(getState().draftMeeting.step, 'distill');
  assert.strictEqual(
    getState().draftMeeting.whiteboard.snapshot,
    'data:image/png;base64,test',
  );
}

{
  const activeMeeting = {
    id: 'meeting-live-transcript',
    typeId: '03',
    topicId: '03-1',
    hostId: 'member-1',
    memberIds: ['member-1', 'member-2'],
    status: 'active',
    step: 'collect',
    moodRoundDone: true,
    transcript: [],
    whiteboard: { strokes: [] },
  };
  const initial = {
    ...familyState,
    meetings: [activeMeeting],
    draftMeeting: activeMeeting,
    activeMeetingId: activeMeeting.id,
  };
  let nextHandler;
  const container = {
    innerHTML: '',
    querySelector: (selector) => {
      if (selector === '[data-meeting-room-action="next"]') {
        return { addEventListener: (type, handler) => { if (type === 'click') nextHandler = handler; } };
      }
      return null;
    },
    querySelectorAll: () => [],
  };
  const harness = makeHarness(initial);
  harness.flow.renderRoom(container);
  const line = { id: 'line-live', text: '计时器刚写入的转写', at: 1, tags: [] };
  harness.setState({
    ...initial,
    meetings: [{ ...activeMeeting, transcript: [line] }],
    draftMeeting: { ...activeMeeting, transcript: [line] },
  });
  nextHandler();
  assert.deepStrictEqual(
    harness.getState().draftMeeting.transcript,
    [line],
    '主持人推进步骤时不得覆盖刚写入的自动转写',
  );
}

{
  const activeMeeting = {
    id: 'meeting-distill',
    typeId: '01',
    topicId: '01-1',
    hostId: 'member-1',
    memberIds: ['member-1', 'member-2'],
    status: 'active',
    step: 'distill',
    moodRoundDone: true,
    transcript: [{ id: 'line-1', text: '一起散步', tags: ['idea'] }],
    whiteboard: { strokes: [], snapshot: 'data:image/png;base64,test' },
    insights: null,
  };
  const state = {
    ...familyState,
    meetings: [activeMeeting],
    draftMeeting: activeMeeting,
    activeMeetingId: activeMeeting.id,
  };
  const container = {
    innerHTML: '',
    querySelector: (selector) => (
      selector === '[data-distill-panel]' ? { innerHTML: '' } : null
    ),
    querySelectorAll: () => [],
  };
  const { flow, getState, distillRenders } = makeHarness(state);

  flow.renderRoom(container);

  assert.strictEqual(distillRenders.length, 1, 'distill 阶段应渲染四步提炼');
  distillRenders[0].options.onSave({
    common: ['一起散步', '少催促', '每周复盘'],
    core: [
      { text: '一起散步', mark: 'star', color: '#f2b84b' },
      { text: '少催促', mark: 'heart', color: '#dc6b7a' },
      { text: '每周复盘', mark: 'none' },
    ],
  });

  assert.strictEqual(getState().draftMeeting.step, 'consensus');
  assert.strictEqual(getState().draftMeeting.insights.core.length, 3);
}

console.log('meeting-flow.test.js OK');
