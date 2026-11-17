/* 门户画像适配：身份校验、显式会务上下文及原生会务页签。 */
(function (global) {
  "use strict";
  var params = new URLSearchParams(location.search), id = params.get("id"), data = global.ConferenceProfileData;
  var conferenceId = params.get("conferenceId"), conference = null;
  if ((params.get("from") === "conference" || params.get("from") === "portal") && conferenceId) {
    conference = global.InterviewerConferences.getById(conferenceId);
  }
  var students = data.listStudents(), student = students.find(function (item) { return item.id === id || item.memberId === id; });
  var source = global.InterviewerStudentSource, sourceRow = source && source.rows.find(function (row) { return row[0] === id; });
  // 两份冻结示例的内部ID重复，按入口识别意向列表已有学员，不影响普通档案ID。
  var intentStudents = [["m10001", "陈晓明", "138****2201"], ["m10002", "李美琳", "139****8832"], ["m10003", "王建国", "136****0091"], ["m10004", "赵雅琴", "137****5560"], ["m10005", "张志远", "135****7712"], ["m10006", "刘慧敏", "158****3344"]];
  var intentRow = params.get("profileSource") === "intent" && intentStudents.find(function (row) { return row[0] === id; });
  var originalGet = data.getProfile, pack;
  function emptyDetail() {
    return { basic: {}, systemTags: [], familyGroup: null, purchaseByProduct: [], purchases: [], repurchase: [], tickets: [], refunds: [], follows: [], reviews: [], relationGraph: null, behaviorTrend: { labels: [], community: [], live: [], learn: [] }, communityTopics: [], communityRecords: [], learnRecords: [], videoRecords: [], liveRecords: [] };
  }
  function legacyPrototypeDetail() { return JSON.parse(JSON.stringify(originalGet("m10009").detail)); }
  if (intentRow) {
    student = { id: intentRow[0], memberId: intentRow[0], name6q: intentRow[1], realName: intentRow[1], phone: intentRow[2], city: "—" };
    pack = { student: student };
  }
  else if (student) pack = originalGet(student.id);
  else if (sourceRow) {
    student = { id: sourceRow[0], memberId: sourceRow[0], name6q: sourceRow[1], realName: sourceRow[2], phone: sourceRow[3], group: sourceRow[4] + "组", checkinNo: sourceRow[5], gender: sourceRow[9], age: sourceRow[10], trainTag: sourceRow[11], memberStatus: sourceRow[13], city: "—" };
    student.assistantName = sourceRow[6];
    pack = { student: student };
  }
  if (pack && student) { pack.detail = legacyPrototypeDetail(); pack.detail.prototypeDemo = true; }
  var mismatch = student && ((params.has("name") && params.get("name") !== student.name6q) || (params.has("phone") && params.get("phone") !== student.phone));
  var valid = !!student && !mismatch;
  if (!valid) pack = { student: { id: id || "", memberId: id || "", name6q: "未找到对应学员", realName: "", phone: "", city: "" }, detail: emptyDetail() };
  // 冻结渲染器支持 name 覆盖；门户先校验，再移除此参数，避免展示身份与实际ID不一致。
  if (valid && params.has("name")) { params.delete("name"); history.replaceState(null, "", location.pathname + "?" + params.toString() + location.hash); }
  data.getProfile = function (requestedId) { return !valid || requestedId === id || student && requestedId === student.id ? pack : null; };
  if (conference) { data.CURRENT_CONFERENCE_KEY = conference.id; data.CURRENT_CONFERENCE = (conference.periodLabel || "") + " " + conference.title; }
  var behavior = global.ProfileBehaviorUI;
  ["renderFollowCard", "init"].forEach(function (name) {
    var original = behavior[name];
    behavior[name] = function (detail, studentOrOptions, options) {
      if (name === "renderFollowCard") return original(detail, { fromConference: !!conference, conferenceKey: conferenceId });
      return original(detail, studentOrOptions, { fromConference: !!conference, conferenceKey: conferenceId });
    };
  });
  function esc(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  var orderHeaders = ["序号", "订单ID", "交易类型", "交易明细", "购买数量", "应收金额", "实收金额", "订单状态", "创建时间", "完款时间"];
  var questionnaireHeaders = ["序号", "问卷名称", "状态", "更新时间", "操作"];
  // 当前原型复用完整订单与问卷示例，供所有有效学员和会务入口展示。
  var sourceOrders = [["1", "CR202608191745203680762", "实物商品", "6Q亲子营》领袖营1Q+父母课学费优惠价+亲子营", "", "", "", "待支付", "2026-08-24 09:56:43", ""], ["2", "CR202608191745203680762", "线下课程商品", "和谐家庭365天伴学》会员", "", "", "", "已完成", "2026-08-24 09:56:43", "2026-08-24 09:56:43"]];
  var sourceQuestionnaires = [["1", "亲子沟通心灵密码-复训问卷", "已提交", "2026.09.10"], ["2", "《亲子沟通心灵密码》分享会学员调查问卷 V1.0", "未提交", ""]];
  // 原型答卷示例：用于展示题型、问题与回答，不代表真实提交内容。
  var questionnaireAnswers = {
    "1": [
      { type: "单选题", question: "您参加过几次《亲子沟通心灵密码》课程？", answer: "2次" },
      { type: "单选题", question: "您孩子目前处于哪个年龄阶段？", answer: "小学阶段（6—12岁）" },
      { type: "多选题", question: "您目前在亲子沟通中遇到哪些困扰？", answer: ["孩子不愿主动分享学校生活", "辅导作业时容易发生争执", "自己着急时难以控制情绪"] },
      { type: "评分题", question: "请为目前的亲子沟通状态评分（1分表示不满意，5分表示非常满意）。", answer: "3分 / 5分" },
      { type: "多选题", question: "上次课程后，您尝试过哪些方法？", answer: ["先倾听孩子的想法，再表达建议", "用描述感受代替批评", "安排固定的亲子交流时间"] },
      { type: "问答题", question: "请描述一次运用课程方法后的变化。", answer: "以前孩子放学后不想说话，我会连续追问。现在先给他休息时间，等他愿意时再听他说。最近他开始主动分享与同学相处的事情，我们的争执也减少了。" },
      { type: "问答题", question: "本次复训您最希望解决什么问题？", answer: "希望学习在作业和电子产品使用问题上，如何与孩子共同制定规则，并在出现分歧时稳定自己的情绪。" },
      { type: "单选题", question: "您是否愿意参加课后的家庭沟通练习？", answer: "愿意，每周安排2—3次练习" }
    ]
  };
  function renderQuestionnaireAnswers(row) {
    if (row[2] !== "已提交") return '<p class="pf-muted">学员尚未提交，暂无答题内容。</p>';
    var answers = questionnaireAnswers[row[0]] || questionnaireAnswers["1"];
    return '<p class="pf-muted">原型演示答卷 · 共 ' + answers.length + ' 题</p><div class="iv-survey-answers">' + answers.map(function (item, index) {
      var answer = Array.isArray(item.answer) ? '<ul>' + item.answer.map(function (value) { return '<li>' + esc(value) + '</li>'; }).join("") + '</ul>' : '<p>' + esc(item.answer) + '</p>';
      return '<section class="iv-survey-answer" style="padding:16px 0;border-top:1px solid #e2e8f0"><h3 style="margin:0 0 10px;font-size:14px;line-height:1.7">' + (index + 1) + '. ' + esc(item.question) + '</h3><p class="pf-muted" style="margin:0 0 8px">' + esc(item.type) + '</p><div style="line-height:1.8;overflow-wrap:anywhere"><strong>回答：</strong>' + answer + '</div></section>';
    }).join("") + '</div>';
  }
  function table(headers, rows, questionnaire) {
    return '<div class="intent-table-wrap" tabindex="0" aria-label="表格，可横向滚动"><table class="intent-table"><thead><tr>' + headers.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join("") + '</tr></thead><tbody>' + (rows.length ? rows.map(function (row, index) { return '<tr>' + headers.map(function (h, col) { return '<td>' + (questionnaire && h === "操作" ? '<button type="button" class="q-btn q-btn--ghost" data-survey-detail="' + index + '">查看详情</button>' : esc(row[col] || "—")) + '</td>'; }).join("") + '</tr>'; }).join("") : '<tr><td colspan="' + headers.length + '" class="iv-business__empty">暂无本场会务' + (questionnaire ? '学员问卷' : '订单') + '</td></tr>') + '</tbody></table></div>';
  }
  function field(label, type, values) {
    return '<label class="iv-business__field"><span>' + label + '</span>' + (values ? '<select class="q-select" data-profile-filter="' + label + '"><option value="">全部</option>' + values.map(function (v) { return '<option>' + v + '</option>'; }).join("") + '</select>' : '<input class="q-input" type="' + (type || 'search') + '" data-profile-filter="' + label + '">') + '</label>';
  }
  function mount() {
    var root = document.getElementById("profileRoot"), contextLine = document.getElementById("ctxLine");
    var card = document.getElementById("pfConferenceCard");
    global.InterviewerConferenceBusiness.mountNotes("profile");
    if (!valid) { root.innerHTML = '<section class="pf-card"><div class="pf-card__body" role="alert">' + (mismatch ? '学员姓名或手机号与ID不一致，请返回列表重新进入。' : '未找到该学员档案，请返回列表重新进入。') + '</div></section>'; document.getElementById("pfAiOpenBtn").hidden = true; contextLine.textContent = "学员身份校验未通过"; return; }
    contextLine.textContent = conference ? "会员全局档案 · 本场会务：" + (conference.periodLabel || conference.id) + " · " + conference.title : "会员全局档案";
    if (pack.detail.prototypeDemo) {
      var demoNotice = document.createElement("aside"); demoNotice.className = "iv-profile-demo"; demoNotice.setAttribute("aria-label", "画像数据性质");
      demoNotice.textContent = '原型演示数据';
      root.before(demoNotice);
      root.querySelectorAll(".pf-card__head").forEach(function (head) { if (head.closest("#pfBasic, #pfConferenceCard")) return; var mark = document.createElement("span"); mark.className = "pf-muted"; mark.textContent = "原型演示数据"; head.appendChild(mark); });
    }
    if (!conference && card) card.remove();
    document.querySelector(".pf-toolbar__left > a").href = "students.html";
    if (!conference) return;
    if (card) card.querySelector(".pf-card__head").textContent = "本场会务信息 · " + (conference.periodLabel || conference.id);
    var holder = document.createElement("div"); holder.hidden = true; holder.id = "portal-profile-follow-form"; document.body.appendChild(holder);
    var follow = global.InterviewerConferenceBusiness.mount({ containerSelector: "#portal-profile-follow-form", tab: "students", definition: { title: "学员跟进", subtitle: "", headers: ["学员ID", "学员", "学员手机", "操作"], rows: [[student.id, student.name6q, student.phone]], filters: [], select: [] }, conferenceId: conference.id, studentId: student.id, skipNotes: true, onSave: renderSaved });
    var actions = document.createElement("div"); actions.className = "iv-business__tools"; actions.innerHTML = '<button type="button" class="q-btn q-btn--primary" data-profile-follow="interview">面谈跟进</button><button type="button" class="q-btn" data-profile-follow="qa">答疑跟进</button>';
    document.querySelector(".pf-toolbar .q-actions").prepend(actions);
    actions.addEventListener("click", function (event) { var button = event.target.closest("[data-profile-follow]"); if (button) follow.openFollow(button.dataset.profileFollow); });
    var tabs = document.createElement("nav"); tabs.className = "iv-tabs iv-profile-tabs"; tabs.setAttribute("aria-label", "学员档案页签"); tabs.setAttribute("role", "tablist");
    tabs.innerHTML = [["portrait", "档案画像"], ["orders", "本场会务订单"], ["questionnaires", "本场会务学员问卷"]].map(function (item, index) { return '<button type="button" id="profile-tab-' + item[0] + '" class="iv-tabs__item' + (index ? '' : ' is-active') + '" role="tab" aria-selected="' + !index + '" aria-controls="profile-panel-' + item[0] + '" data-profile-tab="' + item[0] + '">' + item[1] + '</button>'; }).join("");
    var hero = document.getElementById("pfHero"); root.before(hero);
    root.before(tabs); var portrait = document.createElement("div"); portrait.id = "profile-panel-portrait"; root.before(portrait); portrait.appendChild(root); portrait.setAttribute("role", "tabpanel"); portrait.setAttribute("aria-labelledby", "profile-tab-portrait");
    function panel(key, html) { var el = document.createElement("section"); el.id = "profile-panel-" + key; el.className = "iv-business iv-profile-panel"; el.hidden = true; el.setAttribute("role", "tabpanel"); el.setAttribute("aria-labelledby", "profile-tab-" + key); el.innerHTML = html; portrait.after(el); return el; }
    var orderPanel = panel("orders", '<section class="intent-table-panel"><form class="iv-business__filters">' + field("创建开始时间", "date") + field("创建结束时间", "date") + field("下单人") + field("下单人手机") + field("完款开始时间", "date") + field("完款结束时间", "date") + field("订单ID") + field("交易类型", "", ["实物商品", "线下课程商品"]) + '<div class="iv-business__tools"><button class="q-btn q-btn--primary" type="submit">查询</button><button class="q-btn" type="reset">重置</button></div></form><div data-order-table></div></section>');
    var surveyPanel = panel("questionnaires", '<section class="intent-table-panel"><form class="iv-business__filters">' + field("问卷名称") + field("状态", "", ["已提交", "未提交"]) + '<div class="iv-business__tools"><button class="q-btn q-btn--primary" type="submit">查询</button><button class="q-btn" type="reset">重置</button></div></form><div data-survey-table></div></section>');
    [orderPanel, surveyPanel].forEach(function (item) { global.InterviewerConferenceBusiness.mountFilterDisclosure(item.querySelector("form")); });
    var orders = sourceOrders, surveys = sourceQuestionnaires;
    if (orders.length) { var fixtureNote = document.createElement("p"); fixtureNote.className = "pf-muted"; fixtureNote.textContent = "原型演示数据 · 当前学员及本场会务"; orderPanel.prepend(fixtureNote); surveyPanel.prepend(fixtureNote.cloneNode(true)); }
    function values(form) { var result = {}; form.querySelectorAll("[data-profile-filter]").forEach(function (input) { result[input.dataset.profileFilter] = input.value.trim(); }); return result; }
    function paintOrders() { var v = values(orderPanel.querySelector("form")); var rows = orders.filter(function (row) { return (!v["订单ID"] || row[1].includes(v["订单ID"])) && (!v["交易类型"] || row[2] === v["交易类型"]) && (!v["下单人"] || student.name6q.includes(v["下单人"])) && (!v["下单人手机"] || student.phone.includes(v["下单人手机"])) && (!v["创建开始时间"] || row[8].slice(0, 10) >= v["创建开始时间"]) && (!v["创建结束时间"] || row[8].slice(0, 10) <= v["创建结束时间"]) && (!v["完款开始时间"] || row[9] && row[9].slice(0, 10) >= v["完款开始时间"]) && (!v["完款结束时间"] || row[9] && row[9].slice(0, 10) <= v["完款结束时间"]); }); orderPanel.querySelector("[data-order-table]").innerHTML = table(orderHeaders, rows, false); }
    var visibleSurveys = [];
    function paintSurveys() { var v = values(surveyPanel.querySelector("form")); visibleSurveys = surveys.filter(function (row) { return (!v["问卷名称"] || row[1].includes(v["问卷名称"])) && (!v["状态"] || row[2] === v["状态"]); }); surveyPanel.querySelector("[data-survey-table]").innerHTML = table(questionnaireHeaders, visibleSurveys, true); }
    [[orderPanel, paintOrders], [surveyPanel, paintSurveys]].forEach(function (item) { var form = item[0].querySelector("form"); form.addEventListener("submit", function (event) { event.preventDefault(); item[1](); }); form.addEventListener("input", item[1]); form.addEventListener("change", item[1]); form.addEventListener("reset", function () { setTimeout(item[1], 0); }); item[1](); });
    tabs.addEventListener("click", function (event) { var selected = event.target.closest("[data-profile-tab]"); if (!selected) return; tabs.querySelectorAll("button").forEach(function (button) { var active = button === selected; button.classList.toggle("is-active", active); button.setAttribute("aria-selected", String(active)); document.getElementById("profile-panel-" + button.dataset.profileTab).hidden = !active; }); });
    surveyPanel.addEventListener("click", function (event) { var button = event.target.closest("[data-survey-detail]"); if (!button) return; var row = visibleSurveys[Number(button.dataset.surveyDetail)]; var dialog = document.createElement("dialog"); dialog.className = "iv-business__dialog"; dialog.innerHTML = '<form method="dialog"><div class="iv-business__dialog-head"><h2>学员问卷详情</h2><button class="q-btn">关闭</button></div><div class="iv-business__dialog-body"><p>' + esc(row[1]) + '</p><p>' + esc(student.name6q) + ' · ' + esc(conference.periodLabel || conference.id) + '</p><p>状态：' + esc(row[2]) + '</p>' + renderQuestionnaireAnswers(row) + '</div></form>'; document.body.appendChild(dialog); dialog.addEventListener("close", function () { dialog.remove(); button.focus(); }); dialog.show(); });
    var saved = document.createElement("section"); saved.className = "pf-card"; saved.id = "portal-profile-saved"; root.prepend(saved);
    function renderSaved(records) { if (!records) { try { records = JSON.parse(sessionStorage.getItem("iv-business-records:" + conference.id)) || []; } catch (_) { records = []; } } var rows = records.filter(function (record) { return record[11] === student.id && record[12] === conference.id; }); saved.innerHTML = '<div class="pf-card__head">本场会务跟进</div><div class="pf-card__body">' + (rows.length ? rows.map(function (record) { return '<div class="pf-follow-item"><p>' + esc(record[4]) + ' · ' + esc(record[1]) + ' · ' + esc(record[5]) + '</p><p>' + esc(record[7]) + '</p><p class="iv-profile-follow-content">' + esc(record[8]) + '</p><p>' + esc(record[9]) + '</p></div>'; }).join("") : '<p class="pf-muted">暂无本场会务跟进</p>') + '</div>'; }
    renderSaved();
  }
  global.InterviewerStudentProfile = { mount: mount, valid: valid, context: conference, orderHeaders: orderHeaders, questionnaireHeaders: questionnaireHeaders };
})(window);
