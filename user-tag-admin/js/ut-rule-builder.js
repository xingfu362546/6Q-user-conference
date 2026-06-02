/**
 * 标签规则 · 统一条件行构建（三类面板结构一致，通用时间/比较组件）
 */
(function () {
  "use strict";

  var O = window.UT_RULE_OPTIONS;
  var CATALOG = window.UT_TABLE_CATALOG;
  if (!O) return;

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") n.textContent = attrs[k];
        else if (k === "html") n.innerHTML = attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
    }
    return n;
  }

  function fillSelect(select, items, selectedValue) {
    select.innerHTML = "";
    items.forEach(function (item) {
      var opt = document.createElement("option");
      opt.value = item.value;
      opt.textContent = item.label;
      if (selectedValue !== undefined && item.value === selectedValue) opt.selected = true;
      select.appendChild(opt);
    });
  }

  /** 通用：时间范围 */
  function createTimeRange(defaultDays) {
    var wrap = el("div", "ut-cmp ut-cmp-time", { "data-cmp": "time" });
    var label = el("span", "ut-cmp__label", { text: "时间范围" });
    var mode = el("select", "ut-select", { "data-time-mode": "" });
    fillSelect(mode, O.timeMode, "recent");

    var recentWrap = el("span", "ut-cmp-time__recent", { "data-time-recent": "" });
    var days = el("input", "ut-input", {
      type: "number",
      "data-time-days": "",
      min: "1",
      value: String(defaultDays || 30),
    });
    days.style.width = "56px";
    var dayUnit = el("span", "ut-cmp__unit", { text: "天" });

    var rangeWrap = el("span", "ut-cmp-time__range", { "data-time-range": "", hidden: "" });
    var start = el("input", "ut-input", { type: "date", "data-time-start": "" });
    var sep = el("span", "ut-cmp__sep", { text: "—" });
    var end = el("input", "ut-input", { type: "date", "data-time-end": "" });

    function syncTimeMode() {
      var isRange = mode.value === "range";
      recentWrap.hidden = isRange;
      rangeWrap.hidden = !isRange;
    }
    mode.addEventListener("change", syncTimeMode);

    recentWrap.appendChild(days);
    recentWrap.appendChild(dayUnit);
    rangeWrap.appendChild(start);
    rangeWrap.appendChild(sep);
    rangeWrap.appendChild(end);

    wrap.appendChild(label);
    wrap.appendChild(mode);
    wrap.appendChild(recentWrap);
    wrap.appendChild(rangeWrap);
    return wrap;
  }

  /** 通用：比较符 + 值 */
  function createCompare(valueType, defaults) {
    var wrap = el("div", "ut-cmp ut-cmp-compare", { "data-cmp": "compare" });
    var op = el("select", "ut-select", { "data-compare-op": "" });
    var valueWrap = el("span", "ut-cmp-compare__value", { "data-compare-value": "" });

    function getOps() {
      return O.operators[valueType] || O.operators.number;
    }

    function renderValue() {
      valueWrap.innerHTML = "";
      var opVal = op.value;
      if (opVal === "empty" || opVal === "not_empty") return;
      if (opVal === "between") {
        var a = el("input", "ut-input", { type: valueType === "date" ? "date" : "number", "data-v1": "" });
        var s = el("span", "ut-cmp__sep", { text: "—" });
        var b = el("input", "ut-input", { type: valueType === "date" ? "date" : "number", "data-v2": "" });
        if (defaults && defaults.v1) a.value = defaults.v1;
        if (defaults && defaults.v2) b.value = defaults.v2;
        valueWrap.appendChild(a);
        valueWrap.appendChild(s);
        valueWrap.appendChild(b);
        return;
      }
      if (valueType === "date") {
        var d = el("input", "ut-input", { type: "date", "data-v1": "" });
        if (defaults && defaults.v1) d.value = defaults.v1;
        valueWrap.appendChild(d);
        return;
      }
      if (valueType === "number") {
        var n = el("input", "ut-input", { type: "number", "data-v1": "", min: "0" });
        if (defaults && defaults.v1) n.value = defaults.v1;
        valueWrap.appendChild(n);
        return;
      }
      var t = el("input", "ut-input", { type: "text", "data-v1": "", placeholder: "请输入" });
      if (defaults && defaults.v1) t.value = defaults.v1;
      valueWrap.appendChild(t);
    }

    function syncOp() {
      fillSelect(op, getOps(), op.value || getOps()[0].value);
      renderValue();
    }

    op.addEventListener("change", renderValue);
    wrap.appendChild(op);
    wrap.appendChild(valueWrap);
    wrap._setValueType = function (vt) {
      valueType = vt;
      syncOp();
    };
    wrap._setEnumValues = function (vals) {
      wrap._enumValues = vals;
    };
    syncOp();
    return wrap;
  }

  function createAttrPanel() {
    var panel = el("div", "ut-rule-body", { "data-panel": "attr" });

    var tableLbl = el("span", "ut-cmp__label", { text: "数据表" });
    var tableSel = el("select", "ut-select", { "data-attr-table": "" });
    var fieldLbl = el("span", "ut-cmp__label", { text: "字段" });
    var fieldSel = el("select", "ut-select ut-select--field", {
      "data-attr-field": "",
      title: "技术字段名，来自表结构",
    });
    fieldSel.style.minWidth = "200px";
    var fieldHint = el("span", "ut-cmp__unit", { "data-attr-field-meta": "", text: "" });

    var compare = createCompare("string", { v1: "" });

    function profileTables() {
      if (!CATALOG) return [];
      return CATALOG.listTableOptions("profile");
    }

    function loadFields(tableName, preferField) {
      var cols = CATALOG ? CATALOG.listColumnOptions(tableName) : [];
      fillSelect(
        fieldSel,
        cols.map(function (c) {
          return { value: c.value, label: c.label };
        }),
        preferField || (cols[0] && cols[0].value)
      );
      fieldSel.disabled = cols.length === 0;
    }

    function syncAttr() {
      if (!CATALOG) return;
      var tableName = tableSel.value;
      var col = CATALOG.getColumn(tableName, fieldSel.value);
      if (!col) {
        fieldHint.textContent = "";
        panel.dispatchEvent(new CustomEvent("rule-change", { bubbles: true }));
        return;
      }
      fieldHint.textContent = col.dataType;
      compare._setValueType(col.valueType);
      var opSelect = compare.querySelector("[data-compare-op]");
      if (col.valueType === "bool") {
        fillSelect(opSelect, O.operators.bool);
        compare.querySelector("[data-compare-value]").innerHTML = "";
      } else {
        compare.querySelector("[data-compare-value]").hidden = false;
      }
      panel.dispatchEvent(new CustomEvent("rule-change", { bubbles: true }));
    }

    var tables = profileTables();
    fillSelect(tableSel, tables, tables[0] && tables[0].value);
    loadFields(tableSel.value);

    tableSel.addEventListener("change", function () {
      loadFields(tableSel.value);
      syncAttr();
    });
    fieldSel.addEventListener("change", syncAttr);
    compare.querySelector("[data-compare-op]").addEventListener("change", function () {
      panel.dispatchEvent(new CustomEvent("rule-change", { bubbles: true }));
    });
    compare.addEventListener("change", function () {
      panel.dispatchEvent(new CustomEvent("rule-change", { bubbles: true }));
    });
    compare.addEventListener("input", function () {
      panel.dispatchEvent(new CustomEvent("rule-change", { bubbles: true }));
    });

    panel.appendChild(tableLbl);
    panel.appendChild(tableSel);
    panel.appendChild(fieldLbl);
    panel.appendChild(fieldSel);
    panel.appendChild(fieldHint);
    panel.appendChild(compare);
    syncAttr();
    return panel;
  }

  function createEventPanel() {
    var panel = el("div", "ut-rule-body", { "data-panel": "event" });
    panel.appendChild(createTimeRange(30));

    var done = el("select", "ut-select", { "data-event-done": "" });
    fillSelect(done, O.eventDone, "done");

    var ev = el("select", "ut-select", { "data-event-name": "" });
    fillSelect(ev, O.events, O.events[0].value);

    var agg = el("select", "ut-select", { "data-event-agg": "" });
    fillSelect(agg, O.eventAggregates, "count");

    var compare = createCompare("number", { v1: "1" });
    compare.querySelector("[data-compare-op]").value = "gte";

    var metricWrap = el("span", "ut-cmp-event-metric", { "data-event-metric-wrap": "" });
    metricWrap.appendChild(agg);
    metricWrap.appendChild(compare);

    function syncDone() {
      var notDone = done.value === "not_done";
      metricWrap.hidden = notDone;
      panel.dispatchEvent(new CustomEvent("rule-change", { bubbles: true }));
    }
    done.addEventListener("change", syncDone);
    [ev, agg].forEach(function (n) {
      n.addEventListener("change", function () {
        panel.dispatchEvent(new CustomEvent("rule-change", { bubbles: true }));
      });
    });

    panel.appendChild(done);
    panel.appendChild(ev);
    panel.appendChild(metricWrap);
    syncDone();
    return panel;
  }

  function createPagePanel() {
    var panel = el("div", "ut-rule-body", { "data-panel": "page" });
    var dim = el("select", "ut-select", { "data-page-dim": "" });
    fillSelect(dim, O.pageDimensions, "path");

    var match = el("select", "ut-select", { "data-page-match": "" });
    fillSelect(match, O.operators.match, "contains");

    var pathVal = el("input", "ut-input", {
      type: "text",
      "data-page-value": "",
      placeholder: "页面路径/名称/ID",
    });
    pathVal.style.minWidth = "140px";

    var metric = el("select", "ut-select", { "data-page-metric": "" });
    fillSelect(metric, O.pageMetrics, "stay_seconds");

    var compare = createCompare("number", { v1: "30" });
    compare.querySelector("[data-compare-op]").value = "gte";

    var unit = el("span", "ut-cmp__unit", { "data-page-unit": "", text: "秒" });

    metric.addEventListener("change", function () {
      var m = O.pageMetrics.find(function (x) {
        return x.value === metric.value;
      });
      unit.textContent = (m && m.unit) || "";
      panel.dispatchEvent(new CustomEvent("rule-change", { bubbles: true }));
    });

    panel.appendChild(dim);
    panel.appendChild(match);
    panel.appendChild(pathVal);
    panel.appendChild(metric);
    panel.appendChild(compare);
    panel.appendChild(unit);
    panel.appendChild(createTimeRange(7));
    return panel;
  }

  function createRuleGroup(rowTypes) {
    var types = rowTypes && rowTypes.length ? rowTypes : ["attr"];
    var group = el("div", "ut-rule-nested", { "data-rule-group": "" });

    var head = el("div", "ut-rule-group-head");
    var headLeft = el("div", "ut-rule-group-head__left");
    headLeft.appendChild(
      el("p", "", {
        style: "margin:0;font-size:12px;font-weight:600;color:var(--text-secondary)",
        "data-nested-logic-title": "",
        text: "条件组：满足以下全部",
      })
    );
    var logicWrap = el("div", "ut-logic-switch", {
      "data-logic-switch": "",
      role: "group",
      "aria-label": "条件组逻辑",
    });
    logicWrap.style.flexDirection = "row";
    logicWrap.appendChild(
      el("button", "is-active", {
        type: "button",
        "data-logic": "and",
        "aria-pressed": "true",
        text: "且",
      })
    );
    logicWrap.appendChild(
      el("button", "", { type: "button", "data-logic": "or", "aria-pressed": "false", text: "或" })
    );
    headLeft.appendChild(logicWrap);
    head.appendChild(headLeft);
    head.appendChild(
      el("button", "ut-btn ut-btn--sm ut-btn--ghost", {
        type: "button",
        "data-rule-group-delete": "",
        text: "删除条件组",
      })
    );

    var body = el("div", "ut-rule-group-body", { "data-rule-group-body": "" });
    types.forEach(function (t) {
      body.appendChild(createRuleRow(t));
    });

    var foot = el("div", "ut-rule-group-foot");
    foot.appendChild(
      el("button", "ut-btn ut-btn--sm ut-btn--primary", {
        type: "button",
        "data-add-rule-in-group": "",
        text: "＋ 添加组内条件",
      })
    );

    group.appendChild(head);
    group.appendChild(body);
    group.appendChild(foot);
    return group;
  }

  function createRuleRow(initialType) {
    var row = el("div", "ut-rule-row", { "data-rule-row": "" });
    var typeSel = el("select", "ut-select ut-rule-row__type", { "data-rule-type": "", "aria-label": "条件类型" });
    fillSelect(typeSel, O.conditionTypes, initialType || "attr");

    var bodyWrap = el("div", "ut-rule-row__body");
    var panels = {
      attr: createAttrPanel(),
      event: createEventPanel(),
      page: createPagePanel(),
    };
    Object.keys(panels).forEach(function (k) {
      bodyWrap.appendChild(panels[k]);
    });

    var actions = el("div", "ut-rule-actions");
    actions.appendChild(
      el("button", "ut-btn ut-btn--sm ut-btn--ghost", {
        type: "button",
        "data-rule-delete": "",
        text: "删除",
      })
    );

    function showPanel(type) {
      Object.keys(panels).forEach(function (k) {
        panels[k].hidden = k !== type;
      });
      row.setAttribute("data-active-panel", type);
    }

    typeSel.addEventListener("change", function () {
      showPanel(typeSel.value);
      row.dispatchEvent(new CustomEvent("rule-change", { bubbles: true }));
    });

    row.appendChild(typeSel);
    row.appendChild(bodyWrap);
    row.appendChild(actions);
    showPanel(typeSel.value);
    return row;
  }

  function initRuleRow(row) {
    if (row.getAttribute("data-rule-inited") === "1") return row;
    var type = row.querySelector("[data-rule-type]")?.value || "attr";
    var newRow = createRuleRow(type);
    row.replaceWith(newRow);
    newRow.setAttribute("data-rule-inited", "1");
    return newRow;
  }

  function initAll() {
    var list = document.querySelector("[data-rule-list]");
    if (!list) return;

    list.querySelectorAll("[data-rule-row]").forEach(function (row) {
      initRuleRow(row);
    });

    var topLevelRows = Array.from(list.children).filter(function (node) {
      return node.matches && node.matches("[data-rule-row]");
    });
    if (topLevelRows.length === 0) {
      var group = list.querySelector("[data-rule-group]");
      ["attr", "event", "page"].forEach(function (t) {
        var row = createRuleRow(t);
        if (group) list.insertBefore(row, group);
        else list.appendChild(row);
      });
    }

    var ph = list.querySelector("[data-rule-group-placeholder]");
    if (ph) {
      ph.replaceWith(createRuleGroup(["attr"]));
    } else {
      var oldGroup = list.querySelector("[data-rule-group]");
      if (oldGroup && !oldGroup.querySelector("[data-rule-group-body]")) {
        var placeholder = oldGroup.querySelector("[data-rule-row]");
        var t = placeholder?.getAttribute("data-rule-type") || "attr";
        if (placeholder) placeholder.remove();
        oldGroup.replaceWith(createRuleGroup([t]));
      }
    }

    bindRuleListActions();
    document.dispatchEvent(new CustomEvent("ut-rule-inited"));
  }

  function bindRuleListActions() {
    if (bindRuleListActions._done) return;
    bindRuleListActions._done = true;

    document.addEventListener("click", function (e) {
      var list = document.querySelector("[data-rule-list]");
      if (!list) return;

      if (e.target.closest("[data-add-rule]")) {
        e.preventDefault();
        list.appendChild(createRuleRow("attr"));
        document.dispatchEvent(new CustomEvent("ut-rule-changed"));
        return;
      }

      if (e.target.closest("[data-add-rule-group]")) {
        e.preventDefault();
        list.appendChild(createRuleGroup(["attr"]));
        document.dispatchEvent(new CustomEvent("ut-rule-changed"));
        return;
      }

      var inGroupBtn = e.target.closest("[data-add-rule-in-group]");
      if (inGroupBtn) {
        e.preventDefault();
        var body = inGroupBtn.closest("[data-rule-group]")?.querySelector("[data-rule-group-body]");
        if (body) {
          body.appendChild(createRuleRow("attr"));
          document.dispatchEvent(new CustomEvent("ut-rule-changed"));
        }
        return;
      }

      if (e.target.closest("[data-rule-group-delete]")) {
        e.preventDefault();
        var g = e.target.closest("[data-rule-group]");
        if (g) g.remove();
        document.dispatchEvent(new CustomEvent("ut-rule-changed"));
      }
    });
  }

  window.UT_RULE_BUILDER = {
    createRuleRow: createRuleRow,
    createRuleGroup: createRuleGroup,
    initRuleRow: initRuleRow,
    initAll: initAll,
    getTimeText: function (panel) {
      var mode = panel.querySelector("[data-time-mode]")?.value;
      if (mode === "range") {
        var a = panel.querySelector("[data-time-start]")?.value;
        var b = panel.querySelector("[data-time-end]")?.value;
        return (a || "…") + " 至 " + (b || "…");
      }
      return "最近 " + (panel.querySelector("[data-time-days]")?.value || "30") + " 天";
    },
    getCompareText: function (panel) {
      var op = panel.querySelector("[data-compare-op]");
      if (!op) return "";
      var opLabel = op.selectedOptions[0]?.textContent || "";
      var v1 = panel.querySelector("[data-v1]");
      if (op.value === "between") {
        var v2 = panel.querySelector("[data-v2]");
        return opLabel + " " + (v1?.value || "") + " — " + (v2?.value || "");
      }
      if (op.value === "empty" || op.value === "not_empty") return opLabel;
      return opLabel + " " + (v1?.value || "…");
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
