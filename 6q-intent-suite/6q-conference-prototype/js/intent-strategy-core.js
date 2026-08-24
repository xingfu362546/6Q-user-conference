/**
 * 意向分析策略 · 模板（会务工具）+ 本期会务实例
 */
(function (global) {
  "use strict";

  var CONFERENCE_ID = "conf-2025-spring-01";
  var STORAGE_TEMPLATES = "intent_strategy_templates_v1";
  var STORAGE_CONFERENCE = "intent_strategy_conf_" + CONFERENCE_ID;
  var STORAGE_VERSION = "intent_strategy_version_" + CONFERENCE_ID;

  var DEFAULT_CONFIG = {
    watchTags: ["tag_1233", "tag_3301", "tag_4402"],
    /** 关注标签权重：仅策略模板维护，不在标签平台配置 */
    watchWeights: { tag_1233: 30, tag_3301: 25, tag_4402: 20 },
    watchLogic: "any",
    intentMode: "score",
    thresholdHigh: 70,
    thresholdMid: 45,
    thresholdLow: 25,
    high: { tags: ["tag_1233", "tag_3301", "tag_4402"], logic: "all" },
    mid: { tags: ["tag_1233", "tag_5503"], logic: "all" },
    low: { tags: ["tag_2201"], logic: "any" },
  };

  var SEED_TEMPLATES = [
    {
      id: "tpl_parent_sales",
      name: "亲子会销 · 按权重分",
      description: "关注亲子/消费/课程浏览标签；高≥70 中≥45 低≥25",
      updatedAt: "2025-03-15",
      config: DEFAULT_CONFIG,
    },
    {
      id: "tpl_parent_tags",
      name: "亲子会销 · 按命中标签",
      description: "高/中/低由标签组合判定，适合标签运营成熟的场次",
      updatedAt: "2025-02-20",
      config: {
        watchTags: ["tag_1233", "tag_3301"],
        watchWeights: { tag_1233: 30, tag_3301: 25 },
        watchLogic: "any",
        intentMode: "tags",
        thresholdHigh: 70,
        thresholdMid: 45,
        thresholdLow: 25,
        high: { tags: ["tag_1233", "tag_3301", "tag_4402"], logic: "all" },
        mid: { tags: ["tag_5503"], logic: "any" },
        low: { tags: ["tag_2201"], logic: "any" },
      },
    },
  ];

  function cloneConfig(c) {
    return JSON.parse(JSON.stringify(c));
  }

  /** 补齐/裁剪 watchWeights；缺省从标签目录 mock 权重迁移，正式环境应由运营在模板填写 */
  function normalizeWatchWeights(config) {
    if (!config) return config;
    var weights = Object.assign({}, config.watchWeights || {});
    var flat = (global.INTENT_TAG_FLAT || []).reduce(function (m, t) {
      m[t.code] = t.weight;
      return m;
    }, {});
    (config.watchTags || []).forEach(function (code) {
      if (weights[code] == null || weights[code] === "") {
        weights[code] = flat[code] != null ? flat[code] : 10;
      } else {
        weights[code] = Number(weights[code]) || 0;
      }
    });
    Object.keys(weights).forEach(function (code) {
      if ((config.watchTags || []).indexOf(code) === -1) delete weights[code];
    });
    config.watchWeights = weights;
    return config;
  }

  function normalizeConfig(config) {
    var c = cloneConfig(config || DEFAULT_CONFIG);
    if (!c.watchTags) c.watchTags = [];
    if (!c.high) c.high = { tags: [], logic: "all" };
    if (!c.mid) c.mid = { tags: [], logic: "any" };
    if (!c.low) c.low = { tags: [], logic: "any" };
    return normalizeWatchWeights(c);
  }

  function loadTemplates() {
    try {
      var raw = localStorage.getItem(STORAGE_TEMPLATES);
      if (raw) {
        return JSON.parse(raw).map(function (t) {
          t.config = normalizeConfig(t.config);
          return t;
        });
      }
    } catch (e) {}
    return cloneConfig(SEED_TEMPLATES).map(function (t) {
      t.config = normalizeConfig(t.config);
      return t;
    });
  }

  function saveTemplates(list) {
    localStorage.setItem(STORAGE_TEMPLATES, JSON.stringify(list));
  }

  function getTemplateById(id) {
    return loadTemplates().find(function (t) {
      return t.id === id;
    });
  }

  function isTemplateInUse(id) {
    var conf = getConferenceConfig();
    return !!(conf && conf.templateId === id);
  }

  function deleteTemplate(id) {
    var list = loadTemplates();
    var idx = -1;
    var removed = null;
    list.forEach(function (t, i) {
      if (t.id === id) {
        idx = i;
        removed = t;
      }
    });
    if (idx === -1) return { ok: false, reason: "not_found" };
    var inUse = isTemplateInUse(id);
    list.splice(idx, 1);
    saveTemplates(list);
    return { ok: true, inUse: inUse, name: removed.name };
  }

  function getConferenceConfig() {
    try {
      var raw = localStorage.getItem(STORAGE_CONFERENCE);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.config) return parsed;
      }
    } catch (e) {}
    return null;
  }

  function isConferenceConfigured() {
    return !!getConferenceConfig();
  }

  function saveConferenceConfig(config, meta) {
    meta = meta || {};
    var payload = {
      conferenceId: CONFERENCE_ID,
      templateId: meta.templateId || null,
      templateName: meta.templateName || null,
      savedAt: new Date().toISOString(),
      savedBy: meta.savedBy || "会务统筹",
      config: normalizeConfig(config),
    };
    localStorage.setItem(STORAGE_CONFERENCE, JSON.stringify(payload));
    bumpAnalysisVersion();
    return payload;
  }

  function applyTemplateToConference(templateId) {
    var tpl = getTemplateById(templateId);
    if (!tpl) return null;
    return saveConferenceConfig(tpl.config, {
      templateId: tpl.id,
      templateName: tpl.name,
    });
  }

  function copyPreviousPeriodConfig() {
    var cur = getConferenceConfig();
    if (!cur) return null;
    return saveConferenceConfig(cur.config, {
      templateId: cur.templateId,
      templateName: (cur.templateName || "") + "（复制上期）",
    });
  }

  function bumpAnalysisVersion() {
    var v = Date.now();
    localStorage.setItem(STORAGE_VERSION, String(v));
    try {
      sessionStorage.removeItem("intent_analyzed_" + CONFERENCE_ID);
    } catch (e) {}
    return v;
  }

  function getAnalysisVersion() {
    return localStorage.getItem(STORAGE_VERSION) || "0";
  }

  function getActiveConfig() {
    var conf = getConferenceConfig();
    if (conf && conf.config) return normalizeConfig(conf.config);
    return normalizeConfig(DEFAULT_CONFIG);
  }

  function tagByCode(code) {
    return (global.INTENT_TAG_FLAT || []).find(function (t) {
      return t.code === code;
    });
  }

  function tagNames(codes, max) {
    max = max || 5;
    return (codes || [])
      .slice(0, max)
      .map(function (c) {
        var t = tagByCode(c);
        return t ? t.name : c;
      })
      .join("、");
  }

  function formatSummary(config, meta) {
    config = config || getActiveConfig();
    meta = meta || getConferenceConfig();
    var watch = config.watchTags.length
      ? tagNames(config.watchTags, 4) +
        (config.watchTags.length > 4 ? "…" : "") +
        "（" +
        (config.watchLogic === "all" ? "全部命中" : "任一命中") +
        "）"
      : "未设关注标签";
    var mode =
      config.intentMode === "score"
        ? "按权重分 · 高≥" +
          config.thresholdHigh +
          " / 中≥" +
          config.thresholdMid +
          " / 低≥" +
          config.thresholdLow
        : "按命中标签 · 高/中/低组合";
    var tpl = meta && meta.templateName ? "模板：" + meta.templateName + " · " : "";
    var time = meta && meta.savedAt ? formatTime(meta.savedAt) : "未保存";
    return tpl + "关注 " + watch + " · " + mode + " · 保存于 " + time;
  }

  function formatTime(iso) {
    var d = new Date(iso);
    var p = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };
    return p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  global.IntentStrategyCore = {
    CONFERENCE_ID: CONFERENCE_ID,
    DEFAULT_CONFIG: DEFAULT_CONFIG,
    loadTemplates: loadTemplates,
    saveTemplates: saveTemplates,
    getTemplateById: getTemplateById,
    isTemplateInUse: isTemplateInUse,
    deleteTemplate: deleteTemplate,
    getConferenceConfig: getConferenceConfig,
    isConferenceConfigured: isConferenceConfigured,
    saveConferenceConfig: saveConferenceConfig,
    applyTemplateToConference: applyTemplateToConference,
    copyPreviousPeriodConfig: copyPreviousPeriodConfig,
    getActiveConfig: getActiveConfig,
    formatSummary: formatSummary,
    bumpAnalysisVersion: bumpAnalysisVersion,
    getAnalysisVersion: getAnalysisVersion,
    cloneConfig: cloneConfig,
    normalizeConfig: normalizeConfig,
    tagNames: tagNames,
  };
})(window);
