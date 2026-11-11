# 演示数据穷举 · 领导评/确认（v1.4.1）

> 数据源：`supervisor-score.js` · `SUBMISSIONS` + `PRESET_SCORES` + `REVIEW_LIST` + `DEPT_ROSTER`

## 月度 · 领导评分页

| taskId | 员工 | phase | 可编辑 | PRESET | 说明 |
|--------|------|-------|--------|--------|------|
| `r-lm-202605` | 李明 | pending_supervisor | ✅ | — | 同人合并待评；L2 三级结构 |
| `r-lq-202605` | 李强 | pending_supervisor | ✅ | — | 总监月表；含加分申报 |
| `r-sl-202605` | 孙丽 | pending_supervisor | ✅ | — | 广州办事处主管；含减分申报 |
| `r-wf-202605` | 王芳 | pending_confirm | ❌ 只读 | ✅ | 已评待确认；分管已改总分 |
| `r-zm-202605` | 张明 | pending_confirm | ❌ 只读 | ✅ | 主管月表已评 |
| `r-zmin-202605` | 赵敏 | pending_confirm | ❌ 只读 | ✅ | 广州主任已评 |

**只读规则**：`status=done` 或 `phase=pending_confirm` 或 `PRESET.supervisorSubmitted` → 整页布局不变，输入框变只读，隐藏提交/退回。

## 季度 · 领导评分页

| taskId | 员工 | phase | 角色 | 可编辑 | PRESET |
|--------|------|-------|------|--------|--------|
| `r-zs-2026q2` | 赵强 | pending_supervisor | 上级 | ✅ | — |
| `r-lm-2026q2` | 李明 | pending_supervisor | 上级（合并） | ✅ | — |
| `r-wf-2026q2` | 王芳 | pending_division | 分管 | 分管列 | 上级✅ |
| `r-hm-2026q2` | 韩梅 | pending_confirm | — | ❌ 只读 | 上级+分管✅ |

## 确认页 · score-confirm

任意 `SUBMISSIONS` 中有数据的 `taskId` 均可通过 `?id=` 打开；无 `TASK_META` 时自动从 `header` 构建标题。

| 典型 URL | 场景 |
|----------|------|
| `?id=r-wf-202605&role=employee` | 月度员工确认 |
| `?id=r-wf-202605&role=leader` | 月度上级确认 |
| `?id=r-zm-202605&role=leader` | 张明主管确认 |
| `?id=r-zmin-202605&role=leader` | 广州赵敏确认 |
| `?id=r-hm-2026q2&type=quarter&role=supervisor` | 季度上级确认（含分管列） |

## 无 SUBMISSIONS（刻意缺失）

| 工号 | 员工 | phase | 表现 |
|------|------|-------|------|
| E10044 | 肖洋 | filling | 未提交，无评分页数据 |
| E10042 | 刘洋 | filling | HR 计划明细「未提交」 |

## HR 待办详情 · perf-task-detail

| 工号 | taskId | 完整 KR 明细 |
|------|--------|--------------|
| E10035 | r-wf-202605 | ✅ |
| E10021 | r-zm-202605 | ✅ |
| E10008 | r-lq-202605 | ✅ |
| E20011 | r-zmin-202605 | ✅ |
| E20018 | r-sl-202605 | ✅ |
| E10055 | r-zt-202605 | ✅（已 confirmed · 行政经理月表） |
| E10048 | null | 仅摘要（已 confirmed 旧档） |
