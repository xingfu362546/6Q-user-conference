# OA 内部绩效 · 信息化原型

本目录用于 **OA 内部绩效管理** 的信息化原型设计与 HTML 实现。采用 Superpowers / Grill-me 流程：先对齐业务与页面边界，再分端（小程序 / OA 应用）出原型。

## 双端范围

| 端 | 目录（规划） | 说明 |
|---|---|---|
| 小程序 | `miniapp/` | 员工自评、查看结果、轻量审批等移动端场景 |
| OA 应用 | `oa-app/` | 管理端：模板配置、过程督查、上级评分、汇总报表等 |

## 设计流程（当前阶段）

```
探索上下文 → 逐题 Grill → 收齐截图 → 方案对比 → 分节设计评审 → spec → （用户批准后再）HTML 原型
```

**当前**：**v1.5.1**（2026-11-11）。v1.4.0 仍是上一版定稿，v1.5.0 / v1.5.1 接在它后面。

v1.5.0：季度专项激励、确认页 14px、HR 改最终总分、评价人按工号维护、计划可改名称和时间、退回可选节点、提交前预览、自动保存、失效待办、处理人姓名、筛选增加待上级评价和已完成。

v1.5.1：导出先看整表再出图；改总分一个弹窗提交；离开初始节点才显示「退至」；失效用红标并从原已发放范围包移出，恢复时加回该范围包并重新发放同一张待办。

- **本期规格**：`specs/001-perf-next-batch/spec.md`
- **v1.5.0 交付说明**：`specs/001-perf-next-batch/交付说明-v1.5.0.md`
- **功能清单（v1.5.0 / v1.5.1）**：`prototype/feature-list.html`
- **版本记录**：`docs/VERSIONS.md`
- **开发指南（v1.4.0 基线）**：`docs/DEV-GUIDE-v1.4.0.md`
- **本地原型导航**：`prototype/index.html`
- **Cloudflare / 线上入口**：仓库根目录 `index.html`（自动跳转至 `prototype/index.html`）
- **Handoff（v1.4.0）**：`docs/HANDOFF-v1.4.0.md`
- **Handoff（v1.1.0）**：`docs/HANDOFF-v1.1.0.md`
- **Handoff（v1.0.0）**：`docs/HANDOFF-v1.0.0.md`
- **设计 spec（Grill v0.1）**：`docs/superpowers/specs/2026-06-03-oa-performance-design.md`
- **OA 个人中心绩效**：`docs/OA_PERSONAL_CENTER_PERF.md`
- **模板原件**：`templates/monthly-v1.2.xlsx`、`templates/quarterly-v1.2.xlsx`
- **域词汇与决策**：`CONTEXT.md`、`docs/adr/`
- **Grill 会话记录**：`DESIGN_SESSION.md`

## 参考材料

- **功能清单（v1.5.0 / v1.5.1）**：`prototype/feature-list.html`
- **历史条目**：`FEATURE_LIST.md`（人才开发部反馈 20260526，不是本期主索引）
- 清单解析数据：`feature-list-parsed.json`
- Excel 考核表字段摘要：`../perf_parse_result.json`
- 同级 Agent 工作流范例：`../oa-training-agent-workflow/`

## Cloudflare Pages

连接 GitHub 仓库 [xingfu362546/oa--](https://github.com/xingfu362546/oa--) 后，按下列配置部署静态站点：

| 配置项 | 值 |
|--------|-----|
| Production branch | `main` |
| Framework preset | **None** |
| Build command | （留空） |
| Build output directory | **`/`**（仓库根目录，**不是** `prototype`） |

部署完成后访问 `https://<项目名>.pages.dev/` → 跳转 `prototype/index.html`。

`_redirects`：`/` → `/prototype/index.html`（302）。

### 注释（红点）线上不显示？

注释由 **`proto-notes-data.js` + `proto-notes.js`** 在浏览器端动态挂载，不是写在 HTML 里。请逐项排查：

1. **Cloudflare 是否已部署最新 `main`**（含 commit `6df3b95` 及以后）
2. **Build output directory 必须为 `/`**（仓库根）。若误设为 `prototype`，部分相对路径或 Pages 路由可能导致 `assets/*.js` 404
3. 浏览器 **F12 → Network**：打开任意业务页，确认 `proto-notes-data.js`、`proto-notes.js`、`proto-notes.css` 均为 **200**
4. **F12 → Console**：若见 `[proto-notes] PROTO_NOTE_PAGES 未加载` → JS 404；若见 `未匹配页面注释 key` → URL 路径与检测规则不符（已 v1.4.1 增强无 `.html` 后缀兼容）
5. 正常时页面 **右下角** 有「本页 N 条注释 · 点击序号查看」浮条

GitHub 仓库已迁移至 [oa-performancec](https://github.com/xingfu362546/oa-performancec)；Cloudflare 项目请确认连的是正确仓库与 `main` 分支。

## 如何使用

1. 在 Cursor 中打开本目录或上级 monorepo，与 Agent 对话完成 Grill 与设计 spec。
2. spec 评审通过后，再按 `docs/superpowers/plans/` 中的实现计划逐页出 HTML 原型。
3. 需要页面截图或业务澄清时，直接在对话中提供；Agent 会更新 `DESIGN_SESSION.md` 与 spec。
