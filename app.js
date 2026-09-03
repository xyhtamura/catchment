// Catchment — wiring. The only file that touches the DOM.

import { createGame, step, press, turn, aim } from './game.js';
import { draw, layout, safeFor, W, H } from './render.js';
import { bindKeys, bindPointer, bindTouch, profileFor } from './input.js';

document.getElementById('fallback')?.remove();

const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d', { alpha: false });
canvas.width = W;
canvas.height = H;

const profile = profileFor(document, location.search);
const L = layout(safeFor(document, location.search));
// The renderer draws whichever legend matches how the page is actually driven.
L.controls = profile;

let g = createGame(Math.floor(Math.random() * 1e9));

// The field rectangle inside the canvas, so the pointer lands where the
// catcher is rather than off by the casing inset at each edge.
const fieldOf = () => ({ x: L.x, w: L.w });

bindKeys((button, velocity) => {
  if (button === 'CCW' || button === 'CW') turn(g, button === 'CCW' ? -1 : 1, velocity);
  else press(g, button);
}, profile);

if (profile === 'web') {
  // Escape opens the deck from a run and closes it from inside, which is what
  // Escape means everywhere else. `C` is the game's resume verb, so that is
  // what it becomes once the deck is open.
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    press(g, g.phase === 'menu' ? 'C' : 'PRESS');
  });

  bindPointer(canvas, {
    aim: (x) => aim(g, x),
    press: () => press(g, 'PRESS'),
    wheel: (dir) => (g.phase === 'menu' ? press(g, dir > 0 ? 'CW' : 'CCW') : turn(g, dir, 0)),
  }, fieldOf);

  bindTouch(canvas, {
    aim: (x) => aim(g, x),
    dial: (button) => press(g, button),
    press: () => press(g, 'PRESS'),
  }, fieldOf);
}

// One clock. dt is capped so a backgrounded tab does not resume by stepping a
// minute of beam into a single frame.
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  step(g, dt);
  draw(ctx, g, L);
  requestAnimationFrame(frame);
}

/** Canvas does not wait for a webfont: text drawn before a face arrives is
 *  drawn in the fallback and never repainted, so the first seconds would be in
 *  the wrong type. Wait for both, but never longer than a second — on the panel
 *  a missing font must not mean a missing game. */
async function ready() {
  if (!document.fonts) return;
  const faces = [
    document.fonts.load('16px Moulimie', 'CATCHMENT'),
    document.fonts.load('13px "Terminal Grotesque"', 'recorded'),
  ];
  try {
    await Promise.race([
      Promise.all(faces),
      new Promise((r) => setTimeout(r, 1000)),
    ]);
  } catch { /* draw in the fallback rather than not at all */ }
}

ready().then(() => {
  last = performance.now();
  requestAnimationFrame(frame);
});

// Exposed for the console and for the headless checks in tools/. Nothing in the
// game reads it back.
window.catchment = {
  get game() { return g; },
  layout: L,
  profile,
  restart(seed) { g = createGame(seed ?? 1); },
};
