import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const checker = path.resolve(here, "..", "checks", "check-boundary.mjs");

test("面谈官门户不越界引用、冻结依赖与基线一致", () => {
  const result = spawnSync(process.execPath, [checker], { encoding: "utf8" });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  assert.equal(
    result.status,
    0,
    `边界校验失败：\n${output}\n` +
      "如果刚 rebase 到最新 main，确认上游改动对门户无影响后运行 --update 并在 PR 说明。",
  );
  assert.match(output, /boundary ok/);
});
