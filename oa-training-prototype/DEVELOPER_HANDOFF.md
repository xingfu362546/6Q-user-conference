# OA 培训学习模块 · 开发者交接说明

> **文档版本**：`2026.05.2` · 与根目录 `CHANGELOG.md` **[1.2.0]** 对齐（见该文件「发布命名约定」与版本小节）。  
> **文档用途**：开发 clone / pull 后建议**先读本文 §1～§4**，再按 §3 顺序打开 HTML；对照页内 `proto-note`、HTML 注释、`window.PAGE_NOTES` 与演示键落地实现。  
> **范围**：`oa-training-prototype/` 下培训学习可点击原型；文末 §9 为仓库外历史文件说明。

---

## 1. 版本与发布命名（Push 前必读）

### 1.1 与功能清单的关系

- **版本号**：语义化 `v主.次.修订`（例 `v1.2.0`），与 **Git 注解标签**一致。  
- **版本名称**（对外可读、建议写入 Codeup 发布说明）：`YYYY.MM-主题短语`，例：`2026.05-培训学习交付迭代3`。  
- **每次 Push 对外可交付时**：更新根目录 `CHANGELOG.md` → 更新本文 **§4 功能清单表** 中「首次纳入版本」列（若有新行）→ `git tag -a vX.Y.Z -m "版本名称: …"` → `git push origin main` 且 `git push origin vX.Y.Z`。  
- **权威关系**：`index.html` 中矩阵为需求**原文摘要**；**是否「迭代 / 新增」及首次纳入版本**以 **本文 §4** 与 **`CHANGELOG.md`** 为准（避免仅看 HTML 产生定义偏差）。

### 1.2 需求性质标识（开发定义用）

| 标识 | 含义 | 开发理解要点 |
|------|------|----------------|
| **迭代** | 在既有 **培训学习** 业务域内，对原有流程/页面做能力或字段增强 | 在现有模块与接口上扩展；注意兼容旧数据、旧入口与权限 |
| **新增** | **新模块**或原 Excel 清单**未单独成行**的端到端能力 | 新路由、新表结构、新消息/定时任务等需**单独拆需求单与接口契约** |

---

## 2. 文档与代码位置

| 项目 | 路径 |
|------|------|
| **变更记录 / 发版约定** | `CHANGELOG.md`（仓库根目录） |
| **本交接文档** | `oa-training-prototype/DEVELOPER_HANDOFF.md` |
| **仓库根说明** | `README.md` |
| **原型总入口（功能清单矩阵）** | `oa-training-prototype/index.html` |
| **设计变量** | `oa-training-prototype/css/tokens.css` |
| **管理端 / 员工端壳** | `css/oa-shell-admin.css`、`css/oa-shell-emp.css` |
| **侧栏说明** | `js/page-notes.js` + 各页 `window.PAGE_NOTES` |
| **考试演示** | `js/exam-proto.js` |
| **物料批量下载（原型）** | `js/mat-batch-download.js` |

---

## 3. 推荐阅读顺序（整体解析流程）

与 `index.html`「原型页面导航」序号一致：

```text
index.html（读 §4 与矩阵 + 导航）
    ↓
0  oa-iter-shell-framework.html（可选）
    ↓
1  emp-course-detail.html
    ↓
2～3  admin-learning-progress.html（含弹层）
    ↓
4  admin-course-library.html → admin-course-edit.html
    ↓
5  admin-quiz-grading.html
    ↓
6  admin-learning-plan-*.html
    ↓
7  emp-learning-plan.html
```

**深链**：`admin-requirement-detail.html`（`user` / `course` 参数）与弹层语义对齐。

---

## 4. 功能清单 ↔ 需求性质 ↔ 版本 ↔ HTML（**开发定义主表**）

> 与 `index.html` 表格 **序号 1～6** 一致。扩展行不在 HTML 矩阵中，**须单独排期**。

### 4.1 主清单（Excel / index 矩阵）

| 序号 | 需求性质 | 首次纳入版本 | 版本名称（示例） | 一级–三级 | 功能描述（摘要） | 主要 HTML（`oa-training-prototype/`） |
|:----:|:--------:|:------------:|:----------------|-----------|------------------|----------------------------------------|
| 1 | **迭代** | v1.0.0 | `2026.05-培训学习原型基线` | 员工端 / 课程学习 / 课程详情 | 考核标准 Tab、文档跳转 | `emp-course-detail.html` |
| 2 | **迭代** | v1.0.0 | 同上 | 同上 | 过关要求 Tab；考试跳转卷王 | `emp-course-detail.html` |
| 3 | **迭代** | v1.0.0 | 同上 | 后台 / 学习进度 | 列表过关进度、查看明细弹层 | `admin-learning-progress.html` |
| 4 | **迭代** | v1.0.0 | 同上 | 后台 / 学习进度 | 考试详情整卷、页头否决/通过 | `admin-quiz-grading.html` |
| 5 | **迭代** | v1.0.0 | 同上 | 后台 / 课程库 | 编辑课程、过关要求配置 | `admin-course-library.html`、`admin-course-edit.html` |
| 6 | **新增** | v1.1.0 | `2026.05-学习计划模块初版` | 后台+员工 / 学习计划 | 多课程、组织穿梭、通知与临期、参学监控、员工端计划与通关展示 | `admin-learning-plan-list.html`、`admin-learning-plan-form.html`、`admin-learning-plan-monitor.html`、`emp-learning-plan.html` |

