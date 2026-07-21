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

  const transcriptSamples = {
    byTopic: {
      '01-1': ['小满：我想周末一起去郊外骑车。', '爸爸：可以带上野餐垫，大家慢慢玩。', '妈妈：我喜欢这个主意，周六上午出发怎么样？'],
      '01-2': ['妈妈：我希望我们每周都有一段不看手机的家庭时间。', '爸爸：我想把家变成大家都愿意分享心事的地方。', '小满：还想每年一起完成一件很酷的事。'],
      '01-3': ['爸爸：谢谢妈妈总能记住大家的小需要。', '妈妈：我欣赏爸爸遇到问题时很有耐心。', '小满：我喜欢你们认真听我说完。'],
      '02-1': ['妈妈：我期待去一个节奏慢、能休息的地方。', '小满：我想看海，也想体验潜水。', '爸爸：我们先比较预算和交通时间。'],
      '02-2': ['爸爸：除夕我希望陪爷爷奶奶吃饭。', '妈妈：初二可以去看外公外婆。', '小满：我希望留一天只在家休息。'],
      '02-3': ['小满：写完作业后我想有一小时自由上网。', '妈妈：我担心太晚用手机影响睡眠。', '爸爸：可以试行固定时段，一周后再复盘。'],
      '02-4': ['妈妈：先听听小满自己对补习班的感受。', '小满：数学可以试试，但我想保留周日下午。', '爸爸：我们先上一节体验课再决定。'],
      '03-1': ['爸爸：上周厨房清洁完成了，但垃圾经常忘记倒。', '小满：我可以负责周二和周四倒垃圾。', '妈妈：家务表最好贴在冰箱上，完成后打勾。'],
      '03-2': ['小满：我想把一半压岁钱存起来。', '妈妈：可以分成储蓄、自由支配和分享三部分。', '爸爸：每月底一起看一次使用记录。'],
    },
    byType: {
      '01': ['妈妈：今天先分享一件让自己感到温暖的小事。', '爸爸：我很珍惜我们愿意坐下来听彼此说话。', '小满：我希望以后还能常常这样聊天。'],
      '02': ['爸爸：我们先把每个人的期待都列出来。', '妈妈：暂时不评价，先看看有哪些选择。', '小满：我也想说说我最担心的地方。'],
      '03': ['妈妈：先回顾一下上次约定的执行情况。', '小满：有些做到了，有些需要换个方法。', '爸爸：这次把责任和时间写得更清楚。'],
      '04': ['妈妈：我现在有点难过，也希望我们能互相理解。', '爸爸：刚才我的语气太急了，对不起。', '小满：我希望争吵时大家可以先暂停一下。', '妈妈：我们约定情绪很大时先说“暂停十分钟”。'],
    },
  };

  const demoSeed = {
    createDemoFamily,
    transcriptSamples,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = demoSeed;
  }

  if (root) {
    root.demoSeed = demoSeed;
    root.DEMO_SEED = demoSeed;
  }
}(typeof window !== 'undefined' ? window : globalThis));
