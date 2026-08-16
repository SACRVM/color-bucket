/**
 * Adoption guard for spectral.js (production mixing engine).
 * These invariants were verified before adoption (see eval/spectral-eval.js
 * for the full protocol incl. findings) — if a future spectral.js update
 * breaks any of them, this suite catches it before the product does.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
// Loads the file that actually SHIPS, not a parallel copy from npm: the app
// vendors spectral.min.js (no build step, no node_modules), and createRequire
// pulls that same UMD bundle in as CommonJS. A guard that tests a different
// copy than the browser runs is not a guard.
import { createRequire } from 'node:module';
const spectral = createRequire(import.meta.url)('../vendor/spectral.min.js');
import { hexToRgb } from '../src/mixing.js';

const C = (h) => new spectral.Color(h);
const mix = (...pairs) => spectral.mix(...pairs).toString();

test('spectral: identity — a color mixed with itself is itself', () => {
  for (const c of ['#8C4520', '#F2C500', '#1F3A93', '#B93A86']) {
    assert.equal(mix([C(c), 3], [C(c), 5]).toUpperCase(), c);
  }
});

test('spectral: weights are ratios (3:1 == 30:10)', () => {
  const a = C('#F2C500'), b = C('#1F3A93');
  assert.equal(mix([a, 3], [b, 1]), mix([a, 30], [b, 10]));
});

test('spectral: commutativity', () => {
  const a = C('#D93A2B'), b = C('#0C5DA5'), c = C('#F1E04E');
  assert.equal(mix([a, 2], [b, 3], [c, 1]), mix([c, 1], [a, 2], [b, 3]));
});

test('spectral: continuity — tiny weight change, tiny color change', () => {
  const a = C('#D93A2B'), b = C('#0C5DA5');
  const m1 = hexToRgb(mix([a, 100], [b, 100]));
  const m2 = hexToRgb(mix([a, 100], [b, 101]));
  const d = m1.reduce((s, v, i) => s + Math.abs(v - m2[i]), 0);
  assert.ok(d <= 6, `|Δ|=${d}`);
});

test('spectral: documented README result still holds (#002185 + #FCD200)', () => {
  assert.equal(mix([C('#002185'), 0.5], [C('#FCD200'), 0.5]), '#3D933E');
});

test('spectral: paint behavior — yellow + blue makes green', () => {
  const [r, g, b] = hexToRgb(mix([C('#F2C500'), 1], [C('#1F3A93'), 1]));
  assert.ok(g > r && g > b);
});

test('spectral: all pure-corner pairs return valid hex', () => {
  const extremes = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFF00'];
  for (const a of extremes) for (const b of extremes) {
    assert.match(mix([C(a), 1], [C(b), 1]), /^#[0-9A-F]{6}$/i);
  }
});
