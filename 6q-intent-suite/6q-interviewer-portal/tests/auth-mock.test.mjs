import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { createAuth } = require("../js/auth-mock.js");

function mem() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

const auth = createAuth(mem());
assert.equal(auth.getSession(), null);

// 原型免校验：错误密码也能进，且落到演示账号匹配的用户
auth.login({
  mode: "phone",
  account: "13800001111",
  password: "wrong",
  captcha: "",
});
assert.equal(auth.getSession().userId, "iv_demo");

auth.setConference({
  id: "cf_a",
  title: "如何说孩子才会听",
  periodLabel: "第12551期",
  city: "广州",
  status: "ongoing",
});
assert.equal(auth.getConference().id, "cf_a");

auth.logout();
assert.equal(auth.getSession(), null);
assert.equal(auth.getConference(), null);

// 空表单登录 → 默认演示账号
auth.login({ mode: "phone", account: "", password: "", captcha: "" });
assert.equal(auth.getSession().userId, "iv_demo");

auth.logout();
auth.login({
  mode: "email",
  account: "interviewer@6q.test",
});
assert.equal(auth.getSession().userId, "iv_demo");

const auth2 = createAuth(mem());
auth2.login({ mode: "phone", account: "13900002222" });
assert.equal(auth2.getSession().userId, "iv_empty");

console.log("auth-mock tests: PASS");
console.log("file:", path.basename(fileURLToPath(import.meta.url)));
