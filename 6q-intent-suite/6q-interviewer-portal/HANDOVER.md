# 面谈官门户 · 迭代交接单

当前门户版本：**v1.2.4**（由 v1.2.3 递增）。本次提交包含五业务页原生化、统一画像与会务页签、筛选折叠/单一导出，以及已提交问卷的8道完整示例问答。Axure追溯副本不属于运行依赖，不纳入本次提交。

> 一页版，可直接贴群/工单。详细规则见 [PORTAL-BOUNDARY.md](./PORTAL-BOUNDARY.md)。

## 0. 交接摘要

| 项 | 内容 |
| --- | --- |
| 迭代分支 | `feature/interviewer-portal` |
| 基线 | `origin/main` @ `d21ae9f` |
| 当前提交 | `f57bc96` |
| 仓库 | `https://github.com/xingfu362546/6Q-user-conference` |
| 归你改 | `6q-intent-suite/6q-interviewer-portal/**` |
| 不要改 | `shared/`、`6q-conference-prototype/`、`6q-conference-app-prototype/` |
| 限量改 | `index-features.js`、`index.html`（套件目录 + 根目录各一份，只动门户条目） |
| 提 PR 目标 | `main`，标题加 `[portal]` |
| 必须过 | 边界守卫 + 四组测试 + 主干 owner 全量审 |

## 1. 交付物清单

页面（7 个）：

| 文件 | 用途 |
| --- | --- |
| `login.html` | 会员登录：手机/邮箱 + 密码 + 图形验证码 |
| `conference-select.html` | 选择会务，只列进行中且本人为面谈官的会务 |
| `hub.html` | 登录后跳板，自动分流到选会务或意向列表 |
| `student-intent.html` | 本期学员意向一览（默认 Tab） |
| `students.html` | 学员列表 Tab |
| `tab-placeholder.html` | 答疑/面谈/跟进/调研 Tab 占位 |
| `student-profile.html` | 学员画像档案（复用后台口径 + 分析助手） |

样式与脚本：

- `css/portal-tokens.css`：门户设计变量
- `css/portal-login.css`：登录页样式
- `css/portal-shell.css`：顶栏、头图会员卡、业务 Tab
- `css/portal-intent.css`：意向页在门户下的覆盖样式
- `js/auth-mock.js`：登录态、角色、会务上下文（localStorage）
- `js/captcha-mock.js`：图形验证码
- `js/conference-mock.js`：演示会务数据
- `js/portal-shell.js`：顶栏挂载
- `js/portal-context.js`：头图会务信息、会员卡、业务 Tab 挂载

工程保障：

- `boundary.json`：共享文件基线哈希
- `checks/check-boundary.mjs`：越界引用与漂移检查
- `tests/auth-mock.test.mjs`、`tests/portal-boundary.test.mjs`
- `PORTAL-BOUNDARY.md`：边界与合并审核规则
- `.github/CODEOWNERS`：门户与共享路径绑主干 owner
- `.github/scripts/setup-branch-protection.*`：main 分支保护一键配置

## 2. 拉取分支

前置：Git、Node.js 20+（本机实测 v24）、任意静态服务器。

```bash
git clone https://github.com/xingfu362546/6Q-user-conference.git
cd 6Q-user-conference
git switch feature/interviewer-portal
```

已有仓库则：

```bash
git fetch origin
git switch --track origin/feature/interviewer-portal
# 已在本地时
git switch feature/interviewer-portal && git pull
```

确认基线正确：

```bash
git log --oneline -1     # 应为 f57bc96 或之后的门户提交
git status -sb           # 不应有未提交改动
```

## 3. 本地预览

仓库根目录（不是门户目录）起服务：

```bash
python -m http.server 8080
# 或
npx serve .
```

打开：

```
http://localhost:8080/6q-intent-suite/6q-interviewer-portal/login.html
```

演示账号（原型免校验，密码随便填）：

| 账号 | 说明 |
| --- | --- |
| 手机 `13800001111` / 邮箱 `interviewer@6q.test` | 张三，有 3 场进行中会务 |
| 手机 `13900002222` | 无会务账号，用于验收空态 |

直连页面（已登录状态下）：

- `.../student-intent.html`
- `.../students.html`
- `.../tab-placeholder.html?tab=qa`
- `.../student-profile.html?id=m10009`

