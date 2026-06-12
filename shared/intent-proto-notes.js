/**
 * 学员意向分析 · 三端原型页面说明
 * 红色序号收纳 · 点击右侧抽屉展开（功能说明 + 结构流程图）
 */
(function () {
  "use strict";

  var mmCounter = 0;
  var maskEl = null;
  var currentMarkers = [];
  var currentIndex = 0;
  var diagramMap = {};

  function pageFile() {
    var path = (location.pathname || "").replace(/\\/g, "/");
    return path.split("/").pop() || "index.html";
  }

  function getPageConfig() {
    var file = pageFile();
    if (!window.INTENT_PROTO_PAGES || !window.INTENT_PROTO_PAGES[file]) return null;
    return window.INTENT_PROTO_PAGES[file];
  }

  function buildDiagramMap() {
    diagramMap = {};
    (window.INTENT_ARCHITECTURE || []).forEach(function (d) {
      diagramMap[d.id] = d;
    });
  }

  function getNote(id) {
    var base = window.INTENT_FEATURE_SPEC && window.INTENT_FEATURE_SPEC.notes[id];
    if (!base) return null;
    var extra = (window.INTENT_PROTO_ENRICH && window.INTENT_PROTO_ENRICH[id]) || {};
    return {
      kind: "note",
      num: id,
      title: base.title,
      body: base.body || "",
      caseHtml: extra.case || "",
      mermaid: base.mermaid || "",
    };
  }

  function getDiagram(id) {
    var d = diagramMap[id];
    if (!d) return null;
    return {
      kind: "diagram",
      id: id,
      title: d.title,
      body: d.desc ? "<p>" + d.desc + "</p>" : "",
      html: d.html || "",
      mermaid: d.mermaid || "",
    };
  }

  function buildMarkers(cfg) {
    var list = [];
    (cfg.notes || []).forEach(function (id) {
      var n = getNote(id);
      if (n) list.push(n);
    });
    (cfg.diagrams || []).forEach(function (id) {
      var d = getDiagram(id);
      if (d) list.push(d);
    });
    return list;
  }

  function renderMermaid(container, code) {
    if (!code || !window.mermaid) return;
    mmCounter += 1;
    var pre = document.createElement("div");
    pre.className = "mermaid";
    pre.id = "ipn-mm-" + mmCounter;
    pre.textContent = code;
    container.appendChild(pre);
    window.mermaid.run({ nodes: [pre] }).catch(function () {
      pre.innerHTML =
        "<pre style='font-size:11px;white-space:pre-wrap;margin:0'>" + code + "</pre>";
    });
  }

  function ensureDrawer() {
    if (maskEl) return maskEl;
    maskEl = document.createElement("div");
    maskEl.className = "ipn-mask";
    maskEl.setAttribute("aria-hidden", "true");
    maskEl.innerHTML =
      '<aside class="ipn-drawer" role="dialog" aria-labelledby="ipn-drawer-title">' +
      '<div class="ipn-drawer__head">' +
      '<div><h2 class="ipn-drawer__title" id="ipn-drawer-title"></h2>' +
      '<p class="ipn-drawer__sub" id="ipn-drawer-sub"></p></div>' +
      '<button type="button" class="ipn-drawer__close" aria-label="关闭">×</button>' +
      "</div>" +
      '<div class="ipn-drawer__body" id="ipn-drawer-body"></div>' +
      '<div class="ipn-drawer__foot">' +
      '<button type="button" class="ipn-drawer__nav" data-nav="prev">上一条</button>' +
      '<span class="ipn-drawer__index" data-drawer-index></span>' +
      '<button type="button" class="ipn-drawer__nav" data-nav="next">下一条</button>' +
      "</div></aside>";
    document.body.appendChild(maskEl);

    maskEl.querySelector(".ipn-drawer__close").addEventListener("click", closeDrawer);
    maskEl.addEventListener("click", function (e) {
      if (e.target === maskEl) closeDrawer();
    });
    maskEl.querySelector('[data-nav="prev"]').addEventListener("click", function () {
      showMarker(currentIndex - 1);
    });
    maskEl.querySelector('[data-nav="next"]').addEventListener("click", function () {
      showMarker(currentIndex + 1);
    });
    document.addEventListener("keydown", function (e) {
      if (!maskEl.classList.contains("is-open")) return;
      if (e.key === "Escape") closeDrawer();
      if (e.key === "ArrowLeft") showMarker(currentIndex - 1);
      if (e.key === "ArrowRight") showMarker(currentIndex + 1);
    });
    return maskEl;
  }

  function renderMarkerContent(item, bodyEl) {
    bodyEl.innerHTML = "";
    mmCounter = 0;
    if (item.body) {
      var div = document.createElement("div");
      div.className = "ipn-section__body";
      div.innerHTML = item.body;
      bodyEl.appendChild(div);
    }
    if (item.caseHtml) {
      var c = document.createElement("div");
      c.className = "ipn-case";
      c.innerHTML = "<strong>操作案例</strong>" + item.caseHtml;
      bodyEl.appendChild(c);
    }
    if (item.html) {
      var h = document.createElement("div");
      h.className = "ipn-section__body";
      h.innerHTML = item.html;
      bodyEl.appendChild(h);
    }
    if (item.mermaid) {
      var box = document.createElement("div");
      box.className = "ipn-mermaid";
      bodyEl.appendChild(box);
      renderMermaid(box, item.mermaid);
    }
    if (item.kind === "note") {
      var ref = document.createElement("p");
      ref.className = "ipn-refs";
      ref.textContent =
        "关联文档：docs/course-student-intent/CONFIRMATION.md · INTENT-STRATEGY-CONFIG.md";
      bodyEl.appendChild(ref);
    }
  }

  function showMarker(index) {
    if (!currentMarkers.length) return;
    if (index < 0) index = 0;
    if (index >= currentMarkers.length) index = currentMarkers.length - 1;
    currentIndex = index;
    var item = currentMarkers[index];
    ensureDrawer();
    var titleEl = maskEl.querySelector("#ipn-drawer-title");
    titleEl.innerHTML =
      '<span class="ipn-drawer__badge">' +
      (index + 1) +
      "</span>" +
      item.title;
    maskEl.querySelector("#ipn-drawer-sub").textContent =
      item.kind === "diagram" ? "结构流程图" : "功能说明";
    renderMarkerContent(item, maskEl.querySelector("#ipn-drawer-body"));
    maskEl.querySelector("[data-drawer-index]").textContent =
      index + 1 + " / " + currentMarkers.length;
    maskEl.querySelector('[data-nav="prev"]').disabled = index === 0;
    maskEl.querySelector('[data-nav="next"]').disabled = index === currentMarkers.length - 1;
    maskEl.classList.add("is-open");
    maskEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.querySelectorAll(".ipn-marker").forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === index);
    });
  }

  function closeDrawer() {
    if (!maskEl) return;
    maskEl.classList.remove("is-open");
    maskEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.querySelectorAll(".ipn-marker").forEach(function (btn) {
      btn.classList.remove("is-active");
    });
  }

  function mountMarkers(markers) {
    if (!markers.length || document.querySelector(".ipn-marker-dock")) return;
    currentMarkers = markers;

    var dock = document.createElement("div");
    dock.className = "ipn-marker-dock";
    dock.setAttribute("aria-label", "页面注释");

    var legend = document.createElement("button");
    legend.type = "button";
    legend.className = "ipn-marker-legend";
    legend.title = "点击打开第 1 条说明";
    legend.innerHTML = '<span class="ipn-marker-legend__dot">i</span><span>注释 ' + markers.length + "</span>";
    legend.addEventListener("click", function () {
      showMarker(0);
    });
    dock.appendChild(legend);

    markers.forEach(function (item, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ipn-marker";
      btn.textContent = String(i + 1);
      btn.title = item.title;
      btn.setAttribute("aria-label", "注释 " + (i + 1) + "：" + item.title);
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        showMarker(i);
      });
      dock.appendChild(btn);
    });

    document.body.appendChild(dock);
  }

  function boot() {
    var cfg = getPageConfig();
    if (!cfg || !window.INTENT_FEATURE_SPEC) return;

    buildDiagramMap();

    if (window.mermaid && !window.__ipnMermaidInit) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "loose",
        flowchart: { curve: "basis", htmlLabels: true },
        sequence: { mirrorActors: false },
      });
      window.__ipnMermaidInit = true;
    }

    var markers = buildMarkers(cfg);
    mountMarkers(markers);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.IntentProtoNotes = {
    open: showMarker,
    close: closeDrawer,
    getMarkers: function () {
      return currentMarkers.slice();
    },
  };
})();
