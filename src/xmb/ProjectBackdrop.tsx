import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Media } from "@/data/projects";
import { experience } from "@/data/experience";
import { socials } from "@/data/socials";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import { groupProjects } from "@/xmb/projectsMenu";
import styles from "./Xmb.module.css";

const DWELL_MS = 1000;
const linkSocials = socials.filter((s) => s.id !== "resume");

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

interface Target {
  id: string;
  link?: string;
  media?: Media;
  /** render as a centered card (a post) rather than fullscreen */
  contain?: boolean;
}

/**
 * When resting on something with a live site / media for ~1s, fade it in behind
 * the menu: a project, an Experience role's site, or a Links post/video.
 *
 * The embed stays NON-interactive (input goes to the XMB) until you click it;
 * then it's live and "← menu" / navigating away hands control back.
 */
export function ProjectBackdrop() {
  const openGroup = useXmb((s) => s.openGroup);
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const itemIndex = useXmb((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const projIndex = useXmb((s) => (openGroup ? s.projectIndexByGroup[openGroup] ?? 0 : 0));

  let target: Target | undefined;
  if (openGroup) {
    const p = groupProjects(openGroup)[projIndex];
    if (p && !p.noBackdrop) target = { id: p.id, link: p.link, media: p.media };
  } else if (categories[categoryIndex]?.id === "experience") {
    const role = experience[itemIndex];
    if (role?.link) target = { id: role.id, link: role.link };
  } else if (categories[categoryIndex]?.id === "links") {
    const social = linkSocials[itemIndex];
    if (social?.backdrop)
      target = { id: social.id, link: social.backdrop, contain: social.backdropContain };
  } else {
    // any item that routes to our own page (e.g. Resume) — same-origin, embeds fine
    const item = categories[categoryIndex]?.items[itemIndex];
    if (item?.action?.type === "route") target = { id: item.id, link: item.action.target };
  }

  const [shown, setShown] = useState<Target | null>(null);
  const [interacting, setInteracting] = useState(false);
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
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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
            />
          ) : shown.media ? (
            <img className={styles.projBackdropMedia} src={shown.media.src} alt="" />
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
