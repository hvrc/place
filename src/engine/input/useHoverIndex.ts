import { useCallback, useState } from "react";

/**
 * Tracks which row of a list the pointer is over. Spread `hoverProps(i)` onto
 * the row so hovering anywhere on it (icon or label) counts, which is what
 * lets a whole row light up together.
 */
export function useHoverIndex() {
  const [hovered, setHovered] = useState<number | null>(null);

  const hoverProps = useCallback(
    (i: number) => ({
      onMouseEnter: () => setHovered(i),
      // guard against the enter of the next row landing before this leave
      onMouseLeave: () => setHovered((h) => (h === i ? null : h)),
    }),
    []
  );

  return { hovered, hoverProps };
}
