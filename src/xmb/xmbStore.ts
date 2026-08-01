import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { categories } from "@/xmb/xmbData";
import { groupProjects, type ProjectGroupId } from "@/xmb/projectsMenu";

export type Theme = "dark" | "light";

/** hex "RRGGBB" -> {h, s, l} (h 0-360, s/l 0-100). */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const n = parseInt(hex, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Perceptual brightness 0-255. */
function luminance(hex: string): number {
  const n = parseInt(hex, 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
}
/** VIBGYOR band index (violet -> indigo/blue -> green -> yellow -> orange -> red). */
function vibgyorBand(hue: number): number {
  if (hue >= 250 && hue < 340) return 0; // violet / indigo
  if (hue >= 160 && hue < 250) return 1; // blue
  if (hue >= 70 && hue < 160) return 2; // green
  if (hue >= 45 && hue < 70) return 3; // yellow
  if (hue >= 15 && hue < 45) return 4; // orange
  return 5; // red / pink  (>=340 or <15)
}
/** A colour drives dark mode when it's dark, light mode when it's light. */
export function themeForColor(hex: string): Theme {
  return luminance(hex) < 128 ? "dark" : "light";
}

// the only colours (curated), auto-organised below
const RAW_WAVE_COLORS: string[] = [
  "7C3030", "722F37", "9A2A2A", "D2042D", "C04000", "FF7518", "F08000",
  "F28C28", "FFA500", "FFAA33", "FA5F55", "E3735E", "FA8072", "F89880", "E37383",
  "FFC0CB", "808000", "C9CC3F", "DFFF00", "FFBF00", "F0E68C", "FFFF8F", "C19A6B",
  "C4A484", "C2B280", "FFE5B4", "FAD5A5", "F5DEB3", "F3E5AB", "FFFDD0", "483C32",
  "5C4033", "834333", "6F4E37", "967969", "454B1B", "8A9A5B", "93C572", "C1E1C1",
  "ECFFDC", "1434A4", "6495ED", "CCCCFF", "CBC3E3", "343434",
];

// VIBGYOR band, then the pure/punchy hues (saturated and not washed-out) lead
// the band before the pale + muted/earthy tones, each ramped dark->light. This
// keeps e.g. the true oranges reading as ORANGE instead of being diluted by
// tans, khakis and pale peaches of the same hue.
const isPure = (c: { s: number; l: number }) => (c.s >= 55 && c.l <= 72 ? 0 : 1);
const byVibgyor = (a: string, b: string) => {
  const ha = hexToHsl(a);
  const hb = hexToHsl(b);
  return vibgyorBand(ha.h) - vibgyorBand(hb.h) || isPure(ha) - isPure(hb) || ha.l - hb.l;
};
/** Dark colours (VIBGYOR) then light colours (VIBGYOR) — dark to light overall. */
export const WAVE_PALETTE: string[] = [
  ...RAW_WAVE_COLORS.filter((h) => luminance(h) < 128).sort(byVibgyor),
  ...RAW_WAVE_COLORS.filter((h) => luminance(h) >= 128).sort(byVibgyor),
];

const DEFAULT_WAVE = Math.max(0, WAVE_PALETTE.indexOf("E37383")); // rose

export interface XmbSettings {
  theme: Theme;
  waveIndex: number; // index into WAVE_PALETTE
  uiVolume: number; // 0-100
  musicVolume: number; // 0-100 (no music source yet)
}

const VOLUME_STEPS = [0, 25, 50, 75, 100];
const nextVolume = (v: number) => {
  const i = VOLUME_STEPS.indexOf(v);
  return VOLUME_STEPS[i === -1 ? 2 : (i + 1) % VOLUME_STEPS.length];
};

interface XmbState {
  categoryIndex: number;
  /** Remembered item position per category (like the real XMB columns). */
  itemIndexByCategory: Record<number, number>;
  settings: XmbSettings;

  /** When set, the Projects "games menu" for this group is open (drilled in). */
  openGroup: ProjectGroupId | null;
  /** Remembered selected project per group. */
  projectIndexByGroup: Record<string, number>;

  /** Whether the wave-colour picker (right-side swatches) is open. */
  colorOpen: boolean;

  /** move functions return whether the selection actually changed (false at ends) */
  moveCategory: (dir: -1 | 1) => boolean;
  moveItem: (dir: -1 | 1) => boolean;
  setCategory: (index: number) => void;
  setItem: (index: number) => void;
  currentItemIndex: () => number;

  openProjectGroup: (id: ProjectGroupId) => void;
  closeProjectGroup: () => void;
  moveProject: (dir: -1 | 1) => boolean;
  setProject: (index: number) => void;
  currentProjectIndex: () => number;

  cycleTheme: () => void;
  cycleUiVolume: () => void;
  cycleMusicVolume: () => void;

  openColor: () => void;
  closeColor: () => void;
  moveColor: (dir: -1 | 1) => boolean;
  setColor: (index: number) => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const useXmb = create<XmbState>()(
  persist(
    (set, get) => ({
      categoryIndex: 0,
      itemIndexByCategory: {},
      openGroup: null,
      projectIndexByGroup: {},
      colorOpen: false,
      settings: {
        theme: themeForColor(WAVE_PALETTE[DEFAULT_WAVE]),
        waveIndex: DEFAULT_WAVE,
        uiVolume: 50,
        musicVolume: 50,
      },

      currentItemIndex: () => get().itemIndexByCategory[get().categoryIndex] ?? 0,

      moveCategory: (dir) => {
        let moved = false;
        set((s) => {
          const next = clamp(s.categoryIndex + dir, 0, categories.length - 1);
          moved = next !== s.categoryIndex;
          return { categoryIndex: next };
        });
        return moved;
      },

      moveItem: (dir) => {
        let moved = false;
        set((s) => {
          const cat = s.categoryIndex;
          const count = categories[cat].items.length;
          const current = s.itemIndexByCategory[cat] ?? 0;
          const next = clamp(current + dir, 0, count - 1);
          moved = next !== current;
          return { itemIndexByCategory: { ...s.itemIndexByCategory, [cat]: next } };
        });
        return moved;
      },

      setCategory: (index) =>
        set({ categoryIndex: clamp(index, 0, categories.length - 1) }),

      setItem: (index) =>
        set((s) => {
          const count = categories[s.categoryIndex].items.length;
          return {
            itemIndexByCategory: {
              ...s.itemIndexByCategory,
              [s.categoryIndex]: clamp(index, 0, count - 1),
            },
          };
        }),

      currentProjectIndex: () => {
        const g = get().openGroup;
        return g ? get().projectIndexByGroup[g] ?? 0 : 0;
      },

      openProjectGroup: (id) => set({ openGroup: id }),
      closeProjectGroup: () => set({ openGroup: null }),

      moveProject: (dir) => {
        let moved = false;
        set((s) => {
          if (!s.openGroup) return {};
          const count = groupProjects(s.openGroup).length;
          const current = s.projectIndexByGroup[s.openGroup] ?? 0;
          const next = clamp(current + dir, 0, count - 1);
          moved = next !== current;
          return { projectIndexByGroup: { ...s.projectIndexByGroup, [s.openGroup]: next } };
        });
        return moved;
      },

      setProject: (index) =>
        set((s) => {
          if (!s.openGroup) return {};
          const count = groupProjects(s.openGroup).length;
          return {
            projectIndexByGroup: {
              ...s.projectIndexByGroup,
              [s.openGroup]: clamp(index, 0, count - 1),
            },
          };
        }),

      cycleTheme: () =>
        set((s) => ({
          settings: { ...s.settings, theme: s.settings.theme === "dark" ? "light" : "dark" },
        })),

      openColor: () => set({ colorOpen: true }),
      closeColor: () => set({ colorOpen: false }),

      moveColor: (dir) => {
        let moved = false;
        set((s) => {
          const next = clamp(s.settings.waveIndex + dir, 0, WAVE_PALETTE.length - 1);
          moved = next !== s.settings.waveIndex;
          return {
            settings: { ...s.settings, waveIndex: next, theme: themeForColor(WAVE_PALETTE[next]) },
          };
        });
        return moved;
      },

      setColor: (index) =>
        set((s) => {
          const next = clamp(index, 0, WAVE_PALETTE.length - 1);
          return {
            settings: { ...s.settings, waveIndex: next, theme: themeForColor(WAVE_PALETTE[next]) },
          };
        }),

      cycleUiVolume: () =>
        set((s) => ({ settings: { ...s.settings, uiVolume: nextVolume(s.settings.uiVolume) } })),

      cycleMusicVolume: () =>
        set((s) => ({ settings: { ...s.settings, musicVolume: nextVolume(s.settings.musicVolume) } })),
    }),
    {
      name: "xmb-settings",
      storage: createJSONStorage(() => localStorage),
      // Only persist user settings, not transient navigation position.
      partialize: (s) => ({ settings: s.settings }),
      // Deep-merge so new setting keys keep their defaults for existing users.
      merge: (persisted, current) => {
        const p = persisted as Partial<XmbState> | undefined;
        return {
          ...current,
          settings: { ...current.settings, ...(p?.settings ?? {}) },
        };
      },
    }
  )
);
