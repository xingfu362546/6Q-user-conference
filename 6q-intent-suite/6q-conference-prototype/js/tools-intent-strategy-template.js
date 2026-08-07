(function () {
  "use strict";

  var Core = window.IntentStrategyCore;
  var tbody = document.getElementById("template-tbody");

  function showToast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(function () {
      t.classList.remove("is-show");
    }, 2400);
  }

  function confirmDeleteTemplate(tpl) {
    var lines = [
      "确定删除模板「" + tpl.name + "」？",
      "删除后不可恢复。",
    ];
    if (Core.isTemplateInUse(tpl.id)) {
      lines.push("");
      lines.push("提示：本期会务曾选用此模板。已保存的策略配置不受影响，但将无法再选用该模板。");
    }
    return window.confirm(lines.join("\n"));
  }

  function renderTable() {
    var list = Core.loadTemplates();
    if (!list.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="intent-empty">暂无模板，请点击「新建模板」</td></tr>';
      return;
    }

    tbody.innerHTML = list
      .map(function (t) {
        var mode =
          t.config.intentMode === "score" ? "按权重分" : "按命中标签";
        var watchCount = (t.config.watchTags || []).length;
        var inUse = Core.isTemplateInUse(t.id);
        return (
          "<tr>" +
          "<td><strong>" +
          t.name +
          "</strong>" +
          (inUse ? '<span class="intent-table__badge">本期已选用</span>' : "") +
          "</td>" +
          "<td>" +
          (t.description || "—") +
          "</td>" +
          "<td>" +
          watchCount +
          " 个 · " +
          Core.tagNames(t.config.watchTags, 3) +
          (watchCount > 3 ? "…" : "") +
          "</td>" +
          "<td>" +
          mode +
          "</td>" +
          "<td>" +
          (t.updatedAt || "—") +
          "</td>" +
          '<td class="intent-table__actions">' +
          '<a class="q-btn q-btn--link q-btn--sm" href="tools-intent-strategy-template-edit.html?id=' +
          encodeURIComponent(t.id) +
          '">编辑</a>' +
          '<button type="button" class="q-btn q-btn--link q-btn--sm intent-table__delete" data-delete-id="' +
          t.id +
          '">删除</button>' +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    tbody.querySelectorAll("[data-delete-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-delete-id");
        var tpl = Core.getTemplateById(id);
        if (!tpl) {
          showToast("模板不存在或已删除");
          renderTable();
          return;
        }
        if (!confirmDeleteTemplate(tpl)) return;
        var result = Core.deleteTemplate(id);
        if (!result.ok) {
          showToast("删除失败");
          return;
        }
        showToast(
          result.inUse
            ? "模板已删除（本期已保存策略不受影响）"
            : "模板已删除"
        );
        renderTable();
      });
    });
  }

  renderTable();
})();
