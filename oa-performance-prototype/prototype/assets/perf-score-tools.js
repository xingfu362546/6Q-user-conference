/**
 * 评分页的手动保存、自动保存和导出图片。
 */
(function () {
  'use strict';

  function boot() {
    var time = document.getElementById('save-time');
    var auto = window.PerfAutosave ? PerfAutosave.bind({
      save: function () {
        try {
          var list = document.getElementById('score-kr-list');
          localStorage.setItem('oa-score-snapshot-' + location.pathname, list ? list.innerText : '');
        } catch (e) {
          if (time) time.textContent = '未保存成功';
          return false;
        }
        if (time) time.textContent = '最新保存时间：' + PerfAutosave.format(new Date());
        return true;
      },
      onFail: function () { if (time) time.textContent = '未保存成功'; }
    }) : null;
    var root = document.getElementById('score-kr-list');
    if (root && auto) root.addEventListener('input', function () { auto.mark(); });
    var save = document.getElementById('btn-save-score');
    if (save && auto) save.addEventListener('click', function () { auto.saveNow(); });
    var exp = document.getElementById('btn-export-sheet');
    if (exp) exp.addEventListener('click', function () {
      var card = document.querySelector('.q-card-panel');
      if (!card || !window.PerfSheetPreview) { alert('整表预览未加载'); return; }
      var clone = card.cloneNode(true);
      var actions = clone.querySelector('.score-actions');
      if (actions) actions.remove();
      var time = clone.querySelector('#save-time');
      if (time) time.remove();
      clone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      var who = document.querySelector('#score-header-info');
      var title = who ? (who.innerText || '').split('\n')[0] : '评分表';
      PerfSheetPreview.openHtml(title || '整表预览', clone.innerHTML, PerfExportImage ? PerfExportImage.filename('评分表', '当前') : '评分表.png');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
