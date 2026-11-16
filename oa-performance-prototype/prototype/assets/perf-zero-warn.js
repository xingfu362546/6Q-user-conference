/**
 * 0 分提醒：输入 0 时在分数下方标红，提交时二次确认。草稿保存不拦。
 */
(function () {
  'use strict';

  function isZero(inp) {
    if (!inp || inp.disabled) return false;
    var raw = String(inp.value == null ? '' : inp.value).trim();
    return raw !== '' && Number(raw) === 0;
  }

  function labelFor(inp) {
    var row = inp.closest('tr');
    if (row) {
      var first = row.querySelector('td');
      var text = first ? (first.innerText || '').replace(/\s+/g, ' ').trim() : '';
      if (text) return text.slice(0, 24);
    }
    var field = inp.closest('.field');
    var label = field && field.querySelector('label');
    if (label) return (label.innerText || '').trim().slice(0, 24);
    return inp.getAttribute('data-score-id') || inp.getAttribute('placeholder') || '评分项';
  }

  function paint(inp) {
    var host = inp.parentNode;
    if (!host) return;
    var hint = host.querySelector('.score-zero-warn');
    if (!isZero(inp)) {
      if (hint) hint.remove();
      return;
    }
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'score-zero-warn';
      hint.textContent = '是否确认为 0 分？';
      host.appendChild(hint);
    }
  }

  function markAll(root) {
    (root || document).querySelectorAll('input.perf-score-input, input[data-perf-score]').forEach(paint);
  }

  function collect(root) {
    var list = [];
    (root || document).querySelectorAll('input.perf-score-input, input[data-perf-score]').forEach(function (inp) {
      if (isZero(inp)) list.push(labelFor(inp));
    });
    return list;
  }

  /** 提交前调用。返回 false 表示用户取消。 */
  function confirmSubmit(root) {
    var list = collect(root);
    if (!list.length) return true;
    var lines = list.slice(0, 8).map(function (label, i) { return (i + 1) + '. ' + label; });
    if (list.length > 8) lines.push('… 共 ' + list.length + ' 项');
    return window.confirm('以下项目填了 0 分，确认提交？\n\n' + lines.join('\n'));
  }

  function bind(root) {
    var host = root || document;
    host.addEventListener('input', function (e) {
      if (e.target && e.target.matches && e.target.matches('input.perf-score-input, input[data-perf-score]')) paint(e.target);
    });
    host.addEventListener('change', function (e) {
      if (e.target && e.target.matches && e.target.matches('input.perf-score-input, input[data-perf-score]')) paint(e.target);
    });
    markAll(host);
  }

  window.PerfZeroWarn = {
    bind: bind,
    markAll: markAll,
    collect: collect,
    confirmSubmit: confirmSubmit
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { bind(document); });
  else bind(document);
})();
