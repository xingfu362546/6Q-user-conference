/* 三端系统结构图 · 原型页注释抽屉用（与 index 功能清单共用数据） */
window.INTENT_ARCHITECTURE = [
  {
    id: "overview",
    title: "三端总览与数据层",
    desc: "数仓 → 标签平台 → 会务 PC / APP；AI 与 member_id 主键关系。",
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
      "  subgraph AI[AI服务]\n" +
      "    AI1[提炼与AI分]\n" +
      "    AI2[产品推荐]\n" +
      "  end\n" +
      "  DW --> TAG\n" +
      "  T6 --> P2\n" +
      "  T6 --> APP\n" +
      "  P1 --> APP\n" +
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
    title: "各端模块与页面",
    desc: "三端原型目录树：页面文件与导航关系。",
    mermaid:
      "flowchart LR\n" +
      "  subgraph TagAdmin[user-tag-admin]\n" +
      "    TG1[标签管理]\n" +
      "    TG2[新增编辑标签]\n" +
      "    TG3[执行历史]\n" +
      "    TG1 --> TG2\n" +
      "    TG1 --> TG3\n" +
      "  end\n" +
      "  subgraph ConfPC[6q-conference-prototype]\n" +
      "    PC1[策略模板]\n" +
      "    PC3[本期策略]\n" +
      "    PC4[学员意向分析]\n" +
      "    PC1 --> PC3 --> PC4\n" +
      "  end\n" +
      "  subgraph ConfAPP[6q-conference-app-prototype]\n" +
      "    AP1[学员列表]\n" +
      "    AP3[意向中控]\n" +
      "    AP5[学员详情]\n" +
      "    AP1 --> AP3 --> AP5\n" +
      "  end",
  },
  {
    id: "tag-rules",
    title: "标签平台 · 规则与调度",
    desc: "四类规则条件；手动/例行每日更新；快照与版本产出。",
    mermaid:
      "flowchart TB\n" +
      "  subgraph Rules[规则类型]\n" +
      "    R1[用户属性]\n" +
      "    R2[行为事件]\n" +
      "    R3[页面行为]\n" +
      "    R4[页面路径序列]\n" +
      "  end\n" +
      "  subgraph Update[更新方式]\n" +
      "    U1[手动]\n" +
      "    U2[例行每日]\n" +
      "  end\n" +
      "  subgraph Out[产出]\n" +
      "    O3[(tag_member_snapshot)]\n" +
      "  end\n" +
      "  Rules --> O3\n" +
      "  U1 --> O3\n" +
      "  U2 --> O3",
  },
  {
    id: "pc-strategy",
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
    id: "e2e",
    title: "端到端数据流",
    desc: "输入 → 计算 → 三端只读输出的主链路。",
    mermaid:
      "flowchart LR\n" +
      "  I1[全平台学员] --> C1[标签批处理]\n" +
      "  I2[本期名单] --> C2[策略引擎]\n" +
      "  I3[会务跟进] --> C3[AI服务]\n" +
      "  C1 --> C2\n" +
      "  C1 --> C3\n" +
      "  C2 --> O1[PC列表]\n" +
      "  C2 --> O2[APP]\n" +
      "  C3 --> O3[推荐]",
  },
  {
    id: "scope",
    title: "一期边界",
    desc: "v1 做与不做范围。",
    mermaid:
      "flowchart LR\n" +
      "  subgraph Do[一期做]\n" +
      "    A1[三端闭环]\n" +
      "    A2[策略与AI推荐]\n" +
      "  end\n" +
      "  subgraph Dont[一期不做]\n" +
      "    B1[会务改标签]\n" +
      "    B2[改AI推荐]\n" +
      "  end",
  },
  {
    id: "roles",
    title: "三端职责对照",
    desc: "各端能做什么、不能做什么。",
    html:
      '<table class="ipn-arch-table">' +
      "<thead><tr><th>端</th><th>职责</th><th>改规则</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>标签平台</td><td>规则、批处理、快照</td><td>✅</td></tr>" +
      "<tr><td>会务 PC</td><td>策略、分析、跟进录入</td><td>策略✅ 权重❌</td></tr>" +
      "<tr><td>会务 APP</td><td>看分布、读推荐</td><td>❌ 只读</td></tr>" +
      "</tbody></table>",
  },
];
