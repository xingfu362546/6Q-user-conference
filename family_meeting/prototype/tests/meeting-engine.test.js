const assert = require('assert');
const Engine = require('../assets/meeting-engine.js');

let m = { typeId: '04', step: 'opening', moodRoundDone: false };
assert.strictEqual(Engine.canAdvance(m).ok, false);
m = Engine.completeMoodRound(m);
assert.strictEqual(Engine.canAdvance(m).ok, true);
m = Engine.next(m);
assert.strictEqual(m.step, 'collect');

m = { typeId: '01', step: 'opening', moodRoundDone: true };
assert.strictEqual(Engine.canAdvance(m).ok, true);

const archived = Engine.archive({
  id: 'meeting-1',
  status: 'active',
  step: 'end',
  transcript: null,
  whiteboard: null,
  insights: null,
  actionPlan: null,
}, 1720000000000);
assert.strictEqual(archived.status, 'archived');
assert.strictEqual(archived.archivedAt, 1720000000000);
assert.deepStrictEqual(archived.transcript, []);
assert.deepStrictEqual(archived.whiteboard.strokes, []);
assert.match(archived.whiteboard.snapshot, /^data:image\/svg\+xml/);
assert.deepStrictEqual(archived.insights, { common: [], core: [] });
assert.deepStrictEqual(archived.actionPlan.candidates, []);
assert.deepStrictEqual(archived.actionPlan.selectedIds, []);
console.log('meeting-engine.test.js OK');
