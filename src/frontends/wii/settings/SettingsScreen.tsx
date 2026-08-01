import { useEffect, useState } from "react";
import { SETTINGS_PAGES, type SettingsItem } from "./panels";
import { Pill } from "@wii/ui/Pill";
import { Triangle } from "@wii/ui/glyphs";
import { useWii } from "@wii/state";
import styles from "@wii/wii.module.css";

/**
 * Wii System Settings: the black screen with the white tab, a column of
 * capsule buttons, and the numbered pages in the corner. Selecting one swaps
 * the column for that setting's panel; Back steps out one level at a time.
 */
export function SettingsScreen({
  onExit,
  openData,
}: {
  onExit: () => void;
  openData: () => void;
}) {
  const [page, setPage] = useState(0);
  const [item, setItem] = useState<SettingsItem | null>(null);
  const [confirmFormat, setConfirmFormat] = useState(false);
  const reset = useWii((s) => s.reset);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirmFormat) setConfirmFormat(false);
      else if (item) setItem(null);
      else onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, confirmFormat, onExit]);

  const back = () => (item ? setItem(null) : onExit());

  return (
    <div className={`${styles.settings} ${styles.fade}`}>
      <div className={styles.settingsHead}>
        <span className={styles.settingsTab}>
          {item ? item.title : `Wii System Settings ${page + 1}`}
        </span>
      </div>

      <div className={styles.settingsBody}>
        {item ? (
          <item.Body
            close={() => setItem(null)}
            openData={openData}
            format={() => setConfirmFormat(true)}
          />
        ) : (
          <>
            {page > 0 && (
              <button
                type="button"
                className={`${styles.pageArrow} ${styles.pageArrowLeft}`}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                <Triangle dir="left" />
              </button>
            )}
            {page < SETTINGS_PAGES.length - 1 && (
              <button
                type="button"
                className={`${styles.pageArrow} ${styles.pageArrowRight}`}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                <Triangle />
              </button>
            )}
            <div className={styles.settingsList}>
              {SETTINGS_PAGES[page].map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={styles.settingsItem}
                  onClick={() => setItem(entry)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.settingsFoot}>
        <Pill onClick={back}>Back</Pill>
        <div className={styles.settingsPages}>
          {SETTINGS_PAGES.map((_, p) => (
            <button
              key={p}
              type="button"
              className={[styles.settingsPageBtn, p === page && !item ? styles.on : ""].join(" ")}
              onClick={() => {
                setItem(null);
                setPage(p);
              }}
            >
              {p + 1}
            </button>
          ))}
        </div>
      </div>

      {confirmFormat && (
        <div className={styles.modal}>
          <div className={`${styles.modalCard} ${styles.zoomIn}`}>
            <h3>Format Wii System Memory?</h3>
            <p>
              Everything this console remembers about you (settings, read letters, channel
              history) will be erased. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <Pill ghost onClick={() => setConfirmFormat(false)}>
                Cancel
              </Pill>
              <Pill
                onClick={() => {
                  reset();
                  setConfirmFormat(false);
                  setItem(null);
                }}
              >
                Format
              </Pill>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
