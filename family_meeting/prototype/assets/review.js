(function (root) {
  const TYPE_LABELS = {
    '01': '种苹果树',
    '02': '除杂草',
    '03': '持续耕耘',
    '04': '危机公关',
  };
  const TOPIC_LABELS = {
    '01-1': '集体活动',
    '01-2': '共同愿景',
    '01-3': '互相欣赏',
    '02-1': '年假地',
    '02-2': '春节安排',
    '02-3': '上网时间',
    '02-4': '报补习班',
    '03-1': '周末家务',
    '03-2': '管理压岁钱',
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function meetingTodos(meetingId, todos) {
    return (todos || []).filter((todo) => todo.meetingId === meetingId);
  }

  function assigneeLabel(assigneeId, members, fallback) {
    const member = (members || []).find((candidate) => candidate.id === assigneeId);
    return member?.nickname || member?.role || member?.name || fallback;
  }

  function progress(meetingId, todos) {
    const related = meetingTodos(meetingId, todos);
    return {
      done: related.filter((todo) => todo.status === 'done').length,
      total: related.length,
    };
  }

  function typeLabel(meeting) {
    return meeting.typeName || TYPE_LABELS[meeting.typeId] || `家庭会议 ${meeting.typeId || ''}`.trim();
  }

  function topicLabel(meeting) {
    return meeting.topicTitle || TOPIC_LABELS[meeting.topicId] || '无固定议题';
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '日期未知';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  function renderDetail(container, meeting, todos, members = []) {
    const relatedTodos = meetingTodos(meeting.id, todos);
    const tally = progress(meeting.id, todos);
    const selectedIds = new Set(meeting.actionPlan?.selectedIds || []);
    const actions = (meeting.actionPlan?.candidates || [])
      .filter((candidate) => selectedIds.has(candidate.id));
    const transcript = meeting.transcript || [];
    const common = meeting.insights?.common || [];
    const core = meeting.insights?.core || [];

    container.innerHTML = `
      <div class="review-detail">
        <button class="meeting-back" type="button" data-review-action="back">← 返回回顾列表</button>
        <p class="view-panel__eyebrow">会议回顾</p>
        <div class="review-detail__heading">
          <div>
            <h1>${escapeHtml(topicLabel(meeting))}</h1>
            <p>${escapeHtml(typeLabel(meeting))} · ${escapeHtml(formatDate(meeting.archivedAt || meeting.createdAt))}</p>
          </div>
          <strong>行动进度 ${tally.done}/${tally.total}</strong>
        </div>

        <section class="review-section">
          <h2>转写摘要</h2>
          <div class="review-transcript">
            ${transcript.length ? transcript.map((line) => `
              <article>
                <p>${escapeHtml(line.text)}</p>
                ${(line.tags || []).length
                  ? `<div>${line.tags.map((tag) => `<span>${tag === 'idea' ? '想法' : '关键词'}</span>`).join('')}</div>`
                  : ''}
              </article>
            `).join('') : '<p class="review-empty">本场没有转写内容</p>'}
          </div>
        </section>

        <section class="review-section">
          <h2>画板快照</h2>
          ${meeting.whiteboard?.snapshot
            ? `<img class="review-snapshot" src="${escapeHtml(meeting.whiteboard.snapshot)}" alt="本次会议画板快照">`
            : '<p class="review-empty">本场没有画板内容</p>'}
        </section>

        <section class="review-section">
          <h2>共同发现</h2>
          <div class="review-common">
            ${common.length
              ? common.map((insight) => `<span>${escapeHtml(insight)}</span>`).join('')
              : '<p class="review-empty">本场没有记录共同点</p>'}
          </div>
        </section>

        <section class="review-section">
          <h2>核心洞见</h2>
          <div class="review-insights">
            ${core.length ? core.map((insight) => `
              <article style="--insight-color: ${escapeHtml(insight.color || '#4a90a4')}">
                <span aria-hidden="true">${insight.mark === 'star' ? '★' : insight.mark === 'heart' ? '♥' : '•'}</span>
                <p>${escapeHtml(insight.text)}</p>
              </article>
            `).join('') : '<p class="review-empty">本场没有核心洞见</p>'}
          </div>
        </section>

        <section class="review-section">
          <h2>行动包</h2>
          ${actions.length ? `
            <div class="review-actions">
              ${actions.map((action) => `
                <article>
                  <strong>${escapeHtml(action.title)}</strong>
                  <span>负责人：${escapeHtml(assigneeLabel(action.assigneeId, members, action.assigneeName || '待定'))}</span>
                  <span>时间：${escapeHtml(action.dueText || meeting.actionPlan?.agreedTime || '待定')}</span>
                </article>
              `).join('')}
            </div>
          ` : `<p class="review-empty">${meeting.actionPlan?.skipped ? '本场约定无行动' : '本场没有行动包'}</p>`}
        </section>

        <section class="review-section">
          <h2>各人待办</h2>
          <div class="review-todos">
            ${relatedTodos.length ? relatedTodos.map((todo) => `
              <article class="${todo.status === 'done' ? 'is-done' : ''}">
                <span aria-hidden="true">${todo.status === 'done' ? '✓' : '○'}</span>
                <div>
                  <strong>${escapeHtml(todo.title)}</strong>
                  <small>${escapeHtml(assigneeLabel(todo.assigneeId, members, todo.assigneeName || '待分配'))} · ${todo.status === 'done' ? '已完成' : '待完成'}</small>
                </div>
              </article>
            `).join('') : '<p class="review-empty">暂无待办</p>'}
          </div>
        </section>
      </div>
    `;
  }

  function renderList(container, state, members = state.family?.members || [], store = root?.Store) {
    const archived = (state.meetings || [])
      .filter((meeting) => meeting.status === 'archived')
      .sort((left, right) => (
        (right.archivedAt || right.createdAt || 0) - (left.archivedAt || left.createdAt || 0)
      ));

    container.innerHTML = `
      <div class="review-view">
        <p class="view-panel__eyebrow">会议记录</p>
        <h1>会议回顾</h1>
        <p class="review-view__lead">回看家庭共同完成的会议、洞见与行动进度。</p>
        <div class="review-list">
          ${archived.length ? archived.map((meeting) => {
            const tally = progress(meeting.id, state.todos);
            return `
              <button class="review-card" type="button" data-review-id="${escapeHtml(meeting.id)}">
                <span class="review-card__type">${escapeHtml(typeLabel(meeting))}</span>
                <strong>${escapeHtml(topicLabel(meeting))}</strong>
                <span>${escapeHtml(formatDate(meeting.archivedAt || meeting.createdAt))}</span>
                <span class="review-card__progress">行动 ${tally.done}/${tally.total}</span>
              </button>
            `;
          }).join('') : '<p class="review-empty">还没有已归档的家庭会议</p>'}
        </div>
      </div>
    `;

    container.querySelectorAll?.('[data-review-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const meeting = archived.find((candidate) => candidate.id === button.dataset.reviewId);
        if (!meeting) return;
        renderDetail(container, meeting, state.todos || [], members);
        container.querySelector?.('[data-review-action="back"]')?.addEventListener('click', () => {
          const latestState = store?.load?.() || state;
          renderList(
            container,
            latestState,
            latestState.family?.members || members,
            store,
          );
        });
      });
    });
  }

  const Review = { renderList, renderDetail };
  if (typeof module !== 'undefined' && module.exports) module.exports = Review;
  if (root) root.Review = Review;
}(typeof window !== 'undefined' ? window : globalThis));
