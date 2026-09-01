/**
 * 课程产品推荐 · 知识库 mock + 规则引擎
 * 推荐粒度：产品（一个产品下可有多个商品 SKU）
 */
(function (global) {
  "use strict";

  /** 产品知识库（商品挂在产品下，推荐时不推具体 SKU） */
  var PRODUCT_CATALOG = [
    {
      product_id: "prod_parent_talk",
      product_name: "如何说孩子才会听",
      series: "亲子沟通",
      summary: "亲子沟通经典产品线，覆盖入门到进阶全阶段。",
      retrain_note: "已报读学员可按复训政策申请下期席位或复训价。",
      entitlement_note: "已购买线上/权益包学员，请核对使用资格与有效期。",
      tagAffinity: ["tag_1233", "tag_4402", "tag_3301", "tag_7705"],
      intentFit: ["high", "mid"],
      keywords: ["进阶", "亲子", "沟通", "孩子", "如何说孩子"],
      goods: [
        { sku_id: "sku_pt_adv_off", name: "进阶班·线下3天2夜", price: "8,800", form: "线下" },
        { sku_id: "sku_pt_base_off", name: "基础班·线下2天", price: "5,800", form: "线下" },
        { sku_id: "sku_pt_online_y", name: "线上年卡", price: "2,980", form: "线上" },
      ],
    },
    {
      product_id: "prod_family_growth",
      product_name: "家庭成长体系课",
      series: "家庭关系",
      summary: "亲子+夫妻关系组合产品，适合高价值深度用户。",
      retrain_note: "套餐学员复训需按科目分别预约席位。",
      entitlement_note: "已购套餐请查各子课程剩余次数与有效期。",
      tagAffinity: ["tag_3301", "tag_6604", "tag_1233"],
      intentFit: ["high"],
      keywords: ["套餐", "家庭", "全年"],
      goods: [
        { sku_id: "sku_fg_year", name: "年度成长套餐", price: "19,800", form: "线下+线上" },
        { sku_id: "sku_fg_single", name: "单模块解锁", price: "6,800", form: "线下" },
      ],
    },
    {
      product_id: "prod_emotion",
      product_name: "情绪管理",
      series: "个人成长",
      summary: "低门槛体验向产品，适合新训与观望学员。",
      retrain_note: "体验课学员升级正课可抵扣部分费用（以政策为准）。",
      entitlement_note: "已购体验课未使用场次请在有效期内安排。",
      tagAffinity: ["tag_5503", "tag_2201"],
      intentFit: ["mid", "low"],
      keywords: ["体验", "入门", "情绪"],
      goods: [
        { sku_id: "sku_em_day", name: "入门体验·1日", price: "1,980", form: "线下" },
        { sku_id: "sku_em_online", name: "线上微课包", price: "599", form: "线上" },
      ],
    },
    {
      product_id: "prod_couple",
      product_name: "夫妻沟通工作坊",
      series: "家庭关系",
      summary: "面向伴侣关系改善，与学习记录偏家庭向学员匹配。",
      retrain_note: "已报读可带配偶复训（需提前报备）。",
      entitlement_note: "—",
      tagAffinity: ["tag_4402"],
      intentFit: ["mid"],
      keywords: ["夫妻", "伴侣"],
      goods: [
        { sku_id: "sku_cp_2d", name: "线下工作坊·2天", price: "6,800", form: "线下" },
      ],
    },
  ];

  /** 学员 × 产品关系 mock（上线接报读/订单中心） */
  var PRODUCT_HISTORY_MOCK = {
    m10001: [
      {
        product_id: "prod_parent_talk",
        enrolled: false,
        purchased: true,
        sku_name: "线上年卡",
        date: "2024-08",
      },
    ],
    m10003: [
      {
        product_id: "prod_parent_talk",
        enrolled: true,
        purchased: false,
        sku_name: "本期现场·新训席位",
        date: "2025-04（本期）",
      },
    ],
    m10005: [
      {
        product_id: "prod_parent_talk",
        enrolled: true,
        purchased: true,
        sku_name: "基础班线下 + 线上补充包",
        date: "2023 / 2024",
      },
    ],
    m10007: [
      {
        product_id: "prod_emotion",
        enrolled: false,
        purchased: true,
        sku_name: "线上微课包",
        date: "2025-01",
      },
    ],
  };

  /**
   * 礼包目录（意向分析列表 / 抽屉 / APP 卡片专用副本）。
   * 闸门与画像助手一致：事业说明会「意向了解方向」含导师或天使。
   * 本地实现，不引用助手 core。
   */
  var GIFT_CATALOG = [
    {
      giftId: "gift-angel-l2-b",
      giftName: "二级传播天使进阶报读「高EQ导师」进阶版B",
      audience: "angel",
      price: "50,000",
      description: "面向事业说明会登记「天使」意向的学员。",
    },
    {
      giftId: "gift-mentor-l2-a",
      giftName: "高EQ导师进阶版A（首次升级购买）",
      audience: "mentor",
      price: "50,000",
      description: "面向事业说明会登记「导师」意向的学员。",
    },
    {
      giftId: "gift-mentor-l2-a-v2",
      giftName: "二级传播天使进阶报读导师A V2.0",
      audience: "both",
      price: "50,000",
      description: "导师与传播天使进阶共用礼包。",
    },
  ];

  function hasCareerGiftIntent(direction) {
    var text = String(direction == null ? "" : direction).trim();
    if (!text || text === "无" || text === "暂无" || text === "—") return false;
    return /导师/.test(text) || /天使/.test(text);
  }

  function directionIntentLabel(direction) {
    var text = String(direction || "");
    var wantMentor = /导师/.test(text);
    var wantAngel = /天使/.test(text);
    if (wantMentor && wantAngel) return "导师与传播天使";
    if (wantMentor) return "导师";
    if (wantAngel) return "传播天使";
    return "";
  }

  function pickGiftPackage(direction) {
    if (!hasCareerGiftIntent(direction)) return null;
    var wantMentor = /导师/.test(String(direction));
    var wantAngel = /天使/.test(String(direction));
    var pref = wantMentor && wantAngel ? "both" : wantMentor ? "mentor" : "angel";
    var i;
    for (i = 0; i < GIFT_CATALOG.length; i++) {
      if (GIFT_CATALOG[i].audience === pref) return GIFT_CATALOG[i];
    }
    return GIFT_CATALOG[0];
  }

  function enrichStudent(student) {
    if (!student) return null;
    if (student.intentLevel) return student;
    if (global.AppIntent && global.AppIntent.getById) {
      return global.AppIntent.getById(student.id) || student;
    }
    return student;
  }

  function getGiftRecommendation(student) {
    var enriched = enrichStudent(student);
    if (!enriched) return null;
    var gift = pickGiftPackage(enriched.intendedDirection);
    if (!gift) return null;
    return {
      giftId: gift.giftId,
      giftName: gift.giftName,
      audience: gift.audience,
      price: gift.price,
      description: gift.description,
      intendedDirection: String(enriched.intendedDirection || "").trim(),
      directionLabel: directionIntentLabel(enriched.intendedDirection),
    };
  }

  function tagByCode(code) {
    return (global.INTENT_TAG_FLAT || []).find(function (t) {
      return t.code === code;
    });
  }

  function getProductHistory(student) {
    if (!student) return [];
    if (student.productHistory && student.productHistory.length) {
      return student.productHistory;
    }
    return PRODUCT_HISTORY_MOCK[student.id] || [];
  }

  /** @returns { enrolled, purchased, status, label, staff_reminder } */
  function getProductRelation(student, productId) {
    var rows = getProductHistory(student).filter(function (r) {
      return r.product_id === productId;
    });
    var enrolled = rows.some(function (r) {
      return r.enrolled;
    });
    var purchased = rows.some(function (r) {
      return r.purchased;
    });
    var detail = rows[0];
    var status = "none";
    var label = "未报读未购买";
    var staff_reminder = "";

    if (enrolled && purchased) {
      status = "both";
      label = "已报读 · 已购买";
      staff_reminder =
        "该学员对本产品既有报读记录也有购买记录。请核对复训资格、未使用权益及本期是否需升舱至其他商品。";
    } else if (enrolled) {
      status = "enrolled";
      label = "已报读";
      staff_reminder =
        "学员已报读本产品，沟通时优先说明复训政策、下期席位或同产品其他商品（如线上补充）差异，勿按新训话术推介。";
    } else if (purchased) {
      status = "purchased";
      label = "已购买";
      staff_reminder =
        "学员已购买本产品相关商品，请提醒使用资格/有效期，并判断是否需要升级班型或增购其他商品。";
    } else {
      staff_reminder = "学员尚未报读或购买本产品，可按新训/首购策略沟通。";
    }

    return {
      enrolled: enrolled,
      purchased: purchased,
      status: status,
      label: label,
      staff_reminder: staff_reminder,
      history_detail: detail
        ? (detail.sku_name || "") + (detail.date ? "（" + detail.date + "）" : "")
        : "",
    };
  }

  function goodsPriceRange(product) {
    var goods = product.goods || [];
    if (!goods.length) return "—";
    var prices = goods.map(function (g) {
      return g.price;
    });
    if (prices.length === 1) return prices[0] + " 起";
    return prices[0] + " ~ " + prices[prices.length - 1];
  }

  function renderGoodsList(product, max) {
    max = max || 3;
    return (product.goods || [])
      .slice(0, max)
      .map(function (g) {
        return (
          '<li><span class="course-goods__name">' +
          escapeHtml(g.name) +
          '</span><span class="course-goods__meta">' +
          escapeHtml(g.form) +
          " · ¥" +
          escapeHtml(g.price) +
          "</span></li>"
        );
      })
      .join("");
  }

  function scoreProduct(product, student) {
    var hits = student.hits || [];
    var affinity = 0;
    hits.forEach(function (code) {
      if (product.tagAffinity.indexOf(code) >= 0) affinity += 25;
    });
    if (product.intentFit.indexOf(student.intentLevel) >= 0) affinity += 20;
    var follow = (student.follow && student.follow.content) || "";
    var ai = (student.ai && student.ai.full) || "";
    var blob = follow + ai + (student.learn || "") + (student.video || "");
    product.keywords.forEach(function (kw) {
      if (blob.indexOf(kw) >= 0) affinity += 8;
    });
    if (follow.indexOf("进阶") >= 0 && product.product_id === "prod_parent_talk") {
      affinity += 18;
    }
    if (follow.indexOf("分期") >= 0 || follow.indexOf("价格") >= 0) {
      if (product.product_id === "prod_emotion") affinity += 12;
    }
    var rel = getProductRelation(student, product.product_id);
    if (rel.status === "enrolled" || rel.status === "both") affinity += 5;
    return Math.min(98, Math.max(35, affinity + 15 + hits.length * 3));
  }

  function buildReasons(product, student, relation) {
    var reasons = [];
    (student.hits || []).forEach(function (code) {
      if (product.tagAffinity.indexOf(code) >= 0) {
        var t = tagByCode(code);
        if (t) reasons.push("命中「" + t.name + "」");
      }
    });
    if (relation.status !== "none") {
      reasons.push("学员对该产品：" + relation.label);
    }
    if (student.follow && student.follow.content !== "—") {
      reasons.push("跟进记录含关键诉求");
    }
    if (student.ai && student.ai.summary) {
      reasons.push("AI 意向：" + student.ai.summary);
    }
    if (!reasons.length) reasons.push("与产品人群画像匹配");
    return reasons.slice(0, 4);
  }

  function buildPitch(product, student, matchPercent, relation) {
    var name = student.name || "学员";
    var pn = product.product_name;
    if (relation.status === "enrolled" || relation.status === "both") {
      return (
        name +
        " 已报读「" +
        pn +
        "」，建议围绕复训/升舱沟通（匹配 " +
        matchPercent +
        "%），并说明同产品下其他商品差异。"
      );
    }
    if (relation.status === "purchased") {
      return (
        name +
        " 已购买「" +
        pn +
        "」相关商品，请先确认使用资格，再推荐是否需要增购或升级（匹配 " +
        matchPercent +
        "%）。"
      );
    }
    if (student.intentLevel === "low") {
      return "建议以「" + pn + "」低门槛商品切入，建立信任后再谈升单。";
    }
    return "结合标签与行为，「" + pn + "」产品适合作为当前沟通主推（匹配 " + matchPercent + "%）。";
  }

  function buildItem(product, student) {
    var match = scoreProduct(product, student);
    var relation = getProductRelation(student, product.product_id);
    var caution = "";
    if (student.follow && student.follow.content.indexOf("价格") >= 0) {
      caution = "学员价格敏感，先确认分期/优惠再推高价商品。";
    }
    return {
      product: product,
      course: product,
      match_percent: match,
      relation: relation,
      reasons: buildReasons(product, student, relation),
      pitch_one_liner: buildPitch(product, student, match, relation),
      caution: caution,
      goods_price_range: goodsPriceRange(product),
    };
  }

  function getRecommendations(student) {
    if (!student) return null;
    var enriched = enrichStudent(student);

    var scored = PRODUCT_CATALOG.map(function (p) {
      return buildItem(p, enriched);
    }).sort(function (a, b) {
      return b.match_percent - a.match_percent;
    });

    return {
      primary: scored[0],
      alternatives: scored.slice(1, 3),
      generated_at: new Date().toISOString(),
      source: "mock-agent-v2-product",
      recommend_unit: "product",
    };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function relationBadgeClass(status) {
    if (status === "enrolled") return "course-relation--enrolled";
    if (status === "purchased") return "course-relation--purchased";
    if (status === "both") return "course-relation--both";
    return "course-relation--none";
  }

  function renderRelationBlock(relation, product) {
    var extra =
      relation.history_detail && relation.status !== "none"
        ? '<p class="course-relation__detail">记录：' +
          escapeHtml(relation.history_detail) +
          "</p>"
        : "";
    var policy =
      relation.status === "enrolled" || relation.status === "both"
        ? product.retrain_note
        : relation.status === "purchased"
          ? product.entitlement_note
          : "";
    return (
      '<div class="course-relation ' +
      relationBadgeClass(relation.status) +
      '">' +
      '<span class="course-relation__label">' +
      escapeHtml(relation.label) +
      "</span>" +
      '<p class="course-relation__reminder">' +
      escapeHtml(relation.staff_reminder) +
      "</p>" +
      extra +
      (policy && relation.status !== "none"
        ? '<p class="course-relation__policy">📋 ' + escapeHtml(policy) + "</p>"
        : "") +
      "</div>"
    );
  }

  function renderProductCard(item, isPrimary) {
    var p = item.product;
    var rel = item.relation;
    return (
      '<div class="course-card' +
      (isPrimary ? " course-card--primary" : " course-card--alt") +
      '">' +
      (isPrimary ? '<div class="course-card__tag">主推产品</div>' : "") +
      '<div class="course-card__head">' +
      '<div class="course-card__title-wrap">' +
      '<div class="course-card__name">' +
      escapeHtml(p.product_name) +
      "</div>" +
      '<div class="course-card__meta">' +
      escapeHtml(p.series) +
      " · 共 " +
      (p.goods ? p.goods.length : 0) +
      " 个商品</div>" +
      "</div>" +
      (isPrimary
        ? '<div class="course-card__match-wrap"><div class="course-card__match">' +
          item.match_percent +
          '<small>%</small></div><div class="course-card__match-label">匹配度</div></div>'
        : '<span class="course-card__match">' +
          item.match_percent +
          "%</span>") +
      "</div>" +
      renderRelationBlock(rel, p) +
      '<div class="course-card__price">商品价位参考：' +
      escapeHtml(item.goods_price_range) +
      "</div>" +
      '<ul class="course-goods">' +
      renderGoodsList(p) +
      "</ul>" +
      '<p class="course-card__summary">' +
      escapeHtml(p.summary) +
      "</p>" +
      '<div class="course-card__pitch">' +
      '<span class="course-card__pitch-label">沟通参考</span>' +
      escapeHtml(item.pitch_one_liner) +
      "</div>" +
      (item.caution
        ? '<p class="course-card__caution">⚠ ' + escapeHtml(item.caution) + "</p>"
        : "") +
      (isPrimary
        ? '<ul class="course-card__reasons">' +
          item.reasons
            .map(function (r) {
              return "<li>" + escapeHtml(r) + "</li>";
            })
            .join("") +
          "</ul>" +
          '<button type="button" class="course-card__copy" data-copy-pitch="' +
          escapeAttr(item.pitch_one_liner) +
          '">复制话术</button>'
        : '<p class="course-card__pitch course-card__pitch--compact">' +
          escapeHtml(item.pitch_one_liner) +
          "</p>") +
      "</div>"
    );
  }

  function renderGiftBlock(student) {
    var gift = getGiftRecommendation(student);
    if (!gift) return "";
    return (
      '<section class="course-gift-block">' +
      '<div class="course-gift-block__head">' +
      '<h3 class="course-gift-block__title">礼包权益</h3>' +
      '<span class="course-gift-block__badge">意向了解方向 · ' +
      escapeHtml(gift.directionLabel) +
      "</span></div>" +
      '<p class="course-gift-block__direction">事业说明会登记了对' +
      escapeHtml(gift.directionLabel) +
      "的意向，与课程产品分区展示。</p>" +
      '<div class="course-gift-card">' +
      '<div class="course-gift-card__name">' +
      escapeHtml(gift.giftName) +
      "</div>" +
      '<div class="course-gift-card__meta">参考价 ¥' +
      escapeHtml(gift.price) +
      "</div>" +
      '<p class="course-gift-card__desc">' +
      escapeHtml(gift.description) +
      "</p></div></section>"
    );
  }

  function renderDetailBlock(student) {
    var rec = getRecommendations(student);
    if (!rec || !rec.primary) {
      return (
        '<section class="detail-block course-recommend">' +
        '<h3 class="detail-block__title">AI 产品推荐</h3>' +
        '<p class="course-recommend__empty">暂无推荐，请完成意向分析或补充跟进后重试。</p></section>' +
        renderGiftBlock(student)
      );
    }

    var altHtml = rec.alternatives
      .map(function (alt) {
        return renderProductCard(alt, false);
      })
      .join("");

    return (
      '<section class="detail-block detail-block--recommend course-recommend">' +
      '<div class="course-recommend__head">' +
      '<h3 class="detail-block__title">课程产品</h3>' +
      '<span class="course-recommend__badge">知识库 · 智能体</span>' +
      "</div>" +
      '<p class="course-recommend__hint">推荐对象为<strong>课程产品</strong>（非单一商品）。已报读/已购买的产品仍会推荐，并提示复训与使用资格，供工作人员现场判断。</p>' +
      renderProductCard(rec.primary, true) +
      (altHtml
        ? '<details class="course-recommend__alts"><summary>查看备选产品（' +
          rec.alternatives.length +
          "）</summary>" +
          altHtml +
          "</details>"
        : "") +
      renderGiftBlock(student) +
      '<p class="course-recommend__disclaimer">AI 建议不可人工改推荐结果；是否讲解由工作人员现场决定。</p>' +
      "</section>"
    );
  }

  function renderListHint(student) {
    var rec = getRecommendations(student);
    if (!rec || !rec.primary) return "";
    var rel = rec.primary.relation;
    var flag =
      rel.status !== "none"
        ? ' <span class="intent-card__course-flag">' + escapeHtml(rel.label) + "</span>"
        : "";
    var gift = getGiftRecommendation(student);
    var giftRow = gift
      ? '<div class="intent-card__gift">礼包 · ' + escapeHtml(gift.giftName) + "</div>"
      : "";
    return (
      '<div class="intent-card__course">课 · ' +
      escapeHtml(rec.primary.product.product_name) +
      ' <span class="intent-card__course-match">' +
      rec.primary.match_percent +
      "%</span>" +
      flag +
      "</div>" +
      giftRow
    );
  }

  function renderTableCell(student) {
    var rec = getRecommendations(student);
    if (!rec || !rec.primary) return "—";
    var item = rec.primary;
    var tip =
      item.pitch_one_liner +
      "\n【" +
      item.relation.label +
      "】" +
      item.relation.staff_reminder;
    var gift = getGiftRecommendation(student);
    var giftRow = gift
      ? '<span class="intent-course-cell__gift">礼包 · ' +
        escapeHtml(gift.giftName) +
        "</span>"
      : "";
    return (
      '<span class="intent-course-cell">' +
      '<span class="intent-course-cell__course intent-tip" tabindex="0" data-tip="' +
      escapeAttr(tip) +
      '"><span class="intent-course-cell__text">' +
      escapeHtml(item.product.product_name) +
      ' <em class="intent-course-cell__pct">' +
      item.match_percent +
      "%</em>" +
      (item.relation.status !== "none"
        ? ' <span class="intent-course-cell__rel">' + escapeHtml(item.relation.label) + "</span>"
        : "") +
      '</span><span class="intent-tip__popup" role="tooltip">' +
      escapeHtml(tip) +
      "</span></span>" +
      giftRow +
      "</span>"
    );
  }

  function renderDrawerPanel(student) {
    return renderDetailBlock(student).replace(
      "detail-block--recommend",
      "detail-block--recommend detail-block--drawer"
    );
  }

  function bindCopyButtons(root) {
    if (!root) return;
    root.querySelectorAll(".course-card__copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy-pitch") || "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = "已复制";
            setTimeout(function () {
              btn.textContent = "复制话术";
            }, 1500);
          });
        } else {
          alert(text);
        }
      });
    });
  }

  /** 中控「本期高频」只计课程产品，礼包客单价不进榜。 */
  function getConferenceTopProducts(students, limit) {
    limit = limit || 3;
    var count = {};
    (students || []).forEach(function (s) {
      var rec = getRecommendations(s);
      if (rec && rec.primary) {
        var id = rec.primary.product.product_id;
        if (!count[id]) {
          count[id] = { product: rec.primary.product, n: 0 };
        }
        count[id].n += 1;
      }
    });
    return Object.keys(count)
      .map(function (id) {
        return count[id];
      })
      .sort(function (a, b) {
        return b.n - a.n;
      })
      .slice(0, limit);
  }

  global.CourseRecommend = {
    PRODUCT_CATALOG: PRODUCT_CATALOG,
    CATALOG: PRODUCT_CATALOG,
    GIFT_CATALOG: GIFT_CATALOG,
    hasCareerGiftIntent: hasCareerGiftIntent,
    directionIntentLabel: directionIntentLabel,
    getGiftRecommendation: getGiftRecommendation,
    getProductHistory: getProductHistory,
    getProductRelation: getProductRelation,
    getRecommendations: getRecommendations,
    renderDetailBlock: renderDetailBlock,
    renderGiftBlock: renderGiftBlock,
    renderListHint: renderListHint,
    renderTableCell: renderTableCell,
    renderDrawerPanel: renderDrawerPanel,
    bindCopyButtons: bindCopyButtons,
    getConferenceTopCourses: getConferenceTopProducts,
    getConferenceTopProducts: getConferenceTopProducts,
  };
})(window);
