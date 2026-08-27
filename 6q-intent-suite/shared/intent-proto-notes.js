/**
 * 学员意向分析 · 四端原型页面说明
 * 红点只标 new/changed；点击后本页全部注释打成一篇，目录/红点跳转到对应段落；流程图可放大。
 */
(function () {
  "use strict";

  var mmCounter = 0;
  var maskEl = null;
  var lightboxEl = null;
  var currentMarkers = [];
  var currentIndex = 0;
  var catalogReady = false;
  var diagramMap = {};
  var pageMeta = { title: "本页注释", subtitle: "" };

  var FLAG_LABEL = {
    new: "new",
    changed: "changed",
    removed: "removed",
  };

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

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isHighlight(item) {
    return !!(item && (item.flag === "new" || item.flag === "changed"));
  }

  function flagBadge(flag) {
    if (!FLAG_LABEL[flag]) return "";
    return (
      '<span class="ipn-flag ipn-flag--' +
      flag +
      '">(' +
      FLAG_LABEL[flag] +
      ")</span>"
    );
  }

  function renderFieldNotes(notes) {
    if (!notes || !notes.length) return "—";
    if (notes.length === 1) return escapeHtml(notes[0]);
    return (
      "<ul>" +
      notes
        .map(function (line) {
          return "<li>" + escapeHtml(line) + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function renderFieldSpec(spec) {
    if (!spec || !spec.groups || !spec.groups.length) return "";
    var html = "";
    if (spec.version) {
      html += '<div class="ipn-ver-bar">' + escapeHtml(spec.version) + "</div>";
    }
    if (spec.intro) {
      html += '<p class="ipn-field-intro">' + escapeHtml(spec.intro) + "</p>";
    }
    spec.groups.forEach(function (group) {
      html += '<table class="ipn-field-table">';
      html +=
        '<thead><tr><th colspan="4" class="ipn-field-table__group">' +
        escapeHtml(group.name || "字段") +
        "</th></tr>";
      html +=
        "<tr><th>元素名称</th><th>元素类型</th><th>是否必填</th><th>说明</th></tr></thead><tbody>";
      (group.rows || []).forEach(function (row) {
        html +=
          "<tr><td>" +
          escapeHtml(row.name || "—") +
          (row.status ? " " + flagBadge(row.status) : "") +
          "</td><td>" +
          escapeHtml(row.control || "—") +
          "</td><td>" +
          escapeHtml(row.required || "否") +
          "</td><td class='ipn-field-table__desc'>" +
          renderFieldNotes(row.notes) +
          "</td></tr>";
      });
      html += "</tbody></table>";
    });
    return html;
  }

  function markerAnchor(item, index) {
    if (item.kind === "note") return "ipn-note-" + item.num;
    if (item.kind === "diagram") return "ipn-diagram-" + item.id;
    return "ipn-item-" + index;
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
      lead: base.lead || extra.lead || "",
      caseHtml: extra.case || "",
      mermaid: base.mermaid || extra.mermaid || "",
      fields: extra.fields || base.fields || null,
      flag: base.flag || extra.flag || "",
    };
  }

  function getDiagram(id) {
    var d = diagramMap[id];
    if (!d) return null;
    return {
      kind: "diagram",
      id: id,
      title: d.title,
      body: d.desc ? "<p>" + escapeHtml(d.desc) + "</p>" : "",
      html: d.html || "",
      mermaid: d.mermaid || "",
      flag: d.flag || "",
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
        "<pre style='font-size:11px;white-space:pre-wrap;margin:0'>" +
        escapeHtml(code) +
        "</pre>";
    });
  }

  function fillMarkerContent(item, bodyEl) {
    if (item.lead) {
      var lead = document.createElement("p");
      lead.className = "ipn-lead";
      lead.textContent = item.lead;
      bodyEl.appendChild(lead);
    }
    if (item.body) {
      var div = document.createElement("div");
      div.className = "ipn-section__body";
      div.innerHTML = item.body;
      bodyEl.appendChild(div);
    }
    if (item.fields) {
      var fieldsWrap = document.createElement("div");
      fieldsWrap.className = "ipn-fields";
      fieldsWrap.innerHTML = renderFieldSpec(item.fields);
      bodyEl.appendChild(fieldsWrap);
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
      box.setAttribute("data-ipn-mermaid", item.mermaid);
      box.innerHTML =
        '<div class="ipn-mermaid__bar">' +
        "<span>流程图 · 可点击放大</span>" +
        '<button type="button" class="ipn-mermaid__zoom" data-ipn-zoom>放大查看</button>' +
        "</div>";
      var canvas = document.createElement("div");
      canvas.className = "ipn-mermaid__canvas";
      box.appendChild(canvas);
      bodyEl.appendChild(box);
      renderMermaid(canvas, item.mermaid);
    }
    if (item.kind === "note") {
      var ref = document.createElement("p");
      ref.className = "ipn-refs";
      ref.textContent =
        "关联文档：docs/course-student-intent/CONFIRMATION.md · INTENT-STRATEGY-CONFIG.md";
      bodyEl.appendChild(ref);
    }
  }

  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    lightboxEl = document.createElement("div");
    lightboxEl.className = "ipn-lightbox";
    lightboxEl.setAttribute("aria-hidden", "true");
    lightboxEl.innerHTML =
      '<div class="ipn-lightbox__panel" role="dialog" aria-label="流程图放大">' +
      '<div class="ipn-lightbox__head">' +
      "<strong>流程图</strong>" +
      '<button type="button" class="ipn-drawer__close" data-ipn-lightbox-close aria-label="关闭放大">×</button>' +
      "</div>" +
      '<div class="ipn-lightbox__canvas" id="ipn-lightbox-canvas"></div>' +
      '<p class="ipn-lightbox__hint">点击空白处或按 Esc 关闭</p>' +
      "</div>";
    document.body.appendChild(lightboxEl);
    lightboxEl.addEventListener("click", function (e) {
      if (e.target === lightboxEl) closeLightbox();
    });
    lightboxEl
      .querySelector("[data-ipn-lightbox-close]")
      .addEventListener("click", closeLightbox);
    return lightboxEl;
  }

  function openLightbox(box) {
    var code = box && box.getAttribute("data-ipn-mermaid");
    if (!code) return;
    ensureLightbox();
    var canvas = lightboxEl.querySelector("#ipn-lightbox-canvas");
    canvas.innerHTML = "";
    renderMermaid(canvas, code);
    lightboxEl.classList.add("is-open");
    lightboxEl.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove("is-open");
    lightboxEl.setAttribute("aria-hidden", "true");
  }

  function lightboxOpen() {
    return !!(lightboxEl && lightboxEl.classList.contains("is-open"));
  }

  function ensureDrawer() {
    if (maskEl) return maskEl;
    maskEl = document.createElement("div");
    maskEl.className = "ipn-mask";
    maskEl.setAttribute("aria-hidden", "true");
    maskEl.innerHTML =
      '<aside class="ipn-drawer" role="dialog" aria-labelledby="ipn-drawer-title">' +
      '<div class="ipn-drawer__head">' +
      '<div><h2 class="ipn-drawer__title" id="ipn-drawer-title">本页注释</h2>' +
      '<p class="ipn-drawer__sub" id="ipn-drawer-sub"></p></div>' +
      '<button type="button" class="ipn-drawer__close" aria-label="关闭">×</button>' +
      "</div>" +
      '<div class="ipn-drawer__layout">' +
      '<nav class="ipn-toc" id="ipn-toc" aria-label="本页注释目录"></nav>' +
      '<div class="ipn-drawer__body" id="ipn-drawer-body"></div>' +
      "</div>" +
      '<div class="ipn-drawer__foot">' +
      '<button type="button" class="ipn-drawer__nav" data-nav="prev">上一条</button>' +
      '<span class="ipn-drawer__index" data-drawer-index></span>' +
      '<button type="button" class="ipn-drawer__nav" data-nav="next">下一条</button>' +
      "</div></aside>";
    document.body.appendChild(maskEl);

    maskEl.querySelector(".ipn-drawer__close").addEventListener("click", closeDrawer);
    maskEl.addEventListener("click", function (e) {
      if (e.target === maskEl) closeDrawer();
      var box = e.target.closest(".ipn-mermaid");
      if (box && (e.target.closest("[data-ipn-zoom]") || e.target.closest(".ipn-mermaid__canvas"))) {
        e.preventDefault();
        openLightbox(box);
      }
    });
    maskEl.querySelector("#ipn-toc").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-ipn-jump]");
      if (!btn) return;
      jumpTo(Number(btn.getAttribute("data-ipn-jump")), false);
    });
    maskEl.querySelector('[data-nav="prev"]').addEventListener("click", function () {
      jumpTo(currentIndex - 1, true);
    });
    maskEl.querySelector('[data-nav="next"]').addEventListener("click", function () {
      jumpTo(currentIndex + 1, true);
    });
    document.addEventListener("keydown", function (e) {
      if (lightboxOpen()) {
        if (e.key === "Escape") closeLightbox();
        return;
      }
      if (!maskEl.classList.contains("is-open")) return;
      if (e.key === "Escape") closeDrawer();
      if (e.key === "ArrowLeft") jumpTo(currentIndex - 1, true);
      if (e.key === "ArrowRight") jumpTo(currentIndex + 1, true);
    });
    return maskEl;
  }

  function renderToc() {
    var toc = maskEl.querySelector("#ipn-toc");
    toc.innerHTML =
      '<p class="ipn-toc__caption">本页全部注释</p>' +
      currentMarkers
        .map(function (item, i) {
          return (
            '<button type="button" class="ipn-toc__item" data-ipn-jump="' +
            i +
            '">' +
            '<span class="ipn-toc__num">' +
            (i + 1) +
            "</span>" +
            '<span class="ipn-toc__text">' +
            escapeHtml(item.title) +
            (item.flag ? " " + flagBadge(item.flag) : "") +
            "</span></button>"
          );
        })
        .join("");
  }

  function renderCatalog() {
    var bodyEl = maskEl.querySelector("#ipn-drawer-body");
    bodyEl.innerHTML = "";
    mmCounter = 0;
    currentMarkers.forEach(function (item, i) {
      var article = document.createElement("article");
      article.className = "ipn-article";
      article.id = markerAnchor(item, i);
      article.setAttribute("data-ipn-index", String(i));
      article.innerHTML =
        '<header class="ipn-article__head">' +
        '<span class="ipn-drawer__badge">' +
        (i + 1) +
        "</span>" +
        "<div><h3 class='ipn-article__title'>" +
        escapeHtml(item.title) +
        (item.flag ? " " + flagBadge(item.flag) : "") +
        "</h3>" +
        '<p class="ipn-article__kind">' +
        (item.kind === "diagram" ? "结构流程图" : "功能说明") +
        (isHighlight(item) ? " · 本次标注" : "") +
        "</p></div></header>";
      var content = document.createElement("div");
      content.className = "ipn-article__body";
      fillMarkerContent(item, content);
      article.appendChild(content);
      bodyEl.appendChild(article);
    });
    catalogReady = true;
  }

  function syncActive(index) {
    currentIndex = index;
    maskEl.querySelectorAll(".ipn-toc__item").forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === index);
    });
    maskEl.querySelectorAll(".ipn-article").forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
    });
    document.querySelectorAll(".ipn-marker").forEach(function (btn) {
      var markerIndex = Number(btn.getAttribute("data-ipn-index"));
      btn.classList.toggle("is-active", markerIndex === index);
    });
    maskEl.querySelector("[data-drawer-index]").textContent =
      "第 " + (index + 1) + " 条 / 共 " + currentMarkers.length + " 条（整页打包）";
    maskEl.querySelector('[data-nav="prev"]').disabled = index === 0;
    maskEl.querySelector('[data-nav="next"]').disabled =
      index === currentMarkers.length - 1;
  }

  function jumpTo(index, openIfNeeded) {
    if (!currentMarkers.length) return;
    if (index < 0) index = 0;
    if (index >= currentMarkers.length) index = currentMarkers.length - 1;
    if (openIfNeeded !== false) openCatalog(index);
    else {
      currentIndex = index;
      var target = document.getElementById(markerAnchor(currentMarkers[index], index));
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      syncActive(index);
    }
  }

  function openCatalog(index) {
    if (!currentMarkers.length) return;
    if (index == null || index < 0) index = 0;
    if (index >= currentMarkers.length) index = currentMarkers.length - 1;
    ensureDrawer();
    maskEl.querySelector("#ipn-drawer-title").textContent = pageMeta.title || "本页注释";
    maskEl.querySelector("#ipn-drawer-sub").textContent =
      (pageMeta.subtitle ? pageMeta.subtitle + " · " : "") +
      "点击左侧目录或红点，跳到对应说明；流程图可放大。";
    if (!catalogReady) {
      renderToc();
      renderCatalog();
    }
    maskEl.classList.add("is-open");
    maskEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    currentIndex = index;
    syncActive(index);
    var target = document.getElementById(markerAnchor(currentMarkers[index], index));
    if (target && target.scrollIntoView) {
      window.setTimeout(function () {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 40);
    }
  }

  function showMarker(index) {
    openCatalog(index);
  }

  function closeDrawer() {
    if (lightboxOpen()) closeLightbox();
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
    catalogReady = false;

    var dock = document.createElement("div");
    dock.className = "ipn-marker-dock";
    dock.setAttribute("aria-label", "页面注释");

    var highlight = [];
    markers.forEach(function (item, i) {
      if (isHighlight(item)) highlight.push({ item: item, index: i });
    });

    var legend = document.createElement("button");
    legend.type = "button";
    legend.className = "ipn-marker-legend";
    legend.title = "打开本页全部注释";
    legend.innerHTML =
      '<span class="ipn-marker-legend__dot">i</span><span>全部注释 ' +
      markers.length +
      "</span>";
    legend.addEventListener("click", function () {
      openCatalog(0);
    });
    dock.appendChild(legend);

    if (highlight.length) {
      var cap = document.createElement("p");
      cap.className = "ipn-marker-cap";
      cap.textContent = "新功能 / 本次调整";
      dock.appendChild(cap);
    }

    highlight.forEach(function (entry) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ipn-marker";
      if (entry.item.flag === "changed") btn.className += " ipn-marker--changed";
      btn.textContent = String(entry.index + 1);
      btn.setAttribute("data-ipn-index", String(entry.index));
      btn.title = entry.item.title;
      btn.setAttribute(
        "aria-label",
        "注释 " + (entry.index + 1) + "：" + entry.item.title
      );
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        openCatalog(entry.index);
      });
      dock.appendChild(btn);
    });

    document.body.appendChild(dock);
  }

  function boot() {
    var cfg = getPageConfig();
    if (!cfg || !window.INTENT_FEATURE_SPEC) return;

    pageMeta = {
      title: cfg.title ? "注释 · " + cfg.title : "本页注释",
      subtitle: cfg.subtitle || "",
    };

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
    renderFieldSpec: renderFieldSpec,
    isHighlight: isHighlight,
  };
})();
