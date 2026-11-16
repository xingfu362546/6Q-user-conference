/**
 * HR · 人员绩效结果明细（v1.4.0）
 */
(function () {
  'use strict';

  var EXPORT_COLUMNS = [
    '考核计划', '姓名', '工号', '部门', '职级', '状态',
    '自评', '上级分', '系统汇总分', '采用分', '确认态', '退回次数',
  ];

  function closeExportModal() {
    var m = document.getElementById('res-export-mask');
    if (m) m.classList.remove('is-open');
  }

  function openExportModal() {
    var preset = window.PerfPermissions ? PerfPermissions.getPreset() : { resultsScope: 'all' };
    var scopeLabel = preset.resultsScope === 'dept' ? '本部门' : '全公司';
    var mask = document.getElementById('res-export-mask');
    if (!mask) {
      mask = document.createElement('div');
      mask.id = 'res-export-mask';
      mask.className = 'hr-transfer-modal-mask';
      document.body.appendChild(mask);
    }
    mask.innerHTML =
      '<div class="hr-transfer-modal hr-transfer-modal--wide"><div class="hr-transfer-modal__head">' +
      '<h3>导出绩效结果 · ' + scopeLabel + '</h3>' +
      '<button type="button" class="hr-transfer-modal__close" id="res-export-close">×</button></div>' +
      '<div class="hr-transfer-modal__body">' +
      '<p class="hr-hint"><span class="q-tag q-tag-orange">模板待确认</span> 正式 Excel 列模板未定；v1 原型仅演示<strong>汇总 Sheet</strong>列占位。</p>' +
      '<ul style="margin:8px 0 0;padding-left:1.25em;font-size:13px;line-height:1.7">' +
      EXPORT_COLUMNS.map(function (c) { return '<li>' + c + '</li>'; }).join('') +
      '</ul></div><div class="hr-transfer-modal__foot">' +
      '<button type="button" class="q-btn" id="res-export-cancel">关闭</button>' +
      '<button type="button" class="q-btn q-btn-primary" id="res-export-go">下载占位文件</button></div></div>';
    mask.classList.add('is-open');
    mask.querySelector('#res-export-close').onclick = closeExportModal;
    mask.querySelector('#res-export-cancel').onclick = closeExportModal;
    mask.querySelector('#res-export-go').onclick = function () {
      alert('导出占位（原型）：将生成含 ' + EXPORT_COLUMNS.length + ' 列的汇总 Sheet。');
      closeExportModal();
    };
    mask.addEventListener('click', function (e) { if (e.target === mask) closeExportModal(); });
  }

  var PLANS = [
    { id: '2026-05', name: '2026年5月 · 月度绩效考核', type: 'month' },
    { id: '2026-Q2', name: '2026 Q2 · 季度绩效考核', type: 'quarter' },
  ];

  var RESULT_ROWS = [
    { planId: '2026-05', name: '王芳', no: 'E10035', dept: '信息部', level: '职员', phase: 'pending_confirm', selfScore: 86.2, supervisorScore: 84.5, divisionScore: 83.0, totalScore: 84.1, employeeConfirmed: false, supervisorConfirmed: false, divisionConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false, type: 'month', divisionAdjusted: true },
    { planId: '2026-05', name: '张明', no: 'E10021', dept: '信息部', level: '主管', phase: 'pending_confirm', selfScore: 88.0, supervisorScore: 90.5, divisionScore: 89.0, totalScore: 90.0, employeeConfirmed: true, supervisorConfirmed: false, divisionConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 1, returnReason: 'KR 描述不完整', mergedReview: false, type: 'month' },
    { planId: '2026-05', name: '李强', no: 'E10008', dept: '信息部', level: '总监', phase: 'confirmed', selfScore: 92.0, supervisorScore: 94.0, divisionScore: 93.5, totalScore: 93.8, employeeConfirmed: true, supervisorConfirmed: true, divisionConfirmed: false, confirmOverdue: false, bonusSettled: true, returnCount: 0, returnReason: '—', mergedReview: true, type: 'month' },
    { planId: '2026-05', name: '赵敏', no: 'E20011', dept: '广州办事处', level: '经理', phase: 'pending_confirm', selfScore: 85.0, supervisorScore: 87.0, divisionScore: 86.5, totalScore: 86.8, employeeConfirmed: false, supervisorConfirmed: false, divisionConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false, type: 'month' },
    { planId: '2026-Q2', name: '韩梅', no: 'E10056', dept: '信息部', level: '职员', phase: 'pending_confirm', selfScore: 83.2, supervisorScore: 86.0, divisionScore: 86.1, totalScore: 86.1, employeeConfirmed: true, supervisorConfirmed: false, divisionConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false, type: 'quarter' },
    { planId: '2026-05', name: '孙丽', no: 'E20018', dept: '广州办事处', level: '主管', phase: 'pending_supervisor', selfScore: 82.5, supervisorScore: null, divisionScore: null, totalScore: null, employeeConfirmed: false, supervisorConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false, type: 'month' },
    { planId: '2026-05', name: '刘洋', no: 'E10042', dept: '人才开发部', level: '职员', phase: 'filling', selfScore: null, supervisorScore: null, divisionScore: null, totalScore: null, employeeConfirmed: false, supervisorConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false, type: 'month' },
    { planId: '2026-05', name: '陈静', no: 'E10060', dept: '行政管理部', level: '职员', phase: 'not_started', selfScore: null, supervisorScore: null, divisionScore: null, totalScore: null, employeeConfirmed: false, supervisorConfirmed: false, confirmOverdue: false, bonusSettled: false, returnCount: 0, returnReason: '—', mergedReview: false, type: 'month' },
  ];

  function detailHref(r) {
    return 'hr-task-detail.html?plan=' + encodeURIComponent(r.planId) + '&no=' + encodeURIComponent(r.no) + '&from=results&mode=view';
  }

  function phaseTag(phase) {
    if (window.PerfWorkflow) {
      var k = PerfWorkflow.normalizePhase(phase);
      var clsMap = {
        not_started: 'q-tag-gray',
        filling: 'q-tag-blue',
        pending_supervisor: 'q-tag-orange',
        pending_division: 'q-tag-orange',
        pending_confirm: 'q-tag-blue',
        confirmed: 'q-tag-green',
        completed: 'q-tag-green',
      };
      return '<span class="q-tag ' + (clsMap[k] || '') + '">' + PerfWorkflow.phaseLabel(phase) + '</span>';
    }
    var map = {
      not_started: ['待填写', 'q-tag-gray'],
      filling: ['填写中', 'q-tag-blue'],
      pending_supervisor: ['待上级评', 'q-tag-orange'],
      pending_division: ['待分管评', 'q-tag-orange'],
      pending_confirm: ['待员工确认', 'q-tag-blue'],
      confirmed: ['已确认', 'q-tag-green'],
      completed: ['已确认', 'q-tag-green'],
    };
    var m = map[phase] || [phase, 'q-tag'];
    return '<span class="q-tag ' + m[1] + '">' + m[0] + '</span>';
  }

  function scoreCell(v) {
    if (v == null) return '—';
    return '<b>' + (window.PerfScoreFormat ? PerfScoreFormat.format(v) : v) + '</b>';
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
      if (phase !== '全部' && r.phase !== phase) {
        if (!(phase === 'confirmed' && r.phase === 'completed')) return false;
      }
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
        '<td>' + (window.PerfWorkflow ? PerfWorkflow.renderConfirmBadges(Object.assign({ phase: r.phase, type: r.type || 'month', mergedReview: r.mergedReview }, r)) : '—') + '</td>' +
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
    var exportBtn = document.getElementById('btn-export-results');
    if (exportBtn) exportBtn.addEventListener('click', openExportModal);
    renderTable();
  }

  window.initHrPerfResultsList = initResultsListPage;
})();
