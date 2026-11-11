# Implementation Plan: 绩效下版本（专项激励与日常操作）

**Branch**: `feat/sarishinohara-rhythm`（当前工作分支，未另开分支） | **Date**: 2026-11-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-perf-next-batch/spec.md`

## Summary

季度表用专项激励替换加分项。核定总分只加工作成果、6Q3J 和减分；专项激励单独定档。HR 可以在已确认后改最终总分，确认页用 14px 同时展示原分和采用分。退回只作废确认，输入框里的内容和分数保留。

实现落在现有静态原型上：计分收成一个不依赖页面的模块，填写、评分、确认和计划明细都调用它。自动保存、导出图片、评价人导入各自一个小模块。落点见 [实现落点](diagrams/实现落点.drawio)（[PNG](diagrams/实现落点.png)）。

选择和理由在 [research.md](research.md)。数据在 [data-model.md](data-model.md)。页面和导入约定在 [contracts/](contracts/)。验收步骤在 [quickstart.md](quickstart.md)。

## Technical Context

**Language/Version**: 浏览器里的原生 JavaScript。计分模块同时能被 Node 直接加载，用来核对 89.2 这个样例。

**Primary Dependencies**: 现有原型脚本（`wizard.js`、`perf-review-sheet.js`、`hr-plan.js`、`score-confirm.js`、`supervisor-score.js`）。导出图片使用放在 `prototype/assets/vendor/` 的 `html-to-image`，不依赖构建步骤。

**Storage**: 浏览器本地存储。季度草稿、计划名单、评价关系使用新键。月度草稿键和评分草稿键保持原样。

**Testing**: 计分模块用样例断言。页面按 [quickstart.md](quickstart.md) 在浏览器里点选验收。

**Target Platform**: 用文件方式打开的 OA 页面和小程序页面。桌面宽度为主，确认页字号在小程序确认页同样是 14px。

**Project Type**: 静态 Web 原型。

**Performance Goals**: 选择超越类型后，自评分在 1 秒内更新。手动保存后，保存时间在 3 秒内更新。单张绩效表导出在 1 分钟内完成。

**Constraints**: 不改公司私有源码。月度不增加专项激励。确认页以外不强制 14px。自动保存默认 120 秒，滚动不算新操作。建议金额只展示，不写入奖金发放。

**Scale/Scope**: 一套 OA 加一套小程序。新增 1 个菜单页，改填写、评分、确认、计划列表和计划明细。评价人导入按整批校验，失败则 0 行写入。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` 仍是空模板，没有已确认的项目原则。本次不编造原则，也没有原则可违反。

Phase 0 前：通过。  
Phase 1 后再次核对：设计仍只改现有原型，没有新服务、没有新仓库。通过。

## Project Structure

### Documentation (this feature)

```text
specs/001-perf-next-batch/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── score-rules.md
│   ├── ui-surfaces.md
│   └── evaluator-import.md
├── diagrams/
│   ├── 实现落点.drawio
│   ├── 季度绩效构成.drawio
│   ├── hr-退回节点.drawio
│   └── 待办失效.drawio
└── templates/
    └── 季度绩效考核表1.2-专项激励.xlsx
```

`tasks.md` 不在本阶段生成。

### Source Code (repository root)

```text
oa-performance-prototype/prototype/
├── assets/
│   ├── perf-quarter-score.js      # 新增：核定总分、专项档次、建议金额
│   ├── perf-autosave.js           # 新增：脏标记、2 分钟保存、手动保存
│   ├── perf-export-image.js       # 新增：把整表节点导出为 PNG
│   ├── hr-evaluators.js           # 新增：名单、单条修改、CSV 整批校验
│   ├── vendor/html-to-image.min.js
│   ├── wizard.js                  # 季度步骤、预览、接入保存
│   ├── perf-review-sheet.js       # 专项行、只读预览
│   ├── supervisor-score.js        # 评分留存、保存、导出
│   ├── score-confirm.js           # 采用分、档次、14px 容器
│   ├── hr-plan.js                 # 编辑、退回、失效、改分、处理人、筛选
│   └── oa-perf.css                # 确认页 14px
├── oa-pc/
│   ├── hr-evaluators.html         # 新增
│   ├── hr-plan-list.html
│   ├── hr-plan-detail.html
│   ├── quarterly-wizard.html
│   ├── monthly-wizard.html
│   ├── score-confirm.html
│   └── supervisor-score-*.html
└── miniapp/
    ├── quarterly-wizard.html
    ├── monthly-wizard.html
    └── score-confirm.html
```

**Structure Decision**: 继续用现在的 `oa-pc` 和 `miniapp` 双端静态页。共享行为放在 `prototype/assets`，两端页面引用同一脚本。不新建后端目录，也不把逻辑再抄进小程序一份。

## Complexity Tracking

无。原则文件没有生效条款，设计也没有额外分层。

## Design notes

- 计分入口只有 `perf-quarter-score.js`。样例 79.6 + 10 + (-0.4) 必须得到 89.2。
- 退回改的是待办节点和确认状态。填写文档和评分文档的字段值不动。
- 失效改的是本期参与名单和待办上的失效标记。范围包模板成员不动。
- 评价人导入失败时整批不写。约定见 [evaluator-import.md](contracts/evaluator-import.md)。
- 实现顺序建议先做计分模块和它的样例，再改季度填写，然后是确认页、计划明细、评价人、保存和导出。页面验收按 [quickstart.md](quickstart.md)。
