(function (root) {
  const ROLES = ['爸', '妈', '孩子', '其他'];
  const MEMBER_COLORS = ['#ef7c8e', '#4f86c6', '#f4b942', '#7fb685'];
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function createFamilyView(options = {}) {
    const store = options.store || root.Store;
    const demoSeed = options.demoSeed || root.demoSeed;
    const random = options.random || Math.random;
    const now = options.now || Date.now;
    const onChange = options.onChange || (() => {});
    let message = '';

    function requireStore() {
      if (!store) throw new Error('Store 未配置');
    }

    function id(prefix) {
      return `${prefix}-${now().toString(36)}-${Math.floor(random() * 100000).toString(36)}`;
    }

    function inviteCode() {
      let code = '';
      for (let index = 0; index < 6; index += 1) {
        code += CODE_CHARS[Math.floor(random() * CODE_CHARS.length)];
      }
      return code;
    }

    function commit(state, nextMessage) {
      store.save(state);
      message = nextMessage || '';
      onChange(state);
      return state;
    }

    function createFamily(name) {
      requireStore();
      const cleanName = String(name || '').trim();
      if (!cleanName) throw new Error('请输入家庭名称');

      const creator = {
        id: id('member'),
        role: '妈',
        nickname: '妈妈',
        slot: 0,
        color: MEMBER_COLORS[0],
      };
      const state = store.load();
      state.family = {
        id: id('family'),
        name: cleanName,
        inviteCode: inviteCode(),
        defaultHostId: creator.id,
        members: [creator],
      };
      state.currentMemberId = creator.id;
      commit(state, '家庭创建成功');
      return state.family;
    }

    function joinByCode(code, role, nickname) {
      requireStore();
      const state = store.load();
      if (!state.family) throw new Error('请先创建或载入家庭');
      if (String(code || '').trim().toUpperCase() !== state.family.inviteCode) {
        throw new Error('邀请码不正确');
      }
      if (!ROLES.includes(role)) throw new Error('请选择有效角色');
      const cleanNickname = String(nickname || '').trim();
      if (!cleanNickname) throw new Error('请输入昵称');
      if (state.family.members.length >= 4) throw new Error('家庭站位已满');

      const occupied = new Set(state.family.members.map((member) => member.slot));
      const slot = [0, 1, 2, 3].find((candidate) => !occupied.has(candidate));
      const member = {
        id: id('member'),
        role,
        nickname: cleanNickname,
        slot,
        color: MEMBER_COLORS[slot],
      };
      state.family.members.push(member);
      state.currentMemberId = member.id;
      commit(state, `${cleanNickname} 已加入家庭`);
      return member;
    }

    function setDefaultHost(memberId) {
      requireStore();
      const state = store.load();
      if (!state.family) throw new Error('请先创建或载入家庭');
      if (!state.family.members.some((member) => member.id === memberId)) {
        throw new Error('成员不存在');
      }
      state.family.defaultHostId = memberId;
      commit(state, '默认主持人已更新');
      return memberId;
    }

    function loadDemoFamily() {
      requireStore();
      if (!demoSeed || typeof demoSeed.createDemoFamily !== 'function') {
        throw new Error('演示数据不可用');
      }
      const state = store.load();
      const demo = demoSeed.createDemoFamily();
      state.family = demo.family;
      state.currentMemberId = demo.currentMemberId;
      commit(state, '已载入演示家庭');
      return state.family;
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function renderEmpty(container) {
      container.innerHTML = `
        <div class="family-empty">
          <span class="family-empty__icon" aria-hidden="true">⌂</span>
          <p class="view-panel__eyebrow">从这里开始</p>
          <h1>创建你的家庭空间</h1>
          <p>邀请家人加入，一起开会、记录约定和行动。</p>
          <form class="family-form" data-family-create>
            <label for="family-name">家庭名称</label>
            <input id="family-name" name="name" maxlength="24" placeholder="例如：快乐一家" required>
            <button class="family-button family-button--primary" type="submit">创建家庭</button>
          </form>
          <button class="family-button family-button--ghost" type="button" data-load-demo>
            载入演示家庭
          </button>
        </div>
      `;
    }

    function renderMember(member, family) {
      if (!member) {
        return `
          <button class="family-slot family-slot--empty" type="button" data-focus-invite>
            <span aria-hidden="true">＋</span>
            <strong>邀请加入</strong>
          </button>
        `;
      }
      const isHost = member.id === family.defaultHostId;
      return `
        <article class="family-slot family-slot--member">
          <div class="family-person" style="--member-color:${escapeHtml(member.color)}" aria-hidden="true">
            <span class="family-person__head"></span>
            <span class="family-person__body"></span>
          </div>
          <strong>${escapeHtml(member.role)}</strong>
          <span>${escapeHtml(member.nickname)}</span>
          <button class="family-host${isHost ? ' is-active' : ''}" type="button"
            data-default-host="${escapeHtml(member.id)}">
            ${isHost ? '默认主持' : '设为默认主持'}
          </button>
        </article>
      `;
    }

    function renderFamily(container, state) {
      const { family } = state;
      const slots = [0, 1, 2, 3].map((slot) => (
        family.members.find((member) => member.slot === slot) || null
      ));
      container.innerHTML = `
        <div class="family-view">
          <header class="family-heading">
            <div>
              <p class="view-panel__eyebrow">成员与设置</p>
              <h1>${escapeHtml(family.name)}</h1>
            </div>
            <button class="family-button family-button--ghost" type="button" data-load-demo>
              载入演示
            </button>
          </header>
          <section class="family-room" aria-label="家庭客厅成员场景">
            <div class="family-room__window" aria-hidden="true"></div>
            <div class="family-room__picture" aria-hidden="true">♥</div>
            <div class="family-room__sofa" aria-hidden="true"></div>
            <div class="family-room__slots">
              ${slots.map((member) => renderMember(member, family)).join('')}
            </div>
          </section>
          <section class="family-invite" data-invite-panel>
            <div class="family-invite__code">
              <span>家庭邀请码</span>
              <strong>${escapeHtml(family.inviteCode)}</strong>
              <button class="family-button family-button--small" type="button" data-copy-code>复制</button>
            </div>
            <form class="family-form family-form--join" data-family-join>
              <h2>用邀请码加入</h2>
              <label>邀请码
                <input name="code" value="${escapeHtml(family.inviteCode)}" maxlength="6" required>
              </label>
              <label>角色
                <select name="role">
                  ${ROLES.map((role) => `<option>${role}</option>`).join('')}
                </select>
              </label>
              <label>昵称
                <input name="nickname" maxlength="12" placeholder="怎么称呼你" required>
              </label>
              <button class="family-button family-button--primary" type="submit"
                ${family.members.length >= 4 ? 'disabled' : ''}>
                ${family.members.length >= 4 ? '家庭已满员' : '加入家庭'}
              </button>
            </form>
          </section>
          <p class="family-message" role="status">${escapeHtml(message)}</p>
        </div>
      `;
    }

    function handle(action) {
      try {
        action();
      } catch (error) {
        message = error.message;
        onChange(store.load());
      }
    }

    function bind(container) {
      container.querySelector('[data-family-create]')?.addEventListener('submit', (event) => {
        event.preventDefault();
        handle(() => createFamily(new FormData(event.currentTarget).get('name')));
      });
      container.querySelector('[data-family-join]')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        handle(() => joinByCode(data.get('code'), data.get('role'), data.get('nickname')));
      });
      container.querySelectorAll('[data-default-host]').forEach((button) => {
        button.addEventListener('click', () => handle(() => setDefaultHost(button.dataset.defaultHost)));
      });
      container.querySelectorAll('[data-load-demo]').forEach((button) => {
        button.addEventListener('click', () => handle(loadDemoFamily));
      });
      container.querySelector('[data-copy-code]')?.addEventListener('click', async () => {
        const code = store.load().family.inviteCode;
        try {
          await root.navigator.clipboard.writeText(code);
          message = '邀请码已复制';
        } catch {
          message = `请手动复制邀请码：${code}`;
        }
        onChange(store.load());
      });
      container.querySelectorAll('[data-focus-invite]').forEach((button) => {
        button.addEventListener('click', () => {
          container.querySelector('[name="nickname"]')?.focus();
        });
      });
    }

    function render(container, state) {
      if (!container) return;
      if (!state || !state.family) renderEmpty(container);
      else renderFamily(container, state);
      bind(container);
    }

    return {
      render,
      createFamily,
      joinByCode,
      setDefaultHost,
      loadDemoFamily,
    };
  }

  const FamilyView = createFamilyView();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createFamilyView };
  }

  if (root) {
    root.createFamilyView = createFamilyView;
    root.FamilyView = FamilyView;
  }
}(typeof window !== 'undefined' ? window : globalThis));
