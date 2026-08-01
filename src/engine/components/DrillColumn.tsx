import { motion } from "framer-motion";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { Icon } from "@engine/icons/Icon";
import { LIGHT_SEC } from "@engine/icons/iconFilter";
import { useSound } from "@engine/sound/useSound";
import { useHoverIndex } from "@engine/input/useHoverIndex";
import { rowFade, useMetrics } from "@engine/layout/metrics";
import { viewportWidth } from "@engine/lib/browser";
import styles from "@engine/styles/menu.module.css";

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
  const { hovered, hoverProps } = useHoverIndex();
  const {
    SIDE_LEFT,
    SIDE_CELL,
    CATEGORY_TOP,
    PIVOT_TOP,
    ITEM_SPACING,
    CATEGORY_ICON_SIZE,
    ITEM_ICON_SIZE,
    scale,
  } = useMetrics();

  const parent = categories.find((c) => c.items.some((it) => it.drillId === groupId));
  const drillItems = (parent?.items ?? []).filter((it) => it.drillId);
  const activeIdx = drillItems.findIndex((it) => it.drillId === groupId);
  const shiftBack = viewportWidth() * 0.09 + 54 * scale;

  return (
    <motion.div className={styles.pmRoot}>
      <motion.div
        className={styles.pmSideItem}
        style={{ left: SIDE_LEFT, top: CATEGORY_TOP }}
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
          <Icon icon={parent?.icon ?? ""} focused size={CATEGORY_ICON_SIZE} keepSize />
          <span className={`${styles.catLabel} ${styles.labelShown}`}>{parent?.label}</span>
        </div>
      </motion.div>

      {drillItems.map((it, i) => {
        const d = i - activeIdx;
        const offset = d >= 0 ? d : d - 1; // skip the parent-icon slot, like the item column
        const on = it.drillId === groupId;
        const hot = hovered === i && !on;
        const op = on || hot ? 1 : rowFade(offset, 0.75, 0.32);
        return (
          <motion.div
            key={it.id}
            className={styles.pmSideItem}
            style={{
              left: SIDE_LEFT,
              top: PIVOT_TOP,
              width: SIDE_CELL,
              height: ITEM_SPACING,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            initial={{ x: 90, y: offset * ITEM_SPACING, opacity: 0 }}
            animate={{ x: 0, y: offset * ITEM_SPACING, opacity: op }}
            exit={{ x: shiftBack, y: offset * ITEM_SPACING }}
            // the slide keeps its own pace; the dimming fades with the icon
            transition={{ duration: 0.26, ease: "easeInOut", opacity: { duration: LIGHT_SEC, ease: "easeOut" } }}
            {...hoverProps(i)}
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
            <Icon icon={it.icon} focused={on} hovered={hot} size={ITEM_ICON_SIZE} keepSize throb />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
