import { projects, experience, profile, type Media } from "@content/index";

// The Wii frontend's presentation model. The Wii Menu is a fixed grid of
// *slots*, so unlike the PSP's nested columns this layer is flat: one ordered
// list of channels that gets chunked into pages of PER_PAGE. Everything here is
// derived from src/content — no portfolio facts live in this file.

/** Slots per page. Four across, three down, exactly like the real menu. */
export const PER_PAGE = 12;
/** Pages the menu paginates through; the tail is intentionally empty (room to grow). */
export const PAGES = 3;

export type ChannelKind = "disc" | "project" | "experience" | "soon";

export interface Channel {
  id: string;
  kind: ChannelKind;
  /** Name shown in the hover bubble and on the channel screen. */
  title: string;
  /** One line under the title on the channel screen. */
  blurb?: string;
  /** Rich description (HTML, from the content layer). */
  description?: string;
  /** Banner art for the tile. Absent → the tile is drawn from `tile` instead. */
  media?: Media;
  /** The live site loaded into the channel screen's banner. */
  link?: string;
  /** `link` is a route inside this app rather than an external site. */
  internal?: boolean;
  /** Secondary link — the second button on the channel screen. */
  github?: string;
  /** A direct download, when the project ships one. */
  download?: string;
  /** Some sites refuse to be framed; those show their media instead. */
  noFrame?: boolean;
  /** Drawn-tile spec, used when there's no media (and as the poster while media loads). */
  tile: TileArt;
}

/** A channel tile drawn in CSS — the Wii's own text-only channels look like this. */
export interface TileArt {
  /** Background gradient stops, top → bottom. */
  from: string;
  to: string;
  /** Wordmark colour. */
  ink: string;
  /** Wordmark text; defaults to the channel title. */
  label?: string;
  /** Small line under the wordmark. */
  sub?: string;
  /** An image floated behind the wordmark (company logos). */
  logo?: string;
  /** Wordmark treatment: `glow` is the Forecast/News Channel look. */
  style?: "flat" | "glow";
}

const V = "/videos/demos/optimized";

/** Per-project tile art, keyed by project id. Only used where there's no media. */
const TILES: Record<string, TileArt> = {
  carrom: { from: "#f0e3c6", to: "#c99a53", ink: "#5a3b12", style: "glow" },
  boteh: { from: "#2b1f45", to: "#6d3f8f", ink: "#f4e6ff", style: "glow" },
  hom: { from: "#ffffff", to: "#d6d6d6", ink: "#1a1a1a", style: "flat" },
  rts: { from: "#123b2e", to: "#2f8f68", ink: "#e8fff4", style: "glow" },
  "game-of-life": { from: "#0d0d12", to: "#2a2a3a", ink: "#c9ffd6", style: "glow", label: "Game of Life" },
  bunshi: { from: "#f7fbff", to: "#bcd8ef", ink: "#12405f", style: "flat" },
  newsletter: { from: "#f5f2ea", to: "#d8cfb8", ink: "#3a3226", style: "flat", label: "Newsletter" },
  "loan-reports": { from: "#eef3f8", to: "#c3d2e0", ink: "#23445f", style: "flat", label: "Loan Reports" },
  shutdowner: { from: "#1d2733", to: "#3d5468", ink: "#d9ecff", style: "glow", label: "Shutdown\nScheduler" },
  "midi-controller": { from: "#171717", to: "#3b3b3b", ink: "#ffd76e", style: "glow", label: "Midi Controller" },
  pngtoplt: { from: "#ffffff", to: "#cfcfcf", ink: "#101010", style: "flat", label: "PNG → PLT" },
  "prims-organism": { from: "#101a2b", to: "#2b4a7a", ink: "#bfe3ff", style: "glow", label: "Prim's\nOrganism" },
};

/** Fallback tint for anything TILES doesn't cover. */
const NEUTRAL: TileArt = { from: "#fbfbfb", to: "#d9d9d9", ink: "#3a3a3a", style: "flat" };

/** Sites that will not render inside a frame (GitHub sends X-Frame-Options: deny). */
function unframeable(link?: string): boolean {
  return !link || /github\.com/.test(link);
}

/**
 * Display order, carried over from the legacy site's project grid. The content
 * layer's own order is authoring order; this is the order Harsh shows them in.
 */
