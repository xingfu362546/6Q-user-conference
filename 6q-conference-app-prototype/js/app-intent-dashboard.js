(function () {
  "use strict";

  var I = window.AppIntent;
  var sum = I.summary();

  document.getElementById("confName").textContent = I.CONFIG.conferenceName;
  document.getElementById("analyzedTime").textContent =
    "最近分析：" + I.formatAnalyzedTime();
  document.getElementById("totalNum").textContent = sum.total;
  document.getElementById("kpiHigh").textContent = sum.counts.high || 0;
  document.getElementById("kpiMid").textContent = sum.counts.mid || 0;
  document.getElementById("kpiLow").textContent = sum.counts.low || 0;

  document.getElementById("btnReanalyze").addEventListener("click", function () {
    window.location.href = "app-intent-scan.html";
  });

  var priorityEl = document.getElementById("priorityList");
  var top = sum.topPriority.length
    ? sum.topPriority
    : I.getByLevel("high").slice(0, 3);

  if (!top.length) {
    top = I.getAll().slice(0, 3);
  }

  priorityEl.innerHTML = top
    .map(function (s, i) {
      return (
        '<a class="priority-card" href="app-student-detail.html?id=' +
        encodeURIComponent(s.id) +
        '">' +
        '<span class="priority-card__rank">' +
        (i + 1) +
        "</span>" +
        '<div class="priority-card__avatar" style="background:' +
        I.avatarGradient(s.id) +
        '">' +
        s.name.charAt(0) +
        "</div>" +
        '<div class="priority-card__info">' +
        '<div class="priority-card__name">' +
        s.name +
        "</div>" +
        '<div class="priority-card__ai">' +
        (s.ai && s.ai.summary ? s.ai.summary : "—") +
        "</div>" +
        "</div>" +
        '<div class="priority-card__score">' +
        '<div class="priority-card__score-num">' +
        s.intentScore +
        "</div>" +
        '<div class="priority-card__score-label">意向分</div>' +
        "</div>" +
        "</a>"
      );
    })
    .join("");

  var courseEl = document.getElementById("dashCourseList");
  if (courseEl && window.CourseRecommend) {
    var tops = window.CourseRecommend.getConferenceTopProducts(I.getAll(), 3);
    courseEl.innerHTML = tops.length
      ? tops
          .map(function (row) {
            return (
              '<div class="dash-course-row">' +
              '<div><div class="dash-course-row__name">' +
              row.product.product_name +
              '</div><div class="dash-course-row__meta">' +
              row.product.series +
              " · " +
              (row.product.goods ? row.product.goods.length : 0) +
              " 个商品" +
              "</div></div>" +
              '<div class="dash-course-row__count">' +
              row.n +
              "<small>人推荐</small></div></div>"
            );
          })
          .join("")
      : '<p class="intent-empty">暂无推荐数据</p>';
  }

  drawRing(sum.counts);
})();

function drawRing(counts) {
  var canvas = document.getElementById("ringCanvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var w = canvas.width;
  var h = canvas.height;
  var cx = w / 2;
  var cy = h / 2;
  var r = w * 0.36;
  var line = w * 0.07;

  var segments = [
    { v: counts.high || 0, color: "#f43f5e" },
    { v: counts.mid || 0, color: "#f59e0b" },
    { v: counts.low || 0, color: "#64748b" },
    { v: counts.none || 0, color: "#e8e8e8" },
  ];
  var total = segments.reduce(function (a, s) {
    return a + s.v;
  }, 0);
  if (!total) total = 1;

  ctx.clearRect(0, 0, w, h);
  var start = -Math.PI / 2;
  var anim = 0;

  function frame() {
    anim = Math.min(1, anim + 0.04);
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#eeeeee";
    ctx.lineWidth = line;
    ctx.stroke();

    var angle = start;
    segments.forEach(function (seg) {
      var sweep = (seg.v / total) * Math.PI * 2 * anim;
      if (sweep <= 0) return;
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = line;
      ctx.lineCap = "round";
      ctx.stroke();
      angle += sweep;
    });

    if (anim < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
