const assert = require('assert');
const C = require('../assets/consensus.js');

assert.deepStrictEqual(C.canStartVote({ selectedIds: [], agreedTime: '' }), {
  ok: false,
  reason: '请至少选择一项行动',
});
assert.deepStrictEqual(C.canStartVote({ selectedIds: ['c1'], agreedTime: '' }), {
  ok: false,
  reason: '请填写全家统一的行动时间',
});
assert.deepStrictEqual(C.canStartVote({ selectedIds: ['c1'], agreedTime: '周六 10:00' }), {
  ok: true,
  reason: '',
});

let plan = {
  candidates: [{ id: 'c1', title: '每周散步' }],
  selectedIds: ['c1'],
  agreedTime: '周六 10:00',
  votes: {},
  memberIds: ['m1', 'm2', 'm3'],
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

const votesWithoutMembers = {
  ...plan,
  memberIds: undefined,
};
assert.throws(
  () => C.lock(votesWithoutMembers),
  /成员名单/,
  '缺少完整 memberIds 时不能把已投票者当作全体成员',
);

const incompleteMembers = {
  ...plan,
  memberIds: ['m1', 'm2'],
};
assert.throws(
  () => C.lock(incompleteMembers),
  /成员名单/,
  '方案中的 memberIds 与投票涉及成员不一致时不能锁定',
);

console.log('consensus.test.js OK');
