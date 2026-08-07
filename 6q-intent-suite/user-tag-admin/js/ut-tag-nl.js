/**
 * 新增/编辑标签 · NL → SQL（v1.1）
 * 流程：保存草稿 / 生成 SQL / 确认并计算；改 NL 后脏标记禁用确认。
 */
(function () {
  "use strict";

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

  var nlInput = document.querySelector("[data-nl-input]");
  var emptyEl = document.querySelector("[data-nl-empty]");
  var resultEl = document.querySelector("[data-nl-result]");
  var sqlEl = document.querySelector("[data-nl-sql]");
  var explainEl = document.querySelector("[data-nl-explain]");
  var estimateEl = document.querySelector("[data-nl-estimate]");
  var dirtyEl = document.querySelector("[data-nl-dirty]");
  var statusEl = document.querySelector("[data-nl-status]");
  var btnGen = document.querySelector("[data-nl-generate]");
  var btnConfirm = document.querySelector("[data-nl-confirm]");
  var btnSave = document.querySelector("[data-nl-save]");

  var state = {
    confirmedSql: "",
    lastPrompt: "",
    dirty: false,
    hasSql: false,
  };

  var DEMO_SQL =
    "SELECT DISTINCT m.member_id\n" +
    "FROM dim_member m\n" +
    "JOIN dws_community_browse_daily b\n" +
    "  ON m.member_id = b.member_id\n" +
    "WHERE b.browse_minutes_avg_7d > 5\n" +
    "  AND b.dt >= date_sub(current_date(), 7)";

  function setStatus(text, kind) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = "ut-badge " + (kind === "ok" ? "ut-badge--success" : kind === "warn" ? "ut-badge--warning" : "ut-badge--neutral");
  }

  function showResult(sql, explain, estimate) {
    state.hasSql = true;
    if (emptyEl) emptyEl.hidden = true;
    if (resultEl) resultEl.hidden = false;
    if (sqlEl) sqlEl.textContent = sql;
    if (explainEl) explainEl.textContent = explain;
    if (estimateEl) estimateEl.textContent = estimate;
  }

  function setDirty(on) {
    state.dirty = on;
    if (dirtyEl) dirtyEl.hidden = !on;
    if (btnConfirm) btnConfirm.disabled = on || !state.hasSql;
    if (on) setStatus("意图已变", "warn");
  }

  function syncConfirmEnabled() {
    if (btnConfirm) btnConfirm.disabled = state.dirty || !state.hasSql;
  }

  /* 更新方式切换（从原 ut-tag-create 精简保留） */
  function bindUpdateMode() {
    var seg = document.querySelector("[data-update-mode-seg]");
    var manual = document.querySelector("[data-update-manual-panel]");
    var cron = document.querySelector("[data-cron-schedule-panel]");
    if (!seg) return;

    function apply(mode) {
      if (manual) manual.hidden = mode !== "manual";
      if (cron) cron.hidden = mode !== "cron";
    }

    seg.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-seg-value]");
      if (!btn) return;
      seg.querySelectorAll("[data-seg-value]").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      apply(btn.getAttribute("data-seg-value"));
      updateCronSummary();
    });
    apply("manual");

    var timeInput = document.querySelector("[data-cron-time]");
    if (timeInput) {
      timeInput.addEventListener("input", updateCronSummary);
      updateCronSummary();
    }
  }

  function updateCronSummary() {
    var timeInput = document.querySelector("[data-cron-time]");
    var text = document.querySelector("[data-cron-summary-text]");
    var next = document.querySelector("[data-cron-next-run]");
    if (!timeInput) return;
    var t = timeInput.value || "02:00";
    if (text) {
      text.textContent = "将在每个自然日 " + t + "（北京时间）自动计算本标签（复用已确认 SQL）。";
    }
    if (next) {
      var now = new Date();
      var parts = t.split(":");
      var cand = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +parts[0], +parts[1], 0);
      if (cand <= now) cand.setDate(cand.getDate() + 1);
      next.textContent =
        cand.getFullYear() +
        "-" +
        String(cand.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(cand.getDate()).padStart(2, "0") +
        " " +
        t;
    }
  }

  if (nlInput) {
    nlInput.addEventListener("input", function () {
      if (!state.hasSql) return;
      if (nlInput.value !== state.lastPrompt) setDirty(true);
      else setDirty(false);
    });
  }

  if (btnGen) {
    btnGen.addEventListener("click", function () {
      var prompt = (nlInput && nlInput.value.trim()) || "";
      if (!prompt) {
        alert("请先填写自然语言描述");
        return;
      }
      btnGen.disabled = true;
      btnGen.textContent = "生成中…";
      setTimeout(function () {
        var explain =
          "圈选近 7 日社区日均浏览时长大于 5 分钟的学员；输出平台学员主键 member_id。";
        showResult(DEMO_SQL, explain, "约 12,480");
        state.lastPrompt = prompt;
        state.confirmedSql = "";
        setDirty(false);
        syncConfirmEnabled();
        setStatus("SQL 已生成", "ok");
        btnGen.disabled = false;
        btnGen.textContent = "生成 SQL";
      }, 700);
    });
  }

  if (btnConfirm) {
    btnConfirm.addEventListener("click", function () {
      if (btnConfirm.disabled) return;
      state.confirmedSql = sqlEl ? sqlEl.textContent : DEMO_SQL;
      setStatus("计算中", "warn");
      btnConfirm.disabled = true;
      btnConfirm.textContent = "计算中…";
      setTimeout(function () {
        setStatus("已计算", "ok");
        btnConfirm.textContent = "确认并计算";
        syncConfirmEnabled();
        alert("已按确认 SQL 执行计算，并写入今日版本（YYYYMMDD）。可在「执行历史」查看命中用户与本次 SQL。");
      }, 900);
    });
  }

  if (btnSave) {
    btnSave.addEventListener("click", function () {
      setStatus("已存草稿", "neutral");
      alert("草稿已保存（名称 / 自然语言 / 更新方式）。未确认的 SQL 不会用于例行计算。");
    });
  }

  bindUpdateMode();
})();
