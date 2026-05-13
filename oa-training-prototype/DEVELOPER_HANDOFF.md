# OA 培训学习模块 · 开发者交接说明

> **文档用途**：开发同学 clone / pull 本仓库后，建议**先阅读本文**，再按「推荐阅读顺序」打开对应 HTML 原型，对照页面内 `proto-note`、HTML 注释、`window.PAGE_NOTES` 与脚本中的演示键实现真实后端与前端工程。  
> **范围**：以 `oa-training-prototype/` 目录下**培训学习**相关可点击原型为主；文末简要列出仓库根目录其它静态页（非本模块核心）。

---

## 1. 文档与代码位置（请先确认）

| 项目 | 路径 |
|------|------|
| **本交接文档** | `oa-training-prototype/DEVELOPER_HANDOFF.md` |
| **原型总入口（功能清单 + 导航）** | `oa-training-prototype/index.html` |
| **设计变量（Claude Design 向）** | `oa-training-prototype/css/tokens.css` |
| **管理端壳样式** | `oa-training-prototype/css/oa-shell-admin.css` |
| **员工端壳样式** | `oa-training-prototype/css/oa-shell-emp.css` |
| **侧栏说明抽屉脚本** | `oa-training-prototype/js/page-notes.js`（各页 `window.PAGE_NOTES`） |
| **考试/弹层共用逻辑** | `oa-training-prototype/js/exam-proto.js` |
| **物料批量下载（原型）** | `oa-training-prototype/js/mat-batch-download.js` |

**仓库根目录**（相对 `testProject/`）：其它 HTML/脚本不在本 MD 逐页展开，见 §8。

---

## 2. 推荐阅读顺序（整体解析流程）

建议按业务故事走读，与 `index.html` 中「原型页面导航」序号一致：

```text
index.html（读功能清单矩阵 + 导航说明）
    ↓
0  oa-iter-shell-framework.html（可选：通用后台框架模板）
    ↓
1  emp-course-detail.html（员工：课程详情、考核标准、过关要求）
    ↓
2～3  admin-learning-progress.html（管理：学习进度列表 + 过关弹层）
    ↓
4  admin-course-library.html → admin-course-edit.html（管理：课程库 / 编辑课程与过关配置）
    ↓
5  admin-quiz-grading.html（管理：考试详情整卷阅览 + 页头否决/通过）
    ↓
6  admin-learning-plan-list.html → admin-learning-plan-form.html → admin-learning-plan-monitor.html（管理：学习计划）
    ↓
7  emp-learning-plan.html（员工：我的学习计划）
```

**并行深链（不阻塞主路径）**：

- `admin-requirement-detail.html`：过关要求独立详情页（URL 参数 `user` / `course`），与列表弹层语义对齐。

---

## 3. 功能清单 ↔ HTML 路径 ↔ 实现要点（总表）

> 下列「功能清单」与 `index.html` 内表格 **序号 1～6** 一致；「实现方案」列在页面中为表格第六列，此处合并摘要。

| 序号 | 一级 | 二级 | 三级 | 功能描述（原文摘要） | 主要原型页面（相对 `oa-training-prototype/`） |
|------|------|------|------|----------------------|-----------------------------------------------|
| 1 | OA-员工端 | 课程学习 | 课程详情 | 新增「考核标准」Tab：后台维护文档地址，前端跳转查看 | `emp-course-detail.html` |
| 2 | OA-员工端 | 课程学习 | 课程详情 | 「过关要求」Tab：多条件表格、上传入口；考试跳转卷王 | `emp-course-detail.html` |
| 3 | OA-后台端 | 培训学习 | 学习进度 | 列表「过关进度」；「查看」详情展示各过关要求 | `admin-learning-progress.html`（弹层同页） |
| 4 | OA-后台端 | 培训学习 | 学习进度 | 考试详情页：整卷阅览；页头总分 + 否决/通过 | `admin-quiz-grading.html` |
| 5 | OA-后台端 | 培训学习 | 课程库 | 新建/编辑课程维护过关要求项及条件 | `admin-course-library.html` → `admin-course-edit.html` |
| 6 | OA-后台 / 员工端 | 培训学习 | 学习计划 | 多课程 + 组织穿梭；通知与临期催办；参学通关监控；员工端计划与课程归属 | `admin-learning-plan-*.html`、`emp-learning-plan.html` |

**清单外已落地的扩展能力（建议在评审/拆任务时单列）**：

