import { motion } from "framer-motion";
import { useMenu, useMenuModel } from "@menu/state/MenuContext";
import { Icon } from "@menu/icons/Icon";
import { useSound } from "@menu/sound/useSound";
import {
  CATEGORY_SPACING,
  PIVOT_LEFT,
  CATEGORY_TOP_VH,
  CATEGORY_ICON_SIZE,
  CATEGORY_GRID_NUDGE,
} from "@menu/layout/metrics";
import styles from "@menu/styles/menu.module.css";

/** The horizontal category row (the sideways menu): the active icon is pinned at
 *  the pivot and the whole row slides under it. */
export function CategoryBar() {
  const { categories } = useMenuModel();
  const categoryIndex = useMenu((s) => s.categoryIndex);
  const setCategory = useMenu((s) => s.setCategory);
  const { play } = useSound();

  return (
    <motion.div
      className="absolute flex items-start"
      style={{
        top: `calc(${CATEGORY_TOP_VH}vh + ${CATEGORY_GRID_NUDGE}px)`,
        left: PIVOT_LEFT,
        zIndex: 30,
      }}
      initial={false}
      animate={{ x: -categoryIndex * CATEGORY_SPACING }}
      transition={{ type: "spring", stiffness: 520, damping: 38 }}
    >
      {categories.map((cat, i) => {
        const active = i === categoryIndex;
        return (
          <button
            key={cat.id}
            onClick={() => {
              if (i !== categoryIndex) play("category");
              setCategory(i);
            }}
            style={{ width: CATEGORY_SPACING }}
            className={`${styles.catButton} focus:outline-none`}
            aria-label={cat.label}
            aria-current={active}
          >
            <span className={styles.glyph}>
              <Icon icon={cat.icon} focused={active} size={CATEGORY_ICON_SIZE} />
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
