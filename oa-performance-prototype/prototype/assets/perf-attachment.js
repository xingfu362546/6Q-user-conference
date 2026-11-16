/**
 * 专项附件：本地选择、预览。图片和 PDF 在弹窗里看，其他格式只显示文件名。
 * 原型把文件转成 dataURL 存在本页数据里，不传后端。
 */
(function () {
  'use strict';

  var MAX = 2 * 1024 * 1024;
  var registry = {};
  var seq = 0;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isPreviewable(att) {
    if (!att || !att.type) return false;
    return /^image\//.test(att.type) || att.type === 'application/pdf';
  }

  function register(att) {
    seq += 1;
    var key = 'att-' + seq;
    registry[key] = att;
    return key;
  }

  /** 只读展示：有附件时是可点的文件名 */
  function link(att, emptyText) {
    if (!att || !att.dataUrl) return '<span class="perf-attach-empty">' + esc(emptyText || '未上传') + '</span>';
    var key = register(att);
    return '<button type="button" class="perf-attach-link" data-att-id="' + key + '">' + esc(att.name) + '</button>';
  }

  function close() {
    var old = document.getElementById('perf-attach-mask');
    if (old) old.remove();
  }

  function preview(att) {
    if (!att) return;
    close();
    var mask = document.createElement('div');
    mask.id = 'perf-attach-mask';
    mask.className = 'perf-attach-mask';
    var body;
    if (att.type === 'application/pdf') {
      body = '<iframe class="perf-attach-frame" src="' + att.dataUrl + '" title="' + esc(att.name) + '"></iframe>';
    } else if (/^image\//.test(att.type || '')) {
      body = '<img class="perf-attach-img" src="' + att.dataUrl + '" alt="' + esc(att.name) + '" />';
    } else {
      body = '<p class="hr-modal-readonly">这个格式不能在线预览，只保留文件名：' + esc(att.name) + '</p>';
    }
    mask.innerHTML =
      '<div class="perf-attach-panel">' +
      '<div class="perf-preview-bar"><h2>' + esc(att.name) + '</h2>' +
      '<span style="display:flex;gap:8px">' +
      '<a class="q-btn" href="' + att.dataUrl + '" download="' + esc(att.name) + '">下载</a>' +
      '<button type="button" class="q-btn" id="perf-attach-close">关闭</button></span></div>' +
      '<div class="perf-attach-body">' + body + '</div></div>';
    document.body.appendChild(mask);
    mask.querySelector('#perf-attach-close').addEventListener('click', close);
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
  }

  function bind(root) {
    (root || document).addEventListener('click', function (e) {
      var btn = e.target.closest('[data-att-id]');
      if (!btn) return;
      e.preventDefault();
      var att = registry[btn.getAttribute('data-att-id')];
      if (att) preview(att);
    });
  }

  /** 选文件。cb(att, error) */
  function pick(cb) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      input.remove();
      if (!file) return;
      if (!/^image\//.test(file.type) && file.type !== 'application/pdf') {
        cb(null, '只支持图片或 PDF');
        return;
      }
      if (file.size > MAX) {
        cb(null, '附件不能超过 2MB');
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        cb({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result }, '');
      };
      reader.onerror = function () { cb(null, '读取文件失败'); };
      reader.readAsDataURL(file);
    });
    input.click();
  }

  window.PerfAttachment = {
    MAX: MAX,
    pick: pick,
    link: link,
    preview: preview,
    bind: bind,
    isPreviewable: isPreviewable
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { bind(document); });
  else bind(document);
})();
