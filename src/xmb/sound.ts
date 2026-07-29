// Tiny Web Audio "blip" generator for XMB navigation feedback.
// Lazily creates a single AudioContext on first use (after a user gesture).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, duration = 0.06, type: OscillatorType = "sine", gain = 0.05) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, audio.currentTime);
  g.gain.linearRampToValueAtTime(gain, audio.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  osc.connect(g).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

export const sfx = {
  move: () => blip(660, 0.05, "sine", 0.04),
  category: () => blip(440, 0.07, "triangle", 0.05),
  enter: () => blip(880, 0.12, "sine", 0.06),
  back: () => blip(330, 0.09, "sine", 0.05),
};
