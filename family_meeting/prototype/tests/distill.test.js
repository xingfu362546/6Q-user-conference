const assert = require('assert');
const Distill = require('../assets/distill.js');

const meeting = {
  transcript: [
    { id: 'line-1', text: '普通记录', tags: [] },
    { id: 'line-2', text: '带标签的想法', tags: ['idea'] },
    { id: 'line-3', text: '关键词记录', tags: ['keyword'] },
  ],
  whiteboard: { snapshot: 'data:image/png;base64,snapshot' },
};

{
  const container = {
    innerHTML: '',
    querySelector: () => null,
    querySelectorAll: () => [],
  };

  Distill.render(container, meeting, { isHost: false, onSave: () => {} });

  assert.match(container.innerHTML, /data-distill-step="integrate"/);
  assert.match(container.innerHTML, /data:image\/png;base64,snapshot/);
  assert.ok(
    container.innerHTML.indexOf('带标签的想法') < container.innerHTML.indexOf('普通记录'),
    '整合页应优先展示带标签的转写',
  );
}

{
  let savedInsights = null;
  const session = Distill.createSession(meeting, {
    isHost: true,
    onSave: (insights) => {
      savedInsights = insights;
    },
  });

  assert.strictEqual(session.step, 'integrate');
  session.next();
  assert.strictEqual(session.step, 'common');
  session.setCommon(['共同散步', '减少催促', '周日复盘']);
  session.next();
  assert.strictEqual(session.step, 'core');

  session.setCore(['共同散步', '减少催促']);
  assert.deepStrictEqual(session.coreGate(), {
    ok: false,
    reason: '请选择 3–5 条核心洞见（当前 2 条）',
  });

  session.setCore(['共同散步', '减少催促', '周日复盘']);
  assert.deepStrictEqual(session.coreGate(), { ok: true, reason: '' });
  session.next();
  assert.strictEqual(session.step, 'mark');
  session.setMark('共同散步', 'star', '#f2b84b');
  session.setMark('减少催促', 'heart', '#dc6b7a');
  session.save();

  assert.deepStrictEqual(savedInsights, {
    common: ['共同散步', '减少催促', '周日复盘'],
    core: [
      { text: '共同散步', mark: 'star', color: '#f2b84b' },
      { text: '减少催促', mark: 'heart', color: '#dc6b7a' },
      { text: '周日复盘', mark: 'none' },
    ],
  });
}

console.log('distill.test.js OK');
