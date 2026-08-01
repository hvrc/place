// The menu's sound, synthesised in the browser: no samples, nothing to load,
// nothing copyrighted. Two halves: the interface blips, and a slow four-bar
// lounge loop written in the spirit of the console's own menu music.
//
// Everything is scheduled against the AudioContext clock (never setTimeout), so
// the loop stays in time regardless of how busy the main thread gets.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Browsers hold audio until a gesture; call this from the first click. */
export function unlockAudio(): void {
  const c = audio();
  if (c?.state === "suspended") void c.resume();
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

/* ── interface sounds ───────────────────────────────────────────────────── */

interface Blip {
  type: OscillatorType;
  from: number;
  to?: number;
  dur: number;
  peak: number;
  /** Adds a short filtered-noise transient: the Wii's clicks have one. */
  tick?: boolean;
}

function play(b: Blip, volume: number) {
  const c = audio();
  if (!c || !master || volume <= 0) return;
  const t = c.currentTime;

  const env = c.createGain();
  const g = Math.max(0.0001, b.peak * volume);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(g, t + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, t + b.dur);

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 5200;
  env.connect(lp).connect(master);

  const osc = c.createOscillator();
  osc.type = b.type;
  osc.frequency.setValueAtTime(b.from, t);
  if (b.to) osc.frequency.exponentialRampToValueAtTime(b.to, t + b.dur * 0.9);
  osc.connect(env);
  osc.start(t);
  osc.stop(t + b.dur + 0.04);

  if (b.tick) {
    const noise = c.createBufferSource();
    const buf = c.createBuffer(1, 1024, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    noise.buffer = buf;
    const ng = c.createGain();
    ng.gain.value = 0.25 * volume;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2400;
    noise.connect(hp).connect(ng).connect(master);
    noise.start(t);
  }
}

export const sfx = {
  /** Sweeping the pointer across a channel. */
  hover: (v: number) => play({ type: "sine", from: 1180, to: 1560, dur: 0.055, peak: 0.16, tick: true }, v),
  /** Opening a channel: the little rising pop. */
  select: (v: number) => play({ type: "triangle", from: 660, to: 1320, dur: 0.16, peak: 0.3, tick: true }, v),
  /** Backing out. */
  back: (v: number) => play({ type: "triangle", from: 700, to: 380, dur: 0.18, peak: 0.26 }, v),
  /** Turning a page of the grid. */
  page: (v: number) => play({ type: "sine", from: 520, to: 900, dur: 0.13, peak: 0.2, tick: true }, v),
  /** Launching something outward. */
  launch: (v: number) => play({ type: "sawtooth", from: 300, to: 1500, dur: 0.4, peak: 0.16 }, v),
};

export type SfxKind = keyof typeof sfx;

/* ── the menu loop ──────────────────────────────────────────────────────── */

const BPM = 82;
const STEP = 60 / BPM / 4; // a sixteenth
const BARS = 4;
const STEPS = BARS * 16;

/** Cmaj7 · Am7 · Dm7 · G7: one bar each, the console's easy-listening harmony. */
const CHORDS = [
  [60, 64, 67, 71],
  [57, 60, 64, 67],
  [62, 65, 69, 72],
  [55, 59, 62, 65],
];

/** Bar-relative sixteenths that carry a bass note, with a scale degree offset. */
const BASS_STEPS = [0, 6, 10];
/** The marimba figure: [step, semitones above the chord root]. */
const MELODY: Record<number, number[][]> = {
  0: [[4, 12], [8, 16], [14, 19]],
  1: [[2, 15], [8, 12], [12, 19]],
  2: [[0, 16], [6, 12], [10, 21]],
  3: [[4, 19], [8, 17], [11, 12], [14, 14]],
};

let timer: number | undefined;
let step = 0;
let nextAt = 0;
let musicGain: GainNode | null = null;

function voice(freq: number, at: number, dur: number, peak: number, type: OscillatorType) {
  const c = audio();
  if (!c || !musicGain) return;
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(peak, at + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(env).connect(musicGain);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/** A brushed snare/shaker on the offbeat, so the loop swings rather than ticks. */
function shaker(at: number, peak: number) {
  const c = audio();
  if (!c || !musicGain) return;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.08), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const hp = c.createBiquadFilter();
  hp.type = "bandpass";
  hp.frequency.value = 6200;
  const g = c.createGain();
  g.gain.value = peak;
  src.connect(hp).connect(g).connect(musicGain);
  src.start(at);
}

function scheduleStep(i: number, at: number) {
  const bar = Math.floor(i / 16) % BARS;
  const s = i % 16;
  const chord = CHORDS[bar];
  const root = chord[0];

  if (BASS_STEPS.includes(s)) {
    voice(midi(root - 12), at, s === 0 ? 0.5 : 0.34, 0.22, "triangle");
  }
  // comped chord on the backbeat
  if (s === 4 || s === 12) {
    chord.slice(1).forEach((n, k) => voice(midi(n), at + k * 0.012, 0.42, 0.055, "sine"));
  }
  if (s % 4 === 2) shaker(at, 0.05);

  for (const [when, interval] of MELODY[bar] ?? []) {
    if (s === when) voice(midi(root + interval), at, 0.7, 0.09, "sine");
  }
}

function pump() {
  const c = audio();
  if (!c) return;
  // Schedule everything that falls inside the next 150 ms.
  while (nextAt < c.currentTime + 0.15) {
    scheduleStep(step, Math.max(nextAt, c.currentTime));
    step = (step + 1) % STEPS;
    nextAt += STEP;
  }
}

export const music = {
  start(volume: number) {
    const c = audio();
    if (!c || !master || timer !== undefined) return;
    musicGain = c.createGain();
    musicGain.gain.value = volume;
    musicGain.connect(master);
    step = 0;
    nextAt = c.currentTime + 0.08;
    timer = window.setInterval(pump, 40);
  },
  stop() {
    if (timer !== undefined) window.clearInterval(timer);
    timer = undefined;
    musicGain?.disconnect();
    musicGain = null;
  },
  setVolume(volume: number) {
    const c = audio();
    if (musicGain && c) musicGain.gain.setTargetAtTime(volume, c.currentTime, 0.15);
  },
  get running() {
    return timer !== undefined;
  },
};
