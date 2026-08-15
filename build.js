/**
 * Build the self-contained prototype: inline spectral.min.js into the
 * source (prototype/app.html) and write prototype/index.html — the file
 * that gets published as the artifact (its CSP forbids external scripts).
 *
 * Run: npm run build
 */
import { readFileSync, writeFileSync } from 'node:fs';

const MARKER = '<!-- @inline:spectral.js -->';
const src = readFileSync('prototype/app.html', 'utf8');
if (!src.includes(MARKER)) throw new Error(`marker ${MARKER} not found in prototype/app.html`);

const lib = readFileSync('node_modules/spectral.js/spectral.min.js', 'utf8');
const banner =
  '/*! spectral.js v3.0.0 | (c) 2025 Ronald van Wijnen | MIT License | https://github.com/rvanwijnen/spectral.js */\n';

// String-replacer callback, NOT a replacement string: minified code contains
// "$" sequences that String.replace would otherwise treat as patterns.
const out = src
  .replace(/^<!-- SOURCE file[^>]*-->\r?\n/, '')
  .replace(MARKER, () => '<script>\n' + banner + lib + '\n</script>');

writeFileSync(
  'prototype/index.html',
  '<!-- GENERATED from prototype/app.html by build.js — edit app.html, then run `npm run build` -->\n' + out
);
console.log(`built prototype/index.html (${out.length + 100} bytes, spectral.js inlined)`);
