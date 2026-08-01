import { motion } from "framer-motion";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { Icon } from "@engine/icons/Icon";
import { useSound } from "@engine/sound/useSound";
import {
  SIDE_LEFT,
  SIDE_CELL,
  CATEGORY_TOP_VH,
  CATEGORY_GRID_NUDGE,
  ITEM_SPACING,
  FIRST_ITEM_GAP,
} from "@engine/layout/metrics";
import styles from "@engine/styles/menu.module.css";

function vw() {
  return typeof window !== "undefined" ? window.innerWidth : 1440;
}

/**
 * The parent-category icon + sibling group icons, shifted to the left when
 * drilled in. Slides in from the item-column position on open and back onto it
 * on close. The parent icon/label is derived from whichever category owns the
 * open group, so this stays entirely generic.
 */
export function DrillColumn({ groupId }: { groupId: string }) {
  const { categories } = useMenuModel();
  const openDrill = useMenu((s) => s.openDrill);
  const closeDrill = useMenu((s) => s.closeDrill);
  const { play } = useSound();

  const parent = categories.find((c) => c.items.some((it) => it.drillId === groupId));
  const drillItems = (parent?.items ?? []).filter((it) => it.drillId);
  const activeIdx = drillItems.findIndex((it) => it.drillId === groupId);
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
          play("back");
          closeDrill();
        }}
      >
        <div className={styles.pmSideMain} style={{ width: SIDE_CELL }}>
          <Icon icon={parent?.icon ?? ""} focused size={88} keepSize />
          <span className={`${styles.catLabel} ${styles.labelShown}`}>{parent?.label}</span>
        </div>
      </motion.div>

      {drillItems.map((it, i) => {
        const d = i - activeIdx;
        const offset = d >= 0 ? d : d - 1; // skip the parent-icon slot, like the item column
        const on = it.drillId === groupId;
        const op = on ? 1 : Math.max(0.32, 0.75 - Math.abs(offset) * 0.12);
        return (
          <motion.div
            key={it.id}
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
              if (on) {
                // clicking the folder we're already in backs out one layer
                play("back");
                closeDrill();
              } else {
                play("move");
                openDrill(it.drillId!);
              }
            }}
          >
            <Icon icon={it.icon} focused={on} size={76} keepSize />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
