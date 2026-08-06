/**
 * 面谈官可进入的进行中会务（原型 mock）
 */
(function (global) {
  var ALL = [
    {
      id: "cf_a",
      title: "如何说孩子才会听，怎么听孩子才肯说",
      periodLabel: "第12551期",
      city: "广州",
      status: "ongoing",
      timeRange: "2026-08-01 ~ 2026-08-10",
    },
    {
      id: "cf_b",
      title: "亲密关系的重建与对话",
      periodLabel: "第12580期",
      city: "深圳",
      status: "ongoing",
      timeRange: "2026-08-05 ~ 2026-08-12",
    },
    {
      id: "cf_c",
      title: "家庭会议带领实战营",
      periodLabel: "第12602期",
      city: "上海",
      status: "ongoing",
      timeRange: "2026-08-03 ~ 2026-08-15",
    },
  ];

  var BY_USER = {
    iv_demo: ["cf_a", "cf_b", "cf_c"],
    iv_empty: [],
  };

  function listForUser(userId) {
    var ids = BY_USER[userId] || [];
    return ids
      .map(function (id) {
        return ALL.filter(function (c) {
          return c.id === id && c.status === "ongoing";
        })[0];
      })
      .filter(Boolean);
  }

  function getById(id) {
    for (var i = 0; i < ALL.length; i++) {
      if (ALL[i].id === id) return ALL[i];
    }
    return null;
  }

  global.InterviewerConferences = {
    listForUser: listForUser,
    getById: getById,
    ALL: ALL,
  };
})(typeof window !== "undefined" ? window : globalThis);
