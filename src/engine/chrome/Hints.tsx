import styles from "@engine/styles/menu.module.css";

/**
 * Bottom-right control hint, where the PSP shows its button legend. Names the
 * controls the device actually has: CSS picks the line, so there's no
 * user-agent guessing and no flash of the wrong one.
 */
export function Hints() {
  return (
    <div className={styles.hints}>
      <span className={styles.hintsKeys}>Arrows to Move · Enter to Select</span>
      <span className={styles.hintsTouch}>Swipe to Move · Tap to Select</span>
    </div>
  );
}
