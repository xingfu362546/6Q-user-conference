/**
 * 物料多附件：批量下载（原型用 JSZip 打包；正式环境可改为调后端打包接口）
 */
(function () {
  /**
   * @param {string[]} lineHtmlArray 每条为完整的 .mat-file-line 外层 HTML
   */
  window.oaBuildMatFilesHtml = function (lineHtmlArray) {
    var lines = lineHtmlArray || [];
    var n = lines.length;
    var toolbar =
      n >= 2
        ? '<div class="mat-files-toolbar"><span class="mat-files-toolbar__hint">共 ' +
          n +
          ' 个附件</span><button type="button" class="btn-mat-dl js-mat-batch-dl">批量下载</button></div>'
        : "";
    return '<div class="mat-files">' + toolbar + lines.join("") + "</div>";
  };

  function loadJsZip() {
    if (window.JSZip) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error("JSZip load failed"));
      };
      document.head.appendChild(s);
    });
  }

  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 2000);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".js-mat-batch-dl");
    if (!btn) return;
    e.preventDefault();
    var root = btn.closest(".mat-files");
    if (!root) return;
    var links = root.querySelectorAll(".mat-file-line > a:first-of-type");
    if (links.length < 2) {
      window.alert("仅单个附件时，请直接点击文件名下载。");
      return;
    }
    var prevText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "打包中…";
    loadJsZip()
      .then(function () {
        var zip = new JSZip();
        Array.prototype.forEach.call(links, function (a) {
          var name = (a.textContent || "").trim() || "附件";
          zip.file(name, "（原型占位）正式环境由服务端打包真实附件。\n");
        });
        return zip.generateAsync({ type: "blob" });
      })
      .then(function (blob) {
        var stamp = new Date().toISOString().slice(0, 10);
        triggerDownload(blob, "物料附件_" + stamp + ".zip");
      })
      .catch(function () {
        window.alert("批量下载失败，请检查网络后重试。");
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = prevText;
      });
  });
})();
