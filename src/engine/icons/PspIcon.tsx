import { motion } from "framer-motion";
import { useIconLight } from "./useIconLight";

/** Unfocused PNGs sit slightly back from full white. */
const DIM = 0.82;

/**
 * Renders an authentic PSP XMB icon PNG with the spec's body/focus behavior:
 * the "body" state is slightly dimmed and smaller; on focus the icon scales up
 * to its focus size and "lights up white" (brightness + glow), per the PSP
 * Custom Theme Creation Guidelines.
 *
 * Those two looks (dim/no glow and lit/glowing) are the only ones an icon
 * has. The selected icon in a column swings between them (`throb`); every other
 * selected icon just holds the lit one; and hovering an unselected icon shows
 * the lit look too, as a promise of what clicking it would do.
 *
 * `name` is the icon stem, e.g. "game" -> /icons/psp/tex_game.32bit.png
 */
export function PspIcon({
  name,
  focused,
  size,
  keepSize = false,
  throb = false,
  hovered = false,
}: {
  name: string;
  focused: boolean;
  /** display height of the focused icon, in px */
  size: number;
  /** keep full size when unfocused (only dim, don't shrink) */
  keepSize?: boolean;
  /** pulse between the dim and lit looks while focused (column icons only) */
  throb?: boolean;
  /** the pointer is over this icon's row: show the lit look */
  hovered?: boolean;
}) {
  const light = useIconLight({ focused, hovered, throb, keepSize, dimOpacity: DIM });

  return (
    <motion.img
      src={`/icons/psp/tex_${name}.32bit.png`}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        height: size,
        width: "auto",
        transformOrigin: "center",
        imageRendering: "auto",
      }}
      initial={false}
      animate={light.animate}
      transition={light.transition}
    />
  );
}
