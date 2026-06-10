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

**当前**：**v1.0.0** — 员工填表 + HR 计划 + 领导月度评分原型可预览；季度评分页占位。

- **Handoff（v1.0.0 功能清单）**：`docs/HANDOFF-v1.0.0.md` ← **接手必读**
- **交互原型入口**：`prototype/index.html`（浏览器直接打开）
- **设计 spec（Grill v0.1）**：`docs/superpowers/specs/2026-06-03-oa-performance-design.md`
- **考核表模板分析**：`docs/FORM_TEMPLATE_ANALYSIS.md`
- **OA 个人中心绩效**：`docs/OA_PERSONAL_CENTER_PERF.md`
- **模板原件**：`templates/monthly-v1.2.xlsx`、`templates/quarterly-v1.2.xlsx`
- **域词汇与决策**：`CONTEXT.md`、`docs/adr/`
- **Grill 会话记录**：`DESIGN_SESSION.md`

## 参考材料

- **功能清单（主索引）**：`FEATURE_LIST.md`（来源：人才开发部反馈 20260526）
- 清单解析数据：`feature-list-parsed.json`
- Excel 考核表字段摘要：`../perf_parse_result.json`
- 同级 Agent 工作流范例：`../oa-training-agent-workflow/`

## 如何使用

1. 在 Cursor 中打开本目录或上级 monorepo，与 Agent 对话完成 Grill 与设计 spec。
2. spec 评审通过后，再按 `docs/superpowers/plans/` 中的实现计划逐页出 HTML 原型。
3. 需要页面截图或业务澄清时，直接在对话中提供；Agent 会更新 `DESIGN_SESSION.md` 与 spec。
