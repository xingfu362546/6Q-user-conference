# 项目概览

## 项目名称与范围

- **原型链接**：[axhub.im/ax9/5f9ba66c12c9c6b4](https://axhub.im/ax9/5f9ba66c12c9c6b4)
- **范围**：社区/话题类 APP 用户端，含消息、发布、话题、打卡任务、个人中心与专属话题等模块。

## 页面数量与模块拆分

- **根级**：index、修订历史、功能清单（v3.0.0）
- **APP 用户端**：
  - 消息中心：消息列表（v3.0.0）
  - 发布：发想法、编辑中途退出等
  - 话题：话题广场（全部/我参与的）、话题详情、话题简介、成员管理、任务计划与打卡任务
  - 个人中心：个人中心页、个人信息编辑、专属话题订单
  - 创建专属话题：专属话题创建（v3.1.0）

详细页面列表见 [页面地图](./page-map.md)。

**本地还原页面**（共 23 个）：`ax9-index`、`ax9-revision-history`、`ax9-feature-list`、`ax9-message-center`、`ax9-publish-v1`、`ax9-publish-idea`、`ax9-edit-exit`、`ax9-topic-square-all`、`ax9-topic-square-mine`、`ax9-topic-detail`、`ax9-topic-intro`、`ax9-topic-settings`、`ax9-member-list`、`ax9-task-plan-detail`、`ax9-add-checkin-plan`、`ax9-add-checkin-task`、`ax9-select-checkin-task`、`ax9-checkin-task-publish`、`ax9-checkin-task-stats`、`ax9-exclusive-orders`、`ax9-profile-edit`、`ax9-profile`、`ax9-exclusive-topic-create`。预览路径：`/prototypes/<名称>`。

## 核心用户流程

1. **浏览与参与话题**：话题广场（全部/我参与的）→ 话题详情 → 话题简介/成员/任务计划
2. **发布内容**：发布页-发想法 → 编辑与发布；支持编辑中途退出确认
3. **消息与通知**：消息中心查看与处理
4. **个人与专属**：个人中心 → 资料编辑、专属话题订单；创建专属话题流程

## 主题风格摘要

本项目已从原型中提取并生成主题 **Ax9 Community**：

- **主题路径**：`src/themes/ax9-community/`
- **设计规范**：`src/themes/ax9-community/DESIGN-SPEC.md`
- **主色**：`#169BD5`；背景 `#F0F2F5`；强调色 `#F59A23`、`#5F51FB`
- **字体**：苹方 / PingFang SC、微软雅黑
- **圆角与间距**：2/5/10/20/40px 圆角；2/8/10/20/35px 间距

## 数据模型摘要

- 当前未单独产出数据模型文件；若需字段与表结构，可基于「话题、发布、打卡任务、订单、用户」等实体再补充 `assets/database/` 或文档中的模型说明。
