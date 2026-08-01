import { createStore, type StoreApi } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { themeForColor, type Theme } from "@engine/settings/palette";
import type { MenuModel } from "@engine/model/types";
import { clamp } from "@engine/lib/browser";

export type { Theme };

export interface MenuSettings {
  theme: Theme;
  /** 0-100; higher means less wheel/swipe travel per move. */
  scrollSensitivity: number;
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

  openDrill: (id: string) => void;
  closeDrill: () => void;
  moveInDrill: (dir: -1 | 1) => boolean;
  setInDrill: (index: number) => void;

  /** Which of the focused leaf's actions (open / github) is highlighted. */
  drillActionIndex: number;
  moveDrillAction: (dir: -1 | 1) => boolean;
  setDrillAction: (index: number) => void;
  /** The focused leaf's action targets, in the order they're shown. */
  drillActionTargets: () => string[];

  cycleUiVolume: () => void;
  cycleScrollSensitivity: () => void;

  openColor: () => void;
  closeColor: () => void;
  moveColor: (dir: -1 | 1) => boolean;
  setColor: (index: number) => void;
}

/** 0, 10, 20 … 100 */
/**
 * Scroll sensitivity, as a percentage of the way from the laziest step to the
 * quickest (see SCROLL_STEP_PX in the input hook). 60 is where the fixed value
 * used to sit, so the default feel is unchanged.
 */
const SENSITIVITY_STEPS = [20, 40, 60, 80, 100];
const nextSensitivity = (v: number) => {
  const i = SENSITIVITY_STEPS.indexOf(v);
  if (i === -1) return SENSITIVITY_STEPS.find((s) => s > v) ?? SENSITIVITY_STEPS[0];
  return SENSITIVITY_STEPS[(i + 1) % SENSITIVITY_STEPS.length];
};

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
          uiVolume: 20,
          scrollSensitivity: 60,
        },

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

            // off the end of the column: carry on into the neighbouring category
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
            // a different leaf has its own actions: start back at the first
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

        cycleScrollSensitivity: () =>
          set((s) => ({
            settings: {
              ...s.settings,
              scrollSensitivity: nextSensitivity(s.settings.scrollSensitivity),
            },
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
        /**
         * Bumped whenever a stored value stops being meaningful: without it,
         * `merge` below spreads the old value over the new default and the
         * default can never take effect for anyone who has visited before.
         *
         * v1: the UI volume default moved 50 -> 20 and the steps moved to tens,
         * so anything saved under v0 is either the old default or off the new
         * grid entirely (25, 75). Drop just that key; colour and theme are the
         * visitor's own choices and are kept.
         */
        version: 1,
        migrate: (persisted, version) => {
          const p = { ...(persisted as { settings?: Partial<MenuSettings> } | null) };
          // a value stored before versioning existed comes back as undefined
          if ((version ?? 0) < 1 && p.settings) {
            const settings = { ...p.settings };
            delete settings.uiVolume;
            return { ...p, settings };
          }
          return p;
        },
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
