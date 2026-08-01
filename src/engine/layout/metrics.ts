import { useSyncExternalStore } from "react";
import { clamp } from "@engine/lib/browser";

// All of the menu's layout numbers in one place, derived from the viewport.
// The values inside metricsFor are the design they were tuned at; everything
// scales off it, so the same cross-media-bar layout holds phone to desktop.

/** The viewport these numbers were originally tuned against. */
const DESIGN_W = 1180;
const DESIGN_H = 760;
/** Never shrink past this: smaller and the icons stop reading as icons. */
const MIN_SCALE = 0.5;
/** Under this width the note can't sit beside the column, so the menu rearranges. */
const COMPACT_W = 720;
/**
 * Above that width the menu is drawn this much smaller than the design: it
 * reads better dense, and this is the same look as viewing it at 67% browser
 * zoom. Browser zoom shrinks the px layout AND the rem type together, so this
 * has to do both: metricsFor folds it into `scale`, and MenuShell applies the
 * matching root font-size. Phones are left at 1: they're already at MIN_SCALE
 * and any denser is unreadable.
 */
const DENSITY = 0.67;

/** Soft-focus blur at full size, in px. */
const SOFT_BLUR = 0.45;

/**
 * Soft-focus radius at a given layout scale, for the callers that build a
 * filter string themselves. Phones don't scale this down: they drop the
 * filter altogether (see --soft-text in globals.css), because the softness
 * there comes from how a filtered layer is rasterised, not from the radius.
 */
export function softBlurPx(scale: number): number {
  return SOFT_BLUR * scale;
}

export interface Metrics {
  /** px multiplier applied to the design values (1 at or above the design size) */
  scale: number;
  /** how much smaller than the design the menu is drawn: see DENSITY. The rem
   *  type has to follow this or it won't match the px layout. */
  density: number;
  /** narrow screen: the note moves out from beside the item column */
  compact: boolean;

  // ── category row (the sideways menu) ────────────────────────────────────
  CATEGORY_SPACING: number;
  /** Horizontal position of the active category / item column (the XMB pivot). */
  PIVOT_LEFT: string;
  /** Vertical position of the category row. Items above it scroll up past this line. */
  CATEGORY_TOP_VH: number;
  /** Focus (highlighted) icon height for the category row, per PSP proportions. */
  CATEGORY_ICON_SIZE: number;
  /** Nudge the top-aligned category icon onto the ITEM_SPACING grid, so every
   *  vertical gap stays equal. */
  CATEGORY_GRID_NUDGE: number;
  /** Top of the category row: the line the sideways menu sits on. */
  CATEGORY_TOP: string;
  /** Top of the focused item's row: one full row below the category line. The
   *  two together are what make the cross line up, so both are named here
   *  rather than re-derived per component. */
  PIVOT_TOP: string;

  // ── item column (the up/down menu) ──────────────────────────────────────
  /** Focus (highlighted) icon height for first-level items. */
  ITEM_ICON_SIZE: number;
  ITEM_SPACING: number;
  /** Extra room below the category label before the first sub-item. Wider on a
   *  phone, where the design gap leaves label and item almost touching. */
  FIRST_ITEM_GAP: number;
  /** Fixed icon cell; independent of category spacing so labels stay close to the icon. */
  ITEM_ICON_CELL: number;
  /** Shift the row so the icon centers on the same axis as the active category icon. */
  ROW_PAD_LEFT: number;

  // ── drill-in (tree submenu + thumbnail strip) ───────────────────────────
  SIDE_LEFT: string;
  /** Common cell width so every side icon centers on the same vertical axis. */
  SIDE_CELL: number;
  /** Drill-in resting position of the thumbnail column. */
  COL_LEFT: string;
  THUMB_W: number;
  THUMB_H: number;
  /** Constant gap in both preview and drilled states; wide enough that the
   *  enlarged active thumbnail still clears its neighbours. */
  THUMB_SPACING: number;
  THUMB_ACTIVE_SCALE: number;
  THUMB_META_LEFT: number;
  /** Breathing room left between the title rule and the right edge of the screen. */
  RULE_GAP_RIGHT: number;
}

/**
 * How much a row recedes with distance from the focused one. Every column in
 * the menu fades this way; they differ only in how bright the nearest rows are
 * (`top`) and how far back the furthest go (`floor`).
 */
