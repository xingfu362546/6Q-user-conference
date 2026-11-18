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
      title: "自然语言圈选与数据范围（v1.1.0）",
      body: "<p><strong>一期</strong>用自然语言描述意图，由智能体生成只读 SQL（结果集仅 <code>member_id</code>）。</p><ul><li>数据范围：固定数仓连接 + 研发表白名单；页上只读。</li><li><strong>原可视化规则配置（条件行/条件组/且或）一期不做</strong>，脚本保留不加载。</li></ul>",
      mermaid: "flowchart LR\n  N[自然语言] --> AI[智能体写SQL]\n  AI --> R[解读+预估]\n  R --> C[确认并计算]\n  C --> S[(命中快照)]",
    },
    6: {
      title: "NL→SQL 生成与确认",
      body: "<p>按钮：<strong>保存草稿</strong> / <strong>生成 SQL</strong> / <strong>确认并计算</strong>。</p><p>右侧展示 SQL、人话解读、预估人数。修改自然语言后进入脏状态：旧 SQL 保留告警，须重新生成后才能确认。</p><p>例行更新<strong>复用已确认 SQL</strong>，不每次调 AI。</p>",
    },
    7: {
      title: "策略模板 · 关注标签权重（非标签平台）",
      body: "<p>意向分标签部分 = <code>Σ(关注标签 ∩ 命中)</code> 的<strong>策略权重</strong> + AI(0~25)。</p><ul><li>权重在<strong>分析策略模板 / 本期策略</strong>的关注标签上配置，<strong>不在</strong>标签平台。</li><li>未进关注集合的命中标签可展示，但<strong>不计分</strong>。</li></ul>",
    },
    8: {
      title: "确认并计算",
      body: "<p>确认已生成 SQL 后触发批处理，写入当日版本快照（YYYYMMDD）。</p><p>草稿仅保存名称/NL/更新方式；未确认 SQL 不参与例行。</p>",
    },
    9: {
      title: "执行历史页规则（v1.1.0）",
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
      body: "<p>从系统标签树多选二级标签；逻辑二选一：</p><ul><li><strong>命中任一</strong>：学员命中集合 ∩ 关注集合 ≠ ∅</li><li><strong>命中全部</strong>：关注集合 ⊆ 学员命中集合</li></ul><p>作用：<strong>缩小列表</strong> + <strong>挂策略权重计分</strong>。未关注命中标签不加分。</p>",
      mermaid: "flowchart TD\n  A[选关注标签树] --> B{逻辑}\n  B -->|任一| C[交集非空]\n  B -->|全部| D[关注⊆命中]\n  C --> E[进入列表]\n  D --> E\n  A --> W[为每条填策略权重]",
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
      title: "意向分公式与排序",
      body: "<p><code>意向分 = Σ(关注∩命中 的策略权重) + AI权重分(0~25)</code></p><ul><li>列表默认排序：意向分降序 → AI 降序 → 数据更新时间倒序</li><li>「按命中标签」模式：档位由组合判定；意向分仍作参考列与排序</li><li>详情：按权重分显示权重/不计分；按命中标签显示档位组合贡献、不显示权重数字</li></ul>",
      mermaid: "flowchart LR\n  W[关注权重] --> SUM[Σ命中关注]\n  AI[AI分0-25] --> ADD[+]\n  SUM --> ADD\n  ADD --> SCORE[意向分]\n  SCORE --> SORT[排序]",
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
      body: "<p><strong>v1.2.0</strong> 列名更正为「跟进内容（当前会务）」：取<strong>本期会务</strong>下该学员最新/汇总跟进人工原文；过长截断 + tooltip 全文。</p><p>跨会务历史跟进见<strong>画像档案 · 跟进记录 · 查看更多</strong>（已从意向抽屉迁出）。</p><p>录入入口在「会务跟进」菜单；保存后异步触发 AI。</p>",
    },
    26: {
      flag: "changed",
      title: "列表 · AI 提炼列",
      lead: "列表只放一句短摘要；完整快照在抽屉，不是第二个聊天窗。",
      body: "<p>独立列展示 AI <strong>短摘要</strong>。抽屉「洞察与推荐」里的 AI 是只读快照：<strong>结论一句 + 依据若干条 + 下一步</strong>，不写长文。</p><p>下一步按上课层级（沙龙→分享会→一阶→二阶→三阶，终阶谈复训）。可约谈时间只作时间提示。深挖仍走画像分析助手。</p>",
    },
    27: {
      title: "行为明细归画像档案（v1.2.0）",
      body: "<p><strong>v1.2.0</strong>：意向分析列表<strong>不再</strong>展示社区/学习/视频/直播列。</p><p>四类明细统一在<strong>画像档案 · 近期行为明细</strong>：卡片四 Tab 各预览 5 条 +「查看更多」抽屉全量。</p><ul><li>社区：关联话题 / 内容 / 创建时间</li><li>学习：课程 / 学习次数 / 更新时间</li><li>视频：标题 / ID / 标签 / 观看时间</li><li>直播：直播团队 + 场次 / 时长 / 成交</li></ul>",
    },
    28: {
      flag: "changed",
      title: "列表 · 推荐产品列（后台 / 门户）",
      lead: "推荐列两行：主推课程一行；有事业说明会导师/天使意向才出现礼包名称一行。",
      body: "<ul><li><strong>课</strong>：主推课程产品名 + 匹配度；详情在抽屉。</li><li><strong>礼包</strong>：闸门=意向了解方向非空且含导师或天使。无方向则<strong>不存在礼包行</strong>（不是「无」或破折号）。</li><li>可约谈时间不能单独触发出礼包。课程规则仍是产品级、不排除已报读、不可人工改排序。</li></ul>",
    },
    29: {
      flag: "changed",
      title: "学员明细抽屉 · 洞察与推荐",
      lead: "抽屉是跟进保存后异步出的只读快照，不要在这里确认智能匹配。",
      body: "<ul><li><strong>标签命中</strong>：命中标签、权重明细、意向度徽章</li><li><strong>洞察与推荐</strong>：跟进原文（弱化）+ AI 三块（结论/依据/下一步）+ 课程产品区；有方向才追加礼包权益区</li><li><strong>已迁出</strong>：历史跟进、行为四 Tab → 原系统用户档案；深挖 → 分析助手（本期不改助手）</li><li><strong>姓名点击</strong>：跳转原系统用户档案并带会务参</li></ul>",
      mermaid: "flowchart LR\n  ROW[列表行] --> NAME[点姓名]\n  NAME --> PF[用户档案]\n  ROW --> DR[查看明细]\n  DR --> T1[标签命中]\n  DR --> T2[洞察与推荐]\n  T2 --> AI[结论依据下一步]\n  T2 --> C[课程产品]\n  T2 -->|有导师或天使意向| G[礼包权益]\n  PF --> B[行为四Tab]\n  PF --> F[跟进查看更多]",
    },
    41: {
      flag: "changed",
      title: "用户档案 · 入口与左栏（v1.2.0）",
      lead: "生产落地是跳转原系统「会员信息 → 用户档案」。页面壳在 6Q业务 → 用户管理 → 会员管理 → 会员详情，不是课程会务里新开档案页。",
      body: "<p>主键是 <code>member_id</code>，与标签快照、报读、跟进使用同一 ID，不做映射表。</p><ul><li><strong>打开方式</strong>：学员信息 / 意向列表点姓名，跳转原系统用户档案，并带 <code>from=conference</code> 与本期会务基础信息。</li><li><strong>顶栏模块</strong>：课程会务从「计划与实施」进入（线下课程会务 → 课程会务）；用户档案从「6Q业务」进入（用户管理 → 会员管理 → 会员详情）。两处可切，不要把档案挂在课程会务菜单下。</li><li><strong>会员详情左栏</strong>：沿用原系统 Tab（基础信息、学习档案、家庭组、课程资格、订单记录、关联账号、关系历史、反馈记录、跟进记录），另增「用户档案」；从会务进入默认选中用户档案。不要把本期会务 / 评价 / 工单做成左栏 Tab。</li><li><strong>从会务进入</strong>才出现「本期会务信息」：签到号 / 小组 / 通关 / 签到 / 核销（在用户档案页内，不是左栏）。</li><li><strong>身份条 / 系统标签</strong>是用户档案模块，会务清单体现、会务侧不做。</li><li>分析助手可从档案打开，不改档案事实。关系图谱本期不做、页面不展示。</li></ul>",
    },
    42: {
      flag: "changed",
      title: "用户档案 · 家庭组（v1.2.0）",
      lead: "家庭组看「谁和我同一家庭」。关系图谱本期不做，页面已关掉。",
      body: "<ul><li><strong>家庭组</strong>：家庭ID、人数、角色 chips；成员表含编号/姓名/性别/身份/手机/未使用资格，高亮本人。</li><li><strong>关系图谱</strong>：本期不做，页面不展示。决定要做时再打开。</li></ul>",
    },
    43: {
      flag: "changed",
      title: "用户档案 · 基础信息（v1.2.0）",
      lead: "基础信息对齐会员详情口径，分成身份与状态、关系人、认证人口、社会属性四块。",
      body: "<p>字段名与会员中心保持一致，缺数按数仓映射补齐，不另造别名。会务清单体现，会务侧不做。</p><ul><li><strong>身份与状态</strong>：会员ID、6Q姓名、手机、邮箱、地区城市、运营服务处、实名/会员状态、身份、角色。</li><li><strong>关系人</strong>：当前生效的归属天使与推荐人。</li><li><strong>认证 / 社会</strong>：真实姓名、性别年龄生日；职业行业学历微信紧急联系人注册时间备注。</li></ul>",
    },
    44: {
      title: "版本规范（开发拆分依据）",
      body: "<p>开发按版本号拆范围。每个版本一块清单，内部用编号罗列。历史原型编号 v1.0.0～v1.0.4、原档案补丁号 v1.2.1～v1.2.4 不再作为拆分依据。</p><ul><li><strong>v1.1.0</strong> 标签管理系统</li><li><strong>v1.2.0</strong> 学员档案：跳转原系统用户档案 + 模块对照（会务不做）</li><li><strong>v1.2.1</strong> 分析策略模板 + 会务后台意向分析</li><li><strong>v1.2.2</strong> 面谈官门户 + 会务工作台 APP</li><li><strong>v1.3.0</strong> AI 分析助手</li></ul><p>需求部门：市场部 · 产品负责人：姜玲玲。完整范围表见总功能清单「版本范围」。</p>",
    },
    45: {
      flag: "changed",
      title: "画像档案 · 行为与跟进（v1.2.0）",
      lead: "意向列表不再放行为列和历史跟进。现场要翻明细，一律进画像右栏。",
      body: "<ul><li><strong>跟进记录</strong>：一律按创建时间倒序；卡片预览最近 5 条，「查看更多」展开会员详情全字段表。</li><li><strong>从会务进入</strong>：本场会务的跟进明细旁标注「来自于本场会务」。</li><li><strong>近期行为明细</strong>：社区 / 学习 / 视频 / 直播四 Tab，各预览 5 条，查看更多按类型看全量。</li></ul>",
    },
    46: {
      title: "6Q 面谈官门户（v1.2.0 起，v1.2.4 扩业务页）",
      body: "<p>独立 PC 门户：会员账号登录（手机/邮箱+密码+验证码）→ 选进行中会务 → 业务 Tab（学员列表 / 意向 / 答疑 / 面谈 / 跟进 / 调研）→ 画像（含 AI）。</p><ul><li>角色来自会务内「面谈官」赋权；看会务全部学员</li><li>不搬策略配置</li><li>v1.2.0～v1.2.3 只读；v1.2.4 起放开跟进录入与导出（学员列表一个导出入口，答疑/面谈/跟进可增改删，均为原型演示，无后端持久化）</li><li>无会务空态：「当前无正在进行中的会务」</li></ul><p>入口：<code>6q-interviewer-portal/login.html</code></p>",
    },
    47: {
      flag: "changed",
      title: "画像 AI 对话 · 四预设 chips（历史口径，已并入 v1.3.0）",
      lead: "小弹窗四 chips 是早期入口。v1.3.0 已升级为大型分析助手，本条只保留历史口径。",
      body: "<p>旧入口在右下角「问学员」；输出=档案事实归纳 + 轻建议，非正式商机诊断。</p><ul><li>分析跟进 / 沟通话术 / 近期消费能力（&lt;5千、5千–2万、≥2万）/ 课程购买建议</li><li>消费力用近 12 个月已支付粗估；购课建议不绑定意向列表推荐课</li></ul><p>现网评审请看注释「大型工作台」与「意图流」。会务 APP 仍不承载大型工作台。</p>",
    },
    48: {
      flag: "new",
      title: "画像分析助手大型工作台（v1.3.0）",
      lead: "会务后台与面谈官门户共用约 90vw × 88vh 双栏工作台。空白时左侧演示栏默认展开，发出第一句后收起。",
      body: "<ul><li><strong>三大意图</strong>：兴趣解读 / 下一步跟进 / 课程产品匹配。匹配必须工作人员点确认，不会自动开右栏。</li><li><strong>课务检索</strong>：广州开课 / 总导师课程 / 一阶二阶区别。只答左栏，无报读按钮、不自动匹配。</li><li><strong>追问条</strong>：输入框上方 2 条阶段底盘 + 1 条贴上一句，一点即发；匹配动效期间隐藏。</li><li><strong>数据依据</strong>：用户标签、行为埋点、跟进、报读购买与学习历史。</li></ul><p><strong>Mock 声明：</strong>对话、检索、匹配均为演示数据。生产以 Dify 智能体回传及课务/产品接口为准。</p>",
    },
    49: {
      flag: "new",
      title: "分析助手意图流与数据源（v1.3.0）",
      lead: "工作台内「意图流注释」给出完整分流。原型只演示路径，正式环境由 Dify 识别意图并组织回答。",
      body: "<p>原型只演示路径；正式环境由 <strong>Dify</strong> 识别意图并组织回答，课务/价格/名额走接口。</p><ul><li><strong>兴趣解读</strong>：用户标签 + 行为埋点 → 左栏依据</li><li><strong>下一步跟进</strong>：上课层级、报读购买、跟进 → 进阶建议</li><li><strong>产品匹配</strong>：须确认后走 A+B；综合会话条件、标签、埋点、跟进、报读 + 产品/SKU/课务 → 右栏主推与备选</li><li><strong>课务检索</strong>：城市/导师/课阶走课务期数词典，左栏列表</li><li><strong>产品细节追问</strong>：读当前推荐版本，只答左栏，右侧不跳转</li></ul>",
      mermaid: "flowchart TB\n  subgraph Entry[演示入口]\n    A1[兴趣解读]\n    A2[下一步跟进]\n    A3[推荐产品]\n    R1[广州最近开课]\n    R2[总导师课程]\n    R3[一阶二阶区别]\n  end\n  subgraph Data[数据源]\n    D1[用户标签]\n    D2[行为埋点]\n    D3[跟进记录]\n    D4[报读购买学习]\n    D5[课务期数导师课阶]\n    D6[课程产品SKU]\n    D7[当前会话条件]\n  end\n  A1 --> D1\n  A1 --> D2\n  A2 --> D1\n  A2 --> D4\n  A3 --> Q{工作人员确认匹配?}\n  Q -->|否| Chat[左栏对话]\n  Q -->|是| Match[A+B智能匹配]\n  R1 --> D5\n  R2 --> D5\n  R3 --> D5\n  Chat --> Follow[输入框上方追问]\n  Match --> D6\n  Match --> Right[右栏主推与备选]\n  Right --> Follow\n  Follow --> Chat",
    },
    50: {
      flag: "new",
      title: "用户档案 · 全模块字段说明（v1.2.0）",
      lead: "对照原系统用户档案各模块的元素名称、类型、是否必填。会务只做跳转+带参，模块由原系统承接。",
      body: "<p>阅读顺序：入口带参 → 身份条/会务信息/标签 → 基础信息 → 家庭组 → 购课/评价 → 跟进/退款/工单 → 行为。关系图谱本期不做。</p><p><span style='color:#2563eb;font-weight:700'>(new)</span> 表示本版新增；<span style='color:#c2410c;font-weight:700'>(changed)</span> 表示本次注明调整；<span style='color:#b91c1c;font-weight:700'>(removed)</span> 表示已从表中删除。生产字段以会员中心 / 课务接口为准，原型仅对齐口径。</p>",
    },
    51: {
      flag: "changed",
      title: "用户档案 · 购买课程（v1.2.0）",
      lead: "购买课程按课程产品一行汇总；表内字段都读资格中心线下产品，不读订单 SKU。",
      body: "<p>数据来源：<strong>资格中心 · 线下产品</strong> https://www.6qedu.cn/admin/qualificationCentre/offLineProduct</p><ul><li><strong>课程产品</strong>：资格中心按课程产品汇总后的产品名</li><li><strong>核销次数</strong>：该产品已核销 / 已报读次数；无核销为 0</li><li><strong>待使用的资格</strong>：尚未核销、仍可报读的次数，展示为「2次」「3次」；无为「0次」</li><li><strong>累计消费金额</strong>：该产品在所有会务已支付合计，人民币展示</li><li><strong>最近报读核销时间</strong>：最近一次核销时间；无核销为 —</li><li><strong>复购记录</strong>：已从用户档案删除，不再单独列表。</li></ul>",
    },
    52: {
      flag: "new",
      title: "用户档案 · 家庭组未使用资格（v1.2.0）",
      lead: "家庭组给每位成员统计未使用资格；点「查看」弹窗看该人未使用的产品、次数和最近报读核销时间。",
      body: "<p>次数与弹窗明细都来自<strong>资格中心 · 线下产品</strong> https://www.6qedu.cn/admin/qualificationCentre/offLineProduct</p><ul><li><strong>未使用资格</strong>：该成员尚未核销的资格次数合计，展示为「2次」；点「查看」打开弹窗</li><li><strong>本人</strong>与购买课程「待使用的资格」同源；其他家庭成员按各自会员读资格中心</li><li><strong>弹窗列</strong>：课程产品、资格数量（N次）、最近报读核销时间（无核销为 —）</li><li>无未使用资格时弹窗空态「暂无未使用资格」</li></ul>",
    },
    53: {
      flag: "new",
      title: "用户档案 · 课程产品总评价（v1.2.0）",
      lead: "学员对各课程产品的评价按创建时间倒序铺在中栏；条数多时进弹窗按产品或时间筛。",
      body: "<ul><li><strong>卡片</strong>：评价（条数）+ 预览最近 2 条：头像、姓名、星级、日期、报读课程、正文、图片</li><li><strong>报读课程</strong>：期次 + 产品名 + 站次 + 导师，底色浅橙对齐评价中心</li><li><strong>查看更多</strong>：弹窗可筛课程产品、创建时间起止；结果仍倒序</li><li>无评价空态「暂无课程评价」；筛不到「没有符合筛选的评价」</li></ul>",
    },
    54: {
      flag: "new",
      title: "用户档案 · 本期会务信息与跟进标注（v1.2.0）",
      lead: "只有从会务点进用户档案才出示本期会务信息和「来自于本场会务」；其它入口只看全局档案。",
      body: "<ul><li><strong>从会务进入</strong>：学员信息 / 意向列表跳转原系统用户档案，并带 <code>from=conference</code> 与会务基础信息</li><li><strong>本期会务信息</strong>：签到号、小组、通关、签到、核销；不从会务进入则整块不渲染</li><li><strong>跟进</strong>：默认时间倒序；从会务进入时，关联本期的明细标注「来自于本场会务」</li></ul>",
    },
    55: {
      flag: "new",
      title: "用户档案 · 客服工单（v1.2.0）",
      lead: "档案只读该学员在客服系统提交的工单。页面不复刻整张工单详情，只拿出分类、描述、状态。",
      body: "<ul><li><strong>分类</strong>：一级 / 二级 / 三级，对齐工单详情「工单分类」</li><li><strong>描述</strong>：问题描述原文</li><li><strong>状态</strong>：用工单状态（如未处理）；内容状态（等待回复）作辅助</li><li>按创建时间倒序；超过 2 条「查看更多」</li></ul>",
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
      flag: "changed",
      title: "APP · 意向洞察中控",
      lead: "中控看分布和优先跟进；本期高频只计课程，礼包客单价不进榜。",
      body: "<ul><li>环形图：高/中/低/未分级人数分布（与后台 KPI 同源）</li><li>KPI 卡片：高意向数、可跟进数等</li><li>优先跟进 TOP3 学员快捷入口（按意向分或策略规则排序）</li><li><strong>本期高频产品</strong>只统计课程主推，不含礼包</li><li>点击档位扇区或 KPI → 进入<strong>意向学员列表</strong>对应 Tab</li></ul>",
      mermaid: "flowchart LR\n  D[意向中控] -->|点高意向| L1[高意向列表]\n  D -->|点中意向| L2[中意向列表]\n  D -->|TOP3卡片| DET[学员详情]\n  L1 --> DET\n  L2 --> DET",
    },
    36: {
      flag: "changed",
      title: "APP · 意向学员列表",
      lead: "卡片与 PC 列表对齐：课一行，有方向才礼包一行。",
      body: "<p>按档位 Tab（高/中/低）过滤；展示姓名、意向分、关键标签摘要。</p><p>推荐区两行：主推课程 +（有意向了解方向时）礼包名称。闸门不读角色标签。</p>",
    },
    37: {
      title: "APP · 学员详情 · 意向块",
      body: "<p>意向度徽章、意向分、命中标签列表、AI 一句话总结。</p><p>跟进记录只读展示（不含编辑，编辑回后台跟进菜单）。</p>",
    },
    38: {
      flag: "changed",
      title: "APP · 课程产品与礼包",
      lead: "详情里课程产品和礼包分区；无礼包意向则整块礼包区不渲染。",
      body: "<ul><li><strong>主推产品</strong> + 匹配度 + 备选 1~2 个</li><li>展示已报读/已购买标签 + 复训/权益提醒</li><li>有导师/天使意向才追加<strong>礼包权益</strong>区，写明意向方向</li><li>不以 SKU 为推荐单位；不可在 APP 改排序</li></ul>",
      mermaid: "flowchart TB\n  KB[产品知识库] --> AI[推荐模型]\n  TAG[标签命中] --> AI\n  FU[跟进] --> AI\n  EN[报读/购买] --> AI\n  DIR[意向了解方向] --> G[礼包闸门]\n  AI --> OUT[课程主推+备选]\n  G -->|含导师或天使| GIFT[礼包区]",
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
      id: "portal",
      name: "面谈官门户",
      tag: "v1.2.4 业务页 · v1.3.0 助手",
      color: "#ea580c",
      entry: "6q-interviewer-portal/login.html",
      archIds: [
        "portal-flow"
      ],
      flows: [
        {
          title: "面谈官门户说明",
          notes: [46]
        }
      ],
      modules: [
        {
          name: "门户链路",
          href: "6q-interviewer-portal/login.html",
          items: [
            {
              text: "[v1.2.0] 手机/邮箱+密码登录 + 图形验证码",
              notes: [46]
            },
            {
              text: "[v1.2.0] 选择进行中会务；无会务空态",
              notes: [46]
            },
            {
              text: "[v1.2.0] 只读意向列表 + 查看明细 + 画像",
              notes: [46, 29, 45]
            },
            {
              text: "[v1.2.0] 不包含策略配置/跟进入录/导出",
              notes: [46]
            },
            {
              text: "[v1.2.3] 会务期数下展示开课时间、开课地址",
              notes: [46]
            },
            {
              text: "[v1.2.3] 头图右上展示当前登录会员姓名与岗位",
              notes: [46]
            },
            {
              text: "[v1.2.3] 业务 Tab：学员列表 / 意向 / 答疑 / 面谈 / 跟进 / 调研；意向为当前页",
              notes: [46]
            },
            {
              text: "[v1.2.4] 五业务页原生化：学员列表 / 答疑 / 面谈 / 跟进 / 调研，不再用 iframe 或缩放画布",
              notes: [46]
            },
            {
              text: "[v1.2.4] 学员列表单一导出入口（29 个业务字段，按当前筛选，文件名带日期）",
              notes: [46]
            },
            {
              text: "[v1.2.4] 答疑/面谈/跟进支持录入、编辑、删除、特别关注、标签与附件名（原型本地演示）",
              notes: [46]
            },
            {
              text: "[v1.2.4] 筛选项超一行时默认收起，查询/重置常驻；缩放与切换保留输入",
              notes: [46]
            }
          ]
        },
        {
          name: "学员意向列表",
          href: "6q-interviewer-portal/student-intent.html",
          items: [
            {
              text: "[v1.2.0] 对齐后台意向列表呈现",
              notes: [46, 29]
            },
            {
              text: "[v1.2.0] 点姓名进画像；查看明细只读",
              notes: [46, 29]
            },
            {
              text: "[v1.2.3] 「本期学员意向一览」为当前激活 Tab",
              notes: [46]
            },
            {
              text: "[v1.2.4] 意向页保持只读；点姓名带 profileSource=intent 进画像，不复用残留会务",
              notes: [46]
            }
          ]
        },
        {
          name: "画像档案",
          href: "6q-interviewer-portal/student-profile.html?id=m10009",
          items: [
            {
              text: "[v1.2.0] 复用后台画像口径（行为/跟进/AI）",
              notes: [46, 45]
            },
            {
              text: "[v1.3.0] AI 4 chips：跟进/话术/消费力/购课建议",
              notes: [47, 41, 45]
            },
            {
              text: "[v1.3.0] 大型双栏分析助手：三大意图、个人历史、课程智能匹配",
              notes: [48, 49, 50]
            }
          ]
        }
      ]
    },
    {
      id: "app",
      name: "会务 APP",
      tag: "v1.2.0 · 会务工作台",
      color: "#f39800",
      entry: "6q-conference-app-prototype/home.html",
      modules: [
        {
          name: "学员列表（入口）",
          href: "6q-conference-app-prototype/app-students.html",
          items: [
            {
              text: "[v1.2.0] 本期学员列表（与会务后台同源）",
              notes: [12, 33]
            },
            {
              text: "[v1.2.0] AI 意向洞察横幅 → 进入分析链路",
              notes: [33, 34]
            },
            {
              text: "[v1.2.0] 策略版本变化 → 强制重跑分析动效",
              notes: [32, 19]
            }
          ]
        },
        {
          name: "AI 分析过程",
          href: "6q-conference-app-prototype/app-intent-scan.html",
          items: [
            {
              text: "[v1.2.0] 全屏分析动效（扫描视觉）",
              notes: [34]
            },
            {
              text: "[v1.2.0] 结束后进入意向洞察中控",
              notes: [34]
            },
            {
              text: "[v1.2.0] 与后台同一套策略版本绑定",
              notes: [32]
            }
          ]
        },
        {
          name: "意向洞察中控",
          href: "6q-conference-app-prototype/app-intent-dashboard.html",
          items: [
            {
              text: "[v1.2.0] 环形分布：高/中/低/未分级",
              notes: [35, 17, 18]
            },
            {
              text: "[v1.2.0] KPI：高意向人数、待跟进等",
              notes: [35]
            },
            {
              text: "[v1.2.0] 优先跟进 TOP3",
              notes: [35]
            },
            {
              text: "[v1.2.0] 点击档位 → 意向学员列表",
              notes: [36]
            }
          ]
        },
        {
          name: "意向学员列表",
          href: "6q-conference-app-prototype/app-intent-list.html",
          items: [
            {
              text: "[v1.2.0] Tab：高 / 中 / 低意向",
              notes: [36, 18]
            },
            {
              text: "[v1.2.0] 展示意向分、关键标签摘要",
              notes: [22, 24]
            },
            {
              text: "[v1.2.0] 进入学员意向详情",
              notes: [37]
            }
          ]
        },
        {
          name: "学员意向详情",
          href: "6q-conference-app-prototype/app-student-detail.html",
          items: [
            {
              text: "[v1.2.0] 意向度、意向分、命中标签",
              notes: [37, 22]
            },
            {
              text: "[v1.2.0] AI 一句话总结 + 完整分析入口",
              notes: [26, 31]
            },
            {
              text: "[v1.2.0] 会务跟进只读",
              notes: [25, 37]
            },
            {
              text: "[v1.2.0] AI 课程产品推荐：主推 + 备选",
              notes: [38]
            },
            {
              text: "[v1.2.0] 已报读/已购买状态 + 工作人员提醒",
              notes: [38]
            },
            {
              text: "[v1.2.0] 参考 SKU 价格区间；不可改推荐",
              notes: [38, 40]
            }
          ]
        }
      ],
      archIds: [
        "app-flow"
      ],
      flows: [
        {
          title: "APP 现场链路说明",
          notes: [33, 34, 35]
        }
      ]
    },
    {
      id: "pc",
      name: "会务后台",
      tag: "v1.2.0 档案/策略/意向 · v1.3.0 助手",
      color: "#4f46e5",
      entry: "6q-conference-prototype/versions.html",
      modules: [
        {
          name: "【版本导航】按版本追溯功能变更",
          href: "6q-conference-prototype/versions.html",
          items: [
            {
              text: "开发范围以总清单「版本范围」为准：v1.1.0 / v1.2.0 / v1.3.0",
              notes: [44]
            },
            {
              text: "文档：6q-conference-prototype/docs/FEATURE-CHANGELOG.md",
              notes: [44]
            }
          ]
        },
        {
          name: "会务工具 · 分析策略模板",
          href: "6q-conference-prototype/tools-intent-strategy-template.html",
          items: [
            {
              text: "[v1.2.0] 模板列表：名称、说明、关注标签数、意向度方式、更新时间",
              notes: [13, 14]
            },
            {
              text: "[v1.2.0] 新建 / 编辑 / 删除模板",
              notes: [13, 14]
            },
            {
              text: "[v1.2.0] 删除：若本期已选用二次确认；已保存快照不受影响",
              notes: [14, 19]
            },
            {
              text: "[v1.2.0] 权限：会务统筹配置角色",
              notes: [13]
            }
          ]
        },
        {
          name: "会务工具 · 编辑模板",
          href: "6q-conference-prototype/tools-intent-strategy-template-edit.html",
          items: [
            {
              text: "[v1.2.0] 模板名称、说明",
              notes: [13]
            },
            {
              text: "[v1.2.0] ① 关注标签：系统标签树多选 + 任一/全部",
              notes: [15, 2]
            },
            {
              text: "[v1.2.0] ② 意向度：按权重分 OR 按命中标签（二选一）",
              notes: [16]
            },
            {
              text: "[v1.2.0] 方式 A：高/中/低 三个分值阈值",
              notes: [17, 22]
            },
            {
              text: "[v1.2.0] 方式 B：高/中/低 三组标签 + 组内任一/全部",
              notes: [18]
            },
            {
              text: "[v1.2.0] 保存模板 → 供各期选用",
              notes: [13, 19]
            }
          ]
        },
        {
          name: "会务详情 · 本期分析策略",
          href: "6q-conference-prototype/conference-intent-strategy.html",
          items: [
            {
              text: "[v1.2.0] 下拉选用分析策略模板 + 规则预览",
              notes: [19]
            },
            {
              text: "[v1.2.0] 复制上期策略",
              notes: [19]
            },
            {
              text: "[v1.2.0] 保存本期策略并重算（版本号++）",
              notes: [19, 32]
            },
            {
              text: "[v1.2.0] 已保存策略预览 + 高/中/低人数分布",
              notes: [19]
            },
            {
              text: "[v1.2.0] 跳转学员意向分析 / 管理模板",
              notes: [20, 21]
            }
          ]
        },
        {
          name: "会务详情 · 学员信息",
          href: "6q-conference-prototype/conference-students.html",
          items: [
            {
              text: "[v1.2.0] 会务子导航启用「学员信息」",
              notes: [41]
            },
            {
              text: "[v1.2.0] 点姓名跳转原系统用户档案",
              notes: [41]
            }
          ]
        },
        {
          name: "会务详情 · 画像档案",
          href: "6q-conference-prototype/conference-student-profile.html?id=m10009",
          items: [
            {
              text: "[v1.2.0] 三栏事实档案：系统标签 / 购课 / 跟进退款行为",
              notes: [41]
            },
            {
              text: "[v1.2.0] 购课按课程产品计次；复购记录已删；退款订单口径",
              notes: [41]
            },
            {
              text: "[v1.2.1] 购买课程读资格中心：核销次数、待使用的资格（N次）、累计消费金额、最近报读核销时间；去掉商品与最近购买",
              notes: [51]
            },
            {
              text: "[v1.2.0] 图表：购课条形 + 近30天行为折线（无商机诊断）",
              notes: [41]
            },
            {
              text: "[v1.2.0] 家庭组：家庭ID + 成员表，高亮本人",
              notes: [42]
            },
            {
              text: "[v1.2.2] 家庭组增加「未使用资格」：合计 N次，点查看弹窗列出未使用产品、资格数量、最近报读核销时间",
              notes: [52]
            },
            {
              text: "[v1.2.0] 关系图谱：推荐/归属双边·1跳·当前生效·环形交互图",
              notes: [42]
            },
            {
              text: "[v1.2.0] 基础信息补齐：身份状态 / 关系人 / 认证 / 社会属性",
              notes: [43]
            },
            {
              text: "[v1.2.0] 社区活跃按话题名称细拆",
              notes: [42]
            },
            {
              text: "[v1.2.0] 近期行为四 Tab + 查看更多抽屉（社区/学习/视频/直播）",
              notes: [27, 45]
            },
            {
              text: "[v1.2.0] 跟进记录查看更多抽屉（承接历史跟进）",
              notes: [45]
            },
            {
              text: "[v1.2.0] AI 分析对话：4 chips（跟进/话术/消费力/购课建议）+ 自由洞察",
              notes: [47, 41, 45]
            },
            {
              text: "[v1.3.0] 大型双栏分析助手：三大意图 / A+B 匹配动效 / 产品课务商品详情",
              notes: [48, 49, 50]
            },
            {
              text: "[v1.2.0] 课程产品总评价：倒序预览 + 更多评价弹窗（课程产品 / 创建时间筛选）",
              notes: [53]
            },
            {
              text: "[v1.2.0] 关系图谱本期不做，页面不展示",
              notes: [42]
            },
            {
              text: "[v1.2.0] 「本期会务信息」仅从会务点进才展示；跟进打本场标识",
              notes: [54, 41]
            },
            {
              text: "[v1.2.0] 客服工单：只展示分类、问题描述、工单状态；倒序预览，多条进查看更多",
              notes: [55]
            }
          ]
        },
        {
          name: "会务详情 · 学员意向分析",
          href: "6q-conference-prototype/conference-student-intent.html",
          items: [
            {
              text: "[v1.2.0] 未配置空态引导；已配置只读策略摘要 + KPI",
              notes: [20, 21]
            },
            {
              text: "[v1.2.0] 列：学员、意向分、意向度、命中标签、AI、推荐",
              notes: [22, 23, 24, 26, 28]
            },
            {
              text: "[v1.2.0] 列名：跟进内容（当前会务）",
              notes: [25]
            },
            {
              text: "[v1.2.0] 行为列/历史跟进已迁出 → 原系统用户档案",
              notes: [27, 45]
            },
            {
              text: "[v1.2.0] 查看明细仅保留：标签命中 + 洞察与推荐",
              notes: [29]
            },
            {
              text: "[v1.2.0] 点击学员姓名 → 原系统用户档案（带会务参）",
              notes: [29]
            },
            {
              text: "导出（二期占位）",
              notes: [30, 40]
            }
          ]
        },
        {
          name: "关联 · 跟进记录（已有菜单）",
          href: "6q-conference-prototype/conference-detail-basic.html",
          items: [
            {
              text: "[v1.2.0] 人工录入：跟进内容、跟进标签、图片",
              notes: [25, 31]
            },
            {
              text: "[v1.2.0] 保存后触发 AI 异步分析",
              notes: [31]
            },
            {
              text: "[v1.2.0] 数据范围：仅本期会务 × 该学员",
              notes: [25]
            }
          ]
        }
      ],
      archIds: [
        "pc-strategy"
      ],
      flows: [
        {
          title: "策略配置到出数",
          notes: [19, 15, 20]
        },
        {
          title: "意向分与意向度",
          notes: [22, 16, 17, 18]
        },
        {
          title: "会务后台版本封版说明",
          notes: [44, 48, 46, 41, 42, 43, 45]
        }
      ]
    },
    {
      id: "tag",
      name: "标签系统",
      tag: "v1.1.0 · 标签管理",
      color: "#059669",
      entry: "user-tag-admin/tag-list.html",
      modules: [
        {
          name: "标签中心 · 标签管理",
          href: "user-tag-admin/tag-list.html",
          items: [
            {
              text: "[v1.1.0] 树形列表：一级分类 + 二级标签",
              notes: [1, 2, 3]
            },
            {
              text: "[v1.1.0] 筛选：分类 / 状态 / 关键词",
              notes: [3]
            },
            {
              text: "[v1.1.0] 二级行：覆盖人数（上次成功版本）",
              notes: [3]
            },
            {
              text: "[v1.1.0] 操作：编辑、复制规则、执行历史、立即计算、停用",
              notes: [4]
            },
            {
              text: "[v1.1.0] 顶栏「新增二级标签」",
              notes: [2, 5]
            }
          ]
        },
        {
          name: "标签中心 · 新增/编辑标签",
          href: "user-tag-admin/tag-create.html",
          items: [
            {
              text: "[v1.1.0] 基础信息：名称、所属一级、更新方式（手动/例行）",
              notes: [8]
            },
            {
              text: "[v1.1.0] 自然语言描述圈选意图",
              notes: [5, 6]
            },
            {
              text: "[v1.1.0] 数据范围只读（固定数仓 + 表白名单）",
              notes: [5, 10]
            },
            {
              text: "[v1.1.0] 生成 SQL → 解读 + 预估人数",
              notes: [6]
            },
            {
              text: "[v1.1.0] 确认并计算；例行复用已确认 SQL",
              notes: [6, 8]
            },
            {
              text: "[v1.1.0] 原可视化规则构建 · 一期不做",
              notes: [5]
            },
            {
              text: "[v1.1.0] 圈选结果仅 member_id；意向分权重在策略模板配置，不在本页",
              notes: [7, 22]
            },
            {
              text: "[v1.1.0] 复制：预填 NL/SQL，名称需重填",
              notes: [4]
            }
          ]
        },
        {
          name: "标签中心 · 执行历史",
          href: "user-tag-admin/tag-history.html",
          items: [
            {
              text: "[v1.1.0] 仅二级标签可进入",
              notes: [9]
            },
            {
              text: "[v1.1.0] 版本号 = 计算日期 YYYYMMDD",
              notes: [9]
            },
            {
              text: "[v1.1.0] Tab：命中用户（可本版本无效）｜本次 SQL",
              notes: [9]
            },
            {
              text: "[v1.1.0] 失败版本：空表 + 错误信息",
              notes: [9]
            }
          ]
        },
        {
          name: "数据资产 · 数据接入",
          href: "user-tag-admin/data-access.html",
          items: [
            {
              text: "[v1.1.0] 只读 endpoint + 复制",
              notes: [10]
            },
            {
              text: "[v1.1.0] 仅开发可修改接入配置",
              notes: [10]
            }
          ]
        },
        {
          name: "数据资产 · 数据表管理",
          href: "user-tag-admin/data-tables.html",
          items: [
            {
              text: "[v1.1.0] 表清单：库名、表名、说明、更新时间",
              notes: [11]
            },
            {
              text: "[v1.1.0] 字段详情抽屉：类型、可空、样例",
              notes: [11, 5]
            },
            {
              text: "[v1.1.0] 全员只读，不可删表",
              notes: [11]
            }
          ]
        }
      ],
      archIds: [
        "tag-rules"
      ],
      flows: [
        {
          title: "自然语言圈选 NL→SQL",
          notes: [5, 6]
        }
      ]
    }
  ],

  globalFlows: [
    {
      title: "系统总数据流",
      notes: [39],
    },
  ],

  versionPolicy: {
    dept: "市场部",
    owner: "姜玲玲",
    date: "2026-09-11",
    rule: "v1.1.0 标签管理；v1.2.0 学员档案（跳转原系统用户档案，模块对照只体现）；v1.2.1 分析策略+会务后台意向分析；v1.2.2 面谈官门户+会务工作台 APP；v1.2.3 门户头图与业务 Tab；v1.2.4 门户五业务页原生化+导出与跟进录入；v1.3.0 AI 分析助手。每个版本一块清单，内部用编号罗列。历史 v1.0.0～v1.0.4 与原档案补丁号 v1.2.1～v1.2.4 不再作为开发拆分依据。",
    lines: [
      { version: "v1.1.0", name: "标签管理系统", next: "v1.1.1" },
      { version: "v1.2.0", name: "学员档案（跳转原系统用户档案）", next: "v1.2.4" },
      { version: "v1.2.1", name: "分析策略 + 会务后台意向分析", next: "v1.2.4" },
      { version: "v1.2.2", name: "面谈官门户 + 会务工作台 APP", next: "v1.2.3" },
      { version: "v1.2.3", name: "面谈官门户头图与业务 Tab", next: "v1.2.4" },
      { version: "v1.2.4", name: "面谈官门户五业务页 + 导出与跟进", next: "v1.3.0" },
      { version: "v1.3.0", name: "AI 分析助手", next: "v1.3.1" },
    ],
  },

  versionScopes: [
    {
      id: "v110",
      version: "v1.1.0",
      date: "2026.09.02",
      current: true,
      theme: "标签管理系统",
      href: "user-tag-admin/tag-list.html",
      rows: [
        {
          req: [
            "1. 路径：用户标签平台 → 标签中心 → 标签管理",
            "2. 列表按一级分类树展示，一级下挂二级标签；支持按分类 / 状态 / 关键词筛选",
            "3. 一级分类为平台预置（用户偏好、基础属性、用户分层、金融属性、用户行为等），运营不可新建一级",
            "4. 运营仅可在一级下新建二级；规则、计算、覆盖人数、操作集均挂在二级",
            "5. 会务策略选标签的交互与本页一致：先一级再二级多选",
          ],
          impl: [
            "后台：标签分类表只读预置一级；二级标签表含 parent_id、状态、更新方式、已确认 SQL",
            "后台：会务策略关注标签只存二级 tag_id，不在会务页重算标签规则",
            "前端：树形列表 + 顶栏「新增二级标签」；一级行不展示覆盖人数/编码",
          ],
          pages: [{ name: "标签管理", href: "user-tag-admin/tag-list.html" }],
        },
        {
          req: [
            "1. 二级行展示上次成功计算版本的覆盖人数",
            "2. 当次计算失败时仍保留上次成功人数，禁止把失败显示成 0 人",
            "3. 覆盖人数口径=该版本快照中 member_id 去重人数",
          ],
          impl: [
            "后台：覆盖人数读 tag_member_snapshot 中该标签最近 success 版本；失败版本不覆盖该字段",
            "前端：二级行展示人数与计算状态；失败时状态红字，人数仍用上次成功值",
          ],
          pages: [{ name: "标签管理", href: "user-tag-admin/tag-list.html" }],
        },
        {
          req: [
            "1. 二级标签操作：编辑、复制规则、执行历史、立即计算、停用",
            "2. 编辑可改名称、自然语言意图、更新方式（手动/例行）",
            "3. 复制跳转新增页，预填 NL 与已确认 SQL，名称必须重填",
            "4. 立即计算复用已确认 SQL，不再调 AI 重写",
            "5. 停用后不再写入新快照，历史版本可查",
          ],
          impl: [
            "后台：停用只改 status，不删规则与历史版本；立即计算入队复用 confirmed_sql",
            "后台：复制生成新 tag_id，不复制命中快照",
            "前端：操作列按状态显隐；停用二次确认",
          ],
          pages: [
            { name: "标签管理", href: "user-tag-admin/tag-list.html" },
            { name: "新增/编辑标签", href: "user-tag-admin/tag-create.html" },
          ],
        },
        {
          req: [
            "1. 路径：标签中心 → 新增/编辑标签",
            "2. 一期用自然语言描述圈选意图，由智能体生成只读 SQL，结果集仅 member_id",
            "3. 数据范围固定为数仓连接 + 研发表白名单，页上只读，运营不可改连接",
            "4. 原可视化规则（条件行/条件组/且或）一期不做，脚本保留不加载",
          ],
          impl: [
            "后台：NL 送标签圈选智能体；返回 sql、人话解读、预估人数；SQL 仅允许 SELECT member_id",
            "后台：endpoint / 表白名单仅开发可改；运营接口只读",
            "前端：数据范围只读展示；不渲染可视化规则构建器",
          ],
          pages: [{ name: "新增/编辑标签", href: "user-tag-admin/tag-create.html" }],
        },
        {
          req: [
            "1. 按钮：保存草稿 / 生成 SQL / 确认并计算",
            "2. 右侧展示 SQL、人话解读、预估人数",
            "3. 修改自然语言后进入脏状态：旧 SQL 保留并告警，必须重新生成后才能确认",
            "4. 确认后写入当日版本快照，版本号=计算日期 YYYYMMDD",
            "5. 例行更新复用已确认 SQL，不每次调 AI",
            "6. 草稿只存名称/NL/更新方式；未确认 SQL 不参与例行",
          ],
          impl: [
            "后台：draft / generated / confirmed 三态；脏状态禁止 confirm",
            "后台：确认触发批处理，写入 tag_member_snapshot(version=YYYYMMDD)",
            "后台：例行调度只跑 confirmed_sql",
            "前端：脏状态禁用「确认并计算」，提示重新生成",
          ],
          pages: [{ name: "新增/编辑标签", href: "user-tag-admin/tag-create.html" }],
        },
        {
          req: [
            "1. 路径：二级标签 → 执行历史；一级分类无此入口",
            "2. 成功版本 Tab：命中用户（可单行「本版本无效」）｜本次 SQL",
            "3. 无效仅影响本版本；重算仍可能再命中",
            "4. 失败版本：空表 + 错误说明，不展示命中用户",
          ],
          impl: [
            "后台：历史按 version 存 sql、status、error、命中清单；无效标记写版本内 invalid_member_ids",
            "后台：无效不改规则，不从全量档案删人",
            "前端：仅二级行进入；失败 Tab 不渲染用户表",
          ],
          pages: [{ name: "执行历史", href: "user-tag-admin/tag-history.html" }],
        },
        {
          req: [
            "1. 数据接入：只读展示 endpoint + 复制；仅开发可改接入配置",
            "2. 一期不做健康检查、最近上报量、project/token 展示",
            "3. 数据表管理全员只读：库名、表名、说明、更新时间；字段详情抽屉含类型、可空、样例",
            "4. 不可删表；不做「被 N 个标签引用」列",
          ],
          impl: [
            "后台：接入配置走开发权限；运营角色只读",
            "后台：表白名单来自研发表，接口不提供删除",
            "前端：字段详情右侧抽屉；无删表按钮",
          ],
          pages: [
            { name: "数据接入", href: "user-tag-admin/data-access.html" },
            { name: "数据表管理", href: "user-tag-admin/data-tables.html" },
          ],
        },
        {
          req: [
            "1. 会务学员 member_id 与标签快照 member_id 直接相等，不做 ID 映射表",
            "2. 名单、标签、报读、推荐接口必须使用同一主键",
            "3. 一期不做：会务页新建/编辑标签规则、实时秒级画像（默认 T+1/小时批处理）",
          ],
          impl: [
            "后台：所有 JOIN 用 member_id；禁止另建 mapping 表",
            "后台：标签默认批处理；立即计算是人工触发的同套批处理，不是实时流",
            "前端：会务侧只读快照命中，不提供改规则入口",
          ],
          pages: [
            { name: "标签管理", href: "user-tag-admin/tag-list.html" },
            { name: "学员意向分析", href: "6q-conference-prototype/conference-student-intent.html" },
          ],
        },
      ],
    },
    {
      id: "v120",
      version: "v1.2.0",
      date: "2026.09.11",
      current: true,
      theme: "学员档案（跳转原系统用户档案）",
      href: "6q-conference-prototype/conference-student-profile.html?id=m10009&from=conference",
      rows: [
        {
          req: [
            "1. 从会务「学员意向分析 / 学员信息」点姓名，跳转原系统「会员信息 → 用户档案」（member_id）。落地页=6Q业务 → 用户管理 → 会员管理 → 会员详情；左栏沿用原系统 Tab（基础信息、学习档案、家庭组、课程资格、订单记录、关联账号、关系历史、反馈记录、跟进记录），另增「用户档案」，从会务进入默认选中。会务不新开档案页；现有三栏原型仅示意。课程会务入口仍是顶栏「计划与实施」→ 线下课程会务 → 课程会务。",
            "2. 跳转带本期会务基础信息：期次、签到号、小组、通关、签到、核销。档案仅从会务进入时展示「本期会务信息」。",
            "3. 跟进写入带本会务标识；从会务进入时，跟进记录标「来自于本场会务」。",
            "4. 身份条：6Q姓名、会员状态/实名/身份、手机、城市/运营服务处、会员ID、顾问、归属天使、推荐人、注册时间。",
            "5. 本期会务信息：签到号、小组、通关、签到、核销（只在从会务带参进入时出现）。",
            "6. 系统标签：只展示命中的一级分类 + 二级标签。",
            "7. 基础信息：身份与状态、关系人、认证与人口属性、社会属性与联系。",
            "8. 家庭组：家庭ID、成员表；每人「未使用资格」次数，可查看产品/数量/最近核销时间。",
            "9. 购课概览：订单笔数、课程产品数、复购产品数 + 条形图。",
            "10. 购买课程：按课程产品一行（资格中心）：核销次数、待使用的资格、累计消费金额、最近报读核销时间。",
            "11. 复购记录：已从用户档案删除，不再单独列表。",
            "12. 评价：课程产品评价倒序；预览 2 条，多条可筛产品/时间。",
            "13. 跟进记录：跨会务倒序；从会务进入打本场标识。",
            "14. 课程退款订单：商品、退款单号、实退、状态、创建时间。",
            "15. 客服工单：只展示分类（一/二/三级）、问题描述、工单状态；倒序预览，多条查看更多。",
            "16. 近 30 天行为趋势 / 社区话题活跃：社区·直播·学习趋势；话题按名称细拆浏览/点击/发帖。",
            "17. 近期行为明细：社区 / 学习 / 视频 / 直播四 Tab。",
            "18. 以上 4～17 为用户档案模块对照，会务侧不做，由原系统用户档案承接。关系图谱本期不做、页面不展示。",
            "19. v1.2.1 意向列表点姓名复用本版跳转+带参；v1.2.2 面谈官只读打开同一用户档案，APP 详情不跳 PC 档案；v1.3.0 分析助手可从档案打开，不写回档案事实。",
          ],
          impl: [
            "会务只做跳转 + 带参（from=conference / 会务基础信息 / conference_id）。",
            "落地页壳：6Q业务 / 用户管理 / 会员管理；左栏原系统 Tab + 用户档案（默认选中）。课程会务仍走计划与实施。",
            "原型页仅示意模块口径；购课读资格中心，工单只展示分类/描述/状态；复购记录不做。",
            "关系图谱代码保留、SHOW_RELATION_GRAPH=false，本期不渲染。",
          ],
          pages: [
            { name: "会务进入档案（示意）", href: "6q-conference-prototype/conference-student-profile.html?id=m10009&from=conference" },
            { name: "全局进入档案（示意）", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" },
            { name: "面谈官档案（示意）", href: "6q-interviewer-portal/student-profile.html?id=m10009" },
          ],
        },
      ],
    },
    {
      id: "v121",
      version: "v1.2.1",
      date: "2026.09.11",
      current: true,
      theme: "分析策略 + 会务后台意向分析",
      href: "6q-conference-prototype/conference-student-intent.html",
      rows: [
        {
          req: [
            "1. 分析策略模板：列表 / 编辑 / 删除 / 本期已选用角标（与具体期次无关）。",
            "2. 模板规则：系统标签树多选二级；关注集合同时用于缩小列表 + 策略权重计分；意向度每期只选 A 按权重分 或 B 按命中标签。",
            "3. 本期分析策略：每期独立实例；可选用模板或复制上期；「保存本期策略并重算」后版本号递增、列表重算、APP 强制重跑。",
            "4. 本期未保存策略时，意向分析必须空态引导，禁止静默用默认策略出数。",
            "5. 学员意向分析列表：学员、意向分、意向度、命中标签、跟进内容（当前会务）、AI 短摘要、推荐产品。",
            "6. 推荐产品课一行；有事业说明会「意向了解方向」且含导师或天使时才出礼包一行。",
            "7. 查看明细抽屉：标签命中 + 洞察与推荐（结论/依据/下一步）；不在抽屉确认智能匹配。",
            "8. 点姓名复用 v1.2.0 跳转原系统用户档案并带会务参；本版不改档案字段。",
          ],
          impl: [
            "后台：模板 JSON + 本期 config.intent_strategy_version；保存后重算并通知 APP。",
            "后台：礼包闸门=careerPresentation.intendedDirection 含导师或天使。",
            "前端：未配置引导条；已配置只读摘要；姓名链到用户档案。",
          ],
          pages: [
            { name: "分析策略模板", href: "6q-conference-prototype/tools-intent-strategy-template.html" },
            { name: "编辑模板", href: "6q-conference-prototype/tools-intent-strategy-template-edit.html" },
            { name: "本期分析策略", href: "6q-conference-prototype/conference-intent-strategy.html" },
            { name: "学员意向分析", href: "6q-conference-prototype/conference-student-intent.html" },
          ],
        },
      ],
    },
    {
      id: "v122",
      version: "v1.2.2",
      date: "2026.09.11",
      current: false,
      theme: "面谈官门户 + 会务工作台 APP",
      href: "6q-interviewer-portal/login.html",
      rows: [
        {
          req: [
            "1. 面谈官独立 PC 门户：手机/邮箱+密码+图形验证码登录；选择进行中会务；无会务空态。",
            "2. 只读意向列表 + 查看明细抽屉；不包含策略配置、跟进入录、导出。",
            "3. 面谈官点姓名只读打开同一原系统用户档案（复用 v1.2.0 跳转）。",
            "4. 会务 APP：后台保存策略后对比本地版本，不一致则强制重跑分析动效。",
            "5. 意向洞察中控：高/中/低/未分级、KPI、优先跟进 TOP3；高频榜只计课程主推。",
            "6. APP 意向列表/详情与 PC 对齐：课一行，有方向才礼包一行。",
            "7. APP 学员详情不跳 PC 用户档案；会务 APP 不承载大型分析助手工作台。",
          ],
          impl: [
            "后台：门户账号与会务面谈官赋权；接口只读。",
            "后台：APP 读同一套 intent_strategy_version 与名单结果。",
            "前端：门户不渲染策略/跟进/导出；APP 版本不一致进扫描页。",
          ],
          pages: [
            { name: "面谈官登录", href: "6q-interviewer-portal/login.html" },
            { name: "面谈官意向列表", href: "6q-interviewer-portal/student-intent.html" },
            { name: "面谈官档案", href: "6q-interviewer-portal/student-profile.html?id=m10009" },
            { name: "APP 学员列表", href: "6q-conference-app-prototype/app-students.html" },
            { name: "APP 意向中控", href: "6q-conference-app-prototype/app-intent-dashboard.html" },
            { name: "APP 学员详情", href: "6q-conference-app-prototype/app-student-detail.html" },
          ],
        },
      ],
    },
    {
      id: "v123",
      version: "v1.2.3",
      date: "2026.11.13",
      current: false,
      theme: "面谈官门户头图与业务 Tab",
      href: "6q-interviewer-portal/student-intent.html",
      rows: [
        {
          req: [
            "1. 会务期数标题下方展示开课时间、开课地址。",
            "2. 头图右上展示当前登录会员姓名与岗位信息。",
            "3. 增加业务 Tab：学员列表、本期学员意向一览、答疑管理、面谈管理、跟进记录、意向调研；「本期学员意向一览」为当前页。",
            "4. 其余 Tab 可先占位，不回改 v1.2.2 只读意向与登录链路。",
          ],
          impl: [
            "前端：portal-context.js 渲染会务 meta、会员卡与 Tab；conference-mock 补 startTime/endTime/address。",
            "前端：auth-mock 登录态带 roles；旧会话/旧会务上下文兼容补齐。",
            "前端：students.html / tab-placeholder.html 为导航占位，意向页保持现网列表能力。",
          ],
          pages: [
            { name: "面谈官意向（当前 Tab）", href: "6q-interviewer-portal/student-intent.html" },
            { name: "学员列表 Tab", href: "6q-interviewer-portal/students.html" },
            { name: "其它 Tab 占位", href: "6q-interviewer-portal/tab-placeholder.html?tab=qa" },
          ],
        },
      ],
    },
    {
      id: "v124",
      version: "v1.2.4",
      date: "2026.11.17",
      current: true,
      theme: "面谈官门户五业务页 + 导出与跟进",
      href: "6q-interviewer-portal/students.html",
      rows: [
        {
          req: [
            "1. 学员列表、答疑管理、面谈管理、跟进记录、意向调研五个业务页在门户内原生化，复用门户组件与表格样式，不再使用 iframe 或缩放画布。",
            "2. 学员列表统一一个「导出」入口：29 个业务字段，按当前筛选输出，文件名带导出日期。",
            "3. 答疑、面谈、跟进支持录入、编辑、删除、特别关注；跟进内容 1000 字、标签、示例模板、附件文件名与门户一致。",
            "4. 筛选项超过一行时默认显示第一行，可展开/收起；查询与重置常驻，切换与缩放保留已输入条件。",
            "5. 画像按会务入口显式带 conferenceId，新增「本场会务订单」「本场会务学员问卷」页签；普通入口不显示这两个页签。",
            "6. 学员列表与意向列表的姓名统一打开同一画像页；无效 ID 或姓名/手机号不一致时明确空态，不回退到其他学员。",
            "7. 每页右上角「说明」提供交互路径、功能说明与字段表，浮窗可调宽，不遮挡正文。",
          ],
          impl: [
            "前端：portal-conference-business.js 统一五业务页的表格、筛选、跟进表单与 CSV 导出；portal-business-notes-data.js 承载页面说明。",
            "前端：portal-student-profile.js 适配冻结画像脚本，按 ID 校验身份、按会务上下文裁订单与问卷；冻结文件未改。",
            "前端：portal-context.js 在点击姓名时补齐 from=conference&conferenceId，避免残留会务污染。",
            "数据：学员、订单、问卷、跟进均为原型演示数据；跟进写 sessionStorage，附件只记文件名。",
            "后端缺口：真实同步、权限控制、附件上传、服务端持久化与导出权限未接入，交付开发时按本条清单实现。",
          ],
          pages: [
            { name: "学员列表", href: "6q-interviewer-portal/students.html" },
            { name: "答疑管理", href: "6q-interviewer-portal/tab-placeholder.html?tab=qa" },
            { name: "面谈管理", href: "6q-interviewer-portal/tab-placeholder.html?tab=interview" },
            { name: "跟进记录", href: "6q-interviewer-portal/tab-placeholder.html?tab=followup" },
            { name: "意向调研", href: "6q-interviewer-portal/tab-placeholder.html?tab=survey" },
            { name: "会务画像档案", href: "6q-interviewer-portal/student-profile.html?id=XE78PV&from=conference&conferenceId=cf_a" },
          ],
        },
      ],
    },
    {
      id: "v130",
      version: "v1.3.0",
      date: "2026.09.02",
      current: true,
      theme: "AI 分析助手",
      href: "6q-conference-prototype/conference-student-profile.html?id=m10009",
      rows: [
        {
          req: [
            "1. 会务后台与面谈官门户共用约 90vw × 88vh 双栏工作台；会话按工作人员隔离；结果只读，不写回档案事实。",
            "2. 演示栏默认展开，发出第一句后收起；开场卡「我要答疑 / 分析学员」；追问条 2 条阶段底盘 + 1 条贴上一句。",
            "3. 答疑路径复刻智能体三条预输入，不走产品匹配、不打开右栏；公开原型不含报价成交话术。",
            "4. 分析路径先确认当前页学员或检索其它学员，再选兴趣解读 / 下一步跟进 / 课程产品匹配。",
            "5. 课务检索只答左栏；产品匹配须工作人员确认后才走 A+B 开右栏。",
            "6. 礼包闸门与列表一致：意向了解方向含导师或天使才出礼包；匹配完成后可生成面谈提示（六维加粗），禁止「复制沟通话术」。",
            "7. 个人历史可搜索；本版不做人工改排序、APP 承载大型工作台、公开原型成交/报价。",
          ],
          impl: [
            "前端：同一套 conference-profile-ai-chat.js；门户只读引用",
            "前端：个人历史按 user_id + member_id 本地/接口隔离",
            "Mock：对话、检索、匹配为演示数据，生产以 Dify 回传及课务/产品接口为准",
          ],
          pages: [
            { name: "会务后台画像助手", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" },
            { name: "面谈官画像助手", href: "6q-interviewer-portal/student-profile.html?id=m10009" },
          ],
        },
      ],
    },
  ],
};

(function () {
  var spec = window.INTENT_FEATURE_SPEC;
  if (!spec || !spec.versionScopes) return;

  function versionKey(ver) {
    var m = String(ver || "").match(/(\d+)\.(\d+)\.(\d+)/);
    if (!m) return 0;
    return Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]);
  }

  spec.sortScopesByVersionDesc = function (scopes) {
    return (scopes || []).slice().sort(function (a, b) {
      return versionKey(b.version) - versionKey(a.version);
    });
  };

  spec.sortItemsByVersionDesc = function (items) {
    return (items || []).slice().sort(function (a, b) {
      return versionKey(b.text) - versionKey(a.text);
    });
  };

  spec.conferenceVersions = spec.sortScopesByVersionDesc(spec.versionScopes).map(function (scope) {
    return {
      id: scope.id,
      version: scope.version,
      date: scope.date,
      current: !!scope.current,
      theme: scope.theme,
      href: scope.href,
      modules: [
        {
          name: scope.theme,
          href: scope.href,
          changes: (scope.rows || []).map(function (row, index) {
            return String(index + 1) + ". " + ((row.req && row.req[0]) || "");
          }),
        },
      ],
    };
  });

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function listHtml(items, tag) {
    tag = tag || "ol";
    return (
      "<" +
      tag +
      ">" +
      (items || [])
        .map(function (item) {
          return "<li>" + esc(String(item).replace(/^\d+\.\s*/, "")) + "</li>";
        })
        .join("") +
      "</" +
      tag +
      ">"
    );
  }

  window.renderIntentVersionScopes = function (mount, hrefFn) {
    if (!mount || !spec.versionScopes) return;
    hrefFn = hrefFn || function (href) { return href; };
    var policy = spec.versionPolicy || {};
    mount.innerHTML = "";

    var intro = document.createElement("div");
    intro.className = "scope-intro";
    intro.innerHTML =
      "<p><strong>编制日期</strong> " +
      esc(policy.date || "") +
      " · <strong>需求部门</strong> " +
      esc(policy.dept || "市场部") +
      " · <strong>产品负责人</strong> " +
      esc(policy.owner || "姜玲玲") +
      "</p><p>" +
      esc(policy.rule || "") +
      "</p>";
    mount.appendChild(intro);

    spec.sortScopesByVersionDesc(spec.versionScopes).forEach(function (scope) {
      var block = document.createElement("div");
      block.className = "scope-block is-open";
      block.id = "feat-" + scope.id;
      var head = document.createElement("div");
      head.className = "scope-block__head";
      head.innerHTML =
        '<span class="ver-pill">版本号 ' +
        esc(scope.version) +
        "</span><strong>" +
        esc(scope.theme) +
        "</strong><span class=\"scope-block__date\">编制日期 " +
        esc(scope.date) +
        "</span>";
      var wrap = document.createElement("div");
      wrap.className = "scope-table-wrap";
      var table = document.createElement("table");
      table.className = "scope-table";
      table.innerHTML =
        "<thead><tr><th>序号</th><th>需求部门</th><th>产品负责人</th><th>需求描述</th><th>实现方案</th><th>页面链接</th></tr></thead>";
      var tbody = document.createElement("tbody");
      (scope.rows || []).forEach(function (row, index) {
        var tr = document.createElement("tr");
        var pages = (row.pages || [])
          .map(function (page) {
            return (
              '<a href="' +
              esc(hrefFn(page.href)) +
              '">' +
              esc(page.name) +
              "</a>"
            );
          })
          .join("");
        tr.innerHTML =
          "<td>" +
          (index + 1) +
          "</td><td>" +
          esc(policy.dept || "市场部") +
          "</td><td>" +
          esc(policy.owner || "姜玲玲") +
          "</td><td>" +
          listHtml(row.req, "ol") +
          "</td><td>" +
          listHtml(row.impl, "ul") +
          '</td><td class="scope-pages">' +
          pages +
          "</td>";
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      block.appendChild(head);
      block.appendChild(wrap);
      mount.appendChild(block);
    });
  };
})();