| 能力 | 页面 / 脚本 | 说明 |
|------|----------------|------|
| 物料多附件批量下载（原型 ZIP） | `admin-learning-progress.html`、`admin-requirement-detail.html` + `js/mat-batch-download.js` | ≥2 附件时显示「批量下载」；现网建议改服务端打包 |
| 学习进度 · 全员物料导出 CSV | `admin-learning-progress.html` | 按钮「导出物料提交（全量员工）」；列与 `oa_train_mat_audit` 等对齐需求见页内说明 |
| 过关详情独立页 + 物料审核同源 | `admin-requirement-detail.html` | `localStorage` 键 `oa_train_mat_audit` 与弹层演示一致 |
| 课程库带参跳转学习进度 | `admin-course-library.html` → `admin-learning-progress.html` | URL：`courseId`、`courseName`、`filterPass` 等（见学习进度页脚本） |

---

## 4. 各页面需求解析（路径 + 注释来源 + 对接提示）

### 4.1 `index.html` — 总入口

- **功能**：功能清单矩阵（§3）、原型导航链接、`window.PAGE_NOTES` 抽屉（说明 1、2）。
- **页脚注释**：「已满足/为满足」语义上按「未满足」理解；红数字 pin 打开侧栏说明。
- **开发注意**：真实系统可保留本页作「需求导航」，或把矩阵迁入 Wiki / 需求系统，链接仍指向各静态原型或替换为正式路由。

---

### 4.2 `emp-course-detail.html` — 员工端 · 课程详情（清单 1、2）

- **对应清单**：考核标准 Tab；过关要求 Tab（考试 / 物料上传 / 观看线下签到）。
- **`proto-note`（页内）**：  
  - 更新时间口径：考试 / 物料 / 观看签到。  
  - 考试是否满足与后台 **`oa_train_exam_override`** 同源。  
  - 物料：**多附件任务级审核**，**`oa_train_mat_audit` · `materials`**。  
  - 多场会议时过关表多行展示。  
  - 「去考试」「重新考试」新窗口卷王。
- **`PAGE_NOTES`**：`data-note-id="1"` 等，抽屉内有过关与审核结果说明（见源码 `window.PAGE_NOTES`）。
- **开发注意**：Tab 与表格列与后台编辑页、学习进度弹层字段语义对齐；外链考核标准 URL 应由课程配置下发。

---

### 4.3 `admin-learning-progress.html` — 后台 · 学习进度 + 过关弹层（清单 3）

- **列表**：考试分数为单场总分/满分；过关进度、过关状态更新时间、「查看」打开弹层。
- **`proto-note`（页脚）**：考试否决/通过演示键 **`oa_train_exam_override`**；物料 **`oa_train_mat_audit`**；观看/线下签到配置见 `admin-course-edit.html`；**导出物料提交（全量员工）** 的 CSV 列与全量行逻辑说明。
- **弹层**：`#detail-overlay` 内表格与 `admin-requirement-detail.html` 一致；含考试行、物料行、观看/线下签到行。
- **`PAGE_NOTES`**：三节（本页管理问题、列表字段、过关明细要办的事）；第二节含 **导出物料提交** 规则。
- **URL 参数**：`courseId`、`courseName`、`filterPass` 等 — 从课程库「通关人数」等入口带入时展示 `lib-filter-banner` 并参与筛选（见页内脚本 `readUrlFilter` / `applyTableFilters`）。
- **脚本**：`js/mat-batch-download.js`、`js/exam-proto.js`。
- **开发注意**：导出当前为前端生成 CSV + 示意附件列；**现网应接批量接口**。弹层与详情页、考试页状态需与同一学员-课程维度一致。

---

### 4.4 `admin-requirement-detail.html` — 过关要求独立详情（深链，清单 3 辅助）

- **`proto-note`**：`user` / `course` URL 参数对接；**`oa_train_exam_override`**、**`oa_train_mat_audit`**；观看/线下签到规则见 `admin-course-edit.html`。
- **物料区**：通过 `oaBuildMatFilesHtml` 引入批量下载条（附件 ≥2）。
- **开发注意**：用于通知/工单中的直达链接；数据接口应与弹层同源。

---

### 4.5 `admin-quiz-grading.html` — 考试详情 / 阅卷（清单 4）

- **`proto-note`**：页头考试总分为业务汇总；否决/通过与学习进度弹层同源 **`oa_train_exam_override`**；主观题调分不在本页演示。
- **查询参数**：`?exam=mock` 与默认 `final` 切换归档卷示意（见页内脚本注释）。
- **脚本**：`js/exam-proto.js`。
- **开发注意**：按题号顺序展示答卷；页头操作需回写过关条件满足状态。

---

### 4.6 `admin-course-library.html` — 课程库列表（清单 5 入口）

- **功能**：课程列表、通关人数链接到 `admin-learning-progress.html` 带参筛选等（见页面链接）。
- **开发注意**：「编辑」进入 `admin-course-edit.html`。

---

### 4.7 `admin-course-edit.html` — 编辑课程 + 过关要求配置（清单 5）

