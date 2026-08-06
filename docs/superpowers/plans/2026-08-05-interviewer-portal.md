# 6Q 面谈官门户 v1.0.3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付独立 PC 原型 `6q-interviewer-portal/`：会员登录 → 选进行中会务 → 只读意向列表/明细抽屉 → 画像档案（含 AI），并在功能清单记为 **v1.0.3**。

**Architecture:** 新建门户目录与橙系壳；`auth-mock` / `conference-mock` 管登录态与会务上下文（localStorage）；列表与画像复用 `6q-conference-prototype` 的数据与渲染脚本，通过 `INTENT_PORTAL_CONFIG` / 门户页 DOM 去掉策略入口并改写档案链接；不 iframe 运营后台。

**Tech Stack:** 静态 HTML/CSS/JS；localStorage；复用 Chart.js / ECharts（画像页 CDN）；Node 断言测会话纯函数；浏览器手工验收 UI。

**Spec:** `docs/superpowers/specs/2026-08-05-interviewer-portal-design.md`

## Global Constraints

- 版本标签：**v1.0.3**
- 账号：原系统会员；角色：会务内 **6Q面谈官**
- 学员范围：会务**全部**学员；功能：一期**只读**（无策略配置/跟进入录/导出）
- 登录：手机号+密码 **或** 邮箱+密码 + 图形验证码
- 会务：仅**进行中**可选；无会务空态文案精确为「当前无正在进行中的会务」
- 路径：登录 → 会务选择 → 意向列表（默认）；点姓名进画像；查看明细仅标签命中+洞察与推荐
- 字段口径与运营后台只读版**完全一致**
- 视觉：登录稿橙系 + 独立门户壳（非 Ant 蓝后台）
- 原型 mock：2～3 场会务，场内学员数据可同一套
- 不修改运营后台 v1.0.2 业务语义；仅允许为复用增加**可选**配置钩子

---

## File Structure

```text
6q-interviewer-portal/
  index.html                      # 入口路由（已登录? 有会务?）
  login.html
  conference-select.html
  student-intent.html             # 门户壳 + 意向列表/抽屉
  student-profile.html            # 门户壳 + 画像
  css/
    portal-tokens.css             # 橙系变量
    portal-shell.css              # 顶栏/布局
    portal-login.css              # 登录稿
    portal-intent.css             # 隐藏策略 CTA、微调
  js/
    auth-mock.js                  # 登录态 / 会务上下文 / 守卫
    conference-mock.js            # 2~3 场会务 + 空态用户
    portal-shell.js               # 顶栏渲染（会务名/切换/用户/退出）
    captcha-mock.js               # 图形验证码
  tests/
    auth-mock.test.mjs            # Node 会话单测

# 复用（只读引用 + 可选钩子）
6q-conference-prototype/
  js/conference-intent.js         # 增加 INTENT_PORTAL_CONFIG.profilePage
  js/conference-profile-data.js
  js/conference-student-profile.js
  js/conference-profile-behavior.js
  js/conference-profile-ai-chat.js
  css/6q-intent-premium.css
  css/6q-profile.css
  css/6q-conference.css           # 表格/抽屉基础（门户可覆盖主色）

# 清单
6q-conference-prototype/docs/FEATURE-CHANGELOG.md
6q-conference-prototype/index.html
index-features.js
```

---

### Task 1: 会话层 auth-mock + Node 单测

**Files:**
- Create: `6q-interviewer-portal/js/auth-mock.js`
- Create: `6q-interviewer-portal/tests/auth-mock.test.mjs`

**Interfaces:**
- Produces (挂 `globalThis.InterviewerAuth`，并 `export` 供 Node):

```js
// createAuth(storage) → API
{
  KEY_SESSION: "6q_iv_session",
  KEY_CONFERENCE: "6q_iv_conference",
  login({ mode, account, password, captcha }), // mode: "phone"|"email"；成功写 session；失败 throw Error(msg)
  logout(),           // 清 session + conference
  getSession(),       // { userId, displayName, phone?, email? } | null
  setConference(c),   // c: { id, title, periodLabel, city, status:"ongoing" }
  getConference(),    // object | null
  clearConference(),
  requireAuth(loginHref),      // 无 session → location = loginHref；返回 session|null
  requireConference(selectHref) // 无 conference → location = selectHref
}
```

