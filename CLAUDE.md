# CLAUDE.md — Color Bucket

Operating manual for agents working in this repo. `README.md` has the full
story (vision, engine math, eval findings, roadmap, credits) — read it first.
This file is the condensed "how to work here".

## What this is

"Mix colors like paint, not like numbers" — one app on
[SACRVM APPKIT](https://github.com/SACRVM/sacrvm-appkit), reviving a 2013
iPhone app (app by Marcus Wilhelm, copy by Chloe).
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

**One repo, one app.** The repo *is* the app: `app.json` (the manifest a
desktop reads), `app.js` (one custom element, one classic script), `app.css`,
`index.html` as a standalone harness, and `vendor/` for the mixing engine.

## Commands

- `npm run serve` — `npx serve .`, then F5. That is the whole dev loop.
- `npm test` — 21 tests: reference-engine invariants (`test/mixing.test.js`)
  + spectral.js adoption guards (`test/spectral.test.js`). Keep green.
- `npm run proof` — does the engine actually beat a color picker?
  Rerun after any engine or shelf change; the README records the findings.
- `node eval/spectral-eval.js` — the one-shot protocol that justified the
  spectral.js adoption (kept for reruns after an engine update).
- `git config core.hooksPath .githooks` — **run once per clone.** Enables the
  pre-commit guard that keeps personal names out of credits and comments.
  `core.hooksPath` is local config and is not versioned, so a fresh clone has
  the hook file but not the setting, and the guard is silently inactive until
  this is run.

## Hard rules — the APPKIT contract

- **No build step.** Vanilla custom elements, plain CSS, `npx serve .` and F5.
  Never introduce a bundler, node_modules, TypeScript, or a framework.
- **One custom element**, defined through `sac.app.define(tag, class)`. Helper
  classes are fine; a second registered element means a second repo.
- **Light DOM.** No shadow root — `ui.css` has to reach the markup.
- **Tokens only.** Style `app-color-bucket ...`, never `:root`. No raw color
  literals in chrome; the app sets exactly one seed, `--accent`, and the kit
  re-derives the whole accent family from it.
  The deliberate exceptions are marked in `app.css`: pots, swatches and the
  result plane are painted from **data**, and the two buttons on the result
  plane inherit `currentColor` because no token can be trusted to contrast
  against an arbitrary mixed color.
- **Don't vendor the kit.** The host provides it; `index.html` borrows it from
  the appkit's Pages purely so the app can run alone.
- **The kit's API only.** Never reach into a component's shadow root or
  private fields. Anything on `sac` beyond `sac.app` belongs to the host and
  is optional — guard it (`typeof sac.toast === "function"`).

## The three hooks

`build()` writes markup once. `onMount(context)` runs when the app is really
on screen — subscriptions, restore, first render. `onUnmount()` undoes exactly
what `onMount` did: every unsubscribe kept, every timer cleared.

## Engine rules

- Mixing engine is **spectral.js** (MIT, © 2025 Ronald van Wijnen), vendored at
  `vendor/spectral.min.js`. Ship its MIT notice (it is in `LICENSE`) and keep a
  visible credit.
- **`sac.app` has no script loader**, and a desktop only fetches `entry` from
  the manifest — so `index.html` cannot be where the engine comes from.
  `app.js` injects it itself and calls `sac.app.define` only after it loads.
  Defining late is safe: elements already in the DOM upgrade on define.
- `vendor/` carries its own `package.json` with `"type": "commonjs"`. That is
  what lets Node `require()` the UMD bundle while the repo root is
  `type: module` — the tests then run against the exact file the browser gets.
- Weights wrapper: pass `factor = Math.sqrt(parts)` into `spectral.mix`
  (it squares factors internally — √ keeps "3 parts" meaning 3 parts).
  Memoize `spectral.Color` objects per hex (measured fast path ~467k mixes/s).
- **Never** copy code or coefficients from Mixbox (CC BY-NC).

## Decisions log

- Ship the real engine first — no 3-channel stopgap in the product.
- spectral.js adopted after verification (the owner's condition: "does exactly
  what we need, fast, efficient, provably correct — then we take it and credit
  it cleanly in the disclaimer"). Eval passed; guards pinned in tests.
- **Paint pots before pickers** — preset pigment pots are the core UX (a raw
  color picker is the problem this app solves). Boxes of 16 like a paint box;
  11 shelves: Oils (default), Earths, Crayons, C64, PICO-8, Web, DB16,
  Game Boy (4), Zorn (4), Skin, RAL.
- Measured pigment reflectance curves in the pots were the planned fix for
  complementary-pair drift. **Tested 2026-08-15 and rejected** — see
  *Does it help?* in the README for the numbers. The drift is accepted as a
  deviation from real pigment behavior, not tracked as a defect.
- Light colors dominate mixes (spectral.js concentration = f²·T²·luminance;
  pure white + pure black 1:1 → #A6A6A6). Calibrate later via per-pot
  `tintingStrength` — the hook already exists in the library.
- **Built on SACRVM APPKIT (2026-08-16).** The Shadow-DOM `<color-bucket>`
  plan is dropped: the kit requires light DOM, which is better here anyway
  because the tokens reach the markup. URL recipes, palette storage and theme
  all come from `context` instead of being built.

## Gotchas

- **Never rebuild DOM on `input` events** — destroying an
  `<input type="color">` makes the browser close the native picker instantly.
  Refresh values in place; rebuild rows only on add/remove. `refresh()` is the
  in-place path, `buildBuckets()` the structural one — keep them separate.
- The whole recipe is shareable state carried as the app's **route**:
  `<hex>x<parts>,…;<mode>;<shelf>`. Standalone that is the whole hash; on a
  desktop the host puts it under `#/color-bucket/`. Use `context.deepLink.set`
  and `context.route`, never `location.hash` directly, or it breaks installed.
- `context.fs` is rooted at the app id, and the id comes off the tag when
  running standalone (`app-color-bucket` → `color-bucket`). Renaming the tag
  without renaming the manifest id silently moves the storage.
- RAL pot values are common sRGB approximations; "RAL" is a trademark of
  RAL gGmbH — the product needs a trademark note if the shelf keeps the name.

## State & next steps

- **Done:** engine adopted + guarded; app runs on APPKIT end-to-end
  (browser-verified: 3:1 cadmium yellow : ultramarine → `#96AD2B`, matching
  the eval prediction exactly, unchanged across the migration); 11 paint-box
  shelves; per-bucket hex input; recipe in the route; palette persisted via
  `context.fs`; MIT.
- **Next:** publish — Settings → Pages → deploy from `main`, `/ (root)`, then
  `app.json` must load over HTTPS before a desktop can install it.
- Not yet done: harmony (pick 2–3 pots → a whole palette), which is where
  "colors that go together without a design degree" actually lives.
- `colorbucket.de` was available on 2026-08-13 (DENIC RDAP).

## Firepit inbox

At the start of a session, read any pending messages in `.firepit/inbox/*.md` — cross-project notes Firepit routes here. Act on each, then mark it done with the `firepit_inbox_complete` MCP tool, passing the message's filename as the `id`.

## Firepit knowledge

Before researching something that may already be known, query the knowledge base with the `firepit_knowledge_search` MCP tool (scope `both` covers this project plus the global base). Save durable findings with `firepit_knowledge_add` — written in English, per the indexing convention. The created markdown files live under `.firepit/knowledge/`. That folder is **not** versioned here: this repo is public, and a knowledge base needs a destination that is both durable and non-public — which a gitignored folder is not. A destination is being decided; until then treat anything written there as local-only and not backed up.

## Firepit pinned knowledge

@.firepit/knowledge-pinned.md

The import above auto-loads the knowledge docs marked `pin: true` in their frontmatter — always-on rules that apply every session without a search. Firepit regenerates the file from the pinned docs; don't edit it directly. Pin/unpin via the pinned flag on `firepit_knowledge_add` / `firepit_knowledge_update`, and keep the pinned set small — everything else stays reachable through `firepit_knowledge_search`.

## Firepit artifacts

When you produce a file the user will want to open — a report, screenshot, diagram, generated image, log excerpt, build output, or an executable you built for them to run — pin it with the `firepit_artifact_add` MCP tool so it appears in the project's paperclip pane. Do this as you produce it, not at the end of the session; a path buried in scrollback is a path the user has to hunt for. Pinning only links the file — it stays where it is, and `firepit_artifact_remove` never deletes it. Check `firepit_artifact_list` first so you update an existing entry instead of piling up near-duplicates, and unpin what has gone stale.
