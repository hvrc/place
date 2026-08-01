import { motion } from "framer-motion";
import type { Media } from "@/data/projects";
import { useXmb } from "@/xmb/xmbStore";
import { groupProjects, projectGroups, type ProjectGroupId } from "@/xmb/projectsMenu";
import { CATEGORY_TOP_VH, CATEGORY_GRID_NUDGE } from "./XmbCategoryBar";
import { ITEM_SPACING, FIRST_ITEM_GAP } from "./XmbItemColumn";
import { XmbIcon } from "./XmbIcon";
import { playSfx } from "./sound";
import styles from "./Xmb.module.css";

const SIDE_LEFT = "5%";
/** Common cell width so every side icon centers on the same vertical axis. */
const SIDE_CELL = 88;
/** Drill-in resting position of the thumbnail column. */
const COL_LEFT = "16%";
const THUMB_W = 132;
const THUMB_H = 74;
// constant gap in both preview and drilled states; wide enough that the
// enlarged active thumbnail still clears its neighbours
const SPACING = 118;
const ACTIVE_SCALE = 1.9;
const META_LEFT = THUMB_W * ACTIVE_SCALE + 22;

function vw() {
  return typeof window !== "undefined" ? window.innerWidth : 1440;
}

function Thumb({ media }: { media?: Media }) {
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
 * The vertical strip of project thumbnails for a group. Rendered persistently
 * while on the Projects menu: it previews the focused folder (shifted right),
 * then slides left into place when that folder is opened (drilled in).
 */
export function ProjectThumbnails({ groupId }: { groupId: ProjectGroupId }) {
  const openGroup = useXmb((s) => s.openGroup);
  const sel = useXmb((s) => s.projectIndexByGroup[groupId] ?? 0);
  const setProject = useXmb((s) => s.setProject);
  const openProjectGroup = useXmb((s) => s.openProjectGroup);
  const items = groupProjects(groupId);
  const drilled = openGroup === groupId;
  // when the active thumbnail expands, push its neighbours out by the extra
  // half-height so the visual gap around it matches the gap between the rest
  const push = drilled ? (THUMB_H * (ACTIVE_SCALE - 1)) / 2 : 0;
  // preview sits right of the folder labels; drilling in slides it left into place
  const previewShift = vw() * 0.16;

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
        // only the drilled-in folder enlarges the selected thumbnail + shows the
        // triangle/meta; a previewed folder just stacks its thumbnails
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
            animate={{ y: offset * SPACING + Math.sign(offset) * push }}
            transition={{ type: "spring", stiffness: 520, damping: 40 }}
          >
            {highlight && <span className={styles.pmTriangle} />}
            <motion.button
              className={styles.pmThumb}
              style={{ width: THUMB_W, height: THUMB_H, transformOrigin: "left center" }}
              initial={false}
              animate={{ scale: highlight ? ACTIVE_SCALE : 1, opacity, zIndex: highlight ? 20 : 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => {
                // works whether previewing (drill in + select) or already drilled (select)
                playSfx("move");
                openProjectGroup(groupId);
                setProject(i);
              }}
              aria-current={active}
            >
              <Thumb media={p.media} />
              {highlight && <span className={styles.pmThumbGlow} />}
            </motion.button>

            {highlight && (
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
  const openProjectGroup = useXmb((s) => s.openProjectGroup);
  const closeProjectGroup = useXmb((s) => s.closeProjectGroup);
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
        onClick={() => {
          playSfx("back");
          closeProjectGroup();
        }}
      >
        <div className={styles.pmSideMain} style={{ width: SIDE_CELL }}>
          <XmbIcon icon="umd" focused size={88} keepSize />
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
              top: `calc(${CATEGORY_TOP_VH}vh + ${ITEM_SPACING + FIRST_ITEM_GAP}px)`,
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
            onClick={() => {
              if (g.id === groupId) {
                // clicking the folder we're already in backs out one layer
                playSfx("back");
                closeProjectGroup();
              } else {
                playSfx("move");
                openProjectGroup(g.id);
              }
            }}
          >
            <XmbIcon icon={g.icon} focused={on} size={76} keepSize />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
