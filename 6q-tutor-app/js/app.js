(function () {
  'use strict';

  var S = {
    sec: 0,
    q: 0,
    ans: {},
    assessed: false,
    plan: 'm',
    unit: 0,
    unitRoute: {},
    prog: { 0: { learn: true } },
    briefTarget: 'practice',
    bturn: 0,
    recog: 20,
    scores: {},
    pathId: 'emotion',
    roleSeen: {},
    units: [],
    paid: false,
    payFrom: 's-preview',
    meOn: false
  };
  var lastScreen = '';

  var MENTOR_IMG = 'assets/mentor-cut.png';
  var FACE_IMG = 'assets/mentor-face.png';

  /* ============================================================
     数据：A / B / C / D 四份问卷
     ============================================================ */

  var SURVEY = [
    {
      id: 'A', name: '基本情况', sub: '先认识一下你',
      trans: {
        t: '接下来聊聊<br>你走过哪些路',
        s: '学过的不会白学，我们从你已经有的地方接着走'
      },
      qs: [
        {
          id: 'role', t: '你现在更像是？', hint: '这会决定我们给你什么样的案例',
          type: 'single', opts: ['家长', '教师', '教育从业者', '其他']
        },
        {
          id: 'kid', t: '孩子的年龄段？', hint: '案例里的对话会按这个年龄来写',
          type: 'single', opts: ['0-6 岁', '7-12 岁', '13-15 岁', '16-18 岁', '19 岁以上', '暂无孩子']
        },
        {
          id: 'family', t: '你家的结构是？',
          hint: '有些关卡会因此多一条练习',
          type: 'single', opts: ['夫妻 + 孩子', '与老人同住', '单亲', '其他']
        }
      ]
    },
    {
      id: 'B', name: '学习经历', sub: '你学过什么，练过什么',
      trans: {
        t: '好，接下来看看<br>你现在最想动哪里',
        s: '不用挑「应该练的」，挑你此刻最疼的那一个'
      },
      qs: [
        {
          id: 'courses', t: '你上过 6Q 的哪些课？', hint: '可多选；都没上过就选最后一个',
          type: 'multi', optOut: '还没上过',
          opts: ['高EQ一阶', '高EQ二阶', '四方格专修班', '导师一阶专业课', '导师二阶专业课',
            '领袖营', '高效表达', '潜能开发', '聆听发问', '亲密关系工作坊', '还没上过']
        },
        {
          id: 'lastClass', t: '最近一次上课是什么时候？',
          hint: '隔太久我们会在前面加一节「回炉」',
          type: 'single', opts: ['3 个月内', '半年内', '一年内', '一年以上', '没上过']
        },
        {
          id: 'retrain', t: '同一门课，你复训过吗？',
          hint: '复训过，可以跳过最基础的循环',
          type: 'single', opts: ['复训过', '没复训过']
        },
        {
          id: 'assistant', t: '你带过学员 / 做过助教吗？',
          hint: '带过的话，我们会给你开「带教」那条线',
          type: 'single', opts: ['带过很多', '带过几个', '没带过']
        },
        {
          id: 'tools', t: '下面这些工具，你用过的有？', hint: '可多选；都没用过就选最后一个',
          type: 'multi', optOut: '都没用过',
          opts: ['天生气质', '情绪词', '四方格', '宝山探索', '爱的六种语言',
            '爱的流动', '家庭会议', '情感银行', '都没用过']
        }
      ]
    },
    {
      id: 'C', name: '现状与目标', sub: '此刻最想解决的问题',
      trans: {
        t: '最后一段<br>聊聊你的时间',
        s: '这一段的答案，会决定我们给你排多密'
      },
      qs: [
        {
          id: 'abilities', t: '这几项能力里，你想先练哪些？', hint: '可多选；选中的第一个会成为你的主线',
          type: 'multi', max: 3,
          opts: ['聆听与欣赏力', '情绪力', '沟通力', '关系存款力', '亲子引导力',
            '亲密关系力', '自我觉察力', '潜能开发力', '带教表达力']
        },
        {
          id: 'pain', t: '哪一句最像你？', hint: '我们按这一句给你排具体的关卡',
          type: 'single', dynamic: 'pain'
        },
        {
          id: 'block', t: '你主要的卡点在哪一步？',
          hint: '不知道 → 多给学关；做不到 → 多给练关；坚持不了 → 多给修关',
          type: 'single', opts: ['不知道怎么做', '知道但做不到', '做到了但坚持不了']
        },
        {
          id: 'outcome', t: '你最想看到的变化是？',
          hint: '这会决定我们最后怎么算「你毕业了」',
          type: 'single', opts: ['自己情绪更稳', '孩子有变化', '伴侣关系变好', '能带别人']
        },
        {
          id: 'intensity', t: '你打算多用力？',
          hint: '轻 → 每周 1 次；中 → 每周 2-3 次；重 → 几乎每天',
          type: 'single', opts: ['轻 · 每周 1 次', '中 · 每周 2-3 次', '重 · 几乎每天']
        }
      ]
    },
    {
      id: 'D', name: '条件与节奏', sub: '你能投入多少',
      trans: null,
      qs: [
        {
          id: 'hours', t: '每周大概能投入多少时间？',
          hint: '我们会把节奏排到你真的做得到的程度',
          type: 'single', opts: ['少于 2 小时', '2-5 小时', '5 小时以上']
        },
        {
          id: 'mode', t: '你更喜欢哪种学习形式？',
          hint: '选线下，我们会优先给你排工作坊',
          type: 'single', opts: ['线上', '线下', '混合']
        },
        {
          id: 'budget', t: '你现在的打算是？',
          hint: '这一题不影响你看到完整路径',
          type: 'single', opts: ['先用免费的', '买低价课', '开会员', '要一对一']
        },
        {
          id: 'company', t: '你希望有人陪吗？',
          hint: '这决定我们给你配 AI 陪学还是真人',
          type: 'single', opts: ['自己学就行', '有社群就行', '要 AI 陪学', '要真人 1v1']
        },
        {
          id: 'expect', t: '你希望多久看到变化？',
          hint: '我们会用它来校验前面的强度设定',
          type: 'single', opts: ['1 个月内', '3 个月内', '半年左右']
        }
      ]
    }
  ];

  var PAINS = {
    '聆听与欣赏力': ['孩子一开口，我就想讲道理', '夸人只会说「你真棒」', '别人难过时，我忍不住给建议', '听一半就走神，想着怎么回'],
    '情绪力': ['情绪一上来就扛不住', '生气时说不清自己在气什么', '事后才想起来该怎么做', '一整天都被一件事拖着'],
    '沟通力': ['说话总是伤人，或者总被误解', '一开口就变成指责', '想好好说，说两句就吵起来', '说完对方没反应，我更气'],
    '关系存款力': ['看不到家人的好，只剩挑刺', '明明很爱，家人却感觉不到', '不知道该怎么「存」', '做了很多，对方不认'],
    '亲子引导力': ['孩子玩手机，说了也不听', '家里没有能执行的规则', '孩子说「你不懂我」，我不知道怎么接'],
    '亲密关系力': ['一吵架就冷战', '旧事反复翻出来讲', '回家一句话不说，我不知道怎么开口'],
    '自我觉察力': ['被戳到就爆，事后才明白', '总觉得自己不够好', '说不清自己到底想要什么'],
    '潜能开发力': ['总忍不住替别人做决定', '不知道该问什么', '自己也不清楚想要什么'],
    '带教表达力': ['30 秒说不清自己在做什么', '一上台就紧张', '别人反对我，我就想争']
  };

  var ABILITIES = [
    { id: 'listen', name: '聆听与欣赏力', ico: '👂' },
    { id: 'emotion', name: '情绪力', ico: '💧' },
    { id: 'talk', name: '沟通力', ico: '💬' },
    { id: 'bank', name: '关系存款力', ico: '🏦' },
    { id: 'guide', name: '亲子引导力', ico: '🧭' },
    { id: 'intimacy', name: '亲密关系力', ico: '💞' },
    { id: 'self', name: '自我觉察力', ico: '🪞' },
    { id: 'potential', name: '潜能开发力', ico: '🌱' },
    { id: 'teach', name: '带教表达力', ico: '🎤' }
  ];

  var NAME2ID = {};
  ABILITIES.forEach(function (a) { NAME2ID[a.name] = a.id; });

  /* ============================================================
     数据：单元 & 关卡
     ============================================================ */

  var UNITS = [
    {
      no: '01', name: '孩子情绪爆发时', ability: '情绪力',
      course: '《高EQ智慧父母一阶》学后巩固',
      lesson: {
        kind: 'both',
        online: {
          name: '微课《你是生气，还是害怕？》', len: '5 分钟',
          intro: '分清原生情绪和派生情绪，先认出「生气」底下压着的那个东西。',
          points: ['原生情绪：当下真实的那一下（怕、疼、委屈）', '派生情绪：后来长出来的壳（怒、指责、冷漠）', '先命名，再表达：把「我很气」换成「我其实有点怕」']
        },
        offline: {
          name: '情绪自愈力工作坊', when: '每周六 14:00 – 17:00',
          where: '6Q 家庭教育中心 · 3F 静心厅', teacher: '陈老师', seats: '本期剩 8 席'
        }
      },
      nodes: [
        { key: 'learn', type: 'learn', label: '学 · 情绪是什么' },
        { key: 'pA', type: 'pA', label: '练 · 诉说者' },
        { key: 'pB', type: 'pB', label: '练 · 倾听者' },
        { key: 'pC', type: 'pC', label: '练 · 观察者' },
        { key: 'assess', type: 'assess', label: '评 · 小测' },
        { key: 'boss', type: 'boss', label: '导师对练' },
        { key: 'xiu', type: 'xiu', label: '修 · 打卡 7 天' }
      ]
    },
    {
      no: '02', name: '孩子不肯上学', ability: '沟通力',
      course: '《高EQ智慧父母二阶》学前导学',
      lesson: {
        kind: 'both',
        online: {
          name: '微课《先降温，再聆听：情绪处理四步法》', len: '6 分钟',
          intro: '孩子说「我不想上学」的时候，第一步不是问原因，是先把温度降下来。',
          points: ['停：先别追问，把嘴闭上三秒', '接：说出他此刻的状态，而不是事实', '问：开放式的一句，把话头递回去']
        },
        offline: {
          name: '沟通四方格 · 线下专场', when: '每周日 09:30 – 12:30',
          where: '6Q 家庭教育中心 · 2F 圆桌厅', teacher: '李老师', seats: '本期剩 12 席'
        }
      },
      nodes: [
        { key: 'learn', type: 'learn', label: '学 · 先降温再听' },
        { key: 'pA', type: 'pA', label: '练 · 诉说者' },
        { key: 'pB', type: 'pB', label: '练 · 倾听者' },
        { key: 'pC', type: 'pC', label: '练 · 观察者' },
        { key: 'assess', type: 'assess', label: '评 · 小测' },
        { key: 'boss', type: 'boss', label: '导师对练' },
        { key: 'xiu', type: 'xiu', label: '修 · 打卡 7 天' }
      ]
    },
    {
      no: '03', name: '伴侣沉默不语', ability: '亲密关系力',
      course: '《亲密关系工作坊》学后巩固',
      lesson: {
        kind: 'offline',
        online: {
          name: '微课《他要的是空间，还是你》', len: '5 分钟',
          intro: '沉默不一定是拒绝，先分清「给空间」和「放弃沟通」。',
          points: ['沉默的三种可能：累了 / 还没组织好 / 在防御', '给空间要给得明确：「我在这儿，你想说再说」', '约定一个具体时间，比当天逼问有用']
        },
        offline: {
          name: '亲密关系工作坊 · 两天版', when: '11 月 28 – 29 日（周六日）',
          where: '6Q 家庭教育中心 · 5F 大教室', teacher: '陈老师', seats: '本期剩 5 席'
        }
      },
      nodes: [
        { key: 'learn', type: 'learn', label: '学 · 沉默的意思' },
        { key: 'pA', type: 'pA', label: '练 · 诉说者' },
        { key: 'pB', type: 'pB', label: '练 · 倾听者' },
        { key: 'pC', type: 'pC', label: '练 · 观察者' },
        { key: 'assess', type: 'assess', label: '评 · 小测' },
        { key: 'boss', type: 'boss', label: '导师对练' },
        { key: 'xiu', type: 'xiu', label: '修 · 打卡 7 天' }
      ]
    }
  ];

  /* ============================================================
     学习路径（可切换）
     ============================================================ */

  function mkUnit(no, name, ability, course, olName, olIntro, ofName, kind) {
    return {
      no: no, name: name, ability: ability, course: course,
      lesson: {
        kind: kind || 'both',
        online: {
          name: olName, len: '5 分钟', intro: olIntro,
          points: ['先认出这一刻发生了什么', '把「事情」换成「我的感受」', '给对方一句能接得住的话']
        },
        offline: {
          name: ofName, when: '每周六 14:00 – 17:00',
          where: '6Q 家庭教育中心 · 3F 静心厅', teacher: '陈老师', seats: '本期剩 8 席'
        }
      },
      nodes: [
        { key: 'learn', type: 'learn', label: '学 · 先看懂' },
        { key: 'pA', type: 'pA', label: '练 · 诉说者' },
        { key: 'pB', type: 'pB', label: '练 · 倾听者' },
        { key: 'pC', type: 'pC', label: '练 · 观察者' },
        { key: 'assess', type: 'assess', label: '评 · 小测' },
        { key: 'boss', type: 'boss', label: '导师对练' },
        { key: 'xiu', type: 'xiu', label: '修 · 打卡 7 天' }
      ]
    };
  }

  var EMOTION_UNITS = UNITS.slice();

  var PATHS = [
    {
      id: 'eq', name: '高EQ智慧父母', ico: '🌱', tone: '#FFF0E4', ink: '#C25B12',
      desc: '一阶到三阶，把整套父母课走完',
      units: [
        mkUnit('01', '孩子情绪爆发时', '情绪力', '《高EQ智慧父母一阶》',
          '微课《你是生气，还是害怕？》', '分清原生情绪和派生情绪，先认出「生气」底下压着的那个东西。', '情绪自愈力工作坊'),
        mkUnit('02', '孩子不肯上学', '沟通力', '《高EQ智慧父母二阶》',
          '微课《先降温，再聆听》', '孩子说「我不想上学」，第一步不是问原因，是把温度降下来。', '沟通四方格 · 线下专场'),
        mkUnit('03', '说好的规矩守不住', '亲子引导力', '《高EQ智慧父母三阶》',
          '微课《规矩是给谁定的》', '守不住规矩，通常不是孩子的问题，是大人先松了。', '边界与温柔 · 线下工作坊')
      ]
    },
    {
      id: 'emotion', name: '情绪力', ico: '🌊', tone: '#E9F7FF', ink: '#0E8FB8',
      desc: '孩子情绪爆发时，先稳住自己',
      units: EMOTION_UNITS
    },
    {
      id: 'talk', name: '沟通力', ico: '💬', tone: '#EAFBF1', ink: '#0F9B5B',
      desc: '把话说进去，而不是说出去',
      units: [
        mkUnit('01', '孩子不肯上学', '沟通力', '《高EQ智慧父母二阶》学前导学',
          '微课《先降温，再聆听》', '孩子说「我不想上学」，第一步不是问原因，是把温度降下来。', '沟通四方格 · 线下专场'),
        mkUnit('02', '一开口就吵起来', '沟通力', '《沟通四方格》学后巩固',
          '微课《你要的是赢，还是通》', '争对错的时候，两个人都不在听。', '非暴力沟通 · 线下专场'),
        mkUnit('03', '他不愿意跟你说', '沟通力', '《亲子对话的 30 秒》',
          '微课《把门留一条缝》', '孩子闭嘴之前，通常先试过一次开口。', '亲子对话工作坊')
      ]
    },
    {
      id: 'guide', name: '亲子引导力', ico: '🧭', tone: '#FFF4E3', ink: '#C77F0B',
      desc: '规则立得住，关系也不散',
      units: [
        mkUnit('01', '说好的规矩守不住', '亲子引导力', '《温和而坚定》学后巩固',
          '微课《规矩是给谁定的》', '守不住规矩，通常不是孩子的问题，是大人先松了。', '边界与温柔 · 线下工作坊'),
        mkUnit('02', '一管就冲突', '亲子引导力', '《高EQ智慧父母三阶》',
          '微课《先连上，再引导》', '没有连接的教育，只会变成对抗。', '亲子谈判桌 · 线下专场')
      ]
    },
    {
      id: 'self', name: '自我觉察力', ico: '🪞', tone: '#F1EEFF', ink: '#6D5BD0',
      desc: '被戳到的那一刻，看见自己',
      units: [
        mkUnit('01', '一句话就被点着', '自我觉察力', '《父母的情绪功课》',
          '微课《被戳到的是什么》', '反应最快的那一刻，往往藏着最旧的伤口。', '内在小孩 · 线下工作坊'),
        mkUnit('02', '总觉得自己不够好', '自我觉察力', '《自我价值重建》',
          '微课《你也在等一句肯定》', '你对自己说的话，孩子都在学。', '自我关怀 · 线下专场')
      ]
    },
    {
      id: 'intimacy', name: '亲密关系力', ico: '💞', tone: '#FFEFF4', ink: '#C7417A',
      desc: '伴侣沉默时，还接得住',
      units: [
        mkUnit('01', '伴侣沉默不语', '亲密关系力', '《亲密关系工作坊》学后巩固',
          '微课《他要的是空间，还是你》', '沉默不一定是拒绝，先分清「给空间」和「放弃沟通」。', '亲密关系工作坊 · 两天版', 'offline'),
        mkUnit('02', '一谈就变成指责', '亲密关系力', '《亲密关系进阶》',
          '微课《你要的是被看见》', '指责底下，通常是一句说不出口的「我需要你」。', '伴侣对话 · 线下专场')
      ]
    }
  ];

  function curPath() {
    for (var i = 0; i < PATHS.length; i++) if (PATHS[i].id === S.pathId) return PATHS[i];
    return PATHS[0];
  }

  function usePath(id, silent) {
    var p = curPath();
    if (id) {
      for (var i = 0; i < PATHS.length; i++) if (PATHS[i].id === id) p = PATHS[i];
    }
    S.pathId = p.id;
    UNITS.length = 0;
    p.units.forEach(function (u) { UNITS.push(u); });
    S.unit = 0;
    S.prog = { 0: { learn: true } };
    S.unitRoute = {};
    if (!silent) {
      S.pathFlash = true;
      renderHome();
    }
  }

  function unitUnlocked(ui) {
    if (ui <= 0) return true;
    var prev = S.prog[ui - 1];
    return !!(prev && prev.boss);
  }

  /* ============================================================
     ABC 三角色
     ============================================================ */

  var ROLES = [
    {
      key: 'a', tag: 'A', name: '诉说者',
      duty: '讲一件最近让你难受的小事，说出你的感受',
      focus: '把「事情经过」换成「我的感受」，对方才接得住',
      scene: '周五晚上，孩子把牛奶打翻了，你刚拖完地。',
      ph: '说说你当时的感受…',
      steps: [
        '挑一件最近真的让你不舒服的小事',
        '说「我当时的感受是……」，不必讲清前因后果',
        '不用解释对不对，你只管说出来'
      ]
    },
    {
      key: 'b', tag: 'B', name: '倾听者',
      duty: '先接情绪，别给建议、别讲道理',
      focus: '不评价、不追问、不给办法，只把她的心情说出来',
      scene: '同班家长小希来找你，她女儿说不想上学，关上了门。',
      ph: '说说你会怎么回应她…',
      steps: [
        '先把她此刻的状态说出来（累、慌、没办法）',
        '不给建议、不追问原因、不说「别急」',
        '让她愿意再多说一句，就算成功'
      ]
    },
    {
      key: 'c', tag: 'C', name: '观察者',
      duty: '从这段对话里，找出「先接情绪」的那一句',
      focus: '认出好的倾听动作，并说清它好在哪',
      scene: '这是刚才那段对练的实录，你来当观察者。',
      ph: '说说你为什么选这句…',
      steps: [
        '听三段话，挑出「先接情绪」的那一句',
        '说一句理由：它好在没有评判、没有给办法',
        '认得出，下次自己就做得出'
      ]
    }
  ];

  var TRANSCRIPT = [
    '你为什么不想上学？总得有个原因吧。',
    '听你这么说，我一晚上也没睡好。你一个人扛着，一定很煎熬。',
    '孩子都这样，过两天就好了，别太当回事。'
  ];

  var BOSS_TURNS = [
    {
      q: '第一个问题。你说说，「情绪」和「想法」，哪一个先出现？',
      good: ['情绪', '感受', '先'],
      bad: ['想法', '理性'],
      fb: {
        hi: '对。情绪先到，想法是后来给情绪找的解释。很多人卡住，就是把解释当成了原因。',
        mid: '方向对了一半。再想想：是先有身体的感觉，还是先有「他凭什么这样」的念头？',
        lo: '这里容易搞反。情绪是原始反应，想法是后来补上的理由——所以我们才要先接情绪。'
      }
    },
    {
      q: '孩子摔门喊「你根本不懂我」。你走进房间，第一句话说什么？',
      good: ['生气', '难受', '看到', '感受', '你在', '是不是', '很'],
      bad: ['怎么', '不许', '闭嘴', '凭什么', '你还有理', '我为你'],
      fb: {
        hi: '很好。你没有解释、没有反驳，先把他此刻的状态说了出来。这就是「先接情绪」。',
        mid: '你在描述事实，但还没接住他的情绪。他需要听到你懂他现在的感受。',
        lo: '这句话一出口，他会更用力地证明你不懂。先别急着讲道理。'
      }
    },
    {
      q: '他接着喊「你只在乎分数」。这时候你解释「我不是只看分数」，会发生什么？',
      good: ['更', '对抗', '听不进', '防御', '关', '吵', '激'],
      bad: ['会理解', '说清楚', '解释'],
      fb: {
        hi: '对。解释在他听来就是反驳。他要的不是澄清，是被承认。',
        mid: '你会觉得说清楚了，但他接收到的是「你又在否定我」。',
        lo: '这时候解释，等于告诉他「你的感受是错的」。冲突会升级。'
      }
    },
    {
      q: '原生情绪和派生情绪，用一个你自己的例子说清区别。',
      good: ['原生', '派生', '害怕', '委屈', '愤怒', '担心'],
      bad: ['不知道', '一样'],
      fb: {
        hi: '例子很准。原生是当下真实的那一下，派生是后来长出来的那层壳。',
        mid: '概念你记住了，但例子还停在表面。想想：生气底下，通常压着什么？',
        lo: '这两层没分开，就会一直处理壳，碰不到真正的原因。'
      }
    },
    {
      q: '他沉默了，一句话不说。你怎么判断他是「不想说」还是「说不出来」？',
      good: ['等', '陪', '不逼', '时间', '沉默', '坐', '走开'],
      bad: ['继续问', '追问', '逼'],
      fb: {
        hi: '对。给他时间，比给他问题有用。你能不能待在那儿，就是答案。',
        mid: '你想分辨，但分辨本身需要时间。先别急着要一个结果。',
        lo: '追问会让他更说不出来。沉默有时候是他还在组织语言。'
      }
    },
    {
      q: '最后一个问题。如果明天同样的事再发生一次，你会做的、最不一样的那一步是什么？',
      good: ['先', '停', '听', '接', '不解释', '深呼吸', '蹲'],
      bad: ['一样', '不知道'],
      fb: {
        hi: '这一步就够了。改变从来不是全会了，而是那一刻多停了一秒。',
        mid: '方向有了，但还不够具体。具体到一句话、一个动作，明天才做得到。',
        lo: '没关系，先记住一件事：先停一秒，再说第一句话。'
      }
    }
  ];

  var ICONS = {
    learn: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22V5.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22V5.5z"/></svg>',
    video: '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="13" height="12" rx="3"/><path d="M15 10.5l6-3v9l-6-3z"/></svg>',
    offline: '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9.5 21v-6h5v6"/></svg>',
    practice: '<svg viewBox="0 0 24 24"><path d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v5a3.5 3.5 0 0 1-3.5 3.5H9l-5 4V6.5z"/></svg>',
    assess: '<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/><path d="M9 8h6M9 12h4"/></svg>',
    boss: '<svg viewBox="0 0 24 24"><path d="M3 8l4.2 4L12 4l4.8 8L21 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8z"/></svg>',
    xiu: '<svg viewBox="0 0 24 24"><path d="M12 21c-5 0-8-3.6-8-8 0-5.5 6-10 16-10 0 10-4 18-8 18z"/><path d="M12 21c0-5 2-9 5-11"/></svg>'
  };

  /* ============================================================
     工具
     ============================================================ */

  var uid = 0;

  function s(sel, txt) {
    var el = document.querySelector(sel);
    if (el && txt !== undefined) el.textContent = txt;
    return el;
  }

  function Q_IMG(h) {
    return '<span class="q-figure" style="height:' + h + 'px"><img src="assets/mascot-xiaoq.svg" alt="\u5c0fq"></span>';
  }

  function mascot(o) {
    o = o || {};
    var size = o.size || 150;
    var c1 = o.c1 || '#5EE594';
    var c2 = o.c2 || '#12B981';
    var id = 'mg' + (++uid);
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 120 120">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2=".35" y2="1">' +
      '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/>' +
      '</linearGradient></defs>' +
      '<ellipse cx="60" cy="114" rx="25" ry="4.5" fill="rgba(16,40,32,.1)"/>' +
      '<path d="M60 12c25 0 42 17 42 41 0 28-19 43-42 43S18 81 18 53c0-24 17-41 42-41z" fill="url(#' + id + ')"/>' +
      '<path d="M60 12c0-7 4-11 11-11 0 9-5 13-11 13z" fill="#A3E635"/>' +
      '<g class="m-eyes">' +
      '<ellipse cx="46" cy="52" rx="8.5" ry="10.5" fill="#fff"/>' +
      '<ellipse cx="74" cy="52" rx="8.5" ry="10.5" fill="#fff"/>' +
      '<circle cx="47.5" cy="54" r="4.4" fill="#14332D"/>' +
      '<circle cx="75.5" cy="54" r="4.4" fill="#14332D"/>' +
      '<circle cx="49" cy="51.6" r="1.5" fill="#fff"/>' +
      '<circle cx="77" cy="51.6" r="1.5" fill="#fff"/>' +
      '</g>' +
      '<circle cx="32" cy="66" r="6" fill="#FCA5A5" opacity=".45"/>' +
      '<circle cx="88" cy="66" r="6" fill="#FCA5A5" opacity=".45"/>' +
      '<path d="M52 72q8 7 16 0" stroke="#0C5C4C" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* 角色插画 */
  function roleIllo(role, size) {
    size = size || 56;
    var pal = {
      a: ['#FFE7BE', '#FFB324', '#B26A00'],
      b: ['#CDF8E1', '#1FC96A', '#0B7A3F'],
      c: ['#C9F2F7', '#0FB5A0', '#06695C']
    }[role];
    var id = 'rg' + (++uid);
    var prop = {
      a: '<g class="ba-float">' +
        '<rect x="66" y="22" width="30" height="20" rx="8" fill="#fff" opacity=".97"/>' +
        '<path d="M74 42l-2 7 9-7z" fill="#fff" opacity=".97"/>' +
        '<circle cx="75" cy="32" r="2" fill="' + pal[1] + '"/>' +
        '<circle cx="81" cy="32" r="2" fill="' + pal[1] + '"/>' +
        '<circle cx="87" cy="32" r="2" fill="' + pal[1] + '"/>' +
        '</g>',
      b: '<g class="ba-float">' +
        '<path d="M79 31c0-4.6 3.4-7.2 7-7.2s7 2.6 7 7.2-7 10-7 10-7-5.4-7-10z" fill="' + pal[1] + '" opacity=".92"/>' +
        '<path d="M67 19c2.8 1.8 4.2 4.2 4.4 7" stroke="' + pal[1] + '" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".55"/>' +
        '</g>',
      c: '<g class="ba-float">' +
        '<circle cx="79" cy="31" r="9" fill="none" stroke="' + pal[1] + '" stroke-width="3"/>' +
        '<path d="M86 38l6 6" stroke="' + pal[1] + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '</g>'
    }[role];
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2=".4" y2="1">' +
      '<stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '" stop-opacity=".5"/>' +
      '</linearGradient></defs>' +
      '<circle cx="50" cy="50" r="48" fill="url(#' + id + ')" opacity=".62"/>' +
      '<path d="M22 100c0-17 8-27 20-27s20 10 20 27z" fill="' + pal[1] + '" opacity=".92"/>' +
      '<circle cx="42" cy="43" r="15" fill="#fff" opacity=".96"/>' +
      '<circle cx="36.5" cy="42" r="2.3" fill="' + pal[2] + '"/>' +
      '<circle cx="47.5" cy="42" r="2.3" fill="' + pal[2] + '"/>' +
      '<path d="M38 49q4 4 8 0" stroke="' + pal[2] + '" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".72"/>' +
      '<path d="M28 35c2-7.5 7.5-11.5 14-11.5s12 4 14 11.5c-6-3.6-21-3.6-28 0z" fill="' + pal[2] + '" opacity=".18"/>' +
      prop +
      '</svg>';
  }

  /* 舞台背景插画 */
  function sceneArt(role) {
    var pal = {
      a: ['#FFF3DC', '#FFD98E'],
      b: ['#EAFBF1', '#A8EFC9'],
      c: ['#EAF8FB', '#A8E6F0']
    }[role] || ['#F4FBF6', '#CDF8E1'];
    var id = 'sc' + (++uid);
    return '<svg viewBox="0 0 200 200">' +
      '<defs><radialGradient id="' + id + '" cx=".7" cy=".2" r=".9">' +
      '<stop offset="0" stop-color="' + pal[1] + '" stop-opacity=".9"/>' +
      '<stop offset="1" stop-color="' + pal[1] + '" stop-opacity="0"/>' +
      '</radialGradient></defs>' +
      '<circle cx="140" cy="46" r="110" fill="url(#' + id + ')"/>' +
      '<circle cx="150" cy="40" r="26" fill="none" stroke="' + pal[1] + '" stroke-width="2" opacity=".55" class="breath"/>' +
      '<circle cx="42" cy="150" r="34" fill="none" stroke="' + pal[1] + '" stroke-width="2" opacity=".4" class="breath"/>' +
      '<path d="M96 168c14 0 26-6 34-14" stroke="' + pal[1] + '" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* 场景前置大插画 */
  function briefArt() {
    var id = 'ba' + (++uid);
    return '<svg viewBox="0 0 300 236" preserveAspectRatio="xMidYMid slice">' +
      '<defs>' +
      '<linearGradient id="' + id + '" x1="0" y1="0" x2=".6" y2="1">' +
      '<stop offset="0" stop-color="#1D4B3D"/><stop offset=".55" stop-color="#123028"/><stop offset="1" stop-color="#0A1A15"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect width="300" height="236" fill="url(#' + id + ')"/>' +
      '<g opacity=".5">' +
      '<circle cx="40" cy="30" r="2" fill="#8FE4B6"/><circle cx="252" cy="54" r="1.6" fill="#8FE4B6"/>' +
      '<circle cx="212" cy="24" r="1.4" fill="#FFCB6B"/><circle cx="66" cy="176" r="1.6" fill="#FFCB6B"/>' +
      '</g>' +
      '<ellipse cx="150" cy="212" rx="118" ry="16" fill="rgba(94,229,148,.09)"/>' +
      '<g class="ba-float">' +
      '<rect x="112" y="72" width="80" height="132" rx="9" fill="rgba(255,255,255,.09)" stroke="rgba(255,255,255,.2)" stroke-width="2"/>' +
      '<rect x="120" y="80" width="64" height="116" rx="5" fill="rgba(255,255,255,.05)"/>' +
      '<circle cx="176" cy="142" r="3.6" fill="#FFCB6B"/>' +
      '</g>' +
      '<g class="ba-float-2" opacity=".92">' +
      '<circle cx="232" cy="152" r="14" fill="rgba(255,255,255,.14)"/>' +
      '<path d="M214 204c0-14 8-23 18-23s18 9 18 23z" fill="rgba(255,255,255,.11)"/>' +
      '</g>' +
      '<g class="ba-float">' +
      '<rect x="26" y="40" width="112" height="50" rx="17" fill="rgba(255,255,255,.95)"/>' +
      '<path d="M56 89l-8 15 22-15z" fill="rgba(255,255,255,.95)"/>' +
      '<text x="82" y="72" font-size="12.5" font-weight="800" fill="#123028" text-anchor="middle">你根本不懂我</text>' +
      '</g>' +
      '<g opacity=".55" class="ba-float-2">' +
      '<path d="M226 106c3-9 10-13 18-13" stroke="#8FE4B6" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '</g>' +
      '</svg>';
  }

  /* 学节点封面 */
  function lessonCover(isOnline) {
    var id = 'lc' + (++uid);
    return '<svg viewBox="0 0 300 168" class="lc-art">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2=".8" y2="1">' +
      '<stop offset="0" stop-color="#1B4A3B"/><stop offset="1" stop-color="#0A1A15"/></linearGradient></defs>' +
      '<rect width="300" height="168" fill="url(#' + id + ')"/>' +
      '<g opacity=".55">' +
      '<circle cx="48" cy="30" r="2" fill="#8FE4B6"/><circle cx="252" cy="42" r="1.6" fill="#8FE4B6"/>' +
      '<circle cx="220" cy="130" r="1.4" fill="#FFCB6B"/><circle cx="72" cy="136" r="1.6" fill="#FFCB6B"/>' +
      '</g>' +
      '<circle cx="250" cy="24" r="72" fill="rgba(94,229,148,.12)"/>' +
      (isOnline
        ? '<g opacity=".5" class="breath"><rect x="86" y="44" width="128" height="80" rx="10" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/><path d="M150 42v84" stroke="rgba(255,255,255,.2)" stroke-width="2"/></g>'
        : '<g opacity=".5" class="breath"><path d="M96 120c18-30 34-30 54 0" stroke="rgba(255,255,255,.28)" stroke-width="2" fill="none"/><circle cx="150" cy="86" r="16" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2"/></g>') +
      '</svg>';
  }

  /* ============================================================
     页面切换
     ============================================================ */

  function go(id, dir) {
    var cur = document.querySelector('.screen.active');
    var next = document.getElementById(id);
    if (!next || cur === next) return;
    if (cur && cur.id !== id) lastScreen = cur.id;
    if (cur) {
      cur.className = 'screen out' + (dir === 'back' ? ' back' : '');
      (function (el) { setTimeout(function () { el.className = 'screen'; }, 340); })(cur);
    }
    next.className = 'screen active' + (dir === 'back' ? ' back' : '');
    var body = next.querySelector('.body, .chat');
    if (body) body.scrollTop = 0;
    onEnter(id);
  }

  function onEnter(id) {
    if (id === 's-app') renderApp();
    if (id === 's-home') renderHome();
    if (id === 's-mentor') renderMentor();
    if (id === 's-practice') openPractice();
    if (id === 's-boss') openBoss();
    if (id === 's-brief') renderBrief();
    if (id === 's-result') renderResult();
    if (id === 's-assess') renderQ();
    if (id === 's-preview') renderPreview();
    if (id === 's-paywall') {
      /* 记住从哪儿来，返回按钮回到原地 */
      if (lastScreen && lastScreen !== 's-paywall' && lastScreen !== 's-success') S.payFrom = lastScreen;
      renderPlans();
      /* 兜底：万一容器没渲染出来，再补一次，绝不出现空白页 */
      setTimeout(function () {
        var box = document.getElementById('plans');
        if (box && !box.children.length) renderPlans();
      }, 60);
    }
    if (id === 's-me') renderMe();
    if (id === 's-success') burst();
  }

  /* 数字滚动 */
  function countUp(el, to, dur, suffix) {
    if (!el) return;
    var from = 0, t0 = performance.now();
    dur = dur || 900;
    function step(t) {
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e) + (suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* 小星屑爆开 */
  function sparkle(host, n) {
    if (!host) return;
    var em = ['✦', '✧', '·', '✨', '★'];
    var cols = ['#FFC24D', '#3FE287', '#FF9FA2', '#8AD8FF'];
    for (var i = 0; i < n; i++) {
      (function (i) {
        var sp = document.createElement('i');
        sp.className = 'spark';
        sp.textContent = em[i % em.length];
        sp.style.left = '50%';
        sp.style.top = '50%';
        sp.style.color = cols[i % cols.length];
        var a = (Math.PI * 2 / n) * i + Math.random() * .4;
        var r = 46 + Math.random() * 40;
        sp.style.setProperty('--sx', Math.cos(a) * r + 'px');
        sp.style.setProperty('--sy', Math.sin(a) * r + 'px');
        sp.style.animationDelay = (i * .028) + 's';
        host.appendChild(sp);
        setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 1800);
      })(i);
    }
  }

  /* 点击涟漪 */  function ripple(el, ev) {
    if (!el || !el.appendChild) return;
    var r = el.getBoundingClientRect();
    var x = ev && ev.clientX ? ev.clientX - r.left : r.width / 2;
    var y = ev && ev.clientY ? ev.clientY - r.top : r.height / 2;
    var d = document.createElement('span');
    d.className = 'rip';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    el.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 680);
  }

  function toast(msg) {    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(t._tid);
    t._tid = setTimeout(function () { t.classList.remove('on'); }, 1700);
  }

  function burst() {
    var layer = document.getElementById('confetti');
    var colors = ['#22C55E', '#FFB020', '#FF6B6B', '#38BDF8', '#A78BFA', '#F472B6'];
    for (var i = 0; i < 44; i++) {
      var p = document.createElement('i');
      p.className = 'cf';
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * .5) + 's';
      p.style.animationDuration = (1.5 + Math.random() * 1.1) + 's';
      p.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
      p.style.width = (6 + Math.random() * 6) + 'px';
      p.style.height = (10 + Math.random() * 8) + 'px';
      layer.appendChild(p);
      (function (el) { setTimeout(function () { el.remove(); }, 2900); })(p);
    }
  }

  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(96, el.scrollHeight) + 'px';
  }

  function judge(text, rule) {
    var t = (text || '').trim();
    if (t.length < 4) return -1;
    var sc = 0;
    (rule.good || []).forEach(function (k) { if (t.indexOf(k) > -1) sc += 2; });
    (rule.bad || []).forEach(function (k) { if (t.indexOf(k) > -1) sc -= 2; });
    if (t.length >= 14) sc += 1;
    if (t.length >= 28) sc += 1;
    return sc;
  }

  /* ============================================================
     测评向导
     ============================================================ */

  function totalQs() {
    return SURVEY.reduce(function (n, sec) { return n + sec.qs.length; }, 0);
  }

  function globalIndex() {
    var n = 0;
    for (var i = 0; i < S.sec; i++) n += SURVEY[i].qs.length;
    return n + S.q;
  }

  function startAssess(fresh) {
    S.sec = 0; S.q = 0;
    if (fresh) S.ans = {};
    go('s-assess');
  }

  function curQ() {
    var sec = SURVEY[S.sec];
    var q = sec.qs[S.q];
    if (q.dynamic === 'pain') {
      var first = pickFirstAbility();
      q.opts = PAINS[first] || [];
    }
    return q;
  }

  function pickFirstAbility() {
    var a = S.ans.abilities || [];
    return a[0] || '情绪力';
  }

  /* 吉祥物播报：先「说话前的小停顿」，再一句句吐出来 */
  var narrTimer = null;
  function narrate(html) {
    var b = document.getElementById('an-bubble');
    var n = document.getElementById('aw-narr');
    if (!b) return;
    clearTimeout(narrTimer);
    b.classList.remove('say');
    b.classList.add('typing');
    b.innerHTML = '';
    if (n) {
      n.classList.remove('talk');
      void n.offsetWidth;
      n.classList.add('talk');
    }
    narrTimer = setTimeout(function () {
      b.classList.remove('typing');
      b.innerHTML = html;
      b.classList.remove('say');
      void b.offsetWidth;
      b.classList.add('say');
    }, 300);
  }

  function renderQ() {
    var sec = SURVEY[S.sec];
    var q = curQ();
    var idx = globalIndex();
    var total = totalQs();

    s('#qcount', (idx + 1) + '/' + total);
    var qc = document.getElementById('qcount');
    if (qc) {
      qc.classList.remove('bump');
      void qc.offsetWidth;
      qc.classList.add('bump');
    }
    /* 细进度条，不显示「第几段」，只给一个不压迫的推进感 */
    var prog = document.getElementById('assess-prog');
    if (prog) prog.style.width = ((idx + 1) / total * 100) + '%';

    /* 吉祥物播报：说人话，不报题号 */
    var say = q.hint
      ? q.hint
      : sec.id === 'A' ? '这个只用来让例子更像你家，不影响结果。'
        : sec.id === 'B' ? '学过什么没关系，我只是想知道从哪儿接你。'
          : sec.id === 'C' ? '挑你最先想解决的，不用想「应该选哪个」。'
            : '最后几题，帮我把节奏排得适合你。';
    narrate(say);

    var shortOpts = q.opts.every(function (o) { return o.length <= 6; });
    var grid = q.type === 'single' && q.opts.length <= 4 && shortOpts;

    var wrap = document.getElementById('qwrap');
    var html = '<div class="qcard">' +
      '<h2 class="qtext">' + q.t + '</h2>' +
      (q.type === 'multi'
        ? '<div class="qtip"><span class="q-emo">✋</span>可以多选' +
          (q.max ? '，最多 ' + q.max + ' 项' : '') + '，选完点下一步</div>'
        : '') +
      '<div class="opts' + (grid ? ' grid2' : '') + '">';

    q.opts.forEach(function (o, k) {
      html += '<button class="opt' + (q.type === 'multi' ? ' multi' : '') + '" data-k="' + k + '" ' +
        'style="--d:' + (k * .045 + .05) + 's">' +
        '<b class="opt-k">' + String.fromCharCode(65 + k) + '</b>' +
        '<span class="opt-t">' + o + '</span>' +
        '<i class="opt-ck">✓</i></button>';
    });
    html += '</div></div>';

    wrap.innerHTML = html;
    wrap.scrollTop = 0;
    wrap.classList.remove('vcenter');
    requestAnimationFrame(function () {
      if (wrap.scrollHeight <= wrap.clientHeight + 2) wrap.classList.add('vcenter');
    });

    var foot = document.getElementById('aw-foot');
    var nx = document.getElementById('qnext');
    var needFoot = q.type === 'multi';
    foot.classList.toggle('on', needFoot);
    nx.onclick = function () {
      var cq = curQ();
      if (cq.type !== 'multi') return;
      if (!(S.ans[cq.id] || []).length) return;
      var card = wrap.querySelector('.qcard');
      if (card) card.classList.add('qout');
      nx.disabled = true;
      setTimeout(advance, 280);
    };

    var opts = wrap.querySelectorAll('.opt');
    if (q.type === 'multi') {
      (S.ans[q.id] || []).forEach(function (v) {
        var k = q.opts.indexOf(v);
        if (k > -1) opts[k].classList.add('on');
      });
    }
    opts.forEach(function (b) {
      b.addEventListener('click', function (e) { pickChip(q, b, opts, e); });
    });
    nx.disabled = !needFoot || (S.ans[q.id] || []).length === 0;
  }

  function pickChip(q, btn, opts, ev) {
    var k = +btn.dataset.k;
    var val = q.opts[k];

    if (q.type === 'single') {
      if (btn.classList.contains('on')) return;
      opts.forEach(function (x) { x.classList.remove('on'); });
      btn.classList.add('on');
      ripple(btn, ev);
      S.ans[q.id] = val;
      var card = btn.closest('.qcard');
      if (card) card.classList.add('qout');
      setTimeout(advance, 300);
      return;
    }

    var arr = (S.ans[q.id] || []).slice();
    var isOut = q.optOut && val === q.optOut;

    if (isOut) {
      arr = btn.classList.contains('on') ? [] : [val];
    } else {
      var i = arr.indexOf(val);
      if (i > -1) arr.splice(i, 1);
      else {
        if (q.max && arr.length >= q.max) {
          toast('最多选 ' + q.max + ' 项');
          return;
        }
        arr.push(val);
      }
      arr = arr.filter(function (x) { return x !== q.optOut; });
    }

    S.ans[q.id] = arr;
    if (btn.classList.contains('on')) ripple(btn, ev);
    opts.forEach(function (x) {
      var v = q.opts[+x.dataset.k];
      x.classList.toggle('on', arr.indexOf(v) > -1);
    });
    var nx = document.getElementById('qnext');
    if (nx) nx.disabled = arr.length === 0;
  }

  function advance() {
    var sec = SURVEY[S.sec];
    if (S.q < sec.qs.length - 1) {
      S.q++;
      renderQ();
      return;
    }
    if (S.sec < SURVEY.length - 1) {
      showTrans();
      return;
    }
    finishSurvey();
  }

  function showTrans() {
    var cur = SURVEY[S.sec];
    var el = document.getElementById('stage-trans');
    if (!el || !cur.trans) { S.sec++; S.q = 0; renderQ(); return; }

    s('#st-done', '第 ' + (S.sec + 1) + ' 段 · 完成');
    document.getElementById('st-title').innerHTML = cur.trans.t;
    s('#st-sub', cur.trans.s);

    /* 进度环：顺时针，用负偏移，从 0 画到当前进度 */
    var arc = document.getElementById('st-arc');
    var C = 2 * Math.PI * 58;
    arc.style.transition = 'none';
    arc.style.strokeDasharray = C;
    arc.style.strokeDashoffset = C - C * (S.sec / SURVEY.length);

    var em = ['💛', '🌱', '✨', '💚', '🤍', '🍀', '💫'];
    var hh = '';
    for (var i = 0; i < 7; i++) {
      hh += '<i style="left:' + (8 + i * 13 + Math.random() * 5) + '%;top:' +
        (56 + Math.random() * 20) + '%;animation-delay:' + (i * .2) + 's;font-size:' +
        (11 + Math.round(Math.random() * 5)) + 'px">' + em[i] + '</i>';
    }
    document.getElementById('st-hearts').innerHTML = hh;

    el.className = 'stage-trans on';
    var fig = el.querySelector('.st-fig');
    if (fig) { fig.classList.remove('cheer'); void fig.offsetWidth; fig.classList.add('cheer'); }

    requestAnimationFrame(function () {
      setTimeout(function () {
        arc.style.transition = 'stroke-dashoffset 1.05s cubic-bezier(.22,1,.36,1)';
        arc.style.strokeDashoffset = C - C * ((S.sec + 1) / SURVEY.length);
      }, 90);
    });

    setTimeout(function () { el.className = 'stage-trans out'; }, 1900);
    setTimeout(function () {
      el.className = 'stage-trans';
      S.sec++;
      S.q = 0;
      renderQ();
    }, 2320);
  }

  /* ---------- 计分 ---------- */

  function computeScores() {
    var base = {};
    ABILITIES.forEach(function (a) { base[a.id] = 58; });

    var goals = (S.ans.abilities || []).map(function (n) { return NAME2ID[n]; });
    goals.forEach(function (id, i) { if (id) base[id] = 34 + i * 4; });

    var c = S.ans.courses || [];
    function has(name) { return c.indexOf(name) > -1; }

    if (has('高EQ一阶')) { base.listen += 12; base.emotion += 10; base.talk += 10; base.bank += 8; base.guide += 8; }
    if (has('高EQ二阶')) { base.emotion += 12; base.bank += 10; base.talk += 10; base.self += 9; }
    if (has('四方格专修班')) { base.talk += 13; base.self += 5; }
    if (has('导师一阶专业课')) { base.teach += 13; base.self += 8; }
    if (has('导师二阶专业课')) { base.teach += 10; base.potential += 8; }
    if (has('领袖营')) { base.teach += 8; base.potential += 6; }
    if (has('高效表达')) { base.teach += 10; base.talk += 6; }
    if (has('潜能开发')) { base.potential += 13; base.self += 6; }
    if (has('聆听发问')) { base.listen += 13; base.potential += 8; }
    if (has('亲密关系工作坊')) { base.intimacy += 14; base.bank += 6; }

    if (S.ans.retrain === '复训过') {
      ABILITIES.forEach(function (a) { base[a.id] += 5; });
    }
    if (S.ans.assistant === '带过很多') { base.teach += 10; base.potential += 8; }
    if (S.ans.assistant === '带过几个') { base.teach += 6; base.potential += 4; }

    var b = S.ans.block;
    if (b === '不知道怎么做') {
      ['listen', 'emotion', 'talk'].forEach(function (k) { base[k] -= 9; });
    } else if (b === '知道但做不到') {
      ['emotion', 'talk', 'guide'].forEach(function (k) { base[k] -= 5; });
    }

    if (S.ans.hours === '少于 2 小时') {
      ABILITIES.forEach(function (a) { base[a.id] -= 3; });
    }
    if (S.ans.mode === '线下') { base.intimacy += 3; base.teach += 3; }

    var out = {};
    ABILITIES.forEach(function (a) {
      out[a.id] = Math.max(18, Math.min(94, Math.round(base[a.id])));
    });
    S.scores = out;
    return out;
  }

  function startLoop(id) {
    var v = S.scores[id] || 50;
    return v >= 72 ? 3 : v >= 50 ? 2 : 1;
  }

  /* 深链演示用：没有真实作答时给一份样例画像 */
  function seedAnswers() {
    S.ans = {
      role: '家长', kid: '7-12 岁', family: '夫妻 + 孩子',
      courses: ['高EQ一阶'], lastClass: '一年以上', retrain: '没复训过', assistant: '没带过',
      tools: ['情绪词', '情感银行'],
      abilities: ['情绪力', '沟通力'],
      pain: '情绪一上来就扛不住',
      block: '知道但做不到',
      outcome: '孩子有变化',
      intensity: '中 · 每周 2-3 次',
      hours: '2-5 小时', mode: '混合', budget: '开会员', company: '要 AI 陪学',
      expect: '3 个月内'
    };
  }

  function finishSurvey() {
    computeScores();
    S.assessed = true;
    go('s-result');
  }

  function renderResult() {
    var vals = ABILITIES.map(function (a) { return S.scores[a.id]; });
    var order = ABILITIES.slice().sort(function (x, y) { return S.scores[x.id] - S.scores[y.id]; });
    var weak = order.slice(0, 5);
    var worst = order[0];

    var blk = S.ans.block || '知道但做不到';
    var h2 = blk === '不知道怎么做'
      ? '你不是不会，<br>是还不知道从哪一步开始。'
      : blk === '做到了但坚持不了'
        ? '你不缺方法，<br>缺的是一个能坚持的节奏。'
        : '你知道该怎么做，<br>难的是那一刻做得出来。';
    document.getElementById('res-h2').innerHTML = h2;

    var tags = [];
    if (S.ans.role) tags.push(S.ans.role);
    if (S.ans.kid) tags.push(S.ans.kid);
    if (S.ans.family) tags.push(S.ans.family);
    if (S.ans.block) tags.push(S.ans.block);
    if (S.ans.intensity) tags.push(S.ans.intensity);
    if (S.ans.mode) tags.push('偏好' + S.ans.mode);
    document.getElementById('res-chips').innerHTML = tags.map(function (t, i) {
      return '<span style="animation-delay:' + (i * .05) + 's">' + t + '</span>';
    }).join('');

    var bars = document.getElementById('bars');
    bars.innerHTML = weak.map(function (a, i) {
      var v = S.scores[a.id];
      var cls = v < 50 ? 'low' : v < 70 ? 'mid' : 'hi';
      return '<div class="bar-row' + (cls === 'low' ? ' low' : '') + '" style="animation-delay:' + (i * .06) + 's">' +
        '<span class="bar-name">' + a.name + '</span>' +
        '<span class="bar-track"><i class="bar-fill" data-w="' + v + '"></i></span>' +
        '<span class="bar-val" data-v="' + v + '">0</span></div>';
    }).join('');

    var loop = startLoop(worst.id);
    var freq = S.ans.intensity && S.ans.intensity.indexOf('轻') > -1 ? '每周 1 次'
      : S.ans.intensity && S.ans.intensity.indexOf('重') > -1 ? '几乎每天' : '每周 2–3 次';
    var dur = S.ans.hours === '少于 2 小时' ? 8 : 12;

    /* 起点卡：环 + 结论 */
    var RH = 2 * Math.PI * 34;
    document.getElementById('res-hero').innerHTML =
      '<div class="rh-ring"><svg viewBox="0 0 80 80">' +
      '<circle cx="40" cy="40" r="34" class="rh-bg"></circle>' +
      '<circle cx="40" cy="40" r="34" class="rh-fg" id="rh-fg"></circle>' +
      '</svg><div class="rh-n"><b id="rh-num">0</b><small>循环</small></div></div>' +
      '<div class="rh-txt"><div class="rh-k">建议起点</div>' +
      '<div class="rh-t">最该先练 · ' + worst.name + '</div>' +
      '<div class="rh-s">每次约 ' + dur + ' 分钟 · ' + freq + '</div></div>' +
      '<div class="rh-tag pop">' + worst.ico + '</div>';

    countUp(document.getElementById('rh-num'), loop, 1000);

    var fg = document.getElementById('rh-fg');
    fg.style.strokeDasharray = RH;
    fg.style.strokeDashoffset = RH;
    setTimeout(function () {
      fg.style.strokeDashoffset = RH - RH * (S.scores[worst.id] / 100);
    }, 320);
    setTimeout(function () { sparkle(document.getElementById('res-hero'), 9); }, 520);

    var saveText = {
      '聆听与欣赏力': '你很想帮他，所以容易急着给答案。他要的先是被听见。',
      '情绪力': '情绪来的时候先疼的是你。这不怪你，但会盖住他要说的话。',
      '沟通力': '你想把事情说清楚，可对方先接收到的是情绪。',
      '关系存款力': '你做了很多，只是用的不是他收得到的语言。',
      '亲子引导力': '你定的规矩都是对的，难的是在那一刻还守得住。',
      '亲密关系力': '你们不是不爱，是都在等对方先开口。',
      '自我觉察力': '被戳到的时候，你反应很快，但看不清戳到的是什么。',
      '潜能开发力': '你很想帮他，所以容易替他做决定。',
      '带教表达力': '你肚子里有东西，只是还没找到那 30 秒。'
    }[worst.name] || '这是你现在最该先动的地方。';

    document.getElementById('insight').innerHTML =
      '<b>你最该先动的地方 · ' + worst.name + '</b>' + saveText +
      '<span class="insight-meta">建议从第 ' + loop + ' 个循环开始 · 每次约 ' + dur + ' 分钟</span>';

    setTimeout(function () {
      document.querySelectorAll('#bars .bar-fill').forEach(function (f, i) {
        setTimeout(function () {
          f.style.width = f.dataset.w + '%';
          var row = f.closest('.bar-row');
          var vv = row && row.querySelector('.bar-val');
          countUp(vv, +f.dataset.w, 900);
        }, i * 70);
      });
    }, 280);

    renderPreview();
  }

  function renderPreview() {
    var order = ABILITIES.slice().sort(function (x, y) {
      return S.scores[x.id] - S.scores[y.id];
    }).slice(0, 3);

    document.getElementById('prev-h2').innerHTML =
      '先从「' + order[0].name + '」开始，<br>那是你现在最疼的地方。';

    var explain = {
      '聆听与欣赏力': '从「先不说话」练起',
      '情绪力': '从「给情绪命名」练起',
      '沟通力': '从「先降温再接话」练起',
      '关系存款力': '从「用他的语言存一次」练起',
      '亲子引导力': '从「约定一次边界」练起',
      '亲密关系力': '从「给空间不放弃」练起',
      '自我觉察力': '从「看清被戳到什么」练起',
      '潜能开发力': '从「先问不答」练起',
      '带教表达力': '从「30 秒说清一件事」练起'
    };

    document.getElementById('preview-units').innerHTML = order.map(function (a, i) {
      var loop = startLoop(a.id);
      return '<div class="unit" style="animation-delay:' + (i * .09 + .05) + 's">' +
        '<div class="uico">' + a.ico + '</div>' +
        '<div class="umain"><div class="ut">' + a.name + '</div>' +
        '<div class="us">' + (explain[a.name] || '') + ' · 从循环 ' + loop + ' 起</div></div>' +
        '<div class="ugo">' + (i === 0 ? '从这里开始 →' : '之后解锁') + '</div></div>';
    }).join('');
  }

  /* ============================================================
     付费
     ============================================================ */

  var PLANS = [
    {
      id: 'free', name: '免费体验', price: '¥0', per: '', tag: '',
      feats: ['第 1 个单元全部开放', '每日 1 次导师对练', '基础能力测评'],
      note: '先试试手感，随时可升级'
    },
    {
      id: 'm', name: '成长会员', price: '¥49', per: '/月', tag: '推荐',
      feats: ['全部 19 个单元', '每日 3 次导师对练', '自由对练 + 语音', '每周成长报告', '线下工作坊优先'],
      note: '随时取消，不满意 7 天全退'
    },
    {
      id: 'y', name: '成长会员 · 年付', price: '¥399', per: '/年', tag: '省 32%',
      feats: ['包含月付全部权益', '12 个月不间断', '赠 1 次导师 1v1 复盘'],
      note: '折合 ¥33 / 月'
    }
  ];

  function renderPlans() {
    var box = document.getElementById('plans');
    box.innerHTML = PLANS.map(function (p) {
      return '<div class="plan' + (p.id === S.plan ? ' on' : '') + '" data-id="' + p.id + '">' +
        (p.tag ? '<div class="ptag">' + p.tag + '</div>' : '') +
        '<div class="radio"></div>' +
        '<div class="prow"><span class="pname">' + p.name + '</span>' +
        '<span class="pprice">' + p.price + (p.per ? '<small>' + p.per + '</small>' : '') + '</span></div>' +
        '<ul class="pfeats">' + p.feats.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
        '<div class="pnote">' + p.note + '</div></div>';
    }).join('');

    box.querySelectorAll('.plan').forEach(function (el) {
      el.addEventListener('click', function () {
        S.plan = el.dataset.id;
        box.querySelectorAll('.plan').forEach(function (x) { x.classList.remove('on'); });
        el.classList.add('on');
        updatePayBtn();
      });
    });
    updatePayBtn();
  }

  function updatePayBtn() {
    var b = document.getElementById('pay-btn');
    if (!b) return;
    if (S.plan === 'free') b.textContent = '先免费体验';
    else if (S.plan === 'y') b.textContent = '立即解锁 ¥399 / 年';
    else b.textContent = '立即解锁 ¥49 / 月';
  }

  function pay() {
    var b = document.getElementById('pay-btn');
    if (!b || b.disabled) return;
    b.disabled = true;
    b.textContent = '正在处理…';
    setTimeout(function () {
      b.disabled = false;
      updatePayBtn();
      if (S.plan !== 'free') S.paid = true;
      go('s-success');
    }, 900);
  }

  /* ============================================================
     首页路径
     ============================================================ */

  function renderApp() {
    var grid = document.getElementById('app-grid');
    var items = [
      { t: '线上课程', ico: '👨‍👩‍👦', tone: '#FFEFE3' },
      { t: '线下课程', ico: '🏫', tone: '#E9F7FF' },
      { t: '嘉年华', ico: '🎪', tone: '#FFF6E0' },
      { t: '6Q领袖营', ico: '⛺', tone: '#EAFBF1' },
      { t: '个案团辅', ico: '🧩', tone: '#F3EEFF' },
      { t: '导学师', ico: '🧭', tone: '#E7FBF0', tutor: true },
      { t: '社区', ico: '💬', tone: '#FFEFF4' },
      { t: '积分', ico: '🎫', tone: '#FFF1DE' },
      { t: '砍价活动', ico: '🏷️', tone: '#FDEDED' },
      { t: '6Q测评', ico: '📊', tone: '#EAF3FF' },
      { t: '6Q资讯', ico: '📰', tone: '#F1F5F1' },
      { t: '更多', ico: '⋯', tone: '#F4F7F4' }
    ];
    grid.innerHTML = items.map(function (it, i) {
      return '<button class="g6' + (it.tutor ? ' tutor' : '') + '" data-app="' + it.t + '" ' +
        'style="animation-delay:' + (i * .028) + 's">' +
        '<span class="g6-ico" style="background:' + it.tone + '">' + it.ico +
        (it.tutor && !S.assessed ? '<i class="g6-dot">测</i>' : '') + '</span>' +
        '<span class="g6-t">' + it.t + '</span></button>';
    }).join('');

    grid.querySelectorAll('.g6').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.app === '导学师') {
          if (S.assessed) go('s-home');
          else go('s-hello');
          return;
        }
        if (b.dataset.app === '6Q测评') { go('s-hello'); return; }
        toast(b.dataset.app + ' · 还在做');
      });
    });
  }

  /* ============================================================
     首页路径
     ============================================================ */

  function unitProg(ui) {
    return S.prog[ui] || {};
  }

  function nodeStates(ui) {
    var p = unitProg(ui);
    var seen = false;
    return UNITS[ui].nodes.map(function (n) {
      if (p[n.key]) return 'done';
      if (!seen) {
        seen = true;
        return n.type === 'boss' ? 'ready' : 'cur';
      }
      return 'lock';
    });
  }

  function nodeCls(st) {
    return st === 'done' ? 'done' : st === 'cur' ? 'cur' : st === 'ready' ? 'ready' : 'lock';
  }

  function unitDoneCount(ui) {
    var p = unitProg(ui);
    var n = 0;
    UNITS[ui].nodes.forEach(function (x) { if (p[x.key]) n++; });
    return n;
  }

  function allKindsDone(ui) {
    return unitDoneCount(ui) >= UNITS[ui].nodes.length;
  }

  function renderHome() {
    if (!unitUnlocked(S.unit)) S.unit = 0;
    var ui = S.unit;
    var u = UNITS[ui];
    var states = nodeStates(ui);
    var doneCount = states.filter(function (x) { return x === 'done'; }).length;
    var total = u.nodes.length;
    var path = curPath();

    /* 头像 + 路径名 */
    var av = document.getElementById('home-avatar-txt');
    if (av) av.textContent = (S.ans.role || '家长').charAt(0);
    s('#hh-path', path.name + '路径');

    var ring = document.getElementById('ring-fg');
    var C = 125.6;
    ring.style.strokeDashoffset = C - C * Math.min(1, doneCount / total);
    s('#ring-txt', doneCount + '/' + total);

    var d = new Date();
    var wd = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    s('#hh-date', wd + ' · ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日');
    s('#hh-sub', doneCount === 0
      ? '今天也只练 10 分钟'
      : doneCount >= total ? '这个单元走完了，厉害' : '已过 ' + doneCount + ' 关，还剩 ' + (total - doneCount) + ' 关');

    /* 今日任务 */
    var nextIdx = states.indexOf('cur');
    var nextIdx2 = states.indexOf('ready');
    if (nextIdx < 0) nextIdx = nextIdx2;
    var nextNode = nextIdx >= 0 ? u.nodes[nextIdx] : null;

    var conf;
    if (!nextNode) {
      conf = {
        k: '本单元已完成', b: '已完成', t: '第 ' + (ui + 1) + ' 单元 · 全部走完',
        s: '去下面开启下一阶段', art: '🎉', go: '看看', goAct: 'next', pct: 100
      };
    } else if (nextNode.type === 'learn') {
      var route = S.unitRoute[ui];
      conf = {
        k: '今日任务', b: '约 5 分钟',
        t: '学 · ' + (route === 'offline' ? '线下课' : '线上课'),
        s: route === 'offline' ? u.lesson.offline.name : u.lesson.online.name,
        art: '📖', go: '开始', goAct: 'learn', pct: 12
      };
    } else if (nextNode.type === 'boss') {
      conf = {
        k: '可以挑战了', b: '认可度 80 通关',
        t: '导师对练 · ' + u.ability, s: '陈老师会连续向你提问',
        art: '👤', go: '去挑战', goAct: 'boss', pct: 86
      };
    } else if (nextNode.type === 'xiu') {
      conf = {
        k: '今日修行', b: '按天记',
        t: '修 · 今天做一件小事', s: '做完打个卡，7 天为一个循环',
        art: '🌱', go: '去打卡', goAct: 'xiu', pct: 92
      };
    } else if (nextNode.type === 'assess') {
      conf = {
        k: '今日任务', b: '3 道题',
        t: '评 · 小测一下', s: '看看这个单元进到你脑子里多少',
        art: '📝', go: '开始', goAct: 'assess', pct: 70
      };
    } else {
      var pi = ['pA', 'pB', 'pC'].indexOf(nextNode.type);
      var r = ROLES[pi > -1 ? pi : 0];
      conf = {
        k: '今日任务', b: '约 8 分钟',
        t: '练 · ' + r.name, s: 'ABC 三角色接力 · 先 ' + r.name,
        art: '💬', go: '开始', goAct: 'practice', role: pi > -1 ? pi : 0, pct: 40
      };
    }

    var today = document.getElementById('today');
    today.innerHTML =
      '<div class="thead"><span class="tk">' + conf.k + '</span>' +
      '<span class="tbadge">' + conf.b + '</span></div>' +
      '<div class="tmid"><div class="tmain">' +
      '<div class="tt">' + conf.t + '</div>' +
      '<div class="ts">' + conf.s + '</div></div>' +
      '<div class="tart">' + conf.art + '</div></div>' +
      '<div class="tfoot"><span class="tbar"><i style="width:' + conf.pct + '%"></i></span>' +
      '<button class="tgo" id="today-go">' + conf.go +
      '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button></div>';

    today.querySelector('#today-go').addEventListener('click', function () {
      todayAction(conf);
    });

    /* 单元卡 */
    var pct = Math.round(doneCount / total * 100);
    var routeNow = S.unitRoute[ui];
    document.getElementById('unit-card').innerHTML =
      '<div class="utop"><div class="unum">' + u.no + '</div>' +
      '<div class="uhd"><div class="uk">第 ' + (ui + 1) + ' 单元 · ' + u.ability + '</div>' +
      '<div class="ut">' + u.name + '</div></div>' +
      '<div class="upct">' + pct + '<small>%</small></div></div>' +
      '<div class="ubar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="ufoot"><span>' + u.course + '</span>' +
      (routeNow ? '<i></i><span>' + (routeNow === 'offline' ? '线下路线' : '线上路线') + '</span>' : '') +
      '</div>' +
      '<button class="uroute" id="unit-route">' +
      (routeNow ? '换一种学习方式' : '先选线上 / 线下') + '</button>';

    var ur = document.getElementById('unit-route');
    if (ur) ur.addEventListener('click', function () { showRoute(ui, function () { renderHome(); }); });

    document.getElementById('chapsep').innerHTML =
      '<b>第 ' + (ui + 1) + ' 单元</b> · ' + u.ability;

    document.getElementById('unit-card2').innerHTML = '';

    /* 节点 */
    var box = document.getElementById('path-nodes');
    var html = '';
    u.nodes.forEach(function (n, i) {
      var off = Math.round(Math.sin(i * 0.92 + .4) * 62);
      var st = states[i];
      var inner = ICONS[n.type] || ICONS.practice;
      var extra = '';
      if (n.type === 'boss') {
        inner = '<span class="face"><img src="' + FACE_IMG + '" alt="陈老师"></span>';
      }
      if (n.type === 'learn' && routeNow === 'offline') {
        inner = ICONS.offline;
        extra += '<span class="nroute off">线下</span>';
      } else if (n.type === 'learn' && routeNow === 'online') {
        inner = ICONS.video;
        extra += '<span class="nroute on">线上</span>';
      }
      if (n.type === 'pA' || n.type === 'pB' || n.type === 'pC') {
        extra += '<span class="nrole">' + ['A', 'B', 'C'][['pA', 'pB', 'pC'].indexOf(n.type)] + '</span>';
      }
      var cls = nodeCls(st) + (n.type === 'boss' ? ' bossface' : '');
      var badge = (st === 'done' && n.type !== 'xiu') ? '<span class="nbadge ok">✓</span>' : '';
      var tip = st === 'cur' ? '<div class="ntip">' + (n.type === 'boss' ? '开始对练' : '从这里开始') + '</div>' : '';
      var halo = (st === 'cur' || st === 'ready') ? '<span class="nhalo"></span>' : '';
      html += '<div class="nwrap" style="animation-delay:' + (i * .055) + 's">' +
        '<button class="node ' + cls + '" data-i="' + i + '" data-st="' + st + '" data-type="' + n.type + '" ' +
        'style="left:calc(50% + ' + off + 'px);--fl:' + (i * -.55) + 's">' +
        tip + halo + inner + extra + badge + '</button>' +
        '<span class="nlabel' + (st === 'cur' ? ' on' : st === 'ready' ? ' gold' : '') + '" ' +
        'style="left:calc(50% + ' + off + 'px)">' + n.label + '</span>' +
        '</div>';
    });
    box.innerHTML = html;

    box.querySelectorAll('.node').forEach(function (n) {
      n.addEventListener('click', function () { onNode(n.dataset.type, n.dataset.st); });
    });

    /* 下一阶段 */
    renderNextStage();

    requestAnimationFrame(function () { setTimeout(drawLines, 60); });

    /* 切换路径时的一次性飘入 */
    if (S.pathFlash) {
      S.pathFlash = false;
      var p2 = document.getElementById('path');
      if (p2) { p2.classList.remove('swap'); void p2.offsetWidth; p2.classList.add('swap'); }
    }
  }

  function renderNextStage() {
    var box = document.getElementById('next-stage');
    if (!box) return;
    var next = S.unit + 1;
    var nx = UNITS[next];
    var done = allKindsDone(S.unit);

    if (!nx) {
      box.innerHTML = '<div class="ns done"><div class="ns-t">这条路径走完了 🎓</div>' +
        '<div class="ns-s">换个路径继续，或者回到首页看看</div></div>';
      return;
    }

    if (done) {
      box.innerHTML =
        '<button class="ns-btn" id="ns-go">' +
        '<span class="ns-ico">🔓</span>' +
        '<span class="ns-main"><b>开启第 ' + (next + 1) + ' 单元</b>' +
        '<small>' + nx.name + ' · ' + nx.ability + '</small></span>' +
        '<span class="ns-arrow">›</span></button>' +
        '<p class="ns-hint">点开后先选线上 / 线下，再开始这一单元</p>';
      var b = document.getElementById('ns-go');
      if (b) b.addEventListener('click', function () { unlockNextStage(); });
      setTimeout(function () { sparkle(box, 7); }, 260);
    } else {
      var left = UNITS[S.unit].nodes.length - unitDoneCount(S.unit);
      box.innerHTML =
        '<div class="ns locked">' +
        '<span class="ns-ico">🔒</span>' +
        '<span class="ns-main"><b>第 ' + (next + 1) + ' 单元 · ' + nx.name + '</b>' +
        '<small>还差 ' + left + ' 关，通关本单元后解锁</small></span>' +
        '</div>';
    }
  }

  function unlockNextStage() {
    var next = S.unit + 1;
    if (!UNITS[next]) return;
    if (!S.prog[next]) S.prog[next] = {};
    var u = UNITS[next];
    if (!S.unitRoute[next] && u.lesson.kind !== 'online') {
      showRoute(next, function () {
        S.unit = next;
        renderHome();
        toast('第 ' + (next + 1) + ' 单元已开启');
      });
      return;
    }
    if (!S.unitRoute[next]) S.unitRoute[next] = 'online';
    S.unit = next;
    renderHome();
    toast('第 ' + (next + 1) + ' 单元已开启');
  }

  function todayAction(conf) {
    if (conf.goAct === 'learn') openLesson();
    else if (conf.goAct === 'boss') go('s-boss');
    else if (conf.goAct === 'assess') openAssessNode();
    else if (conf.goAct === 'xiu') openXiu();
    else if (conf.goAct === 'next') {
      var box = document.getElementById('next-stage');
      if (box) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    else if (conf.goAct === 'practice') {
      S.briefTarget = 'practice';
      S.startRole = conf.role || 0;
      go('s-brief');
    } else go('s-home');
  }

  function onNode(type, st) {
    if (st === 'lock') {
      /* 原型阶段：锁住的关卡也给一条「直接体验」的路，方便验收 */
      var names = { boss: '导师对练', assess: '小测', xiu: '修行打卡', learn: '学' };
      var nm = names[type] || '这一关';
      showSheet2('🔒', '还没解锁', '「' + nm + '」要等前面的关卡通过。原型阶段可以先跳过，正式版不会有这个按钮。', {
        alt: '跳过前置，直接体验',
        onAlt: function () {
          markAllBefore(type);
          setTimeout(function () {
            if (type === 'boss') go('s-boss');
            else if (type === 'learn') openLesson();
            else if (type === 'assess') openAssessNode();
            else if (type === 'xiu') openXiu();
            else {
              S.briefTarget = 'practice';
              S.startRole = ['pA', 'pB', 'pC'].indexOf(type);
              go('s-brief');
            }
          }, 420);
        }
      });
      return;
    }
    if (st === 'done') {
      if (type === 'learn') { openLesson(); return; }
      if (type === 'xiu') { openXiu(); return; }
      if (type === 'boss') { go('s-boss'); return; }
      if (type === 'pA' || type === 'pB' || type === 'pC') {
        S.briefTarget = 'practice';
        S.startRole = ['pA', 'pB', 'pC'].indexOf(type);
        go('s-brief');
        return;
      }
      toast('这一关已经通过了');
      return;
    }
    if (type === 'learn') { openLesson(); return; }
    if (type === 'boss') { go('s-boss'); return; }
    if (type === 'assess') { openAssessNode(); return; }
    if (type === 'xiu') { openXiu(); return; }
    if (type === 'pA' || type === 'pB' || type === 'pC') {
      S.briefTarget = 'practice';
      S.startRole = ['pA', 'pB', 'pC'].indexOf(type);
      go('s-brief');
      return;
    }
  }

  /* 把目标关卡之前的所有关卡标成通过（原型跳过用） */
  function markAllBefore(type) {
    var ui = S.unit;
    var nodes = UNITS[ui].nodes;
    if (!S.prog[ui]) S.prog[ui] = {};
    var hit = false;
    nodes.forEach(function (n) {
      if (n.type === type) { hit = true; return; }
      if (!hit) S.prog[ui][n.key] = true;
    });
    renderHome();
  }

  function drawLines() {
    var path = document.getElementById('path');
    var svg = document.getElementById('path-line');
    if (!path || !svg) return;
    var nodes = [].slice.call(document.querySelectorAll('#path-nodes .node'));
    if (!nodes.length) return;
    var pr = path.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + pr.width + ' ' + pr.height);
    svg.setAttribute('width', pr.width);
    svg.setAttribute('height', pr.height);
    svg.innerHTML = '';

    for (var i = 0; i < nodes.length - 1; i++) {
      var a = nodes[i].getBoundingClientRect();
      var b = nodes[i + 1].getBoundingClientRect();
      var x1 = a.left - pr.left + a.width / 2;
      var y1 = a.top - pr.top + a.height - 2;
      var x2 = b.left - pr.left + b.width / 2;
      var y2 = b.top - pr.top + 2;
      var d = 'M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + (y1 + 30) + ', ' + x2 + ' ' + (y2 - 30) + ', ' + x2 + ' ' + y2;

      var base = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      base.setAttribute('d', d);
      base.setAttribute('stroke', '#E4EDE6');
      base.setAttribute('stroke-width', '9');
      base.setAttribute('stroke-linecap', 'round');
      svg.appendChild(base);

      var dots = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      dots.setAttribute('d', d);
      dots.setAttribute('stroke', '#F7FBF8');
      dots.setAttribute('stroke-width', '9');
      dots.setAttribute('stroke-dasharray', '0.1 15');
      dots.setAttribute('stroke-linecap', 'round');
      svg.appendChild(dots);

      if (nodes[i].dataset.st === 'done') {
        var on = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        on.setAttribute('d', d);
        on.setAttribute('stroke', '#46D98B');
        on.setAttribute('stroke-width', '7');
        on.setAttribute('stroke-linecap', 'round');
        on.setAttribute('opacity', '.85');
        svg.appendChild(on);

        var shine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shine.setAttribute('d', d);
        shine.setAttribute('stroke', 'rgba(255,255,255,.75)');
        shine.setAttribute('stroke-width', '2.5');
        shine.setAttribute('stroke-linecap', 'round');
        shine.setAttribute('opacity', '.7');
        svg.appendChild(shine);
      }
    }
  }

  /* ============================================================
     导学师页
     ============================================================ */

  function renderMentor() {
    if (!S.assessed) return;
    var order = ABILITIES.slice().sort(function (x, y) { return S.scores[x.id] - S.scores[y.id]; });
    var worst = order[0];

    document.getElementById('mh-mascot').innerHTML = Q_IMG(66);
    s('#mh-title', '你最该先动的是「' + worst.name + '」');

    var loop = startLoop(worst.id);
    var freq = S.ans.intensity && S.ans.intensity.indexOf('轻') > -1 ? '每周 1 次'
      : S.ans.intensity && S.ans.intensity.indexOf('重') > -1 ? '几乎每天' : '每周 2–3 次';
    var dur = S.ans.hours === '少于 2 小时' ? '约 8 分钟' : '约 12 分钟';
    s('#mh-sub', '从循环 ' + loop + ' 开始 · ' + freq + ' · ' + dur);

    document.getElementById('m-bars').innerHTML = order.map(function (a, i) {
      var v = S.scores[a.id];
      var cls = v < 50 ? 'low' : v < 70 ? 'mid' : 'hi';
      return '<div class="mbar ' + cls + '" style="animation-delay:' + (i * .05) + 's">' +
        '<span class="mb-n">' + a.name + '</span>' +
        '<span class="mb-t"><i data-w="' + v + '"></i></span>' +
        '<span class="mb-v">' + v + '</span></div>';
    }).join('');

    setTimeout(function () {
      document.querySelectorAll('#m-bars .mb-t i').forEach(function (el, i) {
        setTimeout(function () { el.style.width = el.dataset.w + '%'; }, i * 45);
      });
    }, 200);

    var plan = [
      { i: '📅', k: '节奏', v: freq + ' <small>' + dur + ' / 次</small>' },
      { i: '🎬', k: '学习形式', v: (S.ans.mode || '混合') + ' <small>' + (S.ans.mode === '线下' ? '优先排工作坊' : '优先排视频课') + '</small>' },
      { i: '🤝', k: '陪伴', v: (S.ans.company || '要 AI 陪学') + ' <small>' + (S.ans.company === '要真人 1v1' ? '会转顾问跟进' : '小q 全程跟着') + '</small>' },
      { i: '🎯', k: '结题标准', v: (S.ans.outcome || '孩子有变化') + ' <small>达标后出结题报告</small>' }
    ];
    document.getElementById('m-plan').innerHTML = plan.map(function (p, i) {
      return '<div class="mp" style="animation-delay:' + (i * .06) + 's">' +
        '<div class="mp-i">' + p.i + '</div>' +
        '<div><div class="mp-k">' + p.k + '</div><div class="mp-v">' + p.v + '</div></div></div>';
    }).join('');
  }

  /* ============================================================
     单元路线选择
     ============================================================ */

  var routeCb = null;

  function showRoute(ui, cb) {
    var u = UNITS[ui];
    if (!u) return;
    routeCb = cb || null;

    document.getElementById('route-art').innerHTML = Q_IMG(84);
    s('#route-k', '第 ' + (ui + 1) + ' 单元');
    document.getElementById('route-t').innerHTML = '这个单元会学到<br>【' + u.ability + '】相关的课程';

    var prefer = S.ans.mode || '混合';
    var onlineRec = prefer !== '线下';
    var opts = [
      {
        v: 'online', ico: '🎬', t: '线上学习 · 视频课',
        s: u.lesson.online.name + ' · ' + u.lesson.online.len,
        rec: onlineRec
      },
      {
        v: 'offline', ico: '🏫', t: '线下学习 · 工作坊',
        s: u.lesson.offline.name + ' · ' + u.lesson.offline.when,
        rec: !onlineRec
      }
    ];

    document.getElementById('route-opts').innerHTML = opts.map(function (o, i) {
      return '<button class="ro' + (o.rec ? ' rec' : '') + '" data-v="' + o.v + '" style="animation-delay:' + (i * .08 + .06) + 's">' +
        '<div class="ro-ico">' + o.ico + '</div>' +
        '<div class="ro-main"><div class="ro-t">' + o.t + (o.rec ? ' · 推荐' : '') + '</div>' +
        '<div class="ro-s">' + o.s + '</div></div>' +
        '<div class="ro-go">›</div></button>';
    }).join('');

    document.querySelectorAll('#route-opts .ro').forEach(function (b) {
      b.addEventListener('click', function () {
        S.unitRoute[ui] = b.dataset.v;
        closeRoute();
        setTimeout(function () {
          if (routeCb) { var f = routeCb; routeCb = null; f(); }
          else openLesson();
        }, 320);
      });
    });

    document.getElementById('route-pop').classList.add('on');
  }

  function closeRoute() {
    document.getElementById('route-pop').classList.remove('on');
  }

  /* ============================================================
     学节点
     ============================================================ */

  function openLesson() {
    var ui = S.unit;
    var u = UNITS[ui];
    var route = S.unitRoute[ui];

    if (!route) {
      showRoute(ui, function () { openLesson(); });
      return;
    }
    var isOnline = route === 'online';
    s('#lesson-top', '学 · ' + (isOnline ? '线上视频课' : '线下工作坊'));

    var body = document.getElementById('lesson-body');
    var html = '';

    if (isOnline) {
      var on = u.lesson.online;
      html =
        '<div class="lesson-cover">' + lessonCover(true) +
        '<button class="lesson-play" id="lesson-play"><span></span></button></div>' +
        '<div class="lesson-meta"><span>视频</span><i></i><span>' + on.len + '</span><i></i><span>线上课程</span></div>' +
        '<h3 class="lesson-h">' + on.name + '</h3>' +
        '<p class="lesson-p">' + on.intro + '</p>' +
        '<div class="lesson-points">' +
        on.points.map(function (p, i) {
          return '<div class="lp-row" style="animation-delay:' + (i * .07 + .1) + 's"><b>' + (i + 1) + '</b><span>' + p + '</span></div>';
        }).join('') +
        '</div>' +
        '<button class="btn" id="lesson-done" style="margin-top:22px">看完了，去做练习</button>' +
        '<button class="btn ghost" id="lesson-switch">改成线下学习</button>';
    } else {
      var of = u.lesson.offline;
      html =
        '<div class="offline-card">' +
        '<div class="oc-k">线下 · 本单元必修</div>' +
        '<div class="oc-t">' + of.name + '</div>' +
        '<div class="oc-rows">' +
        '<div class="oc-row"><i>🗓</i>' + of.when + '</div>' +
        '<div class="oc-row"><i>📍</i>' + of.where + '</div>' +
        '<div class="oc-row"><i>👤</i>主讲 · ' + of.teacher + '</div>' +
        '</div>' +
        '<div class="oc-seats"><i></i>' + of.seats + '</div>' +
        '</div>' +
        '<div class="lesson-meta"><span>线下</span><i></i><span>需到现场</span><i></i><span>可请假一次</span></div>' +
        '<p class="lesson-p">这一课要现场练，坐在家里练不出来。报名后我们会把场次和交通发给你。</p>' +
        '<div class="lesson-points">' +
        ['现场三人一组做 ABC 对练，导师逐个纠', '带一个你真实的案例来，当场拆', '结束后当场出你的下一段路径'].map(function (p, i) {
          return '<div class="lp-row" style="animation-delay:' + (i * .07 + .1) + 's"><b>' + (i + 1) + '</b><span>' + p + '</span></div>';
        }).join('') +
        '</div>' +
        '<button class="btn" id="lesson-done" style="margin-top:22px">报名这一场 · 去线下</button>' +
        '<button class="btn ghost" id="lesson-switch">改成线上学习</button>';
    }

    body.innerHTML = html;

    var play = document.getElementById('lesson-play');
    if (play) {
      play.addEventListener('click', function () {
        play.innerHTML = '<span style="animation:none;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.16)"><b style="font-size:9px;letter-spacing:1px;color:#fff;font-weight:900">播放中</b></span>';
        toast('示例原型：这里接视频');
      });
    }

    document.getElementById('lesson-done').addEventListener('click', function () {
      if (isOnline) {
        toast('已标记看完');
        markNode('learn');
        go('s-home');
      } else {
        showSheet('🏫', '报名已提交', '场次：' + u.lesson.offline.when + '\n地点：' + u.lesson.offline.where + '\n\n到现场前一天，小q 会提醒你一次。', 'ok', function () {
          markNode('learn');
          go('s-home');
        });
      }
    });

    document.getElementById('lesson-switch').addEventListener('click', function () {
      S.unitRoute[ui] = isOnline ? 'offline' : 'online';
      openLesson();
      toast('已切换到' + (isOnline ? '线下' : '线上') + '路线');
    });

    if (!document.getElementById('s-lesson').classList.contains('active')) go('s-lesson');
  }

  function markNode(key) {
    if (!S.prog[S.unit]) S.prog[S.unit] = {};
    S.prog[S.unit][key] = true;
  }

  /* ============================================================
     评 / 修
     ============================================================ */

  var QUIZ = [
    {
      q: '孩子摔门喊「你根本不懂我」，下面哪一句是「先接情绪」？',
      opts: ['你为什么这么想？', '你现在很生气，也很委屈，是不是？', '我为你付出这么多，你还这样说'],
      a: 1
    },
    {
      q: '原生情绪和派生情绪，哪个是后来长出来的壳？',
      opts: ['原生情绪', '派生情绪', '两个都是'],
      a: 1
    },
    {
      q: '他沉默不说话，最该做的是？',
      opts: ['继续追问到底', '给他时间，告诉他你在', '走开，等他主动'],
      a: 1
    }
  ];

  function openAssessNode() {
    var ui = S.unit;
    var u = UNITS[ui];
    s('#lesson-top', '评 · 小测');
    var body = document.getElementById('lesson-body');
    var html = '<p class="eyebrow">第 ' + (ui + 1) + ' 单元 · ' + u.ability + '</p>' +
      '<h3 class="lesson-h">3 分钟，看看这个单元进到你脑子里多少</h3>' +
      '<p class="lesson-p">答错不要紧，答错的题会自动回到你的复习里。</p>';

    QUIZ.forEach(function (item, qi) {
      html += '<div class="quizq" style="animation-delay:' + (qi * .07) + 's">' +
        '<div class="qk">Q' + (qi + 1) + '</div>' +
        '<div class="qt">' + item.q + '</div>' +
        '<div class="chips qchips">' +
        item.opts.map(function (o, oi) {
          return '<button class="chip" data-q="' + qi + '" data-o="' + oi + '">' + o + '</button>';
        }).join('') +
        '</div></div>';
    });

    html += '<button class="btn" id="quiz-done" style="margin-top:22px" disabled>交卷</button>';
    body.innerHTML = html;

    var answers = {};
    body.querySelectorAll('.chip').forEach(function (b) {
      b.addEventListener('click', function () {
        var qi = +b.dataset.q;
        answers[qi] = +b.dataset.o;
        body.querySelectorAll('.chip[data-q="' + qi + '"]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        document.getElementById('quiz-done').disabled = Object.keys(answers).length < QUIZ.length;
      });
    });

    document.getElementById('quiz-done').addEventListener('click', function () {
      var right = 0;
      QUIZ.forEach(function (item, qi) { if (answers[qi] === item.a) right++; });
      markNode('assess');
      showSheet(right >= 2 ? '✅' : '📝',
        right >= 2 ? '过了' : '差一点',
        '答对 ' + right + ' / ' + QUIZ.length + ' 题。' +
        (right >= 2 ? '这一关算通过，可以去找陈老师对练了。' : '答错的题已经放进你的复习，明天会再问你一次。'),
        right >= 2 ? 'ok' : '',
        function () { go('s-home'); });
    });

    go('s-lesson');
  }

  function openXiu() {
    var ui = S.unit;
    showSheet('🌱', '今日修行',
      '今天为孩子做一件很小的事：他说话的时候，先不回，只复述一句。\n\n做完回来打个卡，7 天为一轮。',
      'ok',
      function () {
        markNode('xiu');
        toast('已打卡 · 第 1 天');
        go('s-home');
      });
  }

  /* ============================================================
     场景前置
     ============================================================ */

  function renderBrief() {
    var isBoss = S.briefTarget === 'boss';
    var role = ROLES[S.startRole || 0];

    document.getElementById('brief-art').innerHTML = briefArt();
    document.getElementById('brief-tag').textContent = isBoss ? '导师对练' : '情境练习 · ' + role.name;

    if (isBoss) {
      document.getElementById('brief-title').innerHTML = '导师对练 · ' + UNITS[S.unit].ability;
      document.getElementById('brief-cards').innerHTML = [
        { i: '🧠', k: '考什么', t: '本单元知识点的综合应用，不是背定义。' },
        { i: '💬', k: '怎么考', t: '陈老师会连续向你提问，你用自己的话回答。' },
        { i: '🏁', k: '怎么算过', t: '认可度涨到 80 即通过，答得越贴近他的处境涨得越快。' }
      ].map(function (c, i) {
        return '<div class="bcard" style="animation-delay:' + (i * .08 + .1) + 's">' +
          '<div class="bi">' + c.i + '</div><div><div class="bk">' + c.k + '</div><div class="bt">' + c.t + '</div></div></div>';
      }).join('');
    } else {
      document.getElementById('brief-title').innerHTML = role.scene.replace('，', '，<br>');
      document.getElementById('brief-cards').innerHTML = [
        { i: '🎭', k: '你在演谁', t: role.name + ' —— ' + role.duty },
        { i: '🎯', k: '这一关练什么', t: role.focus + '。' },
        { i: '⏱', k: '怎么算完成', t: 'ABC 三个角色接力各演一次，全过才算这一关通过。' }
      ].map(function (c, i) {
        return '<div class="bcard" style="animation-delay:' + (i * .08 + .1) + 's">' +
          '<div class="bi">' + c.i + '</div><div><div class="bk">' + c.k + '</div><div class="bt">' + c.t + '</div></div></div>';
      }).join('');
    }
  }

  /* ============================================================
     ABC 对练
     ============================================================ */

  var P = {
    role: 0,
    score: 0,
    done: [false, false, false],
    picked: -1,
    awaitingWhy: false,
    lock: false
  };

  function openPractice() {
    P.role = S.startRole || 0;
    P.score = 0;
    P.done = [false, false, false];
    P.picked = -1;
    P.awaitingWhy = false;
    P.lock = false;
    document.getElementById('p-chat').innerHTML = '';
    bindPracticeInput();
    startRole(P.role, true);
  }

  function renderRoleCard() {
    var r = ROLES[P.role];
    var box = document.getElementById('p-rolecard');
    box.style.animation = 'none';
    void box.offsetHeight;
    box.style.animation = '';
    box.innerHTML =
      '<div class="rc-av">' + roleIllo(r.key, 56) + '</div>' +
      '<div class="rc-txt">' +
      '<div class="rc-k">你正在扮演</div>' +
      '<div class="rc-name">' + r.name + '<em>' + r.tag + '</em></div>' +
      '<div class="rc-duty">' + r.duty + '</div>' +
      '</div>' +
      '<div class="rc-badge">' + ['🎤', '👂', '👀'][P.role] + '</div>';
    document.getElementById('p-stage-art').innerHTML = sceneArt(r.key);
  }

  function renderRelay() {
    var h = '';
    ROLES.forEach(function (r, i) {
      if (i) h += '<span class="relay-line"></span>';
      var cls = P.done[i] ? 'done' : (i === P.role ? 'on' : '');
      h += '<span class="rchip ' + cls + '"><b>' + r.tag + '</b>' + r.name + '</span>';
    });
    document.getElementById('p-relay').innerHTML = h;
  }

  function startRole(i, first) {
    P.role = i;
    P.picked = -1;
    P.awaitingWhy = false;
    P.lock = false;
    renderRoleCard();
    renderRelay();

    var chat = document.getElementById('p-chat');
    chat.innerHTML = '';
    document.getElementById('p-hints').innerHTML = '';
    document.getElementById('p-input').value = '';
    autoGrow(document.getElementById('p-input'));
    var r = ROLES[i];
    document.getElementById('p-input').placeholder = r.ph;

    var enter = function () {
      setInput(false);
      addMsg(chat, 'sys', '', '第 ' + (i + 1) + ' 幕 · ' + r.scene);
      setTimeout(function () { phaseIntro(i); }, 420);
    };

    if (first && !S.roleSeen[i]) showRoleIntro(i, enter);
    else if (first) enter();
    else {
      var needIntro = !S.roleSeen[i];
      showCurtain(i, function () {
        if (needIntro) showRoleIntro(i, enter);
        else enter();
      });
    }
  }

  /* 第一次扮演这个角色：先讲清「你是谁、你要做什么」，再进场景 */
  function showRoleIntro(i, cb) {
    var r = ROLES[i];
    var el = document.getElementById('role-intro');
    if (!el) { cb(); return; }

    document.getElementById('ri-k').textContent = '第 ' + (i + 1) + ' 幕 · 你的角色';
    document.getElementById('ri-fig').innerHTML = roleIllo(r.key, 118);
    document.getElementById('ri-t').innerHTML = '现在你是<br>' + r.name;
    s('#ri-s', r.duty);
    document.getElementById('ri-list').innerHTML = (r.steps || []).map(function (t, k) {
      return '<li style="animation-delay:' + (.3 + k * .12) + 's"><b>' + (k + 1) + '</b><span>' + t + '</span></li>';
    }).join('');

    el.className = 'roleintro on';
    S.roleSeen[i] = true;

    var goBtn = document.getElementById('ri-go');
    var closing = false;
    goBtn.onclick = function () {
      if (closing) return;
      closing = true;
      el.className = 'roleintro out';
      setTimeout(function () {
        el.className = 'roleintro';
        cb();
      }, 380);
    };
  }

  function showCurtain(i, cb) {
    var el = document.getElementById('curtain');
    document.getElementById('curtain-illo').innerHTML = roleIllo(ROLES[i].key, 104);
    document.getElementById('curtain-t').innerHTML = '现在你是<br>' + ROLES[i].name;
    s('#curtain-s', ROLES[i].duty);
    el.className = 'curtain on';
    setTimeout(function () {
      el.className = 'curtain out';
      setTimeout(function () {
        el.className = 'curtain';
        cb();
      }, 400);
    }, 1600);
  }

  function phaseIntro(i) {
    var chat = document.getElementById('p-chat');
    if (i === 0) {
      addMsg(chat, 'ai', '小希 · 倾听者', '我在。<br>最近有什么事，让你心里有点堵？你慢慢说。');
      setInput(true);
    } else if (i === 1) {
      addMsg(chat, 'ai', '小希 · 同班家长',
        '我女儿昨天说不想上学，我问她为什么，她就把门关了。<br>我一晚上没睡着。');
      renderHints();
      setInput(true);
    } else {
      addMsg(chat, 'ai', '小希 · 同班家长',
        '刚才那几句我都记下来了。<br>你当观察者，帮我挑一句「先接情绪」的。');
      renderTranscript();
      setInput(false);
    }
  }

  function renderTranscript() {
    var chat = document.getElementById('p-chat');
    var m = document.createElement('div');
    m.className = 'msg ai';
    var html = '<div class="mname">观察者任务 · 选一句</div><div class="mtext">' +
      '<div class="linepick">' +
      TRANSCRIPT.map(function (t, k) {
        return '<button class="lp" data-k="' + k + '" style="animation-delay:' + (k * .07) + 's">' +
          '<span class="lp-k">' + 'ABC'[k] + '</span><span>' + t + '</span></button>';
      }).join('') +
      '</div></div>';
    m.innerHTML = html;
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;

    m.querySelectorAll('.lp').forEach(function (b) {
      b.addEventListener('click', function () {
        if (P.lock) return;
        var k = +b.dataset.k;
        m.querySelectorAll('.lp').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');

        if (k === 1) {
          P.picked = 1;
          addMsg(chat, 'ai', '小希 · 同班家长', '对，就是 B。<br>那你为什么觉得这句是「先接情绪」？');
          setTimeout(function () {
            P.awaitingWhy = true;
            setInput(true, '说说你为什么选这句…');
          }, 500);
        } else {
          P.picked = k;
          addMsg(chat, 'ai', '小希 · 同班家长',
            (k === 0 ? 'A 是在追问原因，' : 'C 是在否定她的感受，') + '不算先接情绪。<br>不过你说说看，你为什么选它？');
          setTimeout(function () {
            P.awaitingWhy = true;
            setInput(true, '说说你选它的理由…');
          }, 600);
        }
      });
    });
  }

  function setInput(on, ph) {
    var inp = document.getElementById('p-input');
    var btn = document.getElementById('p-send');
    inp.disabled = !on;
    btn.disabled = true;
    if (ph) inp.placeholder = ph;
    if (on) setTimeout(function () { inp.focus(); }, 60);
  }

  function renderHints() {
    var box = document.getElementById('p-hints');
    box.innerHTML = '';
    if (P.role !== 1) return;
    ['听起来你一晚上都没睡好，心里挺慌的。', '你是担心说错话，把她推得更远。'].forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'hint';
      b.textContent = t;
      b.addEventListener('click', function () {
        var inp = document.getElementById('p-input');
        inp.value = t;
        autoGrow(inp);
        document.getElementById('p-send').disabled = false;
        inp.focus();
      });
      box.appendChild(b);
    });
  }

  function bindPracticeInput() {
    var inp = document.getElementById('p-input');
    var btn = document.getElementById('p-send');
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    inp.addEventListener('input', function () {
      autoGrow(inp);
      btn.disabled = !inp.value.trim();
    });
    btn.addEventListener('click', submitPractice);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitPractice(); }
    });
  }

  var FEELINGS = ['难受', '委屈', '生气', '累', '失望', '怕', '烦', '无力', '心酸', '难过', '崩溃', '沮丧', '堵', '憋', '想哭', '自责'];

  function submitPractice() {
    if (P.lock) return;
    var inp = document.getElementById('p-input');
    var btn = document.getElementById('p-send');
    var chat = document.getElementById('p-chat');
    var text = inp.value.trim();
    if (!text) return;

    inp.value = '';
    autoGrow(inp);
    btn.disabled = true;
    inp.disabled = true;
    P.lock = true;

    addMsg(chat, 'me', '我', text);

    if (P.role === 0) judgeSpeaker(text);
    else if (P.role === 1) judgeListener(text);
    else judgeObserver(text);
  }

  function judgeSpeaker(text) {
    var hit = FEELINGS.filter(function (f) { return text.indexOf(f) > -1; });
    var lvl = hit.length >= 1 ? 'hi' : 'lo';
    var chat = document.getElementById('p-chat');

    setTimeout(function () {
      addMsg(chat, 'ai', '小希 · 倾听者', lvl === 'hi'
        ? '嗯……我听见了。<br>你不是在抱怨地脏了，你是觉得自己没被当回事，对吧？'
        : '（她等了一会儿）<br>我好像还不太知道你那一下是什么感觉。');

      setTimeout(function () {
        showSheet(lvl === 'hi' ? '🎤' : '💭',
          lvl === 'hi' ? '说出感受了' : '这句可以用',
          lvl === 'hi'
            ? '诉说者的功课是「说出感受」，不是「讲清事情」。你做到了。'
            : '下次可以再加一句「我当时的感受是……」。这句也算过，我们继续下一幕。',
          'ok',
          function () {
            P.score += lvl === 'hi' ? 2 : 1;
            nextRole();
          });
      }, 700);
    }, 600);
  }

  function judgeListener(text) {
    var rule = {
      good: ['睡不着', '担心', '难受', '关', '怕', '没办法', '不睡', '一晚', '煎熬', '慌张', '心疼'],
      bad: ['都这样', '过两天', '别急', '你应该']
    };
    var sc = judge(text, rule);
    var lvl = sc >= 3 ? 'hi' : sc >= 1 ? 'mid' : 'lo';
    var chat = document.getElementById('p-chat');

    setTimeout(function () {
      addMsg(chat, 'ai', '小希 · 同班家长', lvl === 'hi'
        ? '……嗯。（她停了一下）你还挺懂的。<br>我好像能再说一点了。'
        : lvl === 'mid' ? '（她没接话，只是叹了口气）' : '（她沉默了一会儿）算了，说了也没用。');

      setTimeout(function () {
        showSheet(lvl === 'hi' ? '👂' : lvl === 'mid' ? '🤏' : '💭',
          lvl === 'hi' ? '这就是倾听' : '先这样，继续往下',
          lvl === 'hi'
            ? '你把她的心情说出了口，而不是给她办法。她敢继续说下去了。'
            : '先把她此刻的状态说出来，再谈别的。她要的是被听懂，不是被指导。这幕算过，下一幕看你说。',
          'ok',
          function () {
            P.score += lvl === 'hi' ? 2 : lvl === 'mid' ? 1 : 0.5;
            nextRole();
          });
      }, 700);
    }, 600);
  }

  function judgeObserver(text) {
    var good = ['感受', '情绪', '难受', '共情', '先', '听', '懂', '接', '体谅', '承认'];
    var hit = good.filter(function (k) { return text.indexOf(k) > -1; });
    var ok = hit.length >= 1;
    var chat = document.getElementById('p-chat');

    setTimeout(function () {
      addMsg(chat, 'ai', '小希 · 同班家长', ok
        ? '对。先接情绪，就是不解释、不反驳，先把对方此刻的样子说出来。'
        : '嗯，也是一种看法。不过那句好的地方在于：它只描述她的状态，没有评价对错。');

      setTimeout(function () {
        showSheet(ok ? '👀' : '💭', ok ? '看明白了' : '记住这个标准',
          ok
            ? '观察者的功课是「认出好的动作」。你能认出来，下次自己就做得出。'
            : '好的那句，只描述她的状态，没有评价、没有建议。这幕算过。',
          'ok',
          function () {
            P.score += ok ? 2 : 1;
            nextRole();
          });
      }, 700);
    }, 600);
  }

  function nextRole() {
    P.done[P.role] = true;
    renderRelay();
    P.lock = false;
    if (P.role < ROLES.length - 1) {
      setTimeout(function () { startRole(P.role + 1, false); }, 300);
    } else {
      finishPractice();
    }
  }

  function finishPractice() {
    var passed = 0;
    ['pA', 'pB', 'pC'].forEach(function (k, i) {
      if (P.done[i]) { markNode(k); passed++; }
    });
    var stars = P.score >= 5 ? 3 : P.score >= 3 ? 2 : 1;
    var all = passed === 3;
    showResult(stars,
      all ? '三个角色都过了' : '这一幕过了',
      '完成 ' + passed + '/3 个角色 · +' + (P.score * 10) + ' 经验',
      '回到路径',
      function () { go('s-home'); });
  }

  /* ============================================================
     导师对练
     ============================================================ */

  function openBoss() {
    S.bturn = 0;
    S.recog = 20;
    updateRecog();
    var mr = document.querySelector('.mentor-id .mid-role');
    if (mr) mr.textContent = '6Q 认证导师 · ' + UNITS[S.unit].ability + '单元';
    var chat = document.getElementById('b-chat');
    chat.innerHTML = '';
    bindBossInput();
    var inp = document.getElementById('b-input');
    var btn = document.getElementById('b-send');
    inp.disabled = true;
    btn.disabled = true;
    inp.value = '';
    inp.placeholder = '陈老师正在准备…';
    setTimeout(function () {
      addMsg(chat, 'sys', '', UNITS[S.unit].ability + '单元 · 共 6 问 · 认可度到 80 通关');
      setTimeout(askBoss, 420);
    }, 220);
  }

  function updateRecog() {
    document.getElementById('rbar').style.width = Math.max(3, S.recog) + '%';
    s('#rnum', Math.round(S.recog));
    document.querySelector('.rbar').classList.toggle('pass', S.recog >= 80);
  }

  function setSpeaking(on) {
    var stage = document.querySelector('.mentor-stage');
    if (stage) stage.classList.toggle('speaking', !!on);
  }

  function askBoss() {
    var t = BOSS_TURNS[S.bturn];
    if (!t) return;
    var chat = document.getElementById('b-chat');
    var inp = document.getElementById('b-input');
    setSpeaking(true);
    setTimeout(function () {
      addMsg(chat, 'ai', '陈老师', t.q, '<img src="' + MENTOR_IMG + '" alt="陈老师">');
      setSpeaking(false);
      inp.disabled = false;
      inp.placeholder = '回答陈老师的提问…';
      inp.focus();
    }, 520);
  }

  function bindBossInput() {
    var inp = document.getElementById('b-input');
    var btn = document.getElementById('b-send');
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    inp.addEventListener('input', function () {
      autoGrow(inp);
      btn.disabled = !inp.value.trim();
    });
    btn.addEventListener('click', submitBoss);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitBoss(); }
    });
    btn.disabled = true;
  }

  function submitBoss() {
    var inp = document.getElementById('b-input');
    var btn = document.getElementById('b-send');
    var chat = document.getElementById('b-chat');
    var text = inp.value.trim();
    if (!text) return;
    var t = BOSS_TURNS[S.bturn];
    if (!t) return;

    var sc = judge(text, t);
    var lvl = sc >= 3 ? 'hi' : sc >= 1 ? 'mid' : 'lo';
    var delta = lvl === 'hi' ? 18 : lvl === 'mid' ? 12 : 6;

    inp.value = '';
    autoGrow(inp);
    btn.disabled = true;
    inp.disabled = true;
    inp.placeholder = '陈老师正在回应…';

    addMsg(chat, 'me', '我', text);

    var typing = document.getElementById('typing');
    setSpeaking(true);
    typing.classList.add('on');
    chat.scrollTop = chat.scrollHeight;

    setTimeout(function () {
      typing.classList.remove('on');
      setSpeaking(false);
      addMsg(chat, 'ai', '陈老师', t.fb[lvl], '<img src="' + MENTOR_IMG + '" alt="陈老师">');

      S.recog = Math.min(100, S.recog + delta);
      updateRecog();

      if (S.recog >= 80) {
        setTimeout(function () {
          setSpeaking(true);
          addMsg(chat, 'ai', '陈老师',
            '好，到这里。认可度够了——你不是背下来的，是真的接到了。',
            '<img src="' + MENTOR_IMG + '" alt="陈老师">');
          setSpeaking(false);
          setTimeout(function () { finishBoss(true); }, 1200);
        }, 700);
        return;
      }

      S.bturn++;
      if (S.bturn >= BOSS_TURNS.length) {
        setTimeout(function () { finishBoss(false); }, 900);
        return;
      }
      setTimeout(askBoss, 800);
    }, 1100 + Math.random() * 500);
  }

  function finishBoss(pass) {
    if (!pass) {
      /* 原型阶段：没到线也让过，避免反复试错卡住 */
      showSheet2('🤏', '还差一点到 80', '认可度 ' + Math.round(S.recog) + '。原型阶段先按通过处理，正式版要再来一次。', {
        okText: '按通过继续',
        onOk: function () { finishBoss(true); }
      });
      return;
    }
    markNode('boss');
    var hasNext = !!UNITS[S.unit + 1];
    showResult(3, '通过',
      '认可度 ' + Math.round(S.recog) + ' · ' + UNITS[S.unit].ability + '单元已完成',
      hasNext ? '进入下一单元' : '回到路径',
      function () {
        if (!hasNext) { go('s-home'); return; }
        advanceUnit();
      });
  }

  function advanceUnit() {
    S.unit++;
    if (!S.prog[S.unit]) S.prog[S.unit] = {};
    go('s-home');
    var ui = S.unit;
    var u = UNITS[ui];
    if (u && u.lesson.kind !== 'online' && !S.unitRoute[ui]) {
      setTimeout(function () { showRoute(ui, null); }, 760);
    }
  }

  /* ============================================================
     路径切换 / 个人
     ============================================================ */

  function openPathSheet() {
    var el = document.getElementById('path-sheet');
    if (!el) return;

    var total = 0;
    Object.keys(S.prog).forEach(function (k) {
      UNITS[k] && UNITS[k].nodes.forEach(function (n) { if (S.prog[k][n.key]) total++; });
    });
    s('#ps-done', total);
    s('#ps-sub', (S.ans.kid || '7-12 岁') + '家长 · ' + (S.assessed ? '已测评' : '未测评'));

    var cur = curPath();
    document.getElementById('ps-cur').innerHTML = PATHS.slice(0, 3).map(function (p) {
      return '<button class="pstile' + (p.id === cur.id ? ' on' : '') + '" data-p="' + p.id + '">' +
        '<span class="pst-ico" style="background:' + p.tone + ';color:' + p.ink + '">' + p.ico + '</span>' +
        '<span class="pst-t">' + p.name + '</span>' +
        (p.id === cur.id ? '<i class="pst-ok">✓</i>' : '') + '</button>';
    }).join('') + '<button class="pstile add" data-p="__add"><span class="pst-ico">＋</span><span class="pst-t">添加</span></button>';

    document.getElementById('ps-grid').innerHTML = PATHS.map(function (p) {
      return '<button class="pscell' + (p.id === cur.id ? ' on' : '') + '" data-p="' + p.id + '">' +
        '<span class="psc-ico" style="background:' + p.tone + ';color:' + p.ink + '">' + p.ico + '</span>' +
        '<span class="psc-t">' + p.name + '</span>' +
        '<small>' + p.units.length + ' 个单元</small></button>';
    }).join('');

    el.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.p;
        if (id === '__add') { toast('更多路径还在排，先选已有的'); return; }
        if (id === cur.id) { closePathSheet(); return; }
        usePath(id);
        closePathSheet();
        toast('已切换到「' + curPath().name + '」路径');
      });
    });

    el.classList.add('on');
  }

  function closePathSheet() {
    var el = document.getElementById('path-sheet');
    if (el) el.classList.remove('on');
  }

  /* ============================================================
     我的
     ============================================================ */

  function myStats() {
    var done = 0, total = 0;
    Object.keys(S.prog).forEach(function (k) {
      UNITS[k] && UNITS[k].nodes.forEach(function (n) {
        total++;
        if (S.prog[k][n.key]) done++;
      });
    });
    return { done: done, total: total };
  }

  function renderMe() {
    var box = document.getElementById('me-body');
    if (!box) return;
    var st = myStats();
    var p = curPath();
    var planName = S.paid ? (S.plan === 'y' ? '成长会员 · 年付' : '成长会员') : '免费体验';
    var planSub = S.paid
      ? '全部 19 个单元已解锁 · 每日 3 次导师对练'
      : '仅第 1 个单元开放 · 每日 1 次导师对练';

    box.innerHTML =
      '<div class="mecard">' +
      '<div class="me-av"><span>' + (S.ans.role || '家').charAt(0) + '</span></div>' +
      '<div class="me-info"><b>阿 May</b>' +
      '<small>' + (S.ans.kid || '7-12 岁') + '孩子的妈妈 · ' + (S.assessed ? '已测评' : '未测评') + '</small></div>' +
      '<div class="me-tag' + (S.paid ? ' on' : '') + '">' + (S.paid ? '会员' : '免费') + '</div>' +
      '</div>' +

      '<div class="mepath">' +
      '<div class="mep-ico" style="background:' + p.tone + ';color:' + p.ink + '">' + p.ico + '</div>' +
      '<div class="mep-txt"><small>当前学习路径</small><b>' + p.name + '</b></div>' +
      '<button class="mep-switch" id="me-switch">切换</button>' +
      '</div>' +

      '<div class="mestats">' +
      '<div><b>' + st.done + '</b><small>已过关卡</small></div>' +
      '<div><b>' + (S.assessed ? '1' : '0') + '</b><small>已解锁单元</small></div>' +
      '<div><b>' + (st.done > 0 ? 6 : 0) + '</b><small>连续天数</small></div>' +
      '</div>' +

      '<div class="mesub' + (S.paid ? ' on' : '') + '">' +
      '<div class="mes-k">我的订阅</div>' +
      '<div class="mes-t">' + planName + '</div>' +
      '<div class="mes-s">' + planSub + '</div>' +
      '<button class="mes-btn" id="me-sub">' + (S.paid ? '续费 / 更换套餐' : '开通订阅 · 查看全部套餐') + '</button>' +
      '</div>' +

      '<div class="melist">' +
      '<button class="merow" id="me-go-home"><span class="mel-ico">🧭</span><span class="mel-t">我的学习路径</span><i>›</i></button>' +
      '<button class="merow" id="me-go-path"><span class="mel-ico">🔀</span><span class="mel-t">切换学习路径</span><i>›</i></button>' +
      '<button class="merow" id="me-go-test"><span class="mel-ico">📝</span><span class="mel-t">重新做入学测评</span><i>›</i></button>' +
      '<button class="merow" id="me-go-app"><span class="mel-ico">🏠</span><span class="mel-t">回到超级爸妈首页</span><i>›</i></button>' +
      '</div>' +
      '<p class="fine center">订阅 7 天内不满意，全额退</p>';

    var on = function (id, fn) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };
    on('me-switch', openPathSheet);
    on('me-go-path', openPathSheet);
    on('me-sub', function () { go('s-paywall'); });
    on('me-go-home', function () { go('s-home'); });
    on('me-go-app', function () { go('s-app'); });
    on('me-go-test', function () { startAssess(true); });
  }

  /* ============================================================
     原型测试面板
     ============================================================ */

  function openProto() {
    var box = document.getElementById('proto-list');
    var ui = S.unit;
    var u = UNITS[ui];
    var states = nodeStates(ui);
    var doneN = unitDoneCount(ui);
    var rows = [
      {
        t: '本单元全部关卡',
        st: doneN + '/' + u.nodes.length + ' 已通过',
        b: '一键通关本单元',
        act: function () {
          if (!S.prog[ui]) S.prog[ui] = {};
          u.nodes.forEach(function (n) { S.prog[ui][n.key] = true; });
          renderHome(); closeProto(); toast('本单元已设为全部通过');
        }
      },
      {
        t: '导师对练（BOSS）',
        st: states.indexOf('ready') > -1 ? '当前可挑战' : '仍在锁定中',
        b: '直接进入对练',
        act: function () { closeProto(); go('s-boss'); }
      },
      {
        t: '学习方式偏好',
        st: S.unitRoute[ui] === 'offline' ? '当前：线下' : S.unitRoute[ui] === 'online' ? '当前：线上' : '当前：未选择',
        b: '重选线上 / 线下',
        act: function () { closeProto(); showRoute(ui, function () { renderHome(); }); }
      },
      {
        t: '单元解锁',
        st: allKindsDone(ui) ? '可以开启下一阶段' : '前置未通关，下一单元锁定',
        b: '直接开启下一单元',
        act: function () { closeProto(); unlockNextStage(); }
      },
      {
        t: '切换学习路径',
        st: curPath().name + ' · ' + PATHS.length + ' 条路径',
        b: '打开路径切换',
        act: function () { closeProto(); openPathSheet(); }
      },
      {
        t: '入学测评',
        st: S.assessed ? '已完成' : '未完成',
        b: '重做测评',
        act: function () { closeProto(); startAssess(true); }
      }
    ];

    box.innerHTML = rows.map(function (r, i) {
      return '<div class="proto-row" style="animation-delay:' + (i * .04) + 's">' +
        '<div class="prl"><b>' + r.t + '</b><span class="prs">' + r.st + '</span></div>' +
        '<button class="prb" data-i="' + i + '">' + r.b + '</button></div>';
    }).join('');

    box.querySelectorAll('.prb').forEach(function (b) {
      b.addEventListener('click', function () { rows[+b.dataset.i].act(); });
    });

    document.getElementById('proto-sheet').classList.add('on');
  }

  function closeProto() {
    document.getElementById('proto-sheet').classList.remove('on');
  }

  /* ============================================================
     弹层
     ============================================================ */

  var sheetCb = null;

  function showSheet(ico, title, body, tone, cb) {
    document.getElementById('sheet-ico').textContent = ico;
    document.getElementById('sheet-ico').className = 'sheet-ico' + (tone === 'ok' ? '' : ' bad');
    s('#sheet-t', title);
    document.getElementById('sheet-p').textContent = body;
    var alt = document.getElementById('sheet-alt');
    alt.style.display = 'none';
    alt.onclick = null;
    document.getElementById('sheet-btn').textContent = '继续';
    document.getElementById('sheet').classList.add('on');
    sheetCb = cb || null;
  }

  /* 带第二个按钮的弹层：原型跳过 / 换一条路 */
  function showSheet2(ico, title, body, opt) {
    opt = opt || {};
    document.getElementById('sheet-ico').textContent = ico;
    document.getElementById('sheet-ico').className = 'sheet-ico bad';
    s('#sheet-t', title);
    document.getElementById('sheet-p').textContent = body;
    var main = document.getElementById('sheet-btn');
    var alt = document.getElementById('sheet-alt');
    main.textContent = opt.okText || '知道了';
    sheetCb = opt.onOk || null;
    if (opt.alt) {
      alt.style.display = 'block';
      alt.textContent = opt.alt;
      alt.onclick = function () {
        document.getElementById('sheet').classList.remove('on');
        sheetCb = null;
        if (opt.onAlt) setTimeout(opt.onAlt, 180);
      };
    } else {
      alt.style.display = 'none';
      alt.onclick = null;
    }
    document.getElementById('sheet').classList.add('on');
  }

  document.getElementById('sheet-btn').addEventListener('click', function () {
    document.getElementById('sheet').classList.remove('on');
    var cb = sheetCb;
    sheetCb = null;
    if (cb) setTimeout(cb, 170);
  });

  function showResult(stars, title, sub, btn, cb) {
    var box = document.getElementById('stars');
    box.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var el = document.createElement('span');
      el.textContent = '★';
      if (i < stars) {
        el.className = 'on';
        el.style.animationDelay = (i * .2) + 's';
      }
      box.appendChild(el);
    }
    s('#rp-title', title);
    s('#rp-sub', sub);
    var b = document.getElementById('rp-btn');
    b.textContent = btn;
    b.onclick = function () {
      document.getElementById('result-pop').classList.remove('on');
      if (cb) cb();
    };
    document.getElementById('result-pop').classList.add('on');
    if (stars === 3) setTimeout(burst, 260);
  }

  /* ============================================================
     消息
     ============================================================ */

  function addMsg(chat, side, name, text, avHtml) {
    var m = document.createElement('div');
    m.className = 'msg ' + side;
    var av = '';
    if (side === 'ai') {
      av = '<div class="av">' + (avHtml || mascot({ size: 34, c1: '#C4B5FD', c2: '#8B5CF6' })) + '</div>';
    }
    m.innerHTML = av + '<div>' + (name ? '<div class="mname">' + name + '</div>' : '') +
      '<div class="mtext">' + text + '</div></div>';
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
    return m;
  }

  /* ============================================================
     事件绑定
     ============================================================ */

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go]');
    if (t) { go(t.dataset.go, t.dataset.dir); return; }

    var tab = e.target.closest('[data-tab]');
    if (tab) {
      var k = tab.dataset.tab;
      if (k === 'home') go('s-home');
      else if (k === 'app') go('s-app');
      else if (k === 'mentor') {
        if (S.assessed) go('s-mentor');
        else startAssess(true);
      } else if (k === 'study') go('s-home');
      else if (k === 'tutor') {
        if (S.assessed) go('s-home');
        else startAssess(true);
      }
      else if (k === 'me') go('s-me');
      else {
        toast('这个 tab 还在做');
      }
      return;
    }

    if (e.target.closest('#pay-btn')) { pay(); return; }
  });

  document.getElementById('home-avatar').addEventListener('click', openPathSheet);
  document.getElementById('hh-path').addEventListener('click', openPathSheet);
  document.getElementById('pay-back').addEventListener('click', function () {
    go(S.payFrom || 's-preview', 'back');
  });
  document.getElementById('ps-close').addEventListener('click', closePathSheet);
  document.getElementById('path-sheet').addEventListener('click', function (e) {
    if (e.target === this) closePathSheet();
  });
  document.getElementById('proto-fab').addEventListener('click', openProto);
  document.getElementById('proto-close').addEventListener('click', closeProto);
  document.getElementById('proto-sheet').addEventListener('click', function (e) {
    if (e.target === this) closeProto();
  });
  document.getElementById('boss-skip').addEventListener('click', function () {
    S.recog = 100;
    updateRecog();
    finishBoss(true);
  });

  document.getElementById('assess-close').addEventListener('click', function () {
    go(S.assessed ? 's-mentor' : 's-hello', 'back');
  });

  document.getElementById('brief-go').addEventListener('click', function () {
    go(S.briefTarget === 'boss' ? 's-boss' : 's-practice');
  });

  document.getElementById('m-retest').addEventListener('click', function () {
    startAssess(true);
  });

  document.getElementById('route-pop').addEventListener('click', function (e) {
    if (e.target === this) closeRoute();
  });

  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (document.getElementById('s-home').classList.contains('active')) drawLines();
    }, 160);
  });
  document.getElementById('home-scroll').addEventListener('scroll', function () {
    if (document.getElementById('s-home').classList.contains('active')) drawLines();
  }, { passive: true });

  /* 深度链接 */
  function hashRoute() {
    var h = (location.hash || '').replace('#', '');
    var el = h ? document.getElementById(h) : null;
    if (!el || !el.classList.contains('screen')) return false;

    if (h === 's-home' || h === 's-brief' || h === 's-practice' || h === 's-boss') {
      S.prog[0] = { learn: true, pA: true, pB: true };
    }
    if (h === 's-mentor' || h === 's-boss' || h === 's-lesson') {
      if (!S.assessed) { seedAnswers(); computeScores(); S.assessed = true; }
    }
    if (h === 's-lesson' && !S.unitRoute[0]) S.unitRoute[0] = 'online';
    if (h === 's-assess') { S.sec = 0; S.q = 0; }

    go(h);
    if (h === 's-paywall') renderPlans();    return true;
  }

  window.addEventListener('hashchange', hashRoute);

  document.getElementById('splash-mascot').innerHTML = Q_IMG(172);

  if (!hashRoute()) {
    document.getElementById('s-splash').classList.add('active');
  }
})();