- Mock 账号（写死在 auth-mock）：
  - 手机 `13800001111` / 密码 `Passw0rd!` → userId `iv_demo`，有会务
  - 邮箱 `interviewer@6q.test` / 密码 `Passw0rd!` → 同上
  - 手机 `13900002222` / 密码 `Passw0rd!` → userId `iv_empty`，无会务（配合 Task 3）
  - 验证码：由调用方传入；`login` 要求 `captcha` 非空且与 `expectedCaptcha` 参数一致（测试传入；浏览器由 captcha-mock 提供）

- [ ] **Step 1: 写失败单测**

```js
// 6q-interviewer-portal/tests/auth-mock.test.mjs
import assert from "node:assert/strict";
import { createAuth } from "../js/auth-mock.js";

function mem() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

const auth = createAuth(mem());
assert.equal(auth.getSession(), null);
assert.throws(() => auth.login({ mode: "phone", account: "13800001111", password: "wrong", captcha: "abcd" }), /密码/);
console.log("auth-mock tests: scaffolding ok");
```

- [ ] **Step 2: 运行确认失败（模块未实现或断言失败）**

```bash
node 6q-interviewer-portal/tests/auth-mock.test.mjs
```

Expected: 抛错或 MODULE_NOT_FOUND

- [ ] **Step 3: 实现 `auth-mock.js`（ESM + 浏览器双挂）**

```js
// 核心：createAuth(storage)；浏览器末尾：
// if (typeof window !== "undefined") window.InterviewerAuth = createAuth(window.localStorage);
// Node：export { createAuth };
```

实现完整单测用例：

```js
auth.login({ mode: "phone", account: "13800001111", password: "Passw0rd!", captcha: "b7s8n", expectedCaptcha: "b7s8n" });
assert.equal(auth.getSession().userId, "iv_demo");
auth.setConference({ id: "cf_a", title: "如何说孩子才会听", periodLabel: "第12551期", city: "广州", status: "ongoing" });
assert.equal(auth.getConference().id, "cf_a");
auth.logout();
assert.equal(auth.getSession(), null);
assert.equal(auth.getConference(), null);
auth.login({ mode: "email", account: "interviewer@6q.test", password: "Passw0rd!", captcha: "x", expectedCaptcha: "x" });
assert.equal(auth.getSession().userId, "iv_demo");
auth.login({ mode: "phone", account: "13900002222", password: "Passw0rd!", captcha: "x", expectedCaptcha: "x" });
assert.equal(auth.getSession().userId, "iv_empty");
```

- [ ] **Step 4: 跑通单测**

```bash
node 6q-interviewer-portal/tests/auth-mock.test.mjs
```

Expected: 打印通过信息，exit 0

- [ ] **Step 5: Commit**

```bash
git add 6q-interviewer-portal/js/auth-mock.js 6q-interviewer-portal/tests/auth-mock.test.mjs
git commit -m "feat(interviewer-portal): add auth-mock session layer for v1.0.3"
```

---

### Task 2: 会务 mock + 登录页 UI

**Files:**
- Create: `6q-interviewer-portal/js/conference-mock.js`
- Create: `6q-interviewer-portal/js/captcha-mock.js`
- Create: `6q-interviewer-portal/css/portal-tokens.css`
- Create: `6q-interviewer-portal/css/portal-login.css`
- Create: `6q-interviewer-portal/login.html`

**Interfaces:**
- `InterviewerConferences.listForUser(userId)` → `Array<Conference>`  
  - `iv_demo` → 3 场 `status:"ongoing"`（id: `cf_a`/`cf_b`/`cf_c`；标题/期数不同，学员数据后续共用）  
  - `iv_empty` → `[]`
- `InterviewerConferences.getById(id)` → Conference | null
- `InterviewerCaptcha.refresh()` → `{ code, displayHtml }`；`InterviewerCaptcha.getCode()` → 当前 code

