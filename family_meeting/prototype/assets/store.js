const STORAGE_KEY = 'family-meeting-app';

function defaultState() {
  return {
    family: null,
    currentMemberId: null,
    meetings: [],
    todos: [],
    draftMeeting: null,
  };
}

function createStore(storage) {
  return {
    load() {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      try {
        return { ...defaultState(), ...JSON.parse(raw) };
      } catch {
        return defaultState();
      }
    },

    save(state) {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    },

    reset() {
      storage.removeItem(STORAGE_KEY);
    },
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createStore };
}

if (typeof window !== 'undefined' && window.localStorage) {
  window.Store = createStore(window.localStorage);
}
