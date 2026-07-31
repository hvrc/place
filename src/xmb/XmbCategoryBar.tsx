import { motion } from "framer-motion";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import { XmbIcon } from "./XmbIcon";
import styles from "./Xmb.module.css";

export const CATEGORY_SPACING = 196;
/** Horizontal position of the active category / item column (the XMB pivot). */
export const PIVOT_LEFT = "14%";
/** Vertical position of the category row. Items above the active one scroll up past this line. */
export const CATEGORY_TOP_VH = 22;
/** Focus (highlighted) icon height for the category row, per PSP proportions. */
export const CATEGORY_ICON_SIZE = 88;
/** Nudge the top-aligned category icon onto the ITEM_SPACING grid (item icons are
 * centered in a 122px row). Keeps every vertical gap equal. */
export const CATEGORY_GRID_NUDGE = 122 / 2 - CATEGORY_ICON_SIZE / 2;

export function XmbCategoryBar() {
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const setCategory = useXmb((s) => s.setCategory);

  return (
    <motion.div
      className="absolute flex items-start"
      style={{ top: `calc(${CATEGORY_TOP_VH}vh + ${CATEGORY_GRID_NUDGE}px)`, left: PIVOT_LEFT, zIndex: 30 }}
      initial={false}
      animate={{ x: -categoryIndex * CATEGORY_SPACING }}
      transition={{ type: "spring", stiffness: 520, damping: 38 }}
    >
      {categories.map((cat, i) => {
        const active = i === categoryIndex;
        return (
          <button
            key={cat.id}
            onClick={() => setCategory(i)}
            style={{ width: CATEGORY_SPACING }}
            className={`${styles.catButton} focus:outline-none`}
            aria-label={cat.label}
            aria-current={active}
          >
            <span className={styles.glyph}>
              <XmbIcon icon={cat.icon} focused={active} size={CATEGORY_ICON_SIZE} />
            </span>
            <span className={`${styles.catLabel} ${active ? styles.labelShown : ""}`}>
              {cat.label}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
