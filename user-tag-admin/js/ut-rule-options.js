/**
 * 标签规则 · 通用选项字典（前端原型；上线可由接口替换）
 */
window.UT_RULE_OPTIONS = {
  conditionTypes: [
    { value: "attr", label: "用户属性" },
    { value: "event", label: "行为事件" },
    { value: "page", label: "页面行为" },
    { value: "path_seq", label: "页面路径序列" },
  ],

  /* 通用：时间范围（行为事件 / 页面行为） */
  timeMode: [
    { value: "recent", label: "最近" },
    { value: "range", label: "固定区间" },
  ],
  timeRecentPresets: [7, 14, 30, 60, 90],

  /* 通用：比较符 */
  operators: {
    string: [
      { value: "eq", label: "等于" },
      { value: "ne", label: "不等于" },
      { value: "contains", label: "包含" },
      { value: "not_contains", label: "不包含" },
      { value: "empty", label: "为空" },
      { value: "not_empty", label: "不为空" },
    ],
    number: [
      { value: "eq", label: "等于" },
      { value: "ne", label: "不等于" },
      { value: "gt", label: "大于" },
      { value: "gte", label: "大于等于" },
      { value: "lt", label: "小于" },
      { value: "lte", label: "小于等于" },
      { value: "between", label: "介于" },
    ],
    date: [
      { value: "before", label: "早于" },
      { value: "after", label: "晚于" },
      { value: "between", label: "介于" },
      { value: "eq", label: "等于" },
    ],
    bool: [
      { value: "true", label: "为真" },
      { value: "false", label: "为假" },
    ],
    match: [
      { value: "eq", label: "等于" },
      { value: "contains", label: "包含" },
      { value: "prefix", label: "前缀匹配" },
      { value: "regex", label: "正则匹配" },
    ],
  },

  /* 用户属性：字段来自 UT_TABLE_CATALOG（数据表 → 列），不在此写死中文业务字段 */

  /* 行为事件 */
  eventDone: [
    { value: "done", label: "做过" },
    { value: "not_done", label: "未做过" },
  ],
  events: [
    { value: "community_share", label: "社区转发" },
    { value: "community_post", label: "社区发帖" },
    { value: "order_success", label: "下单成功" },
    { value: "pay_success", label: "支付成功" },
    { value: "course_view", label: "课程浏览" },
    { value: "app_launch", label: "App 启动" },
    { value: "login", label: "登录成功" },
  ],
  eventAggregates: [
    { value: "count", label: "总次数" },
    { value: "days", label: "天数" },
  ],

  /* 页面行为 */
  pageDimensions: [
    { value: "path", label: "页面路径" },
    { value: "name", label: "页面名称" },
    { value: "page_id", label: "页面 ID" },
  ],
  pageMetrics: [
    { value: "visit_count", label: "访问次数", unit: "次", valueType: "number" },
    { value: "stay_seconds", label: "停留时长", unit: "秒", valueType: "number" },
  ],

  /* 页面路径序列（A→B→C） */
  pathSeqModes: [
    {
      value: "subsequence",
      label: "子序列（允许中间经过其他页）",
      hint: "在时间窗口内按访问先后，依次出现 A、B、C 即可",
    },
    {
      value: "strict_adjacent",
      label: "严格相邻（一步接一步）",
      hint: "B 必须紧接在 A 之后进入，C 紧接在 B 之后",
    },
  ],
  pathSeqMatch: [
    { value: "eq", label: "等于" },
    { value: "contains", label: "包含" },
    { value: "prefix", label: "前缀匹配" },
  ],
  pathSeqPresets: [
    { value: "/pages/index/index", label: "首页" },
    { value: "/pages/course/list", label: "课程列表" },
    { value: "/pages/course/detail", label: "课程详情" },
    { value: "/pages/order/confirm", label: "下单确认" },
    { value: "/pages/user/profile", label: "个人中心" },
  ],
};