- [ ] **Step 1: 实现 `conference-mock.js` / `captcha-mock.js`**
- [ ] **Step 2: 按设计稿实现 `login.html`**
  - Tab：手机登录 / 邮箱登录  
  - 字段：账号（手机含 +86 展示即可）/ 密码（显隐）/ 验证码 + 点击刷新  
  - 提交：调用 `InterviewerAuth.login({..., expectedCaptcha: InterviewerCaptcha.getCode()})`  
  - 成功：`location.href = "conference-select.html"`  
  - 失败：表单下方红色错误文案  
  - 页脚小字提示原型账号：`13800001111` / `interviewer@6q.test` / `13900002222`（无会务），密码 `Passw0rd!`
- [ ] **Step 3: 浏览器打开 `login.html`，手机与邮箱各登录一次成功；错误密码见提示**
- [ ] **Step 4: Commit**

```bash
git add 6q-interviewer-portal/
git commit -m "feat(interviewer-portal): login page with phone/email and captcha"
```

---

### Task 3: 会务选择页 + 入口路由 + 空态

**Files:**
- Create: `6q-interviewer-portal/conference-select.html`
- Create: `6q-interviewer-portal/css/portal-shell.css`（本 Task 可先用选择页基础样式，顶栏完整化在 Task 4）
- Create: `6q-interviewer-portal/index.html`

**Interfaces:**
- 选择页 `DOMContentLoaded`：`InterviewerAuth.requireAuth("login.html")`；`listForUser(session.userId)`  
- 有数据：渲染卡片；点击 → `setConference(c)` → `location.href = "student-intent.html"`  
- 无数据：唯一主文案节点文本为 **当前无正在进行中的会务**（可附次要说明「请联系会务运营确认面谈官权限」，次要说明不可替代主文案）  
- `index.html`：无 session → login；有 session 无 conference → select；皆有 → intent

- [ ] **Step 1: 实现 `conference-select.html` + `index.html`**
- [ ] **Step 2: 用 `13800001111` 登录应看到 3 张会务卡并可点进（下一 Task 列表可先 404，本 Task 验跳转 URL）**
- [ ] **Step 3: 用 `13900002222` 登录，主文案精确匹配「当前无正在进行中的会务」**
- [ ] **Step 4: Commit**

```bash
git add 6q-interviewer-portal/
git commit -m "feat(interviewer-portal): conference select and empty state"
```

---

### Task 4: 门户壳（顶栏）

**Files:**
- Create: `6q-interviewer-portal/js/portal-shell.js`
- Modify: `6q-interviewer-portal/css/portal-shell.css`
- Modify: `conference-select.html`（可选挂简易顶栏）

**Interfaces:**
- `InterviewerShell.mount({ containerSelector, active: "intent"|"profile"|"select" })`
  - 展示：产品名「6Q面谈官」、当前会务 `periodLabel · title`（无则「未选择会务」）、用户 `displayName`、按钮「切换会务」→ `conference-select.html`、「退出」→ `logout()` + `login.html`
  - **不渲染**侧栏运营菜单

- [ ] **Step 1: 实现 shell 并在后续业务页挂载点 `#portal-topbar` 预留**
- [ ] **Step 2: 在 select 页挂载（无会务时隐藏「切换会务」或仍显示但回到本页）**
- [ ] **Step 3: 浏览器确认顶栏橙系、退出回登录且 session 清空**
- [ ] **Step 4: Commit**

```bash
git add 6q-interviewer-portal/
git commit -m "feat(interviewer-portal): orange portal top shell"
```

---

### Task 5: 意向列表页（复用 + 去策略入口）

**Files:**
- Create: `6q-interviewer-portal/student-intent.html`
- Create: `6q-interviewer-portal/css/portal-intent.css`
- Modify: `6q-conference-prototype/js/conference-intent.js`（可选钩子，见下）

**Interfaces:**
- 页头脚本（在 `conference-intent.js` 之前）：

