// Generic colour-palette machinery for the wave/theme system. Knows how to
// parse hex, decide light vs dark, and order an arbitrary set of colours into a
// pleasing VIBGYOR ramp. The concrete list of colours lives with the frontend.

export type Theme = "dark" | "light";

/** hex "RRGGBB" -> {h, s, l} (h 0-360, s/l 0-100). */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const n = parseInt(hex, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Perceptual brightness 0-255. */
function luminance(hex: string): number {
  const n = parseInt(hex, 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
}

/** VIBGYOR band index (violet -> indigo/blue -> green -> yellow -> orange -> red). */
function vibgyorBand(hue: number): number {
  if (hue >= 250 && hue < 340) return 0; // violet / indigo
  if (hue >= 160 && hue < 250) return 1; // blue
  if (hue >= 70 && hue < 160) return 2; // green
  if (hue >= 45 && hue < 70) return 3; // yellow
  if (hue >= 15 && hue < 45) return 4; // orange
  return 5; // red / pink  (>=340 or <15)
}

/** A colour drives dark mode when it's dark, light mode when it's light. */
export function themeForColor(hex: string): Theme {
  return luminance(hex) < 128 ? "dark" : "light";
}

// VIBGYOR band, then the pure/punchy hues (saturated and not washed-out) lead
// the band before the pale + muted/earthy tones, each ramped dark->light. This
// keeps e.g. the true oranges reading as ORANGE instead of being diluted by
// tans, khakis and pale peaches of the same hue.
const isPure = (c: { s: number; l: number }) => (c.s >= 55 && c.l <= 72 ? 0 : 1);
const byVibgyor = (a: string, b: string) => {
  const ha = hexToHsl(a);
  const hb = hexToHsl(b);
  return vibgyorBand(ha.h) - vibgyorBand(hb.h) || isPure(ha) - isPure(hb) || ha.l - hb.l;
};

/**
 * Order a raw set of hex colours into the wave palette: the dark colours first
 * (VIBGYOR), then the light colours (VIBGYOR) — dark to light overall.
 */
export function buildPalette(rawColors: string[]): string[] {
  return [
    ...rawColors.filter((h) => luminance(h) < 128).sort(byVibgyor),
    ...rawColors.filter((h) => luminance(h) >= 128).sort(byVibgyor),
  ];
}
