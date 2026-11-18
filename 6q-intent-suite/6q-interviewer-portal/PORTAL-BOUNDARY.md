# 面谈官门户 · 分支边界与合并审核

本目录是面谈官门户（v1.2.x）的独立维护区。分支 `feature/interviewer-portal` 从 `origin/main` 切出，基线提交记录在 `boundary.json` 的 `syncedCommit`。

拉代码、演示账号、迭代流程、验收清单见 [HANDOVER.md](./HANDOVER.md)；本文只讲边界与审核规则。

## 1. 归属区（可自由改动）

- 本目录下所有 `*.html`
- `css/portal-*.css`
- `js/auth-mock.js`、`js/captcha-mock.js`、`js/conference-mock.js`、`js/portal-shell.js`、`js/portal-context.js`
- `tests/**`、`checks/**`、`boundary.json`、本文件

门户自己的样式和交互优先放在上述文件里解决。

## 2. 共享文件

### 2.1 只读冻结（不改）

下列文件由主干的会务/意向模块维护，门户只引用、不修改：

| 路径 | 用途 |
| --- | --- |
| `../shared/intent-proto-notes.css` / `.js` | 注释气泡运行时 |
| `../shared/intent-proto-enrich.js` | 注释富文本 |
| `../shared/intent-proto-pages.js` | 页面标题、注释映射 |
| `../shared/intent-proto-architecture.js` | 架构图 |
| `../shared/intent-proto-field-specs.js` | 字段说明 |
| `../6q-conference-prototype/css/6q-conference.css` | 会务基础样式 |
| `../6q-conference-prototype/css/6q-intent-premium.css` | 意向页样式 |
| `../6q-conference-prototype/css/6q-profile.css` | 画像页样式 |
| `../6q-conference-prototype/js/tag-catalog-tree.js` | 标签树 |
| `../6q-conference-prototype/js/intent-strategy-core.js` | 策略内核 |
| `../6q-conference-prototype/js/conference-intent.js` | 意向列表逻辑 |
| `../6q-conference-prototype/js/conference-profile-data.js` | 画像数据 |
| `../6q-conference-prototype/js/conference-profile-behavior.js` | 画像交互 |
| `../6q-conference-prototype/js/conference-student-profile.js` | 画像渲染 |
| `../6q-conference-prototype/js/conference-profile-assistant-*.js` | 分析助手 |
| `../6q-conference-app-prototype/js/course-recommend.js` | 课程推荐 |

### 2.2 受限共享文件（只能改门户条目）

| 路径 | 允许的改动 |
| --- | --- |
| `../index-features.js` | 只追加/修改面谈官门户相关条目（portal 端、v1.2.x 版本块、note 46/51、版本范围里的门户行），其他版本和其他端保持不动 |
| `../../index-features.js`（根目录镜像） | 与上一份保持一致，不单独改 |
| `../index.html` / `../../index.html` | 只改门户/套件标题文案 |

改完受限文件后运行 `check-boundary.mjs --update` 回写哈希，并在提交信息里写明改了哪些条目。

完整清单和哈希见 `boundary.json`。

## 3. 改动规则

允许：

- 改门户页面、门户样式、门户自有脚本
- 在 `css/portal-*.css` 里写覆盖样式
- 在门户目录里加适配层（例如 `portal-context.js`）
- 按 2.2 的约束维护门户在功能清单里的条目

不允许：

- 直接修改 2.1 的冻结依赖
- 把冻结文件复制进门户目录（会产生第二份真源）
- 在门户页面新增未登记的 `../` 引用

确实需要改共享逻辑时（共享 bug、画像口径变更）：

1. 单独提交，提交信息前缀 `upstream:`
2. 在 PR 描述里写清影响面（会务后台 / APP / 门户）
3. rebase 后运行 `check-boundary.mjs --update` 回写 `boundary.json`
4. 必须由主干 owner 审核

## 4. 本地运行与自检

在仓库根目录起静态服务（任选其一）：

```bash
python -m http.server 8080
npx serve .
```

打开 `http://localhost:8080/6q-intent-suite/6q-interviewer-portal/login.html`。

自检命令：

