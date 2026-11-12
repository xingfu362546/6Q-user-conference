/**
 * v1.1.1 原型注释 · 业务流程 + 数据流转 + 规则说明
 * 呈现：红点序号，点击展开右侧抽屉
 */
window.PROTO_NOTE_PAGES = {

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
          '<div class="proto-flow">当前待办 → 提交 → 月/季分轨流转 → 已确认归档｜过截止未交 → 逾期</div>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.4</span>月度 5 步（无待分管）；季度 6 步（同人合并 5 步）。终态 <code>confirmed</code>（兼容旧 completed）。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>三段对应任务表不同 <strong>status + deadline</strong> 组合过滤</li>' +
          '<li>分段为独立 HTML 页，切换即路由跳转（非 SPA Tab）</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li><strong>当前</strong>：deadline ≥ now 且 status ∈ {未开始, 填写中}</li>' +
          '<li><strong>逾期</strong>：deadline &lt; now 且未 Step6 提交</li>' +
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
          '<p>进度 step 由草稿 stepIndex 计算。「复制往期」带入历史 KR 结构后跳转填表（<code>employee-past-copy.js</code>）。</p>' +
          '<p>v1.1：已提交任务显示流程态标签；<strong>待确认</strong>可进 score-confirm；填表入口在 OA，小程序 v1 仅进度+确认。</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.4</span>列表仅 phase 单标签「待确认」；步骤条在任务名列；确认 badge 在 score-confirm 页</p>',
      },
      {
        n: 4,
        attach: '#mp-task-list',
        title: 'v1.1 · 五态与确认入口',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">填写中 → 待上级评 → 待分管评 → 待确认 → 已完成</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>phase 字段驱动卡片标签与操作按钮</li>' +
          '<li>pending_confirm → 跳转 score-confirm.html</li>' +
          '<li>填写中 → task-progress.html 看进度（不开放填表）</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>员工+直接上级<strong>双方确认</strong>后才归档；确认前可见上级分与分管分。</p>',
      },
    ],
  },

  'mp-task-progress': {
    title: '小程序 · 任务进度',
    notes: [
      {
        n: 1,
        attach: '#progress-steps',
        title: '月/季分轨进度条 · v1.4',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">月：待填写→填写中→待上级评→待确认→已确认</div>' +
          '<div class="proto-flow">季：…→待分管评*→待确认→已确认（*mergedReview 跳过）</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>读任务 phase + type → <code>PerfWorkflow.renderPhaseSteps(phase, { task })</code> 高亮当前节点。</p>' +
          '<p class="proto-ver proto-ver--old"><span class="proto-ver-tag">v1.1</span>统一五态，月度含「待分管评」</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.4</span>月/季分轨；新增 <code>not_started</code> 待填写</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>小程序 v1 员工<strong>不看填表</strong>，仅在此页跟踪流程；填表走 OA。</p>',
      },
      {
        n: 2,
        attach: '#progress-detail',
        title: '进度详情 · 字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>考核期</dt><dd>计划名 + 周期</dd>' +
          '<dt>当前状态</dt><dd>phase 中文标签</dd>' +
          '<dt>确认截止</dt><dd>plan.confirmDeadline（待确认态展示）</dd>' +
          '<dt>分数</dt><dd>待确认/已完成可见自评、上级、分管、总分</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>填写中仅展示截止与提示，不展示评分。</p>',
      },
      {
        n: 3,
        attach: '#progress-actions',
        title: '操作按钮',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>pending_confirm →「去确认」跳转 score-confirm；其他态仅返回列表。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>无「继续填写」入口（与 OA 员工待办区分）。</p>',
      },
    ],
  },

  'mp-score-confirm': {
    title: '小程序 · 确认评分',
    notes: [
      {
        n: 1,
        attach: '#confirm-body',
        title: '双方确认 · 分数可见',
        body:
          '<p class="proto-ver proto-ver--old"><span class="proto-ver-tag">v1.1</span>四行分数摘要</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.3</span>与 OA 同构：模块表 + 折算汇总</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>URL <code>?role=leader</code> 为上级确认视角；确认前不计入归档与奖金结算。</p>',
      },
      {
        n: 2,
        attach: '.mp-subnav',
        title: '确认截止 · 流程条',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>confirmDeadline 来自计划；超时标记在 HR 结果明细「确认超时」筛选项。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>顶部五步条与 OA 确认页一致，当前高亮「待确认」。</p>',
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
          '<li>解锁需 HR 权限；逾期期间 Step6 提交仍受截止校验</li></ul>',
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
        title: '6 步向导 · 贴表 Phase（v1.1 精简）',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">【A】本月考评（步1–4）→ 【B】下月目标（步5）→ 确认提交（步6）</div>' +
          '<ol><li>核心 V（含 M+自评）· 2) 常规 X（含 M+自评）· 3) 行为+加减分 · 4) 自评总结</li>' +
          '<li>下月核心目标 · 6) 预览确认提交</li></ol>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>v1.1 取消独立「自评打分」「加减分」步；填完关键事件/成果后<strong>同页自评</strong></li>' +
          '<li>v1.1.1 自评输入最多 2 位小数，整数展示 <code>x.00</code>（<code>perf-score-format.js</code>）</li>' +
          '<li>与 OA 同源 <code>wizard.js</code></li></ul>',
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
        title: '考核标准 · 同页自评（方案 A）',
        body:
          '<p class="proto-sec">规则说明</p>' +
          '<p>O / SMART 不变；<strong>考核标准</strong>为 ①–⑤ 业绩达成率分档，满分档 = KR 权重（如 25%→25 分）。</p>' +
          '<p>核心/常规步：每条 KR 填完关键成果 M 后，<strong>同页</strong>录入自评分（对照分档只读）；行为步底部含加减分申报 + 行为态度自评。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>存 <code>standardTiers[]</code>；改权重自动按比例刷新各档分，可手动微调。自评分经 <code>PerfScoreFormat</code> 规范化后写入 draft。</p>',
      },
    ],
  },

  'mp-quarterly-wizard': {
    title: '小程序 · 季度填表',
    notes: [
      {
        n: 1,
        attach: '#stepper',
        title: '季度 7 步 · 贴表 Phase（v1.1 精简）',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">【A】本季考评（步1–5）→ 【B】下季目标（步6）→ 确认提交（步7）</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>步骤条与 OA 统一 <code>renderPhaseStepper()</code>（块状 phase）</li>' +
          '<li>步1–2、步6 考核标准同月度分档 <code>standardTiers</code></li>' +
          '<li>季度表字段更多，快照体积大于月度</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>v1.1 取消独立加减分/自评步；KR 在步1–2 同页填 M+自评。6Q3J、面谈等内容员工填自评部分；上级/分管分列在 OA 评分页填写。</p>',
      },
      {
        n: 3,
        attach: '#wizard-content',
        title: 'Step3 · 6Q3J 只读 · v1.2',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>读 <code>PerfSixQ3J.get(planId, empNo)</code>；HR 在季度计划明细 CSV 导入后本页自动刷新。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>1368 / 文化经句 / AI 分项独立；未导入 → <strong>待导入</strong></li>' +
          '<li>6Q3J 总分 = 已导入求和 + 标注缺项；未齐仍可提交季表</li>' +
          '<li>详见 <code>docs/GRILL_6Q3J.md</code></li></ul>',
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
      {
        n: 4,
        attach: '#mp-score-list',
        title: '评分配 · 两位小数 · v1.1.1',
        body:
          '<p class="proto-sec">规则说明</p>' +
          '<p>上级打分输入框最多 2 位小数；失焦/提交时经 <code>PerfScoreFormat.format()</code> 规范化，整数展示如 <code>85.00</code>。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>与 OA 评分页同源 <code>perf-score-format.js</code>；合计分同步格式化展示。</p>',
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
          '<div class="proto-flow">当前待办 ↔ 逾期 ↔ 已提交（三个 HTML，segment 高亮当前）</div>' +
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
          '<dt>进度</dt><dd><code>phase</code> 标签 + 行内 <code>renderPhaseSteps</code>（月5/季6步）</dd>' +
          '<dt>操作</dt><dd>按 phase：开始/继续填写 · 查看进度 · 确认评分</dd></dl>' +
          '<p class="proto-ver proto-ver--old"><span class="proto-ver-tag">v1.1</span>静态 HTML 三行；「未开始」未区分 not_started</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.4</span>状态列仅 <code>phaseLabel</code> 单标签；确认细分 badge 只在确认页</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p><strong>当前待办</strong>：未 confirmed 的任务（含已提交待评、待确认）。<strong>已提交 Tab</strong>：仅 confirmed 归档。数据源 <code>EmployeeTasks.TASK_DATA</code>。</p>',
      },
      {
        n: 4,
        attach: '#emp-current-tbody',
        title: '研发 · phase → 操作映射',
        body:
          '<p class="proto-sec">状态机（后端）</p>' +
          '<table class="proto-table" style="font-size:12px;width:100%">' +
          '<tr><th>phase</th><th>员工操作</th><th>原型 href</th></tr>' +
          '<tr><td>not_started</td><td>开始填写</td><td>monthly/quarterly-wizard</td></tr>' +
          '<tr><td>filling</td><td>继续填写 + 快速带入(月)</td><td>wizard + employee-past-copy</td></tr>' +
          '<tr><td>pending_supervisor</td><td>查看进度（<strong>不可看分</strong>）</td><td>employee-task-progress.html</td></tr>' +
          '<tr><td>pending_division</td><td>查看进度（季·不可看分）</td><td>employee-task-progress.html</td></tr>' +
          '<tr><td>pending_confirm</td><td>确认评分</td><td>score-confirm.html?role=employee</td></tr>' +
          '</table>' +
          '<p class="proto-sec">API 字段</p>' +
          '<dl class="proto-kv">' +
          '<dt>phase</dt><dd>枚举见 perf-workflow.js PHASE_DEFS</dd>' +
          '<dt>type</dt><dd>month | quarter → 决定步骤链长度（5 vs 6）</dd>' +
          '<dt>mergedReview</dt><dd>true 时季度跳过 pending_division 步骤</dd>' +
          '<dt>stepIndex / totalSteps</dt><dd>filling 副标题「3/6 步」</dd>' +
          '<dt>employeeConfirmed 等</dt><dd>仅确认页使用；<strong>列表不展示 badge</strong></dd></dl>' +
          '<p class="proto-sec">Mock 行 ID</p>' +
          '<ul style="font-size:12px;margin:4px 0 0 1.2em">' +
          '<li>m202605 · pending_confirm</li><li>m202604 · filling</li><li>m202606 · not_started</li>' +
          '<li>m202503-wait · pending_supervisor</li><li>q2026q2 · pending_division</li></ul>',
      },
      {
        n: 5,
        attach: '.perf-tip',
        title: '研发 · 三分段筛选逻辑',
        body:
          '<p class="proto-sec">分段 API 设计</p>' +
          '<pre style="font-size:11px;background:#f5f5f5;padding:8px;border-radius:4px">current: phase != confirmed\noverdue: deadline&lt;now AND phase IN (not_started,filling)\npast: phase == confirmed</pre>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>员工提交后（pending_supervisor 起）<strong>留 current</strong>，不进 past</li>' +
          '<li>逾期不含 pending_confirm；确认超时走 HR 侧</li>' +
          '<li>实现：<code>EmployeeTasks.belongsInOverdue(task)</code></li></ul>' +
          '<p>详见 docs/DEV-GUIDE-v1.4.0.md §4</p>',
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
          '<div class="proto-flow">过填表截止 + 未提交（not_started / filling 含半稿）→ 逾期 Tab</div>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.4</span>已提交向导的任务（pending_*）<strong>不进逾期</strong>；确认超时不在此 Tab</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>与小程序同源 <code>overdueState</code>：locked | unlocked。判定 <code>EmployeeTasks.belongsInOverdue(task)</code>。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>对照演示：4月「不可填写」vs 3月「继续填写」；锁定行无 wizard / 复制往期入口。解锁后仍留逾期 Tab 直至提交。</p>',
      },
      {
        n: 2,
        attach: '.q-table-wrap',
        title: '逾期表 · 字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>考核任务</dt><dd>计划+周期；副标题含 step 进度</dd>' +
          '<dt>原截止</dt><dd>plan.employeeDeadline</dd>' +
          '<dt>状态</dt><dd>待 HR 解锁 / 已解锁·可填 + 逾期天数</dd>' +
          '<dt>操作</dt><dd>locked→不可填写；unlocked→继续填写+快速带入</dd></dl>' +
          '<p class="proto-sec">后端 Task</p>' +
          '<p>字段 <code>overdueUnlocked: boolean</code>；HR 解锁接口写 audit log（二期）。</p>',
      },
    ],
  },

  'oa-personal-past': {
    title: 'OA · 已提交（归档）',
    notes: [
      {
        n: 1,
        attach: '.perf-tip',
        title: '归档语义 · v1.4',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>Tab 名暂叫「已提交」，实际仅 <code>phase=confirmed</code> 任务。员工<strong>不可见</strong>上级分、核定分、奖金。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>API <code>segment=past</code>；返回 submitSnapshot 只读。与 current 互斥。角色=employee 时 strip 评分字段。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>Grill Q1：向导提交后不进此 Tab，直到全部确认完成。综合分数对员工不可见。</p>',
      },
      {
        n: 2,
        attach: '#emp-past-tbody',
        title: '归档表 · 字段',
        body:
          '<dl class="proto-kv">' +
          '<dt>状态</dt><dd>固定「已确认」phaseLabel</dd>' +
          '<dt>提交时间</dt><dd>submittedAt</dd>' +
          '<dt>操作</dt><dd>personal-perf-past-view.html?id= 只看自填 KR</dd></dl>' +
          '<p>渲染：<code>EmployeeTasks.renderPastTable</code></p>',
      },
    ],
  },

  'oa-employee-progress': {
    title: 'OA · 员工任务进度',
    notes: [
      {
        n: 1,
        attach: '#emp-progress-steps',
        title: '只读进度 · 不可看分',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>pending_supervisor / pending_division 阶段员工跟踪用；<strong>不展示</strong>上级/分管分数。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>query <code>?id=</code> → EmployeeTasks.findTask → renderPhaseSteps。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>Grill Q2 已定 A。分数仅在 pending_confirm 进入 score-confirm 后可见。pending_confirm 时本页仅「去确认」按钮。</p>',
      },
    ],
  },

  'oa-score-confirm': {
    title: 'OA · 确认评分',
    notes: [
      {
        n: 1,
        attach: '#confirm-body',
        title: '员工/上级确认页',
        ver: 'v1.5.2',
        body:
          '<div class="proto-logic"><h4><span class="proto-ver-tag proto-ver-tag--old">v1.4.0</span>过往逻辑</h4>' +
          '<p>确认页只对照自评和上级（季度再加分管）的横表，底部是折算汇总。分管改核定总分后，已经点过确认的一方要重新确认。页面正文字号沿用绩效页约 13px。季度没有专项激励档次。</p></div>' +
          '<div class="proto-logic proto-logic--now"><h4><span class="proto-ver-tag proto-ver-tag--new">v1.5.2</span>现在的逻辑</h4>' +
          '<p>确认页固定五行：计算总分、上级核定、分管核定（季度）、HR 最终总分、采用分。上级核定是上级提交时单独写入的快照，没有就显示「—」，不用计算总分代替。采用分优先取 HR 最终总分，季度其次取分管核定，最后取计算总分；月度没有分管核定。修改前分数就是当时的采用分。分数与表头 14px，合计区数值保留 18px。有 HR 最终总分时显示原因和修改前分数，确认状态不变。季度另显示专项得分、建议档次和建议金额。</p></div>' +
          '<p class="proto-sec">UI 要设计的状态</p>' +
          '<ol><li>尚未有 HR 改分：只显示系统汇总和核定分，采用分等于核定分</li>' +
          '<li>HR 已改分：多一行最终总分，并写出修改前分数、原因和修改人</li>' +
          '<li>季度专项未评定：档次为「暂不认定（未评定）」</li>' +
          '<li>当前角色已确认：隐藏确认按钮，保留分数对照</li></ol>' +
          '<table class="proto-field-table"><tr><th>名称</th><th>控件</th><th>必填</th><th>说明</th></tr>' +
          '<tr><td>系统汇总</td><td>只读</td><td>是</td><td>工作成果 + 6Q3J + 减分，样例为 89.2</td></tr>' +
          '<tr><td>上级 / 分管核定</td><td>只读</td><td>是</td><td>分管改过则带「已调整」</td></tr>' +
          '<tr><td>HR 最终总分</td><td>只读</td><td>否</td><td>仅在 HR 保存过修改时出现</td></tr>' +
          '<tr><td>当前采用分</td><td>只读</td><td>是</td><td>有 HR 最终总分时取该值</td></tr>' +
          '<tr><td>确认评分结果</td><td>按钮</td><td>否</td><td>当前角色未确认时才出现</td></tr></table>',
      },
      {
        n: 2,
        attach: '.q-oa-breadcrumb',
        title: '确认截止 · 分轨步骤条',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>confirmDeadline 来自计划配置；<code>PerfWorkflow.renderPhaseSteps(\'pending_confirm\', { task })</code> + <code>renderConfirmBadges</code>。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>月度：员工+上级确认即终态；分管无确认按钮。季度：三方均 ✓ 才 confirmed。有核定分显示「已调整」。</p>' +
          '<p class="proto-sec">后端 Task</p>' +
          '<ul><li>POST confirm：body role=employee|supervisor|division</li>' +
          '<li>全部 isFullyConfirmed → UPDATE phase=confirmed</li>' +
          '<li>改总分后 applyTotalAdjustClearConfirm 清零已确认方</li></ul>',
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
        ver: 'v1.5.0',
        body:
          '<div class="proto-logic"><h4><span class="proto-ver-tag proto-ver-tag--old">v1.4.0</span>过往逻辑</h4>' +
          '<p>月度仍是 6 步：核心 V、常规 X、行为态度与加减分、自评总结、下月目标、确认提交。考核目标可以有多条，标准用分档。草稿键与小程序分开。没有整表预览，也没有和提交并排的手动保存。</p></div>' +
          '<div class="proto-logic proto-logic--now"><h4><span class="proto-ver-tag proto-ver-tag--new">v1.5.0</span>现在的逻辑</h4>' +
          '<p>月度区块不改，不增加专项激励。新增「保存」和「预览全部」。预览用同一套横表画出核心 V、常规 X、行为态度、加减分、自评总结和下月目标，只读。输入后把草稿标脏，连续 2 分钟没有新的内容变化就保存一次，并显示最新保存时间。滚动和翻页不算新操作。</p></div>' +
          '<p class="proto-sec">UI 要设计的状态</p>' +
          '<ol><li>尚未保存：时间行显示「尚未保存」</li><li>保存成功：显示到分钟的最新保存时间</li><li>保存失败：时间不更新，并提示未保存成功</li><li>预览打开：大画布，不含专项激励</li></ol>',
      },
      {
        n: 2,
        attach: '#wizard-content',
        title: '考核标准 · 分档格式（方案 A）',
        body:
          '<p class="proto-sec">规则说明</p>' +
          '<p>与小程序同源：考核标准为 5 档达成率阶梯，各档分值随 KR 权重联动；KR 填 M 后同页自评。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>字段 <code>standardTiers</code> 替代原 textarea；OA storageKey 独立不影响小程序草稿。</p>' +
          '<p class="proto-sec">v1.1.1 · 两位小数</p>' +
          '<p>自评输入经 <code>PerfScoreFormat.bindAll()</code>：最多 2 位小数，整数展示 <code>x.00</code>。</p>',
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
        ver: 'v1.5.0',
        body:
          '<div class="proto-logic"><h4><span class="proto-ver-tag proto-ver-tag--old">v1.4.0</span>过往逻辑</h4>' +
          '<p>季度向导是 7 步：核心 V、常规 X、6Q3J、绩效面谈、自评总结、下季目标、确认提交。工作 KR 权重合计 90%。下季目标按 2 到 3 条理解。没有专项激励，也没有独立减分步。提交前没有整表预览，停在同一步时不会按 2 分钟自动保存。</p></div>' +
          '<div class="proto-logic proto-logic--now"><h4><span class="proto-ver-tag proto-ver-tag--new">v1.5.0</span>现在的逻辑</h4>' +
          '<p>步骤改为 9 步。在 6Q3J 之后增加专项激励和减分。专项激励替代原来的加分项，最多 3 条，选填；选定超越类型后自评分自动带出且不可改。减分必须小于等于 0，按自评 20%、上级 40%、分管 40% 计入核定总分，未填的一方按 0。专项得分不进核定总分。下季核心目标改为 3 到 5 条，每条要选是否跟上级对标。最后一步和中途都可以点「预览全部」，画布展示核心 V、常规 X 以及后面各区块，只读。内容变脏后连续 2 分钟无新改动自动保存，并显示最新保存时间。</p></div>' +
          '<p class="proto-sec">UI 要设计的状态</p>' +
          '<ol><li>专项 0 条：可以提交</li><li>已有 3 条：添加按钮禁用</li><li>选了类型但目标和成果为空：提交被拒绝</li><li>减分为正数：当前步提示，提交被拒绝</li><li>预览打开：整页遮罩上的大画布，点返回或遮罩关闭</li></ol>' +
          '<table class="proto-field-table"><tr><th>名称</th><th>控件</th><th>必填</th><th>说明</th></tr>' +
          '<tr><td>关键目标 / 关键成果</td><td>输入</td><td>选了类型后必填</td><td>专项申报，最多 3 条</td></tr>' +
          '<tr><td>超越类型</td><td>下拉</td><td>否</td><td>20 个员工可选类型，自评分等于该档分值</td></tr>' +
          '<tr><td>附件</td><td>输入</td><td>否</td><td>不拦截提交</td></tr>' +
          '<tr><td>减分事件 / 自评分</td><td>输入</td><td>有减分时说明必填</td><td>分数 ≤ 0</td></tr>' +
          '<tr><td>是否跟上级对标</td><td>下拉</td><td>是</td><td>下季每条为「是」或「否」</td></tr>' +
          '<tr><td>保存 / 预览全部</td><td>按钮</td><td>否</td><td>保存不提交；预览不能改字</td></tr></table>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.5.2</span>本页只负责申报。专项的上级分和分管分在「领导 · 季度评分」填，人才开发部最终得分和档次在「HR · 待办详情」的专项核定区填。三方按 30/30/40 加权，权重见 <code>perf-quarter-score.js</code> 的 <code>INCENTIVE_WEIGHTS</code>。</p>',
      },
      {
        n: 2,
        attach: '#wizard-content',
        title: 'Step3 · 6Q3J · v1.2',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>与小程序同源 <code>perf-sixq3j.js</code>；planId=2026-Q2 · empNo 来自表头 mock。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>只读；分项「待导入」或分值；不与奖金结算联动（本版演示）。</p>',
      },
      {
        n: 3,
        attach: '#wizard-content',
        title: '提交后流转',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<ol><li>status → submitted</li><li>推 directSupervisor 待办</li><li>推 divisionLeader 待办（非同人时）</li><li>同人合并仅一条待办</li></ol>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>6Q3J 未齐仍可提交；分后补导入并重算（正式环境）。</p>',
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
          '<div class="proto-flow">下属 Step6 提交 → 生成上级待办 → 本列表 → 进评分页 → 提交 → 回列表</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>filter：supervisorId=me AND status=submitted|scoring</li>' +
          '<li>提交后 status→scored，列表移除或标已评</li>' +
          '<li>若需分管且非同人：并行另一条 division 待办（不在本列表）</li></ul>' +
          '<p class="proto-ver proto-ver--old"><span class="proto-ver-tag">v1.1</span>跨部门分管走季度占位列表</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.3</span>兼<strong>分管领导</strong>时：本列表展示<strong>本部门全员</strong>进度；上级评完后可<strong>改总分</strong></p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.4</span>月度上级提交后员工<strong>立即待确认</strong>；分管在待确认态仍可改总分（全 ✓ 后禁用）</p>' +
          '<p><strong>同人合并</strong>：上级=分管时仅「去评分」一次，自动同步分管节点，无需改总分。</p>',
      },
      {
        n: 2,
        attach: '.q-table-wrap',
        title: '待审核表字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>自评总分</dt><dd>Σ(KR自评+行为+加减分)；点击表头排序</dd>' +
          '<dt>操作</dt><dd>去评分 / 改总分（分管·待确认亦可）/ 查看确认 / 详情</dd></dl>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.4</span>phase 标签走 <code>PerfWorkflow.phaseLabel</code>；终态「已确认」</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.3</span>默认按自评总分<strong>降序</strong>；分管视角含核定总分列</p>',
      },
    ],
  },

  'oa-division-dept-list': {
    title: '分管 · 部门绩效（已合并）',
    notes: [
      {
        n: 1,
        attach: '.perf-tip',
        title: '入口合并',
        body:
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.3+</span>原独立「部门待办」已合并至 <code>supervisor-review-list.html</code>。</p>' +
          '<p>判定为分管领导时，在<strong>领导·待我审核</strong>同一列表查看本部门全员；待分管核定行显示「改总分」。</p>',
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
          '<div class="proto-flow">KR/行为填分 → 加减分核定 → 对照员工原文 → 评语(选填) → 看下月目标 → 提交或整表退回 → 待确认</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>读 submitSnapshot；写 supervisorScores、adjustments、comment</li>' +
          '<li>提交：算 totalScore → 更新任务 → 通知 HR 统计/奖金引擎</li>' +
          '<li>退回：status→returned，员工待办重现，评分草稿清空</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>下月目标<strong>只读</strong>（v1.0 不打分、不确认）；季度 OA 版可确认/退回。</p>',
      },
      {
        n: 2,
        attach: '#score-next-month-ref',
        title: '下月目标 · 对照查看',
        body:
          '<p class="proto-ver proto-ver--old"><span class="proto-ver-tag">v1.1</span>Tab 切换自评总结 / 行为态度 / 加减分 / 下月目标</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.3</span>月度页<strong>仅展示下月目标</strong>（上方打分区已含自评/行为/加减分，不再重复 Tab）</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>只读引用 snapshot 下月目标；考核标准以 ①–⑤ 分档展示，含附加规则（若有）。</p>',
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
      {
        n: 5,
        attach: '#score-summary',
        title: '分管核定 · 不在本页',
        body:
          '<p class="proto-ver proto-ver--old"><span class="proto-ver-tag">v1.1</span>本页底部有<strong>分管领导逐项评分</strong>列</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.3</span>月度<strong>不出现分管评分区</strong>；上级提交后进入待确认</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.4</span>提交调用 <code>nextPhaseAfterSupervisorSubmit</code> → 月直进 pending_confirm；分管改总分用 <code>canAdjustDivisionTotal</code></p>' +
          '<p>同人合并（上级=分管）时亦不在此页填分管列。</p>',
      },
      {
        n: 6,
        attach: '#score-kr-list',
        title: '评分配 · 两位小数 · v1.1.1',
        body:
          '<p class="proto-sec">规则说明</p>' +
          '<p>上级/分管打分输入最多 2 位小数；失焦与提交时 <code>PerfScoreFormat</code> 规范化，整数如 <code>25.00</code>。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>工作块小计、加减分核定、核定总分均同步格式化；与员工自评、确认页、结果明细口径一致。</p>',
      },
    ],
  },

  'oa-supervisor-score-quarterly': {
    title: '领导 · 季度评分',
    notes: [
      {
        n: 1,
        attach: '#score-sixq3j',
        title: '6Q3J 只读 · v1.2',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>与员工 Step3 同源 <code>PerfSixQ3J.renderReadonlyPanel(planId, empNo)</code>；URL 带 plan & no。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>1368 / 文化经句 / AI 客观分；缺项<strong>待导入</strong></li>' +
          '<li>HR 计划明细导入后本页 storage 事件刷新</li>' +
          '<li>本版不与奖金排名联动</li></ul>',
      },
      {
        n: 2,
        attach: '#score-role-banner',
        title: '上级/分管分列 · v1.3',
        body:
          '<p class="proto-sec">URL 参数</p>' +
          '<ul><li><code>?id=</code> 任务 id</li>' +
          '<li><code>&role=supervisor|division</code> 控制可编辑列</li>' +
          '<li><code>&plan= &no=</code> 6Q3J 只读</li></ul>' +
          '<p class="proto-sec">权限</p>' +
          '<ul><li>待上级评：仅上级列可编辑，分管列禁用</li>' +
          '<li>待分管评：上级列只读，分管列可逐项 + 页底改总分</li>' +
          '<li>合并评：两列联动同值，一次提交</li></ul>' +
          '<p class="proto-sec">Mock</p>' +
          '<ul><li><code>r-zs-2026q2</code> 赵强 · 待上级</li>' +
          '<li><code>r-lm-2026q2</code> 李明 · 合并评</li>' +
          '<li><code>r-wf-2026q2&role=division</code> 王芳 · 待分管</li>' +
          '<li><code>r-hm-2026q2</code> 韩梅 · 待确认只读</li></ul>' +
          '<p>详见 <code>docs/GRILL_DIVISION_SCORING.md</code></p>',
      },
      {
        n: 3,
        attach: '#score-summary',
        title: '折算公式',
        body:
          '<p>综合 = 自评×20% + 上级核定×40% + 分管核定×40%。分管改总分覆盖全表后标记「已调整」。</p>',
      },
      {
        n: 4,
        attach: '#score-kr-list',
        title: '专项激励 · 三方评分',
        ver: 'v1.5.2',
        body:
          '<div class="proto-logic"><h4><span class="proto-ver-tag proto-ver-tag--old">v1.5.1</span>过往逻辑</h4>' +
          '<p>季度评分页只有核心、常规和加减分。专项激励只有员工申报，领导看不到，也没有地方打分。</p></div>' +
          '<div class="proto-logic proto-logic--now"><h4><span class="proto-ver-tag proto-ver-tag--new">v1.5.2</span>现在的逻辑</h4>' +
          '<p>在加减分下面增加「专项激励 · 评分」区块，列出员工申报的关键目标、关键成果、超越类型和自评分。上级填一列，分管填一列，取值 0 到该档分值。人才开发部最终得分在 HR 待办详情维护。单条按上级 30%、分管 30%、人才开发部 40% 加权；三方任意一方空着，这条就待评定，不参与定档。专项得分不进核定总分。</p></div>' +
          '<p class="proto-sec">UI 要设计的状态</p>' +
          '<ol><li>只有一方可编辑：另一方显示只读分或「—」</li><li>三方未填完：HR 待办详情标「待三方填完」</li><li>合并评：上级和分管同值，只填一次</li><li>超过档值：输入框标红，不能提交</li></ol>' +
          '<table class="proto-field-table"><tr><th>名称</th><th>控件</th><th>必填</th><th>说明</th></tr>' +
          '<tr><td>上级核定 / 分管核定</td><td>数字</td><td>参与定档时必填</td><td>0 到该档分值，可一位小数</td></tr>' +
          '<tr><td>人才开发部最终得分</td><td>数字（HR 页）</td><td>参与定档时必填</td><td>不逐项确认</td></tr>' +
          '<tr><td>本条得分</td><td>只读</td><td>—</td><td>三方加权后按档值封顶</td></tr></table>',
      },
    ],
  },

  /* ───────────── HR 端 ───────────── */
  'hr-evaluators': {
    title: 'HR · 评价人维护',
    notes: [
      {
        n: 1,
        attach: '.q-toolbar',
        title: '评价人按工号维护',
        ver: 'v1.5.0',
        body:
          '<div class="proto-logic"><h4><span class="proto-ver-tag proto-ver-tag--old">v1.4.0</span>过往逻辑</h4>' +
          '<p>没有独立的评价人名单。计划明细里处理人经常落成「默认上级」。批量转办只能改已经发出的待办，不能作为全员评价关系的主数据。</p></div>' +
          '<div class="proto-logic proto-logic--now"><h4><span class="proto-ver-tag proto-ver-tag--new">v1.5.0</span>现在的逻辑</h4>' +
          '<p>绩效管理下新增「评价人维护」，与计划管理并列。一名员工对应一名评价人，双方都用工号识别，评价人就是直接上级。分管领导不在这张表里。可以改单行，也可以下载当前名单后按 CSV 导入。表头必须是员工工号、评价人工号、员工姓名、评价人姓名，后两列可空。先校验全部行：员工工号或评价人工号不存在、文件里员工工号重复、评价人是员工本人、或填写的姓名和主数据不一致，整批一行都不写，并列出失败行号和工号。文件里没出现的员工保持原评价人。变更后，尚未完成上级评分的待办，当前处理人改为新评价人；已经评完的历史评分人不改。</p></div>' +
          '<p class="proto-sec">UI 要设计的状态</p>' +
          '<ol><li>没有评价人：评价人姓名显示未指定</li><li>单行保存失败：行上不改，页顶写出原因</li><li>导入失败：成功行数为 0，错误列出每一行</li><li>导入成功：只更新文件中的员工，并提示人数</li></ol>' +
          '<table class="proto-field-table"><tr><th>名称</th><th>控件</th><th>必填</th><th>说明</th></tr>' +
          '<tr><td>员工工号</td><td>只读 / 导入列</td><td>是</td><td>人员主数据中必须存在</td></tr>' +
          '<tr><td>评价人工号</td><td>输入 / 导入列</td><td>有评价人时必填</td><td>必须存在，且不能等于员工工号</td></tr>' +
          '<tr><td>员工姓名 / 评价人姓名</td><td>导入列</td><td>否</td><td>填写了就必须和工号一致</td></tr>' +
          '<tr><td>下载当前名单</td><td>按钮</td><td>否</td><td>UTF-8 CSV，可改后再导入</td></tr></table>',
      },
    ],
  },

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
        ver: 'v1.5.0',
        body:
          '<div class="proto-logic"><h4><span class="proto-ver-tag proto-ver-tag--old">v1.4.0</span>过往逻辑</h4>' +
          '<p>计划发出后，列表只能进明细和催办。名称、启动时间、员工填写截止、上级评分截止、确认截止要改，只能重做一张计划。同周期仍然只能有一张计划。</p></div>' +
          '<div class="proto-logic proto-logic--now"><h4><span class="proto-ver-tag proto-ver-tag--new">v1.5.0</span>现在的逻辑</h4>' +
          '<p>每一行增加「编辑」。可以改计划名称和四个时间，不能改考核类型、参与范围和奖金规则。名称去掉首尾空格后不能和其他计划相同，和自己原来的名称相同可以保存。四个时间必须满足启动不晚于员工填写截止、员工填写截止不晚于上级评分截止、上级评分截止不晚于确认截止。已发放的计划也可以改。未完成待办按新截止判断逾期，已完成的待办不重新打开。员工打开的仍是原来那张待办，标题用新名称。</p></div>' +
          '<p class="proto-sec">UI 要设计的状态</p>' +
          '<ol><li>名称冲突：不保存，并指出已有计划</li><li>时间顺序不合法：不保存</li><li>保存成功：列表名称立即换成新名称</li></ol>' +
          '<table class="proto-field-table"><tr><th>名称</th><th>控件</th><th>必填</th><th>说明</th></tr>' +
          '<tr><td>计划名称</td><td>输入</td><td>是</td><td>去首尾空格后全库唯一</td></tr>' +
          '<tr><td>启动时间</td><td>时间</td><td>是</td><td>四个时间的第一个</td></tr>' +
          '<tr><td>员工填写截止</td><td>时间</td><td>是</td><td>未提交待办用它判断逾期</td></tr>' +
          '<tr><td>上级评分截止</td><td>时间</td><td>是</td><td>季度分管评分沿用这个时间</td></tr>' +
          '<tr><td>确认截止</td><td>时间</td><td>是</td><td>员工和上级共用</td></tr></table>',
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
          '<div class="proto-fc-desc">启动时间 · 员工截止 · <strong>确认截止</strong> · 预览各职级奖金规则匹配</div></div>' +
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
          '<div class="proto-fc-node">进入填表向导<br><span class="proto-fc-desc">月表 6 步 / 季表 7 步 · 断点续填 draft · 同页自评</span></div>' +
          '<div class="proto-fc-arrow">↓ Step6/7 提交</div>' +
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
          '<li>名称<strong>可自定义</strong>：点击名称 inline 编辑（新建/补发编辑器内同样可改）</li>' +
          '<li>补发新建 pack，仅可选<strong>未占用</strong>人员</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>已发放包：人选+模板不可改，只能催办/解锁/退回单人；包名仍可改</li>' +
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
        attach: '.perf-filter-panel',
        title: '员工列表 · 筛选',
        ver: 'v1.5.1',
        body:
          '<div class="proto-logic"><h4><span class="proto-ver-tag proto-ver-tag--old">v1.4.0</span>过往逻辑</h4>' +
          '<p>筛选只有全部、未开始、填写中、已提交、已逾期。处理人没有姓名时显示「默认上级」。退回只有「退回至员工」一条，不能选节点。已全部确认后不能再退，也不能在双方确认后改最终总分。</p></div>' +
          '<div class="proto-logic proto-logic--now"><h4><span class="proto-ver-tag proto-ver-tag--new">v1.5.1</span>现在的逻辑</h4>' +
          '<p>筛选增加待上级评价、已完成、已失效，原有筛选项保留。处理人按当前节点显示真实姓名。待办还在初始节点（未开始、填写中、已逾期）时不出现「退至」。已经离开初始节点后，按钮文案是「退至」，用节点步骤选择已经走过、且不是当前所在的节点，不能手输。月度是员工填写、上级评分；季度再加分管评分。原因和节点都必填。已全部确认的待办也可以退至，确认状态作废，已填内容和分数仍留在输入框。</p></div>' +
          '<p class="proto-sec">UI 要设计的状态</p>' +
          '<ol><li>筛选「待上级评价」：每一行状态都是待上级评价</li><li>初始节点：操作里没有「退至」</li><li>退至未到达的节点：拒绝，状态不变</li><li>原因为空：不退至</li><li>退至成功：处理人变为该节点的责任人，分数格仍显示原值</li></ol>',
      },
      {
        n: 5,
        attach: '.q-table-wrap',
        title: '员工任务表 · 字段',
        ver: 'v1.5.2',
        body:
          '<div class="proto-logic"><h4><span class="proto-ver-tag proto-ver-tag--old">v1.4.0</span>过往逻辑</h4>' +
          '<p>一行是计划乘员工。操作是催办、解锁、查看详情、退回至员工和批量转办。失效待办没有单独状态。范围包模板和本期名单绑在一起，不能只把一个人从本期拿掉还留着填写记录。</p></div>' +
          '<div class="proto-logic proto-logic--now"><h4><span class="proto-ver-tag proto-ver-tag--new">v1.5.2</span>现在的逻辑</h4>' +
          '<p>跟进评审后按下面做。操作随状态变化。还在初始节点时没有「退至」。离开初始节点后显示「退至」，只能选已经走过、且不是当前所在的节点；已到达节点退至后仍保留。未失效且未完成时显示「失效」，已完成不可失效。已失效只显示「恢复」，不能退至、不能改总分。失效必须填原因，状态用红色「已失效」。只从当前计划的参与名单和这次发放的范围包移除该员工。其他计划不变，范围包模板不改，也不要做「影响多张计划」的确认。恢复是把人加回当前计划原来那次发放的范围包，并重新发放同一张待办：不新建第二条，节点回到未开始。此人若已在本计划另一个范围包里，不能恢复。改总分仍是同一个弹窗，修改前分数是当前采用分：季度按 HR 最终总分、分管核定、计算总分取值，月度按 HR 最终总分、计算总分取值。导出先看整表再导出。整表用这张待办的真实填报和分数；没有填报就留空，不填示例分。文件名是「姓名-考核期.png」，考核期是 YYYY-MM 或 YYYY-Qn。</p></div>' +
          '<table class="proto-field-table"><tr><th>名称</th><th>控件</th><th>必填</th><th>说明</th></tr>' +
          '<tr><td>处理人</td><td>只读</td><td>是</td><td>按节点显示姓名，禁止「默认上级」</td></tr>' +
          '<tr><td>退至节点</td><td>节点步骤</td><td>已离开初始节点时必填</td><td>初始节点不出现该按钮；不能手输，也不能选当前节点</td></tr>' +
          '<tr><td>退至原因</td><td>输入</td><td>是</td><td>和节点在同一个弹窗提交</td></tr>' +
          '<tr><td>失效状态</td><td>红色标签</td><td>是</td><td>已失效用红色标出</td></tr>' +
          '<tr><td>失效原因</td><td>输入</td><td>是</td><td>只移出当前计划这次发放的范围包，其他计划不变</td></tr>' +
          '<tr><td>恢复</td><td>按钮</td><td>仅已失效</td><td>加回原范围包，并重新发放同一张待办到未开始</td></tr>' +
          '<tr><td>最终总分 / 原因</td><td>数字 + 输入</td><td>改分时都必填</td><td>同一个弹窗保存</td></tr>' +
          '<tr><td>导出图片</td><td>先预览再导出</td><td>否</td><td>整表 PNG，不是局部区块</td></tr></table>',
      },
      {
        n: 6,
        attach: '#btn-batch-transfer',
        title: '批量转办 · v1.1.1',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">勾选待办 → 批量转办 → 组织架构选接收人 → 更新处理人</div>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>转办后待办处理责任变更；员工任务数据不变。样式与新建计划组织树一致。</p>',
      },
      {
        n: 7,
        attach: '#hr-sixq3j-panel',
        title: '6Q3J 导入 · v1.2',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<div class="proto-flow">季度计划明细 → 导入 6Q3J → CSV 三列 upsert → 员工/上级只读同步</div>' +
          '<p class="proto-sec">数据流转</p>' +
          '<ul><li>localStorage <code>perf-sixq3j-{planId}</code></li>' +
          '<li>空列不更新 · 可分批导入 1368 / 文化 / AI</li>' +
          '<li>员工列表增加 6Q3J 列摘要</li></ul>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>仅 <code>?plan=2026-Q2</code> 等季度计划显示；本版不做奖金联动与上限校验。</p>',
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
          '<ul><li>阻塞原因：未提交 / 待上级 / 待分管 / 待出总分 / <strong>待双方确认</strong></li>' +
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
          '<p>顶栏统计：已结算 / 待上级 / 待分管 人数，随评分进度实时变。</p>' +
          '<p>v1.1：须 employeeConfirmed ∧ supervisorConfirmed 才纳入结算（<code>hr-bonus.js</code>）。</p>',
      },
    ],
  },

  'hr-perf-results-list': {
    title: 'HR · 人员绩效结果明细',
    notes: [
      {
        n: 1,
        attach: '.hr-hint',
        title: '页面定位 · 权限',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>全量计划×人员结果查询；点姓名进待办详情（只读）。不含奖金排名，仅总得分。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>菜单与数据范围由 <code>perf-permissions.js</code> + URL <code>?perm=hr|dept|payroll|employee</code> 控制。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>HR：全公司；部门负责人：本部门；薪酬：全量只读；员工：仅本人</li>' +
          '<li>无范围包列/筛选（v1.1 刻意省略）</li></ul>',
      },
      {
        n: 2,
        attach: '#res-filter-panel',
        title: '筛选面板',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>计划 / 部门 / 职级 / phase（含待填写）/ 确认超时 / 已结算奖金 / 关键字 → 前端过滤 MOCK 行。</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.4</span>确认态列：月=员工+上级 badge；季=+分管 badge</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>「确认超时」= 过 confirmDeadline 且未双方确认；「已结算奖金」= 奖金引擎 done。</p>',
      },
      {
        n: 3,
        attach: '.q-table-wrap',
        title: '结果表 · 字段',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<dl class="proto-kv">' +
          '<dt>状态</dt><dd>phase 中文（待填写/已确认等）</dd>' +
          '<dt>确认态</dt><dd><code>renderConfirmBadges</code>：员工✓ / 上级✓ / 分管✓（季）</dd>' +
          '<dt>退回次数/原因</dt><dd>HR 退回至员工审计字段</dd></dl>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.3</span>筛选栏「导出」→ 列清单 +「模板待确认」占位</p>' +
          '<p>姓名链至 hr-task-detail.html?from=results。</p>',
      },
    ],
  },

  'hr-task-detail': {
    title: 'HR · 待办详情',
    notes: [
      {
        n: 1,
        attach: '#task-detail-header',
        title: '详情头 · 入口',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>从计划明细或结果明细进入；展示员工基本信息、当前 phase、确认态。</p>' +
          '<p class="proto-sec">数据流转</p>' +
          '<p>query：no（工号）、plan、from=plan|results 决定面包屑与侧栏高亮。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<p>默认<strong>只读</strong>查看提交快照与评分明细；非领导打分页。</p>',
      },
      {
        n: 2,
        attach: '#task-detail-body',
        title: '评分明细 · 只读',
        body:
          '<p class="proto-sec">数据流转</p>' +
          '<p>有 taskId 时读 submitSnapshot + supervisorScores + divisionScores，按 V/X/B 分块表格展示。</p>' +
          '<p class="proto-ver proto-ver--old"><span class="proto-ver-tag">v1.1</span>仅展示分项表格 + 总分摘要</p>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.3</span>底部<strong>折算汇总</strong>：模块小计 + 加权公式 + 系统汇总→分管核定</p>' +
          '<p>加减分表增加「上级评」列；合并评时分管列=上级列。</p>',
      },
      {
        n: 3,
        attach: '#task-detail-actions',
        title: 'HR 改分 · v1.1.1',
        body:
          '<p class="proto-sec">业务流程</p>' +
          '<p>计划内入口 + HR 权限：pending_confirm 态可「修改上级分」→ 行内编辑 → 保存重算总分。</p>' +
          '<p class="proto-sec">规则说明</p>' +
          '<ul><li>from=results 或其他入口：<strong>不可改分</strong></li>' +
          '<li>改分后员工与上级<strong>不用重新确认</strong>，确认状态保持</li>' +
          '<li>不提供整表退回（退至在计划明细操作）</li></ul>' +
          '<p class="proto-ver proto-ver--new"><span class="proto-ver-tag">v1.5.2</span>季度任务在本页下方增加「专项核定 · 人才开发部」：三方分、人才开发部最终得分、按权重算出的本条得分、建议档次和建议金额；可以改档并填原因，也可以追加一条品牌价值或其它超越。专项不进核定总分。</p>',
      },
    ],
  },
};
