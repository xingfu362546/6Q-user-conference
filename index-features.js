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
      body: "<ul><li><strong>编辑</strong>：改名称、规则、权重、更新方式（数据源创建后运营不可改源）。</li><li><strong>复制规则</strong>：跳转新增页预填规则，名称需重填。</li><li><strong>执行历史</strong>：仅二级标签；版本号 = 计算日期 YYYYMMDD。</li><li><strong>立即计算</strong>：手动模式也可触发。</li><li><strong>停用</strong>：停用后不再参与新快照（历史仍可读策略）。</li></ul>",
    },
    5: {
      title: "规则类型与数据源",
      body: "<ul><li><strong>用户属性</strong>：选数据表→字段，适合注册渠道、会员等级等。</li><li><strong>行为事件</strong>：事件名 + 条件 + <strong>必填时间范围</strong>。</li><li><strong>页面行为</strong>：页面/模块级行为，同属行为类，必填时间窗。</li><li>字段名来自<strong>数据表元数据</strong>技术字段，不预置中文别名。</li></ul>",
      mermaid: "flowchart TD\n  A[选数据源] --> B{规则类型}\n  B -->|属性| C[表+字段条件]\n  B -->|行为/页面| D[事件+时间范围+条件]\n  C --> E[规则试算人数]\n  D --> E\n  E --> F[保存并计算]",
    },
    6: {
      title: "规则逻辑：且/或",
      body: "<p>规则构建器顶层与各嵌套条件组均支持 <strong>且 / 或</strong> 切换。</p><p>顶部展示<strong>自然语言规则摘要</strong> + 预估命中人数试算（见 RULE_OPTIMIZATION）。</p>",
    },
    7: {
      title: "标签全局权重",
      body: "<p>每条二级标签配置<strong>全局权重</strong>（数值），供会务意向分公式使用：</p><p><code>意向分 = Σ(已命中标签权重) + AI分(0~25)</code></p><p>权重在标签平台维护；会务与 APP <strong>只读</strong>，不可按期次改权重。</p>",
    },
    8: {
      title: "保存并计算",
      body: "<p>新增/编辑标签点击「保存并计算」→ <strong>立即触发</strong>该标签批处理（含手动更新模式标签）。</p><p>成功后写入新版本快照；失败版本在执行历史可见错误信息，不可导出。</p>",
    },
    9: {
      title: "执行历史页规则",
      body: "<ul><li>入口：仅<strong>二级标签</strong>行操作。</li><li>表格「标签」列固定为当前标签名。</li><li>失败版本：侧栏可选，右侧空表 + 错误说明。</li></ul>",
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
      title: "列表 · 跟进内容列",
      body: "<p>取<strong>本期会务</strong>下该学员最新/汇总跟进人工原文；过长截断 + tooltip 全文。</p><p>录入入口在「会务跟进」菜单（本页与抽屉均不提供新建跟进，避免与分析视图职责混淆）。</p><p>保存跟进后会异步触发 AI，AI 列更新有延迟属正常现象。</p>",
    },
    26: {
      title: "列表 · AI 提炼列",
      body: "<p>独立列展示 AI <strong>短摘要</strong>；完整分析在抽屉。</p><p>AI 输入：命中标签 + 跟进原文（+ 行为摘要可选）。</p>",
    },
    27: {
      title: "列表 · 行为摘要列",
      body: "<p>社区 / 学习 / 视频三列：数仓聚合摘要 + tooltip。</p><p>与标签<strong>并重展示</strong>，不互相替代；能标签化的行为优先在标签平台沉淀。</p>",
    },
    28: {
      title: "列表 · 推荐课程列（后台）",
      body: "<p>展示 AI 主推产品名 + 匹配度；详情在抽屉。</p><p>规则见课程推荐方案：产品级、不排除已报读、不可人工改排序。</p>",
    },
    29: {
      title: "学员明细抽屉",
      body: "<ul><li><strong>标签命中</strong>：命中标签、权重明细、意向度徽章</li><li><strong>洞察与推荐</strong>：会务跟进 + AI 提炼 + 产品推荐合并在同一 Tab，自上而下阅读</li><li><strong>360 行为</strong>：社区 / 学习 / 视频三个 Tab（只读数仓摘要）</li></ul>",
      mermaid: "flowchart LR\n  ROW[列表行] --> DR[明细抽屉]\n  DR --> T1[标签命中]\n  DR --> T2[洞察与推荐]\n  T2 --> F[会务跟进]\n  T2 --> A[AI分析]\n  T2 --> R[产品推荐]\n  DR --> T3[社区/学习/视频]",
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
            { text: "数据源选择（创建后运营不可改）", notes: [5, 10] },
            { text: "规则类型：用户属性 / 行为事件 / 页面行为", notes: [5] },
            { text: "行为类必填时间范围；属性类选表字段", notes: [5] },
            { text: "规则构建：且/或 + 嵌套条件组", notes: [6] },
            { text: "规则自然语言摘要 + 预估人数试算", notes: [6] },
            { text: "标签全局权重（参与意向分 Σ）", notes: [7, 22] },
            { text: "保存并计算 → 立即批处理", notes: [8] },
            { text: "复制规则：预填规则，名称需重填", notes: [4] },
          ],
        },
        {
          name: "标签中心 · 执行历史",
          href: "user-tag-admin/tag-history.html",
          items: [
            { text: "仅二级标签可进入", notes: [9] },
            { text: "版本号 = 计算日期 YYYYMMDD", notes: [9] },
            { text: "成功版本：命中人数、耗时、导出（若开放）", notes: [9] },
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
      tag: "策略 + 分析",
      color: "#4f46e5",
      entry: "6q-conference-prototype/",
      modules: [
        {
          name: "会务工具 · 分析策略模板",
          href: "6q-conference-prototype/tools-intent-strategy-template.html",
          items: [
            { text: "模板列表：名称、说明、关注标签数、意向度方式、更新时间", notes: [13, 14] },
            { text: "新建 / 编辑 / 删除模板", notes: [13, 14] },
            { text: "删除：若本期已选用二次确认；已保存快照不受影响", notes: [14, 19] },
            { text: "权限：会务统筹配置角色", notes: [13] },
          ],
        },
        {
          name: "会务工具 · 编辑模板",
          href: "6q-conference-prototype/tools-intent-strategy-template-edit.html",
          items: [
            { text: "模板名称、说明", notes: [13] },
            { text: "① 关注标签：系统标签树多选 + 任一/全部", notes: [15, 2] },
            { text: "② 意向度：按权重分 OR 按命中标签（二选一）", notes: [16] },
            { text: "方式 A：高/中/低 三个分值阈值", notes: [17, 22] },
            { text: "方式 B：高/中/低 三组标签 + 组内任一/全部", notes: [18] },
            { text: "保存模板 → 供各期选用", notes: [13, 19] },
          ],
        },
        {
          name: "会务详情 · 本期分析策略",
          href: "6q-conference-prototype/conference-intent-strategy.html",
          items: [
            { text: "下拉选用分析策略模板 + 规则预览", notes: [19] },
            { text: "复制上期策略", notes: [19] },
            { text: "保存本期策略并重算（版本号++）", notes: [19, 32] },
            { text: "已保存策略预览 + 高/中/低人数分布", notes: [19] },
            { text: "跳转学员意向分析 / 管理模板", notes: [20, 21] },
          ],
        },
        {
          name: "会务详情 · 学员意向分析",
          href: "6q-conference-prototype/conference-student-intent.html",
          items: [
            { text: "未配置：空态引导 → 本期分析策略", notes: [20] },
            { text: "已配置：只读策略摘要条", notes: [21] },
            { text: "汇总 KPI：本期人数 / 关注命中 / 高意向 / 列表数", notes: [15, 17, 18] },
            { text: "搜索：姓名 / 手机 / 会员 ID", notes: [30] },
            { text: "列：学员、意向分、意向度、命中标签", notes: [22, 23, 24, 17, 18] },
            { text: "列：跟进内容、AI 提炼分析", notes: [25, 26, 31] },
            { text: "列：社区 / 学习 / 视频摘要", notes: [27] },
            { text: "列：推荐课程（产品级）", notes: [28, 38] },
            { text: "查看明细抽屉：标签 / 跟进 / AI / 360 / 推荐", notes: [29] },
            { text: "导出（二期占位）", notes: [30, 40] },
          ],
        },
        {
          name: "关联 · 跟进记录（已有菜单）",
          href: "6q-conference-prototype/conference-detail-basic.html",
          items: [
            { text: "人工录入：跟进内容、跟进标签、图片", notes: [25, 31] },
            { text: "保存后触发 AI 异步分析", notes: [31] },
            { text: "数据范围：仅本期会务 × 该学员", notes: [25] },
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
  ],
};
