# 6Q 会务 · 学员意向分析

意向分析四端原型收纳在 **`6q-intent-suite/`**。开发按版本号拆范围，不要再用历史编号 v1.0.0～v1.0.4 做交付切分。

| 项 | 值 |
|----|----|
| 需求部门 | 市场部 |
| 产品负责人 | 姜玲玲 |
| 编制日期 | 2026-09-02 |
| 完整范围表 | [`index.html`](index.html) 顶部「版本范围」（六列：序号 / 需求部门 / 产品负责人 / 需求描述 / 实现方案 / 页面链接） |

## 版本规范

三条产品线各自封 **`.0`**。之后所有新调整只加**第三个小数点**，例如 `v1.1.1`、`v1.2.1`、`v1.3.1`。不要新开 `v1.4.0`，也不要回到 `v1.0.x`。

| 版本 | 产品线 | 下一版 | 覆盖端 |
|------|--------|--------|--------|
| **v1.1.0** | 标签管理系统 | v1.1.1 | 用户标签平台 |
| **v1.2.0** | 学员档案 + 分析策略 + 会务后台意向分析 + 会务工作台 APP + 面谈官只读查档 | v1.2.1 | 会务后台 PC、会务 APP、面谈官门户（查档） |
| **v1.3.0** | AI 分析助手 | v1.3.1 | 会务后台画像、面谈官门户（同一套工作台） |

历史原型迭代（v1.0.0～v1.0.4）只作追溯，见 [`6q-intent-suite/6q-conference-prototype/versions.html`](6q-intent-suite/6q-conference-prototype/versions.html)。

## 入口（Cloudflare 首页）

| 路径 | 说明 |
|------|------|
| [`index.html`](index.html) | **Cloudflare 首页 / 全量功能清单**：版本范围表 + 四端模块清单 |
| [`6q-intent-suite/index.html`](6q-intent-suite/index.html) | 套件内折叠式功能清单（同一套版本数据） |

线上 Pages：<https://6q-user-conference.pages.dev/>

## 各端目录与入口

| 端 | 本版归属 | 目录 | 原型入口 |
|----|----------|------|----------|
| 功能清单总页 | 三线总览 | `6q-intent-suite/` | [`index.html`](6q-intent-suite/index.html) |
| 用户标签平台 | **v1.1.0** | `6q-intent-suite/user-tag-admin/` | [`tag-list.html`](6q-intent-suite/user-tag-admin/tag-list.html)（导航 `home.html`） |
| 会务后台 PC | **v1.2.0** 档案/策略/意向 · **v1.3.0** 助手 | `6q-intent-suite/6q-conference-prototype/` | [本期策略](6q-intent-suite/6q-conference-prototype/conference-intent-strategy.html) · [意向分析](6q-intent-suite/6q-conference-prototype/conference-student-intent.html) · [画像（含助手）](6q-intent-suite/6q-conference-prototype/conference-student-profile.html?id=m10009) |
| 会务 APP | **v1.2.0** | `6q-intent-suite/6q-conference-app-prototype/` | [`home.html`](6q-intent-suite/6q-conference-app-prototype/home.html) |
| 面谈官门户 | **v1.2.0** 只读查档 · **v1.3.0** 助手 | `6q-intent-suite/6q-interviewer-portal/` | [`login.html`](6q-intent-suite/6q-interviewer-portal/login.html)（引导 `hub.html`） |

## v1.1.0 标签管理系统

路径：用户标签平台 → 标签中心。一期用自然语言圈选，智能体生成只读 SQL（结果集仅 `member_id`）。可视化规则构建一期不做。

开发要点：

1. 一级分类平台预置，运营不可新建一级；规则、计算、覆盖人数挂在二级。
2. 覆盖人数取上次成功版本；计算失败不得显示成 0 人。
3. 二级操作：编辑、复制、执行历史、立即计算、停用。立即计算 / 例行更新复用已确认 SQL，不每次调 AI。
4. 确认并计算后写入当日快照，版本号 = `YYYYMMDD`。改 NL 后必须重新生成 SQL 才能确认。
5. 执行历史仅二级可进；「本版本无效」只影响该版本。
6. 数据接入、数据表管理运营只读；`member_id` 与会务名单直接相等，不做映射表。
7. 意向分权重配在策略模板，不在标签平台。

原型：[`tag-list.html`](6q-intent-suite/user-tag-admin/tag-list.html) · [`tag-create.html`](6q-intent-suite/user-tag-admin/tag-create.html) · [`tag-history.html`](6q-intent-suite/user-tag-admin/tag-history.html)

## v1.2.0 学员档案 / 分析策略 / 意向分析 / 会务 APP

