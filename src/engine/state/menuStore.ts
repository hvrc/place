import { createStore, type StoreApi } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { themeForColor, type Theme } from "@engine/settings/palette";
import type { MenuModel } from "@engine/model/types";

export type { Theme };

/** `soft` upscales low-res PSP art and blurs the type, as the handheld did;
 *  `crisp` renders Google icons and text at native resolution. */
export type Fidelity = "soft" | "crisp";

export interface MenuSettings {
  theme: Theme;
  fidelity: Fidelity;
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
  /**
   * Vertical move that spills over: past the end of a column it steps to the
   * neighbouring category and lands on that column's near edge, so the whole
   * menu reads as one continuous chain. Reports which axis actually moved
   * (null at the very first/last item of the menu).
   */
  moveItem: (dir: -1 | 1) => "item" | "category" | null;
  setCategory: (index: number) => void;
  setItem: (index: number) => void;
  currentItemIndex: () => number;

  openDrill: (id: string) => void;
  closeDrill: () => void;
  moveInDrill: (dir: -1 | 1) => boolean;
  setInDrill: (index: number) => void;
  currentDrillIndex: () => number;

  /** Which of the focused leaf's actions (open / github) is highlighted. */
  drillActionIndex: number;
  moveDrillAction: (dir: -1 | 1) => boolean;
  setDrillAction: (index: number) => void;
  /** The focused leaf's action targets, in the order they're shown. */
  drillActionTargets: () => string[];

  cycleUiVolume: () => void;
  cycleFidelity: () => void;

  openColor: () => void;
  closeColor: () => void;
  moveColor: (dir: -1 | 1) => boolean;
  setColor: (index: number) => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** 0, 10, 20 … 100 */
const VOLUME_STEPS = Array.from({ length: 11 }, (_, i) => i * 10);
const nextVolume = (v: number) => {
  // round an off-grid value (e.g. a 25 persisted before the steps changed) up
  // to the next one on the grid rather than snapping back to the default
  const i = VOLUME_STEPS.indexOf(v);
  if (i === -1) return VOLUME_STEPS.find((s) => s > v) ?? VOLUME_STEPS[0];
  return VOLUME_STEPS[(i + 1) % VOLUME_STEPS.length];
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
          fidelity: "soft",
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
          let moved: "item" | "category" | null = null;
          set((s) => {
            const cat = s.categoryIndex;
            const count = categories[cat].items.length;
            const current = s.itemIndexByCategory[cat] ?? 0;
            const next = current + dir;

            if (next >= 0 && next < count) {
              moved = "item";
              return { itemIndexByCategory: { ...s.itemIndexByCategory, [cat]: next } };
            }

            // off the end of the column — carry on into the neighbouring category
            const nextCat = cat + dir;
            if (nextCat < 0 || nextCat >= categories.length) return {};
            moved = "category";
            const nextCount = categories[nextCat].items.length;
            // enter from the edge we arrived at: top when descending, bottom when climbing
            const landing = dir === 1 ? 0 : Math.max(0, nextCount - 1);
            return {
              categoryIndex: nextCat,
              itemIndexByCategory: { ...s.itemIndexByCategory, [nextCat]: landing },
            };
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

        openDrill: (id) => set({ openGroup: id, drillActionIndex: 0 }),
        closeDrill: () => set({ openGroup: null, drillActionIndex: 0 }),

        moveInDrill: (dir) => {
          let moved = false;
          set((s) => {
            if (!s.openGroup) return {};
            const count = groupItems(s.openGroup).length;
            const current = s.itemIndexByGroup[s.openGroup] ?? 0;
            const next = clamp(current + dir, 0, count - 1);
            moved = next !== current;
            // a different leaf has its own actions — start back at the first
            return {
              itemIndexByGroup: { ...s.itemIndexByGroup, [s.openGroup]: next },
              drillActionIndex: 0,
            };
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
              drillActionIndex: 0,
            };
          }),

        drillActionIndex: 0,

        drillActionTargets: () => {
          const s = get();
          if (!s.openGroup) return [];
          const leaf = groupItems(s.openGroup)[s.itemIndexByGroup[s.openGroup] ?? 0];
          return [leaf?.link, leaf?.github].filter(Boolean) as string[];
        },

        setDrillAction: (index) =>
          set(() => ({
            drillActionIndex: clamp(index, 0, Math.max(0, get().drillActionTargets().length - 1)),
          })),

        moveDrillAction: (dir) => {
          let moved = false;
          set((s) => {
            const count = get().drillActionTargets().length;
            const next = clamp(s.drillActionIndex + dir, 0, Math.max(0, count - 1));
            moved = next !== s.drillActionIndex;
            return { drillActionIndex: next };
          });
          return moved;
        },

        cycleFidelity: () =>
          set((s) => ({
            settings: { ...s.settings, fidelity: s.settings.fidelity === "soft" ? "crisp" : "soft" },
          })),

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
