import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import type { BackdropSpec, MenuMedia } from "@engine/model/types";
import styles from "@engine/styles/menu.module.css";

const DWELL_MS = 4000;
/** Longest we wait for an embed to report itself loaded before fading in anyway. */
const LOAD_GRACE_MS = 2500;
/** The backdrop's fade, in and out. */
const FADE_SEC = 0.9;

// lazily load SoundCloud's widget API (only when a SoundCloud backdrop is used)
let scApi: Promise<unknown> | null = null;
function loadSoundCloud(): Promise<unknown> {
  const w = window as unknown as { SC?: { Widget: (el: HTMLIFrameElement) => { play: () => void } } };
  if (w.SC?.Widget) return Promise.resolve(w.SC);
  if (!scApi) {
    scApi = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "https://w.soundcloud.com/player/api.js";
      s.onload = () => resolve(w.SC);
      s.onerror = () => resolve(undefined);
      document.head.appendChild(s);
    });
  }
  return scApi;
}

interface Shown {
  id: string;
  link?: string;
  media?: MenuMedia;
  contain?: boolean;
}

/**
 * When resting on an item that declares a backdrop for ~1s, fade it in behind
 * the menu: a live site, an embed (post/video/player), or media. The frontend
 * decides *what* each item's backdrop is; this component only renders it.
 *
 * The embed stays NON-interactive (input goes to the menu) until you click it;
 * then it's live and navigating away hands control back.
 */
export function Backdrop() {
  const { categories, groups } = useMenuModel();
  const openGroup = useMenu((s) => s.openGroup);
  const categoryIndex = useMenu((s) => s.categoryIndex);
  const itemIndex = useMenu((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const drillIndex = useMenu((s) => (openGroup ? s.itemIndexByGroup[openGroup] ?? 0 : 0));

  let id: string | undefined;
  let spec: BackdropSpec | null | undefined;
  if (openGroup) {
    const p = groups[openGroup]?.items[drillIndex];
    id = p?.id;
    spec = p?.backdrop;
  } else {
    const it = categories[categoryIndex]?.items[itemIndex];
    id = it?.id;
    spec = it?.backdrop;
  }
  const target: Shown | undefined =
    spec && id ? { id, link: spec.link, media: spec.media, contain: spec.contain } : undefined;

  const [shown, setShown] = useState<Shown | null>(null);
  const [interacting, setInteracting] = useState(false);
  // held at 0 opacity until the embed/media has actually painted, so the fade
  // carries the content in rather than running on an empty frame
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // clicking to interact is a user gesture — start playback with sound here
  const enterInteract = () => {
    setInteracting(true);
    const link = shown?.link ?? "";
    const el = frameRef.current;
    if (/youtube\.com\/embed/.test(link)) {
      el?.contentWindow?.postMessage('{"event":"command","func":"unMute","args":[]}', "*");
      el?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":[]}', "*");
    } else if (/soundcloud\.com\/player/.test(link) && el) {
      loadSoundCloud().then((SC) => {
        const api = SC as { Widget?: (e: HTMLIFrameElement) => { play: () => void } } | undefined;
        api?.Widget?.(el).play();
      });
    }
  };

  useEffect(() => {
    setShown(null);
    setInteracting(false);
    if (!target?.link && !target?.media) return;
    const t = target;
    const id = window.setTimeout(() => setShown(t), DWELL_MS);
    return () => clearTimeout(id);
  }, [target?.id, target?.link, target?.media]);

  // Some embeds never fire load (cross-origin quirks, blocked frames) — reveal
  // on a timer rather than leave the backdrop permanently blank.
  useEffect(() => {
    setReady(false);
    if (!shown) return;
    const t = window.setTimeout(() => setReady(true), LOAD_GRACE_MS);
    return () => clearTimeout(t);
  }, [shown]);

  // Esc releases interaction (works for same-origin frames like /hom, /prim)
  useEffect(() => {
    if (!interacting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setInteracting(false);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [interacting]);

  // Some embeds (e.g. login pages) autofocus their inputs on load and steal the
  // keyboard even though the mouse is blocked. Until the user clicks in, pull
  // focus back to the menu whenever the iframe grabs it.
  useEffect(() => {
    if (interacting || !shown) return;
    const guard = () => {
      if (document.activeElement === frameRef.current) frameRef.current?.blur();
    };
    window.addEventListener("blur", guard);
    const iv = window.setInterval(guard, 250);
    return () => {
      window.removeEventListener("blur", guard);
      clearInterval(iv);
    };
  }, [interacting, shown]);

  const embeddable = !!shown?.link && !/github\.com/i.test(shown.link);
  const frameStyle = { pointerEvents: interacting ? ("auto" as const) : ("none" as const) };

  return (
    <AnimatePresence>
      {shown && (embeddable || shown.media) && (
        <motion.div
          key={shown.id}
          className={styles.projBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_SEC, ease: "easeInOut" }}
        >
          {embeddable && shown.link ? (
            <>
              {shown.contain ? (
                <div className={styles.projBackdropCenter}>
                  <iframe
                    ref={frameRef}
                    className={styles.projBackdropCard}
                    style={frameStyle}
                    src={shown.link}
                    title={shown.id}
                    allow="autoplay"
                    onLoad={() => setReady(true)}
                  />
                </div>
              ) : (
                <iframe
                  ref={frameRef}
                  className={styles.projBackdropMedia}
                  style={frameStyle}
                  src={shown.link}
                  title={shown.id}
                  allow="autoplay"
                  onLoad={() => setReady(true)}
                />
              )}

              {/* catches the click that hands control to the embed */}
              {!interacting && (
                <button
                  className={styles.projBackdropCatch}
                  onClick={enterInteract}
                  aria-label="Interact with this"
                />
              )}
            </>
          ) : shown.media?.type === "video" ? (
            <video
              className={styles.projBackdropMedia}
              src={shown.media.src}
              poster={shown.media.poster}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setReady(true)}
            />
          ) : shown.media ? (
            <img
              className={styles.projBackdropMedia}
              src={shown.media.src}
              alt=""
              onLoad={() => setReady(true)}
            />
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
