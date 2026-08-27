import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const suiteNotesJs = new URL("./intent-proto-notes.js", import.meta.url);
const suiteNotesCss = new URL("./intent-proto-notes.css", import.meta.url);
const rootNotesJs = new URL("../../shared/intent-proto-notes.js", import.meta.url);
const rootNotesCss = new URL("../../shared/intent-proto-notes.css", import.meta.url);
const suitePages = new URL("./intent-proto-pages.js", import.meta.url);
const rootPages = new URL("../../shared/intent-proto-pages.js", import.meta.url);
const suiteEnrich = new URL("./intent-proto-enrich.js", import.meta.url);
const featuresJs = new URL("../index-features.js", import.meta.url);
const rootFeaturesJs = new URL("../../index-features.js", import.meta.url);

function loadNotesRuntime() {
  const source = readFileSync(suiteNotesJs, "utf8");
  const sandbox = {
    window: {
      INTENT_FEATURE_SPEC: { notes: {} },
      INTENT_PROTO_PAGES: {},
    },
    document: {
      readyState: "complete",
      addEventListener() {},
      querySelector() {
        return null;
      },
      createElement() {
        return {
          style: {},
          classList: { add() {}, remove() {}, toggle() {} },
          appendChild() {},
          querySelector() {
            return { addEventListener() {}, disabled: false, textContent: "", innerHTML: "" };
          },
          querySelectorAll() {
            return [];
          },
          addEventListener() {},
          setAttribute() {},
          innerHTML: "",
        };
      },
      body: { appendChild() {}, style: {} },
    },
    location: { pathname: "/x.html" },
  };
  vm.runInNewContext(source, sandbox, { filename: "intent-proto-notes.js" });
  return sandbox.window.IntentProtoNotes;
}

test("会务套件与根目录注释运行时保持同步关键能力", () => {
  for (const file of [suiteNotesJs, rootNotesJs]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /ipn-toc/);
    assert.match(source, /ipn-article/);
    assert.match(source, /ipn-lightbox/);
    assert.match(source, /scrollIntoView/);
    assert.match(source, /data-ipn-zoom/);
    assert.match(source, /normalizePageFile/);
  }
  for (const file of [suiteNotesCss, rootNotesCss]) {
    const css = readFileSync(file, "utf8");
    assert.match(css, /width:\s*min\(10[48]0px,\s*96vw\)/);
    assert.match(css, /\.ipn-field-table/);
    assert.match(css, /\.ipn-ver-bar/);
    assert.match(css, /\.ipn-lightbox/);
    assert.match(css, /\.ipn-toc/);
  }
});

test("Cloudflare 去掉 html 后缀后仍能对应到页面注释", () => {
  const api = loadNotesRuntime();
  assert.equal(
    api.normalizePageFile(
      "/6q-intent-suite/6q-conference-prototype/conference-student-profile",
    ),
    "conference-student-profile.html",
  );
  assert.equal(
    api.normalizePageFile("/user-tag-admin/tag-list.html"),
    "tag-list.html",
  );
});

test("注释运行时把本页全部注释打成一篇并可渲染字段表", () => {
  const api = loadNotesRuntime();
  assert.equal(typeof api.renderFieldSpec, "function");
  assert.equal(typeof api.isHighlight, "function");
  assert.equal(api.isHighlight({ flag: "new" }), true);
  assert.equal(api.isHighlight({ flag: "changed" }), true);
  assert.equal(api.isHighlight({ flag: "" }), false);

  const html = api.renderFieldSpec({
    version: "v1.0.4 画像档案字段说明",
    intro: "按模块列出元素。",
    groups: [
      {
        name: "基础信息",
        rows: [
          {
            name: "6Q姓名",
            control: "只读文本",
            required: "是",
            status: "new",
            notes: ["用于现场核对身份", "与会员详情同名字段对齐"],
          },
        ],
      },
    ],
  });
  assert.match(html, /ipn-ver-bar/);
  assert.match(html, /v1\.0\.4 画像档案字段说明/);
  assert.match(html, /ipn-field-table/);
  assert.match(html, /基础信息/);
  assert.match(html, /6Q姓名/);
  assert.match(html, /\(new\)/);
  assert.match(html, /用于现场核对身份/);
});

test("画像页挂上全模块字段说明且新功能带 flag", () => {
  for (const file of [suitePages, rootPages]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /"conference-student-profile\.html"/);
    assert.match(source, /50/);
    assert.match(source, /"student-profile\.html"/);
  }

  function loadSpec(file) {
    const sandbox = { window: {} };
    vm.runInNewContext(readFileSync(file, "utf8"), sandbox, { filename: "index-features.js" });
    return sandbox.window.INTENT_FEATURE_SPEC;
  }

  for (const spec of [loadSpec(featuresJs), loadSpec(rootFeaturesJs)]) {
    assert.equal(spec.notes[48].flag, "new");
    assert.equal(spec.notes[49].flag, "new");
    assert.equal(spec.notes[50].flag, "new");
    assert.match(spec.notes[50].title, /字段说明/);
    assert.equal(spec.notes[41].flag, "changed");
    assert.equal(spec.notes[43].flag, "changed");
  }

  const enrich = readFileSync(suiteEnrich, "utf8");
  const fields = readFileSync(
    new URL("./intent-proto-field-specs.js", import.meta.url),
    "utf8",
  );
  assert.match(enrich, /50:/);
  assert.match(fields, /INTENT_PROTO_FIELD_SPECS|fields/);
  assert.match(fields, /6Q姓名/);
  assert.match(fields, /购课概览/);
  assert.match(fields, /跟进记录/);
});
