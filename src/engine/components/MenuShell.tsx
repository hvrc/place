import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMenu, useMenuModel, useMenuStore } from "@engine/state/MenuContext";
import type { IntroStagger } from "@engine/model/types";
import { useMenuInput } from "@engine/input/useMenuInput";
import { CategoryBar } from "./CategoryBar";
import { ItemColumn } from "./ItemColumn";
import { ItemNote } from "./ItemNote";
import { DrillColumn } from "./DrillColumn";
import { ThumbnailStrip } from "./ThumbnailStrip";
import { Backdrop } from "./Backdrop";
import { Wave } from "@engine/chrome/Wave";
import { Clock } from "@engine/chrome/Clock";
import { Wordmark } from "@engine/chrome/Wordmark";
import { Hints } from "@engine/chrome/Hints";
import { ColorPicker } from "@engine/settings/ColorPicker";
import { useSound } from "@engine/sound/useSound";
import { copyText, openTab } from "@engine/lib/browser";
import { softBlurPx, useMetrics } from "@engine/layout/metrics";
import styles from "@engine/styles/menu.module.css";

// Runs once per full page load (module-scoped so SPA re-navigation doesn't
// replay it): the elements fade in in order, starting with background/wave, then wordmark, clock,
// category icons, then the columns, so the essentials appear first even if the
// rest is still loading.
let introPlayed = false;

/** How long a copy confirmation sits in place of the item's note. */
const FLASH_MS = 2000;

/**
 * The full cross-media-bar menu: ambient chrome (wave/clock/wordmark), the
 * category bar + item column, the drill-in tree + thumbnail strip, the dwell
 * backdrop and the colour picker. Entirely driven by the model from context.
 */
