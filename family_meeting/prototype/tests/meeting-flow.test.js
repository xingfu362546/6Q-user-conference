const assert = require('assert');
const MeetingTypes = require('../assets/meeting-types.js');
const MeetingEngine = require('../assets/meeting-engine.js');
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
