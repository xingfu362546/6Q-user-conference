/**
 * HR · 人员绩效结果明细（v1.1.0）
 */
(function () {
  'use strict';

  var PLANS = [
    { id: '2026-05', name: '2026年5月 · 月度绩效考核', type: 'month' },
    { id: '2026-Q2', name: '2026 Q2 · 季度绩效考核', type: 'quarter' },
  ];

  var RESULT_ROWS = [
    { planId: '2026-05', name: '王芳', no: 'E10035', dept: '信息部', level: '职员', phase: 'pending_confirm', selfScore: 86.2, supervisorScore: 84.5, divisionScore: 83.0, totalScore: 84.1, employeeConfirmed: false, supervisorConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false },
    { planId: '2026-05', name: '张明', no: 'E10021', dept: '信息部', level: '主管', phase: 'pending_confirm', selfScore: 88.0, supervisorScore: 90.5, divisionScore: 89.0, totalScore: 90.0, employeeConfirmed: true, supervisorConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 1, returnReason: 'KR 描述不完整', mergedReview: false },
    { planId: '2026-05', name: '李强', no: 'E10008', dept: '信息部', level: '总监', phase: 'completed', selfScore: 92.0, supervisorScore: 94.0, divisionScore: 93.5, totalScore: 93.8, employeeConfirmed: true, supervisorConfirmed: true, confirmOverdue: false, bonusSettled: true, returnCount: 0, returnReason: '—', mergedReview: true },
    { planId: '2026-05', name: '赵敏', no: 'E20011', dept: '广州办事处', level: '经理', phase: 'pending_division', selfScore: 85.0, supervisorScore: 87.0, divisionScore: null, totalScore: null, employeeConfirmed: false, supervisorConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false },
    { planId: '2026-05', name: '孙丽', no: 'E20018', dept: '广州办事处', level: '主管', phase: 'pending_supervisor', selfScore: 82.5, supervisorScore: null, divisionScore: null, totalScore: null, employeeConfirmed: false, supervisorConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false },
    { planId: '2026-05', name: '刘洋', no: 'E10042', dept: '人才开发部', level: '职员', phase: 'filling', selfScore: null, supervisorScore: null, divisionScore: null, totalScore: null, employeeConfirmed: false, supervisorConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false },
  ];

  function detailHref(r) {
    return 'hr-task-detail.html?plan=' + encodeURIComponent(r.planId) + '&no=' + encodeURIComponent(r.no) + '&from=results&mode=view';
  }

  function phaseTag(phase) {
    var map = {
      filling: ['填写中', 'q-tag-blue'],
      pending_supervisor: ['待上级评', 'q-tag-orange'],
      pending_division: ['待分管评', 'q-tag-orange'],
      pending_confirm: ['待确认', 'q-tag-blue'],
      completed: ['已完成', 'q-tag-green'],
    };
    var m = map[phase] || [phase, 'q-tag'];
    return '<span class="q-tag ' + m[1] + '">' + m[0] + '</span>';
  }

  function scoreCell(v) {
    return v != null ? '<b>' + v + '</b>' : '—';
  }

  function filterRows() {
    var preset = window.PerfPermissions ? PerfPermissions.getPreset() : { resultsScope: 'all' };
    var plan = document.getElementById('res-filter-plan').value;
    var dept = document.getElementById('res-filter-dept').value;
    var level = document.getElementById('res-filter-level').value;
    var phase = document.getElementById('res-filter-phase').value;
    var kw = (document.getElementById('res-filter-kw').value || '').trim();
    var confirmOd = document.getElementById('res-filter-confirm-od').value;
    var bonus = document.getElementById('res-filter-bonus').value;

    return RESULT_ROWS.filter(function (r) {
      if (preset.resultsScope === 'dept' && preset.deptFilter && r.dept !== preset.deptFilter) return false;
      if (plan !== '全部' && r.planId !== plan) return false;
      if (dept !== '全部' && r.dept !== dept) return false;
      if (level !== '全部' && r.level !== level) return false;
      if (phase !== '全部' && r.phase !== phase) return false;
      if (kw && r.name.indexOf(kw) === -1 && r.no.indexOf(kw) === -1) return false;
      if (confirmOd === 'yes' && !r.confirmOverdue) return false;
      if (confirmOd === 'no' && r.confirmOverdue) return false;
      if (bonus === 'yes' && !r.bonusSettled) return false;
      if (bonus === 'no' && r.bonusSettled) return false;
      return true;
    });
  }

  function renderTable() {
    var rows = filterRows();
    var tbody = document.getElementById('res-tbody');
    if (!tbody) return;
    tbody.innerHTML = rows.map(function (r) {
      var plan = PLANS.filter(function (p) { return p.id === r.planId; })[0];
      return '<tr><td>' + (plan ? plan.name : r.planId) + '</td>' +
        '<td><a href="' + detailHref(r) + '"><b>' + r.name + '</b></a></td><td>' + r.no + '</td>' +
        '<td>' + r.dept + '</td><td>' + r.level + '</td>' +
        '<td>' + phaseTag(r.phase) + '</td>' +
        '<td>' + scoreCell(r.selfScore) + '</td><td>' + scoreCell(r.supervisorScore) + '</td>' +
        '<td>' + scoreCell(r.divisionScore) + (r.mergedReview ? ' <span class="q-tag" style="font-size:11px">合并</span>' : '') + '</td>' +
        '<td>' + scoreCell(r.totalScore) + '</td>' +
        '<td>' + (window.PerfWorkflow ? PerfWorkflow.renderConfirmBadges(r) : '—') + '</td>' +
        '<td>' + r.returnCount + '</td><td class="muted">' + r.returnReason + '</td></tr>';
    }).join('') || '<tr><td colspan="13" style="text-align:center;padding:24px;color:#999">无匹配数据</td></tr>';
    var cnt = document.getElementById('res-count');
    if (cnt) cnt.textContent = '共 ' + rows.length + ' 条';
  }

  function resetFilters() {
    document.getElementById('res-filter-plan').value = '2026-05';
    document.getElementById('res-filter-dept').value = '全部';
    document.getElementById('res-filter-level').value = '全部';
    document.getElementById('res-filter-phase').value = '全部';
    document.getElementById('res-filter-confirm-od').value = '全部';
    document.getElementById('res-filter-bonus').value = '全部';
    document.getElementById('res-filter-kw').value = '';
    var preset = window.PerfPermissions ? PerfPermissions.getPreset() : null;
    if (preset && preset.resultsScope === 'dept' && preset.deptFilter) {
      document.getElementById('res-filter-dept').value = preset.deptFilter;
    }
    renderTable();
  }

  function initResultsListPage() {
    if (window.PerfPermissions && !PerfPermissions.canSeeMenu('perf-results')) {
      document.querySelector('.q-oa-page').innerHTML = '<p class="hr-hint" style="padding:24px">无权限访问此页面。试用 <a href="?perm=hr">?perm=hr</a> 或 <a href="?perm=dept">?perm=dept</a></p>';
      return;
    }
    if (window.PerfPermissions) PerfPermissions.renderPermBanner();

    var preset = PerfPermissions.getPreset();
    var deptSel = document.getElementById('res-filter-dept');
    if (preset.resultsScope === 'dept' && preset.deptFilter) {
      deptSel.value = preset.deptFilter;
      deptSel.disabled = true;
    }

    ['res-filter-plan', 'res-filter-dept', 'res-filter-level', 'res-filter-phase', 'res-filter-kw', 'res-filter-confirm-od', 'res-filter-bonus'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', renderTable);
        el.addEventListener('change', renderTable);
      }
    });
    var resetBtn = document.getElementById('res-filter-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
    renderTable();
  }

  window.initHrPerfResultsList = initResultsListPage;
})();
