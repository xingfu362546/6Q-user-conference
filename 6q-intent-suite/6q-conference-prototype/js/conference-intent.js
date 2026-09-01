/**
 * 学员意向分析 · 交互与 mock 数据
 */
(function (global) {
  "use strict";

  var AI_SCORE_MAX = 25;
  var TIP_LIST_MAX = 28;
  var TAG_TREE = window.INTENT_TAG_TREE || [];
  var TAG_FLAT = window.INTENT_TAG_FLAT || [];

  /** 短视频池（对齐图3），观看时间按学员模拟 */
  var VIDEO_POOL = [
    {
      title: "【教育方法】《全脑教养法》",
      id: "DSP2505231442293127",
      tags: "亲子教育、本周精选",
    },
    {
      title: "【内驱力】厌学的发展过程，如何识别早期信号",
      id: "DSP2409121120304699",
      tags: "亲子教育、厌学、情绪",
    },
    {
      title: "【学习】如何协助孩子提升学习专注力",
      id: "DSP2506161411459966",
      tags: "本周精选、学习分享",
    },
    {
      title: "【道歉】智慧的父母会如何道歉",
      id: "DSP250609150244487",
      tags: "亲子教育、亲子关系",
    },
    {
      title: "【学习成长】和父母关系好是孩子最大的底气",
      id: "DSP2409111959219947",
      tags: "学习成长、自我成长",
    },
  ];

  function withWatchTimes(times) {
    return VIDEO_POOL.map(function (v, i) {
      return {
        title: v.title,
        id: v.id,
        tags: v.tags,
        watchedAt: times[i] || times[times.length - 1] || "—",
      };
    });
  }

  var STUDENTS = [
    {
      id: "m10001",
      name: "陈晓明",
      phone: "138****2201",
      hits: ["tag_1233", "tag_3301", "tag_4402", "tag_5503"],
      courseLevel: "一阶",
      intendedDirection: "天使",
      interviewSlot: "课程结束后",
      follow: {
        tag: "有意向用户",
        content: "学员今天找我了解了《如何说孩子》进阶班，希望开课前电话沟通，预算在 8k 左右。",
        time: "2025-04-02",
      },
      ai: {
        score: 22,
        summary: "意向明确，匹配本期亲子课程",
        conclusion: "亲子进阶意向明确，当前一阶，可推进二阶并介绍传播天使礼包。",
        evidence: [
          { source: "跟进", text: "主动咨询进阶班并给出约 8k 预算" },
          { source: "学习", text: "已学《高EQ智慧父母》一阶 8 次" },
          { source: "标签", text: "亲子偏好、近期消费高" },
        ],
        full: "结合亲子偏好、近期消费高与跟进内容：学员主动咨询进阶班并给出预算，建议优先安排会销席位。",
      },
      communityRecords: [
        {
          topic: "人人分享6Q征集活动",
          content: "6Q之爱自己是第一步",
          time: "2026-08-04 11:11:55",
        },
        {
          topic: "人人分享6Q征集活动",
          content: "今日小红书打卡",
          time: "2026-07-29 22:11:25",
        },
        {
          topic: "人人分享6Q征集活动",
          content: "你真的会接孩子的话吗",
          time: "2026-07-28 13:41:30",
        },
        {
          topic: "6Q雪山探索",
          content: "雪山1",
          time: "2026-06-29 19:46:02",
        },
      ],
      learnRecords: [
        {
          course: "《高EQ智慧父母》(一阶)",
          count: 8,
          updatedAt: "2026-07-30 21:12:08",
        },
        {
          course: "有效沟通之如何听（主题沙龙）",
          count: 3,
          updatedAt: "2026-07-18 19:40:22",
        },
        {
          course: "6Q创意沙龙",
          count: 2,
          updatedAt: "2026-06-22 15:08:11",
        },
        {
          course: "孩子作业拖拉怎么办（主题沙龙）",
          count: 1,
          updatedAt: "2026-05-09 10:26:44",
        },
      ],
      videoRecords: withWatchTimes([
        "2026-08-03 21:18:06",
        "2026-08-01 12:05:33",
        "2026-07-28 20:44:10",
        "2026-07-20 09:12:51",
        "2026-07-11 22:30:18",
      ]),
      liveRecords: [
        {
          team: "广州亲子晚间场",
          sessions: 3,
          liveDuration: "02:18:40",
          replayDuration: "00:45:12",
          amount: 8600,
        },
        {
          team: "高EQ答疑直播间",
          sessions: 1,
          liveDuration: "00:52:06",
          replayDuration: "00:00:00",
          amount: 0,
        },
      ],
    },
    {
      id: "m10002",
      name: "李美琳",
      phone: "139****8832",
      hits: ["tag_1233", "tag_3301"],
      courseLevel: "沙龙",
      intendedDirection: "",
      interviewSlot: "课程结束后",
      follow: {
        tag: "待回访",
        content: "电话沟通提到价格敏感，希望了解分期与优惠政策，暂未承诺到课。",
        time: "2025-04-01",
      },
      ai: {
        score: 14,
        summary: "有需求但价格敏感",
        conclusion: "有亲子需求但价格敏感，当前沙龙，下一步邀约分享会。",
        evidence: [
          { source: "跟进", text: "强调分期与优惠，暂未承诺到课" },
          { source: "学习", text: "已学《如何说孩子才会听》基础班 2 次" },
        ],
        full: "标签显示亲子与消费潜力；跟进强调分期诉求，建议推送优惠方案后再判高意向。",
      },
      communityRecords: [
        {
          topic: "人人分享6Q征集活动",
          content: "多指责孩子也是在指责小时候的自己",
          time: "2026-07-28 13:40:36",
        },
      ],
      learnRecords: [
        {
          course: "《如何说孩子才会听》基础班",
          count: 2,
          updatedAt: "2026-07-12 18:20:01",
        },
      ],
      videoRecords: withWatchTimes([
        "2026-07-30 19:08:22",
        "2026-07-25 11:40:05",
        "2026-07-19 16:22:48",
        "—",
        "—",
      ]).filter(function (v) {
        return v.watchedAt !== "—";
      }),
      liveRecords: [
        {
          team: "广州亲子晚间场",
          sessions: 1,
          liveDuration: "00:36:20",
          replayDuration: "01:02:00",
          amount: 0,
        },
      ],
    },
    {
      id: "m10003",
      name: "王建国",
      phone: "136****0091",
      hits: ["tag_4402", "tag_6604"],
      courseLevel: "一阶",
      intendedDirection: "",
      interviewSlot: "",
      follow: { tag: "—", content: "—", time: "—" },
      ai: {
        score: 8,
        summary: "行为标签尚可，缺跟进",
        conclusion: "行为标签尚可但缺跟进，当前一阶，下一步推进二阶前需补跟进。",
        evidence: [
          { source: "标签", text: "命中课程浏览与高价值分层" },
          { source: "学习", text: "已学《高EQ智慧父母》一阶 5 次" },
        ],
        full: "命中课程浏览与高价值分层，暂无会务跟进记录，AI 分偏低；建议补跟进后重新分析。",
      },
      communityRecords: [
        {
          topic: "人人分享6Q征集活动",
          content: "有个小练习请已掌握倾听的家长试试",
          time: "2026-07-23 09:46:32",
        },
        {
          topic: "会务通知",
          content: "咨询本场次停车与签到时间",
          time: "2026-07-15 08:12:09",
        },
      ],
      learnRecords: [
        {
          course: "《高EQ智慧父母》(一阶)",
          count: 5,
          updatedAt: "2026-07-26 14:11:33",
        },
        {
          course: "有效沟通之如何听（主题沙龙）",
          count: 4,
          updatedAt: "2026-07-08 20:05:17",
        },
        {
          course: "6Q创意沙龙",
          count: 1,
          updatedAt: "2026-04-16 09:48:52",
        },
      ],
      videoRecords: withWatchTimes([
        "2026-08-02 07:55:40",
        "2026-07-29 23:10:12",
        "2026-07-21 13:28:46",
        "2026-07-10 18:01:03",
        "2026-06-30 21:44:29",
      ]),
      liveRecords: [
        {
          team: "家庭关系专题直播",
          sessions: 2,
          liveDuration: "01:05:33",
          replayDuration: "00:20:00",
          amount: 0,
        },
      ],
    },
    {
      id: "m10004",
      name: "赵雅琴",
      phone: "137****5560",
      hits: ["tag_5503", "tag_1233"],
      courseLevel: "沙龙",
      intendedDirection: "导师",
      interviewSlot: "课间休息时",
      follow: {
        tag: "有意向用户",
        content: "已添加企微，约定本周试听线上课，对导师风格比较在意。",
        time: "2025-04-03",
      },
      ai: {
        score: 18,
        summary: "跟进积极，待试听转化",
        conclusion: "已建联并约试听，当前沙龙，可邀约分享会并介绍导师礼包。",
        evidence: [
          { source: "跟进", text: "已加企微，约定本周试听，在意导师风格" },
          { source: "学习", text: "主题沙龙学习 3 次" },
        ],
        full: "社区活跃+跟进显示已建联并约试听；标签单一，需试听结果提升意向分。",
      },
      communityRecords: [
        {
          topic: "人人分享6Q征集活动",
          content: "开启小红书公域分享6Q",
          time: "2026-07-22 22:41:43",
        },
        {
          topic: "人人分享6Q征集活动",
          content: "分享试听后的三点收获",
          time: "2026-07-20 16:08:11",
        },
      ],
      learnRecords: [
        {
          course: "孩子作业拖拉怎么办（主题沙龙）",
          count: 3,
          updatedAt: "2026-07-27 11:33:20",
        },
        {
          course: "6Q创意沙龙",
          count: 1,
          updatedAt: "2026-06-01 19:22:07",
        },
      ],
      videoRecords: withWatchTimes([
        "2026-08-03 08:20:15",
        "2026-07-31 22:48:09",
        "—",
        "2026-07-18 14:06:44",
        "—",
      ]).filter(function (v) {
        return v.watchedAt !== "—";
      }),
      liveRecords: [
        {
          team: "高EQ答疑直播间",
          sessions: 2,
          liveDuration: "01:40:00",
          replayDuration: "00:15:30",
          amount: 300,
        },
      ],
    },
    {
      id: "m10005",
      name: "张志远",
      phone: "135****7712",
      hits: ["tag_1233", "tag_3301", "tag_4402", "tag_6604", "tag_7705"],
      courseLevel: "二阶",
      intendedDirection: "导师&天使",
      interviewSlot: "随时都可以",
      follow: {
        tag: "高意向",
        content: "明确要买本期配套课程包，需确认席位与发票抬头，希望当天签约。",
        time: "2025-04-04",
      },
      ai: {
        score: 25,
        summary: "强意向，建议立即锁席",
        conclusion: "购课意向明确，当前二阶，可推进三阶并介绍导师与传播天使礼包。",
        evidence: [
          { source: "跟进", text: "明确要买配套课程包，希望当天确认席位" },
          { source: "学习", text: "一阶 8 次，进阶班 4 次" },
          { source: "标签", text: "多标签命中含高价值分层" },
        ],
        full: "多标签命中+跟进确认购课意向；AI 分顶格，建议会务优先接待并推进签约。",
      },
      communityRecords: [
        {
          topic: "人人分享6Q征集活动",
          content: "咨询套餐优惠与发票抬头怎么开",
          time: "2026-08-02 10:15:28",
        },
        {
          topic: "人人分享6Q征集活动",
          content: "今日小红书打卡",
          time: "2026-07-29 22:11:25",
        },
        {
          topic: "人人分享6Q征集活动",
          content: "你真的会接孩子的话吗",
          time: "2026-07-28 13:41:30",
        },
        {
          topic: "人人分享6Q征集活动",
          content: "多指责孩子也是在指责小时候的自己",
          time: "2026-07-28 13:40:36",
        },
        {
          topic: "6Q雪山探索",
          content: "雪山1",
          time: "2026-06-29 19:46:02",
        },
      ],
      learnRecords: [
        {
          course: "《高EQ智慧父母》(一阶)",
          count: 8,
          updatedAt: "2026-08-01 20:16:40",
        },
        {
          course: "《如何说孩子才会听》进阶班",
          count: 4,
          updatedAt: "2026-07-29 09:50:12",
        },
        {
          course: "有效沟通之如何听（主题沙龙）",
          count: 3,
          updatedAt: "2026-07-14 17:28:55",
        },
        {
          course: "6Q创意沙龙",
          count: 2,
          updatedAt: "2026-06-22 15:08:11",
        },
        {
          course: "孩子作业拖拉怎么办（主题沙龙）",
          count: 1,
          updatedAt: "2026-05-09 10:26:44",
        },
      ],
      videoRecords: withWatchTimes([
        "2026-08-04 07:12:33",
        "2026-08-03 23:05:18",
        "2026-08-02 19:40:07",
        "2026-07-31 12:18:44",
        "2026-07-28 08:55:02",
      ]),
      liveRecords: [
        {
          team: "广州亲子晚间场",
          sessions: 4,
          liveDuration: "03:42:15",
          replayDuration: "01:10:00",
          amount: 13600,
        },
        {
          team: "高EQ答疑直播间",
          sessions: 2,
          liveDuration: "01:28:50",
          replayDuration: "00:33:20",
          amount: 0,
        },
      ],
    },
    {
      id: "m10006",
      name: "刘慧敏",
      phone: "158****3344",
      hits: ["tag_2201", "tag_1233"],
      courseLevel: "无",
      intendedDirection: "",
      interviewSlot: "",
      follow: { tag: "—", content: "—", time: "—" },
      ai: {
        score: 3,
        summary: "新学员，数据不足",
        conclusion: "新学员数据不足，当前无课阶，下一步邀约分享会。",
        evidence: [{ source: "标签", text: "仅基础渠道标签，暂无跟进与学习沉淀" }],
        full: "仅基础渠道标签，无跟进与行为沉淀，暂维持低分观察。",
      },
      communityRecords: [],
      learnRecords: [],
      videoRecords: [],
      liveRecords: [],
    },
  ];

  /** 历史跟进：对齐会员详情·跟进记录（跨会务） */
  var HISTORY_FOLLOWS = {
    m10001: [
      {
        type: "会务跟进",
        checkinNo: "12",
        group: "2组",
        identity: "会员",
        angelId: "RCJR2W",
        angelName: "邓琪姗",
        angelPhone: "18022316536",
        tags: ["有意向用户"],
        content: "了解进阶班，预算约 8k，约定开课前电话沟通。",
        follower: "罗欢（总统筹）",
        conference: "第12551期《如何说孩子才会听》（广州站）",
        visible: "是",
        time: "2026-08-03 14:20:00",
      },
      {
        type: "天使跟进",
        checkinNo: "88",
        group: "1组",
        identity: "会员、天使（二级天使）",
        angelId: "RCJR2W",
        angelName: "邓琪姗",
        angelPhone: "18022316536",
        tags: ["已报读二级天使"],
        content: "已报读二级天使，持续跟进成长路径。",
        follower: "邓琪姗",
        conference: "第1469期《高EQ智慧父母》一阶（广州站）",
        visible: "是",
        time: "2026-07-26 18:08:40",
      },
      {
        type: "会务跟进",
        checkinNo: "88",
        group: "1组",
        identity: "会员",
        angelId: "RCJR2W",
        angelName: "邓琪姗",
        angelPhone: "18022316536",
        tags: ["待回访"],
        content: "现场确认复训资格与签到信息。",
        follower: "刘壮（面谈岗）",
        conference: "第1469期《高EQ智慧父母》一阶（广州站）",
        visible: "是",
        time: "2026-07-10 10:12:00",
      },
    ],
    m10002: [
      {
        type: "会务跟进",
        checkinNo: "21",
        group: "3组",
        identity: "会员",
        angelId: "VFWV2R",
        angelName: "洪振午",
        angelPhone: "13725117757",
        tags: ["待回访"],
        content: "价格敏感，希望了解分期与优惠政策，暂未承诺到课。",
        follower: "刘佳（查询官）",
        conference: "第12551期《如何说孩子才会听》（广州站）",
        visible: "是",
        time: "2026-08-01 16:40:12",
      },
      {
        type: "天使跟进",
        checkinNo: "45",
        group: "2组",
        identity: "会员",
        angelId: "VFWV2R",
        angelName: "洪振午",
        angelPhone: "13725117757",
        tags: ["有意向用户"],
        content: "个人对亲子沟通课感兴趣，需再确认时间。",
        follower: "洪振午",
        conference: "第1402期《如何说孩子才会听》（深圳站）",
        visible: "是",
        time: "2026-06-18 11:22:08",
      },
    ],
    m10003: [
      {
        type: "会务跟进",
        checkinNo: "501",
        group: "1组",
        identity: "会员、天使（三级天使）",
        angelId: "RCJR2W",
        angelName: "邓琪姗",
        angelPhone: "18022316536",
        tags: ["已报读三级天使"],
        content: "已报读三级天使",
        follower: "刘壮（面谈岗）",
        conference: "第1469期《高EQ智慧父母》一阶（广州站）",
        visible: "是",
        time: "2026-07-26 18:08:40",
      },
    ],
    m10004: [
      {
        type: "会务跟进",
        checkinNo: "36",
        group: "4组",
        identity: "会员",
        angelId: "RCJR2W",
        angelName: "邓琪姗",
        angelPhone: "18022316536",
        tags: ["有意向用户"],
        content: "已添加企微，约定本周试听线上课，对导师风格比较在意。",
        follower: "邓灿媚",
        conference: "第12551期《如何说孩子才会听》（广州站）",
        visible: "是",
        time: "2026-08-03 19:05:00",
      },
      {
        type: "天使跟进",
        checkinNo: "36",
        group: "4组",
        identity: "会员",
        angelId: "RCJR2W",
        angelName: "邓琪姗",
        angelPhone: "18022316536",
        tags: ["二级天使"],
        content: "试听后反馈良好，继续跟进转化。",
        follower: "邓琪姗",
        conference: "第1469期《高EQ智慧父母》一阶（广州站）",
        visible: "是",
        time: "2026-07-20 15:30:22",
      },
    ],
    m10005: [
      {
        type: "会务跟进",
        checkinNo: "3",
        group: "1组",
        identity: "会员、天使（三级天使）",
        angelId: "RCJR2W",
        angelName: "邓琪姗",
        angelPhone: "18022316536",
        tags: ["高意向", "已报读三级天使"],
        content: "明确要买本期配套课程包，需确认席位与发票抬头，希望当天签约。",
        follower: "罗欢（总统筹）",
        conference: "第12551期《如何说孩子才会听》（广州站）",
        visible: "是",
        time: "2026-08-04 09:18:30",
      },
      {
        type: "会务跟进",
        checkinNo: "501",
        group: "1组",
        identity: "会员、天使（三级天使）",
        angelId: "RCJR2W",
        angelName: "邓琪姗",
        angelPhone: "18022316536",
        tags: ["已报读三级天使"],
        content: "已报读三级天使",
        follower: "刘壮（面谈岗）",
        conference: "第1469期《高EQ智慧父母》一阶（广州站）",
        visible: "是",
        time: "2026-07-26 18:08:40",
      },
      {
        type: "天使跟进",
        checkinNo: "501",
        group: "1组",
        identity: "会员、天使（三级天使）",
        angelId: "RCJR2W",
        angelName: "邓琪姗",
        angelPhone: "18022316536",
        tags: ["有意向用户"],
        content: "个人对三级天使感兴趣，我校老师先生，也是老师。",
        follower: "邓琪姗",
        conference: "第1469期《高EQ智慧父母》一阶（广州站）",
        visible: "是",
        time: "2026-07-26 18:06:12",
      },
    ],
    m10006: [],
  };

  STUDENTS.forEach(function (s) {
    s.historyFollows = HISTORY_FOLLOWS[s.id] || [];
  });

  function summarizeCommunity(s) {
    var list = s.communityRecords || [];
    if (!list.length) return "—";
    return list.length + " 条想法 · " + list[0].topic;
  }

  function summarizeLearn(s) {
    var list = s.learnRecords || [];
    if (!list.length) return "新学员";
    return list.length + " 门 · " + list[0].course;
  }

  function summarizeVideo(s) {
    var list = s.videoRecords || [];
    if (!list.length) return "—";
    return list.length + " 条 · " + truncate(list[0].title, 14);
  }

  function summarizeLive(s) {
    var list = s.liveRecords || [];
    if (!list.length) return "—";
    var sessions = list.reduce(function (n, r) {
      return n + (r.sessions || 0);
    }, 0);
    return sessions + " 场 · " + list[0].team;
  }

  function renderBehaviorTable(headers, rowsHtml, emptyText) {
    if (!rowsHtml) {
      return '<p class="intent-empty">' + escapeHtml(emptyText || "暂无记录") + "</p>";
    }
    return (
      '<div class="intent-behavior-note">按会员维度取数 · 原型展示最近记录</div>' +
      '<div class="intent-behavior-table-wrap"><table class="intent-behavior-table"><thead><tr>' +
      headers
        .map(function (h) {
          return "<th>" + escapeHtml(h) + "</th>";
        })
        .join("") +
      "</tr></thead><tbody>" +
      rowsHtml +
      "</tbody></table></div>"
    );
  }

  function renderCommunityPanel(s) {
    var rows = (s.communityRecords || [])
      .map(function (r, i) {
        return (
          "<tr><td>" +
          (i + 1) +
          "</td><td>" +
          escapeHtml(r.topic) +
          "</td><td>" +
          escapeHtml(r.content) +
          "</td><td>" +
          escapeHtml(r.time) +
          "</td></tr>"
        );
      })
      .join("");
    return renderBehaviorTable(
      ["序号", "关联话题", "内容", "创建时间"],
      rows,
      "暂无社区发想法记录"
    );
  }

  function renderLearnPanel(s) {
    var rows = (s.learnRecords || [])
      .map(function (r) {
        return (
          "<tr><td>" +
          escapeHtml(r.course) +
          "</td><td>" +
          r.count +
          "</td><td>" +
          escapeHtml(r.updatedAt) +
          "</td></tr>"
        );
      })
      .join("");
    return renderBehaviorTable(
      ["课程", "学习次数", "更新时间"],
      rows,
      "暂无学习档案记录"
    );
  }

  function renderVideoPanel(s) {
    var rows = (s.videoRecords || [])
      .map(function (r) {
        return (
          "<tr><td>" +
          escapeHtml(r.title) +
          '</td><td class="intent-mono">' +
          escapeHtml(r.id) +
          "</td><td>" +
          escapeHtml(r.tags) +
          "</td><td>" +
          escapeHtml(r.watchedAt) +
          "</td></tr>"
        );
      })
      .join("");
    return renderBehaviorTable(
      ["视频标题", "ID", "标签", "观看时间"],
      rows,
      "暂无短视频观看记录"
    );
  }

  function renderLivePanel(s) {
    var rows = (s.liveRecords || [])
      .map(function (r) {
        return (
          "<tr><td>" +
          escapeHtml(r.team) +
          "</td><td>" +
          r.sessions +
          "</td><td>" +
          escapeHtml(r.liveDuration) +
          "</td><td>" +
          escapeHtml(r.replayDuration) +
          "</td><td>¥ " +
          Number(r.amount || 0).toLocaleString("zh-CN") +
          "</td></tr>"
        );
      })
      .join("");
    return renderBehaviorTable(
      ["直播团队", "观看场次", "直播观看累计时长", "录播观看时长", "直播间成交金额"],
      rows,
      "暂无直播间记录"
    );
  }

  function renderHistoryFollowPanel(s) {
    var rows = (s.historyFollows || [])
      .map(function (r, i) {
        var tags = (r.tags || [])
          .map(function (t) {
            return '<span class="pf-chip pf-chip--blue">' + escapeHtml(t) + "</span>";
          })
          .join(" ");
        return (
          "<tr><td>" +
          (i + 1) +
          '</td><td><a href="#">' +
          escapeHtml(r.type) +
          "</a></td><td>" +
          escapeHtml(r.checkinNo || "—") +
          "</td><td>" +
          escapeHtml(r.group || "—") +
          "</td><td>" +
          escapeHtml(r.identity || "—") +
          "</td><td>" +
          escapeHtml(r.angelName || "—") +
          '<div class="intent-cell-sub">' +
          escapeHtml(r.angelId || "") +
          " · " +
          escapeHtml(r.angelPhone || "") +
          "</div></td><td>" +
          (tags || "—") +
          "</td><td>" +
          escapeHtml(r.content) +
          "</td><td>" +
          escapeHtml(r.follower) +
          "</td><td>" +
          escapeHtml(r.conference) +
          "</td><td>" +
          escapeHtml(r.visible || "是") +
          "</td><td>" +
          escapeHtml(r.time) +
          "</td></tr>"
        );
      })
      .join("");
    return renderBehaviorTable(
      [
        "序号",
        "跟进类型",
        "签到号",
        "小组",
        "6Q身份",
        "上级天使",
        "跟进标签",
        "跟进内容",
        "跟进人",
        "关联会务",
        "是否显示",
        "创建时间",
      ],
      rows,
      "暂无历史跟进记录"
    );
  }

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

  if (global.IntentStrategyCore && global.IntentStrategyCore.normalizeConfig) {
    Object.assign(state, global.IntentStrategyCore.normalizeConfig(state));
  }

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
    if (global.INTENT_PORTAL_CONFIG && global.INTENT_PORTAL_CONFIG.hideStrategyLinks) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
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

  function watchWeightOf(code) {
    if (state.watchWeights && state.watchWeights[code] != null) {
      return Number(state.watchWeights[code]) || 0;
    }
    var t = tagByCode(code);
    return t && t.weight != null ? t.weight : 0;
  }

  /** 意向分标签部分：仅 Σ「关注标签 ∩ 命中」的策略权重 */
  function tagScore(hits) {
    var watchSet = {};
    (state.watchTags || []).forEach(function (c) {
      watchSet[c] = true;
    });
    var sum = 0;
    (hits || []).forEach(function (code) {
      if (watchSet[code]) sum += watchWeightOf(code);
    });
    return sum;
  }

  function aiScoreOf(s) {
    return s.ai && s.ai.score != null
      ? Math.min(AI_SCORE_MAX, Math.max(0, s.ai.score))
      : 0;
  }

  function totalScore(s) {
    return tagScore(s.hits) + aiScoreOf(s);
  }

  function studentUpdatedAt(s) {
    if (s.updatedAt) return s.updatedAt;
    if (s.follow && s.follow.time && s.follow.time !== "—") return s.follow.time;
    return "";
  }

  function hitsKey(hits) {
    return (hits || []).slice().sort().join("|");
  }

  /** 意向分降序 → AI 降序 → 更新时间倒序 */
  function compareStudents(a, b) {
    var sa = totalScore(a);
    var sb = totalScore(b);
    if (sb !== sa) return sb - sa;
    var aa = aiScoreOf(a);
    var ab = aiScoreOf(b);
    if (ab !== aa) return ab - aa;
    return String(studentUpdatedAt(b)).localeCompare(String(studentUpdatedAt(a)));
  }

  function comboRoleForTag(code) {
    var roles = [];
    if ((state.high.tags || []).indexOf(code) !== -1) roles.push("高意向组合");
    if ((state.mid.tags || []).indexOf(code) !== -1) roles.push("中意向组合");
    if ((state.low.tags || []).indexOf(code) !== -1) roles.push("低意向组合");
    return roles;
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
      '<span class="intent-tip intent-tip--cell" tabindex="0" data-tip="' +
      escapeAttr(f) +
      '"><span class="intent-tip__text">' +
      escapeHtml(truncate(short)) +
      '</span><span class="intent-tip__popup" role="tooltip">' +
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
    if (target === "watch") {
      state.watchTags = codes;
      state.watchWeights = state.watchWeights || {};
      codes.forEach(function (code) {
        if (state.watchWeights[code] == null) {
          var t = tagByCode(code);
          state.watchWeights[code] = t && t.weight != null ? t.weight : 10;
        }
      });
      Object.keys(state.watchWeights).forEach(function (code) {
        if (codes.indexOf(code) === -1) delete state.watchWeights[code];
      });
    } else if (target === "high") state.high.tags = codes;
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

  function renderWatchWeights() {
    var box = document.getElementById("watch-weights");
    if (!box) return;
    var codes = state.watchTags || [];
    if (!codes.length) {
      box.innerHTML =
        '<p class="intent-field__hint" style="margin:0">请先选择关注标签，再为每条标签填写策略权重（用于意向分 Σ，不在标签平台维护）。</p>';
      return;
    }
    box.innerHTML =
      '<p class="intent-field__hint" style="margin:0 0 8px">策略权重（仅关注标签计分；未关注的命中标签可展示但不加分）</p>' +
      '<div class="intent-watch-weights">' +
      codes
        .map(function (code) {
          var t = tagByCode(code);
          var w = watchWeightOf(code);
          return (
            '<label class="intent-watch-weight">' +
            '<span class="intent-watch-weight__name">' +
            escapeHtml(t ? t.name : code) +
            "</span>" +
            '<input type="number" class="intent-watch-weight__input" min="0" max="200" data-watch-weight="' +
            escapeAttr(code) +
            '" value="' +
            w +
            '" />' +
            "<span>分</span></label>"
          );
        })
        .join("") +
      "</div>";
    box.querySelectorAll("[data-watch-weight]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        state.watchWeights = state.watchWeights || {};
        state.watchWeights[inp.getAttribute("data-watch-weight")] =
          Number(inp.value) || 0;
      });
      inp.addEventListener("input", function () {
        state.watchWeights = state.watchWeights || {};
        state.watchWeights[inp.getAttribute("data-watch-weight")] =
          Number(inp.value) || 0;
      });
    });
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
      var wHint =
        pickTarget === "watch"
          ? " · 权 " + watchWeightOf(code)
          : "";
      chip.title = t.parentName + " / " + t.name + wHint;
      chip.innerHTML =
        '<span class="intent-chip__main"><span class="intent-chip__path">' +
        escapeHtml(t.parentName) +
        '</span><span class="intent-chip__name">' +
        escapeHtml(t.name) +
        (pickTarget === "watch"
          ? '<em class="intent-chip__w">+' + watchWeightOf(code) + "</em>"
          : "") +
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
    renderWatchWeights();
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
    var list = filteredStudents().slice().sort(compareStudents);
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
        var aiSc = aiScoreOf(s);
        var initial = s.name.charAt(0);
        var grad = avatarStyle(s.id);
        var hitTags = s.hits
          .map(function (c) {
            return tagByCode(c);
          })
          .filter(Boolean);
        var TAG_CHIP_MAX = 2;
        var chips = hitTags
          .slice(0, TAG_CHIP_MAX)
          .map(function (t) {
            return (
              '<span class="intent-chip intent-chip--hit intent-chip--compact" title="' +
              escapeAttr(t.parentName + " / " + t.name) +
              '">' +
              escapeHtml(t.name) +
              "</span>"
            );
          })
          .join("");
        if (hitTags.length > TAG_CHIP_MAX) {
          var restNames = hitTags
            .slice(TAG_CHIP_MAX)
            .map(function (t) {
              return t.name;
            })
            .join("、");
          chips +=
            '<span class="intent-chip intent-chip--more" title="' +
            escapeAttr(restNames) +
            '">+' +
            (hitTags.length - TAG_CHIP_MAX) +
            "</span>";
        }
        var followShort =
          s.follow.content === "—" ? "—" : truncate(s.follow.content, 24);
        var aiShort = s.ai && s.ai.summary ? s.ai.summary : "—";
        var scoreTip =
          state.intentMode === "tags"
            ? "参考分：关注权重 " +
              tScore +
              " + AI " +
              aiSc +
              "（档位由命中标签组合判定）"
            : "关注权重 " +
              tScore +
              " + AI " +
              aiSc +
              "（AI 最高 " +
              AI_SCORE_MAX +
              "）";
        return (
          "<tr>" +
          '<td><div class="intent-student">' +
          '<span class="intent-avatar" style="background:' +
          grad +
          '">' +
          initial +
          '</span><div><div class="intent-student__name"><a class="intent-student__link" href="' +
          ((global.INTENT_PORTAL_CONFIG && global.INTENT_PORTAL_CONFIG.profilePage) ||
            "conference-student-profile.html") +
          "?id=" +
          encodeURIComponent(s.id) +
          "&name=" +
          encodeURIComponent(s.name) +
          '">' +
          escapeHtml(s.name) +
          '</a></div><div class="intent-student__meta">' +
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
          "<td class=\"intent-table__col-tags\">" +
          (chips
            ? '<div class="intent-hit-tags">' + chips + "</div>"
            : "—") +
          "</td>" +
          "<td>" +
          tipCell(followShort, s.follow.content) +
          "</td>" +
          "<td>" +
          tipCell(aiShort, s.ai ? s.ai.conclusion || s.ai.full : "") +
          "</td>" +
          "<td>" +
          (window.CourseRecommend
            ? window.CourseRecommend.renderTableCell(s)
            : "—") +
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
            (state.pickerTarget === "watch" && (state.watchTags || []).indexOf(t.code) !== -1
              ? " · 策略权 " + watchWeightOf(t.code)
              : "") +
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

  var COURSE_LEVEL_NEXT = {
    无: "分享会",
    沙龙: "分享会",
    分享会: "一阶",
    一阶: "二阶",
    二阶: "三阶",
  };

  function hasGiftDirection(direction) {
    return window.CourseRecommend && window.CourseRecommend.hasCareerGiftIntent
      ? window.CourseRecommend.hasCareerGiftIntent(direction)
      : /导师/.test(String(direction || "")) || /天使/.test(String(direction || ""));
  }

  function giftDirectionLabel(direction) {
    if (window.CourseRecommend && window.CourseRecommend.directionIntentLabel) {
      return window.CourseRecommend.directionIntentLabel(direction);
    }
    var text = String(direction || "");
    if (/导师/.test(text) && /天使/.test(text)) return "导师与传播天使";
    if (/导师/.test(text)) return "导师";
    if (/天使/.test(text)) return "传播天使";
    return "";
  }

  function buildNextStep(s) {
    var level = s.courseLevel || "无";
    var parts = [];
    if (level === "三阶") {
      parts.push("当前已到终阶，下一步谈复训。");
    } else {
      var next = COURSE_LEVEL_NEXT[level] || "分享会";
      var action = level === "无" || level === "沙龙" ? "邀约参加" : "推进报读";
      parts.push("当前上课层级为「" + level + "」，下一步" + action + "「" + next + "」。");
    }
    if (s.interviewSlot) {
      parts.push("可约谈时间：" + s.interviewSlot + "。");
    }
    if (hasGiftDirection(s.intendedDirection)) {
      parts.push(
        "意向了解方向为「" +
          giftDirectionLabel(s.intendedDirection) +
          "」，可介绍对应礼包权益。",
      );
    }
    return parts.join("");
  }

  function defaultEvidence(s) {
    var items = [];
    if (s.follow && s.follow.content && s.follow.content !== "—") {
      items.push({ source: "跟进", text: s.follow.content });
    }
    if (s.learnRecords && s.learnRecords[0]) {
      items.push({ source: "学习", text: s.learnRecords[0].course });
    }
    return items;
  }

  function renderFollowBlock(s) {
    if (s.follow.time === "—") {
      return (
        '<p class="intent-empty">跟进内容由会务人员在「跟进记录」中填写。</p>' +
        '<a href="conference-detail-basic.html">去跟进记录</a>'
      );
    }
    return (
      '<div class="intent-follow-record">' +
      '<div class="intent-follow-record__head"><span class="intent-summary__tag">' +
      escapeHtml(s.follow.tag) +
      "</span><time>" +
      escapeHtml(s.follow.time) +
      "</time></div>" +
      '<p class="intent-follow-record__body">' +
      escapeHtml(s.follow.content) +
      "</p></div>"
    );
  }

  function renderAiBlock(s) {
    if (!s.ai || s.ai.summary === "—") {
      return (
        '<p class="intent-empty">保存跟进或触发分析后，将基于标签与跟进内容生成提炼（AI 权重最高 ' +
        AI_SCORE_MAX +
        " 分）。</p>"
      );
    }
    var conclusion = s.ai.conclusion || s.ai.summary;
    var evidence =
      s.ai.evidence && s.ai.evidence.length ? s.ai.evidence : defaultEvidence(s);
    var next = s.ai.nextStep || buildNextStep(s);
    var evidenceHtml = evidence
      .map(function (item) {
        return (
          "<li><span class=\"intent-ai-card__source\">" +
          escapeHtml(item.source) +
          "</span>" +
          escapeHtml(item.text) +
          "</li>"
        );
      })
      .join("");
    return (
      '<div class="intent-ai-card">' +
      '<span class="intent-ai-card__badge">AI</span>' +
      '<div class="intent-ai-card__score">权重 <strong>' +
      s.ai.score +
      "</strong>/" +
      AI_SCORE_MAX +
      "</div>" +
      '<p class="intent-ai-card__conclusion">' +
      escapeHtml(conclusion) +
      "</p>" +
      (evidenceHtml
        ? '<ul class="intent-ai-card__evidence">' + evidenceHtml + "</ul>"
        : "") +
      '<p class="intent-ai-card__next"><span class="intent-ai-card__next-label">下一步</span> ' +
      escapeHtml(next) +
      '</p><button type="button" class="q-btn q-btn--sm" id="btn-reanalyze">重新分析</button></div>'
    );
  }

  function renderRecommendBlock(s) {
    if (!window.CourseRecommend) {
      return '<p class="intent-empty">课程推荐模块未加载</p>';
    }
    return window.CourseRecommend.renderDrawerPanel(s);
  }

  function renderInsightPanel(s) {
    return (
      '<div class="intent-drawer-stack">' +
      '<section class="intent-drawer-section">' +
      '<h3 class="intent-drawer-section__title">跟进内容（当前会务）</h3>' +
      renderFollowBlock(s) +
      "</section>" +
      '<section class="intent-drawer-section">' +
      '<h3 class="intent-drawer-section__title">AI 提炼分析</h3>' +
      renderAiBlock(s) +
      "</section>" +
      '<section class="intent-drawer-section intent-drawer-section--recommend">' +
      renderRecommendBlock(s) +
      "</section>" +
      "</div>"
    );
  }

  function openDrawer(memberId) {
    var s = STUDENTS.find(function (x) {
      return x.id === memberId;
    });
    if (!s) return;
    var total = totalScore(s);
    var lv = getIntentLevel(s);
    var tScore = tagScore(s.hits);
    var aiSc = aiScoreOf(s);
    var backdrop = document.getElementById("drawer-backdrop");
    document.getElementById("drawer-name").textContent = s.name;
    var metaLine =
      state.intentMode === "tags"
        ? s.id +
          " · 意向度 " +
          lv.label +
          " · 参考分 " +
          total +
          "（关注权重 " +
          tScore +
          " + AI " +
          aiSc +
          "）"
        : s.id +
          " · 意向分 " +
          total +
          "（关注权重 " +
          tScore +
          " + AI " +
          aiSc +
          "）";
    document.getElementById("drawer-meta").textContent = metaLine;

    var watchSet = {};
    (state.watchTags || []).forEach(function (c) {
      watchSet[c] = true;
    });

    document.getElementById("panel-tags").innerHTML =
      '<p style="margin:0 0 12px;font-size:13px;color:#64748b">意向度 <span class="' +
      levelPillClass(lv.key) +
      '">' +
      lv.label +
      "</span>" +
      (state.intentMode === "score"
        ? " · 模式：按权重分"
        : " · 模式：按命中标签（详情不展示权重数字）") +
      "</p>" +
      s.hits
        .map(function (c) {
          var t = tagByCode(c);
          var title = escapeHtml(t ? t.parentName + " / " + t.name : c);
          var right = "";
          if (state.intentMode === "score") {
            if (watchSet[c]) {
              right =
                '<span class="intent-drawer-tag__w">+' +
                watchWeightOf(c) +
                " 分</span>";
            } else {
              right =
                '<span class="intent-drawer-tag__w intent-drawer-tag__w--muted">不计分</span>';
            }
          } else {
            var roles = comboRoleForTag(c);
            right = roles.length
              ? '<span class="intent-drawer-tag__w">' +
                escapeHtml(roles.join(" · ")) +
                "</span>"
              : '<span class="intent-drawer-tag__w intent-drawer-tag__w--muted">未入档位组合</span>';
          }
          return (
            '<div class="intent-drawer-tag"><strong>' +
            title +
            "</strong>" +
            right +
            "</div>"
          );
        })
        .join("") +
      (state.intentMode === "score"
        ? '<p style="margin:14px 0 0;font-size:12px;color:#64748b">AI 权重分 <strong>' +
          aiSc +
          "</strong> / " +
          AI_SCORE_MAX +
          "</p>"
        : '<p style="margin:14px 0 0;font-size:12px;color:#64748b">AI 权重分仍参与参考分与排序：<strong>' +
          aiSc +
          "</strong> / " +
          AI_SCORE_MAX +
          "</p>");

    var insightEl = document.getElementById("panel-insight");
    insightEl.innerHTML = renderInsightPanel(s);
    if (window.CourseRecommend) {
      window.CourseRecommend.bindCopyButtons(insightEl);
    }

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
