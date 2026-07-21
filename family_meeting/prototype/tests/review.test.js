const assert = require('assert');
const Review = require('../assets/review.js');

function container() {
  const handlers = {};
  return {
    innerHTML: '',
    querySelectorAll(selector) {
      if (selector !== '[data-review-id]') return [];
      return [...this.innerHTML.matchAll(/data-review-id="([^"]+)"/g)].map((match) => ({
        dataset: { reviewId: match[1] },
        addEventListener: (type, handler) => {
          handlers[`${type}:${match[1]}`] = handler;
        },
      }));
    },
    querySelector(selector) {
      if (selector !== '[data-review-action="back"]') return null;
      return {
        addEventListener: (type, handler) => {
          handlers[`${type}:back`] = handler;
        },
      };
    },
    click(id) {
      handlers[`click:${id}`]?.();
    },
  };
}

const older = {
  id: 'meeting-old',
  typeId: '01',
  topicId: '01-1',
  status: 'archived',
  createdAt: 100,
  archivedAt: 200,
  transcript: [],
  whiteboard: { strokes: [], snapshot: 'data:image/png;base64,old' },
  insights: { common: [], core: [] },
  actionPlan: { candidates: [], selectedIds: [] },
};
const newer = {
  id: 'meeting-new',
  typeId: '02',
  topicId: '02-3',
  status: 'archived',
  createdAt: 300,
  archivedAt: 400,
  transcript: [{ id: 'line-1', text: '每晚九点放下手机', tags: ['keyword'] }],
  whiteboard: { strokes: [], snapshot: 'data:image/png;base64,new' },
  insights: {
    common: ['规律作息'],
    core: [{ text: '睡前不看手机', mark: 'star', color: '#f2b84b' }],
  },
  actionPlan: {
    candidates: [{ id: 'action-1', title: '九点收手机', assigneeId: 'member-1' }],
    selectedIds: ['action-1'],
    agreedTime: '每天 21:00',
  },
};
const state = {
  meetings: [newer, { ...older, status: 'active' }, older],
  todos: [
    { id: 'todo-1', meetingId: 'meeting-new', title: '九点收手机', assigneeId: 'member-1', status: 'done' },
    { id: 'todo-2', meetingId: 'meeting-new', title: '记录睡眠', assigneeId: 'member-2', status: 'open' },
  ],
};

{
  const target = container();
  Review.renderList(target, state);
  assert.match(target.innerHTML, /除杂草/);
  assert.match(target.innerHTML, /上网时间/);
  assert.match(target.innerHTML, /1\/2/);
  assert.ok(
    target.innerHTML.indexOf('meeting-new') < target.innerHTML.indexOf('meeting-old'),
    '归档会议应按时间倒序',
  );
  assert.doesNotMatch(target.innerHTML, /status="active"/);

  target.click('meeting-new');
  assert.match(target.innerHTML, /会议回顾/);
  assert.match(target.innerHTML, /每晚九点放下手机/);
  assert.match(target.innerHTML, /data:image\/png;base64,new/);
  assert.match(target.innerHTML, /睡前不看手机/);
  assert.match(target.innerHTML, /九点收手机/);
  assert.match(target.innerHTML, /已完成/);
  assert.match(target.innerHTML, /待完成/);
  assert.doesNotMatch(target.innerHTML, /type="checkbox"|<input|<textarea|<select/);

  target.click('back');
  assert.match(target.innerHTML, /会议回顾/);
  assert.match(target.innerHTML, /data-review-id="meeting-new"/);
}

{
  const target = container();
  Review.renderDetail(target, newer, state.todos);
  assert.match(target.innerHTML, /行动进度 1\/2/);
}

console.log('review.test.js OK');
