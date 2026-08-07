/**
 * 数据表管理：字段详情右侧抽屉（只读，字段来自 UT_TABLE_CATALOG）
 */
(function () {
  "use strict";

  var backdrop = document.getElementById("ut-drawer-backdrop");
  var drawer = document.getElementById("ut-table-drawer");
  if (!backdrop || !drawer) return;

  var titleEl = drawer.querySelector("[data-drawer-title]");
  var nameEl = drawer.querySelector("[data-drawer-table]");
  var tbody = drawer.querySelector("[data-drawer-fields]");

  function getMeta(tableKey) {
    var cat = window.UT_TABLE_CATALOG;
    if (cat) {
      var tb = cat.getTable(tableKey);
      if (tb) {
        return {
          display: tb.displayName,
          db: tb.db,
          cols: cat.getDrawerColumns(tableKey),
        };
      }
    }
    return null;
  }

  function openDrawer(tableKey) {
    var meta = getMeta(tableKey);
    if (!meta) return;
    if (titleEl) titleEl.textContent = meta.display + " · 字段列表";
    if (nameEl) nameEl.textContent = tableKey + " · " + meta.db;
    if (tbody) {
      tbody.innerHTML = meta.cols
        .map(function (row) {
          return (
            "<tr><td class=\"cell-mono\">" +
            row[0] +
            "</td><td>" +
            row[1] +
            "</td><td>" +
            row[2] +
            "</td></tr>"
          );
        })
        .join("");
    }
    backdrop.classList.add("is-open");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    backdrop.classList.remove("is-open");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function (e) {
    var open = e.target.closest("[data-open-fields]");
    if (open) {
      e.preventDefault();
      openDrawer(open.getAttribute("data-open-fields"));
      return;
    }
    if (e.target.closest("[data-drawer-close]") || e.target === backdrop) {
      closeDrawer();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });
})();
