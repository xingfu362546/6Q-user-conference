# Student Analysis Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the profile’s small AI chat popup with a large, two-column, fully interactive analysis workbench that demonstrates three complete intents, personal conversation history, explainable A+B product matching, product detail, match versioning, and fallback behavior.

**Architecture:** Keep all new behavior inside assistant-specific modules. Put deterministic business logic and persistence rules in a pure UMD core that Node can test, keep all prototype fixtures in a separate mock module, and let the existing `conference-profile-ai-chat.js` orchestrate DOM/state only. Both profile pages load the same assistant scripts and CSS.

**Tech Stack:** Plain HTML/CSS/JavaScript, browser `localStorage`, Node.js built-in `node:test`, no new dependencies.

## Global Constraints

- Only modify the analysis assistant, its CSS section, its new modules/tests, and the two profile pages’ assistant script references.
- Do not modify profile cards, intent list, strategy templates, navigation, APP files, or production APIs.
- Workbench size: approximately `90vw × 88vh`; retain the existing FAB and toolbar open button.
- Assistant is available in conference PC and authorized interviewer portal; sessions are private by `user_id`.
- Prototype matching animation lasts 8–9 seconds; production behavior is documented only and not implemented.
- Budget is a hard ceiling for recommended products.
- Purchased means qualified; enrolled means qualification redeemed.
- All user-facing data is fixed mock data; no network calls.
- Support `prefers-reduced-motion`.

---

## File Map

### Create

- `6q-intent-suite/6q-conference-prototype/js/conference-profile-assistant-core.js`  
  Pure session, progression, filtering, ranking, version and fallback logic.
- `6q-intent-suite/6q-conference-prototype/js/conference-profile-assistant-mock.js`  
  Three-intent fixtures, products, goods, course sessions, tracking evidence and fallback products.
- `6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-core.test.mjs`  
  Core business-rule tests.
- `6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-ui.test.mjs`  
  Static integration contract for both profile pages and the assistant DOM source.

### Modify

- `6q-intent-suite/6q-conference-prototype/js/conference-profile-ai-chat.js`  
  Replace small popup orchestration with large workbench UI and three complete demo flows.
- `6q-intent-suite/6q-conference-prototype/css/6q-profile.css`  
  Replace only the `.pf-ai*` assistant block; leave profile styles untouched.
- `6q-intent-suite/6q-conference-prototype/conference-student-profile.html`  
  Add core/mock scripts immediately before the existing assistant script.
- `6q-intent-suite/6q-interviewer-portal/student-profile.html`  
  Add shared core/mock scripts immediately before the existing assistant script.

---

### Task 1: Pure Assistant Core

**Files:**
- Create: `6q-intent-suite/6q-conference-prototype/js/conference-profile-assistant-core.js`
- Create: `6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-core.test.mjs`

**Interfaces:**
- Produces global `ConferenceProfileAssistantCore`.
- `createDraftSession(context, now)` returns an unsaved session.
- `addMessage(session, role, text, now)` persists after the first message and generates a title.
- `searchSessions(sessions, query)` searches learner, conference, title and date.
- `resolveCourseLevel(tagLevel, enrollmentLevels)` returns the highest verified level plus conflict metadata.
- `buildConditions(input)` separates explicit, inferred and missing conditions.
- `matchProducts(products, context)` enforces budget, progression and relation rules.
- `selectCourseSessions(rows, city, now, limit)` returns exactly up to three valid sessions.
- `sortGoods(goods, budget)` returns budget-fit goods first with display status.
- `createMatchVersion(session, conditions, products, now, status)` appends immutable versions.

- [ ] **Step 1: Write failing tests for session persistence and history**

```js
test("空白会话不保存，首次消息后生成个人历史", () => {
  const session = Core.createDraftSession({
    userId: "staff-01",
    memberId: "m10009",
    memberName: "项琳琳",
    conferenceId: "conf-12551",
    conferenceName: "第12551期广州会务",
  }, "2026-08-27T01:00:00Z");

  assert.equal(session.persisted, false);
  Core.addMessage(session, "user", "学员对什么课程感兴趣？", "2026-08-27T01:01:00Z");
  assert.equal(session.persisted, true);
  assert.equal(session.title, "学员对什么课程感兴趣？");
});

test("历史搜索覆盖学员、会务、标题和日期", () => {
  const rows = [
    { memberName: "项琳琳", conferenceName: "广州会务", title: "亲子课程", updatedAt: "2026-08-27" },
    { memberName: "夏兰", conferenceName: "佛山会务", title: "复训建议", updatedAt: "2026-08-20" },
  ];
  assert.equal(Core.searchSessions(rows, "广州").length, 1);
  assert.equal(Core.searchSessions(rows, "复训").length, 1);
  assert.equal(Core.searchSessions(rows, "2026-08-27").length, 1);
});
```

