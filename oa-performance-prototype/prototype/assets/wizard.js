/** 月度填表向导 · 共享逻辑（原型：无校验，便于测试） */

const MONTHLY_STEPS = [

  { id: 1, phase: 0, title: '核心绩效 V%', subtitle: '【A】本月考评 · 1/8' },

  { id: 2, phase: 0, title: '常规绩效 X%', subtitle: '【A】本月考评 · 2/8' },

  { id: 3, phase: 0, title: '行为态度 15%', subtitle: '【A】本月考评 · 3/8' },

  { id: 4, phase: 0, title: '加减分', subtitle: '【A】本月考评 · 4/8' },

  { id: 5, phase: 0, title: '自评打分', subtitle: '【A】本月考评 · 5/8' },

  { id: 6, phase: 0, title: '自评总结', subtitle: '【A】本月考评 · 6/8' },

  { id: 7, phase: 1, title: '下月核心目标', subtitle: '【B】下月目标 · 7/8' },

  { id: 8, phase: 2, title: '确认提交', subtitle: '确认提交 · 8/8' },

];



const PHASE_BLOCKS = [
  { id: 0, name: '【A】本月考评', desc: '核心 · 常规 · 行为 · 加减分 · 自评', steps: [1, 2, 3, 4, 5, 6] },
  { id: 1, name: '【B】下月目标', desc: '下月核心 KR 3–4 项', steps: [7] },
  { id: 2, name: '确认提交', desc: '校验并提交', steps: [8] },
];



const BEHAVIOR_ITEMS = [

  { name: '团队建设与人才培养', weight: 4, standard: '1.根据团队现状，规划并推动人才培养计划；\n2.及时给予反馈与辅导，帮助下属提升能力；\n3.根据下属特点，差异化分配任务与培养资源；\n4.建立团队内部经验分享机制，促进共同成长。' },

  { name: '跨部门协同', weight: 4, standard: '1.主动建立跨部门信息共享渠道；\n2.积极响应跨部门协同需求；\n3.尊重协同部门工作节奏；\n4.对协作问题及时复盘。' },

  { name: '压力应对与问题解决', weight: 4, standard: '1.面对压力情绪稳定；\n2.面对困难多路径尝试；\n3.遇到问题先分析根因；\n4.资源不足时主动协调。' },

  { name: '目标承接与责任承担', weight: 3, standard: '1.对上级目标快速理解并转化；\n2.资源不足时主动协调；\n3.主动跟进目标达成；\n4.对团队交付成果负责。' },

];



const MOCK_HEADER = {

  name: '张明',

  dept: '信息部',

  role: '产品经理',

  reviewer: '李总监',

  period: '2026年5月',

  fillDate: '2026-05-28',

  audience: '全职员工',

};



const STD_TIER_LABELS = [
  '业绩达成率 ≥ 100%',
  '100% > 业绩达成率 ≥ 90%',
  '90% > 业绩达成率 ≥ 80%',
  '80% > 业绩达成率 ≥ 70%',
  '业绩达成率 < 70%',
];
const STD_TIER_NUMS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
const STD_TIER_MAX = 8;
const STD_TIER_MIN = 1;

function tierNumChar(i) {
  return STD_TIER_NUMS[i] || String(i + 1);
}

function defaultStandardTiers(maxScore) {
  maxScore = parseFloat(maxScore) || 25;
  return STD_TIER_LABELS.map(function (label, i) {
    return { label: label, score: Math.round(maxScore * [1, 0.8, 0.6, 0.4, 0][i]) };
  });
}

function ensureStandardTiers(kr) {
  if (!kr) return;
  if (kr.standardTiers && kr.standardTiers.length > 0) return;
  kr.standardTiers = defaultStandardTiers(kr.weight || 25);
}

function syncStandardTierScores(kr) {
  var max = parseFloat(kr.weight);
  if (!max || isNaN(max)) return;
  ensureStandardTiers(kr);
  var n = kr.standardTiers.length;
  if (n === 1) {
    kr.standardTiers[0].score = Math.round(max);
    return;
  }
  kr.standardTiers.forEach(function (t, i) {
    t.score = Math.round(max * (1 - i / (n - 1)));
  });
}

function escapeAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** 行为态度 · 模板固定考核标准（只读，复用分档列表样式，无分值列） */
function renderBehaviorStandardHtml(standardText) {
  var lines = String(standardText || '').split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
  if (!lines.length) return '';
  var rows = lines.map(function (line, i) {
    var text = line.replace(/^\d+\.\s*/, '');
    return '<li class="std-tier-row std-tier-row--behavior">' +
      '<span class="std-tier-num">' + tierNumChar(i) + '</span>' +
      '<span class="std-tier-label">' + escapeAttr(text) + '</span></li>';
  }).join('');
  return '<div class="field std-tier-field">' +
    '<label>考核标准 <span class="std-tier-hint">模板固定</span></label>' +
    '<ul class="std-tier-list std-tier-list--readonly std-tier-list--behavior">' + rows + '</ul></div>';
}

function renderStandardTiersHtml(kr, editable) {
  ensureStandardTiers(kr);
  var canDel = editable && kr.standardTiers.length > STD_TIER_MIN;
  var rows = kr.standardTiers.map(function (t, i) {
    var scoreCell = editable
      ? '<input type="number" class="std-tier-input" data-tier-idx="' + i + '" value="' + (t.score != null && t.score !== '' ? t.score : '') + '" min="0" step="1" />'
      : '<strong class="std-tier-score-read">' + (t.score != null && t.score !== '' ? t.score : '—') + '</strong>';
    var labelCell = editable
      ? '<input type="text" class="std-tier-label-input" data-tier-label="' + i + '" value="' + escapeAttr(t.label) + '" placeholder="达成条件" />'
      : '<span class="std-tier-label">' + escapeAttr(t.label) + '</span>';
    var delBtn = canDel
      ? '<button type="button" class="std-tier-del" data-tier-del="' + i + '" title="删除此档" aria-label="删除">×</button>'
      : '';
    return '<li class="std-tier-row">' +
      '<span class="std-tier-num" aria-hidden="true">' + tierNumChar(i) + '</span>' +
      labelCell +
      '<span class="std-tier-colon">：</span>' +
      '<span class="std-tier-score">' + scoreCell + '<span class="std-tier-unit">分</span></span>' +
      delBtn +
      '</li>';
  }).join('');
  var hint = editable ? '<span class="std-tier-hint">改权重按比例更新分值 · 可增删档</span>' : '';
  var addBtn = editable && kr.standardTiers.length < STD_TIER_MAX
    ? '<button type="button" class="std-tier-add">+ 添加一档</button>'
    : '';
  return '<div class="field std-tier-field" data-std-tier-field>' +
    '<label>考核标准 ' + hint + '</label>' +
    '<ul class="std-tier-list">' + rows + '</ul>' +
    addBtn +
    '</div>';
}