注意：`hub.html` 只做跳转，直接打开会被重定向。

## 4. 改哪里 / 不改哪里

可自由改：

- 门户目录下的 `*.html`
- `css/portal-*.css`
- `js/auth-mock.js`、`js/captcha-mock.js`、`js/conference-mock.js`、`js/portal-shell.js`、`js/portal-context.js`
- 门户目录下新增文件（样式覆盖、适配层、测试）

只读（改前必须找主干 owner）：

- `6q-intent-suite/shared/intent-proto-*.js|css`
- `6q-intent-suite/6q-conference-prototype/`（会务后台样式与意向/画像逻辑）
- `6q-intent-suite/6q-conference-app-prototype/js/course-recommend.js`

规则：样式不一致用 `portal-*.css` 覆盖；逻辑要调整在门户目录加适配层。真需要改共享代码，单独提交并加 `upstream:` 前缀，PR 里说明会影响会务后台和 APP。

## 5. 每次迭代的流程

```bash
git switch feature/interviewer-portal
git pull

# 改代码 ...

node --test "6q-intent-suite/6q-interviewer-portal/tests/*.test.mjs"
node 6q-intent-suite/6q-interviewer-portal/checks/check-boundary.mjs
node --test 6q-intent-suite/shared/intent-proto-notes.test.mjs
node --test 6q-intent-suite/index-features.test.mjs

git add <你的文件>
git commit -m "feat(portal): 一句话说明"
git push origin HEAD
```

然后在 GitHub 发起 PR：`feature/interviewer-portal` → `main`，标题 `[portal] ...`，按 PR 模板填三块（改了什么 / 是否动共享文件 / 验证结果 + 截图）。

## 6. 自检清单

命令层面：

- [ ] 门户两个测试文件全绿
- [ ] `check-boundary.mjs` 输出 `boundary ok`
- [ ] `shared/intent-proto-notes.test.mjs` 全绿
- [ ] `index-features.test.mjs` 全绿

页面层面：

- [ ] 登录：手机/邮箱切换、验证码、错误密码可进
- [ ] 选会务：只列进行中会务；`13900002222` 显示「当前无正在进行中的会务」
- [ ] 意向列表：头图显示期数、开课时间、开课地址；右上会员姓名 + 岗位；业务 Tab 高亮「本期学员意向一览」
- [ ] 意向列表：点姓名进画像；明细抽屉只读；无策略配置入口（意向页本身不提供导出于跟进入录）
- [ ] 学员列表：单一「导出」按钮可用，CSV 字段数 29、文件名带日期
- [ ] 答疑/面谈/跟进：录入、编辑、删除、特别关注可用，刷新后本场记录仍在（sessionStorage）
- [ ] 画像会务入口：显示「本场会务订单 / 本场会务学员问卷」，普通入口不显示；无效 ID 显示明确空态
- [ ] 学员列表 Tab 可切换；其它 Tab 显示占位并可返回
- [ ] 画像：复用后台口径、字段说明可展开、分析助手能打开且不写回档案事实
- [ ] 退出登录后回登录页，`localStorage` 里的 `6q_iv_session`、`6q_iv_conference` 被清掉

## 7. 与 main 同步

```bash
git fetch origin
git rebase origin/main
node 6q-intent-suite/6q-interviewer-portal/checks/check-boundary.mjs
```

报「冻结依赖漂移」说明共享文件在 main 上变了：

1. 看漂移文件的上游 diff，判断是否影响门户
2. 需要则在门户覆盖层补适配
3. 确认无影响后 `node 6q-intent-suite/6q-interviewer-portal/checks/check-boundary.mjs --update`
4. 把「漂移文件 + 结论」写进 PR

`--update` 只改 `boundary.json` 的哈希，不会改共享文件本身。

## 8. 常见问题

| 现象 | 处理 |
| --- | --- |
| `git push` 卡住或 `Connection was reset` | `git -c http.version=HTTP/1.1 -c http.postBuffer=524288000 push origin HEAD` |
| 页面样式像没加载 | 必须在仓库根目录起服务，不能在门户目录起 |
| 注释气泡/图表空白 | mermaid、chart.js、echarts 走 CDN，需要能访问外网 |
| 改动后仍显示旧头图信息 | 清 `localStorage` 的 `6q_iv_session`、`6q_iv_conference` 再登录 |
| `check-boundary` 报越界 | 你新增了未登记的 `../` 引用，优先用门户内覆盖层 |

