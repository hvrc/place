import { useMemo } from "react";
import { useMenuStore } from "@engine/state/MenuContext";
import { sfx, type SfxKind } from "./sound";

/**
 * Navigation sound bound to the current menu store: plays at the live UI volume
 * (0 = muted), read at call time so it always reflects the latest setting.
 */
export function useSound() {
  const store = useMenuStore();
  return useMemo(
    () => ({
      play(kind: SfxKind) {
        const v = store.getState().settings.uiVolume;
        if (v > 0) sfx[kind](v / 100);
      },
    }),
    [store]
  );
}