function bindStandardTiers(card, kr, onChange) {
  ensureStandardTiers(kr);
  var field = card.querySelector('[data-std-tier-field]');
  if (!field) return;

  field.querySelectorAll('[data-tier-idx]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var i = +inp.dataset.tierIdx;
      kr.standardTiers[i].score = inp.value === '' ? '' : parseFloat(inp.value);
      onChange(false);
    });
  });

  field.querySelectorAll('[data-tier-label]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      kr.standardTiers[+inp.dataset.tierLabel].label = inp.value;
      onChange(false);
    });
  });

  field.querySelectorAll('[data-tier-del]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (kr.standardTiers.length <= STD_TIER_MIN) return;
      kr.standardTiers.splice(+btn.dataset.tierDel, 1);
      onChange(true);
    });
  });

  field.querySelector('.std-tier-add')?.addEventListener('click', function (e) {
    e.stopPropagation();
    if (kr.standardTiers.length >= STD_TIER_MAX) return;
    kr.standardTiers.push({ label: '请填写达成条件', score: 0 });
    syncStandardTierScores(kr);
    onChange(true);
  });

  var weightInp = card.querySelector('[data-k="weight"]');
  if (weightInp && !weightInp.dataset.tierBound) {
    weightInp.dataset.tierBound = '1';
    weightInp.addEventListener('input', function () {
      kr.weight = weightInp.value;
      syncStandardTierScores(kr);
      onChange(true);
    });
  }
}

function normalizeState(state) {
  (state.coreKrs || []).forEach(ensureStandardTiers);
  (state.regularKrs || []).forEach(ensureStandardTiers);
  (state.nextMonthKrs || []).forEach(ensureStandardTiers);
  if (!state.behaviorSelfScores || state.behaviorSelfScores.length !== BEHAVIOR_ITEMS.length) {
    state.behaviorSelfScores = BEHAVIOR_ITEMS.map(function (_, i) {
      return (state.behaviorSelfScores && state.behaviorSelfScores[i]) || '';
    });
  }
  return state;
}

function seedDemoGoals(state) {
  if ((state.coreKrs[0].o || '').trim()) return;
  state.coreKrs[0].o = '推动绩效系统 MVP 需求评审与方案落地';
  state.coreKrs[0].smart = '6/30 前完成 PRD 评审，覆盖月/季模板与双端填表主链路';
  state.coreKrs[0].weight = '25';
  syncStandardTierScores(state.coreKrs[0]);
}

function emptyKr(block) {

  return { block, o: '', smart: '', weight: '', standardTiers: defaultStandardTiers(25), m: '', selfScore: '' };

}



function defaultState() {

  return {

    step: 1,

    maxStep: 8,

    coreKrs: [emptyKr('V'), emptyKr('V')],

    regularKrs: [emptyKr('X')],

    behaviorEvents: BEHAVIOR_ITEMS.map(() => ''),

    behaviorSelfScores: BEHAVIOR_ITEMS.map(() => ''),

    plusRows: [{ type: '加分', desc: '', score: '' }],

    minusRows: [{ type: '减分', desc: '', score: '' }],

    selfSummary: '',

    nextMonthKrs: [

      { o: '', smart: '', weight: '', standardTiers: defaultStandardTiers(25), challenge: '' },

      { o: '', smart: '', weight: '', standardTiers: defaultStandardTiers(25), challenge: '' },

    ],

    openKr: {},

  };

}



function loadState(key) {

  try {

    const raw = localStorage.getItem(key);

    const s = raw ? JSON.parse(raw) : defaultState();

    s.maxStep = 8;

    if (!s.openKr) s.openKr = {};

    return normalizeState(s);

  } catch {

    return defaultState();

  }

}



function saveState(key, state) {

  localStorage.setItem(key, JSON.stringify(state));

}



function sumWeight(rows) {

  return rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);

}



function renderHeader(el) {

  const h = MOCK_HEADER;

  el.innerHTML = `

    <div class="item"><label>姓名</label><span>${h.name}</span></div>

    <div class="item"><label>部门</label><span>${h.dept}</span></div>

    <div class="item"><label>岗位</label><span>${h.role}</span></div>

    <div class="item"><label>评价人</label><span>${h.reviewer}</span></div>

    <div class="item"><label>考核期</label><span>${h.period}</span></div>

    <div class="item"><label>人群</label><span>${h.audience}</span></div>

  `;

}



