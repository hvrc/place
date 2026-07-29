import { motion } from "framer-motion";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import styles from "./Xmb.module.css";

export const CATEGORY_SPACING = 150;
/** Horizontal position of the active category / item column (the XMB pivot). */
export const PIVOT_LEFT = "14%";

export function XmbCategoryBar() {
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const setCategory = useXmb((s) => s.setCategory);

  return (
    <motion.div
      className="absolute flex items-start"
      style={{ top: "30vh", left: PIVOT_LEFT }}
      animate={{ x: -categoryIndex * CATEGORY_SPACING }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      {categories.map((cat, i) => {
        const active = i === categoryIndex;
        return (
          <button
            key={cat.id}
            onClick={() => setCategory(i)}
            style={{ width: CATEGORY_SPACING }}
            className="flex flex-col items-center focus:outline-none"
            aria-label={cat.label}
            aria-current={active}
          >
            <motion.span
              className={`${styles.glyph} ${active ? styles.glyphActive : ""}`}
              animate={{ scale: active ? 1.25 : 0.9, opacity: active ? 1 : 0.4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {cat.glyph}
            </motion.span>
            <motion.span
              className={styles.catLabel}
              animate={{ opacity: active ? 1 : 0, y: active ? 0 : -4 }}
            >
              {cat.label}
            </motion.span>
          </button>
        );
      })}
    </motion.div>
  );
}
