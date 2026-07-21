const assert = require('assert');
const C = require('../assets/consensus.js');

let plan = {
  candidates: [{ id: 'c1', title: '每周散步' }],
  selectedIds: ['c1'],
  agreedTime: '周六 10:00',
  votes: {},
  locked: false,
};

plan = C.castVote(plan, 'm1', 'approve');
plan = C.castVote(plan, 'm2', 'reject', '太早');
let tally = C.tally(plan, ['m1', 'm2', 'm3']);
assert.strictEqual(tally.passed, false);
assert.deepStrictEqual(tally.rejected, ['m2']);
assert.deepStrictEqual(tally.pending, ['m3']);

plan = C.castVote(plan, 'm2', 'approve');
plan = C.castVote(plan, 'm3', 'approve');
tally = C.tally(plan, ['m1', 'm2', 'm3']);
assert.strictEqual(tally.passed, true);

const changed = C.setSelection(plan, ['c1'], '周六 11:00');
assert.deepStrictEqual(changed.votes, {}, '修改约定时间必须清空旧投票');
assert.strictEqual(changed.locked, false);
assert.throws(() => C.lock(changed), /全员同意/);

const locked = C.lock(plan);
assert.strictEqual(locked.locked, true);

console.log('consensus.test.js OK');
