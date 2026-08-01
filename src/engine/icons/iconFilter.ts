import type { Theme } from "@engine/settings/palette";

/**
 * CSS filter for the white XMB icons, shared by PspIcon and MaterialIcon.
 * - A light drop shadow on every icon for depth / legibility.
 * - On focus the icon lights up (brighter) with a soft white glow — in both
 *   themes (the glow reads as a gentle bloom even on the pale wallpaper).
 *
 * `glow` scales that bloom, 0 (none) through ~1.2 (full). The glow shadow is
 * always in the string, at zero when unlit, so the filter's shape never changes
 * between states and Framer can interpolate one into the next — that's what
 * lets the lit icon throb and an inactive one bloom under the pointer.
 */
export function iconFilter(theme: Theme, focused: boolean, glow = focused ? 1 : 0): string {
  const light = theme === "light";
  const shadow = light
    ? "drop-shadow(0 1px 2px rgba(0,0,0,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.32))"
    : "drop-shadow(0 1.5px 2.5px rgba(0,0,0,0.4))";
  // body / inactive is dimmed via opacity (handled by the caller), not greyed
  const brightness = focused ? (light ? 1.06 : 1.2) : light ? 1 : 0.85;
  const radius = ((light ? 10 : 12) * glow).toFixed(2);
  const alpha = ((light ? 0.6 : 0.65) * glow).toFixed(3);

  return `brightness(${brightness}) ${shadow} drop-shadow(0 0 ${radius}px rgba(255,255,255,${alpha}))`;
}

/**
 * How long the selected column icon takes to swing from its dim look to its lit
 * one. It mirrors, so a full breath is twice this.
 */
export const THROB_SEC = 0.95;

/** How long an icon takes to light up or fall back — a fade, not a switch. */
export const LIGHT_SEC = 0.34;
