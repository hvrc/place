import { useReducedMotion } from "framer-motion";
import { useMenu } from "@engine/state/MenuContext";
import { iconFilter, THROB_SEC, LIGHT_SEC } from "./iconFilter";

/** Unfocused icons sit back at ~78% unless the caller keeps them full size. */
const BODY_SCALE = 0.78;
/** How long the size change takes; the light has its own, slower timing. */
const RESIZE_SEC = 0.16;

export interface IconLight {
  /** the complete Framer `animate` for an icon: size plus the two looks */
  animate: { scale: number; opacity: number | number[]; filter: string | string[] };
  /** the matching `transition` */
  transition: Record<string, unknown>;
}

/**
 * An XMB icon only ever wears two looks: dim (greyed, no glow) and lit (bright
 * white with a glow). This resolves which one applies, and how to get there , 
 *
 *   focused, in a column   → pulses between the two
 *   focused, anywhere else → holds lit
 *   hovered                → holds lit, so it previews what clicking would do
 *   otherwise              → dim
 *
 * It returns the whole animate/transition pair rather than just the light, so
 * every renderer moves and lights identically: they only differ in what they
 * draw. `prefix` is prepended to every filter (the soft raster softens itself
 * with a blur) and `dimOpacity` differs per renderer, because the two icon sets
 * don't sit back equally.
 */
export function useIconLight({
  focused,
  hovered = false,
  throb = false,
  keepSize = false,
  dimOpacity,
  prefix = "",
}: {
  focused: boolean;
  hovered?: boolean;
  throb?: boolean;
  /** stay full size when unfocused (only dim, don't shrink) */
  keepSize?: boolean;
  dimOpacity: number;
  prefix?: string;
}): IconLight {
  const theme = useMenu((s) => s.settings.theme);
  const still = useReducedMotion();

  const pulsing = focused && throb && !still;
  const on = focused || hovered;
  const dim = `${prefix}${iconFilter(theme, false)}`;
  const lit = `${prefix}${iconFilter(theme, true)}`;

  const pulse = { duration: THROB_SEC, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" };
  const fade = { duration: LIGHT_SEC, ease: "easeOut" };
  const timing = pulsing ? pulse : fade;

  return {
    animate: {
      scale: focused || keepSize ? 1 : BODY_SCALE,
      opacity: pulsing ? [dimOpacity, 1] : on ? 1 : dimOpacity,
      filter: pulsing ? [dim, lit] : on ? lit : dim,
    },
    transition: { duration: RESIZE_SEC, ease: "easeOut", opacity: timing, filter: timing },
  };
}
