# Grill · v1.5 小程序领导端定稿

> 日期：2026-06-03 · 与 [GRILL_V1_ITERATION.md](./GRILL_V1_ITERATION.md) §3 对齐并 supersede v1.1 小程序范围

## 背景

v1.4 主链路已在 OA 定稿月/季流转、三分确认与员工自填回看。v1.5 明确**端职责拆分**：员工全在 OA，领导/分管在小程序完成评、改分、确认。

---

## Q1 · 员工端是否在小程序保留？

**结论：A — 不做员工绩效**

| 能力 | OA | 小程序 |
|------|-----|--------|
| 月/季填表 | ✅ | ❌ |
| 待办 / 进度 | ✅ | ❌（旧页重定向） |
| 自填回看 | ✅ `personal-perf-past-view` | ❌（重定向 OA） |
| 待确认（员工） | ✅ | ❌（引导 OA banner） |

首页「绩效」宫格**保留**，但仅领导身份收到待办。

---

## Q2 · 领导端小程序范围

**结论：月评 + 季评 + 确认，与 OA 月/季规则一致**

- 月度：上级逐项评 → 待确认（分管仅改核定总分，不逐项评）
- 季度：上级评 → 分管评 → 待确认
- **待确认阶段互见分数**：KR 级展示自评 / 上级 / 分管列，不能只有模块总分

---

## Q3 · 分管能力

**结论：分管与直接上级均可在小程序评分 + 改核定总分 + 确认**

- 季评页 `?role=division` 与 OA 同源
- 列表卡片「改核定总分」→ `openDivisionAdjustModal`

---

## Q4 · 待办列表形态

**结论：单一「待我审核」列表 + phase 标签**

- 数据源：`SupervisorScore.buildUnifiedReviewRows()`（与 OA `supervisor-review-list` 同源）
- 标签：待上级评 / 待分管评 / 待确认
- **同人合并**：一条任务卡片（`mergedReview`）

---

## Q5 · 入口与触达

**结论：首页「绩效」保留；仅领导收待办**

- `home.html` 宫格 → `task-list.html`
- 角标演示值 = 领导待办计数（非员工）

---

## Q6 · 实现策略

**结论：组件级同源**

| 页面 | 初始化 |
|------|--------|
| 月评 | `initMpMonthlyScorePage()` → `initOaMonthlyScorePage()` |
| 季评 | `initMpQuarterlyScorePage()` → `initOaQuarterlyScorePage()` |
| 确认 | `score-confirm.js` + `renderConfirmKrDetail` |

平台标记：`__SUPERVISOR_SCORE_PLATFORM='miniapp'`，链接走 `scoreListHref()` / `mpScoreHrefForTask()`。

---

## Q7 · 确认页展示

**结论：完整三分 badge + KR 细项**

- 领导/分管在小程序确认
- 员工在 OA 确认（`?role=employee` 展示引导 banner）
- Badge 含「待员工在 OA 确认」

---

## Q8 · 同人合并确认

**结论：一次确认 → 上级 ✓ + 分管 ✓ 同时点亮**

- `mergedReview` 任务在 `score-confirm.js` 中 supervisor 确认同时写入 division 确认态

---

## 废弃 / 重定向页（小程序）

| 页面 | v1.5 行为 |
|------|-----------|
| `task-overdue.html` | → `task-list.html` |
| `task-past.html` | → `task-list.html` |
| `task-progress.html` | → `task-list.html` |
| `task-past-view.html` | → OA `personal-perf-past-view.html` |
| `monthly-wizard.html` / `quarterly-wizard.html` | 保留文件，IA 不暴露，注释标 deprecated |

---

## 验收 URL

| 场景 | URL |
|------|-----|
| 领导待办 | `miniapp/task-list.html` |
| 月度评分 | `leader-score-monthly.html?id=r-lm-202605` |
| 季度评分（分管） | `leader-score-quarterly.html?id=r-wf-2026q2&role=division` |
| 领导确认 | `score-confirm.html?role=leader&id=r-wf-202605` |
| 员工确认（应引导 OA） | `score-confirm.html?role=employee` |

---

## 关联文档

- [VERSIONS.md](./VERSIONS.md) v1.5.0
- [GRILL_WORKFLOW.md](./GRILL_WORKFLOW.md) 月/季流转
- [GRILL_EMPLOYEE_TODO.md](./GRILL_EMPLOYEE_TODO.md) 员工 OA 能力
