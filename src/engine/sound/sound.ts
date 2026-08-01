// XMB navigation sounds. Primary path is the authentic PSP samples (denoised &
// trimmed via ffmpeg: hiss removed, timbre kept), decoded once into a buffer
// and played through a throwaway buffer-source per hit so they overlap cleanly
// under rapid navigation. If a sample hasn't loaded (or fails), we fall back to
// a synthesised sine blip so navigation is never silent.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface Blip {
  freqs: number[]; // one or more sine partials (first is loudest)
  slideTo?: number[]; // optional per-partial end frequency (pitch glide)
  dur: number; // seconds
  peak: number; // base gain before the user's volume is applied
}

function blip({ freqs, slideTo, dur, peak }: Blip, volume: number) {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;

  // shared envelope: fast attack, exponential decay to (near) silence
  const env = audio.createGain();
  const g = Math.max(0.0001, peak * volume);
  env.gain.setValueAtTime(0.0001, now);
  env.gain.exponentialRampToValueAtTime(g, now + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  // gentle low-pass so the tone stays soft rather than piercing
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3200;
  env.connect(lp).connect(audio.destination);

  freqs.forEach((f, i) => {
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, now);
    if (slideTo?.[i]) osc.frequency.exponentialRampToValueAtTime(slideTo[i], now + dur);
    const mix = audio.createGain();
    mix.gain.value = i === 0 ? 1 : 0.35; // partials above the fundamental are quieter
    osc.connect(mix).connect(env);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  });
}

// synth fallbacks, used only until the samples load (or if they fail)
const UP: Blip = { freqs: [1046.5, 1568], dur: 0.08, peak: 0.32 };
const DOWN: Blip = { freqs: [659.3, 494], slideTo: [523.3, 392], dur: 0.13, peak: 0.3 };

const buffers: Record<string, AudioBuffer | undefined> = {};
const loading: Record<string, Promise<void> | undefined> = {};

/**
 * Decode the first source the browser can handle, keyed by the sample's name.
 * Safari (and every iOS browser, which is Safari underneath) cannot decode OGG
 * Vorbis (decodeAudioData just rejects) so each sample also ships as AAC.
 */
function preload(name: string, sources: string[]): Promise<void> {
  const audio = getCtx();
  if (!audio || buffers[name]) return Promise.resolve();
  if (loading[name]) return loading[name]!;

  loading[name] = (async () => {
    for (const src of sources) {
      try {
        const data = await (await fetch(src)).arrayBuffer();
        buffers[name] = await audio.decodeAudioData(data);
        return;
      } catch {
        /* unsupported or missing: try the next encoding */
      }
    }
  })().finally(() => {
    loading[name] = undefined;
  });

  return loading[name]!;
}

/** Play a sample; fall back to the synth blip until one has decoded. */
function makePlayer(name: string, sources: string[], fallback: Blip) {
  void preload(name, sources);
  return (volume = 0.5) => {
    const audio = getCtx();
    if (!audio) return;
    const buf = buffers[name];
    if (!buf) {
      void preload(name, sources);
      blip(fallback, volume);
      return;
    }
    const source = audio.createBufferSource();
    source.buffer = buf;
    const gain = audio.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(audio.destination);
    source.start();
  };
}

// AAC first: every browser decodes it, and it saves Safari a failed round trip.
const up = makePlayer("up", ["/sounds/psp/up.m4a", "/sounds/psp/up.ogg"], UP);
const down = makePlayer("down", ["/sounds/psp/down.m4a", "/sounds/psp/down.ogg"], DOWN);

export const sfx = {
  move: (v = 0.5) => up(v),
  category: (v = 0.5) => up(v),
  enter: (v = 0.5) => up(v),
  /** going back from a selected project (closing a folder) */
  back: (v = 0.5) => down(v),
};

export type SfxKind = keyof typeof sfx;
