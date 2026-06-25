# HANDOFF · v1.3.0（评审后原型增量）

> **日期**：2026-06-03  
> **基线**：v1.2.0  
> **决策来源**：[GRILL_V1.3.md](./GRILL_V1.3.md)

## 交付摘要

1. **分管改总分**：`division-dept-list.html` 部门待办；改分后标记「分管已调整」→ 待确认  
2. **评分确认页**：`score-confirm.js` 模块表格 + 折算汇总  
3. **HR 详情**：`perf-task-detail.js` 完整折算区（系统汇总→分管核定）  
4. **填表**：`wizard.js` 考核目标命名与多目标文案（V/X/下月/下季）  
5. **排序**：待我审核、部门待办按自评总分  
6. **导出**：`hr-perf-results.js` 汇总列占位弹窗  
7. **注释**：`proto-notes.css` 版本差异样式；各页 v1.3 注释含 v1.1 划线对比  

## v1.4.0 增量（见 [HANDOFF-v1.4.0.md](./HANDOFF-v1.4.0.md)）

- `perf-workflow.js` 月/季分轨与改分规则  
- 月度上级提交直进待确认；季度三分确认  
- 确认页 / 待我审核 / HR 结果 / 小程序步骤条同步  

## 入口索引

| 能力 | 入口 |
|------|------|
| 评分确认（表格） | `oa-pc/score-confirm.html?role=employee` |
| 分管部门待办 | `oa-pc/division-dept-list.html` |
| 待我审核（排序） | `oa-pc/supervisor-review-list.html` |
| HR 详情（折算） | `oa-pc/hr-task-detail.html?no=E10035&from=plan` |
| 多考核目标填表 | `oa-pc/monthly-wizard.html` Step1/2/5 |
| 结果导出占位 | `oa-pc/hr-perf-results-list.html` → 导出 |

## 原型注释约定

- `<span class="proto-ver-tag">v1.1</span>` + `.proto-ver--old`：旧版说明（灰色删除线）  
- `<span class="proto-ver-tag">v1.3</span>` + `.proto-ver--new`：现版说明（绿色）  

## 未做 / 待业务

- 导出 Excel **正式模板**  
- 分管改总分 **后端审计日志**  
- 多考核目标 **数据模型迁移**（原型仍用 `coreKrs[]`，语义=考核目标列表）  
