const assert = require('assert');
const { createTranscript } = require('../assets/transcript.js');
const demoSeed = require('../data/demo-seed.js');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeHarness(corpus = ['第一句', '第二句']) {
  const meeting = {
    id: 'meeting-1',
    typeId: '01',
    topicId: '01-1',
    transcript: [],
  };
  let state = {
    meetings: [meeting],
    draftMeeting: meeting,
    activeMeetingId: meeting.id,
  };
  const scheduled = [];
  const cleared = [];
  const updates = [];
  let timestamp = 1720000000000;
  const transcript = createTranscript({
    store: {
      load: () => clone(state),
      save: (nextState) => {
        state = clone(nextState);
      },
    },
    demoSeed: {
      transcriptSamples: {
        byTopic: { '01-1': corpus },
        byType: {},
      },
    },
    now: () => timestamp++,
    random: () => 0,
    setTimer: (callback, delay) => {
      scheduled.push({ callback, delay });
      return scheduled.length;
    },
    clearTimer: (timerId) => cleared.push(timerId),
  });

  transcript.start(meeting, {
    onUpdate: (updatedMeeting) => updates.push(clone(updatedMeeting)),
  });

  return {
    transcript,
    meeting,
    scheduled,
    cleared,
    updates,
    getState: () => state,
  };
}

{
  const harness = makeHarness();
  assert.strictEqual(harness.scheduled.length, 1);
  assert.strictEqual(harness.scheduled[0].delay, 2000);

  harness.scheduled[0].callback();
  const firstLine = harness.getState().meetings[0].transcript[0];
  assert.deepStrictEqual(firstLine, {
    id: 'line-1720000000000-1',
    text: '第一句',
    at: 1720000000000,
    tags: [],
  });
  assert.deepStrictEqual(harness.getState().draftMeeting.transcript, [firstLine]);
  assert.strictEqual(harness.updates.length, 1);
  assert.strictEqual(harness.scheduled.length, 2);

  harness.scheduled[1].callback();
  assert.strictEqual(harness.getState().meetings[0].transcript.length, 2);
  assert.strictEqual(harness.scheduled.length, 2, '语料用尽后不再安排定时器');
}

{
  const harness = makeHarness();
  harness.scheduled[0].callback();
  const lineId = harness.getState().meetings[0].transcript[0].id;

  harness.transcript.edit(harness.meeting, lineId, '编辑后的内容');
  assert.strictEqual(harness.getState().meetings[0].transcript[0].text, '编辑后的内容');

  harness.transcript.tag(harness.meeting, lineId, 'idea');
  harness.transcript.tag(harness.meeting, lineId, 'idea');
  harness.transcript.tag(harness.meeting, lineId, 'keyword');
  assert.deepStrictEqual(
    harness.getState().meetings[0].transcript[0].tags,
    ['idea', 'keyword'],
  );
  assert.throws(() => harness.transcript.tag(harness.meeting, lineId, 'other'), /无效标签/);
}

{
  const harness = makeHarness();
  harness.transcript.stop();
  assert.deepStrictEqual(harness.cleared, [1]);
}

assert.ok(Array.isArray(demoSeed.transcriptSamples.byTopic['01-1']));
assert.ok(Array.isArray(demoSeed.transcriptSamples.byType['04']));

console.log('transcript.test.js OK');
