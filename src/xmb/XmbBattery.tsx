import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * PSP-style battery indicator, flipped so the terminal is on the left.
 * The three charge bars animate on a loop: 0 -> 1 -> 2 -> 3 -> 0.
 */
export function XmbBattery({ className }: { className?: string }) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setLevel((l) => (l + 1) % 4), 700);
    return () => clearInterval(id);
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
      aria-label={`Battery ${level} of 3`}
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
          animate={{ opacity: i >= barX.length - level ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
