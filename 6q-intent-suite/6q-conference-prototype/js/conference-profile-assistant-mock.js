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
      careerPresentation: {
        intendedDirection: "天使",
        interviewSlot: "课程结束后",
        assistantName: "黄翠梅",
        group: "2组",
        qualification: "复训",
        retrainCount: 2,
        enrolledAt: "2026-08-18 09:20",
        checkinNo: 1,
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
      careerPresentation: {
        intendedDirection: "",
        interviewSlot: "课间休息时",
        assistantName: "丁秀芳",
        group: "1组",
        qualification: "复训",
        retrainCount: 0,
        enrolledAt: "2026-08-02 09:00",
        checkinNo: 3,
      },
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
      careerPresentation: {
        intendedDirection: "导师&天使",
        interviewSlot: "随时都可以",
        assistantName: "黄翠梅",
        group: "2组",
        qualification: "复训",
        retrainCount: 7,
        enrolledAt: "2026-06-10 09:00",
        checkinNo: 2,
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

  function giftCourse(name, code, category, marketPrice, settlementPrice, validity) {
    return {
      name: name,
      code: code,
      category: category,
      voucherType: "一类券",
      quantity: 1,
      marketPrice: marketPrice,
      settlementPrice: settlementPrice,
      validity: validity || "永久",
    };
  }

  var OTHER_BENEFITS = [
    { name: "课程权益", createdAt: "2022-05-18 16:32:08" },
    { name: "课程券权益", createdAt: "2022-05-18 16:32:08" },
    { name: "其他权益", createdAt: "2022-05-18 16:32:08" },
  ];

  var QUAL_MENTOR_B = {
    offline: [
      giftCourse("《聆听发问进阶班》", "GDPDID000108", "导师进阶", 14800, 10000),
      giftCourse("《聆听发问基础班》", "GDPDID000107", "导师进阶", 9800, 6000),
      giftCourse("《高效表达训练课》", "GDPDID000110", "导师进阶", 16800, 11000),
      giftCourse("《宝山探索进阶班》", "GDPDID000111", "高EQ二阶", 12800, 8000),
      giftCourse("《<青少年6Q领袖营>导师集训班》", "GDPDID000112", "导师进阶", 14800, 9000),
      giftCourse(
        "《高EQ系列课程》课程卡-导师权益专享",
        "GDPDID000113",
        "高EQ二阶",
        9400,
        6000,
        "2年",
      ),
    ],
    online: [],
    camp: [],
  };

  var QUAL_MENTOR_A = {
    offline: [
      giftCourse("《聆听发问进阶班》", "GDPDID000108", "导师进阶", 14800, 10000),
      giftCourse("《高效表达训练课》", "GDPDID000110", "导师进阶", 16800, 11000),
      giftCourse("《宝山探索进阶班》", "GDPDID000111", "高EQ二阶", 12800, 8000),
      giftCourse("《<青少年6Q领袖营>导师集训班》", "GDPDID000112", "导师进阶", 14800, 9000),
      giftCourse(
        "《高EQ系列课程》课程卡-导师权益专享",
        "GDPDID000113",
        "高EQ二阶",
        9400,
        6000,
        "2年",
      ),
      giftCourse("《高EQ智慧父母一阶》导师复训资格", "GDPDID000120", "高EQ一阶", 9800, 6000),
    ],
    online: [
      giftCourse("《高EQ导师线上复盘课》", "GDPDID000201", "导师进阶", 1980, 0, "1年"),
    ],
    camp: [],
  };

  var QUAL_ANGEL_L1 = {
    offline: [
      giftCourse("《聆听发问基础班》", "GDPDID000107", "导师进阶", 9800, 8000),
      giftCourse("《高效表达训练课》", "GDPDID000110", "导师进阶", 16800, 12000),
      giftCourse("《宝山探索进阶班》", "GDPDID000111", "高EQ二阶", 12800, 10000),
      giftCourse(
        "《高EQ系列课程》课程卡-导师权益专享",
        "GDPDID000113",
        "高EQ二阶",
        9400,
        10000,
        "2年",
      ),
    ],
    online: [],
    camp: [],
  };

  function attachGiftDetail(row, qualifications, extra) {
    extra = extra || {};
    row.activityStart = extra.activityStart || "2022-07-01";
    row.activityEnd = extra.activityEnd || "2025-12-31";
    row.activityRange = row.activityStart + " 至 " + row.activityEnd;
    row.levelFullName =
      extra.levelFullName || "2022年《高EQ导师》" + row.levelName;
    row.depositAmount = row.deposit ? extra.depositAmount || 6000 : 0;
    row.qualifications = JSON.parse(JSON.stringify(qualifications));
    row.topPublicWelfare = 0;
    row.otherBenefits = OTHER_BENEFITS.slice();
    return row;
  }

  var giftPackages = [
    attachGiftDetail(
      {
        giftId: "gift-angel-l2-b",
        productType: "gift",
        giftName: "二级传播天使进阶报读「高EQ导师」进阶版B",
        upgradeMethod: "首次升级购买",
        type: "高EQ导师",
        levelName: "进阶版B",
        price: 50000,
        installment: false,
        deposit: true,
        audience: "angel",
        offlineOnly: false,
        description:
          "面向事业说明会登记「天使」意向的学员，对应二级传播天使进阶报读路径。",
      },
      QUAL_MENTOR_B,
    ),
    attachGiftDetail(
      {
        giftId: "gift-angel-l2-a",
        productType: "gift",
        giftName: "二级传播天使进阶报读「高EQ导师」进阶版A",
        upgradeMethod: "首次升级购买",
        type: "高EQ导师",
        levelName: "进阶版A",
        price: 50000,
        installment: false,
        deposit: true,
        audience: "angel",
        offlineOnly: false,
        description:
          "二级传播天使进阶版A，适合已明确传播天使方向、需导师进阶礼包的学员。",
      },
      QUAL_MENTOR_A,
    ),
    attachGiftDetail(
      {
        giftId: "gift-angel-l2-b-offline",
        productType: "gift",
        giftName: "二级传播天使进阶报读「高EQ导师」进阶版B（仅线下课程）",
        upgradeMethod: "首次升级购买",
        type: "高EQ导师",
        levelName: "进阶版B",
        price: 50000,
        installment: false,
        deposit: true,
        audience: "angel",
        offlineOnly: true,
        description: "仅线下课程可用的二级传播天使进阶礼包。",
      },
      QUAL_MENTOR_B,
    ),
    attachGiftDetail(
      {
        giftId: "gift-angel-l1-b",
        productType: "gift",
        giftName: "一级传播天使进阶报读「高EQ导师」进阶版B",
        upgradeMethod: "首次升级购买",
        type: "高EQ导师",
        levelName: "进阶版B",
        price: 40000,
        installment: false,
        deposit: true,
        audience: "angel",
        offlineOnly: false,
        description: "一级传播天使进阶路径，客单价低于二级礼包。",
      },
      QUAL_ANGEL_L1,
      { depositAmount: 5000 },
    ),
    attachGiftDetail(
      {
        giftId: "gift-mentor-l2-a-v2",
        productType: "gift",
        giftName: "二级传播天使进阶报读导师A V2.0",
        upgradeMethod: "首次升级购买",
        type: "高EQ导师",
        levelName: "进阶版A",
        price: 50000,
        installment: false,
        deposit: true,
        audience: "both",
        offlineOnly: false,
        description:
          "导师与传播天使进阶共用的 V2.0 礼包，适合意向了解方向为「导师」或「导师&天使」。",
      },
      QUAL_MENTOR_A,
      {
        activityStart: "2023-01-01",
        levelFullName: "V2.0《高EQ导师》进阶版A",
      },
    ),
    attachGiftDetail(
      {
        giftId: "gift-mentor-l2-a",
        productType: "gift",
        giftName: "高EQ导师进阶版A（首次升级购买）",
        upgradeMethod: "首次升级购买",
        type: "高EQ导师",
        levelName: "进阶版A",
        price: 50000,
        installment: false,
        deposit: true,
        audience: "mentor",
        offlineOnly: false,
        description: "面向事业说明会登记「导师」意向的学员，与课程产品分区推荐。",
      },
      QUAL_MENTOR_A,
    ),
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
    var career = learner.careerPresentation || {};
    var direction = career.intendedDirection || "";
    var giftLine = Core.hasCareerGiftIntent(direction)
      ? " 事业说明会已登记意向了解方向「" +
        direction +
        "」，可约谈讲解时间「" +
        (career.interviewSlot || "未填") +
        "」；讲解前请核对画像，匹配确认后礼包权益与课程产品分区展示。"
      : " 事业说明会未登记导师/天使意向，分析助手不展示礼包权益区域。";
    return {
      title: nextText,
      summary:
        "系统核对了“上课层级”标签和真实报读记录，当前最高有效层级为「" +
        progression.level +
        "」。" +
        giftLine,
      progression: progression,
      records: learner.enrollments,
      follows: learner.follows,
      careerPresentation: career,
    };
  }

  var retrievalSessions = {
    guangzhou: [
      {
        city: "广州市",
        title: "第555期《智慧父母一阶课程》（广州站）",
        teacher: "6Q张三",
        startsAt: "2026-09-05 09:00",
        endsAt: "2026-09-07 18:00",
        status: "报读中",
      },
      {
        city: "广州市",
        title: "第188期《高EQ智慧父母分享会》（广州站）",
        teacher: "总导师",
        startsAt: "2026-08-28 09:00",
        endsAt: "2026-08-28 17:30",
        status: "正在开课中",
      },
      {
        city: "广州市",
        title: "第534期《家庭沟通工作坊》（广州站）",
        teacher: "6Q陈老师",
        startsAt: "2026-09-12 09:00",
        endsAt: "2026-09-14 18:00",
        status: "报读中",
      },
    ],
    nanning: [
      {
        city: "南宁市",
        title: "第531期《高EQ智慧父母一阶》（南宁站）",
        teacher: "6Q张三",
        startsAt: "2026-09-02 09:00",
        endsAt: "2026-09-04 18:00",
        status: "报读中",
      },
      {
        city: "南宁市",
        title: "第532期《智慧父母一阶课程》（南宁站）",
        teacher: "6Q李四",
        startsAt: "2026-09-19 09:00",
        endsAt: "2026-09-21 18:00",
        status: "报读中",
      },
    ],
    mentor: [
      {
        city: "广州市",
        title: "第533期《智慧父母一阶课程》（广州站）",
        teacher: "总导师",
        startsAt: "2026-09-05 09:00",
        endsAt: "2026-09-07 18:00",
        status: "报读中",
      },
      {
        city: "南宁市",
        title: "第530期《智慧父母二阶课程》（南宁站）",
        teacher: "总导师",
        startsAt: "2026-09-26 09:00",
        endsAt: "2026-09-28 18:00",
        status: "报读中",
      },
    ],
  };

  function getRetrievalAnswer(id) {
    if (id === "nanning-more") {
      return {
        title: "南宁站仍有可报读期数",
        summary:
          "按 AI 智搜续聊「南宁站还有吗？」筛选。以下为演示 Mock，生产由课务期数接口按继承课名 + 城市返回。",
        sessions: retrievalSessions.nanning,
      };
    }
    if (id === "mentor-courses") {
      return {
        title: "总导师的课程有哪些？",
        summary:
          "命中导师槽位 instructor_name=总导师。以下为演示 Mock，生产由课程-导师关系 + 期数接口返回。",
        courses: [
          "《智慧父母一阶课程》",
          "《智慧父母二阶课程》",
          "《高EQ恩爱夫妻分享会》",
        ],
        sessions: retrievalSessions.mentor,
      };
    }
    if (id === "mentor-sessions") {
      return {
        title: "总导师最近可报读期数",
        summary:
          "在导师课程基础上按近期开课窗口展开期数。以下为演示 Mock，生产不由模型编造日期。",
        sessions: retrievalSessions.mentor,
      };
    }
    if (id === "level-diff") {
      return {
        title: "一阶和二阶有什么区别？",
        summary:
          "一阶建立情绪识别、沟通回应和冲突修复的基础框架；二阶在已有一阶经验上练习更深的家庭系统和长期习惯。具体课纲以课程知识库为准，本段为演示 Mock。",
        sessions: [],
      };
    }
    return {
      title: "广州最近有哪些课程正在开课？",
      summary:
        "已按城市=广州、时间窗约 30 天筛选正在开课中 / 报读中期数。以下为演示 Mock，生产由课务 HTTP 返回。",
      sessions: retrievalSessions.guangzhou,
    };
  }

  function latestMatchedProduct(session) {
    var versions = (session && session.matchVersions) || [];
    var latest = versions[versions.length - 1];
    return latest && latest.products && latest.products[0]
      ? latest.products[0]
      : null;
  }

  function getProductDetailAnswer(session, id) {
    var product = latestMatchedProduct(session);
    if (!product) {
      return {
        title: "当前还没有智能匹配结果",
        summary:
          "产品介绍、课务和商品要等工作人员确认匹配后才会生成。右侧推荐区保持不变。",
      };
    }
    if (id === "product-sessions") {
      return {
        title: product.productName + " · 近期课务与商品",
        summary:
          "以下摘自当前推荐版本，供左栏参考；右侧列表不自动跳转。",
        sessions: product.sessions || [],
        goods: product.goods || [],
      };
    }
    if (id === "product-goods") {
      return {
        title: product.productName + " · 预算内商品",
        summary: "只列出当前推荐版本中的商品/SKU，超预算项仅供了解。",
        goods: product.goods || [],
      };
    }
    return {
      title: product.productName + " · 课程介绍",
      summary:
        (product.description || "") +
        (id === "topic-diff"
          ? " 与分享会相比，正课更强调连续方法和课务期数，而不是单场体验。"
          : ""),
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

    var career = learner.careerPresentation || {};
    var direction = career.intendedDirection || "";
    var gifts = Core.matchGiftPackages(giftPackages, direction, 3);
    gifts.forEach(function (row, index) {
      row.rank = index + 1;
      row.reasons = [
        "事业说明会意向了解方向「" + direction + "」",
        "礼包权益与课程产品分区，不参与本次课程预算门槛",
        row.deposit ? "支持定金" : "不支持定金",
        row.installment ? "支持分期支付" : "不支持分期支付",
      ];
    });

    return {
      isFallback: !!(options && options.forceFailure),
      label:
        options && options.forceFailure
          ? "兜底参考 · 非智能匹配"
          : "智能匹配",
      conditions: conditions,
      products: result,
      giftPackages: gifts,
      careerIntent: {
        intendedDirection: direction,
        interviewSlot: career.interviewSlot || "",
        assistantName: career.assistantName || "",
        group: career.group || "",
        retrainCount: career.retrainCount,
        qualification: career.qualification || "",
      },
    };
  }

  function getQaMentorReply(presetId) {
    var replies = {
      method: {
        id: "method",
        thinkMs: "2.0",
        title: "当然可以。我是6Q答疑导师。",
        lead: "掌握一套稳定流程，能让对方「看见自己、找到力量」。下面是6Q高效答疑的「五步法」。",
        blocks: [
          {
            type: "h",
            text: "第一步：听 — 先「证」后「感」，全息倾听",
          },
          {
            type: "ul",
            items: [
              "**听事实**：对方具体描述了哪件事？（复述关键词确认听懂了）",
              "**听情绪**：此刻是生气、委屈还是焦虑？",
              "**听需要**：真正渴望的是被看见、被理解，还是要一个方案？",
            ],
          },
          {
            type: "p",
            text: "**6Q心法**：先连接再纠正。用「嗯，我听到了……」去确认，让对方感到被理解。",
          },
          {
            type: "h",
            text: "第二步：问 — 用「启发式问题」代替「给答案」",
          },
          {
            type: "ul",
            items: [
              "避免直接建议「你应该……」，改成引导对方自己想：",
              "「对这个问题，你希望得到什么结果？」",
              "「如果1–10分，你现在在几分？卡在哪里？」",
              "「如果这个问题解决了，你的生活会有什么不同？」",
            ],
          },
          {
            type: "p",
            text: "**6Q作用**：提升责商（为自己的选择负责）和创商（自己找路）。",
          },
          {
            type: "h",
            text: "第三步：分 — 区分「事实」与「故事」",
          },
          {
            type: "ul",
            items: [
              "帮对方分清：哪些是客观事实，哪些是「我觉得」「他总是」的解释。",
              "例：「『孩子总是很懒』是你观察到的事实，还是你的感受？能举一个具体例子吗？」",
            ],
          },
          {
            type: "p",
            text: "**6Q要点**：增强智商（理性认知）和情商（情绪归因）。",
          },
          {
            type: "h",
            text: "第四步：转 — 从「问题」转向「资源」",
          },
          {
            type: "ul",
            items: [
              "引导看见问题背后隐藏的优点或能力。",
              "例：「正因为你为此焦虑，说明你很有责任感。怎么用这份力量去面对？」",
            ],
          },
          {
            type: "p",
            text: "**6Q核心**：激活灵商（找到意义）和财商（创造价值）。",
          },
          {
            type: "h",
            text: "第五步：行 — 制定「最小可执行行动」",
          },
          {
            type: "ul",
            items: [
              "问：「今天之后，你愿意做的一件具体小事是什么？」",
              "行动要具体、可衡量、自愿。例如：「这周每天睡前对孩子说一句肯定的话。」",
            ],
          },
          {
            type: "p",
            text: "**6Q落地**：把意图变成行为，增强体商。",
          },
          {
            type: "h",
            text: "实战小贴士",
          },
          {
            type: "ul",
            items: [
              "别急着给答案：你越「慢」地听，对方进展越「快」。",
              "用比喻代替说教：养孩子像树，不是修剪，是浇水施肥。",
              "相信对方有答案：导师是「镜子」和「拐杖」，不是「专家」。",
            ],
          },
        ],
        next: {
          label: "用叛逆案例练第一步",
          text: "有个家长的孩子非常叛逆，老是不听我的话怎么办，我第一步应该怎么回答",
        },
      },
      step1: {
        id: "step1",
        thinkMs: "4.2",
        note: "注意：以下回答将严格遵循6Q知识库中的核心原则，并结合你之前学习的「五步法」进行示范",
        title: "第一步回答（标准示范）：",
        lead: "**先共情，再归位**——不急着解决问题，而是先连接情绪。",
        blocks: [
          {
            type: "p",
            text: "你可以这样回应这位家长：",
          },
          {
            type: "quote",
            text: "“听到您这么说，我感受到您对孩子现在的情况既着急又无奈，甚至有些委屈，对吗？您希望孩子能听进您的话，是因为您真心为他好，这点我完全理解。作为家长，遇到这样的情况确实很挑战。”",
          },
          {
            type: "aside",
            text: "然后，用提问引导对方从「情绪」进入「思考」，而不是直接给建议",
          },
          {
            type: "quote",
            text: "“为了帮您看得更清晰，我想先问您一个关键问题：您说的『孩子老是不听我的话』，能举一个具体的例子吗？比如最近一次，他做了什么，您是怎么说的，他又是怎么回应的？”",
          },
          {
            type: "h",
            text: "这个第一步背后的6Q知识库原理：",
          },
          {
            type: "ol",
            items: [
              "**先连接，后纠正（手册第3章）：** 先接纳对方的情绪，降低防御，建立信任。家长感到被理解，才会愿意听后续的分析。",
              "**区分事实与故事（手册第5章）：** 「非常叛逆」「老是不听」是家长的主观解读（**故事**），需要引导对方说出具体事件（**事实**），才能找到真正的症结。",
              "**从「控制」转向「影响」（手册第7章）：** 叛逆不是孩子对抗，而是家长沟通方式需要调整的信号。第一步不评判「孩子错了」，而是引导家长反思互动模式。",
            ],
          },
          {
            type: "h",
            text: "为什么这样回答？",
          },
          {
            type: "ul",
            items: [
              "如果直接说「你应该怎么管孩子」，家长会感到被否定，甚至产生对抗。",
              "如果一上来就讲道理（比如「孩子叛逆是正常的」），家长会觉得你站着说话不腰疼。",
              "只有先共情 + 提问，才能让家长自己「看见」问题所在，从而愿意主动改变。",
            ],
          },
          {
            type: "p",
            text: "想继续看看第二步怎么走吗？我可以根据这个家长的回复，演示下一步如何引导他区分「事实与故事」，并找到资源。",
          },
        ],
        next: {
          label: "我连接了，下一步呢？",
          text: "我连接了，下一步呢？",
        },
      },
      step2: {
        id: "step2",
        thinkMs: "3.7",
        note: "注意：以下回答依然严格遵循6Q知识库，进入「五步法」的第二步——**区分事实与故事**",
        title: "第二步回答（标准示范）：",
        lead: "对方感到被理解之后，要用提问把对方从「情绪化的概括」带到「具体事件」，才能找到症结。",
        blocks: [
          {
            type: "quote",
            text: "“太好了，您刚才说『孩子老是顶嘴』，我很想知道具体是哪一件事让您印象深刻？当时您说了什么，他又怎么回应的？比如：『快去写作业』——孩子是怎么说的？是直接说『不』？还是摔门？还是沉默不理？”",
          },
          {
            type: "aside",
            text: "注意：语气要温和，不带评判，纯粹是好奇和了解",
          },
          {
            type: "h",
            text: "这个第二步背后的6Q知识库原理：",
          },
          {
            type: "ol",
            items: [
              "**区分事实 vs 故事（手册第5章）：** 「叛逆」「老是顶嘴」是主观解读（故事）；「摔门」「说了一句不要」才是事实。先把事件说清楚，才能对症。",
              "**从「笼统问题」到「具体案例」（手册第6章）：** 笼统让人焦虑；一个具体场景才藏着真正的需求，也才好分析。",
              "**察觉自己的「假设」（手册第7章）：** 家长可能假设「不听 = 不爱我」。提问能打开新视角，而不是坐实这个假设。",
            ],
          },
          {
            type: "h",
            text: "举例说明（如果家长回答了）：",
          },
          {
            type: "ul",
            items: [
              "家长：「我让他写作业，他说不要，真烦！」",
              "你可以轻轻问感受和需要，这就接到第三步「转向资源」。",
            ],
          },
          {
            type: "p",
            text: "**想继续看第三步（转向资源）吗？** 等你把事实和情绪都厘清后，就可以进入「从问题转向资源」的阶段了。需要我继续演示吗？",
          },
        ],
        next: {
          label: "看第三步（转向资源）",
          text: "想继续看第三步（转向资源）吗？",
        },
      },
      step3: {
        id: "step3",
        thinkMs: 3.2,
        note: "进入「五步法」第三步——**从问题转向资源**。公开演示不含报价与成交话术。",
        title: "第三步回答（标准示范）",
        lead: "事实和情绪都清了之后，把「叛逆」从缺陷改写成力量的误用。",
        blocks: [
          {
            type: "quote",
            text: "孩子能顶嘴，说明他有边界、有自己的想法。这份力量如果被看见，往往比被纠正更愿意合作。您希望他用什么方式表达「不同意」，您也比较容易听进去？",
          },
          {
            type: "h",
            text: "这个第三步背后的6Q知识库原理：",
          },
          {
            type: "ol",
            items: [
              "**问题里藏着资源**：对抗常常是自我意识醒来的信号。",
              "**从控制转向影响**：问他愿意怎么表达，而不是要求立刻听话。",
              "**下一步才是最小行动**：例如今晚只做一件事——复述他的一句感受，不讲道理。",
            ],
          },
        ],
        next: {
          label: "再看一遍五步法",
          text: "你能教我一下如何有方法的答疑吗",
        },
      },
    };
    return replies[presetId] || replies.method;
  }

  function searchLearners(query) {
    return Core.searchLearnerIndex(Core.learnerIndex(learners), query);
  }

  function getQaScript(sceneId, extras) {
    extras = extras || {};
    var scene =
      Core.findQaScene(sceneId) ||
      Core.QA_SCENES[0];
    var scripts = {
      teen: [
        {
          name: "接情绪",
          line: "能感受到您这段时间真的很不容易。面对孩子的对抗，心里一定又焦虑又无奈。很多家长到了这个阶段都会有类似的困扰，这不是您一个人的问题。",
        },
        {
          name: "正常化",
          line: "青春期对抗其实是成长中的正常现象。这个阶段自我意识开始觉醒，孩子既渴望独立又害怕孤独，会用对抗来试探边界。",
        },
        {
          name: "提问",
          line: "您觉得跟孩子沟通时，哪种方式最容易引发冲突？是指责的语气，还是反复催促？",
        },
        {
          name: "给方向",
          line: "建议每天找一个孩子比较放松的时刻，只问一句：今天有什么想跟我聊聊的吗？不回应也不追问。课程路径交给会务/面谈官按课阶核对。",
        },
      ],
      phone: [
        {
          name: "接情绪",
          line: "先别急着给方案。请您描述一下：孩子大概从什么时候开始沉迷电子产品？你们平时是怎么约定使用时间的？",
        },
        {
          name: "正常化",
          line: "沉迷往往和学习成就感不足连在一起。当孩子在现实里很难获得满足，就会到手机里找情绪价值和成就感。",
        },
        {
          name: "提问",
          line: "孩子在学习或同伴关系里，最近有没有特别受挫的事？您试过哪些约定，又是怎么执行的？",
        },
        {
          name: "给方向",
          line: "可先和孩子一起商量每天多久比较合理；超时了平静说「时间到了」。每天留一刻高质量陪伴，关系稳住后再谈规则。",
        },
      ],
      study: [
        {
          name: "接情绪",
          line: "科目变多、难度加大时出现成绩波动很常见，您不用把责任都扛在自己身上。",
        },
        {
          name: "正常化",
          line: "如果日常几乎只问作业和分数，孩子感受到的往往不是关心，而是压力。",
        },
        {
          name: "提问",
          line: "除了学习，最近有没有哪一次是孩子愿意主动跟您聊别的事？当时您是怎么接的？",
        },
        {
          name: "给方向",
          line: "亲子关系是引导学习的前提。先练习聆听和发问，再谈方法。具体课阶由会务按画像核对。",
        },
      ],
      couple: [
        {
          name: "接情绪",
          line: "严格管教和宽松发展都是爱孩子，只是表达方式不同。先把双方从对错里松开。",
        },
        {
          name: "正常化",
          line: "很多家庭都是一个严一个松。问题常常不是不爱，而是没有私下统一口径。",
        },
        {
          name: "提问",
          line: "孩子在场时，最近一次争执是谁先开口、因为什么事？私下有没有约定过怎么补？",
        },
        {
          name: "给方向",
          line: "建议当面保持统一，分歧私下说。需要工具时，可转向亲密关系方向的课程咨询，由面谈官匹配。",
        },
      ],
      emotion: [
        {
          name: "接情绪",
          line: "孩子的情绪波动像身体发烧，是信号不是「坏孩子」。先稳住大人自己的节奏。",
        },
        {
          name: "正常化",
          line: "愤怒后面可能是委屈，暴躁后面可能是无助。先看见信号，再谈行为。",
        },
        {
          name: "提问",
          line: "最近一次爆发前，家里有没有变化、冲突或他觉得丢脸的事？",
        },
        {
          name: "给方向",
          line: "爆发时先停下手头的事，蹲下来平视，平静说「我在，我陪着你」。持续再交棒给会务核对课阶。",
        },
      ],
    };
    var steps = scripts[scene.id] || scripts.teen;
    return {
      title: "本轮答疑纪要",
      scene: scene.label,
      family: scene.family,
      pain: extras.pain || "",
      tried: extras.tried || "",
      steps: steps,
      note: "话术来自现场手册四步框架，供答疑导师参考；不在此报价或促成下单。",
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
    giftPackages: giftPackages,
    getLearner: getLearner,
    getProgression: getProgression,
    getInterestAnalysis: getInterestAnalysis,
    getFollowupAnalysis: getFollowupAnalysis,
    getRetrievalAnswer: getRetrievalAnswer,
    getProductDetailAnswer: getProductDetailAnswer,
    buildConditions: buildConditions,
    match: match,
    seedSessions: seedSessions,
    searchLearners: searchLearners,
    getQaScript: getQaScript,
    getQaMentorReply: getQaMentorReply,
  };
});