- [ ] **Step 2: Run the session tests and verify RED**

Run:

```powershell
node --test "6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-core.test.mjs"
```

Expected: FAIL because `conference-profile-assistant-core.js` does not exist.

- [ ] **Step 3: Add failing tests for course progression and relation terminology**

```js
test("层级冲突时取真实记录验证的最高层级", () => {
  assert.deepEqual(
    Core.resolveCourseLevel("沙龙", ["分享会"]),
    { level: "分享会", nextLevel: "一阶", conflict: true },
  );
});

test("资格未核销与已报读使用不同建议", () => {
  assert.equal(Core.relationAdvice("qualified"), "提醒使用已有资格完成报读");
  assert.equal(Core.relationAdvice("enrolled"), "建议选择未来期数复训");
});
```

- [ ] **Step 4: Add failing tests for budget, goods and course sessions**

```js
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
    { id: "1", city: "广州", status: "报读中", startsAt: "2026-09-10" },
    { id: "2", city: "广州", status: "正在开课中", startsAt: "2026-08-26" },
    { id: "3", city: "佛山", status: "报读中", startsAt: "2026-09-01" },
    { id: "4", city: "广州", status: "已结束", startsAt: "2026-08-01" },
    { id: "5", city: "深圳", status: "报读中", startsAt: "2026-09-05" },
  ];
  assert.deepEqual(
    Core.selectCourseSessions(rows, "广州", "2026-08-27", 3).map((row) => row.id),
    ["2", "1", "3"],
  );
});
```

- [ ] **Step 5: Implement the minimal UMD core**

Create `conference-profile-assistant-core.js` with:

```js
(function (global, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.ConferenceProfileAssistantCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var LEVELS = ["无", "沙龙", "分享会", "一阶", "二阶", "三阶"];
  var VALID_SESSION_STATUS = { "正在开课中": 0, "报读中": 1 };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createDraftSession(context, now) {
    return Object.assign({
      id: "session-" + String(now),
      title: "",
      createdAt: now,
      updatedAt: now,
      persisted: false,
      messages: [],
      matchVersions: [],
    }, clone(context));
  }

  function addMessage(session, role, text, now) {
    session.messages.push({ role: role, text: text, createdAt: now });
    session.updatedAt = now;
    if (!session.persisted) {
      session.persisted = true;
      session.title = String(text).slice(0, 24);
    }
    return session;
  }

  function searchSessions(rows, query) {
    var q = String(query || "").trim().toLowerCase();
    if (!q) return rows.slice();
    return rows.filter(function (row) {
      return [row.memberName, row.conferenceName, row.title, row.updatedAt]
        .join(" ")
        .toLowerCase()
        .indexOf(q) !== -1;
    });
  }

  function resolveCourseLevel(tagLevel, enrollmentLevels) {
    var all = [tagLevel].concat(enrollmentLevels || []);
    var highest = all.reduce(function (best, value) {
      return LEVELS.indexOf(value) > LEVELS.indexOf(best) ? value : best;
    }, "无");
    var index = LEVELS.indexOf(highest);
    return {
      level: highest,
      nextLevel: index >= LEVELS.length - 1 ? null : LEVELS[index + 1],
      conflict: (enrollmentLevels || []).some(function (value) { return value !== tagLevel; }),
    };
  }

  function relationAdvice(status) {
    if (status === "qualified") return "提醒使用已有资格完成报读";
    if (status === "enrolled") return "建议选择未来期数复训";
    return "可按首次购买路径跟进";
  }

  function isProductWithinBudget(product, budget) {
    return (product.goods || []).some(function (good) {
      return good.available !== false && Number(good.price) <= Number(budget);
    });
  }

  function sortGoods(goods, budget) {
    return (goods || []).map(function (good) {
      var row = clone(good);
      row.budgetStatus = Number(row.price) <= Number(budget) ? "fit" : "over";
      return row;
    }).sort(function (a, b) {
      if (a.budgetStatus !== b.budgetStatus) return a.budgetStatus === "fit" ? -1 : 1;
      return Number(a.price) - Number(b.price);
    });
  }

  function selectCourseSessions(rows, city, now, limit) {
    var today = String(now).slice(0, 10);
    return (rows || []).filter(function (row) {
      return Object.prototype.hasOwnProperty.call(VALID_SESSION_STATUS, row.status) &&
        (row.status === "正在开课中" || row.startsAt >= today);
    }).sort(function (a, b) {
      var cityDiff = Number(b.city === city) - Number(a.city === city);
      if (cityDiff) return cityDiff;
      var statusDiff = VALID_SESSION_STATUS[a.status] - VALID_SESSION_STATUS[b.status];
      if (statusDiff) return statusDiff;
      return String(a.startsAt).localeCompare(String(b.startsAt));
    }).slice(0, limit || 3);
  }

  function createMatchVersion(session, conditions, products, now, status) {
    var version = {
      id: "match-" + (session.matchVersions.length + 1),
      createdAt: now,
      dataAsOf: conditions.dataAsOf,
      explicitConditions: clone(conditions.explicit || []),
      inferredConditions: clone(conditions.inferred || []),
      missingConditions: clone(conditions.missing || []),
      confidence: conditions.confidence || 0,
      status: status,
      products: clone(products || []),
    };
    session.matchVersions.push(version);
    session.updatedAt = now;
    return version;
  }

  return {
    LEVELS: LEVELS,
    createDraftSession: createDraftSession,
    addMessage: addMessage,
    searchSessions: searchSessions,
    resolveCourseLevel: resolveCourseLevel,
    relationAdvice: relationAdvice,
    isProductWithinBudget: isProductWithinBudget,
    sortGoods: sortGoods,
    selectCourseSessions: selectCourseSessions,
    createMatchVersion: createMatchVersion,
  };
});
```

