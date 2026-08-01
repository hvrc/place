import { useEffect } from "react";
import { pages, type Channel } from "@wii/channels";
import { ChannelTile } from "./ChannelTile";
import { EmptySlot } from "./ChannelArt";
import { Triangle } from "@wii/ui/glyphs";
import styles from "@wii/wii.module.css";

/**
 * The pages of channels and the two triangles that move between them.
 *
 * The pages sit on one horizontal track that slides, so the next page's first
 * column is always half-visible at the right edge — the console's own hint that
 * there's more over there.
 */
export function ChannelGrid({
  page,
  setPage,
  onOpen,
  onHover,
}: {
  page: number;
  setPage: (p: number) => void;
  onOpen: (c: Channel) => void;
  onHover?: (c: Channel | null) => void;
}) {
  const last = pages.length - 1;

  // ←/→ page the menu, matching the console's shoulder buttons.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setPage(Math.min(last, page + 1));
      if (e.key === "ArrowLeft") setPage(Math.max(0, page - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, last, setPage]);

  return (
    <div className={styles.stage}>
      <div
        className={styles.track}
        style={{ transform: `translateX(calc(${-page} * (var(--page-w) + var(--gap) * 2)))` }}
      >
        {pages.map((slots, p) => (
          <div className={styles.page} key={p}>
            {slots.map((channel, i) => (
              <div className={styles.slot} key={channel?.id ?? `empty-${p}-${i}`}>
                {channel ? (
                  <ChannelTile
                    channel={channel}
                    live={p === page}
                    onOpen={onOpen}
                    onHover={onHover}
                  />
                ) : (
                  <EmptySlot />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.pageArrow} ${styles.pageArrowLeft}`}
        onClick={() => setPage(Math.max(0, page - 1))}
        disabled={page === 0}
        aria-label="Previous page"
      >
        <Triangle dir="left" />
      </button>
      <button
        type="button"
        className={`${styles.pageArrow} ${styles.pageArrowRight}`}
        onClick={() => setPage(Math.min(last, page + 1))}
        disabled={page === last}
        aria-label="Next page"
      >
        <Triangle />
      </button>

      <div className={styles.pageDots}>
        {pages.map((_, p) => (
          <button
            key={p}
            type="button"
            className={[styles.pageDot, p === page ? styles.on : ""].join(" ")}
            onClick={() => setPage(p)}
            aria-label={`Page ${p + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
