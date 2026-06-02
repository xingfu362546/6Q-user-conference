/**
 * 学员意向分析 · 交互与 mock 数据
 */
(function (global) {
  "use strict";

  var AI_SCORE_MAX = 25;
  var TIP_LIST_MAX = 28;
  var TAG_TREE = window.INTENT_TAG_TREE || [];
  var TAG_FLAT = window.INTENT_TAG_FLAT || [];

  var STUDENTS = [
    {
      id: "m10001",
      name: "陈晓明",
      phone: "138****2201",
      hits: ["tag_1233", "tag_3301", "tag_4402", "tag_5503"],
      follow: {
        tag: "有意向用户",
        content: "学员今天找我了解了《如何说孩子》进阶班，希望开课前电话沟通，预算在 8k 左右。",
        time: "2025-04-02",
      },
      ai: { score: 22, summary: "意向明确，匹配本期亲子课程", full: "结合亲子偏好、近期消费高与跟进内容：学员主动咨询进阶班并给出预算，建议优先安排会销席位。" },
      community: "发帖：孩子沟通技巧求推荐",
      learn: "近年 3 门 · 《情绪管理入门》",
      video: "亲子类 Top · 《正面管教片段》",
    },
    {
      id: "m10002",
      name: "李美琳",
      phone: "139****8832",
      hits: ["tag_1233", "tag_3301"],
      follow: {
        tag: "待回访",
        content: "电话沟通提到价格敏感，希望了解分期与优惠政策，暂未承诺到课。",
        time: "2025-04-01",
      },
      ai: { score: 14, summary: "有需求但价格敏感", full: "标签显示亲子与消费潜力；跟进强调分期诉求，建议推送优惠方案后再判高意向。" },
      community: "近 7 天无发帖",
      learn: "近年 1 门",
      video: "教育类 · 《亲子沟通》",
    },
    {
      id: "m10003",
      name: "王建国",
      phone: "136****0091",
      hits: ["tag_4402", "tag_6604"],
      follow: { tag: "—", content: "—", time: "—" },
      ai: { score: 8, summary: "行为标签尚可，缺跟进", full: "命中课程浏览与高价值分层，暂无会务跟进记录，AI 分偏低；建议补跟进后重新分析。" },
      community: "评论：会务场地咨询",
      learn: "近年 5 门",
      video: "家庭关系 · 《夫妻沟通》",
    },
    {
      id: "m10004",
      name: "赵雅琴",
      phone: "137****5560",
      hits: ["tag_5503"],
      follow: {
        tag: "有意向用户",
        content: "已添加企微，约定本周试听线上课，对导师风格比较在意。",
        time: "2025-04-03",
      },
      ai: { score: 18, summary: "跟进积极，待试听转化", full: "社区活跃+跟进显示已建联并约试听；标签单一，需试听结果提升意向分。" },
      community: "发帖：分享学习心得",
      learn: "近年 2 门",
      video: "个人成长",
    },
    {
      id: "m10005",
      name: "张志远",
      phone: "135****7712",
      hits: ["tag_1233", "tag_3301", "tag_4402", "tag_6604", "tag_7705"],
      follow: {
        tag: "高意向",
        content: "明确要买本期配套课程包，需确认席位与发票抬头，希望当天签约。",
        time: "2025-04-04",
      },
      ai: { score: 25, summary: "强意向，建议立即锁席", full: "多标签命中+跟进确认购课意向；AI 分顶格，建议会务优先接待并推进签约。" },
      community: "发帖：咨询套餐优惠",
      learn: "近年 6 门 · 《如何说孩子》",
      video: "亲子类 · 累计>120分钟",
    },
    {
      id: "m10006",
      name: "刘慧敏",
      phone: "158****3344",
      hits: ["tag_2201"],
      follow: { tag: "—", content: "—", time: "—" },
      ai: { score: 3, summary: "新学员，数据不足", full: "仅基础渠道标签，无跟进与行为沉淀，暂维持低分观察。" },
      community: "—",
      learn: "新学员",
      video: "—",
    },
  ];

  var PICKER_TITLES = {
    watch: "选择关注标签",
    high: "选择高意向标签",
    mid: "选择中意向标签",
    low: "选择低意向标签",
  };

  var state = global.IntentStrategyCore
    ? global.IntentStrategyCore.cloneConfig(global.IntentStrategyCore.getActiveConfig())
    : {
        watchTags: ["tag_1233", "tag_3301", "tag_4402"],
        watchLogic: "any",
        intentMode: "score",
        thresholdHigh: 70,
        thresholdMid: 45,
        thresholdLow: 25,
        high: { tags: ["tag_1233", "tag_3301", "tag_4402"], logic: "all" },
        mid: { tags: ["tag_1233", "tag_5503"], logic: "all" },
        low: { tags: ["tag_2201"], logic: "any" },
      };

  state.search = "";
  state.pickerTarget = null;
  state.treeExpanded = { pref: true, base: false, seg: false, fin: false, beh: true };

  function getPageKind() {
    return document.body.getAttribute("data-cf-page") || "";
  }

  function isAnalysisPage() {
    return getPageKind() === "intent";
  }

  function isEditorPage() {
    return getPageKind() === "template-edit";
  }

  function refreshEditorUI() {
    readFormFromState();
  }

  function reloadConfigFromCore() {
    if (!global.IntentStrategyCore) return;
    var c = global.IntentStrategyCore.getActiveConfig();
    Object.keys(c).forEach(function (k) {
      if (k !== "search" && k !== "pickerTarget" && k !== "treeExpanded") {
        state[k] = global.IntentStrategyCore.cloneConfig(c[k]) || c[k];
      }
    });
  }

  function renderStrategyBanner() {
    var el = document.getElementById("intent-strategy-banner");
    if (!el || !global.IntentStrategyCore) return;
    if (!global.IntentStrategyCore.isConferenceConfigured()) {
      el.className = "intent-strategy-banner intent-strategy-banner--empty";
      el.innerHTML =
        '<div class="intent-strategy-banner__inner">' +
        "<strong>尚未配置本期分析策略</strong>" +
        "<p>请由具备配置权限的会务统筹，先选用模板并保存，再查看学员意向列表。</p>" +
        '<a class="q-btn q-btn--primary q-btn--sm" href="conference-intent-strategy.html">去配置本期策略</a>' +
        "</div>";
      return;
    }
    var meta = global.IntentStrategyCore.getConferenceConfig();
    el.className = "intent-strategy-banner intent-strategy-banner--readonly";
    el.innerHTML =
      '<div class="intent-strategy-banner__inner">' +
      '<span class="intent-strategy-banner__label">当前策略（只读）</span>' +
      "<p>" +
      escapeHtml(global.IntentStrategyCore.formatSummary(state, meta)) +
      "</p>" +
      '<span class="intent-strategy-banner__hint">修改请前往「本期分析策略」或会务工具「分析策略模板」</span>' +
      "</div>";
  }

  var AVATAR_GRADIENTS = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#0ea5e9,#06b6d4)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#ec4899,#8b5cf6)",
    "linear-gradient(135deg,#64748b,#475569)",
  ];

  function tagByCode(code) {
    return TAG_FLAT.find(function (t) {
      return t.code === code;
    });
  }

  function tagScore(hits) {
    var sum = 0;
    hits.forEach(function (code) {
      var t = tagByCode(code);
      if (t) sum += t.weight;
    });
    return sum;
  }

  function totalScore(s) {
    var ai = s.ai && s.ai.score ? Math.min(AI_SCORE_MAX, Math.max(0, s.ai.score)) : 0;
    return tagScore(s.hits) + ai;
  }

  function intentLevelByScore(total) {
    if (total >= state.thresholdHigh) return { key: "high", label: "高" };
    if (total >= state.thresholdMid) return { key: "mid", label: "中" };
    if (total >= state.thresholdLow) return { key: "low", label: "低" };
    return { key: "none", label: "未分级" };
  }

  function intentLevelByTags(hits) {
    if (matchCombo(hits, state.high.tags, state.high.logic)) return { key: "high", label: "高" };
    if (matchCombo(hits, state.mid.tags, state.mid.logic)) return { key: "mid", label: "中" };
    if (matchCombo(hits, state.low.tags, state.low.logic)) return { key: "low", label: "低" };
    return { key: "none", label: "未分级" };
  }

  function getIntentLevel(student) {
    if (state.intentMode === "tags") return intentLevelByTags(student.hits);
    return intentLevelByScore(totalScore(student));
  }

  function matchCombo(hits, tags, logic) {
    if (!tags.length) return false;
    var set = {};
    hits.forEach(function (c) {
      set[c] = true;
    });
    if (logic === "all") return tags.every(function (c) {
      return set[c];
    });
    return tags.some(function (c) {
      return set[c];
    });
  }

  function truncate(s, max) {
    max = max || TIP_LIST_MAX;
    if (!s || s === "—") return "—";
    return s.length <= max ? s : s.slice(0, max) + "…";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function tipCell(short, full) {
    if (!short || short === "—") return '<span class="intent-summary">—</span>';
    var f = full && full !== short ? full : short;
    if (f.length <= TIP_LIST_MAX && short === truncate(f)) {
      return '<span class="intent-summary">' + escapeHtml(short) + "</span>";
    }
    return (
      '<span class="intent-tip" tabindex="0" data-tip="' +
      escapeAttr(f) +
      '">' +
      escapeHtml(truncate(short)) +
      '<span class="intent-tip__popup" role="tooltip">' +
      escapeHtml(f) +
      "</span></span>"
    );
  }

  function avatarStyle(id) {
    var n = 0;
    for (var i = 0; i < id.length; i++) n += id.charCodeAt(i);
    return AVATAR_GRADIENTS[n % AVATAR_GRADIENTS.length];
  }

  function getTagsForTarget(target) {
    if (target === "watch") return state.watchTags;
    if (target === "high") return state.high.tags;
    if (target === "mid") return state.mid.tags;
    if (target === "low") return state.low.tags;
    return [];
  }

  function setTagsForTarget(target, codes) {
    if (target === "watch") state.watchTags = codes;
    else if (target === "high") state.high.tags = codes;
    else if (target === "mid") state.mid.tags = codes;
    else if (target === "low") state.low.tags = codes;
  }

  function removeTagFromTarget(code, target) {
    setTagsForTarget(
      target,
      getTagsForTarget(target).filter(function (c) {
        return c !== code;
      })
    );
  }

  function renderChips(container, codes, pickTarget) {
    if (!container) return;
    container.innerHTML = "";
    if (!codes.length) {
      container.innerHTML =
        '<span class="intent-chip intent-chip--placeholder">点击按一级分类选择标签…</span>';
      return;
    }
    codes.forEach(function (code) {
      var t = tagByCode(code);
      if (!t) return;
      var chip = document.createElement("span");
      chip.className = "intent-chip";
      chip.title = t.parentName + " / " + t.name;
      chip.innerHTML =
        '<span class="intent-chip__main"><span class="intent-chip__path">' +
        escapeHtml(t.parentName) +
        '</span><span class="intent-chip__name">' +
        escapeHtml(t.name) +
        "</span></span>" +
        (pickTarget
          ? '<button type="button" class="intent-chip__remove" data-remove="' +
            code +
            '" aria-label="移除">×</button>'
          : "");
      container.appendChild(chip);
    });
    if (pickTarget) {
      container.querySelectorAll(".intent-chip__remove").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          removeTagFromTarget(btn.getAttribute("data-remove"), pickTarget);
          if (isAnalysisPage()) {
            renderAll();
          } else {
            refreshEditorUI();
          }
        });
      });
    }
  }

  function syncFormToState() {
    var modeEl = document.querySelector('input[name="intent-mode"]:checked');
    var wl = document.getElementById("watch-logic");
    var hl = document.getElementById("high-logic");
    var ml = document.getElementById("mid-logic");
    var ll = document.getElementById("low-logic");
    var th = document.getElementById("threshold-high");
    var tm = document.getElementById("threshold-mid");
    var tl = document.getElementById("threshold-low");
    if (modeEl) state.intentMode = modeEl.value;
    if (wl) state.watchLogic = wl.value;
    if (hl) state.high.logic = hl.value;
    if (ml) state.mid.logic = ml.value;
    if (ll) state.low.logic = ll.value;
    if (th) state.thresholdHigh = Number(th.value) || 0;
    if (tm) state.thresholdMid = Number(tm.value) || 0;
    if (tl) state.thresholdLow = Number(tl.value) || 0;
  }

  function toggleIntentModePanels() {
    var scoreBlock = document.getElementById("intent-config-score");
    var tagsBlock = document.getElementById("intent-config-tags");
    var isScore = state.intentMode === "score";
    if (scoreBlock) scoreBlock.hidden = !isScore;
    if (tagsBlock) tagsBlock.hidden = isScore;
  }

  function readFormFromState() {
    var modeInputs = document.querySelectorAll('input[name="intent-mode"]');
    modeInputs.forEach(function (inp) {
      inp.checked = inp.value === state.intentMode;
    });
    toggleIntentModePanels();
    var wl = document.getElementById("watch-logic");
    var hl = document.getElementById("high-logic");
    var ml = document.getElementById("mid-logic");
    var ll = document.getElementById("low-logic");
    var th = document.getElementById("threshold-high");
    var tm = document.getElementById("threshold-mid");
    var tl = document.getElementById("threshold-low");
    if (wl) wl.value = state.watchLogic;
    if (hl) hl.value = state.high.logic;
    if (ml) ml.value = state.mid.logic;
    if (ll) ll.value = state.low.logic;
    if (th) th.value = state.thresholdHigh;
    if (tm) tm.value = state.thresholdMid;
    if (tl) tl.value = state.thresholdLow;
    renderChips(document.getElementById("watch-chips"), state.watchTags, "watch");
    renderChips(document.getElementById("high-chips"), state.high.tags, "high");
    renderChips(document.getElementById("mid-chips"), state.mid.tags, "mid");
    renderChips(document.getElementById("low-chips"), state.low.tags, "low");
  }

  function filteredStudents() {
    var q = (state.search || "").trim().toLowerCase();
    return STUDENTS.filter(function (s) {
      if (state.watchTags.length && !matchCombo(s.hits, state.watchTags, state.watchLogic)) {
        return false;
      }
      if (!q) return true;
      return s.name.toLowerCase().indexOf(q) !== -1 || s.id.toLowerCase().indexOf(q) !== -1;
    });
  }

  function updateStats(list) {
    var highCount = STUDENTS.filter(function (s) {
      return getIntentLevel(s).key === "high";
    }).length;
    var watchHit = STUDENTS.filter(function (s) {
      return state.watchTags.length && matchCombo(s.hits, state.watchTags, state.watchLogic);
    }).length;
    setText("stat-total", STUDENTS.length);
    setText("stat-watch", watchHit);
    setText("stat-high", highCount);
    setText("stat-list", list.length);
  }

  function setText(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(v);
  }

  function levelPillClass(key) {
    return "intent-level-pill intent-level-pill--" + key;
  }

  function renderTable() {
    var tbody = document.getElementById("student-tbody");
    if (!tbody) return;
    var list = filteredStudents().slice().sort(function (a, b) {
      return totalScore(b) - totalScore(a);
    });
    updateStats(list);
    if (!list.length) {
      var cols = 11;
      tbody.innerHTML =
        '<tr><td colspan="' +
        cols +
        '" style="text-align:center;padding:48px;color:#94a3b8">' +
        (global.IntentStrategyCore && !global.IntentStrategyCore.isConferenceConfigured()
          ? "请先配置本期分析策略"
          : "暂无符合筛选条件的学员") +
        "</td></tr>";
      return;
    }
    tbody.innerHTML = list
      .map(function (s) {
        var total = totalScore(s);
        var lv = getIntentLevel(s);
        var tScore = tagScore(s.hits);
        var aiSc = s.ai ? s.ai.score : 0;
        var initial = s.name.charAt(0);
        var grad = avatarStyle(s.id);
        var chips = s.hits
          .map(function (c) {
            var t = tagByCode(c);
            return t
              ? '<span class="intent-chip intent-chip--hit intent-chip--compact" title="' +
                escapeAttr(t.parentName + " / " + t.name) +
                '">' +
                escapeHtml(t.name) +
                "</span>"
              : "";
          })
          .join("");
        var followShort =
          s.follow.content === "—" ? "—" : truncate(s.follow.content, 24);
        var aiShort = s.ai && s.ai.summary ? s.ai.summary : "—";
        var scoreTip =
          "标签 " + tScore + " 分 + AI " + aiSc + " 分（AI 最高 " + AI_SCORE_MAX + "）";
        return (
          "<tr>" +
          '<td><div class="intent-student">' +
          '<span class="intent-avatar" style="background:' +
          grad +
          '">' +
          initial +
          "</span><div><div class=\"intent-student__name\">" +
          escapeHtml(s.name) +
          '</div><div class="intent-student__meta">' +
          escapeHtml(s.id) +
          " · " +
          escapeHtml(s.phone) +
          "</div></div></div></td>" +
          '<td><span class="intent-score intent-tip" tabindex="0" data-tip="' +
          escapeAttr(scoreTip) +
          '">' +
          total +
          '<span class="intent-tip__popup" role="tooltip">' +
          escapeHtml(scoreTip) +
          "</span></span></td>" +
          '<td><span class="' +
          levelPillClass(lv.key) +
          '">' +
          lv.label +
          "</span></td>" +
          "<td>" +
          (chips || "—") +
          "</td>" +
          "<td>" +
          tipCell(followShort, s.follow.content) +
          "</td>" +
          "<td>" +
          tipCell(aiShort, s.ai ? s.ai.full : "") +
          "</td>" +
          "<td>" +
          (window.CourseRecommend
            ? window.CourseRecommend.renderTableCell(s)
            : "—") +
          "</td>" +
          "<td>" +
          tipCell(truncate(s.community, 22), s.community) +
          "</td>" +
          "<td>" +
          tipCell(truncate(s.learn, 22), s.learn) +
          "</td>" +
          "<td>" +
          tipCell(truncate(s.video, 22), s.video) +
          "</td>" +
          '<td><button type="button" class="q-btn q-btn--link q-btn--sm" data-open-drawer="' +
          s.id +
          '">查看明细</button></td>' +
          "</tr>"
        );
      })
      .join("");
    tbody.querySelectorAll("[data-open-drawer]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openDrawer(btn.getAttribute("data-open-drawer"));
      });
    });
  }

  function renderTagTreePicker() {
    var list = document.getElementById("picker-list");
    if (!list || !state.pickerTarget) return;
    var selected = getTagsForTarget(state.pickerTarget).slice();
    list.innerHTML = TAG_TREE.map(function (group) {
      var expanded = state.treeExpanded[group.id];
      var toggle = expanded ? "−" : "+";
      var childrenHtml = group.children
        .map(function (t) {
          var checked = selected.indexOf(t.code) !== -1 ? " checked" : "";
          return (
            '<label class="intent-tree__leaf">' +
            '<input type="checkbox" value="' +
            t.code +
            '"' +
            checked +
            ">" +
            "<span><strong>" +
            escapeHtml(t.name) +
            '</strong><span class="intent-tree__meta">' +
            escapeHtml(t.code) +
            " · " +
            escapeHtml(t.type) +
            " · 权重 " +
            t.weight +
            "</span></span></label>"
          );
        })
        .join("");
      return (
        '<div class="intent-tree__group" data-group="' +
        group.id +
        '">' +
        '<button type="button" class="intent-tree__parent" data-tree-toggle="' +
        group.id +
        '">' +
        '<span class="intent-tree__toggle">' +
        toggle +
        "</span>" +
        escapeHtml(group.name) +
        '<span class="intent-tree__badge">一级</span></button>' +
        '<div class="intent-tree__children"' +
        (expanded ? "" : ' hidden') +
        ">" +
        childrenHtml +
        "</div></div>"
      );
    }).join("");

    list.querySelectorAll("[data-tree-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var gid = btn.getAttribute("data-tree-toggle");
        state.treeExpanded[gid] = !state.treeExpanded[gid];
        renderTagTreePicker();
      });
    });
  }

  function openPicker(target) {
    if (!PICKER_TITLES[target]) return;
    state.pickerTarget = target;
    document.getElementById("picker-title").textContent = PICKER_TITLES[target];
    renderTagTreePicker();
    document.getElementById("picker-modal").classList.add("is-open");
  }

  function applyPicker() {
    var codes = [];
    document.querySelectorAll("#picker-list input:checked").forEach(function (inp) {
      codes.push(inp.value);
    });
    if (state.pickerTarget) setTagsForTarget(state.pickerTarget, codes);
    document.getElementById("picker-modal").classList.remove("is-open");
    if (isAnalysisPage()) {
      renderAll();
    } else {
      refreshEditorUI();
    }
  }

  function openDrawer(memberId) {
    var s = STUDENTS.find(function (x) {
      return x.id === memberId;
    });
    if (!s) return;
    var total = totalScore(s);
    var lv = getIntentLevel(s);
    var backdrop = document.getElementById("drawer-backdrop");
    document.getElementById("drawer-name").textContent = s.name;
    document.getElementById("drawer-meta").textContent =
      s.id + " · 意向分 " + total + "（标签 " + tagScore(s.hits) + " + AI " + (s.ai ? s.ai.score : 0) + "）";

    document.getElementById("panel-tags").innerHTML =
      '<p style="margin:0 0 12px;font-size:13px;color:#64748b">意向度 <span class="' +
      levelPillClass(lv.key) +
      '">' +
      lv.label +
      "</span></p>" +
      s.hits
        .map(function (c) {
          var t = tagByCode(c);
          return (
            '<div class="intent-drawer-tag">' +
            "<strong>" +
            escapeHtml(t ? t.parentName + " / " + t.name : c) +
            "</strong>" +
            '<span class="intent-drawer-tag__w">+' +
            (t ? t.weight : 0) +
            " 分</span></div>"
          );
        })
        .join("");

    document.getElementById("panel-follow").innerHTML =
      s.follow.time === "—"
        ? '<p class="intent-empty">跟进内容由会务人员在「跟进记录」中填写。</p><a href="#">去跟进记录</a>'
        : '<div class="intent-follow-record">' +
          '<div class="intent-follow-record__head"><span class="intent-summary__tag">' +
          escapeHtml(s.follow.tag) +
          "</span><time>" +
          escapeHtml(s.follow.time) +
          "</time></div>" +
          '<p class="intent-follow-record__body">' +
          escapeHtml(s.follow.content) +
          "</p></div>";

    document.getElementById("panel-ai").innerHTML =
      !s.ai || s.ai.summary === "—"
        ? '<p class="intent-empty">保存跟进或触发分析后，将基于标签与跟进内容生成提炼（AI 权重最高 ' +
          AI_SCORE_MAX +
          " 分）。</p>"
        : '<div class="intent-ai-card">' +
          '<div class="intent-ai-card__score">AI 权重分 <strong>' +
          s.ai.score +
          "</strong> / " +
          AI_SCORE_MAX +
          "</div>" +
          "<p class=\"intent-ai-card__summary\">" +
          escapeHtml(s.ai.summary) +
          "</p>" +
          '<p class="intent-ai-card__full">' +
          escapeHtml(s.ai.full) +
          '</p><button type="button" class="q-btn q-btn--sm" id="btn-reanalyze">重新分析</button></div>';

    if (window.CourseRecommend) {
      document.getElementById("panel-course").innerHTML =
        window.CourseRecommend.renderDrawerPanel(s);
      window.CourseRecommend.bindCopyButtons(
        document.getElementById("panel-course")
      );
    } else {
      document.getElementById("panel-course").innerHTML =
        '<p class="intent-empty">课程推荐模块未加载</p>';
    }

    document.getElementById("panel-community").innerHTML =
      "<p>" + escapeHtml(s.community) + "</p>";
    document.getElementById("panel-learn").innerHTML = "<p>" + escapeHtml(s.learn) + "</p>";
    document.getElementById("panel-video").innerHTML = "<p>" + escapeHtml(s.video) + "</p>";

    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var re = document.getElementById("btn-reanalyze");
    if (re) {
      re.onclick = function () {
        showToast("已提交重新分析（原型演示）");
      };
    }
  }

  function closeDrawer() {
    document.getElementById("drawer-backdrop").classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function showToast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(function () {
      t.classList.remove("is-show");
    }, 2200);
  }

  function initTabs() {
    document.querySelectorAll(".q-drawer__tabs button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tab = btn.getAttribute("data-tab");
        document.querySelectorAll(".q-drawer__tabs button").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        document.querySelectorAll(".q-drawer-panel").forEach(function (p) {
          p.classList.toggle("is-active", p.id === "panel-" + tab);
        });
      });
    });
  }

  function renderAll() {
    reloadConfigFromCore();
    renderStrategyBanner();
    renderTable();
  }

  function bindAnalysisPage() {
    document.getElementById("drawer-close").addEventListener("click", closeDrawer);
    document.getElementById("drawer-backdrop").addEventListener("click", function (e) {
      if (e.target.id === "drawer-backdrop") closeDrawer();
    });
    var search = document.getElementById("student-search");
    if (search) {
      search.addEventListener("input", function () {
        state.search = search.value;
        renderTable();
      });
    }
    var exportBtn = document.getElementById("btn-export-mock");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        showToast("导出为二期能力（原型演示）");
      });
    }
    initTabs();
    renderAll();
  }

  function bindStrategyEditor() {
    document.querySelectorAll("[data-pick]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (e.target.closest(".intent-chip__remove")) return;
        openPicker(el.getAttribute("data-pick"));
      });
    });
    document.querySelectorAll('input[name="intent-mode"]').forEach(function (inp) {
      inp.addEventListener("change", function () {
        syncFormToState();
        readFormFromState();
      });
    });
    var pc = document.getElementById("picker-cancel");
    var po = document.getElementById("picker-ok");
    if (pc) pc.addEventListener("click", function () {
      document.getElementById("picker-modal").classList.remove("is-open");
    });
    if (po) po.addEventListener("click", applyPicker);
    ["watch-logic", "high-logic", "mid-logic", "low-logic", "threshold-high", "threshold-mid", "threshold-low"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", syncFormToState);
        el.addEventListener("input", syncFormToState);
      }
    });
    readFormFromState();
  }

  window.IntentStrategyEditor = {
    init: bindStrategyEditor,
    setState: function (cfg) {
      var c = global.IntentStrategyCore
        ? global.IntentStrategyCore.cloneConfig(cfg)
        : cfg;
      Object.keys(c).forEach(function (k) {
        if (k === "search" || k === "pickerTarget" || k === "treeExpanded") return;
        if (k === "high" || k === "mid" || k === "low") {
          state[k] = Object.assign({}, state[k], c[k]);
          return;
        }
        state[k] = c[k];
      });
      readFormFromState();
    },
    getState: function () {
      syncFormToState();
      return global.IntentStrategyCore
        ? global.IntentStrategyCore.cloneConfig(state)
        : JSON.parse(JSON.stringify(state));
    },
  };

  function bind() {
    bindAnalysisPage();
  }

  var page = document.body.getAttribute("data-cf-page");
  if (page === "intent") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bind);
    } else {
      bind();
    }
  }
})(window);
