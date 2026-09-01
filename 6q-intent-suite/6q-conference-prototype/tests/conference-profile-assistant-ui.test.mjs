import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pcProfileHtml = new URL("../conference-student-profile.html", import.meta.url);
const portalProfileHtml = new URL(
  "../../6q-interviewer-portal/student-profile.html",
  import.meta.url,
);
const aiChatJs = new URL("../js/conference-profile-ai-chat.js", import.meta.url);
const assistantMockJs = new URL(
  "../js/conference-profile-assistant-mock.js",
  import.meta.url,
);
const profileCss = new URL("../css/6q-profile.css", import.meta.url);

test("两个画像页按 core → mock → UI 顺序加载助手", () => {
  for (const file of [pcProfileHtml, portalProfileHtml]) {
    const html = readFileSync(file, "utf8");
    const coreAt = html.indexOf("conference-profile-assistant-core.js");
    const mockAt = html.indexOf("conference-profile-assistant-mock.js");
    const uiAt = html.indexOf("conference-profile-ai-chat.js");
    assert.ok(coreAt > -1 && coreAt < mockAt && mockAt < uiAt);
  }
});

test("会务后台与面谈官画像均标注 v1.0.4", () => {
  for (const file of [pcProfileHtml, portalProfileHtml]) {
    assert.match(readFileSync(file, "utf8"), /pf-ver">v1\.0\.4</);
  }
});

test("助手源码包含三个批准的模拟开场按钮", () => {
  const source = readFileSync(assistantMockJs, "utf8");
  assert.match(source, /学员在系统中对什么类型的课程感兴趣？/);
  assert.match(source, /学员下一步应该如何跟进？/);
  assert.match(source, /应该推荐什么课程产品比较适合该学员？/);
});

test("大型助手保留既有打开ID并暴露工作台稳定ID", () => {
  const source = readFileSync(aiChatJs, "utf8");
  for (const id of [
    "pfAiFab",
    "pfAiPanel",
    "pfAiHistory",
    "pfAiMessages",
    "pfAiResult",
    "pfAiComposer",
  ]) {
    assert.match(source, new RegExp(id));
  }
});

test("助手样式使用大型双栏工作台并支持降低动态效果", () => {
  const css = readFileSync(profileCss, "utf8");
  assert.match(css, /width:\s*min\(90vw,\s*1480px\)/);
  assert.match(css, /height:\s*88vh/);
  assert.match(css, /\.pf-ai__workspace/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /course-cover-parenting\.png/);
});

test("助手包含融合动效、推荐版本、详情和失败兜底", () => {
  const source = readFileSync(aiChatJs, "utf8");
  for (const label of [
    "用户标签",
    "过往跟进",
    "行为埋点",
    "报读购买",
    "理解当前需求",
    "归纳学员画像",
    "检索产品与课务",
    "预算与SKU硬校验",
    "综合排序生成依据",
    "兜底参考 · 非智能匹配",
    "matchVersions",
    "查看完整资料",
    "超出本次预算，仅供了解",
  ]) {
    assert.match(source, new RegExp(label));
  }
  assert.doesNotMatch(source, /加入购物车|复制沟通话术/);
});

test("工作台暴露演示栏、追问条和意图流注释稳定ID", () => {
  const source = readFileSync(aiChatJs, "utf8");
  for (const id of ["pfAiDemoRail", "pfAiFollowups", "pfAiFlowNote"]) {
    assert.match(source, new RegExp(id));
  }
  assert.match(source, /演示发言/);
  assert.match(source, /意图流注释/);
  assert.match(source, /生产环境以 Dify/);
});

test("助手样式为外侧演示栏和输入框上方追问留位", () => {
  const css = readFileSync(profileCss, "utf8");
  assert.match(css, /\.pf-ai__demo-rail/);
  assert.match(css, /\.pf-ai__followups/);
  assert.match(css, /\.pf-ai__flow-note/);
});

test("Mock 含 AI 智搜检索答案且不提供报读按钮", () => {
  const source = readFileSync(assistantMockJs, "utf8");
  assert.match(source, /广州最近有哪些课程正在开课？/);
  assert.match(source, /总导师的课程有哪些？/);
  assert.match(source, /一阶和二阶有什么区别？/);
  assert.match(source, /getRetrievalAnswer/);
  assert.doesNotMatch(source, />报读</);
});

test("Mock 按事业说明会意向了解方向区分礼包与课程产品", () => {
  const source = readFileSync(assistantMockJs, "utf8");
  assert.match(source, /intendedDirection/);
  assert.match(source, /礼包权益/);
  assert.match(source, /二级传播天使/);
  assert.match(source, /productType:\s*"gift"/);
  assert.match(source, /聆听发问进阶班/);
  assert.match(source, /depositAmount/);
});

test("右栏礼包区与课程推荐分区，无意向时不渲染礼包区块", () => {
  const source = readFileSync(aiChatJs, "utf8");
  const css = readFileSync(profileCss, "utf8");
  assert.match(source, /礼包权益推荐/);
  assert.match(source, /giftPackages/);
  assert.match(source, /renderGiftSection/);
  assert.match(source, /意向了解方向/);
  assert.match(source, /pf-ai__product-cover--gift/);
  assert.match(source, /资格权益/);
  assert.match(source, /核算价格/);
  assert.match(source, /定金金额/);
  assert.match(source, /data-gift-tab/);
  assert.match(source, /其他权益/);
  assert.match(css, /\.pf-ai__gift/);
  assert.match(css, /minmax\(0,\s*1fr\)/);
  assert.match(css, /\.pf-ai__gift-table/);
  assert.match(css, /\.pf-ai__gift-tabs/);
  assert.doesNotMatch(source, /加入购物车/);
});
