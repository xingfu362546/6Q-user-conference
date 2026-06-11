/**
 * 评分结果确认（v1.1.0）
 */
(function () {
  'use strict';

  var MOCK = {
    title: '2026年5月 · 月度绩效考核',
    confirmDeadline: '2026-06-15 18:00',
    selfScore: 86.2,
    supervisorScore: 84.5,
    divisionScore: 83.0,
    totalScore: 84.1,
    mergedReview: false,
    employeeConfirmed: false,
    supervisorConfirmed: false,
  };

  function renderBody(el, opts) {
    var role = opts.role || 'employee';
    var isMini = opts.platform === 'miniapp';
    var confirmed = role === 'employee' ? MOCK.employeeConfirmed : MOCK.supervisorConfirmed;

    el.innerHTML =
      (isMini ? '' : '<div class="perf-tip perf-tip-blue" style="margin-bottom:12px">上级与分管评分已完成。请核对分数后点击「确认」；确认完成前不计入归档与奖金结算。</div>') +
      '<h3 style="margin:0 0 8px">' + MOCK.title + '</h3>' +
      (window.PerfWorkflow ? PerfWorkflow.renderPhaseSteps('pending_confirm') : '') +
      '<dl class="proto-kv" style="margin:16px 0">' +
      '<dt>确认截止</dt><dd>' + MOCK.confirmDeadline + '</dd>' +
      '<dt>自评总分</dt><dd><b>' + MOCK.selfScore + '</b></dd>' +
      '<dt>直接上级评分</dt><dd><b>' + MOCK.supervisorScore + '</b></dd>' +
      '<dt>分管领导评分</dt><dd><b>' + MOCK.divisionScore + '</b>' + (MOCK.mergedReview ? ' <span class="q-tag">合并评</span>' : '') + '</dd>' +
      '<dt>综合总得分</dt><dd><b style="font-size:18px;color:var(--primary)">' + MOCK.totalScore + '</b></dd></dl>' +
      (confirmed
        ? '<p class="hr-hint"><span class="q-tag q-tag-green">您已确认</span> 等待' + (role === 'employee' ? '上级' : '员工') + '确认。</p>'
        : '<button type="button" class="q-btn q-btn-primary' + (isMini ? ' mp-btn-block' : '') + '" id="btn-confirm-score">确认评分结果</button>');
  }

  function initPage(opts) {
    var el = document.getElementById('confirm-body');
    if (!el) return;
    renderBody(el, opts);
    var btn = document.getElementById('btn-confirm-score');
    if (btn) {
      btn.addEventListener('click', function () {
        if (opts.role === 'employee') MOCK.employeeConfirmed = true;
        else MOCK.supervisorConfirmed = true;
        alert('已确认（原型）');
        if (opts.platform === 'miniapp') {
          location.href = opts.role === 'leader' ? 'task-list.html?tab=leader' : 'task-list.html';
        } else {
          location.href = opts.role === 'employee' ? 'personal-perf.html' : 'supervisor-review-list.html';
        }
      });
    }
  }

  window.ScoreConfirm = { initPage: initPage, MOCK: MOCK };
})();
