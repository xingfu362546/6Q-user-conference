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

  /** 确认页明细横表：与填表/评分页同一套列，自评与上级(分管)评对照 */
  function renderDetailSheet(task, role) {
    var sheet = window.PerfReviewSheet;
    var SS = window.SupervisorScore;
    if (!sheet || !SS) return '';
    var sub = SS.SUBMISSIONS ? SS.SUBMISSIONS[task.id] : null;
    if (!sub) return '';
    if (window.PerfKrHierarchy) window.PerfKrHierarchy.ensureSubmission(sub);

    var quarter = isQuarter(task);
    var preset = (SS.PRESET_SCORES && SS.PRESET_SCORES[task.id]) || {};
    var scores = preset.scores || {};
    var divScores = preset.divisionScores || {};
    var scoreState = { scores: scores, divisionScores: divScores };

    var html = '<div class="score-section-title" style="margin-top:16px">逐项明细 · 自评与上级评对照</div>';

    [['核心绩效 V%', sub.coreKeyObjectives, 'V'], ['常规绩效 X%', sub.regularKeyObjectives, 'X']].forEach(function (pair) {
      var kos = pair[1] || [];
      if (!kos.length) return;
      html += '<div class="score-block-group">' +
        '<div class="score-block-head">' + pair[0] + '</div>' +
        sheet.renderWorkTable(kos, { periodType: quarter ? 'quarter' : 'month', editable: false, state: scoreState }) +
        '</div>';
    });

    if (sub.behavior && sub.behavior.length) {
      html += '<div class="score-block-group">' +
        '<div class="score-block-head">行为态度 15%</div>' +
        sheet.renderBehaviorTable(sub.behavior, { periodType: quarter ? 'quarter' : 'month', editable: false, state: scoreState }) +
        '</div>';
    }
    return html;
  }

  /** v1.5.3：待员工确认节点只等员工；上级和分管提交评分即视为已确认。 */
  function canRoleConfirm(task, role) {
    if (role === 'employee') return !task.employeeConfirmed;
    return false;
  }

  function applyStore(task) {
    if (!window.PerfHrStore || typeof location === 'undefined') return task;
    var params = new URLSearchParams(location.search);
    var planId = params.get('plan') || (task.type === 'quarter' ? '2026-Q2' : '2026-05');
    var no = params.get('no') || 'E10021';
    var stored = PerfHrStore.readTask(planId, no);
    task.planId = planId;
    task.empNo = no;
    if (!stored) return task;
    if (stored.assessedTotal != null) task.systemTotal = stored.assessedTotal;
    task.supervisorTotal = stored.supervisorTotal != null ? stored.supervisorTotal : null;
    if (stored.divisionTotal != null) {
      task.finalTotal = stored.divisionTotal;
      task.divisionAdjusted = stored.divisionTotal !== stored.assessedTotal;
    }
    if (stored.hrFinal) {
      task.hrFinalTotal = stored.hrFinal.value;
      task.hrFinalMeta = stored.hrFinal;
    }
    if (stored.confirm) {
      task.employeeConfirmed = !!stored.confirm.employee;
      task.supervisorConfirmed = !!stored.confirm.supervisor;
      task.divisionConfirmed = !!stored.confirm.division;
    }
    if (stored.node === '已完成') task.phase = 'confirmed';
    if (stored.node === '待确认' || stored.node === '待员工确认') task.phase = 'pending_confirm';
    return task;
  }

  function quarterExtra(task) {
    if (!isQuarter(task) || !window.PerfQuarterScore) return '';
    var result = PerfQuarterScore.compute({
      workRows: [{ self: 79.6, supervisor: 79.6, division: 79.6 }],
      sixqTotal: 10,
      penaltyRows: [{ self: -2 }],
      incentiveRows: [
        { objective: '数量甲', typeId: 'qty-1', supervisor: 1, division: 1, hrFinalScore: 1 },
        { objective: '数量乙', typeId: 'qty-1', supervisor: 1, division: 1, hrFinalScore: 1 },
        { objective: '质量', typeId: 'qual-3', supervisor: 3, division: 3, hrFinalScore: 3 }
      ],
      hrFinalTotal: task.hrFinalTotal != null ? task.hrFinalTotal : null,
      level: '主管'
    });
    if (!result.ok) return '';
    var names = { A: 'A 档', B: 'B 档', C: 'C 档', none: '暂不认定', pending: '暂不认定（未评定）' };
    var amount = result.suggestedAmount === 'unmatched' ? '职级未匹配' : result.suggestedAmount;
    return '<p class="score-hint confirm-copy">核定总分（不含专项） <b>' + result.assessedTotal +
      '</b> · 专项得分 <b>' + result.incentiveTotal +
      '</b> · 建议档次 <b>' + (names[result.finalTier] || result.finalTier) +
      '</b> · 建议金额 <b>' + amount + '</b></p>';
  }

  function renderBody(el, opts) {
    opts = opts || {};
    var role = opts.role || 'employee';
    if (role === 'leader') role = 'supervisor';
    var isMini = opts.platform === 'miniapp';
    var task = applyStore(JSON.parse(JSON.stringify(pickMock(opts))));
    var S = window.PerfScoreSummary;
    var W = window.PerfWorkflow;

    var tipMonth = '上级评分已完成。请核对各模块自评与上级评及<strong>折算汇总</strong>后确认。HR 改最终总分后，已确认状态保持不变。';
    var tipQuarter = '上级与分管评分已完成。请核对折算汇总后确认。上级和分管提交评分即视为已确认，<strong>只剩员工点确认</strong>。';
    var tip = isQuarter(task) ? tipQuarter : tipMonth;

    var system = task.systemTotal != null ? task.systemTotal : null;
    var supApproved = task.supervisorTotal != null ? task.supervisorTotal : null;
    var adopted = task.hrFinalTotal != null ? task.hrFinalTotal : system;
    var totalLine = '<div class="confirm-copy">' +
      '<p class="score-hint">计算总分（系统汇总） <b>' + (system != null ? system : '—') + '</b></p>' +
      '<p class="score-hint">上级核定 <b>' + (supApproved != null ? supApproved : '—') + '</b></p>' +
      (task.hrFinalMeta
        ? '<p class="score-hint">HR 最终总分 <b>' + task.hrFinalTotal + '</b>（' + task.hrFinalMeta.reason + '，修改前 ' + task.hrFinalMeta.before + '）</p>'
        : '') +
      '<p class="score-hint">采用分 <b>' + (adopted != null ? adopted : '—') + '</b></p>' +
      quarterExtra(task) +
      '</div>';

    var confirmed = !canRoleConfirm(task, role);
    var waitWho = [];
    if (!task.employeeConfirmed) waitWho.push('员工');

    el.innerHTML =
      (isMini ? '' : '<div class="perf-tip perf-tip-blue" style="margin-bottom:12px">' + tip + '</div>') +
      '<h3 style="margin:0 0 8px">' + task.title + '</h3>' +
      (W ? W.renderPhaseSteps(task.phase, { task: task }) : '') +
      (W ? '<div style="margin:8px 0">' + W.renderConfirmBadges(task) + '</div>' : '') +
      '<dl class="proto-kv" style="margin:12px 0"><dt>确认截止</dt><dd>' + task.confirmDeadline + '</dd></dl>' +
      totalLine +
      renderDetailSheet(task, role) +
      (S && task.systemTotal == null ? '<div class="score-section-title">折算汇总</div>' + S.renderConfirmPage({ full: false, divisionAdjusted: false, finalTotal: null, taskType: task.type }) : '') +
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
    document.body.classList.add('page-score-confirm');
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

