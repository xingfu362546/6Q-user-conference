# 6Q 会务 · 学员意向分析

意向分析四端原型收纳在 **`6q-intent-suite/`**。

## 入口（Cloudflare 首页）

| 路径 | 说明 |
|------|------|
| [`index.html`](index.html) | **Cloudflare 首页 / 全量功能清单**（用户标签、会务后台、会务 APP 全部展开） |
| [`6q-intent-suite/index.html`](6q-intent-suite/index.html) | 套件内折叠式功能清单 |

## 版本一览（本次交付）

| 端 | 版本 | 目录 | 原型入口 |
|----|------|------|----------|
| 功能清单总页 | **v1.0.4 当前封版** | `6q-intent-suite/` | `index.html` |
| 面谈官门户 | **v1.0.4**（大型分析助手增量） | `6q-intent-suite/6q-interviewer-portal/` | `login.html`（引导 `hub.html`） |
| 会务后台 PC | **v1.0.0～v1.0.4** | `6q-intent-suite/6q-conference-prototype/` | `versions.html` |
| 会务 APP | **v1.0.0+** | `6q-intent-suite/6q-conference-app-prototype/` | `home.html` |
| 用户标签平台 | **v1.1**（NL→SQL） | `6q-intent-suite/user-tag-admin/` | `tag-list.html`（导航 `home.html`） |

## 开发交接

[`docs/course-student-intent/HANDOFF-DEV-v1.0.0-v1.0.3.md`](docs/course-student-intent/HANDOFF-DEV-v1.0.0-v1.0.3.md)

## 本地预览

```bash
npx serve .
# 打开 / 或 /6q-intent-suite/
```

## Cloudflare Pages

| 配置项 | 值 |
|--------|-----|
| Production branch | 建议 `feature/conference-intent` 或 `main`（以 Pages 项目配置为准） |
| Build output directory | `/` |

根 `index.html` 直接渲染全量功能清单；各原型链接指向 `6q-intent-suite/` 内实际页面。
