import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { categories } from "@/xmb/xmbData";
import { groupProjects, type ProjectGroupId } from "@/xmb/projectsMenu";

export type Theme = "dark" | "light";

export interface XmbSettings {
  theme: Theme;
  waveHue: number; // 0-360
  uiVolume: number; // 0-100
  musicVolume: number; // 0-100 (no music source yet)
  reduceMotion: boolean;
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

  moveCategory: (dir: -1 | 1) => void;
  moveItem: (dir: -1 | 1) => void;
  setCategory: (index: number) => void;
  setItem: (index: number) => void;
  currentItemIndex: () => number;

  openProjectGroup: (id: ProjectGroupId) => void;
  closeProjectGroup: () => void;
  moveProject: (dir: -1 | 1) => void;
  setProject: (index: number) => void;
  currentProjectIndex: () => number;

  cycleTheme: () => void;
  cycleWaveHue: (dir: -1 | 1) => void;
  cycleUiVolume: () => void;
  cycleMusicVolume: () => void;
  toggleReduceMotion: () => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const useXmb = create<XmbState>()(
  persist(
    (set, get) => ({
      categoryIndex: 0,
      itemIndexByCategory: {},
      openGroup: null,
      projectIndexByGroup: {},
      settings: {
        theme: "dark",
        waveHue: 205, // classic PSP blue
        uiVolume: 50,
        musicVolume: 50,
        reduceMotion:
          typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
      },

      currentItemIndex: () => get().itemIndexByCategory[get().categoryIndex] ?? 0,

      moveCategory: (dir) =>
        set((s) => ({
          categoryIndex: clamp(s.categoryIndex + dir, 0, categories.length - 1),
        })),

      moveItem: (dir) =>
        set((s) => {
          const cat = s.categoryIndex;
          const count = categories[cat].items.length;
          const current = s.itemIndexByCategory[cat] ?? 0;
          const next = clamp(current + dir, 0, count - 1);
          return { itemIndexByCategory: { ...s.itemIndexByCategory, [cat]: next } };
        }),

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

      moveProject: (dir) =>
        set((s) => {
          if (!s.openGroup) return {};
          const count = groupProjects(s.openGroup).length;
          const current = s.projectIndexByGroup[s.openGroup] ?? 0;
          const next = clamp(current + dir, 0, count - 1);
          return { projectIndexByGroup: { ...s.projectIndexByGroup, [s.openGroup]: next } };
        }),

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

      cycleWaveHue: (dir) =>
        set((s) => ({
          settings: { ...s.settings, waveHue: (s.settings.waveHue + dir * 30 + 360) % 360 },
        })),

      cycleUiVolume: () =>
        set((s) => ({ settings: { ...s.settings, uiVolume: nextVolume(s.settings.uiVolume) } })),

      cycleMusicVolume: () =>
        set((s) => ({ settings: { ...s.settings, musicVolume: nextVolume(s.settings.musicVolume) } })),

      toggleReduceMotion: () =>
        set((s) => ({ settings: { ...s.settings, reduceMotion: !s.settings.reduceMotion } })),
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
