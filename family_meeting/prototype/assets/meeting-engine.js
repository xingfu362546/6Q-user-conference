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

  const Engine = {
    STEPS,
    canAdvance,
    next,
    prev,
    completeMoodRound,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Engine;
  }

  if (root) {
    root.MeetingEngine = Engine;
  }
}(typeof window !== 'undefined' ? window : globalThis));
