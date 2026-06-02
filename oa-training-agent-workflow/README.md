# OA 培训 · Agent 工作流配置（独立子项目）

本目录是按 **`setup-matt-pocock-skills`** 搭好的「每仓库一份」配置：`AGENTS.md` 中的 `## Agent skills` 块 + `docs/agents/` 下的 issue 追踪、triage 标签、域文档消费约定。

## 与上级仓库的关系

- 上级 monorepo 根目录：`../`（`testProject`）。
- 培训原型与交接说明：`../oa-training-prototype/`（尤其 `DEVELOPER_HANDOFF.md`、`index.html` 功能矩阵）。

## 怎么用

1. **只跑 OA 相关工单时**：在 Cursor 里将**工作区文件夹**打开为 **`oa-training-agent-workflow`**（本目录），这样 `to-issues` / `triage` / `to-prd` 等技能会读到本目录根的 `AGENTS.md` 与本目录下的 `.scratch/`。
2. **仍从 monorepo 根打开时**：根目录若无 `AGENTS.md`，这些技能可能**看不到**本配置；可把本目录 `AGENTS.md` 里的 `## Agent skills` 整段合并到仓库根的 `AGENTS.md`（若你新建根级 `AGENTS.md`），并把 `docs/agents/` 复制或改为根目录一份，避免两套文档分叉。

## Issue 追踪方式

当前约定为 **本地 Markdown**：工单写在 `.scratch/<feature-slug>/`，详见 `docs/agents/issue-tracker.md`。若日后改为 GitHub / GitLab / Codeup，只改 `docs/agents/issue-tracker.md` 并同步更新 `AGENTS.md` 中对应一行即可。
