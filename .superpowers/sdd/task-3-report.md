# Task 3 实施报告：我的家庭可视化

## 结论

已完成「我的家庭」家庭可视化、创建与邀请码加入流程、默认主持人设置，以及三口演示家庭加载；并挂载到应用壳的 `family` Tab。

## 实现内容

### 家庭领域与交互

- 新增 `prototype/assets/family-view.js`
- 对外提供：
  - `FamilyView.render(container, state)`
  - `FamilyView.createFamily(name)`
  - `FamilyView.joinByCode(code, role, nickname)`
  - `FamilyView.setDefaultHost(memberId)`
- 创建家庭时：
  - 校验并清理家庭名
  - 生成家庭 ID 和 6 位大写字母数字邀请码
  - 创建者以「妈 / 妈妈」加入 slot 0
  - 创建者同时成为当前成员与默认主持人
- 邀请加入时：
  - 校验邀请码、角色、昵称和 4 人容量
  - 自动分配首个空站位
  - 新成员设为当前角色
- 支持复制邀请码、从空站位聚焦加入表单、修改默认主持人。

### 家庭场景

- CSS 绘制客厅背景、窗户、装饰画、沙发。
- 4 个固定站位展示成员色块人偶、角色、昵称与默认主持状态。
- 空站位显示「邀请加入」。
- 提供桌面双栏和窄屏两列布局。

### 演示数据

- `demoSeed.createDemoFamily()` 返回爸、妈、孩子三位成员。
- 固定邀请码 `DEMO01`。
- 默认主持人与当前成员均为「妈」。
- 每次调用返回新的成员数组，避免种子对象被业务状态修改。

### 应用挂载

- `app.js` 在 family 视图激活时调用 `FamilyView.render`。
- 新增 `App.replaceState(nextState)`，家庭变更后同步刷新家庭场景、顶部角色与角色切换列表。
- 角色显示兼容新结构 `nickname/role` 与旧结构 `name`。
- `index.html` 按依赖顺序加载 `demo-seed.js`、`family-view.js`、`app.js`。

## TDD 与自动测试

先新增失败测试并确认：

- `family-view.test.js` 首次因 `family-view.js` 不存在而失败。
- `app.test.js` 挂载测试首次因 family 未渲染而失败。
- 新成员名称回归测试首次因 `memberLabel` 不存在而失败。

最终测试：

```text
node family_meeting/prototype/tests/family-view.test.js  -> OK
node family_meeting/prototype/tests/app.test.js          -> OK
node family_meeting/prototype/tests/store.test.js        -> OK
```

IDE 诊断：本次修改文件无 linter 错误。

## 浏览器验收

在 `http://localhost:8765/index.html` 完成以下路径：

1. 清空本地状态，确认「创建家庭」空态。
2. 创建「浏览器验收家庭」，生成邀请码 `5KXUZM`，创建者「妈妈」占首位。
3. 用相同邀请码加入第二位成员「爸爸」，场景出现两位成员，顶部角色切换为爸爸。
4. 点击「载入演示」，家庭覆盖为三口之家。
5. 确认邀请码为 `DEMO01`、默认主持人为妈妈、顶部当前角色为妈妈。
6. 完整页面截图保存为 `task-3-family-view.png`（Cursor 临时截图目录）。

## 自审

- 数据写入均通过 Store；没有改动会议、待办等 Task 3 之外的状态。
- 输入显示前进行了 HTML 转义；邀请码、角色、昵称和容量均有校验。
- 只提交 `family_meeting/prototype` 与本报告，未包含工作区其他已有修改。
- 复制功能依赖 Clipboard API；不可用时会显示邀请码供手动复制。

