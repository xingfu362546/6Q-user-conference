/** 演示家庭与示例语料种子（Task 1：最小结构占位） */
const DEMO_SEED = {
  family: null,
  members: [],
  transcriptSamples: {},
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEMO_SEED };
}

if (typeof window !== 'undefined') {
  window.DEMO_SEED = DEMO_SEED;
}
