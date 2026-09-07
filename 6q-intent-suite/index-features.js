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
      body: "<ul><li><strong>标签命中</strong>：命中标签、权重明细、意向度徽章</li><li><strong>洞察与推荐</strong>：跟进原文（弱化）+ AI 三块（结论/依据/下一步）+ 课程产品区；有方向才追加礼包权益区</li><li><strong>已迁出</strong>：历史跟进、行为四 Tab → 画像档案；深挖 → 分析助手（本期不改助手）</li><li><strong>姓名点击</strong>：跳转画像档案页</li></ul>",
      mermaid: "flowchart LR\n  ROW[列表行] --> NAME[点姓名]\n  NAME --> PF[画像档案]\n  ROW --> DR[查看明细]\n  DR --> T1[标签命中]\n  DR --> T2[洞察与推荐]\n  T2 --> AI[结论依据下一步]\n  T2 --> C[课程产品]\n  T2 -->|有导师或天使意向| G[礼包权益]\n  PF --> B[行为四Tab]\n  PF --> F[跟进查看更多]",
    },
    41: {
      flag: "changed",
      title: "画像档案 · 定位与左栏（v1.2.0）",
      lead: "画像是会员全局档案，不是某一期会务的临时页。会务名单只负责带入入口上下文。",
      body: "<p>主键是 <code>member_id</code>，与标签快照、报读、跟进使用同一 ID，不做映射表。</p><ul><li><strong>打开方式</strong>：学员信息 / 意向列表点进画像时带 <code>from=conference</code>，左栏才出现「本期会务信息」。</li><li><strong>左栏</strong>：身份条、系统标签；从会务进入时才展示本期签到/小组/通关/核销。</li><li><strong>不含</strong>商机漏斗或正式诊断结论；分析助手是辅助，不改档案事实。</li></ul>",
    },
    42: {
      flag: "changed",
      title: "画像档案 · 家庭组与关系图谱（v1.2.0）",
      lead: "家庭组看「谁和我同一家庭」；关系图谱看「当前生效的推荐/归属」，两者不要混用。",
      body: "<ul><li><strong>家庭组</strong>：家庭ID、人数、角色 chips；成员表含编号/姓名/性别/身份/手机，高亮本人。</li><li><strong>关系图谱</strong>：浅灰「待定 · 本期可能不做」，本轮不作为交付范围。</li><li>图谱交互仍可看，但不纳入本期验收。</li></ul>",
    },
    43: {
      flag: "changed",
      title: "画像档案 · 基础信息（v1.2.0）",
      lead: "中栏基础信息对齐会员详情口径，分成身份与状态、关系人、认证人口、社会属性四块。",
      body: "<p>字段名与会员中心保持一致，缺数按数仓映射补齐，不另造别名。</p><ul><li><strong>身份与状态</strong>：会员ID、6Q姓名、手机、邮箱、地区城市、运营服务处、实名/会员状态、身份、角色。</li><li><strong>关系人</strong>：当前生效的归属天使与推荐人；完整边关系看右栏图谱。</li><li><strong>认证 / 社会</strong>：真实姓名、性别年龄生日；职业行业学历微信紧急联系人注册时间备注。</li></ul>",
    },
    44: {
      title: "版本规范（开发拆分依据）",
      body: "<p>从本版起按<strong>三条产品线</strong>封 <code>.0</code>，开发按版本号拆范围。历史原型编号 v1.0.0～v1.0.4 不再作为拆分依据。</p><ul><li><strong>v1.1.0</strong> 标签管理系统；后续只加 v1.1.1、v1.1.2…</li><li><strong>v1.2.0</strong> 学员档案 + 分析策略 + 会务后台意向分析 + 会务工作台 APP + 面谈官只读查档</li><li><strong>v1.3.0</strong> AI 分析助手（会务后台与面谈官门户共用工作台）</li></ul><p>需求部门：市场部 · 产品负责人：姜玲玲。完整范围表见总功能清单「版本范围」。</p>",
    },
    45: {
      flag: "changed",
      title: "画像档案 · 行为与跟进（v1.2.0）",
      lead: "意向列表不再放行为列和历史跟进。现场要翻明细，一律进画像右栏。",
      body: "<ul><li><strong>跟进记录</strong>：一律按创建时间倒序；卡片预览最近 5 条，「查看更多」展开会员详情全字段表。</li><li><strong>从会务进入</strong>：本场会务的跟进明细旁标注「来自于本场会务」。</li><li><strong>近期行为明细</strong>：社区 / 学习 / 视频 / 直播四 Tab，各预览 5 条，查看更多按类型看全量。</li></ul>",
    },
    46: {
      title: "6Q 面谈官门户（v1.2.0）",
      body: "<p>独立 PC 门户：会员账号登录（手机/邮箱+密码+验证码）→ 选进行中会务 → 只读意向列表/明细抽屉 → 画像（含 AI）。</p><ul><li>角色来自会务内「面谈官」赋权；看会务全部学员</li><li>不搬策略配置；无跟进入录/导出</li><li>无会务空态：「当前无正在进行中的会务」</li></ul><p>入口：<code>6q-interviewer-portal/login.html</code></p>",
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
      title: "画像档案 · 全模块字段说明（v1.2.0）",
      lead: "下面用列表把画像页每个模块的元素名称、元素类型、是否必填和说明写清。点左侧目录可跳到对应模块注释。",
      body: "<p>阅读顺序建议：左栏入口 → 基础信息 → 家庭/关系 → 购课退款 → 跟进行为 → 分析助手。</p><p><span style='color:#2563eb;font-weight:700'>(new)</span> 表示本版新增；<span style='color:#c2410c;font-weight:700'>(changed)</span> 表示本次注明调整；<span style='color:#b91c1c;font-weight:700'>(removed)</span> 表示已从表中删除。生产字段以会员中心 / 课务接口为准，原型仅对齐口径。</p>",
    },
    51: {
      flag: "changed",
      title: "画像档案 · 购买课程（v1.2.1）",
      lead: "购买课程按课程产品一行汇总；表内字段都读资格中心线下产品，不读订单 SKU。",
      body: "<p>数据来源：<strong>资格中心 · 线下产品</strong> https://www.6qedu.cn/admin/qualificationCentre/offLineProduct</p><ul><li><strong>课程产品</strong>：资格中心按课程产品汇总后的产品名</li><li><strong>核销次数</strong>：该产品已核销 / 已报读次数；无核销为 0</li><li><strong>待使用的资格</strong>：尚未核销、仍可报读的次数，展示为「2次」「3次」；无为「0次」</li><li><strong>累计消费金额</strong>：该产品在所有会务已支付合计，人民币展示</li><li><strong>最近报读核销时间</strong>：最近一次核销时间；无核销为 —</li></ul>",
    },
    52: {
      flag: "new",
      title: "画像档案 · 家庭组未使用资格（v1.2.2）",
      lead: "家庭组给每位成员统计未使用资格；点「查看」弹窗看该人未使用的产品、次数和最近报读核销时间。",
      body: "<p>次数与弹窗明细都来自<strong>资格中心 · 线下产品</strong> https://www.6qedu.cn/admin/qualificationCentre/offLineProduct</p><ul><li><strong>未使用资格</strong>：该成员尚未核销的资格次数合计，展示为「2次」；点「查看」打开弹窗</li><li><strong>本人</strong>与购买课程「待使用的资格」同源；其他家庭成员按各自会员读资格中心</li><li><strong>弹窗列</strong>：课程产品、资格数量（N次）、最近报读核销时间（无核销为 —）</li><li>无未使用资格时弹窗空态「暂无未使用资格」</li></ul>",
    },
    53: {
      flag: "new",
      title: "画像档案 · 课程产品总评价（v1.2.3）",
      lead: "学员对各课程产品的评价按创建时间倒序铺在中栏；条数多时进弹窗按产品或时间筛。",
      body: "<ul><li><strong>卡片</strong>：评价（条数）+ 预览最近 2 条：头像、姓名、星级、日期、报读课程、正文、图片</li><li><strong>报读课程</strong>：期次 + 产品名 + 站次 + 导师，底色浅橙对齐评价中心</li><li><strong>查看更多</strong>：弹窗可筛课程产品、创建时间起止；结果仍倒序</li><li>无评价空态「暂无课程评价」；筛不到「没有符合筛选的评价」</li></ul>",
    },
    54: {
      flag: "new",
      title: "画像档案 · 本期会务信息与跟进标注（v1.2.3）",
      lead: "只有从会务点进档案才出示本期会务信息和「来自于本场会务」；其它入口只看全局档案。",
      body: "<ul><li><strong>从会务进入</strong>：学员信息 / 意向列表带 <code>from=conference</code>，或面谈官门户已选会务</li><li><strong>本期会务信息</strong>：签到号、小组、通关、签到、核销；不从会务进入则整块不渲染</li><li><strong>跟进</strong>：默认时间倒序；从会务进入时，关联本期的明细标注「来自于本场会务」</li></ul>",
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
      tag: "v1.2.0 查档 · v1.3.0 助手",
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
              text: "[v1.2.0] 操作列「画像档案」入口",
              notes: [41]
            }
          ]
        },
        {
          name: "会务详情 · 画像档案",
          href: "6q-conference-prototype/conference-student-profile.html?id=m10009",
          items: [
            {
              text: "[v1.2.0] 三栏事实档案：系统标签 / 购课复购 / 跟进退款行为",
              notes: [41]
            },
            {
              text: "[v1.2.0] 购课按课程产品计次；复购=同产品≥2；退款订单口径",
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
              text: "[v1.2.3] 课程产品总评价：倒序预览 + 更多评价弹窗（课程产品 / 创建时间筛选）",
              notes: [53]
            },
            {
              text: "[v1.2.3] 关系图谱浅灰标注「待定 · 本期可能不做」",
              notes: [42]
            },
            {
              text: "[v1.2.3] 「本期会务上下文」改名为「本期会务信息」；仅从会务点进才展示",
              notes: [54, 41]
            },
            {
              text: "[v1.2.3] 从会务进入时跟进明细标注「来自于本场会务」，其它入口按时间倒序",
              notes: [54, 45]
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
              text: "[v1.2.0] 行为列/历史跟进已迁出 → 画像档案",
              notes: [27, 45]
            },
            {
              text: "[v1.2.0] 查看明细仅保留：标签命中 + 洞察与推荐",
              notes: [29]
            },
            {
              text: "[v1.2.0] 点击学员姓名 → 画像档案",
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
    date: "2026-09-02",
    rule: "三条产品线各自封 .0；之后只在第三个小数点递增（v1.1.1 / v1.2.1 / v1.3.1）。历史原型编号 v1.0.0～v1.0.4 不再作为开发拆分依据。",
    lines: [
      { version: "v1.1.0", name: "标签管理系统", next: "v1.1.1" },
      { version: "v1.2.0", name: "学员档案 / 分析策略 / 会务后台意向分析 / 会务工作台 APP / 面谈官只读查档", next: "v1.2.4" },
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
      date: "2026.09.02",
      current: true,
      theme: "学员档案 + 分析策略 + 会务后台意向分析 / 会务工作台 APP",
      href: "6q-conference-prototype/conference-student-intent.html",
      rows: [
        {
          req: [
            "1. 路径：会务工具 → 分析策略模板（与具体期次无关）",
            "2. 列表展示：名称、说明、关注标签数、意向度方式、更新时间",
            "3. 可新建 / 编辑 / 删除；若本期已选用该模板，删除须二次确认，已保存策略快照不受影响",
            "4. 权限：会务统筹配置角色可增删改；其他人不可见或只读",
            "5. 「本期已选用」角标：当前期 templateId 命中时显示",
          ],
          impl: [
            "后台：模板存完整 JSON（关注标签+权重+意向度方式）；删除只禁新选用，不改已保存本期快照",
            "后台：权限点 conference_intent_config",
            "前端：列表角标读本期 config.templateId",
          ],
          pages: [{ name: "分析策略模板", href: "6q-conference-prototype/tools-intent-strategy-template.html" }],
        },
        {
          req: [
            "1. 路径：分析策略模板 → 编辑模板",
            "2. 关注标签：系统标签树多选二级；逻辑二选一「命中任一 / 命中全部」",
            "3. 关注集合同时用于缩小列表 + 挂策略权重计分；未关注的命中标签可展示但不计分",
            "4. 意向度每期只能选一种：A 按权重分（高/中/低三个阈值）或 B 按命中标签（高/中/低三组+组内任一/全部）",
            "5. A 判定顺序：高 → 中 → 低 → 未分级；输入=意向分（关注权重和 + AI 0~25）",
            "6. B 允许同一标签出现在多档，展示取最高档；B 不用分数切档，但列表仍展示意向分供排序",
            "7. 策略权重配在模板/本期策略的关注标签上，不在标签平台",
          ],
          impl: [
            "后台：intent_score = Σ(关注∩命中 的策略权重) + ai_score(0~25)",
            "后台：方式 A 用阈值切档；方式 B 用标签组合判定，分数仍落库供排序",
            "前端：标签树先一级再二级；方式 A/B 互斥表单，保存前校验阈值或组合非空",
          ],
          pages: [{ name: "编辑模板", href: "6q-conference-prototype/tools-intent-strategy-template-edit.html" }],
        },
        {
          req: [
            "1. 路径：会务详情 → 本期分析策略；每期独立实例",
            "2. 可下拉选用模板（带规则预览）或复制上期策略",
            "3. 「保存本期策略并重算」后：策略版本号递增、意向列表立即重算、APP 清除已分析缓存并强制重跑分析动效",
            "4. 已保存策略预览含高/中/低人数分布；可跳转意向分析 / 管理模板",
            "5. 本期未保存策略时，意向分析页必须空态引导，禁止静默用系统默认策略出数",
          ],
          impl: [
            "后台：biz_conference_intent_config 按 conference_id 存；保存写 intent_strategy_version++",
            "后台：保存后同步重算名单筛/分/档，并通知 APP 版本不一致",
            "前端：未配置出引导条+跳转按钮；已配置顶部只读策略摘要，本页不可改规则",
          ],
          pages: [
            { name: "本期分析策略", href: "6q-conference-prototype/conference-intent-strategy.html" },
            { name: "学员意向分析", href: "6q-conference-prototype/conference-student-intent.html" },
          ],
        },
        {
          req: [
            "1. 路径：会务详情 → 学员意向分析",
            "2. 列：学员（姓名/会员ID/手机脱敏）、意向分、意向度、命中标签、跟进内容（当前会务）、AI 短摘要、推荐产品",
            "3. 跟进内容只取本期会务该学员最新/汇总人工原文；过长截断 + tooltip 全文",
            "4. 社区/学习/视频/直播列与历史跟进不在本列表；点姓名进画像档案",
            "5. 默认排序：意向分降序 → AI 降序 → 数据更新时间倒序",
            "6. 搜索：姓名 / 手机号 / 会员 ID；导出二期占位",
          ],
          impl: [
            "后台：列表读本期名单 ∩ 策略筛；跟进只查当前 conference_id",
            "后台：AI 短摘要来自 insight 表，跟进保存后异步写入",
            "前端：行为列不渲染；姓名链到画像；导出按钮占位",
          ],
          pages: [{ name: "学员意向分析", href: "6q-conference-prototype/conference-student-intent.html" }],
        },
        {
          req: [
            "1. 推荐产品列两行：主推课程一行（课名+匹配度）；有事业说明会「意向了解方向」且含导师或天使时，才出现礼包名称一行",
            "2. 无方向则不存在礼包行，不是显示「无」或破折号",
            "3. 可约谈时间不能单独触发出礼包",
            "4. 查看明细抽屉：标签命中 + 洞察与推荐（结论一句 / 依据若干 / 下一步）；不在抽屉确认智能匹配、不写成交话术",
            "5. 下一步按上课层级（标签与报读取高）给下一跳课阶；终阶谈复训",
          ],
          impl: [
            "后台：礼包闸门=careerPresentation.intendedDirection 非空且匹配导师或天使；不读角色标签",
            "后台：抽屉 insight 结构化三块；课程产品与礼包分区，无礼包意向不返回礼包对象",
            "前端：推荐列按行渲染；无礼包不占位；抽屉无匹配确认按钮",
          ],
          pages: [
            { name: "学员意向分析", href: "6q-conference-prototype/conference-student-intent.html" },
            { name: "面谈官意向列表", href: "6q-interviewer-portal/student-intent.html" },
          ],
        },
        {
          req: [
            "1. 路径：会务详情 → 学员信息 → 操作列「画像档案」，独立页打开",
            "2. 画像是会员全局档案，主键 member_id，与标签/报读/跟进同一 ID",
            "3. 左栏：身份条、本期签到/小组/通关、命中的二级系统标签",
            "4. 中栏基础信息对齐会员详情：身份与状态 / 关系人 / 认证人口 / 社会属性",
            "5. 家庭组看同一家庭成员；关系图谱看当前生效推荐/归属（1 跳，实线主动/虚线被动）",
            "6. 购课按课程产品计次；复购=同产品≥2；退款按订单口径",
            "7. 不含商机漏斗或正式诊断结论；助手不改档案事实",
          ],
          impl: [
            "后台：档案聚合会员中心+数仓映射，缺数不另造别名",
            "后台：图谱只返回当前生效 1 跳边；家庭组高亮本人",
            "前端：三栏布局；页顶保留本期会务上下文；「会员详情查看」原型占位",
          ],
          pages: [
            { name: "学员信息", href: "6q-conference-prototype/conference-students.html" },
            { name: "画像档案", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" },
          ],
        },
        {
          req: [
            "1. 跟进记录卡片预览最近 5 条（类型/时间/标签/内容/跟进人/会务）；查看更多展开会员详情全字段",
            "2. 近期行为四 Tab：社区 / 学习 / 视频 / 直播，各预览 5 条，查看更多按类型看全量",
            "3. 近 30 天趋势与社区话题活跃是聚合图，不等于明细表；话题按话题名称细拆，不用分类汇总代替",
            "4. 跟进入录在会务跟进菜单：内容、标签、图片；范围=本期会务×该学员；保存后异步触发 AI",
          ],
          impl: [
            "后台：跟进写 conference_follow；保存后异步调 AI，回写 insight（分/短摘要/结构化三块）",
            "后台：行为四类分接口或分 type 查询，预览 limit=5",
            "前端：意向列表不渲染行为列；明细进画像右栏抽屉",
          ],
          pages: [
            { name: "画像档案", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" },
            { name: "会务跟进", href: "6q-conference-prototype/conference-detail-basic.html" },
          ],
        },
        {
          req: [
            "1. 面谈官独立 PC 门户：手机/邮箱+密码+图形验证码登录",
            "2. 选择进行中会务；无会务空态「当前无正在进行中的会务」",
            "3. 只读意向列表 + 查看明细 + 画像；点姓名进画像",
            "4. 不包含策略配置、跟进入录、导出",
            "5. 角色来自会务内「面谈官」赋权，看该会务全部学员",
          ],
          impl: [
            "后台：门户账号与会务面谈官赋权校验；接口只读",
            "前端：不渲染策略/跟进/导出入口；列表呈现对齐后台",
          ],
          pages: [
            { name: "面谈官登录", href: "6q-interviewer-portal/login.html" },
            { name: "面谈官意向列表", href: "6q-interviewer-portal/student-intent.html" },
            { name: "面谈官画像", href: "6q-interviewer-portal/student-profile.html?id=m10009" },
          ],
        },
        {
          req: [
            "1. 路径：会务 APP → 本期学员列表 → AI 意向洞察横幅",
            "2. 后台保存本期策略后 APP 对比本地已分析版本，不一致则强制重跑分析动效，禁止展示旧策略结果",
            "3. 分析动效结束后进入意向洞察中控：高/中/低/未分级环形图、KPI、优先跟进 TOP3",
            "4. 中控「本期高频产品」只统计课程主推，礼包客单价不进榜",
            "5. 意向学员列表按档位 Tab；卡片与 PC 对齐：课一行，有方向才礼包一行",
            "6. 学员详情：意向度/分/命中标签、AI 一句话、跟进只读；课程产品与礼包分区，无礼包意向整块不渲染",
            "7. 主推产品展示匹配度+备选 1~2；商品用紧凑 SKU 行（名称左、价格右）；不可在 APP 改排序",
            "8. 会务 APP 不承载大型分析助手工作台",
          ],
          impl: [
            "后台：APP 读同一套 intent_strategy_version 与名单结果",
            "后台：高频榜聚合课程主推次数，排除礼包",
            "前端：版本不一致进扫描页；推荐区两行/礼包闸门与 PC 同源；SKU 行不重复「线下/线上」form",
          ],
          pages: [
            { name: "学员列表", href: "6q-conference-app-prototype/app-students.html" },
            { name: "分析动效", href: "6q-conference-app-prototype/app-intent-scan.html" },
            { name: "意向中控", href: "6q-conference-app-prototype/app-intent-dashboard.html" },
            { name: "意向列表", href: "6q-conference-app-prototype/app-intent-list.html" },
            { name: "学员详情", href: "6q-conference-app-prototype/app-student-detail.html" },
          ],
        },
      ],
    },
    {
      id: "v121",
      version: "v1.2.1",
      date: "2026.09.02",
      current: true,
      theme: "学员档案 · 购买课程按产品汇总",
      href: "6q-conference-prototype/conference-student-profile.html?id=m10009",
      rows: [
        {
          req: [
            "1. 画像档案「购买课程」按课程产品汇总，不再按订单拆商品 SKU",
            "2. 删除字段：商品、最近购买",
            "3. 新增字段：核销次数、待使用的资格（展示为 2次/3次）、累计消费金额（该产品所有会务已支付合计）、最近报读核销时间",
            "4. 购买课程表字段一律读资格中心 · 线下产品；每列注释写明来源与口径",
            "5. 无核销时次数为 0、时间为 —；无待使用资格为 0次；会务后台与面谈官门户同一套档案页",
          ],
          impl: [
            "前端：购买课程读 purchaseByProduct（writeoffCount / pendingQualCount / amount / lastWriteoffAt）",
            "前端：待使用的资格展示 N次；复购记录去掉「最近购买」列；订单笔数仍按 purchases 计",
            "注释：note 51 字段表每列第一条说明均为资格中心 URL",
            "Mock：项琳琳「如何说」待使用 2次；张志远「如何说」待使用 3次、核销 0 作对照",
          ],
          pages: [
            { name: "会务后台画像", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" },
            { name: "面谈官画像", href: "6q-interviewer-portal/student-profile.html?id=m10009" },
          ],
        },
      ],
    },
    {
      id: "v122",
      version: "v1.2.2",
      date: "2026.09.03",
      current: true,
      theme: "学员档案 · 家庭组未使用资格",
      href: "6q-conference-prototype/conference-student-profile.html?id=m10009",
      rows: [
        {
          req: [
            "1. 画像档案家庭组为每位成员增加「未使用资格」字段，展示合计次数如 2次、3次",
            "2. 点「查看」打开弹窗列表：该成员未使用的课程产品、对应资格数量、该人对该产品的最近报读核销时间",
            "3. 本人未使用资格与购买课程「待使用的资格」同源；其他家庭成员按各自会员读资格中心",
            "4. 无未使用资格时次数为 0次，弹窗空态「暂无未使用资格」",
            "5. 数据来源：资格中心 · 线下产品；会务后台与面谈官门户同一套档案页",
          ],
          impl: [
            "前端：家庭组成员列未使用资格合计；本人从 purchaseByProduct.pendingQualCount 汇总，其他人读 member.unusedQuals",
            "前端：弹窗列课程产品 / 资格数量（N次）/ 最近报读核销时间；无核销时间为 —",
            "Mock：项琳琳本人 2次（如何说）；陈志强 3次（如何说 1次 + 高EQ 2次）；陈予安 0次",
          ],
          pages: [
            { name: "会务后台画像", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" },
            { name: "面谈官画像", href: "6q-interviewer-portal/student-profile.html?id=m10009" },
          ],
        },
      ],
    },
    {
      id: "v123",
      version: "v1.2.3",
      date: "2026.09.07",
      current: true,
      theme: "学员档案 · 课程评价 / 会务信息 / 图谱待定",
      href: "6q-conference-prototype/conference-student-profile.html?id=m10009&from=conference",
      rows: [
        {
          req: [
            "1. 画像增加学员对各课程产品的总评价区块，字段对齐评价中心：姓名、星级、日期、报读课程、正文、图片",
            "2. 评价按创建时间倒序；预览最近 2 条，条数多时「查看更多」打开弹窗",
            "3. 更多评价弹窗可按课程产品、创建时间起止筛选，结果仍倒序",
            "4. 关系图谱浅灰标注「待定 · 本期可能不做」",
            "5. 「本期会务上下文」改名为「本期会务信息」；仅从会务点进档案时展示",
            "6. 从会务进入时，跟进历史里属于本场会务的明细标注「来自于本场会务」；其它入口只按时间倒序",
          ],
          impl: [
            "前端：中栏评价读 reviews，倒序预览 2 条；弹窗筛 product / createdAt",
            "前端：from=conference 或面谈官门户才渲染本期会务信息；跟进按 time 倒序并打本场徽章",
            "前端：关系图谱卡片 pf-card--tbd + 待定徽章",
            "Mock：项琳琳 7 条跨产品评价；张志远 1 条（无查看更多）",
          ],
          pages: [
            { name: "会务进入画像", href: "6q-conference-prototype/conference-student-profile.html?id=m10009&from=conference" },
            { name: "全局进入画像", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" },
            { name: "面谈官画像", href: "6q-interviewer-portal/student-profile.html?id=m10009" },
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
            "1. 会务后台画像与面谈官门户共用约 90vw × 88vh 双栏工作台，保留画像上下文",
            "2. 空白时左侧演示栏默认展开，发出第一句后收起，可再展开换剧本",
            "3. 会话按工作人员 user_id 私有隔离；结果只读参考，不写回档案事实",
            "4. 输入框上方追问条：2 条阶段底盘 + 1 条贴上一句，点击即发；匹配动效期间隐藏",
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
        {
          req: [
            "1. 空白会话两张开场卡：「我要答疑」发出「Hi，答疑助手」；「分析学员」发出「Hi，分析助手」",
            "2. 点演示发言在同一会话追加，不清空右侧已有推荐",
          ],
          impl: [
            "前端：start-mode 卡 data-mode=qa|analysis；handleMessageAction 按 data-message-action 分支，禁止把非 continue 当匹配",
            "核心：detectStartMode 只认开场原句，不误伤自由补充",
          ],
          pages: [{ name: "会务后台画像助手", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" }],
        },
        {
          req: [
            "1. 答疑路径复刻智能体三条预输入及回答，不走产品匹配、不打开右栏",
            "2. 预输入 1：你能教我一下如何有方法的答疑吗 → 五步法总览（听/问/分/转/行）+ 实战小贴士",
            "3. 预输入 2：叛逆家长第一步怎么回答 → 第一步标准示范（共情蓝条 + 提问蓝条 + 手册第3/5/7章 + 为什么这样答）",
            "4. 预输入 3：我连接了，下一步呢？ → 第二步标准示范（区分事实与故事）；可续第三步转向资源",
            "5. 回答顶栏：直接回复 › + 已深度思考（2.0s / 4.2s / 3.7s 标签）；示范话术用左侧蓝条",
            "6. 公开原型不含复制/点赞条、不含报价成交话术",
          ],
          impl: [
            "核心：QA_PRESETS + detectQaPreset；命中走 getQaMentorReply，未命中才回退旧四步场景",
            "前端：kind=qa-mentor 渲染文章；右栏匹配结果区保持空态",
            "测试：预输入映射与「不写复制沟通话术」回归",
          ],
          pages: [{ name: "会务后台画像助手", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" }],
        },
        {
          req: [
            "1. 分析路径先确认当前页学员（是 / 其它学员）",
            "2. 其它学员按姓名或会员 ID 检索；演示可检索项琳琳 m10009、夏兰 m10001、张志远 m10003",
            "3. 确认后再选原演示三维度：兴趣解读 / 下一步跟进 / 课程产品匹配",
          ],
          impl: [
            "核心：analysisState.gate=confirm|search|ready；isOtherStudent / searchLearnerIndex",
            "前端：student-confirm / student-hits / dimension-pick",
          ],
          pages: [{ name: "会务后台画像助手", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" }],
        },
        {
          req: [
            "1. 兴趣解读：用户标签 + 行为埋点 → 左栏依据",
            "2. 下一步跟进：上课层级、报读购买、跟进 → 进阶建议",
            "3. 课务检索开场用智搜原句：广州最近有哪些课程正在开课？ / 总导师的课程有哪些？ / 一阶和二阶有什么区别？",
            "4. 检索只答左栏，无 C 端报读按钮，不自动触发右侧匹配",
            "5. 产品细节追问只改左栏，右侧推荐区不跳转、不滚到卡片、不高亮",
          ],
          impl: [
            "后台/Mock：检索走课务期数词典（城市/导师/课阶），不由模型编造日期",
            "前端：检索回答 kind=retrieval；追问条按阶段换套",
          ],
          pages: [{ name: "会务后台画像助手", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" }],
        },
        {
          req: [
            "1. 课程产品匹配必须工作人员确认后才走 A+B，不会自动开右栏",
            "2. 匹配综合会话条件、标签、埋点、跟进、报读 + 产品/SKU/课务，右栏出主推与备选",
            "3. 预算是入选硬门槛；超预算商品可留在详情「仅供了解」",
            "4. 右栏产品匹配结果页（主推/备选/课务/商品）本版范围以现网为准，不另改交互",
            "5. 失败兜底：明确失败标记 + 预算过滤后的兜底产品",
          ],
          impl: [
            "前端：确认匹配后播 A+B 动效再写 matchVersions；右栏 .pf-ai__result 只读最新版本",
            "后台/Mock：产品级推荐，不以 SKU 为推荐单位；不可人工改排序",
          ],
          pages: [{ name: "会务后台画像助手", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" }],
        },
        {
          req: [
            "1. 匹配侧礼包闸门与列表一致：意向了解方向含导师或天使才出礼包权益区",
            "2. 无方向不渲染礼包区块",
            "3. 主推商品在助手/APP 用紧凑 SKU 行：标题「课程商品」+ 右侧价位区间；名称已含线下/线上时不重复 form",
            "4. 主推最多 3 条，备选最多 2 条",
          ],
          impl: [
            "核心：hasCareerGiftIntent；无礼包意向 gifts=[]",
            "前端：renderGoodsList 紧凑行；公开源码禁止写领袖营报价数字稿（如 8600/25800）",
          ],
          pages: [
            { name: "会务后台画像助手", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" },
            { name: "APP 学员详情", href: "6q-conference-app-prototype/app-student-detail.html" },
          ],
        },
        {
          req: [
            "1. 匹配完成后左栏提示「匹配完成」，询问是否按学员数据生成面谈提示",
            "2. 提示六维加粗：兴趣信号 / 上课进度 / 报读关系 / 事业说明会 / 主推产品 / 跟进缺口",
            "3. 按钮文案「需要，按学员数据给提示」；禁止「复制沟通话术」",
            "4. 面谈提示不含报价与成交话术",
          ],
          impl: [
            "核心：buildMatchCompleteCopy + buildSalesCoach；coach 项 dim 固定六维",
            "测试：doesNotMatch 8600|25800|复制沟通话术",
          ],
          pages: [{ name: "会务后台画像助手", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" }],
        },
        {
          req: [
            "1. 个人历史可搜索学员、会务、标题、日期；空白会话不保存，首次消息后生成",
            "2. 本版不做：人工修改 AI 推荐排序、APP 承载大型工作台、公开原型成交/报价话术",
          ],
          impl: [
            "前端：历史抽屉按标题/学员/日期过滤；空草稿不 persist",
            "前端：APP 只保留意向中控与详情，不嵌入双栏工作台",
          ],
          pages: [{ name: "会务后台画像助手", href: "6q-conference-prototype/conference-student-profile.html?id=m10009" }],
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
