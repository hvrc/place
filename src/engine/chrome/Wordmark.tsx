import styles from "@engine/styles/menu.module.css";

/** Top-left wordmark. Text is supplied by the frontend. */
export function Wordmark({ text }: { text: string }) {
  return <div className={styles.brand}>{text}</div>;
}
