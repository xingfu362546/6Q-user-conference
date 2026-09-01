import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const Core = require("../js/conference-profile-assistant-core.js");
const Mock = require("../js/conference-profile-assistant-mock.js");

test("空白会话不保存，首次消息后生成个人历史", () => {
  const session = Core.createDraftSession(
    {
      userId: "staff-01",
      memberId: "m10009",
      memberName: "项琳琳",
      conferenceId: "conf-12551",
      conferenceName: "第12551期广州会务",
    },
    "2026-08-27T01:00:00Z",
  );

  assert.equal(session.persisted, false);
  Core.addMessage(
    session,
    "user",
    "学员对什么课程感兴趣？",
    "2026-08-27T01:01:00Z",
  );
  assert.equal(session.persisted, true);
  assert.equal(session.title, "学员对什么课程感兴趣？");
});

test("历史搜索覆盖学员、会务、标题和日期", () => {
  const rows = [
    {
      memberName: "项琳琳",
      conferenceName: "广州会务",
      title: "亲子课程",
      updatedAt: "2026-08-27",
    },
    {
      memberName: "夏兰",
      conferenceName: "佛山会务",
      title: "复训建议",
      updatedAt: "2026-08-20",
    },
  ];

  assert.equal(Core.searchSessions(rows, "广州").length, 1);
  assert.equal(Core.searchSessions(rows, "复训").length, 1);
  assert.equal(Core.searchSessions(rows, "2026-08-27").length, 1);
});

test("层级冲突时取真实记录验证的最高层级", () => {
  assert.deepEqual(Core.resolveCourseLevel("沙龙", ["分享会"]), {
    level: "分享会",
    nextLevel: "一阶",
    conflict: true,
  });
});

test("终阶不会虚构更高层级", () => {
  assert.deepEqual(Core.resolveCourseLevel("三阶", ["二阶"]), {
    level: "三阶",
    nextLevel: null,
    conflict: true,
  });
});

test("资格未核销与已报读使用不同建议", () => {
  assert.equal(
    Core.relationAdvice("qualified"),
    "提醒使用已有资格完成报读",
  );
  assert.equal(Core.relationAdvice("enrolled"), "建议选择未来期数复训");
});

test("预算是产品入选硬门槛，但详情保留超预算商品", () => {
  const product = {
    productId: "parent-1",
    goods: [
      { skuId: "g1", price: 2980 },
      { skuId: "g2", price: 8800 },
    ],
  };

  assert.equal(Core.isProductWithinBudget(product, 5000), true);
  assert.deepEqual(
    Core.sortGoods(product.goods, 5000).map((row) => row.budgetStatus),
    ["fit", "over"],
  );
  assert.equal(Core.isProductWithinBudget(product, 500), false);
});

test("课务仅取当前未来有效状态，同城和时间优先，最多3个", () => {
  const rows = [
    {
      id: "1",
      city: "广州市",
      status: "报读中",
      startsAt: "2026-09-10",
    },
    {
      id: "2",
      city: "广州市",
      status: "正在开课中",
      startsAt: "2026-08-26",
    },
    {
      id: "3",
      city: "佛山市",
      status: "报读中",
      startsAt: "2026-09-01",
    },
    {
      id: "4",
      city: "广州市",
      status: "已结束",
      startsAt: "2026-08-01",
    },
    {
      id: "5",
      city: "深圳市",
      status: "报读中",
      startsAt: "2026-09-05",
    },
  ];

  assert.deepEqual(
    Core.selectCourseSessions(
      rows,
      "广州市",
      "2026-08-27",
      3,
    ).map((row) => row.id),
    ["2", "1", "3"],
  );
});

test("条件摘要区分明确、推断和缺失条件", () => {
  assert.deepEqual(
    Core.buildConditions({
      explicit: [{ key: "budget", label: "预算", value: "5000元内" }],
      inferred: [{ key: "topic", label: "方向", value: "亲子关系" }],
      missing: [{ key: "city", label: "城市", value: "未明确" }],
      confidence: 78,
      dataAsOf: "2026-08-27 01:00",
    }),
    {
      explicit: [{ key: "budget", label: "预算", value: "5000元内" }],
      inferred: [{ key: "topic", label: "方向", value: "亲子关系" }],
      missing: [{ key: "city", label: "城市", value: "未明确" }],
      confidence: 78,
      dataAsOf: "2026-08-27 01:00",
    },
  );
});

