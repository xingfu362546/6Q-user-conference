# HANDOFF · v1.4.0（月/季流转定稿）

> **日期**：2026-06-03  
> **基线**：v1.3.0  
> **决策来源**：[GRILL_WORKFLOW.md](./GRILL_WORKFLOW.md)

## 交付摘要

1. **工作流引擎**：`perf-workflow.js` 月/季分轨步骤链、`isFullyConfirmed`、`canAdjustDivisionTotal`、`applyTotalAdjustClearConfirm`
2. **月度流转修正**：上级提交 → **直接待确认**（不等分管）；分管仅改核定总分、无确认按钮
3. **季度流转**：非同人含「待分管评」；已确认 = 员工 + 上级 + **分管** 三方均 ✓
4. **确认页**：`score-confirm.js` 月/季 mock、`renderConfirmBadges`、季度 `?type=quarter&role=division`
5. **待我审核**：改总分弹窗接入全 ✓ 禁用 + 改分清零已确认方
6. **小程序/HR 列表**：步骤条传 `type`/`mergedReview`；筛选含「待填写」；终态「已确认」
7. **注释**：`proto-notes-data.js` 各页 v1.4 流转说明

## 阶段枚举

| key | 展示 |
|-----|------|
| `not_started` | 待填写 |
| `filling` | 填写中 |
| `pending_supervisor` | 待上级评 |
| `pending_division` | 待分管评（**仅季度·非同人**） |
| `pending_confirm` | 待确认 |
| `confirmed` | 已确认（兼容 `completed`） |

## 入口索引

| 能力 | 入口 |
|------|------|
| 工作流 API | `prototype/assets/perf-workflow.js` |
| 月度确认 | `oa-pc/score-confirm.html?role=employee` |
| 季度确认（分管） | `oa-pc/score-confirm.html?type=quarter&role=division` |
| 月度上级提交 | `oa-pc/supervisor-score-monthly.html?id=r-lm-202605` |
| 季度分管评 | `oa-pc/supervisor-score-quarterly.html?id=r-wf-2026q2&role=division` |
| HR 结果（三分 badge） | `oa-pc/hr-perf-results-list.html` |
| 小程序分轨步骤 | `miniapp/task-progress.html?id=m202605-q` |
| 员工当前待办 | `oa-pc/personal-perf.html`（`employee-tasks.js`） |
| 员工查看进度 | `oa-pc/employee-task-progress.html?id=m202503-wait` |

## 关键规则（实现对照）

| 规则 | 实现点 |
|------|--------|
| 月上级提交 → 待确认 | `nextPhaseAfterSupervisorSubmit` · `initOaMonthlyScorePage` btn-submit |
| 季上级提交 → 待分管/待确认 | 同上 + `initOaQuarterlyScorePage` |
| 改总分清零已 ✓ | `applyTotalAdjustClearConfirm` · `openDivisionAdjustModal` |
| 全 ✓ 后禁改分 | `canAdjustDivisionTotal` · modal disabled |
| 步骤条月5/季6 | `renderPhaseSteps(phase, { task })` |

## 未做 / 待业务

- 后端 phase 状态机与待办推送
- 改总分审计日志
- 逾期角标与 `not_started` 后端判定（从未打开 vs 有草稿）

## 研发接入

**完整开发说明（Task 拆分、字段、API 对照）见 [DEV-GUIDE-v1.4.0.md](./DEV-GUIDE-v1.4.0.md)。**

员工待办 Grill 决策：[GRILL_EMPLOYEE_TODO.md](./GRILL_EMPLOYEE_TODO.md)
