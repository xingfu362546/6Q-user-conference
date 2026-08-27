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
  };
});