```js
window.INTENT_PORTAL_CONFIG = {
  profilePage: "student-profile.html",
  hideStrategyLinks: true,
};
```

- 在 `conference-intent.js` 生成姓名链接处，将硬编码 `conference-student-profile.html` 改为：

```js
var profilePage =
  (global.INTENT_PORTAL_CONFIG && global.INTENT_PORTAL_CONFIG.profilePage) ||
  "conference-student-profile.html";
// href = profilePage + "?id=" + ...
```

- 运营后台不传 config 时行为不变  
- 门户 HTML：**不要**引入 `6q-shell.js`；**不要**放「本期分析策略」按钮；可保留只读 KPI 卡片与列表/抽屉 DOM（与后台 intention 页同结构的 table + drawer 两 Tab）  
- 脚本顺序示例：

```html
<script src="js/auth-mock.js" type="module"></script>
<!-- 若 type=module 与后续经典脚本混用有问题：改为非 module IIFE 构建，auth 同时挂 window（Task1 已双挂） -->
<script src="js/auth-mock.js"></script>
<script src="js/conference-mock.js"></script>
<script src="js/portal-shell.js"></script>
<script>
  InterviewerAuth.requireAuth("login.html");
  InterviewerAuth.requireConference("conference-select.html");
  InterviewerShell.mount({ containerSelector: "#portal-topbar", active: "intent" });
  window.INTENT_PORTAL_CONFIG = { profilePage: "student-profile.html", hideStrategyLinks: true };
</script>
<script src="../6q-conference-prototype/js/tag-catalog-tree.js"></script>
<script src="../6q-conference-prototype/js/intent-strategy-core.js"></script>
<script src="../6q-conference-app-prototype/js/course-recommend.js"></script>
<script src="../6q-conference-prototype/js/conference-intent.js"></script>
```

- CSS：`.portal-app .intent-hero__actions a[href*="intent-strategy"] { display:none }` 等兜底  
- Hero 标题：用 `getConference()` 的 `periodLabel · title` 覆盖 `#intent-hero-title`（小脚本在 intent 渲染后或 DOMContentLoaded）

- [ ] **Step 1: 改 `conference-intent.js` 钩子并回归打开运营后台意向页，链接仍指向 `conference-student-profile.html`**
- [ ] **Step 2: 建门户 `student-intent.html`（复制后台列表/抽屉 DOM 骨架，去掉策略 CTA 与侧栏）**
- [ ] **Step 3: 浏览器：登录→选会务→列表有学员；点「查看明细」仅两 Tab；无策略入口**
- [ ] **Step 4: 点姓名跳转 `student-profile.html?id=...`（本 Task 画像可暂缺，验 URL）**
- [ ] **Step 5: Commit**

```bash
git add 6q-interviewer-portal/ 6q-conference-prototype/js/conference-intent.js
git commit -m "feat(interviewer-portal): intent list page reusing admin data"
```

---

### Task 6: 画像档案页（复用 + AI）

**Files:**
- Create: `6q-interviewer-portal/student-profile.html`
- Modify: 门户壳返回链

**Interfaces:**
- 守卫：`requireAuth` + `requireConference`  
- 引入（相对路径）：

```html
<link rel="stylesheet" href="../6q-conference-prototype/css/6q-conference.css" />
<link rel="stylesheet" href="../6q-conference-prototype/css/6q-profile.css" />
<link rel="stylesheet" href="css/portal-tokens.css" />
<link rel="stylesheet" href="css/portal-shell.css" />
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<!-- auth / shell -->
<script src="../6q-conference-prototype/js/conference-profile-data.js"></script>
<script src="../6q-conference-prototype/js/conference-profile-behavior.js"></script>
<script src="../6q-conference-prototype/js/conference-student-profile.js"></script>
<script src="../6q-conference-prototype/js/conference-profile-ai-chat.js"></script>
```

- 工具条：「← 返回学员列表」→ `student-intent.html`；保留 AI 分析对话；**禁用或隐藏**「发起跟进」  
- 版本角标文案改为 `v1.0.3`（门户）  
- 确认行为四 Tab、跟进更多、AI 弹窗可用（与后台同一 mock 会员，如 `m10009`）

