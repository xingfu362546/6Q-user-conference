/**
 * 画像档案 · 近期行为四 Tab + 查看更多抽屉；跟进记录查看更多
 */
(function (global) {
  "use strict";

  var PREVIEW_N = 5;

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function tableWrap(headers, rowsHtml, emptyText) {
    if (!rowsHtml) {
      return '<p class="pf-muted" style="padding:12px 0">' + esc(emptyText || "暂无记录") + "</p>";
    }
    return (
      '<div class="pf-detail-table-wrap"><table class="pf-table pf-detail-table"><thead><tr>' +
      headers
        .map(function (h) {
          return "<th>" + esc(h) + "</th>";
        })
        .join("") +
      "</tr></thead><tbody>" +
      rowsHtml +
      "</tbody></table></div>"
    );
  }

  function communityRows(list) {
    return (list || [])
      .map(function (r, i) {
        return (
          "<tr><td>" +
          (i + 1) +
          "</td><td>" +
          esc(r.topic) +
          "</td><td>" +
          esc(r.content) +
          "</td><td>" +
          esc(r.time) +
          "</td></tr>"
        );
      })
      .join("");
  }

  function learnRows(list) {
    return (list || [])
      .map(function (r) {
        return (
          "<tr><td>" +
          esc(r.course) +
          "</td><td>" +
          r.count +
          "</td><td>" +
          esc(r.updatedAt) +
          "</td></tr>"
        );
      })
      .join("");
  }

  function videoRows(list) {
    return (list || [])
      .map(function (r) {
        return (
          "<tr><td>" +
          esc(r.title) +
          '</td><td class="pf-mono">' +
          esc(r.id) +
          "</td><td>" +
          esc(r.tags) +
          "</td><td>" +
          esc(r.watchedAt) +
          "</td></tr>"
        );
      })
      .join("");
  }

  function liveRows(list) {
    return (list || [])
      .map(function (r) {
        return (
          "<tr><td>" +
          esc(r.team) +
          "</td><td>" +
          r.sessions +
          "</td><td>" +
          esc(r.liveDuration) +
          "</td><td>" +
          esc(r.replayDuration) +
          "</td><td>¥ " +
          Number(r.amount || 0).toLocaleString("zh-CN") +
          "</td></tr>"
        );
      })
      .join("");
  }

  function sortFollows(list) {
    return (list || []).slice().sort(function (a, b) {
      return String(b.time || "").localeCompare(String(a.time || ""));
    });
  }

  function isThisConference(follow, key) {
    return key && String((follow && follow.conference) || "").indexOf(key) >= 0;
  }

  function conferenceMark(follow, opts) {
    if (opts && opts.fromConference && isThisConference(follow, opts.conferenceKey)) {
      return '<span class="pf-follow-badge">来自于本场会务</span>';
    }
    return "";
  }

  function followRows(list, opts) {
    return (list || [])
      .map(function (r, i) {
        var tags = (r.tags || [])
          .map(function (t) {
            return '<span class="pf-chip pf-chip--blue">' + esc(t) + "</span>";
          })
          .join(" ");
        return (
          "<tr><td>" +
          (i + 1) +
          "</td><td>" +
          esc(r.type) +
          "</td><td>" +
          esc(r.checkinNo || "—") +
          "</td><td>" +
          esc(r.group || "—") +
          "</td><td>" +
          esc(r.identity || "—") +
          "</td><td>" +
          esc(r.angelName || "—") +
          '<div class="pf-muted">' +
          esc(r.angelId || "") +
          " · " +
          esc(r.angelPhone || "") +
          "</div></td><td>" +
          (tags || "—") +
          "</td><td>" +
          esc(r.content) +
          "</td><td>" +
          esc(r.follower) +
          "</td><td>" +
          esc(r.conference) +
          conferenceMark(r, opts) +
          "</td><td>" +
          esc(r.visible || "是") +
          "</td><td>" +
          esc(r.time) +
          "</td></tr>"
        );
      })
      .join("");
  }

  var BEHAVIOR_TABS = [
    {
      key: "community",
      label: "社区",
      headers: ["序号", "关联话题", "内容", "创建时间"],
      rows: communityRows,
      empty: "暂无社区发想法记录",
      get: function (d) {
        return d.communityRecords || [];
      },
    },
    {
      key: "learn",
      label: "学习",
      headers: ["课程", "学习次数", "更新时间"],
      rows: learnRows,
      empty: "暂无学习档案记录",
      get: function (d) {
        return d.learnRecords || [];
      },
    },
    {
      key: "video",
      label: "视频",
      headers: ["视频标题", "ID", "标签", "观看时间"],
      rows: videoRows,
      empty: "暂无短视频观看记录",
      get: function (d) {
        return d.videoRecords || [];
      },
    },
    {
      key: "live",
      label: "直播",
      headers: ["直播团队", "观看场次", "直播观看累计时长", "录播观看时长", "直播间成交金额"],
      rows: liveRows,
      empty: "暂无直播间记录",
      get: function (d) {
        return d.liveRecords || [];
      },
    },
  ];

  function renderFollowCard(detail, opts) {
    var list = sortFollows(detail.follows || []);
    var preview = list.slice(0, PREVIEW_N);
    var body = preview.length
      ? preview
          .map(function (f) {
            return (
              '<div class="pf-follow-item">' +
              '<div class="pf-follow-item__head">' +
              '<span class="pf-follow-item__type">' +
              esc(f.type) +
              conferenceMark(f, opts) +
              "</span>" +
              '<span class="pf-muted">' +
              esc(f.time) +
              "</span></div>" +
              '<div class="pf-chip-row" style="margin:4px 0 6px">' +
              (f.tags || [])
                .map(function (t) {
                  return '<span class="pf-chip pf-chip--blue">' + esc(t) + "</span>";
                })
                .join("") +
              "</div>" +
              '<div class="pf-follow-item__body">' +
              esc(f.content) +
              "<br/><span class='pf-muted'>跟进人 " +
              esc(f.follower) +
              " · " +
              esc(f.conference) +
              "</span></div></div>"
            );
          })
          .join("")
      : '<p class="pf-muted">暂无跟进记录</p>';
    return (
      '<section class="pf-card" id="pfFollowCard">' +
      '<div class="pf-card__head">跟进记录' +
      '<a href="#" id="pfFollowMore">查看更多</a></div>' +
      '<div class="pf-card__body">' +
      body +
      (list.length > PREVIEW_N
        ? '<p class="pf-muted" style="margin:8px 0 0">预览最近 ' +
          PREVIEW_N +
          " 条，共 " +
          list.length +
          " 条</p>"
        : "") +
      "</div></section>"
    );
  }

  function renderBehaviorCard(detail) {
    var tabs = BEHAVIOR_TABS.map(function (t, i) {
      return (
        '<button type="button" class="pf-seg-tab' +
        (i === 0 ? " is-active" : "") +
        '" data-pf-beh-tab="' +
        t.key +
        '">' +
        t.label +
        "</button>"
      );
    }).join("");

    var panels = BEHAVIOR_TABS.map(function (t, i) {
      var list = t.get(detail).slice(0, PREVIEW_N);
      return (
        '<div class="pf-beh-panel' +
        (i === 0 ? " is-active" : "") +
        '" data-pf-beh-panel="' +
        t.key +
        '">' +
        tableWrap(t.headers, t.rows(list), t.empty) +
        "</div>"
      );
    }).join("");

    return (
      '<section class="pf-card" id="pfBehaviorCard">' +
      '<div class="pf-card__head">近期行为明细' +
      '<a href="#" id="pfBehaviorMore">查看更多</a></div>' +
      '<div class="pf-card__body">' +
      '<div class="pf-seg-tabs" role="tablist">' +
      tabs +
      "</div>" +
      panels +
      '<p class="pf-muted" style="margin:8px 0 0">各类型预览最近 ' +
      PREVIEW_N +
      " 条；查看更多可切换类型看全量</p>" +
      "</div></section>"
    );
  }

  function ensureDrawers() {
    if (document.getElementById("pfBehDrawer")) return;
    var html =
      '<div class="pf-drawer-backdrop" id="pfBehDrawer" aria-hidden="true">' +
      '<aside class="pf-drawer" role="dialog" aria-labelledby="pfBehTitle">' +
      '<div class="pf-drawer__head"><div><h2 class="pf-drawer__title" id="pfBehTitle">行为明细</h2>' +
      '<p class="pf-muted" id="pfBehSub" style="margin:4px 0 0">会员行为 · 按类型查看</p></div>' +
      '<button type="button" class="pf-drawer__close" data-pf-close="beh" aria-label="关闭">×</button></div>' +
      '<div class="pf-seg-tabs pf-seg-tabs--drawer" id="pfBehDrawerTabs"></div>' +
      '<div class="pf-drawer__body" id="pfBehDrawerBody"></div></aside></div>' +
      '<div class="pf-drawer-backdrop" id="pfFollowDrawer" aria-hidden="true">' +
      '<aside class="pf-drawer pf-drawer--wide" role="dialog" aria-labelledby="pfFollowTitle">' +
      '<div class="pf-drawer__head"><div><h2 class="pf-drawer__title" id="pfFollowTitle">跟进记录</h2>' +
      '<p class="pf-muted" style="margin:4px 0 0">跨会务历史 · 会员详情口径</p></div>' +
      '<button type="button" class="pf-drawer__close" data-pf-close="follow" aria-label="关闭">×</button></div>' +
      '<div class="pf-drawer__body" id="pfFollowDrawerBody"></div></aside></div>';
    document.body.insertAdjacentHTML("beforeend", html);
  }

  function openBackdrop(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeBackdrop(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".pf-drawer-backdrop.is-open")) {
      document.body.style.overflow = "";
    }
  }

  function renderBehDrawer(detail, activeKey) {
    var tabsEl = document.getElementById("pfBehDrawerTabs");
    var bodyEl = document.getElementById("pfBehDrawerBody");
    tabsEl.innerHTML = BEHAVIOR_TABS.map(function (t) {
      return (
        '<button type="button" class="pf-seg-tab' +
        (t.key === activeKey ? " is-active" : "") +
        '" data-pf-beh-drawer-tab="' +
        t.key +
        '">' +
        t.label +
        "</button>"
      );
    }).join("");
    var tab = BEHAVIOR_TABS.find(function (t) {
      return t.key === activeKey;
    }) || BEHAVIOR_TABS[0];
    var list = tab.get(detail);
    bodyEl.innerHTML =
      '<p class="pf-muted" style="margin:0 0 10px">共 ' +
      list.length +
      " 条</p>" +
      tableWrap(tab.headers, tab.rows(list), tab.empty);
  }

  function init(detail, student, opts) {
    ensureDrawers();
    var name = student && student.name6q ? student.name6q : "学员";
    opts = opts || {};

    document.querySelectorAll("[data-pf-beh-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-pf-beh-tab");
        document.querySelectorAll("[data-pf-beh-tab]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        document.querySelectorAll("[data-pf-beh-panel]").forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-pf-beh-panel") === key);
        });
      });
    });

    var moreBeh = document.getElementById("pfBehaviorMore");
    if (moreBeh) {
      moreBeh.addEventListener("click", function (e) {
        e.preventDefault();
        var active =
          (document.querySelector("[data-pf-beh-tab].is-active") || {}).getAttribute &&
          document.querySelector("[data-pf-beh-tab].is-active").getAttribute("data-pf-beh-tab");
        document.getElementById("pfBehSub").textContent =
          name + " · 行为明细全量";
        renderBehDrawer(detail, active || "community");
        openBackdrop("pfBehDrawer");
      });
    }

    document.getElementById("pfBehDrawerTabs").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-pf-beh-drawer-tab]");
      if (!btn) return;
      renderBehDrawer(detail, btn.getAttribute("data-pf-beh-drawer-tab"));
    });

    var moreFollow = document.getElementById("pfFollowMore");
    if (moreFollow) {
      moreFollow.addEventListener("click", function (e) {
        e.preventDefault();
        var list = sortFollows(detail.follows || []);
        document.getElementById("pfFollowDrawerBody").innerHTML =
          '<p class="pf-muted" style="margin:0 0 10px">共 ' +
          list.length +
          " 条 · 按创建时间倒序</p>" +
          tableWrap(
            [
              "序号",
              "跟进类型",
              "签到号",
              "小组",
              "6Q身份",
              "上级天使",
              "跟进标签",
              "跟进内容",
              "跟进人",
              "关联会务",
              "是否显示",
              "创建时间",
            ],
            followRows(list, opts),
            "暂无跟进记录"
          );
        openBackdrop("pfFollowDrawer");
      });
    }

    document.querySelectorAll("[data-pf-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var which = btn.getAttribute("data-pf-close");
        closeBackdrop(which === "follow" ? "pfFollowDrawer" : "pfBehDrawer");
      });
    });
    ["pfBehDrawer", "pfFollowDrawer"].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener("click", function (e) {
        if (e.target === el) closeBackdrop(id);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeBackdrop("pfBehDrawer");
        closeBackdrop("pfFollowDrawer");
      }
    });
  }

  global.ProfileBehaviorUI = {
    renderFollowCard: renderFollowCard,
    renderBehaviorCard: renderBehaviorCard,
    init: init,
  };
})(window);