```bash
node --test "6q-intent-suite/6q-interviewer-portal/tests/*.test.mjs"
node 6q-intent-suite/6q-interviewer-portal/checks/check-boundary.mjs
node --test 6q-intent-suite/shared/intent-proto-notes.test.mjs
node --test 6q-intent-suite/index-features.test.mjs
```

页面冒烟清单：

- `login.html`：手机/邮箱切换、验证码、错误密码可进（原型免校验）
- `conference-select.html`：只列进行中会务、无会务空态
- `student-intent.html`：头图会员卡、会务时间地址、业务 Tab、列表与抽屉
- `students.html`：学员列表 Tab
- `tab-placeholder.html?tab=qa`：其它 Tab 占位
- `student-profile.html?id=m10009`：画像复用、只读、分析助手

## 5. 与 main 同步

```bash
git fetch origin
git rebase origin/main
node 6q-intent-suite/6q-interviewer-portal/checks/check-boundary.mjs
```

如果报“冻结依赖漂移”：

1. 先看漂移文件的上游 diff，确认对门户无影响
2. 需要的话在门户覆盖层里补适配
3. 运行 `node 6q-intent-suite/6q-interviewer-portal/checks/check-boundary.mjs --update`
4. 把“漂移文件清单 + 结论”写进 PR

## 6. 合并回 main 的审核

门户分支只通过 PR 合并，不直推 `main`。PR 标题用 `[portal]` 前缀，描述包含三块：

1. 改了什么（页面 / 交互 / 数据）
2. 是否动了共享文件（有就逐条列出：冻结依赖 / 受限共享文件）
3. 验证结果（命令输出 + 页面截图）

主干 owner 全量审核清单：

- [ ] diff 是否只落在归属区，或 2.2 允许的门户条目
- [ ] 若含 `upstream:` 提交，是否说明影响面并同步 `boundary.json`
- [ ] 业务口径按版本核对：v1.2.0～v1.2.3 只读；v1.2.4 起允许「学员列表导出 + 答疑/面谈/跟进录入改删」，且这些写操作只落在 sessionStorage 且有原型演示数据声明
- [ ] 意向页始终只读；无策略配置入口；无会务空态文案保留
- [ ] 冻结依赖未修改（`boundary ok` 且 `boundary.json` 哈希未无故变更）
- [ ] 新增页面无真实手机号/邮箱等个人信息，或已脱敏
- [ ] 旧 `localStorage` 会话 / 会务上下文是否兼容
- [ ] 四组测试是否全绿
- [ ] 页面冒烟截图是否归档（截图放仓库外，不提交二进制）

合并方式：squash merge，合并后打标签 `portal-v1.2.x`。回滚直接 revert 该 squash 提交。

## 7. main 分支保护

仓库需要在 GitHub 上开启 main 保护，否则 CODEOWNERS 不生效。配置脚本：

```bash
gh auth login    # 需要 admin 权限
bash .github/scripts/setup-branch-protection.sh          # macOS / Linux
powershell -File .github/scripts/setup-branch-protection.ps1   # Windows
```

设置的规则：

| 规则 | 值 | 效果 |
| --- | --- | --- |
| Require a pull request | 1 人批准 | 禁止直推 main |
| Require review from Code Owners | 开 | 门户与共享路径必须 owner 批准 |
| Dismiss stale reviews | 开 | 新提交作废旧批准 |
| Require linear history | 开 | 只允许 squash / rebase 合并 |
| Allow force push / deletions | 关 | 不能改历史、不能删分支 |
| Require conversation resolution | 开 | 评论未解决不能合 |
| Do not allow bypassing | 关 | owner 自己的 PR 必要时可由 admin 放行 |

**为什么最后一条留了口子**：CODEOWNERS 只绑了一位 owner，GitHub 不允许自审自批。owner 自己提交的 PR 若卡在「必须有 1 人批准」，会死锁；留 admin bypass 是有意的。后续加上第二位 reviewer 后，可以改成强制。

复核配置：

```bash
gh api repos/xingfu362546/6Q-user-conference/branches/main/protection
```

没装 gh 时，在 GitHub 仓库 Settings → Branches → Add branch protection rule，分支填 `main`，按上表勾选即可。
