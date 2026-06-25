/**
 * 分管领导 · 部门绩效（v1.3）
 * 已合并至 supervisor-review-list · 本模块保留兼容入口
 */
(function () {
  'use strict';

  function initPage() {
    if (window.SupervisorScore) {
      SupervisorScore.renderReviewList(document.getElementById('division-dept-body') || document.getElementById('review-list-body'));
    }
  }

  window.DivisionDeptList = {
    initPage: initPage,
    get ROSTER() {
      return window.SupervisorScore ? SupervisorScore.DEPT_ROSTER : [];
    },
  };
})();
