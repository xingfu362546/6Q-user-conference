# 开发指南 · v1.4.0（绩效流转 + 员工待办）

> **读者**：后端 / 前端研发、Task 生成 Agent  
> **原型版本**：v1.4.0 · **定稿决策**：[GRILL_WORKFLOW.md](./GRILL_WORKFLOW.md) · [GRILL_EMPLOYEE_TODO.md](./GRILL_EMPLOYEE_TODO.md)  
> **Handoff**：[HANDOFF-v1.4.0.md](./HANDOFF-v1.4.0.md)

---

## 1. 本版本要解决什么

| 问题 | v1.4 定稿 |
|------|-----------|
| 月度提交后卡在哪 | 上级提交 → **直接 `pending_confirm`**，不等分管核定 |
| 季度分管节点 | 非同人：`pending_supervisor` → **`pending_division`** → `pending_confirm`；同人合并跳过待分管 |
| 终态叫什么 | **`confirmed`**（兼容旧字段 `completed`） |
| 员工待办分几个 Tab | 当前待办 / 逾期 / 已提交（Tab 名暂不改，语义=已确认归档） |
| 列表状态展示 | **仅一个 phase 中文标签**（如「待确认」）；确认细分 badge **只在确认页** |
| 待评阶段能否看分 | **不能**；`pending_confirm` 进确认页后才可见分数 |

---

## 2. 核心模块（按依赖顺序读代码）

| 文件 | 职责 | 正式环境对应 |
|------|------|--------------|
| `prototype/assets/perf-workflow.js` | phase 枚举、月/季步骤链、确认判定、改分规则、UI 步骤条 | **任务状态机服务** + 前端展示 helper |
| `prototype/assets/employee-tasks.js` | 员工三分段列表 mock、渲染、操作路由 | 员工待办 API + 列表页 |
| `prototype/assets/mp-tasks.js` | 小程序同源列表（结构类似 employee-tasks） | 同上（移动端） |
| `prototype/assets/supervisor-score.js` | 上级/分管评分、改总分弹窗、提交后 phase 流转 | 领导评分 + 分管核定 API |
| `prototype/assets/score-confirm.js` | 确认页（月/季、三分 badge、折算汇总） | 确认 API |
| `prototype/assets/hr-perf-results.js` | HR 结果列表、筛选、确认态列 | 结果查询 API |
| `prototype/assets/proto-notes-data.js` | 页面旁注释（业务流程/字段/规则） | 产品说明，**不是**运行时依赖 |

---

## 3. Phase 状态机（后端必须实现）

### 3.1 枚举

```
not_started → filling → pending_supervisor → [pending_division] → pending_confirm → confirmed
                              ↑ 仅季度·非同人
```

| key | 中文 | 说明 |
|-----|------|------|
| `not_started` | 待填写 | 计划已发放，无草稿、未点开始 |
| `filling` | 填写中 | 有草稿或已打开向导 |
| `pending_supervisor` | 待上级评 | 员工已提交填表 |
| `pending_division` | 待分管评 | **仅季度且上级≠分管** |
| `pending_confirm` | 待确认 | 评分完成，等待确认方点确认 |
| `confirmed` | 已确认 | 终态（旧值 `completed` 映射为此） |

### 3.2 流转触发（谁提交 → 下一 phase）

| 事件 | 月度 | 季度（非同人） | 季度（mergedReview） |
|------|------|----------------|---------------------|
| 员工向导提交 | `pending_supervisor` | `pending_supervisor` | 同左 |
| 上级评分提交 | **`pending_confirm`** | `pending_division` | **`pending_confirm`** |
| 分管逐项评提交 | — | `pending_confirm` | — |
| 全部确认方 ✓ | `confirmed` | `confirmed`（需员工+上级+分管） | `confirmed`（员工+上级） |

原型函数对照：

- `PerfWorkflow.nextPhaseAfterSupervisorSubmit(task)`
- `PerfWorkflow.nextPhaseAfterDivisionSubmit()`
- `PerfWorkflow.isFullyConfirmed(task)`

### 3.3 确认方

| 类型 | 必须确认的角色 |
|------|----------------|
| 月度 | `employeeConfirmed` + `supervisorConfirmed` |
| 季度 | 上述 + `divisionConfirmed` |

### 3.4 分管改核定总分

- 月度：分管**不逐项评**，在待我审核弹窗改总分；**无确认按钮**
- 改分条件：`PerfWorkflow.canAdjustDivisionTotal(task)` — 任一方未全 ✓ 前可改
- 改分后果：`applyTotalAdjustClearConfirm` — **仅清零已点确认的一方**，设 `divisionAdjusted=true`
- 全 ✓ 后：改分按钮 disabled

---

## 4. 员工待办 · 三分段规则（后端列表 API 必按此分）

详见 [GRILL_EMPLOYEE_TODO.md](./GRILL_EMPLOYEE_TODO.md)。

| Tab | 筛选条件 | 典型 phase |
|-----|----------|------------|
| **当前待办** | 未 `confirmed` | not_started … pending_confirm |
| **逾期** | `deadline < now` **且** phase ∈ {not_started, filling} | 含半稿未提交 |
| **已提交** | `confirmed` | 归档，只看自填 |

