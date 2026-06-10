/**
 * 小程序 · 绩效任务列表共享
 */
(function () {
  'use strict';

  var TASK_DATA = {
    current: [
      { id: 'm202605', title: '2026年5月 · 月度绩效考核', type: 'month', progress: '填写中 3/8', deadline: '2026-06-05', tag: '填写中', tagCls: 'mp-tag-blue', href: 'monthly-wizard.html' },
      { id: 'q2026q2', title: '2026 Q2 · 季度绩效考核', type: 'quarter', progress: '未开始', deadline: '2026-07-10', tag: '未开始', tagCls: 'mp-tag-gray', href: 'quarterly-wizard.html' },
    ],
    overdue: [
      {
        id: 'm202604',
        title: '2026年4月 · 月度绩效考核',
        type: 'month',
        progress: '已逾期 · 未提交 · 2/8 步',
        deadline: '已过 05-05',
        tag: '待解锁',
        tagCls: 'mp-tag-gray',
        overdueState: 'locked',
        hint: '已过截止，待 HR 解锁后方可填写',
      },
      {
        id: 'm202503',
        title: '2026年3月 · 月度绩效考核',
        type: 'month',
        progress: '已解锁 · 填写中 5/8 步',
        deadline: '已过 04-05',
        tag: '已解锁',
        tagCls: 'mp-tag-blue',
        href: 'monthly-wizard.html',
        overdueState: 'unlocked',
        hint: 'HR 已解锁，仍在逾期 Tab 展示；可断点续填',
      },
    ],
    past: [
      { id: 'm202603', title: '2026年3月 · 月度绩效考核', type: 'month', progress: '已于 03-28 提交', deadline: '—', tag: '已提交', tagCls: 'mp-tag-green', href: 'task-past-view.html?id=m202603' },
      { id: 'm202602', title: '2026年2月 · 月度绩效考核', type: 'month', progress: '已于 02-26 提交', deadline: '—', tag: '已提交', tagCls: 'mp-tag-green', href: 'task-past-view.html?id=m202602' },
    ],
  };

  var SEGMENT = [
    { key: 'current', label: '当前待办', href: 'task-list.html' },
    { key: 'overdue', label: '逾期', href: 'task-overdue.html' },
    { key: 'past', label: '过往提交', href: 'task-past.html' },
  ];

  var BANNERS = {
    current: { cls: 'mp-banner-blue', icon: '📝', text: '未过截止的任务在此填写；支持断点续填，可「复制往期」快速带入 KR。' },
    overdue: { cls: 'mp-banner-orange', icon: '⏰', text: '已过截止未提交的任务仍留本 Tab。「待解锁」不可点；「已解锁」可继续填写（与锁定态对照演示）。' },
    past: { cls: 'mp-banner-green', icon: '🔒', text: '仅可回看本人填写内容；不可见上级评分与综合结果。' },
    leader: { cls: 'mp-banner-orange', icon: '📋', text: '下属已提交的考核任务，点击进入评分。评完返回本列表。' },
  };

  /** 领导 · 待我审核（小程序：月度可评，季度提示去 OA） */
  var LEADER_REVIEW_DATA = [
    { id: 'r-wf-202605', employee: '王芳', dept: '信息部', period: '2026年5月', type: 'month', status: 'pending', submittedAt: '2026-05-28 16:20' },
    { id: 'r-lm-202605', employee: '李明', dept: '信息部', period: '2026年5月', type: 'month', status: 'scoring', submittedAt: '2026-05-27 18:05' },
    { id: 'r-zs-2026q2', employee: '赵强', dept: '信息部', period: '2026 Q2', type: 'quarter', status: 'pending', submittedAt: '2026-06-01 10:00', mpDisabled: true },
  ];

  var LEADER_STATUS = {
    pending: { label: '待评', cls: 'mp-tag-orange' },
    scoring: { label: '评分中', cls: 'mp-tag-blue' },
    done: { label: '已评', cls: 'mp-tag-green' },
  };

  function typeIcon(type) {
    return type === 'quarter' ? '季' : '月';
  }

  function renderSegment(activeKey) {
    var el = document.getElementById('mp-segment');
    if (!el) return;
    el.innerHTML = SEGMENT.map(function (s) {
      return '<a href="' + s.href + '" class="' + (s.key === activeKey ? 'is-active' : '') + '">' + s.label +
        (s.key === 'overdue' && TASK_DATA.overdue.length ? '<em class="mp-segment-badge">' + TASK_DATA.overdue.length + '</em>' : '') +
        '</a>';
    }).join('');
  }

  function renderBanner(key) {
    var el = document.getElementById('mp-banner');
    if (!el) return;
    var b = BANNERS[key];
    if (!b) { el.style.display = 'none'; return; }
    el.className = 'mp-banner ' + b.cls;
    el.innerHTML = '<span class="mp-banner-icon">' + b.icon + '</span><span>' + b.text + '</span>';
    el.style.display = '';
  }

  function renderTaskList(key) {
    var el = document.getElementById('mp-task-list');
    if (!el) return;
    var list = TASK_DATA[key] || [];
    if (!list.length) {
      el.innerHTML = '<div class="mp-empty"><div class="mp-empty-icon">📭</div><p>暂无记录</p></div>';
      return;
    }
    el.innerHTML = list.map(function (t) {
      var isLockedOverdue = key === 'overdue' && t.overdueState === 'locked';
      var canCopy = t.type === 'month' && !isLockedOverdue && (key === 'current' || (key === 'overdue' && t.overdueState === 'unlocked'));
      var copyBtn = canCopy
        ? '<button type="button" class="btn-copy-past-secondary mp-task-copy-btn" data-copy-past="month" data-storage-key="perf-monthly-miniapp" data-wizard-href="monthly-wizard.html">从往期复制</button>'
        : '';

      if (isLockedOverdue) {
        return '<div class="mp-task-card-row">' +
          '<div class="mp-task-card mp-task-card--disabled mp-task-card--overdue-locked" role="presentation">' +
          '<div class="mp-task-icon mp-task-icon--' + t.type + ' mp-task-icon--muted">' + typeIcon(t.type) + '</div>' +
          '<div class="mp-task-body">' +
          '<h4>' + t.title + '</h4>' +
          '<p class="mp-task-meta">' + t.progress + '</p>' +
          '<span class="mp-task-deadline">原截止 ' + t.deadline.replace('已过 ', '') + '</span>' +
          (t.hint ? '<span class="mp-task-hint">' + t.hint + '</span>' : '') +
          '</div>' +
          '<span class="mp-tag ' + t.tagCls + '">' + t.tag + '</span>' +
          '</div></div>';
      }

      return '<div class="mp-task-card-row">' +
        '<a class="mp-task-card' + (t.overdueState === 'unlocked' ? ' mp-task-card--overdue-unlocked' : '') + '" href="' + t.href + '">' +
        '<div class="mp-task-icon mp-task-icon--' + t.type + '">' + typeIcon(t.type) + '</div>' +
        '<div class="mp-task-body">' +
        '<h4>' + t.title + '</h4>' +
        '<p class="mp-task-meta">' + t.progress + '</p>' +
        (t.deadline !== '—' ? '<span class="mp-task-deadline">' + (t.deadline.indexOf('已过') === 0 ? '原截止 ' + t.deadline.replace('已过 ', '') : '截止 ' + t.deadline) + '</span>' : '') +
        (t.hint ? '<span class="mp-task-hint' + (t.overdueState === 'unlocked' ? ' mp-task-hint--ok' : '') + '">' + t.hint + '</span>' : '') +
        '</div>' +
        '<span class="mp-tag ' + t.tagCls + '">' + t.tag + '</span>' +
        '<span class="mp-task-arrow" aria-hidden="true">›</span></a>' +
        copyBtn +
        '</div>';
    }).join('');

    if (window.EmployeePastCopy) {
      window.EmployeePastCopy.bindCopyButtons(el, {
        storageKey: 'perf-monthly-miniapp',
        wizardHref: 'monthly-wizard.html',
        onApplied: function () { location.href = 'monthly-wizard.html'; },
      });
    }
  }

  function renderLeaderBanner() {
    var el = document.getElementById('leader-banner');
    if (!el) return;
    var b = BANNERS.leader;
    el.className = 'mp-banner ' + b.cls;
    el.innerHTML = '<span class="mp-banner-icon">' + b.icon + '</span><span>' + b.text + '</span>';
  }

  function renderLeaderReviewList() {
    var el = document.getElementById('leader-task-list');
    if (!el) return;
    var pendingCount = LEADER_REVIEW_DATA.filter(function (t) { return t.status !== 'done' && !t.mpDisabled; }).length;
    var badgeEl = document.getElementById('leader-tab-badge');
    if (badgeEl) {
      badgeEl.textContent = pendingCount;
      badgeEl.style.display = pendingCount ? 'inline-block' : 'none';
    }
    if (!LEADER_REVIEW_DATA.length) {
      el.innerHTML = '<div class="mp-empty"><div class="mp-empty-icon">📭</div><p>暂无待审核</p></div>';
      return;
    }
    el.innerHTML = LEADER_REVIEW_DATA.map(function (t) {
      var st = LEADER_STATUS[t.status] || LEADER_STATUS.pending;
      var hint = t.mpDisabled ? '季度评分请使用 OA' : (t.status === 'scoring' ? '有未提交草稿' : '待您评分');
      if (t.mpDisabled) {
        return '<div class="mp-task-card mp-task-card--disabled" role="button" tabindex="0" data-disabled-tip="季度评分请使用 OA-PC">' +
          '<div class="mp-task-icon mp-task-icon--quarter">季</div>' +
          '<div class="mp-task-body"><h4>' + t.employee + ' · ' + t.period + ' 季度</h4>' +
          '<p class="mp-task-meta">' + t.dept + ' · ' + hint + '</p></div>' +
          '<span class="mp-tag mp-tag-gray">OA</span></div>';
      }
      return '<a class="mp-task-card" href="leader-score-monthly.html?id=' + encodeURIComponent(t.id) + '">' +
        '<div class="mp-task-icon mp-task-icon--month">月</div>' +
        '<div class="mp-task-body"><h4>' + t.employee + ' · ' + t.period + ' 月度</h4>' +
        '<p class="mp-task-meta">' + t.dept + ' · ' + hint + '</p>' +
        '<span class="mp-task-deadline">提交 ' + t.submittedAt.replace(/^2026-/, '') + '</span></div>' +
        '<span class="mp-tag ' + st.cls + '">' + st.label + '</span>' +
        '<span class="mp-task-arrow" aria-hidden="true">›</span></a>';
    }).join('');

    el.querySelectorAll('.mp-task-card--disabled').forEach(function (card) {
      function tip() { alert(card.dataset.disabledTip || '请使用 OA 评分'); }
      card.addEventListener('click', tip);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter') tip(); });
    });
  }

  function switchRoleTab(role) {
    document.querySelectorAll('#role-tabs button').forEach(function (t) {
      t.classList.toggle('is-active', t.dataset.role === role);
    });
    var emp = role === 'employee';
    var empPanel = document.getElementById('employee-panel');
    var leadPanel = document.getElementById('leader-panel');
    if (empPanel) empPanel.style.display = emp ? '' : 'none';
    if (leadPanel) leadPanel.style.display = emp ? 'none' : '';
    var subTitle = document.getElementById('mp-page-title');
    if (subTitle) subTitle.textContent = emp ? (window.__mpPageTitle || '绩效') : '待我审核';
  }

  function initMpTaskPage(activeKey, title) {
    window.__mpPageTitle = title || '绩效';
    renderMpTabbar('home');
    var subTitle = document.getElementById('mp-page-title');
    if (subTitle) subTitle.textContent = window.__mpPageTitle;
    renderSegment(activeKey);
    renderBanner(activeKey);
    renderTaskList(activeKey);
    renderLeaderBanner();
    renderLeaderReviewList();

    document.querySelectorAll('#role-tabs button').forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchRoleTab(tab.dataset.role);
      });
    });

    var params = new URLSearchParams(location.search);
    if (params.get('tab') === 'leader') {
      switchRoleTab('leader');
    }
  }

  window.initMpTaskPage = initMpTaskPage;
  window.MP_TASK_DATA = TASK_DATA;
  window.MP_LEADER_REVIEW_DATA = LEADER_REVIEW_DATA;
})();
