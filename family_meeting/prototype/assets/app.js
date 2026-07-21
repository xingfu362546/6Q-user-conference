(function (root) {
  const TAB_VIEWS = ['meet', 'review', 'todos', 'family'];
  const LEAVE_CONFIRMATION = '离开会议室？进度已自动保存。';

  function memberLabel(member) {
    return member ? member.nickname || member.name || member.role : '未加入家庭';
  }

  function createApp({ store, ui, confirmLeave }) {
    let state = store.load();
    let currentViewId = 'family';
    const onRoleChange = [];

    function members() {
      return state.family && Array.isArray(state.family.members)
        ? state.family.members
        : [];
    }

    function getCurrentMember() {
      const familyMembers = members();
      return familyMembers.find((member) => member.id === state.currentMemberId)
        || familyMembers[0]
        || null;
    }

    function hasActiveMeeting() {
      if (state.draftMeeting && state.draftMeeting.status === 'active') return true;
      if (!state.activeMeetingId) return false;
      return state.meetings.some(
        (meeting) => meeting.id === state.activeMeetingId && meeting.status === 'active',
      );
    }

    function isMeetingView(viewId) {
      return viewId === 'meeting-room' || viewId.startsWith('meeting-');
    }

    function renderCurrentView() {
      ui.renderView(currentViewId);
      if (currentViewId === 'family') ui.renderFamily?.(state);
      if (currentViewId === 'meet') ui.renderMeet?.();
      if (currentViewId === 'meeting-room') ui.renderMeetingRoom?.();
    }

    function showView(viewId) {
      if (
        viewId !== currentViewId
        && isMeetingView(currentViewId)
        && !isMeetingView(viewId)
        && hasActiveMeeting()
        && !confirmLeave(LEAVE_CONFIRMATION)
      ) {
        return false;
      }

      currentViewId = viewId;
      renderCurrentView();
      return true;
    }

    function replaceState(nextState) {
      state = nextState;
      ui.renderRole(getCurrentMember());
      ui.renderRoleSheet(members(), getCurrentMember()?.id || null, false);
      renderCurrentView();
    }

    function setCurrentMember(memberId) {
      const member = members().find((candidate) => candidate.id === memberId);
      if (!member) return false;

      state.currentMemberId = member.id;
      store.save(state);
      ui.renderRole(member);
      ui.renderRoleSheet(members(), member.id, false);
      onRoleChange.forEach((callback) => callback(member));
      renderCurrentView();
      return true;
    }

    function openRoleSheet() {
      ui.renderRoleSheet(members(), getCurrentMember()?.id || null, true);
    }

    function closeRoleSheet() {
      ui.renderRoleSheet(members(), getCurrentMember()?.id || null, false);
    }

    const app = {
      showView,
      setCurrentMember,
      getCurrentMember,
      openRoleSheet,
      closeRoleSheet,
      replaceState,
      onRoleChange,
      get currentViewId() {
        return currentViewId;
      },
    };

    renderCurrentView();
    ui.renderRole(getCurrentMember());
    ui.renderRoleSheet(members(), getCurrentMember()?.id || null, false);
    return app;
  }

  function createDomUi(document, familyView, getMeetingFlow) {
    const appRoot = document.querySelector('#app');
    const roleName = document.querySelector('#current-role-name');
    const roleSheet = document.querySelector('#role-sheet');
    const roleList = document.querySelector('#role-list');

    return {
      renderView(viewId) {
        appRoot.querySelectorAll('[data-view-panel]').forEach((panel) => {
          panel.hidden = panel.dataset.viewPanel !== viewId;
        });
        document.querySelectorAll('[data-view]').forEach((tab) => {
          const active = tab.dataset.view === viewId;
          tab.classList.toggle('is-active', active);
          if (active) {
            tab.setAttribute('aria-current', 'page');
          } else {
            tab.removeAttribute('aria-current');
          }
        });
      },

      renderRole(member) {
        roleName.textContent = memberLabel(member);
      },

      renderRoleSheet(members, currentMemberId, open) {
        roleList.replaceChildren();
        members.forEach((member) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'role-sheet__member';
          button.dataset.memberId = member.id;
          button.textContent = memberLabel(member);
          button.classList.toggle('is-active', member.id === currentMemberId);
          roleList.appendChild(button);
        });
        roleSheet.hidden = !open;
        roleSheet.setAttribute('aria-hidden', String(!open));
      },

      renderFamily(state) {
        const panel = appRoot.querySelector('[data-view-panel="family"]');
        familyView.render(panel, state);
      },

      renderMeet() {
        const panel = appRoot.querySelector('[data-view-panel="meet"]');
        getMeetingFlow().renderHub(panel);
      },

      renderMeetingRoom() {
        const panel = appRoot.querySelector('[data-view-panel="meeting-room"]');
        getMeetingFlow().renderRoom(panel);
      },
    };
  }

  function boot() {
    let app;
    let meetingFlow;
    root.FamilyView = root.createFamilyView({
      store: root.Store,
      demoSeed: root.demoSeed,
      onChange: (state) => app.replaceState(state),
    });
    const ui = createDomUi(root.document, root.FamilyView, () => meetingFlow);
    app = createApp({
      store: root.Store,
      ui,
      confirmLeave: (message) => root.confirm(message),
    });
    meetingFlow = root.createMeetingFlow({
      meetingTypes: root.MeetingTypes,
      engine: root.MeetingEngine,
      transcript: root.Transcript,
      store: root.Store,
      app,
    });
    root.MeetingFlow = meetingFlow;

    root.document.querySelectorAll('[data-view]').forEach((tab) => {
      tab.addEventListener('click', () => app.showView(tab.dataset.view));
    });
    root.document.querySelector('#role-switcher').addEventListener('click', app.openRoleSheet);
    root.document.querySelector('#role-sheet-close').addEventListener('click', app.closeRoleSheet);
    root.document.querySelector('#role-sheet-backdrop').addEventListener('click', app.closeRoleSheet);
    root.document.querySelector('#role-list').addEventListener('click', (event) => {
      const memberButton = event.target.closest('[data-member-id]');
      if (memberButton) app.setCurrentMember(memberButton.dataset.memberId);
    });

    root.App = app;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createApp, memberLabel };
  }

  if (root && root.document) {
    root.document.addEventListener('DOMContentLoaded', boot);
  }
}(typeof window !== 'undefined' ? window : globalThis));
