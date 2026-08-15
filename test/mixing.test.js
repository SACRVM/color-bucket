/**
 * Verification suite for the Kubelka-Munk mixing engine.
 * Run: npm test  (or: node --test test/)
 *
 * These are mathematical property checks — they verify the implementation
 * is internally consistent and behaves like subtractive paint mixing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hexToRgb, rgbToHex, srgbToLinear, linearToSrgb,
  ksFromR, rFromKs, mixPigment, mixRgb, luma, hue,
} from '../src/mixing.js';

// Deterministic pseudo-random for reproducible property tests
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260813);
const randHex = () => rgbToHex([rand() * 255, rand() * 255, rand() * 255]);

test('hex round-trip', () => {
  for (const h of ['#000000', '#FFFFFF', '#F2C500', '#1F3A93', '#8C4520']) {
    assert.equal(rgbToHex(hexToRgb(h)), h);
  }
});

test('sRGB transfer functions invert each other', () => {
  for (let v = 0; v <= 255; v += 5) {
    assert.ok(Math.abs(linearToSrgb(srgbToLinear(v)) - v) < 1e-9);
  }
});

test('Kubelka-Munk R↔K/S inversion is exact', () => {
  // R(K/S(R)) must reproduce R for the whole valid reflectance range
  for (let R = 0.001; R < 0.999; R += 0.001) {
    assert.ok(Math.abs(rFromKs(ksFromR(R)) - R) < 1e-12, `failed at R=${R}`);
  }
});

test('identity: a color mixed with itself is itself (incl. pure black/white)', () => {
  assert.equal(mixPigment([{ c: '#000000', w: 1 }, { c: '#000000', w: 7 }]), '#000000');
  assert.equal(mixPigment([{ c: '#FFFFFF', w: 1 }, { c: '#FFFFFF', w: 7 }]), '#FFFFFF');
  for (let i = 0; i < 200; i++) {
    const c = randHex();
    assert.equal(mixPigment([{ c, w: 3 }, { c, w: 5 }]), c);
  }
});

test('weights are ratios: scaling all parts changes nothing', () => {
  for (let i = 0; i < 200; i++) {
    const a = randHex(), b = randHex();
    assert.equal(
      mixPigment([{ c: a, w: 3 }, { c: b, w: 1 }]),
      mixPigment([{ c: a, w: 30 }, { c: b, w: 10 }])
    );
  }
});

test('commutativity: bucket order does not matter', () => {
  for (let i = 0; i < 200; i++) {
    const a = randHex(), b = randHex(), c = randHex();
    assert.equal(
      mixPigment([{ c: a, w: 2 }, { c: b, w: 3 }, { c: c, w: 1 }]),
      mixPigment([{ c: c, w: 1 }, { c: a, w: 2 }, { c: b, w: 3 }])
    );
  }
});

test('no NaN / stays in gamut at the extremes', () => {
  const cases = [
    [{ c: '#000000', w: 1 }, { c: '#FFFFFF', w: 1 }],
    [{ c: '#000000', w: 99 }, { c: '#000000', w: 1 }],
    [{ c: '#FFFFFF', w: 99 }, { c: '#FFFFFF', w: 1 }],
    [{ c: '#FF0000', w: 1 }, { c: '#00FF00', w: 1 }, { c: '#0000FF', w: 1 }],
  ];
  for (const bs of cases) {
    const h = mixPigment(bs);
    assert.match(h, /^#[0-9A-F]{6}$/);
  }
});

test('paint behavior: yellow + blue makes green (not gray)', () => {
  // cadmium yellow + ultramarine — the classic school test
  const m = mixPigment([{ c: '#F2C500', w: 1 }, { c: '#1F3A93', w: 1 }]);
  const [r, g, b] = hexToRgb(m);
  assert.ok(g > r && g > b, `expected green-dominant, got ${m}`);
  const h = hue(m);
  assert.ok(h > 70 && h < 170, `expected green hue, got ${h.toFixed(0)}° (${m})`);
  // ...while naive RGB averaging of the same buckets is NOT green-dominant
  const rgbMix = hexToRgb(mixRgb([{ c: '#F2C500', w: 1 }, { c: '#1F3A93', w: 1 }]));
  assert.ok(!(rgbMix[1] > rgbMix[0] && rgbMix[1] > rgbMix[2]), 'RGB mode should stay muddy here');
});

test('subtractive property: KM mix is never brighter than the linear average (Jensen)', () => {
  // K/S(R) = (1-R)²/2R has d²(K/S)/dR² = 1/R³ > 0, i.e. it is convex —
  // so mixing in K/S space always yields R_mix <= weighted mean of
  // reflectances. Checked exactly on the un-rounded pipeline:
  for (let i = 0; i < 2000; i++) {
    const R1 = 0.001 + rand() * 0.997;
    const R2 = 0.001 + rand() * 0.997;
    const t = rand();
    const mixed = rFromKs(t * ksFromR(R1) + (1 - t) * ksFromR(R2));
    assert.ok(mixed <= t * R1 + (1 - t) * R2 + 1e-12,
      `R(mean K/S) exceeded mean R at R1=${R1}, R2=${R2}, t=${t}`);
  }
  // ...and end-to-end at hex level, within one 8-bit quantization step:
  for (let i = 0; i < 500; i++) {
    const a = randHex(), b = randHex();
    const w = 1 + Math.floor(rand() * 9);
    const mix = hexToRgb(mixPigment([{ c: a, w }, { c: b, w: 1 }]));
    const ra = hexToRgb(a), rb = hexToRgb(b);
    for (let ch = 0; ch < 3; ch++) {
      const avg = (w * srgbToLinear(ra[ch]) + 1 * srgbToLinear(rb[ch])) / (w + 1);
      assert.ok(mix[ch] <= linearToSrgb(avg) + 1,
        `channel ${ch} brighter than linear avg for ${a}+${b} @${w}:1`);
    }
  }
});

test('tinting strength: a dab of black overpowers white (like real paint)', () => {
  const km = luma(mixPigment([{ c: '#FFFFFF', w: 9 }, { c: '#000000', w: 1 }]));
  const av = luma(mixRgb([{ c: '#FFFFFF', w: 9 }, { c: '#000000', w: 1 }]));
  assert.ok(km < av * 0.5, `KM 9:1 white/black should be far darker than RGB avg (km=${km.toFixed(3)}, avg=${av.toFixed(3)})`);
});

test('monotonicity: more parts of the darker paint → strictly darker result', () => {
  let prev = Infinity;
  for (let wBlue = 0; wBlue <= 12; wBlue++) {
    const bs = [{ c: '#F2C500', w: 12 }];
    if (wBlue > 0) bs.push({ c: '#1F3A93', w: wBlue });
    const l = luma(mixPigment(bs));
    assert.ok(l < prev, `luma not decreasing at wBlue=${wBlue}`);
    prev = l;
  }
});

test('pure white + pure black stays exactly neutral', () => {
  for (let w = 1; w < 10; w++) {
    const [r, g, b] = hexToRgb(mixPigment([{ c: '#FFFFFF', w }, { c: '#000000', w: 10 - w }]));
    assert.ok(r === g && g === b, `neutral in, neutral out violated at ${w}:${10 - w} (${r},${g},${b})`);
  }
});

test('tinted neutrals keep their temperature (warm white + warm black → warm gray)', () => {
  // Titanium white and ivory black are both warm (r ≥ g ≥ b); channel
  // ordering is preserved through K/S mixing, so every gray in between
  // stays warm — like on a real palette.
  for (let w = 1; w < 10; w++) {
    const [r, g, b] = hexToRgb(mixPigment([{ c: '#F5F3EE', w }, { c: '#23211C', w: 10 - w }]));
    assert.ok(r >= g && g >= b, `temperature flipped at ${w}:${10 - w} (${r},${g},${b})`);
  }
});

test('continuity: tiny weight change → tiny color change', () => {
  const a = mixPigment([{ c: '#D93A2B', w: 100 }, { c: '#0C5DA5', w: 100 }]);
  const b = mixPigment([{ c: '#D93A2B', w: 100 }, { c: '#0C5DA5', w: 101 }]);
  const [r1, g1, b1] = hexToRgb(a), [r2, g2, b2] = hexToRgb(b);
  assert.ok(Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) <= 6, `jump from ${a} to ${b}`);
});
