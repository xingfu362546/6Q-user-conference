/**
 * 绩效折算汇总 · v1.3（确认页 / HR 详情共用）
 */
(function () {
  'use strict';

  function sf() { return window.PerfScoreFormat; }
  function fmt(v) { return sf() ? sf().format(v) : v; }

  var DEMO_MODULES = [
    { key: 'V', name: '核心绩效 V%', self: 52.0, supervisor: 50.5 },
    { key: 'X', name: '常规绩效 X%', self: 28.0, supervisor: 27.0 },
    { key: 'B', name: '行为态度 15%', self: 13.5, supervisor: 13.0 },
    { key: 'ADJ+', name: '加减分 · 加分', self: 2.0, supervisor: 2.0 },
    { key: 'ADJ-', name: '加减分 · 减分', self: -1.0, supervisor: -1.0 },
  ];

  function calcSystemTotal(modules) {
    var selfSum = 0;
    var supSum = 0;
    modules.forEach(function (m) {
      selfSum += parseFloat(m.self) || 0;
      supSum += parseFloat(m.supervisor) || 0;
    });
    return {
      selfSum: Math.round(selfSum * 100) / 100,
      supSum: Math.round(supSum * 100) / 100,
      weightedSelf: Math.round(selfSum * 0.2 * 100) / 100,
      weightedSup: Math.round(supSum * 0.8 * 100) / 100,
      systemTotal: Math.round((selfSum * 0.2 + supSum * 0.8) * 100) / 100,
    };
  }

  function renderModuleTable(modules, opts) {
    opts = opts || {};
    var showDiv = opts.showDivision;
    var head = '<thead><tr><th>模块</th><th class="num">自评</th><th class="num">上级评</th>' +
      (showDiv ? '<th class="num">分管评</th>' : '') + '</tr></thead>';
    var rows = modules.map(function (m) {
      return '<tr><td>' + m.name + '</td>' +
        '<td class="num">' + fmt(m.self) + '</td>' +
        '<td class="num">' + fmt(m.supervisor) + '</td>' +
        (showDiv ? '<td class="num">' + fmt(m.division != null ? m.division : '—') + '</td>' : '') +
        '</tr>';
    }).join('');
    return '<div class="q-table-wrap"><table class="q-table score-confirm-table">' + head +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function calcQuarterSystemTotal(modules) {
    var selfSum = 0;
    var supSum = 0;
    var divSum = 0;
    modules.forEach(function (m) {
      selfSum += parseFloat(m.self) || 0;
      supSum += parseFloat(m.supervisor) || 0;
      divSum += parseFloat(m.division) || 0;
    });
    selfSum = Math.round(selfSum * 100) / 100;
    supSum = Math.round(supSum * 100) / 100;
    divSum = Math.round(divSum * 100) / 100;
    return {
      selfSum: selfSum,
      supSum: supSum,
      divSum: divSum,
      weightedSelf: Math.round(selfSum * 0.2 * 100) / 100,
      weightedSup: Math.round(supSum * 0.4 * 100) / 100,
      weightedDiv: Math.round(divSum * 0.4 * 100) / 100,
      systemTotal: Math.round((selfSum * 0.2 + supSum * 0.4 + divSum * 0.4) * 100) / 100,
    };
  }

  function renderSummaryFooter(calc, opts) {
    opts = opts || {};
    var adjusted = opts.divisionAdjusted !== false;
    var systemTotal = calc.systemTotal;
    var finalTotal = opts.finalTotal != null ? opts.finalTotal : (adjusted ? systemTotal - 0.6 : systemTotal);
    var html = '<div class="score-convert-panel">';
    html += '<div class="score-convert-row"><span>工作块自评小计</span><b>' + fmt(calc.selfSum) + '</b></div>';
    html += '<div class="score-convert-row"><span>工作块上级小计</span><b>' + fmt(calc.supSum) + '</b></div>';
    if (opts.taskType === 'quarter' && calc.divSum != null) {
      html += '<div class="score-convert-row"><span>工作块分管小计</span><b>' + fmt(calc.divSum) + '</b></div>';
      html += '<div class="score-convert-formula">折算：自评×20% + 上级×40% + 分管×40% = ' +
        fmt(calc.weightedSelf) + ' + ' + fmt(calc.weightedSup) + ' + ' + fmt(calc.weightedDiv) +
        ' = <b>' + fmt(calc.systemTotal) + '</b></div>';
    } else {
      html += '<div class="score-convert-formula">折算：自评×20% + 上级×80% = ' +
        fmt(calc.weightedSelf) + ' + ' + fmt(calc.weightedSup) + ' = <b>' + fmt(calc.systemTotal) + '</b></div>';
    }
    if (opts.full && adjusted) {
      html += '<div class="score-convert-row score-convert-row--audit"><span>系统汇总分</span><b>' + fmt(systemTotal) + '</b></div>';
      html += '<div class="score-convert-row score-convert-row--audit"><span>分管核定总分</span><b>' + fmt(finalTotal) + ' <span class="q-tag q-tag-orange">分管已调整</span></b></div>';
    } else if (adjusted) {
      html += '<div class="score-convert-row score-convert-row--final"><span>分管核定总分</span><b style="font-size:18px;color:var(--primary)">' + fmt(finalTotal) + ' <span class="q-tag q-tag-orange">分管已调整</span></b></div>';
      html += '<p class="hr-hint" style="margin:8px 0 0;font-size:12px">系统汇总 ' + fmt(systemTotal) + ' → 分管核定 ' + fmt(finalTotal) + '（HR 详情可见完整对比）</p>';
    } else {
      html += '<div class="score-convert-row score-convert-row--final"><span>核定总得分</span><b style="font-size:18px;color:var(--primary)">' + fmt(finalTotal) + '</b></div>';
    }
    html += '</div>';
    return html;
  }

  function renderModuleCards(modules, opts) {
    opts = opts || {};
    var showDiv = opts.showDivision;
    var html = '<div class="mp-confirm-modules">';
    modules.forEach(function (m) {
      html += '<div class="mp-confirm-module-card">' +
        '<div class="mp-confirm-module-card__name">' + m.name + '</div>' +
        '<div class="mp-confirm-module-card__scores">' +
        '<div class="mp-confirm-score-cell"><span>自评</span><b>' + fmt(m.self) + '</b></div>' +
        '<div class="mp-confirm-score-cell"><span>上级</span><b>' + fmt(m.supervisor) + '</b></div>' +
        (showDiv ? '<div class="mp-confirm-score-cell"><span>分管</span><b>' + fmt(m.division != null ? m.division : '—') + '</b></div>' : '') +
        '</div></div>';
    });
    html += '</div>';
    return html;
  }

  function renderConfirmPage(opts) {
    opts = opts || {};
    var modules = opts.modules || DEMO_MODULES;
    var calc = opts.taskType === 'quarter' && opts.showDivision
      ? calcQuarterSystemTotal(modules)
      : calcSystemTotal(modules);
    var table = opts.mobile
      ? renderModuleCards(modules, opts)
      : renderModuleTable(modules, opts);
    return table + renderSummaryFooter(calc, opts);
  }

  window.PerfScoreSummary = {
    DEMO_MODULES: DEMO_MODULES,
    calcSystemTotal: calcSystemTotal,
    calcQuarterSystemTotal: calcQuarterSystemTotal,
    renderModuleTable: renderModuleTable,
    renderModuleCards: renderModuleCards,
    renderSummaryFooter: renderSummaryFooter,
    renderConfirmPage: renderConfirmPage,
  };
})();
