/**
 * 图形验证码 mock
 */
(function (global) {
  var current = "";

  function randomCode(len) {
    var chars = "abcdefghjkmnpqrstuvwxyz23456789";
    var out = "";
    for (var i = 0; i < (len || 5); i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  function refresh() {
    current = randomCode(5);
    var colors = ["#e85d04", "#f48c06", "#dc2f02", "#9d0208", "#370617"];
    var html = "";
    for (var i = 0; i < current.length; i++) {
      var rot = (Math.random() * 40 - 20).toFixed(1);
      html +=
        '<span style="display:inline-block;transform:rotate(' +
        rot +
        "deg);color:" +
        colors[i % colors.length] +
        ';font-weight:700;font-size:18px;letter-spacing:2px">' +
        current.charAt(i) +
        "</span>";
    }
    return { code: current, displayHtml: html };
  }

  function getCode() {
    return current;
  }

  global.InterviewerCaptcha = {
    refresh: refresh,
    getCode: getCode,
  };
})(typeof window !== "undefined" ? window : globalThis);
