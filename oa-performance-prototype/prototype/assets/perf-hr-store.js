/**
 * 计划、待办、评价关系。存在浏览器本地。范围包模板不在这里改。
 */
(function () {
  'use strict';

  var KEY = 'perf-plan-store';
  var EVAL_KEY = 'perf-evaluator-map';
  var DIV_KEY = 'perf-division-map';

  var PEOPLE = [
    { no: 'E10021', name: '张明', org: '信息部', role: '产品经理', level: '主管' },
    { no: 'E10035', name: '王芳', org: '信息部', role: '前端工程师', level: '职员' },
    { no: 'E10008', name: '李强', org: '信息部', role: '技术总监', level: '总监' },
    { no: 'E10044', name: '肖洋', org: '信息部', role: '后端工程师', level: '职员' },
    { no: 'E20011', name: '赵敏', org: '广州办事处', role: '办事处主任', level: '经理' },
    { no: 'E20015', name: '陈伟', org: '广州办事处', role: '课程顾问', level: '职员' },
    { no: 'E20018', name: '孙丽', org: '广州办事处', role: '办事处主管', level: '主管' },
    { no: 'E10042', name: '刘洋', org: '人才开发部', role: 'HR专员', level: '职员' },
    { no: 'E10055', name: '周婷', org: '行政管理部', role: '行政经理', level: '经理' },
    { no: 'E20022', name: '吴磊', org: '深圳办事处', role: '办事处主管', level: '主管' },
    { no: 'E20025', name: '马军', org: '深圳办事处', role: '课程顾问', level: '职员' },
    { no: 'E10048', name: '何欣', org: '人才开发部', role: 'HR经理', level: '经理' }
  ];

  function allNos() {
    return PEOPLE.map(function (p) { return p.no; });
  }

  function defaultStore() {
    var nos = allNos();
    return {
      plans: {
        '2026-05': planShell('2026年5月月度考核', 'month', '2026-05', '2026-05-01T08:00', '2026-06-05T18:00', '2026-06-10T18:00', '2026-06-15T18:00', nos),
        '2026-Q2': planShell('2026 Q2 季度考核', 'quarter', '2026-Q2', '2026-04-01T08:00', '2026-06-20T18:00', '2026-06-25T18:00', '2026-06-30T18:00', nos.slice()),
        '2026-04': planShell('2026年4月月度考核', 'month', '2026-04', '2026-04-01T08:00', '2026-04-28T18:00', '2026-05-05T18:00', '2026-05-08T18:00', [])
      },
      tasks: {
        '2026-Q2:E10021': {
          node: '已完成',
          reached: ['员工填写', '上级评分', '分管评分'],
          confirm: { employee: true, supervisor: true, division: true },
          scoreSample: 23,
          content: '已完成 PRD v1.0 并组织 2 轮评审',
          assessedTotal: 89.2,
          supervisorTotal: 88.4,
          divisionTotal: 89.2,
          hrFinal: null,
          voided: null,
          reassignedTo: null,
          returns: []
        },
        '2026-05:E10021': {
          node: '待上级评价',
          reached: ['员工填写', '上级评分'],
          confirm: { employee: false, supervisor: false, division: false },
          scoreSample: 23,
          content: '已完成 PRD v1.0 并组织 2 轮评审',
          assessedTotal: 84.7,
          supervisorTotal: 84.4,
          divisionTotal: 84.1,
          hrFinal: null,
          voided: null,
          reassignedTo: null,
          returns: []
        }
      }
    };
  }

  function planShell(name, type, period, start, fillEnd, scoreEnd, confirmEnd, roster) {
    return { name: name, type: type, period: period, start: start, fillEnd: fillEnd, scoreEnd: scoreEnd, confirmEnd: confirmEnd, roster: roster };
  }

  function migrateStore(store) {
    var changed = false;
    Object.keys(store.plans || {}).forEach(function (id) {
      var plan = store.plans[id];
      if (plan && !plan.period && /^(\d{4}-\d{2}|\d{4}-Q[1-4])$/i.test(id)) {
        plan.period = id.replace(/q([1-4])$/i, function (_, n) { return 'Q' + n; });
        changed = true;
      }
    });
    function fillSupervisor(key, value, system) {
      var task = store.tasks[key];
      if (!task || task.supervisorTotal != null) return;
      if (task.assessedTotal !== system) return;
      if (task.returns && task.returns.length) return;
      task.supervisorTotal = value;
      changed = true;
    }
    fillSupervisor('2026-Q2:E10021', 88.4, 89.2);
    fillSupervisor('2026-05:E10021', 84.4, 84.7);
    if (changed) save(store);
    return store;
  }

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && raw.plans && raw.tasks) return migrateStore(raw);
    } catch (e) { /* 空 */ }
    var seed = defaultStore();
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }

  function save(store) {
    localStorage.setItem(KEY, JSON.stringify(store));
  }

  function person(no) {
    for (var i = 0; i < PEOPLE.length; i++) if (PEOPLE[i].no === no) return PEOPLE[i];
    return null;
  }

  function defaultEval() {
    return {
      E10021: 'E10008',
      E10035: 'E10008',
      E10044: 'E10021',
      E20015: 'E20011',
      E20018: 'E20011',
      E10042: 'E10048',
      E20025: 'E20022',
      E10055: 'E10048'
    };
  }

  function evalMap() {
    try {
      var raw = JSON.parse(localStorage.getItem(EVAL_KEY) || 'null');
      if (raw) return raw;
    } catch (e) { /* 空 */ }
    var seed = defaultEval();
    localStorage.setItem(EVAL_KEY, JSON.stringify(seed));
    return seed;
  }

  function saveEval(map) {
    localStorage.setItem(EVAL_KEY, JSON.stringify(map));
  }

  function defaultDivision() {
    return {
      E10021: 'E10008',
      E10035: 'E10008',
      E10044: 'E10008',
      E10008: 'E10021',
      E20011: 'E10008',
      E20015: 'E20011',
      E20018: 'E20011',
      E10042: 'E10048',
      E10055: 'E10008',
      E20022: 'E10008',
      E20025: 'E20022',
      E10048: 'E10008'
    };
  }

  function divisionMap() {
    try {
      var raw = JSON.parse(localStorage.getItem(DIV_KEY) || 'null');
      if (raw) return raw;
    } catch (e) { /* 空 */ }
    var seed = defaultDivision();
    localStorage.setItem(DIV_KEY, JSON.stringify(seed));
    return seed;
  }

  function saveDivision(map) {
    localStorage.setItem(DIV_KEY, JSON.stringify(map));
  }

  function divisionNo(empNo) {
    return divisionMap()[empNo] || '';
  }

  function divisionName(empNo) {
    var no = divisionNo(empNo);
    if (!no) return '王分管';
    var p = person(no);
    return p ? p.name : '王分管';
  }

  function evaluatorNo(empNo) {
    return evalMap()[empNo] || '';
  }

  function evaluatorName(empNo) {
    var no = evaluatorNo(empNo);
    var p = person(no);
    return p ? p.name : '';
  }

  function taskKey(planId, no) {
    return planId + ':' + no;
  }

  function seedFromStatus(planId, status) {
    var chain = nodesFor(planId);
    var node = '填写中';
    var upto = 1;
    if (status === '未开始') node = '未开始';
    else if (status === '已逾期') node = '已逾期';
    else if (status === '已提交' || status === '待上级评价') {
      node = '待上级评价';
      upto = Math.min(2, chain.length);
    } else if (status === '待分管评价') {
      node = '待分管评价';
      upto = Math.min(3, chain.length);
    } else if (status === '待确认' || status === '待员工确认') {
      node = '待员工确认';
      upto = chain.length;
    } else if (status === '已完成') {
      node = '已完成';
      upto = chain.length;
    }
    return { node: node, reached: chain.slice(0, upto) };
  }

  function appendReached(task, nodes) {
    task.reached = task.reached || [];
    nodes.forEach(function (node) {
      if (task.reached.indexOf(node) < 0) task.reached.push(node);
    });
  }

  /** 当前节点及之前的节点。退至只改当前节点，不清空已到达记录。 */
  function impliedReached(planId, node) {
    var chain = nodesFor(planId);
    if (node === '已完成' || node === '待确认' || node === '待员工确认') return chain.slice();
    var current = statusToNode(node);
    var idx = chain.indexOf(current);
    if (idx < 0) return chain.slice(0, 1);
    return chain.slice(0, idx + 1);
  }

  function ensureTask(store, planId, emp) {
    var key = taskKey(planId, emp.no);
    var seed = seedFromStatus(planId, emp.status);
    if (!store.tasks[key]) {
      store.tasks[key] = {
        node: seed.node,
        reached: seed.reached,
        confirm: { employee: false, supervisor: false, division: false },
        scoreSample: null,
        content: '',
        assessedTotal: null,
        supervisorTotal: null,
        divisionTotal: null,
        hrFinal: null,
        voided: null,
        reassignedTo: null,
        returns: []
      };
    } else {
      var task = store.tasks[key];
      var untouched = !task.voided && !(task.returns && task.returns.length) && !task.hrFinal;
      var early = task.node === '填写中' || task.node === '未开始';
      if (untouched && early && seed.node !== task.node && emp.status !== '填写中' && emp.status !== '未开始') {
        task.node = seed.node;
        task.reached = seed.reached.slice();
      }
      if (task.node !== '未开始') appendReached(task, impliedReached(planId, task.node));
      if (task.supervisorTotal === undefined) task.supervisorTotal = null;
    }
    return store.tasks[key];
  }

  function view(planId, emp) {
    var store = load();
    var task = store.tasks[taskKey(planId, emp.no)];
    var status = task ? task.node : emp.status;
    if (task && task.voided) status = '已失效';
    if (task && task.node === '待确认') status = '待员工确认';
    if (task && task.node === '已完成' && !task.voided) status = '已完成';
    return { status: status, handler: handlerFor(status, emp), task: task };
  }

  function handlerFor(status, emp) {
    if (status === '已失效') return '已失效';
    if (status === '已完成') return '已完成';
    if (status === '待上级评价' || status === '已提交') return evaluatorName(emp.no) || '未指定评价人';
    if (status === '待分管评价') return divisionName(emp.no) || '未指定分管';
    if (status === '待员工确认' || status === '待确认') return emp.name;
    return emp.name;
  }

  function nodesFor(planId) {
    var store = load();
    var plan = store.plans[planId];
    if (plan && plan.type === 'quarter') return ['员工填写', '上级评分', '分管评分'];
    return ['员工填写', '上级评分'];
  }

  function nodeToStatus(node) {
    if (node === '员工填写') return '填写中';
    if (node === '上级评分') return '待上级评价';
    if (node === '分管评分') return '待分管评价';
    if (node === '待确认') return '待员工确认';
    return node;
  }

  /** 列表状态对应的流程节点。待员工确认、已完成已经离开评分链，返回空字符串。 */
  function statusToNode(status) {
    if (status === '未开始' || status === '填写中' || status === '已逾期' || status === '员工填写') return '员工填写';
    if (status === '已提交' || status === '待上级评价' || status === '上级评分') return '上级评分';
    if (status === '待分管评价' || status === '分管评分') return '分管评分';
    return '';
  }

  function reachedNodes(planId, emp) {
    var store = load();
    var task = store.tasks[taskKey(planId, emp.no)] || ensureTask(store, planId, emp);
    var allowed = nodesFor(planId);
    var reached = task.reached || [];
    return allowed.filter(function (node) { return reached.indexOf(node) >= 0; });
  }

  /**
   * 可退至节点（v1.5.3）：
   * 待上级评价 → 只能退员工填写；待分管评价 → 员工填写 / 上级评分；
   * 待员工确认 → 员工填写 / 上级评分 / 分管评分。已完成不可退，初始节点不显示。
   */
  function returnTargets(planId, emp) {
    var currentView = view(planId, emp);
    if (!currentView || currentView.status === '已失效' || currentView.status === '已完成') return [];
    var chain = nodesFor(planId);
    var byStatus = {
      '待上级评价': ['员工填写'],
      '待分管评价': ['员工填写', '上级评分'],
      '待员工确认': chain.slice()
    };
    var list = byStatus[currentView.status] || [];
    var reached = reachedNodes(planId, emp);
    return list.filter(function (node) {
      return chain.indexOf(node) >= 0 && reached.indexOf(node) >= 0;
    });
  }

  function returnTask(planId, emp, node, reason) {
    if (!reason || !String(reason).trim()) return { ok: false, error: '请填写退至原因' };
    if (!returnTargets(planId, emp).length) return { ok: false, error: '待办还在初始节点，不能退至' };
    var allowed = nodesFor(planId);
    if (allowed.indexOf(node) < 0) return { ok: false, error: '这个考核类型不能退到该节点' };
    var store = load();
    var task = ensureTask(store, planId, emp);
    if (task.voided) return { ok: false, error: '已失效的待办不能退至' };
    if (returnTargets(planId, emp).indexOf(node) < 0) return { ok: false, error: '只能退至已经走过、且不是当前所在的节点' };
    task.node = nodeToStatus(node);
    task.confirm = { employee: false, supervisor: false, division: false };
    task.returns.push({ node: node, reason: String(reason).trim(), at: new Date().toISOString() });
    save(store);
    return { ok: true, task: task };
  }

  function voidTask(planId, emp, reason, scope) {
    if (!reason || !String(reason).trim()) return { ok: false, error: '请填写失效原因' };
    if (!scope || !scope.id || !scope.personId) return { ok: false, error: '该员工不在已发放的范围包里，不能失效' };
    var store = load();
    var task = ensureTask(store, planId, emp);
    if (task.voided) return { ok: false, error: '已经失效' };
    if (task.node === '已完成') return { ok: false, error: '已完成的待办不能失效' };
    task.voided = {
      reason: String(reason).trim(),
      at: new Date().toISOString(),
      prevNode: task.node,
      scopePackId: scope && scope.id ? scope.id : '',
      scopePackName: scope && scope.name ? scope.name : '',
      personId: scope && scope.personId ? scope.personId : '',
      planId: planId
    };
    task.reassignedPackId = '';
    var plan = store.plans[planId];
    if (plan) plan.roster = (plan.roster || []).filter(function (no) { return no !== emp.no; });
    save(store);
    return { ok: true, task: task };
  }

  function markReassigned(planId, empNo, packId, packName) {
    var store = load();
    var task = store.tasks[taskKey(planId, empNo)];
    if (!task || !task.voided) return { ok: false };
    task.reassignedPackId = packId || '';
    task.reassignedPackName = packName || '';
    save(store);
    return { ok: true };
  }

  function restoreTask(planId, emp) {
    var store = load();
    var task = store.tasks[taskKey(planId, emp.no)];
    if (!task || !task.voided) return { ok: false, error: '这张待办没有失效' };
    if (task.reassignedPackId) {
      return { ok: false, error: '该员工已在范围包「' + (task.reassignedPackName || '新范围包') + '」中。先从那个范围包去掉，才能加回「' + (task.voided.scopePackName || '原范围包') + '」并重新发放' };
    }
    if (!task.voided.scopePackId || !task.voided.personId) {
      return { ok: false, error: '没有记录原范围包，不能恢复' };
    }
    var back = {
      scopePackId: task.voided.scopePackId,
      personId: task.voided.personId,
      scopePackName: task.voided.scopePackName || ''
    };
    task.node = '未开始';
    task.reached = ['员工填写'];
    task.confirm = { employee: false, supervisor: false, division: false };
    task.voided = null;
    task.reassignedPackId = '';
    task.reassignedPackName = '';
    var plan = store.plans[planId];
    if (plan && plan.roster.indexOf(emp.no) < 0) plan.roster.push(emp.no);
    save(store);
    return { ok: true, restored: back };
  }

  /** 采用分：HR 最终总分优先，没有就用计算总分。v1.5.3 起分管不再单独核定总分。 */
  function adoptedScore(planId, task) {
    if (!task) return null;
    if (task.hrFinal && task.hrFinal.value != null && task.hrFinal.value !== '') return task.hrFinal.value;
    if (task.assessedTotal != null && task.assessedTotal !== '') return task.assessedTotal;
    return null;
  }

  function setHrFinal(planId, empNo, value, reason) {
    if (!reason || !String(reason).trim()) return { ok: false, error: '请填写修改原因' };
    if (value === '' || isNaN(Number(value))) return { ok: false, error: '分数须为数字' };
    var store = load();
    var emp = person(empNo) || { no: empNo, status: '已完成' };
    var task = ensureTask(store, planId, emp);
    var before = adoptedScore(planId, task);
    task.hrFinal = {
      value: Math.round(Number(value) * 10) / 10,
      reason: String(reason).trim(),
      before: before,
      by: 'HR',
      at: new Date().toISOString()
    };
    save(store);
    return { ok: true, task: task };
  }

  function editPlan(planId, patch) {
    var store = load();
    var plan = store.plans[planId];
    if (!plan) return { ok: false, error: '计划不存在' };
    var name = String(patch.name || '').trim();
    if (!name) return { ok: false, error: '计划名称不能为空' };
    var clash = Object.keys(store.plans).some(function (id) {
      return id !== planId && String(store.plans[id].name || '').trim() === name;
    });
    if (clash) return { ok: false, error: '计划名称与已有计划重复' };
    var start = patch.start;
    var fillEnd = patch.fillEnd;
    var scoreEnd = patch.scoreEnd;
    var confirmEnd = patch.confirmEnd;
    if (!(start <= fillEnd && fillEnd <= scoreEnd && scoreEnd <= confirmEnd)) {
      return { ok: false, error: '时间须满足：启动 ≤ 员工填写截止 ≤ 上级评分截止 ≤ 确认截止' };
    }
    plan.name = name;
    plan.start = start;
    plan.fillEnd = fillEnd;
    plan.scoreEnd = scoreEnd;
    plan.confirmEnd = confirmEnd;
    save(store);
    return { ok: true, plan: plan };
  }

  function importEvaluators(text) {
    var lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) return { ok: false, error: '文件是空的', errors: [] };
    var head = lines[0].split(',').map(function (s) { return s.trim(); });
    var okHead = head[0] === '员工工号' && head[1] === '上级工号' && head[2] === '分管工号';
    if (!okHead) {
      return { ok: false, error: '表头必须是：员工工号,上级工号,分管工号,员工姓名,上级姓名,分管姓名', errors: [] };
    }
    var errors = [];
    var seen = {};
    var updates = [];
    for (var i = 1; i < lines.length; i++) {
      var cols = lines[i].split(',');
      var empNo = (cols[0] || '').trim();
      var supNo = (cols[1] || '').trim();
      var divNo = (cols[2] || '').trim();
      var empName = (cols[3] || '').trim();
      var supName = (cols[4] || '').trim();
      var divName = (cols[5] || '').trim();
      var row = i + 1;
      function fail(msg) { errors.push({ row: row, no: empNo || supNo || divNo, message: msg }); }
      if (!person(empNo)) { errors.push({ row: row, no: empNo, message: '员工工号不存在' }); continue; }
      if (!person(supNo)) { errors.push({ row: row, no: supNo, message: '上级工号不存在' }); continue; }
      if (divNo && !person(divNo)) { errors.push({ row: row, no: divNo, message: '分管工号不存在' }); continue; }
      if (empNo === supNo) { fail('上级不能是员工本人'); continue; }
      if (divNo && empNo === divNo) { fail('分管不能是员工本人'); continue; }
      if (seen[empNo]) { fail('员工工号在文件中重复'); continue; }
      seen[empNo] = true;
      if (empName && person(empNo).name !== empName) { fail('员工姓名与工号不一致'); continue; }
      if (supName && person(supNo).name !== supName) { fail('上级姓名与工号不一致'); continue; }
      if (divName && divNo && person(divNo).name !== divName) { fail('分管姓名与工号不一致'); continue; }
      updates.push({ empNo: empNo, supNo: supNo, divNo: divNo });
    }
    if (errors.length) return { ok: false, error: '有 ' + errors.length + ' 行未通过，本次未写入', errors: errors };
    var map = evalMap();
    var divMap = divisionMap();
    updates.forEach(function (u) {
      map[u.empNo] = u.supNo;
      if (u.divNo) divMap[u.empNo] = u.divNo;
      else delete divMap[u.empNo];
    });
    saveEval(map);
    saveDivision(divMap);
    return { ok: true, count: updates.length, errors: [] };
  }

  function setEvaluator(empNo, evNo) {
    var store = evalMap();
    store[empNo] = evNo;
    saveEval(store);
    return { ok: true };
  }

  function setDivision(empNo, divNo) {
    var map = divisionMap();
    if (divNo) map[empNo] = divNo;
    else delete map[empNo];
    saveDivision(map);
    return { ok: true };
  }

  function readTask(planId, no) {
    return load().tasks[taskKey(planId, no)] || null;
  }

  function planOf(planId) {
    return load().plans[planId] || null;
  }

  window.PerfHrStore = {
    PEOPLE: PEOPLE,
    person: person,
    load: load,
    view: view,
    nodesFor: nodesFor,
    evaluatorNo: evaluatorNo,
    evaluatorName: evaluatorName,
    evalMap: evalMap,
    divisionMap: divisionMap,
    divisionNo: divisionNo,
    divisionName: divisionName,
    setDivision: setDivision,
    reachedNodes: reachedNodes,
    returnTargets: returnTargets,
    returnTask: returnTask,
    voidTask: voidTask,
    restoreTask: restoreTask,
    markReassigned: markReassigned,
    setHrFinal: setHrFinal,
    adoptedScore: adoptedScore,
    editPlan: editPlan,
    importEvaluators: importEvaluators,
    setEvaluator: setEvaluator,
    readTask: readTask,
    planOf: planOf,
    saveEval: saveEval
  };
})();
