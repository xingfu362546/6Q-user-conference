# 6Q 意向分析 · 原型套件

本目录打包四端子项目；**套件内仅有一个 `index.html`**（本目录根），即功能清单总页。

## 入口

打开 [`index.html`](./index.html)（或仓库根跳转页）。

**当前封版：会务 / 门户 v1.0.3（交付范围含 v1.0.0～v1.0.2）· 标签 v1.1**

## 子项目（勿缺）

| 目录 | 版本 | 说明 | 原型入口 |
|------|------|------|----------|
| `6q-interviewer-portal/` | **v1.0.3** | 面谈官门户 | `login.html`（引导页 `hub.html`） |
| `6q-conference-app-prototype/` | **v1.0.0+** | 会务 APP | `home.html` |
| `6q-conference-prototype/` | **v1.0.0～v1.0.3** | 会务后台 PC | `versions.html` |
| `user-tag-admin/` | **v1.1** | 标签系统 | `tag-list.html`（导航 `home.html`） |
| `shared/` | — | 页内红点注释 / 结构图 | 被各页引用 |

跨端资源引用使用相对路径（子项目互为兄弟目录）。

开发交接见仓库 `docs/course-student-intent/HANDOFF-DEV-v1.0.0-v1.0.3.md`。
