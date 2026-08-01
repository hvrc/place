import styles from "@engine/styles/menu.module.css";

/**
 * How long an item has to hold focus before its backdrop takes over the screen.
 * The arc below is the visible half of this: it fills exactly once over the
 * same span, so the wait reads as loading rather than as nothing happening.
 * Backdrop imports it so the two can never drift.
 */
export const DWELL_MS = 3000;

/**
 * A ring that draws itself once over the dwell, centred on the screen, while a
 * backdrop loads behind the menu. Mount it with a `key` of the pending item's
 * id so the sweep restarts as focus moves.
 */
export function DwellArc() {
  return (
    <div className={styles.dwellArcWrap} aria-hidden="true">
      <svg className={styles.dwellArc} viewBox="0 0 24 24">
        <circle className={styles.dwellArcHead} cx="12" cy="12" r="9" />
      </svg>
    </div>
  );
}
