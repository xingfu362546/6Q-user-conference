/**
 * 绩效待办详情 · 只读查看 / HR 修改上级分（v1.1.1）
 */
(function () {
  'use strict';

  function sf() { return window.PerfScoreFormat; }
  function sOut(v) { return sf() ? sf().format(v) : v; }
  function sIn(v) { return sf() ? sf().inputVal(v) : (v == null || v === '' ? '' : String(v)); }

  var TASK_REGISTRY = {
    'E10035': { taskId: 'r-wf-202605', planId: '2026-05', phase: 'pending_confirm', name: '王芳', no: 'E10035', dept: '信息部', role: '产品专员', level: '职员', submitted: true, mergedReview: false, supervisorScore: 84.5, divisionScore: 83.0, totalScore: 84.1, divisionAdjusted: true },
    'E10021': { taskId: null, planId: '2026-05', phase: 'pending_confirm', name: '张明', no: 'E10021', dept: '信息部', role: '产品经理', level: '主管', submitted: true, mergedReview: false, supervisorScore: 90.5, divisionScore: 89.0, totalScore: 90.0 },
    'E10008': { taskId: null, planId: '2026-05', phase: 'confirmed', name: '李强', no: 'E10008', dept: '信息部', role: '技术总监', level: '总监', submitted: true, mergedReview: true, supervisorScore: 94.0, divisionScore: 94.0, totalScore: 94.0, employeeConfirmed: true, supervisorConfirmed: true },
    'E20011': { taskId: null, planId: '2026-05', phase: 'pending_confirm', name: '赵敏', no: 'E20011', dept: '广州办事处', role: '办事处主任', level: '经理', submitted: true, mergedReview: false, supervisorScore: 87.0, divisionScore: 86.5, totalScore: 86.8, employeeConfirmed: false, supervisorConfirmed: false },
    'E20018': { taskId: null, planId: '2026-05', phase: 'pending_supervisor', name: '孙丽', no: 'E20018', dept: '广州办事处', role: '办事处主管', level: '主管', submitted: true, mergedReview: false, supervisorScore: null, divisionScore: null, totalScore: null },
    'E10042': { taskId: null, planId: '2026-05', phase: 'filling', name: '刘洋', no: 'E10042', dept: '人才开发部', role: 'HR专员', level: '职员', submitted: false, mergedReview: false },
    'E10044': { taskId: null, planId: '2026-05', phase: 'filling', name: '肖洋', no: 'E10044', dept: '信息部', role: '后端工程师', level: '职员', submitted: false, mergedReview: false },
    'E20015': { taskId: null, planId: '2026-05', phase: 'filling', name: '陈伟', no: 'E20015', dept: '广州办事处', role: '课程顾问', level: '职员', submitted: false, mergedReview: false },
    'E20022': { taskId: null, planId: '2026-05', phase: 'filling', name: '吴磊', no: 'E20022', dept: '深圳办事处', role: '办事处主管', level: '主管', submitted: false, mergedReview: false },
    'E20025': { taskId: null, planId: '2026-05', phase: 'filling', name: '马军', no: 'E20025', dept: '深圳办事处', role: '课程顾问', level: '职员', submitted: false, mergedReview: false },
    'E10055': { taskId: null, planId: '2026-05', phase: 'confirmed', name: '周婷', no: 'E10055', dept: '行政管理部', role: '行政经理', level: '经理', submitted: true, mergedReview: false, supervisorScore: 88.0, divisionScore: 87.5, totalScore: 87.8, employeeConfirmed: true, supervisorConfirmed: true },
    'E10048': { taskId: null, planId: '2026-05', phase: 'confirmed', name: '何欣', no: 'E10048', dept: '人才开发部', role: 'HR经理', level: '经理', submitted: true, mergedReview: false, supervisorScore: 91.0, divisionScore: 90.0, totalScore: 90.5, employeeConfirmed: true, supervisorConfirmed: true },
  };

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function getMeta(no, planId) {
    var m = TASK_REGISTRY[no];
    if (!m) return null;
    if (planId && m.planId !== planId) return Object.assign({}, m, { planId: planId });
    return m;
  }

  function getSubmission(meta) {
    if (!meta || !meta.taskId || !window.SupervisorScore) return null;
    var sub = SupervisorScore.SUBMISSIONS[meta.taskId] || null;
    if (sub && window.PerfKrHierarchy) {
      PerfKrHierarchy.ensureSubmission(sub);
      sub.coreKrs = PerfKrHierarchy.flattenTargets(sub.coreKeyObjectives, 'V');
      sub.regularKrs = PerfKrHierarchy.flattenTargets(sub.regularKeyObjectives, 'X');
    }
    return sub;
  }

  function allScoreItems(sub) {
    var items = [];
    (sub.coreKrs || []).forEach(function (k) { items.push({ id: k.id, block: 'V', label: k.smart || k.o, weight: k.weight, selfScore: k.selfScore }); });
    (sub.regularKrs || []).forEach(function (k) { items.push({ id: k.id, block: 'X', label: k.smart || k.o, weight: k.weight, selfScore: k.selfScore }); });
    (sub.behavior || []).forEach(function (b) { items.push({ id: b.id, block: 'B', label: b.name, weight: b.weight, selfScore: b.selfScore }); });
    return items;
  }

  function blockLabel(block) {
    if (block === 'V') return '核心';
    if (block === 'X') return '常规';
    return '行为';
  }

  function demoSupervisorScores(meta, items) {
    var base = meta.supervisorScore || 80;
    var map = {};
    items.forEach(function (it, i) {
      map[it.id] = Math.round((it.weight * (base / 100) * (0.95 + (i % 3) * 0.02)) * 10) / 10;
    });
    return map;
  }

  function demoDivisionScores(meta, items, supMap) {
    if (meta.mergedReview) return Object.assign({}, supMap);
    var map = {};
    items.forEach(function (it) {
      var s = supMap[it.id];
      map[it.id] = s != null ? Math.max(0, Math.round((s - 0.5) * 10) / 10) : '';
    });
    return map;
  }

  function renderConvertSection(meta) {
    if (!window.PerfScoreSummary || meta.totalScore == null) return '';
    return '<div class="task-detail-block-title">折算汇总</div><div class="task-detail-convert">' +
      PerfScoreSummary.renderConfirmPage({ full: true, divisionAdjusted: !!meta.divisionAdjusted, finalTotal: meta.totalScore }) +
      '</div>';
  }

  function renderTargetRow(t, ko, supScores, divScores, hrEdit) {
    var sup = supScores[t.id];
    var div = divScores[t.id];
    var label = (t.smart || t.m || '考核目标').length > 36 ? (t.smart || t.m || '考核目标').slice(0, 36) + '…' : (t.smart || t.m || '考核目标');
    var supCell = hrEdit
      ? '<input type="number" step="0.01" class="perf-score-input" data-perf-score min="0" data-score-id="' + t.id + '" data-max="' + t.weight + '" value="' + sIn(sup) + '" />'
      : (sup != null && sup !== '' ? '<b>' + sOut(sup) + '</b>' : '—');
    var divCell = div != null && div !== '' ? '<b>' + sOut(div) + '</b>' : '—';
    if (metaMergedReview) divCell += ' <span class="q-tag" style="font-size:11px">合并</span>';
    return '<tr data-id="' + t.id + '"><td title="' + esc(t.smart || t.m || '') + '">' + esc(label) +
      (ko && ko.o ? '<div class="muted" style="font-size:11px;margin-top:2px">↳ 关键目标：' + esc(ko.o.length > 28 ? ko.o.slice(0, 28) + '…' : ko.o) + '</div>' : '') +
      '</td><td>' + t.weight + '%</td><td>' + sOut(t.selfScore) + '</td><td>' + supCell + '</td><td>' + divCell + '</td></tr>';
  }

  function renderHierarchyBlock(sub, block, supScores, divScores, hrEdit) {
    if (!window.PerfKrHierarchy || !sub) return '';
    var listKey = block === 'V' ? 'coreKeyObjectives' : 'regularKeyObjectives';
    var kos = sub[listKey] || [];
    if (!kos.length) return '';
    var html = '<div class="task-detail-block-title">' + blockLabel(block) + '绩效</div>';
    kos.forEach(function (ko, ki) {
      var lb = window.PerfKrHierarchy && PerfKrHierarchy.levelBadge;
      html += '<div class="score-ko-group score-ko-group--l2"><div class="score-ko-head">' +
        (lb ? lb('l2', 'L2') : '') +
        '<span class="score-ko-label">关键目标 ' + (ki + 1) + '</span>' +
        '<div class="score-ko-o">' + esc(ko.o || '—') + '</div>' +
        '</div><div class="score-ko-targets">';
      html += '<table class="task-detail-score-table"><thead><tr><th>考核目标 SMART</th><th>权重</th><th>自评</th><th>上级分</th><th>分管分</th></tr></thead><tbody>';
      (ko.targets || []).forEach(function (t) {
        html += renderTargetRow(t, ko, supScores, divScores, hrEdit);
      });
      html += '</tbody></table></div></div>';
    });
    return html;
  }

  function renderScoreTable(sub, items, supScores, divScores, hrEdit) {
    if (window.PerfKrHierarchy && sub && sub.coreKeyObjectives) {
      var html = renderHierarchyBlock(sub, 'V', supScores, divScores, hrEdit);
      html += renderHierarchyBlock(sub, 'X', supScores, divScores, hrEdit);
      var bRows = items.filter(function (it) { return it.block === 'B'; });
      if (bRows.length) {
        html += '<div class="task-detail-block-title">行为绩效</div>';
        html += '<table class="task-detail-score-table"><thead><tr><th>指标</th><th>权重</th><th>自评</th><th>上级分</th><th>分管分</th></tr></thead><tbody>';
        bRows.forEach(function (it) {
          html += renderTargetRow({ id: it.id, weight: it.weight, m: it.label, selfScore: it.selfScore }, null, supScores, divScores, hrEdit);
        });
        html += '</tbody></table>';
      }
      return html;
    }
    var groups = ['V', 'X', 'B'];
    var html = '';
    groups.forEach(function (g) {
      var rows = items.filter(function (it) { return it.block === g; });
      if (!rows.length) return;
      html += '<div class="task-detail-block-title">' + blockLabel(g) + '绩效</div>';
      html += '<table class="task-detail-score-table"><thead><tr><th>指标</th><th>权重</th><th>自评</th><th>上级分</th><th>分管分</th></tr></thead><tbody>';
      rows.forEach(function (it) {
        var sup = supScores[it.id];
        var div = divScores[it.id];
        var label = it.label.length > 36 ? it.label.slice(0, 36) + '…' : it.label;
        var supCell = hrEdit
          ? '<input type="number" step="0.01" class="perf-score-input" data-perf-score min="0" data-score-id="' + it.id + '" data-max="' + it.weight + '" value="' + sIn(sup) + '" />'
          : (sup != null && sup !== '' ? '<b>' + sOut(sup) + '</b>' : '—');
        var divCell = div != null && div !== '' ? '<b>' + sOut(div) + '</b>' : '—';
        if (metaMergedReview) divCell += ' <span class="q-tag" style="font-size:11px">合并</span>';
        html += '<tr data-id="' + it.id + '"><td title="' + esc(it.label) + '">' + esc(label) + '</td><td>' + it.weight + '%</td><td>' + sOut(it.selfScore) + '</td><td>' + supCell + '</td><td>' + divCell + '</td></tr>';
      });
      html += '</tbody></table>';
    });
    return html;
  }

  var metaMergedReview = false;

  function renderSummaryBar(totals, label) {
    if (!totals) return '';
    return '<div class="score-summary" style="margin-bottom:12px">' +
      label + '合计 <b>' + sOut(totals.workSum) + '</b>/100 · 加减分 <b>' + sOut(totals.plusSum) + ' / ' + sOut(totals.minusSum) + '</b> · 总分 <b>' + sOut(totals.finalScore) + '</b></div>';
  }

  function initTaskDetailPage() {
    var params = new URLSearchParams(location.search);
    var no = params.get('no') || 'E10035';
    var planId = params.get('plan') || '2026-05';
    var from = params.get('from') || '';
    var hrEdit = from === 'plan' || params.get('mode') === 'hr';
    var meta = getMeta(no, planId);

    if (!meta) {
      document.querySelector('.q-oa-page').innerHTML = '<p class="task-detail-empty">未找到该员工的待办记录</p>';
      return;
    }

    metaMergedReview = !!meta.mergedReview;
    var sub = getSubmission(meta);
    var headerEl = document.getElementById('task-detail-header');
    var bodyEl = document.getElementById('task-detail-body');
    var bannerEl = document.getElementById('task-detail-banner');
    var actionsEl = document.getElementById('task-detail-actions');
    if (!bodyEl) return;

    var planLabel = planId.indexOf('Q') >= 0 ? '2026 ' + planId : '2026年' + parseInt(planId.split('-')[1], 10) + '月';
    if (headerEl) {
      headerEl.innerHTML = '<h2 style="margin:0 0 8px;font-size:18px">' + meta.name + ' · ' + planLabel + ' 月度绩效考核</h2>' +
        '<div class="score-header-meta">' +
        '<span>工号：' + meta.no + '</span><span>部门：' + meta.dept + '</span><span>岗位：' + meta.role + '</span><span>职级：' + meta.level + '</span>' +
        '</div>' +
        (window.PerfWorkflow ? PerfWorkflow.renderPhaseSteps(meta.phase, {
          task: { type: planId.indexOf('Q') >= 0 ? 'quarter' : 'month', mergedReview: meta.mergedReview },
        }) : '');
    }

    if (bannerEl) {
      bannerEl.className = 'task-detail-banner ' + (hrEdit ? 'task-detail-banner--hr' : 'task-detail-banner--view');
      bannerEl.innerHTML = hrEdit
        ? '🔧 <strong>HR 管理视图</strong>：员工填表与分管分为只读；可修改<strong>上级评分</strong>并保存（不影响员工端填表内容）。'
        : '👁 <strong>只读查看</strong>：展示员工填表与各级评分，不可修改。';
    }

    if (!sub || !meta.submitted) {
      if (meta.submitted && meta.supervisorScore != null) {
        bodyEl.innerHTML = '<div class="task-detail-block-title">评分摘要</div>' +
          '<table class="task-detail-score-table"><thead><tr><th>上级分</th><th>分管分</th><th>总得分</th></tr></thead><tbody><tr>' +
          '<td><b>' + sOut(meta.supervisorScore) + '</b></td><td>' + (meta.divisionScore != null ? '<b>' + sOut(meta.divisionScore) + '</b>' : '—') + '</td>' +
          '<td>' + (meta.totalScore != null ? '<b>' + sOut(meta.totalScore) + '</b>' : '—') + '</td></tr></tbody></table>' +
          '<p class="hr-hint" style="margin-top:12px">完整 KR 级明细演示数据未挂载；王芳（E10035）可查看完整填表快照。</p>';
        if (actionsEl) actionsEl.innerHTML = '<a class="q-btn" href="' + backHref(from, planId) + '">返回</a>';
        return;
      }
      bodyEl.innerHTML = '<div class="task-detail-empty">' +
        (meta.submitted ? '暂无完整填表快照（演示数据未挂载）' : '员工尚未提交完整表单，当前状态：<strong>' + (window.PerfWorkflow ? PerfWorkflow.phaseLabel(meta.phase) : meta.phase) + '</strong>') +
        '</div>';
      if (actionsEl) actionsEl.innerHTML = '<a class="q-btn" href="' + backHref(from, planId) + '">返回</a>';
      return;
    }

    var items = allScoreItems(sub);
    var draftKey = 'hr-supervisor-override-' + no + '-' + planId;
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(draftKey)); } catch (e) { saved = null; }
    var supScores = (saved && saved.scores) ? saved.scores : demoSupervisorScores(meta, items);
    if (meta.taskId && window.SupervisorScore) {
      var draft = localStorage.getItem('oa-supervisor-draft-' + meta.taskId);
      if (draft) {
        try {
          var d = JSON.parse(draft);
          if (d.scores) supScores = d.scores;
        } catch (e2) { /* ignore */ }
      }
    }
    var divScores = demoDivisionScores(meta, items, supScores);

    var state = {
      scores: Object.assign({}, supScores),
      adjustPlus: sub.adjust.plus.map(function (r) { return r.approved != null ? r.approved : r.selfScore; }),
      adjustMinus: sub.adjust.minus.map(function (r) { return r.approved != null ? r.approved : r.selfScore; }),
    };

    function refresh() {
      if (hrEdit) {
        bodyEl.querySelectorAll('input[data-score-id]').forEach(function (inp) {
          state.scores[inp.dataset.scoreId] = inp.value;
        });
      }
      var totals = SupervisorScore.calcTotals(sub, state);
      bodyEl.querySelectorAll('input[data-score-id]').forEach(function (inp) {
        var err = totals.errors.items[inp.dataset.scoreId];
        inp.classList.toggle('is-error', !!err);
        inp.closest('tr').classList.toggle('is-error', !!err);
      });
      var sumEl = document.getElementById('task-detail-summary');
      if (sumEl) sumEl.innerHTML = renderSummaryBar(totals, '上级');
    }

    var html = '';
    if (sub.selfSummary) {
      html += '<div class="task-detail-block-title">自评总结</div><div class="score-readonly-field" style="margin-bottom:12px;font-size:13px;line-height:1.6">' + esc(sub.selfSummary).replace(/\n/g, '<br>') + '</div>';
    }
    html += renderScoreTable(sub, items, state.scores, divScores, hrEdit);
    html += '<div id="task-detail-summary"></div>';
    if (sub.adjust && (sub.adjust.plus.length || sub.adjust.minus.length)) {
      html += '<div class="task-detail-block-title">加减分核定</div><table class="task-detail-score-table"><thead><tr><th>类型</th><th>事项</th><th>员工申报</th><th>上级评</th><th>核定</th></tr></thead><tbody>';
      sub.adjust.plus.forEach(function (r) {
        var sup = r.approved != null ? r.approved : r.selfScore;
        html += '<tr><td>加分</td><td>' + esc(r.desc) + '</td><td>' + sOut(r.selfScore) + '</td><td>' + sOut(sup) + '</td><td>' + sOut(sup) + '</td></tr>';
      });
      sub.adjust.minus.forEach(function (r) {
        var sup = r.approved != null ? r.approved : r.selfScore;
        html += '<tr><td>减分</td><td>' + esc(r.desc) + '</td><td>' + sOut(r.selfScore) + '</td><td>' + sOut(sup) + '</td><td>' + sOut(sup) + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += renderConvertSection(meta);
    bodyEl.innerHTML = html;

    if (hrEdit) {
      bodyEl.querySelectorAll('input[data-score-id]').forEach(function (inp) {
        inp.addEventListener('input', refresh);
      });
    }
    refresh();
    if (sf()) sf().bindAll(bodyEl);

    if (actionsEl) {
      actionsEl.innerHTML = '<a class="q-btn" href="' + backHref(from, planId) + '">返回</a>' +
        (hrEdit ? '<button type="button" class="q-btn q-btn-primary" id="btn-save-supervisor">保存上级评分</button>' : '');
      var saveBtn = document.getElementById('btn-save-supervisor');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          var totals = SupervisorScore.calcTotals(sub, state);
          if (!totals.valid) { alert('请修正标红项后再保存'); return; }
          localStorage.setItem(draftKey, JSON.stringify({ scores: state.scores, savedAt: new Date().toISOString() }));
          alert('上级评分已保存（原型）。员工填表内容未改动。');
        });
      }
    }
  }

  function backHref(from, planId) {
    if (from === 'results') {
      var perm = new URLSearchParams(location.search).get('perm');
      return 'hr-perf-results-list.html' + (perm ? '?perm=' + encodeURIComponent(perm) : '');
    }
    return 'hr-plan-detail.html?plan=' + encodeURIComponent(planId);
  }

  window.initPerfTaskDetail = initTaskDetailPage;
  window.PerfTaskDetail = { TASK_REGISTRY: TASK_REGISTRY, getMeta: getMeta };
})();
