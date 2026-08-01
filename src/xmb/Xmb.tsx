import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import { sfx } from "@/xmb/sound";
import { XmbWave } from "./XmbWave";
import { XmbCategoryBar } from "./XmbCategoryBar";
import { XmbItemColumn } from "./XmbItemColumn";
import { ProjectThumbnails, GamesSideColumn } from "./GamesMenu";
import { ProjectBackdrop } from "./ProjectBackdrop";
import { ColorMenu } from "./ColorMenu";
import { groupProjects, projectGroups } from "./projectsMenu";
import { XmbBattery } from "./XmbBattery";
import styles from "./Xmb.module.css";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const date = `${now.getMonth() + 1}/${now.getDate()}`;
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${date} ${time}`;
}

export default function Xmb() {
  const navigate = useNavigate();
  const theme = useXmb((s) => s.settings.theme);
  const openGroup = useXmb((s) => s.openGroup);
  const colorOpen = useXmb((s) => s.colorOpen);
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const projectsItem = useXmb((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const moveCategory = useXmb((s) => s.moveCategory);
  const moveItem = useXmb((s) => s.moveItem);
  const clock = useClock();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wheel = useRef({ ax: 0, ay: 0, lastMove: 0, lastEvt: 0 });

  // The group whose thumbnails to show: the open one (drilled), or — while
  // browsing the Projects folders — the focused folder (previewed).
  const onProjects = categories[categoryIndex]?.id === "projects";
  const thumbGroup = openGroup ?? (onProjects ? projectGroups[projectsItem]?.id ?? null : null);

  const play = (fn: (volume: number) => void) => {
    const v = useXmb.getState().settings.uiVolume ?? 50;
    if (v > 0) fn(v / 100);
  };

  const activate = useCallback(
    (index: number) => {
      const state = useXmb.getState();
      const category = categories[state.categoryIndex];
      const item = category.items[index];

      if (item.detail.kind === "group") {
        state.openProjectGroup(item.detail.groupId);
        play(sfx.enter);
        return;
      }

      if (category.id === "settings") {
        if (item.id === "wave") state.openColor();
        else if (item.id === "uiVolume") state.cycleUiVolume();
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

  // Open the currently selected project inside an open group.
  const openProject = useCallback(() => {
    const s = useXmb.getState();
    if (!s.openGroup) return;
    const list = groupProjects(s.openGroup);
    const p = list[s.projectIndexByGroup[s.openGroup] ?? 0];
    if (!p?.link) return;
    play(sfx.enter);
    if (p.internal) navigate(p.link);
    else window.open(p.link, "_blank", "noopener,noreferrer");
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useXmb.getState();

      // colour picker open (right-side swatches)
      if (s.colorOpen) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            if (s.moveColor(-1)) play(sfx.move);
            break;
          case "ArrowDown":
            e.preventDefault();
            if (s.moveColor(1)) play(sfx.move);
            break;
          case "ArrowLeft":
          case "Escape":
          case "Enter":
          case " ":
            e.preventDefault();
            s.closeColor();
            play(sfx.back);
            break;
        }
        return;
      }

      // "games menu" mode (a project group is open)
      if (s.openGroup) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            if (s.moveProject(-1)) play(sfx.move);
            break;
          case "ArrowDown":
            e.preventDefault();
            if (s.moveProject(1)) play(sfx.move);
            break;
          case "ArrowLeft":
          case "Escape":
            e.preventDefault();
            s.closeProjectGroup();
            play(sfx.back);
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            openProject();
            break;
        }
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (moveCategory(-1)) play(sfx.category);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (moveCategory(1)) play(sfx.category);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (moveItem(-1)) play(sfx.move);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (moveItem(1)) play(sfx.move);
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
  }, [moveCategory, moveItem, activate, openProject]);

  // Scroll: vertical wheel / trackpad -> items (like ↑/↓); horizontal trackpad or
  // Shift+wheel -> categories (like ←/→). Deltas are accumulated and paced so a
  // gesture makes one move at a time instead of firing on every event.
  const STEP = 85; // accumulated pixels per move (higher = less sensitive)
  const COOLDOWN = 160; // min ms between moves
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
    const s = useXmb.getState();
    const horizontal = Math.abs(w.ax) > Math.abs(w.ay);

    if (s.colorOpen) {
      if (!horizontal && Math.abs(w.ay) >= STEP) {
        if (s.moveColor(w.ay > 0 ? 1 : -1)) play(sfx.move);
        w.ax = 0;
        w.ay = 0;
        w.lastMove = now;
      }
      return;
    }

    if (!horizontal && Math.abs(w.ay) >= STEP) {
      const dir = w.ay > 0 ? 1 : -1;
      const moved = s.openGroup ? s.moveProject(dir) : moveItem(dir);
      if (moved) play(sfx.move);
      w.ax = 0;
      w.ay = 0;
      w.lastMove = now;
    } else if (horizontal && Math.abs(w.ax) >= STEP) {
      if (!s.openGroup && moveCategory(w.ax > 0 ? 1 : -1)) play(sfx.category);
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
    const THRESH = 40;
    const s = useXmb.getState();

    if (s.colorOpen) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > THRESH) {
        if (s.moveColor(dy < 0 ? 1 : -1)) play(sfx.move);
      } else if (dx > THRESH) {
        s.closeColor();
        play(sfx.back);
      }
      touchStart.current = null;
      return;
    }

    if (s.openGroup) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > THRESH) {
        if (s.moveProject(dy < 0 ? 1 : -1)) play(sfx.move);
      } else if (dx > THRESH) {
        s.closeProjectGroup();
        play(sfx.back);
      }
      touchStart.current = null;
      return;
    }

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > THRESH) {
      if (moveCategory(dx < 0 ? 1 : -1)) play(sfx.category);
    } else if (Math.abs(dy) > THRESH) {
      if (moveItem(dy < 0 ? 1 : -1)) play(sfx.move);
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
      <ProjectBackdrop />

      <div className={styles.brand}>hvrc·place</div>

      <div className={styles.clock}>
        <span>{clock}</span>
        <XmbBattery className={styles.battery} />
      </div>

      {/* thumbnails persist across preview -> drill-in so they just slide over */}
      <AnimatePresence>
        {thumbGroup && <ProjectThumbnails key={thumbGroup} groupId={thumbGroup} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {openGroup ? (
          <GamesSideColumn key="games" groupId={openGroup} />
        ) : (
          <motion.div key="normal">
            <XmbCategoryBar />
            <XmbItemColumn onActivate={activate} />
          </motion.div>
        )}
      </AnimatePresence>

      {colorOpen && <ColorMenu />}
    </div>
  );
}
