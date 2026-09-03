// Catchment — the model card.
//
// Not documentation. It is the honesty mechanism, and it is part of the work,
// following coping/ and confinery/. It says which numbers were measured and
// which were invented for play, and it builds its tables from data/particles.js
// and game.js rather than restating them, so the card and the game cannot
// disagree about anything.
//
// It only appears where there is a pointer to open it with. The panel has three
// buttons and an encoder, so on the Pi this button is never shown.

import { SPECIES, ORDER, AXES, admits } from './data/particles.js';
import { holdLife, APERTURE, STACK_CAPACITY, RUN_SECONDS } from './game.js';

const dialog = document.getElementById('card');
const opener = document.getElementById('card-open');
if (window.matchMedia('(hover: hover)').matches && dialog && opener) {
  opener.hidden = false;
  opener.addEventListener('click', () => { build(); dialog.showModal(); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  style();
}

let built = false;

function build() {
  if (built) return;
  built = true;

  const rows = ORDER.map((k) => {
    const s = SPECIES[k];
    const h = holdLife(s.life);
    return `<tr>
      <td class="sym">${s.sym}</td>
      <td>${s.name}</td>
      <td class="n">${s.q > 0 ? '+' : ''}${s.q}</td>
      <td class="n">${s.P === null ? '—' : s.P > 0 ? '+' : '−'}</td>
      <td class="n">${s.J === 0.5 ? '½' : s.J}</td>
      <td class="n">${s.mass === 0 ? '0' : s.mass.toFixed(s.mass < 1 ? 6 : 3)}</td>
      <td class="n">${isFinite(s.life) ? s.life.toExponential(3) : 'stable'}</td>
      <td class="n">${isFinite(h) ? h.toFixed(2) + ' s' : 'held'}</td>
      <td class="tag t-${(s.src || '').replace('?', 'q')}">${s.src}</td>
      <td class="tag t-${(s.srcP || '').replace('?', 'q')}">${s.srcP || '—'}</td>
    </tr>`;
  }).join('');

  const settings = [];
  for (const Q of AXES.Q) for (const P of AXES.P) for (const J of AXES.J) {
    const hits = ORDER.filter((k) => admits({ Q, P, J }, k));
    if (hits.length) {
      settings.push(`<li><code>${Q > 0 ? '+' : ''}${Q} &nbsp; ${P > 0 ? '+' : '−'} &nbsp; ${J === 0.5 ? '½' : J}</code>
        <span>${hits.map((k) => SPECIES[k].sym).join(' ')}</span></li>`);
    }
  }

  dialog.innerHTML = `
    <article>
      <header>
        <h1>The model</h1>
        <button type="button" data-close>close</button>
      </header>

      <h2>What was measured</h2>
      <p>Masses, mean lifetimes, decay channels and branching ratios come from
        Particle Data Group values by way of <code>confinery</code>, an
        unpublished sibling project that originated this table. Intrinsic
        parity and spin were added here because the game mechanics require them.
        Every value carries a provenance tag.</p>
      <p><strong>Two tags are warnings.</strong> <code>pdg?</code> indicates
        that a figure was written from general knowledge and has not been
        verified against the PDG — the electron, muon, proton, and neutron are
        currently in this state. <code>convention</code> marks phase conventions
        rather than empirical measurements, such as defining fermion intrinsic
        parity as +1.</p>

      <h2>What was invented for play</h2>
      <ul>
        <li><strong>The selection rule.</strong> The requirement that an aperture
          absorbs a particle only when charge, parity, and spin match is a game
          mechanic using physics vocabulary. Real detectors select on energy
          deposition, track curvature, and penetration depth rather than discrete
          quantum triples. However, the consequence is physically consistent:
          neutrinos cannot be admitted because the weak interaction violates
          parity conservation, producing neutrinos in definite helicity states
          without a definite parity eigenvalue.</li>
        <li><strong>The field.</strong> A flat two-dimensional box with
          downward gravity and an aperture covering
          ${(APERTURE * 200).toFixed(0)}% of its width. Real kinematics does
          not use this geometry, and physical detectors surround interaction
          points rather than sitting beneath them.</li>
        <li><strong>Track bending strength.</strong> The curvature equation is
          physical: a charged particle in a magnetic field follows an arc of
          radius <code>r = p / qB</code>, where charge sign sets direction and
          higher momentum reduces deflection. What is invented is the field
          strength: at realistic magnitudes, low-momentum particles curl into
          tight loops and exit the apparatus without reaching the detector
          plane, making gameplay unworkable. The field strength was reduced
          until a 150 MeV positron reaches the aperture. Momentum is approximated
          by particle energy, which is exact only for massless species.</li>
        <li><strong>Time compression.</strong> Measured mean lifetimes span
          twenty orders of magnitude. The table below compares measured values
          against on-screen display times; the logarithmic mapping preserves
          relative ordering.</li>
        <li><strong>The stack and its capacity.</strong> Holding
          ${STACK_CAPACITY} particles simultaneously inside the aperture provides
          gameplay around reaction recipes. While pile-up represents a real
          detector failure mode, physical detectors do not use a six-element
          buffer.</li>
        <li><strong>Reaction product ejection</strong> back into the field,
          with multiplier bonuses for subsequent catches.</li>
        <li><strong>Beam intensity, particle energies, and the ${RUN_SECONDS}-second
          run duration</strong>, which serve as game pacing parameters.</li>
      </ul>

      <h2>Confinement</h2>
      <p>Free quarks cannot be caught directly. When high-energy collisions
        separate quarks, the gluon field string stretches and fragments into new
        quark–antiquark pairs before reaching the detector, producing a hadron
        jet instead. The <code>free quarks</code> readout remains at zero.</p>
      <p>The interactive drag gesture from confinery's specification — pulling a
        tether until it breaks with visible stored energy — is
        <strong>not implemented here</strong>; pre-fragmented jets serve as the
        simplified equivalent.</p>

      <h2>Colour, fill and shape</h2>
      <p>A particle's three quantum numbers map to three visual channels:
        <strong>charge determines colour</strong> (warm positive, cool negative,
        pale neutral), <strong>parity determines fill</strong> (solid for +,
        outlined for −), and <strong>spin determines shape</strong> (square for
        0, circle for ½, star for 1). This mapping allows players to align the
        catcher by comparing visual glyphs directly rather than reading
        numerical triples.</p>
      <p>A neutrino is drawn with a dashed border because it lacks a definite
        parity state, reflecting the physical constraint that prevents any
        catcher setting from tuning to it.</p>

      <h2>The eleven live settings</h2>
      <p>Of ${AXES.Q.length * AXES.P.length * AXES.J.length} possible dial
        combinations, eleven admit particles. Multiple species sharing a single
        setting is expected: quantum numbers alone do not distinguish electrons
        from muons, which physical detectors differentiate by penetration
        depth.</p>
      <ul class="settings">${settings.join('')}</ul>

      <h2>The table</h2>
      <table>
        <thead><tr>
          <th></th><th>species</th><th>Q</th><th>P</th><th>J</th>
          <th>mass<br><span>MeV/c²</span></th>
          <th>mean life<br><span>seconds</span></th>
          <th>on screen</th><th>mass src</th><th>P src</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <h2>Checking it</h2>
      <p>Charge, baryon number, and both lepton numbers are verified across every
        decay, annihilation, binding, and pair channel by
        <code>node tools/check-table.mjs</code>, which also simulates a complete
        120-second run headlessly. This automated test verifies conservation
        laws and physical consistency across the reaction network.</p>
    </article>`;

  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
}

function style() {
  const css = document.createElement('style');
  css.textContent = `
    #card-open {
      position: fixed; right: 14px; bottom: 12px; z-index: 5;
      background: #fbf7f0; color: #7d8b98; border: 1px solid #dfe7ee;
      border-radius: 999px; padding: 5px 13px; font: 600 12px system-ui, sans-serif;
      cursor: pointer;
    }
    #card-open:hover { color: #33404c; border-color: #b9c6d1; }
    /* The card pins its own palette rather than inheriting the page's, per
       coping, so it reads the same whatever the game behind it is doing. */
    #card {
      color: #1a2530; background: #f4f2ec; border: none; border-radius: 6px;
      max-width: 62rem; width: calc(100vw - 3rem); max-height: 88vh; padding: 0;
      font: 400 15px/1.55 Georgia, "Times New Roman", serif;
    }
    #card::backdrop { background: rgba(51,64,76,0.55); }
    #card article { padding: 1.6rem 2rem 2.2rem; }
    #card header { display: flex; align-items: baseline; justify-content: space-between;
      border-bottom: 1px solid #d6d0c2; margin-bottom: 1rem; }
    #card h1 { font-size: 1.5rem; margin: 0 0 .6rem; }
    #card h2 { font-size: 1.05rem; margin: 1.6rem 0 .4rem; letter-spacing: .02em; }
    #card p, #card li { max-width: 58ch; }
    #card ul { padding-left: 1.1rem; }
    #card li { margin: .35rem 0; }
    #card code { font: 500 13px ui-monospace, "DejaVu Sans Mono", monospace;
      background: #e6e2d6; padding: 1px 4px; border-radius: 3px; }
    #card a { color: #2a5d78; }
    #card [data-close] { background: none; border: 1px solid #c9c2b1; border-radius: 4px;
      padding: 3px 10px; font: 500 12px system-ui, sans-serif; cursor: pointer; color: #4a5560; }
    #card table { border-collapse: collapse; font: 400 13px/1.4 ui-monospace, "DejaVu Sans Mono", monospace;
      margin-top: .5rem; }
    #card th, #card td { padding: 3px 9px 3px 0; text-align: left; vertical-align: bottom; }
    #card thead th { border-bottom: 1px solid #c9c2b1; font-weight: 600; font-size: 11px; }
    #card thead th span { font-weight: 400; color: #7b7466; }
    #card td.n { text-align: right; }
    #card td.sym { font-size: 16px; font-weight: 700; }
    #card .tag { font-size: 11px; color: #7b7466; }
    #card .t-pdgq { color: #a8492f; font-weight: 600; }
    #card .t-approx, #card .t-convention { color: #8a6d1f; }
    #card ul.settings { list-style: none; padding: 0; columns: 3; max-width: 46rem; }
    #card ul.settings li { margin: .2rem 0; break-inside: avoid; }
    #card ul.settings code { min-width: 6.4rem; display: inline-block; }
    #card ul.settings span { font-size: 15px; }
  `;
  document.head.append(css);
}
