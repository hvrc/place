import { motion } from "framer-motion";
import type { Channel } from "@wii/channels";
import { ChannelArt } from "./ChannelArt";
import styles from "@wii/wii.module.css";

/**
 * The console's channel-open flourish: the tile you picked leaps off the grid
 * and swallows the screen.
 *
 * It's a throwaway copy of the tile rather than the tile itself, so the real
 * channel screen (and its iframe) can mount underneath and start loading while
 * this plays over the top. It removes itself when the animation lands.
 */
export function ChannelZoom({
  channel,
  from,
  onDone,
}: {
  channel: Channel;
  from: DOMRect;
  onDone: () => void;
}) {
  return (
    <motion.div
      className={styles.zoom}
      initial={{
        left: from.left,
        top: from.top,
        width: from.width,
        height: from.height,
        opacity: 1,
        borderRadius: "0.85em",
      }}
      animate={{
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        opacity: 0,
        borderRadius: 0,
      }}
      transition={{ duration: 0.44, ease: [0.34, 0.02, 0.22, 1] }}
      onAnimationComplete={onDone}
    >
      {/* live, so a video tile keeps painting through the leap rather than
          flashing white while its first frame decodes */}
      <ChannelArt channel={channel} />
      <span className={styles.gloss} />
    </motion.div>
  );
}
