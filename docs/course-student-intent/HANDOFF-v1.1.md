# 课程会务 · 学员意向分析三端 · Handoff v1.1

> **版本**：v1.1（自 v1.0 迭代）  
> **日期**：2026-07-15  
> **仓库**：`xingfu362546/6Q-user-conference`  
> **关联**：`user-tag-admin/LOGIC_ALIGNMENT.md` · `docs/course-student-intent/CONFIRMATION.md` · `index.html`

---

## 1. 本版变更要点（相对 v1.0）

### 1.1 标签圈选：可视化规则 → NL→SQL

| 项 | v1.0 | v1.1 |
|----|------|------|
| 配置方式 | 条件行 / 条件组 / 且或 / 四类规则 | **自然语言**描述意图 |
| 编译 | 规则 DSL → SQL | **智能体**生成 SQL |
| 数据源 | 运营绑定、创建后锁定 | **固定数仓 + 研发表白名单**；页上只读「数据范围」 |
| 确认 | 保存并计算 | **生成 SQL → 解读+预估 → 确认并计算** |
| 例行重算 | 跑规则编译结果 | **复用已确认 SQL**（不每次调 AI） |
| 纠错 | （弱） | 版本内看命中用户，**本版本无效** |

### 1.2 原可视化方案 · 一期不做

- `tag-create.html` 内用 HTML 注释保留原「标签规则」区块说明。
- 脚本仍在仓库：**不加载** — `ut-rule-builder.js` / `ut-rule-options.js` / `ut-table-catalog.js` / `ut-tag-create.js`。
- 新交互：`js/ut-tag-nl.js`。
- 文档标注见 `LOGIC_ALIGNMENT.md`「相对 v1.0 不做 / 暂缓」。

### 1.3 其他已落地（含更早批次，仍属当前原型）

- 三端页面说明：红色序号 dock + 抽屉；结构图按页挂载（`shared/intent-proto-*`）。
- 会务意向抽屉 Tab 合并为「洞察与推荐」。
- 例行更新：每标签独立每日时刻。

---

## 2. Grill 决议（v1.1 NL→SQL，完整表）

| # | 议题 | 结论 |
|---|------|------|
| 1 | 与可视化关系 | 一期仅 NL；原方案注释 + 文档标「一期不做」 |
| 2 | 主流程 | 生成 → 解读/预估 → 确认并计算 |
| 3–4 | 纠错 / 无效 | 版本内无效；**仅本版本剔除** |
| 5–6 | 库表 / UI | 固定连接 + 白名单；数据范围只读 |
| 7 | SQL 契约 | 只读；仅 `member_id` 一列 |
| 8 | 例行 | 固化 SQL；改意图才重生 |
| 9–10 | 布局 / 按钮 | 双栏；保存草稿 / 生成 SQL / 确认并计算 |
| 11 | 更新方式 | 手动 / 例行每日（无实时查询） |
| 12 | 脏状态 | 改 NL → 告警 + 禁用确认 |
| 13 | 版本详情 | Tab：命中用户｜本次 SQL |
| 14 | 右栏 | SQL + 人话解读 + 预估人数 |

---

## 3. 关键路径

| 用途 | 路径 |
|------|------|
| 标签新建/编辑（NL） | `user-tag-admin/tag-create.html` |
| NL 交互脚本 | `user-tag-admin/js/ut-tag-nl.js` |
| 执行历史（无效 + SQL Tab） | `user-tag-admin/tag-history.html` · `js/ut-tag-history.js` |
| 逻辑对齐 | `user-tag-admin/LOGIC_ALIGNMENT.md` |
| 功能清单入口 | `index.html`（眉题 **Feature Spec · v1.1**） |
| 结构图数据 | `shared/intent-proto-architecture.js` |
| 产品方案 | `docs/course-student-intent/CONFIRMATION.md` |

---

## 4. 下一代理建议任务

1. 若需真·AI：对接生成接口（失败态参考「SQL 生成失败」Toast）；原型现为前端 mock。
2. 同步 `index-features.js` 中「规则构建」类说明为 NL→SQL 文案（部分已偏旧）。
3. 会务侧无需改圈选 UI；继续只读消费最近成功快照（注意本版本无效后人数口径）。
4. **不要**在未评审前恢复可视化规则器或引入「实时查询」。

### 建议技能

- 改交互/文案：直接改 HTML/JS；大需求用 `grill-me`。
- 收尾交接：本文件 + `LOGIC_ALIGNMENT.md`。
- 推远程：先确认远端（本仓 `origin` = GitHub）。

---

## 5. 版本号

| 制品 | 版本 |
|------|------|
| 三端功能清单 / 原型包 | **v1.1** |
| 上一稳定说明基线 | v1.0（可视化规则圈选） |

后续迭代请新建 `HANDOFF-v1.2.md`（或补本文件变更段）并同步改 `index.html` 眉题与 `LOGIC_ALIGNMENT.md` 版本行。
