(function (root) {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function selectedCandidates(plan) {
    const selected = new Set(plan.selectedIds || []);
    return (plan.candidates || []).filter((candidate) => selected.has(candidate.id));
  }

  function distribute(meeting, plan, store = root?.Store) {
    if (!plan?.locked) throw new Error('行动方案尚未锁定');
    const todos = selectedCandidates(plan).map((candidate) => ({
      id: `todo-${meeting.id}-${candidate.id}`,
      meetingId: meeting.id,
      assigneeId: candidate.assigneeId,
      title: candidate.title,
      dueText: candidate.dueText || plan.agreedTime,
      status: 'open',
    }));

    if (store) {
      const state = store.load();
      const retained = (state.todos || []).filter((todo) => todo.meetingId !== meeting.id);
      store.save({ ...state, todos: [...retained, ...todos] });
    }
    return todos;
  }

  function meetingLabel(meeting) {
    return meeting?.title || meeting?.topicTitle || `家庭会议 ${meeting?.typeId || ''}`.trim();
  }

  function renderList(container, state, store = root?.Store) {
    const meetings = new Map((state.meetings || []).map((meeting) => [meeting.id, meeting]));
    const todos = (state.todos || []).filter((todo) => todo.assigneeId === state.currentMemberId);
    const open = todos.filter((todo) => todo.status !== 'done');
    const done = todos.filter((todo) => todo.status === 'done');

    function section(title, items) {
      return `
        <section class="todo-section">
          <h2>${title}<span>${items.length}</span></h2>
          ${items.length ? items.map((todo) => {
            const meeting = meetings.get(todo.meetingId);
            const agreedTime = meeting?.actionPlan?.agreedTime || todo.dueText;
            return `
              <label class="todo-item ${todo.status === 'done' ? 'is-done' : ''}">
                <input type="checkbox" data-todo-id="${escapeHtml(todo.id)}" ${todo.status === 'done' ? 'checked' : ''}>
                <span>
                  <strong>${escapeHtml(todo.title)}</strong>
                  <small>${escapeHtml(meetingLabel(meeting))} · ${escapeHtml(agreedTime || '时间待定')}</small>
                </span>
              </label>
            `;
          }).join('') : '<p class="todo-empty">暂无行动</p>'}
        </section>
      `;
    }

    container.innerHTML = `
      <div class="todos-view">
        <p class="view-panel__eyebrow">行动清单</p>
        <h1>我的待办</h1>
        ${section('待完成', open)}
        ${section('已完成', done)}
      </div>
    `;

    container.querySelectorAll?.('[data-todo-id]').forEach((input) => {
      input.addEventListener('change', () => {
        const latest = store?.load() || state;
        const nextState = {
          ...latest,
          todos: (latest.todos || []).map((todo) => (
            todo.id === input.dataset.todoId
              ? { ...todo, status: input.checked ? 'done' : 'open' }
              : todo
          )),
        };
        store?.save(nextState);
        renderList(container, nextState, store);
      });
    });
  }

  const Todos = { distribute, renderList };
  if (typeof module !== 'undefined' && module.exports) module.exports = Todos;
  if (root) root.Todos = Todos;
}(typeof window !== 'undefined' ? window : globalThis));
