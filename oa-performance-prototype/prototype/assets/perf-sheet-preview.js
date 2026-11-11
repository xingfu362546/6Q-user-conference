/**
 * 整表预览后再导出图片。版式与填写页「预览全部」同一套横表。
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function tiers(weight) {
    var full = Number(weight) || 0;
    return [
      { label: '业绩达成率 ≥ 100%', score: full },
      { label: '100% > 业绩达成率 ≥ 90%', score: Math.round(full * 0.8 * 10) / 10 },
      { label: '90% > 业绩达成率 ≥ 80%', score: Math.round(full * 0.6 * 10) / 10 },
      { label: '80% > 业绩达成率 ≥ 70%', score: Math.round(full * 0.4 * 10) / 10 },
      { label: '业绩达成率 < 70%', score: 0 }
    ];
  }

  function target(id, block, weight, smart, result, selfScore) {
    return {
      id: id, block: block, weight: weight, smart: smart,
      standardTiers: tiers(weight), m: result, selfScore: selfScore
    };
  }

  function sheetModel(emp, quarter) {
    var name = emp.name || '员工';
    if (quarter) {
      return {
        quarter: true,
        core: [{ id: 'pv', o: name + ' · 本季核心目标', targets: [
          target('pv1', 'V', 30, '季度内完成主链路评审并交付可走查结果', '已完成评审，意见已收敛', 27),
          target('pv2', 'V', 28, '季度末交付双端原型，覆盖填写、评分和确认', '原型主链路可演示', 25)
        ] }],
        regular: [{ id: 'px', o: '常规协同', targets: [
          target('px1', 'X', 18, '跨部门问题按约定时限响应', '本季无超时未响应', 16),
          target('px2', 'X', 14, '过程记录随版本可追溯', '决策和交付记录已归档', 12)
        ] }],
        behavior: [
          { id: 'b1', name: '团队建设与人才培养', weight: 4, standard: '辅导、分享、反馈', event: '完成本季一次内部分享', selfScore: 3.5 },
          { id: 'b2', name: '跨部门协同', weight: 3, standard: '按时响应，结论可追溯', event: '协同事项均有记录', selfScore: 2.8 },
          { id: 'b3', name: '目标承接', weight: 3, standard: '对交付结果负责', event: '风险已在周报说明', selfScore: 2.6 }
        ],
        incentive: [
          { objective: '方法可复制', result: '把评审清单沉淀成模板', typeName: '未选', self: '—' }
        ],
        penalty: '无',
        interview: { highlight: '主链路按期可演示', improve: '确认环节说明还可以更短', plan: '下季补齐空区块示例', support: '需要业务一起看一版样表' },
        summary: '本季核心和常规目标已填写，专项激励按申报展示，不计入核定总分。',
        next: [{ id: 'pn', o: '下季核心目标', targets: [
          target('pn1', 'next', 40, '下季继续沿用同一张表完成填写和确认', '待填写', ''),
          target('pn2', 'next', 30, '和上级对标的目标单独标出', '待填写', ''),
          target('pn3', 'next', 30, '空着的区块也保留在表上', '待填写', '')
        ] }],
        scores: { pv1: 26, pv2: 24, px1: 15, px2: 12, b1: 3.5, b2: 2.5, b3: 2.5 },
        division: { pv1: 26, pv2: 24, px1: 15, px2: 11, b1: 3, b2: 2.5, b3: 2.5 }
      };
    }
    return {
      quarter: false,
      core: [{ id: 'mv', o: name + ' · 本月核心目标', targets: [
        target('mv1', 'V', 25, '本月完成评审并交付可走查结果', '已完成评审，意见已收敛', 23),
        target('mv2', 'V', 20, '本月交付原型主链路', '入口和主流程可演示', 18)
      ] }],
      regular: [{ id: 'mx', o: '常规事项', targets: [
        target('mx1', 'X', 8, '工作日内响应协同', '本月无超时', 7.5),
        target('mx2', 'X', 7, '过程记录随版本更新', '记录已归档', 6)
      ] }],
      behavior: [
        { id: 'b1', name: '团队建设与人才培养', weight: 4, standard: '辅导、分享、反馈', event: '完成本月一次内部分享', selfScore: 3.6 },
        { id: 'b2', name: '跨部门协同', weight: 4, standard: '按时响应，结论可追溯', event: '协同事项均有记录', selfScore: 3.5 },
        { id: 'b3', name: '压力应对', weight: 4, standard: '问题有结论', event: '阻塞项当天有反馈', selfScore: 3.2 },
        { id: 'b4', name: '目标承接', weight: 3, standard: '对交付结果负责', event: '风险已说明', selfScore: 2.8 }
      ],
      plus: [{ type: '加分', desc: '本月额外交付一次走查', score: '1.0' }],
      minus: [{ type: '减分', desc: '无', score: '0' }],
      summary: '本月核心、常规、行为态度和加减分都在这张表上。',
      next: [{ id: 'mn', o: '下月核心目标', targets: [
        target('mn1', 'next', 45, '下月继续用同一张表完成填写', '待填写', ''),
        target('mn2', 'next', 55, '空着的区块也保留在表上', '待填写', '')
      ] }],
      scores: { mv1: 22, mv2: 18, mx1: 7, mx2: 6, b1: 3.5, b2: 3.5, b3: 3, b4: 2.5 }
    };
  }

  function work(title, list, period, state) {
    var body = window.PerfReviewSheet
      ? PerfReviewSheet.renderWorkTable(list, { periodType: period, editable: false, state: state })
      : '<p>横表未加载</p>';
    return '<section class="perf-preview-block"><h3>' + esc(title) + '</h3>' + body + '</section>';
  }

  function bodyHtml(emp, quarter, planName) {
    var model = sheetModel(emp, quarter);
    var state = { scores: model.scores, divisionScores: model.division || {} };
    var head = '<p class="perf-preview-note">' + esc(emp.name) + ' · 工号 ' + esc(emp.no) + ' · ' + esc(emp.org || '') + ' · ' + esc(emp.role || '') + ' · ' + esc(planName || '') + '</p>';
    if (quarter) {
      var incentive = (model.incentive || []).map(function (row, i) {
        return '<tr><td>' + (i + 1) + '</td><td>' + esc(row.objective) + '</td><td>' + esc(row.result) + '</td><td>' + esc(row.typeName) + '</td><td>' + esc(row.self) + '</td></tr>';
      }).join('') || '<tr><td colspan="5">未申报</td></tr>';
      return head +
        work('核心绩效 V%', model.core, 'quarter', state) +
        work('常规绩效 X%', model.regular, 'quarter', state) +
        '<section class="perf-preview-block"><h3>6Q3J 人才评价</h3><p>客观分只读核对。未导入的分项保持空白，仍出现在整表里。</p></section>' +
        '<section class="perf-preview-block"><h3>专项激励</h3><table class="q-table perf-preview-table"><tr><th>#</th><th>关键目标</th><th>关键成果</th><th>超越类型</th><th>自评</th></tr>' + incentive + '</table></section>' +
        '<section class="perf-preview-block"><h3>减分</h3><p>' + esc(model.penalty) + '</p></section>' +
        '<section class="perf-preview-block"><h3>绩效面谈</h3><p><b>亮点</b> ' + esc(model.interview.highlight) + '</p><p><b>待提升</b> ' + esc(model.interview.improve) + '</p><p><b>改进计划</b> ' + esc(model.interview.plan) + '</p><p><b>所需支持</b> ' + esc(model.interview.support) + '</p></section>' +
        '<section class="perf-preview-block"><h3>自评总结</h3><p>' + esc(model.summary) + '</p></section>' +
        work('下季核心目标', model.next, 'next', state);
    }
    var behavior = window.PerfReviewSheet
      ? PerfReviewSheet.renderBehaviorTable(model.behavior, { periodType: 'month', editable: false, state: state })
      : '';
    var plus = (model.plus || []).concat(model.minus || []).map(function (row) {
      return '<tr><td>' + esc(row.type) + '</td><td>' + esc(row.desc) + '</td><td>' + esc(row.score) + '</td></tr>';
    }).join('');
    return head +
      work('核心绩效 V%', model.core, 'month', state) +
      work('常规绩效 X%', model.regular, 'month', state) +
      '<section class="perf-preview-block"><h3>行为态度</h3>' + behavior + '</section>' +
      '<section class="perf-preview-block"><h3>加减分</h3><table class="q-table perf-preview-table"><tr><th>类型</th><th>说明</th><th>分数</th></tr>' + plus + '</table></section>' +
      '<section class="perf-preview-block"><h3>自评总结</h3><p>' + esc(model.summary) + '</p></section>' +
      work('下月核心目标', model.next, 'next', state);
  }

  function close() {
    var old = document.getElementById('perf-preview-mask');
    if (old) old.remove();
  }

  function open(opts) {
    opts = opts || {};
    close();
    var mask = document.createElement('div');
    mask.id = 'perf-preview-mask';
    mask.className = 'perf-preview-mask';
    var panel = document.createElement('div');
    panel.className = 'perf-preview-canvas';
    panel.innerHTML =
      '<div class="perf-preview-bar"><h2>' + esc(opts.title || '整表预览') + '</h2>' +
      '<span style="display:flex;gap:8px">' +
      '<button type="button" class="q-btn q-btn-primary" id="preview-export">导出图片</button>' +
      '<button type="button" class="q-btn" id="preview-close">关闭</button></span></div>' +
      '<p id="preview-export-msg" class="hr-modal-error"></p>' +
      '<div class="perf-preview-scale" id="perf-preview-export-root">' + (opts.html || '') + '</div>';
    mask.appendChild(panel);
    document.body.appendChild(mask);
    panel.querySelector('#preview-close').addEventListener('click', close);
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
    panel.querySelector('#preview-export').addEventListener('click', function () {
      var msg = panel.querySelector('#preview-export-msg');
      var source = panel.querySelector('#perf-preview-export-root');
      if (!window.PerfExportImage) {
        if (msg) msg.textContent = '导出组件未加载';
        return;
      }
      var holder = document.createElement('div');
      holder.style.cssText = 'position:fixed;left:0;top:0;z-index:-1;background:#fff';
      var clone = source.cloneNode(true);
      clone.style.zoom = '1';
      clone.style.width = '1400px';
      clone.style.background = '#fff';
      clone.style.padding = '24px';
      holder.appendChild(clone);
      document.body.appendChild(holder);
      if (msg) msg.textContent = '正在导出整张表…';
      PerfExportImage.exportNode(clone, opts.filename || '绩效表.png').then(function () {
        if (msg) msg.textContent = '已导出整张表';
        holder.remove();
      }).catch(function (err) {
        if (msg) msg.textContent = '导出失败：' + (err && err.message ? err.message : err);
        holder.remove();
      });
    });
  }

  function openEmployee(emp, plan) {
    var quarter = !!(plan && plan.quarter);
    open({
      title: (emp.name || '员工') + ' · 整表预览',
      filename: window.PerfExportImage ? PerfExportImage.filename(emp.name, plan && plan.id) : ((emp.name || '员工') + '.png'),
      html: bodyHtml(emp, quarter, plan && plan.name)
    });
  }

  function openHtml(title, html, filename) {
    open({ title: title, html: html, filename: filename });
  }

  window.PerfSheetPreview = { open: open, openEmployee: openEmployee, openHtml: openHtml, close: close };
})();
