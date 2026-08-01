import { useReducedMotion } from "framer-motion";
import { useMenu } from "@engine/state/MenuContext";
import { iconFilter, THROB_SEC, LIGHT_SEC } from "./iconFilter";

export interface IconLight {
  /** true while focused or hovered — the caller uses it for its own opacity */
  on: boolean;
  /** Framer `animate` values for opacity + filter */
  animate: { opacity: number | number[]; filter: string | string[] };
  /** matching per-key `transition` */
  transition: {
    opacity: Record<string, unknown>;
    filter: Record<string, unknown>;
  };
}

/**
 * An XMB icon only ever wears two looks: dim (greyed, no glow) and lit (bright
 * white with a glow). This resolves which one applies, and how to get there —
 *
 *   focused, in a column  → pulses between the two
 *   focused, anywhere else → holds lit
 *   hovered                → holds lit, so it previews what clicking would do
 *   otherwise              → dim
 *
 * `prefix` is prepended to every filter (MaterialIcon softens its canvas with a
 * blur), and `dimOpacity` differs per renderer because the two icon sets don't
 * sit back equally.
 */
export function useIconLight({
  focused,
  hovered = false,
  throb = false,
  dimOpacity,
  prefix = "",
}: {
  focused: boolean;
  hovered?: boolean;
  throb?: boolean;
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
    on,
    animate: {
      opacity: pulsing ? [dimOpacity, 1] : on ? 1 : dimOpacity,
      filter: pulsing ? [dim, lit] : on ? lit : dim,
    },
    transition: { opacity: timing, filter: timing },
  };
}
