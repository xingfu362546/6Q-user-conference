# 6Q 会务 · 学员意向分析

意向分析四端原型收纳在 **`6q-intent-suite/`**。

## 入口（唯一功能清单总页）

| 路径 | 说明 |
|------|------|
| [`6q-intent-suite/index.html`](6q-intent-suite/index.html) | **功能清单总页**（套件内唯一总 index） |
| [`index.html`](index.html) | 仓库根跳转 → 上述总页 |

## 版本一览（本次交付）

| 端 | 版本 | 目录 | 原型入口 |
|----|------|------|----------|
| 功能清单总页 | **v1.0.3 封版**（含 v1.0.0～v1.0.2） | `6q-intent-suite/` | `index.html` |
| 面谈官门户 | **v1.0.3** | `6q-intent-suite/6q-interviewer-portal/` | `login.html`（引导 `hub.html`） |
| 会务后台 PC | **v1.0.0～v1.0.3** | `6q-intent-suite/6q-conference-prototype/` | `versions.html` |
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

根 `index.html` 会跳转到 `6q-intent-suite/`。
