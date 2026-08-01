import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "@wii/wii.module.css";

/**
 * A circular chrome button on the bottom bar. The large variant is the Wii and
 * mail buttons (white disc, blue ring, glowing on hover); `small` is the flat
 * blue SD-card glyph that sits beside the Wii button with no disc behind it.
 */
export function Orb({
  children,
  small,
  badge,
  badgeUnread,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  small?: boolean;
  badge?: number;
  badgeUnread?: boolean;
}) {
  return (
    <button
      type="button"
      {...rest}
      className={[styles.orb, small ? styles.orbSmall : "", className ?? ""].join(" ")}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className={[styles.badge, badgeUnread ? styles.unread : ""].join(" ")}>{badge}</span>
      )}
    </button>
  );
}
