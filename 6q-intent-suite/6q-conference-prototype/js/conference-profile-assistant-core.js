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
    if (stage === "empty" || stage === "matching") return [];
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

  function routeUtterance(text) {
    var t = String(text || "").trim();
    if (!t) return { type: "free", id: "free" };
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
    "  Match --> Right[右栏主推与备选]\n" +
    "  Right --> Follow\n" +
    "  Follow --> Chat";

  function createMatchVersion(session, conditions, products, now, status) {
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
    createMatchVersion: createMatchVersion,
    lastUserMessage: lastUserMessage,
    resolveAssistantStage: resolveAssistantStage,
    buildFollowUpChips: buildFollowUpChips,
    isDemoRailExpanded: isDemoRailExpanded,
    routeUtterance: routeUtterance,
  };
});
