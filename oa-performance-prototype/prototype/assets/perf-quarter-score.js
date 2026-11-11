/**
 * 季度核定总分、专项得分、档次和建议金额。不读页面。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PerfQuarterScore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var TYPES = [
    { id: 'perf-110', label: '业绩超越：季度业绩指标不低于 110%', points: 2, dim: '业绩超越', cap: 6, mode: 'max' },
    { id: 'perf-130', label: '业绩超越：季度业绩指标不低于 130%', points: 4, dim: '业绩超越', cap: 6, mode: 'max' },
    { id: 'perf-150', label: '业绩超越：季度业绩指标不低于 150%', points: 6, dim: '业绩超越', cap: 6, mode: 'max' },
    { id: 'qty-1', label: '数量超越：超额完成 1 项核心关键指标', points: 1, dim: '数量超越', cap: 2, mode: 'sum' },
    { id: 'qty-2', label: '数量超越：超额完成 2 项核心关键指标', points: 2, dim: '数量超越', cap: 2, mode: 'sum' },
    { id: 'qual-1', label: '质量超越：交付成果提升 1 个等级', points: 1, dim: '质量超越', cap: 3, mode: 'max' },
    { id: 'qual-2', label: '质量超越：交付成果提升 2 个等级', points: 2, dim: '质量超越', cap: 3, mode: 'max' },
    { id: 'qual-3', label: '质量超越：交付成果卓越，可作为标杆案例', points: 3, dim: '质量超越', cap: 3, mode: 'max' },
    { id: 'time-20', label: '时间超越：整体提前率不低于 20% 且有可验证效果', points: 1, dim: '时间超越', cap: 2, mode: 'max' },
    { id: 'time-50', label: '时间超越：部分提前率不低于 50% 且有可验证效果', points: 1, dim: '时间超越', cap: 2, mode: 'max' },
    { id: 'time-40', label: '时间超越：整体不低于 40% 或部分不低于 80%', points: 2, dim: '时间超越', cap: 2, mode: 'max' },
    { id: 'strat-2', label: '战略价值：支撑集团战略里程碑超预期', points: 2, dim: '战略价值', cap: 6, mode: 'max' },
    { id: 'strat-4', label: '战略价值：主导新业务从 0 到 1 落地验证成功', points: 4, dim: '战略价值', cap: 6, mode: 'max' },
    { id: 'strat-6', label: '战略价值：驱动集团战略方向调整或年度标杆', points: 6, dim: '战略价值', cap: 6, mode: 'max' },
    { id: 'econ-1', label: '经济价值：降本、增收或提效超过目标不低于 10%', points: 1, dim: '经济价值', cap: 3, mode: 'max' },
    { id: 'econ-2', label: '经济价值：降本、增收或提效超过目标不低于 20%', points: 2, dim: '经济价值', cap: 3, mode: 'max' },
    { id: 'econ-3', label: '经济价值：超过目标不低于 30% 且可复制方案被推广', points: 3, dim: '经济价值', cap: 3, mode: 'max' },
    { id: 'mgmt-1', label: '管理价值：优化 1 项管理流程，提效不低于 20%', points: 1, dim: '管理价值', cap: 3, mode: 'max' },
    { id: 'mgmt-2', label: '管理价值：优化 2 项，其中 1 项提效不低于 40%', points: 2, dim: '管理价值', cap: 3, mode: 'max' },
    { id: 'mgmt-3', label: '管理价值：优化 2 项以上，SOP 被至少 2 个部门采纳', points: 3, dim: '管理价值', cap: 3, mode: 'max' },
    { id: 'brand', label: '品牌价值', points: 3, dim: '品牌价值', cap: 3, mode: 'max', hrOnly: true },
    { id: 'other', label: '其它超越', points: 3, dim: '其它超越', cap: 3, mode: 'max', hrOnly: true }
  ];

  var LEVEL = { '专员': 1, '职员': 1, '主管': 1.1, '经理': 1.2, '总监': 1.3, '副总经理': 1.4 };
  var BASE = { A: 800, B: 600, C: 300 };

  function typeById(id) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === id) return TYPES[i];
    return null;
  }

  function employeeTypes() {
    return TYPES.filter(function (t) { return !t.hrOnly; });
  }

  function round1(n) {
    return Math.round((Number(n) + Number.EPSILON) * 10) / 10;
  }

  function num(v) {
    if (v === null || v === undefined || v === '') return 0;
    var n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  function composite(row) {
    return num(row.self) * 0.2 + num(row.supervisor) * 0.4 + num(row.division) * 0.4;
  }

  function compute(input) {
    input = input || {};
    var penaltyRows = input.penaltyRows || [];
    for (var p = 0; p < penaltyRows.length; p++) {
      ['self', 'supervisor', 'division'].forEach(function (k) {
        var raw = penaltyRows[p][k];
        if (raw === null || raw === undefined || raw === '') return;
        if (Number(raw) > 0) {
          input.__penaltyError = '减分必须小于等于 0';
        }
      });
    }
    if (input.__penaltyError) return { ok: false, error: input.__penaltyError };

    var workTotal = round1((input.workRows || []).reduce(function (s, row) { return s + composite(row); }, 0));
    var penaltyTotal = round1(penaltyRows.reduce(function (s, row) { return s + composite(row); }, 0));
    var sixqTotal = num(input.sixqTotal);
    var assessedTotal = round1(workTotal + sixqTotal + penaltyTotal);
    var adoptedTotal = input.hrFinalTotal === null || input.hrFinalTotal === undefined || input.hrFinalTotal === ''
      ? assessedTotal
      : round1(input.hrFinalTotal);

    var incentive = aggregate(input.incentiveRows || []);
    var tier = pickTier(adoptedTotal, incentive);
    if (input.tierOverride) tier.finalTier = input.tierOverride;
    var amount = money(tier.finalTier, input.level);

    return {
      ok: true,
      workTotal: workTotal,
      penaltyTotal: penaltyTotal,
      sixqTotal: sixqTotal,
      assessedTotal: assessedTotal,
      adoptedTotal: adoptedTotal,
      incentiveTotal: incentive.total,
      dimensions: incentive.dimensions,
      pending: incentive.pending,
      suggestedTier: tier.suggestedTier,
      finalTier: tier.finalTier,
      suggestedAmount: amount.amount,
      amountNote: amount.note
    };
  }

  function aggregate(rows) {
    var pending = false;
    var kept = [];
    var byObj = {};
    rows.forEach(function (row) {
      if (!row || !row.typeId) return;
      var type = typeById(row.typeId);
      if (!type) return;
      if (row.finalScore === null || row.finalScore === undefined || row.finalScore === '') {
        pending = true;
        return;
      }
      var score = Number(row.finalScore);
      if (isNaN(score)) return;
      if (score < 0) score = 0;
      if (score > type.points) score = type.points;
      var key = String(row.objective || '').trim();
      var prev = byObj[key];
      if (!prev || score > prev.finalScore) byObj[key] = { type: type, finalScore: score };
    });
    Object.keys(byObj).forEach(function (k) { kept.push(byObj[k]); });

    var dims = {};
    kept.forEach(function (item) {
      var id = item.type.dim;
      if (!dims[id]) dims[id] = { mode: item.type.mode, cap: item.type.cap, values: [] };
      dims[id].values.push(item.finalScore);
    });
    var dimensions = {};
    var total = 0;
    Object.keys(dims).forEach(function (id) {
      var d = dims[id];
      var raw = d.mode === 'sum'
        ? d.values.reduce(function (s, n) { return s + n; }, 0)
        : Math.max.apply(null, d.values);
      var capped = Math.min(d.cap, raw);
      dimensions[id] = capped;
      total += capped;
    });
    return { pending: pending, total: round1(total), dimensions: dimensions };
  }

  function pickTier(score, incentive) {
    if (incentive.pending) return { suggestedTier: 'pending', finalTier: 'pending' };
    var dims = Object.keys(incentive.dimensions).map(function (k) { return incentive.dimensions[k]; });
    var ge = function (n) { return dims.filter(function (v) { return v >= n; }).length; };
    var t = incentive.total;
    var suggested = 'none';
    if (score >= 90 && t >= 6 && ge(3) >= 1) suggested = 'A';
    else if (score >= 90 && t >= 4 && ge(2) >= 2) suggested = 'B';
    else if (score >= 85 && t >= 2 && ge(1) >= 1) suggested = 'C';
    return { suggestedTier: suggested, finalTier: suggested };
  }

  function money(tier, level) {
    if (tier === 'pending' || tier === 'none' || !tier) return { amount: 0, note: tier === 'pending' ? '未评定' : '暂不认定' };
    var coef = LEVEL[level];
    if (!coef) return { amount: 'unmatched', note: '职级未匹配' };
    return { amount: Math.round(BASE[tier] * coef), note: '' };
  }

  return {
    TYPES: TYPES,
    employeeTypes: employeeTypes,
    typeById: typeById,
    round1: round1,
    composite: composite,
    compute: compute
  };
});