**不进逾期**：已向导提交后的 `pending_*` 与 `confirmed`。

**列表 UI 约定**：每行返回 `phase` + `type` + `mergedReview`；前端只渲染 **一个** `phaseLabel`；步骤条用 `renderPhaseSteps(phase, { task })`。

### 4.1 操作路由（员工端）

| phase | 操作 | 原型 URL |
|-------|------|----------|
| not_started | 开始填写 | `monthly-wizard.html` / `quarterly-wizard.html` |
| filling | 继续填写、快速带入（月） | 同上 |
| pending_supervisor / pending_division | 查看进度（**不展示分数**） | `employee-task-progress.html?id=` |
| pending_confirm | 确认评分 | `score-confirm.html?role=employee` |
| confirmed | 回看自填 | `personal-perf-past-view.html?id=` |

---

## 5. 任务实体建议字段（供 Task / DB 设计）

```typescript
interface PerfTask {
  id: string;
  planId: string;
  assigneeNo: string;          // 员工工号
  type: 'month' | 'quarter';
  phase: PhaseKey;
  mergedReview: boolean;       // 上级=分管

  // 填表
  draftPayload?: object;       // 挂在任务 id，无独立草稿箱
  stepIndex?: number;
  employeeDeadline: string;    // ISO
  submittedAt?: string;

  // 评分
  systemTotal?: number;
  finalTotal?: number;         // 分管核定
  divisionAdjusted?: boolean;

  // 确认
  confirmDeadline?: string;
  employeeConfirmed: boolean;
  supervisorConfirmed: boolean;
  divisionConfirmed: boolean;  // 季度

  // 逾期
  overdueUnlocked?: boolean;   // HR 解锁后 true
}
```

---

## 6. 建议研发 Task 拆分（可直接进 Jira/禅道）

### Epic A · 工作流引擎

- [ ] A1 定义 phase 枚举与 DB 字段；迁移 `completed` → `confirmed`
- [ ] A2 实现 `nextPhaseAfterSupervisorSubmit` / `nextPhaseAfterDivisionSubmit` 服务方法
- [ ] A3 实现 `isFullyConfirmed`、`canAdjustDivisionTotal`、`applyTotalAdjustClearConfirm`
- [ ] A4 单元测试：月/季/合并评三条链路

### Epic B · 员工待办 API

- [ ] B1 `GET /employee/perf/tasks?segment=current|overdue|past` 按 GRILL 规则分段
- [ ] B2 返回 `phase`、`type`、`mergedReview`、截止、操作权限（canFill/canConfirm/canViewProgress）
- [ ] B3 待评阶段 API **不返回**上级/分管分明细
- [ ] B4 逾期：HR 解锁接口 + `overdueUnlocked` 字段

### Epic C · 领导评分与分管

- [ ] C1 月度上级提交 → phase=pending_confirm（异步通知员工+上级确认）
- [ ] C2 季度双列评分；分管提交 → pending_confirm
- [ ] C3 分管改总分 API；改分后清确认态（仅已确认方）
- [ ] C4 全确认后拒绝改分（409 + 文案）

### Epic D · 确认页

- [ ] D1 确认页聚合：模块表 + 折算汇总 + 系统分/核定分
- [ ] D2 员工/上级/分管确认接口；幂等；全部 ✓ 后 phase=confirmed
- [ ] D3 季度分管确认入口（角色=division）

### Epic E · 前端接入（OA + 小程序）

- [ ] E1 替换 `EmployeeTasks.TASK_DATA` / `MP_TASK_DATA` 为真实 API
- [ ] E2 所有 `renderPhaseSteps` 调用传入 `{ type, mergedReview }`
- [ ] E3 列表不展示 confirm badge（仅 score-confirm 页）

---

## 7. 原型演示入口（联调前自测）

| 场景 | URL（相对 `prototype/`） |
|------|--------------------------|
| 员工当前待办（5 种 phase） | `oa-pc/personal-perf.html` |
| 员工逾期 | `oa-pc/personal-perf-overdue.html` |
| 员工归档 | `oa-pc/personal-perf-past.html` |
| 员工进度（不可看分） | `oa-pc/employee-task-progress.html?id=m202503-wait` |
| 员工确认 | `oa-pc/score-confirm.html?role=employee` |
| 工作流 API 控制台 | 浏览器加载任意页后 `PerfWorkflow` |
| 小程序待办 | `miniapp/task-list.html` |
| 待我审核 / 改总分 | `oa-pc/supervisor-review-list.html` |
| HR 结果 | `oa-pc/hr-perf-results-list.html` |

---

## 8. 与功能清单对照

见 [FEATURE_LIST.md](../FEATURE_LIST.md) 文末 **「原型版本调整记录 · v1.4.0」**。

---

## 9. 已知原型局限（正式版需补）

- Mock 数据 OA（`employee-tasks.js`）与小程序（`mp-tasks.js`）**未共用同一 JSON**，联调前需统一 API
- 无 WebSocket/轮询；phase 变更需刷新
- 改总分、确认无审计日志
- `not_started` vs `filling` 仅靠前端 mock，后端需「是否有 draft」判定