export function MenuShell({ wordmark }: { wordmark: string }) {
  const [introActive, setIntroActive] = useState(!introPlayed);
  const endIntro = () => {
    if (introPlayed) return;
    introPlayed = true;
    setIntroActive(false);
  };
  useEffect(() => {
    if (introPlayed) return;
    const t = setTimeout(endIntro, 1800);
    return () => clearTimeout(t);
  }, []);

  // The ONLY artificial staggering is the first-load reveal of the essentials,
  // outside-in: wave, wordmark, clock, then the category icons cascading
  // left→right, then (once the row is done) the first column's items cascading
  // top→down. An item's note rides in with its own icon (never ahead of it), and
  // the control legend brings up the rear. Everything past that appears as
  // available (no timers), in natural order.
  const catIntro: IntroStagger | null = introActive ? { base: 0.5, step: 0.08 } : null;
  const colIntro: IntroStagger | null = introActive ? { base: 1.1, step: 0.08 } : null;
  /** Last thing in: one beat after the deepest column item has landed. */
  const HINTS_DELAY = 1.7;

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
  // Transient confirmation shown in place of an item's note (e.g. after a copy).
  const [flash, setFlash] = useState<{ id: string; text: string } | null>(null);
  const flashTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const navigate = useNavigate();
  const store = useMenuStore();
  const { categories } = useMenuModel();
  const { play } = useSound();
  const { scale, compact, density } = useMetrics();

  const theme = useMenu((s) => s.settings.theme);
  const openGroup = useMenu((s) => s.openGroup);
  const colorOpen = useMenu((s) => s.colorOpen);
  const categoryIndex = useMenu((s) => s.categoryIndex);
  const itemIndex = useMenu((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);

  // Paint the whole document the menu's base colour, not just the menu. iOS
  // exposes strips past a fixed element: the safe areas, and the gap the
  // toolbar leaves as it collapses, and whatever shows there is the document's
  // background (white by default) plus the browser's own chrome, which Safari
  // tints from theme-color. Cover all three, and hand them back to the other
  // routes on the way out.
  useEffect(() => {
    const base = theme === "dark" ? "#0c0c12" : "#e9e8ef";
    const root = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previous = {
      html: root.style.background,
      body: document.body.style.background,
      meta: meta?.content,
    };

    root.style.background = base;
    document.body.style.background = base;
    if (meta) meta.content = base;

    return () => {
      root.style.background = previous.html;
      document.body.style.background = previous.body;
      if (meta && previous.meta !== undefined) meta.content = previous.meta;
    };
  }, [theme]);

  // The rem half of the layout density (see DENSITY in metrics.ts): rem is
  // root-relative by definition, so this can't be scoped with a selector: set
  // it while the menu is mounted and give it back to the other routes after.
  useEffect(() => {
    const previous = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = `${(density * 100).toFixed(2)}%`;
    return () => {
      document.documentElement.style.fontSize = previous;
    };
  }, [density]);

  // `none`, not a smaller radius, on phones: the labels that read as mushy all
  // sit inside transformed rows, and a filtered layer inside a transformed
  // ancestor is rasterised at reduced resolution and scaled, so any filter
  // costs the text its pixel density regardless of how small the blur is.
  // Set on <body> rather than .root because the project meta is portalled out
  // to <body> and so can't inherit the variable from inside the menu.
  useEffect(() => {
    const soft = compact ? "none" : `blur(${softBlurPx(scale).toFixed(2)}px)`;
    document.body.style.setProperty("--soft-text", soft);
    return () => {
      document.body.style.removeProperty("--soft-text");
    };
  }, [scale, compact]);

  // As soon as the user navigates off the initial category, stop the intro so
  // nothing is held back on a timer: content just appears as it's available.
  useEffect(() => {
    if (categoryIndex !== 0) endIntro();
  }, [categoryIndex]);

  // Thumbnails to show: the open group (drilled), or, while browsing a category
  // whose items drill in, the focused item's group (previewed).
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
      if (item.setting === "sensitivity") {
        s.cycleScrollSensitivity();
        play("enter");
        return;
      }
      if (item.action) {
        const action = item.action;
        play("enter");
        if (action.type === "copy") {
          void copyText(action.target).then(() => {
            setFlash({ id: item.id, text: action.done ?? "Copied" });
            clearTimeout(flashTimer.current);
            flashTimer.current = window.setTimeout(() => setFlash(null), FLASH_MS);
          });
        } else if (action.type === "route") navigate(action.target);
        else openTab(action.target);
      }
    },
    [store, categories, navigate, play]
  );

  // Open the focused action (open / github) of the selected drill-in leaf. Both
  // leave in a new tab, so the menu is still here when you come back.
  const openDrillItem = useCallback(() => {
    const s = store.getState();
    const target = s.drillActionTargets()[s.drillActionIndex];
    if (!target) return;
    play("enter");
    openTab(target);
  }, [store, play]);

  const { onWheel, onTouchStart, onTouchEnd } = useMenuInput({ activate, openDrillItem });

  return (
    <div
      className={`${styles.root} ${theme === "dark" ? styles.rootDark : styles.rootLight}`}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── ambient ── */}
      <motion.div {...fadeIn(0, 0.6)}>
        <Wave />
      </motion.div>
      <Backdrop />

      {/* ── frame chrome ── */}
      <motion.div {...fadeIn(0.3)}>
        <Wordmark text={wordmark} />
      </motion.div>
      <motion.div {...fadeIn(0.45)}>
        <Clock />
      </motion.div>

      {/* thumbnails persist across preview -> drill-in so they just slide over */}
      <AnimatePresence>
        {thumbGroup && <ThumbnailStrip key={thumbGroup} groupId={thumbGroup} />}
      </AnimatePresence>

      {/* ── the menu itself, and the note that belongs to the focused item ── */}
      <AnimatePresence mode="wait">
        {openGroup ? (
          <DrillColumn key="drill" groupId={openGroup} />
        ) : (
          <motion.div key="normal">
            <CategoryBar introStagger={catIntro} />
            <ItemColumn onActivate={activate} introStagger={colIntro} />
          </motion.div>
        )}
      </AnimatePresence>
      <ItemNote flash={flash} introStagger={colIntro} onActivate={activate} />

      {colorOpen && <ColorPicker />}

      {/* ── last in ── */}
      <motion.div {...fadeIn(HINTS_DELAY)}>
        <Hints />
      </motion.div>
    </div>
  );
}
