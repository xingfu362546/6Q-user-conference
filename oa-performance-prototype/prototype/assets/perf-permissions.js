/**
 * 原型 · 菜单权限演示（正式环境接系统权限中心）
 * 切换：URL ?perm=hr | ?perm=dept | ?perm=payroll | ?perm=employee
 */
(function () {
  'use strict';

  var PRESETS = {
    hr: {
      label: 'HR · 绩效管理',
      menus: { 'hr-plan': true, bonus: true, 'bonus-settle': true, 'perf-results': true },
      resultsScope: 'all',
    },
    dept: {
      label: '部门负责人',
      menus: { 'hr-plan': false, bonus: false, 'bonus-settle': false, 'perf-results': true },
      resultsScope: 'dept',
      deptFilter: '信息部',
    },
    payroll: {
      label: '薪酬',
      menus: { 'hr-plan': false, bonus: false, 'bonus-settle': true, 'perf-results': false },
      resultsScope: 'none',
    },
    employee: {
      label: '普通员工',
      menus: { 'hr-plan': false, bonus: false, 'bonus-settle': false, 'perf-results': false },
      resultsScope: 'none',
    },
  };

  function getPreset() {
    var q = new URLSearchParams(location.search).get('perm');
    return PRESETS[q] || PRESETS.hr;
  }

  function canSeeMenu(key) {
    var p = getPreset();
    return !!(p.menus && p.menus[key]);
  }

  function filterHrSidebarItems(items) {
    return items.filter(function (it) {
      if (it.key === 'plan') return canSeeMenu('hr-plan');
      if (it.key === 'bonus') return canSeeMenu('bonus');
      if (it.key === 'bonus-settle') return canSeeMenu('bonus-settle');
      if (it.key === 'perf-results') return canSeeMenu('perf-results');
      return true;
    });
  }

  function renderPermBanner() {
    var p = getPreset();
    if (!p || p === PRESETS.hr) return;
    var el = document.createElement('div');
    el.className = 'perf-perm-banner';
    el.innerHTML = '🔐 权限演示：<strong>' + p.label + '</strong> · <a href="?">切换为 HR</a>';
    var page = document.querySelector('.q-oa-page');
    if (page) page.insertBefore(el, page.firstChild);
  }

  window.PerfPermissions = {
    PRESETS: PRESETS,
    getPreset: getPreset,
    canSeeMenu: canSeeMenu,
    filterHrSidebarItems: filterHrSidebarItems,
    renderPermBanner: renderPermBanner,
  };
})();
