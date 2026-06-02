/**
 * 数据表字段目录（原型 Mock；上线由「数据表管理」接口提供）
 * 用户属性规则：数据表 → 字段（技术字段名），不按中文业务名写死
 */
(function () {
  "use strict";

  var TABLES = [
    {
      name: "user_tag_user_tag_sfn_223_1940268748",
      displayName: "用户表",
      db: "horizon_production_3",
      role: "profile",
      columns: [
        { name: "distinct_id", dataType: "string", comment: "" },
        { name: "member_level", dataType: "int", comment: "" },
        { name: "register_time", dataType: "datetime", comment: "" },
        { name: "channel", dataType: "string", comment: "" },
        { name: "is_paid", dataType: "boolean", comment: "" },
        { name: "city", dataType: "string", comment: "" },
      ],
    },
    {
      name: "profile_identity_distinct",
      displayName: "用户标识",
      db: "horizon_production_3",
      role: "profile",
      columns: [
        { name: "$identity_distinct_id", dataType: "string", comment: "" },
        { name: "updated_at", dataType: "datetime", comment: "" },
      ],
    },
    {
      name: "events_community_forward_8821",
      displayName: "社区转发事件",
      db: "horizon_production_3",
      role: "event",
      columns: [
        { name: "event", dataType: "string", comment: "" },
        { name: "time", dataType: "datetime", comment: "" },
        { name: "distinct_id", dataType: "string", comment: "" },
        { name: "page_path", dataType: "string", comment: "" },
      ],
    },
    {
      name: "tag_compute_result_daily",
      displayName: "标签日计算结果",
      db: "horizon_staging",
      role: "system",
      columns: [
        { name: "tag_code", dataType: "string", comment: "" },
        { name: "version_date", dataType: "string", comment: "" },
        { name: "member_id", dataType: "string", comment: "" },
        { name: "computed_at", dataType: "datetime", comment: "" },
      ],
    },
  ];

  function mapDataTypeToValueType(dataType) {
    var t = (dataType || "string").toLowerCase();
    if (t === "boolean" || t === "bool") return "bool";
    if (t.indexOf("int") !== -1 || t === "float" || t === "double" || t === "decimal" || t === "number")
      return "number";
    if (t === "datetime" || t === "date" || t === "timestamp") return "date";
    return "string";
  }

  function getTable(name) {
    return TABLES.find(function (tb) {
      return tb.name === name;
    });
  }

  function listTables(role) {
    if (!role) return TABLES.slice();
    return TABLES.filter(function (tb) {
      return tb.role === role;
    });
  }

  function listTableOptions(role) {
    return listTables(role).map(function (tb) {
      return {
        value: tb.name,
        label: tb.displayName + " · " + tb.name,
      };
    });
  }

  function listColumnOptions(tableName) {
    var tb = getTable(tableName);
    if (!tb) return [];
    return tb.columns.map(function (col) {
      var typeLabel = col.dataType;
      var label = col.name + " (" + typeLabel + ")";
      if (col.comment) label += " — " + col.comment;
      return {
        value: col.name,
        label: label,
        dataType: col.dataType,
        valueType: mapDataTypeToValueType(col.dataType),
        comment: col.comment,
      };
    });
  }

  function getColumn(tableName, columnName) {
    var opts = listColumnOptions(tableName);
    return opts.find(function (c) {
      return c.value === columnName;
    });
  }

  window.UT_TABLE_CATALOG = {
    tables: TABLES,
    listTables: listTables,
    listTableOptions: listTableOptions,
    listColumnOptions: listColumnOptions,
    getTable: getTable,
    getColumn: getColumn,
    mapDataTypeToValueType: mapDataTypeToValueType,
    /** 供数据表管理抽屉复用 */
    getDrawerColumns: function (tableName) {
      var tb = getTable(tableName);
      if (!tb) return [];
      return tb.columns.map(function (c) {
        return [c.name, c.dataType, c.comment || "—"];
      });
    },
  };
})();
