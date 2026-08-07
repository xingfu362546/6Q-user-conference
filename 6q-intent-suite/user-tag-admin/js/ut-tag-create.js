/**
 * 新增标签页：规则解读、预估、复制模式（依赖 ut-rule-builder 统一行）
 */
(function () {
  "use strict";

  var B = window.UT_RULE_BUILDER;
  var O = window.UT_RULE_OPTIONS;

  var params = new URLSearchParams(window.location.search);
  if (params.has("copy")) {
    var banner = document.getElementById("ut-copy-banner");
    if (banner) banner.hidden = false;
    var name = document.getElementById("tag-name");
    if (name) {
      name.value = "";
      name.placeholder = "请填写新标签名称（不可与源标签重复）";
    }
  }

  var parent = params.get("parent");
  if (parent) {
    var parentSel = document.getElementById("parent-tag");
    var map = { pref: "用户偏好", base: "基础属性", seg: "用户分层", fin: "金融属性", beh: "用户行为" };
    var label = map[parent];
    if (parentSel && label) {
      Array.from(parentSel.options).forEach(function (opt) {
        opt.selected = opt.textContent === label;
      });
    }
  }

  function topLogic() {
    var active = document.querySelector(
      ".ut-rule-logic > .ut-rule-logic__op [data-logic-switch] button.is-active"
    );
    return active && active.getAttribute("data-logic") === "or" ? "or" : "and";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-logic-switch] button[data-logic]");
    if (!btn) return;
    var wrap = btn.closest("[data-logic-switch]");
    if (!wrap) return;
    wrap.querySelectorAll("button").forEach(function (b) {
      b.classList.remove("is-active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-pressed", "true");
    var logic = btn.getAttribute("data-logic");
    var label = wrap.querySelector("[data-logic-label]");
    if (label) label.textContent = logic === "or" ? "或" : "且";
    var nestedTitle = wrap.closest("[data-rule-group]")?.querySelector("[data-nested-logic-title]");
    if (nestedTitle) {
      nestedTitle.textContent =
        logic === "or" ? "条件组：满足以下任一" : "条件组：满足以下全部";
    }
    buildRuleSummary();
  });

  function activePanel(row) {
    var type = row.querySelector("[data-rule-type]")?.value;
    return row.querySelector('[data-panel="' + type + '"]');
  }

  function phraseForRow(row, index) {
    var type = row.querySelector("[data-rule-type]")?.value;
    var panel = activePanel(row);
    if (!panel) return index + " …";

    if (type === "attr") {
      var table = panel.querySelector("[data-attr-table]");
      var tableName = table?.value || "";
      var field = panel.querySelector("[data-attr-field]");
      var fieldName = field?.value || "";
      var op = panel.querySelector("[data-compare-op]");
      var opLabel = op?.selectedOptions[0]?.textContent || "";
      var v = panel.querySelector("[data-v1]")?.value || "";
      return (
        index +
        " 用户属性：" +
        tableName +
        "." +
        fieldName +
        " " +
        opLabel +
        " " +
        v
      );
    }

    if (type === "event") {
      var time = B ? B.getTimeText(panel) : "";
      var done = panel.querySelector("[data-event-done]")?.selectedOptions[0]?.textContent || "";
      var ev = panel.querySelector("[data-event-name]")?.selectedOptions[0]?.textContent || "";
      if (panel.querySelector("[data-event-done]")?.value === "not_done") {
        return index + " " + time + " " + done + "「" + ev + "」";
      }
      var cmp = B ? B.getCompareText(panel) : "";
      var agg = panel.querySelector("[data-event-agg]")?.selectedOptions[0]?.textContent || "";
      return index + " " + time + " " + done + "「" + ev + "」" + agg + " " + cmp;
    }

    if (type === "page") {
      var timeP = B ? B.getTimeText(panel) : "";
      var dim = panel.querySelector("[data-page-dim]")?.selectedOptions[0]?.textContent || "";
      var match = panel.querySelector("[data-page-match]")?.selectedOptions[0]?.textContent || "";
      var pv = panel.querySelector("[data-page-value]")?.value || "";
      var metric = panel.querySelector("[data-page-metric]")?.selectedOptions[0]?.textContent || "";
      var cmpP = B ? B.getCompareText(panel) : "";
      return (
        index +
        " " +
        timeP +
        " 访问「" +
        dim +
        "」" +
        match +
        " " +
        pv +
        "，" +
        metric +
        " " +
        cmpP
      );
    }

    if (type === "path_seq") {
      return index + " 路径序列 " + (B ? B.getPathSeqText(panel) : "");
    }
    return index + " …";
  }

  function buildRuleSummary() {
    var el = document.querySelector("[data-rule-summary]");
    if (!el) return;
    var logicWord = topLogic() === "or" ? "任一" : "全部";
    var list = document.querySelector("[data-rule-list]");
    if (!list) return;

    var parts = [];
    var idx = 0;
    var marks = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];

    function mark() {
      return marks[idx++] || idx + ".";
    }

    Array.from(list.children).forEach(function (node) {
      if (node.matches("[data-rule-row]")) {
        parts.push(phraseForRow(node, mark()));
        return;
      }
      if (node.matches("[data-rule-group]")) {
        var gLogic =
          node.querySelector("[data-logic-switch] button.is-active")?.getAttribute("data-logic") === "or"
            ? "任一"
            : "全部";
        var innerParts = [];
        node.querySelectorAll("[data-rule-group-body] > [data-rule-row]").forEach(function (row) {
          innerParts.push(phraseForRow(row, "·"));
        });
        parts.push(
          "（条件组·满足" + gLogic + "：" + (innerParts.length ? innerParts.join("；") : "空") + "）"
        );
      }
    });

    el.innerHTML =
      "满足<strong>" +
      logicWord +
      "</strong>条件：" +
      (parts.length ? parts.join("；") : "请添加至少 1 条条件");
  }

  document.addEventListener("ut-rule-inited", buildRuleSummary);
  document.addEventListener("ut-rule-changed", buildRuleSummary);
  document.addEventListener("rule-change", buildRuleSummary);
  document.addEventListener("change", function (e) {
    if (e.target.closest("[data-rule-list]")) buildRuleSummary();
  });
  document.addEventListener("input", function (e) {
    if (e.target.closest("[data-rule-list]")) buildRuleSummary();
  });

  var estimateBtn = document.querySelector("[data-estimate-run]");
  var estimateEl = document.querySelector("[data-estimate-count]");
  if (estimateBtn && estimateEl) {
    estimateBtn.addEventListener("click", function () {
      estimateBtn.disabled = true;
      estimateBtn.textContent = "试算中…";
      setTimeout(function () {
        estimateEl.textContent = "~1,426";
        estimateBtn.disabled = false;
        estimateBtn.textContent = "重新预估";
      }, 600);
    });
  }

  /* —— 例行更新调度（每日固定时刻） —— */
  var manualPanel = document.querySelector("[data-update-manual-panel]");
  var cronPanel = document.querySelector("[data-cron-schedule-panel]");
  var timeEl = document.querySelector("[data-cron-time]");
  var summaryText = document.querySelector("[data-cron-summary-text]");
  var nextRunEl = document.querySelector("[data-cron-next-run]");

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatDateTime(d) {
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function parseTime() {
    var raw = (timeEl && timeEl.value) || "02:00";
    var parts = raw.split(":");
    return { h: parseInt(parts[0], 10) || 0, m: parseInt(parts[1], 10) || 0 };
  }

  function buildCronSummary() {
    if (!summaryText) return;
    var t = parseTime();
    var timeStr = pad(t.h) + ":" + pad(t.m);
    summaryText.textContent =
      "将在每个自然日 " + timeStr + "（北京时间）自动计算本标签。";
  }

  function computeNextRun() {
    if (!nextRunEl) return;
    var t = parseTime();
    var now = new Date();
    var next = new Date(now);
    next.setSeconds(0, 0);
    next.setHours(t.h, t.m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    nextRunEl.textContent = formatDateTime(next) + "（演示估算）";
  }

  function syncCronSchedule() {
    buildCronSummary();
    computeNextRun();
  }

  function getUpdateMode() {
    var active = document.querySelector("[data-update-mode-seg] button.is-active");
    return active ? active.getAttribute("data-seg-value") : "manual";
  }

  function syncUpdateModePanels() {
    var cron = getUpdateMode() === "cron";
    if (cronPanel) cronPanel.hidden = !cron;
    if (manualPanel) manualPanel.hidden = cron;
    if (cron) syncCronSchedule();
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-update-mode-seg] button[data-seg-value]")) return;
    setTimeout(syncUpdateModePanels, 0);
  });

  if (timeEl) {
    timeEl.addEventListener("change", syncCronSchedule);
    timeEl.addEventListener("input", syncCronSchedule);
  }

  syncUpdateModePanels();

  window.UT_TAG_SCHEDULE = {
    getConfig: function () {
      return {
        mode: getUpdateMode(),
        frequency: "daily",
        time: timeEl ? timeEl.value : "02:00",
        timezone: "Asia/Shanghai",
        summary: summaryText ? summaryText.textContent : "",
      };
    },
    formatListLabel: function (cfg) {
      if (!cfg || cfg.mode !== "cron") return "手动";
      return "例行 · 每日 " + (cfg.time || "02:00");
    },
  };
})();
