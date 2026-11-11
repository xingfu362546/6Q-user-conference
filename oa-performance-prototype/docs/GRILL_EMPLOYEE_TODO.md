# GRILL · 员工待办 × 流转状态

> **日期**：2026-06-03 · **原型 v1.4.0** · 实现：`employee-tasks.js`

## 三分段与 phase 归属

| Tab | 包含 phase | 员工可操作 |
|-----|------------|------------|
| **当前待办** | not_started, filling, pending_supervisor, pending_division, pending_confirm | 填表 / 确认 / 查看进度 |
| **逾期** | not_started, filling（+ 逾期角标） | 已解锁可填；待解锁置灰 |
| **已提交** | confirmed | 只看自填内容 |

**不进当前待办**：confirmed → 已提交 Tab 归档。

## 当前待办 · 演示行（王芳）

| phase | 演示任务 | 操作 |
|-------|----------|------|
| pending_confirm | 2026年5月 | 确认评分 |
| filling | 2026年4月 | 继续填写 + 快速带入 |
| not_started | 2026年6月 | 开始填写 |
| pending_supervisor | 2026年3月 | 查看进度 + **查看自填内容** |
| pending_division | 2026 Q2 | 查看进度 + **查看自填内容** |

## 操作映射

| phase | 主操作 |
|-------|--------|
| not_started | 开始填写 → wizard |
| filling | 继续填写 + 快速带入（月） |
| pending_supervisor / pending_division | 查看进度 + **查看自填内容** → past-view |
| pending_confirm | 确认评分 + **查看自填内容** → score-confirm / past-view |
| confirmed | 查看自填 → personal-perf-past-view.html |

## 待决（Grill 议题）

### Q1 · 提交后进哪个 Tab？✅ 已定：A

员工向导提交后（`pending_supervisor` 起）**留在「当前待办」**，直到 `confirmed` 才归档至「已提交」。

- 「当前待办」= 仍需员工关注或操作（含待评、待确认）
- 「已提交」= 流程终态归档，仅回看自填内容

### Q2 · 待评阶段能否看分？✅ 已定：A

`pending_supervisor` / `pending_division` 阶段员工**不可见**上级/分管分数；进度页仅步骤条 + 等待文案。分数仅在 **`pending_confirm`** 进入确认页后展示。

### Q3 · 「已提交」Tab 是否改名？⏸ 暂定不改

保持 segment 文案 **「已提交」**（v1.1 习惯）；Tab 内实际仅 `confirmed` 归档，靠提示条说明「流程已结束 · 仅回看自填」。后续若用户反馈混淆再改「已确认」。

### Q4 · 逾期 Tab 包含哪些任务？✅ 已定：A（含填写中未提交）

**凡过员工填表截止、且尚未提交向导的任务，均属逾期**，包括：

- `not_started` — 从未开始填写  
- `filling` — 填写一半、有草稿但**未点提交**  

**不进逾期**：已提交后的任意 phase（`pending_supervisor` / `pending_division` / `pending_confirm` / `confirmed`）。确认超时由 HR 结果列表处理，员工逾期 Tab v1 不覆盖。

分段规则：`deadline < now` 且 `phase ∈ {not_started, filling}` → **逾期 Tab**；否则未归档任务在 **当前待办**。

### Q5 · 列表是否展示确认 badge？✅ 修订：仅 phase 标签

待办**列表**状态列只展示一个 phase 标签（如「待确认」）；员工/上级/分管确认细节**仅在确认页**展示 badge，列表不重复堆叠。

### Q6 · 小程序列表 badge？✅ 同上

小程序卡片与 OA 一致：列表仅「待确认」标签 + 步骤条；点进 `score-confirm.html` 再看确认详情。

### Q7 · 提交后能否回看自填详情？✅ 已定：A（v1.4.2）

**范围**：仅员工自填快照（KR / 行为 / 加减分 / 下月·下季目标 / 自评总结）；**不含**上级/分管分（Q2 不变）。

**载体**：独立页 `personal-perf-past-view.html` / `task-past-view.html`；进度页与待办列表提供入口。

**形态**：L2→L3 折叠卡，与领导 v1.4.1 确认页同源 `renderKrReadonly`；月/季与归档回看**同一渲染器、同一数据源映射**。

**phase**：`pending_supervisor` 起可进入；`filling` 半稿仍走 wizard。
