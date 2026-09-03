// Catchment — input.
//
// The game is played on two machines that share nothing about how a person
// touches them, so there are two profiles. Both drive the same six verbs, and
// `game.js` never learns which one is running.
//
//   verb    what it does                panel        web
//   ----    ------------------------    ---------    -------------------------
//   L       cycle charge                L button     A, or 1
//   C       flip parity                 C button     S, or 2
//   R       cycle spin                  R button     D, or 3
//   CCW     move left                   encoder      pointer, or wheel
//   CW      move right                  encoder      pointer, or wheel
//   PRESS   open the deck / activate    encoder      Esc, or Enter
//
// The panel keys stay bound under both profiles, so one page can be driven
// either way and a keyboard still works on the web. The profile decides two
// things only: whether the pointer steers, and which legend the renderer draws.
//
// The encoder reports discrete steps, not an angle, so the only extra
// information it carries is timing: the gap between consecutive steps is the
// rotation speed. A fast spin crosses twice as far as a slow one.
//
// No inversion in the upside-down variant. The panel is mounted upside down and
// the page is rotated to cancel that, so the viewer sees an upright screen, and
// a half turn about the screen normal leaves clockwise clockwise.

/** Always bound. These are the panel's six, and they work everywhere. */
const PANEL_KEYS = {
  ArrowLeft: 'L',
  ' ': 'C',
  Spacebar: 'C',
  ArrowRight: 'R',
  ArrowUp: 'CCW',
  ArrowDown: 'CW',
  Enter: 'PRESS',
};

/** Bound as well under the web profile, where the pointer has taken the
 *  encoder's job and the three dials need somewhere to live that a left hand
 *  can reach while a right hand steers. */
const WEB_KEYS = {
  a: 'L', A: 'L', 1: 'L',
  s: 'C', S: 'C', 2: 'C',
  d: 'R', D: 'R', 3: 'R',
};

// Escape is deliberately absent. app.js binds it, because what it should mean
// depends on the phase — open the deck from a run, close it from inside, the
// way Escape behaves everywhere else. Binding it here as well made both
// handlers fire on one press, so the deck opened and resumed in the same
// keystroke and nothing appeared to happen.

/** Gap at or below this counts as a full-speed spin. */
const FAST_MS = 45;
/** Gap at or above this counts as stopped. */
const SLOW_MS = 400;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function profileFor(doc, search) {
  const q = new URLSearchParams(search).get('controls');
  const v = q || doc.documentElement.dataset.controls;
  return v === 'panel' ? 'panel' : 'web';
}

/** handler(button, velocity). Returns an unbind function. */
export function bindKeys(handler, profile = 'web') {
  const map = profile === 'panel' ? PANEL_KEYS : { ...PANEL_KEYS, ...WEB_KEYS };
  let lastStepAt = 0;
  let lastStep = null;

  function onKeyDown(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const button = map[e.key];
    if (!button || e.repeat) return;
    e.preventDefault();

    let velocity = 0;
    if (button === 'CCW' || button === 'CW') {
      const now = performance.now();
      const gap = button === lastStep ? now - lastStepAt : SLOW_MS;
      velocity = 1 - clamp01((gap - FAST_MS) / (SLOW_MS - FAST_MS));
      lastStepAt = now;
      lastStep = button;
    }
    handler(button, velocity);
  }

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}

/** Where along the field a screen x lands, as 0..1.
 *
 *  `rect` is the canvas's box on screen, `canvasWidth` its own coordinate
 *  width, and `field` the part of those coordinates the game's 0..1 covers —
 *  the canvas has an inset for the panel casing, and ignoring it would make the
 *  pointer drift from the catcher by that margin at both edges.
 *
 *  Returns null when the element has no box at all. That happens whenever the
 *  page is in a hidden pane or an unpainted tab, and returning a number there
 *  would be a division by zero arriving at the game as NaN.
 *
 *  Pure, and exported, so tools/check-table.mjs can check the arithmetic
 *  without a browser. */
export function pointerFraction(clientX, rect, canvasWidth, field) {
  const scale = rect.width / canvasWidth;
  if (!(scale > 0)) return null;
  const x = (clientX - rect.left) / scale;
  return clamp01((x - field.x) / field.w);
}

/** The pointer, under the web profile only. Position is set directly rather
 *  than stepped: the game is handed a fraction and the catcher glides to it,
 *  which is the same glide the encoder gets, so the two feel like one control
 *  rather than two. */
export function bindPointer(canvas, { aim, press, wheel }, fieldOf) {
  function fraction(e) {
    return pointerFraction(e.clientX, canvas.getBoundingClientRect(), canvas.width, fieldOf());
  }

  function onMove(e) {
    const f = fraction(e);
    if (f !== null) aim(f);
  }
  function onDown(e) {
    // A click is the deck: the same verb the encoder's press carries. Left
    // button only, so a context menu or a back button is left alone.
    if (e.button !== 0) return;
    e.preventDefault();
    press();
  }
  function onWheel(e) {
    e.preventDefault();
    wheel(e.deltaY > 0 ? 1 : -1);
  }

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  return () => {
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('wheel', onWheel);
  };
}

/** Touch, for a phone or a tablet. The screen splits into the three dials
 *  along the bottom and a steering strip above them, which is the panel's
 *  layout on a surface that has no buttons. */
export function bindTouch(canvas, { aim, dial, press }, fieldOf) {
  function onDown(e) {
    if (e.pointerType !== 'touch') return;
    const r = canvas.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    if (fy > 0.72) {
      dial(fx < 0.33 ? 'L' : fx < 0.66 ? 'C' : 'R');
    } else {
      const f = pointerFraction(e.clientX, r, canvas.width, fieldOf());
      if (f !== null) aim(f);
    }
    e.preventDefault();
  }
  function onMove(e) {
    if (e.pointerType !== 'touch' || !e.isPrimary) return;
    const r = canvas.getBoundingClientRect();
    if ((e.clientY - r.top) / r.height > 0.72) return;
    const f = pointerFraction(e.clientX, r, canvas.width, fieldOf());
    if (f !== null) aim(f);
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
  };
}

export { PANEL_KEYS, WEB_KEYS };
