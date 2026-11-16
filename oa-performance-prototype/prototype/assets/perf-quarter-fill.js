/**
 * 季度填写：专项激励、减分、下季补充项、提交前预览。
 */
(function () {
  'use strict';

  var bag = blank();

  function blankPenalty() {
    return { event: '', self: '', supervisor: '', division: '' };
  }

  function blank() {
    return {
      incentive: [],
      penalty: [blankPenalty()],
      brandNote: '',
      nextMeta: []
    };
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function types() {
    return window.PerfQuarterScore ? PerfQuarterScore.employeeTypes() : [];
  }

  function restore(data) {
    bag = blank();
    if (!data) return bag;
    if (Array.isArray(data.incentive)) bag.incentive = data.incentive;
    if (Array.isArray(data.penalty) && data.penalty.length) bag.penalty = data.penalty;
    if (Array.isArray(data.nextMeta)) bag.nextMeta = data.nextMeta;
    bag.brandNote = data.brandNote || '';
    return bag;
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(bag));
  }

  function scoreOf(typeId) {
    var t = window.PerfQuarterScore && PerfQuarterScore.typeById(typeId);
    return t ? t.points : '';
  }

  function render(step, bodyEl, ctx) {
    if (step === 4) renderIncentive(bodyEl, ctx);
    else if (step === 5) renderPenalty(bodyEl, ctx);
  }

  function incentiveAttachmentCell(row, i) {
    var name = row.attachment && window.PerfAttachment ? PerfAttachment.link(row.attachment) : (row.fileName ? '<span class="perf-attach-empty">' + esc(row.fileName) + '（旧附件仅文件名）</span>' : '<span class="perf-attach-empty">未上传</span>');
    return '<div class="perf-attach-cell">' + name +
      '<div class="perf-attach-actions">' +
      '<button type="button" class="q-btn q-btn-sm" data-att-upload="' + i + '">' + (row.attachment ? '替换' : '上传') + '</button>' +
      (row.attachment ? '<button type="button" class="q-btn q-btn-sm" data-att-remove="' + i + '">移除</button>' : '') +
      '</div></div>';
  }

  function renderIncentive(bodyEl, ctx) {
    var rows = bag.incentive;
    var opts = types().map(function (t) {
      return '<option value="' + t.id + '">' + esc(t.label) + '（' + t.points + ' 分）</option>';
    }).join('');
    var body = rows.map(function (row, i) {
      return '<tr data-inc="' + i + '">' +
        '<td class="perf-inc-o"><textarea data-k="objective" rows="2" placeholder="填写关键目标">' + esc(row.objective) + '</textarea></td>' +
        '<td class="perf-inc-r"><textarea data-k="result" rows="2" placeholder="填写关键成果">' + esc(row.result) + '</textarea></td>' +
        '<td class="perf-inc-att">' + incentiveAttachmentCell(row, i) + '</td>' +
        '<td class="perf-inc-type"><select data-k="typeId"><option value="">请选择</option>' + opts + '</select></td>' +
        '<td class="perf-inc-self"><input data-k="self" readonly value="' + esc(scoreOf(row.typeId)) + '" /></td>' +
        '<td class="perf-inc-op"><button type="button" class="perf-del-btn" data-del="' + i + '"><span class="perf-del-btn__icon">×</span><span class="perf-del-btn__text">删除</span></button></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="6" class="muted">还没有申报。专项是选填项。</td></tr>';
    var html = '<p class="section-desc">专项激励（选填，最多 5 条）。替代原来的加分项，不进入核定总分。选定超越类型后自评分自动带出，附件支持图片和 PDF，上传后点文件名可预览。</p>' +
      '<div class="q-table-wrap"><table class="q-table perf-inc-table"><thead><tr>' +
      '<th>关键目标</th><th>关键成果</th><th>附件</th><th>超越类型</th><th>自评分</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<button type="button" class="q-btn" id="add-inc" style="margin-top:10px"' + (rows.length >= 5 ? ' disabled' : '') + '>+ 添加申报（' + rows.length + '/5）</button>' +
      '<p class="hr-hint" id="inc-hint" style="margin-top:8px"></p>';
    bodyEl.innerHTML = html;
    bodyEl.querySelectorAll('[data-inc]').forEach(function (tr) {
      var i = +tr.dataset.inc;
      var sel = tr.querySelector('[data-k="typeId"]');
      sel.value = rows[i].typeId || '';
      tr.querySelectorAll('[data-k]').forEach(function (el) {
        el.addEventListener('input', function () {
          rows[i][el.dataset.k] = el.value;
          if (el.dataset.k === 'typeId') {
            tr.querySelector('[data-k="self"]').value = scoreOf(el.value);
          }
          touch(ctx);
          paintHint();
        });
        el.addEventListener('change', function () {
          rows[i][el.dataset.k] = el.value;
          if (el.dataset.k === 'typeId') tr.querySelector('[data-k="self"]').value = scoreOf(el.value);
          touch(ctx);
        });
      });
      var up = tr.querySelector('[data-att-upload]');
      if (up) up.addEventListener('click', function () {
        if (!window.PerfAttachment) { alert('附件组件未加载'); return; }
        PerfAttachment.pick(function (att, err) {
          if (err) { alert(err); return; }
          var total = rows.reduce(function (sum, row) {
            if (!row.attachment || row.attachment === (rows[i] && rows[i].attachment)) return sum;
            return sum + (row.attachment.size || 0);
          }, att.size || 0);
          if (total > 4 * 1024 * 1024) { alert('专项附件合计不能超过 4MB，先删掉一个再传'); return; }
          rows[i].attachment = att;
          rows[i].fileName = att.name;
          touch(ctx);
          render(4, bodyEl, ctx);
        });
      });
      var rm = tr.querySelector('[data-att-remove]');
      if (rm) rm.addEventListener('click', function () {
        rows[i].attachment = null;
        rows[i].fileName = '';
        touch(ctx);
        render(4, bodyEl, ctx);
      });
    });
    var add = bodyEl.querySelector('#add-inc');
    if (add) add.addEventListener('click', function () {
      if (bag.incentive.length >= 5) return;
      bag.incentive.push({ objective: '', result: '', fileName: '', typeId: '', attachment: null });
      touch(ctx);
      render(4, bodyEl, ctx);
    });
    bodyEl.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        bag.incentive.splice(+btn.dataset.del, 1);
        touch(ctx);
        render(4, bodyEl, ctx);
      });
    });
    function paintHint() {
      var hint = bodyEl.querySelector('#inc-hint');
      if (!hint || !window.PerfQuarterScore) return;
      var result = PerfQuarterScore.compute({ incentiveRows: rows.map(function (r) {
        return { objective: r.objective, typeId: r.typeId, finalScore: r.typeId ? scoreOf(r.typeId) : null };
      }) });
      hint.textContent = result.pending || !rows.length
        ? '人才开发部写出最终得分前，档次为暂不认定（未评定）。'
        : '按当前自评分预览专项得分 ' + result.incentiveTotal + '，不加入核定总分。';
    }
    paintHint();
  }

  function renderPenalty(bodyEl, ctx) {
    var row = bag.penalty[0];
    bodyEl.innerHTML =
      '<p class="section-desc">减分项（差错与失误）。综合分 = 自评×20% + 上级×40% + 分管×40%，会计入核定总分。未填的一方按 0。</p>' +
      '<div class="field"><label>事件说明</label><textarea id="pen-event" rows="3">' + esc(row.event) + '</textarea></div>' +
      '<div class="field"><label>自评分（小于等于 0）</label><input id="pen-self" value="' + esc(row.self) + '" /></div>' +
      '<p class="hr-hint" id="pen-hint"></p>';
    function sync() {
      row.event = bodyEl.querySelector('#pen-event').value;
      row.self = bodyEl.querySelector('#pen-self').value;
      var hint = bodyEl.querySelector('#pen-hint');
      if (row.self !== '' && Number(row.self) > 0) {
        hint.textContent = '减分必须小于等于 0。';
      } else if (window.PerfQuarterScore && row.self !== '') {
        var r = PerfQuarterScore.compute({ penaltyRows: [{ self: row.self }] });
        hint.textContent = r.ok ? '当前减分综合分 ' + r.penaltyTotal + '。' : r.error;
      } else hint.textContent = '';
      touch(ctx);
    }
    bodyEl.querySelector('#pen-event').addEventListener('input', sync);
    bodyEl.querySelector('#pen-self').addEventListener('input', sync);
    sync();
  }

  function touch(ctx) {
    if (ctx && ctx.mark) ctx.mark();
  }

  function validate(ctx) {
    var rows = bag.incentive || [];
    if (rows.length > 5) { alert('专项激励最多 5 条'); return false; }
    for (var i = 0; i < rows.length; i++) {
      if (!rows[i].typeId) continue;
      if (!String(rows[i].objective || '').trim() || !String(rows[i].result || '').trim()) {
        alert('第 ' + (i + 1) + ' 条专项申报需要关键目标和关键成果');
        return false;
      }
    }
    var pen = bag.penalty[0] || {};
    if (pen.self !== '' && pen.self != null && Number(pen.self) > 0) {
      alert('减分必须小于等于 0');
      return false;
    }
    var list = (ctx.state && ctx.state.nextSeasonKeyObjectives) || [];
    if (list.length < 3 || list.length > 5) {
      alert('下季核心目标须为 3 到 5 条，当前 ' + list.length + ' 条');
      return false;
    }
    for (var j = 0; j < list.length; j++) {
      var ko = list[j];
      var target = (ko.targets && ko.targets[0]) || {};
      var meta = bag.nextMeta[j] || {};
      if (!String(ko.o || '').trim() || !String(target.smart || '').trim()) {
        alert('第 ' + (j + 1) + ' 条下季目标需要关键目标和考核目标');
        return false;
      }
      if (!target.standard && !(target.standardTiers && target.standardTiers.length)) {
        alert('第 ' + (j + 1) + ' 条下季目标需要考核标准');
        return false;
      }
      var aligned = target.aligned || meta.aligned;
      if (aligned !== '是' && aligned !== '否') {
        alert('第 ' + (j + 1) + ' 条下季目标需要选择是否跟上级对标');
        return false;
      }
    }
    return true;
  }

  function workBlock(title, list, period) {
    var body = window.PerfReviewSheet
      ? PerfReviewSheet.renderWorkTable(list || [], { periodType: period, editable: false, state: {} })
      : '<p>尚未加载横表。</p>';
    return '<section class="perf-preview-block"><h3>' + title + '</h3>' + body + '</section>';
  }

  /** 下季目标：不带权重列，是否对标在每条目标后面 */
  function nextBlock(list) {
    var rows = [];
    (list || []).forEach(function (ko) {
      (ko.targets || []).forEach(function (t, ti) {
        var standard = t.standard || (t.standardTiers || []).map(function (tier) { return tier.label + ' ' + tier.score; }).join('；');
        rows.push('<tr>' +
          (ti === 0 ? '<td rowspan="' + (ko.targets || []).length + '">' + esc(ko.o) + '</td>' : '') +
          '<td>' + esc(t.smart) + '</td><td>' + esc(standard) + '</td>' +
          '<td>' + esc(t.aligned || '—') + '</td><td>' + esc(t.challenge || '—') + '</td><td>' + esc(t.remark || '—') + '</td></tr>');
      });
    });
    return '<section class="perf-preview-block"><h3>下季核心目标</h3>' +
      '<table class="q-table perf-preview-table"><tr><th>关键目标</th><th>考核目标</th><th>考核标准</th><th>是否对标</th><th>挑战 / 资源</th><th>备注</th></tr>' +
      (rows.join('') || '<tr><td colspan="6">未填写</td></tr>') + '</table></section>';
  }

  function sixqBlock(ctx) {
    if (!window.PerfSixQ3J || !ctx.planId) return '';
    return '<section class="perf-preview-block">' +
      PerfSixQ3J.renderReadonlyPanel(ctx.planId, ctx.empNo, { title: '6Q3J 人才评价' }) +
      '</section>';
  }

  function previewHtml(ctx) {
    var interview = ctx.interview || {};
    var state = ctx.state || {};
    var period = 'quarter';
    var typeName = function (id) {
      var t = window.PerfQuarterScore && PerfQuarterScore.typeById(id);
      return t ? t.label : (id || '未选');
    };
    var rows = bag.incentive.map(function (r, i) {
      var att = r.attachment ? r.attachment.name : (r.fileName || '—');
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(r.objective) + '</td><td>' + esc(r.result) + '</td><td>' + esc(att) + '</td><td>' + esc(typeName(r.typeId)) + '</td><td>' + esc(scoreOf(r.typeId)) + '</td></tr>';
    }).join('') || '<tr><td colspan="6">未申报</td></tr>';
    var summary = typeof ctx.summary === 'function' ? ctx.summary() : (ctx.summary || '');
    return '<div class="perf-preview-bar"><h2>提交前预览</h2><button type="button" class="q-btn" id="preview-close">返回修改</button></div>' +
      '<div class="perf-preview-scale"><p class="perf-preview-note">整张表只读，包含已填的工作 KR。这里不能改字。</p>' +
      workBlock('核心绩效 V%', state.coreKeyObjectives, period) +
      workBlock('常规绩效 X%', state.regularKeyObjectives, period) +
      sixqBlock(ctx) +
      '<section class="perf-preview-block"><h3>专项激励</h3><table class="q-table perf-preview-table"><tr><th>#</th><th>关键目标</th><th>关键成果</th><th>附件</th><th>超越类型</th><th>自评</th></tr>' + rows + '</table></section>' +
      '<section class="perf-preview-block"><h3>减分</h3><p>' + esc((bag.penalty[0] || {}).event || '无') + ' · 自评 ' + esc((bag.penalty[0] || {}).self || '空') + '</p></section>' +
      '<section class="perf-preview-block"><h3>自评总结</h3><p>' + esc(summary || '未填') + '</p></section>' +
      nextBlock(state.nextSeasonKeyObjectives) +
      '</div>';
  }

  function openPreview(ctx) {
    var old = document.getElementById('perf-preview-mask');
    if (old) old.remove();
    var mask = document.createElement('div');
    mask.id = 'perf-preview-mask';
    mask.className = 'perf-preview-mask';
    var panel = document.createElement('div');
    panel.className = 'perf-preview-canvas';
    panel.innerHTML = previewHtml(ctx);
    mask.appendChild(panel);
    document.body.appendChild(mask);
    panel.querySelector('#preview-close').addEventListener('click', function () { mask.remove(); });
    mask.addEventListener('click', function (e) { if (e.target === mask) mask.remove(); });
  }

  function openMonthly(state, behaviorItems) {
    var period = 'month';
    var behavior = (behaviorItems || []).map(function (b, i) {
      return '<tr><td>' + esc(b.name) + '</td><td>' + esc((state.behaviorEvents || [])[i] || '未填') + '</td><td>' + esc((state.behaviorSelfScores || [])[i] || '—') + '</td></tr>';
    }).join('');
    var plus = (state.plusRows || []).concat(state.minusRows || []).map(function (r) {
      return '<tr><td>' + esc(r.type || '') + '</td><td>' + esc(r.desc || '') + '</td><td>' + esc(r.score || '') + '</td></tr>';
    }).join('') || '<tr><td colspan="3">未填</td></tr>';
    var html = '<div class="perf-preview-bar"><h2>提交前预览</h2><button type="button" class="q-btn" id="preview-close">返回修改</button></div>' +
      '<div class="perf-preview-scale"><p class="perf-preview-note">整张月度表只读。月度没有专项激励。</p>' +
      workBlock('核心绩效 V%', state.coreKeyObjectives, period) +
      workBlock('常规绩效 X%', state.regularKeyObjectives, period) +
      '<section class="perf-preview-block"><h3>行为态度</h3><table class="q-table perf-preview-table"><tr><th>行为项</th><th>关键事件</th><th>自评分</th></tr>' + behavior + '</table></section>' +
      '<section class="perf-preview-block"><h3>加减分</h3><table class="q-table perf-preview-table"><tr><th>类型</th><th>说明</th><th>分数</th></tr>' + plus + '</table></section>' +
      '<section class="perf-preview-block"><h3>自评总结</h3><p>' + esc(state.selfSummary || '未填') + '</p></section>' +
      workBlock('下月核心目标', state.nextMonthKeyObjectives, 'next') +
      '</div>';
    var old = document.getElementById('perf-preview-mask');
    if (old) old.remove();
    var mask = document.createElement('div');
    mask.id = 'perf-preview-mask';
    mask.className = 'perf-preview-mask';
    var panel = document.createElement('div');
    panel.className = 'perf-preview-canvas';
    panel.innerHTML = html;
    mask.appendChild(panel);
    document.body.appendChild(mask);
    panel.querySelector('#preview-close').addEventListener('click', function () { mask.remove(); });
    mask.addEventListener('click', function (e) { if (e.target === mask) mask.remove(); });
  }

  window.PerfQuarterFill = {
    restore: restore,
    snapshot: snapshot,
    render: render,
    validate: validate,
    openPreview: openPreview,
    openMonthly: openMonthly,
    previewHtml: previewHtml
  };
})();
