const assert = require('assert');
const MeetingTypes = require('../assets/meeting-types.js');
const MeetingEngine = require('../assets/meeting-engine.js');
const { createMeetingFlow } = require('../assets/meeting-flow.js');

function makeHarness(initialState, now = 1720000000000) {
  let state = JSON.parse(JSON.stringify(initialState));
  const shownViews = [];
  const transcriptStarts = [];
  const flow = createMeetingFlow({
    meetingTypes: MeetingTypes,
    engine: MeetingEngine,
    transcript: {
      start: (meeting, options) => transcriptStarts.push({ meeting, options }),
      edit: () => {},
      tag: () => {},
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
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  const { flow, transcriptStarts } = makeHarness(state);

  flow.renderRoom(container);

  assert.strictEqual(transcriptStarts.length, 1, '进入会议室应自动启动转写');
  assert.match(container.innerHTML, /data-transcript-list/);
  assert.match(container.innerHTML, /data-transcript-action="edit"/);
  assert.doesNotMatch(container.innerHTML, /转写开关|停止转写|开始转写/);
}

console.log('meeting-flow.test.js OK');
