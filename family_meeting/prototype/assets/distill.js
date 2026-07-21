(function (root) {
  const STEPS = ['integrate', 'common', 'core', 'mark'];
  const STEP_LABELS = {
    integrate: '整合素材',
    common: '寻找共同点',
    core: '核心洞见',
    mark: '特别标记',
  };
  const ALLOWED_MARKS = ['star', 'heart', 'none'];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function uniqueTexts(values) {
    const seen = new Set();
    return (values || []).reduce((result, value) => {
      const text = String(value || '').trim();
      if (text && !seen.has(text)) {
        seen.add(text);
        result.push(text);
      }
      return result;
    }, []);
  }

  function prioritizedTranscript(meeting) {
    return [...(meeting.transcript || [])].sort((left, right) => {
      const leftTagged = (left.tags || []).length > 0 ? 1 : 0;
      const rightTagged = (right.tags || []).length > 0 ? 1 : 0;
      return rightTagged - leftTagged;
    });
  }

  function createSession(meeting, { isHost, onSave }) {
    let stepIndex = 0;
    let common = uniqueTexts(meeting.insights?.common || []);
    let core = uniqueTexts((meeting.insights?.core || []).map((item) => item.text));
    const marks = new Map(
      (meeting.insights?.core || []).map((item) => [
        item.text,
        { mark: item.mark || 'none', color: item.color },
      ]),
    );

    const session = {
      get step() {
        return STEPS[stepIndex];
      },
      get common() {
        return [...common];
      },
      get core() {
        return [...core];
      },
      next() {
        if (!isHost || stepIndex >= STEPS.length - 1) return false;
        if (session.step === 'core' && !session.coreGate().ok) return false;
        stepIndex += 1;
        return true;
      },
      prev() {
        if (!isHost || stepIndex <= 0) return false;
        stepIndex -= 1;
        return true;
      },
      setCommon(values) {
        if (!isHost) return;
        common = uniqueTexts(values);
        core = core.filter((text) => common.includes(text));
      },
      setCore(values) {
        if (!isHost) return;
        const selected = uniqueTexts(values);
        core = selected.filter((text) => common.includes(text));
      },
      coreGate() {
        const count = core.length;
        return count >= 3 && count <= 5
          ? { ok: true, reason: '' }
          : { ok: false, reason: `请选择 3–5 条核心洞见（当前 ${count} 条）` };
      },
      setMark(text, mark, color) {
        if (!isHost || !core.includes(text) || !ALLOWED_MARKS.includes(mark)) return;
        marks.set(text, {
          mark,
          color: mark === 'none' ? undefined : color,
        });
      },
      save() {
        if (!isHost || session.step !== 'mark' || !session.coreGate().ok) return false;
        const insights = {
          common: [...common],
          core: core.map((text) => {
            const decoration = marks.get(text) || { mark: 'none' };
            const item = { text, mark: decoration.mark };
            if (decoration.color) item.color = decoration.color;
            return item;
          }),
        };
        onSave?.(insights);
        return insights;
      },
    };

    return session;
  }

  function progressMarkup(activeStep) {
    return `
      <ol class="distill-progress" aria-label="提炼步骤">
        ${STEPS.map((step, index) => `
          <li class="${step === activeStep ? 'is-active' : ''}">
            <span>${index + 1}</span>${STEP_LABELS[step]}
          </li>
        `).join('')}
      </ol>
    `;
  }

  function integrateMarkup(meeting) {
    const transcript = prioritizedTranscript(meeting);
    return `
      <div class="distill-integrate">
        <section class="distill-card">
          <h3>转写摘录</h3>
          <div class="distill-transcript">
            ${transcript.length ? transcript.map((line) => `
              <article class="${(line.tags || []).length ? 'is-tagged' : ''}">
                ${(line.tags || []).map((tag) => `<span>${tag === 'idea' ? '想法' : '关键词'}</span>`).join('')}
                <p>${escapeHtml(line.text)}</p>
              </article>
            `).join('') : '<p class="distill-empty">暂无转写内容</p>'}
          </div>
        </section>
        <section class="distill-card">
          <h3>共享画板</h3>
          ${meeting.whiteboard?.snapshot
            ? `<img class="distill-snapshot" src="${escapeHtml(meeting.whiteboard.snapshot)}" alt="本次会议共享画板快照">`
            : '<p class="distill-empty">暂无画板快照</p>'}
        </section>
      </div>
    `;
  }

  function commonMarkup(meeting, session, isHost) {
    const choices = uniqueTexts((meeting.transcript || []).map((line) => line.text));
    return `
      <section class="distill-card">
        <h3>哪些表达指向同一件事？</h3>
        <p>可多选转写，也可以手动补充。</p>
        <div class="distill-choice-list">
          ${choices.map((text, index) => `
            <label>
              <input type="checkbox" data-distill-common="${index}" ${session.common.includes(text) ? 'checked' : ''} ${isHost ? '' : 'disabled'}>
              <span>${escapeHtml(text)}</span>
            </label>
          `).join('')}
        </div>
        ${isHost ? `
          <div class="distill-add">
            <input type="text" data-distill-custom placeholder="补充一个共同点" maxlength="120">
            <button type="button" data-distill-action="add-common">添加</button>
          </div>
        ` : ''}
        ${session.common.length ? `
          <div class="distill-added">
            ${session.common.filter((text) => !choices.includes(text)).map((text) => `<span>${escapeHtml(text)}</span>`).join('')}
          </div>
        ` : ''}
      </section>
    `;
  }

  function coreMarkup(session, isHost) {
    const gate = session.coreGate();
    return `
      <section class="distill-card">
        <h3>留下最重要的 3–5 条</h3>
        <p>从共同点中选出真正值得全家记住的核心洞见。</p>
        <div class="distill-choice-list">
          ${session.common.map((text, index) => `
            <label>
              <input type="checkbox" data-distill-core="${index}" ${session.core.includes(text) ? 'checked' : ''} ${isHost ? '' : 'disabled'}>
              <span>${escapeHtml(text)}</span>
            </label>
          `).join('')}
        </div>
        <p class="distill-gate ${gate.ok ? 'is-valid' : ''}" data-distill-gate>${gate.ok ? `已选择 ${session.core.length} 条` : gate.reason}</p>
      </section>
    `;
  }

  function markMarkup(session, isHost) {
    return `
      <section class="distill-card">
        <h3>给重要洞见加个记号</h3>
        <p>星标代表优先关注，爱心代表彼此珍视。</p>
        <div class="distill-mark-list">
          ${session.core.map((text, index) => `
            <article>
              <strong>${escapeHtml(text)}</strong>
              <label>
                标记
                <select data-distill-mark="${index}" ${isHost ? '' : 'disabled'}>
                  <option value="none">无</option>
                  <option value="star">星标</option>
                  <option value="heart">爱心</option>
                </select>
              </label>
              <label>
                颜色
                <input type="color" value="#f2b84b" data-distill-color="${index}" ${isHost ? '' : 'disabled'}>
              </label>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function render(container, meeting, { isHost, onSave }) {
    const session = createSession(meeting, { isHost, onSave });

    function renderStep() {
      const step = session.step;
      let body = integrateMarkup(meeting);
      if (step === 'common') body = commonMarkup(meeting, session, isHost);
      if (step === 'core') body = coreMarkup(session, isHost);
      if (step === 'mark') body = markMarkup(session, isHost);
      const gate = session.coreGate();

      container.innerHTML = `
        <div class="distill" data-distill-step="${step}">
          <div class="distill-heading">
            <p class="view-panel__eyebrow">会后提炼</p>
            <h2>${STEP_LABELS[step]}</h2>
          </div>
          ${progressMarkup(step)}
          ${body}
          ${isHost ? `
            <div class="distill-actions">
              <button class="family-button family-button--ghost" type="button" data-distill-action="prev" ${step === 'integrate' ? 'disabled' : ''}>上一步</button>
              ${step === 'mark'
                ? '<button class="family-button family-button--primary" type="button" data-distill-action="save">保存并进入共识</button>'
                : `<button class="family-button family-button--primary" type="button" data-distill-action="next" ${step === 'core' && !gate.ok ? 'disabled' : ''}>${step === 'core' ? '完成提炼' : '下一步'}</button>`}
            </div>
          ` : '<p class="distill-waiting">主持人正在整理会后洞见，请一起查看。</p>'}
        </div>
      `;

      container.querySelector('[data-distill-action="prev"]')?.addEventListener('click', () => {
        if (session.prev()) renderStep();
      });
      container.querySelector('[data-distill-action="next"]')?.addEventListener('click', () => {
        if (session.next()) renderStep();
      });
      container.querySelector('[data-distill-action="save"]')?.addEventListener('click', () => {
        session.save();
      });
      container.querySelector('[data-distill-action="add-common"]')?.addEventListener('click', () => {
        const input = container.querySelector('[data-distill-custom]');
        const text = input?.value?.trim();
        if (!text) return;
        session.setCommon([...session.common, text]);
        renderStep();
      });
      container.querySelectorAll('[data-distill-common]').forEach((input) => {
        input.addEventListener('change', () => {
          const choices = uniqueTexts((meeting.transcript || []).map((line) => line.text));
          const selected = new Set(session.common);
          const text = choices[Number(input.dataset.distillCommon)];
          if (input.checked) selected.add(text);
          else selected.delete(text);
          session.setCommon([...selected]);
        });
      });
      container.querySelectorAll('[data-distill-core]').forEach((input) => {
        input.addEventListener('change', () => {
          const selected = new Set(session.core);
          const text = session.common[Number(input.dataset.distillCore)];
          if (input.checked) selected.add(text);
          else selected.delete(text);
          session.setCore([...selected]);
          renderStep();
        });
      });
      container.querySelectorAll('[data-distill-mark]').forEach((select) => {
        select.addEventListener('change', () => {
          const index = Number(select.dataset.distillMark);
          const color = container.querySelector(`[data-distill-color="${index}"]`)?.value;
          session.setMark(session.core[index], select.value, color);
        });
      });
      container.querySelectorAll('[data-distill-color]').forEach((input) => {
        input.addEventListener('change', () => {
          const index = Number(input.dataset.distillColor);
          const mark = container.querySelector(`[data-distill-mark="${index}"]`)?.value || 'none';
          session.setMark(session.core[index], mark, input.value);
        });
      });
    }

    renderStep();
    return session;
  }

  const Distill = { render, createSession };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Distill;
  }

  if (root) {
    root.Distill = Distill;
  }
}(typeof window !== 'undefined' ? window : globalThis));