function renderPhaseStepper(container, steps, phaseBlocks, currentStep, onJump) {
  const cur = steps[currentStep - 1];
  const total = steps.length;
  const compact = phaseBlocks.length >= 4;

  const blocksHtml = phaseBlocks.map(function (block, i) {
    var blockCls = 'step-block';
    if (cur.phase === block.id) blockCls += ' is-active';
    else if (cur.phase > block.id) blockCls += ' is-done';
    else blockCls += ' is-pending';

    var dots = block.steps.map(function (stepId) {
      var cls = 'step-dot';
      if (stepId === currentStep) cls += ' active';
      else if (stepId < currentStep) cls += ' done';
      return '<span class="' + cls + '" data-step="' + stepId + '" title="' + steps[stepId - 1].title + '">' + stepId + '</span>';
    }).join('');

    return '<div class="' + blockCls + '">' +
      '<div class="step-block-head">' +
      '<span class="step-block-num">' + (i + 1) + '</span>' +
      '<span class="step-block-name">' + block.name + '</span>' +
      '</div>' +
      '<div class="step-block-dots">' + dots + '</div>' +
      '<div class="step-block-desc">' + block.desc + '</div>' +
      '</div>';
  }).join('');

  container.innerHTML =
    '<div class="stepper-blocks' + (compact ? ' stepper-blocks--compact' : '') + '">' + blocksHtml + '</div>' +
    '<div class="stepper-current">' +
    '<span class="stepper-current-label">当前步骤</span>' +
    '<div class="stepper-current-main">' +
    '<span class="stepper-current-title">' + cur.title + '</span>' +
    (cur.subtitle ? '<span class="stepper-current-sub">' + cur.subtitle + '</span>' : '') +
    '</div>' +
    '<span class="stepper-current-step">' + currentStep + ' / ' + total + '</span>' +
    '</div>';

  container.querySelectorAll('.step-dot').forEach(function (dot) {
    dot.addEventListener('click', function () { onJump(+dot.dataset.step); });
  });
}

function renderStepper(container, state, onJump) {
  renderPhaseStepper(container, MONTHLY_STEPS, PHASE_BLOCKS, state.step, onJump);
}



function krFields(kr, idx, blockLabel, showScore, openKey, isOpen) {

  const preview = typeof krPreview === 'function' ? krPreview(kr, showScore) : blockLabel;

  const scoreFields = showScore ? `

    ${renderStandardTiersHtml(kr, false)}

    <div class="field"><label>关键成果 M</label><textarea rows="2" data-k="m">${kr.m}</textarea></div>

    <div class="field"><label>自评分（1-5）</label><input type="number" min="1" max="5" step="0.1" data-k="selfScore" value="${kr.selfScore}" /></div>

  ` : `

    <div class="field"><label>关键目标 O</label><textarea rows="2" data-k="o" placeholder="简要描述目标">${kr.o}</textarea></div>

    <div class="field"><label>考核目标 SMART</label><textarea rows="2" data-k="smart" placeholder="具体、可衡量…">${kr.smart}</textarea></div>

    <div class="field"><label>KR 权重 %</label><input type="number" min="0" max="100" data-k="weight" value="${kr.weight}" placeholder="0" /></div>

    ${renderStandardTiersHtml(kr, true)}

  `;

  return `

    <div class="collapse-card ${isOpen ? 'open' : ''}" data-idx="${idx}" data-open-key="${openKey}">

      <button type="button" class="collapse-head">

        <span class="collapse-title">${blockLabel} ${idx + 1}</span>

        <span class="collapse-preview" data-preview>${preview}</span>

        <span class="collapse-chevron">▼</span>

      </button>

      <div class="collapse-body">

        <div class="kr-card">${scoreFields}</div>

        ${idx > 0 ? '<div class="collapse-actions"><button type="button" class="remove-btn">删除此指标</button></div>' : ''}

      </div>

    </div>

  `;

}



function nextMonthFields(k, i, isOpen) {

  const preview = typeof krPreview === 'function' ? krPreview(k, false) : `下月目标 ${i + 1}`;

  return `

    <div class="collapse-card ${isOpen ? 'open' : ''}" data-idx="${i}" data-open-key="next-${i}">

      <button type="button" class="collapse-head">

        <span class="collapse-title">下月目标 ${i + 1}</span>

        <span class="collapse-preview" data-preview>${preview}</span>

        <span class="collapse-chevron">▼</span>

      </button>

      <div class="collapse-body">

        <div class="kr-card">

          <div class="field"><label>关键目标 O</label><textarea rows="2" data-k="o">${k.o}</textarea></div>

          <div class="field"><label>SMART</label><textarea rows="2" data-k="smart">${k.smart}</textarea></div>

          <div class="field"><label>权重 %</label><input data-k="weight" value="${k.weight}" /></div>

          ${renderStandardTiersHtml(k, true)}

          <div class="field"><label>存在挑战/需求资源</label><textarea rows="2" data-k="challenge">${k.challenge}</textarea></div>

        </div>

        ${i > 0 ? '<div class="collapse-actions"><button type="button" class="remove-btn">删除此目标</button></div>' : ''}

      </div>

    </div>

  `;

}



function isKrOpen(state, key, idx) {

  if (state.openKr[key] === idx) return true;

  if (state.openKr[key] === undefined && idx === 0) return true;

  return false;

}



function updateKrPreview(card, kr, showScore) {

  const el = card.querySelector('[data-preview]');

  if (el && typeof krPreview === 'function') el.textContent = krPreview(kr, showScore);

}



function bindKrCards(root, listKey, state, onChange, showScore) {

  const openKey = listKey;

  root.querySelectorAll('.collapse-card').forEach(card => {

    const idx = +card.dataset.idx;

    card.querySelectorAll('[data-k]').forEach(inp => {

      inp.addEventListener('input', () => {

        state[listKey][idx][inp.dataset.k] = inp.value;

        updateKrPreview(card, state[listKey][idx], showScore);

        onChange(false);

      });

    });

    if (!showScore) bindStandardTiers(card, state[listKey][idx], onChange);

    const rm = card.querySelector('.remove-btn');

    if (rm) rm.addEventListener('click', e => {

      e.stopPropagation();

      state[listKey].splice(idx, 1);

      state.openKr[openKey] = 0;

      onChange(true);

    });

    card.querySelector('.collapse-head')?.addEventListener('click', e => {

      if (e.target.closest('.remove-btn')) return;

      const opening = !card.classList.contains('open');

      if (opening) {

        root.querySelectorAll('.collapse-card.open').forEach(c => c.classList.remove('open'));

        card.classList.add('open');

        state.openKr[openKey] = idx;

      } else {

        card.classList.remove('open');

      }

    });

  });

}



