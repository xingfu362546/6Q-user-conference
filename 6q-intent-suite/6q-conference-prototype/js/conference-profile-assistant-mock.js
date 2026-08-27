/**
 * 学员画像分析助手 · 原型 Mock 数据与匹配器
 * 生产环境由 Dify + 产品/课务接口替换。
 */
(function (global, factory) {
  var Core =
    global.ConferenceProfileAssistantCore ||
    (typeof require === "function"
      ? require("./conference-profile-assistant-core.js")
      : null);
  var api = factory(Core);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.ConferenceProfileAssistantMock = api;
})(typeof window !== "undefined" ? window : globalThis, function (Core) {
  "use strict";

  if (!Core) throw new Error("ConferenceProfileAssistantCore is required");

  var intents = [
    {
      id: "interest",
      label: "学员在系统中对什么类型的课程感兴趣？",
      hint: "解读用户标签与行为埋点",
    },
    {
      id: "followup",
      label: "学员下一步应该如何跟进？",
      hint: "结合上课层级和报读会务记录",
    },
    {
      id: "product",
      label: "应该推荐什么课程产品比较适合该学员？",
      hint: "补充条件或直接智能匹配",
    },
  ];

  var learners = {
    m10009: {
      memberId: "m10009",
      memberName: "项琳琳",
      city: "广州市",
      tagLevel: "沙龙",
      enrollmentLevels: ["分享会"],
      inferredBudget: 5000,
      inferredTopic: "亲子关系",
      tags: ["亲子沟通关注", "家庭关系改善", "高活跃潜客", "上课层级：沙龙"],
      tracking: [
        { type: "页面浏览", detail: "近30天浏览亲子关系课程详情 3 次", time: "2026-08-25 21:30" },
        { type: "视频观看", detail: "观看亲子沟通主题视频 86 分钟", time: "2026-08-24 10:12" },
        { type: "直播参与", detail: "参加家庭沟通直播 2 场", time: "2026-08-20 19:30" },
        { type: "社区互动", detail: "收藏亲子关系话题 4 条", time: "2026-08-19 09:20" },
      ],
      follows: [
        {
          time: "2026-08-23 16:40",
          staff: "陈老师",
          content: "学员希望改善与青春期孩子的沟通，预算约5000元，广州上课优先。",
        },
        {
          time: "2026-07-18 11:20",
          staff: "李老师",
          content: "分享会后反馈较好，愿意继续了解体系课程。",
        },
      ],
      enrollments: [
        {
          level: "沙龙",
          title: "第612期《亲子沟通体验沙龙》（广州站）",
          city: "广州市",
          teacher: "6Q陈老师",
          startsAt: "2026-05-18 19:30",
          endsAt: "2026-05-18 21:30",
          status: "已报读",
        },
        {
          level: "分享会",
          title: "第188期《高EQ智慧父母分享会》（广州站）",
          city: "广州市",
          teacher: "6Q张三",
          startsAt: "2026-07-12 09:00",
          endsAt: "2026-07-12 17:30",
          status: "已报读",
        },
      ],
      relations: {
        prod_parent_relation: "qualified",
      },
    },
    m10001: {
      memberId: "m10001",
      memberName: "夏兰",
      city: "广州市",
      tagLevel: "分享会",
      enrollmentLevels: ["沙龙", "分享会"],
      inferredBudget: 8000,
      inferredTopic: "亲子沟通",
      tags: ["亲子沟通关注", "近期消费高", "上课层级：分享会"],
      tracking: [
        { type: "页面浏览", detail: "近14天查看一阶课程 5 次", time: "2026-08-26 14:20" },
        { type: "学习行为", detail: "完成亲子沟通免费课 6 节", time: "2026-08-21 20:10" },
      ],
      follows: [
        {
          time: "2026-08-24 17:10",
          staff: "王老师",
          content: "认可分享会内容，想系统学习如何与孩子沟通。",
        },
      ],
      enrollments: [
        {
          level: "分享会",
          title: "第191期《高EQ智慧父母分享会》（广州站）",
          city: "广州市",
          teacher: "6Q张三",
          startsAt: "2026-08-02 09:00",
          endsAt: "2026-08-02 17:30",
          status: "已报读",
        },
      ],
      relations: {},
    },
    m10003: {
      memberId: "m10003",
      memberName: "张志远",
      city: "佛山市",
      tagLevel: "三阶",
      enrollmentLevels: ["一阶", "二阶", "三阶"],
      inferredBudget: 10000,
      inferredTopic: "家庭成长",
      tags: ["家庭成长", "复训学员", "上课层级：三阶"],
      tracking: [
        { type: "直播参与", detail: "近30天参加家庭成长直播 3 场", time: "2026-08-22 20:00" },
      ],
      follows: [
        {
          time: "2026-08-20 10:30",
          staff: "周老师",
          content: "已经完成三阶，希望后续安排复训巩固。",
        },
      ],
      enrollments: [
        {
          level: "三阶",
          title: "第86期《家庭成长三阶》（佛山站）",
          city: "佛山市",
          teacher: "6Q刘老师",
          startsAt: "2026-06-10 09:00",
          endsAt: "2026-06-12 18:00",
          status: "已报读",
        },
      ],
      relations: {
        prod_parent_relation: "enrolled",
        prod_family_communication: "enrolled",
      },
    },
  };

  function sessionRows(productName, cityA, teacher) {
    return [
      {
        id: productName + "-s1",
        title: "第533期《" + productName + "》（" + cityA.replace("市", "") + "站）",
        city: cityA,
        teacher: teacher,
        startsAt: "2026-08-26",
        startsAtLabel: "2026-08-26 09:00",
        endsAt: "2026-08-28 18:00",
        status: "正在开课中",
      },
      {
        id: productName + "-s2",
        title: "第534期《" + productName + "》（" + cityA.replace("市", "") + "站）",
        city: cityA,
        teacher: teacher,
        startsAt: "2026-09-12",
        startsAtLabel: "2026-09-12 09:00",
        endsAt: "2026-09-14 18:00",
        status: "报读中",
      },
      {
        id: productName + "-s3",
        title: "第535期《" + productName + "》（佛山站）",
        city: "佛山市",
        teacher: teacher,
        startsAt: "2026-09-05",
        startsAtLabel: "2026-09-05 09:00",
        endsAt: "2026-09-07 18:00",
        status: "报读中",
      },
      {
        id: productName + "-s4",
        title: "第536期《" + productName + "》（深圳站）",
        city: "深圳市",
        teacher: teacher,
        startsAt: "2026-10-03",
        startsAtLabel: "2026-10-03 09:00",
        endsAt: "2026-10-05 18:00",
        status: "报读中",
      },
      {
        id: productName + "-old",
        title: "第520期《" + productName + "》（广州站）",
        city: "广州市",
        teacher: teacher,
        startsAt: "2026-06-01",
        startsAtLabel: "2026-06-01 09:00",
        endsAt: "2026-06-03 18:00",
        status: "已结束",
      },
    ];
  }

  var products = [
    {
      productId: "prod_parent_relation",
      productName: "亲子关系成长课",
      series: "亲子关系",
      description:
        "围绕理解孩子、情绪连接和边界沟通建立完整方法，适合希望改善家庭互动的父母。",
      keywords: ["亲子", "关系", "沟通", "孩子"],
      baseScore: 68,
      goods: [
        { skuId: "pr-online", name: "线上基础课包", price: 2980, form: "线上", available: true },
        { skuId: "pr-offline", name: "线下一阶·3天2夜", price: 5800, form: "线下", available: true },
        { skuId: "pr-vip", name: "家庭成长年度方案", price: 12800, form: "线下+线上", available: true },
      ],
      sessions: sessionRows("亲子关系成长课", "广州市", "6Q张三"),
    },
    {
      productId: "prod_eq_parent_1",
      productName: "高EQ智慧父母一阶",
      series: "父母成长",
      description:
        "从情绪识别、沟通回应到冲突修复，建立高EQ父母的第一阶段学习框架。",
      keywords: ["亲子", "父母", "一阶", "沟通"],
      baseScore: 64,
      goods: [
        { skuId: "eq-share", name: "一阶预备线上课", price: 1980, form: "线上", available: true },
        { skuId: "eq-stage1", name: "一阶线下正课", price: 4980, form: "线下", available: true },
        { skuId: "eq-combo", name: "一阶+二阶组合权益", price: 9800, form: "线下", available: true },
      ],
      sessions: sessionRows("高EQ智慧父母一阶", "广州市", "6Q李老师"),
    },
    {
      productId: "prod_family_communication",
      productName: "家庭沟通工作坊",
      series: "家庭关系",
      description:
        "通过真实家庭案例练习倾听、表达与协商，适合需要快速改善互动方式的家庭。",
      keywords: ["家庭", "沟通", "关系", "亲子"],
      baseScore: 60,
      goods: [
        { skuId: "fc-day", name: "一日体验工作坊", price: 1990, form: "线下", available: true },
        { skuId: "fc-2d", name: "两日深度工作坊", price: 3990, form: "线下", available: true },
        { skuId: "fc-family", name: "家庭同行套票", price: 6800, form: "线下", available: true },
      ],
      sessions: sessionRows("家庭沟通工作坊", "广州市", "6Q陈老师"),
    },
    {
      productId: "prod_emotion_parent",
      productName: "父母情绪管理课",
      series: "个人成长",
      description:
        "帮助父母识别压力和情绪触发点，以稳定状态进入亲子沟通。",
      keywords: ["情绪", "父母", "亲子"],
      baseScore: 54,
      goods: [
        { skuId: "ep-micro", name: "线上微课包", price: 599, form: "线上", available: true },
        { skuId: "ep-day", name: "线下一日课", price: 1980, form: "线下", available: true },
      ],
      sessions: sessionRows("父母情绪管理课", "广州市", "6Q周老师"),
    },
  ];

  var fallbackProducts = [
    {
      productId: "fallback_share",
      productName: "亲子关系主题分享会",
      series: "免费/低价入口",
      description: "兜底参考产品：通过主题分享会帮助工作人员继续了解学员需求。",
      keywords: ["亲子", "关系"],
      baseScore: 62,
      isFallback: true,
      goods: [
        { skuId: "fb-share", name: "分享会席位", price: 99, form: "线下", available: true },
      ],
      sessions: sessionRows("亲子关系主题分享会", "广州市", "6Q林老师"),
    },
    {
      productId: "fallback_open",
      productName: "家庭教育公开课",
      series: "免费/低价入口",
      description: "兜底参考产品：适合预算有限或当前信息不足的学员。",
      keywords: ["家庭", "亲子"],
      baseScore: 58,
      isFallback: true,
      goods: [
        { skuId: "fb-open", name: "线上公开课", price: 0, form: "线上", available: true },
      ],
      sessions: sessionRows("家庭教育公开课", "广州市", "6Q孙老师"),
    },
  ];

  function getLearner(memberId) {
    return learners[memberId] || learners.m10009;
  }

  function getProgression(memberId) {
    var learner = getLearner(memberId);
    return Core.resolveCourseLevel(
      learner.tagLevel,
      learner.enrollmentLevels,
    );
  }

  function getInterestAnalysis(memberId) {
    var learner = getLearner(memberId);
    return {
      title: "对亲子关系与家庭沟通类课程兴趣较高",
      summary:
        learner.memberName +
        "近期持续浏览亲子课程内容，并在视频、直播和社区中多次出现家庭沟通信号。",
      evidence: learner.tags.slice(0, 3).map(function (text) {
        return { source: "用户标签", text: text };
      }).concat(
        learner.tracking.slice(0, 4).map(function (row) {
          return { source: row.type, text: row.detail, time: row.time };
        }),
      ),
    };
  }

  function getFollowupAnalysis(memberId) {
    var learner = getLearner(memberId);
    var progression = getProgression(memberId);
    var nextText = progression.nextLevel
      ? "建议下一步重点沟通「" + progression.nextLevel + "」课程。"
      : "学员已到当前最高阶，可结合未来课务建议复训。";
    return {
      title: nextText,
      summary:
        "系统核对了“上课层级”标签和真实报读记录，当前最高有效层级为「" +
        progression.level +
        "」。",
      progression: progression,
      records: learner.enrollments,
      follows: learner.follows,
    };
  }

  function parseBudget(text) {
    var match = String(text || "").match(/(?:预算|以内|不超过|上限)[^\d]{0,4}(\d{3,6})|(\d{3,6})\s*元/);
    return match ? Number(match[1] || match[2]) : null;
  }

  function buildConditions(memberId, input) {
    var learner = getLearner(memberId);
    var text = String((input && input.text) || "");
    var explicit = [];
    var inferred = [];
    var missing = [];
    var budget = parseBudget(text);
    var topicMatch = text.match(/亲子关系|亲子沟通|家庭关系|家庭沟通|情绪管理/);
    var cityMatch = text.match(/广州|佛山|深圳/);

    if (budget) {
      explicit.push({ key: "budget", label: "本次预算", value: budget });
    } else {
      budget = learner.inferredBudget;
      inferred.push({
        key: "budget",
        label: "本次预算",
        value: budget,
        source: "近12月消费与画像估算",
      });
    }

    var topic = topicMatch ? topicMatch[0] : learner.inferredTopic;
    (topicMatch ? explicit : inferred).push({
      key: "topic",
      label: "课程方向",
      value: topic,
      source: topicMatch ? "工作人员提供" : "标签与行为埋点",
    });

    var city = cityMatch ? cityMatch[0] + "市" : learner.city;
    (cityMatch ? explicit : inferred).push({
      key: "city",
      label: "地点偏好",
      value: city,
      source: cityMatch ? "工作人员提供" : "学员所在城市",
    });

    if (!text.trim()) {
      missing.push({
        key: "workerContext",
        label: "工作人员补充",
        value: "尚未提供",
      });
    }

    return Core.buildConditions({
      explicit: explicit,
      inferred: inferred,
      missing: missing,
      confidence: text.trim() ? 88 : 72,
      dataAsOf: "2026-08-27 02:40",
    });
  }

  function match(memberId, input, options) {
    var learner = getLearner(memberId);
    var conditions =
      input && input.explicit
        ? input
        : buildConditions(memberId, { text: (input && input.text) || "" });
    var budget =
      (input && input.budget) ||
      Core.conditionValue(conditions, "budget") ||
      learner.inferredBudget;
    var topic =
      (input && input.topic) ||
      Core.conditionValue(conditions, "topic") ||
      learner.inferredTopic;
    var city =
      (input && input.city) ||
      Core.conditionValue(conditions, "city") ||
      learner.city;
    var source = options && options.forceFailure ? fallbackProducts : products;
    var result = Core.matchProducts(source, {
      budget: budget,
      topic: topic,
      city: city,
      now: (input && input.now) || "2026-08-27",
      signals: learner.tags.concat(
        learner.tracking.map(function (row) {
          return row.detail;
        }),
      ),
      relations: learner.relations,
      allowRetrain: !!(input && input.allowRetrain),
      limit: 3,
    });

    result.forEach(function (row, index) {
      row.rank = index + 1;
      row.reasons = [
        "匹配课程方向「" + topic + "」",
        "预算 " + budget + " 元内存在可售商品",
        row.sessions[0]
          ? "近期可选课务：" + row.sessions[0].city
          : "当前暂无合适课务",
      ];
      row.relationAdvice = Core.relationAdvice(row.relationStatus);
    });

    return {
      isFallback: !!(options && options.forceFailure),
      label:
        options && options.forceFailure
          ? "兜底参考 · 非智能匹配"
          : "智能匹配",
      conditions: conditions,
      products: result,
    };
  }

  function seedSessions(userId) {
    return [
      {
        id: "seed-history-1-" + userId,
        userId: userId,
        memberId: "m10001",
        memberName: "夏兰",
        conferenceId: "conf-12551",
        conferenceName: "第12551期广州会务",
        title: "分享会后的进阶建议",
        createdAt: "2026-08-24T10:00:00Z",
        updatedAt: "2026-08-24T10:08:00Z",
        persisted: true,
        messages: [
          {
            role: "user",
            text: "学员下一步应该如何跟进？",
            createdAt: "2026-08-24T10:00:00Z",
            meta: {},
          },
          {
            role: "ai",
            text: "学员已完成分享会，建议下一步重点了解一阶课程。",
            createdAt: "2026-08-24T10:00:02Z",
            meta: {},
          },
        ],
        matchVersions: [],
      },
      {
        id: "seed-history-2-" + userId,
        userId: userId,
        memberId: "m10003",
        memberName: "张志远",
        conferenceId: "conf-12480",
        conferenceName: "第12480期佛山会务",
        title: "三阶学员复训分析",
        createdAt: "2026-08-20T09:00:00Z",
        updatedAt: "2026-08-20T09:12:00Z",
        persisted: true,
        messages: [
          {
            role: "user",
            text: "学员下一步应该如何跟进？",
            createdAt: "2026-08-20T09:00:00Z",
            meta: {},
          },
          {
            role: "ai",
            text: "学员已完成最高阶课程，可结合未来课务安排复训。",
            createdAt: "2026-08-20T09:00:02Z",
            meta: {},
          },
        ],
        matchVersions: [],
      },
    ];
  }

  return {
    intents: intents,
    learners: learners,
    products: products,
    fallbackProducts: fallbackProducts,
    getLearner: getLearner,
    getProgression: getProgression,
    getInterestAnalysis: getInterestAnalysis,
    getFollowupAnalysis: getFollowupAnalysis,
    buildConditions: buildConditions,
    match: match,
    seedSessions: seedSessions,
  };
});
