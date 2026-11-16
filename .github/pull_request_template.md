## 改了什么

<!-- 页面 / 交互 / 数据 / 文档，逐条列 -->

## 影响面

- [ ] 只影响单个原型目录
- [ ] 涉及共享文件（`shared/`、`index-features.js`、`6q-conference-prototype/` 等），已在下面列出并说明原因
- [ ] 含 `upstream:` 提交

涉及文件：

```
（无则写「无」）
```

## 验证

```
（贴命令输出或截图链接）
```

---

<!-- 仅当面谈官门户（6q-interviewer-portal）改动时填写以下部分 -->

## 面谈官门户专项

- [ ] diff 只改 `6q-intent-suite/6q-interviewer-portal/` 归属区，或 `index-features.js` / `index.html` 的门户条目
- [ ] `node --test "6q-intent-suite/6q-interviewer-portal/tests/*.test.mjs"` 全绿
- [ ] `node 6q-intent-suite/6q-interviewer-portal/checks/check-boundary.mjs` 输出 `boundary ok`
- [ ] `node --test 6q-intent-suite/shared/intent-proto-notes.test.mjs` 全绿
- [ ] `node --test 6q-intent-suite/index-features.test.mjs` 全绿
- [ ] 业务口径：只读、无策略配置、无导出、无会务空态
- [ ] 旧 `localStorage` 会话 / 会务上下文兼容
- [ ] 六页截图已归档：登录 / 选会务 / 意向列表 / 学员列表 / Tab 占位 / 画像
