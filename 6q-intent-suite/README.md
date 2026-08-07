# 6Q 意向分析 · 原型套件

本目录打包四端子项目；**套件内仅有一个 `index.html`**（本目录根），即功能清单总页。

## 入口

打开 [`index.html`](./index.html)（或仓库根跳转页）。

## 子项目

| 目录 | 说明 | 原型入口 |
|------|------|----------|
| `6q-interviewer-portal/` | 面谈官门户 | `login.html`（引导页 `hub.html`） |
| `6q-conference-app-prototype/` | 会务 APP | `home.html` |
| `6q-conference-prototype/` | 会务后台 PC | `versions.html` |
| `user-tag-admin/` | 标签系统 | `tag-list.html`（导航 `home.html`） |

跨端资源引用使用相对路径（子项目互为兄弟目录）。
