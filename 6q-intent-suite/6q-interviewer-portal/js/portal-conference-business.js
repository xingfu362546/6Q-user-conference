/* 五个会务业务页面：使用门户组件，数据与字段依据会务详情原型。 */
(function (global) {
  "use strict";
  var text = "学员诉求：孩子叛逆、夫妻关系不和谐。\n答疑情况：觉得孩子长大了，教育理念不一致。\n跟进建议：邀请组长鼓励妈妈继续学习，更好地…";
  var template = "学员诉求：\n答疑情况：\n跟进建议：";
  var categories = { "近期困惑": ["夫妻关系不和睦", "孩子叛逆期", "工作压力大", "感情生活不顺利", "情感焦虑", "事业停滞期", "待业中", "更年期"], "感兴趣的课程领域": [] };
  var followHeaders = ["序号", "跟进时间", "学员", "学员手机", "跟进类型", "跟进人", "跟进人角色", "跟进标签", "跟进内容", "附件", "特别关注", "操作"];
  var seedRecords = [
    ["1", "2026-08-24 09:56:43", "张三", "13588888888", "答疑跟进", "张三", "助教", "标签A、标签B", text, "", "是"],
    ["2", "2026-08-24 09:56:43", "李四", "13588888883", "面谈跟进", "李四", "面谈官", "标签A、标签B", "已推荐报名参加事业说明会，对平台的认可度较高，可发展为传播天使", "", "否"]
  ];
  var definitions = {
    students: { title: "学员列表", subtitle: "会务学员信息与现场跟进", headers: ["签到号", "6Q姓名", "手机号码", "6Q身份", "小组", "学员资格", "角色", "操作"], rows: [["4", "王五", "15973477348", "会员", "第1组", "新训", "组员"], ["5", "赵六", "15973477349", "会员、导师", "第1组", "新训", "助教"]], filters: ["学员ID", "学员资格", "学员6Q姓名", "学员真实姓名", "手机号", "组号", "签到号", "助教", "6Q身份", "上级天使", "上级天使手机号"], select: ["学员资格", "6Q身份"] },
    qa: { title: "答疑管理", subtitle: "查看答疑跟进、标签与特别关注", headers: followHeaders.filter(function (h) { return h !== "跟进类型"; }), filters: ["跟进人", "特别关注", "跟进 起时间~止时间", "学员", "学员手机"], select: ["特别关注"] },
    interview: { title: "面谈管理", subtitle: "查看预约信息并记录面谈跟进", headers: ["序号", "创建时间", "学员", "学员手机", "小组", "助教", "座号", "签到号", "累计预约面谈次数", "是否为工作人员", "是否存在未完款礼包", "是否为传导身份", "跟进内容", "约谈时间", "特别关注", "上级天使", "上级天使手机", "操作"], rows: [["1", "2026-08-24 09:56:43", "张三", "13588888888", "1", "张三", "2", "3", "2", "否", "否", "否", "导师&天使（对导师和传播天使都感兴趣）", "课间休息时", "是", "王大锤", "135888888888"], ["2", "2026-08-24 09:56:43", "李四", "13588888883", "2", "李四", "3", "3", "1", "是", "否", "否", "导师（只对导师感兴趣）", "课间休息时", "否", "李四", "135888888888"]], filters: ["跟进人", "是否为工作人员", "特别关注", "跟进 起时间~止时间", "学员", "学员手机", "是否存在未完款礼包", "是否为传导身份"], select: ["是否为工作人员", "特别关注", "是否存在未完款礼包", "是否为传导身份"] },
    followup: { title: "跟进记录", subtitle: "汇总当前会务的跟进内容", headers: followHeaders, filters: ["跟进人", "跟进类型", "特别关注", "跟进 起时间~止时间", "学员", "学员手机"], select: ["跟进类型", "特别关注"] },
    survey: { title: "意向调研", subtitle: "查看学员问卷提交状态与答题内容", headers: ["小组名称", "学员姓名", "学员ID", "学员资格", "状态", "更新时间", "问题1", "问题2", "问题2"], rows: [["1", "张三", "3231", "新训", "已提交", "2026.09.10", "A.选项内容", "B.选项内容", "B.选项内容"], ["1", "李四", "2342", "新训", "未提交", "", "", "", ""]], filters: ["学员ID", "状态", "学员姓名"], select: ["状态"] }
  };
  function escapeHtml(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function button(label, action, index) { return '<button type="button" class="q-btn q-btn--ghost" data-action="' + action + '"' + (index == null ? '' : ' data-index="' + index + '"') + '>' + escapeHtml(label) + '</button>'; }
  function readStore(key, fallback) { try { var value = JSON.parse(sessionStorage.getItem(key)); return Array.isArray(value) ? value : fallback; } catch (_) { return fallback; } }
  function storeKey(conferenceId) { var conf = global.InterviewerAuth && global.InterviewerAuth.getConference(); return "iv-business-records:" + (conferenceId || conf && conf.id || "current"); }
  function mount(options) {
    var root = document.querySelector(options.containerSelector);
    if (!root) return;
    var key = definitions[options.tab] ? options.tab : "qa";
    var def = options.definition || definitions[key];
    var recordKey = storeKey(options.conferenceId);
    if (!options.definition && key === "students" && global.InterviewerStudentSource) def = Object.assign({}, def, global.InterviewerStudentSource);
    var records = readStore(recordKey, seedRecords.map(function (row) { return row.slice(); }));
    var rows = [], visible = [], selected = new Set(), lastFocus, currentRecord, currentType, editIndex = -1;
    function columnIndex(field) {
      var aliases = { "学员6Q姓名": ["学员6Q姓名", "6Q姓名"], "学员真实姓名": ["学员真实姓名", "真实姓名"], "手机号": ["手机号", "手机号码", "学员手机"], "组号": ["组号", "小组", "小组名称"], "助教": ["助教", "助教名字"], "上级天使": ["上级天使", "直接上级传播天使姓名"], "上级天使手机号": ["上级天使手机号", "上级天使手机", "直接上级传播天使手机号码"], "学员": ["学员", "学员姓名"], "学员ID": ["学员ID", "学员id"] };
      var candidates = aliases[field] || [field];
      for (var i = 0; i < candidates.length; i++) { var index = def.headers.indexOf(candidates[i]); if (index >= 0) return index; }
      return -1;
    }
    function refreshRows() {
      if (key === "qa") rows = records.map(function (row, index) { var item = row.filter(function (_, i) { return i !== 4; }); item.recordIndex = index; return item; });
      else if (key === "followup") rows = records.map(function (row, index) { var item = row.slice(); item.recordIndex = index; return item; });
      else rows = def.rows.map(function (row) { return row.slice(); });
    }
    refreshRows();
    function optionsFor(field) {
      if (field === "特别关注" || field.indexOf("是否") === 0) return ["是", "否"];
      if (field === "跟进类型") return ["答疑跟进", "面谈跟进", "会务跟进", "天使跟进"];
      var index = columnIndex(field);
      var values = rows.map(function (row) { return row[index]; }).filter(Boolean);
      if (field === "6Q身份") values = values.flatMap(function (value) { return value.split("、"); });
      return Array.from(new Set(values));
    }
    function filterHtml(field, index) {
      var id = "business-filter-" + index;
      if (field.indexOf("起时间") !== -1) return '<div class="iv-business__field iv-business__field--range"><span>跟进时间</span><div class="iv-business__dates"><input class="q-input" type="date" aria-label="跟进开始时间" data-date="start"><span>至</span><input class="q-input" type="date" aria-label="跟进结束时间" data-date="end"></div></div>';
      var input = def.select.indexOf(field) !== -1 ? '<select id="' + id + '" class="q-select" data-field="' + escapeHtml(field) + '"><option value="">全部</option>' + optionsFor(field).map(function (value) { return '<option>' + escapeHtml(value) + '</option>'; }).join("") + '</select>' : '<input id="' + id + '" class="q-input" type="search" data-field="' + escapeHtml(field) + '" placeholder="' + escapeHtml(field) + '">';
      return '<label class="iv-business__field" for="' + id + '"><span>' + escapeHtml(field) + '</span>' + input + '</label>';
    }
    root.className = "iv-business";
    root.innerHTML = '<section class="intent-table-panel intent-table-panel--full" aria-label="' + escapeHtml(def.title) + '"><div class="intent-table-panel__head"><div><h2 class="intent-table-panel__title">' + escapeHtml(def.title) + '</h2><p class="intent-table-panel__sub">' + escapeHtml(def.subtitle) + '</p></div><div class="iv-business__tools">' + (key === "students" ? button("导出", "export") + '<button type="button" class="q-btn q-btn--primary" data-action="sync">立即同步</button>' : key === "survey" ? button("导出", "export") : '') + '</div></div><form class="iv-business__filters" aria-label="' + escapeHtml(def.title) + '筛选">' + def.filters.map(filterHtml).join("") + '<div class="iv-business__tools"><button type="submit" class="q-btn q-btn--primary">查询</button><button type="reset" class="q-btn">重置</button></div></form><div class="intent-table-wrap" tabindex="0" aria-label="' + escapeHtml(def.title) + '表格，可横向滚动"><table class="intent-table"><thead><tr>' + def.headers.map(function (header) { return '<th scope="col">' + escapeHtml(header) + '</th>'; }).join("") + '</tr></thead><tbody id="business-tbody"></tbody></table></div><div class="iv-business__foot"><span id="business-count"></span><span id="business-sync-status">' + (key === "students" ? "按当前会务展示学员信息" : "当前会务记录") + '</span></div></section>';
    var form = root.querySelector("form"), tbody = root.querySelector("tbody");
    mountFilterDisclosure(form);
    function matchRow(row) {
      return Array.from(form.querySelectorAll("[data-field], [data-date]")).every(function (input) {
        if (!input.value) return true;
        if (input.dataset.date) { var timestamp = row[def.headers.indexOf(key === "interview" ? "创建时间" : "跟进时间")] || ""; return input.dataset.date === "start" ? timestamp.slice(0, 10) >= input.value : timestamp.slice(0, 10) <= input.value; }
        var field = input.dataset.field, index = columnIndex(field);
        if (field === "学员" && index < 0) index = def.headers.indexOf("学员姓名");
        var value = index >= 0 ? String(row[index] || "") : "";
        if (index < 0 && field === "跟进人" && key === "interview") value = records.filter(function (record) { return record[2] === row[def.headers.indexOf("学员")]; }).map(function (record) { return record[5]; }).join("、");
        if (index < 0 && !value) return false;
        return input.tagName === "SELECT" ? (field === "6Q身份" ? value.split("、").includes(input.value) : value === input.value) : value.toLowerCase().includes(input.value.trim().toLowerCase());
      });
    }
    function renderTable() {
      visible = rows.map(function (row, index) { return { row: row, index: index }; }).filter(function (item) { return matchRow(item.row); });
      tbody.innerHTML = visible.length ? visible.map(function (item) { return '<tr>' + def.headers.map(function (header, col) {
        if (header === "操作") {
          var actions = key === "students" ? button("面谈", "interview", item.index) + button("答疑", "qa", item.index) : key === "interview" ? button("面谈跟进", "interview", item.index) : button(item.row[def.headers.indexOf("特别关注")] === "是" ? "取消关注" : "特别关注", "watch", item.index) + button("编辑", "edit", item.index) + button("删除", "delete", item.index);
          return '<td class="iv-business__actions">' + actions + '</td>';
        }
        if (key === "students" && (header === "6Q姓名" || header === "学员6Q姓名")) {
          var studentIdIndex = def.headers.indexOf("学员ID");
          var mobileIndex = def.headers.indexOf("手机号码");
          var profileHref = "student-profile.html?id=" + encodeURIComponent(studentIdIndex >= 0 ? item.row[studentIdIndex] : "") + "&name=" + encodeURIComponent(item.row[col] || "") + "&phone=" + encodeURIComponent(mobileIndex >= 0 ? item.row[mobileIndex] : "") + "&from=conference&conferenceId=" + encodeURIComponent((global.InterviewerAuth && global.InterviewerAuth.getConference() || {}).id || "");
          return '<td><a class="iv-business__name" data-student-profile href="' + profileHref + '">' + escapeHtml(item.row[col] || "—") + '</a></td>';
        }
        return '<td' + (header.indexOf("跟进") !== -1 && header !== "跟进时间" ? ' class="iv-business__content"' : '') + '>' + escapeHtml(item.row[col] || "—") + '</td>';
      }).join("") + '</tr>'; }).join("") : '<tr><td colspan="' + def.headers.length + '" class="iv-business__empty">暂无符合筛选条件的记录</td></tr>';
      root.querySelector("#business-count").textContent = "共 " + visible.length + " 条";
    }
    form.addEventListener("submit", function (event) { event.preventDefault(); renderTable(); });
    form.addEventListener("reset", function () { setTimeout(renderTable, 0); });
    form.addEventListener("input", renderTable);
    form.addEventListener("change", renderTable);
    var toast = document.createElement("div"); toast.className = "iv-business__toast"; toast.hidden = true; toast.setAttribute("role", "status"); document.body.appendChild(toast);
    var toastTimer;
    function notify(message) { toast.textContent = message; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.hidden = true; }, 3200); }
    function saveRecords() { try { sessionStorage.setItem(recordKey, JSON.stringify(records)); } catch (_) { notify("浏览器存储不可用，记录保留在当前页面。"); } refreshRows(); renderTable(); }
    var dialog = document.createElement("dialog"); dialog.className = "iv-business__dialog"; dialog.setAttribute("aria-labelledby", "business-dialog-title");
    dialog.innerHTML = '<form method="dialog"><div class="iv-business__dialog-head"><h2 id="business-dialog-title">答疑/面谈跟进</h2><button class="iv-business-notes__close" type="button" data-dialog-close aria-label="关闭跟进">×</button></div><div class="iv-business__dialog-body"><p id="business-dialog-student" class="q-cell-muted"></p><div class="iv-business__subtabs" role="tablist" aria-label="标签分类">' + Object.keys(categories).map(function (category, i) { return '<button type="button" role="tab" aria-selected="' + (i === 0) + '" data-category="' + category + '">' + category + '</button>'; }).join("") + '</div><div class="iv-business__tags" id="business-tag-choices"></div><div id="business-selected-tags" class="iv-business__tags" aria-label="已选标签"></div><div class="iv-business__inline"><input class="q-input" id="business-custom-tag" aria-label="自定义标签" placeholder="自定义标签"><button type="button" class="q-btn" data-add-tag>+ 自定义标签</button></div><label class="iv-business__field"><span>跟进内容</span><textarea id="business-follow-content" class="q-input" maxlength="1000" placeholder="学员诉求：&#10;答疑情况：&#10;跟进建议："></textarea></label><div class="iv-business__inline"><button type="button" class="q-btn q-btn--ghost" data-template>示例模板</button><span class="iv-business__counter" id="business-content-count">0/1000</span></div><label class="iv-business__field"><span>附件</span><input type="file" id="business-attachment" multiple></label><div id="business-attachment-list" class="q-cell-muted"></div></div><div class="iv-business__dialog-foot"><button type="button" class="q-btn" data-dialog-close>取消</button><button type="submit" class="q-btn q-btn--primary">提交</button></div></form>';
    var modalBackdrop = document.createElement("div"); modalBackdrop.className = "iv-business__modal-backdrop"; modalBackdrop.hidden = true;
    document.body.appendChild(modalBackdrop); document.body.appendChild(dialog);
    var content = dialog.querySelector("textarea"), fileInput = dialog.querySelector("input[type=file]"), attachmentNames = "";
    function updateCount() { dialog.querySelector("#business-content-count").textContent = content.value.length + "/1000"; }
    function renderTags(category) {
      dialog.querySelector("#business-tag-choices").innerHTML = categories[category].map(function (tag) { return '<button type="button" class="iv-business__tag" data-tag="' + escapeHtml(tag) + '" aria-pressed="' + selected.has(tag) + '">' + escapeHtml(tag) + '</button>'; }).join("") || '<span class="q-cell-muted">可使用自定义标签录入</span>';
      dialog.querySelector("#business-selected-tags").innerHTML = Array.from(selected).map(function (tag) { return '<button type="button" class="iv-business__tag" data-tag="' + escapeHtml(tag) + '" aria-pressed="true" aria-label="移除标签 ' + escapeHtml(tag) + '">' + escapeHtml(tag) + ' ×</button>'; }).join("");
    }
    function activeCategory() { return dialog.querySelector('[data-category][aria-selected="true"]').dataset.category; }
    function openFollow(index, type, editing) {
      lastFocus = document.activeElement; currentRecord = rows[index]; currentType = type;
      editIndex = editing ? currentRecord.recordIndex : -1;
      var original = editIndex >= 0 ? records[editIndex] : null;
      selected = new Set(original && original[7] ? original[7].split("、") : []);
      content.value = original ? original[8] : ""; attachmentNames = original ? original[9] : ""; fileInput.value = "";
      dialog.querySelector("#business-attachment-list").textContent = attachmentNames;
      var nameIndex = columnIndex("学员"); if (nameIndex < 0) nameIndex = columnIndex("学员6Q姓名");
      var followType = original ? original[4] : type === "qa" ? "答疑跟进" : "面谈跟进";
      dialog.querySelector("#business-dialog-title").textContent = followType;
      dialog.querySelector("#business-dialog-student").textContent = (currentRecord[nameIndex] || "") + " · " + followType + (options.conferenceId ? " · 会务 " + options.conferenceId : "");
      updateCount(); renderTags(activeCategory()); modalBackdrop.hidden = false; dialog.show(); content.focus();
    }
    dialog.addEventListener("click", function (event) {
      var close = event.target.closest("[data-dialog-close]"); if (close) { dialog.close(); return; }
      var category = event.target.closest("[data-category]");
      if (category) { dialog.querySelectorAll("[data-category]").forEach(function (tab) { tab.setAttribute("aria-selected", tab === category ? "true" : "false"); }); renderTags(category.dataset.category); }
      var tag = event.target.closest("[data-tag]"); if (tag) { if (selected.has(tag.dataset.tag)) selected.delete(tag.dataset.tag); else selected.add(tag.dataset.tag); renderTags(activeCategory()); }
      if (event.target.closest("[data-add-tag]")) { var input = dialog.querySelector("#business-custom-tag"); var value = input.value.trim(); if (value) { selected.add(value); input.value = ""; renderTags(activeCategory()); } }
      if (event.target.closest("[data-template]")) { content.value = template; updateCount(); content.focus(); }
    });
    dialog.querySelector("#business-custom-tag").addEventListener("keydown", function (event) { if (event.key === "Enter") { event.preventDefault(); dialog.querySelector("[data-add-tag]").click(); } });
    content.addEventListener("input", updateCount);
    fileInput.addEventListener("change", function () { attachmentNames = Array.from(fileInput.files).map(function (file) { return file.name; }).join("、"); dialog.querySelector("#business-attachment-list").textContent = attachmentNames; });
    dialog.addEventListener("close", function () { modalBackdrop.hidden = true; if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true }); });
    dialog.addEventListener("keydown", function (event) { if (event.key === "Escape") { event.preventDefault(); dialog.close(); } });
    dialog.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();
      if (editIndex >= 0) { records[editIndex][7] = Array.from(selected).join("、"); records[editIndex][8] = content.value; records[editIndex][9] = attachmentNames; }
      else {
        var nameIndex = columnIndex("学员"); if (nameIndex < 0) nameIndex = columnIndex("学员6Q姓名");
        var mobileIndex = columnIndex("手机号");
        var session = global.InterviewerAuth && global.InterviewerAuth.getSession();
        var now = new Date(), time = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0") + " " + now.toTimeString().slice(0, 8);
        var saved = [String(records.length + 1), time, currentRecord[nameIndex], currentRecord[mobileIndex], currentType === "qa" ? "答疑跟进" : "面谈跟进", session && session.displayName || "", session && session.roles && session.roles.join("、") || "面谈官", Array.from(selected).join("、"), content.value, attachmentNames, "否"];
        saved[11] = options.studentId || currentRecord[columnIndex("学员ID")] || "";
        saved[12] = options.conferenceId || (global.InterviewerAuth && global.InterviewerAuth.getConference() || {}).id || "";
        records.push(saved);
      }
      saveRecords(); dialog.close(); notify("跟进记录已保存");
      if (options.onSave) options.onSave(records);
    });
    function exportCsv() {
      var headers = def.headers.filter(function (h) { return h !== "操作"; });
      var quote = function (value) { var s = String(value == null ? "" : value); if (/^[=+@\-\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
      var csv = "\ufeff" + [headers].concat(visible.map(function (item) { return item.row.slice(0, headers.length); })).map(function (row) { return row.map(quote).join(","); }).join("\r\n");
      var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), anchor = document.createElement("a");
      var conf = global.InterviewerAuth && global.InterviewerAuth.getConference();
      var today = new Date(), exportDate = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      anchor.href = url; anchor.download = (conf && (conf.periodLabel || conf.title) || "会务") + "_" + (key === "students" ? "学员信息" : def.title) + "_" + exportDate + ".csv";
      anchor.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); notify("已导出当前筛选结果");
    }
    root.addEventListener("click", function (event) {
      var action = event.target.closest("[data-action]"); if (!action) return;
      var index = Number(action.dataset.index), row = rows[index];
      if (action.dataset.action === "qa" || action.dataset.action === "interview") openFollow(index, action.dataset.action, false);
      if (action.dataset.action === "edit") openFollow(index, "", true);
      if (action.dataset.action === "watch") { var record = records[row.recordIndex]; record[10] = record[10] === "是" ? "否" : "是"; saveRecords(); }
      if (action.dataset.action === "delete") { if (global.confirm("确认删除这条跟进记录？")) { records.splice(row.recordIndex, 1); saveRecords(); notify("记录已删除"); } }
      if (action.dataset.action === "export") exportCsv();
      if (action.dataset.action === "sync") { refreshRows(); renderTable(); root.querySelector("#business-sync-status").textContent = "最近同步：" + new Date().toLocaleString("zh-CN"); notify("当前会务数据已同步"); }
    });
    renderTable();
    if (!options.skipNotes) mountNotes(key);
    return { openFollow: function (type) { openFollow(0, type, false); } };
  }
  var filterSequence = 0;
  function mountFilterDisclosure(form) {
    var fields = Array.from(form.children).filter(function (el) { return el.classList.contains("iv-business__field"); });
    if (!fields.length) return;
    var tools = form.querySelector(".iv-business__tools"), expanded = false, lastWidth = -1;
    var toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "q-btn q-btn--ghost iv-filter-toggle"; toggle.hidden = true;
    if (!form.id) form.id = "portal-filters-" + (++filterSequence);
    toggle.setAttribute("aria-controls", form.id); tools.appendChild(toggle);
    function refresh() {
      if (!form.getBoundingClientRect().width) return;
      fields.forEach(function (el) { el.hidden = false; });
      var firstTop = fields[0].offsetTop;
      var extra = fields.filter(function (el) { return el.offsetTop > firstTop + 1; });
      toggle.hidden = !extra.length;
      toggle.textContent = expanded ? "收起筛选" : "展开筛选";
      toggle.setAttribute("aria-expanded", String(expanded));
      if (!expanded) extra.forEach(function (el) { el.hidden = true; });
    }
    toggle.addEventListener("click", function () { expanded = !expanded; refresh(); });
    var observer = new ResizeObserver(function () { var width = form.getBoundingClientRect().width; if (width !== lastWidth) { lastWidth = width; refresh(); } });
    observer.observe(form); refresh();
    return refresh;
  }
  function mountNotes(key) {
    var data = global.InterviewerBusinessNotesData && global.InterviewerBusinessNotesData[key];
    if (!data) return;
    var buttonEl = document.createElement("button"); buttonEl.type = "button"; buttonEl.className = "iv-business-notes-button"; buttonEl.textContent = "说明"; buttonEl.title = "查看" + data.title + "需求说明"; buttonEl.setAttribute("aria-label", buttonEl.title); buttonEl.setAttribute("aria-expanded", "false"); buttonEl.setAttribute("aria-controls", "business-notes-panel");
    var panel = document.createElement("aside"); panel.id = "business-notes-panel"; panel.className = "iv-business-notes"; panel.hidden = true; panel.setAttribute("aria-label", data.title + "需求说明");
    panel.innerHTML = '<div class="iv-business-notes__resize" tabindex="0" role="separator" aria-label="调整说明面板宽度，左右方向键调整" aria-orientation="vertical" aria-valuemin="280" aria-valuemax="900" aria-valuenow="520"></div><div class="iv-business-notes__head"><h2>' + escapeHtml(data.title) + ' · 说明</h2><button type="button" class="iv-business-notes__close" aria-label="关闭说明">×</button></div><div class="iv-business-notes__body"><h3>交互路径</h3><p>' + escapeHtml(data.path) + '</p><h3>功能说明</h3>' + data.functions.map(function (item) { return '<p>' + escapeHtml(item) + '</p>'; }).join("") + '<h3>字段说明</h3><div class="iv-business-notes__table-wrap" tabindex="0" aria-label="字段说明表格，可横向滚动"><table><thead><tr>' + ["元素名称", "类型", "是否必填", "变更", "说明"].map(function (field) { return '<th scope="col">' + field + '</th>'; }).join("") + '</tr></thead><tbody>' + data.fields.map(function (row) { return '<tr>' + row.map(function (field) { return '<td>' + escapeHtml(field) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div></div>';
    document.body.appendChild(buttonEl); document.body.appendChild(panel);
    function close() { panel.hidden = true; buttonEl.setAttribute("aria-expanded", "false"); if (panel.contains(document.activeElement)) buttonEl.focus({ preventScroll: true }); }
    buttonEl.addEventListener("click", function () { if (!panel.hidden) close(); else { panel.hidden = false; buttonEl.setAttribute("aria-expanded", "true"); panel.querySelector(".iv-business-notes__close").focus({ preventScroll: true }); } });
    panel.querySelector(".iv-business-notes__close").addEventListener("click", close);
    panel.addEventListener("keydown", function (event) { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); } });
    var handle = panel.querySelector("[role=separator]"), drag;
    function setWidth(width) { var max = Math.min(900, window.innerWidth - 28), min = Math.min(280, max); var value = Math.round(Math.min(max, Math.max(min, width))); panel.style.width = value + "px"; handle.setAttribute("aria-valuenow", String(value)); handle.setAttribute("aria-valuemax", String(max)); }
    handle.addEventListener("pointerdown", function (event) { drag = { x: event.clientX, width: panel.getBoundingClientRect().width }; handle.setPointerCapture(event.pointerId); event.preventDefault(); });
    handle.addEventListener("pointermove", function (event) { if (drag) setWidth(drag.width + drag.x - event.clientX); });
    handle.addEventListener("pointerup", function () { drag = null; }); handle.addEventListener("pointercancel", function () { drag = null; });
    handle.addEventListener("keydown", function (event) { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); setWidth(panel.getBoundingClientRect().width + (event.key === "ArrowLeft" ? 1 : -1) * (event.shiftKey ? 80 : 20)); } });
    global.addEventListener("resize", function () { setWidth(panel.getBoundingClientRect().width || 520); });
  }
  global.InterviewerConferenceBusiness = { mount: mount, mountNotes: mountNotes, mountFilterDisclosure: mountFilterDisclosure, definitions: definitions, seedRecords: seedRecords };
})(typeof window !== "undefined" ? window : globalThis);
