/**
 * 将 .phone-frame 自动包入 iPhone 预览外框
 */
(function () {
  "use strict";

  if (new URLSearchParams(location.search).has("embed")) return;

  var frame = document.querySelector(".phone-frame");
  if (!frame || frame.closest(".ios-device")) return;

  var statusHtml =
    '<div class="ios-status-bar">' +
    '<span class="ios-status-bar__time">9:41</span>' +
    '<span class="ios-status-bar__island" aria-hidden="true"></span>' +
    '<span class="ios-status-bar__icons" aria-hidden="true">' +
    '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="0.5"/><rect x="5" y="5" width="3" height="7" rx="0.5"/><rect x="10" y="2" width="3" height="10" rx="0.5"/><rect x="15" y="0" width="3" height="12" rx="0.5"/></svg>' +
    '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.4c1.8-1.3 4.2-1.2 5.8.4l.8-.8C11.5-.2 8.2-.4 5.8 1.1 3.4-.4.1-.2-1.6 1.6l.8.8c1.6-1.6 4-1.7 5.8-.4zm0 3c1.2-.9 2.9-.9 4 .1l.8-.8c-1.5-1.4-3.9-1.4-5.4 0l.8.8c1.1-1 2.8-1 4 .1zm0 3c.6-.5 1.5-.5 2 0l1-1.1c-1-.9-2.6-.9-3.6 0L8 8.4zM1 11h14v1H1z"/></svg>' +
    '<svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" stroke-opacity="0.35"/><rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor"/><path d="M24 4.5h2a1.5 1.5 0 010 4h-2v-4z" fill="currentColor" fill-opacity="0.4"/></svg>' +
    "</span></div>";

  var wrap = document.createElement("div");
  wrap.className = "ios-device";
  wrap.setAttribute("aria-label", "iPhone 预览");
  wrap.innerHTML =
    '<div class="ios-device__shell">' +
    '<div class="ios-device__btn ios-device__btn--silent" aria-hidden="true"></div>' +
    '<div class="ios-device__btn ios-device__btn--vol-up" aria-hidden="true"></div>' +
    '<div class="ios-device__btn ios-device__btn--vol-down" aria-hidden="true"></div>' +
    '<div class="ios-device__btn ios-device__btn--power" aria-hidden="true"></div>' +
    '<div class="ios-device__screen"></div></div>';

  var screen = wrap.querySelector(".ios-device__screen");
  screen.insertAdjacentHTML("afterbegin", statusHtml);
  screen.appendChild(frame);
  screen.insertAdjacentHTML(
    "beforeend",
    '<div class="ios-home-indicator" aria-hidden="true"></div>'
  );

  document.body.insertBefore(wrap, document.body.firstChild);
  document.body.classList.add("app-body", "has-ios-device");
})();
