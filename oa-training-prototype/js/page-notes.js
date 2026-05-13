/**
 * 页内业务说明：所有数字标记共用一个右侧抽屉，点击后打开并滚动到对应说明区块。
 * 每页设置 window.PAGE_NOTES = { drawerTitle?: string, sections: [{ id, title, html }, ...] }
 * id 与按钮上 data-note-id 一致（如 "1"、"2"）。
 *
 * 抽屉内样式（见 page-notes.css）：
 * · 功能说明类：每个 section 整段为浅绿卡片，直接写标题 + 段落/列表/流程图即可。
 * · 列表字段类：在 html 中包一层
 *   <div class="pn-list-fields"><p class="pn-list-fields__title">列表字段说明 v…</p>
 *   <table class="pn-list-fields__table">…</table></div>
 *   分组行：<tr class="pn-lf-group"><td colspan="3">…</td></tr>
 */
(function () {
  var VERSION = "OA第三个调优版本v1.0.0";
  var MERMAID_SRC = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
  var mermaidLoading = null;
  var lastDrawerBody = "";

  function ensureMermaid(cb) {
    if (window.mermaid) {
      try {
        if (!window.__mermaidInit) {
          mermaid.initialize({ startOnLoad: false, theme: "neutral" });
          window.__mermaidInit = true;
        }
      } catch (e) {}
      return cb();
    }
    if (mermaidLoading) return mermaidLoading.then(cb);
    mermaidLoading = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = MERMAID_SRC;
      s.async = true;
      s.onload = function () {
        try {
          mermaid.initialize({ startOnLoad: false, theme: "neutral" });
          window.__mermaidInit = true;
        } catch (e2) {}
        resolve();
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    mermaidLoading.then(cb).catch(function () {
      cb();
    });
  }

  function esc(t) {
    return String(t || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeSections(raw) {
    if (!raw || typeof raw !== "object") return [];
    if (Array.isArray(raw.sections) && raw.sections.length) return raw.sections;
    var keys = Object.keys(raw).filter(function (k) {
      return /^\d+$/.test(k);
    });
    if (!keys.length) return [];
    keys.sort(function (a, b) {
      return Number(a) - Number(b);
    });
    return keys.map(function (k) {
      var item = raw[k] || {};
      return { id: k, title: item.title || "", html: item.html || "" };
    });
  }

  function buildDrawerBody(cfg) {
    var sections = normalizeSections(cfg);
    return sections
      .map(function (s) {
        var sid = String(s.id).replace(/[^\w-]/g, "");
        return (
          '<section id="pn-sec-' +
          sid +
          '" class="pn-sec" tabindex="-1">' +
          '<h3 class="pn-sec-title">' +
          esc(s.title) +
          "</h3>" +
          '<div class="pn-sec-body">' +
          (s.html || "") +
          "</div></section>"
        );
      })
      .join("");
  }

  function buildShell() {
    if (document.getElementById("pn-root")) return;
    var root = document.createElement("div");
    root.id = "pn-root";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<div id="pn-backdrop" aria-hidden="true"></div>' +
      '<div id="pn-panel">' +
      '<div class="pn-head">' +
      '<div><p class="pn-title" id="pn-title"></p></div>' +
      '<button type="button" id="pn-close" aria-label="关闭说明">×</button>' +
      "</div>" +
      '<div class="pn-body" id="pn-body"></div>' +
      '<div id="pn-drawer-foot">' +
      '<span class="pn-foot-label">原型包版本</span>' +
      '<span id="pn-version"></span>' +
      "</div>" +
      "</div>";
    document.body.appendChild(root);

    function close() {
      root.classList.remove("is-open");
      root.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    root.querySelector("#pn-backdrop").addEventListener("click", close);
    root.querySelector("#pn-close").addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("is-open")) close();
    });
  }

  function scrollToSection(id) {
    var sid = String(id).replace(/[^\w-]/g, "");
    var el = document.getElementById("pn-sec-" + sid);
    var wrap = document.getElementById("pn-body");
    if (!wrap) return;
    if (el) {
      el.classList.remove("pn-sec-highlight");
      void el.offsetWidth;
      el.classList.add("pn-sec-highlight");
      setTimeout(function () {
        el.classList.remove("pn-sec-highlight");
      }, 1400);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      wrap.scrollTop = 0;
    }
  }

  function openDrawer(scrollToId) {
    var cfg = window.PAGE_NOTES || {};
    var sections = normalizeSections(cfg);
    if (!sections.length) return;

    buildShell();
    var root = document.getElementById("pn-root");
    var titleEl = document.getElementById("pn-title");
    var bodyEl = document.getElementById("pn-body");
    var verEl = document.getElementById("pn-version");

    var bodyHtml = buildDrawerBody(cfg);
    if (bodyHtml !== lastDrawerBody) {
      bodyEl.innerHTML = bodyHtml;
      lastDrawerBody = bodyHtml;
    }

    titleEl.textContent = cfg.drawerTitle || "功能与流程说明";
    if (verEl) verEl.textContent = window.PAGE_NOTES_VERSION || VERSION;

    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    var diagrams = bodyEl.querySelectorAll(".mermaid");
    function afterLayout() {
      scrollToSection(scrollToId || sections[0].id);
    }
    if (diagrams.length) {
      ensureMermaid(function () {
        try {
          if (window.mermaid && window.mermaid.run) {
            window.mermaid.run({ nodes: diagrams });
          }
        } catch (e) {}
        requestAnimationFrame(function () {
          requestAnimationFrame(afterLayout);
        });
      });
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(afterLayout);
      });
    }
  }

  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target.closest(".page-note-pin[data-note-id]");
      if (!btn) return;
      e.preventDefault();
      openDrawer(btn.getAttribute("data-note-id"));
    },
    true
  );

  window.PageNotes = {
    VERSION: VERSION,
    open: openDrawer,
    refreshDiagrams: function () {
      var root = document.getElementById("pn-root");
      if (!root || !root.classList.contains("is-open")) return;
      var bodyEl = document.getElementById("pn-body");
      if (!bodyEl || !window.mermaid) return;
      var diagrams = bodyEl.querySelectorAll(".mermaid");
      if (diagrams.length) {
        try {
          mermaid.run({ nodes: diagrams });
        } catch (e) {}
      }
    }
  };
})();
