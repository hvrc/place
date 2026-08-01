import { useCallback } from "react";
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

/**
 * The full cross-media-bar menu: ambient chrome (wave/clock/wordmark), the
 * category bar + item column, the drill-in tree + thumbnail strip, the dwell
 * backdrop and the colour picker. Entirely driven by the model from context.
 */
export function MenuShell({ wordmark }: { wordmark: string }) {
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
      <Wave />
      <Backdrop />

      <Wordmark text={wordmark} />
      <Clock />

      {/* thumbnails persist across preview -> drill-in so they just slide over */}
      <AnimatePresence>
        {thumbGroup && <ThumbnailStrip key={thumbGroup} groupId={thumbGroup} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {openGroup ? (
          <DrillColumn key="drill" groupId={openGroup} />
        ) : (
          <motion.div key="normal">
            <CategoryBar />
            <ItemColumn onActivate={activate} />
          </motion.div>
        )}
      </AnimatePresence>

      {colorOpen && <ColorPicker />}
    </div>
  );
}
