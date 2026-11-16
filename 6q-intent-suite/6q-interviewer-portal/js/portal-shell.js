/**
 * 面谈官门户顶栏
 */
(function (global) {
  function mount(opts) {
    opts = opts || {};
    var el = document.querySelector(opts.containerSelector || "#portal-topbar");
    if (!el || !global.InterviewerAuth) return;

    var session = InterviewerAuth.getSession();
    var conf = InterviewerAuth.getConference();
    var showSwitch = opts.active !== "select" || !!conf;

    var confText = conf
      ? '<strong>' +
        escapeHtml(conf.periodLabel || "") +
        "</strong> · " +
        escapeHtml(conf.title || "") +
        ' <span>(' +
        escapeHtml(conf.city || "") +
        ")</span>"
      : "<span>未选择会务</span>";

    el.innerHTML =
      '<a class="iv-topbar__brand" href="hub.html">' +
      "6Q面谈官" +
      '<span class="iv-topbar__badge">v1.2.3</span></a>' +
      '<div class="iv-topbar__conf">' +
      confText +
      "</div>" +
      '<div class="iv-topbar__actions">' +
      (session
        ? '<span class="iv-topbar__user">' +
          escapeHtml(session.displayName || "") +
          "</span>"
        : "") +
      (showSwitch
        ? '<a class="iv-btn iv-btn--ghost" href="conference-select.html">切换会务</a>'
        : "") +
      '<button type="button" class="iv-btn" id="ivLogoutBtn">退出</button>' +
      "</div>";

    var btn = document.getElementById("ivLogoutBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        InterviewerAuth.logout();
        location.href = "login.html";
      });
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  global.InterviewerShell = { mount: mount };
})(typeof window !== "undefined" ? window : globalThis);
