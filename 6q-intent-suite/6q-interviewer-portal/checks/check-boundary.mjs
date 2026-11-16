#!/usr/bin/env node
/**
 * 面谈官门户边界守卫。
 *
 * 用法（在仓库根目录）：
 *   node 6q-intent-suite/6q-interviewer-portal/checks/check-boundary.mjs
 *       检查：门户页面是否引用了未登记的共享文件 + 冻结依赖是否漂移
 *   node ... --report
 *       只报告，不因漂移返回失败（本地排查用）
 *   node ... --update
 *       把当前共享文件哈希写回 boundary.json（必须在 PR 说明里写清原因）
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const portalDir = path.resolve(here, "..");
const manifestPath = path.join(portalDir, "boundary.json");
const args = new Set(process.argv.slice(2));
const reportOnly = args.has("--report");
const update = args.has("--update");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const frozen = Array.isArray(manifest.frozen) ? manifest.frozen : [];
const frozenByPath = new Map(frozen.map((item) => [item.path, item]));

function sha256(absPath) {
  return createHash("sha256").update(readFileSync(absPath)).digest("hex");
}

function listPortalHtml() {
  return readdirSync(portalDir)
    .filter((name) => name.endsWith(".html"))
    .sort();
}

function stripQuery(ref) {
  return ref.split("?")[0].split("#")[0];
}

function collectOutboundRefs() {
  const refs = [];
  const re = /\b(?:src|href)="([^"]+)"/g;
  for (const file of listPortalHtml()) {
    const html = readFileSync(path.join(portalDir, file), "utf8");
    let match;
    while ((match = re.exec(html))) {
      const raw = match[1].trim();
      if (!raw) continue;
      if (/^(?:https?:)?\/\//i.test(raw)) continue;
      if (/^(?:data:|mailto:|tel:|javascript:)/i.test(raw)) continue;
      if (raw.startsWith("#")) continue;
      const clean = stripQuery(raw);
      if (!clean) continue;
      if (!clean.startsWith("../")) continue;
      refs.push({
        file,
        raw,
        path: path.posix.normalize(path.posix.join(".", clean)),
      });
    }
  }
  return refs;
}

const refs = collectOutboundRefs();
const unknown = refs.filter((ref) => !frozenByPath.has(ref.path));
const used = new Set(refs.map((ref) => ref.path));
const unused = frozen.filter((item) => !used.has(item.path));

const drift = [];
for (const item of frozen) {
  const abs = path.resolve(portalDir, item.path);
  let current;
  try {
    current = sha256(abs);
  } catch {
    current = "<missing>";
  }
  if (update) {
    item.sha256 = current;
    continue;
  }
  if (item.sha256 !== current) {
    drift.push({ path: item.path, expected: item.sha256, actual: current });
  }
}

if (update) {
  manifest.syncedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `boundary.json updated: ${frozen.length} frozen files, syncedAt ${manifest.syncedAt}`,
  );
  process.exit(0);
}

const groups = new Map();
for (const ref of unknown) {
  if (!groups.has(ref.file)) groups.set(ref.file, []);
  groups.get(ref.file).push(ref.raw);
}

let failed = false;

if (groups.size) {
  failed = true;
  console.error("\n[越界引用] 门户页面引用了未登记的共享文件：");
  for (const [file, list] of groups) {
    console.error(`  ${file}`);
    for (const ref of [...new Set(list)]) console.error(`    -> ${ref}`);
  }
  console.error(
    "\n处理：优先改成门户内覆盖层；确实必须依赖共享文件时，登记到 boundary.json 并在 PR 里说明。",
  );
}

if (drift.length) {
  console.error("\n[冻结依赖漂移] 下列共享文件已与门户基线不一致：");
  for (const item of drift) {
    console.error(`  ${item.path}`);
    console.error(
      `    expected ${String(item.expected).slice(0, 12)}  actual ${String(item.actual).slice(0, 12)}`,
    );
  }
  console.error(
    "\n处理：先 rebase 到最新 main，确认上游改动对门户无影响，再跑 --update 并让主干 owner 审核。",
  );
  if (!reportOnly) failed = true;
}

if (unused.length) {
  console.warn("\n[提示] boundary.json 里登记但页面已不再引用：");
  for (const item of unused) console.warn(`  ${item.path}`);
}

if (!groups.size && !drift.length) {
  console.log(
    `boundary ok: ${refs.length} outbound refs, ${frozen.length} frozen files`,
  );
}

process.exit(failed ? 1 : 0);
