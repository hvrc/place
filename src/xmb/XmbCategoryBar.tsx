import { motion } from "framer-motion";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import styles from "./Xmb.module.css";

export const CATEGORY_SPACING = 196;
/** Horizontal position of the active category / item column (the XMB pivot). */
export const PIVOT_LEFT = "14%";
/** Vertical position of the category row. Items above the active one scroll up past this line. */
export const CATEGORY_TOP_VH = 22;

export function XmbCategoryBar() {
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const setCategory = useXmb((s) => s.setCategory);

  return (
    <motion.div
      className="absolute flex items-start"
      style={{ top: `${CATEGORY_TOP_VH}vh`, left: PIVOT_LEFT, zIndex: 30 }}
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
            <motion.span
              className={`material-symbols-rounded ${styles.glyph} ${active ? styles.glyphActive : ""}`}
              style={{ fontSize: "4.4rem" }}
              animate={{ scale: active ? 1.2 : 0.92, opacity: active ? 1 : 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {cat.glyph}
            </motion.span>
            <span className={`${styles.catLabel} ${active ? styles.labelShown : ""}`}>
              {cat.label}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
