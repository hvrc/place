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
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const projectsItem = useXmb((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const moveCategory = useXmb((s) => s.moveCategory);
  const moveItem = useXmb((s) => s.moveItem);
  const clock = useClock();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

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
        if (item.id === "theme") state.cycleTheme();
        else if (item.id === "wave") state.cycleWaveHue(1);
        else if (item.id === "uiVolume") state.cycleUiVolume();
        else if (item.id === "musicVolume") state.cycleMusicVolume();
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

      // "games menu" mode (a project group is open)
      if (s.openGroup) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            s.moveProject(-1);
            play(sfx.move);
            break;
          case "ArrowDown":
            e.preventDefault();
            s.moveProject(1);
            play(sfx.move);
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
          activate(s.itemIndexByCategory[s.categoryIndex] ?? 0);
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveCategory, moveItem, activate, openProject]);

  const onWheel = (e: React.WheelEvent) => {
    const s = useXmb.getState();
    if (s.openGroup) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        s.moveProject(e.deltaY > 0 ? 1 : -1);
        play(sfx.move);
      }
      return;
    }
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
    const s = useXmb.getState();

    if (s.openGroup) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > THRESH) {
        s.moveProject(dy < 0 ? 1 : -1);
        play(sfx.move);
      } else if (dx > THRESH) {
        s.closeProjectGroup();
        play(sfx.back);
      }
      touchStart.current = null;
      return;
    }

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
    </div>
  );
}
