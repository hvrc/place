import { motion } from "framer-motion";
import type { Media } from "@/data/projects";
import { useXmb } from "@/xmb/xmbStore";
import { groupProjects, projectGroups, type ProjectGroupId } from "@/xmb/projectsMenu";
import { CATEGORY_TOP_VH, CATEGORY_GRID_NUDGE } from "./XmbCategoryBar";
import { ITEM_SPACING } from "./XmbItemColumn";
import { XmbIcon } from "./XmbIcon";
import styles from "./Xmb.module.css";

const SIDE_LEFT = "5%";
/** Common cell width so every side icon centers on the same vertical axis. */
const SIDE_CELL = 88;
/** Drill-in resting position of the thumbnail column. */
const COL_LEFT = "16%";
const PIVOT_VH = 44;
const THUMB_W = 132;
const THUMB_H = 74;
// enough gap that the enlarged active thumbnail never overlaps its neighbours
const SPACING = 150;
const ACTIVE_SCALE = 1.9;
const META_LEFT = THUMB_W * ACTIVE_SCALE + 22;

function vw() {
  return typeof window !== "undefined" ? window.innerWidth : 1440;
}

function Thumb({ media, active }: { media?: Media; active: boolean }) {
  if (!media) return <div className={styles.pmThumbFill} />;
  if (media.type === "image") {
    return <img className={styles.pmThumbFill} src={media.src} alt="" />;
  }
  return (
    <video
      className={styles.pmThumbFill}
      src={media.src}
      poster={media.poster}
      muted
      loop
      playsInline
      autoPlay={active}
      preload="metadata"
    />
  );
}

/**
 * The vertical strip of project thumbnails for a group. Rendered persistently
 * while on the Projects menu: it previews the focused folder (shifted right),
 * then slides left into place when that folder is opened (drilled in).
 */
export function ProjectThumbnails({ groupId }: { groupId: ProjectGroupId }) {
  const openGroup = useXmb((s) => s.openGroup);
  const sel = useXmb((s) => s.projectIndexByGroup[groupId] ?? 0);
  const setProject = useXmb((s) => s.setProject);
  const items = groupProjects(groupId);
  const drilled = openGroup === groupId;
  // preview sits further right so it clears the folder labels; drilling in slides it left
  const previewShift = vw() * 0.26;

  return (
    <motion.div
      className={styles.pmThumbs}
      initial={{ opacity: 0, x: drilled ? 0 : previewShift }}
      animate={{ opacity: 1, x: drilled ? 0 : previewShift }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
    >
      {items.map((p, i) => {
        const active = i === sel;
        const offset = i - sel;
        const opacity = active ? 1 : Math.max(0.38, 0.78 - Math.abs(offset) * 0.12);
        return (
          <motion.div
            key={p.id}
            className={styles.pmRow}
            style={{ left: COL_LEFT, top: `calc(${PIVOT_VH}vh - ${THUMB_H / 2}px)`, zIndex: active ? 30 : 1 }}
            initial={false}
            animate={{ y: offset * SPACING }}
            transition={{ type: "spring", stiffness: 520, damping: 40 }}
          >
            {active && <span className={styles.pmTriangle} />}
            <motion.button
              className={styles.pmThumb}
              style={{ width: THUMB_W, height: THUMB_H, transformOrigin: "left center" }}
              initial={false}
              animate={{ scale: active ? ACTIVE_SCALE : 1, opacity, zIndex: active ? 20 : 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setProject(i)}
              aria-current={active}
            >
              <Thumb media={p.media} active={active} />
              {active && <span className={styles.pmThumbGlow} />}
            </motion.button>

            {active && (
              <div className={styles.pmMeta} style={{ left: META_LEFT }}>
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

/**
 * The Projects icon + folder icons, shifted to the left when drilled in. Slides
 * in from the item-column position on open and back onto it on close.
 */
export function GamesSideColumn({ groupId }: { groupId: ProjectGroupId }) {
  const activeIdx = projectGroups.findIndex((g) => g.id === groupId);
  const shiftBack = vw() * 0.09 + 54;

  return (
    <motion.div className={styles.pmRoot}>
      <motion.div
        className={styles.pmSideItem}
        style={{ left: SIDE_LEFT, top: `calc(${CATEGORY_TOP_VH}vh + ${CATEGORY_GRID_NUDGE}px)` }}
        initial={{ x: 90, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: shiftBack }}
        transition={{ duration: 0.26, ease: "easeInOut" }}
      >
        <div className={styles.pmSideMain} style={{ width: SIDE_CELL }}>
          <XmbIcon icon="game" focused size={88} keepSize />
          <span className={`${styles.catLabel} ${styles.labelShown}`}>Projects</span>
        </div>
      </motion.div>

      {projectGroups.map((g, i) => {
        const d = i - activeIdx;
        const offset = d >= 0 ? d : d - 1; // skip the Projects-icon slot, like the item column
        const on = g.id === groupId;
        const op = on ? 1 : Math.max(0.32, 0.75 - Math.abs(offset) * 0.12);
        return (
          <motion.div
            key={g.id}
            className={styles.pmSideItem}
            style={{
              left: SIDE_LEFT,
              top: `calc(${CATEGORY_TOP_VH}vh + ${ITEM_SPACING}px)`,
              width: SIDE_CELL,
              height: ITEM_SPACING,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            initial={{ x: 90, y: offset * ITEM_SPACING, opacity: 0 }}
            animate={{ x: 0, y: offset * ITEM_SPACING, opacity: op }}
            exit={{ x: shiftBack, y: offset * ITEM_SPACING }}
            transition={{ duration: 0.26, ease: "easeInOut" }}
          >
            <XmbIcon icon={g.icon} focused={on} size={76} keepSize />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
