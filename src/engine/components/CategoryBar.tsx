import { motion } from "framer-motion";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { Icon } from "@engine/icons/Icon";
import { useSound } from "@engine/sound/useSound";
import { useHoverIndex } from "@engine/input/useHoverIndex";
import type { IntroStagger } from "@engine/model/types";
import { useMetrics } from "@engine/layout/metrics";
import styles from "@engine/styles/menu.module.css";

/** The horizontal category row (the sideways menu): the active icon is pinned at
 *  the pivot and the whole row slides under it. */
export function CategoryBar({ introStagger }: { introStagger?: IntroStagger | null }) {
  const { categories } = useMenuModel();
  const categoryIndex = useMenu((s) => s.categoryIndex);
  const setCategory = useMenu((s) => s.setCategory);
  const { play } = useSound();
  const { hovered, hoverProps } = useHoverIndex();
  const { CATEGORY_SPACING, PIVOT_LEFT, CATEGORY_TOP, CATEGORY_ICON_SIZE } = useMetrics();

  return (
    <motion.div
      className="absolute flex items-start"
      style={{
        top: CATEGORY_TOP,
        left: PIVOT_LEFT,
        zIndex: 30,
      }}
      initial={false}
      animate={{ x: -categoryIndex * CATEGORY_SPACING }}
      transition={{ type: "spring", stiffness: 520, damping: 38 }}
    >
      {categories.map((cat, i) => {
        const active = i === categoryIndex;
        const hot = hovered === i && !active;
        return (
          <motion.button
            key={cat.id}
            {...hoverProps(i)}
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
              <Icon icon={cat.icon} focused={active} hovered={hot} size={CATEGORY_ICON_SIZE} />
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
