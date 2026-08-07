(function () {
  "use strict";

  var STEPS = [
    "拉取本期学员名单",
    "同步标签平台命中快照",
    "计算意向分（标签权重 + AI 分）",
    "按会务策略划分高/中/低意向",
    "生成洞察概览",
  ];

  var stepsEl = document.getElementById("scanSteps");
  var barEl = document.getElementById("progressBar");
  var subEl = document.getElementById("scanSub");
  var current = 0;

  STEPS.forEach(function (text, i) {
    var row = document.createElement("div");
    row.className = "scan-step";
    row.dataset.index = String(i);
    row.innerHTML =
      '<span class="scan-step__dot"></span><span class="scan-step__text">' +
      text +
      "</span>";
    stepsEl.appendChild(row);
  });

  function setStep(idx) {
    var rows = stepsEl.querySelectorAll(".scan-step");
    rows.forEach(function (row, i) {
      row.classList.remove("is-active", "is-done");
      if (i < idx) row.classList.add("is-done");
      if (i === idx) row.classList.add("is-active");
    });
    barEl.style.width = Math.round(((idx + 1) / STEPS.length) * 100) + "%";
    if (STEPS[idx]) subEl.textContent = STEPS[idx] + "…";
  }

  function tick() {
    setStep(current);
    current += 1;
    if (current >= STEPS.length) {
      window.AppIntent.setAnalyzed();
      setTimeout(function () {
        window.location.href = "app-intent-dashboard.html";
      }, 600);
      return;
    }
    setTimeout(tick, 900 + Math.random() * 400);
  }

  setStep(0);
  setTimeout(tick, 800);
})();
