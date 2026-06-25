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

**当前**：**v1.4.0** — 月/季流转定稿、员工待办三分段、分管改分规则、确认流。

- **开发指南（研发/Task 生成）**：`docs/DEV-GUIDE-v1.4.0.md` ⭐
- **Cloudflare / 线上入口**：仓库根目录 `index.html`（自动跳转至 `prototype/index.html`）
- **本地原型导航**：`prototype/index.html`
- **版本记录**：`docs/VERSIONS.md`
- **Handoff（v1.4.0）**：`docs/HANDOFF-v1.4.0.md`
- **Handoff（v1.1.0）**：`docs/HANDOFF-v1.1.0.md`
- **Handoff（v1.0.0）**：`docs/HANDOFF-v1.0.0.md`
- **设计 spec（Grill v0.1）**：`docs/superpowers/specs/2026-06-03-oa-performance-design.md`
- **OA 个人中心绩效**：`docs/OA_PERSONAL_CENTER_PERF.md`
- **模板原件**：`templates/monthly-v1.2.xlsx`、`templates/quarterly-v1.2.xlsx`
- **域词汇与决策**：`CONTEXT.md`、`docs/adr/`
- **Grill 会话记录**：`DESIGN_SESSION.md`

## 参考材料

- **功能清单（主索引）**：`FEATURE_LIST.md`（来源：人才开发部反馈 20260526）
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
| Build output directory | **`/`**（仓库根目录） |

部署完成后访问站点根路径 `https://<项目名>.pages.dev/` 即可进入原型（根目录 `index.html` 会跳转至 `prototype/index.html`）。

`_redirects` 已配置：`/` → `/prototype/index.html`（302）。

## 如何使用

1. 在 Cursor 中打开本目录或上级 monorepo，与 Agent 对话完成 Grill 与设计 spec。
2. spec 评审通过后，再按 `docs/superpowers/plans/` 中的实现计划逐页出 HTML 原型。
3. 需要页面截图或业务澄清时，直接在对话中提供；Agent 会更新 `DESIGN_SESSION.md` 与 spec。
