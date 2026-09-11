/* 系统结构图 · 与 index 功能清单共用；scope=global 或挂到具体端 */
window.INTENT_ARCHITECTURE = [
  {
    id: "overview",
    scope: "global",
    title: "总览与数据层",
    desc: "数仓 → 标签平台 → 会务 PC / APP / 面谈官门户；AI 与 member_id 主键关系。",
    mermaid:
      "flowchart TB\n" +
      "  subgraph DW[数仓与埋点]\n" +
      "    D1[用户属性]\n" +
      "    D2[行为路由事件]\n" +
      "    D3[360行为聚合]\n" +
      "    D4[报读购买]\n" +
      "  end\n" +
      "  subgraph TAG[用户标签平台]\n" +
      "    T4[规则与批处理]\n" +
      "    T6[(命中快照)]\n" +
      "    T4 --> T6\n" +
      "  end\n" +
      "  subgraph PC[会务后台PC]\n" +
      "    P0[策略模板]\n" +
      "    P1[本期策略]\n" +
      "    P2[学员意向分析]\n" +
      "    P3[跟进记录]\n" +
      "    P0 --> P1 --> P2\n" +
      "    P3 --> P2\n" +
      "  end\n" +
      "  subgraph APP[会务APP]\n" +
      "    A1[学员列表]\n" +
      "    A3[意向中控]\n" +
      "    A5[学员详情]\n" +
      "    A1 --> A3 --> A5\n" +
      "  end\n" +
      "  subgraph Portal[面谈官门户]\n" +
      "    PO1[选会务]\n" +
      "    PO2[只读意向/画像]\n" +
      "    PO1 --> PO2\n" +
      "  end\n" +
      "  subgraph AI[AI服务]\n" +
      "    AI1[提炼与AI分]\n" +
      "    AI2[产品推荐]\n" +
      "  end\n" +
      "  DW --> TAG\n" +
      "  T6 --> P2\n" +
      "  T6 --> APP\n" +
      "  T6 --> Portal\n" +
      "  P1 --> APP\n" +
      "  P1 --> Portal\n" +
      "  P3 --> AI1\n" +
      "  T6 --> AI1\n" +
      "  AI1 --> P2\n" +
      "  AI1 --> APP\n" +
      "  T6 --> AI2\n" +
      "  D4 --> AI2\n" +
      "  AI2 --> P2\n" +
      "  AI2 --> A5",
  },
  {
    id: "modules",
    scope: "global",
    title: "各端模块与页面",
    desc: "四端原型目录树：页面文件与导航关系。",
    mermaid:
      "flowchart LR\n" +
      "  subgraph Portal[6q-interviewer-portal]\n" +
      "    PO1[登录]\n" +
      "    PO2[选会务]\n" +
      "    PO3[意向列表]\n" +
      "    PO4[用户档案]\n" +
      "    PO1 --> PO2 --> PO3 --> PO4\n" +
      "  end\n" +
      "  subgraph ConfAPP[6q-conference-app-prototype]\n" +
      "    AP1[学员列表]\n" +
      "    AP3[意向中控]\n" +
      "    AP5[学员详情]\n" +
      "    AP1 --> AP3 --> AP5\n" +
      "  end\n" +
      "  subgraph ConfPC[6q-conference-prototype]\n" +
      "    PC1[策略模板]\n" +
      "    PC3[本期策略]\n" +
      "    PC4[学员意向分析]\n" +
      "    PC1 --> PC3 --> PC4\n" +
      "  end\n" +
      "  subgraph TagAdmin[user-tag-admin]\n" +
      "    TG1[标签管理]\n" +
      "    TG2[新增编辑标签]\n" +
      "    TG3[执行历史]\n" +
      "    TG1 --> TG2\n" +
      "    TG1 --> TG3\n" +
      "  end",
  },
  {
    id: "portal-flow",
    scope: "portal",
    title: "面谈官门户 · 查档链路",
    desc: "会员登录 → 选进行中会务 → 只读意向列表 → 画像（含 AI）。",
    mermaid:
      "flowchart LR\n" +
      "  L[登录] --> S[选进行中会务]\n" +
      "  S --> I[学员意向列表]\n" +
      "  I -->|点姓名| P[会员信息-用户档案]\n" +
      "  I -->|查看明细| D[标签命中+洞察]\n" +
      "  P --> AI[AI对话chips]",
  },
  {
    id: "tag-rules",
    scope: "tag",
    title: "标签平台 · 规则与调度",
    desc: "v1.1：自然语言→AI 写 SQL（固化后例行复用）；原可视化规则一期不做。产出命中快照。",
    mermaid:
      "flowchart TB\n" +
      "  subgraph V11[v1.1 圈选]\n" +
      "    N[自然语言]\n" +
      "    AI[智能体生成SQL]\n" +
      "    C[确认并计算]\n" +
      "    N --> AI --> C\n" +
      "  end\n" +
      "  subgraph Skip[一期不做]\n" +
      "    R1[可视化条件行]\n" +
      "    R2[条件组且或]\n" +
      "  end\n" +
      "  subgraph Update[更新方式]\n" +
      "    U1[手动]\n" +
      "    U2[例行每日·复用SQL]\n" +
      "  end\n" +
      "  subgraph Out[产出]\n" +
      "    O3[(tag_member_snapshot)]\n" +
      "  end\n" +
      "  C --> O3\n" +
      "  U1 --> O3\n" +
      "  U2 --> O3",
  },
  {
    id: "pc-strategy",
    scope: "pc",
    title: "会务后台 · 策略与分析",
    desc: "模板 → 本期策略 → 意向列表；意向分/意向度/抽屉结构。",
    mermaid:
      "flowchart TB\n" +
      "  subgraph Template[策略模板]\n" +
      "    TM1[关注标签]\n" +
      "    TM2[意向度二选一]\n" +
      "  end\n" +
      "  subgraph Period[本期策略]\n" +
      "    PE2[保存并重算]\n" +
      "    PE3[版本递增]\n" +
      "    PE2 --> PE3\n" +
      "  end\n" +
      "  subgraph Analysis[学员意向分析]\n" +
      "    AN3[列表与KPI]\n" +
      "    AN4[明细抽屉]\n" +
      "    AN3 --> AN4\n" +
      "  end\n" +
      "  Template --> Period --> Analysis",
  },
  {
    id: "app-flow",
    scope: "app",
    title: "会务 APP · 现场链路",
    desc: "策略版本绑定；重扫动效；中控到详情只读消费。",
    mermaid:
      "sequenceDiagram\n" +
      "  participant L as 学员列表\n" +
      "  participant S as AI分析动效\n" +
      "  participant D as 意向中控\n" +
      "  participant Det as 学员详情\n" +
      "  L->>S: 版本变更时重扫\n" +
      "  S->>D: 进入中控\n" +
      "  D->>Det: 档位或TOP3",
  },
  {
    id: "assistant-intents",
    scope: "pc",
    flag: "new",
    title: "画像分析助手 · 意图流与数据源",
    desc: "演示 Mock 剧本；生产由 Dify 识别意图，期数/价格/名额走课务与产品接口。",
    mermaid:
      "flowchart TB\n" +
      "  subgraph Entry[演示入口]\n" +
      "    A1[兴趣解读]\n" +
      "    A2[下一步跟进]\n" +
      "    A3[推荐产品]\n" +
      "    R1[广州最近开课]\n" +
      "    R2[总导师课程]\n" +
      "    R3[一阶二阶区别]\n" +
      "  end\n" +
      "  subgraph Data[数据源]\n" +
      "    D1[用户标签]\n" +
      "    D2[行为埋点]\n" +
      "    D3[跟进记录]\n" +
      "    D4[报读购买学习]\n" +
      "    D5[课务期数导师课阶]\n" +
      "    D6[课程产品SKU]\n" +
      "    D7[当前会话条件]\n" +
      "  end\n" +
      "  A1 --> D1\n" +
      "  A1 --> D2\n" +
      "  A2 --> D1\n" +
      "  A2 --> D4\n" +
      "  A3 --> Q{工作人员确认匹配?}\n" +
      "  Q -->|否| Chat[左栏对话]\n" +
      "  Q -->|是| Match[A+B智能匹配]\n" +
      "  R1 --> D5\n" +
      "  R2 --> D5\n" +
      "  R3 --> D5\n" +
      "  Chat --> Follow[输入框上方追问]\n" +
      "  Match --> D6\n" +
      "  Match --> Right[右栏主推与备选]\n" +
      "  Right --> Follow\n" +
      "  Follow --> Chat",
  },
  {
    id: "e2e",
    scope: "global",
    title: "端到端数据流",
    desc: "输入 → 计算 → 多端只读输出的主链路。",
    mermaid:
      "flowchart LR\n" +
      "  I1[全平台学员] --> C1[标签批处理]\n" +
      "  I2[本期名单] --> C2[策略引擎]\n" +
      "  I3[会务跟进] --> C3[AI服务]\n" +
      "  C1 --> C2\n" +
      "  C1 --> C3\n" +
      "  C2 --> O1[PC列表]\n" +
      "  C2 --> O2[APP]\n" +
      "  C2 --> O4[面谈官门户]\n" +
      "  C3 --> O3[推荐]",
  },
  {
    id: "scope",
    scope: "global",
    title: "一期边界",
    desc: "v1 做与不做范围。",
    mermaid:
      "flowchart LR\n" +
      "  subgraph Do[一期做]\n" +
      "    A1[多端闭环]\n" +
      "    A2[策略与AI推荐]\n" +
      "    A3[面谈官只读门户]\n" +
      "  end\n" +
      "  subgraph Dont[一期不做]\n" +
      "    B1[会务改标签]\n" +
      "    B2[改AI推荐]\n" +
      "  end",
  },
  {
    id: "roles",
    scope: "global",
    title: "各端职责对照",
    desc: "各端能做什么、不能做什么。",
    html:
      '<table class="ipn-arch-table">' +
      "<thead><tr><th>端</th><th>职责</th><th>改规则</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>面谈官门户</td><td>选会务、只读意向/画像</td><td>❌ 只读</td></tr>" +
      "<tr><td>会务 APP</td><td>看分布、读推荐</td><td>❌ 只读</td></tr>" +
      "<tr><td>会务 PC</td><td>策略、分析、跟进录入</td><td>策略✅ 权重❌</td></tr>" +
      "<tr><td>标签平台</td><td>规则、批处理、快照</td><td>✅</td></tr>" +
      "</tbody></table>",
  },
];
