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
    ["v1.1.0", "v1.2.0", "v1.3.0"],
  );
  assert.equal(spec.versionPolicy.dept, "市场部");
  assert.equal(spec.versionPolicy.owner, "姜玲玲");
  assert.deepEqual(
    Array.from(spec.versionScopes, (item) => item.version),
    ["v1.1.0", "v1.2.0", "v1.3.0"],
  );
  assert.ok(spec.versionScopes[0].rows.length >= 6);
  assert.ok(spec.versionScopes[1].rows[0].req.length >= 3);
  assert.ok(spec.versionScopes[2].rows[0].impl.length >= 1);
  assert.match(spec.conferenceVersions[2].theme, /分析助手/);
  assert.equal(spec.conferenceVersions[2].current, true);
  assert.ok(spec.notes[49]);
  assert.match(spec.notes[49].title, /意图流/);
  assert.match(spec.notes[49].body, /Dify/);
  assert.equal(spec.notes[49].flag, "new");
  assert.ok(spec.notes[50]);
  assert.match(spec.notes[50].title, /字段说明/);
  assert.equal(spec.notes[50].flag, "new");
});
