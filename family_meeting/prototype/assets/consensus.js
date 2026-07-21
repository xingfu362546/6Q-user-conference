(function (root) {
  function normalizedIds(selectedIds) {
    return [...new Set(selectedIds || [])].sort();
  }

  function signature(plan) {
    return JSON.stringify({
      agreedTime: String(plan.agreedTime || '').trim(),
      selectedIds: normalizedIds(plan.selectedIds),
    });
  }

  function resetDecision(plan, changes) {
    return {
      ...plan,
      ...changes,
      votes: {},
      locked: false,
      votingStarted: false,
    };
  }

  function createCandidate(plan, fields) {
    const title = String(fields?.title || '').trim();
    if (!title) throw new Error('请输入行动内容');
    const candidate = {
      id: fields.id || `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      assigneeId: fields.assigneeId || '',
      dueText: String(fields.dueText || '').trim(),
    };
    return resetDecision(plan, {
      candidates: [...(plan.candidates || []), candidate],
    });
  }

  function removeCandidate(plan, candidateId) {
    return resetDecision(plan, {
      candidates: (plan.candidates || []).filter((candidate) => candidate.id !== candidateId),
      selectedIds: (plan.selectedIds || []).filter((id) => id !== candidateId),
    });
  }

  function setSelection(plan, selectedIds, agreedTime) {
    const nextIds = normalizedIds(selectedIds);
    const nextTime = String(agreedTime || '').trim();
    const changed = signature(plan) !== signature({
      selectedIds: nextIds,
      agreedTime: nextTime,
    });
    if (!changed) return { ...plan, selectedIds: nextIds, agreedTime: nextTime };
    return resetDecision(plan, { selectedIds: nextIds, agreedTime: nextTime });
  }

  function canStartVote(plan) {
    if (!(plan.selectedIds || []).length) {
      return { ok: false, reason: '请至少选择一项行动' };
    }
    if (!String(plan.agreedTime || '').trim()) {
      return { ok: false, reason: '请填写全家统一的行动时间' };
    }
    return { ok: true, reason: '' };
  }

  function castVote(plan, memberId, choice, reason) {
    if (plan.locked) throw new Error('行动方案已锁定');
    if (!memberId || !['approve', 'reject'].includes(choice)) {
      throw new Error('投票无效');
    }
    const vote = { choice, signature: signature(plan) };
    const cleanReason = String(reason || '').trim();
    if (cleanReason) vote.reason = cleanReason;
    return {
      ...plan,
      votes: { ...(plan.votes || {}), [memberId]: vote },
      locked: false,
    };
  }

  function tally(plan, memberIds) {
    const currentSignature = signature(plan);
    const pending = [];
    const rejected = [];
    (memberIds || []).forEach((memberId) => {
      const vote = plan.votes?.[memberId];
      if (!vote || vote.signature !== currentSignature) pending.push(memberId);
      else if (vote.choice === 'reject') rejected.push(memberId);
    });
    return {
      passed: memberIds.length > 0 && pending.length === 0 && rejected.length === 0,
      pending,
      rejected,
    };
  }

  function lock(plan) {
    const memberIds = plan.memberIds;
    const voteMemberIds = Object.keys(plan.votes || {});
    const hasCompleteMemberIds = Array.isArray(memberIds)
      && memberIds.length > 0
      && new Set(memberIds).size === memberIds.length
      && voteMemberIds.every((memberId) => memberIds.includes(memberId));
    if (!hasCompleteMemberIds) {
      throw new Error('成员名单缺失或不完整，无法锁定');
    }
    if (!plan.selectedIds?.length || !plan.agreedTime || !tally(plan, memberIds).passed) {
      throw new Error('需全员同意后才能锁定');
    }
    return { ...plan, locked: true };
  }

  const Consensus = {
    createCandidate,
    removeCandidate,
    setSelection,
    canStartVote,
    castVote,
    tally,
    lock,
    signature,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Consensus;
  if (root) root.Consensus = Consensus;
}(typeof window !== 'undefined' ? window : globalThis));
