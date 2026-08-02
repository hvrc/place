import { useCallback, useState, useSyncExternalStore } from "react";

// ── is the pointer the input actually being used? ─────────────────────────
//
// A hovered row lights up exactly like the selected one, so hover has to stop
// claiming a row the moment the user switches to keys or the wheel. Two things
// go wrong without this, and both leave an unselected icon lit:
//
//   - navigating by wheel or arrow keys while the cursor rests over the column
//     (the wheel case is unavoidable: scrolling puts the cursor over the menu)
//   - mouseenter also fires when content moves under a still pointer, and the
//     column animates on every move, so rows sweep under the cursor and light
//
// One module-level signal, because every column has to agree on it.

let pointerLed = false;
const listeners = new Set<() => void>();
let bound = false;

function setPointerLed(next: boolean) {
  if (next === pointerLed) return;
  pointerLed = next;
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  if (!bound && typeof window !== "undefined") {
    bound = true;
    // only a real mouse hands control back; pointermove also fires for touch
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "mouse") setPointerLed(true);
      },
      { passive: true }
    );
    const release = () => setPointerLed(false);
    window.addEventListener("keydown", release);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
  }
  return () => void listeners.delete(fn);
}

const getPointerLed = () => pointerLed;

/**
 * Tracks which row of a list the pointer is over. Spread `hoverProps(i)` onto
 * the row so hovering anywhere on it (icon or label) counts, which is what lets
 * a whole row light up together.
 *
 * Reports nothing while the keyboard or wheel is driving, so the only lit row
 * is the selected one.
 */
export function useHoverIndex() {
  const [hovered, setHovered] = useState<number | null>(null);
  const led = useSyncExternalStore(subscribe, getPointerLed, getPointerLed);

  const hoverProps = useCallback(
    (i: number) => ({
      onMouseEnter: () => setHovered(i),
      // guard against the enter of the next row landing before this leave
      onMouseLeave: () => setHovered((h) => (h === i ? null : h)),
    }),
    []
  );

  return { hovered: led ? hovered : null, hoverProps };
}
