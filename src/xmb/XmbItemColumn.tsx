import { motion } from "framer-motion";
import { categories } from "@/xmb/xmbData";
import { useXmb, WAVE_PALETTE } from "@/xmb/xmbStore";
import { CATEGORY_SPACING, CATEGORY_TOP_VH, PIVOT_LEFT } from "./XmbCategoryBar";
import { XmbIcon } from "./XmbIcon";
import { playSfx } from "./sound";
import styles from "./Xmb.module.css";

/** Focus (highlighted) icon height for first-level items. */
const ITEM_ICON_SIZE = 76;

export const ITEM_SPACING = 122;
/** Extra room below the category label before the first sub-item. */
export const FIRST_ITEM_GAP = 18;
/** Fixed icon cell; independent of category spacing so labels stay close to the icon. */
const ITEM_ICON_CELL = 104;
/** Shift the row so the icon centers on the same axis as the active category icon. */
const ROW_PAD_LEFT = CATEGORY_SPACING / 2 - ITEM_ICON_CELL / 2;

export function XmbItemColumn({ onActivate }: { onActivate: (index: number) => void }) {
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const activeItem = useXmb((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const setItem = useXmb((s) => s.setItem);
  const settings = useXmb((s) => s.settings);

  const items = categories[categoryIndex].items;

  // Live value shown under each Settings item (the info panel is hidden).
  const settingSub = (id: string): string | undefined => {
    if (categories[categoryIndex].id !== "settings") return undefined;
    switch (id) {
      case "theme":
        return settings.theme;
      case "wave":
        return `#${WAVE_PALETTE[settings.waveIndex] ?? ""}`;
      case "uiVolume":
        return `${settings.uiVolume}%`;
    }
    return undefined;
  };

  // Resting Y of the active item: one full row below the category bar (plus a
  // little extra so the category label isn't crowded by the first item).
  const pivotTop = `calc(${CATEGORY_TOP_VH}vh + ${ITEM_SPACING + FIRST_ITEM_GAP}px)`;

  return (
    <div className={styles.itemColumn} style={{ left: PIVOT_LEFT }}>
      <motion.ul
        key={categoryIndex}
        className={styles.itemColumnInner}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
      >
        {items.map((item, j) => {
          const active = j === activeItem;
          const d = j - activeItem;
          // Items ABOVE the active one skip the slot the category icon occupies
          // (offset -1 is left empty), so no item ever sits on the category line.
          const offset = d >= 0 ? d : d - 1;
          const rowOpacity = active ? 1 : Math.max(0.3, 0.72 - Math.abs(offset) * 0.12);
          return (
            <motion.li
              key={item.id}
              className={styles.itemRow}
              style={{ top: pivotTop, height: ITEM_SPACING }}
              initial={false}
              animate={{ y: offset * ITEM_SPACING }}
              transition={{ type: "spring", stiffness: 520, damping: 38 }}
            >
                <button
                  onClick={() => {
                    if (active) onActivate(j);
                    else {
                      playSfx("move");
                      setItem(j);
                    }
                  }}
                  className={`${styles.itemButton} text-left focus:outline-none`}
                  style={{ height: ITEM_SPACING, paddingLeft: ROW_PAD_LEFT }}
                  aria-current={active}
                >
                  <motion.span
                    className={styles.itemIconCell}
                    style={{ width: ITEM_ICON_CELL }}
                    initial={false}
                    animate={{ opacity: rowOpacity }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    <XmbIcon icon={item.icon} focused={active} size={ITEM_ICON_SIZE} keepSize />
                  </motion.span>
                  <motion.span
                    className={styles.itemLabelWrap}
                    initial={false}
                    animate={{ opacity: rowOpacity }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    <span className={styles.itemLabel}>{item.label}</span>
                    {(() => {
                      const sub = settingSub(item.id) ?? item.sub;
                      return sub ? <span className={styles.itemSub}>{sub}</span> : null;
                    })()}
                  </motion.span>
                </button>
              </motion.li>
            );
          })}
      </motion.ul>
    </div>
  );
}