function renderWeightBar(vw, xw, targetVx) {

  const total = vw + xw;

  const pct = Math.min(100, targetVx ? (total / targetVx) * 100 : 0);

  return `

    <div class="weight-bar">

      <span>核心 V: <b>${vw.toFixed(1)}%</b></span>

      <span>常规 X: <b>${xw.toFixed(1)}%</b></span>

      <div class="track"><div class="fill" style="width:${pct}%"></div></div>

      <span>参考 ${targetVx}%</span>

    </div>

  `;

}



function collapseToolbar(id) {

  return `

    <div class="list-toolbar">

      <span>点击标题展开/收起</span>

      <span>

        <button type="button" data-expand-all="${id}">全部展开</button>

        ·

        <button type="button" data-collapse-all="${id}">全部收起</button>

      </span>

    </div>

  `;

}



function bindListToolbar(root, listId) {

  root.querySelector(`[data-expand-all="${listId}"]`)?.addEventListener('click', () => {

    root.querySelectorAll(`#${listId} .collapse-card`).forEach(c => c.classList.add('open'));

  });

  root.querySelector(`[data-collapse-all="${listId}"]`)?.addEventListener('click', () => {

    root.querySelectorAll(`#${listId} .collapse-card`).forEach(c => c.classList.remove('open'));

  });

}



function renderStepContent(state) {

  const s = state.step;

  if (s === 1) {

    const cards = state.coreKrs.map((k, i) => krFields(k, i, '核心 V', false, 'core', isKrOpen(state, 'core', i))).join('');

    return `

      <p class="section-desc">填写本月核心绩效，建议 4–6 项。</p>

      ${renderWeightBar(sumWeight(state.coreKrs), sumWeight(state.regularKrs), 85)}

      ${collapseToolbar('kr-list')}

      <div id="kr-list">${cards}</div>

      <button type="button" class="btn btn-block" id="add-kr" style="margin-top:8px">+ 添加核心指标</button>

    `;

  }

  if (s === 2) {

    const cards = state.regularKrs.map((k, i) => krFields(k, i, '常规 X', false, 'regular', isKrOpen(state, 'regular', i))).join('');

    return `

      <p class="section-desc">填写常规绩效指标。</p>

      ${renderWeightBar(sumWeight(state.coreKrs), sumWeight(state.regularKrs), 85)}

      ${collapseToolbar('kr-list')}

      <div id="kr-list">${cards}</div>

      <button type="button" class="btn btn-block" id="add-kr" style="margin-top:8px">+ 添加常规指标</button>

    `;

  }

  if (s === 3) {

    const items = BEHAVIOR_ITEMS.map((b, i) => `

      <div class="collapse-card ${isKrOpen(state, 'behavior', i) ? 'open' : ''}" data-bi-card="${i}">

        <button type="button" class="collapse-head">

          <span class="collapse-title">${b.name}</span>

          <span class="collapse-preview">${b.weight}% · ${state.behaviorEvents[i] ? '已填关键事件' : '选填关键事件'}</span>

          <span class="collapse-chevron">▼</span>

        </button>

        <div class="collapse-body behavior-item">

          ${renderBehaviorStandardHtml(b.standard)}

          <div class="field"><label>关键事件（选填）</label><textarea rows="2" data-bi="${i}">${state.behaviorEvents[i]}</textarea></div>

        </div>

      </div>

    `).join('');

    return `

      <p class="section-desc">行为态度固定 4 项，不可增删。</p>

      ${collapseToolbar('behavior-list')}

      <div id="behavior-list">${items}</div>

    `;

  }

  if (s === 4) {

    const plus = state.plusRows.map((r, i) => `

      <div class="collapse-card ${i === 0 ? 'open' : ''}" data-pm="plus" data-i="${i}">

        <button type="button" class="collapse-head">

          <span class="collapse-title">加分 ${i + 1}</span>

          <span class="collapse-preview">${r.desc || '点击填写'}</span>

          <span class="collapse-chevron">▼</span>

        </button>

        <div class="collapse-body">

          <div class="field"><label>说明</label><textarea rows="2" data-k="desc" placeholder="加分说明">${r.desc}</textarea></div>

          <div class="field"><label>分值</label><input type="number" data-k="score" value="${r.score}" placeholder="0" /></div>

        </div>

      </div>

    `).join('');

    const minus = state.minusRows.map((r, i) => `

      <div class="collapse-card" data-pm="minus" data-i="${i}">

        <button type="button" class="collapse-head">

          <span class="collapse-title">减分 ${i + 1}</span>

          <span class="collapse-preview">${r.desc || '点击填写'}</span>

          <span class="collapse-chevron">▼</span>

        </button>

        <div class="collapse-body">

          <div class="field"><label>说明</label><textarea rows="2" data-k="desc" placeholder="减分说明">${r.desc}</textarea></div>

          <div class="field"><label>分值</label><input type="number" data-k="score" value="${r.score}" placeholder="0" /></div>

        </div>

      </div>

    `).join('');

    return `

      <p class="section-desc">申报本月加减分；上级核定后生效。</p>

      <p class="section-desc" style="margin-top:-8px;font-weight:600;color:var(--text)">加分项</p>

      <div id="plus-list">${plus}</div>

      <button type="button" class="btn" id="add-plus" style="margin-bottom:16px">+ 加分项</button>

      <p class="section-desc" style="font-weight:600;color:var(--text)">减分项</p>

      <div id="minus-list">${minus}</div>

      <button type="button" class="btn" id="add-minus">+ 减分项</button>

    `;

  }

  if (s === 5) {

    const all = [...state.coreKrs.map((k,i)=>({...k, label:`核心 V`, key:'core'})), ...state.regularKrs.map((k,i)=>({...k, label:`常规 X`, key:'regular', off:i}))];

    const behaviorScoreCards = BEHAVIOR_ITEMS.map(function (b, i) {
      return '<div class="collapse-card ' + (isKrOpen(state, 'behaviorScore', i) ? 'open' : '') + '" data-behavior-score="' + i + '">' +
        '<button type="button" class="collapse-head">' +
        '<span class="collapse-title">行为 · ' + b.name + '</span>' +
        '<span class="collapse-preview">' + b.weight + '% · ' + (state.behaviorSelfScores[i] ? '自评 ' + state.behaviorSelfScores[i] : '待评分') + '</span>' +
        '<span class="collapse-chevron">▼</span></button>' +
        '<div class="collapse-body">' + renderBehaviorStandardHtml(b.standard) +
        '<div class="field"><label>自评分（1-5）</label><input type="number" min="1" max="5" step="0.1" data-bsi="' + i + '" value="' + (state.behaviorSelfScores[i] || '') + '" /></div>' +
        '</div></div>';
    }).join('');

    return `

      <p class="section-desc">【A】工作 KR：填写关键成果 M 与自评分；行为态度在下方单独自评。</p>

      ${collapseToolbar('score-list')}

      <div id="score-list">${all.map((k, i) => krFields(k, i, k.label, true, `score-${i}`, isKrOpen(state, 'score', i))).join('')}</div>

      <p class="section-desc" style="margin-top:16px;font-weight:600;color:var(--text)">行为态度 15%</p>

      <div id="behavior-score-list">${behaviorScoreCards}</div>

    `;

  }

  if (s === 6) {

    return `

      <p class="section-desc">总结本月工作亮点、不足与改进方向。</p>

      <div class="field"><label>自评总结</label><textarea rows="8" id="self-summary" placeholder="选填">${state.selfSummary}</textarea></div>

    `;

  }

  if (s === 7) {

    const cards = state.nextMonthKrs.map((k, i) => nextMonthFields(k, i, isKrOpen(state, 'next', i))).join('');

    return `

      <p class="section-desc">填写下月核心目标（3–4 项）。</p>

      ${collapseToolbar('next-list')}

      <div id="next-list">${cards}</div>

      <button type="button" class="btn btn-block" id="add-next" style="margin-top:8px">+ 添加下月目标</button>

    `;

  }

  if (s === 8) {

    const vw = sumWeight(state.coreKrs);

    const xw = sumWeight(state.regularKrs);

    return `

      <p class="section-desc">确认信息后提交；提交后进入上级审核。</p>

      <table class="confirm-table">

        <tr><th>区块</th><th>指标数</th><th>权重</th></tr>

        <tr><td>核心绩效 V</td><td>${state.coreKrs.length}</td><td>${vw.toFixed(1)}%</td></tr>

        <tr><td>常规绩效 X</td><td>${state.regularKrs.length}</td><td>${xw.toFixed(1)}%</td></tr>

        <tr><td>行为态度</td><td>4（固定）</td><td>15%</td></tr>

        <tr><td>加减分</td><td>${state.plusRows.length + state.minusRows.length}</td><td>—</td></tr>

        <tr><td>下月核心目标</td><td>${state.nextMonthKrs.length}</td><td>${sumWeight(state.nextMonthKrs.map(k=>({weight:k.weight}))).toFixed(1)}%</td></tr>

      </table>

    `;

  }

  return '';

}



