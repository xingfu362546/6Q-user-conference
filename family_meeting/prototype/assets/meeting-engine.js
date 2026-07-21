(function (root) {
  const STEPS = ['opening', 'collect', 'discuss', 'distill', 'consensus', 'end'];

  function canAdvance(meeting) {
    if (
      meeting.typeId === '04'
      && meeting.step === 'opening'
      && !meeting.moodRoundDone
    ) {
      return { ok: false, reason: '请先结束心情回合' };
    }
    return { ok: STEPS.indexOf(meeting.step) < STEPS.length - 1 };
  }

  function next(meeting) {
    const currentIndex = STEPS.indexOf(meeting.step);
    if (!canAdvance(meeting).ok || currentIndex < 0) return { ...meeting };
    return { ...meeting, step: STEPS[currentIndex + 1] };
  }

  function prev(meeting) {
    const currentIndex = STEPS.indexOf(meeting.step);
    if (currentIndex <= 0) return { ...meeting };
    return { ...meeting, step: STEPS[currentIndex - 1] };
  }

  function completeMoodRound(meeting) {
    return { ...meeting, moodRoundDone: true };
  }

  const EMPTY_SNAPSHOT = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420"%3E%3Crect width="720" height="420" fill="%23ffffff"/%3E%3C/svg%3E';

  function archive(meeting, archivedAt = Date.now()) {
    const whiteboard = meeting.whiteboard || {};
    const insights = meeting.insights || {};
    const actionPlan = meeting.actionPlan || {};
    return {
      ...meeting,
      status: 'archived',
      step: 'end',
      transcript: Array.isArray(meeting.transcript) ? meeting.transcript : [],
      whiteboard: {
        ...whiteboard,
        strokes: Array.isArray(whiteboard.strokes) ? whiteboard.strokes : [],
        snapshot: whiteboard.snapshot || EMPTY_SNAPSHOT,
      },
      insights: {
        ...insights,
        common: Array.isArray(insights.common) ? insights.common : [],
        core: Array.isArray(insights.core) ? insights.core : [],
      },
      actionPlan: {
        ...actionPlan,
        candidates: Array.isArray(actionPlan.candidates) ? actionPlan.candidates : [],
        selectedIds: Array.isArray(actionPlan.selectedIds) ? actionPlan.selectedIds : [],
      },
      archivedAt,
    };
  }

  const Engine = {
    STEPS,
    canAdvance,
    next,
    prev,
    completeMoodRound,
    archive,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Engine;
  }

  if (root) {
    root.MeetingEngine = Engine;
  }
}(typeof window !== 'undefined' ? window : globalThis));
