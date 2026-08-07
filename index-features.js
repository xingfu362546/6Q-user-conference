/* 学员意向分析 · 三端功能清单与注释（index 专用） */
window.INTENT_FEATURE_SPEC = {
  notes: {
    1: {
      title: "标签计算范围：全平台",
      body: "<p>二级标签规则面向<strong>全平台学员</strong>批处理计算，写入命中快照 <code>tag_member_snapshot</code>。</p><p>会务侧仅取 <strong>本期名单 ∩ 快照命中</strong>，不在会务页重算规则。</p>",
      mermaid: "flowchart LR\n  P1[全平台学员] --> P2[标签批处理]\n  P2 --> P3[(命中快照)]\n  C1[(本期名单)] --> C2[意向分析]\n  P3 -->|member_id| C2",
    },
    2: {
      title: "一级/二级标签层级",
      body: "<ul><li><strong>一级分类</strong>：平台预置（用户偏好/基础属性/用户分层/金融属性/用户行为等），运营<strong>不可新建一级</strong>。</li><li><strong>二级标签</strong>：运营在一级下创建；规则、权重、计算均挂在二级。</li><li>会务策略模板选标签时，交互与标签管理一致：先一级再二级多选。</li></ul>",
    },
    3: {
      title: "覆盖人数与计算状态",
      body: "<p>列表展示<strong>上次成功版本</strong>的覆盖人数；计算失败时仍显示该值，避免运营误判为 0 人。</p><p>一级行不展示覆盖人数/编码；二级行展示完整运维信息。</p>",
    },
    4: {
      title: "二级标签操作集",
      body: "<ul><li><strong>编辑</strong>：改名称、自然语言意图、更新方式。</li><li><strong>复制</strong>：跳转新增页预填 NL 与已确认 SQL，名称需重填。</li><li><strong>执行历史</strong>：仅二级标签；版本内可「本版本无效」与查看本次 SQL。</li><li><strong>立即计算</strong>：复用已确认 SQL。</li><li><strong>停用</strong>：停用后不再参与新快照。</li></ul>",
    },
    5: {
      title: "自然语言圈选与数据范围（v1.1）",
      body: "<p><strong>一期</strong>用自然语言描述意图，由智能体生成只读 SQL（结果集仅 <code>member_id</code>）。</p><ul><li>数据范围：固定数仓连接 + 研发表白名单；页上只读。</li><li><strong>原可视化规则配置（条件行/条件组/且或）一期不做</strong>，脚本保留不加载。</li></ul>",
      mermaid: "flowchart LR\n  N[自然语言] --> AI[智能体写SQL]\n  AI --> R[解读+预估]\n  R --> C[确认并计算]\n  C --> S[(命中快照)]",
    },
    6: {
      title: "NL→SQL 生成与确认",
      body: "<p>按钮：<strong>保存草稿</strong> / <strong>生成 SQL</strong> / <strong>确认并计算</strong>。</p><p>右侧展示 SQL、人话解读、预估人数。修改自然语言后进入脏状态：旧 SQL 保留告警，须重新生成后才能确认。</p><p>例行更新<strong>复用已确认 SQL</strong>，不每次调 AI。</p>",
    },
    7: {
      title: "标签全局权重",
      body: "<p>每条二级标签配置<strong>全局权重</strong>（数值），供会务意向分公式使用：</p><p><code>意向分 = Σ(已命中标签权重) + AI分(0~25)</code></p><p>权重在标签平台维护；会务与 APP <strong>只读</strong>，不可按期次改权重。</p>",
    },
    8: {
      title: "确认并计算",
      body: "<p>确认已生成 SQL 后触发批处理，写入当日版本快照（YYYYMMDD）。</p><p>草稿仅保存名称/NL/更新方式；未确认 SQL 不参与例行。</p>",
    },
    9: {
      title: "执行历史页规则（v1.1）",
      body: "<ul><li>入口：仅<strong>二级标签</strong>。</li><li>成功版本 Tab：<strong>命中用户</strong>（可单行无效）｜<strong>本次 SQL</strong>。</li><li>无效仅影响<strong>本版本</strong>；重算仍可能再命中。</li><li>失败版本：空表 + 错误说明。</li></ul>",
    },
    10: {
      title: "数据接入（开发态）",
      body: "<p>只读展示接入地址 + 复制按钮；<strong>仅开发可改</strong> endpoint。</p><p>一期不做：健康检查、最近上报量、project/token 展示。</p>",
    },
    11: {
      title: "数据表管理",
      body: "<p><strong>全员只读</strong>：表清单、字段类型、字段详情（右侧抽屉）。</p><p>不可删表；不做「被 N 个标签引用」列（二期可考虑）。</p>",
    },
    12: {
      title: "member_id 主键",
      body: "<p>会务学员 <code>member_id</code> 与标签快照 <code>member_id</code> <strong>直接相等</strong>，不做 ID 映射表。</p><p>所有名单、标签、报读、推荐接口必须使用同一主键。</p>",
    },
    13: {
      title: "分析策略模板 · 定位",
      body: "<p>存放在<strong>会务工具</strong>，与具体期次无关；定义可复用的「关注标签 + 意向度」完整 JSON。</p><p>权限：<strong>会务统筹配置</strong>角色可增删改；其他人不可见或只读（按权限表）。</p>",
    },
    14: {
      title: "模板列表能力",
      body: "<ul><li>展示：名称、说明、关注标签数、意向度方式、更新时间。</li><li>操作：编辑、<strong>删除</strong>（若本期已选用会二次确认；已保存策略快照不受影响）。</li><li>「本期已选用」角标：当前期 <code>templateId</code> 命中时显示。</li></ul>",
    },
    15: {
      title: "关注标签配置",
      body: "<p>从系统标签树多选二级标签；逻辑二选一：</p><ul><li><strong>命中任一</strong>：学员命中集合 ∩ 关注集合 ≠ ∅</li><li><strong>命中全部</strong>：关注集合 ⊆ 学员命中集合</li></ul><p>作用：<strong>仅缩小列表展示范围</strong>，不改变平台是否命中、不改变意向分加总标签范围。</p>",
      mermaid: "flowchart TD\n  A[选关注标签树] --> B{逻辑}\n  B -->|任一| C[交集非空]\n  B -->|全部| D[关注⊆命中]\n  C --> E[进入列表]\n  D --> E",
    },
    16: {
      title: "意向度 · 二选一",
      body: "<p>每期策略<strong>只能选一种</strong>意向度统计方式，保存后生效：</p><ul><li><strong>A 按权重分</strong>：用意向分比三个阈值得高/中/低/未分级</li><li><strong>B 按命中标签</strong>：用高/中/低三组标签组合判定，不用分数切档</li></ul>",
      mermaid: "flowchart LR\n  CFG[模板/本期策略] --> MODE{意向度方式}\n  MODE -->|A| T[高≥/中≥/低≥ 阈值]\n  MODE -->|B| TAG[高/中/低 标签组合]",
    },
    17: {
      title: "意向度 A：按权重分",
      body: "<p>配置三个阈值（示例：高≥70，中≥45，低≥25）。判定顺序：<strong>高 → 中 → 低 → 未分级</strong>。</p><p>输入为 §意向分（标签权重和 + AI 分）</p>",
      mermaid: "flowchart TD\n  S[意向分] --> H{≥高阈值?}\n  H -->|是| R1[高]\n  H -->|否| M{≥中阈值?}\n  M -->|是| R2[中]\n  M -->|否| L{≥低阈值?}\n  L -->|是| R3[低]\n  L -->|否| R0[未分级]",
    },
    18: {
      title: "意向度 B：按命中标签",
      body: "<ul><li>高/中/低各配一组标签 + 组内<strong>任一/全部</strong>逻辑。</li><li>判定顺序：高组合 → 中 → 低 → 未分级。</li><li><strong>允许</strong>同一标签出现在多档；命中多档时展示取最高档。</li><li>本方式<strong>不使用</strong>意向分阈值切档，但列表仍展示意向分供排序参考。</li></ul>",
      mermaid: "flowchart TD\n  HIT[学员命中标签集合] --> GH{满足高组合?}\n  GH -->|是| R1[高]\n  GH -->|否| GM{满足中组合?}\n  GM -->|是| R2[中]\n  GM -->|否| GL{满足低组合?}\n  GL -->|是| R3[低]\n  GL -->|否| R0[未分级]",
    },
    19: {
      title: "本期分析策略 · 流程",
      body: "<p>每期会务独立实例 <code>biz_conference_intent_config</code>：</p><ol><li>从下拉<strong>选用模板</strong>（可预览规则）</li><li>或<strong>复制上期</strong>策略</li><li>点击<strong>保存本期策略并重算</strong></li></ol><p>保存后：版本号递增、列表立即重算、APP 清除已分析缓存并强制重跑分析动效。</p>",
      mermaid: "sequenceDiagram\n  participant U as 会务统筹\n  participant T as 策略模板\n  participant C as 本期策略\n  participant L as 意向列表\n  participant A as APP\n  U->>T: 选用模板\n  U->>C: 保存\n  C->>L: 重算分/度/筛\n  C->>A: version++ 触发重扫",
    },
    20: {
      title: "未配置引导",
      body: "<p>本期未保存策略时，「学员意向分析」页展示<strong>空态引导条</strong> + 按钮跳转「本期分析策略」。</p><p><strong>禁止</strong>静默使用系统默认策略出数（产品已确认）。</p>",
    },
    21: {
      title: "策略摘要条（只读）",
      body: "<p>分析页顶部只读展示：模板名、关注标签摘要、意向度方式、保存时间。</p><p>本页<strong>不可编辑</strong>规则；修改须去「本期分析策略」或「分析策略模板」。</p>",
    },
    22: {
      title: "意向分公式",
      body: "<p><code>意向分 = Σ(该学员所有已命中标签的平台权重) + AI权重分</code></p><ul><li>AI 分 ∈ [0, 25]</li><li>加总标签<strong>不限于</strong>「关注标签」子集</li><li>列表默认按意向分<strong>降序</strong></li></ul>",
      mermaid: "flowchart LR\n  T[命中标签] --> SUM[Σ权重]\n  AI[AI分0-25] --> ADD[+]\n  SUM --> ADD\n  ADD --> SCORE[意向分]",
    },
    23: {
      title: "列表 · 学员列",
      body: "<p>展示<strong>姓名、会员 ID、手机脱敏</strong>；数据来自本期会务名单，与报读/签到/跟进口径一致。</p><p>点击行或「查看明细」打开右侧抽屉；排序默认按意向分，搜索不改变列结构。</p>",
    },
    24: {
      title: "列表 · 命中标签列",
      body: "<p>Chip 展示本期快照命中的二级标签（一级路径作副标题）。</p><p>与「关注标签」无关：关注标签只决定是否出现在列表中。</p>",
    },
    25: {
      title: "列表 · 跟进内容（当前会务）",
      body: "<p><strong>v1.0.2</strong> 列名更正为「跟进内容（当前会务）」：取<strong>本期会务</strong>下该学员最新/汇总跟进人工原文；过长截断 + tooltip 全文。</p><p>跨会务历史跟进见<strong>画像档案 · 跟进记录 · 查看更多</strong>（已从意向抽屉迁出）。</p><p>录入入口在「会务跟进」菜单；保存后异步触发 AI。</p>",
    },
    26: {
      title: "列表 · AI 提炼列",
      body: "<p>独立列展示 AI <strong>短摘要</strong>；完整分析在抽屉。</p><p>AI 输入：命中标签 + 跟进原文（+ 行为摘要可选）。</p>",
    },
    27: {
      title: "行为明细归画像档案（v1.0.2）",
      body: "<p><strong>v1.0.2</strong>：意向分析列表<strong>不再</strong>展示社区/学习/视频/直播列。</p><p>四类明细统一在<strong>画像档案 · 近期行为明细</strong>：卡片四 Tab 各预览 5 条 +「查看更多」抽屉全量。</p><ul><li>社区：关联话题 / 内容 / 创建时间</li><li>学习：课程 / 学习次数 / 更新时间</li><li>视频：标题 / ID / 标签 / 观看时间</li><li>直播：直播团队 + 场次 / 时长 / 成交</li></ul>",
    },
    28: {
      title: "列表 · 推荐课程列（后台）",
      body: "<p>展示 AI 主推产品名 + 匹配度；详情在抽屉。</p><p>规则见课程推荐方案：产品级、不排除已报读、不可人工改排序。</p>",
    },
    29: {
      title: "学员明细抽屉（v1.0.2）",
      body: "<ul><li><strong>标签命中</strong>：命中标签、权重明细、意向度徽章</li><li><strong>洞察与推荐</strong>：跟进内容（当前会务）+ AI + 产品推荐</li><li><strong>已迁出</strong>：历史跟进、行为四 Tab → 画像档案</li><li><strong>姓名点击</strong>：跳转画像档案页（页顶落地）</li></ul>",
      mermaid: "flowchart LR\n  ROW[列表行] --> NAME[点姓名]\n  NAME --> PF[画像档案]\n  ROW --> DR[查看明细]\n  DR --> T1[标签命中]\n  DR --> T2[洞察与推荐]\n  PF --> B[行为四Tab]\n  PF --> F[跟进查看更多]",
    },
    41: {
      title: "画像档案 · 定位（v1.0.1→v1.0.2）",
      body: "<p>会员<strong>全局档案</strong>（member_id）；会务学员信息仅作入口上下文。</p><p>独立页打开；事实聚合 + 图表；<strong>不含</strong>商机/AI 诊断。</p>",
    },
    42: {
      title: "画像档案 · 家庭组与关系图谱（v1.0.2）",
      body: "<ul><li><strong>家庭组</strong>：家庭ID + 成员表（编号/姓名/性别/身份/手机），高亮本人。</li><li><strong>关系图谱</strong>：推荐/归属双边、仅当前生效、1跳；环形分区交互图；箭头业务方向，实线主动/虚线被动。</li><li>位置：右栏，替换原「跟进类型占比」环图。</li></ul>",
    },
    43: {
      title: "画像档案 · 基础信息补齐（v1.0.2）",
      body: "<p>对齐会员详情：身份与状态、关系人摘要（归属/推荐）、认证与人口属性、社会属性与联系。</p>",
    },
    44: {
      title: "会务后台版本封版",
      body: "<ul><li><strong>v1.0.0</strong>：策略模板 + 本期策略 + 意向分析列表基线</li><li><strong>v1.0.1</strong>：学员信息入口 + 画像档案三栏首版</li><li><strong>v1.0.2</strong>：家庭组/关系图谱/基础信息/AI；行为与跟进归画像；意向列表精简</li><li><strong>v1.0.3</strong>（当前）：6Q 面谈官独立门户（会员登录、选进行中会务、只读意向/画像）</li></ul><p>导航：<code>6q-conference-prototype/index.html</code>；门户：<code>6q-interviewer-portal/</code></p>",
    },
    45: {
      title: "画像档案 · 行为与跟进抽屉（v1.0.2）",
      body: "<ul><li><strong>近期行为</strong>：社区/学习/视频/直播四 Tab，预览 5 条 + 查看更多全量抽屉</li><li><strong>跟进记录</strong>：卡片预览 + 查看更多抽屉（会员详情字段）</li><li>承接原意向分析中的行为明细与历史跟进</li></ul>",
    },
    46: {
      title: "6Q 面谈官门户（v1.0.3）",
      body: "<p>独立 PC 门户：会员账号登录（手机/邮箱+密码+验证码）→ 选进行中会务 → 只读意向列表/明细抽屉 → 画像（含 AI）。</p><ul><li>角色来自会务内「面谈官」赋权；看会务全部学员</li><li>不搬策略配置；无跟进入录/导出</li><li>无会务空态：「当前无正在进行中的会务」</li></ul><p>入口：<code>6q-interviewer-portal/login.html</code></p>",
    },
    30: {
      title: "搜索与导出",
      body: "<p>搜索：姓名 / 手机号 / 会员 ID 模糊过滤（前端或接口）。</p><p>导出：原型占位；二期 Excel/PDF。</p>",
    },
    31: {
      title: "跟进 + AI 触发",
      body: "<p>触发时机：</p><ul><li>跟进保存后<strong>异步</strong>分析</li><li>分析页/抽屉<strong>手动重分析</strong>（可选）</li></ul><p>产出：AI 分、短摘要、长文；写入 insight 表供列表读取。</p>",
      mermaid: "flowchart TD\n  F[跟进录入] --> DB[(跟进表)]\n  DB --> TRG{触发}\n  TRG --> AI[AI服务]\n  TAG[命中标签] --> AI\n  AI --> INS[(insight)]\n  INS --> COL[列表AI列+意向分]",
    },
    32: {
      title: "APP · 策略版本与重扫",
      body: "<p>后台保存本期策略 → <code>intent_strategy_version</code> 递增。</p><p>APP 对比本地已分析版本，不一致则<strong>强制重跑</strong> AI 分析动效页，避免旧策略下展示过期结果。</p>",
    },
    33: {
      title: "APP · 学员列表入口",
      body: "<p>复刻会务 APP 学员列表；顶部<strong>AI 意向洞察</strong>横幅入口进入分析链路。</p><p>列表仍为会务本期学员；与后台同一批 <code>member_id</code>。</p>",
    },
    34: {
      title: "APP · AI 分析动效页",
      body: "<p>展示扫描/分析过程（白底 + 橙蓝动效）；结束后跳转<strong>意向洞察中控</strong>。</p><p>纯展示 + 路由，计算在服务端或预加载数据。</p>",
      mermaid: "flowchart LR\n  L[学员列表] --> S[AI分析动效]\n  S --> D[意向中控]",
    },
    35: {
      title: "APP · 意向洞察中控",
      body: "<ul><li>环形图：高/中/低/未分级人数分布（与后台 KPI 同源）</li><li>KPI 卡片：高意向数、可跟进数等</li><li>优先跟进 TOP3 学员快捷入口（按意向分或策略规则排序）</li><li>点击档位扇区或 KPI → 进入<strong>意向学员列表</strong>对应 Tab</li><li>数据依赖本期已保存策略；未配置时不应进入（由入口层拦截）</li></ul>",
      mermaid: "flowchart LR\n  D[意向中控] -->|点高意向| L1[高意向列表]\n  D -->|点中意向| L2[中意向列表]\n  D -->|TOP3卡片| DET[学员详情]\n  L1 --> DET\n  L2 --> DET",
    },
    36: {
      title: "APP · 意向学员列表",
      body: "<p>按档位 Tab（高/中/低）过滤；展示姓名、意向分、关键标签摘要。</p><p>进入<strong>学员意向详情</strong>。</p>",
    },
    37: {
      title: "APP · 学员详情 · 意向块",
      body: "<p>意向度徽章、意向分、命中标签列表、AI 一句话总结。</p><p>跟进记录只读展示（不含编辑，编辑回后台跟进菜单）。</p>",
    },
    38: {
      title: "APP · 课程产品推荐",
      body: "<ul><li><strong>主推产品</strong> + 匹配度 + 一句话 pitch</li><li><strong>备选</strong> 1~2 个</li><li>展示<strong>已报读/已购买/两者</strong>标签 + 工作人员提醒（复训/权益）</li><li>参考 SKU 价格区间，<strong>不以 SKU 为推荐单位</strong></li><li><strong>不可</strong>在 APP 改推荐排序或结果</li><li><strong>不强制</strong>插入本期会务主题产品</li></ul>",
      mermaid: "flowchart TB\n  KB[产品知识库] --> AI[推荐模型]\n  TAG[标签命中] --> AI\n  FU[跟进] --> AI\n  EN[报读/购买] --> AI\n  AI --> OUT[主推+备选+relation状态]",
    },
    39: {
      title: "端到端数据流",
      body: "<p>数仓 → 标签平台快照 → 会务名单 ∩ 命中 → 策略筛/分级 → 列表/APP；跟进 → AI → 意向分/推荐。</p>",
      mermaid: "sequenceDiagram\n  participant DW as 数仓\n  participant Tag as 标签平台\n  participant Conf as 会务后台\n  participant AI as AI\n  DW->>Tag: 行为/属性\n  Tag->>Tag: 批处理快照\n  Conf->>Conf: 本期策略\n  Conf->>Tag: 读快照\n  Conf->>AI: 跟进+标签\n  AI->>Conf: 分/摘要/推荐",
    },
    40: {
      title: "一期不做",
      body: "<ul><li>会务页新建/编辑标签规则</li><li>实时秒级画像（默认 T+1/小时批处理）</li><li>列表页左侧可编辑策略（已拆至独立菜单）</li><li>人工修改 AI 推荐结果</li><li>会务展示标签快照版本号</li></ul>",
    },
  },

  terminals: [
    {
      id: "tag",
      name: "用户标签平台",
      tag: "数据与规则层",
      color: "#059669",
      entry: "user-tag-admin/tag-list.html",
      modules: [
        {
          name: "标签中心 · 标签管理",
          href: "user-tag-admin/tag-list.html",
          items: [
            { text: "树形列表：一级分类 + 二级标签", notes: [1, 2, 3] },
            { text: "筛选：分类 / 状态 / 关键词", notes: [3] },
            { text: "二级行：覆盖人数（上次成功版本）", notes: [3] },
            { text: "操作：编辑、复制规则、执行历史、立即计算、停用", notes: [4] },
            { text: "顶栏「新增二级标签」", notes: [2, 5] },
          ],
        },
        {
          name: "标签中心 · 新增/编辑标签",
          href: "user-tag-admin/tag-create.html",
          items: [
            { text: "基础信息：名称、所属一级、更新方式（手动/例行）", notes: [8] },
            { text: "自然语言描述圈选意图（v1.1）", notes: [5, 6] },
            { text: "数据范围只读（固定数仓 + 表白名单）", notes: [5, 10] },
            { text: "生成 SQL → 解读 + 预估人数", notes: [6] },
            { text: "确认并计算；例行复用已确认 SQL", notes: [6, 8] },
            { text: "原可视化规则构建 · 一期不做", notes: [5] },
            { text: "标签全局权重（参与意向分 Σ）", notes: [7, 22] },
            { text: "复制：预填 NL/SQL，名称需重填", notes: [4] },
          ],
        },
        {
          name: "标签中心 · 执行历史",
          href: "user-tag-admin/tag-history.html",
          items: [
            { text: "仅二级标签可进入", notes: [9] },
            { text: "版本号 = 计算日期 YYYYMMDD", notes: [9] },
            { text: "Tab：命中用户（可本版本无效）｜本次 SQL", notes: [9] },
            { text: "失败版本：空表 + 错误信息", notes: [9] },
          ],
        },
        {
          name: "数据资产 · 数据接入",
          href: "user-tag-admin/data-access.html",
          items: [
            { text: "只读 endpoint + 复制", notes: [10] },
            { text: "仅开发可修改接入配置", notes: [10] },
          ],
        },
        {
          name: "数据资产 · 数据表管理",
          href: "user-tag-admin/data-tables.html",
          items: [
            { text: "表清单：库名、表名、说明、更新时间", notes: [11] },
            { text: "字段详情抽屉：类型、可空、样例", notes: [11, 5] },
            { text: "全员只读，不可删表", notes: [11] },
          ],
        },
      ],
    },
    {
      id: "pc",
      name: "会务后台 PC",
      tag: "v1.0.2 · 策略+档案+分析",
      color: "#4f46e5",
      entry: "6q-conference-prototype/",
      modules: [
        {
          name: "【版本导航】按版本追溯功能变更",
          href: "6q-conference-prototype/index.html",
          items: [
            { text: "v1.0.2（当前）/ v1.0.1 / v1.0.0 模块与功能清单", notes: [44] },
            { text: "文档：6q-conference-prototype/docs/FEATURE-CHANGELOG.md", notes: [44] },
          ],
        },
        {
          name: "面谈官门户（独立端）",
          href: "6q-interviewer-portal/login.html",
          items: [
            { text: "[v1.0.3] 手机/邮箱+密码登录 + 图形验证码", notes: [46] },
            { text: "[v1.0.3] 选择进行中会务；无会务空态", notes: [46] },
            { text: "[v1.0.3] 只读意向列表 + 查看明细 + 画像", notes: [46, 29, 45] },
            { text: "[v1.0.3] 不包含策略配置/跟进入录/导出", notes: [46] },
          ],
        },
        {
          name: "会务工具 · 分析策略模板",
          href: "6q-conference-prototype/tools-intent-strategy-template.html",
          items: [
            { text: "[v1.0.0] 模板列表：名称、说明、关注标签数、意向度方式、更新时间", notes: [13, 14] },
            { text: "[v1.0.0] 新建 / 编辑 / 删除模板", notes: [13, 14] },
            { text: "[v1.0.0] 删除：若本期已选用二次确认；已保存快照不受影响", notes: [14, 19] },
            { text: "[v1.0.0] 权限：会务统筹配置角色", notes: [13] },
          ],
        },
        {
          name: "会务工具 · 编辑模板",
          href: "6q-conference-prototype/tools-intent-strategy-template-edit.html",
          items: [
            { text: "[v1.0.0] 模板名称、说明", notes: [13] },
            { text: "[v1.0.0] ① 关注标签：系统标签树多选 + 任一/全部", notes: [15, 2] },
            { text: "[v1.0.0] ② 意向度：按权重分 OR 按命中标签（二选一）", notes: [16] },
            { text: "[v1.0.0] 方式 A：高/中/低 三个分值阈值", notes: [17, 22] },
            { text: "[v1.0.0] 方式 B：高/中/低 三组标签 + 组内任一/全部", notes: [18] },
            { text: "[v1.0.0] 保存模板 → 供各期选用", notes: [13, 19] },
          ],
        },
        {
          name: "会务详情 · 本期分析策略",
          href: "6q-conference-prototype/conference-intent-strategy.html",
          items: [
            { text: "[v1.0.0] 下拉选用分析策略模板 + 规则预览", notes: [19] },
            { text: "[v1.0.0] 复制上期策略", notes: [19] },
            { text: "[v1.0.0] 保存本期策略并重算（版本号++）", notes: [19, 32] },
            { text: "[v1.0.0] 已保存策略预览 + 高/中/低人数分布", notes: [19] },
            { text: "[v1.0.0] 跳转学员意向分析 / 管理模板", notes: [20, 21] },
          ],
        },
        {
          name: "会务详情 · 学员信息",
          href: "6q-conference-prototype/conference-students.html",
          items: [
            { text: "[v1.0.1] 会务子导航启用「学员信息」", notes: [41] },
            { text: "[v1.0.1] 操作列「画像档案」入口", notes: [41] },
          ],
        },
        {
          name: "会务详情 · 画像档案",
          href: "6q-conference-prototype/conference-student-profile.html?id=m10009",
          items: [
            { text: "[v1.0.1] 三栏事实档案：系统标签 / 购课复购 / 跟进退款行为", notes: [41] },
            { text: "[v1.0.1] 购课按课程产品计次；复购=同产品≥2；退款订单口径", notes: [41] },
            { text: "[v1.0.1] 图表：购课条形 + 近30天行为折线（无商机诊断）", notes: [41] },
            { text: "[v1.0.2] 家庭组：家庭ID + 成员表，高亮本人", notes: [42] },
            { text: "[v1.0.2] 关系图谱：推荐/归属双边·1跳·当前生效·环形交互图", notes: [42] },
            { text: "[v1.0.2] 基础信息补齐：身份状态 / 关系人 / 认证 / 社会属性", notes: [43] },
            { text: "[v1.0.2] 社区活跃按话题名称细拆", notes: [42] },
            { text: "[v1.0.2] 近期行为四 Tab + 查看更多抽屉（社区/学习/视频/直播）", notes: [27, 45] },
            { text: "[v1.0.2] 跟进记录查看更多抽屉（承接历史跟进）", notes: [45] },
            { text: "[v1.0.2] AI 分析对话：4 chips（跟进/话术/消费力/购课建议）+ 自由洞察", notes: [41, 45] },
          ],
        },
        {
          name: "会务详情 · 学员意向分析",
          href: "6q-conference-prototype/conference-student-intent.html",
          items: [
            { text: "[v1.0.0] 未配置空态引导；已配置只读策略摘要 + KPI", notes: [20, 21] },
            { text: "[v1.0.0] 列：学员、意向分、意向度、命中标签、AI、推荐", notes: [22, 23, 24, 26, 28] },
            { text: "[v1.0.2] 列名：跟进内容（当前会务）", notes: [25] },
            { text: "[v1.0.2] 行为列/历史跟进已迁出 → 画像档案", notes: [27, 45] },
            { text: "[v1.0.2] 查看明细仅保留：标签命中 + 洞察与推荐", notes: [29] },
            { text: "[v1.0.2] 点击学员姓名 → 画像档案", notes: [29] },
            { text: "导出（二期占位）", notes: [30, 40] },
          ],
        },
        {
          name: "关联 · 跟进记录（已有菜单）",
          href: "6q-conference-prototype/conference-detail-basic.html",
          items: [
            { text: "[v1.0.0] 人工录入：跟进内容、跟进标签、图片", notes: [25, 31] },
            { text: "[v1.0.0] 保存后触发 AI 异步分析", notes: [31] },
            { text: "[v1.0.0] 数据范围：仅本期会务 × 该学员", notes: [25] },
          ],
        },
      ],
    },
    {
      id: "app",
      name: "会务 APP",
      tag: "现场执行",
      color: "#f39800",
      entry: "6q-conference-app-prototype/",
      modules: [
        {
          name: "学员列表（入口）",
          href: "6q-conference-app-prototype/app-students.html",
          items: [
            { text: "本期学员列表（与会务后台同源）", notes: [12, 33] },
            { text: "AI 意向洞察横幅 → 进入分析链路", notes: [33, 34] },
            { text: "策略版本变化 → 强制重跑分析动效", notes: [32, 19] },
          ],
        },
        {
          name: "AI 分析过程",
          href: "6q-conference-app-prototype/app-intent-scan.html",
          items: [
            { text: "全屏分析动效（扫描视觉）", notes: [34] },
            { text: "结束后进入意向洞察中控", notes: [34] },
            { text: "与后台同一套策略版本绑定", notes: [32] },
          ],
        },
        {
          name: "意向洞察中控",
          href: "6q-conference-app-prototype/app-intent-dashboard.html",
          items: [
            { text: "环形分布：高/中/低/未分级", notes: [35, 17, 18] },
            { text: "KPI：高意向人数、待跟进等", notes: [35] },
            { text: "优先跟进 TOP3", notes: [35] },
            { text: "点击档位 → 意向学员列表", notes: [36] },
          ],
        },
        {
          name: "意向学员列表",
          href: "6q-conference-app-prototype/app-intent-list.html",
          items: [
            { text: "Tab：高 / 中 / 低意向", notes: [36, 18] },
            { text: "展示意向分、关键标签摘要", notes: [22, 24] },
            { text: "进入学员意向详情", notes: [37] },
          ],
        },
        {
          name: "学员意向详情",
          href: "6q-conference-app-prototype/app-student-detail.html",
          items: [
            { text: "意向度、意向分、命中标签", notes: [37, 22] },
            { text: "AI 一句话总结 + 完整分析入口", notes: [26, 31] },
            { text: "会务跟进只读", notes: [25, 37] },
            { text: "AI 课程产品推荐：主推 + 备选", notes: [38] },
            { text: "已报读/已购买状态 + 工作人员提醒", notes: [38] },
            { text: "参考 SKU 价格区间；不可改推荐", notes: [38, 40] },
          ],
        },
      ],
    },
  ],

  globalFlows: [
    {
      title: "系统总数据流",
      notes: [39],
    },
    {
      title: "意向分与意向度",
      notes: [22, 16, 17, 18],
    },
    {
      title: "策略配置到出数",
      notes: [19, 15, 20],
    },
    {
      title: "会务后台版本封版说明",
      notes: [44, 46, 41, 42, 43, 45],
    },
  ],

  /** 会务后台 PC · 按版本追溯（供根清单与原型导航对齐） */
  conferenceVersions: [
    {
      id: "v103",
      version: "v1.0.3",
      date: "2026-08-05",
      current: true,
      theme: "6Q 面谈官独立门户（只读查档）",
      href: "6q-interviewer-portal/login.html",
      modules: [
        {
          name: "面谈官门户",
          href: "6q-interviewer-portal/login.html",
          changes: [
            "手机/邮箱+密码登录；选进行中会务；空态文案",
            "只读意向列表+明细抽屉；点姓名进画像（含AI）",
            "不包含策略配置/跟进入录/导出",
          ],
        },
      ],
    },
    {
      id: "v102",
      version: "v1.0.2",
      date: "2026-08-05",
      current: false,
      theme: "画像档案增强 + 行为/跟进归档案；意向列表精简",
      href: "6q-conference-prototype/index.html#v102",
      modules: [
        {
          name: "学员信息 / 画像档案",
          href: "6q-conference-prototype/conference-student-profile.html?id=m10009",
          changes: [
            "家庭组、关系图谱、基础信息补齐、社区话题细拆、AI 对话",
            "近期行为四 Tab（预览5条）+ 查看更多抽屉全量",
            "跟进记录查看更多抽屉（承接历史跟进）",
          ],
        },
        {
          name: "学员意向分析",
          href: "6q-conference-prototype/conference-student-intent.html",
          changes: [
            "列表「跟进内容」→「跟进内容（当前会务）」",
            "删除社区/学习/视频/直播列与抽屉 Tab；历史跟进迁画像",
            "查看明细仅标签命中 + 洞察与推荐；点姓名进档案",
          ],
        },
      ],
    },
    {
      id: "v101",
      version: "v1.0.1",
      date: "2026-08-03",
      theme: "学员画像档案首版",
      href: "6q-conference-prototype/index.html#v101",
      modules: [
        {
          name: "学员信息",
          href: "6q-conference-prototype/conference-students.html",
          changes: ["启用菜单", "操作列「画像档案」入口"],
        },
        {
          name: "画像档案（新建）",
          href: "6q-conference-prototype/conference-student-profile.html?id=m10009",
          changes: [
            "三栏事实聚合 + 系统标签",
            "购课/复购/退款/跨会务跟进",
            "购课条形 + 行为折线 + 跟进类型环图",
          ],
        },
      ],
    },
    {
      id: "v100",
      version: "v1.0.0",
      date: "基线",
      theme: "意向分析与策略配置",
      href: "6q-conference-prototype/index.html#v100",
      modules: [
        {
          name: "分析策略模板 / 本期策略 / 学员意向分析",
          href: "6q-conference-prototype/conference-student-intent.html",
          changes: [
            "策略模板与本期策略配置",
            "意向列表与明细抽屉（行为仅摘要）",
          ],
        },
      ],
    },
  ],
};
