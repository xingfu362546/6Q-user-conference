(function () {
  "use strict";

  var Core = window.IntentStrategyCore;
  var params = new URLSearchParams(location.search);
  var tplId = params.get("id");
  var isNew = !tplId;

  function showToast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("is-show");
    setTimeout(function () {
      t.classList.remove("is-show");
    }, 2200);
  }

  var tpl = isNew
    ? { id: "tpl_" + Date.now(), name: "", description: "", config: Core.cloneConfig(Core.DEFAULT_CONFIG) }
    : Core.getTemplateById(tplId);

  if (!tpl && !isNew) {
    document.querySelector(".q-page").innerHTML = "<p>模板不存在</p>";
    return;
  }

  if (window.IntentStrategyEditor) {
    window.IntentStrategyEditor.init();
    window.IntentStrategyEditor.setState(tpl.config);
  }
  document.getElementById("tpl-name").value = tpl.name || "";
  document.getElementById("tpl-desc").value = tpl.description || "";
  document.getElementById("tpl-edit-title").textContent = isNew ? "新建模板" : "编辑：" + tpl.name;

  var deleteBtn = document.getElementById("btn-delete-template");
  if (!isNew && deleteBtn) {
    deleteBtn.hidden = false;
    deleteBtn.addEventListener("click", function () {
      var lines = [
        "确定删除模板「" + (tpl.name || "未命名模板") + "」？",
        "删除后不可恢复。",
      ];
      if (Core.isTemplateInUse(tpl.id)) {
        lines.push("");
        lines.push("提示：本期会务曾选用此模板。已保存的策略配置不受影响，但将无法再选用该模板。");
      }
      if (!window.confirm(lines.join("\n"))) return;
      var result = Core.deleteTemplate(tpl.id);
      if (!result.ok) {
        showToast("删除失败");
        return;
      }
      showToast(result.inUse ? "模板已删除（本期已保存策略不受影响）" : "模板已删除");
      setTimeout(function () {
        location.href = "tools-intent-strategy-template.html";
      }, 600);
    });
  }

  document.getElementById("btn-save-template").addEventListener("click", function () {
    var config = window.IntentStrategyEditor
      ? window.IntentStrategyEditor.getState()
      : tpl.config;
    var list = Core.loadTemplates();
    var item = {
      id: tpl.id,
      name: document.getElementById("tpl-name").value.trim() || "未命名模板",
      description: document.getElementById("tpl-desc").value.trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
      config: config,
    };
    if (isNew) list.push(item);
    else {
      list = list.map(function (t) {
        return t.id === tpl.id ? item : t;
      });
    }
    Core.saveTemplates(list);
    showToast("模板已保存");
    setTimeout(function () {
      location.href = "tools-intent-strategy-template.html";
    }, 800);
  });
})();
