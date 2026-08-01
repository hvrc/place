import { useState } from "react";
import { profile } from "@content/index";
import { Pill } from "@wii/ui/Pill";
import styles from "@wii/wii.module.css";

/**
 * The pencil on the message board: write a letter back.
 *
 * The console posted to another Wii; this hands the text to your mail client,
 * which is the only outbox a static site has. Nothing is sent from the page and
 * nothing is stored.
 */
export function ComposeSheet({ onClose }: { onClose: () => void }) {
  const [body, setBody] = useState("");

  const send = () => {
    const subject = encodeURIComponent("A letter from your Wii Menu");
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${encodeURIComponent(body)}`;
    onClose();
  };

  return (
    <div className={styles.sheet} onClick={onClose}>
      <div
        className={`${styles.sheetCard} ${styles.zoomIn}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Write a letter"
      >
        <div className={styles.sheetHead}>
          <h2>Write a letter</h2>
          <span>To: {profile.email}</span>
        </div>
        <textarea
          className={styles.compose}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Say hello, ask about the work, or send a link…"
          rows={7}
          autoFocus
        />
        <div className={styles.sheetActions}>
          <Pill ghost onClick={onClose}>
            Back
          </Pill>
          <Pill onClick={send} disabled={!body.trim()} style={{ opacity: body.trim() ? 1 : 0.55 }}>
            Send
          </Pill>
        </div>
      </div>
    </div>
  );
}
