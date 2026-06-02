(function () {
  "use strict";

  var Core = window.IntentStrategyCore;

  function showToast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      t.classList.remove("is-show");
    }, 2600);
  }

  function renderTemplateDraftPreview() {
    var el = document.getElementById("tpl-draft-preview");
    if (!el) return;
    var id = document.getElementById("tpl-select").value;
    var tpl = Core.getTemplateById(id);
    if (!tpl) {
      el.innerHTML = '<p class="intent-empty">未找到模板</p>';
      return;
    }
    var cfg = tpl.config;
    el.innerHTML =
      "<p><strong>" +
      tpl.name +
      "</strong></p>" +
      '<p class="intent-field__hint">' +
      (tpl.description || "—") +
      "</p>" +
      "<ul class=\"intent-strategy-preview-list\">" +
      "<li>关注标签：" +
      Core.tagNames(cfg.watchTags, 6) +
      (cfg.watchTags.length > 6 ? "…" : "") +
      " · " +
      (cfg.watchLogic === "all" ? "全部命中" : "任一命中") +
      "（共 " +
      cfg.watchTags.length +
      " 个）</li>" +
      "<li>意向度：" +
      (cfg.intentMode === "score"
        ? "按权重分 · 高≥" +
          cfg.thresholdHigh +
          " / 中≥" +
          cfg.thresholdMid +
          " / 低≥" +
          cfg.thresholdLow
        : "按命中标签 · 高 " +
          cfg.high.tags.length +
          " / 中 " +
          cfg.mid.tags.length +
          " / 低 " +
          cfg.low.tags.length) +
      "</li>" +
      '<li><a class="q-btn q-btn--link q-btn--sm" href="tools-intent-strategy-template-edit.html?id=' +
      encodeURIComponent(tpl.id) +
      '">在会务工具中编辑此模板</a></li>' +
      "</ul>";
  }

  function renderPreview() {
    var el = document.getElementById("period-preview");
    if (!Core.isConferenceConfigured()) {
      el.innerHTML = '<p class="intent-empty">尚未保存本期策略</p>';
      return;
    }
    var meta = Core.getConferenceConfig();
    var cfg = meta.config;
    el.innerHTML =
      "<p><strong>" +
      (meta.templateName || "自定义") +
      "</strong></p>" +
      "<p class=\"intent-field__hint\">" +
      Core.formatSummary(cfg, meta) +
      "</p>" +
      "<ul class=\"intent-strategy-preview-list\">" +
      "<li>关注标签：" +
      (cfg.watchTags.length || 0) +
      " 个 · " +
      (cfg.watchLogic === "all" ? "全部命中" : "任一命中") +
      "</li>" +
      "<li>意向度：" +
      (cfg.intentMode === "score"
        ? "按权重分（高≥" +
          cfg.thresholdHigh +
          " 中≥" +
          cfg.thresholdMid +
          " 低≥" +
          cfg.thresholdLow +
          "）"
        : "按命中标签组合") +
      "</li>" +
      "<li>保存人：" +
      (meta.savedBy || "—") +
      "</li>" +
      "</ul>";
  }

  function renderImpact() {
    var el = document.getElementById("period-impact");
    if (!Core.isConferenceConfigured()) {
      el.innerHTML = '<p class="intent-empty">保存后可查看高/中/低人数分布</p>';
      return;
    }
    el.innerHTML =
      '<div class="intent-impact-row">' +
      '<div class="intent-impact-card intent-impact-card--high"><span>高意向</span><strong>2</strong></div>' +
      '<div class="intent-impact-card intent-impact-card--mid"><span>中意向</span><strong>2</strong></div>' +
      '<div class="intent-impact-card intent-impact-card--low"><span>低意向</span><strong>2</strong></div>' +
      "</div>";
  }

  function fillTemplateSelect() {
    var sel = document.getElementById("tpl-select");
    var list = Core.loadTemplates();
    sel.innerHTML = list
      .map(function (t) {
        return (
          '<option value="' +
          t.id +
          '">' +
          t.name +
          "</option>"
        );
      })
      .join("");
    var cur = Core.getConferenceConfig();
    if (cur && cur.templateId) sel.value = cur.templateId;
  }

  document.getElementById("btn-save-period").addEventListener("click", function () {
    var id = document.getElementById("tpl-select").value;
    Core.applyTemplateToConference(id);
    showToast("已保存本期策略，列表与 APP 将立即重算");
    renderPreview();
    renderImpact();
  });

  document.getElementById("btn-copy-prev").addEventListener("click", function () {
    if (!Core.isConferenceConfigured()) {
      showToast("暂无上期策略可复制，请先选用模板保存");
      return;
    }
    Core.copyPreviousPeriodConfig();
    showToast("已复制上期策略并重算");
    renderPreview();
    renderImpact();
  });

  document.getElementById("tpl-select").addEventListener("change", renderTemplateDraftPreview);

  fillTemplateSelect();
  renderTemplateDraftPreview();
  renderPreview();
  renderImpact();
})();
