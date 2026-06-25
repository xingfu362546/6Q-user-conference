/**
 * 评分结果确认（v1.4.0）· 模块表格 + 折算汇总 · 月/季分轨
 */
(function () {
  'use strict';

  var MOCK_MONTH = {
    id: 'r-wf-202605',
    type: 'month',
    title: '2026年5月 · 月度绩效考核',
    confirmDeadline: '2026-06-15 18:00',
    phase: 'pending_confirm',
    systemTotal: 84.7,
    finalTotal: 84.1,
    divisionAdjusted: true,
    employeeConfirmed: false,
    supervisorConfirmed: false,
    divisionConfirmed: false,
    mergedReview: false,
  };

  var MOCK_QUARTER = {
    id: 'r-hm-2026q2',
    type: 'quarter',
    title: '2026 Q2 · 季度绩效考核',
    confirmDeadline: '2026-07-15 18:00',
    phase: 'pending_confirm',
    systemTotal: 86.8,
    finalTotal: 86.1,
    divisionAdjusted: true,
    employeeConfirmed: true,
    supervisorConfirmed: false,
    divisionConfirmed: false,
    mergedReview: false,
  };

  function pickMock(opts) {
    var params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
    var t = params.get('type') || (opts && opts.type) || 'month';
    return t === 'quarter' ? MOCK_QUARTER : MOCK_MONTH;
  }

  function roleLabel(role) {
    if (role === 'employee') return '员工';
    if (role === 'leader' || role === 'supervisor') return '上级';
    if (role === 'division') return '分管';
    return role;
  }

  function isQuarter(task) {
    return window.PerfWorkflow ? PerfWorkflow.isQuarterTask(task) : task.type === 'quarter';
  }

  function canRoleConfirm(task, role) {
    if (role === 'employee') return !task.employeeConfirmed;
    if (role === 'leader' || role === 'supervisor') return !task.supervisorConfirmed;
    if (role === 'division') return isQuarter(task) && !task.divisionConfirmed;
    return false;
  }

  function renderBody(el, opts) {
    opts = opts || {};
    var role = opts.role || 'employee';
    if (role === 'leader') role = 'supervisor';
    var isMini = opts.platform === 'miniapp';
    var task = pickMock(opts);
    var S = window.PerfScoreSummary;
    var W = window.PerfWorkflow;

    var tipMonth = '上级评分已完成。请核对各模块自评与上级评及<strong>折算汇总</strong>后确认。分管可在全员确认前改核定总分（改分后已确认者需重确认）。';
    var tipQuarter = '上级与分管评分已完成。请核对折算汇总后确认。<strong>季度需员工、上级、分管三方确认</strong>。';
    var tip = isQuarter(task) ? tipQuarter : tipMonth;

    var totalLine = task.divisionAdjusted
      ? '<p class="score-hint">系统汇总 <b>' + (task.systemTotal != null ? task.systemTotal : '—') + '</b> → 分管核定 <b>' + task.finalTotal + '</b> <span class="q-tag q-tag-orange">已调整</span></p>'
      : '<p class="score-hint">当前核定总分：<b>' + (task.finalTotal != null ? task.finalTotal : task.systemTotal) + '</b>' +
        (isQuarter(task) ? '' : ' <span class="muted">（分管尚未改总分时为系统汇总分）</span>') + '</p>';

    var confirmed = !canRoleConfirm(task, role);
    var waitWho = [];
    if (!task.employeeConfirmed) waitWho.push('员工');
    if (!task.supervisorConfirmed) waitWho.push('上级');
    if (isQuarter(task) && !task.divisionConfirmed) waitWho.push('分管');

    el.innerHTML =
      (isMini ? '' : '<div class="perf-tip perf-tip-blue" style="margin-bottom:12px">' + tip + '</div>') +
      '<h3 style="margin:0 0 8px">' + task.title + '</h3>' +
      (W ? W.renderPhaseSteps(task.phase, { task: task }) : '') +
      (W ? '<div style="margin:8px 0">' + W.renderConfirmBadges(task) + '</div>' : '') +
      '<dl class="proto-kv" style="margin:12px 0"><dt>确认截止</dt><dd>' + task.confirmDeadline + '</dd></dl>' +
      totalLine +
      (S ? S.renderConfirmPage({ full: false, divisionAdjusted: task.divisionAdjusted, finalTotal: task.finalTotal, taskType: task.type }) : '') +
      (confirmed
        ? '<p class="hr-hint" style="margin-top:16px"><span class="q-tag q-tag-green">' + roleLabel(role) + '已确认</span>' +
          (waitWho.length ? ' 等待' + waitWho.join('、') + '确认。' : ' 全部确认完成，任务进入<strong>已确认</strong>。') + '</p>'
        : '<button type="button" class="q-btn q-btn-primary' + (isMini ? ' mp-btn-block' : '') + '" id="btn-confirm-score" style="margin-top:16px">确认评分结果</button>');

    if (role === 'division' && !isQuarter(task)) {
      el.innerHTML += '<p class="hr-hint" style="color:#cf1322;margin-top:8px">月度任务分管不参与确认，请从待我审核改核定总分。</p>';
    }
  }

  function tryAdvanceConfirmed(task) {
    if (window.PerfWorkflow && PerfWorkflow.isFullyConfirmed(task)) {
      task.phase = 'confirmed';
    }
  }

  function initPage(opts) {
    var el = document.getElementById('confirm-body');
    if (!el) return;
    var task = pickMock(opts);
    renderBody(el, opts);

    var btn = document.getElementById('btn-confirm-score');
    if (btn) {
      btn.addEventListener('click', function () {
        var role = opts.role || 'employee';
        if (role === 'leader') role = 'supervisor';
        if (role === 'employee') task.employeeConfirmed = true;
        else if (role === 'supervisor') task.supervisorConfirmed = true;
        else if (role === 'division') task.divisionConfirmed = true;
        tryAdvanceConfirmed(task);
        alert('已确认（原型）' + (task.phase === 'confirmed' ? ' · 已全部确认' : ''));
        if (opts.platform === 'miniapp') {
          location.href = role === 'employee' ? 'task-list.html' : 'task-list.html?tab=leader';
        } else if (role === 'division') {
          location.href = 'supervisor-review-list.html';
        } else if (role === 'employee') {
          location.href = 'personal-perf.html';
        } else {
          location.href = 'supervisor-review-list.html';
        }
      });
    }
  }

  window.ScoreConfirm = {
    initPage: initPage,
    MOCK_MONTH: MOCK_MONTH,
    MOCK_QUARTER: MOCK_QUARTER,
    MOCK: MOCK_MONTH,
    pickMock: pickMock,
  };
})();
