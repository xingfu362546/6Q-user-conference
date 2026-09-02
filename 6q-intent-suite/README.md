# 6Q 意向分析 · 原型套件

本目录打包四端子项目；**套件内仅有一个 `index.html`**（本目录根），即功能清单总页。仓库根 [`../README.md`](../README.md) 与 [`../index.html`](../index.html) 是对外说明和 Cloudflare 首页。

**需求部门：市场部 · 产品负责人：姜玲玲**

## 版本规范

三条产品线各自封 `.0`，之后只加第三个小数点（`v1.1.1` / `v1.2.1` / `v1.3.1`）。历史编号 v1.0.0～v1.0.4 不再作为开发拆分依据。

| 版本 | 产品线 |
|------|--------|
| **v1.1.0** | 标签管理系统 |
| **v1.2.0** | 学员档案 + 分析策略 + 会务后台意向分析 + 会务工作台 APP + 面谈官只读查档 |
| **v1.3.0** | AI 分析助手（会务后台与面谈官门户共用工作台） |

完整「需求描述 / 实现方案 / 页面链接」见 [`index.html`](./index.html) 顶部「版本范围」。

## 入口

打开 [`index.html`](./index.html)。

## 子项目（勿缺）

| 目录 | 本版归属 | 说明 | 原型入口 |
|------|----------|------|----------|
| `user-tag-admin/` | **v1.1.0** | 标签系统（NL→SQL） | `tag-list.html`（导航 `home.html`） |
| `6q-conference-prototype/` | **v1.2.0** 档案/策略/意向 · **v1.3.0** 助手 | 会务后台 PC | `conference-student-intent.html` · `conference-student-profile.html?id=m10009` |
| `6q-conference-app-prototype/` | **v1.2.0** | 会务 APP 工作台 | `home.html` |
| `6q-interviewer-portal/` | **v1.2.0** 只读查档 · **v1.3.0** 助手 | 面谈官门户 | `login.html`（引导页 `hub.html`） |
| `shared/` | — | 页内红点注释 / 结构图 | 被各页引用 |

跨端资源引用使用相对路径（子项目互为兄弟目录）。
