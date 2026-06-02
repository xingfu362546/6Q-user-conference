/**
 * 执行历史：版本切换（成功 / 失败空表+错误）
 */
(function () {
  "use strict";

  var VERSION_META = {
    "20251201": {
      status: "success",
      time: "2025-12-01 01:00:00",
      method: "手动更新",
      count: "1,500",
    },
    "20251130": {
      status: "success",
      time: "2025-11-30 01:00:00",
      method: "例行更新",
      count: "1,482",
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
    if (errorBox && meta.error) errorBox.textContent = meta.error;
    if (exportBtn) exportBtn.disabled = isFail;
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

  showVersion("20251201");
})();
