import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import { sfx } from "@/xmb/sound";
import { XmbWave } from "./XmbWave";
import { XmbCategoryBar } from "./XmbCategoryBar";
import { XmbItemColumn } from "./XmbItemColumn";
import { XmbInfoPanel } from "./XmbInfoPanel";
import styles from "./Xmb.module.css";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Xmb() {
  const navigate = useNavigate();
  const theme = useXmb((s) => s.settings.theme);
  const moveCategory = useXmb((s) => s.moveCategory);
  const moveItem = useXmb((s) => s.moveItem);
  const clock = useClock();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const play = (fn: () => void) => {
    if (useXmb.getState().settings.sound) fn();
  };

  const activate = useCallback(
    (index: number) => {
      const state = useXmb.getState();
      const category = categories[state.categoryIndex];
      const item = category.items[index];

      if (category.id === "settings") {
        if (item.id === "theme") state.cycleTheme();
        else if (item.id === "wave") state.cycleWaveHue(1);
        else if (item.id === "sound") state.toggleSound();
        else if (item.id === "motion") state.toggleReduceMotion();
        play(sfx.enter);
        return;
      }

      if (item.action) {
        play(sfx.enter);
        if (item.action.type === "route") navigate(item.action.target);
        else window.open(item.action.target, "_blank", "noopener,noreferrer");
      }
    },
    [navigate]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          moveCategory(-1);
          play(sfx.category);
          break;
        case "ArrowRight":
          e.preventDefault();
          moveCategory(1);
          play(sfx.category);
          break;
        case "ArrowUp":
          e.preventDefault();
          moveItem(-1);
          play(sfx.move);
          break;
        case "ArrowDown":
          e.preventDefault();
          moveItem(1);
          play(sfx.move);
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          const s = useXmb.getState();
          activate(s.itemIndexByCategory[s.categoryIndex] ?? 0);
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveCategory, moveItem, activate]);

  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      moveItem(e.deltaY > 0 ? 1 : -1);
      play(sfx.move);
    } else if (e.deltaX) {
      moveCategory(e.deltaX > 0 ? 1 : -1);
      play(sfx.category);
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
    const THRESH = 40;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > THRESH) {
      moveCategory(dx < 0 ? 1 : -1);
      play(sfx.category);
    } else if (Math.abs(dy) > THRESH) {
      moveItem(dy < 0 ? 1 : -1);
      play(sfx.move);
    }
    touchStart.current = null;
  };

  return (
    <div
      className={`${styles.root} ${theme === "dark" ? styles.rootDark : styles.rootLight}`}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <XmbWave />
      <div className={styles.vignette} />

      <div className={styles.clock}>{clock}</div>

      <XmbCategoryBar />
      <XmbItemColumn onActivate={activate} />
      <XmbInfoPanel />

      <div className={styles.hint}>
        ← → category &nbsp;·&nbsp; ↑ ↓ item &nbsp;·&nbsp; Enter select
      </div>
    </div>
  );
}
