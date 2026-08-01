import { useEffect, useRef, useState } from "react";
import { useWii } from "@wii/state";
import { HandCursor } from "./glyphs";
import styles from "@wii/wii.module.css";

/**
 * The Wii-remote hand. It trails the real cursor by a frame or two and banks
 * into the direction of travel, which is what sells it as a pointed remote
 * rather than a mouse: the console's hand rolls because your wrist does.
 *
 * Positioned by writing straight to the node's transform in a rAF loop: this
 * runs on every mouse move, so it never touches React state.
 */
export function Pointer() {
  const enabled = useWii((s) => s.settings.pointer);
  const tilt = useWii((s) => s.settings.pointerTilt);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Live values the loop reads; refs so a move never triggers a render.
  const target = useRef({ x: -200, y: -200 });
  const at = useRef({ x: -200, y: -200 });
  const angle = useRef(0);
  const tiltRef = useRef(tilt);
  tiltRef.current = tilt;

  useEffect(() => {
    if (!enabled) return;
    // A coarse pointer (touch) has nothing to draw a hand for.
    if (window.matchMedia?.("(pointer: coarse)").matches) return;

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let raf = 0;
    const tick = () => {
      const t = target.current;
      const a = at.current;
      const dx = t.x - a.x;
      const dy = t.y - a.y;
      // Chase with a fixed fraction per frame: a spring without the bookkeeping.
      a.x += dx * 0.34;
      a.y += dy * 0.34;

      // Bank toward travel, then ease back to upright when it settles.
      const want = Math.max(-26, Math.min(26, dx * 0.55)) * (tiltRef.current / 100);
      angle.current += (want - angle.current) * 0.18;

      const el = ref.current;
      if (el) {
        el.style.transform = `translate3d(${a.x - 8}px, ${a.y - 6}px, 0) rotate(${angle.current.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      className={styles.pointer}
      style={{ opacity: visible ? 1 : 0, transition: "opacity 180ms ease" }}
      aria-hidden
    >
      <HandCursor />
    </div>
  );
}

/** Whether the custom hand should replace the OS cursor on this device. */
export function useHandCursor(): boolean {
  const enabled = useWii((s) => s.settings.pointer);
  const [fine, setFine] = useState(false);
  useEffect(() => {
    setFine(!window.matchMedia?.("(pointer: coarse)").matches);
  }, []);
  return enabled && fine;
}
