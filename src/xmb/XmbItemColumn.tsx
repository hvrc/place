import { motion } from "framer-motion";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import { CATEGORY_SPACING, CATEGORY_TOP_VH, PIVOT_LEFT } from "./XmbCategoryBar";
import styles from "./Xmb.module.css";

export const ITEM_SPACING = 122;
/** Fixed icon cell; independent of category spacing so labels stay close to the icon. */
const ITEM_ICON_CELL = 104;
/** Shift the row so the icon centers on the same axis as the active category icon. */
const ROW_PAD_LEFT = CATEGORY_SPACING / 2 - ITEM_ICON_CELL / 2;

export function XmbItemColumn({ onActivate }: { onActivate: (index: number) => void }) {
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const activeItem = useXmb((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const setItem = useXmb((s) => s.setItem);

  const items = categories[categoryIndex].items;

  // Resting Y of the active item: one full row below the category bar.
  const pivotTop = `calc(${CATEGORY_TOP_VH}vh + ${ITEM_SPACING}px)`;

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
                  onClick={() => (active ? onActivate(j) : setItem(j))}
                  className={`${styles.itemButton} text-left focus:outline-none`}
                  style={{ height: ITEM_SPACING, paddingLeft: ROW_PAD_LEFT }}
                  aria-current={active}
                >
                  <span className={styles.itemIconCell} style={{ width: ITEM_ICON_CELL }}>
                    <motion.span
                      className={`material-symbols-rounded ${styles.glyph} ${active ? styles.glyphActive : ""}`}
                      style={{ fontSize: "4.4rem" }}
                      initial={false}
                      animate={{ scale: active ? 1.12 : 0.9, opacity: rowOpacity }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                    >
                      {item.glyph}
                    </motion.span>
                  </span>
                  <motion.span
                    className={styles.itemLabelWrap}
                    initial={false}
                    animate={{ opacity: rowOpacity }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.sub && <span className={styles.itemSub}>{item.sub}</span>}
                  </motion.span>
                </button>
              </motion.li>
            );
          })}
      </motion.ul>
    </div>
  );
}
