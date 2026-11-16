# 面谈官门户 · 迭代交接单

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
- [ ] 意向列表：点姓名进画像；明细抽屉只读；无策略配置、无导出、无跟进入录
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
- 交付给开发时按 `index-features.js` 的 v1.2.2 / v1.2.3 条目逐项对照，不以原型代码为准

## 10. 角色

| 角色 | 负责 |
| --- | --- |
| 门户迭代 owner | 归属区改动、自检、提 PR |
| 主干 owner `@xingfu362546` | 全量审核、合并、打 `portal-v1.2.x` 标签 |
| 需求方 | 市场部 姜玲玲 |
