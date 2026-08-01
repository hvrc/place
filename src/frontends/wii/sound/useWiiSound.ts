import { useCallback, useEffect, useRef } from "react";
import { useWii } from "@wii/state";
import { music, sfx, unlockAudio, type SfxKind } from "./wiiAudio";

/**
 * Binds the synth to the System Settings volumes.
 *
 * Browsers won't make a sound before a gesture, so the loop doesn't start on
 * mount — it waits for the first click anywhere in the menu and starts there.
 */
export function useWiiSound() {
  const musicVolume = useWii((s) => s.settings.musicVolume);
  const sfxVolume = useWii((s) => s.settings.sfxVolume);
  const unlocked = useRef(false);

  const play = useCallback(
    (kind: SfxKind) => {
      const v = useWii.getState().settings.sfxVolume / 100;
      if (v > 0) sfx[kind](v);
    },
    []
  );

  const wake = useCallback(() => {
    if (unlocked.current) return;
    unlocked.current = true;
    unlockAudio();
    const v = useWii.getState().settings.musicVolume / 100;
    if (v > 0) music.start(v * 0.5);
  }, []);

  // Track the slider live; stopping at zero frees the oscillators entirely.
  useEffect(() => {
    if (!unlocked.current) return;
    const v = (musicVolume / 100) * 0.5;
    if (v <= 0) music.stop();
    else if (!music.running) music.start(v);
    else music.setVolume(v);
  }, [musicVolume]);

  useEffect(() => () => music.stop(), []);

  return { play, wake, sfxVolume };
}
