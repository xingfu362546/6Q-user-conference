import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

test("总功能清单脚本可加载四端与完整版本数据", () => {
  const source = readFileSync(
    new URL("./index-features.js", import.meta.url),
    "utf8",
  );
  const sandbox = { window: {} };

  assert.doesNotThrow(() => {
    vm.runInNewContext(source, sandbox, { filename: "index-features.js" });
  });

  const spec = sandbox.window.INTENT_FEATURE_SPEC;
  assert.ok(spec, "应暴露 INTENT_FEATURE_SPEC");
  assert.deepEqual(
    Array.from(spec.terminals, (item) => item.id),
    ["portal", "app", "pc", "tag"],
  );
  assert.deepEqual(
    Array.from(spec.conferenceVersions, (item) => item.version),
    ["v1.0.3", "v1.0.2", "v1.0.1", "v1.0.0"],
  );
});
