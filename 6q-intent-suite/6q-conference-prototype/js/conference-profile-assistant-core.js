/**
 * 学员画像分析助手 · 纯逻辑核心
 * 无 DOM / 网络依赖，供会务后台与面谈官门户共用。
 */
(function (global, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.ConferenceProfileAssistantCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var LEVELS = ["无", "沙龙", "分享会", "一阶", "二阶", "三阶"];
  var VALID_SESSION_STATUS = { "正在开课中": 0, "报读中": 1 };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeId(prefix, now, suffix) {
    return (
      prefix +
      "-" +
      String(now || Date.now()).replace(/[^0-9A-Za-z]/g, "") +
      (suffix == null ? "" : "-" + suffix)
    );
  }

  function createDraftSession(context, now) {
    return Object.assign(
      {
        id: makeId("session", now),
        title: "",
        createdAt: now,
        updatedAt: now,
        persisted: false,
        messages: [],
        matchVersions: [],
        assistantMode: null,
        qaState: null,
        analysisState: null,
      },
      clone(context || {}),
    );
  }

  function addMessage(session, role, text, now, meta) {
    session.messages.push({
      role: role,
      text: String(text || ""),
      createdAt: now,
      meta: clone(meta || {}),
    });
    session.updatedAt = now;
    if (!session.persisted) {
      session.persisted = true;
      session.title = String(text || "新会话").slice(0, 24);
    }
    return session;
  }

  function searchSessions(rows, query) {
    var q = String(query || "").trim().toLowerCase();
    if (!q) return (rows || []).slice();
    return (rows || []).filter(function (row) {
      return [
        row.memberName,
        row.conferenceName,
        row.title,
        row.updatedAt,
      ]
        .join(" ")
        .toLowerCase()
        .indexOf(q) !== -1;
    });
  }

  function resolveCourseLevel(tagLevel, enrollmentLevels) {
    var all = [tagLevel || "无"].concat(enrollmentLevels || []);
    var highest = all.reduce(function (best, value) {
      return LEVELS.indexOf(value) > LEVELS.indexOf(best) ? value : best;
    }, "无");
    var index = LEVELS.indexOf(highest);
    return {
      level: highest,
      nextLevel: index >= LEVELS.length - 1 ? null : LEVELS[index + 1],
      conflict: all.some(function (value) {
        return value && value !== tagLevel;
      }),
    };
  }

  function relationAdvice(status) {
    if (status === "qualified") return "提醒使用已有资格完成报读";
    if (status === "enrolled") return "建议选择未来期数复训";
    return "可按首次购买路径跟进";
  }

  function normalizePrice(value) {
    if (typeof value === "number") return value;
    return Number(String(value == null ? "" : value).replace(/[^\d.]/g, "")) || 0;
  }

  function isProductWithinBudget(product, budget) {
    if (budget == null || budget === "") return true;
    return (product.goods || []).some(function (good) {
      return good.available !== false && normalizePrice(good.price) <= Number(budget);
    });
  }

  function sortGoods(goods, budget) {
    return (goods || [])
      .map(function (good) {
        var row = clone(good);
        row.numericPrice = normalizePrice(row.price);
        row.budgetStatus =
          budget == null || row.numericPrice <= Number(budget) ? "fit" : "over";
        return row;
      })
      .sort(function (a, b) {
        if (a.budgetStatus !== b.budgetStatus) {
          return a.budgetStatus === "fit" ? -1 : 1;
        }
        return a.numericPrice - b.numericPrice;
      });
  }

  function selectCourseSessions(rows, city, now, limit) {
    var today = String(now || "").slice(0, 10);
    return (rows || [])
      .filter(function (row) {
        if (!Object.prototype.hasOwnProperty.call(VALID_SESSION_STATUS, row.status)) {
          return false;
        }
        return row.status === "正在开课中" || String(row.startsAt) >= today;
      })
      .sort(function (a, b) {
        var cityDiff = Number(b.city === city) - Number(a.city === city);
        if (cityDiff) return cityDiff;
        var statusDiff =
          VALID_SESSION_STATUS[a.status] - VALID_SESSION_STATUS[b.status];
        if (statusDiff) return statusDiff;
        return String(a.startsAt).localeCompare(String(b.startsAt));
      })
      .slice(0, limit || 3)
      .map(clone);
  }

  function buildConditions(input) {
    input = input || {};
    return {
      explicit: clone(input.explicit || []),
      inferred: clone(input.inferred || []),
      missing: clone(input.missing || []),
      confidence: Number(input.confidence) || 0,
      dataAsOf: input.dataAsOf || "",
    };
  }

  function conditionValue(conditions, key) {
    var all = []
      .concat((conditions && conditions.explicit) || [])
      .concat((conditions && conditions.inferred) || []);
    var row = all.find(function (item) {
      return item.key === key;
    });
    return row ? row.value : null;
  }

  function productScore(product, context) {
    var topic = String(context.topic || "").toLowerCase();
    var signals = (context.signals || []).map(function (value) {
      return String(value).toLowerCase();
    });
    var score = Number(product.baseScore) || 50;
    (product.keywords || []).forEach(function (keyword) {
      var needle = String(keyword).toLowerCase();
      if (topic.indexOf(needle) !== -1) score += 18;
      if (
        signals.some(function (signal) {
          return signal.indexOf(needle) !== -1;
        })
      ) {
        score += 8;
      }
    });
    return Math.max(50, Math.min(98, score));
  }

  function matchProducts(products, context) {
    context = context || {};
    return (products || [])
      .filter(function (product) {
        if (!isProductWithinBudget(product, context.budget)) return false;
        var relation = (context.relations || {})[product.productId] || "none";
        if (relation === "enrolled" && !context.allowRetrain) return false;
        return true;
      })
      .map(function (product) {
        var row = clone(product);
        row.matchPercent = productScore(row, context);
        row.goods = sortGoods(row.goods, context.budget);
        row.sessions = selectCourseSessions(
          row.sessions,
          context.city,
          context.now,
          3,
        );
        row.relationStatus =
          (context.relations || {})[row.productId] || "none";
        return row;
      })
      .sort(function (a, b) {
        return b.matchPercent - a.matchPercent;
      })
      .slice(0, context.limit || 3);
  }

  function hasCareerGiftIntent(direction) {
    var text = String(direction == null ? "" : direction).trim();
    if (!text || text === "无" || text === "暂无" || text === "—") return false;
    return /导师/.test(text) || /天使/.test(text);
  }

  function matchGiftPackages(packages, direction, limit) {
    if (!hasCareerGiftIntent(direction)) return [];
    var wantMentor = /导师/.test(String(direction));
    var wantAngel = /天使/.test(String(direction));
    var rows = (packages || []).filter(function (row) {
      var aud = row.audience || "both";
      if (aud === "both") return true;
      if (aud === "mentor") return wantMentor;
      if (aud === "angel") return wantAngel;
      return true;
    });
    if (!rows.length) rows = (packages || []).slice();
    rows.sort(function (a, b) {
      function score(row) {
        var aud = row.audience || "both";
        if (aud === "both") return 0;
        if (wantMentor && wantAngel) return aud === "mentor" ? 1 : 2;
        return 1;
      }
      return score(a) - score(b);
    });
    return rows.slice(0, limit || 3).map(function (row) {
      return clone(row);
    });
  }

  var DEMO_GROUPS = [
    {
      id: "analysis",
      title: "分析学员",
      subtitle: "解读画像、跟进与产品匹配",
      items: [
        {
          id: "interest",
          type: "intent",
          label: "学员在系统中对什么类型的课程感兴趣？",
          hint: "解读用户标签与行为埋点",
        },
        {
          id: "followup",
          type: "intent",
          label: "学员下一步应该如何跟进？",
          hint: "结合上课层级和报读会务记录",
        },
        {
          id: "product",
          type: "intent",
          label: "应该推荐什么课程产品比较适合该学员？",
          hint: "补充条件或直接智能匹配",
        },
      ],
    },
    {
      id: "retrieval",
      title: "课务检索",
      subtitle: "AI 智搜原句 · 仅演示",
      items: [
        {
          id: "city-sessions",
          type: "retrieval",
          label: "广州最近有哪些课程正在开课？",
          hint: "城市 × 近期期数",
        },
        {
          id: "mentor-courses",
          type: "retrieval",
          label: "总导师的课程有哪些？",
          hint: "导师 × 相关课程",
        },
        {
          id: "level-diff",
          type: "retrieval",
          label: "一阶和二阶有什么区别？",
          hint: "课阶说明",
        },
      ],
    },
  ];

  var FOLLOWUP_ROUTES = [
    { id: "nanning-more", type: "retrieval", label: "南宁站还有吗？" },
    {
      id: "mentor-sessions",
      type: "retrieval",
      label: "总导师最近有哪些期数可以报读？",
    },
    {
      id: "product-intro",
      type: "product-detail",
      label: "主推课程的介绍是什么？",
    },
    {
      id: "product-sessions",
      type: "product-detail",
      label: "最近一期课务和商品有哪些？",
    },
    {
      id: "product-goods",
      type: "product-detail",
      label: "预算内有哪些商品套餐？",
    },
    {
      id: "product",
      type: "intent",
      label: "要不要按当前信息匹配产品？",
    },
  ];

  function demoCatalog() {
    return DEMO_GROUPS.reduce(function (rows, group) {
      return rows.concat(group.items);
    }, []).concat(FOLLOWUP_ROUTES);
  }

  function lastUserMessage(session) {
    var messages = (session && session.messages) || [];
    for (var i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i];
    }
    return null;
  }

  function resolveAssistantStage(session, options) {
    options = options || {};
    if (options.matching) return "matching";
    if (!session || !session.messages || !session.messages.length) return "empty";
    if (session.assistantMode === "qa") return "qa";
    if (
      session.analysisState &&
      session.analysisState.gate &&
      session.analysisState.gate !== "ready"
    ) {
      return "analysis-gate";
    }
    if (session.matchVersions && session.matchVersions.length) return "matched";
    var last = lastUserMessage(session);
    var intent = last && last.meta && last.meta.intent;
    if (
      intent === "city-sessions" ||
      intent === "mentor-courses" ||
      intent === "level-diff" ||
      intent === "nanning-more" ||
      intent === "mentor-sessions" ||
      intent === "retrieval"
    ) {
      return "retrieval";
    }
    var routed = routeUtterance(last && last.text);
    if (routed.type === "retrieval") return "retrieval";
    return "analysis";
  }

  function buildContextualFollowUp(stage, lastText) {
    var text = String(lastText || "");
    if (/亲子/.test(text)) return "亲子方向这门课和分享会有什么区别？";
    if (/广州/.test(text)) return "广州最近还有其他可报读期数吗？";
    if (/导师/.test(text)) return "总导师最近有哪些期数可以报读？";
    if (/预算|元/.test(text)) return "预算内有哪些商品套餐？";
    if (stage === "matched") return "主推课程和分享会有什么区别？";
    if (stage === "retrieval") return "要不要按当前信息匹配产品？";
    return "结合刚才的问题，还需要补充哪些跟进信息？";
  }

  function buildFollowUpChips(session, options) {
    var stage = resolveAssistantStage(session, options);
    if (stage === "empty" || stage === "matching" || stage === "analysis-gate") {
      return [];
    }
    if (stage === "qa") return qaFollowUpChips(session);
    var last = lastUserMessage(session);
    var lastText = last ? last.text : "";
    var base;
    if (stage === "matched") {
      base = [
        { id: "product-intro", text: "主推课程的介绍是什么？" },
        { id: "product-sessions", text: "最近一期课务和商品有哪些？" },
      ];
    } else if (stage === "retrieval") {
      base = [
        { id: "nanning-more", text: "南宁站还有吗？" },
        { id: "mentor-sessions", text: "总导师最近有哪些期数可以报读？" },
      ];
    } else {
      base = [
        { id: "followup", text: "学员下一步应该如何跟进？" },
        { id: "product", text: "应该推荐什么课程产品比较适合该学员？" },
      ];
    }
    var contextual = buildContextualFollowUp(stage, lastText);
    if (
      base.some(function (row) {
        return row.text === contextual;
      })
    ) {
      contextual =
        stage === "retrieval"
          ? "要不要按当前信息匹配产品？"
          : "结合刚才的问题，学员还缺哪些关键信息？";
    }
    return base.concat([{ id: "contextual", text: contextual }]);
  }

  function isDemoRailExpanded(hasMessages, userToggled) {
    if (userToggled === true) return true;
    if (userToggled === false) return false;
    return !hasMessages;
  }

  var START_MODES = [
    {
      id: "qa",
      title: "我要答疑",
      hint: "按五步法教练现场答疑",
      userText: "Hi，答疑助手",
    },
    {
      id: "analysis",
      title: "分析学员",
      hint: "解读画像、跟进与产品匹配",
      userText: "Hi，分析助手",
    },
  ];

  var QA_SCENES = [
    {
      id: "teen",
      label: "青春期叛逆、亲子沟通障碍",
      family: "亲子教育",
      pains: [
        "情绪疏导：对抗、爆发",
        "沟通技巧：不知道怎么开口",
        "关系修复：长期冷战",
      ],
    },
    {
      id: "phone",
      label: "手机沉迷与电子产品依赖",
      family: "亲子教育",
      pains: ["先摸清沉迷程度", "想分析管教方式", "要可执行的管控方法"],
    },
    {
      id: "study",
      label: "学习内驱力不足 / 厌学",
      family: "亲子教育",
      pains: ["想看清不愿意学的原因", "不知道怎么走进内心", "希望提升主动学习"],
    },
    {
      id: "couple",
      label: "夫妻教育理念冲突",
      family: "家庭关系",
      pains: ["一个严一个松、常争吵", "想统一教育口径"],
    },
    {
      id: "emotion",
      label: "孩子情绪管理",
      family: "亲子教育",
      pains: ["情绪波动大、易怒", "敏感或出现异常行为"],
    },
  ];

  var QA_TRIED_OPTIONS = [
    "现场比较焦虑",
    "有点无力、不知从何开口",
    "说教过但没什么用",
    "刚接住，还没细聊",
  ];

  var QA_PRESETS = [
    {
      id: "method",
      label: "你能教我一下如何有方法的答疑吗",
    },
    {
      id: "step1",
      label:
        "有个家长的孩子非常叛逆，老是不听我的话怎么办，我第一步应该怎么回答",
    },
    {
      id: "step2",
      label: "我连接了，下一步呢？",
    },
    {
      id: "step3",
      label: "想继续看第三步（转向资源）吗？",
    },
  ];

  function detectQaPreset(text) {
    var t = String(text || "").trim();
    if (!t) return null;
    var exact = QA_PRESETS.find(function (row) {
      return row.label === t;
    });
    if (exact) return exact.id;
    if (/如何有方法的答疑/.test(t)) return "method";
    if (/叛逆/.test(t) && /第一步/.test(t)) return "step1";
    if (/我连接了|第二步怎么接|看第二步/.test(t)) return "step2";
    if (/第三步|转向资源|继续演示/.test(t)) return "step3";
    return null;
  }

  function qaFollowUpChips(session) {
    var last = lastUserMessage(session);
    var preset = detectQaPreset(last && last.text);
    if (preset === "method") {
      return [{ id: "qa-step1", text: QA_PRESETS[1].label }];
    }
    if (preset === "step1") {
      return [{ id: "qa-step2", text: QA_PRESETS[2].label }];
    }
    if (preset === "step2") {
      return [{ id: "qa-step3", text: QA_PRESETS[3].label }];
    }
    return QA_PRESETS.slice(0, 3).map(function (row) {
      return { id: "qa-" + row.id, text: row.label };
    });
  }

  function detectStartMode(text) {
    var t = String(text || "").trim();
    if (!t) return null;
    if (t === "我要答疑" || /^Hi[，,]\s*答疑助手/.test(t)) return "qa";
    if (t === "分析学员" || /^Hi[，,]\s*分析助手/.test(t)) return "analysis";
    return null;
  }

  function findQaScene(text) {
    var t = String(text || "").trim();
    return (
      QA_SCENES.find(function (row) {
        return row.id === t || row.label === t;
      }) ||
      QA_SCENES.find(function (row) {
        return t && row.label.indexOf(t) !== -1;
      }) ||
      null
    );
  }

  function advanceQaState(state, text) {
    state = state || { step: "scene" };
    var t = String(text || "").trim();
    if (state.step === "scene") {
      var scene = findQaScene(t);
      if (!scene) {
        return {
          state: { step: "scene" },
          reply: {
            kind: "qa-scene",
            text: "先选一个最贴近现场的场景，我按手册四步往下问。",
            scenes: QA_SCENES.slice(),
          },
        };
      }
      return {
        state: { step: "pain", sceneId: scene.id },
        reply: {
          kind: "qa-pain",
          text: "这一类里，家长当下最想解决的是哪一块？",
          options: scene.pains.slice(),
        },
      };
    }
    if (state.step === "pain") {
      return {
        state: { step: "tried", sceneId: state.sceneId, pain: t },
        reply: {
          kind: "qa-tried",
          text: "现场家长情绪怎么样？之前试过哪些方法？",
          options: QA_TRIED_OPTIONS.slice(),
        },
      };
    }
    if (state.step === "tried") {
      return {
        state: {
          step: "done",
          sceneId: state.sceneId,
          pain: state.pain,
          tried: t,
        },
        reply: {
          kind: "qa-script",
          text: "本轮答疑纪要已按四步整理，可直接给现场参考。",
          sceneId: state.sceneId,
          pain: state.pain,
          tried: t,
        },
      };
    }
    if (findQaScene(t)) return advanceQaState({ step: "scene" }, t);
    return {
      state: state,
      reply: {
        kind: "qa-done",
        text: "本轮已经有纪要。若要换场景，再点一个场景，或开新会话。",
      },
    };
  }

  function isAffirmative(text) {
    var t = String(text || "").trim();
    return /^(是|好的?|对|可以|分析当前|当前学员|是，分析当前学员)/.test(t);
  }

  function isOtherStudent(text) {
    var t = String(text || "").trim();
    return /其它学员|其他学员|^否$|^不是$|换一个|换学员/.test(t);
  }

  function searchLearnerIndex(rows, query) {
    var q = String(query || "")
      .trim()
      .toLowerCase();
    if (!q) return [];
    return (rows || []).filter(function (row) {
      return (
        String(row.memberId || "")
          .toLowerCase()
          .indexOf(q) !== -1 ||
        String(row.memberName || "")
          .toLowerCase()
          .indexOf(q) !== -1
      );
    });
  }

  function learnerIndex(learnersMap) {
    return Object.keys(learnersMap || {}).map(function (id) {
      var row = learnersMap[id] || {};
      return {
        memberId: row.memberId || id,
        memberName: row.memberName || id,
        city: row.city || "",
      };
    });
  }

  function buildMatchCompleteCopy(products, isFallback) {
    var names = (products || [])
      .slice(0, 3)
      .map(function (row) {
        return row.productName || row.name;
      })
      .filter(Boolean);
    if (isFallback) {
      return "本次未能完成智能匹配，右侧为兜底参考。仍可按学员数据生成面谈提示。";
    }
    return (
      "匹配完成。" +
      (names.length ? "主推与备选：" + names.join("、") + "。" : "") +
      "右侧是产品结果。下一步要不要为相关产品生成面谈提示？"
    );
  }

  function buildSalesCoach(input) {
    input = input || {};
    var learner = input.learner || {};
    var products = input.products || [];
    var progression = input.progression || {};
    var primary = products[0] || {};
    var career = learner.careerPresentation || {};
    var follow = (learner.follows && learner.follows[0]) || {};
    var tracking = (learner.tracking && learner.tracking[0]) || {};
    var relation =
      (learner.relations || {})[primary.productId] ||
      primary.relationStatus ||
      "none";
    var goods = (primary.goods || []).filter(function (row) {
      return row.budgetStatus === "fit";
    });
    var goodHint = goods.length
      ? goods
          .slice(0, 2)
          .map(function (row) {
            return row.name + (row.price != null ? " ¥" + row.price : "");
          })
          .join("、")
      : "先核对预算内商品";
    return {
      title: "面谈提示已按学员数据整理",
      lead: "不要背长稿。按下面加粗维度对齐现场，再落到主推产品。",
      items: [
        {
          dim: "兴趣信号",
          text:
            (learner.tags && learner.tags[0]
              ? learner.tags[0]
              : "兴趣标签待核对") +
            (tracking.detail ? "；" + tracking.detail : ""),
        },
        {
          dim: "上课进度",
          text:
            "当前有效层级「" +
            (progression.level || "未核") +
            "」" +
            (progression.nextLevel
              ? "，下一步可谈「" + progression.nextLevel + "」"
              : "，已到最高阶可谈复训"),
        },
        {
          dim: "报读关系",
          text: relationAdvice(relation) + "（相对主推产品）",
        },
        {
          dim: "事业说明会",
          text: hasCareerGiftIntent(career.intendedDirection)
            ? "意向了解方向「" +
              career.intendedDirection +
              "」，可约谈「" +
              (career.interviewSlot || "未填") +
              "」"
            : "未登记导师/天使意向，沟通时不主动展开礼包",
        },
        {
          dim: "主推产品",
          text: (primary.productName || "当前主推") + " · " + goodHint,
        },
        {
          dim: "跟进缺口",
          text: follow.content || "近期无跟进，开口前先补一句现场观察",
        },
      ],
      opening:
        "先接住「" +
        (learner.inferredTopic || "当前诉求") +
        "」，再核「" +
        (progression.level || "上课层级") +
        "」和下一步，最后才落到「" +
        (primary.productName || "主推产品") +
        "」。",
    };
  }

  function routeUtterance(text) {
    var t = String(text || "").trim();
    if (!t) return { type: "free", id: "free" };
    var startMode = detectStartMode(t);
    if (startMode) return { type: "mode", id: startMode };
    if (
      t === "按学员数据生成面谈提示" ||
      t === "需要，按学员数据给提示"
    ) {
      return { type: "sales-coach", id: "sales-coach" };
    }
    var hit = demoCatalog().find(function (item) {
      return item.label === t;
    });
    if (hit) return { type: hit.type, id: hit.id };
    if (/亲子方向这门课和分享会有什么区别/.test(t)) {
      return { type: "product-detail", id: "topic-diff" };
    }
    if (/广州最近还有其他可报读期数/.test(t)) {
      return { type: "retrieval", id: "city-sessions" };
    }
    if (/主推课程和分享会有什么区别/.test(t)) {
      return { type: "product-detail", id: "topic-diff" };
    }
    if (/还需要补充哪些跟进信息|还缺哪些关键信息/.test(t)) {
      return { type: "intent", id: "followup" };
    }
    return { type: "free", id: "free" };
  }

  var INTENT_FLOW_MERMAID =
    "flowchart TB\n" +
    "  subgraph Entry[演示入口]\n" +
    "    A1[兴趣解读]\n" +
    "    A2[下一步跟进]\n" +
    "    A3[推荐产品]\n" +
    "    R1[广州最近开课]\n" +
    "    R2[总导师课程]\n" +
    "    R3[一阶二阶区别]\n" +
    "  end\n" +
    "  subgraph Data[数据源]\n" +
    "    D1[用户标签]\n" +
    "    D2[行为埋点]\n" +
    "    D3[跟进记录]\n" +
    "    D4[报读购买学习]\n" +
    "    D5[课务期数导师课阶]\n" +
    "    D6[课程产品SKU]\n" +
    "    D7[当前会话条件]\n" +
    "    D8[事业说明会意向登记]\n" +
    "    D9[礼包权益目录]\n" +
    "  end\n" +
    "  A1 --> D1\n" +
    "  A1 --> D2\n" +
    "  A2 --> D1\n" +
    "  A2 --> D4\n" +
    "  A3 --> Q{工作人员确认匹配?}\n" +
    "  Q -->|否| Chat[左栏对话]\n" +
    "  Q -->|是| Match[A+B智能匹配]\n" +
    "  R1 --> D5\n" +
    "  R2 --> D5\n" +
    "  R3 --> D5\n" +
    "  Chat --> Follow[输入框上方追问]\n" +
    "  Match --> D6\n" +
    "  Match --> D7\n" +
    "  Match --> Right[右栏课程产品]\n" +
    "  Match --> D8\n" +
    "  D8 --> Gift{意向含导师或天使?}\n" +
    "  Gift -->|否| Hide[不展示礼包区]\n" +
    "  Gift -->|是| D9\n" +
    "  D9 --> RightGift[右栏礼包权益]\n" +
    "  Right --> Follow\n" +
    "  RightGift --> Follow\n" +
    "  Follow --> Chat";

  function createMatchVersion(session, conditions, products, now, status, extras) {
    extras = extras || {};
    var version = {
      id: "match-" + (session.matchVersions.length + 1),
      createdAt: now,
      dataAsOf: conditions.dataAsOf,
      explicitConditions: clone(conditions.explicit || []),
      inferredConditions: clone(conditions.inferred || []),
      missingConditions: clone(conditions.missing || []),
      confidence: conditions.confidence || 0,
      status: status,
      products: clone(products || []),
      giftPackages: clone(extras.giftPackages || []),
      careerIntent: extras.careerIntent
        ? clone(extras.careerIntent)
        : { intendedDirection: "" },
    };
    session.matchVersions.push(version);
    session.updatedAt = now;
    if (!session.persisted) {
      session.persisted = true;
      session.title = "课程产品智能匹配";
    }
    return version;
  }

  return {
    LEVELS: LEVELS,
    DEMO_GROUPS: DEMO_GROUPS,
    INTENT_FLOW_MERMAID: INTENT_FLOW_MERMAID,
    createDraftSession: createDraftSession,
    addMessage: addMessage,
    searchSessions: searchSessions,
    resolveCourseLevel: resolveCourseLevel,
    relationAdvice: relationAdvice,
    isProductWithinBudget: isProductWithinBudget,
    sortGoods: sortGoods,
    selectCourseSessions: selectCourseSessions,
    buildConditions: buildConditions,
    conditionValue: conditionValue,
    matchProducts: matchProducts,
    hasCareerGiftIntent: hasCareerGiftIntent,
    matchGiftPackages: matchGiftPackages,
    createMatchVersion: createMatchVersion,
    lastUserMessage: lastUserMessage,
    resolveAssistantStage: resolveAssistantStage,
    buildFollowUpChips: buildFollowUpChips,
    isDemoRailExpanded: isDemoRailExpanded,
    routeUtterance: routeUtterance,
    START_MODES: START_MODES,
    QA_SCENES: QA_SCENES,
    QA_TRIED_OPTIONS: QA_TRIED_OPTIONS,
    QA_PRESETS: QA_PRESETS,
    detectQaPreset: detectQaPreset,
    qaFollowUpChips: qaFollowUpChips,
    detectStartMode: detectStartMode,
    findQaScene: findQaScene,
    advanceQaState: advanceQaState,
    isAffirmative: isAffirmative,
    isOtherStudent: isOtherStudent,
    searchLearnerIndex: searchLearnerIndex,
    learnerIndex: learnerIndex,
    buildMatchCompleteCopy: buildMatchCompleteCopy,
    buildSalesCoach: buildSalesCoach,
  };
});
