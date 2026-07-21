(function (root) {
  function memberLabel(member) {
    return member.nickname || member.name || member.role || '家庭成员';
  }

  function createMeetingFlow({
    meetingTypes,
    engine,
    store,
    app,
    now = Date.now,
    random = Math.random,
  }) {
    function getState() {
      return store.load();
    }

    function renderHub(container) {
      const state = getState();
      if (!state.family) {
        container.innerHTML = `
          <div class="meeting-empty">
            <div class="meeting-empty__icon" aria-hidden="true">⌂</div>
            <h1>先邀请家人加入</h1>
            <p>建立家庭后，就可以一起选择议题并开始会议。</p>
            <button class="family-button family-button--primary" type="button" data-meeting-action="go-family">去「我的家庭」</button>
          </div>
        `;
        container.querySelector('[data-meeting-action="go-family"]')
          .addEventListener('click', () => app.showView('family'));
        return;
      }

      container.innerHTML = `
        <div class="meeting-flow">
          <p class="view-panel__eyebrow">选择会议类型</p>
          <h1>今天想和家人聊什么？</h1>
          <p class="meeting-flow__lead">不同类型会提供不同的沟通节奏。</p>
          <div class="meeting-type-grid">
            ${meetingTypes.TYPES.map((type) => `
              <button class="meeting-type-card" type="button" data-type-id="${type.id}" style="--type-color: ${type.color}">
                <span class="meeting-type-card__number">${type.id}</span>
                <strong>${type.name}</strong>
                <span>${type.purpose}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelectorAll('[data-type-id]').forEach((button) => {
        button.addEventListener('click', () => {
          if (button.dataset.typeId === '04') {
            renderPrep(container, { typeId: '04', topicId: null });
          } else {
            renderTopics(container, button.dataset.typeId);
          }
        });
      });
    }

    function renderTopics(container, typeId) {
      const type = meetingTypes.TYPES.find((candidate) => candidate.id === typeId);
      const topics = meetingTypes.topicsFor(typeId);
      if (!type) {
        renderHub(container);
        return;
      }

      container.innerHTML = `
        <div class="meeting-flow">
          <button class="meeting-back" type="button" data-meeting-action="back-types">← 返回类型</button>
          <p class="view-panel__eyebrow">${type.name}</p>
          <h1>选择本次议题</h1>
          <div class="meeting-topic-list">
            ${topics.map((topic) => `
              <button class="meeting-topic-card" type="button" data-topic-id="${topic.id}">
                <strong>${topic.title}</strong><span aria-hidden="true">→</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelector('[data-meeting-action="back-types"]')
        .addEventListener('click', () => renderHub(container));
      container.querySelectorAll('[data-topic-id]').forEach((button) => {
        button.addEventListener('click', () => {
          renderPrep(container, { typeId, topicId: button.dataset.topicId });
        });
      });
    }

    function renderPrep(container, { typeId, topicId }) {
      const state = getState();
      if (!state.family) {
        renderHub(container);
        return;
      }

      const type = meetingTypes.TYPES.find((candidate) => candidate.id === typeId);
      const topic = meetingTypes.topicsFor(typeId).find((candidate) => candidate.id === topicId);
      if (!type || (typeId !== '04' && !topic)) {
        renderHub(container);
        return;
      }

      const members = state.family.members || [];
      const defaultHostId = members.some((member) => member.id === state.family.defaultHostId)
        ? state.family.defaultHostId
        : '';
      const topicTitle = typeId === '04' ? '冲突后修复 · 无议题' : topic.title;

      container.innerHTML = `
        <div class="meeting-flow">
          <button class="meeting-back" type="button" data-meeting-action="back">← 返回</button>
          <p class="view-panel__eyebrow">会前准备</p>
          <h1>${type.name}</h1>
          <div class="meeting-prep__topic">${topicTitle}</div>
          <section class="meeting-prep__section">
            <h2>参会成员</h2>
            <div class="meeting-member-list">
              ${members.map((member) => `<span>${memberLabel(member)}</span>`).join('')}
            </div>
          </section>
          <fieldset class="meeting-host-list">
            <legend>选择主持人</legend>
            ${members.map((member) => `
              <label>
                <input type="radio" name="meeting-host" value="${member.id}" ${member.id === defaultHostId ? 'checked' : ''}>
                <span>${memberLabel(member)}</span>
              </label>
            `).join('')}
          </fieldset>
          <p class="meeting-flow__error" data-meeting-error aria-live="polite"></p>
          <button class="family-button family-button--primary meeting-start" type="button" data-meeting-action="start">开始会议</button>
        </div>
      `;

      container.querySelector('[data-meeting-action="back"]').addEventListener('click', () => {
        if (typeId === '04') renderHub(container);
        else renderTopics(container, typeId);
      });
      container.querySelector('[data-meeting-action="start"]').addEventListener('click', () => {
        const selectedHost = container.querySelector('input[name="meeting-host"]:checked');
        if (!selectedHost) {
          container.querySelector('[data-meeting-error]').textContent = '请选择主持人';
          return;
        }
        startMeeting({ typeId, topicId, hostId: selectedHost.value });
      });
    }

    function startMeeting({ typeId, topicId, hostId }) {
      const state = getState();
      const members = state.family?.members || [];
      if (!hostId || !members.some((member) => member.id === hostId)) {
        throw new Error('请选择主持人');
      }

      const createdAt = now();
      const meeting = {
        id: `meeting-${createdAt}-${random().toString(36).slice(2, 6)}`,
        typeId,
        topicId: topicId || null,
        hostId,
        memberIds: members.map((member) => member.id),
        status: 'active',
        step: 'opening',
        moodRoundDone: typeId !== '04',
        transcript: [],
        whiteboard: { strokes: [] },
        insights: null,
        actionPlan: null,
        createdAt,
      };
      const nextState = {
        ...state,
        meetings: [...(state.meetings || []), meeting],
        draftMeeting: meeting,
        activeMeetingId: meeting.id,
      };
      store.save(nextState);
      app.replaceState?.(nextState);
      app.showView('meeting-room');
      return meeting;
    }

    function activeMeeting(state) {
      return (state.meetings || []).find((meeting) => meeting.id === state.activeMeetingId)
        || state.draftMeeting
        || null;
    }

    function saveMeeting(meeting) {
      const state = getState();
      const nextState = {
        ...state,
        meetings: (state.meetings || []).map((candidate) => (
          candidate.id === meeting.id ? meeting : candidate
        )),
        draftMeeting: meeting,
      };
      store.save(nextState);
      app.replaceState?.(nextState);
    }

    function renderRoom(container) {
      const state = getState();
      const meeting = activeMeeting(state);
      if (!meeting || meeting.status !== 'active') {
        container.innerHTML = '<p>当前没有进行中的会议。</p>';
        return;
      }

      const members = state.family?.members || [];
      const host = members.find((member) => member.id === meeting.hostId);
      const currentMember = app.getCurrentMember?.();
      const isHost = currentMember?.id === meeting.hostId;
      const type = meetingTypes.TYPES.find((candidate) => candidate.id === meeting.typeId);
      const stepIndex = engine.STEPS.indexOf(meeting.step);
      const advance = engine.canAdvance(meeting);
      const showMoodButton = meeting.typeId === '04'
        && meeting.step === 'opening'
        && !meeting.moodRoundDone;

      container.innerHTML = `
        <div class="meeting-room">
          <p class="view-panel__eyebrow">会议进行中 · ${type?.name || ''}</p>
          <ol class="meeting-steps" aria-label="会议步骤">
            ${engine.STEPS.map((step, index) => `
              <li class="${index === stepIndex ? 'is-active' : ''} ${index < stepIndex ? 'is-done' : ''}">
                <span>${index + 1}</span>${step}
              </li>
            `).join('')}
          </ol>
          <section class="meeting-room__guide">
            <h1>${meeting.step}</h1>
            <p>${meetingTypes.copyFor(meeting.typeId, meeting.step)}</p>
          </section>
          ${showMoodButton && isHost ? `
            <button class="family-button meeting-mood-button" type="button" data-meeting-room-action="complete-mood">
              结束心情回合
            </button>
          ` : ''}
          ${isHost ? `
            <div class="meeting-room__controls">
              <button class="family-button family-button--ghost" type="button" data-meeting-room-action="prev" ${stepIndex <= 0 ? 'disabled' : ''}>上一步</button>
              <button class="family-button family-button--primary" type="button" data-meeting-room-action="next" ${advance.ok ? '' : 'disabled'}>下一步</button>
            </div>
            ${!advance.ok && advance.reason ? `<p class="meeting-room__gate">${advance.reason}</p>` : ''}
          ` : `<p class="meeting-room__host">当前由 ${memberLabel(host)} 主持</p>`}
        </div>
      `;

      if (!isHost) return;
      container.querySelector('[data-meeting-room-action="prev"]')?.addEventListener('click', () => {
        saveMeeting(engine.prev(meeting));
      });
      container.querySelector('[data-meeting-room-action="next"]')?.addEventListener('click', () => {
        saveMeeting(engine.next(meeting));
      });
      container.querySelector('[data-meeting-room-action="complete-mood"]')?.addEventListener('click', () => {
        saveMeeting(engine.completeMoodRound(meeting));
      });
    }

    return {
      renderHub,
      renderTopics,
      renderPrep,
      renderRoom,
      startMeeting,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createMeetingFlow };
  }

  if (root) {
    root.createMeetingFlow = createMeetingFlow;
  }
}(typeof window !== 'undefined' ? window : globalThis));
