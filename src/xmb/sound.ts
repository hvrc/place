// XMB navigation sounds. Plays short ogg clips; clones the element per play so
// rapid navigation can overlap. Gated by the sound setting (see Xmb `play`).

function makePlayer(src: string) {
  const base = typeof Audio !== "undefined" ? new Audio(src) : null;
  if (base) base.preload = "auto";
  return (volume = 0.6) => {
    if (!base) return;
    const a = base.cloneNode() as HTMLAudioElement;
    a.volume = volume;
    void a.play().catch(() => {});
  };
}

const up = makePlayer("/sounds/up.ogg");
const down = makePlayer("/sounds/down.ogg");

export const sfx = {
  move: (v = 0.5) => up(v),
  category: (v = 0.5) => up(v),
  enter: (v = 0.5) => up(v),
  /** going back from a selected project (closing a folder) */
  back: (v = 0.5) => down(v),
};
