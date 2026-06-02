# 6Q 会务 · 学员意向分析

本仓库仅维护 **学员意向分析** 一条产品线（后台 PC + 会务 APP + 用户标签平台 + 方案文档）。

## 目录

| 路径 | 说明 |
|------|------|
| `6q-conference-prototype/` | 后台 PC：本期策略、意向分析、分析策略模板 |
| `6q-conference-app-prototype/` | 会务 APP：AI 分析、意向中控、学员详情与课程推荐 |
| `user-tag-admin/` | 用户标签平台原型（系统标签来源） |
| `docs/course-student-intent/` | 方案与确认稿（Markdown / Word） |
| `index.html` | 部署总入口（Cloudflare Pages 站点首页） |

## 本地预览

直接用浏览器打开根目录 `index.html`，或：

```bash
# 任选静态服务，在仓库根目录执行
npx serve .
```

## Cloudflare Pages

| 配置项 | 值 |
|--------|-----|
| Production branch | `main` |
| Framework preset | None |
| Build command | （留空） |
| Build output directory | `/` |

部署后访问：`https://<项目名>.pages.dev/`

## 分支

- `main`：生产分支，Pages 部署用
- 功能开发可在 feature 分支进行，合并进 `main` 后自动部署
