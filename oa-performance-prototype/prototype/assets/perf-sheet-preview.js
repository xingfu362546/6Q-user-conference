/**
 * 整表预览后再导出图片。版式与填写页「预览全部」同一套横表。
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function asObjectives(list) {
    if (!list || !list.length) return [];
    if (list[0].targets) return list;
    return list.map(function (kr, i) {
      return { id: kr.id || ('ko-' + i), o: kr.o || '关键目标', targets: [kr] };
    });
  }

  function findSubmission(emp, quarter) {
    var SS = window.SupervisorScore;
    if (!SS || !SS.SUBMISSIONS || !emp || !emp.name) return null;
    var hit = null;
    Object.keys(SS.SUBMISSIONS).forEach(function (key) {
      var sub = SS.SUBMISSIONS[key];
      var header = sub && sub.header;
      if (!header || header.employee !== emp.name) return;
      var isQuarter = /Q/i.test(String(header.period || ''));
      if (isQuarter === !!quarter) hit = { id: key, sub: sub };
    });
    return hit;
  }

  function sheetModel(emp, quarter) {
    var found = findSubmission(emp, quarter);
    var model = {
      missing: !found,
      core: [],
      regular: [],
      behavior: [],
      plus: [],
      minus: [],
      penalty: '无',
      interview: null,
      summary: '',
      nextRows: [],
      scores: {},
      division: {}
    };
    if (!found) return model;
    var sub = found.sub;
    model.core = asObjectives(sub.coreKeyObjectives || sub.coreKrs);
    model.regular = asObjectives(sub.regularKeyObjectives || sub.regularKrs);
    model.behavior = sub.behavior || [];
    model.summary = sub.selfSummary || '';
    model.interview = sub.interview || null;
    var plus = (sub.adjust && sub.adjust.plus) || [];
    var minus = (sub.adjust && sub.adjust.minus) || [];
    model.plus = plus.map(function (row) {
      return { type: '加分', desc: row.desc || row.detail || '', score: row.approved != null ? row.approved : row.selfScore };
    });
    model.minus = minus.map(function (row) {
      return { type: '减分', desc: row.desc || row.detail || '', score: row.approved != null ? row.approved : row.selfScore };
    });
    model.penalty = model.minus.length ? model.minus.map(function (row) { return row.desc + ' ' + row.score; }).join('；') : '无';
    if (quarter) {
      (sub.nextSeasonKeyObjectives || []).forEach(function (ko) {
        (ko.targets || []).forEach(function (target) {
          var standard = target.standard || (target.standardTiers || []).map(function (tier) { return tier.label; }).join('；');
          model.nextRows.push({ o: ko.o, smart: target.smart, standard: standard, benchmark: '—' });
        });
      });
    } else {
      (sub.nextMonthKrs || []).forEach(function (kr) {
        model.nextRows.push({ o: kr.o, smart: kr.smart, standard: kr.standard, benchmark: '—' });
      });
    }
    var preset = (window.SupervisorScore.PRESET_SCORES || {})[found.id] || {};
    model.scores = preset.scores || {};
    model.division = preset.divisionScores || {};
    return model;
  }

  function readTask(emp, plan) {
    if (!window.PerfHrStore || !plan || !plan.id || !emp) return null;
    return PerfHrStore.readTask(plan.id, emp.no);
  }

  function savedIncentive(emp, plan) {
    if (!emp || !plan || !plan.id) return [];
    var rows = [];
    try {
      rows = JSON.parse(localStorage.getItem('hr-incentive-' + emp.no + '-' + plan.id) || 'null') || [];
    } catch (e) { rows = []; }
    // 附件只在员工填报里，按顺序补到 HR 核定行上，整表才看得到文件名
    try {
      var draft = JSON.parse(localStorage.getItem('perf-quarter-draft-' + plan.id + '-' + emp.no) || 'null');
      var empRows = draft && draft.extra && draft.extra.incentive;
      if (Array.isArray(empRows)) {
        empRows.forEach(function (row, i) {
          if (rows[i] && row.attachment) rows[i].attachment = row.attachment;
        });
      }
    } catch (e2) { /* 没有填报快照 */ }
    return rows;
  }

  function work(title, list, period, state) {
    var body = window.PerfReviewSheet
      ? PerfReviewSheet.renderWorkTable(list, { periodType: period, editable: false, state: state })
      : '<p>横表未加载</p>';
    return '<section class="perf-preview-block"><h3>' + esc(title) + '</h3>' + body + '</section>';
  }

  function showNum(value) {
    return value == null || value === '' ? '—' : esc(value);
  }

  function nextTable(rows) {
    var body = (rows || []).map(function (row) {
      return '<tr><td>' + esc(row.o) + '</td><td>' + esc(row.smart) + '</td><td>' + esc(row.standard) + '</td><td>' + esc(row.benchmark || '—') + '</td></tr>';
    }).join('') || '<tr><td colspan="4">未填写</td></tr>';
    return '<table class="q-table perf-preview-table"><tr><th>关键目标</th><th>考核目标</th><th>考核标准</th><th>是否对标</th></tr>' + body + '</table>';
  }

  function totalsHtml(emp, plan) {
    var task = readTask(emp, plan);
    if (!task) return '<p>待办还没有分数记录。</p>';
    var hr = task.hrFinal && task.hrFinal.value != null ? task.hrFinal.value : null;
    var adopted = window.PerfHrStore && PerfHrStore.adoptedScore ? PerfHrStore.adoptedScore(plan.id, task) : null;
    return '<p>计算总分 ' + showNum(task.assessedTotal) + ' · 上级核定 ' + showNum(task.supervisorTotal) +
      ' · HR 最终总分 ' + showNum(hr) + ' · 采用分 ' + showNum(adopted) + '</p>';
  }

  function incentiveHtml(emp, plan) {
    var rows = savedIncentive(emp, plan);
    if (!rows.length) return '<p>未申报。人才开发部尚未核定专项，预览不填示例得分。</p>';
    var QS = window.PerfQuarterScore;
    var body = rows.map(function (row, i) {
      var type = QS && QS.typeById ? (QS.typeById(row.typeId) || {}) : {};
      var score = '—';
      if (QS && QS.incentiveRowScore) {
        var rowScore = QS.incentiveRowScore(row);
        score = rowScore == null ? '待评定' : rowScore;
      }
      var attName = row.attachment ? row.attachment.name : '—';
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(row.objective) + '</td><td>' + esc(row.result) + '</td><td>' + esc(attName) + '</td><td>' + esc(type.label || row.typeId || '—') + '</td><td>' + esc(score) + '</td></tr>';
    }).join('');
    var summary = '';
    if (QS && QS.compute) {
      var task = readTask(emp, plan);
      var hr = task && task.hrFinal && task.hrFinal.value != null ? task.hrFinal.value : (task ? task.assessedTotal : null);
      var result = QS.compute({
        workRows: task && task.assessedTotal != null ? [{ self: task.assessedTotal, supervisor: task.supervisorTotal, division: task.divisionTotal }] : [],
        sixqTotal: 0,
        penaltyRows: [],
        incentiveRows: rows,
        hrFinalTotal: hr,
        level: emp.level || '职员'
      });
      if (result && result.ok) {
        var names = { A: 'A 档', B: 'B 档', C: 'C 档', none: '暂不认定', pending: '暂不认定（未评定）' };
        var amount = result.suggestedAmount === 'unmatched' ? '职级未匹配' : result.suggestedAmount;
        summary = '<p>专项得分 ' + esc(result.incentiveTotal) + ' · 建议档次 ' + esc(names[result.finalTier] || result.finalTier) + ' · 建议金额 ' + esc(amount) + '</p>';
      }
    }
    return '<table class="q-table perf-preview-table"><tr><th>#</th><th>关键目标</th><th>关键成果</th><th>附件</th><th>超越类型</th><th>本条得分</th></tr>' + body + '</table>' + summary;
  }

  function bodyHtml(emp, quarter, plan) {
    plan = plan || {};
    var model = sheetModel(emp, quarter);
    var state = { scores: model.scores, divisionScores: model.division || {} };
    var head = '<p class="perf-preview-note">' + esc(emp.name) + ' · 工号 ' + esc(emp.no) + ' · ' + esc(emp.org || '') + ' · ' + esc(emp.role || '') + ' · ' + esc(plan.name || '') + '</p>';
    if (model.missing) head += '<p class="perf-preview-note">这张待办没有员工填报快照，预览不填示例分数。空区块保持空白。</p>';
    var emptyWork = '<p>未填写</p>';
    function workOrEmpty(title, list, period) {
      if (!list || !list.length) return '<section class="perf-preview-block"><h3>' + esc(title) + '</h3>' + emptyWork + '</section>';
      return work(title, list, period, state);
    }
    if (quarter) {
      var sixq = window.PerfSixQ3J && plan.id
        ? PerfSixQ3J.renderReadonlyPanel(plan.id, emp.no, { title: '6Q3J 人才评价' })
        : '<p>未导入</p>';
      return head +
        workOrEmpty('核心绩效 V%', model.core, 'quarter') +
        workOrEmpty('常规绩效 X%', model.regular, 'quarter') +
        '<section class="perf-preview-block"><h3>6Q3J 人才评价</h3>' + sixq + '</section>' +
        '<section class="perf-preview-block"><h3>专项激励</h3>' + incentiveHtml(emp, plan) + '</section>' +
        '<section class="perf-preview-block"><h3>减分</h3><p>' + esc(model.penalty) + '</p></section>' +
        '<section class="perf-preview-block"><h3>自评总结</h3><p>' + esc(model.summary || '未填写') + '</p></section>' +
        '<section class="perf-preview-block"><h3>下季核心目标</h3>' + nextTable(model.nextRows) + '</section>' +
        '<section class="perf-preview-block"><h3>分数</h3>' + totalsHtml(emp, plan) + '</section>';
    }
    var behavior = model.behavior.length && window.PerfReviewSheet
      ? PerfReviewSheet.renderBehaviorTable(model.behavior, { periodType: 'month', editable: false, state: state })
      : '<p>未填写</p>';
    var plus = (model.plus || []).concat(model.minus || []).map(function (row) {
      return '<tr><td>' + esc(row.type) + '</td><td>' + esc(row.desc) + '</td><td>' + esc(row.score) + '</td></tr>';
    }).join('') || '<tr><td colspan="3">未填写</td></tr>';
    return head +
      workOrEmpty('核心绩效 V%', model.core, 'month') +
      workOrEmpty('常规绩效 X%', model.regular, 'month') +
      '<section class="perf-preview-block"><h3>行为态度</h3>' + behavior + '</section>' +
      '<section class="perf-preview-block"><h3>加减分</h3><table class="q-table perf-preview-table"><tr><th>类型</th><th>说明</th><th>分数</th></tr>' + plus + '</table></section>' +
      '<section class="perf-preview-block"><h3>自评总结</h3><p>' + esc(model.summary || '未填写') + '</p></section>' +
      '<section class="perf-preview-block"><h3>下月核心目标</h3>' + nextTable(model.nextRows) + '</section>' +
      '<section class="perf-preview-block"><h3>分数</h3>' + totalsHtml(emp, plan) + '</section>';
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
      '<button type="button" class="q-btn q-btn-primary" id="preview-export">导出PDF</button>' +
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
      if (msg) msg.textContent = '已打开打印窗口。在「目标打印机」里选「另存为 PDF」，文件名默认是 ' + (opts.filename || '绩效表.pdf');
      PerfExportImage.exportPdf(clone, opts.filename || '绩效表.pdf').then(function () {
        if (msg) msg.textContent = '打印窗口已打开，选「另存为 PDF」即可';
        holder.remove();
      }).catch(function (err) {
        if (msg) msg.textContent = '导出失败：' + (err && err.message ? err.message : err);
        holder.remove();
      });
    });
  }

  function periodCode(plan) {
    var period = plan && plan.period ? String(plan.period) : '';
    if (/^\d{4}-\d{2}$/.test(period) || /^\d{4}-Q[1-4]$/i.test(period)) {
      return period.replace(/q([1-4])$/i, function (_, n) { return 'Q' + n; });
    }
    return '';
  }

  function openEmployee(emp, plan) {
    var quarter = !!(plan && plan.quarter);
    var period = periodCode(plan);
    open({
      title: (emp.name || '员工') + ' · 整表预览',
      filename: window.PerfExportImage ? PerfExportImage.filename(emp.name, period || '考核期') : ((emp.name || '员工') + '.pdf'),
      html: bodyHtml(emp, quarter, plan)
    });
  }

  function openHtml(title, html, filename) {
    open({ title: title, html: html, filename: filename });
  }

  window.PerfSheetPreview = { open: open, openEmployee: openEmployee, openHtml: openHtml, close: close };
})();
