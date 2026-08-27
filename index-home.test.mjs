import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

test("Cloudflare 根首页直接展示含用户标签平台的总功能清单", () => {
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  const source = readFileSync(
    new URL("./index-features.js", import.meta.url),
    "utf8",
  );
  const sandbox = { window: {} };

  assert.doesNotMatch(html, /http-equiv="refresh"|location\.replace\(/);
  assert.match(html, /id="terminals-mount"/);
  assert.match(html, /<script src="index-features\.js"><\/script>/);

  vm.runInNewContext(source, sandbox, { filename: "index-features.js" });
  assert.ok(
    sandbox.window.INTENT_FEATURE_SPEC.terminals.some(
      (terminal) =>
        terminal.id === "tag" && terminal.name === "用户标签平台",
    ),
  );
  assert.equal(
    sandbox.window.INTENT_FEATURE_SPEC.conferenceVersions[0].version,
    "v1.0.4",
  );
  assert.match(html, /当前 v1\.0\.4/);
});
