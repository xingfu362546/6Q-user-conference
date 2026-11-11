/**
 * 内容变脏后隔一段时间保存一次。滚动不标脏。
 */
(function () {
  'use strict';

  function readMs(fallback) {
    try {
      var q = new URLSearchParams(location.search).get('autosaveMs');
      if (q) return Math.max(1000, parseInt(q, 10) || fallback);
    } catch (e) { /* 非浏览器 */ }
    return fallback || 120000;
  }

  function bind(opts) {
    var dirty = false;
    var timer = null;
    var ms = opts.ms || readMs(120000);

    function save() {
      var ok = true;
      try { if (opts.save) ok = opts.save() !== false; } catch (e) { ok = false; }
      if (!ok) {
        if (opts.onFail) opts.onFail();
        return false;
      }
      dirty = false;
      clearTimeout(timer);
      if (opts.onSaved) opts.onSaved(new Date());
      return true;
    }

    function mark() {
      dirty = true;
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (dirty) save();
      }, ms);
    }

    return { mark: mark, saveNow: save, ms: ms };
  }

  function format(d) {
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  window.PerfAutosave = { bind: bind, format: format, readMs: readMs };
})();
