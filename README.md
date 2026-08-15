# Color Bucket

Mix colors like paint, not like numbers.

A revival of the 2013 iPhone app "Color Bucket" (app by Marcus Wilhelm, copy by
Chloe) as a modern web platform: a COLOURlovers-style palette community built
around a mixing model that behaves like real paint — you combine **paint pots
in parts** ("3 parts cadmium yellow, 1 part ultramarine") instead of fiddling
with pickers and sliders.

> The authorship credit above is factual provenance for a real, released 2013
> product — deliberately left as written, not an incidental credit to clean up.
> A name search should match here; see *Origin* at the end for the same case.

**Live prototype:** https://claude.ai/code/artifact/7382658d-e331-43e8-8299-287651751f21

## Why this works

- **Paint pots, not pickers.** The shelf of classic pigments (titanium white,
  cadmium yellow, ultramarine, burnt sienna, …) is the starting point. Picking
  a raw color from a color picker is exactly the problem this app solves — so
  the pots must come first, the picker is the fallback. (This was the original
  app's core insight.)
- **Paint boxes as shelves.** Every shelf is a paint box of ready-made pots
  (16 where the standard has 16), switchable via tabs: **Oils** (split-primary
  painter's palette, default), **Earths** (prehistory to the old masters:
  ochres, umbers, lapis, lead-tin yellow), **Crayons** (the childhood wax box),
  **C64** (the Commodore 64's 16 hardware colors, Pepto values), **PICO-8**
  (Lexaloffle's fantasy-console palette), **Web** (the 16 HTML 4.01 named
  colors), **DB16** (DawnBringer's pixel-art standard), **Game Boy** (the
  DMG's 4 greens — the smallest paint box in the world), **Zorn** (Anders
  Zorn's famous 4-color portrait palette), **Skin** (16 skin masstones,
  porcelain to onyx), **RAL** (16 curated RAL Classic colors; sRGB values are
  common approximations, RAL is a trademark of RAL gGmbH).
- **Pigment mixing.** Colors combine subtractively via Kubelka-Munk, so
  yellow + blue makes green and a dab of black goes a long way — results feel
  natural in a way channel-averaging never does.
- **Recipes are shareable.** The whole mix lives in the URL hash
  (`#F2C500x3,1F3A93x1;pigment`), which later becomes the seed of the
  community: every palette is a reproducible recipe, not just a set of hex values.

## Mixing engine

`src/mixing.js` — Kubelka-Munk **single-constant approximation** (K/S ratio,
opaque-layer form), applied per channel on linearized sRGB:

```
K/S(R) = (1 − R)² / 2R                    absorption/scattering from reflectance
K/S_mix = Σ wᵢ · K/S(Rᵢ) / Σ wᵢ           weights mix linearly in K/S space
R(K/S) = 1 + K/S − √(K/S² + 2·K/S)        back to reflectance
```

### Verified properties (`npm test`, 14 checks)

- R ↔ K/S inversion is exact across the full reflectance range
- Identity: a color mixed with itself is itself — **exactly**, including
  `#000000`/`#FFFFFF` (the singularity clamp `R_MIN = 1.5e-4` sits below the
  linear value of sRGB 0.5/255, so it is invisible after 8-bit rounding)
- Weights are ratios (scaling all parts changes nothing); commutative;
  continuous in the weights
- Subtractive by proof: K/S is convex in R (d²/dR² = 1/R³ > 0), so by Jensen's
  inequality a mix is never brighter than the linear channel average
- Paint behavior: cadmium yellow + ultramarine → green (naive RGB averaging
  goes muddy on the same input); more parts of the darker paint → strictly darker;
  pure white + pure black stays exactly neutral; warm white + warm black keeps
  its temperature (warm grays, like a real palette)

### Known limits (documented, not hidden)

- Single-constant KM assumes every pigment scatters equally (S = 1). Real
  two-constant KM needs per-pigment K *and* S data.
- It operates on 3 broadband RGB channels, not spectral reflectance — good
  paint-like behavior, but not a spectral simulation. Concrete consequence:
  complementary pairs drift toward whichever channel *both* partners keep
  non-tiny, because K/S punishes the darkest channels hardest. Ultramarine +
  burnt sienna therefore leans green-gray (~`#2D3F2F`) instead of the neutral
  chromatic gray real paint gives. The painter's fix works in-model too: add
  the complement of the cast (2:2:1 ultramarine : burnt sienna : alizarin
  ≈ `#323830`, near-neutral warm gray).
- Very dark colors have enormous K/S, so black tints aggressively — that is
  characteristic of this approximation (and of real carbon black, though the
  model exaggerates it). The pot library softens this in practice: its "ivory
  black" is a realistic warm dark, not `#000000`.
- Possible upgrade path (P1+): reconstruct reflectance spectra from RGB and mix
  spectrally (e.g. a spectral.js-style 38-band approach).
- **Licensing note:** Mixbox (Secret Weapons) is CC BY-NC — not usable for
  anything commercial. This engine is an independent Kubelka-Munk
  implementation; keep it that way.

## Does it help? (measured 2026-08-15)

"Mix colors like paint, not like numbers" is a claim about outcomes, so it gets
measured, not asserted. Run it yourself: `node eval/mixing-proof.js`.

The failure mode a picker has is **mud**: drag a slider from yellow to blue and
the path runs through gray. So the metric is the *minimum* OKLCh chroma along
the whole ramp — a ramp that dies anywhere is a ramp you cannot pick from.
1080 mixes per method: all 120 Oils pot pairs × 9 ratios.

| method | mean min chroma | mud ramps (< 0.04) |
|---|---|---|
| spectral.js (shipped) | 0.0769 | 33 / 120 (28 %) |
| linear, gamma-correct | 0.0736 | 35 / 120 (29 %) |
| naive 8-bit sRGB lerp | 0.0700 | 44 / 120 (37 %) |

**Against a naive picker the engine wins clearly. Against a well-implemented
linear one the average is a tie** — so "spectral mixing just makes prettier
colors" is *not* supported and should not be claimed.

The average is the wrong lens, because the wins are not spread evenly:

- **Six of the eight biggest wins involve Titanium White.** Titanium White +
  Cadmium Yellow: min chroma `0.123` spectral vs `0.017` linear — a 7× gap.
  Tinting ("same color, but lighter") is the most common operation in color
  work, and it is exactly where linear mixing washes a hue out to dead pastel
  while subtractive mixing keeps its identity as it lightens. **This, not the
  blue+yellow party trick, is the product's real proof point.**
- The party trick holds too: cadmium yellow + ultramarine 1:1 →
  `#699437` (chroma 0.132, a live green) vs `#B3956B` linear (chroma 0.068,
  dull tan).
- **Where spectral loses, it loses correctly.** All four counter-examples are
  warm red + blue (cadmium red + ultramarine: `0.010` vs `0.129` linear). No
  painter gets a violet out of those either. The engine is reproducing a real
  pigment limitation, not failing.

The box *can* reach violet — with a cool red. Quinacridone Magenta ×
Ultramarine → `#4D3D8B` (chroma 0.125); × Dioxazine Violet → `#7C3985` (0.138).
Cadmium Red × Ultramarine → `#54403C`, mud. That is a **UX gap, not an engine
gap**: nothing in the product tells the user which pot to reach for.

### Tested and rejected: measured reflectance curves in the pots

The plan used to be that product pots should carry measured pigment spectra.
Tested against Golden Heavy Body measured data (78 paints, 400–700 nm) and
rejected:

- **Measured curves change almost nothing.** Feeding real 38-band curves into
  `new spectral.Color(R)` vs. letting the library reconstruct from the same
  pigment's masstone hex: mean RGB distance **3.3 / 441** across seven 1:1
  mixes on two datasets. The LHTSS reconstruction is already good.
- **Re-seeding pots from measured masstones breaks the paint box.** Confusable
  pot pairs (< 25 RGB units) go from **0 → 15**; mean chroma drops 116 → 79.
  Dioxazine Violet lands at `#403B3A`, seven units from Ivory Black. The data
  is not wrong — real masstones *are* nearly black — but a shelf you cannot
  tell apart destroys "paint pots before pickers".
- **It does not even fix the drift it was meant to fix.** Ultramarine + burnt
  sienna goes from `#3E4431` (chroma spread 19) to `#533E47` (spread **21**) —
  olive to mauve, equally far from neutral.
- **The two open items are coupled, not sequential.** With measured (dark)
  masstones, `concentration = f²·T²·luminance` starves every dark pigment:
  phthalo blue and ultramarine at 1:9 with white become `#DBD8E4` and `#DBD7E8`
  — two units apart, both nearly white, where real phthalo overpowers white.
  The current over-saturated pot hexes are unwittingly compensating for the
  missing `tintingStrength`. Fixing either alone makes the product worse.

Consequence: the complementary-pair drift is **accepted, not a defect**. Under
the product's actual goal — usable, natural colors — `#3E4431` is a perfectly
good deep olive. It bothers a painter, not a user. Measured curves only start
paying off if the engine ever goes **two-constant** (separate K and S), which
is an engine rewrite for a feature the product does not have (glazes, layering).
If that day comes, **Revigo** (Van Gogh palette, 16 paints in linseed/poppyseed
oil, measured over black *and* white grounds, **CC0**) is the dataset to use.

## Structure

| Path | Contents |
|---|---|
| `src/mixing.js` | Reference 3-channel engine (ES module, no dependencies) |
| `test/mixing.test.js` | Verification suite for the reference engine |
| `test/spectral.test.js` | Adoption guards for spectral.js — `npm test` runs both (Node ≥ 18) |
| `eval/spectral-eval.js` | One-shot evaluation protocol that led to the spectral.js adoption |
| `eval/mixing-proof.js` | Does the engine beat a color picker? Repeatable — rerun after engine or shelf changes |
| `prototype/app.html` | Prototype **source** — edit this |
| `build.js` | `npm run build`: inlines `spectral.min.js` (with MIT banner) into the source |
| `prototype/index.html` | **Generated**, self-contained prototype — the published artifact (its CSP forbids external scripts); do not edit directly |

The prototype runs the real spectral engine: `spectral.mix` with memoized
`Color` objects per pot and `factor = √parts` (spectral.js squares factors
internally, so this keeps "3 parts" meaning 3 parts). Verified end-to-end:
the browser reproduces the eval protocol's predicted values exactly
(3:1 cadmium yellow : ultramarine → `#96AD2B`).

## Credits & licenses

- **spectral.js** — © 2025 Ronald van Wijnen, MIT license. The production
  mixing engine. Ship its copyright + permission notice with every
  distribution (bundle banner and an "About / Credits" page in the product).
- **LHTSS** — spectral.js builds its reflectance data with a variation of
  Scott Allen Burns' method ("Generating Reflectance Curves from sRGB
  Triplets"); credit alongside.
- **Kubelka-Munk theory** — Paul Kubelka & Franz Munk, 1931.
- **Not used:** Mixbox (Secret Weapons) — CC BY-NC, incompatible with
  commercial use. Do not copy code or coefficients from it.
- Palette sources: C64 "Pepto" values, PICO-8 palette (Lexaloffle), HTML 4.01
  named colors (W3C), DawnBringer DB16, Game Boy DMG greens. RAL sRGB values
  are common approximations; "RAL" is a trademark of RAL gGmbH — the product
  needs a trademark note if the shelf keeps the name.

## Roadmap

- **P0** — the *real* mixing engine + `<color-bucket>` custom element (no backend) ← *we are here*
  - **Engine decision (2026-08-13): the proper engine ships first — no
    3-channel stopgap in the product.** Target: spectral Kubelka-Munk on
    38 wavelength bands with reflectance reconstruction from sRGB.
  - **ADOPTED: `spectral.js` 3.0.0** (Ronald van Wijnen, MIT) — verified
    before adoption via `eval/spectral-eval.js`; invariants are pinned as
    permanent guards in `test/spectral.test.js`. Findings:
    - Invariants hold: identity exact, weights are ratios, commutative,
      continuous, robust on all pure sRGB corners.
    - Fast enough by a wide margin: ~467k mixes/s with memoized `Color`
      objects, ~188k/s cold (Node 20) — on par with the trivial 3-channel
      engine.
    - `spectral.mix([color, weight], …)` takes any number of colors — matches
      the bucket model directly.
    - Its concentration formula is `f² · tintingStrength² · luminance`:
      factors act **squared** (our parts semantics needs `f = √parts` in the
      wrapper) and luminance-weighting makes light colors dominate (pure
      white + pure black 1:1 → `#A6A6A6`) — a perceptual design choice to be
      calibrated via per-pot `tintingStrength`.
    - Spectral reconstruction from a masstone hex does **not** fix
      complementary-pair drift by itself (ultramarine + burnt sienna still
      leans olive). Measured reflectance curves in the pots were the planned
      fix — **tested 2026-08-15 and rejected**: they change the result by ~3
      RGB units, collapse the shelf into 15 confusable pot pairs, and do not
      neutralize the drift anyway. The drift is now accepted as a deviation
      from real pigment behavior rather than tracked as a defect. See
      *Does it help?* above for the numbers.
    The per-channel engine in `src/mixing.js` stays as the reference/fallback
    implementation and as the prototype's inline engine.
- **P1** — site MVP: mix, share palettes by URL, no login
- **P2** — community: Google sign-in, save/like/search palettes (Firebase: Auth + Firestore + Hosting)
- **P3** — AI-friendly layer: JSON API, llms.txt/MCP, "describe a mood → recipe"

`colorbucket.de` was **available** as of 2026-08-13 (DENIC RDAP).

## Origin

Discovered while backing up the old 1&1/IONOS webspace: the 2013 landing page
lives on in `\\nas\backup\Webspace\colorbucketapp`. The footer quote in the
prototype is from its testimonials — written back then by Chloe.

> As in the intro: this section records who made a real, released product in
> 2013. It is factual provenance and stays as written. Re-crediting it to the
> current identity would make it false, removing it would make it incomplete.
> The prototype's own footer carries no personal name and needs none — the
> quote there is attributed to "a user", which is what it was.
