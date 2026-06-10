# OA 内部绩效 · Agent 工作区

本文件服务于 `oa-performance-prototype`：通过 Grill-me / Superpowers 流程完成绩效信息化原型设计，再输出 HTML 原型。

## 工作方式

1. **先设计后实现**：在 `docs/superpowers/specs/` 中的 spec 经用户批准前，不写页面实现代码。
2. **一次一问**：业务澄清按决策树逐题进行，答案记入 `DESIGN_SESSION.md`。
3. **双端矩阵**：页面清单需标注「小程序 / OA 应用 / 双端」及角色（被考核者、直接上级、HR、部门负责人等）。

## 域文档

- 词汇与范围：`CONTEXT.md`
- Grill 记录：`DESIGN_SESSION.md`
- 决策：`docs/adr/`

## 原型约定（实现阶段启用）

- 小程序页：移动视口 HTML，宽度约 375px，独立入口或 `miniapp/index.html` 矩阵。
- OA 应用页：桌面侧栏布局，参考现有 OA 原型风格；入口 `oa-app/index.html` 矩阵。
