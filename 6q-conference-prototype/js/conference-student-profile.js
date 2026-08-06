/**
 * 学员画像档案页渲染 + Chart.js
 */
(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var id = params.get("id") || "m10009";
  var pack = window.ConferenceProfileData.getProfile(id);
  var s = pack.student;
  var d = pack.detail;
  /* 意向分析跳转可带 name，保证名单姓名与档案一致展示 */
  var nameOverride = params.get("name");
  if (nameOverride) {
    s = Object.assign({}, s, { name6q: nameOverride, realName: nameOverride });
  }
  var root = document.getElementById("profileRoot");
  var charts = [];

  document.getElementById("ctxLine").textContent =
    "会员全局档案 · 当前会务：第12551期 · 签到号 " +
    s.checkinNo +
    " · " +
    s.group;

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function groupTags(tags) {
    var map = {};
    (tags || []).forEach(function (t) {
      if (!map[t.parent]) map[t.parent] = [];
      map[t.parent].push(t.name);
    });
    return Object.keys(map)
      .map(function (parent) {
        return (
          '<div class="pf-tag-group">' +
          '<p class="pf-tag-group__title">' +
          esc(parent) +
          "</p>" +
          '<div class="pf-chip-row">' +
          map[parent]
            .map(function (n) {
              return '<span class="pf-chip pf-chip--tag">' + esc(n) + "</span>";
            })
            .join("") +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderRelationGraph(rg) {
    if (!rg) {
      return (
        '<section class="pf-card"><div class="pf-card__head">关系图谱</div>' +
        '<div class="pf-card__body"><p class="pf-muted">暂无关系数据</p></div></section>'
      );
    }
    var hist = (rg.historyPreview || [])
      .slice(0, 3)
      .map(function (h) {
        return (
          '<li><span class="pf-chip">' +
          esc(h.kind) +
          "</span> " +
          esc(h.related) +
          '<div class="pf-muted">' +
          esc(h.mode) +
          " · " +
          esc(h.channel) +
          " · " +
          esc(h.time) +
          "</div></li>"
        );
      })
      .join("");
    return (
      '<section class="pf-card">' +
      '<div class="pf-card__head">关系图谱<a href="#rg-history">查看历史</a></div>' +
      '<div class="pf-card__body">' +
      '<p class="pf-muted" style="margin:0 0 8px">上区推荐 · 下区归属 · 可拖拽/缩放；悬停查看途径与时间</p>' +
      '<div class="pf-rg-chart" id="relationGraphChart"></div>' +
      '<div class="pf-rg-legend">' +
      '<span><i class="pf-rg-dot pf-rg-dot--self"></i>本人</span>' +
      '<span><i class="pf-rg-dot pf-rg-dot--rec"></i>推荐</span>' +
      '<span><i class="pf-rg-dot pf-rg-dot--bel"></i>归属</span>' +
      '<span><i class="pf-rg-legend__solid"></i>主动</span>' +
      '<span><i class="pf-rg-legend__dash"></i>被动</span>' +
      "</div>" +
      '<div class="pf-rg-history" id="rg-history">' +
      '<div class="pf-rg-history__head">最近变更（旁侧预览）</div>' +
      "<ul>" +
      (hist || "<li class='pf-muted'>暂无</li>") +
      "</ul></div></div></section>"
    );
  }

  /**
   * 环形分区图谱（比纯力导向更干净）：
   * 本人居中；上半弧=推荐；下半弧=归属；可拖拽/缩放
   */
  function buildRelationGraphOption(rg, stu) {
    var selfId = stu.memberId;
    var W = 420;
    var H = 340;
    var cx = W / 2;
    var cy = H / 2 + 6;
    var R = 118;

    var buckets = {
      recUp: [],
      recDown: [],
      belUp: [],
      belDown: [],
    };
    var nodeMeta = {};
    var links = [];

    function touchNode(code, name, bucket, category) {
      if (!nodeMeta[code]) {
        nodeMeta[code] = {
          id: code,
          name: name,
          category: category,
          buckets: {},
        };
      }
      nodeMeta[code].buckets[bucket] = true;
      if (nodeMeta[code].category !== 0) {
        // 同时有推荐+归属时用混合色类目 3
        var hasRec = nodeMeta[code].buckets.recUp || nodeMeta[code].buckets.recDown;
        var hasBel = nodeMeta[code].buckets.belUp || nodeMeta[code].buckets.belDown;
        nodeMeta[code].category = hasRec && hasBel ? 3 : category;
      }
    }

    function addLinks(list, kind, fromSelf, bucket) {
      (list || []).forEach(function (p) {
        var cat = kind === "推荐" ? 1 : 2;
        touchNode(p.code, p.name, bucket, cat);
        if (buckets[bucket].indexOf(p.code) < 0) buckets[bucket].push(p.code);
        var active = p.mode === "active";
        var color = kind === "推荐" ? "#3b82f6" : "#10b981";
        links.push({
          source: fromSelf ? selfId : p.code,
          target: fromSelf ? p.code : selfId,
          value: kind,
          role:
            kind === "推荐"
              ? fromSelf
                ? "推荐下游"
                : "推荐上游"
              : fromSelf
                ? "归属下级"
                : "归属上级",
          mode: active ? "主动" : "被动",
          channel: p.channel || "—",
          time: p.time || "",
          label: {
            show: true,
            formatter: active ? "主动" : "被动",
            fontSize: 10,
            color: color,
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: [1, 5],
            borderRadius: 8,
            borderColor: color,
            borderWidth: 1,
          },
          lineStyle: {
            color: color,
            width: active ? 2 : 1.5,
            type: active ? "solid" : "dashed",
            curveness: kind === "推荐" ? 0.18 : -0.18,
            opacity: 0.75,
          },
        });
      });
    }

    addLinks(rg.recommend && rg.recommend.upstream, "推荐", false, "recUp");
    addLinks(rg.recommend && rg.recommend.downstream, "推荐", true, "recDown");
    addLinks(rg.belong && rg.belong.upstream, "归属", false, "belUp");
    addLinks(rg.belong && rg.belong.downstream, "归属", true, "belDown");

    function placeBucket(codes, a0, a1) {
      var n = codes.length;
      codes.forEach(function (code, i) {
        var t = n === 1 ? 0.5 : i / (n - 1);
        var deg = a0 + (a1 - a0) * t;
        var rad = (deg * Math.PI) / 180;
        nodeMeta[code].x = cx + R * Math.cos(rad);
        nodeMeta[code].y = cy + R * Math.sin(rad);
      });
    }

    // 屏幕坐标：0°右、90°下；上半推荐、下半归属；左上游/右下游
    placeBucket(buckets.recUp, -155, -115);
    placeBucket(buckets.recDown, -65, -25);
    placeBucket(buckets.belUp, 115, 155);
    placeBucket(buckets.belDown, 25, 65);

    // 同人多桶：放左侧中线
    Object.keys(nodeMeta).forEach(function (code) {
      var m = nodeMeta[code];
      var b = m.buckets;
      var sides = [b.recUp, b.recDown, b.belUp, b.belDown].filter(Boolean).length;
      if (sides > 1) {
        m.x = cx - R;
        m.y = cy;
      }
    });

    var colors = {
      0: "#f59e0b",
      1: "#3b82f6",
      2: "#10b981",
      3: "#8b5cf6",
    };

    var data = [
      {
        id: selfId,
        name: stu.name6q,
        category: 0,
        x: cx,
        y: cy,
        symbolSize: 58,
        draggable: true,
        label: {
          show: true,
          formatter: "{b}\n本人",
          fontSize: 12,
          fontWeight: 600,
          color: "#92400e",
          lineHeight: 16,
        },
        itemStyle: {
          color: {
            type: "radial",
            x: 0.35,
            y: 0.3,
            r: 0.85,
            colorStops: [
              { offset: 0, color: "#fde68a" },
              { offset: 1, color: "#f59e0b" },
            ],
          },
          borderColor: "#fff",
          borderWidth: 3,
          shadowBlur: 16,
          shadowColor: "rgba(245,158,11,0.35)",
        },
      },
    ];

    Object.keys(nodeMeta).forEach(function (code) {
      var m = nodeMeta[code];
      data.push({
        id: m.id,
        name: m.name,
        category: m.category,
        x: m.x,
        y: m.y,
        symbolSize: 40,
        draggable: true,
        label: {
          show: true,
          position: "bottom",
          distance: 6,
          formatter: "{b}",
          fontSize: 11,
          color: "#334155",
          backgroundColor: "rgba(255,255,255,0.88)",
          padding: [2, 6],
          borderRadius: 4,
        },
        itemStyle: {
          color: colors[m.category],
          borderColor: "#fff",
          borderWidth: 2,
          shadowBlur: 8,
          shadowColor: "rgba(15,23,42,0.12)",
        },
      });
    });

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#334155", fontSize: 12 },
        formatter: function (p) {
          if (p.dataType === "edge" || (p.data && p.data.source != null)) {
            var e = p.data;
            return (
              "<div style='min-width:140px'><b style='color:" +
              (e.value === "推荐" ? "#2563eb" : "#059669") +
              "'>" +
              e.value +
              " · " +
              e.mode +
              "</b><br/>" +
              e.role +
              "<br/>途径 " +
              e.channel +
              "<br/>" +
              e.time +
              "</div>"
            );
          }
          var d0 = p.data || {};
          return (
            "<b>" +
            d0.name +
            "</b><br/>编号 " +
            d0.id +
            "<br/><span style='color:#94a3b8'>拖拽调整位置</span>"
          );
        },
      },
      animationDurationUpdate: 400,
      graphic: [
        {
          type: "text",
          left: "center",
          top: 10,
          style: {
            text: "推荐关系",
            fill: "#3b82f6",
            fontSize: 12,
            fontWeight: 600,
            opacity: 0.9,
          },
        },
        {
          type: "text",
          left: "center",
          bottom: 12,
          style: {
            text: "归属关系",
            fill: "#10b981",
            fontSize: 12,
            fontWeight: 600,
            opacity: 0.9,
          },
        },
      ],
      series: [
        {
          type: "graph",
          layout: "none",
          coordinateSystem: null,
          roam: true,
          scaleLimit: { min: 0.6, max: 1.8 },
          categories: [
            { name: "本人" },
            { name: "推荐" },
            { name: "归属" },
            { name: "推荐+归属" },
          ],
          data: data,
          links: links,
          edgeSymbol: ["none", "arrow"],
          edgeSymbolSize: [0, 9],
          lineStyle: { opacity: 0.8 },
          emphasis: {
            focus: "adjacency",
            scale: true,
            lineStyle: { width: 2.8, opacity: 1 },
            label: { fontWeight: 600 },
          },
          blur: {
            itemStyle: { opacity: 0.2 },
            lineStyle: { opacity: 0.08 },
          },
        },
      ],
    };
  }

  function initRelationChart(rg, stu) {
    var el = document.getElementById("relationGraphChart");
    if (!el || !window.echarts || !rg) return;
    var chart = echarts.init(el);
    chart.setOption(buildRelationGraphOption(rg, stu));
    var onResize = function () {
      chart.resize();
    };
    window.addEventListener("resize", onResize);
  }

  function kv(k, v) {
    return (
      "<li><span class='pf-kv__k'>" +
      esc(k) +
      "</span><span class='pf-kv__v'>" +
      (v == null || v === "" ? "—" : v) +
      "</span></li>"
    );
  }

  function statusChip(text, tone) {
    if (!text || text === "—") return "—";
    var cls =
      tone === "ok"
        ? "pf-chip pf-chip--ok"
        : tone === "orange"
          ? "pf-chip pf-chip--orange"
          : "pf-chip pf-chip--blue";
    return '<span class="' + cls + '">' + esc(text) + "</span>";
  }

  /** 基础信息：对齐会员详情，突出画像判断字段 */
  function renderBasicCard(stu, basic) {
    var b = basic || {};
    var idChips = (b.identities || [])
      .map(function (x) {
        return statusChip(x, "orange");
      })
      .join(" ");
    return (
      '<section class="pf-card"><div class="pf-card__head">基础信息<span class="pf-muted" style="font-weight:400;font-size:12px">会员详情口径</span></div>' +
      '<div class="pf-card__body">' +
      '<div class="pf-basic-block">' +
      '<p class="pf-basic-block__title">身份与状态</p>' +
      '<ul class="pf-kv pf-kv--grid">' +
      kv("会员ID", esc(stu.memberId)) +
      kv("6Q姓名", esc(stu.name6q)) +
      kv("手机号码", esc(stu.phone)) +
      kv("注册邮箱", esc(b.email || "—")) +
      kv("国家/地区", esc(b.region || "—")) +
      kv("常住城市", esc(b.cityDetail || stu.city || "—")) +
      kv("运营服务处", esc(b.opsUnit || "—")) +
      kv(
        "实名状态",
        statusChip(b.realnameStatus || "—", b.realnameStatus === "已认证" ? "ok" : "")
      ) +
      kv(
        "会员状态",
        statusChip(b.memberStatusDetail || stu.memberStatus, "ok")
      ) +
      kv("身份", idChips || "—") +
      kv("角色", esc(b.role || "—")) +
      "</ul></div>" +
      '<div class="pf-basic-block">' +
      '<p class="pf-basic-block__title">关系人信息<span class="pf-muted">当前生效 · 详见关系图谱</span></p>' +
      '<ul class="pf-kv pf-kv--grid">' +
      kv("归属状态", statusChip(b.belongStatus || "—", b.belongStatus === "已绑定" ? "ok" : "")) +
      kv(
        "归属天使",
        esc(b.belongAngel || "—") +
          (b.belongAngelId ? " · " + esc(b.belongAngelId) : "")
      ) +
      kv("天使手机", esc(b.belongAngelPhone || "—")) +
      kv("归属开始时间", esc(b.belongStartAt || "—")) +
      kv("归属运营服务处", esc(b.belongOpsUnit || "—")) +
      kv("推荐来源", esc(b.referralSource || "—")) +
      kv(
        "推荐人",
        esc(b.recommender || "—") +
          (b.recommenderId ? " · " + esc(b.recommenderId) : "")
      ) +
      kv("推荐人手机", esc(b.recommenderPhone || "—")) +
      kv("推荐开始时间", esc(b.recommendStartAt || "—")) +
      "</ul></div>" +
      '<div class="pf-basic-block">' +
      '<p class="pf-basic-block__title">认证与人口属性</p>' +
      '<ul class="pf-kv pf-kv--grid">' +
      kv("真实姓名", esc(stu.realName)) +
      kv("性别", esc(stu.gender)) +
      kv("年龄", esc(stu.age) + " 岁") +
      kv("出生日期", esc(b.birthday || "—")) +
      "</ul></div>" +
      '<div class="pf-basic-block pf-basic-block--last">' +
      '<p class="pf-basic-block__title">社会属性与联系</p>' +
      '<ul class="pf-kv pf-kv--grid">' +
      kv("职业", esc(b.occupation || "—")) +
      kv("行业", esc(b.industry || "—")) +
      kv("最高学历", esc(b.education || "—")) +
      kv("微信", esc(b.wechat || "—")) +
      kv(
        "紧急联系人",
        esc(b.emergencyName || "—") +
          (b.emergencyPhone ? " · " + esc(b.emergencyPhone) : "")
      ) +
      kv("注册时间", esc(b.registeredAt || b.createdAt || "—")) +
      kv("备注", esc(b.remark || "—")) +
      "</ul></div></div></section>"
    );
  }

  /** 家庭组：字段对齐会员详情·家庭组列表；档案内嵌紧凑表 + 高亮本人 */
  function renderFamilyCard(fg) {
    if (!fg || !fg.members || !fg.members.length) {
      return (
        '<section class="pf-card"><div class="pf-card__head">家庭组</div>' +
        '<div class="pf-card__body"><p class="pf-muted">暂无家庭组信息</p></div></section>'
      );
    }
    var roles = fg.members
      .map(function (m) {
        return (
          '<span class="pf-chip' +
          (m.isSelf ? " pf-chip--blue" : "") +
          '">' +
          esc(m.role) +
          (m.isSelf ? "·本人" : "") +
          "</span>"
        );
      })
      .join("");
    var rows = fg.members
      .map(function (m, i) {
        return (
          '<tr class="' +
          (m.isSelf ? "pf-family-row--self" : "") +
          '">' +
          "<td>" +
          (i + 1) +
          "</td>" +
          "<td>" +
          esc(m.code) +
          "</td>" +
          "<td>" +
          esc(m.name) +
          (m.isSelf
            ? ' <span class="pf-chip pf-chip--blue" style="margin-left:4px">本人</span>'
            : "") +
          "</td>" +
          "<td>" +
          esc(m.gender) +
          "</td>" +
          "<td>" +
          esc(m.role) +
          "</td>" +
          "<td>" +
          esc(m.phone || "—") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    return (
      '<section class="pf-card">' +
      '<div class="pf-card__head">家庭组<a href="#" title="原型占位">会员详情查看</a></div>' +
      '<div class="pf-card__body">' +
      '<div class="pf-family-head">' +
      '<div><span class="pf-muted">家庭ID</span> ' +
      '<a class="pf-family-id" href="#">' +
      esc(fg.familyId) +
      "</a>" +
      ' <span class="pf-muted">· ' +
      fg.members.length +
      " 人</span></div>" +
      '<div class="pf-chip-row" style="margin:0">' +
      roles +
      "</div></div>" +
      '<table class="pf-table pf-family-table"><thead><tr>' +
      "<th>序号</th><th>编号</th><th>姓名</th><th>性别</th><th>身份</th><th>手机号码</th>" +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table></div></section>"
    );
  }

  function maxTopicViews() {
    var m = 1;
    (d.communityTopics || []).forEach(function (t) {
      if (t.views > m) m = t.views;
    });
    return m;
  }

  var topicMax = maxTopicViews();

  root.innerHTML =
    // LEFT
    '<div class="pf-col pf-col--left">' +
    '<section class="pf-card"><div class="pf-card__body">' +
    '<div class="pf-profile-hero">' +
    '<div class="pf-avatar">' +
    esc(s.name6q.charAt(0)) +
    "</div>" +
    "<div>" +
    '<h2 class="pf-profile-hero__name">' +
    esc(s.name6q) +
    "</h2>" +
    '<div class="pf-chip-row">' +
    '<span class="pf-chip pf-chip--ok">' +
    esc(d.basic.memberStatusDetail || s.memberStatus) +
    "</span>" +
    (d.basic.realnameStatus
      ? '<span class="pf-chip pf-chip--ok">' + esc(d.basic.realnameStatus) + "</span>"
      : "") +
    (s.trainTag
      ? '<span class="pf-chip pf-chip--orange">' + esc(s.trainTag) + "</span>"
      : "") +
    (d.basic.identities || [])
      .map(function (x) {
        return '<span class="pf-chip pf-chip--orange">' + esc(x) + "</span>";
      })
      .join("") +
    "</div>" +
    '<p class="pf-profile-hero__meta">手机 ' +
    esc(s.phone) +
    "<br/>" +
    esc(d.basic.cityDetail || s.city) +
    " · " +
    esc(d.basic.opsUnit || "—") +
    "</p>" +
    "</div></div>" +
    '<ul class="pf-kv" style="margin-top:12px">' +
    "<li><span class='pf-kv__k'>会员ID</span><span class='pf-kv__v'>" +
    esc(s.memberId) +
    "</span></li>" +
    "<li><span class='pf-kv__k'>所属顾问</span><span class='pf-kv__v'>" +
    esc(d.basic.consultant) +
    "</span></li>" +
    "<li><span class='pf-kv__k'>归属天使</span><span class='pf-kv__v'>" +
    esc(d.basic.belongAngel || "—") +
    "</span></li>" +
    "<li><span class='pf-kv__k'>推荐人</span><span class='pf-kv__v'>" +
    esc(d.basic.recommender || "—") +
    "</span></li>" +
    "<li><span class='pf-kv__k'>注册时间</span><span class='pf-kv__v'>" +
    esc(d.basic.registeredAt || d.basic.createdAt) +
    "</span></li>" +
    "</ul></div></section>" +
    '<section class="pf-card"><div class="pf-card__head">本期会务上下文</div><div class="pf-card__body">' +
    '<ul class="pf-kv">' +
    "<li><span class='pf-kv__k'>签到号</span><span class='pf-kv__v'>" +
    esc(s.checkinNo) +
    "</span></li>" +
    "<li><span class='pf-kv__k'>小组</span><span class='pf-kv__v'>" +
    esc(s.group) +
    "</span></li>" +
    "<li><span class='pf-kv__k'>通关</span><span class='pf-kv__v'>" +
    esc(s.clearance) +
    "</span></li>" +
    "<li><span class='pf-kv__k'>签到</span><span class='pf-kv__v'>" +
    esc(s.checkinRatio) +
    "</span></li>" +
    "<li><span class='pf-kv__k'>核销</span><span class='pf-kv__v'>" +
    esc(s.writeoff) +
    "</span></li>" +
    "</ul></div></section>" +
    '<section class="pf-card"><div class="pf-card__head">系统标签<span class="pf-muted" style="font-weight:400;font-size:12px">仅命中</span></div><div class="pf-card__body">' +
    groupTags(d.systemTags) +
    "</div></section>" +
    "</div>" +
    // MIDDLE
    '<div class="pf-col pf-col--mid">' +
    renderBasicCard(s, d.basic) +
    renderFamilyCard(d.familyGroup) +
    '<section class="pf-card"><div class="pf-card__head">购课概览（按课程产品计次）</div><div class="pf-card__body">' +
    '<div class="pf-stat-row">' +
    '<div class="pf-stat"><div class="pf-stat__n">' +
    d.purchases.length +
    '</div><div class="pf-stat__l">订单笔数</div></div>' +
    '<div class="pf-stat"><div class="pf-stat__n">' +
    d.purchaseByProduct.length +
    '</div><div class="pf-stat__l">课程产品数</div></div>' +
    '<div class="pf-stat"><div class="pf-stat__n">' +
    d.repurchase.length +
    '</div><div class="pf-stat__l">复购产品数</div></div>' +
    "</div>" +
    '<div class="pf-chart-box"><canvas id="chartPurchase"></canvas></div>' +
    "</div></section>" +
    '<section class="pf-card"><div class="pf-card__head">购买课程<a href="#">查看全部</a></div><div class="pf-card__body" style="padding-top:0">' +
    '<table class="pf-table"><thead><tr><th>课程产品</th><th>商品</th><th>购买时间</th><th>状态</th></tr></thead><tbody>' +
    d.purchases
      .map(function (p) {
        return (
          "<tr><td>" +
          esc(p.product) +
          "</td><td>" +
          esc(p.goods) +
          "</td><td>" +
          esc(p.time) +
          "</td><td>" +
          esc(p.status) +
          "</td></tr>"
        );
      })
      .join("") +
    "</tbody></table></div></section>" +
    '<section class="pf-card"><div class="pf-card__head">复购记录<span class="pf-muted" style="font-weight:400;font-size:12px">同产品次数≥2</span></div><div class="pf-card__body" style="padding-top:0">' +
    (d.repurchase.length
      ? '<table class="pf-table"><thead><tr><th>课程产品</th><th>次数</th><th>最近购买</th><th>累计金额</th></tr></thead><tbody>' +
        d.repurchase
          .map(function (r) {
            return (
              "<tr><td>" +
              esc(r.product) +
              "</td><td>" +
              r.count +
              "</td><td>" +
              esc(r.lastTime) +
              "</td><td>¥" +
              r.amount +
              "</td></tr>"
            );
          })
          .join("") +
        "</tbody></table>"
      : '<p class="pf-muted">暂无复购（同课程产品支付订单不足 2 笔）</p>') +
    "</div></section>" +
    "</div>" +
    // RIGHT
    '<div class="pf-col pf-col--right">' +
    renderRelationGraph(d.relationGraph) +
    (window.ProfileBehaviorUI
      ? window.ProfileBehaviorUI.renderFollowCard(d)
      : "") +
    '<section class="pf-card"><div class="pf-card__head">课程退款订单<a href="#">查看全部</a></div><div class="pf-card__body" style="padding-top:0">' +
    '<table class="pf-table"><thead><tr><th>商品</th><th>实退</th><th>状态</th><th>创建</th></tr></thead><tbody>' +
    d.refunds
      .map(function (r) {
        return (
          "<tr><td>" +
          esc(r.goods) +
          '<div class="pf-muted">' +
          esc(r.refundNo) +
          "</div></td><td>¥" +
          r.actual +
          "</td><td>" +
          esc(r.status) +
          "</td><td>" +
          esc(r.createdAt.slice(0, 10)) +
          "</td></tr>"
        );
      })
      .join("") +
    "</tbody></table></div></section>" +
    '<section class="pf-card"><div class="pf-card__head">近 30 天行为趋势</div><div class="pf-card__body"><div class="pf-chart-box"><canvas id="chartBehavior"></canvas></div></div></section>' +
    '<section class="pf-card"><div class="pf-card__head">社区话题活跃<span class="pf-muted" style="font-weight:400;font-size:12px">按话题名称细拆</span></div><div class="pf-card__body">' +
    '<p class="pf-muted" style="margin:0 0 8px">口径对齐话题管理·话题列表：同一分类下按「话题名称」分别统计，不用分类汇总代替。</p>' +
    d.communityTopics
      .map(function (t) {
        var pct = Math.round((t.views / topicMax) * 100);
        return (
          '<div class="pf-topic-bar" title="' +
          esc(t.category) +
          (t.publisher ? " · " + esc(t.publisher) : "") +
          '">' +
          '<span class="pf-topic-bar__name">' +
          esc(t.topic) +
          "</span>" +
          '<div class="pf-topic-bar__track"><div class="pf-topic-bar__fill" style="width:' +
          pct +
          '%"></div></div>' +
          '<span class="pf-topic-bar__n">' +
          t.views +
          "次</span></div>"
        );
      })
      .join("") +
    '<table class="pf-table" style="margin-top:10px"><thead><tr><th>话题名称</th><th>话题分类</th><th>浏览</th><th>点击</th><th>发帖</th></tr></thead><tbody>' +
    d.communityTopics
      .map(function (t) {
        return (
          "<tr><td>" +
          esc(t.topic) +
          "</td><td>" +
          esc(t.category) +
          "</td><td>" +
          t.views +
          "</td><td>" +
          t.clicks +
          "</td><td>" +
          (t.posts != null ? t.posts : "—") +
          "</td></tr>"
        );
      })
      .join("") +
    "</tbody></table></div></section>" +
    (window.ProfileBehaviorUI
      ? window.ProfileBehaviorUI.renderBehaviorCard(d)
      : "") +
    "</div>";

  function makeCharts() {
    if (!window.Chart) return;
    var purchaseLabels = d.purchaseByProduct.map(function (x) {
      return x.product;
    });
    var purchaseData = d.purchaseByProduct.map(function (x) {
      return x.count;
    });
    charts.push(
      new Chart(document.getElementById("chartPurchase"), {
        type: "bar",
        data: {
          labels: purchaseLabels,
          datasets: [
            {
              label: "支付订单次数",
              data: purchaseData,
              backgroundColor: "rgba(24,144,255,0.75)",
              borderRadius: 4,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
              grid: { color: "#f0f0f0" },
            },
            y: { grid: { display: false } },
          },
        },
      })
    );

    charts.push(
      new Chart(document.getElementById("chartBehavior"), {
        type: "line",
        data: {
          labels: d.behaviorTrend.labels,
          datasets: [
            {
              label: "社区",
              data: d.behaviorTrend.community,
              borderColor: "#1890ff",
              backgroundColor: "rgba(24,144,255,0.12)",
              tension: 0.35,
              fill: true,
            },
            {
              label: "直播",
              data: d.behaviorTrend.live,
              borderColor: "#722ed1",
              backgroundColor: "rgba(114,46,209,0.08)",
              tension: 0.35,
              fill: true,
            },
            {
              label: "学习",
              data: d.behaviorTrend.learn,
              borderColor: "#52c41a",
              backgroundColor: "rgba(82,196,26,0.08)",
              tension: 0.35,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } },
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#f5f5f5" } },
            x: { grid: { display: false } },
          },
        },
      })
    );
  }

  makeCharts();
  initRelationChart(d.relationGraph, s);
  if (window.ProfileBehaviorUI) {
    window.ProfileBehaviorUI.init(d, s);
  }
})();
