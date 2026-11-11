/**
 * 把整张绩效表节点导出成 PNG。
 */
(function () {
  'use strict';

  function filename(name, period) {
    return (name || '员工') + '-' + (period || '考核') + '.png';
  }

  function download(dataUrl, name) {
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
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

  window.PerfExportImage = { exportNode: exportNode, filename: filename };
})();
