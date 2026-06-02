/**
 * 与 user-tag-admin 标签管理一致的 一级 / 二级 结构
 */
window.INTENT_TAG_TREE = [
  {
    id: "pref",
    name: "用户偏好",
    children: [
      { code: "tag_1233", name: "亲子偏好", type: "布尔", weight: 30 },
      { code: "tag_7705", name: "视频观看-亲子类>50分钟", type: "数值", weight: 12 },
    ],
  },
  {
    id: "base",
    name: "基础属性",
    children: [
      { code: "tag_2201", name: "注册渠道", type: "枚举", weight: 10 },
      { code: "tag_2202", name: "会员等级", type: "枚举", weight: 8 },
    ],
  },
  {
    id: "seg",
    name: "用户分层",
    children: [
      { code: "tag_6604", name: "高价值用户", type: "布尔", weight: 18 },
      { code: "tag_6605", name: "沉默用户", type: "布尔", weight: 5 },
    ],
  },
  {
    id: "fin",
    name: "金融属性",
    children: [
      { code: "tag_3301", name: "近期消费高", type: "布尔", weight: 25 },
    ],
  },
  {
    id: "beh",
    name: "用户行为",
    children: [
      { code: "tag_4402", name: "浏览过《如何说孩子》", type: "布尔", weight: 20 },
      { code: "tag_5503", name: "社区活跃发帖", type: "布尔", weight: 15 },
      { code: "tag_9012", name: "近7日活跃", type: "布尔", weight: 12 },
    ],
  },
];

window.INTENT_TAG_FLAT = (function () {
  var flat = [];
  window.INTENT_TAG_TREE.forEach(function (g) {
    g.children.forEach(function (t) {
      flat.push({
        code: t.code,
        name: t.name,
        type: t.type,
        weight: t.weight,
        parentId: g.id,
        parentName: g.name,
      });
    });
  });
  return flat;
})();
