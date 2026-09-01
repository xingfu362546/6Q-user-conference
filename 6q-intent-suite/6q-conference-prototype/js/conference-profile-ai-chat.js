/**
 * 学员画像 · 大型分析助手工作台（原型）
 * 三大意图 + 课务检索演示；追问条与意图流注释。
 * 对话/检索/匹配结果均为原型 Mock，生产以 Dify 传输为准。
 */
(function () {
  "use strict";

  var Core = window.ConferenceProfileAssistantCore;
  var Mock = window.ConferenceProfileAssistantMock;
  if (!Core || !Mock || !window.ConferenceProfileData) return;

  var params = new URLSearchParams(location.search);
  var memberId = params.get("id") || "m10009";
  var pack = window.ConferenceProfileData.getProfile(memberId);
  if (!pack) return;

  var student = pack.student;
  var detail = pack.detail;
  var isPortal = /6q-interviewer-portal/i.test(location.pathname);
  var authSession =
    window.InterviewerAuth && window.InterviewerAuth.getSession
      ? window.InterviewerAuth.getSession()
      : null;
  var conference =
    window.InterviewerAuth && window.InterviewerAuth.getConference
      ? window.InterviewerAuth.getConference()
      : null;
  var currentUserId =
    (authSession && authSession.userId) || "conference_pc_demo_staff";
  var conferenceId = (conference && conference.id) || "conf-12551";
  var conferenceName =
    (conference &&
      ((conference.periodLabel || "") + " " + (conference.title || "")).trim()) ||
    "第12551期广州会务";
  var storageKey = "6q_profile_assistant_sessions_v1:" + currentUserId;
  var sessions = loadSessions();
  var currentSession = null;
  var currentConditions = null;
  var currentViewVersionId = null;
  var latestInput = "";
  var forceFailureNext = false;
  var timers = [];
  var panelWasOpened = false;
  var matchingActive = false;
  var replyPending = false;
  var demoRailUserToggle = null;
  var flowNoteOpen = false;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatTime(value) {
    if (!value) return "—";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    var pad = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  function loadSessions() {
    try {
      var parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (error) {}
    var seeded = Mock.seedSessions(currentUserId);
    try {
      localStorage.setItem(storageKey, JSON.stringify(seeded));
    } catch (error) {}
    return seeded;
  }

  function persistSessions() {
    if (!currentSession || !currentSession.persisted) return;
    var index = sessions.findIndex(function (row) {
      return row.id === currentSession.id;
    });
    if (index === -1) sessions.unshift(currentSession);
    else sessions[index] = currentSession;
    sessions.sort(function (a, b) {
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
    try {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    } catch (error) {}
  }

  function createDraft() {
    return Core.createDraftSession(
      {
        userId: currentUserId,
        memberId: memberId,
        memberName: student.name6q,
        conferenceId: conferenceId,
        conferenceName: conferenceName,
        dataAsOf: "2026-08-27 02:40",
      },
      nowIso(),
    );
  }

  function resolveInitialSession() {
    var requestedId = params.get("assistantSession");
    if (requestedId) {
      var found = sessions.find(function (row) {
        return row.id === requestedId;
      });
      if (found && found.memberId === memberId) {
        currentSession = found;
        currentViewVersionId =
          found.matchVersions && found.matchVersions.length
            ? found.matchVersions[found.matchVersions.length - 1].id
            : null;
        return true;
      }
    }
    currentSession = createDraft();
    return false;
  }

  function addMessage(role, text, meta) {
    Core.addMessage(currentSession, role, text, nowIso(), meta || {});
    persistSessions();
    renderMessages();
    if (role === "ai") {
      replyPending = false;
      renderFollowUps();
    }
  }

  function clearTimers() {
    timers.forEach(function (timer) {
      clearTimeout(timer);
      clearInterval(timer);
    });
    timers = [];
  }

  function careerBriefingText() {
    var learner = Mock.getLearner(memberId);
    var career = (learner && learner.careerPresentation) || {};
    var direction = career.intendedDirection || "未登记";
    var giftHint = Core.hasCareerGiftIntent(career.intendedDirection)
      ? "匹配后可展示礼包权益"
      : "无导师/天使意向，不展示礼包权益";
    return (
      "事业说明会：意向了解方向 " +
      direction +
      " · 可约谈 " +
      (career.interviewSlot || "—") +
      " · 助教 " +
      (career.assistantName || "—") +
      " · " +
      (career.group || "—") +
      " · " +
      giftHint
    );
  }

  function formatGiftPrice(price) {
    var n = Number(price);
    if (!isFinite(n)) return "—";
    return "¥" + n.toLocaleString("zh-CN");
  }

  function mount() {
    var restored = resolveInitialSession();
    var wrap = document.createElement("div");
    wrap.className = "pf-ai";
    wrap.innerHTML = `
      <button type="button" class="pf-ai__fab" id="pfAiFab" aria-expanded="false" title="打开学员分析助手">
        <span class="pf-ai__fab-icon">AI</span><span>问学员</span>
      </button>
      <div class="pf-ai__backdrop" id="pfAiBackdrop" hidden>
        <section class="pf-ai__panel" id="pfAiPanel" role="dialog" aria-modal="true" aria-labelledby="pfAiTitle">
          <header class="pf-ai__head">
            <div class="pf-ai__head-main">
              <span class="pf-ai__brand">AI</span>
              <div>
                <strong id="pfAiTitle">学员分析助手</strong>
                <p class="pf-ai__sub">当前学员：<em>${esc(student.name6q)}</em> · ${esc(conferenceName)}</p>
                <p class="pf-ai__briefing">${esc(careerBriefingText())}</p>
              </div>
            </div>
            <div class="pf-ai__head-actions">
              <button type="button" class="pf-ai__head-btn" id="pfAiFlowBtn">意图流注释</button>
              <button type="button" class="pf-ai__head-btn" id="pfAiNew">新会话</button>
              <button type="button" class="pf-ai__head-btn" id="pfAiHistoryBtn">历史记录</button>
              <button type="button" class="pf-ai__close" id="pfAiClose" aria-label="关闭">×</button>
            </div>
          </header>

          <aside class="pf-ai__history" id="pfAiHistory" hidden aria-label="个人历史会话">
            <div class="pf-ai__history-head">
              <div><strong>个人历史会话</strong><p>仅当前工作人员可见</p></div>
              <button type="button" class="pf-ai__history-close" id="pfAiHistoryClose">关闭</button>
            </div>
            <label class="pf-ai__history-search">
              <span>搜索</span>
              <input id="pfAiHistorySearch" type="search" placeholder="学员 / 会务 / 标题 / 日期" />
            </label>
            <div class="pf-ai__history-list" id="pfAiHistoryList"></div>
          </aside>

          <div class="pf-ai__workspace">
            <aside class="pf-ai__demo-rail" id="pfAiDemoRail" aria-label="演示发言"></aside>
            <section class="pf-ai__conversation">
              <div class="pf-ai__snapshot" id="pfAiSnapshot" hidden>
                已载入历史会话快照；继续提问将读取当前最新画像并生成新版本。
              </div>
              <div class="pf-ai__messages" id="pfAiMessages" role="log" aria-live="polite"></div>
              <div class="pf-ai__followups" id="pfAiFollowups" hidden></div>
              <form class="pf-ai__composer" id="pfAiComposer">
                <input id="pfAiInput" type="text" autocomplete="off" placeholder="继续补充学员需求，或输入“模拟匹配失败”…" />
                <button type="submit" class="pf-ai__send">发送</button>
              </form>
              <p class="pf-ai__foot">原型 Mock 数据，仅供演示。生产环境以 Dify 智能体回传及课务/产品接口为准 · 分析与产品仅供工作人员参考</p>
            </section>
            <section class="pf-ai__result" id="pfAiResult" aria-label="课程与礼包推荐结果"></section>
          </div>
          <aside class="pf-ai__flow-note" id="pfAiFlowNote" hidden aria-label="意图流注释"></aside>
        </section>
      </div>
    `;
    document.body.appendChild(wrap);

    bindEvents();
    renderDemoRail();
    renderMessages();
    renderFollowUps();
    renderResult();
    renderHistory();
    renderFlowNote();
    document.getElementById("pfAiSnapshot").hidden = !restored;
    if (restored) open();
  }

  function bindEvents() {
    var fab = document.getElementById("pfAiFab");
    var backdrop = document.getElementById("pfAiBackdrop");
    fab.addEventListener("click", function () {
      if (backdrop.hidden) open();
      else close();
    });
    document.getElementById("pfAiClose").addEventListener("click", close);
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) close();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !backdrop.hidden) close();
    });
    document.getElementById("pfAiNew").addEventListener("click", newSession);
    document
      .getElementById("pfAiFlowBtn")
      .addEventListener("click", toggleFlowNote);
    document
      .getElementById("pfAiHistoryBtn")
      .addEventListener("click", toggleHistory);
    document
      .getElementById("pfAiHistoryClose")
      .addEventListener("click", toggleHistory);
    document
      .getElementById("pfAiHistorySearch")
      .addEventListener("input", renderHistory);
    document
      .getElementById("pfAiComposer")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        var input = document.getElementById("pfAiInput");
        var text = input.value.trim();
        if (!text) return;
        input.value = "";
        handleWorkerText(text);
      });
    document
      .getElementById("pfAiMessages")
      .addEventListener("click", handleMessageAction);
    document
      .getElementById("pfAiResult")
      .addEventListener("click", handleResultAction);
  }

  function open() {
    var backdrop = document.getElementById("pfAiBackdrop");
    backdrop.hidden = false;
    document.getElementById("pfAiFab").setAttribute("aria-expanded", "true");
    document.body.classList.add("pf-ai-open");
    panelWasOpened = true;
    document.getElementById("pfAiInput").focus();
  }

  function close() {
    document.getElementById("pfAiBackdrop").hidden = true;
    document.getElementById("pfAiFab").setAttribute("aria-expanded", "false");
    document.body.classList.remove("pf-ai-open");
  }

  function newSession() {
    clearTimers();
    currentSession = createDraft();
    currentConditions = null;
    currentViewVersionId = null;
    latestInput = "";
    forceFailureNext = false;
    matchingActive = false;
    replyPending = false;
    demoRailUserToggle = null;
    document.getElementById("pfAiSnapshot").hidden = true;
    document.getElementById("pfAiHistory").hidden = true;
    renderMessages();
    renderFollowUps();
    renderDemoRail();
    renderResult();
  }

  function toggleHistory() {
    var history = document.getElementById("pfAiHistory");
    history.hidden = !history.hidden;
    if (!history.hidden) {
      flowNoteOpen = false;
      document.getElementById("pfAiFlowNote").hidden = true;
      renderHistory();
      document.getElementById("pfAiHistorySearch").focus();
    }
  }

  function renderHistory() {
    var list = document.getElementById("pfAiHistoryList");
    if (!list) return;
    var queryElement = document.getElementById("pfAiHistorySearch");
    var query = queryElement ? queryElement.value : "";
    var rows = Core.searchSessions(sessions, query).sort(function (a, b) {
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
    list.innerHTML = rows.length
      ? rows
          .map(function (row) {
            return `
              <button type="button" class="pf-ai__history-item${
                currentSession && row.id === currentSession.id ? " is-active" : ""
              }" data-history-id="${esc(row.id)}">
                <strong>${esc(row.title || "未命名会话")}</strong>
                <span>${esc(row.memberName)} · ${esc(row.conferenceName)}</span>
                <time>${esc(formatTime(row.updatedAt))}</time>
              </button>
            `;
          })
          .join("")
      : '<p class="pf-ai__empty">未找到匹配的个人会话</p>';
    list.querySelectorAll("[data-history-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        openHistory(button.getAttribute("data-history-id"));
      });
    });
  }

  function openHistory(sessionId) {
    var target = sessions.find(function (row) {
      return row.id === sessionId;
    });
    if (!target) return;
    if (target.memberId !== memberId) {
      var page = isPortal
        ? "student-profile.html"
        : "conference-student-profile.html";
      location.href =
        page +
        "?id=" +
        encodeURIComponent(target.memberId) +
        "&assistantSession=" +
        encodeURIComponent(target.id);
      return;
    }
    currentSession = target;
    currentViewVersionId =
      target.matchVersions && target.matchVersions.length
        ? target.matchVersions[target.matchVersions.length - 1].id
        : null;
    document.getElementById("pfAiSnapshot").hidden = false;
    document.getElementById("pfAiHistory").hidden = true;
    renderMessages();
    renderFollowUps();
    renderDemoRail();
    renderResult();
    renderHistory();
  }

  function toggleFlowNote() {
    flowNoteOpen = !flowNoteOpen;
    var note = document.getElementById("pfAiFlowNote");
    note.hidden = !flowNoteOpen;
    if (flowNoteOpen) {
      document.getElementById("pfAiHistory").hidden = true;
      renderFlowNote();
    }
  }

  function renderFlowNote() {
    var root = document.getElementById("pfAiFlowNote");
    if (!root) return;
    root.innerHTML = `
      <div class="pf-ai__flow-head">
        <div>
          <strong>意图流与数据源</strong>
          <p>原型 Mock · 生产以 Dify 智能体传输为准</p>
        </div>
        <button type="button" class="pf-ai__history-close" id="pfAiFlowClose">关闭</button>
      </div>
      <p class="pf-ai__flow-disclaimer">
        本图只说明演示剧本。正式环境由 Dify 识别意图并组织回答，期数、价格、名额走课务/产品接口，不由模型编造。
      </p>
      <div class="pf-ai__flow-chart" id="pfAiFlowChart"></div>
      <table class="pf-ai__flow-table">
        <thead><tr><th>意图</th><th>数据源</th><th>产出</th></tr></thead>
        <tbody>
          <tr><td>兴趣解读</td><td>用户标签、行为埋点</td><td>左栏兴趣依据</td></tr>
          <tr><td>下一步跟进</td><td>上课层级、报读购买、跟进</td><td>左栏进阶建议</td></tr>
          <tr><td>产品匹配</td><td>会话条件 + 标签/埋点/跟进/报读 + 产品SKU/课务</td><td>确认后右栏推荐</td></tr>
          <tr><td>广州开课 / 南宁续聊</td><td>课务期数（城市、时间窗、状态）</td><td>左栏期数列表</td></tr>
          <tr><td>总导师课程/期数</td><td>导师词典、课程-导师、课务期数</td><td>左栏课程与期数</td></tr>
          <tr><td>一阶二阶区别</td><td>课阶知识库 / Dify 提示词</td><td>左栏课阶说明</td></tr>
          <tr><td>产品细节追问</td><td>当前推荐版本</td><td>左栏介绍/期数/商品，右栏不跳</td></tr>
          <tr><td>礼包权益</td><td>事业说明会意向了解方向 + 礼包目录</td><td>有导师/天使意向才出右栏礼包区；与课程产品分区</td></tr>
        </tbody>
      </table>
    `;
    var close = document.getElementById("pfAiFlowClose");
    if (close) close.addEventListener("click", toggleFlowNote);
    var chart = document.getElementById("pfAiFlowChart");
    if (chart && window.mermaid) {
      var pre = document.createElement("pre");
      pre.className = "mermaid";
      pre.textContent = Core.INTENT_FLOW_MERMAID;
      chart.innerHTML = "";
      chart.appendChild(pre);
      window.mermaid.run({ nodes: [pre] }).catch(function () {});
    } else if (chart) {
      chart.textContent = Core.INTENT_FLOW_MERMAID;
    }
  }

  function renderDemoRail() {
    var root = document.getElementById("pfAiDemoRail");
    if (!root) return;
    var hasMessages = !!(currentSession.messages && currentSession.messages.length);
    var expanded = Core.isDemoRailExpanded(hasMessages, demoRailUserToggle);
    root.classList.toggle("is-collapsed", !expanded);
    if (!expanded) {
      root.innerHTML =
        '<button type="button" class="pf-ai__demo-toggle" id="pfAiDemoExpand">演示发言</button>';
      document.getElementById("pfAiDemoExpand").addEventListener("click", function () {
        demoRailUserToggle = true;
        renderDemoRail();
      });
      return;
    }
    root.innerHTML =
      '<div class="pf-ai__demo-head"><strong>演示发言</strong><p>点一句即发出 · Mock 剧本</p>' +
      (hasMessages
        ? '<button type="button" class="pf-ai__demo-collapse" id="pfAiDemoCollapse">收起</button>'
        : "") +
      "</div>" +
      Core.DEMO_GROUPS.map(function (group) {
        return (
          '<div class="pf-ai__demo-group"><span>' +
          esc(group.title) +
          "</span><small>" +
          esc(group.subtitle) +
          "</small>" +
          group.items
            .map(function (item) {
              return (
                '<button type="button" class="pf-ai__intent" data-demo-id="' +
                esc(item.id) +
                '"><strong>' +
                esc(item.label) +
                "</strong><small>" +
                esc(item.hint) +
                "</small></button>"
              );
            })
            .join("") +
          "</div>"
        );
      }).join("");
    var collapse = document.getElementById("pfAiDemoCollapse");
    if (collapse) {
      collapse.addEventListener("click", function () {
        demoRailUserToggle = false;
        renderDemoRail();
      });
    }
    root.querySelectorAll("[data-demo-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-demo-id");
        var item = null;
        Core.DEMO_GROUPS.forEach(function (group) {
          group.items.forEach(function (row) {
            if (row.id === id) item = row;
          });
        });
        if (!item) return;
        demoRailUserToggle = null;
        handleWorkerText(item.label);
      });
    });
  }

  function renderFollowUps() {
    var root = document.getElementById("pfAiFollowups");
    if (!root) return;
    var chips = Core.buildFollowUpChips(currentSession, {
      matching: matchingActive || replyPending,
    });
    if (!chips.length) {
      root.hidden = true;
      root.innerHTML = "";
      return;
    }
    root.hidden = false;
    root.innerHTML =
      '<p>你可能还会问</p><div class="pf-ai__followup-row">' +
      chips
        .map(function (chip) {
          return (
            '<button type="button" class="pf-ai__followup" data-followup="' +
            esc(chip.text) +
            '">' +
            esc(chip.text) +
            "</button>"
          );
        })
        .join("") +
      "</div>";
    root.querySelectorAll("[data-followup]").forEach(function (button) {
      button.addEventListener("click", function () {
        handleWorkerText(button.getAttribute("data-followup"));
      });
    });
  }

  function renderIntents() {
    renderDemoRail();
    renderFollowUps();
  }

  function renderMessages() {
    var root = document.getElementById("pfAiMessages");
    if (!root) return;
    root.innerHTML = currentSession.messages
      .map(function (message) {
        return renderMessage(message);
      })
      .join("");
    root.scrollTop = root.scrollHeight;
    renderIntents();
  }

  function renderMessage(message) {
    var meta = message.meta || {};
    var extra = "";
    if (meta.kind === "interest") extra = renderInterest(meta.payload);
    if (meta.kind === "followup") extra = renderFollowup(meta.payload);
    if (meta.kind === "conditions") extra = renderConditions(meta.payload);
    if (meta.kind === "retrieval") extra = renderRetrieval(meta.payload);
    if (meta.kind === "product-detail") extra = renderRetrieval(meta.payload);
    return `
      <article class="pf-ai__message pf-ai__message--${esc(message.role)}">
        <div class="pf-ai__bubble">${esc(message.text).replace(/\n/g, "<br>")}</div>
        ${extra}
        <time>${esc(formatTime(message.createdAt))}</time>
      </article>
    `;
  }

  function renderInterest(payload) {
    return `
      <div class="pf-ai__evidence">
        ${payload.evidence
          .map(function (row) {
            return `<div><span>${esc(row.source)}</span><p>${esc(row.text)}</p>${
              row.time ? "<time>" + esc(row.time) + "</time>" : ""
            }</div>`;
          })
          .join("")}
      </div>
      ${renderMatchQuestion()}
    `;
  }

  function renderFollowup(payload) {
    var warning = payload.progression.conflict
      ? '<p class="pf-ai__warning">“上课层级”标签与真实报读记录不一致，已采用验证后的最高层级。</p>'
      : "";
    return `
      ${warning}
      <div class="pf-ai__records">
        ${payload.records
          .map(function (row) {
            return `
              <div class="pf-ai__record">
                <span>${esc(row.level)}</span>
                <div><strong>${esc(row.title)}</strong><p>${esc(row.city)} · ${esc(
                  row.teacher,
                )}</p><time>${esc(row.startsAt)} 至 ${esc(row.endsAt)}</time></div>
              </div>
            `;
          })
          .join("")}
      </div>
      ${renderMatchQuestion()}
    `;
  }

  function renderConditions(conditions) {
    function rows(items, type) {
      return (items || [])
        .map(function (row) {
          return `<span class="pf-ai__condition pf-ai__condition--${type}"><strong>${esc(
            row.label,
          )}</strong>${esc(row.value)}<em>${esc(
            type === "explicit" ? "工作人员提供" : row.source || "AI推断",
          )}</em></span>`;
        })
        .join("");
    }
    return `
      <div class="pf-ai__condition-card">
        <div class="pf-ai__condition-head"><strong>当前匹配条件</strong><span>信息充分度 ${esc(
          conditions.confidence,
        )}%</span></div>
        <div class="pf-ai__condition-list">
          ${rows(conditions.explicit, "explicit")}
          ${rows(conditions.inferred, "inferred")}
        </div>
        ${
          conditions.missing.length
            ? '<p class="pf-ai__missing">仍可补充：' +
              conditions.missing
                .map(function (row) {
                  return esc(row.label);
                })
                .join("、") +
              "</p>"
            : ""
        }
        <div class="pf-ai__condition-actions">
          <button type="button" data-message-action="continue">继续补充信息</button>
          <button type="button" class="is-primary" data-message-action="match">是，按当前条件匹配</button>
        </div>
      </div>
    `;
  }

  function renderRetrieval(payload) {
    payload = payload || {};
    var courses = payload.courses
      ? "<ul class=\"pf-ai__course-list\">" +
        payload.courses
          .map(function (name) {
            return "<li>" + esc(name) + "</li>";
          })
          .join("") +
        "</ul>"
      : "";
    var sessions = (payload.sessions || [])
      .map(function (row) {
        return (
          '<div class="pf-ai__record"><span>' +
          esc(row.status || "课务") +
          "</span><div><strong>" +
          esc(row.title || row.name) +
          "</strong><p>" +
          esc(row.city || row.loc || "") +
          " · " +
          esc(row.teacher) +
          "</p><time>" +
          esc(row.startsAt || row.time || "") +
          (row.endsAt ? " 至 " + esc(row.endsAt) : "") +
          "</time></div></div>"
        );
      })
      .join("");
    var goods = (payload.goods || [])
      .map(function (row) {
        return (
          "<li>" +
          esc(row.name) +
          " · " +
          esc(row.price) +
          " 元" +
          (row.budgetStatus === "over" ? "（超出本次预算，仅供了解）" : "") +
          "</li>"
        );
      })
      .join("");
    return (
      (courses || sessions || goods
        ? '<div class="pf-ai__records">' +
          sessions +
          (goods ? "<ul class=\"pf-ai__course-list\">" + goods + "</ul>" : "") +
          "</div>"
        : "") +
      courses +
      '<p class="pf-ai__mock-hint">以上为演示 Mock，生产由 Dify 智能体回传及课务/产品接口调整。</p>'
    );
  }

  function renderMatchQuestion() {
    return `
      <div class="pf-ai__match-question">
        <span>是否按当前信息匹配推荐产品？</span>
        <button type="button" data-message-action="continue">继续补充</button>
        <button type="button" data-message-action="match">立即匹配</button>
      </div>
    `;
  }

  function runIntent(intentId) {
    var intent = Mock.intents.find(function (row) {
      return row.id === intentId;
    });
    if (!intent) return;
    addMessage("user", intent.label, { intent: intentId });
    showTyping();
    var timer = setTimeout(function () {
      removeTyping();
      if (intentId === "interest") {
        var interest = Mock.getInterestAnalysis(memberId);
        addMessage(
          "ai",
          interest.title + "\n" + interest.summary,
          { kind: "interest", payload: interest },
        );
      } else if (intentId === "followup") {
        var followup = Mock.getFollowupAnalysis(memberId);
        addMessage(
          "ai",
          followup.title + "\n" + followup.summary,
          { kind: "followup", payload: followup },
        );
      } else {
        currentConditions = Mock.buildConditions(memberId, { text: "" });
        addMessage(
          "ai",
          "我可以先继续了解预算、课程方向和地点，也可以直接结合现有画像开始匹配。",
          { kind: "conditions", payload: currentConditions },
        );
      }
    }, 620);
    timers.push(timer);
  }

  function showTyping() {
    var root = document.getElementById("pfAiMessages");
    var typing = document.createElement("div");
    typing.id = "pfAiTyping";
    typing.className = "pf-ai__typing";
    typing.innerHTML = "<i></i><i></i><i></i><span>正在分析学员数据</span>";
    root.appendChild(typing);
    root.scrollTop = root.scrollHeight;
  }

  function removeTyping() {
    var typing = document.getElementById("pfAiTyping");
    if (typing) typing.remove();
  }

  function handleWorkerText(text) {
    latestInput = text;
    if (/模拟匹配失败/.test(text)) forceFailureNext = true;
    replyPending = true;
    renderFollowUps();
    var routed = Core.routeUtterance(text);
    if (routed.type === "intent") {
      runIntent(routed.id);
      return;
    }
    if (routed.type === "retrieval") {
      runRetrieval(routed.id, text);
      return;
    }
    if (routed.type === "product-detail") {
      runProductDetail(routed.id, text);
      return;
    }
    addMessage("user", text, { intent: "free" });
    showTyping();
    var timer = setTimeout(function () {
      removeTyping();
      currentConditions = Mock.buildConditions(memberId, { text: text });
      var hasVersions = currentSession.matchVersions.length > 0;
      addMessage(
        "ai",
        hasVersions
          ? "已记录新增信息。是否按新增条件重新匹配产品？"
          : "已整理本轮补充信息。你可以继续补充，或按当前条件开始匹配。",
        { kind: "conditions", payload: currentConditions },
      );
    }, 540);
    timers.push(timer);
  }

  function runRetrieval(id, text) {
    addMessage("user", text, { intent: id });
    showTyping();
    var timer = setTimeout(function () {
      removeTyping();
      var answer = Mock.getRetrievalAnswer(id);
      addMessage("ai", answer.title + "\n" + answer.summary, {
        kind: "retrieval",
        payload: answer,
      });
    }, 620);
    timers.push(timer);
  }

  function runProductDetail(id, text) {
    addMessage("user", text, { intent: id });
    showTyping();
    var timer = setTimeout(function () {
      removeTyping();
      var answer = Mock.getProductDetailAnswer(currentSession, id);
      addMessage("ai", answer.title + "\n" + answer.summary, {
        kind: "product-detail",
        payload: answer,
      });
    }, 520);
    timers.push(timer);
  }

  function handleMessageAction(event) {
    var action = event.target.closest("[data-message-action]");
    if (!action) return;
    if (action.getAttribute("data-message-action") === "continue") {
      document.getElementById("pfAiInput").focus();
      return;
    }
    if (!currentConditions) {
      currentConditions = Mock.buildConditions(memberId, {
        text: latestInput,
      });
    }
    runMatching(forceFailureNext);
    forceFailureNext = false;
  }

  function renderResult() {
    var root = document.getElementById("pfAiResult");
    if (!root) return;
    var versions = currentSession.matchVersions || [];
    if (!versions.length) {
      root.innerHTML = `
        <div class="pf-ai__result-empty">
          <span class="pf-ai__result-icon">AI</span>
          <h2>课程产品推荐</h2>
          <p>助手收集并确认条件后，这里将展示主推产品、备选产品、课务期数和商品资料。</p>
          <button type="button" data-result-action="demo-failure">演示匹配失败与兜底</button>
        </div>
      `;
      return;
    }
    var active =
      versions.find(function (row) {
        return row.id === currentViewVersionId;
      }) || versions[versions.length - 1];
    currentViewVersionId = active.id;
    renderResultList(active);
  }

  function renderMatchingAnimation() {
    var root = document.getElementById("pfAiResult");
    root.innerHTML = `
      <div class="pf-ai__matching">
        <div class="pf-ai__matching-head">
          <div><span>AI MATCHING</span><h2>智能匹配进行中</h2></div>
          <strong id="pfAiMatchingStatus">正在汇聚多源学员信号</strong>
        </div>
        <div class="pf-ai__fusion">
          <div class="pf-ai__source pf-ai__source--1"><strong>用户标签</strong><span>兴趣 · 层级 · 活跃度</span></div>
          <div class="pf-ai__source pf-ai__source--2"><strong>过往跟进</strong><span>${esc(
            String((detail.follows || []).length),
          )} 条沟通记录</span></div>
          <div class="pf-ai__source pf-ai__source--3"><strong>行为埋点</strong><span>浏览 · 学习 · 视频 · 直播</span></div>
          <div class="pf-ai__source pf-ai__source--4"><strong>报读购买</strong><span>资格 · 期数 · 学习历史</span></div>
          <i class="pf-ai__beam pf-ai__beam--1"></i><i class="pf-ai__beam pf-ai__beam--2"></i>
          <i class="pf-ai__beam pf-ai__beam--3"></i><i class="pf-ai__beam pf-ai__beam--4"></i>
          <div class="pf-ai__core">AI 数据核心<small>画像信号聚合中</small></div>
        </div>
        <div class="pf-ai__pipeline">
          <div class="pf-ai__pipeline-title"><strong>可解释匹配阶段</strong><span>原型约 8 秒完成</span></div>
          <div class="pf-ai__steps">
            ${[
              ["01", "理解当前需求"],
              ["02", "归纳学员画像"],
              ["03", "检索产品与课务"],
              ["04", "预算与SKU硬校验"],
              ["05", "核对事业说明会意向"],
              ["06", "综合排序生成依据"],
            ]
              .map(function (row) {
                return `<div class="pf-ai__step"><b>${row[0]}</b><span>${row[1]}</span></div>`;
              })
              .join("")}
          </div>
          <div class="pf-ai__proof">
            <span>标签信号 ${esc(String((detail.systemTags || []).length))} 项</span>
            <span>跟进记录 ${esc(String((detail.follows || []).length))} 条</span>
            <span>行为事件 36 条</span><span>候选产品 19 个</span>
          </div>
        </div>
      </div>
    `;
  }

  function runMatching(forceFailure) {
    clearTimers();
    matchingActive = true;
    renderFollowUps();
    renderMatchingAnimation();
    var statuses = [
      "正在汇聚多源学员信号",
      "正在理解当前诉求",
      "正在归纳用户标签与历史跟进",
      "正在检索课程产品、课务和商品",
      "正在执行预算硬校验",
      "正在核对事业说明会意向登记",
      "正在生成推荐依据",
    ];
    var stage = 0;
    var statusTimer = setInterval(function () {
      stage = Math.min(stage + 1, statuses.length - 1);
      var element = document.getElementById("pfAiMatchingStatus");
      if (element) element.textContent = statuses[stage];
    }, 1380);
    timers.push(statusTimer);
    var finishTimer = setTimeout(function () {
      clearInterval(statusTimer);
      var result = Mock.match(
        memberId,
        currentConditions || { text: latestInput },
        { forceFailure: !!forceFailure },
      );
      var status = result.isFallback ? "fallback" : "success";
      var version = Core.createMatchVersion(
        currentSession,
        result.conditions,
        result.products,
        nowIso(),
        status,
        {
          giftPackages: result.giftPackages || [],
          careerIntent: result.careerIntent || { intendedDirection: "" },
        },
      );
      version.label = result.label;
      currentViewVersionId = version.id;
      persistSessions();
      matchingActive = false;
      renderMessages();
      renderFollowUps();
      renderDemoRail();
      renderResultList(version);
      renderHistory();
    }, 8400);
    timers.push(finishTimer);
  }

  function versionBar(active) {
    var versions = currentSession.matchVersions || [];
    return `
      <div class="pf-ai__version-bar">
        <span>推荐版本</span>
        <div>${versions
          .map(function (row, index) {
            return `<button type="button" class="${
              row.id === active.id ? "is-active" : ""
            }" data-version-id="${esc(row.id)}">第${index + 1}次</button>`;
          })
          .join("")}</div>
        <time>数据截至 ${esc(active.dataAsOf || formatTime(active.createdAt))}</time>
      </div>
    `;
  }

  function relationLabel(status) {
    if (status === "qualified") return "已购买 · 拥有资格未报读";
    if (status === "enrolled") return "已报读 · 可建议未来复训";
    return "未购买未报读";
  }

  function renderGiftSection(version) {
    var gifts = version.giftPackages || [];
    if (!gifts.length) return "";
    var direction =
      (version.careerIntent && version.careerIntent.intendedDirection) || "";
    return `
      <div class="pf-ai__gift">
        <div class="pf-ai__results-head pf-ai__results-head--gift">
          <div><span>GIFT PACKAGE</span><h2>礼包权益推荐</h2></div>
          <strong>依据意向了解方向：${esc(direction)}</strong>
        </div>
        <p class="pf-ai__gift-note">与上方课程产品分区；仅当事业说明会登记导师或天使意向时展示。无礼包意向不出现本区域。</p>
        <div class="pf-ai__gift-list">
          ${gifts
            .map(function (gift, index) {
              var offline =
                (gift.qualifications && gift.qualifications.offline) || [];
              var marketTotal = offline.reduce(function (sum, row) {
                return sum + (Number(row.marketPrice) || 0);
              }, 0);
              return `
                <article class="pf-ai__product pf-ai__product--gift">
                  <span class="pf-ai__rank pf-ai__rank--gift">礼包 ${index + 1}</span>
                  <div class="pf-ai__product-cover pf-ai__product-cover--gift" role="img" aria-label="礼包权益">礼包</div>
                  <div class="pf-ai__product-main">
                    <div class="pf-ai__product-title"><h3>${esc(
                      gift.giftName,
                    )}</h3><strong>${esc(formatGiftPrice(gift.price))}</strong></div>
                    <p>${esc(gift.description || "")}</p>
                    <div class="pf-ai__product-tags">
                      <span>${esc(gift.upgradeMethod)}</span>
                      <span>${esc(gift.type)} · ${esc(gift.levelName)}</span>
                      <span>线下课 ${offline.length} 门</span>
                      <span>市场价 ${esc(formatGiftPrice(marketTotal))}</span>
                      <span>${gift.deposit ? "定金 " + formatGiftPrice(gift.depositAmount) : "不支持定金"}</span>
                      <span>${gift.installment ? "支持分期" : "不支持分期"}</span>
                    </div>
                    <ul>${(gift.reasons || [])
                      .map(function (reason) {
                        return "<li>" + esc(reason) + "</li>";
                      })
                      .join("")}</ul>
                  </div>
                  <button type="button" class="pf-ai__detail-btn" data-gift-id="${esc(
                    gift.giftId,
                  )}">查看礼包资料</button>
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function renderResultList(version) {
    var root = document.getElementById("pfAiResult");
    var fallback =
      version.status === "fallback"
        ? '<div class="pf-ai__fallback"><strong>兜底参考 · 非智能匹配</strong><span>智能匹配失败，以下为预算内兜底产品，可重新匹配。</span><button type="button" data-result-action="retry">重新匹配</button></div>'
        : "";
    root.innerHTML = `
      <div class="pf-ai__results">
        ${versionBar(version)}
        ${fallback}
        <div class="pf-ai__results-head">
          <div><span>AI RECOMMENDATION</span><h2>课程产品推荐</h2></div>
          <strong>${esc(String(version.confidence))}% 条件置信度</strong>
        </div>
        <div class="pf-ai__product-list">
          ${version.products
            .map(function (product, index) {
              var fitGoods = product.goods.filter(function (good) {
                return good.budgetStatus === "fit";
              });
              return `
                <article class="pf-ai__product">
                  <span class="pf-ai__rank">TOP ${index + 1}</span>
                  <div class="pf-ai__product-cover" role="img" aria-label="课程封面"></div>
                  <div class="pf-ai__product-main">
                    <div class="pf-ai__product-title"><h3>${esc(
                      product.productName,
                    )}</h3><strong>${esc(String(product.matchPercent))}% 匹配</strong></div>
                    <p>${esc(product.description)}</p>
                    <div class="pf-ai__product-tags">
                      <span>符合预算商品 ${fitGoods.length} 个</span>
                      <span>${esc(relationLabel(product.relationStatus))}</span>
                      <span>近期课务 ${product.sessions.length} 期</span>
                    </div>
                    <ul>${product.reasons
                      .map(function (reason) {
                        return "<li>" + esc(reason) + "</li>";
                      })
                      .join("")}</ul>
                  </div>
                  <button type="button" class="pf-ai__detail-btn" data-product-id="${esc(
                    product.productId,
                  )}">查看完整资料</button>
                </article>
              `;
            })
            .join("")}
        </div>
        ${renderGiftSection(version)}
      </div>
    `;
  }

  function renderProductDetail(productId) {
    var versions = currentSession.matchVersions || [];
    var active =
      versions.find(function (row) {
        return row.id === currentViewVersionId;
      }) || versions[versions.length - 1];
    var product = active.products.find(function (row) {
      return row.productId === productId;
    });
    if (!product) return;
    var root = document.getElementById("pfAiResult");
    root.innerHTML = `
      <div class="pf-ai__detail">
        <button type="button" class="pf-ai__back" data-result-action="back">← 返回推荐列表</button>
        <header class="pf-ai__detail-head">
          <div class="pf-ai__detail-cover" role="img" aria-label="课程封面"></div>
          <div><span>${esc(product.series)}</span><h2>${esc(
            product.productName,
          )}</h2><p>${esc(relationLabel(product.relationStatus))}</p></div>
          <strong>${esc(String(product.matchPercent))}% 匹配</strong>
        </header>
        <section class="pf-ai__detail-section">
          <h3>课程产品介绍</h3><p>${esc(product.description)}</p>
        </section>
        <section class="pf-ai__detail-section">
          <div class="pf-ai__section-head"><h3>当前及未来课务期数</h3><span>同城优先 · 3期</span></div>
          <div class="pf-ai__session-list">
            ${product.sessions
              .map(function (row) {
                return `
                  <article class="pf-ai__session-card">
                    <div class="pf-ai__session-cover" role="img" aria-label="会务期数封面">
                      <span class="pf-ai__session-city">${esc(row.city.replace("市", ""))}</span>
                    </div>
                    <div><strong>${esc(row.title)}</strong><p>授课导师：${esc(
                      row.teacher,
                    )}</p><time>开课时间：${esc(
                      row.startsAtLabel || row.startsAt,
                    )} 至 ${esc(row.endsAt)}</time></div>
                    <span class="pf-ai__session-status">${esc(row.status)}</span>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
        <section class="pf-ai__detail-section">
          <div class="pf-ai__section-head"><h3>课程产品商品</h3><span>全部 SKU</span></div>
          <div class="pf-ai__goods">
            ${product.goods
              .map(function (good) {
                return `
                  <div class="pf-ai__good">
                    <div><strong>${esc(good.name)}</strong><span>${esc(
                      good.form,
                    )}</span></div>
                    <b>¥${esc(String(good.numericPrice))}</b>
                    <em class="pf-ai__budget pf-ai__budget--${esc(
                      good.budgetStatus,
                    )}">${
                      good.budgetStatus === "fit"
                        ? "符合预算"
                        : "超出本次预算，仅供了解"
                    }</em>
                  </div>
                `;
              })
              .join("")}
          </div>
        </section>
      </div>
    `;
  }

  function giftCourseSum(rows) {
    var market = 0;
    var settlement = 0;
    (rows || []).forEach(function (row) {
      market += Number(row.marketPrice) || 0;
      settlement += Number(row.settlementPrice) || 0;
    });
    return { market: market, settlement: settlement, count: (rows || []).length };
  }

  function renderGiftCourseTable(rows) {
    if (!rows || !rows.length) {
      return '<p class="pf-ai__gift-empty">该分类暂无课程权益</p>';
    }
    var sum = giftCourseSum(rows);
    return `
      <div class="pf-ai__gift-table-wrap">
        <table class="pf-ai__gift-table">
          <thead>
            <tr>
              <th>产品名称</th>
              <th>产品编码</th>
              <th>类别</th>
              <th>券类型</th>
              <th>数量</th>
              <th>市场价/原价</th>
              <th>核算价格</th>
              <th>有效期</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(function (row) {
                return `
                  <tr>
                    <td>${esc(row.name)}</td>
                    <td>${esc(row.code)}</td>
                    <td>${esc(row.category)}</td>
                    <td>${esc(row.voucherType)}</td>
                    <td>${esc(String(row.quantity))}</td>
                    <td>${esc(formatGiftPrice(row.marketPrice))}</td>
                    <td>${esc(formatGiftPrice(row.settlementPrice))}</td>
                    <td>${esc(row.validity)}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5">合计</td>
              <td>${esc(formatGiftPrice(sum.market))}</td>
              <td>${esc(formatGiftPrice(sum.settlement))}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  function renderGiftDetail(giftId, tab) {
    var versions = currentSession.matchVersions || [];
    var active =
      versions.find(function (row) {
        return row.id === currentViewVersionId;
      }) || versions[versions.length - 1];
    var gift = (active.giftPackages || []).find(function (row) {
      return row.giftId === giftId;
    });
    if (!gift) return;
    var quals = gift.qualifications || { offline: [], online: [], camp: [] };
    var activeTab = tab || "offline";
    if (!quals[activeTab]) activeTab = "offline";
    var tabRows = quals[activeTab] || [];
    var tabs = [
      { id: "offline", label: "线下课", count: (quals.offline || []).length },
      { id: "online", label: "线上课", count: (quals.online || []).length },
      { id: "camp", label: "领袖营课程", count: (quals.camp || []).length },
    ];
    var root = document.getElementById("pfAiResult");
    root.innerHTML = `
      <div class="pf-ai__detail pf-ai__detail--gift">
        <button type="button" class="pf-ai__back" data-result-action="back">← 返回推荐列表</button>
        <header class="pf-ai__detail-head">
          <div class="pf-ai__product-cover pf-ai__product-cover--gift" role="img" aria-label="礼包权益">礼包</div>
          <div><span>礼包权益 · ${esc(gift.type)}</span><h2>${esc(
            gift.giftName,
          )}</h2><p>意向了解方向：${esc(
            (active.careerIntent && active.careerIntent.intendedDirection) || "—",
          )}</p></div>
          <strong>${esc(formatGiftPrice(gift.price))}</strong>
        </header>
        <section class="pf-ai__detail-section">
          <h3>礼包说明</h3><p>${esc(gift.description || "")}</p>
        </section>
        <section class="pf-ai__detail-section">
          <h3>基础信息</h3>
          <dl class="pf-ai__gift-meta">
            <div><dt>活动时间</dt><dd>${esc(gift.activityStart || "—")} 至 ${esc(
              gift.activityEnd || "—",
            )}</dd></div>
            <div><dt>类型</dt><dd>${esc(gift.type)}</dd></div>
            <div><dt>级别</dt><dd>${esc(gift.levelFullName || gift.levelName)}</dd></div>
            <div><dt>购买金额</dt><dd>${esc(formatGiftPrice(gift.price))}</dd></div>
            <div><dt>是否支持分期</dt><dd>${gift.installment ? "支持" : "不支持"}</dd></div>
            <div><dt>是否支持定金</dt><dd>${gift.deposit ? "支持" : "不支持"}</dd></div>
            <div><dt>定金金额</dt><dd>${
              gift.deposit ? esc(formatGiftPrice(gift.depositAmount)) : "—"
            }</dd></div>
            <div><dt>升级方式</dt><dd>${esc(gift.upgradeMethod)}</dd></div>
          </dl>
        </section>
        <section class="pf-ai__detail-section">
          <div class="pf-ai__section-head"><h3>资格权益</h3><span>与课程产品 SKU 区分</span></div>
          <div class="pf-ai__gift-tabs" role="tablist">
            ${tabs
              .map(function (row) {
                return `<button type="button" role="tab" class="pf-ai__gift-tab${
                  row.id === activeTab ? " is-active" : ""
                }" data-gift-tab="${esc(row.id)}" data-gift-detail-id="${esc(
                  gift.giftId,
                )}" aria-selected="${row.id === activeTab ? "true" : "false"}">${esc(
                  row.label,
                )} (${row.count})</button>`;
              })
              .join("")}
          </div>
          ${renderGiftCourseTable(tabRows)}
        </section>
        <section class="pf-ai__detail-section">
          <div class="pf-ai__section-head"><h3>TOP公益项目</h3><span>${esc(
            String(gift.topPublicWelfare == null ? 0 : gift.topPublicWelfare),
          )} 项</span></div>
          <p class="pf-ai__gift-empty">当前礼包未配置公益项目</p>
        </section>
        <section class="pf-ai__detail-section">
          <h3>其他权益</h3>
          <div class="pf-ai__gift-extras">
            ${(gift.otherBenefits || [])
              .map(function (row) {
                return `
                  <article class="pf-ai__gift-extra">
                    <strong>${esc(row.name)}</strong>
                    <time>创建时间 ${esc(row.createdAt || "—")}</time>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      </div>
    `;
  }

  function handleResultAction(event) {
    var tabButton = event.target.closest("[data-gift-tab]");
    if (tabButton) {
      renderGiftDetail(
        tabButton.getAttribute("data-gift-detail-id"),
        tabButton.getAttribute("data-gift-tab"),
      );
      return;
    }
    var giftButton = event.target.closest("[data-gift-id]");
    if (giftButton) {
      renderGiftDetail(giftButton.getAttribute("data-gift-id"));
      return;
    }
    var productButton = event.target.closest("[data-product-id]");
    if (productButton) {
      renderProductDetail(productButton.getAttribute("data-product-id"));
      return;
    }
    var versionButton = event.target.closest("[data-version-id]");
    if (versionButton) {
      currentViewVersionId = versionButton.getAttribute("data-version-id");
      renderResult();
      return;
    }
    var action = event.target.closest("[data-result-action]");
    if (!action) return;
    var value = action.getAttribute("data-result-action");
    if (value === "back") renderResult();
    if (value === "retry") runMatching(false);
    if (value === "demo-failure") {
      currentConditions = Mock.buildConditions(memberId, { text: "" });
      runMatching(true);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
