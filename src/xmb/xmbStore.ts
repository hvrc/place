import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { categories } from "@/xmb/xmbData";

export type Theme = "dark" | "light";

export interface XmbSettings {
  theme: Theme;
  waveHue: number; // 0-360
  sound: boolean;
  reduceMotion: boolean;
}

interface XmbState {
  categoryIndex: number;
  /** Remembered item position per category (like the real XMB columns). */
  itemIndexByCategory: Record<number, number>;
  settings: XmbSettings;

  moveCategory: (dir: -1 | 1) => void;
  moveItem: (dir: -1 | 1) => void;
  setCategory: (index: number) => void;
  setItem: (index: number) => void;
  currentItemIndex: () => number;

  cycleTheme: () => void;
  cycleWaveHue: (dir: -1 | 1) => void;
  toggleSound: () => void;
  toggleReduceMotion: () => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const useXmb = create<XmbState>()(
  persist(
    (set, get) => ({
      categoryIndex: 0,
      itemIndexByCategory: {},
      settings: {
        theme: "dark",
        waveHue: 205, // classic PSP blue
        sound: false,
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

      cycleTheme: () =>
        set((s) => ({
          settings: { ...s.settings, theme: s.settings.theme === "dark" ? "light" : "dark" },
        })),

      cycleWaveHue: (dir) =>
        set((s) => ({
          settings: { ...s.settings, waveHue: (s.settings.waveHue + dir * 30 + 360) % 360 },
        })),

      toggleSound: () =>
        set((s) => ({ settings: { ...s.settings, sound: !s.settings.sound } })),

      toggleReduceMotion: () =>
        set((s) => ({ settings: { ...s.settings, reduceMotion: !s.settings.reduceMotion } })),
    }),
    {
      name: "xmb-settings",
      storage: createJSONStorage(() => localStorage),
      // Only persist user settings, not transient navigation position.
      partialize: (s) => ({ settings: s.settings }),
    }
  )
);