会务后台出数、面谈官只读查档、现场 APP 共用同一套策略版本与 `member_id`。

开发要点：

1. **分析策略模板**（会务工具，与期次无关）：关注标签树多选 + 任一/全部；意向度二选一（A 按权重分阈值 / B 按命中标签组合）。权限：会务统筹配置。
2. **本期分析策略**：选用模板或复制上期 → 保存并重算。版本号递增后列表立即重算，APP 强制重跑分析动效。未保存策略时意向页必须空态引导，禁止静默用默认策略出数。
3. **意向分** `= Σ(关注∩命中 的策略权重) + AI(0~25)`。列表列：学员、意向分、意向度、命中标签、跟进内容（当前会务）、AI 短摘要、推荐产品。行为列与历史跟进不在本列表，点姓名进画像。
4. **推荐两行**：主推课程一行；事业说明会「意向了解方向」含导师或天使才出礼包名称一行。无方向则不存在礼包行。可约谈时间不能单独触发出礼包。
5. **明细抽屉**是跟进保存后异步出的只读快照：结论 / 依据 / 下一步。不在抽屉确认智能匹配，不写成交话术。
6. **画像档案**是会员全局事实页（家庭组、关系图谱、基础信息四块、行为四 Tab、跟进查看更多），不含商机漏斗。
7. **面谈官门户**：登录后只读意向列表 + 画像；不含策略配置 / 跟进入录 / 导出。
8. **会务 APP**：学员列表 → 分析动效 → 意向中控 → 列表 / 详情。中控高频榜只计课程。卡片与 PC 对齐：课一行，有方向才礼包一行。商品用紧凑 SKU 行。APP **不承载**大型分析助手。

原型：[`conference-intent-strategy.html`](6q-intent-suite/6q-conference-prototype/conference-intent-strategy.html) · [`conference-student-intent.html`](6q-intent-suite/6q-conference-prototype/conference-student-intent.html) · [`conference-student-profile.html`](6q-intent-suite/6q-conference-prototype/conference-student-profile.html?id=m10009) · [`app-intent-dashboard.html`](6q-intent-suite/6q-conference-app-prototype/app-intent-dashboard.html)

## v1.3.0 AI 分析助手

会务后台画像与面谈官门户共用同一套双栏工作台。对话 / 检索 / 匹配为 Mock，生产以 Dify 回传及课务 / 产品接口为准。

开发要点：

1. 空白会话两卡：**我要答疑** / **分析学员**。
2. **答疑**：复刻智能体三条预输入（如何有方法的答疑 / 叛逆第一步怎么答 / 我连接了下一步），五步法示范 + 蓝条话术。不匹配产品、不打开右栏、不含报价成交。
3. **分析**：先确认当前页学员或按姓名 / ID 检索，再选兴趣解读 / 下一步跟进 / 产品匹配。
4. **匹配**必须工作人员确认后才走 A+B 并写右栏。右栏产品结果页按现网，不另改交互。
5. 匹配完成后面谈提示六维：兴趣信号 / 上课进度 / 报读关系 / 事业说明会 / 主推产品 / 跟进缺口。按钮文案是「需要，按学员数据给提示」，禁止「复制沟通话术」。
6. 公开原型不含领袖营报价数字稿；会话按工作人员隔离，助手不改档案事实。

原型：[`conference-student-profile.html?id=m10009`](6q-intent-suite/6q-conference-prototype/conference-student-profile.html?id=m10009) · [`student-profile.html?id=m10009`](6q-intent-suite/6q-interviewer-portal/student-profile.html?id=m10009)

## 开发交接

- 范围与实现颗粒度：打开 [`index.html`](index.html)#conference-versions，按版本表开发。
- 历史交接稿（旧编号）：[`docs/course-student-intent/HANDOFF-DEV-v1.0.0-v1.0.3.md`](docs/course-student-intent/HANDOFF-DEV-v1.0.0-v1.0.3.md)
- 助手早期设计：[`docs/superpowers/specs/2026-08-27-student-analysis-assistant-design.md`](docs/superpowers/specs/2026-08-27-student-analysis-assistant-design.md)

## 本地预览

```bash
npx serve .
# 打开 / 或 /6q-intent-suite/
```

也可在 `6q-intent-suite/` 下 `python -m http.server 8777`，访问 `http://127.0.0.1:8777/index.html`。

## Cloudflare Pages

| 配置项 | 值 |
|--------|-----|
| Production branch | `main`（以 Pages 项目配置为准） |
| Build output directory | `/` |

根 `index.html` 渲染全量功能清单与版本范围表；各原型链接指向 `6q-intent-suite/` 内实际页面。
