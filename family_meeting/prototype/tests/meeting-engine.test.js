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
console.log('meeting-engine.test.js OK');
