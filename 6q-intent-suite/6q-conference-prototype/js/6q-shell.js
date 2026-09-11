/**
 * 6Q 后台 · 统一壳层（支持会务详情 / 会务工具）
 */
(function () {
  "use strict";

  var PAGE = document.body.getAttribute("data-cf-page") || "basic";
  var TOOL_PAGE = document.body.getAttribute("data-tool-page") || "";
  var SHELL = document.body.getAttribute("data-shell") || "";

  var SUB_NAV = [
    { id: "basic", href: "conference-detail-basic.html", label: "基础信息" },
    { id: "enroll", href: "#", label: "报读记录", disabled: true },
    { id: "students", href: "#", label: "学员信息", disabled: true },
    { id: "courseware", href: "#", label: "课件管理", disabled: true },
    { id: "checkin", href: "#", label: "签到管理", disabled: true },
    { id: "group", href: "#", label: "分组管理", disabled: true },
    { id: "seat", href: "#", label: "座位管理", disabled: true },
    { id: "staff", href: "#", label: "工作人员名单", disabled: true },
    { id: "mentor", href: "#", label: "导师名单", disabled: true },
    { id: "supervisor", href: "#", label: "督导名单", disabled: true },
    { id: "survey", href: "#", label: "调查问卷", disabled: true },
    { id: "sales", href: "#", label: "会销管理", disabled: true },
    { id: "purchase", href: "#", label: "学员购课", disabled: true },
    { id: "cert", href: "#", label: "学员证书", disabled: true },
    { id: "approval", href: "#", label: "审批管理", disabled: true },
    { id: "briefing", href: "#", label: "事业说明会", disabled: true },
    { id: "followup", href: "#", label: "跟进记录", disabled: true },
    {
      id: "intent-strategy",
      href: "conference-intent-strategy.html",
      label: "本期分析策略",
      isNew: true,
    },
    {
      id: "intent",
      href: "conference-student-intent.html",
      label: "学员意向分析",
      isNew: true,
    },
  ];

  var TOOLS_NAV = [
    { href: "#", label: "场地管理", disabled: true },
    { href: "#", label: "营地管理", disabled: true },
    { href: "#", label: "人员岗位管理", disabled: true },
    { href: "#", label: "岗位模板", disabled: true },
    { href: "#", label: "证书管理", disabled: true },
    { href: "#", label: "胸牌管理", disabled: true },
    { href: "#", label: "问卷模板", disabled: true },
    { href: "#", label: "会销模板管理", disabled: true },
    { href: "#", label: "课件模板", disabled: true },
    { href: "#", label: "导师课程素材管理", disabled: true },
    { href: "#", label: "招生标准配置", disabled: true },
    { href: "#", label: "岗位工作模板", disabled: true },
    { href: "#", label: "岗位积分规则", disabled: true },
    { href: "#", label: "标签分类", disabled: true },
    { href: "#", label: "标签管理", disabled: true },
    { href: "#", label: "跟进示例", disabled: true },
    { href: "#", label: "设备管理", disabled: true },
    {
      id: "intent-template",
      href: "tools-intent-strategy-template.html",
      label: "分析策略模板",
      isNew: true,
    },
  ];

  var MEMBER_SUBNAV = [
    { label: "基础信息", disabled: true },
    { label: "用户档案", current: true, isNew: true },
    { label: "学习档案", disabled: true },
    { label: "家庭组", disabled: true },
    { label: "课程资格", disabled: true },
    { label: "订单记录", disabled: true },
    { label: "关联账号", disabled: true },
    { label: "关系历史", disabled: true },
    { label: "反馈记录", disabled: true },
    { label: "跟进记录", disabled: true },
  ];

  function renderTopbar(activeModule) {
    var el = document.getElementById("q-topbar-mount");
    if (!el) return;
    el.classList.add("q-topbar");
    var mods = [
      { name: "6Q业务", key: "biz", href: "conference-student-profile.html?id=m10009" },
      { name: "社区直播", key: "live" },
      { name: "排课管理", key: "schedule" },
      { name: "意向导师管理", key: "mentor" },
      { name: "传播天使管理", key: "angel" },
      { name: "计划与实施", key: "plan", href: "conference-detail-basic.html" },
      { name: "积分管理", key: "points" },
    ];
    el.innerHTML =
      '<div class="q-topbar__brand">' +
      '<span class="q-topbar__logo" aria-hidden="true"></span>' +
      "6Q 后台管理系统" +
      '<span class="q-topbar__switch">切换系统</span>' +
      "</div>" +
      '<nav class="q-topbar__modules" aria-label="模块">' +
      mods
        .map(function (m) {
          return (
            '<a href="' +
            (m.href || "#") +
            '"' +
            (m.key === activeModule ? ' class="is-active"' : "") +
            ">" +
            m.name +
            "</a>"
          );
        })
        .join("") +
      "</nav>" +
      '<div class="q-topbar__right">' +
      '<span aria-hidden="true">⬇</span>' +
      '<span><span class="q-avatar">余</span> 余玲玲</span>' +
      '<span aria-hidden="true">⚙</span>' +
      "</div>";
  }

  function renderSidenavConference() {
    var el = document.getElementById("q-sidenav-mount");
    if (!el) return;
    el.innerHTML =
      '<a class="q-sidenav__item" href="versions.html">首页</a>' +
      '<p class="q-sidenav__group-title">线下课程会务</p>' +
      '<a class="q-sidenav__item is-active" href="conference-detail-basic.html">课程会务</a>' +
      '<a class="q-sidenav__item" href="#">学习档案</a>' +
      '<a class="q-sidenav__item" href="#">积分记录</a>' +
      '<a class="q-sidenav__item" href="#">一办三团招募</a>' +
      '<a class="q-sidenav__item" href="#">学习修练活动</a>' +
      '<details class="q-sidenav__details" open>' +
      '<summary class="q-sidenav__item q-sidenav__summary">会务工具</summary>' +
      '<div class="q-sidenav__sub">' +
      TOOLS_NAV.map(function (item) {
        if (item.disabled) {
          return (
            '<span class="q-sidenav__sub-item is-disabled">' + item.label + "</span>"
          );
        }
        var cls = item.id === TOOL_PAGE ? " is-active" : "";
        var tag = item.isNew ? ' <span class="q-sidenav__new">新</span>' : "";
        return (
          '<a class="q-sidenav__sub-item' +
          cls +
          '" href="' +
          item.href +
          '">' +
          item.label +
          tag +
          "</a>"
        );
      }).join("") +
      "</div></details>";
  }

  function renderSidenavTools() {
    var el = document.getElementById("q-sidenav-mount");
    if (!el) return;
    el.innerHTML =
      '<a class="q-sidenav__item" href="versions.html">首页</a>' +
      '<p class="q-sidenav__group-title">线下课程会务</p>' +
      '<a class="q-sidenav__item" href="conference-detail-basic.html">课程会务</a>' +
      '<a class="q-sidenav__item" href="#">学习档案</a>' +
      '<a class="q-sidenav__item" href="#">积分记录</a>' +
      '<a class="q-sidenav__item" href="#">一办三团招募</a>' +
      '<a class="q-sidenav__item" href="#">学习修练活动</a>' +
      '<details class="q-sidenav__details" open>' +
      '<summary class="q-sidenav__item q-sidenav__summary is-active-group">会务工具</summary>' +
      '<div class="q-sidenav__sub">' +
      TOOLS_NAV.map(function (item) {
        if (item.disabled) {
          return (
            '<span class="q-sidenav__sub-item is-disabled">' + item.label + "</span>"
          );
        }
        var cls = item.id === TOOL_PAGE ? " is-active" : "";
        var tag = item.isNew ? ' <span class="q-sidenav__new">新</span>' : "";
        return (
          '<a class="q-sidenav__sub-item' +
          cls +
          '" href="' +
          item.href +
          '">' +
          item.label +
          tag +
          "</a>"
        );
      }).join("") +
      "</div></details>";
  }

  function renderDocTabs(isTools) {
    var el = document.getElementById("q-doc-tabs-mount");
    if (!el) return;
    if (isTools) {
      el.innerHTML =
        '<a href="#">首页</a>' +
        '<a href="#" class="is-active">配置管理</a>' +
        '<a href="#">计划管理</a>' +
        '<a href="conference-detail-basic.html">课程会务</a>';
      return;
    }
    el.innerHTML =
      '<a href="#">首页</a>' +
      '<a href="#">配置管理</a>' +
      '<a href="#">计划管理</a>' +
      '<a href="#" class="is-active">课程会务</a>';
  }

  function renderSubnav() {
    var el = document.getElementById("q-subnav-mount");
    if (!el) return;
    el.innerHTML = SUB_NAV.map(function (item) {
      var cls = item.id === PAGE ? " is-active" : "";
      var extra = item.isNew ? " is-new" : "";
      if (item.disabled) {
        return (
          '<span style="display:block;padding:10px 16px 10px 20px;color:rgba(0,0,0,.25);font-size:13px;cursor:not-allowed">' +
          item.label +
          "</span>"
        );
      }
      return (
        '<a href="' +
        item.href +
        '" class="' +
        cls.trim() +
        extra +
        '">' +
        item.label +
        "</a>"
      );
    }).join("");
  }

  function renderSidenavMember() {
    var el = document.getElementById("q-sidenav-mount");
    if (!el) return;
    var groups = [
      { label: "工作台", disabled: true },
      { label: "组织架构管理", disabled: true },
    ];
    el.innerHTML =
      groups
        .map(function (g) {
          return '<span class="q-sidenav__item is-disabled-nav">' + g.label + "</span>";
        })
        .join("") +
      '<details class="q-sidenav__details" open>' +
      '<summary class="q-sidenav__item q-sidenav__summary is-active-group">用户管理</summary>' +
      '<div class="q-sidenav__sub">' +
      '<a class="q-sidenav__sub-item is-active" href="#">会员管理</a>' +
      '<span class="q-sidenav__sub-item is-disabled">会员意愿</span>' +
      '<span class="q-sidenav__sub-item is-disabled">家庭组</span>' +
      '<span class="q-sidenav__sub-item is-disabled">关联账号</span>' +
      '<span class="q-sidenav__sub-item is-disabled">关系图谱</span>' +
      '<span class="q-sidenav__sub-item is-disabled">跟进记录</span>' +
      "</div></details>" +
      [
        "礼包管理",
        "部门管理",
        "线下课程管理",
        "书籍管理",
        "线上课程管理",
        "6Q商城",
        "订单中心",
        "资格中心",
        "营销管理",
        "运营管理",
        "反馈管理",
        "数据管理",
        "审批管理",
        "设置",
      ]
        .map(function (name) {
          return '<span class="q-sidenav__item is-disabled-nav">' + name + "</span>";
        })
        .join("");
  }

  function renderDocTabsMember() {
    var el = document.getElementById("q-doc-tabs-mount");
    if (!el) return;
    el.innerHTML =
      '<a href="#">首页</a>' +
      '<a href="#" class="is-active">用户管理</a>' +
      '<a href="#">会员管理</a>';
  }

  function renderMemberSubnav() {
    var el = document.getElementById("q-subnav-mount");
    if (!el) return;
    el.classList.add("q-subnav--member");
    el.innerHTML = MEMBER_SUBNAV.map(function (item) {
      var extra = item.isNew ? " is-new" : "";
      if (item.current) {
        return (
          '<a href="#" class="is-active' +
          extra +
          '">' +
          item.label +
          "</a>"
        );
      }
      return '<span class="q-subnav__disabled">' + item.label + "</span>";
    }).join("");
  }

  var isTools = PAGE === "tools" || TOOL_PAGE;
  var isMember = SHELL === "member";

  if (isMember) {
    renderTopbar("biz");
    renderSidenavMember();
    renderDocTabsMember();
    renderMemberSubnav();
  } else {
    renderTopbar("plan");
    if (isTools) {
      renderSidenavTools();
      renderDocTabs(true);
    } else {
      renderSidenavConference();
      renderDocTabs(false);
      renderSubnav();
    }
  }
})();
