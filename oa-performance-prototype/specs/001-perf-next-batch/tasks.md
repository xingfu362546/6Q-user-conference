# Tasks: 绩效下版本原型

**Input**: `specs/001-perf-next-batch/plan.md`

## Phase 1: 计分

- [x] T001 新增 `oa-performance-prototype/prototype/assets/perf-quarter-score.js`，样例核定总分 89.2
- [x] T002 用 `perf-quarter-score.test.js` 核对专项封顶、档次和减分

## Phase 2: 填写与确认

- [x] T003 季度向导增加专项激励、减分、下季 3–5 条、预览和保存
- [x] T004 月度向导只加预览和保存，不出现专项激励
- [x] T005 确认页正文 14px，并展示 HR 最终总分与专项档次

## Phase 3: HR

- [x] T006 计划明细显示处理人，支持退回、失效、恢复、改总分、导出图片
- [x] T007 计划列表可编辑名称和四个时间
- [x] T008 新增评价人维护页，CSV 按工号整批校验

## Phase 4: 评分页

- [x] T009 上级月度、季度评分页增加保存和导出图片

## 开发任务（front / backend，评审后补）

> 上面 T001–T009 是原型任务。下面按 [dev-delivery.md](dev-delivery.md) 拆，接口见 [contracts/api.md](contracts/api.md)。

- [ ] D01 计分口径：季度去分管 0 分回退，月度固定 20/80，精度 BigDecimal
- [ ] D02 保存不覆盖核定分：草稿字段与业务字段分离
- [ ] D03 有效分快照：退至写快照，查询/导出/奖金只取有效分
- [ ] D04 专项表与接口：三方分、最终得分、档次、追加
- [ ] D05 专项评分页（领导季度）和专项核定区（HR 待办详情）
- [ ] D06 评价关系表 + 存量回填 + 发放取值 + 整批导入
- [ ] D07 本期名单快照 + 失效/恢复 + 影响面过滤
- [ ] D08 计划编辑校验、影响人数预检、操作日志
- [ ] D09 导出整表接口与前端入口（HR、领导）
- [ ] D10 权限与幂等：后端取角色、状态机校验、重复提交
- [ ] D11 结果列表加专项/档次/金额/采用分，季度隐藏加分列
- [ ] D12 下线分管改总分并切换采用分口径：停用 `adjustTotal`，`final_total`/`division_adjusted` 转只读；确认状态机季度不再要求 `division_confirmed`，逾期自动确认只置员工位；结果/奖金/历史/导出统一读 `hr_final_score ?? system_total`；出历史对账清单（见 dev-delivery 迁移二）
- [ ] D13 季度填表面谈步下线：删步骤与校验，历史 `perf_task_interview` 保留只读，不在本期页面与导出中输出