- [ ] **Step 1: 实现 `student-profile.html`**
- [ ] **Step 2: 从列表点「项琳琳」类学员进入，页顶落地；返回列表会务上下文仍在**
- [ ] **Step 3: 打开 AI 对话，发送一句 mock 问句有回复**
- [ ] **Step 4: Commit**

```bash
git add 6q-interviewer-portal/
git commit -m "feat(interviewer-portal): student profile with AI chat"
```

---

### Task 7: 清单与导航 v1.0.3

**Files:**
- Modify: `6q-conference-prototype/docs/FEATURE-CHANGELOG.md`（文首新增 v1.0.3 章）
- Modify: `6q-conference-prototype/index.html`（增加 v1.0.3 卡片 + 门户入口）
- Modify: `index-features.js`：
  - `conferenceVersions` 顶部插入 v1.0.3，`current: true`；原 v1.0.2 `current` 去掉  
  - notes 增加 `46` 面谈官门户说明  
  - PC modules 增加「面谈官门户」分组  
- Modify: 根 `index.html` 若硬编码版本区，同步入口（若仅读 `index-features.js` 则只改 JS）

**v1.0.3 changelog 要点（必须写入）：**
- 独立面谈官门户；登录手机/邮箱+密码  
- 会务选择（进行中）；空态文案  
- 意向列表只读 + 明细抽屉 + 画像（行为/跟进/AI）  
- 不包含策略配置  

- [ ] **Step 1: 更新三处清单/导航**
- [ ] **Step 2: 打开根清单与 `6q-conference-prototype/index.html`，确认 v1.0.3 为当前、链接可进门户登录页**
- [ ] **Step 3: Commit**

```bash
git add 6q-conference-prototype/docs/FEATURE-CHANGELOG.md 6q-conference-prototype/index.html index-features.js index.html
git commit -m "docs: record interviewer portal as v1.0.3"
```

---

### Task 8: 端到端验收

**Files:** 无新文件（可更新 `02-memory/decisions.md` 一行「v1.0.3 原型验收通过」若通过）

- [ ] **Step 1: 跑 Node 单测**

```bash
node 6q-interviewer-portal/tests/auth-mock.test.mjs
```

- [ ] **Step 2: 浏览器清单（全部勾选才算完）**
  1. 手机登录、邮箱登录均成功  
  2. `iv_demo` 见 2～3 场会务；进入后列表有数据  
  3. `iv_empty` 主文案「当前无正在进行中的会务」  
  4. 列表无策略配置/导出；查看明细仅两 Tab  
  5. 点姓名进画像；行为/跟进更多与 AI 可用  
  6. 切换会务、退出登录守卫正确  
  7. 运营后台意向页姓名链接仍指向后台画像（钩子未破坏）  
  8. 清单显示 **v1.0.3**

- [ ] **Step 3: Commit 验收备注（可选）或仅汇报结果**

---

## Spec coverage（自检）

| Spec 要求 | Task |
|-----------|------|
| 独立门户目录 | 2–6 |
| 手机/邮箱+密码+验证码 | 2 |
| 进行中会务 2～3 / 空态文案 | 3 |
| 登录→选会务→列表 | 3–5 |
| 意向列表只读、无策略 | 5 |
| 查看明细两 Tab | 5 |
| 点姓名进画像 | 5–6 |
| 画像行为/跟进/AI | 6 |
| 字段复用后台 | 5–6 |
| 橙系壳 | 2、4 |
| 守卫 | 1、3–6 |
| 清单 v1.0.3 | 7 |
| 验收 | 8 |

## Placeholder scan

无 TBD；钩子名固定为 `INTENT_PORTAL_CONFIG.profilePage`。

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-05-interviewer-portal.md`.

**两种执行方式：**

1. **Subagent-Driven（推荐）** — 每 Task 新开子代理，Task 间复查  
2. **Inline Execution** — 本会话按 executing-plans 连续做，关键节点停顿验收  

要哪一种？
