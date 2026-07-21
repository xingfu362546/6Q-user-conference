const assert = require('assert');
const Whiteboard = require('../assets/whiteboard.js');

function makeContext() {
  return {
    beginPath() {}, clearRect() {}, moveTo() {}, lineTo() {}, stroke() {},
    strokeRect() {}, ellipse() {}, save() {}, restore() {}, setTransform() {},
  };
}

function makeCanvas() {
  const listeners = {};
  const context = makeContext();
  return {
    width: 640,
    height: 360,
    clientWidth: 640,
    clientHeight: 360,
    dataset: {},
    getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 360 }),
    addEventListener: (type, handler) => { listeners[type] = handler; },
    setPointerCapture() {},
    toDataURL: () => 'data:image/png;base64,board',
    fire(type, x, y) {
      listeners[type]({
        clientX: x,
        clientY: y,
        pointerId: 1,
        preventDefault() {},
      });
    },
  };
}

{
  const meeting = { whiteboard: { strokes: [] } };
  const canvas = makeCanvas();
  let changes = 0;
  const mounted = Whiteboard.mount(canvas, meeting, {
    getMemberId: () => 'member-a',
    getMemberColor: () => '#e76f51',
    onChange: () => { changes += 1; },
  });

  mounted.setTool('pen');
  canvas.fire('pointerdown', 10, 20);
  canvas.fire('pointermove', 30, 40);
  canvas.fire('pointerup', 50, 60);

  assert.strictEqual(meeting.whiteboard.strokes.length, 1);
  assert.strictEqual(meeting.whiteboard.strokes[0].memberId, 'member-a');
  assert.strictEqual(meeting.whiteboard.strokes[0].tool, 'pen');
  assert.strictEqual(meeting.whiteboard.strokes[0].color, '#e76f51');
  assert.deepStrictEqual(meeting.whiteboard.strokes[0].points, [
    { x: 10, y: 20 },
    { x: 30, y: 40 },
    { x: 50, y: 60 },
  ]);
  assert.strictEqual(changes, 1);
}

{
  const meeting = { whiteboard: { strokes: [] } };
  const canvas = makeCanvas();
  const mounted = Whiteboard.mount(canvas, meeting, {
    getMemberId: () => 'member-b',
    getMemberColor: () => '#457b9d',
  });

  ['rect', 'circle', 'line', 'arrow'].forEach((tool, index) => {
    mounted.setTool(tool);
    canvas.fire('pointerdown', 10 + index, 20 + index);
    canvas.fire('pointerup', 100 + index, 120 + index);
  });

  assert.deepStrictEqual(
    meeting.whiteboard.strokes.map((stroke) => stroke.tool),
    ['rect', 'circle', 'line', 'arrow'],
  );
  assert.deepStrictEqual(meeting.whiteboard.strokes[0].shape, {
    start: { x: 10, y: 20 },
    end: { x: 100, y: 120 },
  });
}

{
  const meeting = {
    whiteboard: {
      strokes: [
        { id: 'a1', memberId: 'member-a' },
        { id: 'b1', memberId: 'member-b' },
        { id: 'a2', memberId: 'member-a' },
      ],
    },
  };

  Whiteboard.clearOwn(meeting, 'member-a');
  assert.deepStrictEqual(meeting.whiteboard.strokes, [{ id: 'b1', memberId: 'member-b' }]);
}

{
  const meeting = { whiteboard: { strokes: [] } };
  const canvas = makeCanvas();
  assert.strictEqual(
    Whiteboard.snapshot(canvas, meeting),
    'data:image/png;base64,board',
  );
  assert.strictEqual(meeting.whiteboard.snapshot, 'data:image/png;base64,board');
}

console.log('whiteboard.test.js OK');
