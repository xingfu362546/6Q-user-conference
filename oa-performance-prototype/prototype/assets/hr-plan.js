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



  var DETAIL_SCOPE_PACKS = [

    { id: 'sp1', name: '信息部-核心岗', templateId: 't-m-staff', memberIds: ['p-zm', 'p-wf', 'p-lq', 'p-xy'], status: 'issued' },

    { id: 'sp2', name: '办事处+职能', templateId: 't-m-mgr', memberIds: ['p-zmn', 'p-cw', 'p-sun', 'p-ly', 'p-zt', 'p-wl', 'p-ma', 'p-hx'], status: 'issued' },

  ];



  var ORGS = ['全部', '信息部', '人才开发部', '行政管理部', '广州办事处', '深圳办事处'];

  var LEVELS = ['全部', '总监', '经理', '主管', '职员'];

  var STATUSES = ['全部', '未开始', '填写中', '已提交', '已逾期'];



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

      '<p class="hr-scope-tip">一人仅属一个范围包；已在其他包的人不可选。</p>' +

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

      return '<tr><td><b>' + sp.name + '</b></td><td>' + sp.memberIds.length + '</td>' +

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

      if (status !== '全部' && e.status !== status) return false;

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

      return '<tr><td><input type="checkbox" /></td><td><a href="' + taskHref + '"><b>' + e.name + '</b></a></td><td>' + e.no + '</td><td>' + e.org + '</td>' +

        '<td>' + e.role + '</td><td>' + e.level + '</td><td>' + e.audience + '</td>' +

        '<td>' + (scopeNameMap[e.scopeId] || '—') + '</td><td>' + e.template + '</td>' +

        '<td>' + statusTag(e.status) + '</td><td>' + e.submit + '</td>' +

        '<td><a href="' + taskHref + '">查看详情</a> · <a href="#">催办</a> · <a href="#">解锁</a> · <a href="#" class="link-return-emp" data-name="' + e.name + '">退回至员工</a></td></tr>';

    }).join('') || '<tr><td colspan="12" style="text-align:center;color:#999;padding:24px">无匹配数据</td></tr>';



    document.getElementById('filter-count').textContent = '共 ' + rows.length + ' 人';

  }



  function initDetailPage() {

    var params = new URLSearchParams(location.search);

    detailPlanId = params.get('plan') || '2026-05';

    var plan = detailPlanId;

    document.getElementById('plan-title').textContent = plan.indexOf('Q') >= 0

      ? '2026 ' + plan + ' · 季度绩效考核'

      : '2026年' + parseInt(plan.split('-')[1], 10) + '月 · 月度绩效考核';

    ORGS.forEach(function (o) {
      document.getElementById('filter-org').innerHTML += '<option>' + o + '</option>';
    });

    LEVELS.forEach(function (l) { document.getElementById('filter-level').innerHTML += '<option>' + l + '</option>'; });

    STATUSES.forEach(function (s) { document.getElementById('filter-status').innerHTML += '<option>' + s + '</option>'; });

    function refreshAll() {

      renderDetailScopeSection(DETAIL_SCOPE_PACKS, refreshAll);

      renderDetailTable();

    }

    refreshAll();

    if (typeof renderPlanBonusSettlement === 'function') {
      renderPlanBonusSettlement('hr-plan-bonus-preview', 'month');
    }

    ['filter-org', 'filter-level', 'filter-status', 'filter-kw'].forEach(function (id) {

      document.getElementById(id).addEventListener('input', renderDetailTable);

      document.getElementById(id).addEventListener('change', renderDetailTable);

    });

    document.getElementById('btn-batch-remind').addEventListener('click', function () { alert('已向筛选结果批量催办（原型）'); });

    document.getElementById('btn-export').addEventListener('click', function () { alert('导出明细（原型）'); });

    document.getElementById('filter-reset').addEventListener('click', function () {
      document.getElementById('filter-org').value = '全部';
      document.getElementById('filter-level').value = '全部';
      document.getElementById('filter-status').value = '全部';
      document.getElementById('filter-kw').value = '';
      renderDetailTable();
    });

    document.getElementById('detail-tbody').addEventListener('click', function (e) {
      var link = e.target.closest('.link-return-emp');
      if (!link) return;
      e.preventDefault();
      var reason = prompt('退回至员工 · ' + link.dataset.name + '：请输入原因（必填）');
      if (reason && reason.trim()) alert('已退回至「' + link.dataset.name + '」，员工可在断点续改、数据保留（原型）');
    });

  }



  window.initHrPlanCreate = initCreateWizard;

  window.initHrPlanDetail = initDetailPage;

  window.HR_CREATE_STEPS = CREATE_STEPS;

})();


