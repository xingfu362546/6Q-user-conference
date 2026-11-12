# v1.5.0 开发交付落点

评审（2026-11-12）指出「做什么齐了，怎么算、存在哪、谁有权、改完谁受影响」还缺一层。本文件补齐这四项，配合 [spec.md](spec.md) 的 FR 使用。原型只做演示，正式实现以下表为准。

## 1. 前端页面与入口

| 页面 | 路由（现网 front） | 本期改动 |
| --- | --- | --- |
| 季度填表 | `views/performance/wizardQuarterly.vue` | 步骤 7 → 9，加专项和减分；删下季权重校验；每步加保存和预览 |
| 月度填表 | `wizardMonthly.vue` | 加保存和预览；区块不变 |
| 领导季度评分 | `supervisorScoreQuarterly.vue` | 加专项评分区块（上级、分管两列） |
| 领导月度评分 | `supervisorScoreMonthly.vue` | 加保存、自动保存、导出 |
| 确认页 | `scoreConfirm.vue` | 五项字段；14px（合计区 18px） |
| 计划列表 | `planList.vue` | 加编辑入口、影响人数提示 |
| 计划明细 | `planDetail.vue` | 处理人现算、筛选、退至、失效、恢复、改分、导出 |
| 待办详情 | `hrTaskDetail.vue` | 加专项核定区（人才开发部终评、改档、追加） |
| 评价人维护（新） | `evaluatorList.vue` | 全员名单、单条改、CSV 导入导出 |
| 结果明细 | `resultsList.vue` | 加专项档次金额和采用分；季度隐藏加分列 |

## 2. 后端

| 模块 | 位置 | 改动 |
| --- | --- | --- |
| 计分 | `PerfTaskManagerImpl.calcSystemTotal` | 季度去掉 `div > 0` 回退；月度固定 20/80；精度改 BigDecimal 最后取 1 位 |
| 保存 | `saveDraft` / `scoreTask` | 草稿只写草稿字段；不再 `setFinalTotal(systemTotal)` |
| 退回 | `case "return"` | 加状态校验；记录目标节点和原因；写有效分快照 |
| 失效 | 新增 | 待办标记 + 本期名单快照移除；已完成拒绝 |
| 计划 | `PerfPlanManagerImpl` | 编辑校验、名称唯一、发放取评价关系表 |
| 评价人 | 新增 | 关系表 CRUD、整批校验、存量回填 |
| 导出 | 新增 | 按任务模板快照组装整表结构 |

## 3. 表与迁移

- 新增 `perf_evaluator_relation`（employee_no、evaluator_no、updated_by、updated_at）。
- 新增 `perf_plan_roster`（plan_id、employee_no、status、removed_reason、removed_at），发放时从范围包复制。
- 新增 `perf_task_incentive`（task_id、objective、result、type_id、self_score、supervisor_score、division_score、hr_final_score、final_score、attachment_url）。
- 新增 `perf_task_score_snapshot`（task_id、version、node、payload_json、valid、created_by、created_at）。
- `perf_task` 加 `invalid`、`invalid_reason`、`invalid_at`、`hr_final_score`、`hr_final_reason`、`draft_saved_at`、`current_handler_no`。
- 迁移：先用现有 `perf_task.supervisor_id` 最近一期回填关系表；冲突列清单人工确认。先只读跑一轮，比对完成率分母。

## 4. 灰度与回滚

- 计分改口径按计划灰度：同一时间只有一种算法生效，禁止新旧混算。
- 回滚只回代码，不回数据；快照表保留，回滚后不再读。
- 上线前用 `contracts/score-rules.md` 的 7 个样例跑三处（前端、后端、导出）比对。

## 5. 原型占位说明

原型里的 `prompt`、`alert`、`localStorage` 都是演示占位。正式实现一律换成弹窗和接口，不要照抄。已改掉的占位：退至、失效、恢复、改总分、计划编辑；仍保留演示数据：专项申报行、6Q3J 分数。
