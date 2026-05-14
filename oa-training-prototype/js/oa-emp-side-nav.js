/**
 * 培训侧栏：一级分组收起/展开。含当前 is-active 项的分组在加载时自动展开。
 */
(function () {
  function syncExpanded(group) {
    var btn = group.querySelector(".oa-emp-side__toggle");
    if (!btn) return;
    var collapsed = group.classList.contains("is-collapsed");
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }

  document.querySelectorAll(".oa-emp-side__toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var group = btn.closest(".oa-emp-side__group");
      if (!group) return;
      group.classList.toggle("is-collapsed");
      syncExpanded(group);
    });
  });

  document.querySelectorAll(".oa-emp-side__sublinks a.is-active").forEach(function (a) {
    var group = a.closest(".oa-emp-side__group");
    if (group) {
      group.classList.remove("is-collapsed");
      syncExpanded(group);
    }
  });
})();
