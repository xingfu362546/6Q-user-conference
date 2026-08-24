/**
 * 会务 APP · 运营侧学员（购课意向星级 + 本场跟进）
 * 持久化：localStorage，与意向分析数据解耦
 */
(function (global) {
  "use strict";

  var STAR_KEY = "conf_app_purchase_star_v1";
  var FOLLOW_KEY = "conf_app_followups_v1";

  var STAR_OPTIONS = [
    { value: 3, label: "3星意向", desc: "成交率非常高" },
    { value: 2, label: "2星意向", desc: "成交率较高" },
    { value: 1, label: "1星意向", desc: "成交率一般" },
  ];

  /** 运营详情补充字段（原型 mock） */
  var PROFILE = {
    m10001: {
      memberCode: "S1BBX1",
      gender: "女",
      age: 34,
      city: "广州市",
      group: "1组",
      checkinNo: 3,
      mealCount: 1,
      starDefault: 2,
    },
    m10002: {
      memberCode: "S1BBX2",
      gender: "女",
      age: 32,
      city: "深圳市",
      group: "1组",
      checkinNo: 5,
      mealCount: 0,
      starDefault: 1,
    },
    m10003: {
      memberCode: "S1BBX3",
      gender: "男",
      age: 38,
      city: "佛山市",
      group: "2组",
      checkinNo: 2,
      mealCount: 2,
      starDefault: 3,
    },
    m10004: {
      memberCode: "S1BBX4",
      gender: "女",
      age: 36,
      city: "广州市",
      group: "2组",
      checkinNo: 1,
      mealCount: 0,
      starDefault: 3,
    },
    m10005: {
      memberCode: "S1BBX5",
      gender: "男",
      age: 41,
      city: "东莞市",
      group: "3组",
      checkinNo: 8,
      mealCount: 0,
      starDefault: 0,
    },
    m10006: {
      memberCode: "S1BBX6",
      gender: "女",
      age: 29,
      city: "广州市",
      group: "3组",
      checkinNo: 12,
      mealCount: 0,
      starDefault: 0,
    },
    m10007: {
      memberCode: "S1BBX7",
      gender: "女",
      age: 35,
      city: "珠海市",
      group: "2组",
      checkinNo: 6,
      mealCount: 1,
      starDefault: 2,
    },
    m10008: {
      memberCode: "S1BBX8",
      gender: "男",
      age: 33,
      city: "广州市",
      group: "1组",
      checkinNo: 4,
      mealCount: 0,
      starDefault: 2,
    },
    m10009: {
      memberCode: "S1BBX4",
      gender: "女",
      age: 36,
      city: "广州市",
      group: "2组",
      checkinNo: 1,
      mealCount: 0,
      starDefault: 3,
    },
  };

  var SEED_FOLLOWS = {
    m10009: [
      {
        id: "f-seed-1",
        type: "会务跟进",
        content: "测试",
        follower: "罗欢",
        followerRole: "总统筹",
        starred: true,
        createdAt: Date.now() - 4 * 3600 * 1000,
        tags: [],
      },
    ],
    m10001: [
      {
        id: "f-seed-2",
        type: "会务跟进",
        content: "学员今天找我了解了进阶班，预算在 8k 左右。",
        follower: "陈助教",
        followerRole: "会务跟进",
        starred: false,
        createdAt: Date.now() - 26 * 3600 * 1000,
        tags: ["有意向用户"],
      },
    ],
  };

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function ensureStars() {
    var map = readJson(STAR_KEY, null);
    if (map && typeof map === "object") return map;
    map = {};
    Object.keys(PROFILE).forEach(function (id) {
      map[id] = PROFILE[id].starDefault || 0;
    });
    writeJson(STAR_KEY, map);
    return map;
  }

  function ensureFollows() {
    var map = readJson(FOLLOW_KEY, null);
    if (map && typeof map === "object") return map;
    map = JSON.parse(JSON.stringify(SEED_FOLLOWS));
    writeJson(FOLLOW_KEY, map);
    return map;
  }

  function getStar(id) {
    var map = ensureStars();
    return map[id] != null ? Number(map[id]) : 0;
  }

  function setStar(id, star) {
    var map = ensureStars();
    map[id] = Number(star) || 0;
    writeJson(STAR_KEY, map);
    return map[id];
  }

  function getFollowups(id) {
    var map = ensureFollows();
    return (map[id] || []).slice().sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });
  }

  function addFollowup(id, payload) {
    var map = ensureFollows();
    if (!map[id]) map[id] = [];
    var item = {
      id: "f-" + Date.now(),
      type: payload.type || "会务跟进",
      content: payload.content || "",
      follower: payload.follower || "当前跟进人",
      followerRole: payload.followerRole || "会务跟进",
      starred: !!payload.starred,
      createdAt: Date.now(),
      tags: payload.tags || [],
    };
    map[id].unshift(item);
    writeJson(FOLLOW_KEY, map);
    return item;
  }

  function relativeTime(ts) {
    var diff = Date.now() - ts;
    if (diff < 60 * 1000) return "刚刚";
    if (diff < 3600 * 1000) return Math.floor(diff / 60000) + "分钟前";
    if (diff < 24 * 3600 * 1000) return Math.floor(diff / 3600000) + "小时前";
    if (diff < 48 * 3600 * 1000) return "昨天";
    var d = new Date(ts);
    return d.getMonth() + 1 + "-" + d.getDate();
  }

  function profileOf(id) {
    return (
      PROFILE[id] || {
        memberCode: "S——",
        gender: "—",
        age: "—",
        city: "—",
        group: "—组",
        checkinNo: "—",
        mealCount: 0,
        starDefault: 0,
      }
    );
  }

  function mergeStudent(base) {
    if (!base) return null;
    var p = profileOf(base.id);
    return Object.assign({}, base, p, {
      purchaseStar: getStar(base.id),
      followups: getFollowups(base.id),
    });
  }

  function getById(id) {
    if (!global.AppIntent || !global.AppIntent.getById) return null;
    return mergeStudent(global.AppIntent.getById(id));
  }

  function getAll() {
    if (!global.AppIntent || !global.AppIntent.getAll) return [];
    return global.AppIntent.getAll().map(mergeStudent);
  }

  function filterByStar(list, star) {
    if (!star || star === "all") return list;
    var n = Number(star);
    return list.filter(function (s) {
      return Number(s.purchaseStar) === n;
    });
  }

  function starLabel(n) {
    n = Number(n) || 0;
    if (!n) return "";
    return n + "星";
  }

  /** 底部弹层：购课意向 */
  function openStarSheet(opts) {
    opts = opts || {};
    var existing = document.querySelector(".ops-sheet-mask");
    if (existing) existing.remove();

    var current = opts.current != null ? Number(opts.current) : 0;
    var showAll = opts.showAll !== false;
    var mask = document.createElement("div");
    mask.className = "ops-sheet-mask";
    var allItem = showAll
      ? '<li><button type="button" class="ops-sheet__option' +
        (current === 0 ? " is-active" : "") +
        '" data-star="0"><span>全部</span></button></li>'
      : "";
    if (!showAll && current === 0) current = 3;
    mask.innerHTML =
      '<div class="ops-sheet" role="dialog" aria-label="购课意向">' +
      '<div class="ops-sheet__handle"></div>' +
      '<div class="ops-sheet__head"><h3 class="ops-sheet__title">购课意向</h3></div>' +
      '<ul class="ops-sheet__list" data-star-list>' +
      allItem +
      STAR_OPTIONS.map(function (o) {
        return (
          '<li><button type="button" class="ops-sheet__option' +
          (current === o.value ? " is-active" : "") +
          '" data-star="' +
          o.value +
          '"><span>' +
          o.label +
          '</span><small>（' +
          o.desc +
          "）</small></button></li>"
        );
      }).join("") +
      "</ul>" +
      '<div class="ops-sheet__foot">' +
      '<button type="button" class="ops-btn ops-btn--ghost" data-sheet-reset>重置</button>' +
      '<button type="button" class="ops-btn ops-btn--primary" data-sheet-confirm>确认</button>' +
      "</div></div>";

    var host =
      document.querySelector(".phone-frame") ||
      document.querySelector(".ios-device__screen") ||
      document.body;
    host.appendChild(mask);
    requestAnimationFrame(function () {
      mask.classList.add("is-open");
    });

    var selected = current;
    mask.querySelector("[data-star-list]").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-star]");
      if (!btn) return;
      selected = Number(btn.getAttribute("data-star"));
      mask.querySelectorAll(".ops-sheet__option").forEach(function (b) {
        b.classList.toggle("is-active", Number(b.getAttribute("data-star")) === selected);
      });
    });

    function close() {
      mask.classList.remove("is-open");
      setTimeout(function () {
        mask.remove();
      }, 220);
    }

    mask.addEventListener("click", function (e) {
      if (e.target === mask) close();
    });
    mask.querySelector("[data-sheet-reset]").addEventListener("click", function () {
      selected = showAll ? 0 : 3;
      mask.querySelectorAll(".ops-sheet__option").forEach(function (b) {
        b.classList.toggle(
          "is-active",
          Number(b.getAttribute("data-star")) === selected
        );
      });
    });
    mask.querySelector("[data-sheet-confirm]").addEventListener("click", function () {
      if (typeof opts.onConfirm === "function") opts.onConfirm(selected);
      close();
    });
  }

  global.AppStudentOps = {
    STAR_OPTIONS: STAR_OPTIONS,
    getById: getById,
    getAll: getAll,
    getStar: getStar,
    setStar: setStar,
    getFollowups: getFollowups,
    addFollowup: addFollowup,
    filterByStar: filterByStar,
    starLabel: starLabel,
    relativeTime: relativeTime,
    openStarSheet: openStarSheet,
  };
})(window);
