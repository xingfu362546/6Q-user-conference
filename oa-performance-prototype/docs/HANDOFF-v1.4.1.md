# Handoff · v1.4.1

> 月度领导评/确认 KR 细项统一 · 2026-06-03

## 变更文件

| 文件 | 变更 |
|------|------|
| `prototype/assets/supervisor-score.js` | 李明月度三级结构；王芳 PRESET；`getConfirmContext` / `renderConfirmKrDetail` |
| `prototype/assets/score-confirm.js` | 接入 `?id=` + KR 细项 + 动态模块表 |
| `prototype/assets/perf-score-summary.js` | 季度分管列；20/40/40 折算 |
| `prototype/oa-pc/score-confirm.html` | 引入 hierarchy + supervisor-score + CSS |
| `prototype/miniapp/score-confirm.html` | 同上 |
| `prototype/assets/proto-notes-data.js` | 确认页 / 月度评分 / 小程序确认注释 |
| `docs/GRILL_MONTHLY_LEADER_DETAIL.md` | Grill 决策记录 |
| `docs/VERSIONS.md` | v1.4.1 条目 |

## 演示入口

```
supervisor-score-monthly.html?id=r-lm-202605   # 领导待评 · 李明
supervisor-score-monthly.html?id=r-wf-202605   # 领导已评 · 王芳
score-confirm.html?id=r-wf-202605&role=employee
score-confirm.html?id=r-wf-202605&role=leader
score-confirm.html?id=r-hm-2026q2&type=quarter&role=supervisor
```

## 下一版候选

- 小程序领导评分月表同步 L2 细项只读区
- HR 结果明细 / 任务详情复用 `renderConfirmKrDetail`
