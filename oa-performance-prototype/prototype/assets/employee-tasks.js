/**
 * 员工 · 绩效待办（v1.4.0）
 *
 * 【研发说明】
 * - 定稿：docs/GRILL_EMPLOYEE_TODO.md · docs/DEV-GUIDE-v1.4.0.md
 * - 正式环境：替换 TASK_DATA 为 GET /employee/perf/tasks?segment=current|overdue|past
 * - 列表状态列：仅 PerfWorkflow.phaseLabel(phase) 一个标签；确认 badge 只在 score-confirm 页
 * - 步骤条：PerfWorkflow.renderPhaseSteps(phase, { task: { type, mergedReview } })
 * - 分段：belongsInOverdue(task) = 过截止 && phase ∈ {not_started, filling}
 *
 * 导出：EmployeeTasks.renderCurrentTable | renderOverdueTable | renderPastTable
 */
(function () {
  'use strict';

  var MONTH_STEPS = 6;
  var QUARTER_STEPS = 7;

  /** 演示员工：王芳 · 当前待办覆盖 v1.4 各 phase */
  var TASK_DATA = {
    current: [
      {
        id: 'm202605',
        title: '2026年5月 · 月度绩效考核',
        shortTitle: '2026年5月 月度绩效考核',
        type: 'month',
        phase: 'pending_confirm',
        stepIndex: null,
        deadline: '2026-06-15',
        deadlineLabel: '确认截止 06-15',
        confirmDeadline: '2026-06-15',
        employeeConfirmed: false,
        supervisorConfirmed: false,
        divisionAdjusted: true,
        systemTotal: 84.2,
        finalTotal: 84.1,
        submittedAt: '2026-05-28 16:20',
      },
      {
        id: 'm202604',
        title: '2026年4月 · 月度绩效考核',
        shortTitle: '2026年4月 月度绩效考核',
        type: 'month',
        phase: 'filling',
        stepIndex: 3,
        totalSteps: MONTH_STEPS,
        deadline: '2026-06-05',
        deadlineLabel: '2026-06-05',
        quickImportPeriod: 'm202604',
      },
      {
        id: 'm202606',
        title: '2026年6月 · 月度绩效考核',
        shortTitle: '2026年6月 月度绩效考核',
        type: 'month',
        phase: 'not_started',
        deadline: '2026-07-05',
        deadlineLabel: '2026-07-05',
      },
      {
        id: 'm202503-wait',
        title: '2026年3月 · 月度绩效考核',
        shortTitle: '2026年3月 月度绩效考核',
        type: 'month',
        phase: 'pending_supervisor',
        submittedAt: '2026-03-28 17:32',
        deadline: '—',
        deadlineLabel: '—',
      },
      {
        id: 'q2026q2',
        title: '2026 Q2 · 季度绩效考核',
        shortTitle: '2026 Q2 季度绩效考核',
        type: 'quarter',
        phase: 'filling',
        stepIndex: 2,
        totalSteps: QUARTER_STEPS,
        deadline: '2026-06-30',
        deadlineLabel: '2026-06-30',
        quickImportPeriod: 'q2026q2',
      },
      {
        id: 'q2026q2-wait',
        title: '2026 Q2 · 季度绩效考核',
        shortTitle: '2026 Q2 · 已提交待分管',
        type: 'quarter',
        phase: 'pending_division',
        mergedReview: false,
        submittedAt: '2026-06-27 17:40',
        deadline: '2026-07-10',
        deadlineLabel: '2026-07-10',
      },
    ],
    overdue: [
      {
        id: 'm202604-od',
        title: '2026年4月 · 月度绩效考核',
        shortTitle: '2026年4月 月度绩效考核',
        type: 'month',
        phase: 'filling',
        stepIndex: 2,
        totalSteps: MONTH_STEPS,
        deadline: '2026-05-05',
        overdueState: 'locked',
        overdueDays: 28,
      },
      {
        id: 'm202503-od',
        title: '2026年3月 · 月度绩效考核',
        shortTitle: '2026年3月 月度绩效考核',
        type: 'month',
        phase: 'filling',
        stepIndex: 5,
        totalSteps: MONTH_STEPS,
        deadline: '2026-04-05',
        overdueState: 'unlocked',
        overdueDays: 58,
      },
    ],
    past: [
      {
        id: 'm202602',
        title: '2026年2月 · 月度绩效考核',
        shortTitle: '2026年2月 月度绩效考核',
        type: 'month',
        phase: 'confirmed',
        submittedAt: '2026-02-26 18:05',
      },
      {
        id: 'm202601',
        title: '2026年1月 · 月度绩效考核',
        shortTitle: '2026年1月 月度绩效考核',
        type: 'month',
        phase: 'confirmed',
        submittedAt: '2026-01-28 16:40',
      },
    ],
  };

  function W() { return window.PerfWorkflow; }

  /** 尚未提交向导（过截止则进逾期 Tab） */
  function isUnsubmittedPhase(phase) {
    var ph = W() ? W().normalizePhase(phase) : phase;
    return ph === 'not_started' || ph === 'filling';
  }

  /** 是否应出现在逾期分段：过截止 + 未提交 */
  function belongsInOverdue(task) {
    return task && isUnsubmittedPhase(task.phase);
  }

  function phaseTagCls(phase) {
    var k = W() ? W().normalizePhase(phase) : phase;
    var map = {
      not_started: 'q-tag-gray',
      filling: 'q-tag-blue',
      pending_supervisor: 'q-tag-orange',
      pending_division: 'q-tag-orange',
      pending_confirm: 'q-tag-orange',
      confirmed: 'q-tag-green',
      completed: 'q-tag-green',
    };
    return map[k] || 'q-tag';
  }

  function phaseLabel(phase) {
    return W() ? W().phaseLabel(phase) : phase;
  }

  function taskSubtitle(t) {
    var ph = W() ? W().normalizePhase(t.phase) : t.phase;
    if (ph === 'not_started') return '计划已发放 · 尚未开始填写';
    if (ph === 'filling') {
      var cur = t.stepIndex != null ? t.stepIndex : 0;
      var tot = t.totalSteps || (t.type === 'quarter' ? QUARTER_STEPS : MONTH_STEPS);
      return '填写中 · ' + cur + '/' + tot + ' 步';
    }
    if (ph === 'pending_supervisor') return '已于 ' + (t.submittedAt || '').slice(5, 16) + ' 提交 · 等待上级评分';
    if (ph === 'pending_division') return '上级已评 · 等待分管评分';
    if (ph === 'pending_confirm') {
      if (t.employeeConfirmed) return '您已确认 · 等待上级确认';
      if (t.divisionAdjusted) return '待确认 · 分管已调整核定分';
      return '待确认评分 · 可见上级评分明细';
    }
    if (ph === 'confirmed') return '流程已结束 · 自填内容可回看';
    return '';
  }

  function renderPhaseRow(t) {
    if (!W() || !t.phase) return '';
    return W().renderPhaseSteps(t.phase, {
      compact: true,
      task: { type: t.type, mergedReview: t.mergedReview },
    });
  }

  function wizardHref(t) {
    return t.type === 'quarter' ? 'quarterly-wizard.html?id=' + encodeURIComponent(t.id) : 'monthly-wizard.html?id=' + encodeURIComponent(t.id);
  }

  function progressHref(t) {
    return 'employee-task-progress.html?id=' + encodeURIComponent(t.id);
  }

  function pastViewHref(t) {
    return 'personal-perf-past-view.html?id=' + encodeURIComponent(t.id);
  }

  function canViewSelfFill(phase) {
    return window.EmployeeSubmitView
      ? EmployeeSubmitView.canViewSelfFill(phase)
      : (function (ph) {
        ph = W() ? W().normalizePhase(ph) : ph;
        return ph === 'pending_supervisor' || ph === 'pending_division' || ph === 'pending_confirm' || ph === 'confirmed';
      }(phase));
  }

  function renderActions(t, opts) {
    opts = opts || {};
    var ph = W() ? W().normalizePhase(t.phase) : t.phase;
    var parts = [];

    if (opts.overdueLocked) {
      return '<span class="perf-action-muted">不可填写</span>';
    }

    if (ph === 'not_started') {
      parts.push('<a class="q-btn q-btn-primary" style="padding:2px 12px;font-size:12px" href="' + wizardHref(t) + '">开始填写</a>');
    } else if (ph === 'filling') {
      parts.push('<a class="q-btn q-btn-primary" style="padding:2px 12px;font-size:12px;margin-right:6px" href="' + wizardHref(t) + '">继续填写</a>');
      if (t.type === 'month') {
        parts.push('<button type="button" class="q-btn btn-copy-past-secondary" style="padding:2px 10px;font-size:12px" data-quick-import="month" data-period-id="' + (t.quickImportPeriod || t.id) + '" data-storage-key="perf-monthly-oa-pc" data-wizard-href="monthly-wizard.html">快速带入</button>');
      } else if (t.type === 'quarter') {
        parts.push('<button type="button" class="q-btn btn-copy-past-secondary" style="padding:2px 10px;font-size:12px" data-quick-import="quarter" data-period-id="' + (t.quickImportPeriod || t.id) + '" data-storage-key="perf-quarterly-oa-pc" data-wizard-href="quarterly-wizard.html">快速带入</button>');
      }
    } else if (ph === 'pending_supervisor' || ph === 'pending_division') {
      parts.push('<a class="q-btn q-btn-primary" style="padding:2px 12px;font-size:12px;margin-right:6px" href="' + pastViewHref(t) + '">查看自填内容</a>');
      parts.push('<a class="q-btn" style="padding:2px 12px;font-size:12px" href="' + progressHref(t) + '">查看进度</a>');
    } else if (ph === 'pending_confirm') {
      if (!t.employeeConfirmed) {
        parts.push('<a class="q-btn q-btn-primary" style="padding:2px 12px;font-size:12px;margin-right:6px" href="score-confirm.html?role=employee&id=' + encodeURIComponent(t.id) + (t.type === 'quarter' ? '&type=quarter' : '') + '">确认评分</a>');
      } else {
        parts.push('<a class="q-btn" style="padding:2px 12px;font-size:12px;margin-right:6px" href="' + progressHref(t) + '">查看进度</a>');
      }
      parts.push('<a class="q-btn" style="padding:2px 12px;font-size:12px" href="' + pastViewHref(t) + '">查看自填内容</a>');
    } else if (ph === 'confirmed') {
      parts.push('<a class="q-btn q-btn-primary" style="padding:2px 12px;font-size:12px" href="personal-perf-past-view.html?id=' + encodeURIComponent(t.id) + '">查看自填内容</a>');
    }

    return parts.join(' ') || '<span class="muted">—</span>';
  }

  function typeLabel(type) { return type === 'quarter' ? '季度' : '月度'; }

  function renderStatusCell(t) {
    return '<span class="q-tag ' + phaseTagCls(t.phase) + '">' + phaseLabel(t.phase) + '</span>';
  }

  function renderTaskCell(t, opts) {
    opts = opts || {};
    var muted = opts.muted ? ' perf-task-cell--muted' : '';
    var iconMuted = opts.muted ? ' perf-task-icon--muted' : '';
    return '<div class="perf-task-cell' + muted + '">' +
      '<span class="perf-task-icon perf-task-icon--' + t.type + iconMuted + '">' + (t.type === 'quarter' ? '季' : '月') + '</span>' +
      '<div><b>' + (t.shortTitle || t.title) + '</b>' +
      '<small>' + taskSubtitle(t) + '</small>' +
      renderPhaseRow(t) +
      '</div></div>';
  }

  function renderCurrentTable(tbodyId) {
    var el = document.getElementById(tbodyId);
    if (!el) return;
    var list = TASK_DATA.current || [];
    el.innerHTML = list.map(function (t) {
      return '<tr><td>' + renderTaskCell(t) + '</td>' +
        '<td>' + typeLabel(t.type) + '</td>' +
        '<td>' + renderStatusCell(t) + '</td>' +
        '<td>' + (t.deadlineLabel || t.deadline || '—') + '</td>' +
        '<td>' + renderActions(t) + '</td></tr>';
    }).join('');
  }

  function renderOverdueTable(tbodyId) {
    var el = document.getElementById(tbodyId);
    if (!el) return;
    el.innerHTML = (TASK_DATA.overdue || []).map(function (t) {
      var locked = t.overdueState === 'locked';
      var statusLabel = locked ? '待 HR 解锁' : '已解锁 · 可填';
      var statusCls = locked ? 'q-tag' : 'q-tag-blue';
      return '<tr class="' + (locked ? 'perf-row--locked' : 'perf-row--unlocked') + '">' +
        '<td>' + renderTaskCell(t, { muted: locked }) + '</td>' +
        '<td>' + typeLabel(t.type) + '</td>' +
        '<td>' + t.deadline + '</td>' +
        '<td><span class="q-tag ' + statusCls + '">' + statusLabel + '</span>' +
        (t.overdueDays ? ' <span class="muted" style="font-size:12px">逾期' + t.overdueDays + '天</span>' : '') + '</td>' +
        '<td>' + renderActions(t, { overdueLocked: locked }) + '</td></tr>';
    }).join('');
  }

  function renderPastTable(tbodyId) {
    var el = document.getElementById(tbodyId);
    if (!el) return;
    el.innerHTML = (TASK_DATA.past || []).map(function (t) {
      return '<tr><td>' + renderTaskCell(t) + '</td>' +
        '<td>' + typeLabel(t.type) + '</td>' +
        '<td>' + (t.submittedAt || '—') + '</td>' +
        '<td><span class="q-tag ' + phaseTagCls(t.phase) + '">' + phaseLabel(t.phase) + '</span></td>' +
        '<td>' + renderActions(t) + '</td></tr>';
    }).join('');
  }

  function updateSegmentBadges() {
    var cur = (TASK_DATA.current || []).length;
    var od = (TASK_DATA.overdue || []).length;
    document.querySelectorAll('.perf-segment a[href="personal-perf.html"] .badge').forEach(function (b) { b.remove(); });
    document.querySelectorAll('.perf-segment a[href="personal-perf-overdue.html"]').forEach(function (a) {
      var badge = a.querySelector('.badge');
      if (od > 0) {
        if (!badge) { badge = document.createElement('span'); badge.className = 'badge'; a.appendChild(badge); }
        badge.textContent = String(od);
      } else if (badge) badge.remove();
    });
    var empTab = document.querySelector('.tab[data-tab="emp"]');
    if (empTab) {
      var tag = empTab.querySelector('.q-tag');
      if (tag) tag.textContent = String(cur);
    }
  }

  function findTask(id) {
    var found = null;
    ['current', 'overdue', 'past'].forEach(function (k) {
      (TASK_DATA[k] || []).forEach(function (t) { if (t.id === id) found = t; });
    });
    return found;
  }

  function initProgressPage() {
    var params = new URLSearchParams(location.search);
    var id = params.get('id') || 'm202503-wait';
    var task = findTask(id) || TASK_DATA.current[0];
    var titleEl = document.getElementById('emp-progress-title');
    var stepsEl = document.getElementById('emp-progress-steps');
    var detailEl = document.getElementById('emp-progress-detail');
    var actionsEl = document.getElementById('emp-progress-actions');
    if (titleEl) titleEl.textContent = task.title;
    if (stepsEl && W()) {
      stepsEl.innerHTML = W().renderPhaseSteps(task.phase, { task: { type: task.type, mergedReview: task.mergedReview } });
    }
    if (detailEl) {
      detailEl.innerHTML = '<p class="hr-hint">' + taskSubtitle(task) + '</p>' +
        '<p class="hr-hint">员工端<strong>只读</strong>跟踪流程；填表在向导完成，待确认请进入确认页操作。</p>';
    }
    if (actionsEl) {
      var ph = W() ? W().normalizePhase(task.phase) : task.phase;
      var viewSelf = canViewSelfFill(task.phase)
        ? '<a class="q-btn q-btn-primary" style="margin-right:8px" href="' + pastViewHref(task) + '">查看自填内容</a>'
        : '';
      if (ph === 'pending_confirm' && !task.employeeConfirmed) {
        actionsEl.innerHTML = viewSelf +
          '<a class="q-btn q-btn-primary" href="score-confirm.html?role=employee&id=' + encodeURIComponent(task.id) + (task.type === 'quarter' ? '&type=quarter' : '') + '">去确认评分</a>';
      } else if (ph === 'filling' || ph === 'not_started') {
        actionsEl.innerHTML = '<a class="q-btn q-btn-primary" href="' + wizardHref(task) + '">继续填写</a>';
      } else {
        actionsEl.innerHTML = viewSelf + '<a class="q-btn" href="personal-perf.html">返回待办</a>';
      }
    }
  }

  window.EmployeeTasks = {
    TASK_DATA: TASK_DATA,
    isUnsubmittedPhase: isUnsubmittedPhase,
    belongsInOverdue: belongsInOverdue,
    renderCurrentTable: renderCurrentTable,
    renderOverdueTable: renderOverdueTable,
    renderPastTable: renderPastTable,
    updateSegmentBadges: updateSegmentBadges,
    findTask: findTask,
    initProgressPage: initProgressPage,
    pastViewHref: pastViewHref,
    canViewSelfFill: canViewSelfFill,
    taskSubtitle: taskSubtitle,
  };
})();
