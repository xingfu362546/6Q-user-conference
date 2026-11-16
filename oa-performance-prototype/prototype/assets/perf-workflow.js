/**
 * 绩效任务 · 工作流状态（v1.4.0）
 * 月/季分轨 · 见 docs/GRILL_WORKFLOW.md
 */
(function () {
  'use strict';

  var PHASE_DEFS = {
    not_started: { label: '待填写', short: '待填' },
    filling: { label: '填写中', short: '填写' },
    pending_supervisor: { label: '待上级评', short: '上级' },
    pending_division: { label: '待分管评', short: '分管' },
    pending_confirm: { label: '待员工确认', short: '确认' },
    confirmed: { label: '已确认', short: '已确认' },
    completed: { label: '已确认', short: '已确认' },
  };

  var MONTH_CHAIN = ['not_started', 'filling', 'pending_supervisor', 'pending_confirm', 'confirmed'];
  var QUARTER_CHAIN = ['not_started', 'filling', 'pending_supervisor', 'pending_division', 'pending_confirm', 'confirmed'];
  var QUARTER_MERGED_CHAIN = ['not_started', 'filling', 'pending_supervisor', 'pending_confirm', 'confirmed'];

  function normalizePhase(key) {
    if (key === 'completed') return 'confirmed';
    return key || 'not_started';
  }

  function taskType(task) {
    if (!task) return 'month';
    return task.type || task.taskType || 'month';
  }

  function isMergedReview(task) {
    return !!(task && (task.mergedReview || (task.header && task.header.mergedReview)));
  }

  function getPhaseChain(task) {
    if (typeof task === 'string') {
      return MONTH_CHAIN;
    }
    if (taskType(task) === 'quarter') {
      return isMergedReview(task) ? QUARTER_MERGED_CHAIN : QUARTER_CHAIN;
    }
    return MONTH_CHAIN;
  }

  function phaseLabel(key) {
    var k = normalizePhase(key);
    var p = PHASE_DEFS[k];
    return p ? p.label : k;
  }

  function phaseIndex(key, task) {
    var chain = getPhaseChain(task);
    var k = normalizePhase(key);
    for (var i = 0; i < chain.length; i++) {
      if (chain[i] === k) return i;
    }
    return 0;
  }

  function isQuarterTask(task) {
    return taskType(task) === 'quarter';
  }

  /** 是否已达「已确认」终态。上级提交即确认，季度分管提交即确认，只剩员工需要点确认。 */
  function isFullyConfirmed(task) {
    if (!task) return false;
    if (normalizePhase(task.phase) === 'confirmed') return true;
    return !!(task.employeeConfirmed && task.supervisorConfirmed);
  }

  /** 分管/HR 是否仍可改核定总分 */
  function canAdjustDivisionTotal(task) {
    if (!task) return false;
    if (isFullyConfirmed(task)) return false;
    var ph = normalizePhase(task.phase);
    if (ph === 'confirmed') return false;
    return ph === 'pending_confirm' || ph === 'pending_supervisor' || ph === 'pending_division';
  }

  /**
   * 改核定总分后：仅清零「已点确认」的各方（Q9-A）
   * @param {object} task
   * @returns {string[]} 被清零的角色 id 列表 employee|supervisor|division
   */
  function applyTotalAdjustClearConfirm(task) {
    var cleared = [];
    if (!task) return cleared;
    if (task.employeeConfirmed) { task.employeeConfirmed = false; cleared.push('employee'); }
    if (task.supervisorConfirmed) { task.supervisorConfirmed = false; cleared.push('supervisor'); }
    if (isQuarterTask(task) && task.divisionConfirmed) {
      task.divisionConfirmed = false;
      cleared.push('division');
    }
    task.divisionAdjusted = true;
    task.totalAdjustedAt = new Date().toISOString();
    return cleared;
  }

  function canReturnToEmployee(task) {
    if (!task) return false;
    if (isFullyConfirmed(task)) return false;
    return true;
  }

  function isSettledForBonus(task) {
    return task && isFullyConfirmed(task) && task.supervisorDone !== false;
  }

  function renderPhaseSteps(currentKey, opts) {
    opts = opts || {};
    var task = opts.task || { type: opts.type, mergedReview: opts.mergedReview };
    var chain = getPhaseChain(task);
    var cur = phaseIndex(currentKey, task);
    return '<div class="perf-phase-steps' + (opts.compact ? ' perf-phase-steps--compact' : '') + '">' +
      chain.map(function (key, i) {
        var def = PHASE_DEFS[key];
        var cls = i < cur ? 'is-done' : i === cur ? 'is-current' : '';
        return '<span class="perf-phase-step ' + cls + '" data-phase="' + key + '"><em>' + (i + 1) + '</em>' + def.label + '</span>';
      }).join('<span class="perf-phase-arrow">→</span>') + '</div>';
  }

  function renderConfirmBadges(task) {
    if (!task) return '';
    var ph = normalizePhase(task.phase);
    if (ph !== 'pending_confirm' && ph !== 'confirmed') return '';
    var html = '<span class="q-tag' + (task.employeeConfirmed ? ' q-tag-green' : ' q-tag-orange') + '">员工' +
      (task.employeeConfirmed ? '已确认' : '待确认') + '</span> ' +
      '<span class="q-tag q-tag-green">上级已确认</span>';
    if (isQuarterTask(task)) {
      html += ' <span class="q-tag q-tag-green">分管已确认</span>';
    }
    if (task.divisionAdjusted) {
      html += ' <span class="q-tag q-tag-orange">总分已调整</span>';
    }
    return html;
  }

  /** 上级提交后下一 phase */
  function nextPhaseAfterSupervisorSubmit(task) {
    if (isQuarterTask(task) && !isMergedReview(task)) return 'pending_division';
    return 'pending_confirm';
  }

  /** 分管提交（季度逐项）后 */
  function nextPhaseAfterDivisionSubmit() {
    return 'pending_confirm';
  }

  window.PerfWorkflow = {
    PHASE_DEFS: PHASE_DEFS,
    MONTH_CHAIN: MONTH_CHAIN,
    QUARTER_CHAIN: QUARTER_CHAIN,
    QUARTER_MERGED_CHAIN: QUARTER_MERGED_CHAIN,
    normalizePhase: normalizePhase,
    phaseLabel: phaseLabel,
    phaseIndex: phaseIndex,
    getPhaseChain: getPhaseChain,
    isQuarterTask: isQuarterTask,
    isFullyConfirmed: isFullyConfirmed,
    canAdjustDivisionTotal: canAdjustDivisionTotal,
    applyTotalAdjustClearConfirm: applyTotalAdjustClearConfirm,
    canReturnToEmployee: canReturnToEmployee,
    isSettledForBonus: isSettledForBonus,
    renderPhaseSteps: renderPhaseSteps,
    renderConfirmBadges: renderConfirmBadges,
    nextPhaseAfterSupervisorSubmit: nextPhaseAfterSupervisorSubmit,
    nextPhaseAfterDivisionSubmit: nextPhaseAfterDivisionSubmit,
  };
})();
