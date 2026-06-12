/* 三端原型页 → 说明条目映射（note id 见 index-features.js + intent-proto-enrich.js）
   diagrams id 见 shared/intent-proto-architecture.js */
window.INTENT_PROTO_PAGES = {
  /* —— 用户标签平台 —— */
  "tag-list.html": {
    title: "标签管理",
    subtitle: "树形列表 · 覆盖人数 · 二级标签运维",
    notes: [1, 2, 3, 4],
    diagrams: ["tag-rules", "overview"],
  },
  "tag-create.html": {
    title: "新增/编辑二级标签",
    subtitle: "规则构建 · 权重 · 保存并计算",
    notes: [2, 5, 6, 7, 8, 22],
    diagrams: ["tag-rules"],
  },
  "tag-history.html": {
    title: "执行历史",
    subtitle: "版本号 · 成功/失败 · 导出",
    notes: [9, 8],
    diagrams: ["tag-rules"],
  },
  "data-access.html": {
    title: "数据接入",
    subtitle: "只读 endpoint · 开发态配置",
    notes: [10, 12],
    diagrams: ["overview"],
  },
  "data-tables.html": {
    title: "数据表管理",
    subtitle: "元数据只读 · 字段抽屉",
    notes: [11, 5, 12],
    diagrams: ["overview"],
  },

  /* —— 会务后台 PC —— */
  "tools-intent-strategy-template.html": {
    title: "分析策略模板",
    subtitle: "列表 · 新建/编辑/删除 · 权限",
    notes: [13, 14, 19],
    diagrams: ["pc-strategy", "modules"],
  },
  "tools-intent-strategy-template-edit.html": {
    title: "编辑分析策略模板",
    subtitle: "关注标签 · 意向度二选一",
    notes: [13, 15, 16, 17, 18, 22, 2],
    diagrams: ["pc-strategy"],
  },
  "conference-intent-strategy.html": {
    title: "本期分析策略",
    subtitle: "选用模板 · 复制上期 · 保存重算",
    notes: [19, 20, 21, 32],
    diagrams: ["pc-strategy", "e2e"],
  },
  "conference-student-intent.html": {
    title: "学员意向分析",
    subtitle: "列表 · KPI · 抽屉明细",
    notes: [20, 21, 15, 22, 17, 18, 23, 24, 25, 26, 27, 28, 29, 31, 30],
    diagrams: ["pc-strategy", "e2e"],
  },
  "conference-detail-basic.html": {
    title: "会务详情 · 跟进记录",
    subtitle: "人工录入 · 触发 AI",
    notes: [25, 31, 12],
    diagrams: ["e2e"],
  },

  /* —— 会务 APP —— */
  "app-students.html": {
    title: "学员列表",
    subtitle: "AI 意向洞察入口 · 策略版本",
    notes: [33, 34, 32, 12],
    diagrams: ["app-flow", "overview"],
  },
  "app-intent-scan.html": {
    title: "AI 分析过程",
    subtitle: "扫描动效 · 跳转中控",
    notes: [34, 32, 19],
    diagrams: ["app-flow"],
  },
  "app-intent-dashboard.html": {
    title: "意向洞察中控",
    subtitle: "分布环图 · KPI · TOP3",
    notes: [35, 17, 18, 22],
    diagrams: ["app-flow", "e2e"],
  },
  "app-intent-list.html": {
    title: "意向学员列表",
    subtitle: "高/中/低 Tab · 快捷进入详情",
    notes: [36, 22, 24, 18],
    diagrams: ["app-flow"],
  },
  "app-student-detail.html": {
    title: "学员意向详情",
    subtitle: "意向块 · 跟进只读 · 课程推荐",
    notes: [37, 22, 26, 25, 38, 31],
    diagrams: ["app-flow", "e2e"],
  },
};