function bindStepEvents(root, state, rerender) {

  if ([1, 2].includes(state.step)) bindListToolbar(root, 'kr-list');

  if (state.step === 3) bindListToolbar(root, 'behavior-list');

  if (state.step === 5) bindListToolbar(root, 'score-list');

  if (state.step === 5) bindListToolbar(root, 'behavior-score-list');

  if (state.step === 7) bindListToolbar(root, 'next-list');



  if (state.step === 1 || state.step === 2) {

    bindKrCards(root, state.step === 1 ? 'coreKrs' : 'regularKrs', state, rerender, false);

    root.querySelector('#add-kr')?.addEventListener('click', () => {

      const list = state.step === 1 ? 'coreKrs' : 'regularKrs';

      const key = state.step === 1 ? 'core' : 'regular';

      state[list].push(emptyKr(state.step === 1 ? 'V' : 'X'));

      state.openKr[key] = state[list].length - 1;

      rerender(true);

    });

  }

  if (state.step === 3) {

    bindCollapseCards(root);

    root.querySelectorAll('[data-bi]').forEach(ta => {

      ta.addEventListener('input', () => {

        state.behaviorEvents[+ta.dataset.bi] = ta.value;

        const card = ta.closest('.collapse-card');

        const prev = card?.querySelector('.collapse-preview');

        if (prev) prev.textContent = `${BEHAVIOR_ITEMS[+ta.dataset.bi].weight}% · ${ta.value ? '已填关键事件' : '选填关键事件'}`;

      });

    });

  }

  if (state.step === 4) {

    bindCollapseCards(root);

    root.querySelectorAll('[data-pm]').forEach(row => {

      const pm = row.dataset.pm;

      const i = +row.dataset.i;

      const list = pm === 'plus' ? state.plusRows : state.minusRows;

      row.querySelectorAll('[data-k]').forEach(inp => {

        inp.addEventListener('input', () => {

          list[i][inp.dataset.k === 'score' ? 'score' : 'desc'] = inp.value;

          const prev = row.querySelector('.collapse-preview');

          if (prev && inp.dataset.k === 'desc') prev.textContent = inp.value || '点击填写';

        });

      });

    });

    root.querySelector('#add-plus')?.addEventListener('click', () => { state.plusRows.push({ type:'加分', desc:'', score:'' }); rerender(true); });

    root.querySelector('#add-minus')?.addEventListener('click', () => { state.minusRows.push({ type:'减分', desc:'', score:'' }); rerender(true); });

  }

  if (state.step === 5) {

    const all = [...state.coreKrs, ...state.regularKrs];

    root.querySelectorAll('#score-list .collapse-card').forEach((card, idx) => {

      card.querySelectorAll('[data-k]').forEach(inp => {

        inp.addEventListener('input', () => {

          all[idx][inp.dataset.k] = inp.value;

          updateKrPreview(card, all[idx], true);

        });

      });

      card.querySelector('.collapse-head')?.addEventListener('click', e => {

        const opening = !card.classList.contains('open');

        if (opening) {

          root.querySelectorAll('#score-list .collapse-card.open').forEach(c => c.classList.remove('open'));

          card.classList.add('open');

          state.openKr.score = idx;

        } else card.classList.remove('open');

      });

    });

    bindCollapseCards(root.querySelector('#behavior-score-list'));

    root.querySelectorAll('#behavior-score-list [data-bsi]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        state.behaviorSelfScores[+inp.dataset.bsi] = inp.value;
        var card = inp.closest('.collapse-card');
        var prev = card && card.querySelector('.collapse-preview');
        var b = BEHAVIOR_ITEMS[+inp.dataset.bsi];
        if (prev && b) prev.textContent = b.weight + '% · ' + (inp.value ? '自评 ' + inp.value : '待评分');
      });
    });

    root.querySelectorAll('#behavior-score-list .collapse-card').forEach(function (card) {
      card.querySelector('.collapse-head')?.addEventListener('click', function () {
        var opening = !card.classList.contains('open');
        if (opening) {
          root.querySelectorAll('#behavior-score-list .collapse-card.open').forEach(function (c) { c.classList.remove('open'); });
          card.classList.add('open');
          state.openKr.behaviorScore = +card.dataset.behaviorScore;
        } else card.classList.remove('open');
      });
    });

  }

  if (state.step === 6) {

    root.querySelector('#self-summary')?.addEventListener('input', e => { state.selfSummary = e.target.value; });

  }

  if (state.step === 7) {

    root.querySelectorAll('#next-list .collapse-card').forEach(card => {

      const idx = +card.dataset.idx;

      card.querySelectorAll('[data-k]').forEach(inp => {

        inp.addEventListener('input', () => {

          state.nextMonthKrs[idx][inp.dataset.k] = inp.value;

          updateKrPreview(card, state.nextMonthKrs[idx], false);

        });

      });

      bindStandardTiers(card, state.nextMonthKrs[idx], rerender);

      card.querySelector('.remove-btn')?.addEventListener('click', e => {

        e.stopPropagation();

        state.nextMonthKrs.splice(idx, 1);

        state.openKr.next = 0;

        rerender(true);

      });

      card.querySelector('.collapse-head')?.addEventListener('click', e => {

        if (e.target.closest('.remove-btn')) return;

        const opening = !card.classList.contains('open');

        if (opening) {

          root.querySelectorAll('#next-list .collapse-card.open').forEach(c => c.classList.remove('open'));

          card.classList.add('open');

          state.openKr.next = idx;

        } else card.classList.remove('open');

      });

    });

    bindCollapseCards(root.querySelector('#next-list') || root, { single: false });

    root.querySelector('#add-next')?.addEventListener('click', () => {

      state.nextMonthKrs.push({ o:'', smart:'', weight:'', standardTiers: defaultStandardTiers(25), challenge:'' });

      state.openKr.next = state.nextMonthKrs.length - 1;

      rerender(true);

    });

  }

}



