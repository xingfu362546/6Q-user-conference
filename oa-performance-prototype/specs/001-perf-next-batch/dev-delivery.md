# v1.5.3 开发交付落点

评审（2026-11-12）指出「做什么齐了，怎么算、存在哪、谁有权、改完谁受影响」还缺一层；跟进评审（2026-11-16）指出版本口径又改了一轮。本文件补齐这四项，配合 [spec.md](spec.md) 的 FR 使用。原型只做演示，正式实现以下表为准。本文件已按 v1.5.3 更新：季度 8 步、确认页四项、导出 PDF、评价关系含分管。

## 1. 前端页面与入口

| 页面 | 路由（现网 front） | 本期改动 |
| --- | --- | --- |
| 季度填表 | `views/performance/wizardQuarterly.vue` | 步骤 7 → 8，加专项和减分，删「绩效面谈」步；专项横表最多 5 条带附件；下季目标逐条选对标，无权重校验；每步加保存和预览 |
| 月度填表 | `wizardMonthly.vue` | 加保存和预览；区块不变 |
| 领导季度评分 | `supervisorScoreQuarterly.vue` | 加专项评分区块（上级、分管两列，可预览附件）；删面谈只读区；删分管改总分入口 |
| 领导月度评分 | `supervisorScoreMonthly.vue` | 加保存、自动保存、导出 PDF |
| 确认页 | `scoreConfirm.vue` | 四项字段；14px（合计区 18px）；只等员工确认 |
| 计划列表 | `planList.vue` | 加编辑入口（名称 + 四个时间）、影响人数提示 |
| 计划明细 | `planDetail.vue` | 处理人现算（上级/分管分列）、新状态集、按状态退至、失效、恢复、改分、导出 PDF |
| 待办详情 | `hrTaskDetail.vue` | 加专项核定区（人才开发部终评、改档、追加、附件预览） |
| 评价人维护（新） | `evaluatorList.vue` | 组织架构选人（上级、分管两列，本人不可选），CSV 六列导入导出 |
| 结果明细 | `resultsList.vue` | 采用分列；加专项档次金额；季度隐藏加分列 |

## 2. 后端

| 模块 | 位置 | 改动 |
| --- | --- | --- |
| 计分 | `PerfTaskManagerImpl.calcSystemTotal` | 季度去掉 `div > 0` 回退；月度固定 20/80；精度改 BigDecimal 最后取 1 位 |
| 保存 | `saveDraft` / `scoreTask` | 草稿只写草稿字段；不再 `setFinalTotal(systemTotal)`；不得覆盖 `hr_final_score` |
| 退回 | `case "return"` | 按当前状态限定可退节点；记录目标节点和原因；写有效分快照；已完成拒绝 |
| 失效 | 新增 | 待办标记 + 当前计划名单快照移除 + 本次发放范围包移除；已完成拒绝 |
| 计划 | `PerfPlanManagerImpl` | 编辑校验、名称全库唯一、日期解析比较、改到过去二次确认、操作日志、发放取评价关系表 |
| 评价人 | 新增 | 关系表 CRUD（上级 + 分管）、组织树查询、整批校验、存量回填 |
| 分管改分下线 | `PerfTaskManagerImpl.adjustTotal` | 停用；`final_total`、`division_adjusted` 转只读历史字段，不再由分管写入 |
| 确认状态机 | `transitionPhase` 的 `confirm` 分支、`autoConfirmOverdue` | 季度不再要求 `division_confirmed`；逾期自动确认只置员工位；`getReviewList` 不再给分管返回 `pending_confirm` |
| 采用分口径 | `queryResults`、奖金范围、历史查看、导出 | 统一读 `hr_final_score ?? system_total`；结果列表加专项得分/建议档次/建议金额 |
| 导出 | 新增 | 按任务模板快照组装整表结构；前端按 A4 横向打印另存为 PDF（见 FR-026） |
| 专项附件 | 新增 | 对象存储私有读；单文件 2MB、单人合计 4MB；员工、上级、HR 共用同一 URL；HR 核定后可清理 |

## 3. 表与迁移

- 新增 `perf_evaluator_relation`（employee_no、**supervisor_no**、**division_no**、updated_by、updated_at）。
- 新增 `perf_plan_roster`（plan_id、employee_no、status、removed_reason、removed_at），发放时从范围包复制。
- 新增 `perf_task_incentive`（task_id、objective、result、type_id、self_score、supervisor_score、division_score、hr_final_score、final_score、attachment_url）。
- 新增 `perf_task_score_snapshot`（task_id、version、node、payload_json、valid、created_by、created_at）。
- `perf_task` 加 `invalid`、`invalid_reason`、`invalid_at`、`hr_final_score`、`hr_final_reason`、`incentive_tier`、`incentive_tier_reason`、`draft_saved_at`、`current_handler_no`。
- 迁移一：先用现有 `perf_task.supervisor_id` 最近一期回填关系表上级列；分管列先留空，发放时回退部门负责人。冲突列清单人工确认。先只读跑一轮，比对完成率分母。
- 迁移二（v1.5.3 采用分）：`final_total`、`division_adjusted` 保留只读，不再写入。历史任务的对外分数统一按 `hr_final_score ?? system_total` 重算一遍，与旧 `final_total` 的差额出对账清单，供 HR 确认后再切换奖金口径。

## 4. 灰度与回滚

- 计分改口径按计划灰度：同一时间只有一种算法生效，禁止新旧混算。
- 回滚只回代码，不回数据；快照表保留，回滚后不再读。
- 上线前用 `contracts/score-rules.md` 的 7 个样例跑三处（前端、后端、导出）比对。

## 5. 原型占位说明

原型里的 `alert`、`localStorage`、浏览器打印都是演示占位。正式实现一律换成弹窗、接口和服务端渲染或专用 PDF 服务，不要照抄。已改掉的占位：退至、失效、恢复、改总分、计划编辑、评价人选人；仍保留演示数据：6Q3J 分数、HR 待办详情的专项核定行（页面上应标「演示数据」角标）。

