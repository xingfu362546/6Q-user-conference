/**
 * 学员画像档案 v1.0.2 · mock 数据
 */
(function (global) {
  "use strict";

  var STUDENTS = [
    {
      id: "m10009",
      memberId: "1HRG0U",
      name6q: "项琳琳",
      realName: "项琳琳",
      phone: "18818203231",
      gender: "女",
      age: 36,
      city: "广州市",
      memberStatus: "会员",
      trainTag: "复训",
      checkinNo: 1,
      group: "2组",
      clearance: "普通关",
      checkinRatio: "1/1",
      learnStatus: "已完成",
      writeoff: "已核销",
      contactStatus: "已联系",
      intendedDirection: "天使",
      interviewSlot: "课程结束后",
      assistantName: "黄翠梅",
      retrainCount: 2,
    },
    {
      id: "m10001",
      memberId: "1HRG0A",
      name6q: "夏兰",
      realName: "夏兰",
      phone: "19942233418",
      gender: "女",
      age: 34,
      city: "广州市",
      memberStatus: "会员",
      trainTag: "复训",
      checkinNo: 3,
      group: "1组",
      clearance: "普通关",
      checkinRatio: "1/1",
      learnStatus: "已完成",
      writeoff: "已核销",
      contactStatus: "已联系",
      intendedDirection: "",
      interviewSlot: "课间休息时",
      assistantName: "丁秀芳",
      retrainCount: 0,
    },
    {
      id: "m10003",
      memberId: "1HRG0C",
      name6q: "张志远",
      realName: "张志远",
      phone: "13588771234",
      gender: "男",
      age: 38,
      city: "佛山市",
      memberStatus: "会员",
      trainTag: "复训",
      checkinNo: 2,
      group: "2组",
      clearance: "普通关",
      checkinRatio: "1/1",
      learnStatus: "学习中",
      writeoff: "未核销",
      contactStatus: "未联系",
      intendedDirection: "导师&天使",
      interviewSlot: "随时都可以",
      assistantName: "黄翠梅",
      retrainCount: 7,
    },
  ];

  var PROFILES = {
    m10009: {
      /* 对齐会员详情·基础信息：只保留画像判断常用字段 */
      basic: {
        wechat: "xl_lin_6q",
        email: "xll@163.com",
        region: "中国大陆",
        cityDetail: "广东省广州市天河区",
        opsUnit: "广州办事处",
        realnameStatus: "已认证",
        memberStatusDetail: "正常续会",
        identities: ["会员", "大使"],
        role: "—",
        birthday: "1989-05-12",
        occupation: "全职妈妈",
        industry: "教育/培训/科研/心理",
        education: "本科",
        emergencyName: "陈志强",
        emergencyPhone: "13725118862",
        remark: "复训学员，现场跟进积极。",
        createdAt: "2023-08-01 10:20:00",
        updatedAt: "2026-08-03 16:10:00",
        registeredAt: "2023-08-01 10:20:00",
        consultant: "罗欢（总统筹）",
        /* 关系人摘要（当前生效，细节见关系图谱） */
        belongStatus: "已绑定",
        belongAngel: "洪振午",
        belongAngelId: "VFWV2R",
        belongAngelPhone: "13725117757",
        belongStartAt: "2026-07-10 12:40:56",
        belongOpsUnit: "广州办事处",
        referralSource: "自主购买",
        recommender: "洪振午",
        recommenderId: "VFWV2R",
        recommenderPhone: "13725117757",
        recommendStartAt: "2026-07-10 12:40:56",
      },
      systemTags: [
        { parent: "用户偏好", name: "亲子偏好" },
        { parent: "用户行为", name: "社区活跃发帖" },
        { parent: "用户分层", name: "高价值潜客" },
      ],
      /* 对齐会员详情·家庭组：家庭ID + 成员表（编号/姓名/性别/身份/手机） */
      familyGroup: {
        familyId: "39251027",
        members: [
          {
            code: "1HRG0U",
            name: "项琳琳",
            gender: "女",
            role: "母亲",
            phone: "18818203231",
            isSelf: true,
          },
          {
            code: "1HRG1A",
            name: "陈志强",
            gender: "男",
            role: "父亲",
            phone: "13725118862",
            isSelf: false,
          },
          {
            code: "1HRG1B",
            name: "陈予安",
            gender: "男",
            role: "儿子",
            phone: "—",
            isSelf: false,
          },
        ],
      },
      purchaseByProduct: [
        { product: "如何说孩子才会听", count: 2, amount: 13600 },
        { product: "高EQ智慧父母", count: 1, amount: 8600 },
        { product: "青少年6Q训练营", count: 1, amount: 300 },
      ],
      purchases: [
        {
          product: "如何说孩子才会听",
          goods: "第12551期·广州站（新训席）",
          time: "2025-03-12",
          status: "已完成",
        },
        {
          product: "如何说孩子才会听",
          goods: "第1469期·广州站（复训）",
          time: "2026-01-08",
          status: "学习中",
        },
        {
          product: "高EQ智慧父母",
          goods: "基础班",
          time: "2024-09-20",
          status: "已完成",
        },
        {
          product: "青少年6Q训练营",
          goods: "通用券",
          time: "2024-11-02",
          status: "已核销",
        },
      ],
      repurchase: [
        {
          product: "如何说孩子才会听",
          count: 2,
          lastTime: "2026-01-08",
          amount: 13600,
        },
      ],
      refunds: [
        {
          refundNo: "J2011034599143623",
          orderNo: "CO202601301725418310899",
          goods: "《青少年6Q训练营》通用券",
          channel: "用户申请",
          amount: 300,
          actual: 300,
          method: "原路返回",
          status: "审核不通过",
          createdAt: "2026-02-01 11:20:00",
        },
      ],
      follows: [
        {
          type: "会务跟进",
          checkinNo: "1",
          group: "2组",
          identity: "会员、大使",
          angelId: "VFWV2R",
          angelName: "洪振午",
          angelPhone: "13725117757",
          tags: ["有意向用户"],
          content: "课后沟通，对进阶班感兴趣，担心时间冲突。",
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
          tags: ["二级天使"],
          content: "已报考二级天使，持续跟进成长路径。",
          follower: "邓灿媚",
          conference: "第1469期《高EQ智慧父母》一阶（广州站）",
          visible: "是",
          time: "2026-01-18 19:05:00",
        },
        {
          type: "会务跟进",
          checkinNo: "88",
          group: "1组",
          identity: "会员",
          angelId: "RCJR2W",
          angelName: "邓琪姗",
          angelPhone: "18022316536",
          tags: ["已报读二级天使"],
          content: "现场确认复训资格与签到信息。",
          follower: "刘佳（查询官）",
          conference: "第1469期《高EQ智慧父母》一阶（广州站）",
          visible: "是",
          time: "2026-01-10 10:12:00",
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
      /* 关系图谱：仅当前生效、1跳；箭头业务方向；active=主动实线 / passive=被动虚线 */
      relationGraph: {
        recommend: {
          upstream: [
            {
              code: "VFWV2R",
              name: "洪振午",
              mode: "passive",
              channel: "课程海报扫码",
              time: "2026-08-01 23:46:49",
            },
          ],
          downstream: [
            {
              code: "FZV7QJ",
              name: "会员7488",
              mode: "passive",
              channel: "课程问卷扫码",
              time: "2026-07-10 09:12:03",
            },
            {
              code: "9NU69T",
              name: "诸葛院",
              mode: "active",
              channel: "课程海报扫码",
              time: "2026-06-18 14:22:11",
            },
            {
              code: "K8PL2M",
              name: "周晓萱",
              mode: "passive",
              channel: "课程海报扫码",
              time: "2026-05-02 11:08:40",
            },
          ],
        },
        belong: {
          upstream: [
            {
              code: "VFWV2R",
              name: "洪振午",
              mode: "passive",
              channel: "自主购买",
              time: "2026-08-01 22:13:39",
            },
          ],
          downstream: [
            {
              code: "RCJR2W",
              name: "林晓晴",
              mode: "active",
              channel: "自主购买",
              time: "2026-07-10 16:40:02",
            },
          ],
        },
        historyPreview: [
          {
            kind: "推荐关系",
            mode: "被动",
            related: "VFWV2R(洪振午)",
            content: "变更推荐关系",
            channel: "课程海报扫码",
            time: "2026-08-01 23:46:49",
          },
          {
            kind: "归属关系",
            mode: "被动",
            related: "VFWV2R(洪振午)",
            content: "政策变更归属关系生成归属[绑定]关系",
            channel: "自主购买",
            time: "2026-08-01 22:13:39",
          },
          {
            kind: "推荐关系",
            mode: "被动",
            related: "0(6Q公共池) → VFWV2R(洪振午)",
            content: "变更推荐关系",
            channel: "课程海报扫码",
            time: "2026-07-10 09:12:03",
          },
        ],
      },
      behaviorTrend: {
        labels: ["D-29", "D-25", "D-20", "D-15", "D-10", "D-5", "今日"],
        community: [2, 1, 4, 3, 5, 2, 6],
        live: [0, 1, 0, 2, 1, 3, 1],
        learn: [1, 2, 1, 1, 3, 2, 2],
      },
      /* 社区按「话题名称」细拆（对齐话题管理·话题列表），不用分类汇总代替 */
      communityTopics: [
        {
          topic: "乘6Q专列,传幸福家风",
          category: "6Q打卡",
          publisher: "6Q小星星",
          views: 18,
          clicks: 7,
          posts: 2,
        },
        {
          topic: "21天亲子倾听打卡",
          category: "6Q打卡",
          publisher: "6Q小星星",
          views: 14,
          clicks: 5,
          posts: 1,
        },
        {
          topic: "幸福家风故事征集",
          category: "6Q打卡",
          publisher: "运营小助手",
          views: 11,
          clicks: 3,
          posts: 0,
        },
        {
          topic: "高EQ家庭练习营·第3期",
          category: "课程共学",
          publisher: "课程运营",
          views: 9,
          clicks: 4,
          posts: 1,
        },
        {
          topic: "如何说·课后作业互助",
          category: "课程共学",
          publisher: "课程运营",
          views: 8,
          clicks: 2,
          posts: 0,
        },
        {
          topic: "广州站复训须知·12551期",
          category: "会务通知",
          publisher: "会务组",
          views: 6,
          clicks: 5,
          posts: 0,
        },
      ],
      /* 四类行为明细（自意向分析迁入，字段口径不变） */
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
          topic: "人人分享6Q征集活动",
          content: "多指责孩子也是在指责小时候的自己",
          time: "2026-07-28 13:40:36",
        },
        {
          topic: "人人分享6Q征集活动",
          content: "有个小练习请已掌握倾听的家长试试",
          time: "2026-07-23 09:46:32",
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
        {
          course: "《如何说孩子才会听》基础班",
          count: 4,
          updatedAt: "2026-04-12 16:40:01",
        },
        {
          course: "亲子情绪急救（主题沙龙）",
          count: 1,
          updatedAt: "2026-03-08 11:20:33",
        },
      ],
      videoRecords: [
        {
          title: "【教育方法】《全脑教养法》",
          id: "DSP2505231442293127",
          tags: "亲子教育、本周精选",
          watchedAt: "2026-08-03 21:18:06",
        },
        {
          title: "【内驱力】厌学的发展过程，如何识别早期信号",
          id: "DSP2409121120304699",
          tags: "亲子教育、厌学、情绪",
          watchedAt: "2026-08-01 12:05:33",
        },
        {
          title: "【学习】如何协助孩子提升学习专注力",
          id: "DSP2506161411459966",
          tags: "本周精选、学习分享",
          watchedAt: "2026-07-28 20:44:10",
        },
        {
          title: "【道歉】智慧的父母会如何道歉",
          id: "DSP250609150244487",
          tags: "亲子教育、亲子关系",
          watchedAt: "2026-07-20 09:12:51",
        },
        {
          title: "【学习成长】和父母关系好是孩子最大的底气",
          id: "DSP2409111959219947",
          tags: "学习成长、自我成长",
          watchedAt: "2026-07-11 22:30:18",
        },
        {
          title: "【亲子沟通】如何听孩子才肯说",
          id: "DSP2507011000112233",
          tags: "亲子教育、沟通",
          watchedAt: "2026-07-05 19:08:40",
        },
      ],
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
        {
          team: "家庭关系专题直播",
          sessions: 2,
          liveDuration: "01:05:33",
          replayDuration: "00:20:00",
          amount: 300,
        },
      ],
    },
  };

  // 为列表其他学员补一份精简档案
  PROFILES.m10001 = JSON.parse(JSON.stringify(PROFILES.m10009));
  PROFILES.m10001.basic.remark = "高意向跟进中。";
  PROFILES.m10001.systemTags = [
    { parent: "用户偏好", name: "亲子偏好" },
    { parent: "用户分层", name: "近期消费高" },
  ];
  PROFILES.m10001.familyGroup = {
    familyId: "39248668",
    members: [
      {
        code: "1HRG0A",
        name: "夏兰",
        gender: "女",
        role: "母亲",
        phone: "19942233418",
        isSelf: true,
      },
      {
        code: "VFWV2R",
        name: "洪换年",
        gender: "男",
        role: "父亲",
        phone: "13725117757",
        isSelf: false,
      },
      {
        code: "YSX2Q7",
        name: "洪诗茵",
        gender: "女",
        role: "女儿",
        phone: "15920568551",
        isSelf: false,
      },
    ],
  };
  PROFILES.m10003 = JSON.parse(JSON.stringify(PROFILES.m10009));
  PROFILES.m10003.basic.remark = "强购课意向，建议锁席。";
  PROFILES.m10003.repurchase = [];
  PROFILES.m10003.purchaseByProduct = [
    { product: "如何说孩子才会听", count: 1, amount: 6800 },
    { product: "高EQ智慧父母", count: 1, amount: 8600 },
  ];
  PROFILES.m10003.familyGroup = {
    familyId: "39250112",
    members: [
      {
        code: "1HRG0C",
        name: "张志远",
        gender: "男",
        role: "父亲",
        phone: "13588771234",
        isSelf: true,
      },
      {
        code: "1HRG2D",
        name: "李婉清",
        gender: "女",
        role: "母亲",
        phone: "13660098821",
        isSelf: false,
      },
      {
        code: "1HRG2E",
        name: "张予辰",
        gender: "男",
        role: "儿子",
        phone: "—",
        isSelf: false,
      },
    ],
  };

  function listStudents() {
    return STUDENTS.slice();
  }

  function getProfile(id) {
    var stu = STUDENTS.find(function (s) {
      return s.id === id;
    });
    if (!stu) stu = STUDENTS[0];
    var detail = PROFILES[stu.id] || PROFILES.m10009;
    return { student: stu, detail: detail };
  }

  global.ConferenceProfileData = {
    listStudents: listStudents,
    getProfile: getProfile,
  };
})(window);