const PROJECT_ORDER = [
  "carrom",
  "boteh",
  "hom",
  "rts",
  "game-of-life",
  "bunshi",
  "newsletter",
  "loan-reports",
  "shutdowner",
  "midi-controller",
  "pngtoplt",
  "prims-organism",
];

const ordered = [
  ...PROJECT_ORDER.map((id) => projects.find((p) => p.id === id)).filter(
    (p): p is (typeof projects)[number] => Boolean(p)
  ),
  // anything added to the content layer but not listed above still shows, last
  ...projects.filter((p) => !PROJECT_ORDER.includes(p.id)),
];

const projectChannels: Channel[] = ordered.map((p) => ({
  id: p.id,
  kind: "project" as const,
  title: p.title,
  blurb: p.blurb,
  description: p.description,
  media: p.media,
  link: p.link,
  internal: p.internal,
  github: p.github,
  download: p.download,
  noFrame: unframeable(p.link),
  tile: TILES[p.id] ?? { ...NEUTRAL, label: p.title },
}));

/** Work experience, after the projects — one channel per role. */
const experienceChannels: Channel[] = experience.map((r) => ({
  id: `job-${r.id}`,
  kind: "experience" as const,
  title: r.company,
  blurb: `${r.title} · ${r.location}`,
  description: `${r.title}<br/><b>${r.period}</b> · ${r.location}`,
  link: r.link,
  noFrame: unframeable(r.link),
  tile: {
    from: "#ffffff",
    to: "#dfe4e8",
    ink: "#2f3c47",
    label: r.company,
    sub: r.period.split("(")[0].trim(),
    logo: r.logo,
    style: "flat",
  },
}));

/** The always-first slot. On a real Wii this is the disc drive; here it's the About screen. */
const discChannel: Channel = {
  id: "disc",
  kind: "disc",
  title: profile.name.replace(/\b(\w)(\w*)/g, (_, a: string, b: string) => a + b.toLowerCase()),
  blurb: "Software developer & generative artist",
  description: profile.bio,
  link: "/wii/about",
  internal: true,
  noFrame: true,
  tile: { from: "#ffffff", to: "#ededed", ink: "#8a8a8a", label: "" },
};

/** Wii channels not built yet — they open a "coming soon" screen and look the part. */
const soonChannels: Channel[] = [
  {
    id: "mii",
    kind: "soon",
    title: "Mii Channel",
    blurb: "Make a Mii. Not wired up yet.",
    noFrame: true,
    tile: { from: "#f2fbfd", to: "#cfe9f2", ink: "#5aa9be", label: "Mii", style: "glow" },
  },
  {
    id: "forecast",
    kind: "soon",
    title: "Forecast Channel",
    blurb: "Weather, wherever you are.",
    noFrame: true,
    tile: { from: "#2d7fd6", to: "#0d3f80", ink: "#ffffff", label: "Forecast\nChannel", style: "glow" },
  },
  {
    id: "photo",
    kind: "soon",
    title: "Photo Channel",
    blurb: "Doodle on the generative art.",
    noFrame: true,
    tile: { from: "#c8935a", to: "#8b5c2b", ink: "#fff6e6", label: "Photo\nChannel", style: "glow" },
  },
];

/** Every channel, in menu order: disc, projects, work, then the not-yet-built. */
export const channels: Channel[] = [
  discChannel,
  ...projectChannels,
  ...experienceChannels,
  ...soonChannels,
];

/** The grid: PAGES pages of PER_PAGE slots, `null` where a slot is empty. */
export const pages: (Channel | null)[][] = Array.from({ length: PAGES }, (_, page) =>
  Array.from({ length: PER_PAGE }, (_, slot) => channels[page * PER_PAGE + slot] ?? null)
);

export function channelIndex(id: string): number {
  return channels.findIndex((c) => c.id === id);
}

/** Poster frame for a video tile, so the grid has something before playback starts. */
export function posterFor(c: Channel): string | undefined {
  if (c.media?.type === "image") return c.media.src;
  if (c.media?.type === "video" && c.media.poster) return c.media.poster;
  if (c.id === "hom") return "/images/demos/hom_demo.png";
  return undefined;
}

export { V as VIDEO_ROOT };
