/**
 * 画像档案 · AI 对话小弹窗（原型）
 * 针对当前学员，用自然语言追问；回答基于本页 mock 档案事实。
 * 预设 chips：分析跟进 / 沟通话术 / 消费能力 / 课程购买建议（事实归纳 + 轻建议）。
 */
(function () {
  "use strict";

  var id = new URLSearchParams(location.search).get("id") || "m10009";
  var pack =
    window.ConferenceProfileData && window.ConferenceProfileData.getProfile
      ? window.ConferenceProfileData.getProfile(id)
      : null;
  if (!pack) return;

  var s = pack.student;
  var d = pack.detail;

  /** 原型「今天」锚点，用于近 12 个月口径 */
  var TODAY = new Date("2026-08-07T00:00:00");

  var CHIPS = [
    { label: "分析跟进记录", q: "分析沟通跟进记录" },
    { label: "生成沟通话术", q: "生成沟通话术策略" },
    { label: "近期消费能力", q: "查询学员近期消费能力" },
    { label: "课程购买建议", q: "课程购买建议" },
  ];

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function tagLine() {
    return (d.systemTags || [])
      .map(function (t) {
        return t.parent + "/" + t.name;
      })
      .join("、");
  }

  function purchaseLine() {
    return (d.purchaseByProduct || [])
      .map(function (p) {
        return p.product + "×" + p.count;
      })
      .join("；");
  }

  function followLine() {
    var f = (d.follows || [])[0];
    if (!f) return "暂无跟进记录";
    return (
      f.type +
      " · " +
      (f.tags || []).join("/") +
      " · " +
      f.content +
      "（" +
      f.time +
      "）"
    );
  }

  function relationLine() {
    var rg = d.relationGraph || {};
    var recUp = ((rg.recommend && rg.recommend.upstream) || [])
      .map(function (x) {
        return x.name;
      })
      .join("、");
    var belUp = ((rg.belong && rg.belong.upstream) || [])
      .map(function (x) {
        return x.name;
      })
      .join("、");
    var recDown = ((rg.recommend && rg.recommend.downstream) || []).length;
    var belDown = ((rg.belong && rg.belong.downstream) || []).length;
    return (
      "推荐上游：" +
      (recUp || "无") +
      "；归属上级：" +
      (belUp || "无") +
      "；下游推荐 " +
      recDown +
      " 人、下级绑定 " +
      belDown +
      " 人"
    );
  }

  function familyLine() {
    var fg = d.familyGroup;
    if (!fg || !fg.members) return "暂无家庭组";
    return (
      "家庭ID " +
      fg.familyId +
      "，" +
      fg.members
        .map(function (m) {
          return m.name + "（" + m.role + "）";
        })
        .join("、")
    );
  }

  function communityLine() {
    var list = d.communityTopics || [];
    if (!list.length) return "暂无社区话题活跃";
    return list
      .slice(0, 3)
      .map(function (t) {
        return t.topic + "（浏览" + t.views + "）";
      })
      .join("；");
  }

  function unitPriceMap() {
    var map = {};
    (d.purchaseByProduct || []).forEach(function (p) {
      var c = Math.max(1, Number(p.count) || 1);
      map[p.product] = (Number(p.amount) || 0) / c;
    });
    return map;
  }

  /** 近 12 个月已支付（按购课时间；金额用产品均价估算） */
  function recentSpendStats() {
    var cutoff = new Date(TODAY);
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    var prices = unitPriceMap();
    var recent = (d.purchases || []).filter(function (p) {
      if (!p.time) return false;
      var t = new Date(String(p.time).replace(/-/g, "/"));
      return !isNaN(t.getTime()) && t >= cutoff && t <= TODAY;
    });
    var total = 0;
    var lines = recent.map(function (p) {
      var amt = Math.round(prices[p.product] || 0);
      total += amt;
      return (
        "· " +
        p.time +
        " " +
        p.product +
        " / " +
        (p.goods || "") +
        " ≈¥" +
        amt
      );
    });
    var rep = (d.repurchase || [])
      .map(function (r) {
        return r.product + "×" + r.count;
      })
      .join("、");
    var tier;
    var tierHint;
    if (!recent.length || total < 5000) {
      tier = "偏弱";
      tierHint = "近 12 个月成交偏少，沟通宜先建立信任与需求，不宜强推高客单。";
    } else if (total < 20000) {
      tier = "中等";
      tierHint = "有一定付费基础，可围绕已购主题做进阶/复训轻建议。";
    } else {
      tier = "偏强";
      tierHint = "付费能力相对较强，可优先高质量跟进，仍避免逼单话术。";
    }
    return {
      cutoff: cutoff,
      recent: recent,
      total: total,
      lines: lines,
      rep: rep,
      tier: tier,
      tierHint: tierHint,
    };
  }

  function answerAnalyzeFollow(name) {
    var follows = d.follows || [];
    if (!follows.length) {
      return (
        "【分析跟进记录】\n暂无跟进记录可分析。\n\n建议先在会务跟进中补录沟通内容后再问我。"
      );
    }
    var points = follows
      .slice(0, 5)
      .map(function (f, i) {
        return (
          i +
          1 +
          ". [" +
          f.type +
          "] " +
          (f.time || "") +
          "\n   " +
          (f.content || "（无正文）") +
          (f.tags && f.tags.length ? "｜标签：" + f.tags.join("/") : "") +
          (f.conference ? "｜" + f.conference : "")
        );
      })
      .join("\n");
    var latest = follows[0];
    var risk =
      /担心|冲突|犹豫|观望|时间/.test(latest.content || "")
        ? "最近一条出现顾虑信号（时间/犹豫类），跟进时需先回应障碍。"
        : "最近一条未出现明显抗拒措辞，可延续兴趣点深挖。";
    return (
      "【分析跟进记录 · " +
      name +
      "】\n" +
      "数据范围：画像跟进全量（跨会务，与「跟进查看更多」同源）\n\n" +
      "一、沟通脉络\n" +
      points +
      (follows.length > 5 ? "\n…另有 " + (follows.length - 5) + " 条见档案跟进抽屉\n" : "\n") +
      "\n二、关注点 / 风险\n" +
      "· " +
      risk +
      "\n· 标签线索：" +
      (tagLine() || "无系统标签") +
      "\n\n" +
      "三、待确认问题（轻建议）\n" +
      "1. 当前最卡的是时间、预算，还是决策人？\n" +
      "2. 对已购课程的体验如何，是否愿意谈进阶？\n" +
      "3. 是否需要协同归属天使（" +
      (d.basic && d.basic.belongAngel ? d.basic.belongAngel : "—") +
      "）一起触达？\n\n" +
      "说明：事实归纳 + 轻建议，非正式商机诊断。"
    );
  }

  function answerScriptStrategy(name) {
    var latest =
      (d.follows && d.follows[0] && d.follows[0].content) || "暂无最近跟进";
    var hasRep = (d.repurchase || []).length > 0;
    return (
      "【沟通话术策略 · 原型推演 · " +
      name +
      "】\n" +
      "依据：档案标签 / 跟进 / 购课复购 / 关系（不绑定意向推荐课）\n\n" +
      "一、开场框架\n" +
      "「" +
      name +
      "你好，看到你之前提到「" +
      latest.slice(0, 36) +
      (latest.length > 36 ? "…" : "") +
      "」，想先跟你对齐一下近况和最关心的点。」\n\n" +
      "二、追问点\n" +
      "1. 结合标签「" +
      (tagLine() || "—") +
      "」，确认当下真实需求场景。\n" +
      "2. 购课侧：" +
      (hasRep
        ? "已有复购（" +
          (d.repurchase || [])
            .map(function (r) {
              return r.product;
            })
            .join("、") +
          "），可问复训/进阶体验预期。"
        : "可围绕已购「" +
          (purchaseLine() || "课程") +
          "」问收获与未满足点。") +
      "\n" +
      "3. 关系侧：可礼貌协同推荐人 " +
      (d.basic && d.basic.recommender ? d.basic.recommender : "—") +
      " / 归属天使 " +
      (d.basic && d.basic.belongAngel ? d.basic.belongAngel : "—") +
      "。\n\n" +
      "三、避免点\n" +
      "· 不直接锁席/逼单；不臆造未在档案中的承诺。\n" +
      "· 先回应跟进里的顾虑，再谈下一步。\n\n" +
      "说明：此为对话式推演，供面谈参考，不替代正式商机模块。"
    );
  }

  function answerSpendAbility(name) {
    var st = recentSpendStats();
    var body =
      st.lines.length > 0
        ? st.lines.join("\n")
        : "· 近 12 个月暂无已支付购课记录";
    return (
      "【近期消费能力 · " +
      name +
      "】\n" +
      "口径：近 12 个月已支付订单（原型锚点 " +
      TODAY.toISOString().slice(0, 10) +
      "）\n\n" +
      "一、事实\n" +
      body +
      "\n· 估算合计 ≈¥" +
      st.total +
      " · 笔数 " +
      st.recent.length +
      "\n· 复购产品：" +
      (st.rep || "暂无") +
      "\n· 历史购课结构：" +
      (purchaseLine() || "无") +
      "\n\n" +
      "二、粗标签：" +
      st.tier +
      "\n· " +
      st.tierHint +
      "\n\n" +
      "脚注（原型阈值）：≥2万偏强；5千～2万中等；<5千或无单偏弱。非正式风控评级。"
    );
  }

  function answerCoursePurchase(name) {
    var st = recentSpendStats();
    var tags = tagLine() || "无";
    var purchased = purchaseLine() || "暂无";
    var path;
    if (st.tier === "偏弱") {
      path =
        "一、学习路径（经济条件偏紧 · 先免费沉淀）\n" +
        "1. 免费直播场次：优先引导固定跟上 6:30 / 12:30 / 21:30（或 9:30）时段直播，养成节奏再谈付费。\n" +
        "2. 社区：鼓励逛话题、发想法、看同伴案例，用低成本建立信任与需求意识。\n" +
        "3. 线上免费课程 / 公开课：先完成 1～2 个免费课，验证学习意愿与时间。\n" +
        "4. 暂缓高客单会销锁席；若出现强意向，再轻量介绍低门槛入门产品。\n";
    } else if (st.tier === "中等") {
      path =
        "一、学习路径（有一定付费基础 · 免费+进阶组合）\n" +
        "1. 仍可搭配免费直播（6:30 / 12:30 / 21:30 或 9:30）与社区，保持活跃。\n" +
        "2. 围绕已购「" +
        purchased +
        "」推荐同主题进阶/复训，或中客单产品，避免一步跳最高单价。\n" +
        "3. 线上免费课可作「会前预热」，付费课作「会中/会后转化」。\n";
    } else {
      path =
        "一、学习路径（付费能力偏强 · 可谈高单价）\n" +
        "1. 可优先匹配高客单/高阶训练营、系统班、家庭同行等高价值产品（结合标签与跟进兴趣）。\n" +
        "2. 免费直播与社区仍可作陪伴触达，但主推不必停在免费层。\n" +
        "3. 已购结构「" +
        purchased +
        "」——若已有复购，可谈进阶权益、复训席或更高阶体系课。\n";
    }
    return (
      "【课程购买 / 学习建议 · " +
      name +
      "】\n" +
      "依据：近 12 个月消费力粗标签「" +
      st.tier +
      "」（≈¥" +
      st.total +
      "）+ 标签「" +
      tags +
      "」+ 购课结构\n\n" +
      path +
      "\n二、面谈提示（轻建议）\n" +
      "· 先对齐时间与决策顾虑，再给路径；不逼单。\n" +
      "· 路径随消费力分档，非正式报价单；具体产品以会务现场策略为准。\n\n" +
      "说明：原型推演，不替代正式商机/推荐课模块。"
    );
  }

  function answerInterest(name) {
    var learn = d.learnRecords || [];
    var video = d.videoRecords || [];
    var live = d.liveRecords || [];
    var learnLine = learn
      .slice(0, 3)
      .map(function (x) {
        return x.course || "";
      })
      .filter(Boolean)
      .join("、");
    var videoLine = video
      .slice(0, 3)
      .map(function (x) {
        return x.title || "";
      })
      .filter(Boolean)
      .join("、");
    var liveLine = live
      .slice(0, 2)
      .map(function (x) {
        return x.team || x.session || "";
      })
      .filter(Boolean)
      .join("、");
    return (
      "【近期兴趣点 · " +
      name +
      "】\n" +
      "· 社区话题：" +
      communityLine() +
      "\n" +
      "· 学习：" +
      (learnLine || "暂无明细，可看档案「近期行为」") +
      "\n" +
      "· 视频：" +
      (videoLine || "暂无") +
      "\n" +
      "· 直播：" +
      (liveLine || "暂无") +
      "\n" +
      "· 购课偏好：" +
      (purchaseLine() || "无") +
      "\n\n" +
      "轻建议：面谈可从高频话题/在学课程切入，再确认是否愿意深入相关主题。"
    );
  }

  function answerBehaviorSummary(name) {
    var trend = d.behaviorTrend || {};
    var lastC = (trend.community || []).slice(-1)[0];
    var lastL = (trend.live || []).slice(-1)[0];
    return (
      "【行为汇总 · " +
      name +
      "】\n" +
      "· 近30天趋势点：社区 " +
      (lastC != null ? lastC : "—") +
      " · 直播 " +
      (lastL != null ? lastL : "—") +
      "\n" +
      "· 明细条数：社区 " +
      (d.communityRecords || []).length +
      " · 学习 " +
      (d.learnRecords || []).length +
      " · 视频 " +
      (d.videoRecords || []).length +
      " · 直播 " +
      (d.liveRecords || []).length +
      "\n" +
      "· 社区摘要：" +
      communityLine() +
      "\n\n" +
      "完整明细见档案「近期行为」四 Tab / 查看更多。"
    );
  }

  function answerTagInsight(name) {
    var tags = d.systemTags || [];
    if (!tags.length) {
      return (
        "【标签命中解读 · " +
        name +
        "】\n当前无系统标签命中。可结合跟进与行为再观察意向信号。"
      );
    }
    var lines = tags
      .map(function (t, i) {
        return (
          i +
          1 +
          ". " +
          t.parent +
          " / " +
          t.name +
          (t.weight != null ? "（权重 " + t.weight + "）" : "")
        );
      })
      .join("\n");
    return (
      "【标签命中解读 · " +
      name +
      "】\n" +
      lines +
      "\n\n" +
      "轻建议：面谈话术优先覆盖权重较高或与最近跟进一致的标签场景；标签是信号不是结论。"
    );
  }

  function answer(q) {
    var text = String(q || "").trim();
    var name = s.name6q;

    if (!text) {
      return "请用自然语言提问，或点击下方快捷问题。";
    }

    /* 预设与第 4 类代表：优先于泛匹配 */
    if (/分析.*跟进|沟通跟进记录|跟进记录分析/.test(text)) {
      return answerAnalyzeFollow(name);
    }
    if (/沟通话术|话术策略|生成.*话术/.test(text)) {
      return answerScriptStrategy(name);
    }
    if (/消费能力|近期消费|消费力/.test(text)) {
      return answerSpendAbility(name);
    }
    if (/课程购买|购课建议|学习建议|购买建议/.test(text)) {
      return answerCoursePurchase(name);
    }
    if (/兴趣|感兴趣|偏好/.test(text)) {
      return answerInterest(name);
    }
    if (/行为汇总|汇总.*行为/.test(text)) {
      return answerBehaviorSummary(name);
    }
    if (/标签命中|标签解读|解读.*标签/.test(text)) {
      return answerTagInsight(name);
    }

    if (/概括|画像|整体|总结|是谁|简介/.test(text)) {
      return (
        "【" +
        name +
        " · 画像摘要】\n" +
        "· 身份：" +
        (d.basic.memberStatusDetail || s.memberStatus) +
        " · " +
        (d.basic.identities || []).join("/") +
        (s.trainTag ? " · " + s.trainTag : "") +
        "\n" +
        "· 地区/服务处：" +
        (d.basic.cityDetail || s.city) +
        " · " +
        (d.basic.opsUnit || "—") +
        "\n" +
        "· 系统标签：" +
        (tagLine() || "无命中") +
        "\n" +
        "· 职业/行业：" +
        (d.basic.occupation || "—") +
        " / " +
        (d.basic.industry || "—") +
        "\n" +
        "· 家庭：" +
        familyLine() +
        "\n\n" +
        "也可点快捷问题：分析跟进记录 / 生成沟通话术 / 近期消费能力 / 课程购买建议。"
      );
    }

    if (/复购|购课|购买|订单|课程产品/.test(text)) {
      var rep = (d.repurchase || [])
        .map(function (r) {
          return r.product + "（" + r.count + "次，累计¥" + r.amount + "）";
        })
        .join("；");
      return (
        "【购课 / 复购】\n" +
        "· 按课程产品计次：" +
        (purchaseLine() || "无") +
        "\n" +
        "· 复购（同产品≥2）：" +
        (rep || "暂无") +
        "\n" +
        "· 订单笔数 " +
        (d.purchases || []).length +
        "，退款单 " +
        (d.refunds || []).length +
        " 笔\n\n" +
        "若要看近 12 个月消费力，可问「查询学员近期消费能力」。"
      );
    }

    if (/推荐|归属|关系|天使|图谱/.test(text)) {
      return (
        "【关系图谱 · 当前生效】\n" +
        "· " +
        relationLine() +
        "\n" +
        "· 档案摘要推荐人：" +
        (d.basic.recommender || "—") +
        "；归属天使：" +
        (d.basic.belongAngel || "—") +
        "\n" +
        "· 推荐来源：" +
        (d.basic.referralSource || "—") +
        "\n\n" +
        "主图仅 1 跳、当前生效关系；历史变更见关系图谱旁侧预览。"
      );
    }

    if (/跟进|意向|沟通|面谈/.test(text)) {
      var hist = (d.follows || [])
        .slice(0, 3)
        .map(function (f, i) {
          return (
            i +
            1 +
            ". [" +
            f.type +
            "] " +
            (f.tags || []).join("/") +
            " — " +
            f.content
          );
        })
        .join("\n");
      return (
        "【跟进重点】\n" +
        "· 最近一条：" +
        followLine() +
        "\n" +
        (hist ? "· 近几条：\n" + hist + "\n" : "") +
        "\n需要结构化分析可点「分析跟进记录」；需要话术可点「生成沟通话术」。"
      );
    }

    if (/社区|话题|直播|行为|活跃|视频|学习/.test(text)) {
      return answerBehaviorSummary(name);
    }

    if (
      /跟进建议|下一步|怎么跟|推什么|适合|转化|锁席|会销/.test(text) ||
      /建议/.test(text)
    ) {
      return answerScriptStrategy(name);
    }

    if (/家庭|孩子|配偶|父母/.test(text)) {
      return "【家庭组】\n" + familyLine() + "\n\n可用于识别同行报读、亲子课程场景。";
    }

    if (/退款|售后|退费/.test(text)) {
      var rf = (d.refunds || [])[0];
      if (!rf) return "档案中暂无课程退款订单。";
      return (
        "【售后 / 退款】\n" +
        "· " +
        rf.goods +
        "\n· 实退 ¥" +
        rf.actual +
        " · 状态 " +
        rf.status +
        "\n· 单号 " +
        rf.refundNo +
        "\n· 创建 " +
        rf.createdAt
      );
    }

    return (
      "已结合 " +
      name +
      "（" +
      s.memberId +
      "）档案检索。\n\n" +
      "可点快捷问题，或试着问：近期兴趣点、行为汇总、标签命中解读、画像概括、购课复购、关系图谱。\n\n" +
      "当前速览：标签「" +
      (tagLine() || "无") +
      "」；购课「" +
      (purchaseLine() || "无") +
      "」；最近跟进「" +
      ((d.follows && d.follows[0] && d.follows[0].content) || "无") +
      "」。"
    );
  }

  function mount() {
    var wrap = document.createElement("div");
    wrap.className = "pf-ai";
    wrap.innerHTML =
      '<button type="button" class="pf-ai__fab" id="pfAiFab" aria-expanded="false" title="针对该学员提问">' +
      '<span class="pf-ai__fab-icon">AI</span>' +
      "<span>问学员</span>" +
      "</button>" +
      '<div class="pf-ai__panel" id="pfAiPanel" hidden>' +
      '<div class="pf-ai__head">' +
      "<div><strong>学员分析助手</strong>" +
      '<p class="pf-ai__sub">针对 <em>' +
      esc(s.name6q) +
      "</em> · 基于本页档案事实</p></div>" +
      '<button type="button" class="pf-ai__close" id="pfAiClose" aria-label="关闭">×</button>' +
      "</div>" +
      '<div class="pf-ai__msgs" id="pfAiMsgs" role="log" aria-live="polite"></div>' +
      '<div class="pf-ai__chips" id="pfAiChips"></div>' +
      '<form class="pf-ai__form" id="pfAiForm">' +
      '<input type="text" id="pfAiInput" placeholder="用自然语言提问，或点上方快捷问题" autocomplete="off" />' +
      '<button type="submit" class="q-btn q-btn--primary pf-ai__send">发送</button>' +
      "</form>" +
      '<p class="pf-ai__foot">原型模拟回复 · 非正式商机诊断</p>' +
      "</div>";

    document.body.appendChild(wrap);

    var fab = document.getElementById("pfAiFab");
    var panel = document.getElementById("pfAiPanel");
    var msgs = document.getElementById("pfAiMsgs");
    var chipsEl = document.getElementById("pfAiChips");
    var form = document.getElementById("pfAiForm");
    var input = document.getElementById("pfAiInput");

    CHIPS.forEach(function (c) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pf-ai__chip";
      btn.textContent = c.label;
      btn.addEventListener("click", function () {
        ask(c.q);
      });
      chipsEl.appendChild(btn);
    });

    function open() {
      panel.hidden = false;
      fab.setAttribute("aria-expanded", "true");
      fab.classList.add("is-open");
      if (!msgs.childElementCount) {
        push(
          "ai",
          "你好，我是 " +
            s.name6q +
            " 的分析助手。可点下方快捷问题，或自由追问（如近期兴趣点、行为汇总、标签命中解读）。"
        );
      }
      input.focus();
    }

    function close() {
      panel.hidden = true;
      fab.setAttribute("aria-expanded", "false");
      fab.classList.remove("is-open");
    }

    function push(role, text) {
      var div = document.createElement("div");
      div.className = "pf-ai__bubble pf-ai__bubble--" + role;
      div.innerHTML = esc(text).replace(/\n/g, "<br/>");
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function ask(q) {
      open();
      push("user", q);
      var typing = document.createElement("div");
      typing.className = "pf-ai__bubble pf-ai__bubble--ai pf-ai__typing";
      typing.textContent = "分析中…";
      msgs.appendChild(typing);
      msgs.scrollTop = msgs.scrollHeight;
      setTimeout(function () {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        push("ai", answer(q));
      }, 420 + Math.min(600, String(q).length * 12));
    }

    fab.addEventListener("click", function () {
      if (panel.hidden) open();
      else close();
    });
    document.getElementById("pfAiClose").addEventListener("click", close);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      input.value = "";
      ask(q);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
