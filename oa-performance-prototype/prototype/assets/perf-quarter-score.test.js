var assert = require('assert');
var S = require('./perf-quarter-score.js');

var base = S.compute({
  workRows: [{ self: 79.6, supervisor: 79.6, division: 79.6 }],
  sixqTotal: 10,
  penaltyRows: [{ self: -2, supervisor: null, division: null }],
  incentiveRows: [{ objective: '甲', typeId: 'qty-1', finalScore: 6 }]
});
assert.strictEqual(base.ok, true);
assert.strictEqual(base.workTotal, 79.6);
assert.strictEqual(base.penaltyTotal, -0.4);
assert.strictEqual(base.assessedTotal, 89.2);

var withHr = S.compute({
  workRows: [{ self: 79.6, supervisor: 79.6, division: 79.6 }],
  sixqTotal: 10,
  penaltyRows: [{ self: -2 }],
  hrFinalTotal: 92
});
assert.strictEqual(withHr.assessedTotal, 89.2);
assert.strictEqual(withHr.adoptedTotal, 92);

assert.strictEqual(S.typeById('qty-1').points, 1);

var sameObj = S.compute({
  incentiveRows: [
    { objective: ' 同一目标 ', typeId: 'qual-1', finalScore: 1 },
    { objective: '同一目标', typeId: 'qual-3', finalScore: 3 }
  ]
});
assert.strictEqual(sameObj.dimensions['质量超越'], 3);

var qty = S.compute({
  incentiveRows: [
    { objective: '甲', typeId: 'qty-1', finalScore: 1 },
    { objective: '乙', typeId: 'qty-1', finalScore: 1 }
  ]
});
assert.strictEqual(qty.incentiveTotal, 2);

var tierC = S.compute({
  workRows: [{ self: 79.6, supervisor: 79.6, division: 79.6 }],
  sixqTotal: 10,
  penaltyRows: [{ self: -2 }],
  incentiveRows: [
    { objective: '甲', typeId: 'qual-1', finalScore: 2 },
    { objective: '乙', typeId: 'time-40', finalScore: 2 },
    { objective: '丙', typeId: 'qty-2', finalScore: 2 }
  ],
  level: '主管'
});
assert.strictEqual(tierC.assessedTotal, 89.2);
assert.strictEqual(tierC.suggestedTier, 'C');
assert.strictEqual(tierC.suggestedAmount, 330);

var pending = S.compute({
  incentiveRows: [{ objective: '甲', typeId: 'qty-1', finalScore: null }]
});
assert.strictEqual(pending.suggestedTier, 'pending');

var bad = S.compute({ penaltyRows: [{ self: 1 }] });
assert.strictEqual(bad.ok, false);

console.log('perf-quarter-score ok');
