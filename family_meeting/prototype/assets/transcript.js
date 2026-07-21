(function (root) {
  const VALID_TAGS = ['idea', 'keyword'];

  function createTranscript({
    store,
    demoSeed,
    now = Date.now,
    random = Math.random,
    setTimer = setTimeout,
    clearTimer = clearTimeout,
  }) {
    let timerId = null;
    let activeMeetingId = null;
    let onUpdate = null;

    function corpusFor(meeting) {
      const samples = demoSeed?.transcriptSamples || {};
      return samples.byTopic?.[meeting.topicId]
        || samples.byType?.[meeting.typeId]
        || [];
    }

    function currentMeeting(meetingId) {
      const state = store.load();
      const meeting = (state.meetings || []).find((candidate) => candidate.id === meetingId)
        || (state.draftMeeting?.id === meetingId ? state.draftMeeting : null);
      return { state, meeting };
    }

    function persistMeeting(state, meeting) {
      const meetings = state.meetings || [];
      const hasMeeting = meetings.some((candidate) => candidate.id === meeting.id);
      const nextState = {
        ...state,
        meetings: hasMeeting
          ? meetings.map((candidate) => (candidate.id === meeting.id ? meeting : candidate))
          : [...meetings, meeting],
        draftMeeting: meeting,
      };
      store.save(nextState);
      onUpdate?.(meeting);
      return meeting;
    }

    function schedule(meetingId) {
      const { meeting } = currentMeeting(meetingId);
      if (!meeting || meeting.status === 'completed') {
        stop();
        return;
      }
      const transcript = meeting.transcript || [];
      if (transcript.length >= corpusFor(meeting).length) {
        timerId = null;
        return;
      }
      const delay = 2000 + Math.floor(random() * 1001);
      timerId = setTimer(() => appendNext(meetingId), delay);
    }

    function appendNext(meetingId) {
      timerId = null;
      if (activeMeetingId !== meetingId) return;
      const { state, meeting } = currentMeeting(meetingId);
      if (!meeting) return;
      const corpus = corpusFor(meeting);
      const transcript = meeting.transcript || [];
      const text = corpus[transcript.length];
      if (typeof text !== 'string') return;
      const at = now();
      const line = {
        id: `line-${at}-${transcript.length + 1}`,
        text,
        at,
        tags: [],
      };
      persistMeeting(state, { ...meeting, transcript: [...transcript, line] });
      schedule(meetingId);
    }

    function start(meeting, options = {}) {
      onUpdate = options.onUpdate || null;
      if (activeMeetingId === meeting.id && timerId !== null) return;
      if (activeMeetingId && activeMeetingId !== meeting.id) stop();
      activeMeetingId = meeting.id;
      schedule(meeting.id);
    }

    function stop() {
      if (timerId !== null) clearTimer(timerId);
      timerId = null;
      activeMeetingId = null;
      onUpdate = null;
    }

    function updateLine(meeting, lineId, updater) {
      const { state, meeting: storedMeeting } = currentMeeting(meeting.id);
      if (!storedMeeting) return null;
      const lines = storedMeeting.transcript || [];
      if (!lines.some((line) => line.id === lineId)) return storedMeeting;
      return persistMeeting(state, {
        ...storedMeeting,
        transcript: lines.map((line) => (line.id === lineId ? updater(line) : line)),
      });
    }

    function edit(meeting, lineId, text) {
      return updateLine(meeting, lineId, (line) => ({ ...line, text: String(text) }));
    }

    function tag(meeting, lineId, tagName) {
      if (!VALID_TAGS.includes(tagName)) throw new Error('无效标签');
      return updateLine(meeting, lineId, (line) => ({
        ...line,
        tags: line.tags?.includes(tagName) ? line.tags : [...(line.tags || []), tagName],
      }));
    }

    return { start, stop, edit, tag };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createTranscript };
  }

  if (root?.Store && root?.demoSeed) {
    root.Transcript = createTranscript({
      store: root.Store,
      demoSeed: root.demoSeed,
      setTimer: root.setTimeout.bind(root),
      clearTimer: root.clearTimeout.bind(root),
    });
  }
}(typeof window !== 'undefined' ? window : globalThis));
