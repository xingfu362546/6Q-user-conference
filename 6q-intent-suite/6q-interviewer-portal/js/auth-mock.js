/**
 * 6Q 面谈官门户 · 登录态 / 会务上下文（原型 mock）
 * 浏览器：挂 window.InterviewerAuth
 * Node：module.exports.createAuth
 */
(function (root) {
  var KEY_SESSION = "6q_iv_session";
  var KEY_CONFERENCE = "6q_iv_conference";

  var USERS = [
    {
      userId: "iv_demo",
      displayName: "张三",
      roles: ["总统筹", "助教"],
      phone: "13800001111",
      email: "interviewer@6q.test",
      password: "Passw0rd!",
    },
    {
      userId: "iv_empty",
      displayName: "面谈官·无会务",
      roles: ["面谈官"],
      phone: "13900002222",
      email: "",
      password: "Passw0rd!",
    },
  ];

  function normalizeAccount(mode, account) {
    return String(account || "")
      .trim()
      .toLowerCase();
  }

  /** 原型：仅按账号匹配，不校验密码（正式环境见 handoff） */
  function findUserByAccount(mode, account) {
    var acc = normalizeAccount(mode, account);
    if (!acc) return null;
    for (var i = 0; i < USERS.length; i++) {
      var u = USERS[i];
      if (mode === "phone" && u.phone === acc) return u;
      if (mode === "email" && u.email && u.email.toLowerCase() === acc) return u;
    }
    return null;
  }

  function defaultDemoUser() {
    return USERS[0];
  }

  function createAuth(storage) {
    function readJson(key) {
      try {
        var raw = storage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }

    function writeJson(key, val) {
      storage.setItem(key, JSON.stringify(val));
    }

    function remove(key) {
      storage.removeItem(key);
    }

    return {
      KEY_SESSION: KEY_SESSION,
      KEY_CONFERENCE: KEY_CONFERENCE,

      /**
       * 原型登录：不做密码/验证码校验，便于演示。
       * - 填了已知手机/邮箱 → 对应用户（如 139… → 无会务）
       * - 未填或未知账号 → 默认演示面谈官 iv_demo
       * 正式环境必须校验：见 docs/superpowers/handoff/2026-08-06-interviewer-portal-handoff.md
       */
      login: function (opts) {
        opts = opts || {};
        var mode = opts.mode === "email" ? "email" : "phone";
        var user = findUserByAccount(mode, opts.account) || defaultDemoUser();

        var session = {
          userId: user.userId,
          displayName: user.displayName,
          roles: Array.isArray(user.roles) ? user.roles.slice() : [],
          phone: user.phone || undefined,
          email: user.email || undefined,
        };
        writeJson(KEY_SESSION, session);
        return session;
      },

      logout: function () {
        remove(KEY_SESSION);
        remove(KEY_CONFERENCE);
      },

      getSession: function () {
        var s = readJson(KEY_SESSION);
        if (!s) return null;
        // 兼容旧登录态：补齐岗位 / 演示姓名
        for (var i = 0; i < USERS.length; i++) {
          if (USERS[i].userId !== s.userId) continue;
          if (!Array.isArray(s.roles) || !s.roles.length) {
            s.roles = Array.isArray(USERS[i].roles) ? USERS[i].roles.slice() : [];
          }
          if (!s.displayName || s.displayName === "面谈官·演示") {
            s.displayName = USERS[i].displayName;
          }
          break;
        }
        return s;
      },

      setConference: function (c) {
        if (!c || !c.id) throw new Error("会务无效");
        writeJson(KEY_CONFERENCE, {
          id: c.id,
          title: c.title || "",
          periodLabel: c.periodLabel || "",
          city: c.city || "",
          status: c.status || "ongoing",
          startTime: c.startTime || "",
          endTime: c.endTime || "",
          address: c.address || "",
          timeRange: c.timeRange || "",
        });
      },

      getConference: function () {
        var c = readJson(KEY_CONFERENCE);
        if (!c) return null;
        // 兼容旧会务上下文：补齐开课时间 / 地址
        var confApi =
          (typeof window !== "undefined" && window.InterviewerConferences) ||
          null;
        if ((!c.address || !c.startTime) && confApi && confApi.getById) {
          var full = confApi.getById(c.id);
          if (full) {
            c.startTime = c.startTime || full.startTime || "";
            c.endTime = c.endTime || full.endTime || "";
            c.timeRange = c.timeRange || full.timeRange || "";
            c.address = c.address || full.address || "";
            c.city = c.city || full.city || "";
          }
        }
        return c;
      },

      clearConference: function () {
        remove(KEY_CONFERENCE);
      },

      requireAuth: function (loginHref) {
        var s = readJson(KEY_SESSION);
        if (!s) {
          if (typeof location !== "undefined") {
            location.href = loginHref || "login.html";
          }
          return null;
        }
        return s;
      },

      requireConference: function (selectHref) {
        var c = readJson(KEY_CONFERENCE);
        if (!c) {
          if (typeof location !== "undefined") {
            location.href = selectHref || "conference-select.html";
          }
          return null;
        }
        return c;
      },
    };
  }

  var api = { createAuth: createAuth };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (typeof window !== "undefined") {
    window.InterviewerAuth = createAuth(window.localStorage);
  }
  root.InterviewerAuthCreate = createAuth;
})(typeof globalThis !== "undefined" ? globalThis : this);
