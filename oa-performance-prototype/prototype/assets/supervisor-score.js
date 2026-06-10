/**
 * 上级评分 · 共享逻辑（v1.0.0）
 * 刻度：加权分 0 ~ 权重；R1/R2/R3 校验；离开弹窗存草稿
 */
(function () {
  'use strict';

  var ADJUST_LIMITS = { plus: 5, minus: 5, plusTotal: 10, minusTotal: 10 };

  /** 月度表 · 区块上级分上限（核心85 + 常规15 + 行为15 = 100） */
  var BLOCK_LIMITS = { V: 85, X: 15, B: 15, WORK: 100 };

  var REVIEW_LIST = [
    { id: 'r-wf-202605', employee: '王芳', dept: '信息部', role: '产品专员', period: '2026年5月', type: 'month', status: 'pending', submittedAt: '2026-05-28 16:20' },
    { id: 'r-lm-202605', employee: '李明', dept: '信息部', role: '开发工程师', period: '2026年5月', type: 'month', status: 'scoring', submittedAt: '2026-05-27 18:05' },
    { id: 'r-zs-2026q2', employee: '赵强', dept: '信息部', role: '测试工程师', period: '2026 Q2', type: 'quarter', status: 'pending', submittedAt: '2026-06-01 10:00' },
  ];

  var SUBMISSIONS = {
    'r-wf-202605': {
      header: { employee: '王芳', dept: '信息部', role: '产品专员', period: '2026年5月', submittedAt: '2026-05-28 16:20' },
      coreKrs: [
        {
          id: 'v1', block: 'V', weight: 25,
          o: '推动公司绩效管理系统 V1.0 需求评审与方案落地，确保 HR、信息部、各业务部门对考核模板、批次计划、双端填表与上级评分链路形成一致认知。',
          smart: 'Specific：完成绩效模块 PRD v1.0 并组织评审；Measurable：PRD 覆盖月度/季度两类模板、≥45 条功能点；Achievable：依托现有 OA 与小程序框架；Relevant：对齐人才开发部 2026 信息化目标；Time-bound：5 月 31 日前完成评审闭环。',
          standardTiers: [
            { label: '业绩达成率 ≥ 100%', score: 25 },
            { label: '100% > 业绩达成率 ≥ 90%', score: 20 },
            { label: '90% > 业绩达成率 ≥ 80%', score: 15 },
            { label: '80% > 业绩达成率 ≥ 70%', score: 10 },
            { label: '业绩达成率 < 70%', score: 0 },
          ],
          m: '已完成 PRD v1.0（共 52 页），5/15、5/22 组织两轮评审。第一轮收集意见 23 条，第二轮收敛至 6 条待 HR 决策项。输出《绩效模板字段对照表》与《Grill 决策记录》附录。与 HR 完成批次计划、员工双端填表、上级评分边界对齐。剩余 2 条模板匹配规则待 6 月专项确认，不影响 MVP 原型范围。',
          selfScore: 23,
        },
        {
          id: 'v2', block: 'V', weight: 22,
          o: '输出可评审的 HTML 交互原型（小程序 + OA-PC），支撑 HR 与业务方走查「员工填表—上级评分—计划管理」主链路。',
          smart: '5 月 28 日前交付 prototype 入口；员工端含 8 步月度向导；领导端含待我审核与区块上限校验演示；走查反馈 24h 内登记。',
          standardTiers: [
            { label: '业绩达成率 ≥ 100%', score: 22 },
            { label: '100% > 业绩达成率 ≥ 90%', score: 18 },
            { label: '90% > 业绩达成率 ≥ 80%', score: 13 },
            { label: '80% > 业绩达成率 ≥ 70%', score: 9 },
            { label: '业绩达成率 < 70%', score: 0 },
          ],
          m: '交付 prototype/index.html 及 20+ 页面，完成 1 次 HR 走查、2 次信息部内部评审。根据反馈迭代：逾期/过往独立页、领导评分 R1/R2 区块校验、小程序领导 Tab 列表。走查问题 12 条已关闭 10 条，2 条列入 6 月迭代（季度评分、批量评）。',
          selfScore: 21,
        },
        {
          id: 'v3', block: 'V', weight: 20,
          o: '协同人才开发部梳理考核模板与人群（全职/办事处）匹配规则，降低发计划时模板选错风险。',
          smart: '输出匹配规则草案；识别 ≥3 类职级模板差异；6 月 5 日前 HR 确认前提供演示数据方案。',
          standard: '文档含人群×职级×模板对照；暂缓项明确标注；与 FEATURE_LIST 条目可映射。',
          m: '完成《GRILL_TEMPLATE_AUDIENCE.md》初稿，梳理总监经理/主管职员月表差异。因 HR 排期，匹配规则确认暂缓，新建计划第 4 步采用演示数据并已在 PRD 标注风险与兜底（HR 手工改模板）。',
          selfScore: 18,
        },
        {
          id: 'v4', block: 'V', weight: 18,
          o: '优化 OA 个人中心「我的绩效」信息架构，清晰区分员工待办与领导待我审核，降低误操作与咨询成本。',
          smart: '双 Tab 标注角色；员工子 Tab：当前/逾期/过往；领导独立列表；与 MINIAPP 心智一致。',
          standard: '评审通过 IA 文档；原型实现双 Tab；员工端不可见上级分。',
          m: '更新 OA_PERSONAL_CENTER_PERF.md、MINIAPP_ENTRY_IA.md，原型落地 personal-perf 与 task-list 双 Tab。HR 反馈「角色一眼可辨」达成。',
          selfScore: 17,
        },
      ],
      regularKrs: [
        {
          id: 'x1', block: 'X', weight: 8,
          o: '跨部门需求响应与会议协同',
          smart: '工作日内 24h 响应；重要会议提前 1 天准备材料；月度无有效投诉。',
          standard: '响应时效；材料质量；协同满意度。',
          m: '本月参与 HR、考勤、培训跨部门会议 11 次，均提前提交材料。协助考勤组梳理绩效与请假数据关联问题 1 次。无未响应记录。',
          selfScore: 7.5,
        },
        {
          id: 'x2', block: 'X', weight: 7,
          o: '部门知识沉淀与版本文档维护',
          smart: 'Grill 决策、Handoff、spec 文档随原型同步更新；版本号可追溯。',
          standard: '文档与原型一致；Handoff 含端×模块清单。',
          m: '维护 DESIGN_SESSION、HANDOFF-v1.0.0.md，Grill 上级评分 10 条决策入库。文档与原型索引一致。',
          selfScore: 6.8,
        },
      ],
      behavior: [
        {
          id: 'b1', name: '团队建设与人才培养', weight: 4, selfScore: 3.8,
          standard: '1.根据团队现状，规划并推动人才培养计划；\n2.及时给予反馈与辅导；\n3.差异化分配任务；\n4.建立经验分享机制。',
          event: '带教实习生小林完成「绩效任务列表页」交互说明，协助其理解 Axure/HTML 原型差异；组织 1 次组内原型走查分享，整理《产品走查 checklist》供新人复用。',
        },
        {
          id: 'b2', name: '跨部门协同', weight: 4, selfScore: 4,
          standard: '1.主动建立跨部门信息共享；\n2.积极响应协同需求；\n3.尊重协同方节奏；\n4.协作问题及时复盘。',
          event: '在 HR 排期紧张情况下，主动拆分 MVP 范围（模板匹配后移、先交填表与评分原型），每周同步进度；与开发对齐 taskId 同源数据方案，减少后期返工。',
        },
        {
          id: 'b3', name: '压力应对与问题解决', weight: 4, selfScore: 3.6,
          standard: '1.面对压力情绪稳定；\n2.多路径尝试；\n3.分析问题根因；\n4.资源不足时主动协调。',
          event: '5 月中下旬需求变更频繁（逾期独立页、领导评分 Grill），通过优先级矩阵与 HR 确认「先交主链路」，避免团队无效加班；对区块上限校验等争议点用原型演示快速达成共识。',
        },
        {
          id: 'b4', name: '目标承接与责任承担', weight: 3, selfScore: 3.5,
          standard: '1.快速理解上级目标并转化；\n2.资源不足主动协调；\n3.主动跟进；\n4.对交付负责。',
          event: '承接部门绩效信息化专项，未将模板匹配暂缓归因于 HR，而是输出演示方案与风险清单，保证 5 月评审节点不受影响。',
        },
      ],
      adjust: {
        plus: [{
          desc: '临时支援「6Q 夏季招生」活动信息化支持',
          detail: '5/18-5/20 连续 3 天支援活动组，完成报名页字段核对、异常订单排查 2 起，保障活动如期上线。已获活动组书面感谢。',
          selfScore: 2, approved: 2,
        }],
        minus: [{
          desc: '考勤异常：5/12 上午 09:04 打卡定位异常',
          detail: '因地铁故障导致迟到，已按制度提交说明并附交通截图。人才部抽查记录 1 次。',
          selfScore: -1, approved: -1,
        }],
      },
      selfSummary: '5 月工作围绕「绩效信息化 MVP 可评审交付」展开，整体进展符合预期。\n\n**主要成果：**\n1. PRD v1.0 完成并通过 2 轮跨部门评审，核心争议项收敛至 6 条；\n2. 双端 HTML 原型主链路可演示，覆盖员工填表、领导评分、HR 计划管理；\n3. 与 HR 完成 Grill 对齐，明确员工保密、区块上限校验、领导轻量评分等规则。\n\n**不足与改进：**\n- 模板匹配规则仍依赖 HR 确认，6 月需推动专项评审；\n- 季度评分与批量评仅占位，需排期迭代。\n\n**下月重点：** 见下月目标区（已按模板填写 4 项 KR 权重合计 100%）。',
      nextMonthKrs: [
        {
          o: '完成季度绩效评分页（上级 + 分管）原型，含 6Q3J 只读与面谈区块',
          smart: '6/20 前可演示；同人合并规则可配置演示；分管默认 OA。',
          weight: 28, standard: '通过 HR + 上级代表走查；文档更新 HANDOFF。',
          challenge: '季度表列多，需设计 OA 宽表与小程序折叠两种布局；依赖 HR 提供 6Q3J 演示数据。',
        },
        {
          o: '推动模板匹配规则评审闭环',
          smart: '6/15 前 HR 签字确认或明确兜底策略。',
          weight: 25, standard: '输出终版规则表；新建计划第 4 步可演示真实匹配。',
          challenge: '涉及办事处与全职两类人群、多职级，需 HR 与部门负责人联合评审。',
        },
        {
          o: '员工填表提交校验与上级评分校验规则统一',
          smart: 'R1/R2 规则在 PRD 与原型一致；员工端提交前自查。',
          weight: 22, standard: '校验文案清晰；与 Excel 模板公式一致。',
          challenge: '需开发评估前后端校验分工，产品先完成规则说明书。',
        },
        {
          o: '组织 1 次全链路 UAT（员工+领导+HR 角色剧本）',
          smart: '6/25 前完成；问题 48h 内登记。',
          weight: 25, standard: '剧本覆盖月表 happy path + 退回 + 逾期解锁。',
          challenge: '需协调三类角色时间，可能分批次走查。',
        },
      ],
    },
    'r-lm-202605': {
      header: { employee: '李明', dept: '信息部', role: '开发工程师', period: '2026年5月', submittedAt: '2026-05-27 18:05' },
      coreKrs: [
        {
          id: 'v1', block: 'V', weight: 30,
          o: '完成绩效模块后端接口设计与核心 API 开发（任务、草稿、提交、上级评分）。',
          smart: '5/31 前完成 8 个核心接口；Swagger 文档齐全；与产品 taskId 方案一致。',
          standard: '接口评审通过；单测覆盖核心逻辑；联调无 P0 阻塞。',
          m: '完成 task/list、task/detail、draft/save、submit、supervisor/score 等 9 个接口。Swagger 已发布。与产品对齐区块上限服务端校验方案（待 6 月实现）。',
          selfScore: 27,
        },
        {
          id: 'v2', block: 'V', weight: 25,
          o: '绩效相关数据库表结构设计（计划、任务、评分、审计日志）。',
          smart: '5/25 前 ER 评审；支持月/季两种任务类型扩展。',
          standard: '符合公司 DB 规范；索引合理；可审计。',
          m: '输出 perf_plan、perf_task、perf_score、perf_audit 四表 ER，评审通过。补充草稿 JSON 存储与版本号字段，支持断点续填。',
          selfScore: 23,
        },
        {
          id: 'v3', block: 'V', weight: 20,
          o: '与前端（小程序/OA）联调绩效主链路 Mock 切换方案。',
          smart: '5/28 前联调通过原型演示路径；错误码统一。',
          standard: '联调记录完整；CORS/鉴权配置正确。',
          m: '当前原型仍用 localStorage，已输出《前后端联调清单》与 Postman 集合，6 月接入真实 API。完成鉴权中间件对领导评分权限校验 POC。',
          selfScore: 18,
        },
      ],
      regularKrs: [
        {
          id: 'x1', block: 'X', weight: 10,
          o: '代码评审与单元测试维护',
          smart: '月度 CR 响应 <24h；核心模块测试不下降。',
          standard: 'CR 意见闭环；测试报告归档。',
          m: '参与 CR 18 次，平均响应 6 小时。补充 perf 模块单测 12  case。',
          selfScore: 9,
        },
        {
          id: 'x2', block: 'X', weight: 5,
          o: '生产问题值班与故障复盘',
          smart: '值班 2 次；P1 30min 响应。',
          standard: '复盘文档 48h 内输出。',
          m: '值班 2 次，处理告警 3 起（均为非绩效模块）。协助复盘 1 起缓存穿透问题。',
          selfScore: 4.5,
        },
      ],
      behavior: [
        { id: 'b1', name: '团队建设与人才培养', weight: 4, selfScore: 3.8, standard: '规划培养计划；反馈辅导；经验分享。', event: '为实习生讲解 Git 分支策略与 PR 规范，整理《信息部开发 onboarding》1 篇。' },
        { id: 'b2', name: '跨部门协同', weight: 4, selfScore: 3.5, standard: '积极响应协同；尊重节奏；及时复盘。', event: '配合产品参加 HR 评审 2 次，现场评估「员工不可见上级分」的技术实现（字段级权限 + API 过滤）。' },
        { id: 'b3', name: '压力应对与问题解决', weight: 4, selfScore: 4, standard: '稳定应对；多路径尝试；根因分析。', event: '5/20 联调环境故障，4 小时内切换备用环境并完成验证，未阻塞产品走查。' },
        { id: 'b4', name: '目标承接与责任承担', weight: 3, selfScore: 3, standard: '理解转化目标；主动跟进；对交付负责。', event: '主动承担绩效 API 主 R，周报同步风险 3 项并给出缓解方案。' },
      ],
      adjust: {
        plus: [{ desc: '周末紧急修复考勤同步异常', detail: '5/25 加班 4h 修复第三方接口超时导致的数据延迟，恢复时间 02:30。', selfScore: 1.5, approved: 1.5 }],
        minus: [],
      },
      selfSummary: '本月聚焦绩效模块后端奠基：接口、表结构、权限 POC 均按时交付。原型阶段以前端 localStorage 为主，已准备好联调资产。6 月重点是接口上线与区块校验服务端落地。',
      nextMonthKrs: [
        { o: '绩效 API 接入前端原型并替换 localStorage', smart: '6/15 前主链路打通', weight: 35, standard: '提交/草稿/评分可端到端', challenge: '需前端配合改造 supervisor-score.js' },
        { o: '服务端实现 R1/R2/R3 校验', smart: '与产品规则一致', weight: 30, standard: '单元测试覆盖边界', challenge: '加减分规则需 HR 事项库数据' },
        { o: '性能测试：计划明细 5000 人筛选', smart: '6/30 前报告', weight: 35, standard: 'P95 < 500ms', challenge: '需 DBA 协助索引优化' },
      ],
    },
  };

  function maxScore(weight) { return Number(weight) || 0; }

  function blockLabel(block) {
    if (block === 'V') return '核心V';
    if (block === 'X') return '常规X';
    return '行为';
  }

  function blockClass(block) {
    if (block === 'X') return 'block-tag--x';
    if (block === 'B') return 'block-tag--b';
    return '';
  }

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var STD_TIER_LABELS = [
    '业绩达成率 ≥ 100%',
    '100% > 业绩达成率 ≥ 90%',
    '90% > 业绩达成率 ≥ 80%',
    '80% > 业绩达成率 ≥ 70%',
    '业绩达成率 < 70%',
  ];
  var STD_TIER_NUMS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

  function defaultStandardTiers(maxScore) {
    maxScore = parseFloat(maxScore) || 25;
    return STD_TIER_LABELS.map(function (label, i) {
      return { label: label, score: Math.round(maxScore * [1, 0.8, 0.6, 0.4, 0][i]) };
    });
  }

  function ensureKrStandardTiers(kr) {
    if (!kr) return;
    if (kr.standardTiers && kr.standardTiers.length) return;
    kr.standardTiers = defaultStandardTiers(kr.weight || 25);
  }

  function renderBehaviorStandardReadonly(standardText) {
    var lines = String(standardText || '').split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!lines.length) return '<span class="score-empty">—</span>';
    var rows = lines.map(function (line, i) {
      var text = line.replace(/^\d+\.\s*/, '');
      return '<li class="std-tier-row std-tier-row--behavior">' +
        '<span class="std-tier-num">' + (STD_TIER_NUMS[i] || String(i + 1)) + '</span>' +
        '<span class="std-tier-label">' + esc(text) + '</span></li>';
    }).join('');
    return '<ul class="std-tier-list std-tier-list--readonly std-tier-list--behavior">' + rows + '</ul>';
  }

  function normalizeSubmission(sub) {
    if (!sub) return;
    (sub.coreKrs || []).forEach(ensureKrStandardTiers);
    (sub.regularKrs || []).forEach(ensureKrStandardTiers);
    (sub.nextMonthKrs || []).forEach(ensureKrStandardTiers);
  }

  Object.keys(SUBMISSIONS).forEach(function (k) { normalizeSubmission(SUBMISSIONS[k]); });

  function longTextHtml(text, clampChars) {
    if (!text) return '<span class="score-empty">—</span>';
    var safe = esc(text).replace(/\n/g, '<br>');
    if (!clampChars || text.length <= clampChars) {
      return '<div class="score-longtext">' + safe + '</div>';
    }
    var uid = 'lt-' + Math.random().toString(36).slice(2, 9);
    return '<div class="score-longtext-wrap">' +
      '<div class="score-longtext score-longtext--clamp" id="' + uid + '">' + safe + '</div>' +
      '<button type="button" class="score-longtext-toggle" data-target="' + uid + '">展开全文（' + text.length + ' 字）</button></div>';
  }

  function bindLongTextToggles(root) {
    (root || document).querySelectorAll('.score-longtext-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var el = document.getElementById(btn.dataset.target);
        if (!el) return;
        var open = el.classList.toggle('score-longtext--open');
        el.classList.toggle('score-longtext--clamp', !open);
        btn.textContent = open ? '收起' : '展开全文（' + el.textContent.length + ' 字）';
      });
    });
  }

  function renderStandardTiersReadonly(kr) {
    ensureKrStandardTiers(kr);
    if (kr.standardTiers && kr.standardTiers.length) {
      return '<div class="score-readonly-field"><label>考核标准</label><ul class="std-tier-list std-tier-list--readonly">' +
        kr.standardTiers.map(function (t, i) {
          return '<li class="std-tier-row"><span class="std-tier-num">' + (['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'][i] || String(i + 1)) + '</span>' +
            '<span class="std-tier-label">' + t.label + '</span><span class="std-tier-colon">：</span>' +
            '<strong class="std-tier-score-read">' + t.score + '</strong><span class="std-tier-unit">分</span></li>';
        }).join('') + '</ul></div>';
    }
    if (kr.standard) {
      return '<div class="score-readonly-field"><label>考核标准</label>' + longTextHtml(kr.standard, 160) + '</div>';
    }
    return '';
  }

  function renderKrReadonly(kr, isBehavior) {
    if (isBehavior) {
      return '<div class="score-employee-readonly">' +
        '<div class="score-readonly-field"><label>考核标准 <span class="std-tier-hint">模板固定</span></label>' +
        renderBehaviorStandardReadonly(kr.standard) + '</div>' +
        '<div class="score-readonly-field"><label>关键事件 / 说明</label>' + longTextHtml(kr.event || kr.m, 180) + '</div></div>';
    }
    return '<div class="score-employee-readonly">' +
      '<div class="score-readonly-field"><label>关键目标 O</label>' + longTextHtml(kr.o, 120) + '</div>' +
      '<div class="score-readonly-field"><label>考核目标 SMART</label>' + longTextHtml(kr.smart, 160) + '</div>' +
      renderStandardTiersReadonly(kr) +
      '<div class="score-readonly-field"><label>关键成果 M</label>' + longTextHtml(kr.m, 200) + '</div></div>';
  }

  function renderNextMonthGoalsHtml(krs) {
    if (!krs || !krs.length) return '<p class="score-empty">员工未填写下月目标</p>';
    return krs.map(function (g, i) {
      ensureKrStandardTiers(g);
      return '<div class="goal-item">' +
        '<div class="goal-item-head">目标 ' + (i + 1) + ' · KR 权重 ' + g.weight + '%</div>' +
        '<div class="score-readonly-field"><label>O · 关键目标</label>' + longTextHtml(g.o, 0) + '</div>' +
        '<div class="score-readonly-field"><label>SMART · 考核目标</label>' + longTextHtml(g.smart, 0) + '</div>' +
        renderStandardTiersReadonly(g) +
        (g.challenge ? '<div class="score-readonly-field"><label>存在挑战 / 需求资源</label>' + longTextHtml(g.challenge, 0) + '</div>' : '') +
        '</div>';
    }).join('');
  }

  function renderBehaviorRefHtml(sub) {
    return sub.behavior.map(function (b, i) {
      return '<div class="score-ref-kr-item"><div class="score-ref-kr-title">' + b.name + ' · 权重 ' + b.weight + '% · 自评 ' + b.selfScore + ' 分</div>' +
        renderKrReadonly(Object.assign({}, b, { m: b.event }), true) + '</div>';
    }).join('');
  }

  function renderAdjustRefHtml(sub) {
    var html = '';
    if (sub.adjust.plus.length) {
      html += '<h4>加分申报</h4>' + sub.adjust.plus.map(function (r) {
        return '<div class="score-ref-kr-item"><div class="score-readonly-field"><label>事项</label>' + longTextHtml(r.desc, 0) + '</div>' +
          (r.detail ? '<div class="score-readonly-field"><label>说明</label>' + longTextHtml(r.detail, 0) + '</div>' : '') +
          '<div class="score-readonly-field"><label>自评加分</label>' + r.selfScore + ' 分</div></div>';
      }).join('');
    }
    if (sub.adjust.minus.length) {
      html += '<h4>减分申报</h4>' + sub.adjust.minus.map(function (r) {
        return '<div class="score-ref-kr-item"><div class="score-readonly-field"><label>事项</label>' + longTextHtml(r.desc, 0) + '</div>' +
          (r.detail ? '<div class="score-readonly-field"><label>说明</label>' + longTextHtml(r.detail, 0) + '</div>' : '') +
          '<div class="score-readonly-field"><label>自评减分</label>' + r.selfScore + ' 分</div></div>';
      }).join('');
    }
    if (!html) html = '<p class="score-empty">无加减分申报</p>';
    return html;
  }

  function renderMpReadonlyPanels(sub) {
    var empEl = document.getElementById('mp-employee-readonly');
    var nextEl = document.getElementById('mp-next-month-readonly');
    if (empEl) {
      empEl.innerHTML =
        '<details class="mp-readonly-fold" open><summary>自评总结</summary><div class="mp-readonly-body">' + longTextHtml(sub.selfSummary, 0) + '</div></details>' +
        '<details class="mp-readonly-fold"><summary>行为态度（4 项）</summary><div class="mp-readonly-body">' + renderBehaviorRefHtml(sub) + '</div></details>' +
        '<details class="mp-readonly-fold"><summary>加减分申报</summary><div class="mp-readonly-body">' + renderAdjustRefHtml(sub) + '</div></details>';
      bindLongTextToggles(empEl);
    }
    if (nextEl) {
      nextEl.innerHTML = '<div class="mp-readonly-tip">仅查看，无需确认或打分</div>' + renderNextMonthGoalsHtml(sub.nextMonthKrs);
      bindLongTextToggles(nextEl);
    }
  }

  function getDraftKey(taskId) { return 'oa-supervisor-draft-' + taskId; }

  function loadDraft(taskId) {
    try {
      var raw = localStorage.getItem(getDraftKey(taskId));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveDraft(taskId, data) {
    localStorage.setItem(getDraftKey(taskId), JSON.stringify(data));
  }

  function clearDraft(taskId) {
    localStorage.removeItem(getDraftKey(taskId));
  }

  function defaultSupervisorState(sub) {
    var scores = {};
    sub.coreKrs.concat(sub.regularKrs).forEach(function (kr) { scores[kr.id] = ''; });
    sub.behavior.forEach(function (b) { scores[b.id] = ''; });
    return {
      scores: scores,
      adjustPlus: sub.adjust.plus.map(function (r) { return r.approved != null ? r.approved : r.selfScore; }),
      adjustMinus: sub.adjust.minus.map(function (r) { return r.approved != null ? r.approved : r.selfScore; }),
      comment: '',
      nextMonthConfirmed: false,
      dirty: false,
    };
  }

  function getSupervisorState(taskId) {
    var sub = SUBMISSIONS[taskId];
    if (!sub) return null;
    var draft = loadDraft(taskId);
    return draft || defaultSupervisorState(sub);
  }

  function sumBlockScores(items, state, idKey) {
    var sum = 0;
    items.forEach(function (kr) {
      var id = idKey ? kr[idKey] : kr.id;
      var v = parseFloat(state.scores[id]);
      if (!isNaN(v)) sum += v;
    });
    return Math.round(sum * 10) / 10;
  }

  function calcTotals(sub, state) {
    var errors = { items: {}, coreOver: false, regularOver: false, behaviorOver: false, vxOver: false, workOver: false, adjust: {} };

    sub.coreKrs.forEach(function (kr) {
      var v = parseFloat(state.scores[kr.id]);
      if (isNaN(v)) return;
      var max = maxScore(kr.weight);
      if (v > max || v < 0) errors.items[kr.id] = true;
    });
    sub.regularKrs.forEach(function (kr) {
      var v = parseFloat(state.scores[kr.id]);
      if (isNaN(v)) return;
      var max = maxScore(kr.weight);
      if (v > max || v < 0) errors.items[kr.id] = true;
    });
    sub.behavior.forEach(function (b) {
      var v = parseFloat(state.scores[b.id]);
      if (isNaN(v)) return;
      var max = maxScore(b.weight);
      if (v > max || v < 0) errors.items[b.id] = true;
    });

    var coreSum = sumBlockScores(sub.coreKrs, state);
    var regularSum = sumBlockScores(sub.regularKrs, state);
    var behaviorSum = sumBlockScores(sub.behavior, state, 'id');
    var vxSum = Math.round((coreSum + regularSum) * 10) / 10;
    var workSum = Math.round((coreSum + regularSum + behaviorSum) * 10) / 10;

    if (coreSum > BLOCK_LIMITS.V) errors.coreOver = true;
    if (regularSum > BLOCK_LIMITS.X) errors.regularOver = true;
    if (behaviorSum > BLOCK_LIMITS.B) errors.behaviorOver = true;
    if (vxSum > BLOCK_LIMITS.V + BLOCK_LIMITS.X) errors.vxOver = true;
    if (workSum > BLOCK_LIMITS.WORK) errors.workOver = true;

    var plusSum = 0, minusSum = 0;
    state.adjustPlus.forEach(function (v, i) {
      var n = parseFloat(v);
      if (isNaN(n)) return;
      if (n > ADJUST_LIMITS.plus || n < 0) errors.adjust['p' + i] = true;
      plusSum += n;
    });
    state.adjustMinus.forEach(function (v, i) {
      var n = parseFloat(v);
      if (isNaN(n)) return;
      if (n > 0) n = -n;
      if (Math.abs(n) > ADJUST_LIMITS.minus) errors.adjust['m' + i] = true;
      minusSum += n;
    });
    if (plusSum > ADJUST_LIMITS.plusTotal) errors.adjust.plusTotal = true;
    if (Math.abs(minusSum) > ADJUST_LIMITS.minusTotal) errors.adjust.minusTotal = true;

    var hasBlockError = errors.coreOver || errors.regularOver || errors.behaviorOver || errors.vxOver || errors.workOver;

    return {
      coreSum: coreSum,
      regularSum: regularSum,
      behaviorSum: behaviorSum,
      vxSum: vxSum,
      workSum: workSum,
      plusSum: plusSum,
      minusSum: minusSum,
      finalScore: Math.round((workSum + plusSum + minusSum) * 10) / 10,
      errors: errors,
      valid: !Object.keys(errors.items).length && !hasBlockError && !Object.keys(errors.adjust).length,
    };
  }

  function blockCapHtml(label, sum, limit, overKey, errors) {
    var over = errors[overKey];
    return '<div class="score-block-cap' + (over ? ' is-error' : '') + '" data-cap="' + overKey + '">' +
      label + '：<b>' + sum + '</b> / ' + limit +
      (over ? '<span class="score-cap-warn">已超过上限 ' + limit + ' 分</span>' : '') +
      '</div>';
  }

  function renderSummaryHtml(totals) {
    var e = totals.errors;
    return blockCapHtml('核心绩效上级分', totals.coreSum, BLOCK_LIMITS.V, 'coreOver', e) +
      blockCapHtml('常规绩效上级分', totals.regularSum, BLOCK_LIMITS.X, 'regularOver', e) +
      blockCapHtml('行为态度上级分', totals.behaviorSum, BLOCK_LIMITS.B, 'behaviorOver', e) +
      '<div class="score-block-cap' + (e.vxOver ? ' is-error' : '') + '">核心+常规：<b>' + totals.vxSum + '</b> / ' + (BLOCK_LIMITS.V + BLOCK_LIMITS.X) +
      (e.vxOver ? '<span class="score-cap-warn">核心与常规合计超过 100 分</span>' : '') + '</div>' +
      '<div class="score-block-cap' + (e.workOver ? ' is-error' : '') + '">工作块合计：<b>' + totals.workSum + '</b> / ' + BLOCK_LIMITS.WORK +
      (e.workOver ? '<span class="score-cap-warn">工作块合计超过 100 分</span>' : '') + '</div>' +
      '<div class="score-summary-item">加减分：<b>' + (totals.plusSum >= 0 ? '+' : '') + totals.plusSum + ' / ' + totals.minusSum + '</b></div>' +
      '<div class="score-summary-item">核定总分：<b>' + totals.finalScore + '</b></div>';
  }

  function renderReviewList(container, listHref) {
    var el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;
    var statusMap = { pending: ['待评', 'q-tag-orange'], scoring: ['评分中', 'q-tag-blue'], done: ['已评', 'q-tag-green'] };
    el.innerHTML = REVIEW_LIST.map(function (t) {
      var st = statusMap[t.status] || ['待评', 'q-tag'];
      var scoreHref = t.type === 'month' ? 'supervisor-score-monthly.html?id=' + t.id : 'supervisor-score-quarterly.html?id=' + t.id;
      return '<tr>' +
        '<td><div class="perf-task-cell"><span class="perf-task-icon perf-task-icon--' + (t.type === 'quarter' ? 'quarter' : 'month') + '">' + (t.type === 'quarter' ? '季' : '月') + '</span>' +
        '<div><b>' + t.employee + ' · ' + t.dept + '</b><small>' + t.role + '</small></div></div></td>' +
        '<td>' + t.period + ' ' + (t.type === 'quarter' ? '季度' : '月度') + '</td>' +
        '<td>' + (t.submittedAt || '—') + '</td>' +
        '<td><span class="q-tag ' + st[1] + '">' + st[0] + '</span></td>' +
        '<td><a class="q-btn q-btn-primary" style="padding:2px 12px;font-size:12px" href="' + scoreHref + '">' + (t.status === 'done' ? '查看' : '去评分') + '</a></td></tr>';
    }).join('');
  }

  function initOaMonthlyScorePage() {
    var params = new URLSearchParams(location.search);
    var taskId = params.get('id') || 'r-wf-202605';
    var sub = SUBMISSIONS[taskId];
    if (!sub) { document.body.innerHTML = '<p style="padding:24px">任务不存在</p>'; return; }

    var state = getSupervisorState(taskId);
    var listEl = document.getElementById('score-kr-list');
    var summaryEl = document.getElementById('score-summary');
    var refTabs = document.getElementById('score-ref-tabs');
    var refPanels = document.getElementById('score-ref-panels');
    var formDirty = false;

    function markDirty() {
      formDirty = true;
      state.dirty = true;
    }

    function buildKrCards() {
      var sections = [
        { key: 'V', title: '核心绩效 V%', cap: BLOCK_LIMITS.V, items: sub.coreKrs.map(function (k) { return Object.assign({}, k, { block: 'V' }); }) },
        { key: 'X', title: '常规绩效 X%', cap: BLOCK_LIMITS.X, items: sub.regularKrs.map(function (k) { return Object.assign({}, k, { block: 'X' }); }) },
        { key: 'B', title: '行为态度 15%', cap: BLOCK_LIMITS.B, items: sub.behavior.map(function (b) { return { id: b.id, block: 'B', o: b.name, weight: b.weight, m: b.event, selfScore: b.selfScore, standard: b.standard, event: b.event }; }) },
      ];
      listEl.innerHTML = sections.map(function (sec) {
        var isBehavior = sec.key === 'B';
        var cards = sec.items.map(function (kr) {
          var titleShort = (kr.o || kr.name || '').length > 28 ? (kr.o || kr.name).slice(0, 28) + '…' : (kr.o || kr.name);
          return '<div class="score-kr-card" data-id="' + kr.id + '" data-block="' + sec.key + '">' +
            '<button type="button" class="score-kr-head">' +
            '<span class="block-tag ' + blockClass(kr.block) + '">' + blockLabel(kr.block) + '</span>' +
            '<span class="title">' + titleShort + ' · 权重' + kr.weight + '% · 自评' + kr.selfScore + '</span>' +
            '<span class="chevron">▼</span></button>' +
            '<div class="score-kr-body">' +
            renderKrReadonly(kr, isBehavior) +
            '<div class="score-score-row-title">上级评分</div>' +
            '<div class="score-row">' +
            '<div><label>员工自评</label><div class="readonly">' + kr.selfScore + ' 分</div></div>' +
            '<div><label>上级分 ★</label><input type="number" step="0.1" min="0" data-score-id="' + kr.id + '" data-block="' + sec.key + '" data-max="' + kr.weight + '" value="' + (state.scores[kr.id] || '') + '" placeholder="0~' + kr.weight + '" />' +
            '<div class="max-hint">单项上限 ' + kr.weight + ' 分</div></div>' +
            '<div><label>综合分预览</label><div class="readonly composite-' + kr.id + '">—</div></div>' +
            '</div></div></div>';
        }).join('');
        return '<div class="score-block-group" data-block-group="' + sec.key + '">' +
          '<div class="score-block-head">' + sec.title + ' <span class="score-block-limit">区块上限 ' + sec.cap + ' 分</span></div>' +
          '<div class="score-block-cap-line" data-block-cap-line="' + sec.key + '"></div>' +
          cards + '</div>';
      }).join('');

      var firstCard = listEl.querySelector('.score-kr-card');
      if (firstCard) firstCard.classList.add('is-open');

      listEl.querySelectorAll('.score-kr-head').forEach(function (btn) {
        btn.addEventListener('click', function () {
          btn.closest('.score-kr-card').classList.toggle('is-open');
        });
      });
      listEl.querySelectorAll('input[data-score-id]').forEach(function (inp) {
        inp.addEventListener('input', function () { markDirty(); refresh(); });
      });
      bindLongTextToggles(listEl);
    }

    function updateBlockCapLines(totals) {
      var e = totals.errors;
      var map = { V: { sum: totals.coreSum, limit: BLOCK_LIMITS.V, over: e.coreOver }, X: { sum: totals.regularSum, limit: BLOCK_LIMITS.X, over: e.regularOver }, B: { sum: totals.behaviorSum, limit: BLOCK_LIMITS.B, over: e.behaviorOver } };
      Object.keys(map).forEach(function (key) {
        var line = listEl.querySelector('[data-block-cap-line="' + key + '"]');
        if (!line) return;
        var m = map[key];
        line.className = 'score-block-cap-line' + (m.over ? ' is-error' : '');
        line.innerHTML = '本区块上级分合计：<b>' + m.sum + '</b> / ' + m.limit +
          (m.over ? ' <span class="score-cap-warn">已超过上限 ' + m.limit + ' 分</span>' : '');
      });
      listEl.querySelectorAll('.score-block-group').forEach(function (g) {
        var key = g.dataset.blockGroup;
        var over = key === 'V' ? e.coreOver : key === 'X' ? e.regularOver : e.behaviorOver;
        g.classList.toggle('is-error', !!over);
      });
    }

    function refresh() {
      listEl.querySelectorAll('input[data-score-id]').forEach(function (inp) {
        state.scores[inp.dataset.scoreId] = inp.value;
      });
      var totals = calcTotals(sub, state);
      listEl.querySelectorAll('input[data-score-id]').forEach(function (inp) {
        var id = inp.dataset.scoreId;
        var v = parseFloat(inp.value);
        var err = totals.errors.items[id];
        inp.classList.toggle('is-error', !!err);
        inp.closest('.score-kr-card').classList.toggle('is-error', !!err);
        var comp = inp.closest('.score-kr-body').querySelector('.composite-' + id);
        if (comp && !isNaN(v)) {
          var self = 0;
          sub.behavior.forEach(function (b) { if (b.id === id) self = parseFloat(b.selfScore) || 0; });
          sub.coreKrs.concat(sub.regularKrs).forEach(function (k) { if (k.id === id) self = parseFloat(k.selfScore) || 0; });
          comp.textContent = (self * 0.2 + v * 0.8).toFixed(1);
        }
      });
      updateBlockCapLines(totals);
      var hasBlockErr = totals.errors.coreOver || totals.errors.regularOver || totals.errors.behaviorOver || totals.errors.vxOver || totals.errors.workOver;
      summaryEl.classList.toggle('is-error', hasBlockErr);
      summaryEl.innerHTML = renderSummaryHtml(totals);
      document.getElementById('btn-submit').disabled = !totals.valid;
    }

    buildKrCards();

    var adjPlusEl = document.getElementById('adjust-plus-body');
    var adjMinusEl = document.getElementById('adjust-minus-body');
    adjPlusEl.innerHTML = sub.adjust.plus.length ? sub.adjust.plus.map(function (r, i) {
      return '<tr><td><div class="score-adjust-desc">' + longTextHtml(r.desc, 80) + (r.detail ? '<div class="score-adjust-detail">' + longTextHtml(r.detail, 120) + '</div>' : '') + '</div></td><td>' + r.selfScore + '</td><td><input type="number" step="0.5" data-adj="plus" data-idx="' + i + '" value="' + state.adjustPlus[i] + '" /></td></tr>';
    }).join('') : '<tr><td colspan="3" class="score-empty">无加分申报</td></tr>';
    adjMinusEl.innerHTML = sub.adjust.minus.length ? sub.adjust.minus.map(function (r, i) {
      return '<tr><td><div class="score-adjust-desc">' + longTextHtml(r.desc, 80) + (r.detail ? '<div class="score-adjust-detail">' + longTextHtml(r.detail, 120) + '</div>' : '') + '</div></td><td>' + r.selfScore + '</td><td><input type="number" step="0.5" data-adj="minus" data-idx="' + i + '" value="' + state.adjustMinus[i] + '" /></td></tr>';
    }).join('') : '<tr><td colspan="3" class="score-empty">无减分申报</td></tr>';
    bindLongTextToggles(document.querySelector('.q-card-panel'));
    document.querySelectorAll('[data-adj]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var idx = parseInt(inp.dataset.idx, 10);
        if (inp.dataset.adj === 'plus') state.adjustPlus[idx] = inp.value;
        else state.adjustMinus[idx] = inp.value;
        markDirty();
        refresh();
      });
    });

    document.getElementById('score-comment').value = state.comment || '';
    document.getElementById('score-comment').addEventListener('input', function (e) {
      state.comment = e.target.value;
      markDirty();
    });

    var goalsEl = document.getElementById('next-month-goals');
    goalsEl.innerHTML = renderNextMonthGoalsHtml(sub.nextMonthKrs);
    bindLongTextToggles(goalsEl);

    refTabs.innerHTML =
      '<button type="button" class="is-active" data-ref="summary">自评总结</button>' +
      '<button type="button" data-ref="behavior">行为态度</button>' +
      '<button type="button" data-ref="adjust">加减分</button>' +
      '<button type="button" data-ref="next">下月目标</button>';
    refPanels.innerHTML =
      '<div class="score-ref-panel is-active" data-ref="summary"><div class="score-readonly-field"><label>自评总结</label>' + longTextHtml(sub.selfSummary, 0) + '</div></div>' +
      '<div class="score-ref-panel" data-ref="behavior">' + renderBehaviorRefHtml(sub) + '</div>' +
      '<div class="score-ref-panel" data-ref="adjust">' + renderAdjustRefHtml(sub) + '</div>' +
      '<div class="score-ref-panel" data-ref="next">' + renderNextMonthGoalsHtml(sub.nextMonthKrs) + '</div>';
    bindLongTextToggles(refPanels);
    refTabs.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        refTabs.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
        refPanels.querySelectorAll('.score-ref-panel').forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        refPanels.querySelector('[data-ref="' + btn.dataset.ref + '"]').classList.add('is-active');
      });
    });

    document.getElementById('score-header-info').innerHTML =
      '<h2>' + sub.header.employee + ' · ' + sub.header.period + ' 月度绩效考核</h2>' +
      '<div class="score-header-meta">' +
      '<span>部门：' + sub.header.dept + '</span><span>岗位：' + sub.header.role + '</span>' +
      '<span>员工提交：' + sub.header.submittedAt + '</span></div>';

    refresh();

    document.getElementById('btn-back').addEventListener('click', function (e) {
      if (!formDirty) return;
      e.preventDefault();
      document.getElementById('leave-modal').classList.add('is-open');
    });

    document.getElementById('leave-save').addEventListener('click', function () {
      saveDraft(taskId, state);
      REVIEW_LIST.forEach(function (t) { if (t.id === taskId) t.status = 'scoring'; });
      location.href = 'supervisor-review-list.html';
    });
    document.getElementById('leave-discard').addEventListener('click', function () {
      location.href = 'supervisor-review-list.html';
    });
    document.getElementById('leave-cancel').addEventListener('click', function () {
      document.getElementById('leave-modal').classList.remove('is-open');
    });

    document.getElementById('btn-return-all').addEventListener('click', function () {
      var reason = prompt('请输入退回原因（退回至员工填表）：');
      if (reason) { alert('已退回至员工（原型演示）'); location.href = 'supervisor-review-list.html'; }
    });

    document.getElementById('btn-submit').addEventListener('click', function () {
      var totals = calcTotals(sub, state);
      if (!totals.valid) { alert('请修正标红项后再提交'); return; }
      clearDraft(taskId);
      REVIEW_LIST.forEach(function (t) { if (t.id === taskId) t.status = 'done'; });
      alert('评分已提交，返回列表');
      location.href = 'supervisor-review-list.html';
    });
  }

  function initMpMonthlyScorePage() {
    var params = new URLSearchParams(location.search);
    var taskId = params.get('id') || 'r-wf-202605';
    var sub = SUBMISSIONS[taskId];
    if (!sub) {
      document.body.innerHTML = '<p style="padding:24px">任务不存在</p>';
      return;
    }
    var state = getSupervisorState(taskId);
    var listEl = document.getElementById('mp-score-list');
    if (!listEl) return;

    var titleEl = document.querySelector('.mp-subnav .title');
    if (titleEl) titleEl.textContent = sub.header.employee + ' · ' + sub.header.period + ' · 评分';

    var sections = [
      { key: 'V', title: '核心 V · 上限' + BLOCK_LIMITS.V, items: sub.coreKrs.map(function (k) { return Object.assign({}, k, { block: 'V' }); }) },
      { key: 'X', title: '常规 X · 上限' + BLOCK_LIMITS.X, items: sub.regularKrs.map(function (k) { return Object.assign({}, k, { block: 'X' }); }) },
      { key: 'B', title: '行为 · 上限' + BLOCK_LIMITS.B, items: sub.behavior.map(function (b) { return { id: b.id, o: b.name, weight: b.weight, selfScore: b.selfScore, block: 'B', standard: b.standard, event: b.event, m: b.event }; }) },
    ];

    listEl.innerHTML = sections.map(function (sec) {
      var isBehavior = sec.key === 'B';
      return '<div class="mp-score-section" data-mp-block="' + sec.key + '">' +
        '<div class="mp-score-section-title">' + sec.title + '</div>' +
        '<div class="mp-score-section-cap" data-mp-cap="' + sec.key + '"></div>' +
        sec.items.map(function (kr) {
          var titleShort = kr.o.length > 16 ? kr.o.slice(0, 16) + '…' : kr.o;
          return '<div class="mp-score-kr" data-id="' + kr.id + '">' +
            '<button type="button" class="mp-score-kr-head">' +
            '<span>' + blockLabel(kr.block || 'V') + ' · ' + titleShort + '</span>' +
            '<span style="margin-left:auto;color:#999">≤' + kr.weight + '</span></button>' +
            '<div class="mp-score-kr-body">' +
            renderKrReadonly(kr, isBehavior) +
            '<div class="mp-score-input-label">员工自评 ' + kr.selfScore + ' · 上级分</div>' +
            '<input class="mp-score-input" type="number" step="0.1" data-score-id="' + kr.id + '" data-max="' + kr.weight + '" value="' + (state.scores[kr.id] || '') + '" placeholder="0~' + kr.weight + '" />' +
            '</div></div>';
        }).join('') + '</div>';
    }).join('');

    bindLongTextToggles(listEl);
    renderMpReadonlyPanels(sub);

    listEl.querySelectorAll('.mp-score-kr-head').forEach(function (btn) {
      btn.addEventListener('click', function () { btn.closest('.mp-score-kr').classList.toggle('is-open'); });
    });

    function refresh() {
      listEl.querySelectorAll('.mp-score-input').forEach(function (inp) {
        state.scores[inp.dataset.scoreId] = inp.value;
      });
      var totals = calcTotals(sub, state);
      var e = totals.errors;
      var capMap = { V: { sum: totals.coreSum, limit: BLOCK_LIMITS.V, over: e.coreOver }, X: { sum: totals.regularSum, limit: BLOCK_LIMITS.X, over: e.regularOver }, B: { sum: totals.behaviorSum, limit: BLOCK_LIMITS.B, over: e.behaviorOver } };
      Object.keys(capMap).forEach(function (key) {
        var capEl = listEl.querySelector('[data-mp-cap="' + key + '"]');
        if (!capEl) return;
        var m = capMap[key];
        capEl.className = 'mp-score-section-cap' + (m.over ? ' is-error' : '');
        capEl.textContent = '区块合计 ' + m.sum + '/' + m.limit + (m.over ? ' · 已超过上限！' : '');
      });
      var bar = document.getElementById('mp-score-bar');
      var hasErr = e.coreOver || e.regularOver || e.behaviorOver || e.workOver;
      bar.classList.toggle('is-error', hasErr);
      bar.innerHTML = '核心 <b>' + totals.coreSum + '</b>/' + BLOCK_LIMITS.V +
        ' · 常规 <b>' + totals.regularSum + '</b>/' + BLOCK_LIMITS.X +
        ' · 合计 <b>' + totals.workSum + '</b>/100' +
        (e.coreOver ? ' <span style="color:#ff4d4f">核心超限</span>' : '') +
        (e.regularOver ? ' <span style="color:#ff4d4f">常规超限</span>' : '');
      listEl.querySelectorAll('.mp-score-input').forEach(function (inp) {
        var err = totals.errors.items[inp.dataset.scoreId];
        inp.classList.toggle('is-error', !!err);
        inp.closest('.mp-score-kr').classList.toggle('is-error', !!err);
      });
    }
    listEl.querySelectorAll('.mp-score-input').forEach(function (inp) {
      inp.addEventListener('input', refresh);
    });
    refresh();

    document.getElementById('mp-btn-submit').addEventListener('click', function () {
      var totals = calcTotals(sub, state);
      if (!totals.valid) { alert('请修正标红项（含区块上限）'); return; }
      alert('已提交，返回列表');
      location.href = 'task-list.html?tab=leader';
    });
  }

  window.SupervisorScore = {
    REVIEW_LIST: REVIEW_LIST,
    SUBMISSIONS: SUBMISSIONS,
    renderReviewList: renderReviewList,
    initOaMonthlyScorePage: initOaMonthlyScorePage,
    initMpMonthlyScorePage: initMpMonthlyScorePage,
    calcTotals: calcTotals,
    ADJUST_LIMITS: ADJUST_LIMITS,
    BLOCK_LIMITS: BLOCK_LIMITS,
  };
})();
