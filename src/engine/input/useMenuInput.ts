import { useCallback, useEffect, useRef } from "react";
import { useMenuStore } from "@engine/state/MenuContext";
import { useSound } from "@engine/sound/useSound";

interface InputHandlers {
  /** activate the currently focused first-level item */
  activate: (index: number) => void;
  /** activate the currently focused drill-in leaf */
  openDrillItem: () => void;
}

/**
 * Accumulated pixels per move, from the laziest setting to the quickest. The
 * scroll-sensitivity setting picks a point on this range: 0% travels the whole
 * SCROLL_STEP_PX[0] before committing a move, 100% only SCROLL_STEP_PX[1].
 * The old fixed value of 85 sits at 60%, which is the default.
 */
const SCROLL_STEP_PX: [number, number] = [140, 48];
/** Minimum ms between moves, so one flick can't run away with the menu. */
const COOLDOWN = 160;
/** Travel needed for one move at the given sensitivity (0-100). */
const stepFor = (sensitivity: number) => {
  const [lazy, quick] = SCROLL_STEP_PX;
  return lazy + ((quick - lazy) * sensitivity) / 100;
};

/**
 * All menu input in one place: keyboard (←/→/↑/↓/Enter/Esc), wheel + trackpad
 * (vertical → items, Shift/horizontal → categories), and touch swipes. Deltas
 * are accumulated and paced so a gesture makes one move at a time. This is the
 * seam to extend for richer mobile gestures later.
 */
export function useMenuInput({ activate, openDrillItem }: InputHandlers) {
  const store = useMenuStore();
  const { play } = useSound();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wheel = useRef({ ax: 0, ay: 0, lastMove: 0, lastEvt: 0 });

  /** A vertical move can spill into the next category — cue follows the axis. */
  const playVertical = useCallback(
    (moved: "item" | "category" | null) => {
      if (moved) play(moved === "category" ? "category" : "move");
    },
    [play]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = store.getState();

      // colour picker open (right-side swatches)
      if (s.colorOpen) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            if (s.moveColor(-1)) play("move");
            break;
          case "ArrowDown":
            e.preventDefault();
            if (s.moveColor(1)) play("move");
            break;
          case "ArrowLeft":
          case "Escape":
          case "Enter":
          case " ":
            e.preventDefault();
            s.closeColor();
            play("back");
            break;
        }
        return;
      }

      // drill-in mode (a group is open)
      if (s.openGroup) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            if (s.moveInDrill(-1)) play("move");
            break;
          case "ArrowDown":
            e.preventDefault();
            if (s.moveInDrill(1)) play("move");
            break;
          case "ArrowRight":
            e.preventDefault();
            if (s.moveDrillAction(1)) play("move");
            break;
          case "ArrowLeft":
            e.preventDefault();
            // step back along the actions first; leave the group from the first
            if (s.moveDrillAction(-1)) play("move");
            else {
              s.closeDrill();
              play("back");
            }
            break;
          case "Escape":
            e.preventDefault();
            s.closeDrill();
            play("back");
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            openDrillItem();
            break;
        }
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (s.moveCategory(-1)) play("category");
          break;
        case "ArrowRight":
          e.preventDefault();
          if (s.moveCategory(1)) play("category");
          break;
        case "ArrowUp":
          e.preventDefault();
          playVertical(s.moveItem(-1));
          break;
        case "ArrowDown":
          e.preventDefault();
          playVertical(s.moveItem(1));
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          activate(s.itemIndexByCategory[s.categoryIndex] ?? 0);
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, play, playVertical, activate, openDrillItem]);

  const onWheel = (e: React.WheelEvent) => {
    const now = performance.now();
    const w = wheel.current;
    if (now - w.lastEvt > 180) {
      w.ax = 0;
      w.ay = 0;
    }
    w.lastEvt = now;

    const scale = e.deltaMode === 1 ? 16 : 1; // normalize line-mode wheels
    let dx = e.deltaX * scale;
    let dy = e.deltaY * scale;
    if (e.shiftKey && dx === 0) {
      dx = dy; // Shift + wheel scrolls sideways (categories)
      dy = 0;
    }
    w.ax += dx;
    w.ay += dy;

    if (now - w.lastMove < COOLDOWN) return;
    const s = store.getState();
    const STEP = stepFor(s.settings.scrollSensitivity);
    const horizontal = Math.abs(w.ax) > Math.abs(w.ay);

    if (s.colorOpen) {
      if (!horizontal && Math.abs(w.ay) >= STEP) {
        if (s.moveColor(w.ay > 0 ? 1 : -1)) play("move");
        w.ax = 0;
        w.ay = 0;
        w.lastMove = now;
      }
      return;
    }

    if (!horizontal && Math.abs(w.ay) >= STEP) {
      const dir = w.ay > 0 ? 1 : -1;
      if (s.openGroup) {
        if (s.moveInDrill(dir)) play("move");
      } else {
        playVertical(s.moveItem(dir));
      }
      w.ax = 0;
      w.ay = 0;
      w.lastMove = now;
    } else if (horizontal && Math.abs(w.ax) >= STEP) {
      const dir = w.ax > 0 ? 1 : -1;
      // drilled in, sideways walks the leaf's actions instead of the categories
      if (s.openGroup) {
        if (s.moveDrillAction(dir)) play("move");
      } else if (s.moveCategory(dir)) play("category");
      w.ax = 0;
      w.ay = 0;
      w.lastMove = now;
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const s = store.getState();
    // a swipe is a shorter gesture than a wheel spin, so it tracks the same
    // setting at roughly half the travel
    const THRESH = stepFor(s.settings.scrollSensitivity) / 2;

    if (s.colorOpen) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > THRESH) {
        if (s.moveColor(dy < 0 ? 1 : -1)) play("move");
      } else if (dx > THRESH) {
        s.closeColor();
        play("back");
      }
      touchStart.current = null;
      return;
    }

    if (s.openGroup) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > THRESH) {
        if (s.moveInDrill(dy < 0 ? 1 : -1)) play("move");
      } else if (dx > THRESH) {
        s.closeDrill();
        play("back");
      }
      touchStart.current = null;
      return;
    }

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > THRESH) {
      if (s.moveCategory(dx < 0 ? 1 : -1)) play("category");
    } else if (Math.abs(dy) > THRESH) {
      playVertical(s.moveItem(dy < 0 ? 1 : -1));
    }
    touchStart.current = null;
  };

  return { onWheel, onTouchStart, onTouchEnd };
}
