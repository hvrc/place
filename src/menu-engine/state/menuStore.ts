import { createStore, type StoreApi } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { themeForColor, type Theme } from "@menu/settings/palette";
import type { MenuModel } from "@menu/model/types";

export type { Theme };

export interface MenuSettings {
  theme: Theme;
  colorIndex: number; // index into model.palette
  uiVolume: number; // 0-100
}

export interface MenuState {
  categoryIndex: number;
  /** Remembered item position per category (like the real XMB columns). */
  itemIndexByCategory: Record<number, number>;
  settings: MenuSettings;

  /** When set, the drill-in ("games menu") for this group id is open. */
  openGroup: string | null;
  /** Remembered selected leaf per group. */
  itemIndexByGroup: Record<string, number>;

  /** Whether the wave-colour picker (right-side swatches) is open. */
  colorOpen: boolean;

  /** move functions return whether the selection actually changed (false at ends). */
  moveCategory: (dir: -1 | 1) => boolean;
  moveItem: (dir: -1 | 1) => boolean;
  setCategory: (index: number) => void;
  setItem: (index: number) => void;
  currentItemIndex: () => number;

  openDrill: (id: string) => void;
  closeDrill: () => void;
  moveInDrill: (dir: -1 | 1) => boolean;
  setInDrill: (index: number) => void;
  currentDrillIndex: () => number;

  cycleUiVolume: () => void;

  openColor: () => void;
  closeColor: () => void;
  moveColor: (dir: -1 | 1) => boolean;
  setColor: (index: number) => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const VOLUME_STEPS = [0, 25, 50, 75, 100];
const nextVolume = (v: number) => {
  const i = VOLUME_STEPS.indexOf(v);
  return VOLUME_STEPS[i === -1 ? 2 : (i + 1) % VOLUME_STEPS.length];
};

/**
 * Build a navigation store bound to a specific menu model. Each frontend creates
 * its own instance; the logic is entirely generic (categories, items, drill-in
 * groups, wave colour, volume). Settings persist to localStorage.
 */
export function createMenuStore(model: MenuModel): StoreApi<MenuState> {
  const { categories, groups, palette, defaultColorHex } = model;
  const groupItems = (id: string) => groups[id]?.items ?? [];
  const defaultColor = Math.max(0, palette.indexOf(defaultColorHex ?? palette[0]));

  return createStore<MenuState>()(
    persist(
      (set, get) => ({
        categoryIndex: 0,
        itemIndexByCategory: {},
        openGroup: null,
        itemIndexByGroup: {},
        colorOpen: false,
        settings: {
          theme: themeForColor(palette[defaultColor]),
          colorIndex: defaultColor,
          uiVolume: 50,
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

        setCategory: (index) => set({ categoryIndex: clamp(index, 0, categories.length - 1) }),

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

        currentDrillIndex: () => {
          const g = get().openGroup;
          return g ? get().itemIndexByGroup[g] ?? 0 : 0;
        },

        openDrill: (id) => set({ openGroup: id }),
        closeDrill: () => set({ openGroup: null }),

        moveInDrill: (dir) => {
          let moved = false;
          set((s) => {
            if (!s.openGroup) return {};
            const count = groupItems(s.openGroup).length;
            const current = s.itemIndexByGroup[s.openGroup] ?? 0;
            const next = clamp(current + dir, 0, count - 1);
            moved = next !== current;
            return { itemIndexByGroup: { ...s.itemIndexByGroup, [s.openGroup]: next } };
          });
          return moved;
        },

        setInDrill: (index) =>
          set((s) => {
            if (!s.openGroup) return {};
            const count = groupItems(s.openGroup).length;
            return {
              itemIndexByGroup: {
                ...s.itemIndexByGroup,
                [s.openGroup]: clamp(index, 0, count - 1),
              },
            };
          }),

        cycleUiVolume: () =>
          set((s) => ({ settings: { ...s.settings, uiVolume: nextVolume(s.settings.uiVolume) } })),

        openColor: () => set({ colorOpen: true }),
        closeColor: () => set({ colorOpen: false }),

        moveColor: (dir) => {
          let moved = false;
          set((s) => {
            const next = clamp(s.settings.colorIndex + dir, 0, palette.length - 1);
            moved = next !== s.settings.colorIndex;
            return {
              settings: { ...s.settings, colorIndex: next, theme: themeForColor(palette[next]) },
            };
          });
          return moved;
        },

        setColor: (index) =>
          set((s) => {
            const next = clamp(index, 0, palette.length - 1);
            return {
              settings: { ...s.settings, colorIndex: next, theme: themeForColor(palette[next]) },
            };
          }),
      }),
      {
        name: "xmb-settings",
        storage: createJSONStorage(() => localStorage),
        // Only persist user settings, not transient navigation position.
        partialize: (s) => ({ settings: s.settings }),
        // Deep-merge so new setting keys keep their defaults for existing users;
        // migrate the pre-refactor `waveIndex` key to `colorIndex`.
        merge: (persisted, current) => {
          const p = persisted as { settings?: Partial<MenuSettings> & { waveIndex?: number } } | undefined;
          const ps = { ...(p?.settings ?? {}) };
          if (ps.waveIndex != null && ps.colorIndex == null) ps.colorIndex = ps.waveIndex;
          delete ps.waveIndex;
          return { ...current, settings: { ...current.settings, ...ps } };
        },
      }
    )
  );
}
