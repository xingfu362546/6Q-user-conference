(function (root) {
  function memberLabel(member) {
    return member.nickname || member.name || member.role || '家庭成员';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function createMeetingFlow({
    meetingTypes,
    engine,
    transcript,
    whiteboard,
    distill,
    consensus,
    todos,
    store,
    app,
    now = Date.now,
    random = Math.random,
  }) {
    let latestWhiteboardCanvas = null;

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
      const hasHost = Boolean(defaultHostId);

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
          <p class="meeting-flow__error" data-meeting-error aria-live="polite">${hasHost ? '' : '请先指定一位主持人，才能开始会议。'}</p>
          <button class="family-button family-button--primary meeting-start" type="button" data-meeting-action="start" ${hasHost ? '' : 'disabled'}>开始会议</button>
        </div>
      `;

      container.querySelector('[data-meeting-action="back"]').addEventListener('click', () => {
        if (typeId === '04') renderHub(container);
        else renderTopics(container, typeId);
      });
      const startButton = container.querySelector('[data-meeting-action="start"]');
      container.querySelectorAll('input[name="meeting-host"]').forEach((radio) => {
        radio.addEventListener('change', () => {
          startButton.disabled = false;
          container.querySelector('[data-meeting-error]').textContent = '';
        });
      });
      startButton.addEventListener('click', () => {
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
      if (!state.family) throw new Error('请先创建或加入家庭');
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
      const storedMeeting = (state.meetings || []).find(
        (candidate) => candidate.id === meeting.id,
      );
      const mergedMeeting = storedMeeting
        ? {
          ...storedMeeting,
          ...meeting,
          transcript: Array.isArray(storedMeeting.transcript)
            ? storedMeeting.transcript
            : (meeting.transcript || []),
        }
        : meeting;
      const nextState = {
        ...state,
        meetings: (state.meetings || []).map((candidate) => (
          candidate.id === mergedMeeting.id ? mergedMeeting : candidate
        )),
        draftMeeting: mergedMeeting,
      };
      store.save(nextState);
      app.replaceState?.(nextState);
    }

    function archiveMeeting(meeting) {
      const archivedMeeting = engine.archive(meeting, now());
      const state = getState();
      const nextState = {
        ...state,
        meetings: (state.meetings || []).map((candidate) => (
          candidate.id === archivedMeeting.id ? archivedMeeting : candidate
        )),
        draftMeeting: archivedMeeting,
        activeMeetingId: null,
      };
      store.save(nextState);
      app.replaceState?.(nextState);
      app.showView('review');
      return archivedMeeting;
    }

    function initialActionPlan(meeting) {
      if (meeting.actionPlan) return meeting.actionPlan;
      const candidates = (meeting.insights?.core || []).map((insight, index) => ({
        id: `action-${index + 1}`,
        title: insight.text,
        assigneeId: meeting.hostId,
        dueText: '',
      }));
      return {
        candidates,
        selectedIds: candidates.map((candidate) => candidate.id),
        agreedTime: '',
        votes: {},
        memberIds: [...(meeting.memberIds || [])],
        locked: false,
        votingStarted: false,
      };
    }

    function renderConsensusPanel(panel, meeting, members, isHost) {
      const plan = initialActionPlan(meeting);
      const tally = consensus.tally(plan, meeting.memberIds || []);
      const voteGate = consensus.canStartVote(plan);
      const currentMember = app.getCurrentMember?.();
      const currentVote = plan.votes?.[currentMember?.id];
      const memberName = (memberId) => memberLabel(
        members.find((member) => member.id === memberId) || { nickname: memberId },
      );

      panel.innerHTML = `
        <section class="consensus">
          <div class="consensus__heading">
            <div>
              <p class="view-panel__eyebrow">全家一致才生效</p>
              <h2>共同行动</h2>
            </div>
            <span>${Object.keys(plan.votes || {}).length}/${meeting.memberIds.length} 已投票</span>
          </div>
          <div class="consensus__candidates">
            ${(plan.candidates || []).map((candidate) => `
              <article>
                <label class="consensus__choice">
                  <input type="checkbox" data-consensus-select="${candidate.id}" ${(plan.selectedIds || []).includes(candidate.id) ? 'checked' : ''} ${isHost && !plan.locked ? '' : 'disabled'}>
                  <strong>${escapeHtml(candidate.title)}</strong>
                </label>
                <label>负责人
                  <select data-consensus-assignee="${candidate.id}" ${isHost && !plan.locked ? '' : 'disabled'}>
                    ${members.map((member) => `<option value="${member.id}" ${candidate.assigneeId === member.id ? 'selected' : ''}>${escapeHtml(memberLabel(member))}</option>`).join('')}
                  </select>
                </label>
                ${isHost && !plan.locked ? `<button type="button" data-consensus-remove="${candidate.id}">删除</button>` : ''}
              </article>
            `).join('') || '<p class="todo-empty">请先添加行动候选</p>'}
          </div>
          ${isHost && !plan.locked ? `
            <div class="consensus__add">
              <input type="text" data-consensus-new placeholder="新增行动候选" maxlength="100">
              <button type="button" data-consensus-action="add">添加</button>
            </div>
          ` : ''}
          <label class="consensus__time">统一时间
            <input type="text" data-consensus-time value="${escapeHtml(plan.agreedTime || '')}" placeholder="如：周六 10:00" ${isHost && !plan.locked ? '' : 'disabled'}>
          </label>
          <div class="consensus__progress">
            ${members.map((member) => {
              const vote = plan.votes?.[member.id];
              const state = tally.rejected.includes(member.id) ? '反对' : vote ? '同意' : '待投';
              return `<span class="${state === '同意' ? 'is-approved' : state === '反对' ? 'is-rejected' : ''}">${escapeHtml(memberLabel(member))} · ${state}</span>`;
            }).join('')}
          </div>
          ${tally.rejected.length ? `<p class="consensus__warning">${tally.rejected.map(memberName).join('、')} 反对，主持人可修改方案后重新投票。</p>` : ''}
          ${!isHost && !voteGate.ok ? '<p class="consensus__warning">等待主持人完成行动构成与统一时间。</p>' : ''}
          ${isHost && !plan.votingStarted && !plan.locked
            ? `<p class="consensus__gate ${voteGate.ok ? 'is-valid' : ''}">${escapeHtml(voteGate.ok ? '行动构成与统一时间已就绪' : voteGate.reason)}</p>
              <button class="family-button family-button--primary" type="button" data-consensus-action="start-vote" ${voteGate.ok ? '' : 'disabled'}>发起投票</button>`
            : ''}
          ${plan.votingStarted && plan.selectedIds.length && plan.agreedTime && !plan.locked ? `
            <div class="consensus__vote">
              <button class="family-button family-button--primary" type="button" data-consensus-vote="approve">${currentVote?.choice === 'approve' ? '已同意' : '同意'}</button>
              <button class="family-button family-button--ghost" type="button" data-consensus-vote="reject">${currentVote?.choice === 'reject' ? '已反对' : '反对'}</button>
            </div>
          ` : ''}
          ${isHost && !plan.locked ? '<button class="meeting-back" type="button" data-consensus-action="skip">本场无行动</button>' : ''}
        </section>
      `;

      function savePlan(nextPlan) {
        saveMeeting({ ...meeting, actionPlan: nextPlan });
      }

      panel.querySelector('[data-consensus-action="add"]')?.addEventListener('click', () => {
        const input = panel.querySelector('[data-consensus-new]');
        if (!input?.value.trim()) return;
        savePlan(consensus.createCandidate(plan, {
          title: input.value,
          assigneeId: meeting.hostId,
        }));
      });
      panel.querySelectorAll('[data-consensus-remove]').forEach((button) => {
        button.addEventListener('click', () => savePlan(
          consensus.removeCandidate(plan, button.dataset.consensusRemove),
        ));
      });
      const saveSelection = () => {
        const selectedIds = [...panel.querySelectorAll('[data-consensus-select]:checked')]
          .map((input) => input.dataset.consensusSelect);
        let nextPlan = {
          ...plan,
          candidates: plan.candidates.map((candidate) => {
            const select = panel.querySelector(`[data-consensus-assignee="${candidate.id}"]`);
            return { ...candidate, assigneeId: select?.value || candidate.assigneeId };
          }),
        };
        nextPlan = consensus.setSelection(
          nextPlan,
          selectedIds,
          panel.querySelector('[data-consensus-time]')?.value,
        );
        savePlan(nextPlan);
      };
      panel.querySelectorAll('[data-consensus-select], [data-consensus-assignee]')
        .forEach((input) => input.addEventListener('change', saveSelection));
      panel.querySelector('[data-consensus-time]')?.addEventListener('change', saveSelection);
      panel.querySelector('[data-consensus-action="start-vote"]')?.addEventListener('click', () => {
        if (!consensus.canStartVote(plan).ok) return;
        savePlan({ ...plan, votingStarted: true });
      });
      panel.querySelectorAll('[data-consensus-vote]').forEach((button) => {
        button.addEventListener('click', () => {
          let nextPlan = consensus.castVote(
            plan,
            currentMember.id,
            button.dataset.consensusVote,
          );
          const nextTally = consensus.tally(nextPlan, meeting.memberIds);
          if (nextTally.passed) {
            nextPlan = consensus.lock(nextPlan);
            const completedMeeting = {
              ...meeting,
              actionPlan: nextPlan,
              status: 'active',
              step: 'end',
            };
            todos.distribute(completedMeeting, nextPlan, store);
            saveMeeting(completedMeeting);
            return;
          }
          savePlan(nextPlan);
        });
      });
      panel.querySelector('[data-consensus-action="skip"]')?.addEventListener('click', () => {
        saveMeeting({
          ...meeting,
          actionPlan: { ...plan, skipped: true, locked: false },
          status: 'active',
          step: 'end',
        });
      });
    }

    function transcriptMarkup(meeting) {
      const lines = meeting.transcript || [];
      if (!lines.length) {
        return '<p class="meeting-transcript__empty">正在聆听，转写内容将自动出现在这里…</p>';
      }
      return lines.map((line) => {
        const tags = line.tags || [];
        const time = new Date(line.at).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        return `
          <article class="meeting-transcript__line" data-transcript-line="${line.id}">
            <div class="meeting-transcript__meta">
              <time>${time}</time>
              <div class="meeting-transcript__tags">
                <button class="${tags.includes('idea') ? 'is-active' : ''}" type="button" data-transcript-tag="idea">想法</button>
                <button class="${tags.includes('keyword') ? 'is-active' : ''}" type="button" data-transcript-tag="keyword">关键词</button>
              </div>
            </div>
            <p data-transcript-text>${escapeHtml(line.text)}</p>
            <textarea data-transcript-input hidden aria-label="编辑转写内容">${escapeHtml(line.text)}</textarea>
            <button class="meeting-transcript__edit" type="button" data-transcript-action="edit">编辑</button>
          </article>
        `;
      }).join('');
    }

    function renderTranscriptPanel(panel, meeting) {
      panel.querySelector('[data-transcript-list]').innerHTML = transcriptMarkup(meeting);
      bindTranscriptPanel(panel, meeting);
    }

    function bindTranscriptPanel(panel, meeting) {
      panel.querySelectorAll('[data-transcript-action="edit"]').forEach((button) => {
        button.addEventListener('click', () => {
          const line = button.closest('[data-transcript-line]');
          const text = line.querySelector('[data-transcript-text]');
          const input = line.querySelector('[data-transcript-input]');
          if (input.hidden) {
            input.hidden = false;
            text.hidden = true;
            button.textContent = '保存';
            input.focus();
            return;
          }
          const nextText = input.value.trim();
          if (nextText) transcript.edit(meeting, line.dataset.transcriptLine, nextText);
        });
      });
      panel.querySelectorAll('[data-transcript-tag]').forEach((button) => {
        button.addEventListener('click', () => {
          const line = button.closest('[data-transcript-line]');
          transcript.tag(meeting, line.dataset.transcriptLine, button.dataset.transcriptTag);
        });
      });
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
      const showTranscript = meeting.step === 'collect' || meeting.step === 'discuss';
      const showWhiteboard = showTranscript;
      const showDistill = meeting.step === 'distill';
      const showConsensus = meeting.step === 'consensus';
      const showEnd = meeting.step === 'end';

      container.innerHTML = `
        <div class="meeting-room meeting-room--type-${meeting.typeId}" style="--type-color:${escapeHtml(type?.color || '#4A90A4')}">
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
          ${showDistill ? '<section class="meeting-distill-panel" data-distill-panel></section>' : ''}
          ${showConsensus ? '<section class="meeting-consensus-panel" data-consensus-panel></section>' : ''}
          ${showTranscript ? `
            <div class="meeting-collaboration">
            ${showWhiteboard ? `
            <section class="meeting-whiteboard" data-whiteboard-panel aria-labelledby="meeting-whiteboard-title">
              <div class="meeting-whiteboard__header">
                <div>
                  <p class="view-panel__eyebrow">共享画板</p>
                  <h2 id="meeting-whiteboard-title">一起画下来</h2>
                </div>
                <button class="meeting-whiteboard__clear" type="button" data-whiteboard-action="clear-own">清空我的</button>
              </div>
              <div class="meeting-whiteboard__tools" role="toolbar" aria-label="画板工具">
                ${[
                  ['pen', '画笔'],
                  ['eraser', '橡皮'],
                  ['rect', '矩形'],
                  ['circle', '圆形'],
                  ['line', '直线'],
                  ['arrow', '箭头'],
                ].map(([tool, label], index) => `
                  <button class="${index === 0 ? 'is-active' : ''}" type="button" data-whiteboard-tool="${tool}">${label}</button>
                `).join('')}
              </div>
              <canvas class="meeting-whiteboard__canvas" width="720" height="420" data-whiteboard-canvas aria-label="共享画板"></canvas>
            </section>
            ` : ''}
            <section class="meeting-transcript" data-transcript-panel aria-labelledby="meeting-transcript-title">
              <div class="meeting-transcript__header">
                <div>
                  <p class="view-panel__eyebrow">模拟语音转写</p>
                  <h2 id="meeting-transcript-title">现场记录</h2>
                </div>
                <span class="meeting-transcript__live"><i aria-hidden="true"></i>自动记录中</span>
              </div>
              <div class="meeting-transcript__list" data-transcript-list aria-live="polite">
                ${transcriptMarkup(meeting)}
              </div>
            </section>
            </div>
          ` : ''}
          ${showMoodButton && isHost ? `
            <button class="family-button meeting-mood-button" type="button" data-meeting-room-action="complete-mood">
              结束心情回合
            </button>
          ` : ''}
          ${showEnd && isHost ? `
            <div class="meeting-room__archive">
              <p>请确认本场记录，归档后会议内容将转为只读。</p>
              <button class="family-button family-button--primary" type="button" data-meeting-room-action="archive">完成并归档</button>
            </div>
          ` : showEnd ? `<p class="meeting-room__host">等待 ${memberLabel(host)} 完成归档</p>` : isHost && !showDistill && !showConsensus ? `
            <div class="meeting-room__controls">
              <button class="family-button family-button--ghost" type="button" data-meeting-room-action="prev" ${stepIndex <= 0 ? 'disabled' : ''}>上一步</button>
              <button class="family-button family-button--primary" type="button" data-meeting-room-action="next" ${advance.ok ? '' : 'disabled'}>下一步</button>
            </div>
            ${!advance.ok && advance.reason ? `<p class="meeting-room__gate">${advance.reason}</p>` : ''}
          ` : !isHost && !showDistill && !showConsensus ? `<p class="meeting-room__host">当前由 ${memberLabel(host)} 主持</p>` : ''}
        </div>
      `;

      const distillPanel = container.querySelector('[data-distill-panel]');
      if (distillPanel && distill) {
        transcript?.stop?.();
        distill.render(distillPanel, meeting, {
          isHost,
          onSave: (insights) => {
            const distilledMeeting = { ...meeting, insights };
            saveMeeting(engine.next(distilledMeeting));
          },
        });
        return;
      }

      const consensusPanel = container.querySelector('[data-consensus-panel]');
      if (consensusPanel && consensus && todos) {
        transcript?.stop?.();
        renderConsensusPanel(consensusPanel, meeting, members, isHost);
        return;
      }

      if (showEnd) {
        transcript?.stop?.();
        container.querySelector('[data-meeting-room-action="archive"]')?.addEventListener('click', () => {
          archiveMeeting(meeting);
        });
        return;
      }

      const transcriptPanel = container.querySelector('[data-transcript-panel]');
      if (transcriptPanel) bindTranscriptPanel(transcriptPanel, meeting);
      const whiteboardCanvas = container.querySelector('[data-whiteboard-canvas]');
      let mountedWhiteboard = null;
      if (whiteboardCanvas && whiteboard) {
        latestWhiteboardCanvas = whiteboardCanvas;
        mountedWhiteboard = whiteboard.mount(whiteboardCanvas, meeting, {
          getMemberId: () => app.getCurrentMember?.()?.id,
          getMemberColor: () => app.getCurrentMember?.()?.color,
          onChange: (updatedMeeting) => saveMeeting(updatedMeeting),
        });
        container.querySelectorAll('[data-whiteboard-tool]').forEach((button) => {
          button.addEventListener('click', () => {
            mountedWhiteboard.setTool(button.dataset.whiteboardTool);
            container.querySelectorAll('[data-whiteboard-tool]').forEach((candidate) => {
              candidate.classList.toggle('is-active', candidate === button);
            });
          });
        });
        container.querySelector('[data-whiteboard-action="clear-own"]')?.addEventListener('click', () => {
          whiteboard.clearOwn(meeting, app.getCurrentMember?.()?.id);
          mountedWhiteboard.redraw();
          saveMeeting(meeting);
        });
      }
      transcript?.start(meeting, {
        onUpdate: (updatedMeeting) => {
          if (transcriptPanel && transcriptPanel.isConnected !== false) {
            renderTranscriptPanel(transcriptPanel, updatedMeeting);
          }
        },
      });

      if (!isHost) return;
      container.querySelector('[data-meeting-room-action="prev"]')?.addEventListener('click', () => {
        saveMeeting(engine.prev(meeting));
      });
      container.querySelector('[data-meeting-room-action="next"]')?.addEventListener('click', () => {
        const nextMeeting = engine.next(meeting);
        if (
          latestWhiteboardCanvas
          && (nextMeeting.step === 'distill' || nextMeeting.step === 'end')
        ) {
          whiteboard?.snapshot(latestWhiteboardCanvas, nextMeeting);
        }
        saveMeeting(nextMeeting);
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
