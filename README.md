# 6Q 会务 · 学员意向分析

意向分析四端原型已收纳到 **`6q-intent-suite/`**。

## 入口（唯一功能清单总页）

| 路径 | 说明 |
|------|------|
| [`6q-intent-suite/index.html`](6q-intent-suite/index.html) | **功能清单总页**（套件内唯一总 index） |
| [`index.html`](index.html) | 仓库根跳转 → 上述总页 |

## 套件内子项目

| 路径 | 说明 |
|------|------|
| `6q-intent-suite/6q-interviewer-portal/` | 面谈官门户 |
| `6q-intent-suite/6q-conference-app-prototype/` | 会务 APP |
| `6q-intent-suite/6q-conference-prototype/` | 会务后台 PC |
| `6q-intent-suite/user-tag-admin/` | 用户标签平台 |
| `docs/course-student-intent/` | 方案与确认稿 |

## 本地预览

```bash
npx serve .
# 打开 / 或 /6q-intent-suite/
```

## Cloudflare Pages

| 配置项 | 值 |
|--------|-----|
| Production branch | `main` |
| Build output directory | `/` |

根 `index.html` 会跳转到 `6q-intent-suite/`。
