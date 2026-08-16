/**
 * Evaluation protocol for spectral.js 3.0.0 (Ronald van Wijnen, MIT)
 * as the production mixing engine — run: node eval/spectral-eval.js
 *
 * Questions to answer before adoption:
 *  1. Correctness invariants (identity, ratio weights, commutativity, continuity)
 *  2. Paint behavior (yellow+blue→green; ultramarine+sienna→neutral?)
 *  3. The concentration formula is f²·T²·L — what does that do to
 *     black/white mixes (L≈0 for black!) and to our "parts" semantics?
 *  4. Performance (cold construction vs. memoized pots)
 */
import { createRequire } from 'node:module';
const spectral = createRequire(import.meta.url)('../vendor/spectral.min.js');
import { mixPigment, hexToRgb } from '../src/mixing.js';

const C = (h) => new spectral.Color(h);
const smix = (...pairs) => spectral.mix(...pairs).toString();
const spread = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  return Math.max(r, g, b) - Math.min(r, g, b);
};
let pass = 0, fail = 0;
const check = (label, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`);
  ok ? pass++ : fail++;
};
const info = (label, detail) => console.log(`INFO  ${label} — ${detail}`);

console.log('== 1. Invariants ==');
{
  const c = '#8C4520';
  const m = smix([C(c), 3], [C(c), 5]);
  check('identity: color mixed with itself', m.toUpperCase() === c, `${c} -> ${m}`);
}
{
  const a = C('#F2C500'), b = C('#1F3A93');
  const m1 = smix([a, 3], [b, 1]);
  const m2 = smix([a, 30], [b, 10]);
  check('weights are ratios (3:1 == 30:10)', m1 === m2, `${m1} vs ${m2}`);
}
{
  const a = C('#D93A2B'), b = C('#0C5DA5'), c = C('#F1E04E');
  const m1 = smix([a, 2], [b, 3], [c, 1]);
  const m2 = smix([c, 1], [a, 2], [b, 3]);
  check('commutativity', m1 === m2, `${m1} vs ${m2}`);
}
{
  const a = C('#D93A2B'), b = C('#0C5DA5');
  const m1 = smix([a, 100], [b, 100]);
  const m2 = smix([a, 100], [b, 101]);
  const d = hexToRgb(m1).reduce((s, v, i) => s + Math.abs(v - hexToRgb(m2)[i]), 0);
  check('continuity (100 vs 101 parts)', d <= 6, `${m1} -> ${m2}, |Δ|=${d}`);
}
{
  const m = smix([C('#002185'), 0.5], [C('#FCD200'), 0.5]);
  check('README regression #002185+#FCD200', m === '#3D933E', m);
}

console.log('\n== 2. Paint behavior ==');
{
  const m = smix([C('#F2C500'), 1], [C('#1F3A93'), 1]);
  const [r, g, b] = hexToRgb(m);
  check('cadmium yellow + ultramarine -> green', g > r && g > b, m);
  info('  (our 3-channel engine)', mixPigment([{ c: '#F2C500', w: 1 }, { c: '#1F3A93', w: 1 }]));
}
{
  const m = smix([C('#1F3A93'), 1], [C('#8C4520'), 1]);
  const ours = mixPigment([{ c: '#1F3A93', w: 1 }, { c: '#8C4520', w: 1 }]);
  check(`ultramarine + burnt sienna neutral-ish (spread ${spread(m)} vs ours ${spread(ours)})`,
    spread(m) < spread(ours), `spectral ${m} vs ours ${ours}`);
}

console.log('\n== 3. Concentration formula consequences ==');
{
  const m = smix([C('#FFFFFF'), 1], [C('#000000'), 1]);
  info('pure white + pure black 1:1', `${m} (real paint: a dark-mid gray; L=0 kills black concentration?)`);
  const m2 = smix([C('#F5F3EE'), 1], [C('#23211C'), 1]);
  info('titanium white + ivory black 1:1 (realistic pots)', m2);
  const m3 = smix([C('#F5F3EE'), 1], [C('#23211C'), 9]);
  info('titanium white 1 + ivory black 9', m3);
  const ours = mixPigment([{ c: '#F5F3EE', w: 1 }, { c: '#23211C', w: 1 }]);
  info('  (our 3-channel engine, ti-white+ivory 1:1)', ours);
}
{
  console.log('parts semantics — cadmium yellow : ultramarine at parts 1..5');
  const rows = { 'factor=parts   ': (k) => smix([C('#F2C500'), k], [C('#1F3A93'), 1]),
                 'factor=sqrt(p) ': (k) => smix([C('#F2C500'), Math.sqrt(k)], [C('#1F3A93'), 1]),
                 'ours (3-chan)  ': (k) => mixPigment([{ c: '#F2C500', w: k }, { c: '#1F3A93', w: 1 }]) };
  for (const [name, fn] of Object.entries(rows)) {
    console.log(`  ${name}: ${[1, 2, 3, 4, 5].map(fn).join(' ')}`);
  }
}

console.log('\n== 4. Robustness ==');
{
  const extremes = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFF00'];
  let ok = true, bad = '';
  for (const a of extremes) for (const b of extremes) {
    const m = smix([C(a), 1], [C(b), 1]);
    if (!/^#[0-9A-F]{6}$/i.test(m)) { ok = false; bad = `${a}+${b} -> ${m}`; }
  }
  check('all pure-corner pairs return valid hex', ok, bad || '64 pairs clean');
}

console.log('\n== 5. Performance ==');
{
  const t0 = performance.now();
  const N1 = 20000;
  for (let i = 0; i < N1; i++) {
    smix([C('#F2C500'), 3], [C('#1F3A93'), i % 9 + 1]);
  }
  const cold = (performance.now() - t0);
  console.log(`  cold (2x new Color + mix + toString): ${Math.round(N1 / (cold / 1000)).toLocaleString('en')} ops/s`);

  const pots = ['#F5F3EE', '#F2C500', '#1F3A93', '#8C4520', '#D93A2B', '#0A6B52'].map(C);
  const t1 = performance.now();
  const N2 = 100000;
  for (let i = 0; i < N2; i++) {
    spectral.mix([pots[i % 6], 3], [pots[(i + 1) % 6], i % 9 + 1], [pots[(i + 2) % 6], 2]).toString();
  }
  const warm = (performance.now() - t1);
  console.log(`  warm (memoized pots, 3-color mix + toString): ${Math.round(N2 / (warm / 1000)).toLocaleString('en')} ops/s`);

  const t2 = performance.now();
  for (let i = 0; i < N2; i++) {
    mixPigment([{ c: '#F5F3EE', w: 3 }, { c: '#F2C500', w: i % 9 + 1 }, { c: '#1F3A93', w: 2 }]);
  }
  const ours = (performance.now() - t2);
  console.log(`  ours 3-channel (reference): ${Math.round(N2 / (ours / 1000)).toLocaleString('en')} ops/s`);
}

console.log(`\n${pass} passed, ${fail} failed`);
