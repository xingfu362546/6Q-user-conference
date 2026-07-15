/**
 * 执行历史：版本切换 + Tab（命中用户 / 本次 SQL）+ 本版本无效
 */
(function () {
  "use strict";

  var VERSION_META = {
    "20251201": {
      status: "success",
      time: "2025-12-01 01:00:00",
      method: "手动更新",
      count: "1,500",
      nl: "在社区浏览时间每天大于 5 分钟的用户",
      sql:
        "SELECT DISTINCT m.member_id\n" +
        "FROM dim_member m\n" +
        "JOIN dws_community_browse_daily b\n" +
        "  ON m.member_id = b.member_id\n" +
        "WHERE b.browse_minutes_avg_7d > 5\n" +
        "  AND b.dt >= date_sub(current_date(), 7)",
    },
    "20251130": {
      status: "success",
      time: "2025-11-30 01:00:00",
      method: "例行更新",
      count: "1,482",
      nl: "在社区浏览时间每天大于 5 分钟的用户",
      sql:
        "SELECT DISTINCT m.member_id\n" +
        "FROM dim_member m\n" +
        "JOIN dws_community_browse_daily b\n" +
        "  ON m.member_id = b.member_id\n" +
        "WHERE b.browse_minutes_avg_7d > 5\n" +
        "  AND b.dt >= date_sub(current_date(), 7)",
    },
    "20251202": {
      status: "fail",
      time: "2025-12-02 01:00:00",
      method: "例行更新",
      error: "SQL 超时：events_community_forward 分区扫描超过 300s，任务已终止。",
    },
  };

  var list = document.querySelector("[data-version-list]");
  if (!list) return;

  var label = document.querySelector("[data-version-label]");
  var metaLine = document.querySelector("[data-version-meta]");
  var successPanel = document.querySelector("[data-version-panel='success']");
  var failPanel = document.querySelector("[data-version-panel='fail']");
  var errorBox = document.querySelector("[data-version-error]");
  var exportBtn = document.querySelector("[data-version-export]");
  var sqlEl = document.querySelector("[data-version-sql]");
  var sqlMeta = document.querySelector(".ut-ver-sql-meta");
  var countLabel = document.querySelector("[data-hit-count-label]");
  var invalidated = 0;
  var baseCount = 1500;

  function showVersion(id) {
    var meta = VERSION_META[id] || VERSION_META["20251201"];
    if (label) label.textContent = id;
    if (metaLine) {
      metaLine.textContent =
        "执行日期 " +
        id.slice(0, 4) +
        "-" +
        id.slice(4, 6) +
        "-" +
        id.slice(6, 8) +
        " · " +
        meta.time +
        " · " +
        meta.method;
    }
    var isFail = meta.status === "fail";
    if (successPanel) successPanel.hidden = isFail;
    if (failPanel) failPanel.hidden = !isFail;
    if (errorBox && meta.error) {
      errorBox.innerHTML =
        "<strong>本版本计算失败，无命中用户数据</strong><span>" + meta.error + "</span>";
    }
    if (exportBtn) exportBtn.disabled = isFail;
    if (sqlEl && meta.sql) sqlEl.textContent = meta.sql;
    if (sqlMeta && meta.nl) {
      sqlMeta.innerHTML =
        "<strong>本版本固化 SQL</strong>（例行/立即计算复用此语句；结果集仅 member_id）<br />自然语言：" +
        meta.nl;
    }
    if (meta.count) {
      baseCount = Number(String(meta.count).replace(/,/g, "")) || 1500;
      invalidated = 0;
      refreshCount();
      resetRows();
    }
    switchTab("members");
  }

  function refreshCount() {
    if (countLabel) {
      countLabel.textContent =
        "共 " +
        (baseCount - invalidated).toLocaleString("en-US") +
        " 条有效命中" +
        (invalidated ? "（已无效 " + invalidated + "）" : "");
    }
  }

  function resetRows() {
    document.querySelectorAll("[data-member-row]").forEach(function (tr) {
      tr.classList.remove("is-invalidated");
      var st = tr.querySelector("[data-hit-status]");
      if (st) st.innerHTML = '<span class="ut-badge ut-badge--success">有效</span>';
      var btn = tr.querySelector("[data-invalidate]");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "无效";
      }
    });
  }

  function switchTab(name) {
    document.querySelectorAll("[data-ver-tab]").forEach(function (btn) {
      var on = btn.getAttribute("data-ver-tab") === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll("[data-ver-pane]").forEach(function (pane) {
      pane.hidden = pane.getAttribute("data-ver-pane") !== name;
    });
  }

  list.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-version]");
    if (!btn) return;
    list.querySelectorAll("button[data-version]").forEach(function (b) {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    showVersion(btn.getAttribute("data-version"));
  });

  document.addEventListener("click", function (e) {
    var tab = e.target.closest("[data-ver-tab]");
    if (tab) {
      switchTab(tab.getAttribute("data-ver-tab"));
      return;
    }
    var inv = e.target.closest("[data-invalidate]");
    if (!inv || inv.disabled) return;
    var tr = inv.closest("[data-member-row]");
    if (!tr || tr.classList.contains("is-invalidated")) return;
    if (!confirm("确认将该用户在本版本中无效？（仅本版本；下次重算仍可能再命中）")) return;
    tr.classList.add("is-invalidated");
    var st = tr.querySelector("[data-hit-status]");
    if (st) st.innerHTML = '<span class="ut-badge ut-badge--invalid">已无效</span>';
    inv.disabled = true;
    inv.textContent = "已无效";
    invalidated += 1;
    refreshCount();
  });

  showVersion("20251201");
})();