test("匹配版本追加保存，不覆盖旧版本", () => {
  const session = Core.createDraftSession(
    {
      userId: "staff-01",
      memberId: "m10009",
      memberName: "项琳琳",
      conferenceId: "conf-12551",
      conferenceName: "第12551期广州会务",
    },
    "2026-08-27T01:00:00Z",
  );
  const conditions = Core.buildConditions({
    explicit: [{ key: "budget", value: 5000 }],
    inferred: [],
    missing: [],
    confidence: 90,
    dataAsOf: "2026-08-27 01:00",
  });

  Core.createMatchVersion(
    session,
    conditions,
    [{ productId: "p1" }],
    "2026-08-27T01:02:00Z",
    "success",
  );
  Core.createMatchVersion(
    session,
    conditions,
    [{ productId: "p2" }],
    "2026-08-27T01:04:00Z",
    "success",
  );

  assert.equal(session.matchVersions.length, 2);
  assert.equal(session.matchVersions[0].products[0].productId, "p1");
  assert.equal(session.matchVersions[1].products[0].productId, "p2");
});

test("Mock 提供三个批准的开场意图", () => {
  assert.deepEqual(
    Mock.intents.map((row) => row.label),
    [
      "学员在系统中对什么类型的课程感兴趣？",
      "学员下一步应该如何跟进？",
      "应该推荐什么课程产品比较适合该学员？",
    ],
  );
});

test("匹配使用预算、亲子方向和资格状态生成TOP3", () => {
  const result = Mock.match("m10009", {
    budget: 5000,
    topic: "亲子关系",
    city: "广州市",
    now: "2026-08-27",
  });

  assert.equal(result.isFallback, false);
  assert.equal(result.products.length, 3);
  assert.ok(
    result.products.every((row) =>
      row.goods.some(
        (good) => good.numericPrice <= 5000 && good.budgetStatus === "fit",
      ),
    ),
  );
  assert.ok(result.products.every((row) => row.sessions.length === 3));
});

test("课程层级依据标签和报读记录取最高值", () => {
  assert.deepEqual(Mock.getProgression("m10009"), {
    level: "分享会",
    nextLevel: "一阶",
    conflict: true,
  });
});

test("强制失败返回明确标记且预算过滤的兜底产品", () => {
  const result = Mock.match(
    "m10009",
    {
      budget: 5000,
      topic: "亲子关系",
      city: "广州市",
      now: "2026-08-27",
    },
    { forceFailure: true },
  );

  assert.equal(result.isFallback, true);
  assert.equal(result.label, "兜底参考 · 非智能匹配");
  assert.ok(result.products.length > 0);
  assert.ok(
    result.products.every((row) =>
      row.goods.some((good) => good.numericPrice <= 5000),
    ),
  );
});

test("演示入口含三大分析意图和三条 AI 智搜原句", () => {
  const labels = Core.DEMO_GROUPS.flatMap((group) =>
    group.items.map((item) => item.label),
  );
  assert.deepEqual(labels, [
    "学员在系统中对什么类型的课程感兴趣？",
    "学员下一步应该如何跟进？",
    "应该推荐什么课程产品比较适合该学员？",
    "广州最近有哪些课程正在开课？",
    "总导师的课程有哪些？",
    "一阶和二阶有什么区别？",
  ]);
});

test("空白会话不生成追问，匹配进行中也不生成", () => {
  const session = Core.createDraftSession({ memberId: "m10009" }, "2026-08-27");
  assert.equal(Core.resolveAssistantStage(session), "empty");
  assert.deepEqual(Core.buildFollowUpChips(session), []);
  assert.deepEqual(Core.buildFollowUpChips(session, { matching: true }), []);
});

