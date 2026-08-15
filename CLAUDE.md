# CLAUDE.md — Color Bucket

Operating manual for agents working in this repo. `README.md` has the full
story (vision, engine math, eval findings, roadmap, credits) — read it first.
This file is the condensed "how to work here".

## What this is

"Mix colors like paint, not like numbers" — a palette community
(COLOURlovers successor) plus an embeddable `<color-bucket>` mixing picker,
reviving a 2013 iPhone app (app by Marcus Wilhelm, copy by Chloe).
Conversation with the owner is **German**; everything in this repo
— code, comments, docs, commit messages, UI copy — is **English**.

> **If you are running a naming sweep, read this before "fixing" the line
> above.** That credit records who authored a real, released 2013 product. It
> is factual provenance, not an incidental credit line, and it is deliberately
> left as written. Re-crediting it to the current identity would make the
> record false; deleting it would make it incomplete. A name search *should*
> match here — this repo would be wrong if it returned nothing. Same applies
> to the matching lines in `README.md` (intro and Origin). Verified and left
> standing on 2026-08-15.

## Commands

- `npm test` — 21 tests: reference-engine invariants (`test/mixing.test.js`)
  + spectral.js adoption guards (`test/spectral.test.js`). Keep green.
- `npm run build` — regenerates `prototype/index.html` from
  `prototype/app.html` (inlines `spectral.min.js` with MIT banner).
  **Always run after editing app.html.**
- `node eval/spectral-eval.js` — the one-shot protocol that justified the
  spectral.js adoption (kept for reruns after dependency updates).
- `node eval/mixing-proof.js` — does the engine actually beat a colour picker?
  Rerun after any engine or shelf change; the README records the findings.
- `git config core.hooksPath .githooks` — **run once per clone.** Enables the
  pre-commit guard that keeps personal names out of credits and comments.
  `core.hooksPath` is local config and is not versioned, so a fresh clone has
  the hook file but not the setting, and the guard is silently inactive until
  this is run.

## Hard rules

- Edit `prototype/app.html`. **Never** edit `prototype/index.html` — it is
  generated and gets overwritten by the build.
- The live prototype is a Claude artifact:
  https://claude.ai/code/artifact/7382658d-e331-43e8-8299-287651751f21
  Republish `prototype/index.html` to update it. From a conversation that did
  not create the artifact, pass this URL as the `url` parameter — otherwise a
  separate new artifact is created. Keep favicon 🎨 and title "Color Bucket".
- Mixing engine is **spectral.js** (MIT, © 2025 Ronald van Wijnen). Ship the
  MIT notice with every bundle and keep a visible credit (footer / About).
- **Never** copy code or coefficients from Mixbox (CC BY-NC — incompatible
  with commercial use).
- Weights wrapper: pass `factor = Math.sqrt(parts)` into `spectral.mix`
  (it squares factors internally — √ keeps "3 parts" meaning 3 parts).
  Memoize `spectral.Color` objects per hex (measured fast path ~467k mixes/s).

## Decisions log (2026-08-13)

- Ship the real engine first — no 3-channel stopgap in the product.
- spectral.js adopted after verification (the owner's condition: "does exactly what
  we need, fast, efficient, provably correct — then we take it and credit it
  cleanly in the disclaimer"). Eval passed; guards pinned in tests.
- **Paint pots before pickers** — preset pigment pots are the core UX (a raw
  color picker is the problem this app solves). Boxes of 16 like a paint box;
  11 shelves: Oils (default), Earths, Crayons, C64, PICO-8, Web, DB16,
  Game Boy (4), Zorn (4), Skin, RAL.
- Product pots should eventually carry **measured pigment reflectance
  curves** — `new spectral.Color(R)` accepts 38-band arrays directly. That is
  the real fix for complementary-pair drift (ultramarine + burnt sienna
  currently leans olive; documented in README).
- Light colors dominate mixes (spectral.js concentration = f²·T²·luminance;
  pure white + pure black 1:1 → #A6A6A6). Calibrate later via per-pot
  `tintingStrength`.

## Gotchas

- **Never rebuild DOM on `input` events** — destroying an
  `<input type="color">` makes the browser close the native picker instantly.
  Refresh values in place; rebuild rows only on add/remove. (Applies to the
  future web component too.)
- `build.js` must use a **function replacer** in `String.replace` — minified
  JS contains `$` sequences that string replacements treat as patterns.
- Artifact pages must be fully self-contained (CSP blocks external scripts,
  fonts, fetches) — hence the inline build step.
- The whole recipe is shareable state in the URL hash:
  `<hex>x<parts>,…;<mode>;<shelf>` (e.g. `#F2C500x3,1F3A93x1;pigment;oils`).
- RAL pot values are common sRGB approximations; "RAL" is a trademark of
  RAL gGmbH — the product needs a trademark note if the shelf keeps the name.

## State & next steps

- **Done:** engine adopted + guarded; prototype runs spectral.js end-to-end
  (browser-verified: 3:1 cadmium yellow : ultramarine → `#96AD2B`, matching
  the eval prediction exactly); 11 paint-box shelves; per-bucket hex input;
  URL recipe sharing; MIT credit in footer.
- **Next (P0):** `<color-bucket>` custom element — Shadow DOM, attributes
  (e.g. `shelf="oils"`), events (e.g. `colorchange`), built from the
  app.html logic. Then P1 site MVP → P2 Firebase community → P3 AI layer
  (details in README roadmap).
- `colorbucket.de` was available on 2026-08-13 (DENIC RDAP).
- This folder is **not a git repository yet** (as of 2026-08-13).
