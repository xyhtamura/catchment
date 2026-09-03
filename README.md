# Catchment

**Play: [xyhtamura.github.io/catchment](https://xyhtamura.github.io/catchment/)**

A particle catcher. Particles fall from above with species symbols, and the
catcher is a detector aperture with three settings — charge, parity, and spin.
It absorbs a particle only when all three settings match.

The magnetic field curves charged particle tracks based on momentum: positive
particles curve left, negative particles curve right, and neutral particles fall
straight. This curvature identifies charge sign and momentum visually before the
letter label is legible.

The three quantum numbers map to three visual channels: **charge determines
colour, parity determines fill, and spin determines shape**. The catcher
displays its active setting, allowing players to match incoming particles by
comparing visual glyphs directly.

Absorbed particles enter a stack governed by particle data tables. Unstable
particles decay on compressed lifetimes and leave decay products in the stack.
Complementary particles annihilate, high-energy photon pairs generate matter,
and nucleons bind into nuclei. Decay increases stack occupancy whereas
reactions reduce it, ejecting reaction products back into the field to extend
catch multiplier chains. Absorbing a particle when the stack is full triggers a
pile-up, where overlapping events in a single readout window prevent
reconstruction and discard all held particles.

Neutrinos cannot be caught because they lack a definite parity state, leaving the
detector plane as missing energy. Similarly, colour confinement prevents free
quarks from reaching the detector; stretching gluon strings fragment into hadron
jets, keeping the free-quark counter at zero.

## Controls

|  | Web | Panel |
| :--- | :--- | :--- |
| Move the catcher | mouse, or scroll | rotary encoder |
| Charge | `A` | L button |
| Parity | `S` | C button |
| Spin | `D` | R button |
| Pause, and the deck of recipes | `Esc`, or click | press the encoder |

Pausing deals a deck of cards: the recipes, the rules, and restart. Scroll or
turn to move through it.

## Two builds

| Page | For |
| :--- | :--- |
| [`index.html`](index.html) | The web game. Pointer and keyboard. |
| [`upside-down.html`](upside-down.html) | The panel's orientation, previewed in a browser. |
| [`rpi/`](rpi/README.md) | A 1024×600 panel on a Raspberry Pi, driven by three buttons and a rotary encoder. |

Static and build-free: browser-native ES modules, no bundler, no dependencies,
no network calls. Clone it and open `index.html` through any static server.

```bash
node tools/check-table.mjs
```

That walks every decay, annihilation, binding and pair channel and fails if
charge, baryon number or either lepton number does not balance, then steps a
whole 120-second run with no browser.

## Where the numbers come from

Masses, mean lifetimes, decay channels and branching ratios are Particle Data
Group values. Every one carries a provenance tag, and the ones that have not
been checked against the PDG say so. The model card — the button in the corner —
sets out what was measured and what was invented for play, and builds its tables
from the same file the game reads, so the two cannot drift.

[`ASSETS.md`](ASSETS.md) records the two typefaces and their licences.
[`NOTES.md`](NOTES.md) is the working log.

By [Xyh Tamura](https://xyhtamura.github.io/).
