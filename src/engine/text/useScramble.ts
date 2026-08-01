import { useEffect, useRef, useState } from "react";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&/*+<>";

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Resolves one string into another the way a decoder does: each position runs
 * through random glyphs before locking to its final letter, staggered left to
 * right so the word settles rather than sliding. Returns this frame's text —
 * the element it renders into never moves.
 */
export function useScramble(target: string, frames = 68): string {
  const [text, setText] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    if (target === prev.current) return;
    const from = prev.current;
    prev.current = target;

    if (reduceMotion()) {
      setText(target);
      return;
    }

    const len = Math.max(from.length, target.length);
    // when each position starts churning, and when it locks
    const plan = Array.from({ length: len }, (_, i) => {
      const start = Math.floor((i / len) * frames * 0.55);
      return { start, end: start + 16 + Math.floor(Math.random() * 22) };
    });

    let frame = 0;
    let raf = requestAnimationFrame(function tick() {
      let out = "";
      let locked = 0;
      for (let i = 0; i < len; i++) {
        const { start, end } = plan[i];
        if (frame >= end) {
          out += target[i] ?? "";
          locked++;
        } else if (frame >= start) {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        } else {
          out += from[i] ?? "";
        }
      }
      setText(out);
      if (locked === len) return;
      frame++;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, frames]);

  return text;
}
