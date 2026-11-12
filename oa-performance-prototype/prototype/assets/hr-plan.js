/**

 * HR · 考核计划管理（列表 / 新建 / 明细）

 * 参与范围：范围包 + 组织树 + 职级/岗位筛选（见 docs/GRILL_HR_SCOPE.md）

 */

(function () {

  'use strict';



  var CREATE_STEPS = [

    { id: 1, name: '类型与周期', desc: '月/季 · 唯一周期' },

    { id: 2, name: '参与范围', desc: '范围包 · 组织树' },

    { id: 3, name: '开放时间', desc: '启动 · 截止 · 评截止' },

    { id: 4, name: '模板匹配', desc: '范围包 → 模板' },

    { id: 5, name: '确认发放', desc: '勾选发放' },

  ];



  var LEVELS_ENUM = ['总监', '经理', '主管', '职员'];



  var TEMPLATES = [

    { id: 't-m-mgr', name: '月度 V1.2 · 总监经理版', type: 'month' },

    { id: 't-m-staff', name: '月度 V1.2 · 主管职员版', type: 'month' },

    { id: 't-q-mgr', name: '季度 V1.2 · 副总总监经理版', type: 'quarter' },

    { id: 't-q-staff', name: '季度 V1.2 · 主管职员版', type: 'quarter' },

  ];



  var ROSTER = {};



  var ORG_TREE = {

    id: 'root',

    name: '6Q集团',

    type: 'org',

    children: [

      {

        id: 'dept-info',

        name: '信息部',

        type: 'dept',

        children: [

          { id: 'p-zm', type: 'person' },

          { id: 'p-wf', type: 'person' },

          { id: 'p-lq', type: 'person' },

          { id: 'p-xy', type: 'person' },

        ],

      },

      {

        id: 'dept-hr',

        name: '人才开发部',

        type: 'dept',

        children: [{ id: 'p-ly', type: 'person' }, { id: 'p-hx', type: 'person' }],

      },

      {

        id: 'dept-admin',

        name: '行政管理部',

        type: 'dept',

        children: [{ id: 'p-zt', type: 'person' }],

      },

      {

        id: 'dept-gz',

        name: '广州办事处',

        type: 'dept',

        children: [{ id: 'p-zmn', type: 'person' }, { id: 'p-cw', type: 'person' }, { id: 'p-sun', type: 'person' }],

      },

      {

        id: 'dept-sz',

        name: '深圳办事处',

        type: 'dept',

        children: [{ id: 'p-wl', type: 'person' }, { id: 'p-ma', type: 'person' }],

      },

    ],

  };



  (function seedRoster() {

    var rows = [

      { id: 'p-zm', name: '张明', no: 'E10021', deptId: 'dept-info', role: '产品经理', level: '主管', audience: '全职员工' },

      { id: 'p-wf', name: '王芳', no: 'E10035', deptId: 'dept-info', role: '前端工程师', level: '职员', audience: '全职员工' },

      { id: 'p-lq', name: '李强', no: 'E10008', deptId: 'dept-info', role: '技术总监', level: '总监', audience: '全职员工' },

      { id: 'p-xy', name: '肖洋', no: 'E10044', deptId: 'dept-info', role: '后端工程师', level: '职员', audience: '全职员工' },

      { id: 'p-ly', name: '刘洋', no: 'E10042', deptId: 'dept-hr', role: 'HR专员', level: '职员', audience: '全职员工' },

      { id: 'p-hx', name: '何欣', no: 'E10048', deptId: 'dept-hr', role: 'HR经理', level: '经理', audience: '全职员工' },

      { id: 'p-zt', name: '周婷', no: 'E10055', deptId: 'dept-admin', role: '行政经理', level: '经理', audience: '全职员工' },

      { id: 'p-zmn', name: '赵敏', no: 'E20011', deptId: 'dept-gz', role: '办事处主任', level: '经理', audience: '办事处' },

      { id: 'p-cw', name: '陈伟', no: 'E20015', deptId: 'dept-gz', role: '课程顾问', level: '职员', audience: '办事处' },

      { id: 'p-sun', name: '孙丽', no: 'E20018', deptId: 'dept-gz', role: '办事处主管', level: '主管', audience: '办事处' },

      { id: 'p-wl', name: '吴磊', no: 'E20022', deptId: 'dept-sz', role: '办事处主管', level: '主管', audience: '办事处' },

      { id: 'p-ma', name: '马军', no: 'E20025', deptId: 'dept-sz', role: '课程顾问', level: '职员', audience: '办事处' },

    ];

    rows.forEach(function (r) { ROSTER[r.id] = r; });

  })();



  var MOCK_EMPLOYEES = [
    { scopeId: 'sp1', name: '张明', no: 'E10021', org: '信息部', role: '产品经理', level: '主管', audience: '全职员工', template: '月度·主管职员', status: '已提交', submit: '2026-05-29 17:20' },
    { scopeId: 'sp1', name: '王芳', no: 'E10035', org: '信息部', role: '前端工程师', level: '职员', audience: '全职员工', template: '月度·主管职员', status: '填写中', submit: '—' },
    { scopeId: 'sp1', name: '李强', no: 'E10008', org: '信息部', role: '技术总监', level: '总监', audience: '全职员工', template: '月度·总监经理', status: '已提交', submit: '2026-05-28 11:05' },
    { scopeId: 'sp1', name: '肖洋', no: 'E10044', org: '信息部', role: '后端工程师', level: '职员', audience: '全职员工', template: '月度·主管职员', status: '未开始', submit: '—' },
    { scopeId: 'sp2', name: '赵敏', no: 'E20011', org: '广州办事处', role: '办事处主任', level: '经理', audience: '办事处', template: '月度·总监经理', status: '已提交', submit: '2026-05-30 09:40' },
    { scopeId: 'sp2', name: '陈伟', no: 'E20015', org: '广州办事处', role: '课程顾问', level: '职员', audience: '办事处', template: '月度·主管职员', status: '填写中', submit: '—' },
    { scopeId: 'sp2', name: '孙丽', no: 'E20018', org: '广州办事处', role: '办事处主管', level: '主管', audience: '办事处', template: '月度·主管职员', status: '已提交', submit: '2026-05-27 16:30' },
    { scopeId: 'sp2', name: '刘洋', no: 'E10042', org: '人才开发部', role: 'HR专员', level: '职员', audience: '全职员工', template: '月度·主管职员', status: '已逾期', submit: '—' },
    { scopeId: 'sp2', name: '周婷', no: 'E10055', org: '行政管理部', role: '行政经理', level: '经理', audience: '全职员工', template: '月度·总监经理', status: '已提交', submit: '2026-05-27 14:18' },
    { scopeId: 'sp2', name: '吴磊', no: 'E20022', org: '深圳办事处', role: '办事处主管', level: '主管', audience: '办事处', template: '月度·主管职员', status: '未开始', submit: '—' },
    { scopeId: 'sp2', name: '马军', no: 'E20025', org: '深圳办事处', role: '课程顾问', level: '职员', audience: '办事处', template: '月度·主管职员', status: '填写中', submit: '—' },
    { scopeId: 'sp2', name: '何欣', no: 'E10048', org: '人才开发部', role: 'HR经理', level: '经理', audience: '全职员工', template: '月度·总监经理', status: '已提交', submit: '2026-05-26 10:00' },
  ];



  var detailPlanId = '2026-05';

  var detailSelected = {};



  var DETAIL_SCOPE_PACKS = [

    { id: 'sp1', name: '信息部-核心岗', templateId: 't-m-staff', memberIds: ['p-zm', 'p-wf', 'p-lq', 'p-xy'], status: 'issued', usedBy: ['2026-05', '2026-Q2'] },

    { id: 'sp2', name: '办事处+职能', templateId: 't-m-mgr', memberIds: ['p-zmn', 'p-cw', 'p-sun', 'p-ly', 'p-zt', 'p-wl', 'p-ma', 'p-hx'], status: 'issued', usedBy: ['2026-05'] },

  ];



  var ORGS = ['全部', '信息部', '人才开发部', '行政管理部', '广州办事处', '深圳办事处'];

  var LEVELS = ['全部', '总监', '经理', '主管', '职员'];

  var STATUSES = ['全部', '未开始', '填写中', '已提交', '已逾期', '待上级评价', '已完成', '已失效'];



  var deptNameMap = {

    'dept-info': '信息部',

    'dept-hr': '人才开发部',

    'dept-admin': '行政管理部',

    'dept-gz': '广州办事处',

    'dept-sz': '深圳办事处',

  };



  function statusTag(s) {

    var map = {

      '未开始': 'q-tag',

      '填写中': 'q-tag q-tag-blue',

      '已提交': 'q-tag q-tag-green',

      '已逾期': 'q-tag q-tag-orange',

      '待上级评价': 'q-tag q-tag-blue',

      '已完成': 'q-tag q-tag-green',

      '已失效': 'q-tag q-tag-red',

    };

    return '<span class="' + (map[s] || 'q-tag') + '">' + s + '</span>';

  }



  function scopeStatusTag(st) {

    return st === 'issued'

      ? '<span class="q-tag q-tag-green">已发放</span>'

      : '<span class="q-tag">未发放</span>';

  }



  function templateName(id) {

    var t = TEMPLATES.filter(function (x) { return x.id === id; })[0];

    return t ? t.name : '—';

  }



  function nextScopeDefaultName(packs) {

    return '范围' + (packs.length + 1);

  }



  function createScopePack(packs) {

    return {

      id: 'sp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),

      name: nextScopeDefaultName(packs),

      memberIds: [],

      templateId: '',

      status: 'draft',

    };

  }



  function findPersonScope(packs, personId, excludeScopeId) {

    for (var i = 0; i < packs.length; i++) {

      var p = packs[i];

      if (excludeScopeId && p.id === excludeScopeId) continue;

      if (p.memberIds.indexOf(personId) >= 0) return p;

    }

    return null;

  }



  function personTaken(packs, personId, activeScopeId) {

    return !!findPersonScope(packs, personId, activeScopeId);

  }



  function personMatchesFilter(person, filterLevels, jobKw, searchKw) {

    if (filterLevels.length && filterLevels.indexOf(person.level) < 0) return false;

    if (jobKw && person.role.indexOf(jobKw) < 0) return false;

    if (searchKw) {

      var dept = deptNameMap[person.deptId] || '';

      if ((person.name + person.no + dept + person.role).indexOf(searchKw) < 0) return false;

    }

    return true;

  }



  function collectDeptPersonIds(node) {

    var ids = [];

    if (!node.children) return ids;

    node.children.forEach(function (ch) {

      if (ch.type === 'person') ids.push(ch.id);

      else ids = ids.concat(collectDeptPersonIds(ch));

    });

    return ids;

  }



  function deptCheckboxState(node, packs, activeScope, filterLevels, jobKw, searchKw) {

    var ids = collectDeptPersonIds(node).filter(function (pid) {

      var person = ROSTER[pid];

      return person && personMatchesFilter(person, filterLevels, jobKw, searchKw);

    });

    if (!ids.length) return { checked: false, indeterminate: false, selectable: [] };



    var selectable = ids.filter(function (pid) {

      return !personTaken(packs, pid, activeScope ? activeScope.id : null);

    });

    var inActive = selectable.filter(function (pid) {

      return activeScope && activeScope.memberIds.indexOf(pid) >= 0;

    });

    return {

      checked: selectable.length > 0 && inActive.length === selectable.length,

      indeterminate: inActive.length > 0 && inActive.length < selectable.length,

      selectable: selectable,

    };

  }



  function togglePersonInScope(packs, activeScopeId, personId, add) {

    var scope = packs.filter(function (s) { return s.id === activeScopeId; })[0];

    if (!scope || scope.status === 'issued') return;

    var idx = scope.memberIds.indexOf(personId);

    if (add && idx < 0) scope.memberIds.push(personId);

    if (!add && idx >= 0) scope.memberIds.splice(idx, 1);

    if (add && window.PerfHrStore && PerfHrStore.markReassigned && ROSTER[personId]) {
      PerfHrStore.markReassigned(detailPlanId, ROSTER[personId].no, scope.id, scope.name);
    }

  }



  function findDeptNode(node, deptId) {

    if (node.id === deptId) return node;

    if (!node.children) return null;

    for (var i = 0; i < node.children.length; i++) {

      var ch = node.children[i];

      if (ch.type === 'dept') {

        var found = findDeptNode(ch, deptId);

        if (found) return found;

      }

    }

    return null;

  }



  function renderOrgTree(node, state, locked, depth) {

    if (node.type === 'person') return '';

    var packs = state.scopePacks;

    var active = packs.filter(function (s) { return s.id === state.activeScopeId; })[0];

    var html = '';

    var pad = depth * 14;



    if (node.type === 'dept' || node.type === 'org') {

      var cbState = deptCheckboxState(node, packs, active, state.filterLevels, state.filterJobKw, state.searchKw);

      var hasVisible = node.type === 'org' || node.children.some(function (ch) {

        if (ch.type === 'person') {

          var p = ROSTER[ch.id];

          return p && personMatchesFilter(p, state.filterLevels, state.filterJobKw, state.searchKw);

        }

        return true;

      });

      if (node.type === 'dept' && !hasVisible) return '';



      html += '<div class="hr-tree-dept" style="padding-left:' + pad + 'px">' +

        '<label class="hr-tree-dept-label' + (locked || !active ? ' is-disabled' : '') + '">' +

        (node.type === 'dept'

          ? '<input type="checkbox" class="dept-cb" data-dept="' + node.id + '" ' +

            (cbState.checked ? 'checked' : '') +

            (cbState.indeterminate ? ' data-indeterminate="1"' : '') +

            (locked || !active || !cbState.selectable.length ? ' disabled' : '') + ' />'

          : '<span style="width:16px;display:inline-block"></span>') +

        '<b>' + node.name + '</b>' +

        '</label>' +

        '<div class="hr-tree-children">';



      node.children.forEach(function (ch) {

        if (ch.type === 'person') {

          var person = ROSTER[ch.id];

          if (!person || !personMatchesFilter(person, state.filterLevels, state.filterJobKw, state.searchKw)) return;

          var taken = personTaken(packs, ch.id, active ? active.id : null);

          var inScope = active && active.memberIds.indexOf(ch.id) >= 0;

          var disabled = taken || locked || !active;

          var owner = findPersonScope(packs, ch.id, active ? active.id : null);

          html += '<label class="hr-tree-person' + (disabled && !inScope ? ' is-disabled' : '') + '" style="padding-left:' + (pad + 22) + 'px">' +

            '<input type="checkbox" data-person="' + ch.id + '" ' +

            (inScope ? 'checked' : '') + (disabled && !inScope ? ' disabled' : '') + ' />' +

            '<span>' + person.name + '</span>' +

            '<span class="muted">' + person.level + ' · ' + person.role + '</span>' +

            (taken && owner ? '<span class="hr-person-note">已在「' + owner.name + '」</span>' : '') +

            '</label>';

        } else {

          html += renderOrgTree(ch, state, locked, depth + 1);

        }

      });



      html += '</div></div>';

    }

    return html;

  }



  function renderScopePickerHTML(state, readonly) {

    var packs = state.scopePacks;

    var active = packs.filter(function (s) { return s.id === state.activeScopeId; })[0];

    var activeLocked = active && active.status === 'issued';



    var packList = packs.map(function (sp) {

      var cls = sp.id === state.activeScopeId ? 'hr-scope-item is-active' : 'hr-scope-item';

      var lock = sp.status === 'issued' ? ' <span class="q-tag q-tag-green" style="font-size:11px">已发放</span>' : '';

      return '<li class="' + cls + '" data-scope-id="' + sp.id + '">' +

        '<div class="hr-scope-item-head">' +

        '<span class="hr-scope-item-name">' + sp.name + '</span>' + lock +

        '</div>' +

        '<div class="hr-scope-item-meta">' + sp.memberIds.length + ' 人</div>' +

        (!readonly && sp.status !== 'issued' && packs.length > 1

          ? '<button type="button" class="hr-scope-del" data-del-scope="' + sp.id + '">×</button>'

          : '') +

        '</li>';

    }).join('');



    var levelChecks = LEVELS_ENUM.map(function (lv) {

      var on = state.filterLevels.indexOf(lv) >= 0;

      return '<label class="hr-filter-chip' + (on ? ' is-on' : '') + '">' +

        '<input type="checkbox" data-level="' + lv + '" ' + (on ? 'checked' : '') + (readonly ? ' disabled' : '') + ' /> ' + lv +

        '</label>';

    }).join('');



    var treeHtml = renderOrgTree(ORG_TREE, state, readonly || activeLocked, 0);



    var filteredPeople = Object.keys(ROSTER).map(function (id) { return ROSTER[id]; }).filter(function (p) {

      return personMatchesFilter(p, state.filterLevels, state.filterJobKw, state.searchKw);

    });



    var listRows = filteredPeople.map(function (p) {

      var taken = personTaken(packs, p.id, active ? active.id : null);

      var inScope = active && active.memberIds.indexOf(p.id) >= 0;

      var disabled = taken || activeLocked || !active || readonly;

      var owner = findPersonScope(packs, p.id, active ? active.id : null);

      var note = taken && owner ? '已在「' + owner.name + '」' : '';

      return '<label class="hr-person-row' + (disabled && !inScope ? ' is-disabled' : '') + '">' +

        '<input type="checkbox" data-person="' + p.id + '" ' +

        (inScope ? 'checked' : '') + (disabled && !inScope ? ' disabled' : '') + ' />' +

        '<span class="hr-person-main"><b>' + p.name + '</b> <span class="muted">' + p.no + '</span></span>' +

        '<span class="hr-person-sub">' + (deptNameMap[p.deptId] || '') + ' · ' + p.level + ' · ' + p.role + '</span>' +

        (note ? '<span class="hr-person-note">' + note + '</span>' : '') +

        '</label>';

    }).join('');



    return '<div class="hr-scope-picker">' +

      '<div class="hr-scope-col hr-scope-col-packs">' +

      '<div class="hr-scope-col-title">范围包</div>' +

      '<ul class="hr-scope-list">' + packList + '</ul>' +

      (!readonly ? '<button type="button" class="q-btn hr-scope-add" id="btn-add-scope">+ 新增范围</button>' : '') +

      '<p class="hr-scope-tip">选中范围包后点击名称可自定义；一人仅属一个范围包，已在其他包的人不可选。</p>' +

      '</div>' +

      '<div class="hr-scope-col hr-scope-col-tree">' +

      '<div class="hr-scope-col-title">组织树</div>' +

      '<div class="hr-scope-search">' +

      '<input type="search" id="scope-search" placeholder="姓名 / 工号 / 部门" value="' + (state.searchKw || '') + '" ' + (readonly ? 'disabled' : '') + ' />' +

      '</div>' +

      '<div class="hr-scope-filters"><span class="lbl">职级</span>' + levelChecks + '</div>' +

      '<div class="hr-scope-filters"><span class="lbl">岗位</span>' +

      '<input type="search" id="scope-job-kw" placeholder="岗位关键字" value="' + (state.filterJobKw || '') + '" ' + (readonly ? 'disabled' : '') + ' style="flex:1" /></div>' +

      (activeLocked ? '<p class="hr-hint" style="margin:8px 0">当前范围包已发放，人选已锁定。补发请新建范围包。</p>' : '') +

      (!active ? '<p class="hr-hint" style="margin:8px 0">请先选择或新建范围包。</p>' : '') +

      '<div class="hr-org-tree" id="hr-org-tree">' + treeHtml + '</div>' +

      '</div>' +

      '<div class="hr-scope-col hr-scope-col-list">' +

      '<div class="hr-scope-col-title">符合条件 <span class="muted">(' + filteredPeople.length + ')</span></div>' +

      '<div class="hr-person-list">' + (listRows || '<p class="muted" style="padding:12px">无匹配人员</p>') + '</div>' +

      '</div></div>';

  }



  function bindScopePickerEvents(container, state, onChange, readonly) {

    if (!container) return;



    container.querySelectorAll('.hr-scope-item').forEach(function (el) {

      el.addEventListener('click', function (e) {

        if (e.target.closest('[data-del-scope]')) return;

        state.activeScopeId = el.dataset.scopeId;

        onChange();

      });

    });



    var addBtn = container.querySelector('#btn-add-scope');

    if (addBtn) {

      addBtn.addEventListener('click', function () {

        var sp = createScopePack(state.scopePacks);

        state.scopePacks.push(sp);

        state.activeScopeId = sp.id;

        onChange();

      });

    }



    container.querySelectorAll('[data-del-scope]').forEach(function (btn) {

      btn.addEventListener('click', function (e) {

        e.stopPropagation();

        var id = btn.dataset.delScope;

        state.scopePacks = state.scopePacks.filter(function (s) { return s.id !== id; });

        if (state.activeScopeId === id) {

          state.activeScopeId = state.scopePacks.length ? state.scopePacks[0].id : null;

        }

        onChange();

      });

    });



    var renameTarget = container.querySelector('.hr-scope-item.is-active .hr-scope-item-name');

    if (renameTarget && !readonly) {

      renameTarget.setAttribute('contenteditable', 'true');

      renameTarget.setAttribute('title', '点击可修改范围包名称');

      renameTarget.addEventListener('mousedown', function (e) { e.stopPropagation(); });

      renameTarget.addEventListener('click', function (e) { e.stopPropagation(); });

      renameTarget.addEventListener('blur', function () {

        var active = state.scopePacks.filter(function (s) { return s.id === state.activeScopeId; })[0];

        if (active) active.name = renameTarget.textContent.trim() || active.name;

      });

      renameTarget.addEventListener('keydown', function (e) {

        if (e.key === 'Enter') { e.preventDefault(); renameTarget.blur(); }

      });

    }



    if (readonly) return;



    var searchEl = container.querySelector('#scope-search');

    if (searchEl) {

      searchEl.addEventListener('input', function () {

        state.searchKw = searchEl.value.trim();

        onChange();

      });

    }



    var jobEl = container.querySelector('#scope-job-kw');

    if (jobEl) {

      jobEl.addEventListener('input', function () {

        state.filterJobKw = jobEl.value.trim();

        onChange();

      });

    }



    container.querySelectorAll('[data-level]').forEach(function (cb) {

      cb.addEventListener('change', function () {

        var lv = cb.dataset.level;

        var i = state.filterLevels.indexOf(lv);

        if (cb.checked && i < 0) state.filterLevels.push(lv);

        if (!cb.checked && i >= 0) state.filterLevels.splice(i, 1);

        onChange();

      });

    });



    container.querySelectorAll('[data-person]').forEach(function (cb) {

      cb.addEventListener('change', function () {

        togglePersonInScope(state.scopePacks, state.activeScopeId, cb.dataset.person, cb.checked);

        onChange();

      });

    });



    container.querySelectorAll('.dept-cb').forEach(function (cb) {

      if (cb.dataset.indeterminate === '1') cb.indeterminate = true;

      cb.addEventListener('change', function () {

        var deptNode = findDeptNode(ORG_TREE, cb.dataset.dept);

        if (!deptNode) return;

        var ids = collectDeptPersonIds(deptNode).filter(function (pid) {

          var person = ROSTER[pid];

          return person && personMatchesFilter(person, state.filterLevels, state.filterJobKw, state.searchKw) &&

            !personTaken(state.scopePacks, pid, state.activeScopeId);

        });

        ids.forEach(function (pid) { togglePersonInScope(state.scopePacks, state.activeScopeId, pid, cb.checked); });

        onChange();

      });

    });

  }



  function mountScopePicker(mount, state, readonly) {

    function refresh() {

      mount.innerHTML = renderScopePickerHTML(state, readonly);

      bindScopePickerEvents(mount, state, refresh, readonly);

    }

    refresh();

  }



  function totalAssigned(packs) {

    var n = 0;

    packs.forEach(function (sp) { n += sp.memberIds.length; });

    return n;

  }



  function renderCreateStepper(step) {

    var el = document.getElementById('hr-create-stepper');

    if (!el) return;

    var blocks = CREATE_STEPS.map(function (s) {

      var cls = 'step-block';

      if (s.id === step) cls += ' is-active';

      else if (s.id < step) cls += ' is-done';

      else cls += ' is-pending';

      return '<div class="' + cls + '" data-goto="' + s.id + '">' +

        '<div class="step-block-head">' +

        '<span class="step-block-num">' + s.id + '</span>' +

        '<span class="step-block-name">' + s.name + '</span></div>' +

        '<div class="step-block-desc">' + s.desc + '</div></div>';

    }).join('');

    el.innerHTML = '<div class="stepper-blocks hr-create-blocks">' + blocks + '</div>';

    el.querySelectorAll('[data-goto]').forEach(function (b) {

      b.addEventListener('click', function () {

        window.__hrCreateGoStep(+b.dataset.goto);

      });

    });

  }



  function initCreateWizard() {

    var step = 1;

    var wizardState = {

      scopePacks: [createScopePack([])],

      activeScopeId: null,

      filterLevels: [],

      filterJobKw: '',

      searchKw: '',

      issueSelected: {},
      bonusRankingEnabled: true,

    };

    wizardState.activeScopeId = wizardState.scopePacks[0].id;



    function renderCreateStep(s) {

      step = s;

      renderCreateStepper(step);

      var body = document.getElementById('hr-create-body');

      var btnPrev = document.getElementById('hr-btn-prev');

      var btnNext = document.getElementById('hr-btn-next');

      if (!body) return;



      if (step === 1) {

        body.innerHTML =

          '<div class="hr-form-grid">' +

          '<div class="hr-field"><label>考核类型</label>' +

          '<select id="f-type"><option value="month">月度绩效</option><option value="quarter">季度绩效</option></select></div>' +

          '<div class="hr-field"><label>考核年度</label><input type="number" id="f-year" value="2026" /></div>' +

          '<div class="hr-field" id="f-month-wrap"><label>考核月份</label>' +

          '<select id="f-month"><option>5</option><option>6</option><option>7</option></select></div>' +

          '<div class="hr-field" id="f-quarter-wrap" style="display:none"><label>考核季度</label>' +

          '<select id="f-quarter"><option>Q2</option><option>Q3</option></select></div></div>' +

          '<p class="hr-hint">同一周期全公司仅允许 <b>1 条</b> 计划。参与人员通过 <b>范围包</b> 指定，未划入范围包的人不参与。</p>';

        document.getElementById('f-type').addEventListener('change', function (e) {

          var q = e.target.value === 'quarter';

          document.getElementById('f-month-wrap').style.display = q ? 'none' : '';

          document.getElementById('f-quarter-wrap').style.display = q ? '' : 'none';

        });

      } else if (step === 2) {

        body.innerHTML =

          '<p class="hr-section-label">参与范围 · 组织树勾选</p>' +

          '<p class="hr-hint" style="margin-top:0">全集团组织树；勾部门级联全选；职级/岗位筛选辅助圈人。已占用人员禁用。</p>' +

          '<div id="hr-scope-picker-mount"></div>';

        mountScopePicker(document.getElementById('hr-scope-picker-mount'), wizardState, false);

      } else if (step === 3) {

        body.innerHTML =

          '<div class="hr-form-grid">' +

          '<div class="hr-field"><label>计划启动时间</label><input type="datetime-local" value="2026-05-01T08:00" /></div>' +

          '<div class="hr-field"><label>员工填写截止</label><input type="datetime-local" value="2026-06-05T18:00" /></div>' +

          '<div class="hr-field"><label>上级评分截止</label><input type="datetime-local" value="2026-06-10T18:00" /></div>' +

          '<div class="hr-field"><label>确认评分截止</label><input type="datetime-local" id="f-confirm-deadline" value="2026-06-15T18:00" /></div>' +

          '<p class="hr-hint" style="margin-top:0">员工与直接上级共用同一确认截止；超时仅催办，未双方确认则阻塞奖金结算。</p>' +

          '<div class="hr-field hr-field-full"><label>奖金规则（按职级自动匹配）</label>' +

          '<div id="f-bonus-level-panel"></div>' +

          '<span class="field-hint"><a href="hr-bonus-rules-list.html" target="_blank">管理奖金规则</a> · 各职级独立配置；同职级不可重复启用</span></div></div>';

        if (typeof renderPlanBonusLevelPanel === 'function') {

          renderPlanBonusLevelPanel('f-bonus-level-panel', 'month');

        }

      } else if (step === 4) {

        var rows = wizardState.scopePacks.map(function (sp) {

          var opts = TEMPLATES.filter(function (t) { return t.type === 'month'; }).map(function (t) {

            return '<option value="' + t.id + '" ' + (sp.templateId === t.id ? 'selected' : '') + '>' + t.name + '</option>';

          }).join('');

          return '<tr><td><b>' + sp.name + '</b></td><td>' + sp.memberIds.length + '</td>' +

            '<td><select class="tpl-select" data-scope="' + sp.id + '"' + (sp.status === 'issued' ? ' disabled' : '') + '>' +

            '<option value="">请选择模板</option>' + opts + '</select></td>' +

            '<td class="muted">' + (sp.templateId ? templateName(sp.templateId) : '—') + '</td></tr>';

        }).join('');

        body.innerHTML =

          '<p class="hr-hint">每个范围包绑定 <b>一张</b> 模板；系统不自动按人群×职级匹配。</p>' +

          '<div class="q-table-wrap"><table class="q-table">' +

          '<thead><tr><th>范围包</th><th>人数</th><th>选择模板</th><th>预览</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +

          '<p class="hr-hint" style="margin-top:12px">已分配 <b>' + totalAssigned(wizardState.scopePacks) + '</b> 人 · ' +

          wizardState.scopePacks.length + ' 个范围包</p>';

        body.querySelectorAll('.tpl-select').forEach(function (sel) {

          sel.addEventListener('change', function () {

            var sp = wizardState.scopePacks.filter(function (x) { return x.id === sel.dataset.scope; })[0];

            if (sp && sp.status !== 'issued') sp.templateId = sel.value;

          });

        });

      } else {

        var packRows = wizardState.scopePacks.map(function (sp) {

          var canIssue = sp.memberIds.length > 0 && sp.templateId && sp.status !== 'issued';

          if (canIssue && wizardState.issueSelected[sp.id] === undefined) wizardState.issueSelected[sp.id] = true;

          var checked = canIssue && wizardState.issueSelected[sp.id];

          return '<tr><td>' + (canIssue

            ? '<input type="checkbox" class="issue-cb" data-scope="' + sp.id + '" ' + (checked ? 'checked' : '') + ' />'

            : '—') + '</td><td><b>' + sp.name + '</b></td><td>' + sp.memberIds.length + '</td>' +

            '<td>' + (sp.templateId ? templateName(sp.templateId) : '<span class="muted">未选模板</span>') + '</td>' +

            '<td>' + scopeStatusTag(sp.status) + '</td></tr>';

        }).join('');

        body.innerHTML =

          '<div class="hr-summary">' +

          '<div class="hr-summary-row"><span>计划名称</span><b>2026年5月 · 月度绩效考核</b></div>' +

          '<div class="hr-summary-row"><span>考核类型</span><b>月度 · 2026-05</b></div>' +

          '<div class="hr-summary-row"><span>范围包</span><b>' + wizardState.scopePacks.length + ' 个 · 共 ' + totalAssigned(wizardState.scopePacks) + ' 人</b></div>' +

          '<div class="hr-summary-row"><span>奖金规则</span><b>按职级自动匹配（' +

          (typeof getHrBonusRulesByLevel === 'function'

            ? getHrBonusRulesByLevel('month').filter(function (x) { return x.rule; }).length

            : 4) + ' 个职级已配置）</b></div>' +

          '<div class="hr-summary-row"><span>开放时间</span><b>05-01 08:00 ~ 06-05 18:00</b></div>' +

          '<div class="hr-summary-row"><span>确认评分截止</span><b>06-15 18:00</b>（员工+上级共用）</div></div>' +

          '<p class="hr-section-label" style="margin-top:16px">勾选要发放的范围包</p>' +

          '<div class="q-table-wrap"><table class="q-table">' +

          '<thead><tr><th style="width:48px">发放</th><th>范围包</th><th>人数</th><th>模板</th><th>状态</th></tr></thead>' +

          '<tbody>' + packRows + '</tbody></table></div>' +

          '<p class="hr-hint">未勾选的范围包仅保存配置，可在计划详情中后续发放或新建范围包补发。</p>';

        body.querySelectorAll('.issue-cb').forEach(function (cb) {

          cb.addEventListener('change', function () {

            wizardState.issueSelected[cb.dataset.scope] = cb.checked;

          });

        });

      }



      if (btnPrev) btnPrev.disabled = step === 1;

      if (btnNext) btnNext.textContent = step === 5 ? '发放选中并保存' : '下一步';

    }



    window.__hrCreateGoStep = function (n) { renderCreateStep(n); };

    renderCreateStep(step);



    document.getElementById('hr-btn-prev').addEventListener('click', function () {

      if (step > 1) renderCreateStep(step - 1);

    });

    document.getElementById('hr-btn-next').addEventListener('click', function () {

      if (step === 5) {

        var issued = [];

        wizardState.scopePacks.forEach(function (sp) {

          if (sp.status !== 'issued' && wizardState.issueSelected[sp.id] && sp.memberIds.length && sp.templateId) {

            sp.status = 'issued';

            issued.push(sp.name);

          }

        });

        alert(issued.length

          ? '已发放范围包：' + issued.join('、') + '\n计划已保存，跳转明细。'

          : '未勾选可发放的范围包，计划已保存为草稿。');

        location.href = 'hr-plan-detail.html?plan=2026-05';

        return;

      }

      renderCreateStep(step + 1);

    });

  }



  function renderDetailScopeSection(packs, onRefresh) {

    var el = document.getElementById('hr-detail-scopes');

    if (!el) return;



    var rows = packs.map(function (sp) {

      return '<tr data-scope-id="' + sp.id + '"><td><span class="hr-scope-pack-name" contenteditable="true" title="点击修改范围包名称">' + sp.name + '</span></td><td>' + sp.memberIds.length + '</td>' +

        '<td>' + (sp.templateId ? templateName(sp.templateId) : '—') + '</td><td>' + scopeStatusTag(sp.status) + '</td><td>' +

        (sp.status !== 'issued' && sp.memberIds.length && sp.templateId

          ? '<button type="button" class="q-btn q-btn-primary btn-issue-scope" data-id="' + sp.id + '">发放待办</button>'

          : sp.status === 'issued' ? '<span class="muted">已锁定</span>' : '<span class="muted">待配置</span>') +

        '</td></tr>';

    }).join('');



    el.innerHTML =

      '<div class="q-card-panel" style="margin-bottom:16px">' +

      '<div style="display:flex;align-items:center;margin-bottom:12px">' +

      '<h3 style="margin:0;font-size:15px;flex:1">范围包</h3>' +

      '<button type="button" class="q-btn" id="btn-detail-add-scope">+ 新增范围（补发）</button></div>' +

      '<div class="q-table-wrap"><table class="q-table">' +

      '<thead><tr><th>名称</th><th>人数</th><th>模板</th><th>状态</th><th>操作</th></tr></thead>' +

      '<tbody>' + rows + '</tbody></table></div>' +

      '<div id="hr-detail-scope-editor" style="display:none;margin-top:16px"></div></div>';



    el.querySelectorAll('.btn-issue-scope').forEach(function (btn) {

      btn.addEventListener('click', function () {

        var sp = packs.filter(function (x) { return x.id === btn.dataset.id; })[0];

        if (sp) { sp.status = 'issued'; alert('「' + sp.name + '」已发放待办（原型）'); onRefresh(); }

      });

    });



    el.querySelectorAll('.hr-scope-pack-name').forEach(function (nameEl) {

      var tr = nameEl.closest('tr');

      var scopeId = tr && tr.dataset.scopeId;

      nameEl.addEventListener('blur', function () {

        var sp = packs.filter(function (x) { return x.id === scopeId; })[0];

        if (!sp) return;

        var next = nameEl.textContent.trim();

        if (next) sp.name = next;

        nameEl.textContent = sp.name;

        onRefresh();

      });

      nameEl.addEventListener('keydown', function (e) {

        if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }

      });

    });



    el.querySelector('#btn-detail-add-scope').addEventListener('click', function () {

      var editor = el.querySelector('#hr-detail-scope-editor');

      var btn = el.querySelector('#btn-detail-add-scope');

      if (editor.style.display !== 'none') {

        editor.style.display = 'none';

        btn.textContent = '+ 新增范围（补发）';

        return;

      }

      var sp = createScopePack(packs);

      sp.templateId = 't-m-staff';

      packs.push(sp);

      var detailState = { scopePacks: packs, activeScopeId: sp.id, filterLevels: [], filterJobKw: '', searchKw: '' };

      editor.style.display = 'block';

      btn.textContent = '收起编辑器';

      mountScopePicker(editor, detailState, false);

    });

  }



  function renderTransferOrgTree(node, depth, searchKw, selectedId) {
    if (!node) return '';
    var kw = (searchKw || '').trim().toLowerCase();
    var pad = (depth || 0) * 14;
    var html = '';

    if (node.type === 'dept' || node.type === 'org') {
      var childHtml = '';
      (node.children || []).forEach(function (ch) {
        childHtml += renderTransferOrgTree(ch, depth + 1, searchKw, selectedId);
      });
      if (node.type === 'org' || childHtml) {
        html += '<div class="hr-tree-dept" style="padding-left:' + pad + 'px"><b>' + node.name + '</b><div class="hr-tree-children">' + childHtml + '</div></div>';
      }
      return html;
    }

    if (node.type === 'person') {
      var person = ROSTER[node.id];
      if (!person) return '';
      if (kw && person.name.toLowerCase().indexOf(kw) === -1 && person.no.toLowerCase().indexOf(kw) === -1) return '';
      html += '<label class="hr-tree-person hr-transfer-person" style="padding-left:' + (pad + 22) + 'px">' +
        '<input type="radio" name="transfer-target" value="' + person.id + '" ' + (selectedId === person.id ? 'checked' : '') + ' />' +
        '<span>' + person.name + '</span>' +
        '<span class="muted">' + person.level + ' · ' + person.role + ' · ' + (deptNameMap[person.deptId] || '') + '</span>' +
        '</label>';
    }
    return html;
  }

  function ensureTransferModal() {
    var mask = document.getElementById('hr-transfer-modal-mask');
    if (mask) return mask;
    mask = document.createElement('div');
    mask.id = 'hr-transfer-modal-mask';
    mask.className = 'hr-transfer-modal-mask';
    mask.innerHTML =
      '<div class="hr-transfer-modal" role="dialog">' +
      '<div class="hr-transfer-modal__head"><h3>批量转办</h3><button type="button" class="hr-transfer-modal__close" aria-label="关闭">×</button></div>' +
      '<p class="hr-transfer-modal__hint" id="hr-transfer-hint"></p>' +
      '<div class="hr-scope-search"><input type="search" id="hr-transfer-search" placeholder="搜索姓名 / 工号…" /></div>' +
      '<div class="hr-transfer-modal__body"><div class="hr-scope-col hr-scope-col-tree" id="hr-transfer-tree"></div></div>' +
      '<div class="hr-transfer-modal__foot">' +
      '<button type="button" class="q-btn" id="hr-transfer-cancel">取消</button>' +
      '<button type="button" class="q-btn q-btn-primary" id="hr-transfer-confirm">确认转办</button></div></div>';
    document.body.appendChild(mask);
    mask.addEventListener('click', function (e) { if (e.target === mask) closeTransferModal(); });
    mask.querySelector('.hr-transfer-modal__close').addEventListener('click', closeTransferModal);
    mask.querySelector('#hr-transfer-cancel').addEventListener('click', closeTransferModal);
    return mask;
  }

  var transferModalState = { employees: [], selectedId: null };

  function closeTransferModal() {
    var mask = document.getElementById('hr-transfer-modal-mask');
    if (mask) mask.classList.remove('is-open');
    transferModalState = { employees: [], selectedId: null };
  }

  function refreshTransferTree() {
    var treeEl = document.getElementById('hr-transfer-tree');
    var searchEl = document.getElementById('hr-transfer-search');
    if (!treeEl) return;
    var kw = searchEl ? searchEl.value : '';
    treeEl.innerHTML = renderTransferOrgTree(ORG_TREE, 0, kw, transferModalState.selectedId);
    treeEl.querySelectorAll('input[name="transfer-target"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        transferModalState.selectedId = radio.value;
      });
    });
  }

  function openBatchTransferModal(employees) {
    if (!employees.length) return;
    var mask = ensureTransferModal();
    transferModalState = { employees: employees, selectedId: null };
    document.getElementById('hr-transfer-hint').textContent =
      '已选 ' + employees.length + ' 条待办：' + employees.map(function (e) { return e.name; }).join('、') + '。请从组织架构选择转办接收人。';
    var searchEl = document.getElementById('hr-transfer-search');
    if (searchEl) {
      searchEl.value = '';
      searchEl.oninput = refreshTransferTree;
    }
    document.getElementById('hr-transfer-confirm').onclick = function () {
      var targetId = transferModalState.selectedId || (mask.querySelector('input[name="transfer-target"]:checked') || {}).value;
      if (!targetId) { alert('请选择转办接收人'); return; }
      var target = ROSTER[targetId];
      if (!target) return;
      transferModalState.employees.forEach(function (emp) {
        var row = MOCK_EMPLOYEES.filter(function (e) { return e.no === emp.no; })[0];
        if (row) row.handlerName = target.name;
      });
      detailSelected = {};
      closeTransferModal();
      renderDetailTable();
      alert('已将 ' + employees.length + ' 条待办转办给「' + target.name + '」（原型）');
    };
    refreshTransferTree();
    mask.classList.add('is-open');
  }

  function isQuarterPlanId(planId) {
    return /Q/i.test(planId || detailPlanId || '');
  }

  function closeSixQ3jModal() {
    var mask = document.getElementById('hr-sixq3j-modal-mask');
    if (mask) mask.classList.remove('is-open');
  }

  function ensureSixQ3jModal() {
    var id = 'hr-sixq3j-modal-mask';
    if (document.getElementById(id)) return document.getElementById(id);
    var mask = document.createElement('div');
    mask.id = id;
    mask.className = 'hr-transfer-modal-mask';
    mask.innerHTML =
      '<div class="hr-transfer-modal" role="dialog" style="max-width:560px;width:92vw">' +
      '<div class="hr-transfer-modal__head"><h3>导入 6Q3J 客观分</h3>' +
      '<button type="button" class="hr-transfer-modal__close" aria-label="关闭">×</button></div>' +
      '<p class="hr-transfer-modal__hint">CSV 列：工号, 1368认证, 文化经句, AI提效 · 空列不更新（可分批导入）</p>' +
      '<div class="hr-transfer-modal__body" style="max-height:none">' +
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">' +
      '<button type="button" class="q-btn" id="sixq3j-dl-template">下载模板</button>' +
      '<label class="q-btn" style="cursor:pointer">选择文件<input type="file" id="sixq3j-file" accept=".csv,.txt" hidden /></label>' +
      '</div>' +
      '<textarea id="sixq3j-paste" rows="8" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
      '<p id="sixq3j-import-result" class="hr-transfer-modal__hint" style="margin-top:8px"></p>' +
      '</div>' +
      '<div class="hr-transfer-modal__foot">' +
      '<button type="button" class="q-btn" id="sixq3j-cancel">取消</button>' +
      '<button type="button" class="q-btn q-btn-primary" id="sixq3j-confirm">确认导入</button>' +
      '</div></div>';
    document.body.appendChild(mask);
    mask.querySelector('.hr-transfer-modal__close').onclick = closeSixQ3jModal;
    mask.querySelector('#sixq3j-cancel').onclick = closeSixQ3jModal;
    mask.addEventListener('click', function (e) { if (e.target === mask) closeSixQ3jModal(); });
    return mask;
  }

  function openSixQ3jImportModal() {
    if (!window.PerfSixQ3J) { alert('6Q3J 模块未加载'); return; }
    var mask = ensureSixQ3jModal();
    var paste = document.getElementById('sixq3j-paste');
    var resultEl = document.getElementById('sixq3j-import-result');
    if (paste) paste.value = PerfSixQ3J.templateCsv();
    if (resultEl) resultEl.textContent = '';
    document.getElementById('sixq3j-dl-template').onclick = function () {
      var blob = new Blob(['\ufeff' + PerfSixQ3J.templateCsv()], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '6Q3J导入模板_' + detailPlanId + '.csv';
      a.click();
    };
    document.getElementById('sixq3j-file').onchange = function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () { if (paste) paste.value = reader.result; };
      reader.readAsText(file, 'UTF-8');
    };
    document.getElementById('sixq3j-confirm').onclick = function () {
      var text = paste ? paste.value : '';
      var parsed = PerfSixQ3J.parseImportText(text);
      var knownNos = MOCK_EMPLOYEES.map(function (e) { return e.no; });
      var result = PerfSixQ3J.importRows(detailPlanId, parsed.rows, knownNos);
      var msg = '已更新 ' + result.updated + ' 人';
      if (result.skipped.length) msg += ' · 跳过：' + result.skipped.join('、');
      if (resultEl) resultEl.textContent = msg;
      if (result.updated > 0) {
        alert(msg + '\n\n员工季表 Step3 / 上级季度评分页将同步显示。');
        closeSixQ3jModal();
      } else {
        alert(msg || '无有效数据');
      }
    };
    mask.classList.add('is-open');
  }

  function updateDetailSelectionUI() {
    var count = Object.keys(detailSelected).filter(function (k) { return detailSelected[k]; }).length;
    var hint = document.getElementById('detail-selected-hint');
    var btn = document.getElementById('btn-batch-transfer');
    if (hint) hint.textContent = '已选 ' + count + ' 条';
    if (btn) btn.disabled = count === 0;
    var allCb = document.getElementById('detail-select-all');
    var rowCbs = document.querySelectorAll('#detail-tbody .detail-row-cb');
    if (allCb && rowCbs.length) {
      allCb.checked = count > 0 && count === rowCbs.length;
      allCb.indeterminate = count > 0 && count < rowCbs.length;
    }
  }



  function renderDetailTable() {

    var org = document.getElementById('filter-org').value || '全部';

    var level = document.getElementById('filter-level').value || '全部';

    var status = document.getElementById('filter-status').value || '全部';

    var kw = (document.getElementById('filter-kw').value || '').trim();

    var scopeNameMap = {};

    DETAIL_SCOPE_PACKS.forEach(function (sp) { scopeNameMap[sp.id] = sp.name; });



    var rows = MOCK_EMPLOYEES.filter(function (e) {

      if (org !== '全部' && e.org !== org) return false;

      if (level !== '全部' && e.level !== level) return false;

      var view = window.PerfHrStore ? PerfHrStore.view(detailPlanId, e) : { status: e.status, handler: e.name };

      if (status !== '全部' && view.status !== status) return false;

      if (kw && e.name.indexOf(kw) === -1 && e.no.indexOf(kw) === -1) return false;

      return true;

    });



    var stats = { total: MOCK_EMPLOYEES.length, submitted: 0, doing: 0, overdue: 0 };

    MOCK_EMPLOYEES.forEach(function (e) {

      if (e.status === '已提交') stats.submitted++;

      if (e.status === '填写中') stats.doing++;

      if (e.status === '已逾期') stats.overdue++;

    });

    document.getElementById('stat-total').textContent = stats.total;

    document.getElementById('stat-submitted').textContent = stats.submitted;

    document.getElementById('stat-doing').textContent = stats.doing;

    document.getElementById('stat-overdue').textContent = stats.overdue;



    document.getElementById('detail-tbody').innerHTML = rows.map(function (e) {

      var taskHref = 'hr-task-detail.html?plan=' + encodeURIComponent(detailPlanId) + '&no=' + encodeURIComponent(e.no) + '&from=plan';

      var viewRow = window.PerfHrStore ? PerfHrStore.view(detailPlanId, e) : { status: e.status, handler: e.name };

    return '<tr><td><input type="checkbox" class="detail-row-cb" data-no="' + e.no + '" ' + (detailSelected[e.no] ? 'checked' : '') + ' /></td><td><a href="' + taskHref + '"><b>' + e.name + '</b></a></td><td>' + e.no + '</td><td>' + e.org + '</td>' +

        '<td>' + e.role + '</td><td>' + e.level + '</td>' +

        '<td>' + scopeLabelFor(e) + '</td><td>' + e.template + '</td>' +

        '<td>' + statusTag(viewRow.status) + '</td><td>' + (viewRow.handler ? '<span class="q-tag q-tag-blue">' + viewRow.handler + '</span>' : '<span class="muted">未指定评价人</span>') + '</td><td>' + e.submit + '</td>' +

        '<td>' + detailActions(e, viewRow, taskHref) + '</td></tr>';

    }).join('') || '<tr><td colspan="12" style="text-align:center;color:#999;padding:24px">无匹配数据</td></tr>';



    document.getElementById('filter-count').textContent = '共 ' + rows.length + ' 人';

    updateDetailSelectionUI();

  }



  function initDetailPage() {

    var params = new URLSearchParams(location.search);

    detailPlanId = params.get('plan') || '2026-05';

    var plan = detailPlanId;

    document.getElementById('plan-title').textContent = isQuarterPlanId(plan)

      ? plan.toUpperCase().replace('-', ' ') + ' · 季度绩效考核'

      : '2026年' + parseInt(plan.split('-')[1], 10) + '月 · 月度绩效考核';

    ORGS.forEach(function (o) {
      document.getElementById('filter-org').innerHTML += '<option>' + o + '</option>';
    });

    LEVELS.forEach(function (l) { document.getElementById('filter-level').innerHTML += '<option>' + l + '</option>'; });

    STATUSES.forEach(function (s) { document.getElementById('filter-status').innerHTML += '<option>' + s + '</option>'; });

    function refreshAll() {

      applyStoredVoids();

      renderDetailScopeSection(DETAIL_SCOPE_PACKS, refreshAll);

      renderDetailTable();

    }

    refreshAll();

    if (typeof renderPlanBonusSettlement === 'function') {
      renderPlanBonusSettlement('hr-plan-bonus-preview', isQuarterPlanId(plan) ? 'quarter' : 'month');
    }

    var btnSixQ = document.getElementById('btn-import-sixq3j');
    if (btnSixQ) {
      btnSixQ.style.display = isQuarterPlanId(plan) ? '' : 'none';
      btnSixQ.onclick = openSixQ3jImportModal;
    }
    if (isQuarterPlanId(plan) && location.hash === '#import-sixq3j') {
      openSixQ3jImportModal();
    }

    ['filter-org', 'filter-level', 'filter-status', 'filter-kw'].forEach(function (id) {

      document.getElementById(id).addEventListener('input', renderDetailTable);

      document.getElementById(id).addEventListener('change', renderDetailTable);

    });

    document.getElementById('btn-batch-remind').addEventListener('click', function () { alert('已向筛选结果批量催办（原型）'); });

    document.getElementById('btn-batch-transfer').addEventListener('click', function () {
      var selected = MOCK_EMPLOYEES.filter(function (e) { return detailSelected[e.no]; });
      if (!selected.length) { alert('请先勾选待办'); return; }
      openBatchTransferModal(selected);
    });

    document.getElementById('detail-select-all').addEventListener('change', function (e) {
      var checked = e.target.checked;
      document.querySelectorAll('#detail-tbody .detail-row-cb').forEach(function (cb) {
        cb.checked = checked;
        if (checked) detailSelected[cb.dataset.no] = true;
        else delete detailSelected[cb.dataset.no];
      });
      updateDetailSelectionUI();
    });

    document.getElementById('detail-tbody').addEventListener('change', function (e) {
      var cb = e.target.closest('.detail-row-cb');
      if (!cb) return;
      if (cb.checked) detailSelected[cb.dataset.no] = true;
      else delete detailSelected[cb.dataset.no];
      updateDetailSelectionUI();
    });

    document.getElementById('btn-export').addEventListener('click', function () { alert('导出明细（原型）'); });

    document.getElementById('filter-reset').addEventListener('click', function () {
      document.getElementById('filter-org').value = '全部';
      document.getElementById('filter-level').value = '全部';
      document.getElementById('filter-status').value = '全部';
      document.getElementById('filter-kw').value = '';
      renderDetailTable();
    });

    document.getElementById('detail-tbody').addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var no = link.dataset.no;
      var emp = null;
      for (var i = 0; i < MOCK_EMPLOYEES.length; i++) {
        if (MOCK_EMPLOYEES[i].no === no) emp = MOCK_EMPLOYEES[i];
      }
      if (link.classList.contains('link-return-node')) {
        e.preventDefault();
        if (!window.PerfHrStore || !emp) return;
        openReturnModal(emp, refreshAll);
      } else if (link.classList.contains('link-void')) {
        e.preventDefault();
        if (!emp) return;
        openVoidModal(emp, refreshAll);
      } else if (link.classList.contains('link-restore')) {
        e.preventDefault();
        if (!emp) return;
        restoreEmployee(emp, refreshAll);
      } else if (link.classList.contains('link-hr-score')) {
        e.preventDefault();
        if (!emp) return;
        openScoreModal(emp);
      } else if (link.classList.contains('link-export-img')) {
        e.preventDefault();
        exportEmployeeSheet(emp);
      }
    });

  }




  function rosterIdByNo(no) {
    var found = '';
    Object.keys(ROSTER).forEach(function (id) {
      if (ROSTER[id].no === no) found = id;
    });
    return found;
  }

  function scopeOfEmployee(emp) {
    var pid = rosterIdByNo(emp.no);
    var hit = null;
    DETAIL_SCOPE_PACKS.forEach(function (sp) {
      if (pid && sp.memberIds.indexOf(pid) >= 0) hit = sp;
    });
    return hit ? { id: hit.id, name: hit.name, personId: pid } : { id: '', name: '', personId: pid };
  }

  function scopeLabelFor(emp) {
    var hit = scopeOfEmployee(emp);
    if (hit.name) return hit.name;
    var task = window.PerfHrStore ? PerfHrStore.readTask(detailPlanId, emp.no) : null;
    if (task && task.voided) return '已移出';
    return '—';
  }

  function applyStoredVoids() {
    if (!window.PerfHrStore) return;
    var store = PerfHrStore.load();
    Object.keys(store.tasks).forEach(function (key) {
      if (key.indexOf(detailPlanId + ':') !== 0) return;
      var task = store.tasks[key];
      if (!task.voided || !task.voided.personId) return;
      DETAIL_SCOPE_PACKS.forEach(function (sp) {
        if (task.reassignedPackId && sp.id === task.reassignedPackId) return;
        if (task.voided.scopePackId && sp.id !== task.voided.scopePackId) return;
        var idx = sp.memberIds.indexOf(task.voided.personId);
        if (idx >= 0) sp.memberIds.splice(idx, 1);
      });
    });
  }

  function closeActionModal() {
    var mask = document.getElementById('hr-action-modal');
    if (mask) mask.remove();
  }

  function openActionModal(title, body, confirmText, onConfirm) {
    closeActionModal();
    var mask = document.createElement('div');
    mask.id = 'hr-action-modal';
    mask.className = 'hr-transfer-modal-mask is-open';
    mask.innerHTML =
      '<div class="hr-transfer-modal" role="dialog" style="max-width:480px">' +
      '<div class="hr-transfer-modal__head"><h3>' + title + '</h3>' +
      '<button type="button" class="hr-transfer-modal__close" aria-label="关闭">×</button></div>' +
      '<div class="hr-transfer-modal__body" style="min-height:0">' + body +
      '<p class="hr-modal-error" id="hr-action-error"></p></div>' +
      '<div class="hr-transfer-modal__foot">' +
      '<button type="button" class="q-btn" id="hr-action-cancel">取消</button>' +
      '<button type="button" class="q-btn q-btn-primary" id="hr-action-ok">' + confirmText + '</button></div></div>';
    document.body.appendChild(mask);
    function shut() { mask.remove(); }
    mask.querySelector('.hr-transfer-modal__close').addEventListener('click', shut);
    mask.querySelector('#hr-action-cancel').addEventListener('click', shut);
    mask.addEventListener('click', function (ev) { if (ev.target === mask) shut(); });
    mask.querySelector('#hr-action-ok').addEventListener('click', function () {
      var error = onConfirm(mask);
      var box = mask.querySelector('#hr-action-error');
      if (error) { if (box) box.textContent = error; return; }
      shut();
    });
  }

  function detailActions(emp, viewRow, taskHref) {
    var voided = viewRow.status === '已失效';
    var finished = viewRow.status === '已完成';
    var canReturn = window.PerfHrStore && PerfHrStore.returnTargets(detailPlanId, emp).length > 0;
    var parts = ['<a href="' + taskHref + '">查看详情</a>'];
    if (!voided && canReturn) {
      parts.push('<a href="#" class="link-return-node" data-no="' + emp.no + '" data-name="' + emp.name + '">退至</a>');
    }
    if (!voided && !finished) {
      parts.push('<a href="#" class="link-void" data-no="' + emp.no + '" data-name="' + emp.name + '">失效</a>');
    }
    if (voided) {
      parts.push('<a href="#" class="link-restore" data-no="' + emp.no + '" data-name="' + emp.name + '">恢复</a>');
    }
    if (!voided) {
      parts.push('<a href="#" class="link-hr-score" data-no="' + emp.no + '" data-name="' + emp.name + '">改总分</a>');
    }
    parts.push('<a href="#" class="link-export-img" data-no="' + emp.no + '" data-name="' + emp.name + '">导出图片</a>');
    return parts.join(' · ');
  }

  function openReturnModal(emp, refresh) {
    var nodes = PerfHrStore.returnTargets(detailPlanId, emp);
    if (!nodes.length) return;
    var steps = nodes.map(function (node, i) {
      return '<button type="button" class="hr-node-step' + (i === 0 ? ' is-on' : '') + '" data-node="' + node + '">' + node + '</button>';
    }).join('');
    openActionModal('退至 · ' + emp.name,
      '<p class="hr-modal-readonly">只能退至已经走过、且不是当前所在的节点。确认后分数和填写内容仍留在原来的输入框。</p>' +
      '<div class="hr-node-steps" id="hr-return-steps">' + steps + '</div>' +
      '<div class="hr-modal-field"><label>退至原因</label><textarea id="hr-return-reason" rows="3"></textarea></div>',
      '确认退至',
      function (mask) {
        var picked = mask.querySelector('.hr-node-step.is-on');
        var reason = (mask.querySelector('#hr-return-reason').value || '').trim();
        if (!picked) return '请选择退至节点';
        if (!reason) return '请填写退至原因';
        var res = PerfHrStore.returnTask(detailPlanId, emp, picked.getAttribute('data-node'), reason);
        if (!res.ok) return res.error;
        refresh();
        return '';
      });
    var host = document.getElementById('hr-return-steps');
    if (!host) return;
    host.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.hr-node-step');
      if (!btn) return;
      host.querySelectorAll('.hr-node-step').forEach(function (el) { el.classList.remove('is-on'); });
      btn.classList.add('is-on');
    });
  }

  function plansUsingPack(scopeId) {
    var pack = null;
    DETAIL_SCOPE_PACKS.forEach(function (sp) { if (sp.id === scopeId) pack = sp; });
    var ids = (pack && pack.usedBy && pack.usedBy.length) ? pack.usedBy.slice() : [detailPlanId];
    if (ids.indexOf(detailPlanId) < 0) ids.unshift(detailPlanId);
    return ids.map(function (id) {
      var plan = window.PerfHrStore ? PerfHrStore.planOf(id) : null;
      return { id: id, name: plan && plan.name ? plan.name : id };
    });
  }

  function commitVoid(emp, reason, scope, plans, refresh) {
    var res = PerfHrStore.voidTask(detailPlanId, emp, reason, scope, plans);
    if (!res.ok) return res.error;
    refresh();
    return '';
  }

  function openVoidModal(emp, refresh) {
    var scope = scopeOfEmployee(emp);
    var plans = plansUsingPack(scope.id);
    var names = plans.map(function (p) { return p.name; }).join('、');
    var reused = plans.length > 1;
    openActionModal('失效 · ' + emp.name,
      '<p class="hr-modal-readonly">失效后状态标红。员工和领导都看不到这张待办，并从范围包「' + (scope.name || '当前范围包') + '」移除。该范围包目前被 <b>' + plans.length + '</b> 张计划使用：' + names + '。一个人同时只在一个范围包里。恢复时加回这个已发放的范围包，并重新发放同一张待办，回到未开始。</p>' +
      (reused ? '<p class="hr-modal-readonly">这些计划共用该范围包。填写原因后还要再确认一次，才会把人从范围包里移除。</p>' : '') +
      '<div class="hr-modal-field"><label>失效原因</label><textarea id="hr-void-reason" rows="3"></textarea></div>',
      reused ? '下一步' : '确认失效',
      function (mask) {
        var reason = (mask.querySelector('#hr-void-reason').value || '').trim();
        if (!reason) return '请填写失效原因';
        if (!reused) return commitVoid(emp, reason, scope, plans, refresh);
        setTimeout(function () {
          openActionModal('再次确认失效 · ' + emp.name,
            '<p class="hr-modal-readonly">范围包「' + (scope.name || '当前范围包') + '」被 <b>' + plans.length + '</b> 张计划使用：' + names + '。确认后，' + emp.name + '会从这些计划共用的范围包里移除。</p>',
            '确认失效（影响 ' + plans.length + ' 张计划）',
            function () { return commitVoid(emp, reason, scope, plans, refresh); });
        }, 0);
        return '';
      });
  }

  function restoreEmployee(emp, refresh) {
    var pid = rosterIdByNo(emp.no);
    var task = PerfHrStore.readTask(detailPlanId, emp.no);
    var origin = task && task.voided ? task.voided.scopePackId : '';
    var other = pid ? findPersonScope(DETAIL_SCOPE_PACKS, pid, origin || null) : null;
    if (other) {
      openActionModal('无法恢复 · ' + emp.name,
        '<p class="hr-modal-readonly">该员工已在范围包「' + other.name + '」中。一个人不能同时在两个范围包。先从「' + other.name + '」去掉，才能加回原来已发放的范围包并重新发放。</p>',
        '知道了',
        function () { return ''; });
      return;
    }
    var originPack = null;
    DETAIL_SCOPE_PACKS.forEach(function (sp) { if (sp.id === origin) originPack = sp; });
    if (!originPack || originPack.status !== 'issued') {
      openActionModal('无法恢复 · ' + emp.name,
        '<p class="hr-modal-readonly">原来发放待办的范围包已经不在，或还没有发放。不能把人加回去重新发放。</p>',
        '知道了',
        function () { return ''; });
      return;
    }
    var res = PerfHrStore.restoreTask(detailPlanId, emp);
    if (!res.ok) {
      openActionModal('无法恢复 · ' + emp.name, '<p class="hr-modal-readonly">' + res.error + '</p>', '知道了', function () { return ''; });
      return;
    }
    var back = res.restored || {};
    if (back.personId && back.scopePackId) {
      DETAIL_SCOPE_PACKS.forEach(function (sp) {
        if (sp.id === back.scopePackId && sp.memberIds.indexOf(back.personId) < 0) sp.memberIds.push(back.personId);
      });
    }
    refresh();
  }

  function openScoreModal(emp) {
    var task = PerfHrStore.readTask(detailPlanId, emp.no);
    var adopted = window.PerfHrStore && PerfHrStore.adoptedScore ? PerfHrStore.adoptedScore(detailPlanId, task) : null;
    var current = adopted == null ? '尚未核定' : String(adopted);
    openActionModal('改总分 · ' + emp.name,
      '<p class="hr-modal-readonly">当前采用分：<b>' + current + '</b>。保存后确认状态不变。</p>' +
      '<div class="hr-modal-field"><label>最终总分</label><input id="hr-final-score" type="number" step="0.1" /></div>' +
      '<div class="hr-modal-field"><label>修改原因</label><textarea id="hr-final-reason" rows="3"></textarea></div>',
      '保存',
      function (mask) {
        var score = mask.querySelector('#hr-final-score').value;
        var reason = mask.querySelector('#hr-final-reason').value;
        var res = PerfHrStore.setHrFinal(detailPlanId, emp.no, score, reason);
        if (!res.ok) return res.error;
        return '';
      });
  }

  function exportEmployeeSheet(emp) {
    if (!window.PerfSheetPreview) { alert('整表预览未加载'); return; }
    var plan = window.PerfHrStore ? PerfHrStore.planOf(detailPlanId) : null;
    PerfSheetPreview.openEmployee(emp, {
      id: detailPlanId,
      name: plan ? plan.name : '',
      period: plan && plan.period ? plan.period : '',
      quarter: isQuarterPlanId(detailPlanId)
    });
  }

  window.initHrPlanCreate = initCreateWizard;

  window.initHrPlanDetail = initDetailPage;

  window.HR_CREATE_STEPS = CREATE_STEPS;

})();


