/**
 * Color Bucket — mixing engine.
 *
 * Pigment mixing uses the Kubelka-Munk single-constant approximation
 * (K/S ratio, opaque-layer form) applied per channel on linearized sRGB:
 *
 *   K/S(R)  = (1 - R)^2 / (2R)            — absorption/scattering from reflectance
 *   R(K/S)  = 1 + K/S - sqrt(K/S^2 + 2·K/S) — reflectance of an opaque layer
 *   mix     = R( weighted mean of K/S values )
 *
 * This models paint-like subtractive behavior (yellow + blue → green,
 * a little black overpowers a lot of white) without per-pigment spectral
 * data. It is an approximation, not a spectral simulation — see README.
 */

export function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function rgbToHex(rgb) {
  return (
    '#' +
    rgb
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/** sRGB 0–255 → linear 0–1 */
export function srgbToLinear(v) {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** linear 0–1 → sRGB 0–255 */
export function linearToSrgb(v) {
  v = Math.max(0, Math.min(1, v));
  v = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return v * 255;
}

// Reflectance is clamped away from 0 and 1: K/S is singular at R=0 and
// zero at R=1, so pure black/white need an epsilon to stay finite.
// R_MIN is chosen below the linear value of sRGB 0.5/255 so that the
// clamp is invisible after 8-bit rounding — a color mixed with itself
// returns exactly itself, including #000000.
const R_MIN = 1.5e-4;
const R_MAX = 0.9995;

/** reflectance → K/S */
export function ksFromR(R) {
  R = Math.min(R_MAX, Math.max(R_MIN, R));
  return ((1 - R) * (1 - R)) / (2 * R);
}

/** K/S → reflectance (opaque layer) */
export function rFromKs(ks) {
  return 1 + ks - Math.sqrt(ks * ks + 2 * ks);
}

/**
 * Mix buckets pigment-style (Kubelka-Munk).
 * @param {{c: string, w: number}[]} buckets — hex color + weight (parts)
 * @returns {string} hex color
 */
export function mixPigment(buckets) {
  const tw = buckets.reduce((a, b) => a + b.w, 0) || 1;
  const out = [0, 0, 0];
  for (let ch = 0; ch < 3; ch++) {
    let ks = 0;
    for (const b of buckets) {
      ks += (b.w / tw) * ksFromR(srgbToLinear(hexToRgb(b.c)[ch]));
    }
    out[ch] = linearToSrgb(rFromKs(ks));
  }
  return rgbToHex(out);
}

/**
 * Mix buckets as a plain weighted average of sRGB channel values
 * (the "naive" mode shown for comparison).
 */
export function mixRgb(buckets) {
  const tw = buckets.reduce((a, b) => a + b.w, 0) || 1;
  const out = [0, 0, 0];
  for (const b of buckets) {
    const rgb = hexToRgb(b.c);
    for (let ch = 0; ch < 3; ch++) out[ch] += rgb[ch] * (b.w / tw);
  }
  return rgbToHex(out);
}

/** Relative luminance (0–1) of a hex color, for contrast decisions. */
export function luma(hex) {
  const r = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r[0]) + 0.7152 * srgbToLinear(r[1]) + 0.0722 * srgbToLinear(r[2]);
}

/** Hue in degrees (0–360) of a hex color; used in tests. */
export function hue(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return ((h * 60) + 360) % 360;
}
