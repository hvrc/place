import { useEffect, useState } from "react";

export interface NameTransform {
  h1: string;
  a: string;
  r: string;
  s: string;
  h2: string;
}

const INITIAL: NameTransform = { h1: "H", a: "A", r: "R", s: "S", h2: "H" };
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function randomLetter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

/**
 * Recreates the original "HARSH" title animation: the A and S letters scramble
 * through random glyphs and briefly resolve to V and C before snapping back,
 * on an initial delay and then a repeating interval.
 */
export function useLetterScramble(enabled: boolean): NameTransform {
  const [name, setName] = useState<NameTransform>(INITIAL);

  useEffect(() => {
    if (!enabled) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const scrambleOnce = () => {
      let aCount = 0;
      const aInterval = setInterval(() => {
        setName((prev) => ({ ...prev, a: randomLetter() }));
        if (++aCount >= 40) {
          clearInterval(aInterval);
          timers.push(setTimeout(() => setName((prev) => ({ ...prev, a: "V" })), 100));
        }
      }, 80);
      intervals.push(aInterval);

      timers.push(
        setTimeout(() => {
          let sCount = 0;
          const sInterval = setInterval(() => {
            setName((prev) => ({ ...prev, s: randomLetter() }));
            if (++sCount >= 40) {
              clearInterval(sInterval);
              timers.push(setTimeout(() => setName((prev) => ({ ...prev, s: "C" })), 100));
            }
          }, 80);
          intervals.push(sInterval);
        }, 800)
      );

      timers.push(setTimeout(() => setName((prev) => ({ ...prev, s: "S" })), 6000));
      timers.push(setTimeout(() => setName((prev) => ({ ...prev, a: "A" })), 6500));
    };

    timers.push(setTimeout(scrambleOnce, 3000));
    intervals.push(setInterval(scrambleOnce, 12000));

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [enabled]);

  return name;
}
