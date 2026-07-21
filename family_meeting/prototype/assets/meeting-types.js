const STEPS = ['opening', 'collect', 'discuss', 'distill', 'consensus', 'end'];

const TOPICS_BY_TYPE = {
  '01': [
    { id: '01-1', title: '集体活动' },
    { id: '01-2', title: '共同愿景' },
    { id: '01-3', title: '互相欣赏' },
  ],
  '02': [
    { id: '02-1', title: '年假地' },
    { id: '02-2', title: '春节安排' },
    { id: '02-3', title: '上网时间' },
    { id: '02-4', title: '报补习班' },
  ],
  '03': [
    { id: '03-1', title: '周末家务' },
    { id: '03-2', title: '管理压岁钱' },
  ],
  '04': [],
};

const COPY = {
  '01': {
    opening: '欢迎来到种苹果树家庭会议。今天我们聚焦情感连接，一起欣赏彼此、描绘家庭愿景。',
    collect: '请每位家人分享：最近让你感到温暖或骄傲的一件小事，或你对家庭的美好期待。',
    discuss: '围绕今天的议题，说说彼此的想法与感受，不急于解决具体纠纷，先听见对方。',
    distill: '从刚才的表达中，提炼出大家共同认可的关键词、想法或家庭愿景片段。',
    consensus: '确认本场要带走的小行动或约定——可以是下次集体活动，或一句彼此欣赏的话。',
    end: '种苹果树会议结束。带着彼此的欣赏与愿景，继续滋养家庭情感。',
  },
  '02': {
    opening: '欢迎来到除杂草家庭会议。今天我们聚焦发现问题、全家一起决策。',
    collect: '请每位家人说出对议题的初步想法、顾虑或期待，先收集再评判。',
    discuss: '头脑风暴利弊与选项，帮助全家看清不同选择的后果与感受。',
    distill: '把讨论收敛为 2–3 个可行方案或待决要点，便于下一步决策。',
    consensus: '全家对选定方案达成一致，并明确谁、何时、做什么。',
    end: '除杂草会议结束。决策已记录，待办将分发给相关家人。',
  },
  '03': {
    opening: '欢迎来到持续耕耘家庭会议。今天我们用固定流程，保持例行沟通与约定。',
    collect: '请分享近期执行情况：哪些约定做得好，哪些需要调整？',
    discuss: '围绕家务分工、零花钱管理等例行议题，商量更可持续的做法。',
    distill: '提炼出需要更新的分工表、规则或检查方式。',
    consensus: '确认新的例行约定与责任人，确保每位家人都清楚自己的部分。',
    end: '持续耕耘会议结束。例行约定已更新，下次继续跟进。',
  },
  '04': {
    opening: '欢迎来到危机公关家庭会议。冲突之后，我们先处理心情，再处理事情。请先表达此刻的感受。',
    collect: '在心情回合中，请每位家人用「我感到…因为…」的方式表达情绪，暂不讨论对错。',
    discuss: '心情回合结束后，再一起梳理事情经过，寻找修复与理解的可能。',
    distill: '提炼双方都能接受的理解与修复要点，避免再次伤害。',
    consensus: '若本场有轻量行动（如道歉、拥抱、约定暂停语），请全员确认；也可选择「本场无行动」。',
    end: '危机公关会议结束。关系修复优先，纪要已归档供回顾。',
  },
};

const TYPES = [
  {
    id: '01',
    name: '种苹果树',
    purpose: '情感连接',
    color: '#E8A838',
  },
  {
    id: '02',
    name: '除杂草',
    purpose: '发现问题、全家决策',
    color: '#5B8C5A',
  },
  {
    id: '03',
    name: '持续耕耘',
    purpose: '固定流程保持沟通',
    color: '#4A90A4',
  },
  {
    id: '04',
    name: '危机公关',
    purpose: '冲突后修复，先心情后事情',
    color: '#C45C5C',
  },
];

function topicsFor(typeId) {
  return TOPICS_BY_TYPE[typeId] ? TOPICS_BY_TYPE[typeId].slice() : [];
}

function copyFor(typeId, stepId) {
  const typeCopy = COPY[typeId];
  if (!typeCopy) return '';
  return typeCopy[stepId] || '';
}

const MeetingTypes = {
  STEPS,
  TYPES,
  topicsFor,
  copyFor,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MeetingTypes;
}

if (typeof window !== 'undefined') {
  window.MeetingTypes = MeetingTypes;
}
