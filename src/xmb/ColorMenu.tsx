import { motion } from "framer-motion";
import { useXmb, WAVE_PALETTE } from "@/xmb/xmbStore";
import styles from "./Xmb.module.css";

const SWATCH = 30;
const GAP = 12;
const SPACING = SWATCH + GAP;

/**
 * PSP-style colour picker: a vertical strip of swatches on the right, the
 * selected one centred and highlighted. Scrolling changes the wave colour live.
 */
export function ColorMenu() {
  const waveIndex = useXmb((s) => s.settings.waveIndex);
  const setColor = useXmb((s) => s.setColor);

  return (
    <div className={styles.colorMenu}>
      {/* full-width selection band on the pivot line */}
      <div className={styles.colorSelected} />
      <motion.div
        className={styles.colorList}
        initial={false}
        animate={{ y: -waveIndex * SPACING }}
        transition={{ type: "spring", stiffness: 520, damping: 40 }}
      >
        {WAVE_PALETTE.map((hex, i) => (
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
            animate={{ scale: i === waveIndex ? 1.08 : 0.92, opacity: i === waveIndex ? 1 : 0.82 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onClick={() => setColor(i)}
            aria-label={`#${hex}`}
            aria-current={i === waveIndex}
          />
        ))}
      </motion.div>
    </div>
  );
}
