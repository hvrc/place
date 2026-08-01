import styles from "@engine/styles/menu.module.css";

/** Bottom-right control hint, where the PSP shows its button legend. */
export function Hints() {
  return (
    <div className={styles.hints}>
      <span>Arrow Keys to Move, Enter to Select</span>
    </div>
  );
}
