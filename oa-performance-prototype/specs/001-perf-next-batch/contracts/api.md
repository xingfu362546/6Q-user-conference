# Contract: 接口清单（v1.5.0）

只列本期新增或改动的接口。路径沿用现网 `/perf/...` 前缀，具体版本号由开发按工程规范定。所有接口从登录态取操作人和角色，不接受前端传入的角色作为权限依据。

## 待办

| 方法 | 路径 | 入参 | 说明 |
| --- | --- | --- | --- |
| POST | `/perf/task/v1/{id}/return` | targetNode、reason、requestId | 目标节点必须在当前节点之前；重复 requestId 幂等 |
| POST | `/perf/task/v1/{id}/invalid` | reason | 已完成拒绝；写名单快照移除 |
| POST | `/perf/task/v1/{id}/restore` | — | 已在另一张重叠计划的有效名单中则 409 |
| POST | `/perf/task/v1/{id}/hr-final-score` | score、reason | 独立字段；确认状态不变 |
| POST | `/perf/task/v1/{id}/draft` | payload、lastSavedAt | 只写草稿，不落业务表，不碰核定分 |
| GET | `/perf/task/v1/{id}/export-data` | — | 返整表结构，含空区块（按任务模板快照） |
| GET | `/perf/task/v1/{id}/incentive` | — | 专项明细 + 三方分 + 档次金额 |
| PUT | `/perf/task/v1/{id}/incentive/{rowId}` | supervisor、division、hrFinal | 只写当前角色有权的列 |
| POST | `/perf/task/v1/{id}/incentive/append` | typeId(brand/other)、score、note | 人才开发部追加 |
| POST | `/perf/task/v1/{id}/incentive/tier` | tier、reason | 改档，必须原因 |
| POST | `/perf/task/v1/{id}/incentive/{rowId}/attachment` | file | 专项附件，图片或 PDF，≤2MB；员工、上级、HR 共用 |

## 评价人

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/perf/evaluator/v1/list` | 全员名单，支持搜索分页 |
| GET | `/perf/evaluator/v1/org-tree` | 组织架构树，供选人弹窗左栏使用 |
| GET | `/perf/evaluator/v1/org-tree/{deptId}/people` | 该部门人员，支持关键字搜索；供选人弹窗右栏使用 |
| PUT | `/perf/evaluator/v1/{employeeNo}` | 单条改上级和分管；supervisorNo 必填，divisionNo 为空表示清空；都不能是本人 |
| GET | `/perf/evaluator/v1/template` | CSV，UTF-8 带 BOM，六列：员工工号,上级工号,分管工号,员工姓名,上级姓名,分管姓名 |
| POST | `/perf/evaluator/v1/import` | 整批校验，任一行失败则 0 写入，返失败行 |

## 计划

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| PUT | `/perf/plan/v1/{id}/schedule` | 名称、四个时间；返受影响逾期/自动确认人数 |
| GET | `/perf/plan/v1/{id}/roster` | 本期名单与失效人员 |

## 约定

- 状态机非法流转返回 400，文案直接可展示。
- 退至、失效、恢复、改分和导入都带幂等键，重复提交不产生第二条记录。
- 已失效待办：可查看、可导出；催办、评分、退至、改分一律 400。
