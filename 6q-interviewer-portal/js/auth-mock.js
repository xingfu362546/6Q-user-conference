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
      displayName: "面谈官·演示",
      phone: "13800001111",
      email: "interviewer@6q.test",
      password: "Passw0rd!",
    },
    {
      userId: "iv_empty",
      displayName: "面谈官·无会务",
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

  function findUser(mode, account, password) {
    var acc = normalizeAccount(mode, account);
    for (var i = 0; i < USERS.length; i++) {
      var u = USERS[i];
      if (u.password !== password) continue;
      if (mode === "phone" && u.phone === acc) return u;
      if (mode === "email" && u.email && u.email.toLowerCase() === acc) return u;
    }
    return null;
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

      login: function (opts) {
        opts = opts || {};
        var mode = opts.mode === "email" ? "email" : "phone";
        var account = opts.account;
        var password = opts.password;
        var captcha = String(opts.captcha || "").trim();
        var expected = String(opts.expectedCaptcha || "").trim();

        if (!account) {
          throw new Error(mode === "email" ? "请输入邮箱" : "请输入手机号");
        }
        if (!password) {
          throw new Error("请输入密码");
        }
        if (!captcha) {
          throw new Error("请输入验证码");
        }
        if (!expected || captcha.toLowerCase() !== expected.toLowerCase()) {
          throw new Error("验证码错误");
        }

        var user = findUser(mode, account, password);
        if (!user) {
          var accNorm = normalizeAccount(mode, account);
          var exists = USERS.some(function (u) {
            return mode === "phone"
              ? u.phone === accNorm
              : u.email && u.email.toLowerCase() === accNorm;
          });
          if (exists) throw new Error("密码错误");
          throw new Error("账号或密码错误");
        }

        var session = {
          userId: user.userId,
          displayName: user.displayName,
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
        return readJson(KEY_SESSION);
      },

      setConference: function (c) {
        if (!c || !c.id) throw new Error("会务无效");
        writeJson(KEY_CONFERENCE, {
          id: c.id,
          title: c.title || "",
          periodLabel: c.periodLabel || "",
          city: c.city || "",
          status: c.status || "ongoing",
        });
      },

      getConference: function () {
        return readJson(KEY_CONFERENCE);
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
