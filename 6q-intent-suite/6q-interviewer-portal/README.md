# 6Q 面谈官门户（v1.2.x）

独立 PC 门户原型：会员登录 → 选择进行中会务 → 学员意向列表 → 画像档案（含分析助手）。

## 入口

- 登录：`login.html`
- 会务选择：`conference-select.html`
- 意向列表：`student-intent.html`
- 画像档案：`student-profile.html?id=m10009`

## 分支

- 维护分支：`feature/interviewer-portal`（从 `origin/main` 切出）
- 归属范围、冻结依赖、合并审核：见 [PORTAL-BOUNDARY.md](./PORTAL-BOUNDARY.md)

## 自检

```bash
node --test 6q-intent-suite/6q-interviewer-portal/tests
node 6q-intent-suite/6q-interviewer-portal/checks/check-boundary.mjs
```
