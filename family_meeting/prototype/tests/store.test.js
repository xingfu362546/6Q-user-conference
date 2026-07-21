const assert = require('assert');
const path = require('path');
// Node 下用简易内存 mock：先实现 store 时抽纯函数 createStore(storage)
const { createStore } = require('../assets/store.js');

function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

const store = createStore(memoryStorage());
const s0 = store.load();
assert.strictEqual(s0.family, null);
assert.deepStrictEqual(s0.meetings, []);
assert.deepStrictEqual(s0.todos, []);

store.save({ ...s0, family: { id: 'f1', name: '测试家', inviteCode: 'ABC', defaultHostId: null, members: [] } });
assert.strictEqual(store.load().family.name, '测试家');
store.reset();
assert.strictEqual(store.load().family, null);
console.log('store.test.js OK');
