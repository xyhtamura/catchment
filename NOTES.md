# Catchment — notes

A particle catcher. Particles fall from above with species symbols, and the
catcher is a detector aperture with three settings — charge, parity, and spin.
It absorbs a particle only when all three settings match and the particle lands
inside its width.

**Its own repository**, published at `xyhtamura.github.io/catchment/`. It runs
in two places off one codebase: a web game driven by a pointer, and a
1024×600 panel on a Raspberry Pi driven by three buttons and a rotary encoder.
It shares that panel and that key map with
[`deskarium`](../deskarium/deskarium.md) and shares no code with it.

Sibling in method to [`confinery/`](../confinery/NOTES.md), which is the
source of every mass, lifetime and decay channel here, and to
[`coping/`](../coping/NOTES.md): rules taken from measured tables, with a
model card separating the measured from the invented.

---

## Running it

Static, build-free, browser-native ES modules. Nothing here goes through Vite,
and `npm run build` does not touch it.

Through the root server on 8000:

```bash
serve_root.bat
```

Then `http://localhost:8000/deskarium/catchment/`. Published, it is
`https://xyhtamura.github.io/deskarium/catchment/`. The upside-down variant is
`upside-down.html`; the panel's own page is `rpi/`, and
[`rpi/README.md`](rpi/README.md) has the install.

The table checker runs under node and needs no dependencies:

```bash
node tools/check-table.mjs
```

## Where this lives

Its own repository, and it spent part of 2026-09-03 inside
`deskarium/catchment/` before moving back out. Worth recording why it went both
ways, because the reasoning is the reusable part.

**Why it went in.** Deskarium is already a published repository, and GitHub
Pages serves that repository's *root* rather than `dist/` — checked by fetching
`https://xyhtamura.github.io/deskarium/package.json`, which comes back as the
real file. So a plain folder there is already a URL, and riding along cost
nothing.

**Why it came back out.** It acquired a web build with pointer controls, which
made it a game someone might link to from a CV, and a portfolio URL should not
carry another project's name. `xyhtamura.github.io/catchment/` is the address;
`.../deskarium/catchment/` is not.

**Deskarium keeps no copy.** A vendored stamp was the other option and was
rejected: this changes often, and a copy that has to be re-vendored on every
change is a copy that drifts. A Pi that wants both clones both, which is one
extra line in the install notes. If it ever does live inside another repository
again, `deskarium/vite.config.ts` keeps the note on what that costs — its
service worker's navigation fallback will answer a bare directory URL with the
wrong page and no error anywhere.

The `package.json` declares no dependencies and no build. It is there so `node`
treats `tools/` as modules, and it says on its face that there is nothing to
install.

## The loop

The beam drops particles into a continuous field. The catcher is one aperture,
about twelve per cent of the field wide, and it holds one setting at a time, so
a run is a sequence of decisions about **what to be ready for** rather than
about reflexes.

An absorbed particle enters the **stack** — the detector's active volume — and
the tables take over there:

- **Decay adds occupants.** Unstable particles decay after set lifetimes and
  leave decay products in the stack (for example, `π⁰ → γ γ` and `n → p e⁻ ν̄ₑ`
  convert one held particle into multiple products). Emitted neutrinos escape
  the detector volume as missing energy.
- **Reactions consume occupants.** Annihilation, binding, and pair production
  consume two held particles and launch reaction products back into the field,
  where catching them extends the multiplier chain.

Exceeding the stack capacity of six causes a **pile-up**: overlapping events in
one readout window prevent reconstruction, resetting the chain and clearing all
held particles as missing energy. Missing a particle is not penalised; the
readout tracks missed particles as normal detector inefficiency rather than
deducting score.

## Continuous, and what that bought

The field was nine discrete lanes until 2026-09-03. Continuous position is not
only smoother; it is the thing that makes the next paragraph possible, and that
is the argument for it.

**Charge bends the track.** A charged particle in a magnetic field travels on an
arc of radius `r = p / qB`, so the sign of the charge decides which way it turns
and a faster particle turns less. That is how a real tracker reads the sign of a
charge off a photograph, and here it means **the bend tells you what something
is before its letter is legible**. Neutral particles fall straight. The track
drawn behind each particle is recovered by running the same turn backwards, so
the trail is exactly the arc the particle flew rather than a stored history.

