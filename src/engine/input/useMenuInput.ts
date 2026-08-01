import { useEffect, useRef } from "react";
import { useMenuStore } from "@engine/state/MenuContext";
import { useSound } from "@engine/sound/useSound";
import { CATEGORY_SPACING, ITEM_SPACING, THUMB_SPACING } from "@engine/layout/metrics";

interface InputHandlers {
  /** activate the currently focused first-level item */
  activate: (index: number) => void;
  /** activate the currently focused drill-in leaf */
  openDrillItem: () => void;
}

// accumulated pixels per move (higher = less sensitive)
const STEP = 85;
// ms of scroll inactivity after which the sub-threshold scrub springs back
const SETTLE_MS = 140;

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
  const wheel = useRef({ ax: 0, ay: 0, lastEvt: 0, settle: 0 });

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
          case "ArrowLeft":
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
          if (s.moveItem(-1)) play("move");
          break;
        case "ArrowDown":
          e.preventDefault();
          if (s.moveItem(1)) play("move");
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
  }, [store, play, activate, openDrillItem]);

  // After scrolling stops, spring the sub-threshold scrub back to rest.
  const scheduleSettle = () => {
    const w = wheel.current;
    if (w.settle) clearTimeout(w.settle);
    w.settle = window.setTimeout(() => {
      w.ax = 0;
      w.ay = 0;
      store.getState().setScrub(0, 0);
    }, SETTLE_MS);
  };

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

    const s = store.getState();

    // colour picker keeps the simple discrete behaviour
    if (s.colorOpen) {
      while (Math.abs(w.ay) >= STEP) {
        const dir = w.ay > 0 ? 1 : -1;
        if (s.moveColor(dir)) play("move");
        w.ay -= dir * STEP;
      }
      w.ax = 0;
      return;
    }

    const horizontal = Math.abs(w.ax) > Math.abs(w.ay);

    if (horizontal && !s.openGroup) {
      // categories: the row follows the scroll; a step commits at the threshold
      w.ay = 0;
      let blocked = false;
      while (Math.abs(w.ax) >= STEP) {
        const dir = w.ax > 0 ? 1 : -1;
        if (s.moveCategory(dir)) {
          play("category");
          w.ax -= dir * STEP;
        } else {
          blocked = true;
          break;
        }
      }
      if (blocked) w.ax = 0; // at an end: don't drag past it
      s.setScrub(-(w.ax / STEP) * CATEGORY_SPACING, 0);
    } else if (!horizontal) {
      // items (or drill leaves): the column follows the scroll; commit at threshold
      w.ax = 0;
      const drill = !!s.openGroup;
      let blocked = false;
      while (Math.abs(w.ay) >= STEP) {
        const dir = w.ay > 0 ? 1 : -1;
        const moved = drill ? s.moveInDrill(dir) : s.moveItem(dir);
        if (moved) {
          play("move");
          w.ay -= dir * STEP;
        } else {
          blocked = true;
          break;
        }
      }
      if (blocked) w.ay = 0;
      const spacing = drill ? THUMB_SPACING : ITEM_SPACING;
      s.setScrub(0, -(w.ay / STEP) * spacing);
    }

    scheduleSettle();
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
    const THRESH = 40;
    const s = store.getState();

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
      if (s.moveItem(dy < 0 ? 1 : -1)) play("move");
    }
    touchStart.current = null;
  };

  return { onWheel, onTouchStart, onTouchEnd };
}