## 9. 交付边界声明

本分支是**原型**，不是生产代码：

- 登录仅按账号匹配，不校验密码
- 会务、学员、画像数据全为 mock
- 无后端接口、无权限校验、无埋点
- 交付给开发时按 `index-features.js` 的 v1.2.2 / v1.2.3 / v1.2.4 条目逐项对照，不以原型代码为准

## 本地会务业务页面增量（2026-11-16）

- 学员列表、答疑管理、面谈管理、跟进记录、意向调研已接入门户原生业务组件，复用现有 `q-input`、`q-select`、`q-btn` 与 `intent-table` 样式。运行页面不再使用 Axure iframe 或缩放画布。
- 原型来源保存在 `axure/`，仅作追溯资料；页面中的重复会务卡、重复导航和橙色需求标注不作为业务区域呈现。
- 各页面右上角“说明”提供交互路径、功能说明和五列字段表；右侧浮窗无蒙层，可鼠标或键盘调宽，不改变正文布局。
- 业务代码：`js/portal-conference-business.js`；学员数据：`js/portal-student-source.js`；页面说明：`js/portal-business-notes-data.js`；样式：`css/portal-conference-business.css`。
- 本地跟进交互使用浏览器演示数据，CSV 导出是演示输出。真实后端同步、权限控制、附件上传与服务器数据持久化未接入，不应作为生产功能验收。
- 正式需求以版本根目录的《需求说明》与各页面说明为准；本节是研发维护记录。

## 10. 画像档案增量交接与工作日志（2026-11-16）

- 学员列表“学员6Q姓名”现为档案链接，传递真实学员ID、姓名、手机号及显式 `from=conference&conferenceId=...`。意向列表档案入口在门户适配层点击时补齐会务参数。
- `js/portal-student-profile.js` 在冻结画像脚本前后适配：精确匹配ID，阻止未知ID回退到其他学员；姓名/手机号不符时显示提示。吴琼 `XE78PV / 18031570108` 的头部使用学员源已知资料；详细画像按11月17日最终要求复用原有完整示例，无需逐人绑定身份。
- 带有效会务ID的会务入口展示“档案画像 / 本场会务订单 / 本场会务学员问卷”，普通入口、只有 `from`、未知会务ID均不显示会务页签。普通入口不会被残留localStorage会务污染。既有画像四个行为页签、行为抽屉、家庭未使用资格、评价和跟进历史、AI入口保留。
- 源核验：只读 `学员信息_1.html`、`files/学员信息_1/data.js` 与 `styles.css`。订单10列及7类筛选、问卷5列及名称/状态筛选逐项保留。data.js仅定义五个源tab切换；“查看详情”没有点击事件，也没有题目与答案。门户详情展示问卷名称、状态与空态，不编造题目答案；源空白数量、金额和未提交更新时间保留空值。
- 原型订单与问卷使用源完整示例值，页面标识“原型演示数据”；按11月17日最终要求向全部有效学员及会务入口展示，不限定 `cf_a + XE78PV`。真实业务查询与新录入跟进仍以学员ID和会务ID为上下文。
- 档案两种跟进按钮复用 `portal-conference-business.js` 表单，1000字、标签、模板及附件文件名交互一致。保存使用明确路由会务ID，与学员ID一同存入sessionStorage；本场跟进立即可见，刷新、返回当前会务跟进记录均可查看。附件仅记录文件名，不上传文件；无真实后端持久化。
- 画像所有页签共用门户说明浮窗，打开、关闭、调宽和tab切换不会重建画像、重置筛选或丢失说明阅读位置；表单输入与原行为tab保持。
- 验证：`checks/check-profile-browser.mjs` 使用8080静态服务与9337 Chrome CDP，实际核验姓名身份、cf_a/cf_b隔离、普通入口/无效身份、订单与问卷字段筛选详情、两类跟进保存和跨页查看、既有画像流程、说明状态保持、390px窄屏及表单底部提交可达。页面无JS异常。
- 最终补充入口通过：无ID档案明确空态且无脚本异常；意向列表点击后显式传递当前会务ID；学员列表录入跟进后进入同学员档案可查看。截图见 `checks/profile-orders-verified.png`、`profile-questionnaires-verified.png`（说明打开）和对应 `-full.png`（完整业务页面）。
- 四组检查通过：门户测试2项、边界守卫（40个引用/20个冻结文件）、共享说明测试4项、功能清单测试1项。冻结依赖未修改；未提交Git。
- 运行方式：`PORTAL_CHECK_URL=http://127.0.0.1:8080/6q-intent-suite/6q-interviewer-portal/ node 6q-intent-suite/6q-interviewer-portal/checks/check-business-browser.mjs`；画像检查直接执行 `node 6q-intent-suite/6q-interviewer-portal/checks/check-profile-browser.mjs`。运行浏览器检查前启动本地Chrome的9337调试端口。