export function rowFade(offset: number, top: number, floor: number, step = 0.12): number {
  return Math.max(floor, top - Math.abs(offset) * step);
}

/** Resolve a metric length ("14%" or "61px") against a viewport width. */
export function lengthToPx(value: string, width: number): number {
  return value.trim().endsWith("%") ? (parseFloat(value) / 100) * width : parseFloat(value);
}

function metricsFor(w: number, h: number): Metrics {
  const compact = w < COMPACT_W;
  const density = compact ? 1 : DENSITY;
  const fit = Math.min(Math.min(w / DESIGN_W, h / DESIGN_H), 1);
  // floor AFTER density, or a small tablet ends up drawn smaller than a phone
  const scale = clamp(fit * density, MIN_SCALE, 1);
  const px = (n: number) => Math.round(n * scale);

  const CATEGORY_SPACING = px(196);
  const CATEGORY_ICON_SIZE = px(88);
  // phones get more air between rows: at half scale the desktop grid packs the
  // labels tight enough to read as one block
  const ITEM_SPACING = Math.round(px(122) * (compact ? 1.3 : 1));
  const ITEM_ICON_CELL = px(104);
  const THUMB_W = px(132);
  const CATEGORY_TOP_VH = compact ? 17 : 22;
  const FIRST_ITEM_GAP = compact ? px(46) : px(18);
  // the blown-up thumbnail has to leave room for the title beside it
  const THUMB_ACTIVE_SCALE = compact ? 1.5 : 1.9;

  return {
    scale,
    density,
    compact,

    CATEGORY_SPACING,
    // half a cell in, so the previous category's icon always peeks in at the
    // left edge rather than vanishing entirely
    PIVOT_LEFT: compact ? `${CATEGORY_SPACING / 2 + 6}px` : "14%",
    CATEGORY_TOP_VH,
    CATEGORY_ICON_SIZE,
    CATEGORY_GRID_NUDGE: ITEM_SPACING / 2 - CATEGORY_ICON_SIZE / 2,
    CATEGORY_TOP: `calc(${CATEGORY_TOP_VH}vh + ${ITEM_SPACING / 2 - CATEGORY_ICON_SIZE / 2}px)`,
    PIVOT_TOP: `calc(${CATEGORY_TOP_VH}vh + ${ITEM_SPACING + FIRST_ITEM_GAP}px)`,

    ITEM_ICON_SIZE: px(76),
    ITEM_SPACING,
    FIRST_ITEM_GAP,
    ITEM_ICON_CELL,
    ROW_PAD_LEFT: CATEGORY_SPACING / 2 - ITEM_ICON_CELL / 2,

    SIDE_LEFT: "5%",
    SIDE_CELL: px(88),
    // well clear of the drill-in side icons, which run to about SIDE_LEFT + SIDE_CELL
    COL_LEFT: compact ? "32%" : "16%",
    THUMB_W,
    THUMB_H: px(74),
    THUMB_SPACING: px(118),
    THUMB_ACTIVE_SCALE,
    THUMB_META_LEFT: THUMB_W * THUMB_ACTIVE_SCALE + px(22),
    RULE_GAP_RIGHT: px(24),
  };
}

// ── one shared snapshot, so every component resizes off a single listener ──

let snapshot = metricsFor(
  typeof window === "undefined" ? DESIGN_W : window.innerWidth,
  typeof window === "undefined" ? DESIGN_H : window.innerHeight
);
const listeners = new Set<() => void>();
let bound = false;

function recompute() {
  const next = metricsFor(window.innerWidth, window.innerHeight);
  // identity has to stay stable between real changes or useSyncExternalStore loops
  if (next.scale === snapshot.scale && next.compact === snapshot.compact) return;
  snapshot = next;
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  if (!bound && typeof window !== "undefined") {
    window.addEventListener("resize", recompute);
    window.addEventListener("orientationchange", recompute);
    bound = true;
  }
  return () => void listeners.delete(fn);
}

/**
 * The layout numbers for the current viewport. Destructure the ones you need ,
 * the names match the design constants they scale from.
 */
const getSnapshot = () => snapshot;

export function useMetrics(): Metrics {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
