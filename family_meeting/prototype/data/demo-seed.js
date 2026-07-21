/** 演示家庭与示例语料种子。 */
(function (root) {
  const DEMO_MEMBERS = [
    { id: 'demo-father', role: '爸', nickname: '爸爸', slot: 0, color: '#4f86c6' },
    { id: 'demo-mother', role: '妈', nickname: '妈妈', slot: 1, color: '#ef7c8e' },
    { id: 'demo-child', role: '孩子', nickname: '小满', slot: 2, color: '#f4b942' },
  ];

  function createDemoFamily() {
    const members = DEMO_MEMBERS.map((member) => ({ ...member }));
    return {
      family: {
        id: 'family-demo',
        name: '相亲相爱一家人',
        inviteCode: 'DEMO01',
        defaultHostId: 'demo-mother',
        members,
      },
      currentMemberId: 'demo-mother',
    };
  }

  const demoSeed = {
    createDemoFamily,
    transcriptSamples: {},
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = demoSeed;
  }

  if (root) {
    root.demoSeed = demoSeed;
    root.DEMO_SEED = demoSeed;
  }
}(typeof window !== 'undefined' ? window : globalThis));
