import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const intentJs = new URL("../js/conference-intent.js", import.meta.url);
const intentCss = new URL("../css/6q-intent-premium.css", import.meta.url);
const appCore = new URL(
  "../../6q-conference-app-prototype/js/app-intent-core.js",
  import.meta.url,
);

test("会务列表演示 3 有礼包方向 / 3 无方向", () => {
  const src = readFileSync(intentJs, "utf8");
  assert.match(src, /id:\s*"m10001"[\s\S]*?name:\s*"陈晓明"[\s\S]*?intendedDirection:\s*"天使"/);
  assert.match(src, /id:\s*"m10004"[\s\S]*?name:\s*"赵雅琴"[\s\S]*?intendedDirection:\s*"导师"/);
  assert.match(
    src,
    /id:\s*"m10005"[\s\S]*?name:\s*"张志远"[\s\S]*?intendedDirection:\s*"导师&天使"/,
  );
  assert.match(src, /id:\s*"m10002"[\s\S]*?name:\s*"李美琳"[\s\S]*?intendedDirection:\s*""/);
  assert.match(src, /id:\s*"m10003"[\s\S]*?name:\s*"王建国"[\s\S]*?intendedDirection:\s*""/);
  assert.match(src, /id:\s*"m10006"[\s\S]*?name:\s*"刘慧敏"[\s\S]*?intendedDirection:\s*""/);
  assert.match(src, /interviewSlot:\s*"课程结束后"/);
});

test("抽屉 AI 快照为结论 / 依据 / 下一步，保留重新分析", () => {
  const src = readFileSync(intentJs, "utf8");
  assert.match(src, /intent-ai-card__conclusion/);
  assert.match(src, /intent-ai-card__evidence/);
  assert.match(src, /intent-ai-card__next/);
  assert.match(src, /id="btn-reanalyze"/);
  assert.doesNotMatch(src, /成交话术/);
});

test("列表标签折叠为两枚加剩余数，避免撑高行", () => {
  const src = readFileSync(intentJs, "utf8");
  assert.match(src, /TAG_CHIP_MAX = 2/);
  assert.match(src, /intent-chip--more/);
  const css = readFileSync(intentCss, "utf8");
  assert.match(css, /intent-score\.intent-tip/);
  assert.match(css, /flex-wrap:\s*nowrap/);
});

test("意向分析样式：AI 层级 + 列表礼包行 + 礼包分区", () => {
  const css = readFileSync(intentCss, "utf8");
  assert.match(css, /intent-ai-card__conclusion/);
  assert.match(css, /intent-ai-card__badge/);
  assert.match(css, /intent-course-cell__gift/);
  assert.match(css, /course-gift-block/);
});

test("APP 按姓名 3 有 / 其余方向空，闸门不读 roleTag", () => {
  const src = readFileSync(appCore, "utf8");
  assert.match(src, /name:\s*"陈晓明"[\s\S]*?intendedDirection:\s*"天使"/);
  assert.match(src, /name:\s*"赵雅琴"[\s\S]*?intendedDirection:\s*"导师"/);
  assert.match(src, /name:\s*"张志远"[\s\S]*?intendedDirection:\s*"导师&天使"/);
  assert.match(src, /name:\s*"夏兰"[\s\S]*?intendedDirection:\s*""/);
  assert.match(src, /name:\s*"李美琳"[\s\S]*?intendedDirection:\s*""/);
  assert.match(src, /name:\s*"吴均宜"[\s\S]*?intendedDirection:\s*""/);
});
