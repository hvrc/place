import { motion } from "framer-motion";
import { useMenu, useMenuModel } from "@menu/state/MenuContext";
import styles from "@menu/styles/menu.module.css";

const SWATCH = 30;
const GAP = 12;
const SPACING = SWATCH + GAP;

/**
 * PSP-style colour picker: a vertical strip of swatches on the right, the
 * selected one centred and highlighted. Scrolling changes the wave colour live.
 */
export function ColorPicker() {
  const { palette } = useMenuModel();
  const colorIndex = useMenu((s) => s.settings.colorIndex);
  const setColor = useMenu((s) => s.setColor);

  return (
    <div className={styles.colorMenu}>
      {/* full-width selection band on the pivot line */}
      <div className={styles.colorSelected} />
      <motion.div
        className={styles.colorList}
        initial={false}
        animate={{ y: -colorIndex * SPACING }}
        transition={{ type: "spring", stiffness: 520, damping: 40 }}
      >
        {palette.map((hex, i) => (
          <motion.button
            key={hex}
            className={styles.swatch}
            style={{
              width: SWATCH,
              height: SWATCH,
              background: `#${hex}`,
              marginBottom: GAP,
              transformOrigin: "left center",
            }}
            initial={false}
            animate={{ scale: i === colorIndex ? 1.08 : 0.92, opacity: i === colorIndex ? 1 : 0.82 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onClick={() => setColor(i)}
            aria-label={`#${hex}`}
            aria-current={i === colorIndex}
          />
        ))}
      </motion.div>
    </div>
  );
}
