# Contract: 季度计分

**Module**: `prototype/assets/perf-quarter-score.js`  
**Consumers**: 季度填写向导、上级/分管评分、确认页、计划明细里的 HR 改分

调用方传入已经整理好的数字。模块不读页面，也不写存储。

## 输入

```text
workRows[]: 每行 self, supervisor, division
            空值按 0
sixqTotal: 数字，缺省 0
penaltyRows[]: 每行 self, supervisor, division
               每个已填值必须 ≤ 0，否则该行无效
incentiveRows[]: 每行
  objective: 文本
  typeId: 规格对照表中的类型，或 brand / other
  finalScore: 人才开发部最终得分，未填为 null
  selfScore: 仅用于展示，不参与专项汇总
hrFinalTotal: 数字或 null
level: 专员 | 主管 | 经理 | 总监 | 副总经理 | 其他
tierOverride: A | B | C | none | null
```

`brand` / `other` 的最终得分必须是 0 到 3 的整数，并且调用方已经要求填写认定说明。员工可选类型的最终得分必须是 0 到该类型固定分之间的整数。

## 输出

```text
workTotal: 1 位小数
penaltyTotal: 1 位小数
assessedTotal: 1 位小数
  = workTotal + sixqTotal + penaltyTotal
adoptedTotal: 有 hrFinalTotal 时用它，否则用 assessedTotal
incentiveTotal: 1 位小数；存在 typeId 有值但 finalScore 为空时，不给出档次
suggestedTier: A | B | C | pending | none
finalTier: 有 tierOverride 时用它，否则用 suggestedTier
suggestedAmount: 数字，或 unmatched
amountNote: 暂不认定时为 0；职级未匹配时说明原因
```

四舍五入到 1 位小数。同一 `objective` 去掉首尾空格后相同，只保留 `finalScore` 最高的一条。数量超越相加后上限 2，其余维度取最高后按规格上限封顶。

## 档次

绩效分数用 `adoptedTotal`。

| 档次 | 条件 |
| --- | --- |
| pending | 任一已选类型还没有最终得分 |
| A | 绩效分数 ≥ 90，专项 ≥ 6，至少一个维度 ≥ 3 |
| B | 绩效分数 ≥ 90，专项 ≥ 4，至少两个维度 ≥ 2 |
| C | 绩效分数 ≥ 85，专项 ≥ 2，至少一个维度 ≥ 1 |
| none | 以上都不满足 |

同时满足多档时取 A，然后 B，然后 C。

金额基准：A 800，B 600，C 300，none 和 pending 为 0。再乘职级系数。职级不在五档内时 `suggestedAmount` 为 `unmatched`。

## 必须通过的样例

1. 工作成果行综合分之和 79.6，6Q3J 为 10，减分自评 -2 且上级、分管为空。`penaltyTotal` 为 -0.4，`assessedTotal` 为 89.2。专项得分是 6 或 0 都不改变 89.2。
2. 上例再给 `hrFinalTotal` 92。`adoptedTotal` 为 92，`assessedTotal` 仍是 89.2。
3. 类型「数量超越：超额完成 1 项核心关键指标」的自评分固定分是 1。
4. 同一目标两条最终得分 2 和 4，专项汇总只留下 4，再受该维度上限约束。
5. 两条不同目标的数量超越最终得分都是 1，汇总为 2。
6. 绩效分数 89.2、专项 6、且没有维度达到 3、但至少两个维度不低于 2 时，因为绩效分数低于 90，不能是 A 或 B。若同时至少一个维度不低于 1，建议档次是 C。