test("分析回答后追问为跟进/匹配两条底盘加一条贴上一句", () => {
  const session = Core.createDraftSession({ memberId: "m10009" }, "2026-08-27");
  Core.addMessage(session, "user", "亲子方向", "2026-08-27T01:00:00Z", {
    intent: "free",
  });
  Core.addMessage(session, "ai", "已记录", "2026-08-27T01:00:01Z");
  const chips = Core.buildFollowUpChips(session);
  assert.equal(chips.length, 3);
  assert.equal(chips[0].text, "学员下一步应该如何跟进？");
  assert.equal(chips[1].text, "应该推荐什么课程产品比较适合该学员？");
  assert.match(chips[2].text, /亲子/);
});

test("检索回答后追问为两条智搜续聊加一条转向匹配或贴上一句", () => {
  const session = Core.createDraftSession({ memberId: "m10009" }, "2026-08-27");
  Core.addMessage(
    session,
    "user",
    "广州最近有哪些课程正在开课？",
    "2026-08-27T01:00:00Z",
    { intent: "city-sessions" },
  );
  Core.addMessage(session, "ai", "已筛选广州期数", "2026-08-27T01:00:01Z");
  const chips = Core.buildFollowUpChips(session);
  assert.equal(chips.length, 3);
  assert.equal(chips[0].text, "南宁站还有吗？");
  assert.equal(chips[1].text, "总导师最近有哪些期数可以报读？");
  assert.match(chips[2].text, /广州|匹配/);
});

test("已有推荐后追问改为产品细节套，补新信息仍不改成重新匹配", () => {
  const session = Core.createDraftSession({ memberId: "m10009" }, "2026-08-27");
  Core.addMessage(session, "user", "亲子方向", "2026-08-27T01:00:00Z");
  Core.createMatchVersion(
    session,
    { explicit: [], inferred: [], missing: [], confidence: 80 },
    [],
    "2026-08-27T01:02:00Z",
    "success",
  );
  const chips = Core.buildFollowUpChips(session);
  assert.equal(chips[0].text, "主推课程的介绍是什么？");
  assert.equal(chips[1].text, "最近一期课务和商品有哪些？");
  assert.match(chips[2].text, /亲子/);
  assert.ok(chips.every((chip) => !/重新匹配/.test(chip.text)));
});

test("发言路由把演示原句和追问映射到意图或检索，不误伤自由补充", () => {
  assert.deepEqual(Core.routeUtterance("总导师的课程有哪些？"), {
    type: "retrieval",
    id: "mentor-courses",
  });
  assert.deepEqual(Core.routeUtterance("学员下一步应该如何跟进？"), {
    type: "intent",
    id: "followup",
  });
  assert.deepEqual(Core.routeUtterance("主推课程的介绍是什么？"), {
    type: "product-detail",
    id: "product-intro",
  });
  assert.equal(Core.routeUtterance("预算大概 5000").type, "free");
});

test("空白时演示栏默认展开，发出第一句后默认收起，可被手动展开", () => {
  assert.equal(Core.isDemoRailExpanded(false, null), true);
  assert.equal(Core.isDemoRailExpanded(true, null), false);
  assert.equal(Core.isDemoRailExpanded(true, true), true);
});

const GIFT_FIXTURES = [
  {
    giftId: "gift-angel-l2-b",
    giftName: "二级传播天使进阶报读「高EQ导师」进阶版B",
    audience: "angel",
    price: 50000,
  },
  {
    giftId: "gift-mentor-l2-a",
    giftName: "高EQ导师进阶版A（首次升级购买）",
    audience: "mentor",
    price: 50000,
  },
  {
    giftId: "gift-both-v2",
    giftName: "二级传播天使进阶报读导师A V2.0",
    audience: "both",
    price: 50000,
  },
];