It also gives the picture the field is famous for: pair production ejects an
electron and a positron from the same point, and they leave as two mirrored
arcs.

**The strength of the field is invented, and the reason it was chosen is worth
recording.** At a realistic strength the slowest particles curl up and spiral
out of the apparatus without reaching the plane. That is a real effect — a
looper — and it made the cheapest particles unreachable, which
`tools/check-table.mjs` caught by asserting that a 150 MeV positron lands. The
field was weakened until it does. The physics that survived is the *shape* of
the rule: direction from the sign, radius from the momentum.

## Three dials, three visual channels

A particle's three quantum numbers are drawn as its three visual channels, and
they are the three the buttons turn:

| Button | Quantum number | Channel | |
| :--- | :--- | :--- | :--- |
| **L** | charge | **colour** | warm positive, cool negative, pale neutral |
| **C** | parity | **fill** | solid for +, outlined for − |
| **R** | spin | **shape** | square for 0, circle for ½, star for 1 |

So the catcher is drawn with its own current setting, and *will this one go in*
is a comparison of two drawings rather than a lookup of two triples. Every place
a species appears — falling, held in the stack, in the legend, on the title
roster — goes through one `token()` function, so the three channels cannot
disagree between one part of the screen and another.

One channel is fixed by physics: **a neutrino is drawn with a dashed border
because it lacks a definite parity state**, matching the constraint that
prevents any catcher setting from tuning to it.

## Two control profiles

One codebase, two machines that share nothing about how a person touches them.
Both drive the same six verbs, and `game.js` never learns which is running.

| Verb | Panel | Web |
| :--- | :--- | :--- |
| charge | L button | `A`, or `1` |
| parity | C button | `S`, or `2` |
| spin | R button | `D`, or `3` |
| move | encoder, stepped | pointer, direct — or the wheel, stepped |
| the deck | press the encoder | `Esc`, or click |

The profile comes from `data-controls` on the page, overridable with
`?controls=panel`. **The panel keys stay bound under both**, so the web page
still plays from a keyboard and a panel page can be driven from one during
development. The profile decides two things only: whether the pointer steers,
and which legend the renderer draws — `KEYCAP` in `render.js` is the single
place the on-screen names come from, so the title screen cannot promise a
button the page does not have.

**The pointer sets position directly** rather than stepping it, and the catcher
still glides to it, so the mouse and the encoder feel like one control rather
than two.

Two details that were bugs first:

- **Escape is bound in `app.js` only.** What it should mean depends on the
  phase — open the deck from a run, close it from inside — and having it in
  the key map as well meant one press did both in the same keystroke, so
  nothing appeared to happen.
- **The pointer mapping returns `null` when the canvas has no box.** A hidden
  pane or an unpainted tab gives every element a zero-width rectangle, and the
  division by zero would otherwise reach the game as `NaN`.
  `pointerFraction()` is a pure function for exactly this reason: it is checked
  in `tools/`, without a browser.

## The deck

Pressing the encoder pauses and brings up a deck of cards: what the catch is,
what the dials do, the recipes for annihilation, pair production, binding and
decay, what pile-up costs, what the readout means, what cannot be caught, and
restart. Turning moves through the deck. **C always resumes**, so a player
parked on Restart can leave without restarting and nobody restarts by accident.
Each card says on its own face what pressing will do there.

The run stays visible under the deck, washed back, so pausing looks like a held
frame rather than a different screen.

**The cards are built from the tables, not written beside them.**
[`cards.js`](cards.js) reads `data/particles.js` at the moment the deck is
asked for, so a recipe on a card is the recipe the game runs, adding a channel
to the table adds it to the deck, and the two cannot drift. Same rule the model
card follows. `deckSummary()` exists so the checker can assert the deck still
carries its reactions after a table change.

## Type

Three roles, and the third is the one that matters.

| Role | Face | Used for |
| :--- | :--- | :--- |
| Display | Moulimie | The title and card headings. Nothing small. |
| Interface | Terminal Grotesque | Everything read while playing. |
| Symbols | `"DejaVu Sans", "Segoe UI Symbol", system-ui` | Particle letters, and only those. |

