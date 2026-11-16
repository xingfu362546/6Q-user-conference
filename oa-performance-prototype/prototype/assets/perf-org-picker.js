/**
 * 组织架构选人（单选）。用于评价人维护指定上级 / 分管。
 * 数据取 PerfHrStore.PEOPLE，按部门分组；选中后回传工号，页面不需要手输。
 */
(function () {
  'use strict';

  var state = { dept: '', kw: '', picked: '', excludeNo: '', allowClear: false, onPick: null };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function people() {
    return (window.PerfHrStore && PerfHrStore.PEOPLE) || [];
  }

  function depts() {
    var seen = [];
    people().forEach(function (p) {
      if (seen.indexOf(p.org) < 0) seen.push(p.org);
    });
    return seen;
  }

  function personOf(no) {
    var hit = null;
    people().forEach(function (p) { if (p.no === no) hit = p; });
    return hit;
  }

  function matches(p) {
    if (state.dept && p.org !== state.dept) return false;
    var kw = state.kw.trim().toLowerCase();
    if (!kw) return true;
    return [p.name, p.no, p.org, p.role, p.level].join(' ').toLowerCase().indexOf(kw) >= 0;
  }

  function close() {
    var old = document.getElementById('perf-org-picker-mask');
    if (old) old.remove();
  }

  function renderList(host) {
    var list = people().filter(matches);
    var picked = personOf(state.picked);
    var rows = list.map(function (p) {
      var disabled = p.no === state.excludeNo;
      var on = p.no === state.picked;
      return '<button type="button" class="perf-pick-row' + (on ? ' is-on' : '') + (disabled ? ' is-disabled' : '') + '"' +
        (disabled ? ' disabled' : '') + ' data-pick-no="' + esc(p.no) + '">' +
        '<span class="perf-pick-radio" aria-hidden="true"></span>' +
        '<span class="perf-pick-main"><b>' + esc(p.name) + '</b><span class="perf-pick-sub">' + esc(p.no) + ' · ' + esc(p.org) + '</span></span>' +
        '<span class="perf-pick-meta">' + esc(p.level) + ' · ' + esc(p.role) + '</span>' +
        (disabled ? '<span class="perf-pick-note">本人</span>' : '') +
        '</button>';
    }).join('') || '<p class="perf-pick-empty">没有匹配的人员</p>';
    host.innerHTML = '<div class="perf-pick-list-head">' + (state.dept || '全部人员') + '<span class="muted">（' + list.length + '）</span></div>' +
      '<div class="perf-pick-list">' + rows + '</div>' +
      '<div class="perf-pick-foot">' +
      '<span class="perf-pick-current">已选：' + (picked ? '<b>' + esc(picked.name) + '</b> ' + esc(picked.no) : '<span class="muted">未选择</span>') + '</span>' +
      '<span class="perf-pick-actions">' +
      (state.allowClear ? '<button type="button" class="q-btn" data-pick-clear="1">清除</button>' : '') +
      '<button type="button" class="q-btn" data-pick-cancel="1">取消</button>' +
      '<button type="button" class="q-btn q-btn-primary" data-pick-ok="1"' + (state.picked ? '' : ' disabled') + '>确定</button>' +
      '</span></div>';
  }

  function paint() {
    var mask = document.getElementById('perf-org-picker-mask');
    if (!mask) return;
    var deptHost = mask.querySelector('#perf-pick-depts');
    var listHost = mask.querySelector('#perf-pick-panel');
    if (deptHost) {
      var list = depts();
      deptHost.innerHTML = '<button type="button" class="perf-pick-dept' + (state.dept ? '' : ' is-on') + '" data-dept="">全部人员</button>' +
        list.map(function (name) {
          return '<button type="button" class="perf-pick-dept' + (state.dept === name ? ' is-on' : '') + '" data-dept="' + esc(name) + '">' + esc(name) + '</button>';
        }).join('');
    }
    if (listHost) renderList(listHost);
  }

  function open(opts) {
    opts = opts || {};
    state.dept = '';
    state.kw = '';
    state.picked = opts.selectedNo || '';
    state.excludeNo = opts.excludeNo || '';
    state.allowClear = !!opts.allowClear;
    state.onPick = opts.onPick || null;
    close();
    var mask = document.createElement('div');
    mask.id = 'perf-org-picker-mask';
    mask.className = 'perf-pick-mask';
    mask.innerHTML =
      '<div class="perf-pick-panel" role="dialog" aria-label="选择人员">' +
      '<div class="perf-pick-head"><div>' +
      '<h3>' + esc(opts.title || '选择人员') + '</h3>' +
      (opts.subtitle ? '<p class="perf-pick-tip">' + esc(opts.subtitle) + '</p>' : '') +
      '</div><button type="button" class="hr-transfer-modal__close" data-pick-cancel="1" aria-label="关闭">×</button></div>' +
      '<div class="perf-pick-body">' +
      '<div class="perf-pick-tree">' +
      '<div class="perf-pick-search"><input type="search" id="perf-pick-kw" placeholder="姓名 / 工号 / 部门 / 岗位" /></div>' +
      '<div class="perf-pick-depts" id="perf-pick-depts"></div></div>' +
      '<div class="perf-pick-right" id="perf-pick-panel"></div>' +
      '</div></div>';
    document.body.appendChild(mask);
    paint();

    mask.querySelector('#perf-pick-kw').addEventListener('input', function (e) {
      state.kw = e.target.value || '';
      paint();
      var input = document.getElementById('perf-pick-kw');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    });
    mask.addEventListener('click', function (e) {
      var deptBtn = e.target.closest('[data-dept]');
      if (deptBtn) { state.dept = deptBtn.getAttribute('data-dept'); paint(); return; }
      var row = e.target.closest('[data-pick-no]');
      if (row && !row.disabled) {
        state.picked = row.getAttribute('data-pick-no');
        paint();
        return;
      }
      if (e.target.closest('[data-pick-clear]')) {
        if (state.onPick) state.onPick(null);
        close();
        return;
      }
      if (e.target.closest('[data-pick-cancel]') || e.target === mask) { close(); return; }
      if (e.target.closest('[data-pick-ok]')) {
        if (!state.picked) return;
        if (state.onPick) state.onPick(personOf(state.picked));
        close();
      }
    });
  }

  window.PerfOrgPicker = { open: open, close: close };
})();
