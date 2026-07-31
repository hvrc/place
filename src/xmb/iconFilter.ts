import type { Theme } from "@/xmb/xmbStore";

/**
 * CSS filter for the white XMB icons, shared by PspIcon and PixelIcon.
 * - A light drop shadow on every icon for depth / legibility.
 * - Dark theme: icons stay white (focus lights up brighter + a soft glow).
 * - Light theme: icons stay white too (no grey tint) but get a stronger shadow
 *   so they read on the pale wallpaper; no white glow (invisible on light).
 */
export function iconFilter(theme: Theme, focused: boolean): string {
  const light = theme === "light";
  const shadow = light
    ? "drop-shadow(0 1px 2px rgba(0,0,0,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.32))"
    : "drop-shadow(0 1.5px 2.5px rgba(0,0,0,0.4))";

  if (focused) {
    return light
      ? `brightness(1) ${shadow}`
      : `brightness(1.2) ${shadow} drop-shadow(0 0 12px rgba(255,255,255,0.65))`;
  }
  // body / inactive — dim via opacity (handled by the caller), not by graying it
  return light ? `brightness(1) ${shadow}` : `brightness(0.85) ${shadow}`;
}
