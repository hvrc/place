/**
 * PSP-style battery indicator: a horizontal body with a terminal cap and three
 * charge bars. `bars` (0–3) sets how many are filled; defaults to full.
 * Inherits color from `currentColor`, so it matches the clock text.
 */
export function XmbBattery({ bars = 3, className }: { bars?: number; className?: string }) {
  const barX = [3.4, 8.9, 14.4]; // left edge of each of the 3 bars
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
      {/* body outline */}
      <rect
        x="1"
        y="2"
        width="21"
        height="10"
        rx="2.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* terminal cap */}
      <rect x="23" y="5" width="2.4" height="4" rx="1" fill="currentColor" />
      {/* charge bars */}
      {barX.map((x, i) => (
        <rect
          key={x}
          x={x}
          y="4"
          width="4.2"
          height="6"
          rx="1"
          fill="currentColor"
          opacity={i < bars ? 1 : 0.2}
        />
      ))}
    </svg>
  );
}
