/**
 * 原型注释 · 红点序号 + 右侧抽屉
 * 用法：页面引入 proto-notes-data.js + proto-notes.js 即可自动挂载
 */
(function () {
  'use strict';

  var PAGE_MAP = {
    'home.html': 'mp-home',
    'task-list.html': 'mp-task-list',
    'task-overdue.html': 'mp-task-overdue',
    'task-past.html': 'mp-task-past',
    'task-past-view.html': 'mp-task-past-view',
    'monthly-wizard.html': 'mp-monthly-wizard',
    'quarterly-wizard.html': 'mp-quarterly-wizard',
    'leader-score-monthly.html': 'mp-leader-score',
    'task-progress.html': 'mp-task-progress',
    'personal.html': 'oa-personal',
    'personal-perf.html': 'oa-personal-perf',
    'personal-perf-overdue.html': 'oa-personal-overdue',
    'personal-perf-past.html': 'oa-personal-past',
    'personal-perf-past-view.html': 'oa-personal-past-view',
    'employee-task-progress.html': 'oa-employee-progress',
    'supervisor-review-list.html': 'oa-supervisor-list',
    'supervisor-score-monthly.html': 'oa-supervisor-score-monthly',
    'supervisor-score-quarterly.html': 'oa-supervisor-score-quarterly',
    'hr-plan-list.html': 'hr-plan-list',
    'hr-plan-create.html': 'hr-plan-create',
    'hr-plan-detail.html': 'hr-plan-detail',
    'hr-bonus-rules-list.html': 'hr-bonus-rules-list',
    'hr-bonus-rule-edit.html': 'hr-bonus-rule-edit',
    'hr-bonus-settlement.html': 'hr-bonus-settlement',
    'hr-perf-results-list.html': 'hr-perf-results-list',
    'hr-task-detail.html': 'hr-task-detail',
    'division-dept-list.html': 'oa-division-dept-list',
  };

  var drawerEl = null;
  var maskEl = null;
  var currentNotes = [];
  var currentIndex = 0;
  var attached = false;

  function detectPageKey() {
    var path = (location.pathname || '').replace(/\\/g, '/');
    var isOa = path.indexOf('/oa-pc/') !== -1;
    var isMini = path.indexOf('/miniapp/') !== -1;
    if (isOa && /index\.html$/.test(path)) return 'oa-index';
    var file = path.split('/').pop() || 'index.html';
    if (file === 'index.html' && !isOa) return null;
    if (file === 'score-confirm.html') {
      if (isOa) return 'oa-score-confirm';
      if (isMini) return 'mp-score-confirm';
      return null;
    }
    if (isOa && file === 'monthly-wizard.html') return 'oa-monthly-wizard';
    if (isOa && file === 'quarterly-wizard.html') return 'oa-quarterly-wizard';
    return PAGE_MAP[file] || null;
  }

  function ensureDrawer() {
    if (maskEl) return;
    maskEl = document.createElement('div');
    maskEl.className = 'proto-drawer-mask';
    maskEl.innerHTML =
      '<aside class="proto-drawer" role="dialog" aria-labelledby="proto-drawer-title">' +
      '<div class="proto-drawer__head">' +
      '<h2 class="proto-drawer__title" id="proto-drawer-title"></h2>' +
      '<button type="button" class="proto-drawer__close" aria-label="关闭">×</button>' +
      '</div>' +
      '<div class="proto-drawer__body" id="proto-drawer-body"></div>' +
      '<div class="proto-drawer__foot">' +
      '<button type="button" class="proto-drawer__nav-btn" data-nav="prev">上一条</button>' +
      '<span class="proto-drawer__index" data-drawer-index></span>' +
      '<button type="button" class="proto-drawer__nav-btn" data-nav="next">下一条</button>' +
      '</div></aside>';
    document.body.appendChild(maskEl);

    drawerEl = maskEl.querySelector('.proto-drawer');
    maskEl.addEventListener('click', function (e) {
      if (e.target === maskEl) closeDrawer();
    });
    maskEl.querySelector('.proto-drawer__close').addEventListener('click', closeDrawer);
    maskEl.querySelector('[data-nav="prev"]').addEventListener('click', function () {
      showNote(currentIndex - 1);
    });
    maskEl.querySelector('[data-nav="next"]').addEventListener('click', function () {
      showNote(currentIndex + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && maskEl.classList.contains('is-open')) closeDrawer();
    });
  }

  function openDrawer(n, notes) {
    ensureDrawer();
    currentNotes = notes || [];
    var idx = currentNotes.findIndex(function (item) { return item.n === n; });
    showNote(idx >= 0 ? idx : 0);
    maskEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!maskEl) return;
    maskEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function showNote(idx) {
    if (!currentNotes.length) return;
    if (idx < 0) idx = 0;
    if (idx >= currentNotes.length) idx = currentNotes.length - 1;
    currentIndex = idx;
    var note = currentNotes[idx];
    var titleEl = maskEl.querySelector('#proto-drawer-title');
    titleEl.innerHTML = '<span class="proto-drawer__badge">' + note.n + '</span>' + (note.title || '注释');
    maskEl.querySelector('#proto-drawer-body').innerHTML = note.body || '';
    maskEl.querySelector('[data-drawer-index]').textContent = (idx + 1) + ' / ' + currentNotes.length;
    maskEl.querySelector('[data-nav="prev"]').disabled = idx === 0;
    maskEl.querySelector('[data-nav="next"]').disabled = idx === currentNotes.length - 1;
  }

  function findHost(el) {
    if (!el) return null;
    if (el.tagName === 'TABLE' || el.tagName === 'THEAD' || el.tagName === 'TBODY') {
      return el.closest('.q-table-wrap') || el.parentElement;
    }
    return el;
  }

  function attachMarkers(pageKey, notes) {
    if (!notes || !notes.length) return;
    notes.forEach(function (note) {
      var el = document.querySelector(note.attach);
      if (!el) return;
      var host = findHost(el);
      if (!host) return;
      if (host.querySelector('.proto-note-marker[data-note-n="' + note.n + '"]')) return;
      host.classList.add('proto-note-host');
      var marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'proto-note-marker';
      marker.setAttribute('data-note-n', String(note.n));
      marker.setAttribute('aria-label', '注释' + note.n);
      marker.textContent = String(note.n);
      marker.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openDrawer(note.n, notes);
      });
      host.appendChild(marker);
    });
  }

  function attachLegend(notes) {
    if (!notes.length || document.querySelector('.proto-notes-legend')) return;
    var legend = document.createElement('div');
    legend.className = 'proto-notes-legend';
    legend.innerHTML = '<span class="proto-note-marker">i</span><span>本页 ' + notes.length + ' 条注释 · 点击序号查看</span>';
    legend.addEventListener('click', function () { openDrawer(notes[0].n, notes); });
    document.body.appendChild(legend);
  }

  function initProtoNotes(pageKey, opts) {
    opts = opts || {};
    var key = pageKey || detectPageKey();
    if (!key || !window.PROTO_NOTE_PAGES || !window.PROTO_NOTE_PAGES[key]) return;

    var notes = window.PROTO_NOTE_PAGES[key].notes || [];

    function run() {
      attachMarkers(key, notes);
      if (!attached) {
        attachLegend(notes);
        attached = true;
      }
    }

    run();
    if (opts.retry !== false) {
      setTimeout(run, 400);
      setTimeout(run, 1200);
      setTimeout(run, 2400);
    }
  }

  window.initProtoNotes = initProtoNotes;

  function boot() {
    initProtoNotes(null, { retry: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
