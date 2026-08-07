/**
 * 用户标签后台 — 统一顶栏 + 侧栏（全站菜单一致，仅内容区各页不同）
 */
(function () {
  "use strict";

  var PAGE = document.body.getAttribute("data-ut-page") || "";

  var TOP_MODULES = [
    { id: "tag", href: "tag-list.html", label: "标签中心", pages: ["tag-list", "tag-create", "tag-history"] },
    { id: "data", href: "data-tables.html", label: "数据资产", pages: ["data-tables", "data-access"] },
  ];

  var SIDE_NAV = [
    {
      group: "标签中心",
      items: [
        { id: "tag-list", href: "tag-list.html", label: "标签管理" },
        { id: "tag-create", href: "tag-create.html", label: "新增标签" },
        { id: "tag-history", href: "tag-history.html", label: "执行历史" },
      ],
    },
    {
      group: "数据资产",
      items: [
        { id: "data-tables", href: "data-tables.html", label: "数据表管理" },
        { id: "data-access", href: "data-access.html", label: "数据接入" },
      ],
    },
  ];

  function isTopActive(mod) {
    return mod.pages.indexOf(PAGE) !== -1;
  }

  function renderTopbar() {
    var mount = document.getElementById("ut-topbar-mount");
    if (!mount) return;
    var nav = TOP_MODULES.map(function (m) {
      var cls = isTopActive(m) ? " is-active" : "";
      return '<a href="' + m.href + '" class="' + cls.trim() + '">' + m.label + "</a>";
    }).join("");
    mount.innerHTML =
      '<div class="ut-topbar__brand">' +
      '<span class="ut-topbar__logo" aria-hidden="true"></span>' +
      "用户标签平台</div>" +
      '<nav class="ut-topbar__nav" aria-label="模块">' +
      nav +
      "</nav>" +
      '<div class="ut-topbar__tools">' +
      '<a class="ut-topbar__link" href="home.html">原型导航</a>' +
      '<span class="ut-user"><span class="ut-avatar">李</span>李明</span>' +
      "</div>";
  }

  function renderSidebar() {
    var mount = document.getElementById("ut-side-mount");
    if (!mount) return;
    var html = "";
    SIDE_NAV.forEach(function (section, idx) {
      if (idx > 0) {
        html += '<p class="ut-side__title ut-side__title--gap">' + section.group + "</p>";
      } else {
        html += '<p class="ut-side__title">' + section.group + "</p>";
      }
      section.items.forEach(function (item) {
        var cls = item.id === PAGE ? " is-active" : "";
        var aria = item.id === PAGE ? ' aria-current="page"' : "";
        html +=
          '<a href="' +
          item.href +
          '" class="ut-side__link' +
          cls +
          '"' +
          aria +
          ">" +
          '<span class="ut-side__icon" aria-hidden="true"></span>' +
          item.label +
          "</a>";
      });
    });
    mount.outerHTML =
      '<aside class="ut-side" id="ut-side-mount" aria-label="主导航">' + html + "</aside>";
  }

  renderTopbar();
  renderSidebar();
})();
