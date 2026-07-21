const assert = require('assert');
const MeetingTypes = require('../assets/meeting-types.js');
const { createMeetingFlow } = require('../assets/meeting-flow.js');

function makeHarness(initialState, now = 1720000000000) {
  let state = JSON.parse(JSON.stringify(initialState));
  const shownViews = [];
  const flow = createMeetingFlow({
    meetingTypes: MeetingTypes,
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
  return { flow, getState: () => state, shownViews };
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

console.log('meeting-flow.test.js OK');
