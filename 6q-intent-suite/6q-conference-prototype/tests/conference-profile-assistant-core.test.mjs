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
