/**

 * HR · 绩效奖金规则配置 & 计划实时结算

 * 见 docs/GRILL_BONUS_RULES.md

 */

(function () {

  'use strict';



  var BONUS_LEVELS = ['总监', '经理', '主管', '职员'];



  var MOCK_RULES = [

    {

      id: 'br-month-director',

      name: '2026 · 月度·总监排名奖扣',

      type: 'month',

      level: '总监',

      status: 'enabled',

      minGroupSize: 3,

      tieBreak: 'same_rank',

      bonusTiers: [

        { rank: 1, mode: 'fixed', amount: 1200 },

        { rank: 2, mode: 'fixed', amount: 800 },

      ],

      penaltyTiers: [

        { rankFromEnd: 1, mode: 'fixed', amount: 400 },

      ],

      updatedAt: '2026-05-20',

      usedByPlans: 2,

    },

    {

      id: 'br-month-manager',

      name: '2026 · 月度·经理排名奖扣',

      type: 'month',

      level: '经理',

      status: 'enabled',

      minGroupSize: 3,

      tieBreak: 'same_rank',

      bonusTiers: [

        { rank: 1, mode: 'fixed', amount: 1000 },

        { rank: 2, mode: 'fixed', amount: 600 },

        { rank: 3, mode: 'fixed', amount: 400 },

      ],

      penaltyTiers: [

        { rankFromEnd: 1, mode: 'fixed', amount: 350 },

        { rankFromEnd: 2, mode: 'fixed', amount: 150 },

      ],

      updatedAt: '2026-05-20',

      usedByPlans: 2,

    },

    {

      id: 'br-month-supervisor',

      name: '2026 · 月度·主管排名奖扣',

      type: 'month',

      level: '主管',

      status: 'enabled',

      minGroupSize: 3,

      tieBreak: 'same_rank',

      bonusTiers: [

        { rank: 1, mode: 'fixed', amount: 800 },

        { rank: 2, mode: 'fixed', amount: 500 },

        { rank: 3, mode: 'fixed', amount: 300 },

      ],

      penaltyTiers: [

        { rankFromEnd: 1, mode: 'fixed', amount: 300 },

        { rankFromEnd: 2, mode: 'fixed', amount: 150 },

      ],

      updatedAt: '2026-05-20',

      usedByPlans: 2,

    },

    {

      id: 'br-month-staff',

      name: '2026 · 月度·职员排名奖扣',

      type: 'month',

      level: '职员',

      status: 'enabled',

      minGroupSize: 4,

      tieBreak: 'same_rank',

      bonusTiers: [

        { rank: 1, mode: 'fixed', amount: 500 },

        { rank: 2, mode: 'fixed', amount: 300 },

      ],

      penaltyTiers: [],

      updatedAt: '2026-05-18',

      usedByPlans: 2,

    },

    {

      id: 'br-staff-lite',

      name: '职员轻量奖扣（无扣减）· 旧版',

      type: 'month',

      level: '职员',

      status: 'disabled',

      minGroupSize: 4,

      tieBreak: 'same_rank',

      bonusTiers: [

        { rank: 1, mode: 'fixed', amount: 500 },

        { rank: 2, mode: 'fixed', amount: 300 },

      ],

      penaltyTiers: [],

      updatedAt: '2026-04-10',

      usedByPlans: 1,

    },

    {

      id: 'br-quarter-manager',

      name: '2026 Q2 · 季度·经理加强版',

      type: 'quarter',

      level: '经理',

      status: 'enabled',

      minGroupSize: 3,

      tieBreak: 'same_rank',

      bonusTiers: [

        { rank: 1, mode: 'percent', amount: 5 },

        { rank: 2, mode: 'percent', amount: 3 },

        { rank: 3, mode: 'fixed', amount: 600 },

      ],

      penaltyTiers: [

        { rankFromEnd: 1, mode: 'fixed', amount: 800 },

        { rankFromEnd: 2, mode: 'percent', amount: 2 },

      ],

      updatedAt: '2026-05-28',

      usedByPlans: 0,

    },

  ];



  var PREVIEW_SAMPLE = [

    { name: '张明', no: 'E10021', scope: '信息部-核心岗', level: '主管', totalScore: 92.5 },

    { name: '孙丽', no: 'E20018', scope: '信息部-核心岗', level: '主管', totalScore: 88.0 },

    { name: '吴磊', no: 'E20022', scope: '信息部-核心岗', level: '主管', totalScore: 88.0 },

    { name: '陈刚', no: 'E10060', scope: '信息部-核心岗', level: '主管', totalScore: 78.0 },

    { name: '林峰', no: 'E10061', scope: '信息部-核心岗', level: '主管', totalScore: 72.5 },

  ];



  var PLAN_SETTLEMENT_ROWS = [

    { name: '张明', no: 'E10021', org: '信息部', scopeId: 'sp1', scopeName: '信息部-核心岗', level: '主管', totalScore: 92.5, supervisorDone: true, divisionDone: true, submitted: true, employeeConfirmed: true, supervisorConfirmed: false },

    { name: '王芳', no: 'E10035', org: '信息部', scopeId: 'sp1', scopeName: '信息部-核心岗', level: '职员', totalScore: 86.0, supervisorDone: true, divisionDone: true, submitted: true, employeeConfirmed: false, supervisorConfirmed: false },

    { name: '李强', no: 'E10008', org: '信息部', scopeId: 'sp1', scopeName: '信息部-核心岗', level: '总监', totalScore: 94.0, supervisorDone: true, divisionDone: true, submitted: true, employeeConfirmed: true, supervisorConfirmed: true, mergedReview: true },

    { name: '韩梅', no: 'E10077', org: '信息部', scopeId: 'sp1', scopeName: '信息部-核心岗', level: '经理', totalScore: 89.5, supervisorDone: true, divisionDone: true, submitted: true, employeeConfirmed: true, supervisorConfirmed: true, mergedReview: true },

    { name: '赵敏', no: 'E20011', org: '广州办事处', scopeId: 'sp2', scopeName: '办事处+职能', level: '经理', totalScore: 88.0, supervisorDone: true, divisionDone: false, submitted: true },

    { name: '陈伟', no: 'E20015', org: '广州办事处', scopeId: 'sp2', scopeName: '办事处+职能', level: '职员', totalScore: null, supervisorDone: true, divisionDone: false, submitted: true },

    { name: '刘洋', no: 'E10042', org: '人才开发部', scopeId: 'sp2', scopeName: '办事处+职能', level: '职员', totalScore: 81.0, supervisorDone: true, divisionDone: true, submitted: true },

    { name: '周婷', no: 'E10055', org: '行政管理部', scopeId: 'sp2', scopeName: '办事处+职能', level: '经理', totalScore: 90.0, supervisorDone: true, divisionDone: true, submitted: true },

    { name: '吴磊', no: 'E20022', org: '深圳办事处', scopeId: 'sp2', scopeName: '办事处+职能', level: '主管', totalScore: null, supervisorDone: false, divisionDone: false, submitted: false },

  ];



  function getRule(id) {

    return MOCK_RULES.filter(function (r) { return r.id === id; })[0] || null;

  }



  function typesOverlap(a, b) {

    if (a === 'both' || b === 'both') return true;

    return a === b;

  }



  function getEnabledRules(type) {

    return MOCK_RULES.filter(function (r) {

      return r.status === 'enabled' && (!type || r.type === type || r.type === 'both');

    });

  }



  function getEnabledRuleForPlanLevel(planType, level) {

    return MOCK_RULES.filter(function (r) {

      return r.status === 'enabled' && r.level === level && typesOverlap(r.type, planType);

    })[0] || null;

  }



  function getEnabledRulesByLevel(planType) {

    return BONUS_LEVELS.map(function (lv) {

      return { level: lv, rule: getEnabledRuleForPlanLevel(planType, lv) };

    });

  }



  /** 同职级 + 适用类型重叠时，启用态互斥（Q5） */

  function findEnabledLevelConflict(type, level, excludeId) {

    return MOCK_RULES.filter(function (r) {

      return r.status === 'enabled' && r.level === level && r.id !== excludeId && typesOverlap(r.type, type);

    })[0] || null;

  }



  function validateUniqueEnabledLevel(type, level, status, excludeId) {

    if (status !== 'enabled') return { ok: true };

    if (!level) return { ok: false, message: '请选择适用职级。' };

    var conflict = findEnabledLevelConflict(type, level, excludeId);

    if (!conflict) return { ok: true };

    return {

      ok: false,

      message: '职级「' + level + '」在' + typeLabel(type) + '（及月/季通用重叠范围）下已有启用规则「' + conflict.name + '」。请先停用旧规则，或将本条设为停用。',

      conflict: conflict,

    };

  }



  function typeLabel(t) {

    return { month: '月度', quarter: '季度', both: '月/季通用' }[t] || t;

  }



  function statusTag(st) {

    return st === 'enabled' ? '<span class="q-tag q-tag-green">启用</span>' : '<span class="q-tag">停用</span>';

  }



  function formatTiersSummary(rule) {

    var b = (rule.bonusTiers || []).map(function (t) {

      return '第' + t.rank + ' +' + t.amount + (t.mode === 'percent' ? '%' : '元');

    }).join('；');

    var p = (rule.penaltyTiers || []).map(function (t) {

      return '末' + t.rankFromEnd + ' -' + t.amount + (t.mode === 'percent' ? '%' : '元');

    }).join('；');

    return (b || '无加奖') + (p ? ' · ' + p : '');

  }



  function divisionReady(row) {

    return row.divisionDone || (row.mergedReview && row.supervisorDone);

  }



  function isSettled(row) {

    return row.submitted && row.supervisorDone && divisionReady(row) && row.totalScore != null &&
      row.employeeConfirmed && row.supervisorConfirmed;

  }



  function settlementBlockReason(row) {

    if (!row.submitted) return '员工未提交';

    if (!row.supervisorDone) return row.mergedReview ? '待上级/分管合并评分' : '待上级评分';

    if (!divisionReady(row)) return '待分管领导评分';

    if (row.totalScore == null) return '待出总分';

    if (!row.employeeConfirmed || !row.supervisorConfirmed) return '待双方确认评分';

    return '';

  }



  function assignRanks(sorted) {

    var rankMap = {};

    var scoreCount = {};

    var rank = 1;

    for (var i = 0; i < sorted.length; i++) {

      if (i > 0 && sorted[i].totalScore < sorted[i - 1].totalScore) rank = i + 1;

      var key = sorted[i].no || sorted[i].name;

      rankMap[key] = rank;

      scoreCount[sorted[i].totalScore] = (scoreCount[sorted[i].totalScore] || 0) + 1;

    }

    return { rankMap: rankMap, scoreCount: scoreCount };

  }



  function calculateGroupBonus(people, rule) {

    if (people.length < (rule.minGroupSize || 1)) {

      return people.map(function (p) {

        return Object.assign({}, p, { rank: '—', bonusAdjust: 0, bonusNote: '人数不足 ' + rule.minGroupSize + '，不排名' });

      });

    }



    var sorted = people.slice().sort(function (a, b) { return b.totalScore - a.totalScore; });

    var meta = assignRanks(sorted);



    return people.map(function (p) {

      var key = p.no || p.name;

      var r = meta.rankMap[key];

      var adjust = 0;

      var notes = [];

      var tied = meta.scoreCount[p.totalScore] > 1;



      (rule.bonusTiers || []).forEach(function (t) {

        if (r === t.rank) {

          adjust += t.mode === 'percent' ? Math.round(p.totalScore * t.amount) / 100 : t.amount;

          notes.push('第' + t.rank + '名加奖' + (tied ? '（并列）' : ''));

        }

      });



      (rule.penaltyTiers || []).forEach(function (t) {

        var penaltyRank = sorted.length - t.rankFromEnd + 1;

        if (r === penaltyRank) {

          var amt = t.mode === 'percent' ? Math.round(p.totalScore * t.amount) / 100 : t.amount;

          adjust -= amt;

          notes.push('末' + t.rankFromEnd + '扣减' + (tied ? '（并列）' : ''));

        }

      });



      return Object.assign({}, p, {

        rank: r,

        bonusAdjust: adjust,

        bonusNote: notes.length ? notes.join(' + ') : '—',

        isTied: tied,

      });

    });

  }



  function settlePlanBonus(rows, planType) {

    if (!planType) {

      return rows.map(function (r) {

        return Object.assign({}, r, { rank: '—', bonusAdjust: null, bonusNote: '未指定计划类型', settleStatus: 'pending' });

      });

    }



    var settled = rows.filter(isSettled);

    var groups = {};

    settled.forEach(function (r) {

      var gk = r.scopeId + '::' + r.level;

      if (!groups[gk]) groups[gk] = { level: r.level, people: [] };

      groups[gk].people.push({ name: r.name, no: r.no, scope: r.scopeName, level: r.level, totalScore: r.totalScore });

    });



    var bonusByNo = {};

    Object.keys(groups).forEach(function (gk) {

      var group = groups[gk];

      var rule = getEnabledRuleForPlanLevel(planType, group.level);

      if (!rule) {

        group.people.forEach(function (p) {

          bonusByNo[p.no] = Object.assign({}, p, { rank: '—', bonusAdjust: 0, bonusNote: '职级「' + group.level + '」无启用规则' });

        });

        return;

      }

      calculateGroupBonus(group.people, rule).forEach(function (p) { bonusByNo[p.no] = p; });

    });



    return rows.map(function (r) {

      if (!isSettled(r)) {

        return Object.assign({}, r, {

          rank: '—',

          bonusAdjust: null,

          bonusNote: settlementBlockReason(r),

          settleStatus: 'pending',

        });

      }

      var calc = bonusByNo[r.no] || {};

      return Object.assign({}, r, {

        rank: calc.rank,

        bonusAdjust: calc.bonusAdjust,

        bonusNote: calc.bonusNote || '—',

        isTied: calc.isTied,

        settleStatus: 'done',

      });

    });

  }



  function renderPreviewTable(rule, sample) {

    sample = sample || PREVIEW_SAMPLE;

    var result = calculateGroupBonus(sample, rule);

    result.sort(function (a, b) { return (a.rank === '—' ? 99 : a.rank) - (b.rank === '—' ? 99 : b.rank); });

    return '<table class="q-table"><thead><tr><th>排名</th><th>姓名</th><th>范围包</th><th>职级</th><th>总得分</th><th>奖扣调整</th><th>说明</th></tr></thead><tbody>' +

      result.map(function (p) {

        var cls = p.bonusAdjust > 0 ? 'style="color:#389e0d"' : p.bonusAdjust < 0 ? 'style="color:#cf1322"' : '';

        var rankTxt = p.isTied ? p.rank + ' <span class="q-tag" style="font-size:11px">并列</span>' : p.rank;

        return '<tr><td>' + rankTxt + '</td><td>' + p.name + '</td><td>' + p.scope + '</td><td>' + p.level + '</td>' +

          '<td><b>' + p.totalScore + '</b></td><td ' + cls + '><b>' + (p.bonusAdjust > 0 ? '+' : '') + p.bonusAdjust + '</b></td>' +

          '<td class="muted">' + p.bonusNote + '</td></tr>';

      }).join('') + '</tbody></table>';

  }



  function renderSettlementTable(rows, planType, opts) {

    opts = opts || {};

    var settled = settlePlanBonus(rows, planType);

    var stats = { done: 0, waitSup: 0, waitDivision: 0 };

    settled.forEach(function (r) {

      if (r.settleStatus === 'done') stats.done++;

      else if (!r.supervisorDone) stats.waitSup++;

      else if (!divisionReady(r)) stats.waitDivision++;

    });



    var html = '';

    if (!opts.hideStats) {

      html += '<div class="hr-settle-stats">' +

        '<span class="hr-settle-stat"><b style="color:#389e0d">' + stats.done + '</b> 人已结算</span>' +

        '<span class="hr-settle-stat"><b style="color:#faad14">' + stats.waitSup + '</b> 待上级</span>' +

        '<span class="hr-settle-stat"><b style="color:#fa8c16">' + stats.waitDivision + '</b> 待分管领导</span>' +

        '<span class="muted" style="margin-left:auto;font-size:12px">🔒 仅 HR / 薪酬可见</span></div>';

    }



    if (planType) {

      var levelRules = getEnabledRulesByLevel(planType).filter(function (x) { return x.rule; });

      html += '<p style="font-size:13px;margin:8px 0"><b>按职级匹配 ' + levelRules.length + ' 条启用规则</b> · 同分<strong>并列</strong>同名次</p>' +

        '<div class="hr-bonus-level-map">' + levelRules.map(function (x) {

          return '<span class="q-tag q-tag-blue" style="margin:0 6px 6px 0">' + x.level + ' → ' + x.rule.name +

            ' <span class="muted">(' + formatTiersSummary(x.rule) + ')</span></span>';

        }).join('') + '</div>';

    }



    html += '<div class="q-table-wrap"><table class="q-table"><thead><tr>' +

      '<th>姓名</th><th>范围包</th><th>职级</th><th>总得分</th><th>上级评分</th><th>分管领导评分</th>' +

      '<th>排名</th><th>奖扣调整</th><th>说明</th></tr></thead><tbody>';



    html += settled.map(function (r) {

      var mergedTag = r.mergedReview ? ' <span class="q-tag" style="font-size:11px">合并评</span>' : '';

      var sup = r.supervisorDone

        ? '<span class="q-tag q-tag-green">已完成</span>' + mergedTag

        : '<span class="q-tag q-tag-orange">待评</span>';

      var division = divisionReady(r)

        ? '<span class="q-tag q-tag-green">已完成</span>' + (r.mergedReview ? ' <span class="q-tag" style="font-size:11px">自动粘贴</span>' : '')

        : '<span class="q-tag q-tag-orange">待评</span>';

      var score = r.totalScore != null ? '<b>' + r.totalScore + '</b>' : '—';

      var rank = r.rank === '—' ? '—' : (r.isTied ? r.rank + ' 并列' : r.rank);

      var bonusCell = r.bonusAdjust == null ? '—' : '<b>' + (r.bonusAdjust > 0 ? '+' : '') + r.bonusAdjust + '</b>';

      var cls = r.bonusAdjust > 0 ? 'style="color:#389e0d"' : r.bonusAdjust < 0 ? 'style="color:#cf1322"' : '';

      return '<tr><td>' + r.name + '</td><td>' + r.scopeName + '</td><td>' + r.level + '</td><td>' + score + '</td>' +

        '<td>' + sup + '</td><td>' + division + '</td><td>' + rank + '</td><td ' + cls + '>' + bonusCell + '</td>' +

        '<td class="muted">' + r.bonusNote + '</td></tr>';

    }).join('') + '</tbody></table></div>';



    return html;

  }



  function renderRulesList() {

    var tbody = document.getElementById('bonus-rules-tbody');

    if (!tbody) return;

    tbody.innerHTML = MOCK_RULES.map(function (r) {

      return '<tr><td><a href="hr-bonus-rule-edit.html?id=' + r.id + '"><b>' + r.name + '</b></a></td>' +

        '<td>' + typeLabel(r.type) + '</td><td><span class="q-tag">' + r.level + '</span></td><td>范围包 · 并列</td>' +

        '<td style="font-size:12px">' + formatTiersSummary(r) + '</td><td>' + r.minGroupSize + ' 人</td>' +

        '<td>' + statusTag(r.status) + '</td><td>' + r.usedByPlans + '</td><td>' + r.updatedAt + '</td>' +

        '<td><a href="hr-bonus-rule-edit.html?id=' + r.id + '">编辑</a></td></tr>';

    }).join('');

  }



  function tierRowHtml(kind, data) {

    var isBonus = kind === 'bonus';

    var rankField = isBonus

      ? '<label>排名</label><input type="number" min="1" class="tier-rank" value="' + (data.rank || 1) + '" style="width:64px" />'

      : '<label>末位</label><input type="number" min="1" class="tier-rank-end" value="' + (data.rankFromEnd || 1) + '" style="width:64px" title="1=最后一名" />';

    return '<div class="hr-tier-row" data-kind="' + kind + '">' + rankField +

      '<label>模式</label><select class="tier-mode"><option value="fixed"' + (data.mode !== 'percent' ? ' selected' : '') + '>固定金额（元）</option>' +

      '<option value="percent"' + (data.mode === 'percent' ? ' selected' : '') + '>得分比例（%）</option></select>' +

      '<label>数值</label><input type="number" class="tier-amount" value="' + (data.amount || 0) + '" style="width:88px" step="0.1" />' +

      '<button type="button" class="hr-tier-del">删除</button></div>';

  }



  function collectTiers(container, kind) {

    return Array.prototype.slice.call(container.querySelectorAll('.hr-tier-row[data-kind="' + kind + '"]')).map(function (row) {

      var mode = row.querySelector('.tier-mode').value;

      var amount = +row.querySelector('.tier-amount').value || 0;

      if (kind === 'bonus') {

        return { rank: +row.querySelector('.tier-rank').value || 1, mode: mode, amount: amount };

      }

      return { rankFromEnd: +row.querySelector('.tier-rank-end').value || 1, mode: mode, amount: amount };

    });

  }



  function initBonusRuleEdit() {

    var params = new URLSearchParams(location.search);

    var id = params.get('id');

    var isNew = !id || id === 'new';

    var rule = isNew ? {

      name: '', type: 'month', level: '主管', status: 'enabled', minGroupSize: 3,

      bonusTiers: [

        { rank: 1, mode: 'fixed', amount: 800 },

        { rank: 2, mode: 'fixed', amount: 500 },

        { rank: 3, mode: 'fixed', amount: 300 },

      ],

      penaltyTiers: [

        { rankFromEnd: 1, mode: 'fixed', amount: 300 },

        { rankFromEnd: 2, mode: 'fixed', amount: 150 },

      ],

    } : getRule(id);



    if (!rule) {

      document.getElementById('bonus-edit-body').innerHTML = '<p class="hr-hint">规则不存在</p>';

      return;

    }



    document.getElementById('bonus-edit-title').textContent = isNew ? '新建奖金规则' : rule.name;

    var body = document.getElementById('bonus-edit-body');

    body.innerHTML =

      '<div class="hr-form-grid">' +

      '<div class="hr-field"><label>规则名称</label><input id="f-name" value="' + (rule.name || '') + '" /></div>' +

      '<div class="hr-field"><label>适用考核类型</label><select id="f-type">' +

      ['month', 'quarter', 'both'].map(function (t) {

        return '<option value="' + t + '"' + (rule.type === t ? ' selected' : '') + '>' + typeLabel(t) + '</option>';

      }).join('') + '</select></div>' +

      '<div class="hr-field"><label>适用职级</label><select id="f-level">' +

      BONUS_LEVELS.map(function (lv) {

        return '<option value="' + lv + '"' + ((rule.level || '主管') === lv ? ' selected' : '') + '>' + lv + '</option>';

      }).join('') + '</select>' +

      '<span class="field-hint">每条规则对应一个职级；同职级不可重复启用</span></div>' +

      '<div class="hr-field"><label>状态</label><select id="f-status">' +

      '<option value="enabled"' + (rule.status === 'enabled' ? ' selected' : '') + '>启用</option>' +

      '<option value="disabled"' + (rule.status !== 'enabled' ? ' selected' : '') + '>停用</option></select>' +

      '<span class="field-hint">同职级 + 适用类型重叠时仅允许一条启用（见 GRILL_BONUS_RULES §4.3）</span></div>' +

      '<div class="hr-field"><label>最低成团人数</label><input type="number" id="f-min" min="2" value="' + rule.minGroupSize + '" />' +

      '<span class="field-hint">同范围包·同职级不足时不排名</span></div></div>' +

      '<p class="hr-section-label" style="margin-top:20px">排名规则</p>' +

      '<div class="hr-rank-dim">' +

      '<span class="q-tag q-tag-blue">同一计划</span> <span class="q-tag q-tag-blue">同一范围包</span> ' +

      '<span class="q-tag q-tag-blue">同一职级</span> <span class="q-tag q-tag-green">同分并列同名次</span></div>' +

      '<p class="hr-hint" style="margin-top:8px">奖扣支持 <b>固定元</b> 与 <b>得分比例%</b>；扣减可配末1、末2…多档。</p>' +

      '<p class="hr-section-label" style="margin-top:16px">加奖档</p><div id="bonus-tiers">' +

      rule.bonusTiers.map(function (t) { return tierRowHtml('bonus', t); }).join('') + '</div>' +

      '<button type="button" class="q-btn" id="btn-add-bonus">+ 加奖档</button>' +

      '<p class="hr-section-label" style="margin-top:20px">扣减档（末1 / 末2 / …）</p><div id="penalty-tiers">' +

      (rule.penaltyTiers.length ? rule.penaltyTiers.map(function (t) { return tierRowHtml('penalty', t); }).join('')

        : '<p class="muted" id="no-penalty">暂无扣减</p>') + '</div>' +

      '<button type="button" class="q-btn" id="btn-add-penalty">+ 扣减档</button>' +

      '<p class="hr-section-label" style="margin-top:24px">试算预览（含并列）</p>' +

      '<p class="hr-hint" style="margin-top:0">预览仅展示职级「' + (rule.level || '主管') + '」样例 · 孙丽、吴磊 88.0 并列第2 → 陈刚为第4</p>' +

      '<div id="bonus-preview" class="q-table-wrap"></div>';



    function readRuleFromForm() {

      return {

        minGroupSize: +document.getElementById('f-min').value || 3,

        bonusTiers: collectTiers(body, 'bonus'),

        penaltyTiers: collectTiers(body, 'penalty'),

      };

    }



    function refreshPreview() {

      var lv = document.getElementById('f-level').value;

      var sample = PREVIEW_SAMPLE.filter(function (p) { return p.level === lv; });

      if (!sample.length) sample = PREVIEW_SAMPLE;

      document.getElementById('bonus-preview').innerHTML = renderPreviewTable(Object.assign({}, rule, readRuleFromForm()), sample);

    }



    function bindTierEvents(scope) {

      scope.querySelectorAll('.hr-tier-del').forEach(function (btn) {

        btn.addEventListener('click', function () { btn.closest('.hr-tier-row').remove(); refreshPreview(); });

      });

      scope.querySelectorAll('input, select').forEach(function (el) {

        el.addEventListener('input', refreshPreview);

        el.addEventListener('change', refreshPreview);

      });

    }



    bindTierEvents(body);

    refreshPreview();

    document.getElementById('f-min').addEventListener('input', refreshPreview);

    document.getElementById('f-level').addEventListener('change', refreshPreview);



    document.getElementById('btn-add-bonus').addEventListener('click', function () {

      var box = document.getElementById('bonus-tiers');

      box.insertAdjacentHTML('beforeend', tierRowHtml('bonus', { rank: box.querySelectorAll('.hr-tier-row').length + 1, mode: 'fixed', amount: 0 }));

      bindTierEvents(box);

      refreshPreview();

    });



    document.getElementById('btn-add-penalty').addEventListener('click', function () {

      var noP = document.getElementById('no-penalty');

      if (noP) noP.remove();

      var box = document.getElementById('penalty-tiers');

      var n = box.querySelectorAll('.hr-tier-row').length + 1;

      box.insertAdjacentHTML('beforeend', tierRowHtml('penalty', { rankFromEnd: n, mode: 'fixed', amount: 0 }));

      bindTierEvents(box);

      refreshPreview();

    });



    document.getElementById('btn-save-rule').addEventListener('click', function () {

      var type = document.getElementById('f-type').value;

      var level = document.getElementById('f-level').value;

      var status = document.getElementById('f-status').value;

      var excludeId = isNew ? null : rule.id;

      var check = validateUniqueEnabledLevel(type, level, status, excludeId);

      if (!check.ok) {

        alert(check.message);

        return;

      }

      alert('规则已保存（原型）');

      location.href = 'hr-bonus-rules-list.html';

    });

  }



  function renderPlanBonusLevelPanel(containerId, planType) {

    var el = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;

    if (!el) return;

    var rows = getEnabledRulesByLevel(planType || 'month');

    var missing = rows.filter(function (x) { return !x.rule; }).map(function (x) { return x.level; });

    el.innerHTML =

      '<p class="hr-hint" style="margin-top:0">计划运行时按员工<strong>职级</strong>自动匹配下方启用规则（无需单选一条）。' +

      (missing.length ? ' <span style="color:#cf1322">缺：' + missing.join('、') + '</span>' : '') + '</p>' +

      '<div class="q-table-wrap"><table class="q-table"><thead><tr><th>职级</th><th>启用规则</th><th>奖扣摘要</th><th>最低人数</th></tr></thead><tbody>' +

      rows.map(function (x) {

        if (!x.rule) {

          return '<tr class="perf-row--locked"><td><b>' + x.level + '</b></td><td colspan="3" class="muted">未配置启用规则 · <a href="hr-bonus-rule-edit.html?id=new">去新建</a></td></tr>';

        }

        return '<tr><td><b>' + x.level + '</b></td><td>' + x.rule.name + '</td><td style="font-size:12px">' + formatTiersSummary(x.rule) +

          '</td><td>' + x.rule.minGroupSize + ' 人</td></tr>';

      }).join('') + '</tbody></table></div>';

  }



  /** @deprecated 保留兼容；计划向导请用 renderPlanBonusLevelPanel */

  function renderPlanBonusOptions(selectId, selectedId, planType) {

    var sel = document.getElementById(selectId);

    if (!sel) return;

    var rules = getEnabledRules(planType);

    sel.innerHTML = '<option value="">不启用排名奖扣</option>' +

      rules.map(function (r) {

        return '<option value="' + r.id + '"' + (r.id === selectedId ? ' selected' : '') + '>' + r.level + ' · ' + r.name + '</option>';

      }).join('');

  }



  function renderPlanBonusSettlement(containerId, planType, opts) {

    var el = document.getElementById(containerId);

    if (!el) return;

    el.innerHTML = renderSettlementTable(PLAN_SETTLEMENT_ROWS, planType, opts || {});

  }



  function initBonusSettlementPage() {

    var params = new URLSearchParams(location.search);

    var plan = params.get('plan') || '2026-05';

    var planType = plan.indexOf('Q') >= 0 || plan.indexOf('q') >= 0 ? 'quarter' : 'month';

    var title = document.getElementById('settle-plan-title');

    if (title) {

      title.textContent = plan.indexOf('Q') >= 0 ? '2026 ' + plan + ' 季度考核' : '2026年' + parseInt(plan.split('-')[1], 10) + '月考核';

    }

    renderPlanBonusSettlement('hr-settlement-body', planType, {});

  }



  window.initHrBonusRulesList = renderRulesList;

  window.initHrBonusRuleEdit = initBonusRuleEdit;

  window.initHrBonusSettlement = initBonusSettlementPage;

  window.getHrBonusRule = getRule;

  window.getHrBonusRulesByLevel = getEnabledRulesByLevel;

  window.renderPlanBonusLevelPanel = renderPlanBonusLevelPanel;

  window.renderPlanBonusOptions = renderPlanBonusOptions;

  window.renderPlanBonusSettlement = renderPlanBonusSettlement;

  window.renderPlanBonusPreview = function (cid, planType) { renderPlanBonusSettlement(cid, planType || 'month', {}); };

  window.formatHrBonusSummary = formatTiersSummary;

})();


