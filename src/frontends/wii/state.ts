import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Everything the Wii frontend remembers between visits. Kept deliberately small
// and flat: the screen stack lives in React state (it's per-visit), only the
// System Settings and the message board's read/unread marks persist.

export type ScreenAspect = "wide" | "standard";

export interface WiiSettings {
  /** Background music level, 0-100. */
  musicVolume: number;
  /** Menu sound-effect level, 0-100. */
  sfxVolume: number;
  /** Draw the Wii-remote hand instead of the OS cursor. */
  pointer: boolean;
  /** How hard the hand tilts with movement, 0-100. */
  pointerTilt: number;
  /** 16:9 or a pillarboxed 4:3, like the real Screen setting. */
  aspect: ScreenAspect;
  /** The Wii's "screen burn-in reduction": dims the menu after idling. */
  burnIn: boolean;
  /** 12- or 24-hour clock. */
  clock24: boolean;
}

export const DEFAULT_SETTINGS: WiiSettings = {
  musicVolume: 35,
  sfxVolume: 60,
  pointer: true,
  pointerTilt: 60,
  aspect: "wide",
  burnIn: true,
  clock24: false,
};

interface WiiState {
  settings: WiiSettings;
  set: <K extends keyof WiiSettings>(key: K, value: WiiSettings[K]) => void;
  reset: () => void;

  /** Letter ids already opened: drives the mail badge. */
  read: string[];
  markRead: (id: string) => void;
  markAllUnread: () => void;

  /** Channels opened this browser, newest first: the SD card's "save data". */
  visited: string[];
  visit: (id: string) => void;
}

export const useWii = create<WiiState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      set: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
      reset: () => set({ settings: DEFAULT_SETTINGS, read: [], visited: [] }),

      read: [],
      markRead: (id) => set((s) => (s.read.includes(id) ? s : { read: [...s.read, id] })),
      markAllUnread: () => set({ read: [] }),

      visited: [],
      visit: (id) => set((s) => ({ visited: [id, ...s.visited.filter((v) => v !== id)].slice(0, 24) })),
    }),
    {
      name: "wii",
      storage: createJSONStorage(() => localStorage),
      // Older saves shouldn't lose new defaults when the shape grows.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<WiiState>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
        };
      },
    }
  )
);

/** Read the settings without subscribing (for the audio engine and friends). */
export const wiiSettings = () => useWii.getState().settings;
