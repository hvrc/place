import { motion } from "framer-motion";
import { useMenu } from "@engine/state/MenuContext";
import { iconFilter } from "./iconFilter";

/**
 * Renders an authentic PSP XMB icon PNG with the spec's body/focus behavior:
 * the "body" state is slightly dimmed and smaller; on focus the icon scales up
 * to its focus size and "lights up white" (brightness + glow), per the PSP
 * Custom Theme Creation Guidelines.
 *
 * `name` is the icon stem, e.g. "game" -> /icons/psp/tex_game.32bit.png
 */
export function PspIcon({
  name,
  focused,
  size,
  className,
  keepSize = false,
}: {
  name: string;
  focused: boolean;
  /** display height of the focused icon, in px */
  size: number;
  className?: string;
  /** keep full size when unfocused (only dim, don't shrink) */
  keepSize?: boolean;
}) {
  const theme = useMenu((s) => s.settings.theme);
  return (
    <motion.img
      src={`/icons/psp/tex_${name}.32bit.png`}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={className}
      style={{
        height: size,
        width: "auto",
        // body renders at ~78% of focus size; focus fills to full size
        transformOrigin: "center",
        imageRendering: "auto",
      }}
      initial={false}
      animate={{
        scale: focused ? 1 : keepSize ? 1 : 0.78,
        opacity: focused ? 1 : 0.82,
        filter: iconFilter(theme, focused),
      }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    />
  );
}