- [ ] **Step 6: Run core tests and verify GREEN**

Run the Step 2 command. Expected: all core tests PASS.

---

### Task 2: Complete Mock Dataset and Matcher

**Files:**
- Create: `6q-intent-suite/6q-conference-prototype/js/conference-profile-assistant-mock.js`
- Modify: `6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-core.test.mjs`

**Interfaces:**
- Produces global `ConferenceProfileAssistantMock`.
- Exposes `intents`, `trackingByMember`, `courseLevelsByMember`, `productRelationsByMember`, `products`, `fallbackProducts`.
- Exposes `buildContext(pack)` and `match(memberId, conditions)`.

- [ ] **Step 1: Add failing matcher tests**

```js
test("匹配使用预算、亲子方向和资格状态生成TOP3", () => {
  const result = Mock.match("m10009", {
    budget: 5000,
    topic: "亲子关系",
    city: "广州市",
  });
  assert.equal(result.length, 3);
  assert.ok(result.every((row) => row.goods.some((good) => good.price <= 5000)));
  assert.equal(result[0].sessions.length, 3);
});

test("匹配失败返回明确标记的兜底产品", () => {
  const result = Mock.match("m10009", {
    budget: 10,
    topic: "不存在的方向",
    forceFailure: true,
  });
  assert.equal(result.isFallback, true);
  assert.equal(result.label, "兜底参考 · 非智能匹配");
});
```

- [ ] **Step 2: Run tests and verify RED**

Run the core test command. Expected: FAIL because `ConferenceProfileAssistantMock` is missing.

- [ ] **Step 3: Implement exact demo fixtures**

Create:

- Three intent labels exactly as approved;
- At least three learners: `m10009`, `m10001`, `m10003`;
- Tracking evidence for page views, course content clicks, learning, video and live events;
- Course levels containing 沙龙, 分享会 and 一阶;
- Three primary demo products:
  - `prod_parent_relation` / 亲子关系成长课;
  - `prod_eq_parent_1` / 高EQ智慧父母一阶;
  - `prod_family_communication` / 家庭沟通工作坊;
- Each product has:
  - full description;
  - at least three goods, including budget-fit and over-budget examples;
  - at least four course sessions so filtering can choose three;
  - Guangzhou, Foshan and Shenzhen examples;
  - statuses 正在开课中, 报读中 and 已结束;
- Two fallback products marked with `isFallback: true`.

The module must call `Core.isProductWithinBudget`, `Core.sortGoods` and `Core.selectCourseSessions`, not duplicate those rules.

- [ ] **Step 4: Run matcher tests and verify GREEN**

Run the core test command. Expected: all tests PASS.

---

### Task 3: Large Workbench Shell, History, and Three Intents

**Files:**
- Create: `6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-ui.test.mjs`
- Modify: `6q-intent-suite/6q-conference-prototype/js/conference-profile-ai-chat.js`
- Modify: `6q-intent-suite/6q-conference-prototype/css/6q-profile.css`
- Modify: `6q-intent-suite/6q-conference-prototype/conference-student-profile.html`
- Modify: `6q-intent-suite/6q-interviewer-portal/student-profile.html`

