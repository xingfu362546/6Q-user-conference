const assert = require('assert');
const { createFamilyView } = require('../assets/family-view.js');
const demoSeed = require('../data/demo-seed.js');

function makeStore() {
  let state = {
    family: null,
    currentMemberId: null,
    meetings: [],
    todos: [],
    draftMeeting: null,
  };
  return {
    load: () => JSON.parse(JSON.stringify(state)),
    save: (nextState) => {
      state = JSON.parse(JSON.stringify(nextState));
    },
  };
}

{
  const store = makeStore();
  const familyView = createFamilyView({
    store,
    demoSeed,
    random: () => 0.123456,
    now: () => 1720000000000,
  });

  const family = familyView.createFamily('  快乐一家  ');
  assert.strictEqual(family.name, '快乐一家');
  assert.match(family.id, /^family-/);
  assert.match(family.inviteCode, /^[A-Z0-9]{4,6}$/);
  assert.deepStrictEqual(family.members.map(({ role, slot }) => ({ role, slot })), [
    { role: '妈', slot: 0 },
  ]);
  assert.strictEqual(store.load().currentMemberId, family.members[0].id);
}

{
  const store = makeStore();
  const familyView = createFamilyView({
    store,
    demoSeed,
    random: () => 0.25,
    now: () => 1720000000000,
  });
  const family = familyView.createFamily('测试家庭');

  assert.throws(
    () => familyView.joinByCode('WRONG', '爸', '阿爸'),
    /邀请码不正确/,
  );
  const father = familyView.joinByCode(family.inviteCode, '爸', '阿爸');
  assert.strictEqual(father.slot, 1);
  assert.strictEqual(store.load().family.members.length, 2);

  familyView.setDefaultHost(father.id);
  assert.strictEqual(store.load().family.defaultHostId, father.id);
  assert.throws(() => familyView.setDefaultHost('missing'), /成员不存在/);
}

{
  const demo = demoSeed.createDemoFamily();
  assert.strictEqual(demo.family.inviteCode, 'DEMO01');
  assert.deepStrictEqual(demo.family.members.map((member) => member.role), ['爸', '妈', '孩子']);
  assert.strictEqual(demo.family.defaultHostId, demo.family.members[1].id);
  assert.strictEqual(demo.currentMemberId, demo.family.members[1].id);
}

console.log('family-view.test.js OK');
