import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BatteryLike {
  level: number; // 0..1
  charging: boolean;
  addEventListener: (t: string, fn: () => void) => void;
  removeEventListener: (t: string, fn: () => void) => void;
}

/** not-charging level -> bar count */
function levelToBars(level: number): number {
  const pct = level * 100;
  if (pct < 10) return 0;
  if (pct < 33) return 1;
  if (pct < 80) return 2;
  return 3;
}

/**
 * PSP-style battery indicator (terminal on the left). Reflects the real device
 * battery via the Battery Status API when available: when discharging it shows
 * the level (0–3 bars); when charging (or when the API is unavailable) it plays
 * the charging loop 0 -> 1 -> 2 -> 3.
 */
export function Battery({ className }: { className?: string }) {
  const [bars, setBars] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let battery: BatteryLike | null = null;
    let loop: number | undefined;

    const startLoop = () => {
      if (loop != null) return;
      setBars(0);
      loop = window.setInterval(() => setBars((b) => (b + 1) % 4), 700);
    };
    const stopLoop = () => {
      if (loop != null) {
        clearInterval(loop);
        loop = undefined;
      }
    };

    const update = () => {
      if (!battery || cancelled) return;
      if (battery.charging) {
        startLoop(); // charging -> animate
      } else {
        stopLoop();
        setBars(levelToBars(battery.level)); // discharging -> real level
      }
    };

    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryLike> };
    if (nav.getBattery) {
      nav
        .getBattery()
        .then((b) => {
          if (cancelled) return;
          battery = b;
          b.addEventListener("levelchange", update);
          b.addEventListener("chargingchange", update);
          update();
        })
        .catch(startLoop);
    } else {
      startLoop(); // unsupported (Firefox/Safari) -> fallback loop
    }

    return () => {
      cancelled = true;
      stopLoop();
      if (battery) {
        battery.removeEventListener("levelchange", update);
        battery.removeEventListener("chargingchange", update);
      }
    };
  }, []);

  // bar left edges, left (terminal side) -> right; fill right -> left
  const barX = [6.6, 12.1, 17.6];

  return (
    <svg
      className={className}
      viewBox="0 0 26 14"
      width="1.9em"
      height="1.02em"
      fill="none"
      aria-label={`Battery ${bars} of 3`}
      role="img"
    >
      {/* terminal cap (left) */}
      <rect x="0.6" y="5" width="2.4" height="4" rx="1" fill="currentColor" />
      {/* body outline */}
      <rect x="4" y="2" width="21" height="10" rx="2.4" stroke="currentColor" strokeWidth="1.5" />
      {/* charge bars */}
      {barX.map((x, i) => (
        <motion.rect
          key={x}
          x={x}
          y="4"
          width="4.2"
          height="6"
          rx="1"
          fill="currentColor"
          initial={false}
          animate={{ opacity: i >= barX.length - bars ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