**Interfaces:**
- `conference-profile-ai-chat.js` consumes `ConferenceProfileData`, `ConferenceProfileAssistantCore`, `ConferenceProfileAssistantMock`.
- Preserves external IDs `pfAiFab`, `pfAiPanel`, `pfAiOpenBtn` so existing toolbar wiring remains valid.
- Adds stable DOM IDs `pfAiHistory`, `pfAiMessages`, `pfAiResult`, `pfAiComposer`.

- [ ] **Step 1: Write failing static integration tests**

```js
test("两个画像页按 core → mock → UI 顺序加载助手", () => {
  for (const file of [pcProfileHtml, portalProfileHtml]) {
    const html = readFileSync(file, "utf8");
    const coreAt = html.indexOf("conference-profile-assistant-core.js");
    const mockAt = html.indexOf("conference-profile-assistant-mock.js");
    const uiAt = html.indexOf("conference-profile-ai-chat.js");
    assert.ok(coreAt > -1 && coreAt < mockAt && mockAt < uiAt);
  }
});

test("助手源码包含三个批准的模拟开场按钮", () => {
  const source = readFileSync(aiChatJs, "utf8");
  assert.match(source, /学员在系统中对什么类型的课程感兴趣？/);
  assert.match(source, /学员下一步应该如何跟进？/);
  assert.match(source, /应该推荐什么课程产品比较适合该学员？/);
});
```

- [ ] **Step 2: Run UI tests and verify RED**

Run:

```powershell
node --test "6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-ui.test.mjs"
```

Expected: FAIL because new script references and approved labels are absent.

- [ ] **Step 3: Add script references**

In both profile pages, load:

```html
<script src=".../conference-profile-assistant-core.js"></script>
<script src=".../conference-profile-assistant-mock.js"></script>
<script src=".../conference-profile-ai-chat.js"></script>
```

Use each page’s existing relative path convention.

- [ ] **Step 4: Replace the assistant mount shell**

Keep the FAB, but render:

```html
<div class="pf-ai__backdrop" id="pfAiBackdrop" hidden>
  <section class="pf-ai__panel" id="pfAiPanel" role="dialog" aria-modal="true">
    <header class="pf-ai__head">...</header>
    <aside class="pf-ai__history" id="pfAiHistory" hidden>...</aside>
    <div class="pf-ai__workspace">
      <section class="pf-ai__conversation">
        <div class="pf-ai__messages" id="pfAiMessages"></div>
        <div class="pf-ai__intents">...</div>
        <form class="pf-ai__composer" id="pfAiComposer">...</form>
      </section>
      <section class="pf-ai__result" id="pfAiResult">...</section>
    </div>
  </section>
</div>
```

Opening creates a draft session. Persist to:

```js
var storageKey = "6q_profile_assistant_sessions_v1:" + currentUserId;
```

Resolve `currentUserId` from `InterviewerAuth.getSession()` when available; otherwise use `conference_pc_demo_staff`.

- [ ] **Step 5: Implement history behavior**

- Search across learner name, conference, title and date;
- Sort by `updatedAt` descending;
- No rename/delete controls;
- Clicking another learner builds the proper profile URL with `id` and `assistantSession`;
- The target page reopens the assistant and loads the selected session.

- [ ] **Step 6: Implement the three intent responses**

Interest:

- summarize tags and tracking events;
- render evidence cards;
- classify facts vs inference.

Follow-up:

- resolve highest level;
- show conflict warning when needed;
- render salon/share enrollment records;
- show qualified-not-enrolled or enrolled-retrain advice.

Product:

- render a condition summary;
- always offer `继续补充信息` and `按当前信息匹配产品`;
- direct match remains available with inferred conditions.

- [ ] **Step 7: Replace only the assistant CSS block**

Implement:

- full-screen dim backdrop;
- `90vw × 88vh`, max-width `1480px`;
- two-column grid `minmax(380px, .82fr) minmax(620px, 1.45fr)`;
- history drawer overlay;
- responsive single-column fallback below `1050px`;
- focus-visible states;
- `prefers-reduced-motion`.

Do not alter CSS before `.pf-ai` or after the end of the assistant section except assistant-specific media queries.

- [ ] **Step 8: Run UI and core tests**

Run:

```powershell
node --test `
  "6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-core.test.mjs" `
  "6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-ui.test.mjs"
```

Expected: all tests PASS.

---

