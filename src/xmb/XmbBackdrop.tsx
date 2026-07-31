import { AnimatePresence, motion } from "framer-motion";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import { CATEGORY_TOP_VH } from "./XmbCategoryBar";
import { ITEM_SPACING } from "./XmbItemColumn";
import styles from "./Xmb.module.css";

// Top-left anchor: level with the active item's title, starting to the right of
// where the title text ends (with room for the arrow connector).
const TOP = `calc(${CATEGORY_TOP_VH}vh + ${ITEM_SPACING + 40}px)`;
const LEFT = "45%";

/**
 * When the focused item is a project that has media, show that image/video
 * fullscreen behind the menu. Crossfades as you navigate; otherwise the wave
 * shows through.
 */
export function XmbBackdrop() {
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const itemIndex = useXmb((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);

  const item = categories[categoryIndex]?.items[itemIndex];
  const media = item?.detail.kind === "project" ? item.detail.project.media : undefined;

  return (
    <div className={styles.backdropWrap} style={{ top: TOP, left: LEFT }}>
      <AnimatePresence>
        {media && (
          <motion.div
            key={item.id}
            className={styles.backdropFade}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            {/* triangle arrow pointing from the label to the rectangle */}
            <span className={styles.backdropArrow} />
            <div className={styles.backdrop}>
              {media.type === "video" ? (
                <video
                  className={styles.backdropMedia}
                  src={media.src}
                  poster={media.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img className={styles.backdropMedia} src={media.src} alt="" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
