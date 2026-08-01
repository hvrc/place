import { motion } from "framer-motion";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { Icon } from "@engine/icons/Icon";
import { LIGHT_SEC } from "@engine/icons/iconFilter";
import { useSound } from "@engine/sound/useSound";
import { useHoverIndex } from "@engine/input/useHoverIndex";
import type { MenuItem } from "@engine/model/types";
import { useMetrics } from "@engine/layout/metrics";
import styles from "@engine/styles/menu.module.css";

/** The vertical items for the active category (the up/down menu): the active
 *  item rests at the pivot and the column scrolls above/below it. */
export function ItemColumn({
  onActivate,
  introStagger,
}: {
  onActivate: (index: number) => void;
  introStagger?: { base: number; step: number } | null;
}) {
  const { categories, palette } = useMenuModel();
  const categoryIndex = useMenu((s) => s.categoryIndex);
  const activeItem = useMenu((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const colorIndex = useMenu((s) => s.settings.colorIndex);
  const uiVolume = useMenu((s) => s.settings.uiVolume);
  const fidelity = useMenu((s) => s.settings.fidelity);
  const setItem = useMenu((s) => s.setItem);
  const { play } = useSound();
  const { hovered, hoverProps } = useHoverIndex();
  const {
    CATEGORY_TOP_VH,
    PIVOT_LEFT,
    ITEM_SPACING,
    FIRST_ITEM_GAP,
    ITEM_ICON_SIZE,
    ITEM_ICON_CELL,
    ROW_PAD_LEFT,
  } = useMetrics();

  const items = categories[categoryIndex].items;

  // Live value shown under a settings item (its static sub otherwise).
  const liveSub = (item: MenuItem): string | undefined => {
    if (item.setting === "color") return `#${palette[colorIndex] ?? ""}`;
    if (item.setting === "volume") return `${uiVolume}%`;
    if (item.setting === "fidelity") return fidelity === "soft" ? "Soft" : "Crisp";
    return item.sub;
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
          // hovering anywhere on the row lights it fully — same look the active
          // row has, so it reads as "click to make this the active one"
          const hot = hovered === j && !active;
          const d = j - activeItem;
          // Items ABOVE the active one skip the slot the category icon occupies
          // (offset -1 is left empty), so no item ever sits on the category line.
          const offset = d >= 0 ? d : d - 1;
          const rowOpacity = active || hot ? 1 : Math.max(0.3, 0.72 - Math.abs(offset) * 0.12);
          return (
            <motion.li
              key={item.id}
              className={styles.itemRow}
              style={{ top: pivotTop, height: ITEM_SPACING }}
              initial={introStagger ? { opacity: 0, y: offset * ITEM_SPACING } : false}
              animate={{ opacity: 1, y: offset * ITEM_SPACING }}
              transition={{
                y: { type: "spring", stiffness: 520, damping: 38 },
                opacity: {
                  delay: introStagger ? introStagger.base + j * introStagger.step : 0,
                  duration: introStagger ? 0.4 : 0,
                  ease: "easeOut",
                },
              }}
            >
              <button
                {...hoverProps(j)}
                onClick={() => {
                  if (active) onActivate(j);
                  else {
                    play("move");
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
                  transition={{ duration: LIGHT_SEC, ease: "easeOut" }}
                >
                  <Icon
                    icon={item.icon}
                    focused={active}
                    hovered={hot}
                    size={ITEM_ICON_SIZE}
                    keepSize
                    throb
                  />
                </motion.span>
                <motion.span
                  className={styles.itemLabelWrap}
                  initial={false}
                  animate={{ opacity: rowOpacity }}
                  transition={{ duration: LIGHT_SEC, ease: "easeOut" }}
                >
                  <span className={styles.itemLabel}>{item.label}</span>
                  {(() => {
                    const sub = liveSub(item);
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