**Particle symbols stay on a system stack on purpose.** They need Greek letters,
superscript signs and the combining macron in `p̄` and `n̄`. A display face with
a partial character set would render a blank disc where the whole game is the
letter, and it would fail silently. `SYM` in `render.js` is the one place this
is set.

Provenance, and one font that was asked for and declined, are in
[`ASSETS.md`](ASSETS.md).

A note on the two glyphs that matter most: **γ and ν look alike at 24 px**, and
they are the thing you chase and the thing you can never have. The letters do
not separate them; colour, fill and shape do — a photon is an outlined star, a
neutrino a dashed circle. That is the encoding earning its keep rather than a
problem to fix.

## How accurate this has to be

**Vaguely justifiable is the standard**, set by Xyh on 2026-09-03. A reaction
should point at something real and should not be an invented combination that
corresponds to nothing, but this is a demonstration of a shape a thing could
take rather than a physics tool, and it does not have to be right everywhere to
be worth playing.

That downgrades the `pdg?` values from a correctness job to a tidying one. It
does not downgrade the conservation gate: charge, baryon number and both lepton
numbers still balance across every channel and `tools/check-table.mjs` still
fails if they do not. The difference between a physics game and a
physics-shaped game is that the gate is real, not that every digit is.

The weakest entries by this standard are named in the model card and again at
the end of this file, so a later pass knows where to start.

## Three energy accounts, and why the middle one is separate

- **Recorded** — absorbed and reconstructed. The score.
- **Missing** — landed inside the aperture and left no record. What a detector
  is judged on.
- **Outside acceptance** — landed outside it, or curled out of the field
  sideways. Never entered the apparatus.

The third is not a failure of the readout, it is geometry, and folding it into
the second would make the fraction meaningless. Splitting them is what lets *of
what entered, recorded: 71%* mean something.

## Decisions that are the piece rather than implementation

**Nothing can be tuned to take a neutrino.** The weak interaction does not
conserve parity and a neutrino is produced in a definite helicity rather than a
definite parity, so it has no value on that axis to match. That and the
permanent `free quarks 0` are the two places where the physics, rather than a
difficulty curve, decides what the player cannot have.

**Two species may share a setting.** `e⁻` and `μ⁻` are both `−1 + ½`, so the
aperture takes either. Quantum numbers alone do not separate an electron from a
muon; a real detector needs penetration depth for that.

