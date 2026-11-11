# Grill · 月度领导评/确认页 KR 细项（v1.4.1）

> 日期：2026-06-03 · 关联：`supervisor-score-monthly.html`、`score-confirm.html`、`supervisor-score.js`

## 背景

用户反馈：领导在月度绩效**评分**与**确认**时，只能看到 V/X/B 模块总分，看不到下级填表各考核目标（L3）细项，与季度评分页不一致。

## Grill 决策

| # | 问题 | 结论（推荐 ✓） |
|---|------|----------------|
| Q1 | 确认页细项用什么形态？ | ✓ **L2→L3 折叠卡只读**，与季度 `supervisor-score-quarterly` 同源；底部保留模块表 + 折算汇总 |
| Q2 | 确认页是否展示 SMART/M/考核标准？ | ✓ 展开卡片可见；标题行展示权重 + 自评/上级分摘要 |
| Q2 | 已评完再进评分页是否可改？ | ✓ **整页只读**；布局不变；隐藏提交/退回 |
| Q3 | 月度确认是否展示分管逐项？ | ✓ **否**；仅系统汇总 vs 分管核定总分（改总分入口在待我审核） |
| Q4 | 季度确认是否展示分管列？ | ✓ **是**；细项与模块表均含分管列 |
| Q5 | 数据源？ | ✓ `SupervisorScore.SUBMISSIONS` + `PRESET_SCORES` / 草稿；`getConfirmContext(taskId)` 动态算模块分 |
| Q6 | 演示任务穷举？ | ✓ 见 [DEMO_DATA_SCENARIOS.md](./DEMO_DATA_SCENARIOS.md) |

## 实现要点

1. **`renderConfirmKrDetail(sub, state, opts)`** — 确认页 KR 细项（只读）
2. **`buildConfirmModules(sub, state)`** — 由逐项分汇总 V/X/B/加减分模块
3. **`score-confirm.js`** — 接入 `?id=`，不再使用硬编码 `DEMO_MODULES`
4. **李明月度数据** — `coreKeyObjectives` / `regularKeyObjectives` + `standardTiers` + `nextMonthKeyObjectives`
5. **王芳 PRESET** — `r-wf-202605` 上级逐项分，系统汇总 ≈ 84.2，分管核定 84.1

## 验收路径

| 场景 | URL |
|------|-----|
| 领导评 · 王芳（已评） | `supervisor-score-monthly.html?id=r-wf-202605` |
| 领导评 · 李明（待评） | `supervisor-score-monthly.html?id=r-lm-202605` |
| 员工确认 · 王芳 | `score-confirm.html?role=employee&id=r-wf-202605` |
| 上级确认 · 王芳 | `score-confirm.html?role=leader&id=r-wf-202605` |
| 季度确认 · 韩梅 | `score-confirm.html?type=quarter&role=supervisor&id=r-hm-2026q2` |

## 研发对接

- 确认 API 返回 `submitSnapshot` + `supervisorScores` 逐项分；前端用同一组件渲染
- 模块汇总行 = 各 block 逐项 supervisor 分求和（与评分页 `calcTotals` 一致）
- 折算公式：月 `自评×20%+上级×80%`；季 `自评×20%+上级×40%+分管×40%`
