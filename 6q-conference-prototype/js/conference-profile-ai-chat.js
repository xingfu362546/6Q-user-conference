/**
 * 画像档案 · AI 对话小弹窗（原型）
 * 针对当前学员，用自然语言追问；回答基于本页 mock 档案事实。
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

  function answer(q) {
    var text = String(q || "").trim();
    var low = text.toLowerCase();
    var name = s.name6q;

    if (!text) {
      return "请用自然语言提问，例如：「" + name + "适合推什么课？」";
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
        "以上为档案事实汇总；如需商机结论可继续追问「适合怎么跟进」。"
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
        "口径：已支付订单按「课程产品」+1；复购看同产品次数。"
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
        "\n建议结合标签「" +
        (tagLine() || "—") +
        "」与现场签到（" +
        s.group +
        " / " +
        s.clearance +
        "）安排跟进话术。"
      );
    }

    if (/社区|话题|直播|行为|活跃|视频|学习/.test(text)) {
      var trend = d.behaviorTrend || {};
      var lastC = (trend.community || []).slice(-1)[0];
      var lastL = (trend.live || []).slice(-1)[0];
      return (
        "【行为活跃】\n" +
        "· 社区话题（按话题名称）：" +
        communityLine() +
        "\n" +
        "· 近30天趋势（今日点）：社区 " +
        (lastC != null ? lastC : "—") +
        " · 直播 " +
        (lastL != null ? lastL : "—") +
        "\n" +
        "· 近期明细可参考档案「近期行为」表\n\n" +
        "社区口径对齐话题管理·话题名称，不用分类汇总代替。"
      );
    }

    if (/跟进建议|下一步|怎么跟|推什么|适合|转化|锁席|会销/.test(text) || /建议/.test(text)) {
      var highValue = tagLine().indexOf("高价值") >= 0 || tagLine().indexOf("消费") >= 0;
      var hasRep = (d.repurchase || []).length > 0;
      return (
        "【跟进建议 · 原型推演】\n" +
        "基于 " +
        name +
        " 的档案事实（非正式商机诊断）：\n" +
        "1. 优先结合最近跟进：" +
        ((d.follows && d.follows[0] && d.follows[0].content) || "暂无") +
        "\n" +
        "2. 产品侧：" +
        (hasRep
          ? "已有复购，可谈进阶/复训权益与家庭同行。"
          : "可围绕已购课程产品做进阶或同主题沙龙转化。") +
        "\n" +
        "3. 关系侧：归属天使 " +
        (d.basic.belongAngel || "—") +
        "，协同推荐人 " +
        (d.basic.recommender || "—") +
        " 做触达。\n" +
        "4. 标签侧：" +
        (highValue ? "命中高价值相关标签，可提高跟进优先级。" : "关注亲子/行为标签，匹配话术场景。") +
        "\n\n" +
        "说明：此为对话式分析原型，结论供会务参考，不替代正式商机模块。"
      );
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

    // 默认：给结构化速览 + 引导
    return (
      "已结合 " +
      name +
      "（" +
      s.memberId +
      "）档案检索。\n\n" +
      "可继续问：画像概括、购课复购、关系图谱、跟进重点、行为活跃、跟进建议。\n\n" +
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
      '<form class="pf-ai__form" id="pfAiForm">' +
      '<input type="text" id="pfAiInput" placeholder="用自然语言提问，例如：适合怎么跟进？" autocomplete="off" />' +
      '<button type="submit" class="q-btn q-btn--primary pf-ai__send">发送</button>' +
      "</form>" +
      '<p class="pf-ai__foot">原型模拟回复 · 非正式商机诊断</p>' +
      "</div>";

    document.body.appendChild(wrap);

    var fab = document.getElementById("pfAiFab");
    var panel = document.getElementById("pfAiPanel");
    var msgs = document.getElementById("pfAiMsgs");
    var form = document.getElementById("pfAiForm");
    var input = document.getElementById("pfAiInput");
    function open() {
      panel.hidden = false;
      fab.setAttribute("aria-expanded", "true");
      fab.classList.add("is-open");
      if (!msgs.childElementCount) {
        push(
          "ai",
          "你好，我是 " +
            s.name6q +
            " 的分析助手。可基于档案事实用自然语言提问，例如画像概括、购课复购、关系、跟进建议等。"
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
