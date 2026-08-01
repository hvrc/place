import { useEffect, useState } from "react";
import { letterPages, PIN_SPOTS, type Letter } from "./letters";
import { LetterSheet } from "./LetterSheet";
import { CurvedBar } from "@wii/ui/CurvedBar";
import { Orb } from "@wii/ui/Orb";
import { CalendarMark, LetterMark, PencilMark, Triangle, WiiMark } from "@wii/ui/glyphs";
import { useWii } from "@wii/state";
import styles from "@wii/wii.module.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * The Wii Message Board: letters pinned to a board, one page per day, the same
 * curved bar underneath with the calendar and write buttons on the left and the
 * way back to the menu on the right.
 */
export function MessageBoard({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<Letter | null>(null);
  const read = useWii((s) => s.read);
  const markRead = useWii((s) => s.markRead);
  const last = letterPages.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (open) setOpen(null);
        else onExit();
      }
      if (!open && e.key === "ArrowRight") setPage((p) => Math.min(last, p + 1));
      if (!open && e.key === "ArrowLeft") setPage((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onExit, last]);

  // Page 0 is today, page 1 yesterday, and so on back through the board.
  const day = new Date();
  day.setDate(day.getDate() - page);

  const openLetter = (l: Letter) => {
    setOpen(l);
    markRead(l.id);
  };

  return (
    <div className={`${styles.board} ${styles.fade}`}>
      <div className={styles.boardSheet}>
        {letterPages[page]?.map((letter, i) => {
          const spot = PIN_SPOTS[i % PIN_SPOTS.length];
          return (
            <button
              key={letter.id}
              type="button"
              className={styles.letter}
              style={{ left: spot.left, top: spot.top, rotate: `${spot.rotate}deg` }}
              onClick={() => openLetter(letter)}
            >
              <span
                className={[
                  styles.letterCard,
                  letter.tinted ? styles.tinted : "",
                  read.includes(letter.id) ? "" : styles.unread,
                ].join(" ")}
              >
                <span className={styles.pin} />
                <LetterMark className={styles.letterIcon} />
                <span className={styles.letterTitle}>{letter.title}</span>
                <span className={styles.letterFrom}>{letter.from}</span>
              </span>
            </button>
          );
        })}

        <button
          type="button"
          className={`${styles.pageArrow} ${styles.pageArrowLeft}`}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          aria-label="Previous day"
        >
          <Triangle dir="left" />
        </button>
        <button
          type="button"
          className={`${styles.pageArrow} ${styles.pageArrowRight}`}
          onClick={() => setPage((p) => Math.min(last, p + 1))}
          disabled={page === last}
          aria-label="Next day"
        >
          <Triangle />
        </button>
      </div>

      <CurvedBar
        left={
          <>
            <Orb aria-label="Calendar" onClick={() => setPage(0)}>
              <CalendarMark style={{ width: "45%" }} />
            </Orb>
            <Orb aria-label="Write" onClick={() => openLetter(letterPages[0][0])}>
              <PencilMark style={{ width: "42%" }} />
            </Orb>
          </>
        }
        centre={
          <div className={styles.clockDate} style={{ fontSize: "1.9em" }}>
            {DAYS[day.getDay()]} {day.getMonth() + 1}/{day.getDate()}
          </div>
        }
        right={
          <Orb aria-label="Wii Menu" onClick={onExit}>
            <WiiMark style={{ width: "52%" }} />
          </Orb>
        }
      />

      {open && <LetterSheet letter={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
