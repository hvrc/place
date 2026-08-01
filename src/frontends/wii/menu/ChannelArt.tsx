import { useEffect, useRef } from "react";
import type { Channel } from "@wii/channels";
import { posterFor } from "@wii/channels";
import { WiiMark } from "@wii/ui/glyphs";
import styles from "@wii/wii.module.css";

/**
 * A channel's artwork. Real Wii channels animate in the grid, so anything with
 * a demo video plays there, looping and muted; everything else falls back to a
 * drawn tile in the style of the console's own text channels (Forecast, News).
 *
 * `live` gates playback: only the page you're looking at animates, so paging
 * through the menu never leaves a dozen decoders running.
 */
export function ChannelArt({ channel, live = true }: { channel: Channel; live?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (live) {
      const p = el.play();
      if (p) p.catch(() => {/* autoplay refused — the poster stands in */});
    } else {
      el.pause();
    }
  }, [live]);

  if (channel.kind === "disc") return <DiscArt name={channel.title} />;

  if (channel.media?.type === "video") {
    return (
      <div className={styles.art}>
        <video
          ref={video}
          src={channel.media.src}
          poster={posterFor(channel)}
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

  if (channel.media?.type === "image") {
    return (
      <div className={styles.art}>
        <img className="cover" src={channel.media.src} alt={channel.media.alt} loading="lazy" />
      </div>
    );
  }

  return (
    <div className={styles.art}>
      <DrawnArt channel={channel} />
    </div>
  );
}

/** The text-only channel face, built from the channel's `tile` spec. */
export function DrawnArt({ channel }: { channel: Channel }) {
  const { from, to, ink, label, sub, logo, style } = channel.tile;
  return (
    <div
      className={styles.drawn}
      style={{ background: `linear-gradient(180deg, ${from}, ${to})`, color: ink }}
    >
      {logo && <img className={styles.drawnLogo} src={logo} alt="" />}
      <div className={[styles.drawnLabel, style === "glow" ? styles.glow : ""].join(" ")}>
        {label ?? channel.title}
      </div>
      {sub && <div className={styles.drawnSub}>{sub}</div>}
    </div>
  );
}

/** Slot one: the disc drive, spinning a disc with the owner's name on the rim. */
function DiscArt({ name }: { name: string }) {
  return (
    <div className={styles.disc}>
      <div className={styles.discFace} />
      <div className={styles.discName}>{name}</div>
    </div>
  );
}

/** The ghosted "Wii" that fills every unused slot. */
export function EmptySlot() {
  return (
    <div className={styles.empty}>
      <WiiMark className={styles.emptyMark} />
    </div>
  );
}
