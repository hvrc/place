import { motion } from "framer-motion";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { useSound } from "@engine/sound/useSound";
import type { MenuMedia } from "@engine/model/types";
import {
  CATEGORY_TOP_VH,
  COL_LEFT,
  ITEM_SPACING,
  FIRST_ITEM_GAP,
  THUMB_W,
  THUMB_H,
  THUMB_SPACING,
  THUMB_ACTIVE_SCALE,
  THUMB_META_LEFT,
} from "@engine/layout/metrics";
import styles from "@engine/styles/menu.module.css";

function vw() {
  return typeof window !== "undefined" ? window.innerWidth : 1440;
}

function Thumb({ media }: { media?: MenuMedia }) {
  if (!media) return <div className={styles.pmThumbFill} />;
  if (media.type === "image") {
    return <img className={styles.pmThumbFill} src={media.src} alt="" />;
  }
  // every thumbnail plays, even in the small preview form
  return (
    <video
      className={styles.pmThumbFill}
      src={media.src}
      poster={media.poster}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
    />
  );
}

/**
 * The vertical strip of leaf thumbnails for a drill-in group. Rendered
 * persistently while on the parent category: it previews the focused group
 * (shifted right), then slides left into place when that group is opened.
 */
export function ThumbnailStrip({ groupId }: { groupId: string }) {
  const { groups } = useMenuModel();
  const openGroup = useMenu((s) => s.openGroup);
  const sel = useMenu((s) => s.itemIndexByGroup[groupId] ?? 0);
  const setInDrill = useMenu((s) => s.setInDrill);
  const openDrill = useMenu((s) => s.openDrill);
  const { play } = useSound();

  const items = groups[groupId]?.items ?? [];
  const drilled = openGroup === groupId;
  // when the active thumbnail expands, push its neighbours out by the extra
  // half-height so the visual gap around it matches the gap between the rest
  const push = drilled ? (THUMB_H * (THUMB_ACTIVE_SCALE - 1)) / 2 : 0;
  // preview sits right of the folder labels; drilling in slides it left into place
  const previewShift = vw() * 0.16;

  return (
    <motion.div
      className={styles.pmThumbs}
      // appears as available (after the folder column); a quick group fade, no
      // artificial per-item timeline
      initial={{ opacity: 0, x: drilled ? 0 : previewShift }}
      animate={{ opacity: 1, x: drilled ? 0 : previewShift }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
    >
      {items.map((p, i) => {
        const active = i === sel;
        // only the drilled-in group enlarges the selected thumbnail + shows the
        // triangle/meta; a previewed group just stacks its thumbnails
        const highlight = drilled && active;
        const offset = i - sel;
        const opacity = active ? 1 : Math.max(0.38, 0.78 - Math.abs(offset) * 0.12);
        return (
          <motion.div
            key={p.id}
            className={styles.pmRow}
            style={{
              left: COL_LEFT,
              // align the active thumbnail's row with the active folder's row
              top: `calc(${CATEGORY_TOP_VH}vh + ${ITEM_SPACING + FIRST_ITEM_GAP + ITEM_SPACING / 2 - THUMB_H / 2}px)`,
              zIndex: highlight ? 30 : 1,
            }}
            initial={false}
            animate={{ y: offset * THUMB_SPACING + Math.sign(offset) * push }}
            transition={{ type: "spring", stiffness: 520, damping: 40 }}
          >
            {highlight && <span className={styles.pmTriangle} />}
            <motion.button
              className={styles.pmThumb}
              style={{ width: THUMB_W, height: THUMB_H, transformOrigin: "left center" }}
              initial={false}
              animate={{ scale: highlight ? THUMB_ACTIVE_SCALE : 1, opacity, zIndex: highlight ? 20 : 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => {
                // works whether previewing (drill in + select) or already drilled (select)
                play("move");
                openDrill(groupId);
                setInDrill(i);
              }}
              aria-current={active}
            >
              <Thumb media={p.media} />
              {highlight && <span className={styles.pmThumbGlow} />}
            </motion.button>

            {highlight && (
              <div className={styles.pmMeta} style={{ left: THUMB_META_LEFT }}>
                <div className={styles.pmTitle}>{p.title}</div>
                <div className={styles.pmTech}>{p.tech}</div>
                {p.link && <div className={styles.pmHint}>▶ open</div>}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
