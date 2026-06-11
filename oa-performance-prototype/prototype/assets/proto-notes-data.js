/**
 * v1.0.0 原型注释 · 业务流程 + 数据流转 + 规则说明
 * 呈现：红点序号，点击展开右侧抽屉
 */
window.PROTO_NOTE_PAGES = {

  /* ───────────── 导航入口 ───────────── */
  hub: {
    title: '原型导航',
    notes: [
      {
        n: 1,
        attach: '.hub-grid h1',
        title: 'v1.0.0 端到端主链路',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">HR 建计划 → 配范围包+模板 → 分批发放 → 员工填表提交 → 上级/分管评分 → HR 统计 & 奖金实时结算 → 员工只读回看</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ol><li><strong>计划</strong>（周期唯一）→ 生成多条 <strong>员工任务</strong>（计划×人）</li>' +
          '<li>任务绑定 <strong>范围包 ID + 模板 ID</strong>，写入待办推送小程序/OA</li>' +
          '<li>员工提交 → 任务状态「已提交」→ 触发上级待办</li>' +
          '<li>评分完成 → 汇总总得分 → 奖金引擎按「计划·范围包·职级」单元排名</li></ol>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>全公司同周期仅一条计划；一人仅属一个范围包</li>' +
          '<li>员工不可见上级分、评语、奖金；上级不可见奖金排名</li>' +
          '<li>详见 <code>docs/HANDOFF-v1.0.0.md</code></li></ul>',
      },
      {
        n: 2,
        attach: '.hub-grid h2:nth-of-type(1)',
        title: '小程序端 · 流程与分工',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">首页宫格「绩效」→ 当前待办选任务 → 8步/季度向导填表 → Step8 提交 → 等上级评 → 过往提交只读回看</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>待办列表读 <strong>任务表</strong>：过滤「未截止 + 未提交/填写中」</li>' +
          '<li>填表进度写 <strong>草稿</strong>（原型 localStorage；正式 taskId + 服务端）</li>' +
          '<li>提交后任务状态回写，同步消减待办角标</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>领导 Tab：仅<strong>直接上级</strong>月度简版评分</li>' +
          '<li><strong>分管评分不做小程序</strong>，仅在 OA</li>' +
          '<li>逾期 / 过往提交为独立 URL 页面（v1.0 分段改造）</li></ul>',
      },
      {
        n: 3,
        attach: '.hub-grid h2:nth-of-type(4)',
        title: 'HR 端 · v1.0 新增能力',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<ol><li><strong>计划管理</strong>：新建向导 → 范围包选人 → 绑模板 → 绑奖金规则 → 勾选发放</li>' +
          '<li><strong>计划明细</strong>：盯进度、催办、补发范围包、看奖金试算</li>' +
          '<li><strong>奖金规则</strong>：维护排名奖扣档 → 计划引用</li>' +
          '<li><strong>薪酬结算</strong>：评完即纳入排名，导出对接薪酬（二期）</li></ol>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>范围包发放 → 批量创建员工任务 + 推送待办</li>' +
          '<li>评分事件 → 更新任务评分状态 → 触发奖金引擎重算</li>' +
          '<li>结算结果仅写入 HR/薪酬视图，不下发员工端</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>范围包已发放 <strong>锁定</strong>人选+模板；补人只能新建包</li>' +
          '<li>奖金排名单元 = 同计划 · 同范围包 · 同职级；同分并列</li>' +
          '<li>纳入结算须：已提交 + 上级评完 + 分管评完（同人合并例外）</li></ul>',
      },
    ],
  },

  /* ───────────── 小程序 ───────────── */
  'mp-home': {
    title: '小程序首页',
    notes: [
      {
        n: 1,
        attach: '.mp-header',
        title: '绩效入口 · 触达链路',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">员工打开 6Q教育 → 自助服务点「绩效」→ 进入任务列表</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>宫格入口携带用户身份，请求待办计数 API</li>' +
          '<li>角标 = 当前待办 + 领导待评（若兼岗）之和</li>' +
          '<li>与 OA「个人中心→我的绩效」读同一任务源</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>v1.0 新增第 7 宫格项「绩效」，视觉与审批/考勤区分。无待办时不强制显示角标。</p>',
      },
      {
        n: 2,
        attach: '.mp-grid',
        title: '宫格与权限',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>点击「绩效」→ <code>task-list.html</code>，默认员工 Tab「当前待办」。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv"><dt>读</dt><dd>用户角色、待办任务列表、计划截止时间</dd>' +
          '<dt>写</dt><dd>无（纯导航）；后续可 deep link <code>?tab=leader</code></dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>仅在职全职/办事处等已纳入计划的人员可见任务；未分配范围包者无待办。</p>',
      },
    ],
  },

  'mp-task-list': {
    title: '小程序 · 当前待办',
    notes: [
      {
        n: 1,
        attach: '.mp-segment',
        title: '分段导航 · 任务生命周期',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">当前待办（可填）→ 提交 → 过往提交（只读）｜过截止未交 → 逾期（锁定，待 HR 解锁）</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>三段对应任务表不同 <strong>status + deadline</strong> 组合过滤</li>' +
          '<li>分段为独立 HTML 页，切换即路由跳转（非 SPA Tab）</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li><strong>当前</strong>：deadline ≥ now 且 status ∈ {未开始, 填写中}</li>' +
          '<li><strong>逾期</strong>：deadline &lt; now 且未 Step8 提交</li>' +
          '<li><strong>过往</strong>：已提交或流程已结束</li></ul>',
      },
      {
        n: 2,
        attach: '.mp-role-tabs',
        title: '员工 / 领导双视角',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>兼岗用户 Tab 切换：员工看自己待填任务；领导看下属已提交待评任务。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>员工 Tab：filter assignee = 当前用户</li>' +
          '<li>领导 Tab：filter supervisor = 当前用户 AND status = 已提交</li>' +
          '<li>分管待评<strong>不在此 Tab</strong>，走 OA 待办</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>领导 Tab 角标 = 待评条数。评分完成后从列表移除或标「已评」。</p>',
      },
      {
        n: 3,
        attach: '#mp-task-list',
        title: '任务卡片 · 字段与来源',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>点卡片 → 进入月/季向导续填；已提交任务不在此列表出现。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>考核期</dt><dd>计划.name + 计划.period（如 2026年5月）</dd>' +
          '<dt>类型</dt><dd>计划.type → 决定跳转 monthly / quarterly wizard</dd>' +
          '<dt>状态</dt><dd>任务.status：填写中 / 未开始；附 step 进度如 3/8</dd>' +
          '<dt>截止</dt><dd>计划.employeeDeadline</dd>' +
          '<dt>操作</dt><dd>进入 wizard；月度任务另有「复制往期」按钮</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>进度 step 由草稿 stepIndex 计算。「复制往期」带入历史 KR 结构后跳转填表（<code>employee-past-copy.js</code>）。</p>',
      },
    ],
  },

  'mp-task-overdue': {
    title: '小程序 · 逾期',
    notes: [
      {
        n: 1,
        attach: '#mp-banner',
        title: '逾期判定与解锁',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">过截止未交 → 逾期 Tab · 待解锁（置灰不可点）｜ HR 解锁 → 仍留逾期 Tab · 已解锁（可续填）</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>status=<code>overdue</code> + unlockState=<code>locked|unlocked</code></li>' +
          '<li>解锁：HR 写 unlockAt；unlockState→unlocked，草稿保留</li>' +
          '<li>锁定态禁止进入 wizard；解锁态可 href 填表</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>原型逾期 Tab 展示<strong>两条对照</strong>：4月待解锁 / 3月已解锁</li>' +
          '<li>解锁需 HR 权限；逾期期间 Step8 提交仍受截止校验</li></ul>',
      },
      {
        n: 2,
        attach: '#mp-task-list',
        title: '逾期列表字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>考核任务</dt><dd>计划名 + 周期</dd>' +
          '<dt>逾期天数</dt><dd>ceil(now − employeeDeadline)</dd>' +
          '<dt>状态</dt><dd>待解锁（locked）· 已解锁（unlocked）；均留逾期 Tab</dd>' +
          '<dt>交互</dt><dd>locked 卡片置灰无链接；unlocked 可进 wizard</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>列表含 4月/3月两条对照；segment 角标 = 逾期条数（2）。</p>',
      },
    ],
  },

  'mp-task-past': {
    title: '小程序 · 过往提交',
    notes: [
      {
        n: 1,
        attach: '#mp-banner',
        title: '保密与可见边界',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>员工提交后可在此查历史记录 → 点进只读详情页，核对当时自填内容。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>读 <strong>已提交快照</strong>（submitSnapshot），非实时草稿</li>' +
          '<li>响应层剔除 supervisorScore、comment、bonus 等字段</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>❌ 不可见：上级分、领导评语、综合核定、等级、奖金排名</li>' +
          '<li>✅ 可见：本人 KR/自评/自评分/下月目标 + 员工侧状态（已提交/已完成）</li></ul>',
      },
      {
        n: 2,
        attach: '#mp-task-list',
        title: '过往列表字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>考核期</dt><dd>计划周期</dd>' +
          '<dt>提交时间</dt><dd>任务.submittedAt</dd>' +
          '<dt>状态</dt><dd>已提交 / 待上级 / 已完成（不含评分明细）</dd>' +
          '<dt>操作</dt><dd>跳转 task-past-view，只读渲染快照</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>按提交时间倒序；支持按年筛选为二期。</p>',
      },
    ],
  },

  'mp-task-past-view': {
    title: '小程序 · 只读回看',
    notes: [
      {
        n: 1,
        attach: '.mp-readonly-banner',
        title: '快照只读模式',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>员工核对「当时提交了啥」→ 不可编辑 → 返回列表。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>加载 task.submitSnapshot JSON，按模板 schema 渲染区块</li>' +
          '<li>不请求评分接口；API 网关层对 employee 角色过滤敏感字段</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>若 HR 退回后员工重交，过往列表保留<strong>每次提交版本</strong>为二期；MVP 展示最新一次。</p>',
      },
      {
        n: 2,
        attach: '.mp-readonly-section',
        title: '区块与模板对应',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>各 section 对应模板字段组：表头信息 → KR 指标 → 自评总结 → 下月/下季目标。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>月度/季度模板字段不同，渲染器按 templateId 切换</li>' +
          '<li>上级分列、6Q3J 上级评、面谈上级意见等<strong>不渲染</strong></li></ul>',
      },
    ],
  },

  'mp-monthly-wizard': {
    title: '小程序 · 月度填表',
    notes: [
      {
        n: 1,
        attach: '#stepper',
        title: '8 步向导 · 贴表 Phase（方案 A）',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">【A】本月考评（步1–6）→ 【B】下月目标（步7）→ 确认提交（步8）</div>' +
          '<ol><li>核心 V · 2) 常规 X · 3) 行为态度 · 4) 加减分 · 5) 自评打分 · 6) 自评总结</li>' +
          '<li>下月核心目标 · 8) 预览确认提交</li></ol>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>每步 next → 写 draft.stepIndex + draft.formData</li>' +
          '<li>Step8 提交 → 校验 → 写 submitSnapshot + status=submitted → 推上级待办</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>Phase 条贴月度表结构，8 步子步仍对应 Excel 字段组</li>' +
          '<li>与 OA 同源 <code>wizard.js</code>；断点续填 localStorage / 正式 taskId 草稿</li>' +
          '<li><strong>复制往期</strong>：待办或填表顶栏可带入历史 KR，不含自评与成果</li></ul>',
      },
      {
        n: 3,
        attach: '#wizard-copy-bar',
        title: '从往期提交复制',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">选历史月表 → 确认 → 覆盖草稿 KR → 员工补 M 与自评</div>' +
          '<p class="proto-sec">复制范围</p>' +
          '<ul><li>✅ O · SMART · 权重 · 考核标准分档</li>' +
          '<li>❌ 关键成果 M · 自评分 · 加减分 · 总结 · 下月目标 · 行为事件</li></ul>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>读 submitSnapshot（原型 mock）→ 写 localStorage draft · 标记 copiedFrom</p>',
      },
      {
        n: 2,
        attach: '#wizard-content',
        title: '考核标准 · 分档格式（方案 A）',
        body:
          '<p class="proto-sec">规则说明</p>' +
          '<p>O / SMART 不变；<strong>考核标准</strong>为 ①–⑤ 业绩达成率分档，满分档 = KR 权重（如 25%→25 分）。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>存 <code>standardTiers[]</code>；改权重自动按比例刷新各档分，可手动微调。</p>' +
          '<p class="proto-sec">业务流程</p>' +
          '<p>Step5 工作 KR 自评只读展示分档；行为态度在下方卡片单独自评（模板固定标准 + 1–5 分）。</p>',
      },
    ],
  },

  'mp-quarterly-wizard': {
    title: '小程序 · 季度填表',
    notes: [
      {
        n: 1,
        attach: '#stepper',
        title: '季度步骤 · 贴表 Phase（方案 A）',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">【A】本季考评（步1–7）→ 【B】下季目标（步8）→ 确认提交（步9）</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>步骤条与 OA 统一 <code>renderPhaseStepper()</code>（块状 phase）</li>' +
          '<li>步1–2、步8 考核标准同月度分档 <code>standardTiers</code></li>' +
          '<li>季度表字段更多，快照体积大于月度</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>6Q3J、面谈等内容员工填自评部分；上级/分管分列在 OA 评分页填写。</p>',
      },
      {
        n: 2,
        attach: '#wizard-content',
        title: '季度专属区块',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>员工完成本季 KR 自评与面谈记录 → 制定下季目标 → 提交进入双节点评分流。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>季度审批含<strong>上级 + 分管领导</strong>（OA）</li>' +
          '<li>同人合并时一次评分填两列（见奖金规则 §7）</li></ul>',
      },
    ],
  },

  'mp-leader-score': {
    title: '小程序 · 领导月度评分',
    notes: [
      {
        n: 1,
        attach: '.mp-banner',
        title: '简版评分流程',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">待办进入 → 展开 KR 填上级分 → 核定加减分 → 看下月目标（只读）→ 提交 → 回列表</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>读员工 submitSnapshot + 草稿 supervisorDraft</li>' +
          '<li>提交写 supervisorScore、adjustScore、totalScore → 任务 status=scored</li>' +
          '<li>触发奖金引擎（若分管也已评完或合并评）</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>小程序<strong>无分管节点</strong>、无批量同指标 #26</li>' +
          '<li>下月目标<strong>只读</strong>，无需领导确认（OA 完整版可确认/退回）</li></ul>',
      },
      {
        n: 2,
        attach: '#mp-score-list',
        title: '校验 R1 / R2',
        body:
          '<p class="proto-sec">规则说明</p>' +
          '<dl class="proto-kv">' +
          '<dt>R1</dt><dd>单项上级分 &gt; 权重上限 → 该项变红</dd>' +
          '<dt>R2</dt><dd>核心 V 合计 &gt;85 / 常规 X &gt;15 / 行为 &gt;15 / 总工作块 &gt;100 → 红字</dd>' +
          '<dt>预览</dt><dd>工作块小计 + 加减分核定 = 核定总分</dd></dl>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>前端实时算合计；提交前拦截（OA 完整版不可提交；小程序原型可放宽演示）。</p>',
      },
      {
        n: 3,
        attach: '.mp-score-footer',
        title: '草稿与离开',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>未提交离开 → 提示保存；提交后不可撤回（退回走 OA 整表退回）。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>草稿写 supervisorDraft，不影响员工可见快照</li>' +
          '<li>正式环境草稿需 TTL 与 taskId 绑定</li></ul>',
      },
    ],
  },

  /* ───────────── OA 个人中心 ───────────── */
  'oa-index': {
    title: 'OA 首页',
    notes: [
      {
        n: 1,
        attach: '.q-oa-page',
        title: 'OA 模块入口',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>顶栏切换「个人中心 / 人力资源」→ 侧栏进绩效子菜单。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>SSO 身份 → 拉菜单权限 → 个人中心看员工/领导任务；HR 看计划/规则/结算。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>菜单 IA 见 <code>docs/OA_HR_MENU_IA.md</code>；旧「员工月度/季度绩效」菜单已下线。</p>',
      },
    ],
  },

  'oa-personal': {
    title: '个人中心',
    notes: [
      {
        n: 1,
        attach: '#q-oa-sidenav',
        title: '我的绩效 · 入口',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>个人中心 → 我的绩效 → <strong>绩效待办</strong>（侧栏唯一子项）→ 当前/逾期 Tab 点任务进月/季填表；领导另走「待我审核」。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>与小程序读同一任务 API；OA 侧栏 active 态由 route 决定。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>双 Tab 页须标注【员工】【领导】视角，避免兼岗用户混淆。</p>',
      },
    ],
  },

  'oa-personal-perf': {
    title: 'OA · 当前待办',
    notes: [
      {
        n: 1,
        attach: '.tabs.card',
        title: '双 Tab · 兼岗',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>【员工】填自己的表；【领导】预览下属待评，完整列表点链到 supervisor-review-list。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>Tab 切换仅前端显隐，不改 URL（与顶部分段导航不同）</li>' +
          '<li>领导预览读 review-list 前 N 条</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>领导 Tab 不含分管待评；分管仅 OA 独立待办（季度）。</p>',
      },
      {
        n: 2,
        attach: '.perf-segment',
        title: '分段 · 三态路由',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">当前待办 ↔ 逾期 ↔ 过往提交（三个 HTML，segment 高亮当前）</div>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>独立 URL 便于分享评审链接、浏览器后退不丢状态。</p>',
      },
      {
        n: 3,
        attach: '#panel-emp .q-table-wrap',
        title: '待办表 · 字段来源',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>考核任务</dt><dd>计划名；副标题 step 来自 draft.stepIndex/总步数</dd>' +
          '<dt>类型</dt><dd>month | quarter → 决定 wizard 路由</dd>' +
          '<dt>进度</dt><dd>任务.status + 标签色</dd>' +
          '<dt>截止</dt><dd>计划.employeeDeadline（日期）</dd>' +
          '<dt>操作</dt><dd>继续填写 / <strong>复制往期</strong>（带入 KR 结构）→ monthly-wizard</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>已提交任务不出现于此表。「复制往期」读历史 submitSnapshot，减轻重复填写（与小程序同源 <code>employee-past-copy.js</code>）。</p>',
      },
    ],
  },

  'oa-personal-overdue': {
    title: 'OA · 逾期',
    notes: [
      {
        n: 1,
        attach: '.perf-tip',
        title: '逾期 · HR 解锁闭环',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">截止未交 → 逾期 Tab · 待解锁行置灰 · HR 解锁 → 已解锁行可填（仍留本 Tab）</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>与小程序同源 <code>overdueState</code>；解锁写 audit log（二期）。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>对照演示：4月「不可填写」vs 3月「继续填写」；锁定行无 wizard / 复制往期入口。</p>',
      },
      {
        n: 2,
        attach: '.q-table-wrap',
        title: '逾期表字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>考核任务</dt><dd>计划+周期</dd>' +
          '<dt>逾期</dt><dd>天数或文案</dd>' +
          '<dt>状态</dt><dd>待 HR 解锁 / 已解锁·可填</dd>' +
          '<dt>操作</dt><dd>locked→「不可填写」；unlocked→继续填写+复制往期</dd></dl>',
      },
    ],
  },

  'oa-personal-past': {
    title: 'OA · 过往提交',
    notes: [
      {
        n: 1,
        attach: '.perf-tip',
        title: '保密策略',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>查历史自填 → 只读详情；不可在此查上级评价或奖金。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>API 角色=employee 时 strip 评分/奖金字段；与小程序 past 一致。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>综合分数公式（自评20%+上级80%）结果对员工不可见。</p>',
      },
      {
        n: 2,
        attach: '.q-table-wrap',
        title: '过往表字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>考核期</dt><dd>计划周期</dd>' +
          '<dt>提交时间</dt><dd>submittedAt</dd>' +
          '<dt>状态</dt><dd>员工可见粗粒度状态</dd>' +
          '<dt>操作</dt><dd>personal-perf-past-view 只读</dd></dl>',
      },
    ],
  },

  'oa-personal-past-view': {
    title: 'OA · 只读回看',
    notes: [
      {
        n: 1,
        attach: '.readonly-banner',
        title: '快照渲染',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>员工审计自己提交内容；不可编辑、不可看评。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>submitSnapshot → 模板引擎 → 分区 readonly-block 渲染。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>与小程序 past-view 字段范围一致，双端对齐。</p>',
      },
      {
        n: 2,
        attach: '.readonly-block',
        title: '字段分区',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>表头（姓名/部门/期）→ KR 块 → 自评总结 → 下月目标；均来自快照 JSON 键路径。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>若模板升级，历史快照按提交时 templateVersion 渲染，保证可追溯。</p>',
      },
    ],
  },

  'oa-monthly-wizard': {
    title: 'OA · 月度填表',
    notes: [
      {
        n: 1,
        attach: '#stepper',
        title: '向导 · 双栏布局（方案 A）',
        body:
          '<p class="proto-sec">入口</p>' +
          '<p>无侧栏菜单项；从绩效待办 / 逾期 Tab「继续填写」进入。提交 onSubmit → 跳回 personal-perf。</p>' +
          '<p class="proto-sec">业务流程</p>' +
          '<p>Phase 条：【A】本月考评（1–6）→ 【B】下月目标（7）→ 确认提交（8）；左栏 8 步，右栏进度同步。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>storageKey=<code>perf-monthly-oa-pc</code> 区分端</li>' +
          '<li>提交 onSubmit → 跳 personal-perf</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>Ant Design 风格组件；字段校验正式环境 Step8 启用（权重/必填/下月目标）。</p>',
      },
      {
        n: 2,
        attach: '#wizard-content',
        title: '考核标准 · 分档格式（方案 A）',
        body:
          '<p class="proto-sec">规则说明</p>' +
          '<p>与小程序同源：考核标准为 5 档达成率阶梯，各档分值随 KR 权重联动。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>字段 <code>standardTiers</code> 替代原 textarea；OA storageKey 独立不影响小程序草稿。</p>',
      },
      {
        n: 3,
        attach: '#wizard-copy-bar',
        title: '从往期提交复制',
        body:
          '<p class="proto-sec">与小程序同源</p>' +
          '<p>顶栏「从往期提交复制 KR」或待办页按钮；复制 O/SMART/权重/标准，不含自评。storageKey=<code>perf-monthly-oa-pc</code>。</p>',
      },
    ],
  },

  'oa-quarterly-wizard': {
    title: 'OA · 季度填表',
    notes: [
      {
        n: 1,
        attach: '#stepper',
        title: 'Phase 步骤条（方案 A）',
        body:
          '<p class="proto-sec">入口</p>' +
          '<p>无侧栏菜单项；从绩效待办点季度任务「开始填写」进入。</p>' +
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">【A】本季考评（1–7）→ 【B】下季目标（8）→ 确认提交（9）</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>v1.0 月/季统一 <code>renderPhaseStepper()</code>，替代旧 stepper-phases 样式。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>提交后进入「上级评 + 分管评」双节点（OA）；小程序仅员工填表。</p>',
      },
      {
        n: 2,
        attach: '#wizard-content',
        title: '提交后流转',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<ol><li>status → submitted</li><li>推 directSupervisor 待办</li><li>推 divisionLeader 待办（非同人时）</li><li>同人合并仅一条待办</li></ol>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>总得分在两端评分都完成后计算，供奖金排名使用。</p>',
      },
    ],
  },

  /* ───────────── OA 领导端 ───────────── */
  'oa-supervisor-list': {
    title: '领导 · 待我审核',
    notes: [
      {
        n: 1,
        attach: '.perf-tip',
        title: '待评触发链路',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">下属 Step8 提交 → 生成上级待办 → 本列表 → 进评分页 → 提交 → 回列表</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>filter：supervisorId=me AND status=submitted|scoring</li>' +
          '<li>提交后 status→scored，列表移除或标已评</li>' +
          '<li>若需分管且非同人：并行另一条 division 待办（不在本列表）</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p><strong>同人合并</strong>：上级=分管时仅 1 条待办，一次提交写两节点分数（mergedReview）。</p>',
      },
      {
        n: 2,
        attach: '.q-table-wrap',
        title: '待审核表字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>下属</dt><dd>任务.assigneeName</dd>' +
          '<dt>考核期</dt><dd>计划.periodLabel</dd>' +
          '<dt>提交时间</dt><dd>submittedAt</dd>' +
          '<dt>状态</dt><dd>待评 / 评分中（有草稿）/ 已评</dd>' +
          '<dt>操作</dt><dd>supervisor-score-monthly?id=taskId</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>仅直接上级可见自己的下属；跨部门分管走分管待办列表（季度占位）。</p>',
      },
    ],
  },

  'oa-supervisor-score-monthly': {
    title: '领导 · 月度评分',
    notes: [
      {
        n: 1,
        attach: '#score-header-info',
        title: '完整评分 · 动作集',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">KR/行为填分 → 加减分核定 → 对照员工原文 → 评语(选填) → 看下月目标 → 提交或整表退回</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>读 submitSnapshot；写 supervisorScores、adjustments、comment</li>' +
          '<li>提交：算 totalScore → 更新任务 → 通知 HR 统计/奖金引擎</li>' +
          '<li>退回：status→returned，员工待办重现，评分草稿清空</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>下月目标<strong>只读</strong>（v1.0 不打分、不确认）；季度 OA 版可确认/退回。</p>',
      },
      {
        n: 2,
        attach: '#score-ref-tabs',
        title: '员工原文对照',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>Tab 切换自评总结 / O·SMART·M 长文本；工作 KR 与下月目标<strong>考核标准</strong>以 ①–⑤ 分档只读展示，行为态度以模板条目列表展示（无分值列）。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>只读引用 snapshot 字段，修改不影响员工侧已提交内容。</p>',
      },
      {
        n: 3,
        attach: '#score-kr-list',
        title: '校验与总分',
        body:
          '<p class="proto-sec">规则说明</p>' +
          '<dl class="proto-kv">' +
          '<dt>R1–R3</dt><dd>单项/区块/合计/加减分上限，超限红字且 OA 不可提交</dd>' +
          '<dt>刻度</dt><dd>上级填加权分，上限=权重值（如权重25%→上限25分）</dd>' +
          '<dt>总分</dt><dd>工作块小计 + 加减分核定 = 核定总分（供奖金排名）</dd></dl>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>前端实时计算；提交时后端二次校验防篡改。</p>',
      },
      {
        n: 4,
        attach: '.score-actions',
        title: '草稿 · 离开 · 导航',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>离开弹窗三选一：继续编辑 / 放弃 / 保存草稿。提交后回列表，无上下一位。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>supervisorDraft 与 submitSnapshot 分离</li>' +
          '<li>保存草稿不触发奖金结算</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>整表退回后员工修改重交，上级需重新评（历史评分版本二期存档）。</p>',
      },
    ],
  },

  'oa-supervisor-score-quarterly': {
    title: '领导 · 季度评分（占位）',
    notes: [
      {
        n: 1,
        attach: '.q-oa-page',
        title: '季度双节点 · 规格',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">员工提交 → 上级评（KR/6Q3J/加减分）→ 分管评（分管列）→ 双方完成 → 出总得分 → 奖金结算</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>两节点分数分别写入 supervisorScore、divisionScore</li>' +
          '<li>totalScore = f(自评, 上级, 分管) 权重配置</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>v1.0 本页占位；完整交互后续迭代</li>' +
          '<li><strong>同人合并</strong>：一次提交，分管列自动粘贴，权重 40%+40%=80%</li>' +
          '<li>退回任节点联动退回员工</li></ul>',
      },
    ],
  },

  /* ───────────── HR 端 ───────────── */
  'hr-plan-list': {
    title: 'HR · 计划列表',
    notes: [
      {
        n: 1,
        attach: '.q-toolbar',
        title: '计划管理 · 入口',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">列表查计划 → 新建/编辑 → 明细盯盘 → 截止后统计归档</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>计划主表 + 聚合字段（范围包数、人数、提交进度）</li>' +
          '<li>新建跳 hr-plan-create；明细带 planId  query</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>同周期（年+月 / 年+季度）全公司<strong>唯一计划</strong>；旧分散菜单已收敛至此。</p>',
      },
      {
        n: 2,
        attach: '.q-table-wrap',
        title: '计划表 · 字段含义',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>计划名称</dt><dd>HR 命名，如「2026年5月月度考核」</dd>' +
          '<dt>考核类型</dt><dd>month | quarter → 决定模板池与奖金规则类型</dd>' +
          '<dt>周期</dt><dd>2026-05 或 2026-Q2，业务主键之一</dd>' +
          '<dt>参与范围</dt><dd>已配置范围包数 · 已分配人数；草稿显示「未分配」</dd>' +
          '<dt>状态</dt><dd>draft / active / closed</dd>' +
          '<dt>进度</dt><dd>已提交人数 / 应参与人数（已发放包内）</dd>' +
          '<dt>操作</dt><dd>明细 / 催办 / 编辑(草稿) / 发放(草稿包)</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>closed 后员工不可提交；HR 仍可看明细与结算导出。</p>',
      },
    ],
  },

  'hr-plan-create': {
    title: 'HR · 新建计划',
    notes: [
      {
        n: 1,
        attach: '#hr-create-stepper',
        title: '新建计划 · 全流程图',
        body:
          '<p class="proto-sec">端到端流程（HR 手工创建 · MVP）</p>' +
          '<div class="proto-flowchart">' +
          '<div class="proto-fc-node proto-fc-node--start">计划列表 · 点击「+ 新建计划」</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node"><span class="proto-fc-badge">Step 1</span><strong>类型与周期</strong>' +
          '<div class="proto-fc-desc">月/季 · 考核年度 · 月或季度 · 校验 (年,月) 或 (年,Q) 全公司唯一</div></div>' +
          '<div class="proto-fc-arrow">↓ merge → plan.type / plan.period / status=draft</div>' +
          '<div class="proto-fc-node"><span class="proto-fc-badge">Step 2</span><strong>参与范围 · 范围包</strong>' +
          '<div class="proto-fc-desc">新建包 → 组织树勾选 + 职级/岗位筛选 → 预览人员 → 一人仅属一包</div></div>' +
          '<div class="proto-fc-arrow">↓ 写 scopePack[] · memberIds[] · status=draft</div>' +
          '<div class="proto-fc-node"><span class="proto-fc-badge">Step 3</span><strong>开放时间 & 奖金规则</strong>' +
          '<div class="proto-fc-desc">启动时间 · 截止 · 预览各职级奖金规则匹配（非单选 bonusRuleId）</div></div>' +
          '<div class="proto-fc-arrow">↓ 写 plan.deadlines · plan.bonusRankingEnabled</div>' +
          '<div class="proto-fc-node"><span class="proto-fc-badge">Step 4</span><strong>模板匹配</strong>' +
          '<div class="proto-fc-desc">每个范围包手动选 1 张模板（月表/季表）；系统不自动人群×职级匹配</div></div>' +
          '<div class="proto-fc-arrow">↓ 写 scopePack.templateId</div>' +
          '<div class="proto-fc-node"><span class="proto-fc-badge">Step 5</span><strong>确认发放</strong>' +
          '<div class="proto-fc-desc">汇总计划配置 · 勾选要发放的范围包 ·「发放选中并保存」</div></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node proto-fc-node--decision">勾选了可发放包？<div class="proto-fc-desc">可发放 = 有人 + 已选模板 + 未 issued</div></div>' +
          '<div class="proto-fc-branch">' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">是 · 发放选中</span>' +
          '<div class="proto-fc-node">pack.status → issued（锁定人选+模板）</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">批量创建 perf_task<br><span class="proto-fc-desc">planId × assigneeId × templateId</span></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">推送员工待办 + 通知<br><span class="proto-fc-desc">到达启动时间后可见填表入口</span></div>' +
          '</div>' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">否 · 仅保存</span>' +
          '<div class="proto-fc-node proto-fc-node--warn">计划保持 draft<br><span class="proto-fc-desc">未勾选包仅保存配置</span></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">明细页后续「发放待办」<br>或「+ 新增范围」补发</div>' +
          '</div></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node proto-fc-node--end">跳转计划明细 · 盯进度 / 催办 / 奖金试算</div>' +
          '</div>' +
          '<p class="proto-sec">计划状态机</p>' +
          '<div class="proto-flow">draft →（发放包）→ active/进行中 →（过截止）→ 逾期/closed</div>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>同周期全公司<strong>仅 1 条</strong>计划；未划入范围包的人<strong>不参与</strong></li>' +
          '<li>已发放包锁定人选与模板；补人只能<strong>新建范围包</strong></li>' +
          '<li>详见 <code>docs/GRILL_HR_SCOPE.md</code> · <code>docs/BATCH_PLAN_CONCEPT.md</code></li></ul>',
      },
      {
        n: 2,
        attach: '#hr-create-body',
        title: 'Step 2 · 范围包选人子流程',
        body:
          '<p class="proto-sec">范围包选人 · 详细流程</p>' +
          '<div class="proto-flowchart">' +
          '<div class="proto-fc-node proto-fc-node--start">进入 Step 2 · 默认「范围1」</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node"><strong>左侧 · 范围包列表</strong>' +
          '<div class="proto-fc-desc">+ 新建范围包 · 改名 · 切换 activeScopeId · 查看每包人数</div></div>' +
          '<div class="proto-fc-arrow">↓ 选中当前包</div>' +
          '<div class="proto-fc-group"><div class="proto-fc-group-title">中间 · 全集团组织树</div>' +
          '<div class="proto-fc-node">顶栏搜索姓名/部门</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">勾部门 → <strong>级联全选</strong>下属人员</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node proto-fc-node--decision">人员是否已在其他包？</div>' +
          '<div class="proto-fc-branch">' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">是</span>' +
          '<div class="proto-fc-node proto-fc-node--warn">树节点/行 <strong>禁用</strong><br>不可重复分配</div></div>' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">否</span>' +
          '<div class="proto-fc-node">加入当前包 memberIds[]</div></div></div></div>' +
          '<div class="proto-fc-arrow">↓ 并行</div>' +
          '<div class="proto-fc-group"><div class="proto-fc-group-title">右侧 · 筛选辅助（A+C）</div>' +
          '<div class="proto-fc-node">职级多选（总监/经理/主管/职员）</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">岗位关键字 → 过滤树 + 符合条件人员列表</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">列表批量勾选加入当前包</div></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">预览：当前包 N 人 · 全计划已分配 M 人</div>' +
          '<div class="proto-fc-arrow">↓ 下一步</div>' +
          '<div class="proto-fc-node proto-fc-node--end">scopePack[] 随向导 state 带入 Step 4/5</div>' +
          '</div>' +
          '<p class="proto-sec">数据模型</p>' +
          '<div class="proto-flow">scopePack = { id, name, orgNodes[], levelFilter[], memberIds[], templateId, status: draft|issued }</div>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>人群类型字段<strong>仅展示</strong>，不参与自动模板匹配</li>' +
          '<li>职级/岗位仅作<strong>选人筛选</strong>，模板在 Step 4 手动绑定</li>' +
          '<li>一人仅属一包；未分配人员不参与本计划</li></ul>',
      },
      {
        n: 3,
        attach: '.hr-footer-actions',
        title: 'Step 3–5 · 时间与发放子流程',
        body:
          '<p class="proto-sec">Step 3 · 时间与奖金</p>' +
          '<div class="proto-flowchart">' +
          '<div class="proto-fc-node"><strong>计划启动时间</strong><div class="proto-fc-desc">tasks 在此时间后对员工可见（填表入口）</div></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node"><strong>员工填写截止</strong><div class="proto-fc-desc">未提交 → 任务标「已逾期」→ 移入过往待办</div></div>' +
          '<div class="proto-fc-arrow">↓ 必须早于</div>' +
          '<div class="proto-fc-node"><strong>上级评分截止</strong><div class="proto-fc-desc">领导待办截止；逾期仍可 HR 解锁后补评</div></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node"><strong>奖金规则 · 职级矩阵</strong><div class="proto-fc-desc">按职级展示已启用规则；缺职级标红</div></div>' +
          '</div>' +
          '<p class="proto-sec">Step 4 · 模板匹配</p>' +
          '<div class="proto-flowchart">' +
          '<div class="proto-fc-node">遍历 scopePack[] · 每包 1 个 template 下拉</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node proto-fc-node--decision">模板池按 plan.type 过滤</div>' +
          '<div class="proto-fc-branch">' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">month</span><div class="proto-fc-node">总监经理版 / 主管职员版</div></div>' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">quarter</span><div class="proto-fc-node">副总总监经理版 / 主管职员版</div></div></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node proto-fc-node--warn">已 issued 包 · 下拉 disabled（锁定）</div>' +
          '</div>' +
          '<p class="proto-sec">Step 5 · 发放 → 任务生成</p>' +
          '<div class="proto-flowchart">' +
          '<div class="proto-fc-node">展示计划摘要（名称/类型/范围包数/规则/时间窗）</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">表格勾选 issueSelected[packId]</div>' +
          '<div class="proto-fc-arrow">↓ 点击「发放选中并保存」</div>' +
          '<div class="proto-fc-node"><strong>foreach 勾选且可发放的包</strong></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">pack.status = issued</div>' +
          '<div class="proto-fc-arrow">↓ foreach memberId</div>' +
          '<div class="proto-fc-node">INSERT perf_task<br><span class="proto-fc-desc">assigneeId · planId · scopePackId · templateId · status=pending</span></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">INSERT 员工待办 + 消息通知</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node proto-fc-node--end">location → hr-plan-detail?plan=…</div>' +
          '</div>' +
          '<p class="proto-sec">员工侧后续（跨页面）</p>' +
          '<div class="proto-flow">…领导评分 → 双节点完成后奖金引擎按 planType+员工职级 匹配规则结算</div>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>员工截止 &lt; 上级评分截止；截止后未交转逾期</li>' +
          '<li>未勾选包仅保存 draft，明细页可「发放待办」或补建新包</li>' +
          '<li>奖金规则在计划运行期被结算引擎只读引用</li></ul>',
      },
      {
        n: 4,
        attach: '.q-oa-breadcrumb',
        title: '五步向导 · 步骤速查',
        body:
          '<p class="proto-sec">步骤与写入字段</p>' +
          '<dl class="proto-kv">' +
          '<dt>① 类型与周期</dt><dd>plan.type · plan.year · plan.month|quarter · 唯一性校验</dd>' +
          '<dt>② 参与范围</dt><dd>scopePack[] · memberIds[] · orgNodes · 互斥占用表</dd>' +
          '<dt>③ 开放时间</dt><dd>plan.startAt · employeeDeadline · supervisorDeadline · bonusRuleId</dd>' +
          '<dt>④ 模板匹配</dt><dd>scopePack.templateId（一包一模板 · HR 手动）</dd>' +
          '<dt>⑤ 确认发放</dt><dd>issueSelected → issued → 批量 task + 待办</dd></dl>' +
          '<p class="proto-sec">导航规则</p>' +
          '<ul><li>步骤条可点击跳步（原型无校验；正式环境建议限制未填完不可跳）</li>' +
          '<li>「取消」回列表不保存；「上一步/下一步」仅切换视图，state 内存持有</li>' +
          '<li>Step5 按钮文案：<strong>发放选中并保存</strong></li></ul>' +
          '<p class="proto-sec">与明细页衔接</p>' +
          '<div class="proto-flow">新建未完成发放 → 明细见 draft 包 → 点「发放」补发 | 新建已发放 → 明细见 issued 包 + 员工任务行 + 进度统计</div>',
      },
      {
        n: 5,
        attach: '.q-card-panel',
        title: '发放后 · 全链路下游流程',
        body:
          '<p class="proto-sec">计划发放 → 员工填表 → 评分 → 结算</p>' +
          '<div class="proto-flowchart">' +
          '<div class="proto-fc-node proto-fc-node--start">Step5 发放选中 · perf_task 创建完成</div>' +
          '<div class="proto-fc-arrow">↓ 到达 plan.startAt</div>' +
          '<div class="proto-fc-group"><div class="proto-fc-group-title">员工端 · 小程序 / OA 个人中心</div>' +
          '<div class="proto-fc-node">待办列表出现任务<br><span class="proto-fc-desc">filter: 未截止 + pending/draft</span></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">进入填表向导<br><span class="proto-fc-desc">月表 8 步 / 季表 9 步 · 断点续填 draft</span></div>' +
          '<div class="proto-fc-arrow">↓ Step8/9 提交</div>' +
          '<div class="proto-fc-node">写 submitSnapshot · task.status=submitted</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node proto-fc-node--decision">过 employeeDeadline 未交？</div>' +
          '<div class="proto-fc-branch">' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">是</span>' +
          '<div class="proto-fc-node proto-fc-node--warn">status=overdue<br>移入「过往待办」</div></div>' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">否 · 已提交</span>' +
          '<div class="proto-fc-node">推送上级待办</div></div></div></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-group"><div class="proto-fc-group-title">领导端 · OA 待我审核</div>' +
          '<div class="proto-fc-node">上级读 snapshot · 填加权分 · 核定加减分</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node proto-fc-node--decision">上级=分管？（同人合并）</div>' +
          '<div class="proto-fc-branch">' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">是</span>' +
          '<div class="proto-fc-node">一次提交写两列分<br>mergedReview=true</div></div>' +
          '<div class="proto-fc-branch-col"><span class="proto-fc-label">否</span>' +
          '<div class="proto-fc-node">上级评完 → 再推分管待办<br>OA 季度/月表分管列</div></div></div>' +
          '<div class="proto-fc-arrow">↓ 双节点完成</div>' +
          '<div class="proto-fc-node">task.status=scored · 写 totalScore</div></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-group"><div class="proto-fc-group-title">HR · 计划明细 / 薪酬结算</div>' +
          '<div class="proto-fc-node">进度统计刷新（已提交/已评/逾期）</div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node">奖金引擎按 planType+level 匹配规则重算<br><span class="proto-fc-desc">单元=同计划·同范围包·同职级 · 排名奖扣</span></div>' +
          '<div class="proto-fc-arrow">↓</div>' +
          '<div class="proto-fc-node proto-fc-node--end">HR 导出结算 · 员工仅只读回看自填内容</div>' +
          '</div></div>' +
          '<p class="proto-sec">数据隔离</p>' +
          '<ul><li>员工不可见：上级分、评语、奖金排名、综合总分公式结果</li>' +
          '<li>上级不可见：奖金排名与奖扣金额</li>' +
          '<li>HR 可见全量：任务状态、评分、试算结算</li></ul>',
      },
    ],
  },

  'hr-plan-detail': {
    title: 'HR · 计划明细',
    notes: [
      {
        n: 1,
        attach: '.hr-stat-row',
        title: '统计卡片 · 口径',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>参与人数</dt><dd>已发放范围包 memberIds 去重计数</dd>' +
          '<dt>已提交</dt><dd>status ≥ submitted 的人数</dd>' +
          '<dt>填写中</dt><dd>未提交且未逾期</dd>' +
          '<dt>已逾期</dt><dd>过 employeeDeadline 且未提交</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>实时聚合 task 表；催办/导出基于当前筛选结果。</p>',
      },
      {
        n: 2,
        attach: '#hr-detail-scopes',
        title: '范围包 · 补发',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">查看各包状态 → 未发点「发放」→ 已发锁定 → 漏人「+新增范围」补发</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>列表读 scopePack[]：名称、人数、模板名、issued|draft</li>' +
          '<li>补发新建 pack，仅可选<strong>未占用</strong>人员</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>已发放包：人选+模板不可改，只能催办/解锁/退回单人</li>' +
          '<li>一包一模板，HR 手动绑定（非人群×职级自动矩阵）</li></ul>',
      },
      {
        n: 3,
        attach: '#hr-plan-bonus-preview',
        title: '奖金实时结算 · 试算',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">评分完成事件 → 引擎重算 → 本区预览排名/奖扣 → 薪酬页看全量</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>输入：planId + planType + tasks(职级,得分,评分状态)</li>' +
          '<li>按 scopePackId+level 分组 → 匹配该职级启用规则 → 降序排名 → 套加奖/扣减档</li>' +
          '<li>输出：rank, bonusAdjust, bonusNote；未就绪写 pending 原因</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>纳入须：已提交 + 上级完 + 分管完 + 有 totalScore</li>' +
          '<li>同人合并：上级完即视为分管完（韩梅样例）</li>' +
          '<li>❌ 员工/上级不可见；✅ HR/薪酬可见</li></ul>',
      },
      {
        n: 4,
        attach: '.hr-filter-bar',
        title: '员工列表 · 筛选',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>filter：org / level / status / keyword → 前端过滤 task 行；默认「全部」防误筛空。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>主要组织取花名册 primaryOrg；与范围包组织范围可不同（以 pack 归属为准）。</p>',
      },
      {
        n: 5,
        attach: '.q-table-wrap',
        title: '员工任务表 · 字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>姓名/工号</dt><dd>花名册</dd>' +
          '<dt>组织/岗位/职级</dt><dd>主数据；职级参与奖金分组</dd>' +
          '<dt>人群</dt><dd>展示字段，不参与模板自动匹配</dd>' +
          '<dt>所属范围包</dt><dd>scopePack.name</dd>' +
          '<dt>匹配模板</dt><dd>scopePack.templateName</dd>' +
          '<dt>任务状态</dt><dd>filling/submitted/scoring/scored/overdue/returned</dd>' +
          '<dt>提交时间</dt><dd>submittedAt</dd>' +
          '<dt>操作</dt><dd>催办 / 解锁 / 查看快照</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>一行 = 计划×员工 唯一任务；补发新包会为新人生成新行。</p>',
      },
    ],
  },

  'hr-bonus-rules-list': {
    title: 'HR · 奖金规则列表',
    notes: [
      {
        n: 1,
        attach: '.q-toolbar',
        title: '规则库 · 生命周期',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">维护规则 → 启用 → 新建计划时绑定 → 计划运行期引擎引用 → 停用后不可新绑</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>bonusRule 表：level, tiers[], minGroupSize, type, status</li>' +
          '<li>usedByPlans = 引用计数，防误删</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>规则与计划 N:1；改规则不 retro 已结束计划（版本快照为二期）。</p>' +
          '<p><strong>按职级配置</strong>：每条规则绑定一个 level；计划按 planType+职级自动匹配，不绑单条 bonusRuleId。</p>' +
          '<p><strong>同职级启用唯一</strong>：适用类型重叠时同 level 仅 1 条 enabled；冲突阻止保存。</p>',
      },
      {
        n: 2,
        attach: '.q-table-wrap',
        title: '规则表 · 字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>规则名称</dt><dd>HR 识别</dd>' +
          '<dt>适用职级</dt><dd>总监/经理/主管/职员；一条规则一个职级</dd>' +
          '<dt>适用类型</dt><dd>month/quarter/both，过滤计划结算匹配</dd>' +
          '<dt>排名单元</dt><dd>同计划·同范围包·同职级；同分并列</dd>' +
          '<dt>奖扣摘要</dt><dd>bonusTiers + penaltyTiers 格式化预览</dd>' +
          '<dt>最低人数</dt><dd>&lt;N 人不排名（默认3）</dd>' +
          '<dt>状态</dt><dd>enabled | disabled；<strong>同 level+类型重叠仅 1 条 enabled</strong></dd>' +
          '<dt>引用计划</dt><dd>被绑计划数</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>并列规则：两人同分同名次，下一名次跳过（1,1,3…）。</p>',
      },
    ],
  },

  'hr-bonus-rule-edit': {
    title: 'HR · 编辑奖金规则',
    notes: [
      {
        n: 1,
        attach: '#bonus-edit-body',
        title: '档位结构 · 计算',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>配加奖档（第1/2/3名…）+ 扣减档（末1/末2/末N…）→ 刷新预览 → 保存。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>bonusTiers: { rank, mode: fixed|percent, amount }</li>' +
          '<li>penaltyTiers: { rankFromEnd, mode, amount }</li>' +
          '<li>预览调用 calculateGroupBonus(sample, rule)</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<dl class="proto-kv">' +
          '<dt>固定元</dt><dd>奖扣 = amount</dd>' +
          '<dt>得分比例%</dt><dd>奖扣 = totalScore × amount%</dd>' +
          '<dt>个人调整</dt><dd>Σ加奖 − Σ扣减（可叠加多档）</dd></dl>',
      },
      {
        n: 2,
        attach: '.hr-footer-actions',
        title: '试算 · 保存',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>改档位 → 点「刷新预览」看样例排名变化 → 确认后保存。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>样例数据 PREVIEW_SAMPLE 含并列分；保存写规则库，不直接影响在跑计划直至 rebind。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>最低成团人数 minGroupSize：单元内有效人数不足时不产生排名与奖扣。</p>' +
          '<p>保存时校验 <code>validateUniqueEnabledLevel</code>：同职级+类型重叠已有启用规则则 alert 拦截。</p>',
      },
    ],
  },

  'hr-bonus-settlement': {
    title: 'HR · 绩效奖金结算',
    notes: [
      {
        n: 1,
        attach: '.q-toolbar',
        title: '薪酬视图 · 权限',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">选计划 → 看实时结算全表 → 导出薪酬（二期对接 payroll）</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>读 plan + planType + 各职级 bonusRule + PLAN_SETTLEMENT_ROWS（正式=task 聚合）</li>' +
          '<li>导出 CSV/Excel 含 rank, bonusAdjust, employeeNo</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<dl class="proto-kv">' +
          '<dt>可见</dt><dd>HR 绩效管理、HR 薪酬</dd>' +
          '<dt>不可见</dt><dd>员工、直接上级、分管领导</dd></dl>',
      },
      {
        n: 2,
        attach: '#hr-settlement-body',
        title: '结算引擎 · 准入',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">评分事件 → isSettled 判断 → 入组排名 → 套档 → 写 settleStatus=done|pending</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ol><li>分组键：planId + scopePackId + level</li>' +
          '<li>组内按 totalScore DESC 排序 assignRanks（并列）</li>' +
          '<li>命中 bonusTiers/penaltyTiers → bonusAdjust</li>' +
          '<li>未就绪：bonusNote = settlementBlockReason</li></ol>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>阻塞原因：未提交 / 待上级 / 待分管 / 待出总分</li>' +
          '<li>mergedReview：上级完=分管完，标签「合并评/自动粘贴」</li>' +
          '<li>MVP 只展示奖扣调整额，基础奖金对接薪酬为二期</li></ul>',
      },
      {
        n: 3,
        attach: '#hr-settlement-body',
        title: '结算表 · 字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>姓名/范围包/职级</dt><dd>分组维度+展示</dd>' +
          '<dt>总得分</dt><dd>排名依据；null 时不参与</dd>' +
          '<dt>上级/分管评分</dt><dd>节点完成态；影响 isSettled</dd>' +
          '<dt>排名</dt><dd>组内名次；并列标注</dd>' +
          '<dt>奖扣调整</dt><dd>+/- 金额；绿/红着色</dd>' +
          '<dt>说明</dt><dd>命中档位文案或 pending 原因</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>顶栏统计：已结算 / 待上级 / 待分管 人数，随评分进度实时变。</p>',
      },
    ],
  },
};
