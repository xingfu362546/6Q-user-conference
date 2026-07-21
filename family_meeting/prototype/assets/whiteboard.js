(function (root) {
  const DRAW_TOOLS = ['pen', 'eraser', 'rect', 'circle', 'line', 'arrow'];

  function ensureBoard(meeting) {
    if (!meeting.whiteboard) meeting.whiteboard = {};
    if (!Array.isArray(meeting.whiteboard.strokes)) meeting.whiteboard.strokes = [];
    return meeting.whiteboard;
  }

  function drawLine(context, start, end) {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }

  function drawArrow(context, start, end) {
    drawLine(context, start, end);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const head = 12;
    context.beginPath();
    context.moveTo(end.x, end.y);
    context.lineTo(
      end.x - head * Math.cos(angle - Math.PI / 6),
      end.y - head * Math.sin(angle - Math.PI / 6),
    );
    context.moveTo(end.x, end.y);
    context.lineTo(
      end.x - head * Math.cos(angle + Math.PI / 6),
      end.y - head * Math.sin(angle + Math.PI / 6),
    );
    context.stroke();
  }

  function drawStroke(context, stroke) {
    context.save();
    context.strokeStyle = stroke.color || '#4a90a4';
    context.lineWidth = stroke.width || 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalCompositeOperation = stroke.tool === 'eraser'
      ? 'destination-out'
      : 'source-over';

    if (stroke.points) {
      context.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.stroke();
    } else if (stroke.shape) {
      const { start, end } = stroke.shape;
      const width = end.x - start.x;
      const height = end.y - start.y;
      if (stroke.tool === 'rect') {
        context.strokeRect(start.x, start.y, width, height);
      } else if (stroke.tool === 'circle') {
        context.beginPath();
        context.ellipse(
          start.x + width / 2,
          start.y + height / 2,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0,
          0,
          Math.PI * 2,
        );
        context.stroke();
      } else if (stroke.tool === 'arrow') {
        drawArrow(context, start, end);
      } else {
        drawLine(context, start, end);
      }
    }
    context.restore();
  }

  function mount(canvasEl, meeting, options = {}) {
    const context = canvasEl.getContext('2d');
    const board = ensureBoard(meeting);
    let tool = 'pen';
    let width = 3;
    let activeStroke = null;

    function redraw(preview) {
      context.clearRect(0, 0, canvasEl.width, canvasEl.height);
      board.strokes.forEach((stroke) => drawStroke(context, stroke));
      if (preview) drawStroke(context, preview);
    }

    function pointFrom(event) {
      const rect = canvasEl.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (canvasEl.width / rect.width),
        y: (event.clientY - rect.top) * (canvasEl.height / rect.height),
      };
    }

    function newStroke(point) {
      const memberId = options.getMemberId?.();
      const color = options.getMemberColor?.(memberId) || '#4a90a4';
      const stroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        memberId,
        tool,
        color,
        width: tool === 'eraser' ? Math.max(width * 4, 14) : width,
      };
      if (tool === 'pen' || tool === 'eraser') stroke.points = [point];
      else stroke.shape = { start: point, end: point };
      return stroke;
    }

    canvasEl.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      canvasEl.setPointerCapture?.(event.pointerId);
      activeStroke = newStroke(pointFrom(event));
    });

    canvasEl.addEventListener('pointermove', (event) => {
      if (!activeStroke) return;
      const point = pointFrom(event);
      if (activeStroke.points) activeStroke.points.push(point);
      else activeStroke.shape.end = point;
      redraw(activeStroke);
    });

    function finish(event) {
      if (!activeStroke) return;
      const point = pointFrom(event);
      if (activeStroke.points) activeStroke.points.push(point);
      else activeStroke.shape.end = point;
      board.strokes.push(activeStroke);
      activeStroke = null;
      redraw();
      options.onChange?.(meeting);
    }

    canvasEl.addEventListener('pointerup', finish);
    canvasEl.addEventListener('pointercancel', () => {
      activeStroke = null;
      redraw();
    });
    redraw();

    return {
      setTool(nextTool) {
        if (DRAW_TOOLS.includes(nextTool)) tool = nextTool;
        return tool;
      },
      setWidth(nextWidth) {
        width = Math.max(1, Number(nextWidth) || 1);
        return width;
      },
      redraw,
    };
  }

  function clearOwn(meeting, memberId) {
    const board = ensureBoard(meeting);
    board.strokes = board.strokes.filter((stroke) => stroke.memberId !== memberId);
    return meeting;
  }

  function snapshot(canvasEl, meeting) {
    const dataUrl = canvasEl.toDataURL('image/png');
    ensureBoard(meeting).snapshot = dataUrl;
    return dataUrl;
  }

  const Whiteboard = { mount, clearOwn, snapshot };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Whiteboard;
  }
  if (root) root.Whiteboard = Whiteboard;
}(typeof window !== 'undefined' ? window : globalThis));
