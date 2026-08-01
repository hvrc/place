import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "@wii/wii.module.css";

/**
 * The rounded, blue-ringed button the Wii uses for every confirmation: "Wii
 * Menu", "Start", "Back", "OK". One component so the ring, the hover bloom and
 * the press squash stay identical everywhere.
 */
export function Pill({
  children,
  ghost,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; ghost?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      className={[styles.pill, ghost ? styles.ghost : "", className ?? ""].join(" ")}
    >
      {children}
    </button>
  );
}
