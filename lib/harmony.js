/**
 * Harmony — a whole palette from the pigments you already picked.
 *
 * The usual way to generate a palette is to walk a colour wheel: take a hue,
 * add 30 degrees, add 180, call it a scheme. That is the "numbers" thinking
 * this app exists to reject. Angles on a wheel share nothing but arithmetic,
 * which is why wheel palettes so often look assembled rather than related.
 *
 * A painter does it the other way round and gets harmony for free: pick two or
 * three tubes plus white, and paint the whole picture from them. Every colour
 * then literally shares pigment with every other colour, so they cannot clash
 * — this is the classic *limited palette*, and it is why a limited-palette
 * study reads as one image even when the hues sit far apart. Reproducing it
 * needs subtractive mixing, so it is exactly the thing a colour picker cannot
 * do and this engine can.
 *
 * What comes out:
 *   hues     — the chosen pigments, every pairwise blend, and (from three
 *              pigments up) the mother colour: all of them mixed together
 *   neutrals — the mother colour at ten lightness steps, tinted toward the
 *              shelf's lightest pot and shaded toward its darkest
 *
 * The neutral ramp is the part that earns its keep for interface work. Mixing
 * all your pigments together is how a painter makes a grey that belongs to the
 * painting: the result is a *tinted* neutral rather than a dead one, and
 * surfaces built from it sit under the hues without fighting them.
 *
 * The ramp is specified in perceptual lightness, not in mixing ratios, and the
 * ratio is solved for. That matters more than it sounds. Light colours
 * dominate a spectral mix (concentration goes with luminance), so evenly
 * spaced ratios give wildly uneven steps — measured on cadmium yellow +
 * ultramarine, ratio steps bunched the light end into 0.02 of OKLab L while
 * tearing a 0.19 hole in the middle. Solving for L instead gives even steps on
 * every shelf, and the 50..900 labels then mean what they mean everywhere
 * else: a scale a design system can be built on.
 *
 * Engine-agnostic on purpose: `mix` is injected, so the tests drive this with
 * the real spectral engine and the browser gets the identical file.
 */
