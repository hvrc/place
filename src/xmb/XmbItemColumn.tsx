import { AnimatePresence, motion } from "framer-motion";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import { PIVOT_LEFT } from "./XmbCategoryBar";
import styles from "./Xmb.module.css";

export const ITEM_SPACING = 58;

export function XmbItemColumn({ onActivate }: { onActivate: (index: number) => void }) {
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const activeItem = useXmb((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const setItem = useXmb((s) => s.setItem);

  const items = categories[categoryIndex].items;

  return (
    <div className={styles.itemColumn} style={{ left: PIVOT_LEFT }}>
      <AnimatePresence mode="wait">
        <motion.ul
          key={categoryIndex}
          className={styles.itemColumnInner}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            animate={{ y: -activeItem * ITEM_SPACING }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            {items.map((item, j) => {
              const active = j === activeItem;
              const distance = Math.abs(j - activeItem);
              return (
                <li key={item.id} style={{ height: ITEM_SPACING }}>
                  <button
                    onClick={() => (active ? onActivate(j) : setItem(j))}
                    className="flex items-center gap-3 text-left focus:outline-none"
                    style={{ height: ITEM_SPACING }}
                    aria-current={active}
                  >
                    <motion.span
                      className={styles.glyph}
                      style={{ fontSize: "1.4rem" }}
                      animate={{
                        scale: active ? 1.15 : 0.85,
                        opacity: active ? 1 : Math.max(0.2, 0.65 - distance * 0.15),
                      }}
                    >
                      {item.glyph}
                    </motion.span>
                    <motion.span
                      className="flex flex-col"
                      animate={{ opacity: active ? 1 : Math.max(0.25, 0.7 - distance * 0.15) }}
                    >
                      <span className={styles.itemLabel} style={{ fontWeight: active ? 700 : 400 }}>
                        {item.label}
                      </span>
                      {active && item.sub && <span className={styles.itemSub}>{item.sub}</span>}
                    </motion.span>
                  </button>
                </li>
              );
            })}
          </motion.div>
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}