function initMonthlyWizard(opts) {

  const storageKey = opts.storageKey || 'perf-monthly-draft';

  let state = loadState(storageKey);

  seedDemoGoals(state);

  const stepperEl = document.getElementById('stepper');

  const bodyEl = document.getElementById('wizard-content');

  const headerEl = document.getElementById('form-header');

  const btnPrev = document.getElementById('btn-prev');

  const btnNext = document.getElementById('btn-next');

  const sideList = document.getElementById('side-steps');



  if (headerEl) renderHeader(headerEl);

  const urlParams = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
  const copyFromId = urlParams.get('copyFrom');
  if (copyFromId && typeof window.EmployeePastCopy !== 'undefined') {
    window.EmployeePastCopy.applySnapshotToMonthlyState(state, copyFromId);
    saveState(storageKey, state);
  }

  function mountCopyBar() {
    if (!bodyEl || !bodyEl.parentElement) return;
    let bar = document.getElementById('wizard-copy-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'wizard-copy-bar';
      bar.className = 'wizard-copy-bar';
      bodyEl.parentElement.insertBefore(bar, bodyEl);
    }
    const copiedTag = state.copiedFrom
      ? '<span class="wizard-copy-bar__tag">已复制自 ' + state.copiedFrom.periodLabel + '</span>'
      : '';
    const isMp = !!document.querySelector('.mp-device');
    bar.innerHTML =
      (isMp ? '' : '<span class="wizard-copy-bar__text">减少重复填写</span>') +
      '<button type="button" class="btn-copy-past" id="btn-copy-from-past">' +
      (isMp ? '从往期复制 KR' : '📋 从往期提交复制 KR') +
      '</button>' +
      copiedTag;
    bar.querySelector('#btn-copy-from-past')?.addEventListener('click', function () {
      if (!window.EmployeePastCopy) return;
      window.EmployeePastCopy.openModal({
        formType: 'month',
        storageKey: storageKey,
        onApplied: function () {
          state = loadState(storageKey);
          rerender(true);
        },
      });
    });
  }



  function rerender(full) {

    renderStepper(stepperEl, state, n => { state.step = n; saveState(storageKey, state); rerender(true); });

    bodyEl.innerHTML = renderStepContent(state);

    mountCopyBar();

    bindStepEvents(bodyEl, state, rerender);

    btnPrev.disabled = state.step === 1;

    btnNext.textContent = state.step === 8 ? '确认提交' : '下一步';

    if (sideList) {

      sideList.innerHTML = MONTHLY_STEPS.map(s => {

        const cls = s.id === state.step ? 'active' : '';

        return `<li class="${cls}" data-goto="${s.id}" style="cursor:pointer">${s.id}. ${s.title}</li>`;

      }).join('');

      sideList.querySelectorAll('[data-goto]').forEach(li => {

        li.addEventListener('click', () => {

          state.step = +li.dataset.goto;

          saveState(storageKey, state);

          rerender(true);

        });

      });

    }

    if (full) saveState(storageKey, state);

  }



  btnPrev.addEventListener('click', () => {

    if (state.step > 1) { state.step--; saveState(storageKey, state); rerender(true); }

  });



  btnNext.addEventListener('click', () => {

    if (state.step === 8) {

      alert('已提交（原型演示）');

      localStorage.removeItem(storageKey);

      if (opts.onSubmit) opts.onSubmit();

      return;

    }

    state.step++;

    saveState(storageKey, state);

    rerender(true);

  });



  rerender(true);

}



