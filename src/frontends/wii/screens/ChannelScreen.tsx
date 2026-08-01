import { useEffect, useMemo, useRef, useState } from "react";
import { channels, channelIndex, type Channel } from "@wii/channels";
import { DrawnArt } from "@wii/menu/ChannelArt";
import { AboutPanel } from "./AboutPanel";
import { Pill } from "@wii/ui/Pill";
import { Triangle } from "@wii/ui/glyphs";
import { openTab } from "@engine/lib/browser";
import styles from "@wii/wii.module.css";

/**
 * How long the title card holds over a banner that never reports a load. Long,
 * deliberately: a slow site should leave you reading about the project rather
 * than staring at a blank shelf.
 */
const TITLE_HOLD_MS = 6000;

/**
 * The channel screen: banner on top, black rule, then the buttons. The
 * console's "you picked a channel, now what" page.
 *
 * The banner is the project itself. Anything that can be framed loads live in
 * an iframe and is fully interactive right there on the shelf; anything that
 * refuses to be framed (GitHub, mostly) shows its demo reel instead.
 */
export function ChannelScreen({
  channel,
  onBack,
  onGo,
}: {
  channel: Channel;
  onBack: () => void;
  /** Move to a sibling channel with the side triangles. */
  onGo: (c: Channel) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const timer = useRef<number | undefined>(undefined);

  const framed = Boolean(channel.frame) && !channel.noFrame;
  /** Nothing to reveal behind the card, so it stays put. */
  const cardStays = !framed && !channel.media;

  // The title card gets out of the way once the site is up (or after a beat,
  // for banners that can't tell us).
  useEffect(() => {
    setLoaded(false);
    setShowTitle(true);
    window.clearTimeout(timer.current);
    if (!cardStays) timer.current = window.setTimeout(() => setShowTitle(false), TITLE_HOLD_MS);
    return () => window.clearTimeout(timer.current);
  }, [channel.id, cardStays]);

  useEffect(() => {
    if (!loaded) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShowTitle(false), 900);
    return () => window.clearTimeout(timer.current);
  }, [loaded]);

  const idx = useMemo(() => channelIndex(channel.id), [channel.id]);
  const prev = channels[idx - 1];
  const next = channels[idx + 1];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Backspace") onBack();
      if (e.key === "ArrowLeft" && prev) onGo(prev);
      if (e.key === "ArrowRight" && next) onGo(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack, onGo, prev, next]);

  return (
    <div className={`${styles.channel} ${styles.fade}`}>
      <div className={styles.bannerWrap}>
        <div className={styles.banner}>
          <Banner channel={channel} framed={framed} onLoaded={() => setLoaded(true)} />

          {/* The disc draws its own face; everything else gets the title card. */}
          {channel.kind !== "disc" && (
            <div className={[styles.bannerTitle, showTitle ? "" : styles.faded].join(" ")}>
              <h1>{channel.title}</h1>
              {channel.blurb && <p>{channel.blurb}</p>}
              {channel.description && (
                <p
                  style={{ maxWidth: "34em", opacity: 0.85 }}
                  dangerouslySetInnerHTML={{ __html: channel.description }}
                />
              )}
            </div>
          )}
        </div>

        {prev && (
          <button
            type="button"
            className={`${styles.sideArrow} ${styles.sideArrowLeft}`}
            onClick={() => onGo(prev)}
            aria-label={`Previous: ${prev.title}`}
          >
            <Triangle dir="left" />
          </button>
        )}
        {next && (
          <button
            type="button"
            className={`${styles.sideArrow} ${styles.sideArrowRight}`}
            onClick={() => onGo(next)}
            aria-label={`Next: ${next.title}`}
          >
            <Triangle />
          </button>
        )}
      </div>

      {/* the shelf reflection under the banner */}
      <div className={styles.reflection} aria-hidden>
        <span>{channel.title}</span>
      </div>

      <div className={styles.channelRule} />

      <div className={styles.channelFoot}>
        <Pill onClick={onBack}>Wii Menu</Pill>
        <ChannelActions channel={channel} onShowInfo={() => setShowTitle((v) => !v)} />
      </div>
    </div>
  );
}

/** What the banner actually shows, in order of preference. */
function Banner({
  channel,
  framed,
  onLoaded,
}: {
  channel: Channel;
  framed: boolean;
  onLoaded: () => void;
}) {
  if (channel.kind === "disc") return <AboutPanel />;

  if (framed && channel.frame) {
    return (
      <iframe
        key={channel.id}
        src={channel.frame}
        title={channel.title}
        onLoad={onLoaded}
        allow="accelerometer; autoplay; camera; clipboard-write; encrypted-media; fullscreen; gyroscope; microphone; midi; xr-spatial-tracking"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-modals allow-downloads"
      />
    );
  }

  if (channel.media?.type === "video") {
    return <video src={channel.media.src} muted loop autoPlay playsInline onCanPlay={onLoaded} />;
  }
  if (channel.media?.type === "image") {
    return <img src={channel.media.src} alt={channel.media.alt} onLoad={onLoaded} />;
  }
  // Backdrop only: the title card above it is already naming the channel.
  return <DrawnArt channel={channel} bare />;
}

/**
 * The buttons to the right of "Wii Menu". Where the console has Start, a
 * project has its live site; the second slot is its source.
 */
function ChannelActions({ channel, onShowInfo }: { channel: Channel; onShowInfo: () => void }) {
  if (channel.kind === "soon") {
    return (
      <Pill ghost disabled style={{ opacity: 0.6, cursor: "default" }}>
        Not Available
      </Pill>
    );
  }

  if (channel.kind === "disc") {
    return (
      <>
        <Pill onClick={() => openTab("/resume")}>Resume</Pill>
        <Pill onClick={onShowInfo} ghost>
          About
        </Pill>
      </>
    );
  }

  return (
    <>
      {channel.link && <Pill onClick={() => openTab(channel.link!)}>Start</Pill>}
      {channel.github && <Pill onClick={() => openTab(channel.github!)}>Github</Pill>}
      {channel.download && <Pill onClick={() => openTab(channel.download!)}>Download</Pill>}
      <Pill ghost onClick={onShowInfo}>
        Info
      </Pill>
    </>
  );
}
