import { useRef, useState } from "react";
import type { Channel } from "@wii/channels";
import { ChannelArt } from "./ChannelArt";
import styles from "@wii/wii.module.css";

/**
 * One channel in the grid. Pointing at it pops the tile forward, banks it very
 * slightly toward the cursor (the console's tiles are flat, but the parallax is
 * what makes a pointed remote feel like it's touching them) and floats the name
 * bubble over its bottom edge.
 */
export function ChannelTile({
  channel,
  live,
  onOpen,
  onHover,
}: {
  channel: Channel;
  live: boolean;
  onOpen: (c: Channel) => void;
  onHover?: (c: Channel | null) => void;
}) {
  const [hot, setHot] = useState(false);
  const [tilt, setTilt] = useState<string>("");
  const ref = useRef<HTMLButtonElement>(null);

  const track = (e: React.PointerEvent) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const dx = (e.clientX - box.left) / box.width - 0.5;
    const dy = (e.clientY - box.top) / box.height - 0.5;
    setTilt(`perspective(40em) rotateY(${(dx * 5).toFixed(2)}deg) rotateX(${(-dy * 5).toFixed(2)}deg) scale(1.055)`);
  };

  const enter = () => {
    setHot(true);
    onHover?.(channel);
  };
  const leave = () => {
    setHot(false);
    setTilt("");
    onHover?.(null);
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={[styles.tile, hot ? styles.hot : ""].join(" ")}
        style={tilt ? { transform: tilt } : undefined}
        onPointerEnter={enter}
        onPointerLeave={leave}
        onPointerMove={track}
        onFocus={enter}
        onBlur={leave}
        onClick={() => onOpen(channel)}
        aria-label={channel.title}
      >
        <ChannelArt channel={channel} live={live} />
        <span className={styles.gloss} />
      </button>
      {hot && <span className={styles.bubble}>{channel.title}</span>}
    </>
  );
}