- **HTML 块注释（约 158–163 行）**：**页眉「演示：新建课程尚未创建」** — 无正式课程 ID 时与「本课程目录」联动禁用等。
- **HTML 块注释（约 235–243 行）**：**过关要求模块总规** —  
  - 观看/线下签到：`或` 分支 ①目录 vs ②会议签到；目录下本课/其他课；会议多行示例。  
  - 考试：问卷 + 达标分；物料：绑定对象列无操作。  
  - 保存按钮校验。
- **HTML 块注释（约 287–291 行）**：`tpl-row` 模板结构说明（`js-exam-bind` / `js-video-bind` / `js-nobind`）。
- **`PAGE_NOTES`**：`data-note-id="1"` 过关要求抽屉。
- **开发注意**：员工端过关表、学习进度、编辑页三处「观看/线下签到」文案与结构需一致。

---

### 4.8 `oa-iter-shell-framework.html` — 通用框架（导航 0）

- **功能**：新模块可复制壳：顶栏、侧栏、筛选、表格等占位。
- **开发注意**：非业务必选，仅布局参考。

---

### 4.9 学习计划子模块（清单 6 + 员工端 7）

| 文件 | 职责 | 关键注释 / 交互 |
|------|------|-----------------|
| `admin-learning-plan-list.html` | 计划列表 | `proto-note`：参学情况按人×课看通关；消息计划创建与临期；跳转编辑 / 参学情况 |
| `admin-learning-plan-form.html` | 新建/编辑 | **无计划封面**；绿色通知条：保存后通知与临期催办；课程多选、组织穿梭、富文本与字数；保存前校验（原型 `alert`） |
| `admin-learning-plan-monitor.html` | 参学监控 | `proto-note`：已通关 / 在学中 / **未在规定时间通关** 口径；`?plan=` 切换示例计划 |
| `emp-learning-plan.html` | 我的学习计划 | 计划列表表：通关进度与计划完成情况；卡片内每课通关状态与计划徽章 |

**开发注意**：计划与课程、人员、消息中心、过关引擎的关联需在后端建模；前端列表字段与监控页、员工端展示应对齐同一套状态枚举。

---

### 4.10 `js/mat-batch-download.js`

- **文件头注释**：原型用 JSZip CDN；正式环境建议**服务端打包下载**。
- **API**：`window.oaBuildMatFilesHtml(lineHtmlArray)` — 附件 ≥2 时出现「批量下载」工具条。
- **事件**：`.js-mat-batch-dl` 点击生成 ZIP（当前为占位文本文件，文件名取自链接文案）。

---

### 4.11 `js/exam-proto.js`

- **用途**：考试相关 DOM 更新、与学习进度/详情页协同的演示逻辑（具体以源码为准）。
- **开发注意**：替换为真实接口后保留「否决/通过」与 `oa_train_exam_override` 语义。

---

## 5. 跨页面演示键与本地状态（实现时替换）

| 键 / 概念 | 出现位置 | 含义（原型） |
|-----------|-----------|----------------|
| `oa_train_exam_override` | 学习进度弹层、过关详情、考试详情页文案 | 考试是否满足过关的人工覆盖 |
| `oa_train_mat_audit` · `materials` | 同上 + 物料导出 CSV 状态列 | 物料任务级审核状态 |
| `localStorage` 读写 | `admin-learning-progress.html`、`admin-requirement-detail.html` 等 | 原型跨页同步审阅状态；**现网应改为接口** |

---

## 6. 与产品 / 设计的约定（摘自 `index.html` 协作区）

1. 后台视觉：干净、留白、层次清晰（Claude Design 向）。  
2. 迭代以功能清单为优先级来源。  
3. 清单中「已满足/为满足」按「未满足」理解（页脚说明）。

---

## 7. 确认后再执行 Git（由负责人操作）

本文档路径：`oa-training-prototype/DEVELOPER_HANDOFF.md`  

**请你确认**：路径与内容是否满足「开发 pull 后先读 MD 再解析各页」的要求。  

确认无误后，在仓库根目录执行（示例）：

```bash
git add oa-training-prototype/DEVELOPER_HANDOFF.md
git commit -m "docs: 增加 OA 培训学习模块开发者交接说明 DEVELOPER_HANDOFF.md"
git push origin main
```

（若你希望我方 Agent 代为 push，请在确认后明确回复「可以 push」。）

---

## 8. 仓库内其它文件（非本 MD 逐条拆解）

| 路径 | 说明 |
|------|------|
| `kanjia-modal-cultural-quote.html`（若存在于仓库根） | 砍价弹窗 + 6Q经句区 UI 原型，与 OA 培训模块独立 |

---

**文档版本**：与仓库内原型迭代同步；变更功能时请同步更新本 MD 的 §3～§4 与相关 `proto-note` / `PAGE_NOTES`。
