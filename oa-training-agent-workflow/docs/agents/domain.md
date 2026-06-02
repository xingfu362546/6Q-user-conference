# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root of this worktree (`oa-training-agent-workflow/CONTEXT.md`)
- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## OA 培训模块（与上级原型）

本目录主要承载 **Agent 工作流配置**；**页面级需求、导航顺序、版本与功能矩阵** 的权威说明在上级目录：

- `../oa-training-prototype/DEVELOPER_HANDOFF.md` — 开发者交接、§4 功能清单、阅读顺序
- `../oa-training-prototype/index.html` — 需求矩阵与原型导航

在写 issue 标题、验收标准或测试命名时，术语尽量与上述文档及本目录 `CONTEXT.md` 中的词汇一致。

## File structure

Single-context repo (this worktree):

```
oa-training-agent-workflow/
├── CONTEXT.md
├── docs/adr/
└── .scratch/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
