// The generic cross-media-bar menu model. This is what a *frontend* produces
// (e.g. the PSP frontend maps portfolio content into this shape). The engine
// knows nothing about portfolios, projects, experience, etc. — only this model.

export interface MenuMedia {
  type: "image" | "video";
  src: string;
  poster?: string;
  alt?: string;
}

/** What to fade in behind the menu while an item is focused (the dwell backdrop). */
export interface BackdropSpec {
  /** embeddable URL or same-origin route */
  link?: string;
  media?: MenuMedia;
  /** render as a centered card (a post) rather than fullscreen */
  contain?: boolean;
}

/**
 * Free text set beside the item column while an item is focused. `lead` runs
 * inline and `lines` stack to its right, so a shared opener reads into each
 * line ("<name> is a" → "Photoshop GOAT" / "Ableton GOAT" / …).
 */
export interface MenuNote {
  lead?: string;
  lines: string[];
  /** Words swapped through the `{}` slot in a line, one at a time, forever. */
  cycle?: string[];
  /** How long each cycled word is held (ms). */
  cycleMs?: number;
}

/** The slot a MenuNote's cycled words are swapped into. */
export const NOTE_SLOT = "{}";

export interface MenuAction {
  type: "route" | "external" | "copy";
  target: string;
  /** for `copy`: the confirmation that briefly replaces the item's note */
  done?: string;
}

/** A built-in control an item opens instead of navigating away. */
export type SettingControl = "color" | "volume";

/** A leaf inside a drill-in group (rendered as the thumbnail strip). */
export interface DrillItem {
  id: string;
  title: string;
  /** one-line summary, set between the title and its rule */
  blurb?: string;
  media?: MenuMedia;
  /** opened on activate (shown as "▶ open"); always in a new tab */
  link?: string;
  /** source repo, shown as "▶ github" beside the open hint */
  github?: string;
  /** dwell backdrop when this leaf is focused */
  backdrop?: BackdropSpec | null;
}

/** A drill-in group: a tree branch reached from a category item. */
export interface DrillGroup {
  id: string;
  label: string;
  icon: string;
  items: DrillItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  sub?: string;
  icon: string;
  /** opens a drill-in group (tree submenu) */
  drillId?: string;
  /** primary action on activate (route / external / copy) */
  action?: MenuAction;
  /** opens a settings control on activate */
  setting?: SettingControl;
  /** dwell backdrop shown when this item is focused */
  backdrop?: BackdropSpec | null;
  /** text set in the open area right of the column while this item is focused */
  note?: MenuNote;
}

export interface MenuCategory {
  id: string;
  label: string;
  icon: string;
  items: MenuItem[];
}

/** The complete input to the menu engine. */
export interface MenuModel {
  categories: MenuCategory[];
  /** drill-in groups keyed by their id (referenced by MenuItem.drillId) */
  groups: Record<string, DrillGroup>;
  /** ordered wave-colour swatches (hex, no leading #) */
  palette: string[];
  /** default wave colour (hex, no #) for a fresh visitor */
  defaultColorHex?: string;
}