### 4.2 清单外扩展（HTML 矩阵未单独成行）

| 扩展 ID | 需求性质 | 首次纳入版本 | 版本名称（示例） | 能力说明 | 页面 / 脚本 |
|---------|:--------:|:------------:|:----------------|----------|----------------|
| E1 | **新增** | v1.2.0 | `2026.05-培训学习交付迭代3` | 物料多附件「批量下载」（原型 ZIP；现网建议服务端打包） | `admin-learning-progress.html`、`admin-requirement-detail.html`、`js/mat-batch-download.js` |
| E2 | **新增** | v1.2.0 | 同上 | 学习进度「导出物料提交（全量员工）」CSV | `admin-learning-progress.html` |
| E3 | **迭代** | v1.0.0 | 基线内深链增强 | 过关要求独立详情页，与弹层同源 | `admin-requirement-detail.html` |
| E4 | **迭代** | v1.0.0 | 基线内集成 | 课程库带参跳转学习进度 | `admin-course-library.html` → `admin-learning-progress.html` |

---

## 5. 各页面需求解析（路径 + 注释来源 + 对接提示）

### 5.1 `index.html` — 总入口

- **功能**：功能清单矩阵（**定义以 §4 为准**）、导航、`PAGE_NOTES`。  
- **页脚**：「已满足/为满足」→ 语义「未满足」；红数字打开侧栏。

### 5.2 `emp-course-detail.html` — 清单 1、2（迭代）

- **`proto-note`**：考试 **`oa_train_exam_override`**；物料 **`oa_train_mat_audit`**；多场会议多行；卷王新窗口。  
- **`PAGE_NOTES`**：过关与审核说明。

### 5.3 `admin-learning-progress.html` — 清单 3 + E1、E2（迭代 + 新增扩展）

- **`proto-note`**：考试 / 物料 / 导出物料全量 / 观看签到配置引用编辑页。  
- **`PAGE_NOTES`**：列表字段、导出规则、弹层操作。  
- **脚本**：`mat-batch-download.js`、`exam-proto.js`。

### 5.4 `admin-requirement-detail.html` — E3（迭代）

- **`proto-note`**：URL 参数；与弹层同源键；物料区含批量下载（E1）。

### 5.5 `admin-quiz-grading.html` — 清单 4（迭代）

- **`proto-note`**、**`?exam=mock`**：见页内脚本与 `exam-proto.js`。

### 5.6 `admin-course-library.html` / `admin-course-edit.html` — 清单 5 + E4（迭代）

- **块注释**：页眉「未创建课程」演示；过关要求模块总规（约 235–243 行）；`tpl-row`（约 287–291 行）。

### 5.7 `oa-iter-shell-framework.html` — 导航 0

- 布局模板，非业务必选。

### 5.8 学习计划子模块 — 清单 6、员工端 7（新增）

| 文件 | 要点 |
|------|------|
| `admin-learning-plan-list.html` | `proto-note`：参学、消息；链表单 / 监控 |
| `admin-learning-plan-form.html` | 无封面；通知条；穿梭框；保存校验 |
| `admin-learning-plan-monitor.html` | 通关状态枚举；`?plan=` |
| `emp-learning-plan.html` | 计划列表通关汇总 + 卡片内课程状态 |

### 5.9 `js/mat-batch-download.js` — E1（新增）

- 头注释；`oaBuildMatFilesHtml`；现网改接口打包。

### 5.10 `js/exam-proto.js`

- 考试演示逻辑；对接后保留否决/通过语义。

---

## 6. 跨页面演示键与本地状态（实现时替换）

| 键 / 概念 | 含义（原型） |
|-----------|----------------|
| `oa_train_exam_override` | 考试是否满足过关的人工覆盖 |
| `oa_train_mat_audit` · `materials` | 物料任务级审核 |
| `localStorage` | 原型跨页同步；**现网改为接口** |

---

## 7. 与产品 / 设计的约定（摘自 `index.html`）

1. 后台视觉：Claude Design 向，留白与层次。  
2. 以功能清单为优先级来源。  
3. 「已满足/为满足」→ 按「未满足」理解。

---

## 8. Git 发版检查清单（替代「仅口头 Push」）

1. `CHANGELOG.md` 已追加 `[x.y.z]` 与**版本名称**一行。  
2. 本文 **§4** 已更新对应行的「首次纳入版本 / 需求性质」（新能力必标 **新增**）。  
3. `git tag -a vX.Y.Z -m "版本名称: YYYY.MM-…"`  
4. `git push origin main` && `git push origin vX.Y.Z`  
5. Codeup 发布说明粘贴**同一版本名称**。

---

## 9. 仓库外或其它说明

| 路径 | 说明 |
|------|------|
| 历史曾存在的根目录静态页（如砍价弹窗 HTML） | 若不在当前 Git 跟踪中，以现仓库 `git ls-files` 为准；与 OA 培训模块独立 |

---

**维护**：变更需求性质或版本时，必须同步 **§4**、**`CHANGELOG.md`**、**Git 标签** 与（可选）**`index.html` 矩阵下方说明**。
