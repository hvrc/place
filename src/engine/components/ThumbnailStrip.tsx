import { motion } from "framer-motion";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { useSound } from "@engine/sound/useSound";
import type { MenuMedia } from "@engine/model/types";
import { useMetrics, lengthToPx } from "@engine/layout/metrics";
import { openTab, viewportWidth } from "@engine/lib/browser";
import { ProjectMeta } from "./ProjectMeta";
import styles from "@engine/styles/menu.module.css";

/** Room a folder's label + sub needs beside its icon. Roughly constant: the
 *  text is set in rem, so it doesn't shrink with the layout. */
const LABEL_CLEARANCE = 116;

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
  const {
    CATEGORY_TOP_VH,
    COL_LEFT,
    PIVOT_LEFT,
    ROW_PAD_LEFT,
    ITEM_ICON_CELL,
    ITEM_SPACING,
    FIRST_ITEM_GAP,
    THUMB_W,
    THUMB_H,
    THUMB_SPACING,
    THUMB_ACTIVE_SCALE,
    THUMB_META_LEFT,
    RULE_GAP_RIGHT,
    scale,
    compact,
  } = useMetrics();

  // the rule runs from the title out to the right edge, less a small margin
  const ruleWidth = `calc(100vw - ${COL_LEFT} - ${THUMB_META_LEFT + RULE_GAP_RIGHT}px)`;

  const items = groups[groupId]?.items ?? [];
  const drilled = openGroup === groupId;
  // when the active thumbnail expands, push its neighbours out by the extra
  // half-height so the visual gap around it matches the gap between the rest
  const push = drilled ? (THUMB_H * (THUMB_ACTIVE_SCALE - 1)) / 2 : 0;
  // Preview sits right of the folder labels; drilling in slides it left into
  // place. A plain fraction of the viewport isn't enough on its own: the labels
  // are set in rem, so they take proportionally MORE room as the layout scales
  // down, and on a tablet the fraction stops clearing them. Take whichever is
  // further right — the fraction, or the end of the label column.
  const vw = viewportWidth();
  const colLeft = lengthToPx(COL_LEFT, vw);
  const labelsEnd = lengthToPx(PIVOT_LEFT, vw) + ROW_PAD_LEFT + ITEM_ICON_CELL + LABEL_CLEARANCE;
  const previewShift = Math.max(colLeft + vw * (compact ? 0.32 : 0.16), labelsEnd) - colLeft;

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
            {highlight && (
              <span
                className={styles.pmTriangle}
                style={{ left: -Math.round(42 * scale), top: THUMB_H / 2 }}
              />
            )}
            <motion.button
              className={styles.pmThumb}
              style={{ width: THUMB_W, height: THUMB_H, transformOrigin: "left center" }}
              initial={false}
              animate={{ scale: highlight ? THUMB_ACTIVE_SCALE : 1, opacity, zIndex: highlight ? 20 : 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => {
                // The selected thumbnail IS the project — it opens. Any other
                // click is navigation: drill in and/or move the selection here.
                if (highlight && p.link) {
                  play("enter");
                  openTab(p.link);
                  return;
                }
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
              <ProjectMeta
                item={p}
                compact={compact}
                ruleWidth={ruleWidth}
                style={{ left: THUMB_META_LEFT, top: THUMB_H / 2 }}
              />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
