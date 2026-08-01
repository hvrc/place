// All of the menu's layout numbers in one place. Kept identical to the original
// hard-coded values so the layout is pixel-for-pixel unchanged; centralising
// them here is the single seam to make the menu responsive later.

// ── category row (the sideways menu) ──────────────────────────────────────
export const CATEGORY_SPACING = 196;
/** Horizontal position of the active category / item column (the XMB pivot). */
export const PIVOT_LEFT = "14%";
/** Vertical position of the category row. Items above the active one scroll up past this line. */
export const CATEGORY_TOP_VH = 22;
/** Focus (highlighted) icon height for the category row, per PSP proportions. */
export const CATEGORY_ICON_SIZE = 88;
/** Nudge the top-aligned category icon onto the ITEM_SPACING grid (item icons are
 *  centered in a 122px row). Keeps every vertical gap equal. */
export const CATEGORY_GRID_NUDGE = 122 / 2 - CATEGORY_ICON_SIZE / 2;

// ── item column (the up/down menu) ────────────────────────────────────────
/** Focus (highlighted) icon height for first-level items. */
export const ITEM_ICON_SIZE = 76;
export const ITEM_SPACING = 122;
/** Extra room below the category label before the first sub-item. */
export const FIRST_ITEM_GAP = 18;
/** Fixed icon cell; independent of category spacing so labels stay close to the icon. */
export const ITEM_ICON_CELL = 104;
/** Shift the row so the icon centers on the same axis as the active category icon. */
export const ROW_PAD_LEFT = CATEGORY_SPACING / 2 - ITEM_ICON_CELL / 2;
/** Left edge of an item's note — just clear of the item label beside it. */
export const NOTE_LEFT = "38%";

// ── drill-in (tree submenu + thumbnail strip) ─────────────────────────────
export const SIDE_LEFT = "5%";
/** Common cell width so every side icon centers on the same vertical axis. */
export const SIDE_CELL = 88;
/** Drill-in resting position of the thumbnail column. */
export const COL_LEFT = "16%";
export const THUMB_W = 132;
export const THUMB_H = 74;
/** Constant gap in both preview and drilled states; wide enough that the
 *  enlarged active thumbnail still clears its neighbours. */
export const THUMB_SPACING = 118;
export const THUMB_ACTIVE_SCALE = 1.9;
export const THUMB_META_LEFT = THUMB_W * THUMB_ACTIVE_SCALE + 22;
/** Breathing room left between the title rule and the right edge of the screen. */
export const RULE_GAP_RIGHT = 24;