## 11. 导出、筛选与演示画像修复（2026-11-17）

- 学员列表统一为一个“导出”按钮，原现场导出的学员资料、四项资格与四类跟进完整保留，CSV包含29个业务字段，按当前筛选输出、文件名带日期；表格字段和源空值未删改。
- `portal-conference-business.js` 新增共用筛选折叠控制：测量筛选项实际行位置，仅超过一行时显示按钮，默认收起。查询/重置独占始终可见操作栏；宽度变化重新测量，不重建输入或清空条件。五业务页及画像订单/问卷共用此控制；意向页仅一个搜索框无需折叠。
- 空画像根因：`portal-student-profile.js` 的源学员分支仅创建 `emptyDetail()`，导致XE78PV虽身份正确，但所有原画像模块没有内容。按最终要求以 `legacyPrototypeDetail()` 深拷贝原有完整 `m10009` 详细示例供有效学员展示，已删除中间方案 `demoDetail()`；冻结文件无改动。
- 学员信息卡的ID、姓名、手机号、性别、年龄、会员身份、小组、签到号及助教保持入口学员资料；详细画像无需逐人绑定，保留原有基础资料、家庭、购买、资格、评价、客服、退款、历史跟进、四类行为与图表全部数据及交互，页面简短提示“原型演示数据”。
- 所有有效会务入口均展示原订单/问卷示例，不再限制 `XE78PV + cf_a`。新增跟进继续按学员ID+会务ID保存；无效ID与姓名手机号不符继续明确空态。
- `students.html`、`student-intent.html` 均打开同一 `student-profile.html`；页签“档案画像 / 本场会务订单 / 本场会务学员问卷”移到学员信息卡下方、本场会务跟进上方，学员信息卡独立于页签内容，切换后保持可见。
- 实际补齐意向入口缺陷：冻结意向有6位示例学员，冻结画像仅3位且内部ID存在同号不同姓名，原意向入口会未找到或身份不符。门户点击适配传入 `profileSource=intent`，画像门户层按源中现有6位示例识别学员，保留意向姓名与脱敏手机号；普通档案与学员列表身份校验仍保留，未知ID不回退。
- 浏览器实测通过：1440/900/390px × 五业务tab共15组折叠、输入保留及操作可达；画像订单/问卷1440/390px共4组；唯一导出CSV及全部字段；缩放后保留展开和输入；演示身份准确、各模块数据量、家庭资格弹窗/评价/历史跟进、两个Chart真实实例；原行为四tab、AI入口、身份错误空态、普通入口、cf_a/cf_b隔离、跟进跨页查看、说明宽度/阅读位置/表单状态保留及390px无整页横向溢出。
- 四组检查全通过：门户2项、边界守卫（40引用/20冻结文件）、共享说明4项、功能清单1项；两份浏览器检查脚本通过且页面JS异常为0。最终画像新增六位意向姓名入口完整数据验证、Hero→页签→本场跟进顺序和三个页签Hero持续显示断言；浏览器导航先等待完整加载事件再验证DOM，并禁用旧缓存。8080静态服务复用；本次9337初始无监听，启动独立无头Chrome执行CDP验证。截图保存在 `checks/profile-*.png`。
- 业务说明已同步版本根《需求说明.md》及 `portal-business-notes-data.js`，维护说明同步README与本节。现仍为本地原型，无真实后端/权限/自动同步/上传或服务器持久化；未提交或推送Git。

## 12. 角色

| 角色 | 负责 |
| --- | --- |
| 门户迭代 owner | 归属区改动、自检、提 PR |
| 主干 owner `@xingfu362546` | 全量审核、合并、打 `portal-v1.2.x` 标签 |
| 需求方 | 市场部 姜玲玲 |
