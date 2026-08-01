import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMenu, useMenuModel, useMenuStore } from "@menu/state/MenuContext";
import { useMenuInput } from "@menu/input/useMenuInput";
import { CategoryBar } from "./CategoryBar";
import { ItemColumn } from "./ItemColumn";
import { DrillColumn } from "./DrillColumn";
import { ThumbnailStrip } from "./ThumbnailStrip";
import { Backdrop } from "./Backdrop";
import { Wave } from "@menu/chrome/Wave";
import { Clock } from "@menu/chrome/Clock";
import { Wordmark } from "@menu/chrome/Wordmark";
import { ColorPicker } from "@menu/settings/ColorPicker";
import { useSound } from "@menu/sound/useSound";
import styles from "@menu/styles/menu.module.css";

// Runs once per full page load (module-scoped so SPA re-navigation doesn't
// replay it): the elements fade in in order — background/wave, wordmark, clock,
// category icons, then the columns — so the essentials appear first even if the
// rest is still loading.
let introPlayed = false;

/**
 * The full cross-media-bar menu: ambient chrome (wave/clock/wordmark), the
 * category bar + item column, the drill-in tree + thumbnail strip, the dwell
 * backdrop and the colour picker. Entirely driven by the model from context.
 */
export function MenuShell({ wordmark }: { wordmark: string }) {
  const [introActive, setIntroActive] = useState(!introPlayed);
  useEffect(() => {
    if (introPlayed) return;
    const t = setTimeout(() => {
      introPlayed = true;
      setIntroActive(false);
    }, 1900);
    return () => clearTimeout(t);
  }, []);

  // Staggered fade-in props; a no-op (renders straight to visible) once the
  // intro has played, so nothing re-animates on later re-renders / drill toggles.
  const fadeIn = (delay: number, duration = 0.6) => ({
    initial: introActive ? { opacity: 0 } : false,
    animate: { opacity: 1 },
    transition: {
      delay: introActive ? delay : 0,
      duration: introActive ? duration : 0,
      ease: "easeOut" as const,
    },
  });
  const navigate = useNavigate();
  const store = useMenuStore();
  const { categories, groups } = useMenuModel();
  const { play } = useSound();

  const theme = useMenu((s) => s.settings.theme);
  const openGroup = useMenu((s) => s.openGroup);
  const colorOpen = useMenu((s) => s.colorOpen);
  const categoryIndex = useMenu((s) => s.categoryIndex);
  const itemIndex = useMenu((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);

  // Thumbnails to show: the open group (drilled), or — while browsing a category
  // whose items drill in — the focused item's group (previewed).
  const previewGroup = categories[categoryIndex]?.items[itemIndex]?.drillId ?? null;
  const thumbGroup = openGroup ?? previewGroup;

  const activate = useCallback(
    (index: number) => {
      const s = store.getState();
      const item = categories[s.categoryIndex].items[index];

      if (item.drillId) {
        s.openDrill(item.drillId);
        play("enter");
        return;
      }
      if (item.setting === "color") {
        s.openColor();
        play("enter");
        return;
      }
      if (item.setting === "volume") {
        s.cycleUiVolume();
        play("enter");
        return;
      }
      if (item.action) {
        play("enter");
        if (item.action.type === "route") navigate(item.action.target);
        else window.open(item.action.target, "_blank", "noopener,noreferrer");
      }
    },
    [store, categories, navigate, play]
  );

  // Activate the currently selected leaf inside an open drill-in group.
  const openDrillItem = useCallback(() => {
    const s = store.getState();
    if (!s.openGroup) return;
    const list = groups[s.openGroup]?.items ?? [];
    const p = list[s.itemIndexByGroup[s.openGroup] ?? 0];
    if (!p?.link) return;
    play("enter");
    if (p.internal) navigate(p.link);
    else window.open(p.link, "_blank", "noopener,noreferrer");
  }, [store, groups, navigate, play]);

  const { onWheel, onTouchStart, onTouchEnd } = useMenuInput({ activate, openDrillItem });

  return (
    <div
      className={`${styles.root} ${theme === "dark" ? styles.rootDark : styles.rootLight}`}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <motion.div {...fadeIn(0, 0.7)}>
        <Wave />
      </motion.div>
      <Backdrop />

      <motion.div {...fadeIn(0.45)}>
        <Wordmark text={wordmark} />
      </motion.div>
      <motion.div {...fadeIn(0.7)}>
        <Clock />
      </motion.div>

      {/* thumbnails persist across preview -> drill-in so they just slide over */}
      <AnimatePresence>
        {thumbGroup && <ThumbnailStrip key={thumbGroup} groupId={thumbGroup} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {openGroup ? (
          <DrillColumn key="drill" groupId={openGroup} />
        ) : (
          <motion.div key="normal">
            <motion.div {...fadeIn(0.95)}>
              <CategoryBar />
            </motion.div>
            <motion.div {...fadeIn(1.2)}>
              <ItemColumn onActivate={activate} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {colorOpen && <ColorPicker />}
    </div>
  );
}