(function (root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.cbHarmony = api;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    /* More than four pigments stops being a limited palette: the pairwise
       blends explode (five sources would give ten) and the mother colour goes
       to mud. Most limited-palette work uses three. */
    const MAX_SOURCES = 4;

    /* Target OKLab lightness per step. Labels follow the convention design
       tokens use, because that is what these get pasted into. Targets a shelf
       cannot reach are clamped to what its lightest and darkest pots allow —
       a four-tone Game Boy shelf yields a short ramp rather than a broken one. */
    const TARGETS = [
        ["50", 0.970], ["100", 0.930], ["200", 0.870], ["300", 0.800],
        ["400", 0.720], ["500", 0.630], ["600", 0.540], ["700", 0.450],
        ["800", 0.350], ["900", 0.250],
    ];

    /* Enough parts to reach a glaze — one part pigment in 256 parts white is a
       whisper of colour, which is what the top of a surface ramp is. */
    const MAX_PARTS = 256;
    const ITERATIONS = 20;   /* 256/2^20 — far past hex resolution */

    const up = (h) => String(h).toUpperCase();
    const chan = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const toLinear = (v) =>
        (v /= 255) <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

    /** OKLab lightness (Björn Ottosson). Perceptual, so even steps look even. */
    function lightness(hex) {
        const c = chan(hex).map(toLinear);
        const l = Math.cbrt(0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2]);
        const m = Math.cbrt(0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2]);
        const s = Math.cbrt(0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]);
        return 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    }

    /** Distinct hexes, order preserved, capped — the pigments to work from. */
    function sourcesFrom(list, max) {
        const seen = Object.create(null);
        const out = [];
        for (const hex of list || []) {
            const k = up(hex);
            if (seen[k]) continue;
            seen[k] = 1;
            out.push(k);
            if (out.length >= max) break;
        }
        return out;
    }

    /**
     * Parts of `end` per 1 part `mother` that land closest to `target` lightness.
     * Lightness is monotonic in the ratio, so a bisection is exact enough and,
     * unlike a fixed ratio table, it adapts to whatever the shelf provides.
     */
    function solveParts(mother, end, target, mix) {
        const from = lightness(mother);
        const rising = lightness(end) > from;
        let lo = 0, hi = MAX_PARTS;
        for (let i = 0; i < ITERATIONS; i++) {
            const mid = (lo + hi) / 2;
            const at = lightness(mix([{ c: mother, w: 1 }, { c: end, w: mid }]));
            if ((at < target) === rising) lo = mid; else hi = mid;
        }
        return (lo + hi) / 2;
    }

    /**
     * @param {object} o
     * @param {string[]} o.sources  pigment hexes (duplicates and excess dropped)
     * @param {string}   o.white    lightest pot of the shelf — what tints
     * @param {string}   o.dark     darkest pot of the shelf — what shades
     * @param {function} o.mix      ([{c,w}]) => hex, the subtractive engine
     * @param {function} [o.name]   hex => human name, for labels
     * @returns {{hues:Array, neutrals:Array, mother:string, sources:string[]}}
     *          or null when there is nothing to build a palette from
     */
    function build(o) {
        const mix = o.mix;
        const nameOf = o.name || ((h) => h);
        const src = sourcesFrom(o.sources, MAX_SOURCES);
        if (src.length < 2) return null;          // one pigment is not a palette

        const hues = src.map((c) => ({ label: nameOf(c), hex: c, pure: true }));
        for (let i = 0; i < src.length; i++) {
            for (let j = i + 1; j < src.length; j++) {
                hues.push({
                    label: nameOf(src[i]) + " + " + nameOf(src[j]),
                    hex: up(mix([{ c: src[i], w: 1 }, { c: src[j], w: 1 }])),
                    pure: false,
                });
            }
        }

        /* Every pigment, equal parts. With two sources this is the same colour
           as their single blend — correct rather than redundant: with two tubes
           the blend IS the mother, so it is not listed twice. */
        const mother = up(mix(src.map((c) => ({ c: c, w: 1 }))));
        if (src.length > 2) {
            hues.push({ label: "All " + src.length + " together", hex: mother, pure: false });
        }

        /* What this shelf can actually reach. Clamping to the extremes keeps a
           short-shelf ramp honest instead of emitting steps that all collapse
           onto the same hex. */
        const white = o.white && lightness(o.white) > lightness(mother) ? up(o.white) : null;
        const dark = o.dark && lightness(o.dark) < lightness(mother) ? up(o.dark) : null;
        const ceiling = white ? lightness(mix([{ c: mother, w: 1 }, { c: white, w: MAX_PARTS }])) : lightness(mother);
        const floor = dark ? lightness(mix([{ c: mother, w: 1 }, { c: dark, w: MAX_PARTS }])) : lightness(mother);

        /* Neither clamping nor filtering alone gets this right. Clamp
           everything and a four-tone Game Boy shelf emits 50/100/200/300 as
           four identical swatches. Filter on the raw range instead and the
           Oils shelf loses its 50 and 900 — the two most useful steps — because
           0.970 misses the ceiling by 0.012.
           So: pull a target in when it is merely just outside, and then test
           the thing actually worth guaranteeing — that no two swatches come out
           looking the same. */
        const TOLERANCE = 0.03;   /* how far outside its range a target may be pulled in */
        const MIN_STEP = 0.015;   /* closer than this in L and it is the same swatch */

        const neutrals = [];
        for (const t of TARGETS) {
            if (t[1] > ceiling + TOLERANCE || t[1] < floor - TOLERANCE) continue;
            const target = Math.max(floor, Math.min(ceiling, t[1]));
            const end = target > lightness(mother) ? white : target < lightness(mother) ? dark : null;
            const hex = end
                ? up(mix([{ c: mother, w: 1 }, { c: end, w: solveParts(mother, end, target, mix) }]))
                : mother;
            const prev = neutrals[neutrals.length - 1];
            if (prev && Math.abs(lightness(prev.hex) - lightness(hex)) < MIN_STEP) continue;
            neutrals.push({ label: t[0], hex: hex });
        }

        return { hues: hues, neutrals: neutrals, mother: mother, sources: src };
    }

    return {
        build: build,
        lightness: lightness,
        MAX_SOURCES: MAX_SOURCES,
        TARGETS: TARGETS,
    };
});