### Task 4: Matching Animation, Result Versions, Product Detail, and Fallback

**Files:**
- Modify: `6q-intent-suite/6q-conference-prototype/js/conference-profile-ai-chat.js`
- Modify: `6q-intent-suite/6q-conference-prototype/css/6q-profile.css`
- Modify: `6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-ui.test.mjs`

**Interfaces:**
- UI state values: `idle`, `collecting`, `confirm`, `matching`, `results`, `detail`, `failed`.
- `runMatching()` creates a version only on successful/fallback completion.
- `renderProductDetail(productId)` replaces the right result list in place.

- [ ] **Step 1: Add failing UI contract tests**

```js
test("助手包含融合动效、推荐版本和兜底标识", () => {
  const source = readFileSync(aiChatJs, "utf8");
  assert.match(source, /用户标签/);
  assert.match(source, /行为埋点/);
  assert.match(source, /预算与SKU硬校验/);
  assert.match(source, /兜底参考 · 非智能匹配/);
  assert.match(source, /matchVersions/);
});
```

- [ ] **Step 2: Run and verify RED**

Run the UI test command. Expected: FAIL on missing matching-flow labels.

- [ ] **Step 3: Implement A+B matching flow**

When the worker confirms:

1. right panel changes to `matching`;
2. show four source nodes feeding the AI core;
3. progress through five approved stages;
4. update status text every ~1.45 seconds;
5. after 8–9 seconds call the mock matcher;
6. create a successful match version;
7. render results.

Use CSS animations; use one JS timer list so `close()` can cancel every pending timer.

- [ ] **Step 4: Implement result cards and detail view**

Result list shows:

- TOP1/TOP2/TOP3;
- product name and match percentage;
- budget status;
- qualified/enrolled relation;
- three reasons;
- latest match version selector.

Detail view shows:

- description;
- exactly three selected course sessions;
- all goods ordered by budget fit;
- `符合预算` and `超出本次预算，仅供了解`;
- back button to results.

No cart, order or copy buttons.

- [ ] **Step 5: Implement rematch and immutable versions**

- Any new worker message after a successful match shows `按新增信息重新匹配`;
- Clicking it creates a new version;
- version switcher restores prior conditions/results;
- prior snapshots remain unchanged;
- continuing a historical session reads current mock data and displays a change banner before new analysis.

- [ ] **Step 6: Implement failure and fallback**

Provide a deterministic demo trigger:

- entering `模拟匹配失败` sets `forceFailure`;
- render failure reason and `重新匹配`;
- render budget-filtered fallback products;
- mark them `兜底参考 · 非智能匹配`;
- retain the conversation and conditions.

- [ ] **Step 7: Run tests and verify GREEN**

Run all assistant tests. Expected: all PASS.

---

### Task 5: Browser Verification and Scope Guard

**Files:**
- No production file changes expected.

- [ ] **Step 1: Run the complete automated test set**

```powershell
node --test `
  "6q-intent-suite/index-features.test.mjs" `
  "6q-intent-suite/6q-interviewer-portal/tests/auth-mock.test.mjs" `
  "6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-core.test.mjs" `
  "6q-intent-suite/6q-conference-prototype/tests/conference-profile-assistant-ui.test.mjs"
```

Expected: all tests PASS, zero failures.

- [ ] **Step 2: Verify conference PC flow in a browser**

Open:

```text
/6q-intent-suite/6q-conference-prototype/conference-student-profile.html?id=m10009
```

Verify:

- large workbench opens from toolbar and FAB;
- all three intents complete;
- direct match and follow-up paths work;
- animation runs;
- product detail contains 3 valid sessions and all goods;
- history search and version switch work;
- failure fallback is labeled.

- [ ] **Step 3: Verify interviewer portal flow**

Open portal login, select a conference, enter `student-profile.html?id=m10009`, and verify the same assistant behavior with portal auth/session context.

- [ ] **Step 4: Verify scope**

Run:

```powershell
git diff --name-only main...HEAD
```

Expected changed paths are restricted to:

- the assistant core/mock/UI scripts;
- assistant tests;
- `6q-profile.css`;
- the two profile HTML script references;
- this spec and plan.

No intent list, strategy, profile renderer, APP or tag files may appear.

## Self-Review

- Spec coverage: every requirement maps to Tasks 1–5.
- Placeholder scan: no `TBD`, `TODO`, “similar”, or unspecified error handling remains.
- Type consistency: `Session`, `MatchVersion`, relation statuses, and core function names are identical across tasks.
- Scope: implementation remains limited to the analysis assistant and its two host-page script references.
