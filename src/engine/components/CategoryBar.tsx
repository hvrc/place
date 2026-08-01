import { motion } from "framer-motion";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { Icon } from "@engine/icons/Icon";
import { useSound } from "@engine/sound/useSound";
import {
  CATEGORY_SPACING,
  PIVOT_LEFT,
  CATEGORY_TOP_VH,
  CATEGORY_ICON_SIZE,
  CATEGORY_GRID_NUDGE,
} from "@engine/layout/metrics";
import styles from "@engine/styles/menu.module.css";

/** Optional first-load reveal: each icon fades in `base + i*step` seconds in. */
export interface IntroStagger {
  base: number;
  step: number;
}

/** The horizontal category row (the sideways menu): the active icon is pinned at
 *  the pivot and the whole row slides under it. */
export function CategoryBar({ introStagger }: { introStagger?: IntroStagger | null }) {
  const { categories } = useMenuModel();
  const categoryIndex = useMenu((s) => s.categoryIndex);
  const scrubX = useMenu((s) => s.scrubX);
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
      animate={{ x: -categoryIndex * CATEGORY_SPACING + scrubX }}
      transition={{ type: "spring", stiffness: 520, damping: 38 }}
    >
      {categories.map((cat, i) => {
        const active = i === categoryIndex;
        return (
          <motion.button
            key={cat.id}
            onClick={() => {
              if (i !== categoryIndex) play("category");
              setCategory(i);
            }}
            style={{ width: CATEGORY_SPACING }}
            className={`${styles.catButton} focus:outline-none`}
            aria-label={cat.label}
            aria-current={active}
            initial={introStagger ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{
              delay: introStagger ? introStagger.base + i * introStagger.step : 0,
              duration: introStagger ? 0.4 : 0,
              ease: "easeOut",
            }}
          >
            <span className={styles.glyph}>
              <Icon icon={cat.icon} focused={active} size={CATEGORY_ICON_SIZE} />
            </span>
            <span className={`${styles.catLabel} ${active ? styles.labelShown : ""}`}>
              {cat.label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
