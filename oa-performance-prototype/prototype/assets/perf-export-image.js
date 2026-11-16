/**
 * 把整张绩效表节点导出成 PNG。
 */
(function () {
  'use strict';

  function filename(name, period) {
    return (name || '员工') + '-' + (period || '考核') + '.pdf';
  }

  function download(dataUrl, name) {
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /**
   * 导出 PDF：把整表写进隐藏 iframe，调浏览器打印，用户在打印对话框选「另存为 PDF」。
   * 文件名由 iframe 的 title 带出。v1.5.3 起不再直接下载 PNG。
   */
  function exportPdf(node, file) {
    if (!node) return Promise.reject(new Error('没有可导出的表'));
    var title = String(file || '绩效表.pdf').replace(/\.pdf$/i, '');
    var styles = Array.prototype.map.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) {
      return '<link rel="stylesheet" href="' + l.href + '">';
    }).join('');
    var frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    frame.setAttribute('aria-hidden', 'true');
    document.body.appendChild(frame);
    var doc = frame.contentWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title.replace(/</g, '&lt;') + '</title>' +
      styles +
      '<style>@page{size:A4 landscape;margin:8mm}body{background:#fff;margin:0;padding:8px;font-family:"Microsoft YaHei",sans-serif}' +
      '.perf-preview-scale{zoom:1!important}#perf-preview-export-root{width:auto!important}' +
      '.score-actions,.perf-preview-bar{display:none!important}</style>' +
      '</head><body>' + node.innerHTML + '</body></html>');
    doc.close();
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
          resolve(frame);
        } catch (err) {
          frame.remove();
          reject(err);
        }
      }, 600);
    });
  }

  function exportNode(node, file) {
    if (!node) return Promise.reject(new Error('没有可导出的表'));
    if (!window.htmlToImage || !htmlToImage.toPng) {
      return Promise.reject(new Error('导出组件未加载'));
    }
    return htmlToImage.toPng(node, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      cacheBust: true
    }).then(function (url) {
      download(url, file);
      return url;
    });
  }

  window.PerfExportImage = { exportNode: exportNode, exportPdf: exportPdf, filename: filename };
})();
