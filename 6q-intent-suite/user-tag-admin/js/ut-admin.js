/**
 * 用户标签后台 — 共享交互
 */
(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  /* Dropdown menus */
  document.addEventListener("click", function (e) {
    var toggle = e.target.closest("[data-dropdown-toggle]");
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      var wrap = toggle.closest(".ut-dropdown");
      qsa(".ut-dropdown.is-open").forEach(function (d) {
        if (d !== wrap) d.classList.remove("is-open");
      });
      if (wrap) wrap.classList.toggle("is-open");
      return;
    }
    if (!e.target.closest(".ut-dropdown")) {
      qsa(".ut-dropdown.is-open").forEach(function (d) {
        d.classList.remove("is-open");
      });
    }
  });

  /* Tree table expand/collapse */
  qsa("[data-tree-table]").forEach(function (table) {
    table.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-tree-toggle]");
      if (!btn || btn.classList.contains("is-leaf")) return;
      var row = btn.closest("tr");
      if (!row) return;
      var id = row.getAttribute("data-id");
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      btn.textContent = expanded ? "+" : "−";
      qsa('tr[data-parent="' + id + '"]', table).forEach(function (child) {
        if (expanded) {
          child.hidden = true;
          hideDescendants(table, child.getAttribute("data-id"));
        } else {
          child.hidden = false;
        }
      });
    });
  });

  function hideDescendants(table, parentId) {
    qsa('tr[data-parent="' + parentId + '"]', table).forEach(function (tr) {
      tr.hidden = true;
      var toggle = tr.querySelector("[data-tree-toggle]");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "+";
      }
      hideDescendants(table, tr.getAttribute("data-id"));
    });
  }

  /* Copy to clipboard */
  qsa("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-copy-target");
      var el = target ? qs(target) : null;
      var text = el ? el.value || el.textContent : btn.getAttribute("data-copy-text");
      if (!text) return;
      navigator.clipboard.writeText(text.trim()).then(showCopyToast).catch(function () {
        var ta = document.createElement("textarea");
        ta.value = text.trim();
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showCopyToast();
      });
    });
  });

  function showCopyToast() {
    var toast = qs(".ut-copy-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "ut-copy-toast";
      toast.textContent = "已复制到剪贴板";
      document.body.appendChild(toast);
    }
    toast.classList.add("is-show");
    clearTimeout(showCopyToast._t);
    showCopyToast._t = setTimeout(function () {
      toast.classList.remove("is-show");
    }, 2000);
  }

  /* Segmented control */
  qsa("[data-seg]").forEach(function (seg) {
    seg.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-seg-value]");
      if (!btn) return;
      qsa("button", seg).forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
    });
  });

  /* Char counter */
  qsa("[data-char-max]").forEach(function (ta) {
    var max = parseInt(ta.getAttribute("data-char-max"), 10);
    var counter = ta.parentElement.querySelector("[data-char-count]");
    function update() {
      var len = (ta.value || "").length;
      if (counter) counter.textContent = len + " / " + max;
    }
    ta.addEventListener("input", update);
    update();
  });

  /* Filter reset */
  qsa("[data-filter-reset]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var form = btn.closest("[data-filter-form]");
      if (!form) return;
      qsa("input, select", form).forEach(function (el) {
        if (el.type === "checkbox") el.checked = false;
        else el.value = "";
      });
    });
  });

  document.addEventListener("click", function (e) {
    var del = e.target.closest("[data-rule-delete]");
    if (!del) return;
    var row = del.closest(".ut-rule-row");
    if (row) {
      row.remove();
      document.dispatchEvent(new CustomEvent("ut-rule-changed"));
    }
  });

  /* Chips remove */
  document.addEventListener("click", function (e) {
    var rm = e.target.closest("[data-chip-remove]");
    if (rm) rm.closest(".ut-chip")?.remove();
  });
})();