test("事业说明会意向了解方向含导师或天使才构成礼包推荐资格", () => {
  assert.equal(Core.hasCareerGiftIntent(""), false);
  assert.equal(Core.hasCareerGiftIntent(null), false);
  assert.equal(Core.hasCareerGiftIntent("无"), false);
  assert.equal(Core.hasCareerGiftIntent("—"), false);
  assert.equal(Core.hasCareerGiftIntent("导师"), true);
  assert.equal(Core.hasCareerGiftIntent("天使"), true);
  assert.equal(Core.hasCareerGiftIntent("导师&天使"), true);
});

test("无礼包意向时礼包匹配结果为空，不混入课程产品", () => {
  assert.deepEqual(Core.matchGiftPackages(GIFT_FIXTURES, "", 3), []);
  assert.deepEqual(Core.matchGiftPackages(GIFT_FIXTURES, "无", 3), []);
  const angelRows = Core.matchGiftPackages(GIFT_FIXTURES, "天使", 3);
  assert.ok(angelRows.every((row) => row.audience !== "mentor"));
  assert.ok(angelRows.some((row) => row.giftId === "gift-angel-l2-b"));
});

test("匹配版本可单独挂礼包权益，与课程产品分区存储", () => {
  const session = Core.createDraftSession({ memberId: "m10009" }, "2026-08-27");
  const version = Core.createMatchVersion(
    session,
    { explicit: [], inferred: [], missing: [], confidence: 80 },
    [{ productId: "course-1" }],
    "2026-08-27T01:02:00Z",
    "success",
    {
      giftPackages: [{ giftId: "gift-angel-l2-b" }],
      careerIntent: { intendedDirection: "天使" },
    },
  );
  assert.equal(version.products[0].productId, "course-1");
  assert.equal(version.giftPackages[0].giftId, "gift-angel-l2-b");
  assert.equal(version.careerIntent.intendedDirection, "天使");
});

test("项琳琳有天使意向时匹配出礼包，夏兰无意向时礼包为空且课程仍在", () => {
  const xiang = Mock.match("m10009", {
    budget: 5000,
    topic: "亲子关系",
    city: "广州市",
    now: "2026-08-27",
  });
  const xia = Mock.match("m10001", {
    budget: 8000,
    topic: "亲子沟通",
    city: "广州市",
    now: "2026-08-27",
  });
  const zhang = Mock.match("m10003", {
    budget: 10000,
    topic: "家庭成长",
    city: "佛山市",
    now: "2026-08-27",
    allowRetrain: true,
  });

  assert.ok(xiang.giftPackages.length >= 1);
  assert.ok(
    xiang.giftPackages.every((row) => row.productType === "gift"),
  );
  assert.equal(xiang.careerIntent.intendedDirection, "天使");
  assert.ok(xiang.products.length >= 1);
  assert.ok(xiang.products.every((row) => row.productType !== "gift"));

  assert.deepEqual(xia.giftPackages, []);
  assert.equal(xia.careerIntent.intendedDirection, "");
  assert.ok(xia.products.length >= 1);

  assert.ok(zhang.giftPackages.length >= 1);
  assert.match(zhang.careerIntent.intendedDirection, /导师/);
});

test("进阶版B礼包带资格权益明细：6门线下课、市场价与核算价、定金6000", () => {
  const result = Mock.match("m10009", {
    budget: 5000,
    topic: "亲子关系",
    city: "广州市",
    now: "2026-08-27",
  });
  const gift = result.giftPackages.find((row) => /进阶版B/.test(row.levelName));
  assert.ok(gift);
  assert.equal(gift.depositAmount, 6000);
  assert.equal(gift.qualifications.offline.length, 6);
  const market = gift.qualifications.offline.reduce(
    (sum, row) => sum + row.marketPrice,
    0,
  );
  const settlement = gift.qualifications.offline.reduce(
    (sum, row) => sum + row.settlementPrice,
    0,
  );
  assert.equal(market, 78400);
  assert.equal(settlement, 50000);
  assert.ok(
    gift.qualifications.offline.some((row) =>
      /聆听发问进阶班/.test(row.name),
    ),
  );
  assert.ok(gift.otherBenefits.some((row) => row.name === "课程权益"));
  assert.equal(gift.topPublicWelfare, 0);
});

