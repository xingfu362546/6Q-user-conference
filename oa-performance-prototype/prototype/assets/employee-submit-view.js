/**
 * 员工 · 自填内容只读查看（v1.4.2）
 * OA personal-perf-past-view / 小程序 task-past-view 共用；
 * 与归档回看、进度页入口同源，月/季结构一致（L2→L3 折叠卡）。
 */
(function () {
  'use strict';

  var DEMO_EMPLOYEE = { employee: '王芳', dept: '信息部', role: '产品专员' };

  /** 员工 taskId → 领导 SUBMISSIONS 或 PAST_FORM_SNAPSHOTS */
  var EMP_TASK_RESOLVE = {
    m202605: { leader: 'r-wf-202605', taskType: 'month' },
    q2026q2: { leader: 'r-wf-2026q2', taskType: 'quarter' },
    'q2026q2-wait': { leader: 'r-wf-2026q2', taskType: 'quarter' },
    'm202605-q': { leader: 'r-wf-2026q2', taskType: 'quarter' },
    'm202503-wait': { snapshot: 'm202603', taskType: 'month' },
    m202603: { snapshot: 'm202603', taskType: 'month' },
    m202602: { snapshot: 'm202602', taskType: 'month' },
    m202601: { snapshot: 'm202601', taskType: 'month' },
  };

  var DEFAULT_BEHAVIOR = [
    { id: 'b1', name: '团队建设与人才培养', weight: 4, selfScore: 3.8, standard: '1.根据团队现状，规划并推动人才培养计划；\n2.及时给予反馈与辅导；\n3.差异化分配任务；\n4.建立经验分享机制。', event: '带教新人完成绩效任务列表页说明；组织 1 次组内原型走查分享。' },
    { id: 'b2', name: '跨部门协同', weight: 4, selfScore: 4, standard: '1.主动建立跨部门信息共享；\n2.积极响应协同需求；\n3.尊重协同方节奏；\n4.协作问题及时复盘。', event: '与 HR 完成 2 轮需求评审，主动拆分 MVP 范围并每周同步进度。' },
    { id: 'b3', name: '压力应对与问题解决', weight: 4, selfScore: 3.6, standard: '1.面对压力情绪稳定；\n2.多路径尝试；\n3.分析问题根因；\n4.资源不足时主动协调。', event: '需求变更频繁时通过优先级矩阵与 HR 确认主链路，避免无效加班。' },
    { id: 'b4', name: '目标承接与责任承担', weight: 3, selfScore: 3.5, standard: '1.快速理解上级目标并转化；\n2.资源不足主动协调；\n3.主动跟进；\n4.对交付负责。', event: '承接绩效信息化专项，输出演示方案与风险清单，保证评审节点不受影响。' },
  ];

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function pastViewHref(taskId, platform) {
    var base = platform === 'mp' ? 'task-past-view.html' : 'personal-perf-past-view.html';
    return base + '?id=' + encodeURIComponent(taskId);
  }

  function canViewSelfFill(phase) {
    if (!window.PerfWorkflow) return false;
    var ph = PerfWorkflow.normalizePhase(phase);
    return ph === 'pending_supervisor' || ph === 'pending_division' || ph === 'pending_confirm' || ph === 'confirmed' || ph === 'completed';
  }

  function enrichFlatKr(kr, prefix, idx) {
    var w = parseFloat(kr.weight) || 0;
    return Object.assign({}, kr, {
      id: kr.id || prefix + idx,
      weight: kr.weight,
      m: kr.m || '已完成当期关键成果描述（演示快照）。',
      selfScore: kr.selfScore != null && kr.selfScore !== '' ? kr.selfScore : Math.round(w * 0.88 * 10) / 10,
    });
  }

  function snapshotToSubmission(snap) {
    if (!snap) return null;
    var form = snap.form || {};
    var coreFlat = (form.coreKrs || []).map(function (kr, i) { return enrichFlatKr(kr, 'v', i); });
    var regFlat = (form.regularKrs || []).map(function (kr, i) { return enrichFlatKr(kr, 'x', i); });
    var sub = {
      header: Object.assign({}, DEMO_EMPLOYEE, snap.header || {}, {
        period: (snap.header && snap.header.period) || snap.periodLabel,
        submittedAt: snap.submittedAt,
      }),
      selfSummary: snap.selfSummary || '本月重点完成绩效模块方案设计，协同 HR 完成两轮需求对齐。',
      behavior: snap.behavior && snap.behavior.length ? snap.behavior : DEFAULT_BEHAVIOR.slice(),
      adjust: snap.adjust || { plus: [], minus: [] },
      nextMonthKeyObjectives: snap.nextMonthKeyObjectives,
      nextSeasonKeyObjectives: snap.nextSeasonKeyObjectives,
    };
    if (window.PerfKrHierarchy) {
      sub.coreKeyObjectives = coreFlat.length
        ? PerfKrHierarchy.consolidateFlatList(coreFlat, 'V')
        : [];
      sub.regularKeyObjectives = regFlat.length
        ? PerfKrHierarchy.consolidateFlatList(regFlat, 'X')
        : [];
      PerfKrHierarchy.ensureSubmission(sub);
      sub.coreKrs = PerfKrHierarchy.flattenTargets(sub.coreKeyObjectives, 'V');
      sub.regularKrs = PerfKrHierarchy.flattenTargets(sub.regularKeyObjectives, 'X');
    } else {
      sub.coreKrs = coreFlat;
      sub.regularKrs = regFlat;
    }
    return sub;
  }

  function resolveEmployeeSubmission(employeeTaskId) {
    var rule = EMP_TASK_RESOLVE[employeeTaskId] || { snapshot: employeeTaskId };
    var taskType = rule.taskType || 'month';
    if (rule.leader && window.SupervisorScore) {
      var sub = SupervisorScore.prepareSubmission(rule.leader);
      if (sub) {
        if (!sub.header) sub.header = {};
        return { sub: sub, taskType: rule.taskType || (sub.header.period && sub.header.period.indexOf('Q') >= 0 ? 'quarter' : 'month') };
      }
    }
    if (rule.snapshot && window.EmployeePastCopy) {
      var snap = EmployeePastCopy.getSnapshot(rule.snapshot);
      if (snap) {
        taskType = rule.taskType || snap.formType || 'month';
        return { sub: snapshotToSubmission(snap), taskType: taskType };
      }
    }
    return null;
  }

  function renderHeaderHtml(sub, taskType) {
    var h = sub.header || {};
    var typeLabel = taskType === 'quarter' ? '季度绩效考核' : '月度绩效考核';
    return '<div class="readonly-block emp-past-header">' +
      '<h3>表头信息</h3>' +
      '<div class="readonly-field"><label>姓名 / 部门</label><p>' + esc(h.employee) + ' · ' + esc(h.dept) + '</p></div>' +
      '<div class="readonly-field"><label>岗位</label><p>' + esc(h.role || '—') + '</p></div>' +
      '<div class="readonly-field"><label>考核期</label><p>' + esc(h.period) + ' · ' + typeLabel + '</p></div>' +
      '<div class="readonly-field"><label>提交时间</label><p>' + esc(h.submittedAt || '—') + '</p></div>' +
      '</div>';
  }

  function renderSummaryHtml(sub) {
    return '<div class="readonly-block"><h3>自评总结</h3><div class="readonly-field"><p>' + esc(sub.selfSummary).replace(/\n/g, '<br>') + '</p></div></div>';
  }

  function renderOaPage(ctx) {
    var sub = ctx.sub;
    var taskType = ctx.taskType;
    var SS = window.SupervisorScore;
    var krHtml = SS ? SS.renderEmployeeSelfFillDetail(sub, { taskType: taskType }) : '';
    var nextHtml = SS ? SS.renderEmployeeNextGoals(sub, { taskType: taskType }) : '';
    var summaryHtml = renderSummaryHtml(sub);
    return renderHeaderHtml(sub, taskType) +
      '<div class="readonly-block emp-past-kr">' + krHtml + '</div>' +
      summaryHtml +
      '<div class="readonly-block emp-past-next">' + nextHtml + '</div>';
  }

  function renderMpSections(ctx) {
    var sub = ctx.sub;
    var taskType = ctx.taskType;
    var SS = window.SupervisorScore;
    var h = sub.header || {};
    var typeLabel = taskType === 'quarter' ? '季度' : '月度';
    var html = '<div class="mp-readonly-section"><h3>表头信息</h3>' +
      '<div class="mp-readonly-row"><label>姓名 / 部门</label><p>' + esc(h.employee) + ' · ' + esc(h.dept) + '</p></div>' +
      '<div class="mp-readonly-row"><label>考核期</label><p>' + esc(h.period) + ' · ' + typeLabel + '</p></div>' +
      '<div class="mp-readonly-row"><label>提交时间</label><p>' + esc(h.submittedAt || '—') + '</p></div></div>';
    html += '<div class="mp-readonly-section mp-readonly-section--kr"><h3>考评细项 · 员工自填</h3>' +
      (SS ? SS.renderEmployeeSelfFillDetail(sub, { taskType: taskType }) : '') + '</div>';
    html += '<div class="mp-readonly-section"><h3>自评总结</h3><div class="mp-readonly-row"><p>' + esc(sub.selfSummary).replace(/\n/g, '<br>') + '</p></div></div>';
    html += '<div class="mp-readonly-section"><h3>' + (taskType === 'quarter' ? '下季核心目标' : '下月核心目标') + '</h3>' +
      (SS ? SS.renderEmployeeNextGoals(sub, { taskType: taskType }) : '') + '</div>';
    return html;
  }

  function initOaPastViewPage() {
    var params = new URLSearchParams(location.search);
    var id = params.get('id') || 'm202603';
    var ctx = resolveEmployeeSubmission(id);
    var root = document.getElementById('emp-past-root');
    var titleEl = document.getElementById('emp-past-title');
    var backEl = document.getElementById('emp-past-back');
    if (!ctx || !root) {
      if (root) root.innerHTML = '<p class="hr-hint">未找到 id=' + esc(id) + ' 的提交快照。</p>';
      return;
    }
    var period = (ctx.sub.header && ctx.sub.header.period) || id;
    if (titleEl) titleEl.textContent = period;
    document.title = '查看自填内容 · ' + period;
    root.innerHTML = renderOaPage(ctx);
    if (window.SupervisorScore) SupervisorScore.bindEmployeeSelfFillList(root);
    if (backEl) {
      var fromProgress = params.get('from') === 'progress';
      backEl.href = fromProgress
        ? 'employee-task-progress.html?id=' + encodeURIComponent(id)
        : (window.EmployeeTasks && EmployeeTasks.findTask(id) && EmployeeTasks.findTask(id).phase === 'confirmed'
          ? 'personal-perf-past.html'
          : 'personal-perf.html');
    }
    var crumb = document.getElementById('emp-past-crumb-period');
    if (crumb) crumb.textContent = period;
    if (window.initOaShell && document.getElementById('q-oa-pagetabs')) {
      /* pagetabs label updated via emp-past-title */
    }
  }

  function initMpPastViewPage() {
    var params = new URLSearchParams(location.search);
    var id = params.get('id') || 'm202603';
    var ctx = resolveEmployeeSubmission(id);
    var root = document.getElementById('mp-past-root');
    var titleEl = document.getElementById('mp-past-title');
    if (!ctx || !root) {
      if (root) root.innerHTML = '<p class="mp-task-meta">未找到提交快照。</p>';
      return;
    }
    var period = (ctx.sub.header && ctx.sub.header.period) || id;
    if (titleEl) titleEl.textContent = period + ' · ' + (ctx.taskType === 'quarter' ? '季度' : '月度');
    root.innerHTML = renderMpSections(ctx);
    if (window.SupervisorScore) SupervisorScore.bindEmployeeSelfFillList(root);
  }

  window.EmployeeSubmitView = {
    EMP_TASK_RESOLVE: EMP_TASK_RESOLVE,
    pastViewHref: pastViewHref,
    canViewSelfFill: canViewSelfFill,
    resolveEmployeeSubmission: resolveEmployeeSubmission,
    snapshotToSubmission: snapshotToSubmission,
    initOaPastViewPage: initOaPastViewPage,
    initMpPastViewPage: initMpPastViewPage,
  };
})();
