import { useState } from "react";
import type { Letter } from "./letters";
import { Pill } from "@wii/ui/Pill";
import { copyText, openTab } from "@engine/lib/browser";
import styles from "@wii/wii.module.css";

/** An opened letter, on the console's paper. */
export function LetterSheet({ letter, onClose }: { letter: Letter; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!letter.copy) return;
    await copyText(letter.copy);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={styles.sheet} onClick={onClose}>
      <div
        className={`${styles.sheetCard} ${styles.zoomIn}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={letter.title}
      >
        <div className={styles.sheetHead}>
          <h2>{letter.title}</h2>
          <span>{letter.from}</span>
        </div>
        <div className={styles.sheetBody}>
          {letter.body.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
        <div className={styles.sheetActions}>
          <Pill ghost onClick={onClose}>
            Back
          </Pill>
          {letter.copy && (
            <Pill onClick={copy}>{copied ? "Copied!" : "Copy Address"}</Pill>
          )}
          {letter.href && (
            <Pill onClick={() => openTab(letter.href!)}>{letter.hrefLabel ?? "Open"}</Pill>
          )}
        </div>
      </div>
    </div>
  );
}
