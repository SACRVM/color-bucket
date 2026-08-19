/**
 * Guards for the limited-palette generator (lib/harmony.js).
 *
 * The promises worth holding onto are structural, not aesthetic: a palette
 * whose neutral ramp doubles back, repeats itself, or depends on the order the
 * pots were tapped is broken no matter how nice the colours look. Each of
 * these failed at some point while the ramp was being built, which is why they
 * are here rather than in a comment.
 *
 * Driven with the real engine, and with the same file the browser loads — a
 * guard against a different copy is not a guard.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const spectral = require_('../vendor/spectral.min.js');
const harmony = require_('../lib/harmony.js');

const cache = Object.create(null);
const C = (h) => cache[h] || (cache[h] = new spectral.Color(h));
/* The app's wrapper: spectral squares its factors, so √parts keeps
   "3 parts" meaning 3 parts. Tests must mix exactly like the product. */
const mix = (bs) =>
    spectral.mix(...bs.map((b) => [C(b.c.toUpperCase()), Math.sqrt(b.w)])).toString().toUpperCase();

const WHITE = '#F5F3EE';   // Titanium White, the Oils shelf's lightest pot
const DARK = '#23211C';    // Ivory Black, its darkest
const build = (sources, white = WHITE, dark = DARK) =>
    harmony.build({ sources, white, dark, mix });

const L = harmony.lightness;
const HEX = /^#[0-9A-F]{6}$/;
const all = (r) => r.hues.concat(r.neutrals);

test('harmony: one pigment is not a palette', () => {
    assert.equal(build(['#F2C500']), null);
    assert.equal(build([]), null);
    assert.equal(build(), null);
});

test('harmony: duplicates collapse before counting', () => {
    // The same pot tapped twice is one pigment, not two.
    assert.equal(build(['#F2C500', '#f2c500']), null);
});

test('harmony: hues are the pigments plus every pairwise blend', () => {
    const two = build(['#F2C500', '#1F3A93']);
    assert.equal(two.hues.length, 3);            // 2 pure + 1 blend
    const three = build(['#F2C500', '#D93A2B', '#1F3A93']);
    assert.equal(three.hues.length, 7);          // 3 pure + 3 blends + mother
    const four = build(['#F2C500', '#D93A2B', '#1F3A93', '#0A6B52']);
    assert.equal(four.hues.length, 11);          // 4 pure + 6 blends + mother
});

test('harmony: the pure hues are the pigments themselves, untouched', () => {
    const r = build(['#F2C500', '#1F3A93']);
    const pure = r.hues.filter((h) => h.pure).map((h) => h.hex);
    assert.deepEqual(pure, ['#F2C500', '#1F3A93']);
});

test('harmony: with two pigments the blend IS the mother, listed once', () => {
    const r = build(['#F2C500', '#1F3A93']);
    assert.equal(r.mother, r.hues[2].hex);
    assert.equal(r.hues.filter((h) => h.hex === r.mother).length, 1);
});

test('harmony: more than four pigments is no longer a limited palette', () => {
    const r = build(['#F2C500', '#D93A2B', '#1F3A93', '#0A6B52', '#B93A86', '#5A3A28']);
    assert.equal(r.sources.length, harmony.MAX_SOURCES);
    assert.equal(r.hues.length, 11);
});

test('harmony: the neutral ramp runs light to dark without doubling back', () => {
    for (const src of [['#F2C500', '#1F3A93'], ['#D93A2B', '#0C5DA5', '#F1E04E']]) {
        const steps = build(src).neutrals;
        for (let i = 1; i < steps.length; i++) {
            assert.ok(L(steps[i].hex) < L(steps[i - 1].hex),
                `${src}: ${steps[i - 1].label}->${steps[i].label} does not descend`);
        }
    }
});

