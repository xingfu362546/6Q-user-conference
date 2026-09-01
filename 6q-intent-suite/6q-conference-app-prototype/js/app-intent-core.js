/**
 * 会务 APP · 学员意向（与后台 conference-intent 规则对齐）
 */
(function (global) {
  "use strict";

  var AI_MAX = 25;
  var CONFIG = {
    conferenceId: "conf-2025-spring-01",
    conferenceName: "第128期 · 如何说孩子才会听",
    intentMode: "score",
    thresholdHigh: 70,
    thresholdMid: 45,
    thresholdLow: 25,
    analyzedAt: null,
  };

  var STUDENTS = [
    {
      id: "m10001",
      name: "夏兰",
      phone: "19942233418",
      trainTag: "复训",
      roleTag: "导师&天使",
      hits: ["tag_1233", "tag_3301", "tag_4402", "tag_5503"],
      courseLevel: "一阶",
      intendedDirection: "",
      interviewSlot: "课程结束后",
      follow: {
        tag: "有意向用户",
        content: "学员今天找我了解了进阶班，预算在 8k 左右。",
        time: "2025-04-02",
      },
      ai: {
        score: 22,
        summary: "意向明确，匹配本期亲子课程",
        full: "结合亲子偏好、近期消费高与跟进内容：学员主动咨询进阶班并给出预算，建议优先安排会销席位。",
      },
      community: "发帖：孩子沟通技巧求推荐",
      learn: "近年 3 门 · 《情绪管理入门》",
      video: "亲子类 Top · 《正面管教片段》",
      productHistory: [
        {
          product_id: "prod_parent_talk",
          enrolled: false,
          purchased: true,
          sku_name: "线上年卡",
          date: "2024-08",
        },
      ],
    },
    {
      id: "m10002",
      name: "吴均宜",
      phone: "19942233418",
      trainTag: "新训",
      roleTag: "导师",
      hits: ["tag_1233", "tag_3301"],
      courseLevel: "沙龙",
      intendedDirection: "",
      interviewSlot: "课间休息时",
      follow: {
        tag: "待回访",
        content: "电话沟通提到价格敏感，希望了解分期与优惠政策。",
        time: "2025-04-01",
      },
      ai: {
        score: 14,
        summary: "有需求但价格敏感",
        full: "标签显示亲子与消费潜力；跟进强调分期诉求，建议推送优惠方案后再判高意向。",
      },
      community: "近 7 天无发帖",
      learn: "近年 1 门",
      video: "教育类 · 《亲子沟通》",
    },
    {
      id: "m10003",
      name: "张志远",
      phone: "13588771234",
      trainTag: "复训",
      roleTag: "",
      hits: ["tag_1233", "tag_3301", "tag_4402", "tag_6604", "tag_7705"],
      courseLevel: "二阶",
      intendedDirection: "导师&天使",
      interviewSlot: "随时都可以",
      follow: {
        tag: "高意向",
        content: "明确要买本期配套课程包，希望当天签约。",
        time: "2025-04-04",
      },
      ai: {
        score: 25,
        summary: "强意向，建议立即锁席",
        full: "多标签命中+跟进确认购课意向；AI 分顶格，建议会务优先接待。",
      },
      community: "发帖：咨询套餐优惠",
      learn: "近年 6 门",
      video: "亲子类 · 累计>120分钟",
      productHistory: [
        {
          product_id: "prod_parent_talk",
          enrolled: true,
          purchased: false,
          sku_name: "本期现场·新训席位",
          date: "2025-04（本期）",
        },
      ],
    },
    {
      id: "m10004",
      name: "李美琳",
      phone: "13988888332",
      trainTag: "新训",
      roleTag: "",
      hits: ["tag_5503"],
      courseLevel: "沙龙",
      intendedDirection: "",
      interviewSlot: "",
      follow: { tag: "—", content: "—", time: "—" },
      ai: {
        score: 8,
        summary: "行为标签尚可，缺跟进",
        full: "社区活跃但无会务跟进，建议补跟进后重新分析。",
      },
      community: "评论：会务场地咨询",
      learn: "近年 2 门",
      video: "个人成长",
    },
    {
      id: "m10005",
      name: "王建国",
      phone: "13600090091",
      trainTag: "复训",
      roleTag: "导师",
      hits: ["tag_4402", "tag_6604"],
      courseLevel: "一阶",
      intendedDirection: "",
      interviewSlot: "",
      follow: { tag: "—", content: "—", time: "—" },
      ai: {
        score: 8,
        summary: "分层尚可，待触达",
        full: "命中课程浏览与高价值分层，暂无跟进。",
      },
      community: "—",
      learn: "近年 5 门",
      video: "家庭关系",
      productHistory: [
        {
          product_id: "prod_parent_talk",
          enrolled: true,
          purchased: true,
          sku_name: "基础班线下 + 线上补充包",
          date: "2023 / 2024",
        },
      ],
    },
    {
      id: "m10006",
      name: "刘慧敏",
      phone: "15833334444",
      trainTag: "新训",
      roleTag: "",
      hits: ["tag_2201"],
      courseLevel: "无",
      intendedDirection: "",
      interviewSlot: "",
      follow: { tag: "—", content: "—", time: "—" },
      ai: {
        score: 3,
        summary: "新学员，数据不足",
        full: "仅基础渠道标签，暂维持低分观察。",
      },
      community: "—",
      learn: "新学员",
      video: "—",
    },
    {
      id: "m10007",
      name: "赵雅琴",
      phone: "13755555660",
      trainTag: "复训",
      roleTag: "导师&天使",
      hits: ["tag_1233", "tag_5503"],
      courseLevel: "沙龙",
      intendedDirection: "导师",
      interviewSlot: "课间休息时",
      follow: {
        tag: "有意向用户",
        content: "已添加企微，约定本周试听线上课。",
        time: "2025-04-03",
      },
      ai: {
        score: 18,
        summary: "跟进积极，待试听转化",
        full: "社区活跃+跟进显示已建联；需试听结果提升意向分。",
      },
      community: "发帖：分享学习心得",
      learn: "近年 2 门",
      video: "个人成长",
      productHistory: [
        {
          product_id: "prod_emotion",
          enrolled: false,
          purchased: true,
          sku_name: "线上微课包",
          date: "2025-01",
        },
      ],
    },
    {
      id: "m10008",
      name: "陈晓明",
      phone: "13822222001",
      trainTag: "新训",
      roleTag: "",
      hits: ["tag_1233", "tag_3301", "tag_4402"],
      courseLevel: "分享会",
      intendedDirection: "天使",
      interviewSlot: "课程结束后",
      follow: {
        tag: "有意向用户",
        content: "希望开课前电话沟通。",
        time: "2025-04-02",
      },
      ai: {
        score: 20,
        summary: "标签与跟进均积极",
        full: "亲子+消费+课程浏览组合良好，建议列入高意向跟进队列。",
      },
      community: "发帖：求推荐",
      learn: "近年 3 门",
      video: "亲子类",
    },
  ];

  function tagByCode(code) {
    return (global.INTENT_TAG_FLAT || []).find(function (t) {
      return t.code === code;
    });
  }

  function tagScore(hits) {
    var sum = 0;
    (hits || []).forEach(function (code) {
      var t = tagByCode(code);
      if (t) sum += t.weight;
    });
    return sum;
  }

  function totalScore(s) {
    var ai = s.ai && s.ai.score ? Math.min(AI_MAX, Math.max(0, s.ai.score)) : 0;
    return tagScore(s.hits) + ai;
  }

  function intentLevel(s) {
    var total = totalScore(s);
    if (total >= CONFIG.thresholdHigh) return { key: "high", label: "高" };
    if (total >= CONFIG.thresholdMid) return { key: "mid", label: "中" };
    if (total >= CONFIG.thresholdLow) return { key: "low", label: "低" };
    return { key: "none", label: "未分级" };
  }

  function enrich(s) {
    var level = intentLevel(s);
    return Object.assign({}, s, {
      intentScore: totalScore(s),
      tagScore: tagScore(s.hits),
      aiScore: s.ai && s.ai.score ? s.ai.score : 0,
      intentLevel: level.key,
      intentLabel: level.label,
    });
  }

  function getAll() {
    return STUDENTS.map(enrich).sort(function (a, b) {
      return b.intentScore - a.intentScore;
    });
  }

  function getById(id) {
    return getAll().find(function (s) {
      return s.id === id;
    });
  }

  function getByLevel(level) {
    if (!level || level === "all") return getAll();
    return getAll().filter(function (s) {
      return s.intentLevel === level;
    });
  }

  function summary() {
    var all = getAll();
    var counts = { high: 0, mid: 0, low: 0, none: 0 };
    all.forEach(function (s) {
      counts[s.intentLevel] = (counts[s.intentLevel] || 0) + 1;
    });
    return {
      total: all.length,
      counts: counts,
      topPriority: all.filter(function (s) {
        return s.intentLevel === "high";
      }).slice(0, 3),
    };
  }

  function setAnalyzed() {
    CONFIG.analyzedAt = new Date().toISOString();
    try {
      sessionStorage.setItem(
        "intent_analyzed_" + CONFIG.conferenceId,
        CONFIG.analyzedAt
      );
    } catch (e) {}
  }

  function loadAnalyzed() {
    try {
      var v = sessionStorage.getItem("intent_analyzed_" + CONFIG.conferenceId);
      if (v) CONFIG.analyzedAt = v;
    } catch (e) {}
  }

  function formatAnalyzedTime() {
    if (!CONFIG.analyzedAt) return "尚未分析";
    var d = new Date(CONFIG.analyzedAt);
    var pad = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };
    return (
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function avatarGradient(id) {
    var grads = [
      "linear-gradient(135deg,#f39800,#ffb347)",
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
      "linear-gradient(135deg,#0ea5e9,#06b6d4)",
      "linear-gradient(135deg,#10b981,#059669)",
    ];
    var n = 0;
    for (var i = 0; i < id.length; i++) n += id.charCodeAt(i);
    return grads[n % grads.length];
  }

  function hitTagNames(hits, max) {
    max = max || 3;
    return (hits || [])
      .slice(0, max)
      .map(function (c) {
        var t = tagByCode(c);
        return t ? t.name : c;
      });
  }

  function shouldForceRescan() {
    try {
      var ver = localStorage.getItem("intent_strategy_version_" + CONFIG.conferenceId) || "0";
      var seen = sessionStorage.getItem("intent_strategy_seen_" + CONFIG.conferenceId);
      if (seen !== ver) {
        sessionStorage.setItem("intent_strategy_seen_" + CONFIG.conferenceId, ver);
        sessionStorage.removeItem("intent_analyzed_" + CONFIG.conferenceId);
        return true;
      }
    } catch (e) {}
    return false;
  }

  loadAnalyzed();

  global.AppIntent = {
    CONFIG: CONFIG,
    getAll: getAll,
    getById: getById,
    getByLevel: getByLevel,
    summary: summary,
    setAnalyzed: setAnalyzed,
    formatAnalyzedTime: formatAnalyzedTime,
    shouldForceRescan: shouldForceRescan,
    avatarGradient: avatarGradient,
    hitTagNames: hitTagNames,
    tagByCode: tagByCode,
  };
})(window);
