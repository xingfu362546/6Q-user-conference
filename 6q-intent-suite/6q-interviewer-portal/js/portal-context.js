/**
 * 面谈官门户 · 会务头图 / 登录会员卡 / 业务 Tab（v1.2.4）
 */
(function (global) {
  var TABS = [
    { id: "students", label: "学员列表", href: "students.html" },
    { id: "intent", label: "本期学员意向一览", href: "student-intent.html" },
    { id: "qa", label: "答疑管理", href: "tab-placeholder.html?tab=qa" },
    { id: "interview", label: "面谈管理", href: "tab-placeholder.html?tab=interview" },
    { id: "followup", label: "跟进记录", href: "tab-placeholder.html?tab=followup" },
    { id: "survey", label: "意向调研", href: "tab-placeholder.html?tab=survey" },
  ];

  var TAB_META = {
    qa: { title: "答疑管理", desc: "会务现场答疑登记与处理。内容来自 v3.4.7 原型「会务详情 · 答疑管理」。", axureTab: "答疑管理" },
    interview: { title: "面谈管理", desc: "面谈官排期与面谈记录。内容来自 v3.4.7 原型「会务详情 · 面谈管理」。", axureTab: "面谈管理" },
    followup: { title: "跟进记录", desc: "本期会务跟进只读聚合。内容来自 v3.4.7 原型「会务详情 · 跟进记录」。", axureTab: "跟进记录" },
    survey: { title: "意向调研", desc: "会务意向调研问卷与回收。内容来自 v3.4.7 原型「会务详情 · 意向调研」。", axureTab: "意向调研" },
  };

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatTimeRange(conf) {
    if (!conf) return "—";
    if (conf.timeRange) return conf.timeRange;
    if (conf.startTime && conf.endTime) return conf.startTime + "至" + conf.endTime;
    if (conf.startTime) return conf.startTime;
    return "—";
  }

  function roleText(session) {
    if (!session) return "—";
    if (Array.isArray(session.roles) && session.roles.length) {
      return session.roles.join("、");
    }
    return "面谈官";
  }

  function renderMemberCard(target, session) {
    var el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    var name = (session && session.displayName) || "未登录";
    var roles = roleText(session);
    el.innerHTML =
      '<div class="iv-member-card" aria-label="当前登录会员">' +
      '<div class="iv-member-card__avatar" aria-hidden="true">' +
      escapeHtml(String(name).slice(0, 1)) +
      "</div>" +
      '<div class="iv-member-card__body">' +
      '<div class="iv-member-card__name">' +
      escapeHtml(name) +
      "</div>" +
      '<div class="iv-member-card__role">岗位：' +
      escapeHtml(roles) +
      "</div>" +
      "</div></div>";
  }

  function renderConferenceMeta(target, conf) {
    var el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    el.innerHTML =
      '<div class="iv-conf-meta">' +
      '<p class="iv-conf-meta__row"><span class="iv-conf-meta__label">开课时间：</span>' +
      escapeHtml(formatTimeRange(conf)) +
      "</p>" +
      '<p class="iv-conf-meta__row"><span class="iv-conf-meta__label">开课地址：</span>' +
      escapeHtml((conf && conf.address) || "—") +
      "</p>" +
      "</div>";
  }

  function renderTabs(target, activeId) {
    var el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    var html = '<nav class="iv-tabs" aria-label="会务业务导航">';
    TABS.forEach(function (tab) {
      var active = tab.id === activeId;
      html +=
        '<a class="iv-tabs__item' +
        (active ? " is-active" : "") +
        '" href="' +
        escapeHtml(tab.href) +
        '"' +
        (active ? ' aria-current="page"' : "") +
        ">" +
        escapeHtml(tab.label) +
        "</a>";
    });
    html += "</nav>";
    el.innerHTML = html;
  }

  function mountWorkspace(opts) {
    opts = opts || {};
    var auth = global.InterviewerAuth;
    if (!auth) return null;
    var session = auth.getSession();
    var conf = auth.getConference();
    if (opts.memberSelector) renderMemberCard(opts.memberSelector, session);
    if (opts.metaSelector) renderConferenceMeta(opts.metaSelector, conf);
    if (opts.tabsSelector) renderTabs(opts.tabsSelector, opts.activeTab || "intent");
    return { session: session, conf: conf };
  }

  function placeholderCopy(tabKey) {
    return TAB_META[tabKey] || {
      title: "功能占位",
      desc: "本页为面谈官门户导航占位，后续迭代接入。",
    };
  }

  // 共享意向列表在点击时显式补齐会务路由，避免档案读取残留会务选择。
  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[href*="student-profile.html"]');
    var conf = global.InterviewerAuth && global.InterviewerAuth.getConference();
    if (!link || !conf) return;
    var url = new URL(link.href, location.href);
    url.searchParams.set("from", "conference"); url.searchParams.set("conferenceId", conf.id);
    if (link.matches(".intent-student__link")) url.searchParams.set("profileSource", "intent");
    link.href = url.href;
  }, true);

  global.InterviewerPortalContext = {
    TABS: TABS,
    mountWorkspace: mountWorkspace,
    renderMemberCard: renderMemberCard,
    renderConferenceMeta: renderConferenceMeta,
    renderTabs: renderTabs,
    formatTimeRange: formatTimeRange,
    placeholderCopy: placeholderCopy,
  };
})(typeof window !== "undefined" ? window : globalThis);