test('harmony: no two ramp steps land on the same swatch', () => {
    // Clamping out-of-range targets used to emit identical hexes under
    // different labels, which reads as a bug to anyone looking at it.
    for (const src of [['#F2C500', '#1F3A93'], ['#9BBC0F', '#306230']]) {
        const white = src[0] === '#9BBC0F' ? '#9BBC0F' : WHITE;
        const dark = src[0] === '#9BBC0F' ? '#0F380F' : DARK;
        const steps = build(src, white, dark);
        const hexes = steps.neutrals.map((s) => s.hex);
        assert.equal(new Set(hexes).size, hexes.length);
    }
});

test('harmony: a shelf that cannot reach a step omits it rather than faking it', () => {
    // Game Boy is four greens: a full 50..900 ramp is not physically available.
    const short = build(['#9BBC0F', '#306230'], '#9BBC0F', '#0F380F');
    const full = build(['#F2C500', '#1F3A93']);
    assert.ok(short.neutrals.length < full.neutrals.length);
    assert.ok(short.neutrals.length >= 3, 'still useful, just shorter');
    // Every label it does emit still means the lightness it claims.
    for (const s of short.neutrals) {
        const target = harmony.TARGETS.filter((t) => t[0] === s.label)[0][1];
        assert.ok(Math.abs(L(s.hex) - target) < 0.05, `${s.label} drifted from its target`);
    }
});

test('harmony: every colour it produces is a valid hex', () => {
    const r = build(['#F2C500', '#D93A2B', '#1F3A93']);
    for (const c of all(r)) assert.match(c.hex, HEX);
    assert.match(r.mother, HEX);
});

test('harmony: same pigments, same palette — order of the pots aside', () => {
    const a = build(['#F2C500', '#1F3A93']);
    const b = build(['#F2C500', '#1F3A93']);
    assert.deepEqual(a, b);
});

test('harmony: the mother of yellow + ultramarine is the documented green', () => {
    // Same value the mixing proof and the browser check report for 1:1 — if
    // this moves, the engine moved, and the README's numbers went stale.
    assert.equal(build(['#F2C500', '#1F3A93']).mother, '#699437');
});

/* --------------------------------------------------------------- toCSS -- */

test('harmony/css: nothing in, nothing out', () => {
    assert.equal(harmony.toCSS(null), '');
    assert.equal(harmony.toCSS(build(['#F2C500'])), '');
});

test('harmony/css: every line is a comment or a custom property', () => {
    const css = harmony.toCSS(build(['#F2C500', '#D93A2B', '#1F3A93']));
    for (const line of css.split('\n')) {
        assert.match(line, /^(\/\*.*\*\/|--[a-z0-9-]+: #[0-9A-F]{6};(\s+\/\*.*\*\/)?)$/,
            `not a usable line: ${line}`);
    }
});

test('harmony/css: the ramp arrives as tokens, one per step', () => {
    const built = build(['#F2C500', '#1F3A93']);
    const css = harmony.toCSS(built);
    const steps = css.split('\n').filter((l) => l.startsWith('--neutral-'));
    assert.equal(steps.length, built.neutrals.length);
    for (const n of built.neutrals) {
        assert.ok(css.includes(`--neutral-${n.label}: ${n.hex};`), `missing ${n.label}`);
    }
});

test('harmony/css: the mother is named only when it is not just the blend', () => {
    // Two pigments: the blend IS the mother, so a --mother token would double it.
    assert.ok(!harmony.toCSS(build(['#F2C500', '#1F3A93'])).includes('--mother:'));
    assert.ok(harmony.toCSS(build(['#F2C500', '#D93A2B', '#1F3A93'])).includes('--mother:'));
});

test('harmony/css: pigments that slug to the same name stay distinct', () => {
    // Two different hexes could carry the same label; CSS cannot have both.
    const built = harmony.build({
        sources: ['#F2C500', '#1F3A93'], white: WHITE, dark: DARK, mix,
        name: () => 'Same Name',
    });
    const css = harmony.toCSS(built);
    const props = css.split('\n').filter((l) => l.startsWith('--'))
        .map((l) => l.slice(0, l.indexOf(':')));
    assert.equal(new Set(props).size, props.length, 'duplicate custom property name');
});
