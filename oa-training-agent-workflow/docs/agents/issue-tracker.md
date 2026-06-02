# Issue tracker: Local Markdown

本工作区以 **`oa-training-agent-workflow` 目录为仓库根`** 时，工单与 PRD 以 Markdown 文件落在本目录下的 `.scratch/`。

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The PRD is `.scratch/<feature-slug>/PRD.md`
- Implementation issues are `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## 与 Codeup / 其它系统的关系

若团队正式工单在 **Codeup** 或其它系统，可在此文件追加「权威工单链接」字段约定，或整体替换为本仓库的 GitHub/GitLab 流程；替换后请同步修改根目录 `AGENTS.md` 中 Issue tracker 小节的一行摘要。
