/**
 * 评分 / 确认页横表渲染器
 * 与员工填表页（.kr-sheet）保持同一套列结构：
 * 关键目标 O | 考核目标 SMART | KR 权重 | 考核标准 | 关键成果 M | 自评分 | 上级评分 |（分管评分）
 *
 * 填表页只读列在这里变成可编辑的「上级评分 / 分管评分」，其余列一律只读。
 */
(function () {
  'use strict';

  function sf() { return window.PerfScoreFormat; }
  function sIn(v) { return sf() ? sf().inputVal(v) : (v == null ? '' : String(v)); }
  function sOut(v) { return sf() ? sf().format(v) : v; }

  /** 权重显示：整数不带小数，25.5 保留一位 */
  function trimNum(v) {
    var n = parseFloat(v);
    if (isNaN(n)) return '—';
    return (Math.round(n * 10) / 10).toString();
  }

  function escText(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function multi(text, cls) {
    var s = String(text || '').trim();
    if (!s) return '<span class="kr-ro-empty">—</span>';
    return '<div class="kr-ro-text ' + (cls || '') + '">' + escText(s) + '</div>';
  }

  /** 考核标准：有分档就按档显示，否则整段显示 */
  function standardHtml(t) {
    if (t.standardTiers && t.standardTiers.length) {
      var rows = t.standardTiers.map(function (tier) {
        return '<div class="kr-ro-tier"><span>' + escText(tier.label) + '</span>' +
          '<b>' + sOut(tier.score) + '</b></div>';
      }).join('');
      var attach = (t.attachRules || '').trim()
        ? '<div class="kr-ro-attach">附加规则：' + escText(t.attachRules) + '</div>' : '';
      return '<div class="kr-ro-tiers">' + rows + '</div>' + attach;
    }
    var text = multi(t.standard);
    var attach2 = (t.attachRules || '').trim()
      ? '<div class="kr-ro-attach">附加规则：' + escText(t.attachRules) + '</div>' : '';
    return text + attach2;
  }

  function scoreInputHtml(id, col, value, max, editable) {
    var cls = 'perf-score-input score-sheet-input' + (col === 'div' ? ' score-input-div' : ' score-input-sup');
    return '<input type="number" step="0.01" class="' + cls + '" data-perf-score ' +
      'data-score-id="' + id + '" data-score-col="' + col + '" data-max="' + max + '" ' +
      'value="' + sIn(value) + '" placeholder="0~' + max + '"' +
      (editable ? '' : ' disabled readonly') + ' />';
  }

  function scoreCellHtml(t, col, opts) {
    var state = opts.state || {};
    var editable = !!opts.editable;
    var field = col === 'div' ? 'divisionScores' : 'scores';
    var val = state[field] ? state[field][t.id] : '';
    if (editable) {
      return '<td class="kr-sheet-score kr-sheet-score--' + col + '">' +
        scoreInputHtml(t.id, col, val, t.weight, true) +
        '<div class="kr-score-max">上限 ' + trimNum(t.weight) + '</div></td>';
    }
    var shown = (val === '' || val == null) ? '—' : sOut(val);
    return '<td class="kr-sheet-score kr-sheet-score--' + col + '">' +
      '<div class="kr-ro-score">' + shown + '</div></td>';
  }

  function selfCellHtml(t) {
    var v = (t.selfScore === '' || t.selfScore == null) ? '—' : sOut(t.selfScore);
    return '<td class="kr-sheet-score kr-sheet-score--self"><div class="kr-ro-score">' + v + '</div></td>';
  }

  function colgroup(opts) {
    var cols = ['o', 'smart', 'w', 'std', 'm', 'score', 'score'];
    if (opts.periodType === 'quarter') cols.push('score');
    return '<colgroup>' + cols.map(function (c) {
      return '<col class="kr-sheet-' + c + '">';
    }).join('') + '</colgroup>';
  }

  function thead(opts) {
    var head = '<thead><tr>' +
      '<th class="kr-sheet-o">关键目标 O</th>' +
      '<th class="kr-sheet-smart">考核目标 SMART</th>' +
      '<th class="kr-sheet-w">KR 权重</th>' +
      '<th class="kr-sheet-std">考核标准</th>' +
      '<th class="kr-sheet-m">关键成果 M</th>' +
      '<th class="kr-sheet-score-h kr-sheet-score-h--self">自评分</th>' +
      '<th class="kr-sheet-score-h kr-sheet-score-h--sup">上级评分</th>';
    if (opts.periodType === 'quarter') {
      head += '<th class="kr-sheet-score-h kr-sheet-score-h--div">分管评分</th>';
    }
    return head + '</tr></thead>';
  }

  /**
   * 工作块横表（核心 V / 常规 X）
   * opts: { objectives, periodType, editable, state }
   */
  function renderWorkTable(objectives, opts) {
    opts = opts || {};
    var rows = [];
    (objectives || []).forEach(function (ko, koIdx) {
      var targets = ko.targets || [];
      if (!targets.length) return;
      targets.forEach(function (t, ti) {
        var oCell = '';
        if (ti === 0) {
          oCell = '<td class="kr-sheet-o" rowspan="' + targets.length + '">' +
            '<div class="kr-ro-o">' + (escText(ko.o) || '—') + '</div></td>';
        }
        var divCell = opts.periodType === 'quarter' ? scoreCellHtml(t, 'div', opts) : '';
        rows.push('<tr class="kr-sheet-row" data-id="' + t.id + '">' +
          oCell +
          '<td class="kr-sheet-smart">' + multi(t.smart) + '</td>' +
          '<td class="kr-sheet-w"><div class="kr-ro-weight">' + trimNum(t.weight) + '<span>%</span></div></td>' +
          '<td class="kr-sheet-std">' + standardHtml(t) + '</td>' +
          '<td class="kr-sheet-m">' + multi(t.m) + '</td>' +
          selfCellHtml(t) +
          scoreCellHtml(t, 'sup', opts) +
          divCell +
          '</tr>');
      });
    });
    return '<div class="kr-sheet-wrap"><table class="kr-sheet kr-sheet--review' +
      (opts.periodType === 'quarter' ? ' kr-sheet--quarter' : '') + '">' +
      colgroup(opts) + thead(opts) + '<tbody>' + rows.join('') + '</tbody></table></div>';
  }

  /** 行为态度块横表：行为项 / 考核标准 / 关键事件 / 自评分 / 上级评分 */
  function renderBehaviorTable(items, opts) {
    opts = opts || {};
    var rows = (items || []).map(function (b) {
      var divCell = opts.periodType === 'quarter' ? scoreCellHtml(b, 'div', opts) : '';
      return '<tr class="kr-sheet-row kr-sheet-row--behavior" data-id="' + b.id + '">' +
        '<td class="kr-sheet-o"><div class="kr-ro-o">' + escText(b.name) + '</div></td>' +
        '<td class="kr-sheet-std" colspan="2">' + multi(b.standard) + '</td>' +
        '<td class="kr-sheet-m">' + multi(b.event || b.m) + '</td>' +
        selfCellHtml(b) +
        scoreCellHtml(b, 'sup', opts) +
        divCell +
        '</tr>';
    }).join('');
    var head = '<thead><tr>' +
      '<th class="kr-sheet-o">行为态度项</th>' +
      '<th class="kr-sheet-std" colspan="2">考核标准</th>' +
      '<th class="kr-sheet-m">关键事件 / 说明</th>' +
      '<th class="kr-sheet-score-h kr-sheet-score-h--self">自评分</th>' +
      '<th class="kr-sheet-score-h kr-sheet-score-h--sup">上级评分</th>' +
      (opts.periodType === 'quarter' ? '<th class="kr-sheet-score-h kr-sheet-score-h--div">分管评分</th>' : '') +
      '</tr></thead>';
    var cols = ['o', 'std', 'std', 'm', 'score', 'score'];
    if (opts.periodType === 'quarter') cols.push('score');
    var cg = '<colgroup>' + cols.map(function (c) {
      return '<col class="kr-sheet-' + c + '">';
    }).join('') + '</colgroup>';
    return '<div class="kr-sheet-wrap"><table class="kr-sheet kr-sheet--review kr-sheet--behavior' +
      (opts.periodType === 'quarter' ? ' kr-sheet--quarter' : '') + '">' +
      cg + head + '<tbody>' + rows + '</tbody></table></div>';
  }

  window.PerfReviewSheet = {
    renderWorkTable: renderWorkTable,
    renderBehaviorTable: renderBehaviorTable,
    escText: escText,
  };
})();