const QUARTERLY_STEPS = [

  { id: 1, title: '核心绩效 V%', phase: 0, subtitle: '【A】本季考评 · 1/9' },

  { id: 2, title: '常规绩效 X%', phase: 0, subtitle: '【A】本季考评 · 2/9' },

  { id: 3, title: '6Q3J 人才评价', phase: 0, subtitle: '【A】本季考评 · 3/9' },

  { id: 4, title: '加减分', phase: 0, subtitle: '【A】本季考评 · 4/9' },

  { id: 5, title: '绩效面谈', phase: 0, subtitle: '【A】本季考评 · 5/9' },

  { id: 6, title: '自评打分', phase: 0, subtitle: '【A】本季考评 · 6/9' },

  { id: 7, title: '自评总结', phase: 0, subtitle: '【A】本季考评 · 7/9' },

  { id: 8, title: '下季核心目标', phase: 1, subtitle: '【B】下季目标 · 8/9' },

  { id: 9, title: '确认提交', phase: 2, subtitle: '确认提交 · 9/9' },

];

const Q_PHASE_BLOCKS = [
  { id: 0, name: '【A】本季考评', desc: '工作 KR · 6Q3J · 加减分 · 面谈 · 自评', steps: [1, 2, 3, 4, 5, 6, 7] },
  { id: 1, name: '【B】下季目标', desc: '下季核心 KR 2–3 项', steps: [8] },
  { id: 2, name: '确认提交', desc: '校验并提交', steps: [9] },
];

const QUARTER_MOCK_HEADER = {
  name: '张明',
  dept: '信息部',
  role: '产品经理',
  reviewer: '李总监',
  period: '2026 Q2',
  fillDate: '2026-06-01',
  audience: '全职员工',
};



