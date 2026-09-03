# Catchment

**Play: [xyhtamura.github.io/catchment](https://xyhtamura.github.io/catchment/)**

A particle catcher. Things fall from above with their letters on them, and the
catcher is a detector aperture with three settings — charge, parity, spin. It
takes a particle only when all three agree with it.

The field is magnetic, so a charged track travels an arc whose radius is its
momentum: positives bend one way, negatives the other, neutrals fall straight.
The bend tells you what something is before its letter is legible, which is how
a real tracker reads the sign of a charge.

The three quantum numbers are drawn as three visual channels — **charge is
colour, parity is fill, spin is shape** — and the catcher is drawn with its own
current setting, so lining up is a comparison of two pictures rather than of two
triples of numbers.

What you absorb goes into a stack, where the measured tables take over. Held
particles decay on their own clock and their pieces stay inside. Matter meets
antimatter and annihilates; two photons make a pair; a proton and a neutron
bind. Decay fills the stack, reactions empty it, and reaction products are
thrown back up the field to be caught again. Hold more than six and the next
catch is a pile-up — two events in one readout window, neither reconstructable.

Nothing here catches a neutrino. Parity is not defined for one, so there is no
value on that dial to match, and every neutrino that crosses the plane leaves as
missing energy. The free-quark counter reads zero permanently, for a related
reason: a quark knocked loose is on a string that breaks into a new pair before
it arrives, so what the beam delivers is a jet of hadrons.

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
