# OA 培训 · Agent 工作区

本文件服务于 `oa-training-agent-workflow` 子项目：培训模块的需求拆解、工单与 triage 与上级 `oa-training-prototype` 原型/交接文档配合使用。

## Agent skills

### Issue tracker

工单以本地 Markdown 形式存放在本目录 `.scratch/<feature-slug>/`（无远程 GitHub Issues 依赖）。详见 `docs/agents/issue-tracker.md`。

### Triage labels

使用与 `triage` 技能一致的五个角色字符串映射；默认与 canonical 名称一致。详见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文：本目录根 `CONTEXT.md` + `docs/adr/`；业务细节与页面矩阵以上级 `oa-training-prototype` 为准。详见 `docs/agents/domain.md`。