**Confinement arrives as a jet.** A quark knocked loose upstream is on a string
that stores energy as it stretches, until the energy makes a new pair and the
string breaks — so what reaches any detector is a spray of hadrons fanning out
from one point, never the quark. The **drag gesture** in
[confinery's spec §3.4](../unbuilt/confinery_spec_20260902.md) — pulling a
tether until it snaps, with the stored energy legible — is not built. A jet
arriving already fragmented is the cheap version of it.

**Binding energy is computed, never written down.** `p + n → d γ` releases the
mass deficit, and the deficit is read off the same masses the simulation uses,
so the two cannot disagree. The checker asserts it is positive: if it were not,
the deuteron would not be bound.

**The simulation knows nothing about pixels.** Normalised `[0,1]` in both axes,
no DOM, which is confinery's rule and deskarium's before it. It is what made the
whole verification below possible, and it is what `tools/` needs.

**Time is compressed and the compression is shown.** Measured mean lives run
from 8.4×10⁻¹⁷ s to stable; on screen they run 0.35 s to held. `log10` of the
lifetime maps onto that range, which preserves the ordering and nothing else.
The model card prints both columns side by side.

## Layout

| File | Holds |
| :--- | :--- |
| `README.md` | The repository's landing page, aimed at a visitor |
| `index.html` | The web build. Pointer and keyboard |
| `upside-down.html` | The same page, rotated half a turn |
| `rpi/index.html` | The panel's page: rotated, and inset further. A deployment target, not a third variant |
| `rpi/README.md` | Install, kiosk, and how to dial in the inset |
| `catchment.css` | Canvas sizing and the rotation. Everything else is painted |
| `data/particles.js` | 17 species with charge, parity, spin, mass and lifetime; 10 decay channels, 5 annihilations, 3 pair channels, 1 binding. Every value carries a provenance tag |
| `game.js` | The game, the curvature, the arc integrators and the deck state. No DOM |
| `cards.js` | The pause deck, built from the tables so its recipes cannot drift |
| `fonts/` | Two faces and the OFL text for one of them. See `ASSETS.md` |
| `render.js` | The painter. One `token()` for every species anywhere on screen |
| `input.js` | Both control profiles, the encoder's speed, and the pointer mapping |
| `app.js` | The only file that touches the DOM |
| `modelcard.js` | The model card, built from `data/particles.js` and `game.js` so it cannot drift from them |
| `tools/check-table.mjs` | The validator, the field checks, and a headless run |
| `ASSETS.md` | Provenance of the numbers. No third-party file ships |
| `package.json` | Declares no build and no dependencies |

## The inset

The Pi's casing covers a few millimetres of the outer glass. Nothing is drawn in
the outer margin: 22 px on the web pages, 28 px on the panel page, overridable
per load with `?bezel=`. The attribute in `rpi/index.html` is where an install
keeps the number it settled on; the query parameter is for dialling it in while
looking at the real enclosure.

## Verification

Run 2026-09-03, after the move and the rewrite.

**The table.** `node tools/check-table.mjs` exits 0. It confirms charge, baryon
number and both lepton numbers balance across all 10 decay channels, 5
annihilations, 3 pair channels and the binding; that branching ratios sum to 1;
that no decay makes more mass than its parent; that everything with a finite
lifetime has channels; and that antiparticles negate `q`, `b`, `lₑ` and `l_μ`.

**The parity check caught the check, not the table.** Its first version asserted
that an antiparticle's intrinsic parity is always the opposite of the
particle's. That holds for fermions and not for bosons, so it failed on `π⁺/π⁻`,
which are pseudoscalars and both `−1`. The table was right. The assertion now
branches on `J`, which means it would still catch the transcription error it was
written for.

**The aperture.** 11 of the 18 settings the dials can reach take anything. Every
species the beam delivers is reachable by some setting. **No setting takes a
neutrino** — asserted over all 18 × 4 combinations, not argued.

**The magnetic field does what the interface claims.** Sampled every frame of a
whole run: positive tracks turned one way 2,657 times, negative tracks the other
way 2,203 times, and neutral tracks stayed exactly straight 36,440 times. A 150
MeV positron lands 0.156 of the field width from straight down and a 1500 MeV
one lands 0.015, so a faster track is straighter and the curvature reads as
momentum.

**That check found the field was too strong.** At the first value a 150 MeV
positron curled out of the side of the apparatus and never reached the plane —
correct physics, and it made the cheapest particles uncatchable. The number came
down until the assertion passed.

**A headless 120-second run**, no browser and no canvas, driven by an autopilot
that picks the lowest falling particle, walks the dials to its quantum numbers,
and steers to where the particle **will** cross the plane rather than to where
it is now, because a charged track curves:

| | |
| ---: | :--- |
| absorbed | 117 |
| passed | 197 |
| reactions | 34 |
| pile-ups | 10 |
| recorded | 203.7 GeV |
| missing | 81.8 GeV |
| outside acceptance | 222.1 GeV |
| of what entered, recorded | 71.3% |
| longest chain | 12 |
| free quarks | 0 |

The autopilot exists because a random pilot proves nothing here: it would show
only that the game is hard. It is also the reference for what playing well
costs, since its presses are throttled to roughly a human's rate.

**Every mechanism fires.** Observed in the log across that run: `π⁰ → γ γ`,
`π⁺ → μ⁺ ν`, `μ⁻ → e⁻ ν ν`, `n → p e⁻ ν`, `n̄ → p̄ e⁺ ν`; `e⁻ e⁺ → γ γ`,
`μ⁻ μ⁺ → γ γ`, `π⁺ π⁻ → γ γ`, `p p̄ → π⁺ π⁻ π⁰`, `n n̄ → π⁺ π⁻ π⁰`;
`γ γ → e⁻ e⁺`, `γ γ → π⁺ π⁻`; and `p n → d γ (2.22 MeV bound)`.

**Runs are reproducible.** The same seed twice gives the same figures; a
different seed gives different ones.

**The deck opens, moves, resumes and restarts.** Driven through `press()` with
no renderer: `Enter` from a run gives `phase: 'menu'`, two `CW` land on card 2
of 9, `C` returns to `run`, and `Enter` on the Restart card resets the clock and
the score to zero. The deck reports 9 cards carrying 13 reaction rows, all of
them read out of `data/particles.js`.

**Both faces load and are in before the first frame.** `document.fonts.check`
returns true for each after `document.fonts.ready`, and the files are fetched
from `deskarium/catchment/fonts/` rather than from the site's font folder — the
copy is the point, since `xyhtamura.github.io/` is a subfolder locally and the
origin root when published, so a path to it cannot be the same in both places.
`app.js` waits for both, with a one-second cap: on the panel a missing font must
not mean a missing game.

**Looking found one more layout fault.** The display face is much wider than
the interface face at the same size, so the header title ran under the timer
bar. That row is now measured rather than positioned by a guessed offset.

**Frames have been seen** — play, title and end screen, in the light palette.
The Browser pane was hidden throughout, which pauses `requestAnimationFrame`, so
the loop was stepped by hand in page context and the canvas pulled out as a PNG
and looked at. Looking is what found the trails too short to read a bend off,
the admitted-particle halo reading as a second circle, the catcher reading as a
slab rather than a funnel, and three rows of controls that did not fit in the
space under the plane. None of those would have failed a check.

**Browser and node agree.** The end screen for seed 7 in Chromium reads 203.7
GeV, 117 absorbed, 34 reactions, 10 pile-ups, longest chain 12 — the same
figures `tools/check-table.mjs` reports for the same seed under node.

**Both variants are rotated and the panel reads its own inset.** Checked by
computed style: `upside-down.html` and `rpi/` both give
`matrix(-1, 0, 0, -1, 0, 0)` on the canvas, and `rpi/`'s `data-bezel="28"`
arrives as `layout.safe === 28`. The model-card button is absent on the panel
page, which is correct — it has no pointer to open it with.

**The real key path works.** `Enter` starts a run, `ArrowLeft`/`Space`/
`ArrowRight` turn the three dials, and two quick `ArrowDown`s move further than
two slow ones, which is the encoder's speed being read from the gap between
steps.

## Undone / known rough

- **The panel has not run it.** Everything above was checked in desktop Chromium
  against a 1024×600 canvas. Frame rate on a Pi 4B is open, and so is whether
  the light palette survives a small panel at whatever brightness it runs at —
  the whole look was chosen on a desktop monitor.
- **28 px is a guess.** The inset was chosen without the enclosure in front of
  anyone. `rpi/README.md` says how to dial it in.
- **Difficulty was tuned by autopilot, not by a person playing.** 71% of entered
  energy recorded and ten pile-ups in two minutes is a machine's run, and the
  machine steers by integrating each track forward to the plane, which a person
  cannot do. Whether three dials plus a moving target is too much to hold is the
  question a human answers.
- **The field strength is a compromise and the honest version is absent.** Real
  loopers — soft tracks that curl up and never reach the detector — were tuned
  out because they made the game unplayable. A mode that turns the field back up
  and lets them happen would be worth seeing.
- **Confinement is a jet, not the tether.** Confinery's §3.4 is unbuilt in both
  projects.
- **The detector view is not built.** Confinery's spec §4 — the true world
  replaced by what an instrument would have recorded — is adjacent to this game
  and is not this game. Catchment shows the true world and lets you fail to
  record it.
- **Nobody has moved a mouse across it.** The pointer mapping is checked in
  `tools/` and the wiring is exercised through the wheel and the click, but the
  hidden pane gives the canvas no box, so steering has never been driven
  end to end. First thing to try in a real browser window.
- **`pdg?` values.** Electron, muon, proton, neutron and deuteron masses and
  lifetimes are written from general knowledge and unchecked. Under the accuracy
  standard above this is tidying rather than a correctness job. The same values
  are in `confinery/data/species.js`; fixing one file alone leaves the two
  disagreeing. See [`ASSETS.md`](ASSETS.md) and
  [`DEPENDENCIES.md`](../DEPENDENCIES.md).
- **The weakest recipes**, if a later pass wants them: `π⁺ π⁻ → γ γ` is not
  how charged pions mostly annihilate, and `p p̄ → 3π` simplifies a final state
  that really averages about five pions. Both point at something real, which is
  the bar.
- **The deuteron is nearly unreachable.** `+1 + 1` is the only setting that takes
  one, and nothing but a `p`–`n` binding produces one, so that dial position is
  idle for most of a run.
- **Moulimie's licence is unrecorded.** The file names a designer and nothing
  else. It ships because it was asked for and is already published from the
  site's font folder, but the terms are unknown and `ASSETS.md` says so. If they
  turn out to forbid redistribution the fix is one function, `display()`.
- **Terminal Grotesque has one weight**, so bold is synthesised by the browser.
  It holds up at these sizes; a second weight would be better.
- **No sound.** The panel has no speaker in the deskarium build either.
- **No persistence.** `localStorage` untouched, no high score, no run history.
- **Touch is untested.** `input.js` splits the screen into the panel's six
  controls for a device with no arrow keys; nothing has tried it.

---

*2026-09-02 — Claude Code — Built from a request to bounce a particle catcher
off `confinery` and run it on `deskarium`'s panel. Name chosen by Xyh from a
shortlist. Nine discrete lanes, dark palette.*

*2026-09-03 (last) — Claude Code — Moved out of deskarium into its own
repository so it publishes at `xyhtamura.github.io/catchment/`, on Xyh's call,
for a CV and an IFAE portfolio. Added a web control profile: the pointer steers
directly, `A`/`S`/`D` turn the dials, `Esc` and the click open and close the
deck, and the wheel moves through it — with the panel keys still bound under
both profiles. Wrote a README aimed at a visitor rather than at the next agent.
**Recorded the accuracy standard Xyh set: vaguely justifiable is enough**, which
makes the `pdg?` values a tidying job rather than a correctness one. Two bugs
found and fixed by checking rather than by assuming: Escape was bound twice and
cancelled itself, and the pointer mapping divided by zero whenever the canvas
had no layout box. **Not verified: an actual mouse steering an actual catcher.**
The pane was hidden throughout, which leaves every element zero-width, so the
mapping is unit-tested and the wiring is exercised through the wheel, but nobody
has moved a mouse across this.*

*2026-09-03 (later) — Claude Code — The encoder press now pauses and opens a
deck of cards — the recipes, the rules, and restart — built from the same tables
the simulation reads so they cannot drift from it. Set the title in Moulimie and
the interface in Terminal Grotesque, keeping particle symbols on a system stack
because they need Greek and a combining macron and a display face failing at
that would fail silently. **NUKLEAR.otf was asked for as the body face and was
not used:** its own name table identifies it as Druk Wide by Commercial Type
with the retail licence intact, so publishing it would redistribute commercial
font software. `check_font_licences.py` at the root is the tool that found that,
kept because the question recurs.*

*2026-09-03 — Claude Code — Moved into `deskarium/catchment/` so it publishes
with deskarium and needs no repository of its own; checked by fetching
`package.json` off Pages that the repository root is what gets served, and added
`/catchment/` to the service worker's navigation denylist so Deskarium's page
can never be served in its place. Replaced the lane grid with continuous motion
and put a magnetic field in it, so charge bends a track and the bend reads as
the sign — which is what continuous motion was for. Repainted light and
coloured, and mapped the three dials onto colour, fill and shape so lining up is
a visual comparison. The checker gained field assertions, and one of them
immediately found the field strong enough to curl low-energy particles out of
the apparatus before they landed. **The panel is still the open item**, and the
light palette in particular was chosen on a monitor and has never been seen on
the glass it is for.*

*2026-09-03 (voice pass) — Antigravity — Refactored user-facing and reference text in cards.js, modelcard.js, README.md, and NOTES.md to reduce overly poetic "X, Y" parataxis and formulaic pairings (e.g. serial aphorisms, balanced binary clauses, and biblical conditional rhythms). Replaced with explicit functional relations and causal mechanics. Verified headless suite via `node tools/check-table.mjs` (all checks passing).*
