/* 学员意向分析 · 三端系统结构图（index 功能清单页） */
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
      "    TG4[数据接入]\n" +
      "    TG5[数据表管理]\n" +
      "    TG1 --> TG2\n" +
      "    TG1 --> TG3\n" +
      "  end\n" +
      "  subgraph ConfPC[6q-conference-prototype]\n" +
      "    PC1[策略模板]\n" +
      "    PC2[编辑模板]\n" +
      "    PC3[本期策略]\n" +
      "    PC4[学员意向分析]\n" +
      "    PC5[跟进记录]\n" +
      "    PC1 --> PC2\n" +
      "    PC3 --> PC4\n" +
      "    PC5 -.-> PC4\n" +
      "  end\n" +
      "  subgraph ConfAPP[6q-conference-app-prototype]\n" +
      "    AP1[学员列表]\n" +
      "    AP2[AI分析动效]\n" +
      "    AP3[意向中控]\n" +
      "    AP4[意向列表]\n" +
      "    AP5[学员详情]\n" +
      "    AP1 --> AP2 --> AP3\n" +
      "    AP3 --> AP4 --> AP5\n" +
      "  end",
  },
  {
    id: "tag-rules",
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
      "    U1[手动 立即计算]\n" +
      "    U2[例行 每日·复用SQL]\n" +
      "  end\n" +
      "  subgraph Out[产出]\n" +
      "    O1[覆盖人数 上次成功]\n" +
      "    O2[版本 YYYYMMDD]\n" +
      "    O3[(tag_member_snapshot)]\n" +
      "  end\n" +
      "  C --> O3\n" +
      "  U1 --> O3\n" +
      "  U2 --> O3\n" +
      "  O3 --> O1\n" +
      "  O3 --> O2",
  },
  {
    id: "pc-strategy",
    title: "会务后台 · 策略与分析",
    desc: "模板 → 本期策略 → 意向列表；意向分/意向度/抽屉结构。",
    mermaid:
      "flowchart TB\n" +
      "  subgraph Template[策略模板 跨期]\n" +
      "    TM1[关注标签 任一或全部]\n" +
      "    TM2[意向度 二选一]\n" +
      "    TM2a[按权重分阈值]\n" +
      "    TM2b[按命中标签组合]\n" +
      "    TM1 --> TM2\n" +
      "    TM2 --> TM2a\n" +
      "    TM2 --> TM2b\n" +
      "  end\n" +
      "  subgraph Period[本期策略]\n" +
      "    PE1[选用模板或复制上期]\n" +
      "    PE2[保存并重算]\n" +
      "    PE3[策略版本递增]\n" +
      "    PE1 --> PE2 --> PE3\n" +
      "  end\n" +
      "  subgraph Analysis[学员意向分析]\n" +
      "    AN0{已配置?}\n" +
      "    AN0 -->|否| Empty[空态引导]\n" +
      "    AN0 -->|是| AN3[学员列表与KPI]\n" +
      "    AN3 --> AN4[明细抽屉]\n" +
      "  end\n" +
      "  subgraph Drawer[抽屉Tab]\n" +
      "    D1[标签命中]\n" +
      "    D2[洞察与推荐]\n" +
      "    D3[社区学习视频]\n" +
      "  end\n" +
      "  Template --> Period\n" +
      "  Period --> Analysis\n" +
      "  AN4 --> Drawer\n" +
      "  F1[意向分=Σ标签权重+AI分]\n" +
      "  Period --> F1\n" +
      "  F1 --> AN3",
  },
  {
    id: "app-flow",
    title: "会务 APP · 现场链路",
    desc: "策略版本绑定；重扫动效；中控到详情只读消费。",
    mermaid:
      "sequenceDiagram\n" +
      "  participant U as 现场助教\n" +
      "  participant L as 学员列表\n" +
      "  participant S as AI分析动效\n" +
      "  participant D as 意向中控\n" +
      "  participant Det as 学员详情\n" +
      "  participant PC as 后台策略\n" +
      "  PC->>L: intent_strategy_version\n" +
      "  U->>L: 点AI意向洞察\n" +
      "  alt 版本变更或未分析\n" +
      "    L->>S: 强制重扫\n" +
      "    S->>D: 进入中控\n" +
      "  else 已分析且版本一致\n" +
      "    L->>D: 直达中控\n" +
      "  end\n" +
      "  D->>Det: TOP3或档位列表\n" +
      "  Note over Det: 跟进只读 推荐不可改",
  },
  {
    id: "e2e",
    title: "端到端数据流",
    desc: "输入 → 计算 → 三端只读输出的主链路。",
    mermaid:
      "flowchart LR\n" +
      "  subgraph In[输入]\n" +
      "    I1[全平台学员]\n" +
      "    I2[本期会务名单]\n" +
      "    I3[会务跟进]\n" +
      "  end\n" +
      "  subgraph Compute[计算]\n" +
      "    C1[标签批处理]\n" +
      "    C2[本期策略引擎]\n" +
      "    C3[AI服务]\n" +
      "  end\n" +
      "  subgraph Out[输出]\n" +
      "    O1[PC意向列表]\n" +
      "    O2[APP中控详情]\n" +
      "    O3[产品推荐]\n" +
      "  end\n" +
      "  I1 --> C1\n" +
      "  C1 --> C2\n" +
      "  I2 --> C2\n" +
      "  I3 --> C3\n" +
      "  C1 --> C3\n" +
      "  C2 --> O1\n" +
      "  C2 --> O2\n" +
      "  C3 --> O1\n" +
      "  C3 --> O2\n" +
      "  C3 --> O3",
  },
  {
    id: "scope",
    title: "一期边界",
    desc: "v1 做与不做范围。",
    mermaid:
      "flowchart LR\n" +
      "  subgraph Do[一期做]\n" +
      "    A1[三端原型闭环]\n" +
      "    A2[标签只读消费]\n" +
      "    A3[策略模板与本期策略]\n" +
      "    A4[意向分度AI推荐]\n" +
      "    A5[例行每日调度]\n" +
      "    A6[路径序列规则]\n" +
      "  end\n" +
      "  subgraph Dont[一期不做]\n" +
      "    B1[会务改标签规则]\n" +
      "    B2[人工改AI推荐]\n" +
      "    B3[实时秒级画像]\n" +
      "    B4[列表内编辑策略]\n" +
      "    B5[导出Excel]\n" +
      "  end",
  },
  {
    id: "roles",
    title: "三端职责对照",
    desc: "各端能做什么、不能做什么。",
    html:
      '<table class="arch-table">' +
      "<thead><tr><th>端</th><th>职责</th><th>典型页面</th><th>改规则/权重</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>标签平台</td><td>规则、批处理、快照</td><td>标签管理、新增标签</td><td>✅ 运营</td></tr>" +
      "<tr><td>会务 PC · 策略</td><td>模板 + 本期策略</td><td>策略模板、本期分析策略</td><td>✅ 统筹角色</td></tr>" +
      "<tr><td>会务 PC · 分析</td><td>列表、KPI、抽屉</td><td>学员意向分析</td><td>❌ 只读</td></tr>" +
      "<tr><td>会务 PC · 录入</td><td>人工跟进</td><td>跟进记录</td><td>—</td></tr>" +
      "<tr><td>会务 APP</td><td>看分布、跟学员、读推荐</td><td>中控 → 详情</td><td>❌ 只读</td></tr>" +
      "</tbody></table>",
  },
];
