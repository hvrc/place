// The generic cross-media-bar menu model. This is what a *frontend* produces
// (e.g. the PSP frontend maps portfolio content into this shape). The engine
// knows nothing about portfolios, projects, experience, etc.: only this model.

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

export interface MenuAction {
  type: "route" | "external";
  target: string;
}

/** A built-in control an item opens instead of navigating away. */
export type SettingControl = "color" | "volume";

/** A leaf inside a drill-in group (rendered as the thumbnail strip). */
export interface DrillItem {
  id: string;
  title: string;
  tech?: string;
  media?: MenuMedia;
  /** opened on activate (shown as "▶ open") */
  link?: string;
  internal?: boolean;
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
  /** primary action on activate (route / external) */
  action?: MenuAction;
  /** opens a settings control on activate */
  setting?: SettingControl;
  /** dwell backdrop shown when this item is focused */
  backdrop?: BackdropSpec | null;
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
