/**
 * 员工填表 · 从往期提交复制 KR 结构（O/SMART/权重/考核标准）
 * 不复制：关键成果 M、自评分、加减分、自评总结、下月目标、行为关键事件
 */
(function () {
  'use strict';

  var PAST_FORM_SNAPSHOTS = {
    m202603: {
      id: 'm202603',
      periodLabel: '2026年3月',
      submittedAt: '2026-03-28 17:32',
      formType: 'month',
      form: {
        coreKrs: [
          {
            block: 'V',
            o: '推动绩效系统需求评审与方案落地，确保 HR、信息部对考核模板与双端填表链路形成一致认知。',
            smart: '6/30 前完成 PRD 评审；覆盖月度/季度模板；组织至少 2 轮跨部门评审。',
            weight: '25',
            standardTiers: [
              { label: '业绩达成率 ≥ 100%', score: 25 },
              { label: '100% > 业绩达成率 ≥ 90%', score: 20 },
              { label: '90% > 业绩达成率 ≥ 80%', score: 15 },
              { label: '80% > 业绩达成率 ≥ 70%', score: 10 },
              { label: '业绩达成率 < 70%', score: 0 },
            ],
          },
          {
            block: 'V',
            o: '输出可评审的 HTML 交互原型，支撑业务方走查员工填表—上级评分主链路。',
            smart: '3/31 前交付 prototype 入口；员工端含月度向导；走查反馈 24h 内登记。',
            weight: '22',
            standardTiers: [
              { label: '业绩达成率 ≥ 100%', score: 22 },
              { label: '100% > 业绩达成率 ≥ 90%', score: 18 },
              { label: '90% > 业绩达成率 ≥ 80%', score: 13 },
              { label: '80% > 业绩达成率 ≥ 70%', score: 9 },
              { label: '业绩达成率 < 70%', score: 0 },
            ],
          },
        ],
        regularKrs: [
          {
            block: 'X',
            o: '跨部门需求响应与会议协同',
            smart: '工作日内 24h 响应；重要会议提前 1 天准备材料。',
            weight: '8',
            standardTiers: [
              { label: '业绩达成率 ≥ 100%', score: 8 },
              { label: '100% > 业绩达成率 ≥ 90%', score: 6 },
              { label: '90% > 业绩达成率 ≥ 80%', score: 5 },
              { label: '80% > 业绩达成率 ≥ 70%', score: 3 },
              { label: '业绩达成率 < 70%', score: 0 },
            ],
          },
        ],
      },
    },
    m202602: {
      id: 'm202602',
      periodLabel: '2026年2月',
      submittedAt: '2026-02-26 18:10',
      formType: 'month',
      form: {
        coreKrs: [
          {
            block: 'V',
            o: '完成绩效模块需求调研与竞品对标，输出调研报告。',
            smart: '2/28 前完成；覆盖 3 家以上对标产品；含流程图与字段清单。',
            weight: '30',
            standardTiers: [
              { label: '业绩达成率 ≥ 100%', score: 30 },
              { label: '100% > 业绩达成率 ≥ 90%', score: 24 },
              { label: '90% > 业绩达成率 ≥ 80%', score: 18 },
              { label: '80% > 业绩达成率 ≥ 70%', score: 12 },
              { label: '业绩达成率 < 70%', score: 0 },
            ],
          },
          {
            block: 'V',
            o: '协同 HR 梳理月度/季度模板字段差异，建立对照表。',
            smart: '2/25 前输出 Excel 对照；识别 ≥5 处职级差异。',
            weight: '20',
            standardTiers: [
              { label: '业绩达成率 ≥ 100%', score: 20 },
              { label: '100% > 业绩达成率 ≥ 90%', score: 16 },
              { label: '90% > 业绩达成率 ≥ 80%', score: 12 },
              { label: '80% > 业绩达成率 ≥ 70%', score: 8 },
              { label: '业绩达成率 < 70%', score: 0 },
            ],
          },
        ],
        regularKrs: [
          {
            block: 'X',
            o: '部门周会组织与纪要沉淀',
            smart: '每周例会准时；纪要 24h 内归档。',
            weight: '10',
            standardTiers: [
              { label: '业绩达成率 ≥ 100%', score: 10 },
              { label: '100% > 业绩达成率 ≥ 90%', score: 8 },
              { label: '90% > 业绩达成率 ≥ 80%', score: 6 },
              { label: '80% > 业绩达成率 ≥ 70%', score: 4 },
              { label: '业绩达成率 < 70%', score: 0 },
            ],
          },
        ],
      },
    },
  };

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function cloneKr(kr) {
    return {
      block: kr.block || 'V',
      o: kr.o || '',
      smart: kr.smart || '',
      weight: kr.weight != null ? String(kr.weight) : '',
      standardTiers: (kr.standardTiers || []).map(function (t) {
        return { label: t.label, score: t.score };
      }),
      m: '',
      selfScore: '',
    };
  }

  function listPastSnapshots(formType) {
    return Object.keys(PAST_FORM_SNAPSHOTS)
      .map(function (k) { return PAST_FORM_SNAPSHOTS[k]; })
      .filter(function (s) { return !formType || s.formType === formType; })
      .sort(function (a, b) { return b.submittedAt.localeCompare(a.submittedAt); });
  }

  function getSnapshot(id) {
    return PAST_FORM_SNAPSHOTS[id] || null;
  }

  /** 将往期 KR 结构合并进月度 draft（保留 step、openKr；清空自评相关） */
  function applySnapshotToMonthlyState(state, snapshotId) {
    var snap = getSnapshot(snapshotId);
    if (!snap || !snap.form) return null;

    var src = snap.form;
    state.coreKrs = (src.coreKrs || []).map(cloneKr);
    state.regularKrs = (src.regularKrs && src.regularKrs.length)
      ? src.regularKrs.map(cloneKr)
      : [{ block: 'X', o: '', smart: '', weight: '', standardTiers: [], m: '', selfScore: '' }];

    if (typeof defaultStandardTiers === 'function') {
      state.coreKrs.forEach(function (kr) {
        if (!kr.standardTiers || !kr.standardTiers.length) {
          kr.standardTiers = defaultStandardTiers(kr.weight || 25);
        }
      });
      state.regularKrs.forEach(function (kr) {
        if (!kr.standardTiers || !kr.standardTiers.length) {
          kr.standardTiers = defaultStandardTiers(kr.weight || 25);
        }
      });
    }

    if (typeof BEHAVIOR_ITEMS !== 'undefined') {
      state.behaviorEvents = BEHAVIOR_ITEMS.map(function () { return ''; });
      state.behaviorSelfScores = BEHAVIOR_ITEMS.map(function () { return ''; });
    }

    state.plusRows = [{ type: '加分', desc: '', score: '' }];
    state.minusRows = [{ type: '减分', desc: '', score: '' }];
    state.selfSummary = '';

    if (typeof defaultStandardTiers === 'function') {
      state.nextMonthKrs = [
        { o: '', smart: '', weight: '', standardTiers: defaultStandardTiers(25), challenge: '' },
        { o: '', smart: '', weight: '', standardTiers: defaultStandardTiers(25), challenge: '' },
      ];
    }

    state.copiedFrom = { id: snap.id, periodLabel: snap.periodLabel, at: new Date().toISOString() };
    state.step = 1;
    state.openKr = {};

    if (typeof normalizeState === 'function') normalizeState(state);
    return state;
  }

  function isMiniappContext() {
    return !!document.querySelector('.mp-screen');
  }

  function getModalMount() {
    return document.querySelector('.mp-screen') || document.body;
  }

  function useSheetLayout() {
    return isMiniappContext() || (typeof window !== 'undefined' && window.innerWidth <= 480);
  }

  function syncModalLayout(mask) {
    if (!mask) return;
    var sheet = useSheetLayout();
    mask.classList.toggle('past-copy-modal-mask--in-mp', isMiniappContext());
    mask.classList.toggle('past-copy-modal-mask--sheet', sheet);
    var hint = mask.querySelector('.past-copy-modal__hint');
    if (hint) {
      hint.innerHTML = sheet
        ? '复制 <strong>O · SMART · 权重 · 标准</strong>，不含成果与自评。将覆盖当前草稿。'
        : '复制 <strong>O · SMART · 权重 · 考核标准</strong>，不含关键成果、自评与加减分。当前草稿将被覆盖。';
    }
  }

  function setScrollLock(on) {
    var screen = document.querySelector('.mp-screen');
    if (screen) screen.classList.toggle('mp-scroll-lock', on);
    document.documentElement.classList.toggle('past-copy-scroll-lock', on);
  }

  function ensureModal() {
    var mount = getModalMount();
    var mask = document.getElementById('past-copy-modal-mask');
    if (mask && mask.parentElement !== mount) mount.appendChild(mask);

    if (!mask) {
      mask = document.createElement('div');
      mask.id = 'past-copy-modal-mask';
      mask.className = 'past-copy-modal-mask';
      mask.innerHTML =
        '<div class="past-copy-modal" role="dialog" aria-labelledby="past-copy-modal-title">' +
        '<div class="past-copy-modal__handle" aria-hidden="true"></div>' +
        '<div class="past-copy-modal__head">' +
        '<h3 id="past-copy-modal-title">从往期复制</h3>' +
        '<button type="button" class="past-copy-modal__close" aria-label="关闭">×</button></div>' +
        '<p class="past-copy-modal__hint"></p>' +
        '<ul class="past-copy-modal__list" id="past-copy-modal-list"></ul>' +
        '<div class="past-copy-modal__foot">' +
        '<button type="button" class="past-copy-modal__cancel">取消</button></div></div>';
      mount.appendChild(mask);

      mask.addEventListener('click', function (e) {
        if (e.target === mask) closeModal();
      });
      mask.querySelector('.past-copy-modal__close').addEventListener('click', closeModal);
      mask.querySelector('.past-copy-modal__cancel').addEventListener('click', closeModal);
    }

    syncModalLayout(mask);
    return mask;
  }

  var modalOpts = null;

  function closeModal() {
    var mask = document.getElementById('past-copy-modal-mask');
    if (mask) mask.classList.remove('is-open');
    setScrollLock(false);
    modalOpts = null;
  }

  function openModal(opts) {
    opts = opts || {};
    modalOpts = opts;
    var list = listPastSnapshots(opts.formType || 'month');
    var mask = ensureModal();
    syncModalLayout(mask);
    var ul = mask.querySelector('#past-copy-modal-list');
    var compact = useSheetLayout();

    if (!list.length) {
      ul.innerHTML = '<li class="past-copy-modal__empty">暂无可复制的往期提交</li>';
    } else {
      ul.innerHTML = list.map(function (s) {
        var nCore = (s.form.coreKrs || []).length;
        var nReg = (s.form.regularKrs || []).length;
        var meta = compact
          ? ('提交 ' + esc(s.submittedAt.slice(5, 10)) + ' · 核心' + nCore + ' · 常规' + nReg)
          : ('提交于 ' + esc(s.submittedAt) + ' · 核心 ' + nCore + ' 项 · 常规 ' + nReg + ' 项');
        return '<li><button type="button" class="past-copy-modal__item" data-snap-id="' + esc(s.id) + '">' +
          '<span class="past-copy-modal__item-title">' + esc(s.periodLabel) + ' · 月度</span>' +
          '<span class="past-copy-modal__item-meta">' + meta + '</span>' +
          '</button></li>';
      }).join('');

      ul.querySelectorAll('[data-snap-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.dataset.snapId;
          var snap = getSnapshot(id);
          if (!snap) return;
          if (!confirm('确定从「' + snap.periodLabel + '」复制 KR 结构？\n\n将覆盖当前草稿中的目标与考核标准，自评内容不会复制。')) return;

          if (opts.storageKey && typeof loadState === 'function' && typeof saveState === 'function') {
            var state = loadState(opts.storageKey);
            applySnapshotToMonthlyState(state, id);
            saveState(opts.storageKey, state);
            closeModal();
            if (typeof opts.onApplied === 'function') opts.onApplied(state, id);
            else alert('已从「' + snap.periodLabel + '」复制 KR 结构');
            return;
          }

          if (typeof opts.onApplied === 'function') {
            closeModal();
            opts.onApplied(id, snap);
          }
        });
      });
    }

    setScrollLock(true);
    mask.classList.add('is-open');
  }

  function bindCopyButtons(root, opts) {
    (root || document).querySelectorAll('[data-copy-past]').forEach(function (btn) {
      if (btn.dataset.copyBound) return;
      btn.dataset.copyBound = '1';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openModal({
          formType: btn.dataset.copyPast || 'month',
          storageKey: btn.dataset.storageKey || opts.storageKey,
          wizardHref: btn.dataset.wizardHref || opts.wizardHref,
          onApplied: function (state, id) {
            if (opts.onApplied) opts.onApplied(state, id);
            else if (btn.dataset.wizardHref) location.href = btn.dataset.wizardHref + (id ? '?copyFrom=' + encodeURIComponent(id) : '');
            else alert('已从往期复制 KR 结构，请进入填表页查看');
          },
        });
      });
    });
  }

  window.EmployeePastCopy = {
    PAST_FORM_SNAPSHOTS: PAST_FORM_SNAPSHOTS,
    listPastSnapshots: listPastSnapshots,
    getSnapshot: getSnapshot,
    applySnapshotToMonthlyState: applySnapshotToMonthlyState,
    openModal: openModal,
    bindCopyButtons: bindCopyButtons,
  };
})();
