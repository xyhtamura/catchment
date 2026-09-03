// Catchment — the pause deck.
//
// The cards are *built from the tables*, not written out beside them. Every
// recipe on screen is read from data/particles.js at the moment the deck is
// asked for, so a card cannot claim a reaction the simulation does not have,
// and adding a channel to the table adds it to the deck. Same rule the model
// card follows, and the same reason: two statements of one fact drift.
//
// A card is a title plus rows. A row is one of:
//
//   { t: 'p',  text }              a line of prose
//   { t: 'rx', in, out, note }     a reaction, drawn as tokens with an arrow
//   { t: 'kv', k, v }              a labelled value
//   { t: 'ch', key, k, v }         a channel: one token, then a label and value
//   { t: 'gap' }                   a blank line
//
// render.js knows how to draw each. Nothing here touches a canvas.

import { SPECIES, DECAYS, ANNIHILATIONS, PAIRS, BINDINGS, AXES } from './data/particles.js';
import { STACK_CAPACITY, RUN_SECONDS, APERTURE } from './game.js';

const p = (text) => ({ t: 'p', text });
const gap = () => ({ t: 'gap' });
const kv = (k, v) => ({ t: 'kv', k, v });
const rx = (inn, out, note) => ({ t: 'rx', in: inn, out, note });

/** Every card, in deck order. `action` is what PRESS does on that card. */
export function deck() {
  const cards = [];

  cards.push({
    title: 'The catch',
    action: 'resume',
    rows: [
      p('Particles fall from above. The catcher is'),
      p('a detector aperture with three settings.'),
      gap(),
      p('It absorbs a particle only when charge,'),
      p('parity, and spin all match, and only if'),
      p('the particle lands inside its width.'),
      gap(),
      p('The mouth covers about a tenth of the'),
      p('field, defining the geometric acceptance.'),
      gap(),
      kv('aperture', `${(APERTURE * 200).toFixed(0)}% of the field`),
      kv('run', `${RUN_SECONDS} seconds`),
    ],
  });

  cards.push({
    title: 'The dials',
    action: 'resume',
    rows: [
      p('The catcher and falling particles display'),
      p('three quantum numbers:'),
      gap(),
      { t: 'ch', key: 'p', k: 'L  charge', v: 'colour' },
      { t: 'ch', key: 'pi-', k: 'C  parity', v: 'fill' },
      { t: 'ch', key: 'gamma', k: 'R  spin', v: 'shape' },
      gap(),
      p('Charge determines colour: warm +, cool −,'),
      p('pale 0. Parity determines fill: solid +,'),
      p('outlined −. Spin determines shape:'),
      p('square 0, circle ½, star 1.'),
      gap(),
      p('Multiple species can share a setting,'),
      p('because quantum numbers alone do not'),
      p('distinguish particles like electrons'),
      p('from muons.'),
    ],
  });

  // --- Annihilation, straight off the table --------------------------------
  const ann = Object.keys(ANNIHILATIONS).map((k) =>
    rx([k, SPECIES[k].anti], ANNIHILATIONS[k].out));
  cards.push({
    title: 'Annihilation',
    action: 'resume',
    rows: [
      p('Holding a particle and its antiparticle'),
      p('simultaneously annihilates both:'),
      gap(),
      ...ann,
      gap(),
      p('Reaction products launch back up the'),
      p('field; catching them increases the'),
      p('chain multiplier.'),
    ],
  });

  // --- Pair production and binding -----------------------------------------
  const pairRows = PAIRS.map((r) =>
    rx(['gamma', 'gamma'], r.out, `needs ${Math.round(2 * SPECIES[r.out[0]].mass)} MeV`));
  const bindRows = BINDINGS.map((r) => {
    const deficit = r.in.reduce((a, k) => a + SPECIES[k].mass, 0) - SPECIES[r.out[0]].mass;
    return rx(r.in, r.out, `${deficit.toFixed(2)} MeV bound`);
  });
  cards.push({
    title: 'Making things',
    action: 'resume',
    rows: [
      p('Two photons with sufficient combined'),
      p('energy produce particle pairs:'),
      gap(),
      ...pairRows,
      gap(),
      p('When a proton and a neutron bind, the'),
      p('mass deficit is emitted as a photon:'),
      gap(),
      ...bindRows,
    ],
  });

  // --- Decay ---------------------------------------------------------------
  const decayRows = ['pi0', 'pi+', 'mu-', 'n']
    .filter((k) => DECAYS[k])
    .map((k) => {
      const c = DECAYS[k][0];
      return rx([k], c.out, c.br > 0.999 ? null : `${(c.br * 100).toFixed(1)}%`);
    });
  cards.push({
    title: 'Decay',
    action: 'resume',
    rows: [
      p('Unstable particles decay after a set'),
      p('lifetime, leaving products in the stack:'),
      gap(),
      ...decayRows,
      gap(),
      p('Antiparticles decay into corresponding'),
      p('charge conjugates.'),
      gap(),
      p('Decay adds particles to the stack,'),
      p('whereas reactions consume them.'),
    ],
  });

  cards.push({
    title: 'Pile-up',
    action: 'resume',
    rows: [
      kv('the stack holds', `${STACK_CAPACITY}`),
      gap(),
      p('Absorbing into a full stack causes a'),
      p('pile-up: overlapping events in one'),
      p('readout window prevent reconstruction,'),
      p('resetting the chain and clearing held'),
      p('particles as missing energy.'),
      gap(),
      p('Missing a particle is not penalised;'),
      p('the readout tracks missed particles as'),
      p('normal detector inefficiency rather'),
      p('than deducting score.'),
    ],
  });

  cards.push({
    title: 'The readout',
    action: 'resume',
    rows: [
      kv('recorded', 'absorbed and reconstructed'),
      kv('missing', 'landed inside, left no record'),
      kv('outside', 'never entered the mouth'),
      gap(),
      p('Particles outside acceptance are counted'),
      p('separately so geometric limits do not'),
      p('distort the readout efficiency ratio.'),
      gap(),
      p('Score equals recorded energy multiplied'),
      p('by consecutive catches.'),
    ],
  });

  cards.push({
    title: 'Out of reach',
    action: 'resume',
    rows: [
      { t: 'ch', key: 'nue', k: 'neutrino', v: 'never' },
      gap(),
      p('Neutrinos cannot be caught because the'),
      p('weak interaction violates parity'),
      p('conservation. A neutrino has no definite'),
      p('parity, so it is drawn with a dashed'),
      p('border instead of a solid or outline fill.'),
      gap(),
      p('Free quarks cannot be caught: colour'),
      p('confinement causes gluon strings to'),
      p('fragment into hadron jets instead.'),
      p('The free-quark counter remains at zero.'),
    ],
  });

  cards.push({
    title: 'Restart',
    action: 'restart',
    rows: [
      p('Abandon this run and start a new one'),
      p('with a fresh beam.'),
      gap(),
      p('The current score is not saved.'),
    ],
  });

  return cards;
}

/** Sanity numbers the checker asserts, so a card cannot quietly lose its
 *  recipes when a table changes. */
export function deckSummary() {
  const d = deck();
  return {
    cards: d.length,
    reactions: d.reduce((a, c) => a + c.rows.filter((r) => r.t === 'rx').length, 0),
    actions: d.filter((c) => c.action === 'restart').length,
    axes: AXES.Q.length + AXES.P.length + AXES.J.length,
  };
}
