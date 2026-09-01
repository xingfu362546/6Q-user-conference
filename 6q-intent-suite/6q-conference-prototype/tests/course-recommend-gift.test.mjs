import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

function loadCourseRecommend() {
  const file = fileURLToPath(
    new URL("../../6q-conference-app-prototype/js/course-recommend.js", import.meta.url),
  );
  const code = readFileSync(file, "utf8");
  const sandbox = { console };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.runInNewContext(code, sandbox, { filename: "course-recommend.js" });
  return sandbox.CourseRecommend;
}

function student(overrides) {
  return Object.assign(
    {
      id: "m-test",
      name: "测试学员",
      hits: ["tag_1233"],
      intentLevel: "high",
      follow: { content: "了解进阶班", tag: "有意向用户", time: "2025-04-02" },
      ai: { score: 20, summary: "意向明确" },
      intendedDirection: "",
      interviewSlot: "",
    },
    overrides,
  );
}

test("course-recommend 不依赖画像分析助手", () => {
  const src = readFileSync(
    new URL("../../6q-conference-app-prototype/js/course-recommend.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(src, /conference-profile-assistant/);
  assert.doesNotMatch(src, /ProfileAssistant/);
});

test("无礼包闸门：方向空 / 无 / 破折号 / 仅可约谈时间 → getGiftRecommendation 为 null", () => {
  const CR = loadCourseRecommend();
  assert.equal(CR.getGiftRecommendation(student({ intendedDirection: "" })), null);
  assert.equal(CR.getGiftRecommendation(student({ intendedDirection: "无" })), null);
  assert.equal(CR.getGiftRecommendation(student({ intendedDirection: "—" })), null);
  assert.equal(
    CR.getGiftRecommendation(
      student({ intendedDirection: "", interviewSlot: "课程结束后" }),
    ),
    null,
  );
  assert.equal(CR.hasCareerGiftIntent(""), false);
  assert.equal(CR.hasCareerGiftIntent("待观察"), false);
});

test("有礼包闸门：天使 / 导师 / 导师&天使 各出对应礼包名", () => {
  const CR = loadCourseRecommend();
  const angel = CR.getGiftRecommendation(student({ intendedDirection: "天使" }));
  const mentor = CR.getGiftRecommendation(student({ intendedDirection: "导师" }));
  const both = CR.getGiftRecommendation(student({ intendedDirection: "导师&天使" }));
  assert.ok(angel && /天使/.test(angel.giftName));
  assert.equal(angel.directionLabel, "传播天使");
  assert.ok(mentor && /导师/.test(mentor.giftName));
  assert.equal(mentor.directionLabel, "导师");
  assert.ok(both && both.giftName);
  assert.equal(both.directionLabel, "导师与传播天使");
  assert.equal(CR.hasCareerGiftIntent("天使"), true);
});

test("列表单元格：有方向两行，无方向不存在礼包行", () => {
  const CR = loadCourseRecommend();
  const withGift = CR.renderTableCell(student({ intendedDirection: "天使" }));
  const without = CR.renderTableCell(
    student({ intendedDirection: "", interviewSlot: "课程结束后" }),
  );
  assert.match(withGift, /intent-course-cell__course/);
  assert.match(withGift, /intent-course-cell__gift/);
  assert.match(withGift, /礼包/);
  assert.match(without, /intent-course-cell__course/);
  assert.doesNotMatch(without, /intent-course-cell__gift/);
  assert.doesNotMatch(without, /礼包/);
  assert.doesNotMatch(without, />无</);
});

test("抽屉/详情：有方向出礼包区，无方向整块不渲染", () => {
  const CR = loadCourseRecommend();
  const withGift = CR.renderDetailBlock(student({ intendedDirection: "导师" }));
  const without = CR.renderDetailBlock(student({ intendedDirection: "" }));
  assert.match(withGift, /course-gift-block/);
  assert.match(withGift, /礼包权益/);
  assert.match(withGift, /导师/);
  assert.doesNotMatch(without, /course-gift-block/);
  assert.doesNotMatch(without, /礼包权益/);
});

test("APP 卡片：有方向才追加礼包行", () => {
  const CR = loadCourseRecommend();
  const withGift = CR.renderListHint(student({ intendedDirection: "导师&天使" }));
  const without = CR.renderListHint(student({ intendedDirection: "" }));
  assert.match(withGift, /intent-card__course/);
  assert.match(withGift, /intent-card__gift/);
  assert.match(without, /intent-card__course/);
  assert.doesNotMatch(without, /intent-card__gift/);
  assert.doesNotMatch(without, /礼包/);
});

test("中控高频榜只计课程产品，礼包不进榜", () => {
  const CR = loadCourseRecommend();
  const rows = [
    student({ id: "a", intendedDirection: "天使" }),
    student({ id: "b", intendedDirection: "导师" }),
    student({ id: "c", intendedDirection: "" }),
  ];
  const tops = CR.getConferenceTopProducts(rows, 3);
  assert.ok(tops.length >= 1);
  tops.forEach((row) => {
    assert.ok(row.product && row.product.product_id);
    assert.ok(!row.giftId);
    assert.doesNotMatch(row.product.product_id, /^gift/);
  });
});
