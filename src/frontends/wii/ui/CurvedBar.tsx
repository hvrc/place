import type { ReactNode } from "react";
import styles from "@wii/wii.module.css";

/**
 * The menu's signature bottom band: a white sheet whose top edge rises into a
 * shoulder under each corner button and sags across the middle, outlined in the
 * system's pale blue.
 *
 * It's a layout primitive, not a screen — the Wii Menu, the message board and
 * the settings screens all sit on the same band with different things in the
 * three wells (`left`, `centre`, `right`).
 */
export function CurvedBar({
  left,
  centre,
  right,
}: {
  left?: ReactNode;
  centre?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className={styles.bar}>
      <svg
        className={styles.barCurve}
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="wiiBarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#fafbfb" />
            <stop offset="1" stopColor="#eef0f1" />
          </linearGradient>
        </defs>
        <path
          d="M0 6 C48 6 74 36 132 46 C286 72 392 78 500 78 C608 78 714 72 868 46 C926 36 952 6 1000 6 L1000 200 L0 200 Z"
          fill="url(#wiiBarFill)"
        />
        <path
          d="M0 6 C48 6 74 36 132 46 C286 72 392 78 500 78 C608 78 714 72 868 46 C926 36 952 6 1000 6"
          fill="none"
          stroke="#8ad4ef"
          strokeWidth="2.4"
          vectorEffect="non-scaling-stroke"
        />
        {/* the thin inner sheen the console draws just under the outline */}
        <path
          d="M0 12 C48 12 74 42 132 52 C286 78 392 84 500 84 C608 84 714 78 868 52 C926 42 952 12 1000 12"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
          opacity="0.9"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className={styles.barInner}>
        <div className={styles.barSide}>{left}</div>
        <div className={styles.barSide}>{right}</div>
      </div>
      {centre && <div className={styles.barCentre}>{centre}</div>}
    </div>
  );
}