function initQuarterlyWizard(opts) {

  let step = 1;

  const sixQ = { cert: 4, culture: 2.5, ai: 2.5 };

  const interview = { highlight: '', improve: '', plan: '', support: '' };

  let selfSummary = '';

  const qState = {
    coreKrs: [emptyKr('V')],
    regularKrs: [emptyKr('X')],
    nextSeasonKrs: [
      { o: '', smart: '', weight: '', standardTiers: defaultStandardTiers(30), challenge: '' },
      { o: '', smart: '', weight: '', standardTiers: defaultStandardTiers(30), challenge: '' },
    ],
    openKr: {},
  };

  const stepperEl = document.getElementById('stepper');

  const bodyEl = document.getElementById('wizard-content');

  const headerEl = document.getElementById('form-header');

  const btnPrev = document.getElementById('btn-prev');

  const btnNext = document.getElementById('btn-next');

  const sideList = document.getElementById('side-steps');

  if (headerEl) renderHeader(headerEl, opts.header || QUARTER_MOCK_HEADER);



  function renderQStepper() {

    renderPhaseStepper(stepperEl, QUARTERLY_STEPS, Q_PHASE_BLOCKS, step, function (n) {
      step = n;
      refresh();
    });

  }



  function renderQBody() {

    if (step === 1 || step === 2) {

      const listKey = step === 1 ? 'coreKrs' : 'regularKrs';
      const openKey = step === 1 ? 'core' : 'regular';
      const label = step === 1 ? '核心 V' : '常规 X';
      const krs = qState[listKey];

      bodyEl.innerHTML =
        '<p class="section-desc">【A】' + (step === 1 ? '核心绩效 V%' : '常规绩效 X%') + ' · 填写 O / SMART / 权重 / 考核标准分档。</p>' +
        collapseToolbar('kr-list') +
        '<div id="kr-list">' + krs.map(function (k, i) {
          return krFields(k, i, label, false, openKey + '-' + i, isKrOpen(qState, openKey, i));
        }).join('') + '</div>' +
        '<button type="button" class="btn btn-block" id="add-kr" style="margin-top:8px">+ 添加指标</button>';

      bindListToolbar(bodyEl, 'kr-list');
      bindKrCards(bodyEl, listKey, qState, function (full) { if (full) renderQBody(); }, false);
      bodyEl.querySelector('#add-kr')?.addEventListener('click', function () {
        qState[listKey].push(emptyKr(step === 1 ? 'V' : 'X'));
        qState.openKr[openKey] = qState[listKey].length - 1;
        renderQBody();
      });

    } else if (step === 3) {

      bodyEl.innerHTML = `

        <p class="section-desc">6Q3J 客观分只读。</p>

        <div class="collapse-card open"><button type="button" class="collapse-head"><span class="collapse-title">1368 认证</span><span class="collapse-preview">${sixQ.cert} 分</span><span class="collapse-chevron">▼</span></button><div class="collapse-body"><div class="field-readonly">${sixQ.cert} / 4 分 · 系统导入</div></div></div>

        <div class="collapse-card"><button type="button" class="collapse-head"><span class="collapse-title">文化经句践行</span><span class="collapse-preview">${sixQ.culture} 分</span><span class="collapse-chevron">▼</span></button><div class="collapse-body"><div class="field-readonly">${sixQ.culture} / 3 分</div></div></div>

        <div class="collapse-card"><button type="button" class="collapse-head"><span class="collapse-title">AI 提效应用</span><span class="collapse-preview">${sixQ.ai} 分</span><span class="collapse-chevron">▼</span></button><div class="collapse-body"><div class="field-readonly">${sixQ.ai} / 3 分</div></div></div>

      `;

      bindCollapseCards(bodyEl);

    } else if (step === 5) {

      bodyEl.innerHTML = `

        <p class="section-desc">绩效面谈四段（折叠填写）。</p>

        ${['工作亮点','待提升方面','改进计划','所需支持'].map((l,i)=>`

          <div class="collapse-card ${i===0?'open':''}">

            <button type="button" class="collapse-head"><span class="collapse-title">${l}</span><span class="collapse-preview">${Object.values(interview)[i] || '选填'}</span><span class="collapse-chevron">▼</span></button>

            <div class="collapse-body"><textarea rows="3" data-iv="${i}">${Object.values(interview)[i]}</textarea></div>

          </div>

        `).join('')}

      `;

      bindCollapseCards(bodyEl);

      bodyEl.querySelectorAll('[data-iv]').forEach(ta => {

        ta.addEventListener('input', () => {

          interview[Object.keys(interview)[+ta.dataset.iv]] = ta.value;

          ta.closest('.collapse-card').querySelector('.collapse-preview').textContent = ta.value || '选填';

        });

      });

    } else if (step === 6) {

      const demoKr = qState.coreKrs[0];
      ensureStandardTiers(demoKr);

      bodyEl.innerHTML =
        '<p class="section-desc">【A】自评打分 · 对照考核标准分档填写 M 与自评分。</p>' +
        '<div class="collapse-card open">' +
        '<button type="button" class="collapse-head"><span class="collapse-title">核心 V 1</span><span class="collapse-preview">' + (typeof krPreview === 'function' ? krPreview(demoKr, true) : '指标 1') + '</span><span class="collapse-chevron">▼</span></button>' +
        '<div class="collapse-body">' +
        '<div class="kr-card">' +
        renderStandardTiersHtml(demoKr, false) +
        '<div class="field"><label>关键成果 M</label><textarea rows="2" data-qm>' + (demoKr.m || '') + '</textarea></div>' +
        '<div class="field"><label>自评分（1-5）</label><input type="number" min="1" max="5" step="0.1" data-qscore value="' + (demoKr.selfScore || '') + '" /></div>' +
        '</div></div></div>';

      bindCollapseCards(bodyEl);
      bodyEl.querySelector('[data-qm]')?.addEventListener('input', function (e) { demoKr.m = e.target.value; });
      bodyEl.querySelector('[data-qscore]')?.addEventListener('input', function (e) { demoKr.selfScore = e.target.value; });

    } else if (step === 7) {

      bodyEl.innerHTML = `<div class="field"><label>自评总结</label><textarea rows="6" id="q-summary">${selfSummary}</textarea></div>`;

      bodyEl.querySelector('#q-summary').addEventListener('input', e => { selfSummary = e.target.value; });

    } else if (step === 8) {

      bodyEl.innerHTML =
        '<p class="section-desc">【B】下季核心目标 2–3 项 · 含考核标准分档。</p>' +
        collapseToolbar('next-list') +
        '<div id="next-list">' + qState.nextSeasonKrs.map(function (k, i) {
          return nextMonthFields(k, i, isKrOpen(qState, 'next', i));
        }).join('') + '</div>' +
        '<button type="button" class="btn btn-block" id="add-next" style="margin-top:8px">+ 添加目标</button>';

      bindListToolbar(bodyEl, 'next-list');
      bodyEl.querySelectorAll('#next-list .collapse-card').forEach(function (card) {
        var idx = +card.dataset.idx;
        card.querySelectorAll('[data-k]').forEach(function (inp) {
          inp.addEventListener('input', function () {
            qState.nextSeasonKrs[idx][inp.dataset.k] = inp.value;
            updateKrPreview(card, qState.nextSeasonKrs[idx], false);
          });
        });
        bindStandardTiers(card, qState.nextSeasonKrs[idx], function () { renderQBody(); });
        card.querySelector('.remove-btn')?.addEventListener('click', function (e) {
          e.stopPropagation();
          qState.nextSeasonKrs.splice(idx, 1);
          qState.openKr.next = 0;
          renderQBody();
        });
        card.querySelector('.collapse-head')?.addEventListener('click', function (e) {
          if (e.target.closest('.remove-btn')) return;
          var opening = !card.classList.contains('open');
          if (opening) {
            bodyEl.querySelectorAll('#next-list .collapse-card.open').forEach(function (c) { c.classList.remove('open'); });
            card.classList.add('open');
            qState.openKr.next = idx;
          } else card.classList.remove('open');
        });
      });
      bodyEl.querySelector('#add-next')?.addEventListener('click', function () {
        qState.nextSeasonKrs.push({ o: '', smart: '', weight: '', standardTiers: defaultStandardTiers(25), challenge: '' });
        qState.openKr.next = qState.nextSeasonKrs.length - 1;
        renderQBody();
      });

    } else if (step === 4) {

      bodyEl.innerHTML = `<p class="section-desc">季度加减分申报</p><button class="btn">+ 添加加减分项</button>`;

    } else {

      bodyEl.innerHTML = `<table class="confirm-table"><tr><th>区块</th><th>状态</th></tr><tr><td>工作 KR</td><td>—</td></tr><tr><td>6Q3J</td><td>只读</td></tr></table>`;

    }

  }



  function refresh() {

    renderQStepper();

    renderQBody();

    btnPrev.disabled = step === 1;

    btnNext.textContent = step === QUARTERLY_STEPS.length ? '确认提交' : '下一步';

    if (sideList) {
      sideList.innerHTML = QUARTERLY_STEPS.map(function (s) {
        var cls = s.id === step ? 'active' : '';
        return '<li class="' + cls + '" data-goto="' + s.id + '" style="cursor:pointer;padding:6px 0;border-bottom:1px solid #f5f5f5">' + s.id + '. ' + s.title + '</li>';
      }).join('');
      sideList.querySelectorAll('[data-goto]').forEach(function (li) {
        li.addEventListener('click', function () {
          step = +li.dataset.goto;
          refresh();
        });
      });
    }

  }



  btnPrev.addEventListener('click', () => { if (step > 1) { step--; refresh(); } });

  btnNext.addEventListener('click', () => {

    if (step === QUARTERLY_STEPS.length) { alert('季度表已提交（原型）'); if (opts.onSubmit) opts.onSubmit(); return; }

    step++; refresh();

  });

  refresh();

}



if (typeof window !== 'undefined') {

  window.initMonthlyWizard = initMonthlyWizard;

  window.initQuarterlyWizard = initQuarterlyWizard;

}

