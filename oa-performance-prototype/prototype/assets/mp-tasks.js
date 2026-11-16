/**
 * 小程序 · 领导待我审核（v1.5.0）
 * 纯领导端：月/季评分 + 改核定总分 + 确认；员工填表/待办在 OA。
 * 列表与 OA supervisor-review-list 同源 REVIEW_LIST + DEPT_ROSTER。
 */
(function () {
  'use strict';

  var BANNER = {
    cls: 'mp-banner-orange',
    icon: '📋',
    text: 'v1.5 · 小程序仅<strong>领导/分管</strong>：待我审核 → 月/季评分 → 确认。员工填表、进度、自填回看与确认请用 <strong>OA 个人中心</strong>。',
  };

  function SS() { return window.SupervisorScore; }
  function W() { return window.PerfWorkflow; }

  function phaseOpts(t) {
    return { compact: true, task: { type: t.type, mergedReview: t.mergedReview } };
  }

  function typeIcon(type) { return type === 'quarter' ? '季' : '月'; }

  function primaryHref(item) {
    var SS_ = SS();
    if (!SS_) return '#';
    var t = item.reviewTask;
    var r = item.roster;
    if (t && (t.phase === 'pending_confirm' || (r && r.phase === 'pending_confirm'))) {
      return SS_.confirmHrefForTask(t || { id: r.taskId, type: r.taskType || 'month' }, 'leader');
    }
    if (t && t.type === 'quarter') {
      if (t.phase === 'pending_division' || (r && r.phase === 'pending_division' && r.supervisorDone)) {
        return SS_.scoreHrefForTask(t, 'division');
      }
      if (t.status !== 'done' && t.phase !== 'pending_confirm') {
        return SS_.scoreHrefForTask(t, 'supervisor');
      }
    }
    if (t && t.status !== 'done') {
      return SS_.scoreHrefForTask(t, 'supervisor');
    }
    if (r && r.taskId && r.phase === 'pending_supervisor') {
      return SS_.scoreHrefForTask(t || { id: r.taskId, type: r.taskType || 'month' }, 'supervisor');
    }
    if (t) return SS_.scoreHrefForTask(t, 'supervisor');
    return '#';
  }

  function actionLabel(item) {
    var t = item.reviewTask;
    var r = item.roster;
    if (t && t.phase === 'pending_confirm') return '待员工确认';
    if (r && r.phase === 'pending_confirm') return '待员工确认';
    if (t && t.type === 'quarter' && (t.phase === 'pending_division' || (r && r.phase === 'pending_division'))) return '待分管评';
    if (t && t.status === 'scoring') return '继续评分';
    if (t && t.status === 'pending') return '待上级评';
    if (r && r.phase === 'pending_supervisor') return '待上级评';
    return '查看';
  }

  function tagCls(label) {
    if (label === '待员工确认' || label === '待确认') return 'mp-tag-orange';
    if (label === '待分管评') return 'mp-tag-blue';
    if (label === '继续评分') return 'mp-tag-blue';
    return 'mp-tag-orange';
  }

  function renderBanner() {
    var el = document.getElementById('mp-banner');
    if (!el) return;
    el.className = 'mp-banner ' + BANNER.cls;
    el.innerHTML = '<span class="mp-banner-icon">' + BANNER.icon + '</span><span>' + BANNER.text + '</span>';
  }

  function renderLeaderTaskList() {
    var el = document.getElementById('mp-leader-list');
    if (!el || !SS()) return;
    var rows = SS().buildUnifiedReviewRows();
    var pending = rows.filter(function (item) {
      var t = item.reviewTask;
      var r = item.roster;
      if (t && (t.status !== 'done' || t.phase === 'pending_confirm')) return true;
      if (r && (r.phase === 'pending_supervisor' || r.phase === 'pending_division' || r.phase === 'pending_confirm')) return true;
      return false;
    });
    if (!pending.length) {
      el.innerHTML = '<div class="mp-empty"><div class="mp-empty-icon">✅</div><p>暂无待办</p><p class="muted" style="font-size:12px">演示：切换 REVIEW_LIST 中 pending 任务可见卡片</p></div>';
      return;
    }
    el.innerHTML = pending.map(function (item) {
      var t = item.reviewTask;
      var r = item.roster;
      var name = (t && t.employee) || (r && r.name) || '—';
      var period = (t && t.period) || (r && r.period) || '';
      var type = (t && t.type) || (r && r.taskType) || 'month';
      var dept = (t && t.dept) || (r && r.dept) || '';
      var label = actionLabel(item);
      var href = primaryHref(item);
      var steps = '';
      if (t && t.phase && W()) steps = W().renderPhaseSteps(t.phase, phaseOpts(t));
      else if (r && r.phase && W()) steps = W().renderPhaseSteps(r.phase, { compact: true, task: { type: type, mergedReview: r.mergedReview } });
      return '<div class="mp-task-card-row"><a class="mp-task-card" href="' + href + '">' +
        '<div class="mp-task-icon mp-task-icon--' + type + '">' + typeIcon(type) + '</div>' +
        '<div class="mp-task-body"><h4>' + name + ' · ' + period + '</h4>' +
        '<p class="mp-task-meta">' + dept + ' · ' + label + '</p>' + steps + '</div>' +
        '<span class="mp-tag ' + tagCls(label) + '">' + label + '</span>' +
        '<span class="mp-task-arrow">›</span></a></div>';
    }).join('');
  }

  function updateBadge() {
    var n = SS() ? SS().countLeaderPending() : 0;
    var badge = document.getElementById('mp-leader-badge');
    if (badge) {
      badge.textContent = String(n);
      badge.style.display = n > 0 ? 'inline-block' : 'none';
    }
    var frameBadge = document.querySelector('.mp-grid-item[href="task-list.html"] .mp-icon-badge');
    if (frameBadge) frameBadge.textContent = String(n);
  }

  function initMpLeaderTaskPage(title) {
    window.__SUPERVISOR_SCORE_PLATFORM = 'miniapp';
    renderMpTabbar('home');
    var subTitle = document.getElementById('mp-page-title');
    if (subTitle) subTitle.textContent = title || '待我审核';
    renderBanner();
    renderLeaderTaskList();
    updateBadge();
  }

  window.initMpLeaderTaskPage = initMpLeaderTaskPage;
  window.MpTasks = { initMpLeaderTaskPage: initMpLeaderTaskPage, renderLeaderTaskList: renderLeaderTaskList };
})();
