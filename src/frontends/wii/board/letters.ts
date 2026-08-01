import { socials, profile } from "@content/index";
import { experience } from "@content/index";

// The Wii Message Board is a corkboard of letters, one page per day. Here it's
// the contact page: the ways to reach Harsh, pinned up as mail, plus a couple of
// letters written in the console's own voice.

export interface Letter {
  id: string;
  /** Sender line under the title. */
  from: string;
  title: string;
  /** Paragraphs. HTML is allowed (the content layer already uses <b>/<br/>). */
  body: string[];
  /** Opened in a new tab by the letter's action button. */
  href?: string;
  hrefLabel?: string;
  /** Copied to the clipboard instead of opened (email addresses). */
  copy?: string;
  /** The pale-yellow system letter, as opposed to a plain white one. */
  tinted?: boolean;
}

const SOCIAL_COPY: Record<string, { title: string; body: string[] }> = {
  instagram: {
    title: "Instagram",
    body: [
      "Sketches, prints, and whatever the plotter is doing this week.",
      "Mostly the generative stuff before it becomes a project.",
    ],
  },
  youtube: {
    title: "YouTube",
    body: ["Demos, process videos, and the occasional thing that only works once on camera."],
  },
  github: {
    title: "GitHub",
    body: ["Source for nearly everything in this menu. Issues and stars both welcome."],
  },
  linkedin: {
    title: "LinkedIn",
    body: ["The formal version of the work history — the same roles, fewer jokes."],
  },
  soundcloud: {
    title: "SoundCloud",
    body: ["Music. Some of it made with the instruments in this menu."],
  },
  resume: {
    title: "Resume",
    body: ["One page, PDF-shaped, kept current."],
  },
};

const social: Letter[] = socials.map((s) => ({
  id: `social-${s.id}`,
  from: s.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
  title: SOCIAL_COPY[s.id]?.title ?? s.label,
  body: SOCIAL_COPY[s.id]?.body ?? [`Find me on ${s.label}.`],
  href: s.href,
  hrefLabel: s.internal ? "Open" : "Visit",
}));

/** The "you have mail" letter that greets a first-time visitor. */
const hello: Letter = {
  id: "hello",
  from: "Harsh Rajmachikar",
  title: "Hello!",
  tinted: true,
  body: [
    "Thanks for switching this thing on.",
    profile.bio,
    "Every tile on the menu is a real project — pick one and it loads live, right there on the shelf. The ones that won't sit still in a frame play their demo instead.",
    "If something here is useful to you, or you want one built, the letters on this board are all the ways to reach me.",
  ],
  copy: profile.email,
};

/** The console's own manual, repurposed as the controls card. */
const manual: Letter = {
  id: "manual",
  from: "Wii Menu Electronic Manual",
  title: "How to use this Wii",
  tinted: true,
  body: [
    "<b>Point and click</b> a channel to open it. The banner is the project itself, running live.",
    "<b>Start</b> opens it full size in a new tab. <b>Github</b> goes to the source.",
    "<b>← / →</b> page through the menu, or move between channels once you're inside one.",
    "<b>Esc</b> backs out of anything.",
    "The <b>Wii</b> button, bottom left, is System Settings. The <b>SD card</b> beside it holds the downloads. The <b>envelope</b>, bottom right, is this board.",
  ],
};

/** The Wii logged what you played and for how long; so does this. */
const playRecord: Letter = {
  id: "play-record",
  from: "Wii Message Board",
  title: "Today's Accomplishments",
  tinted: true,
  body: [
    "Play history for this console:",
    ...experience.map(
      (r) => `<b>${r.company}</b> — ${r.title}<br/>${r.period} · ${r.location}`
    ),
    "Each of these is also a channel on page two, if you'd rather see where they lead.",
  ],
};

const email: Letter = {
  id: "email",
  from: profile.email,
  title: "Send a letter back",
  body: [
    "The fastest way to reach me is still email.",
    `<b>${profile.email}</b>`,
    "Press Copy and it's on your clipboard.",
  ],
  copy: profile.email,
};

export const letters: Letter[] = [hello, manual, ...social, email, playRecord];

/** Letters per corkboard page — one page is one day, like the console's. */
export const LETTERS_PER_PAGE = 4;

export const letterPages: Letter[][] = Array.from(
  { length: Math.ceil(letters.length / LETTERS_PER_PAGE) },
  (_, p) => letters.slice(p * LETTERS_PER_PAGE, (p + 1) * LETTERS_PER_PAGE)
);

/**
 * Where each letter pins up. Hand-placed rather than random so the board looks
 * arranged-by-a-person and stays put between renders.
 */
export const PIN_SPOTS: { left: string; top: string; rotate: number }[] = [
  { left: "5%", top: "7%", rotate: -2.4 },
  { left: "38%", top: "22%", rotate: 1.6 },
  { left: "70%", top: "5%", rotate: -1.1 },
  { left: "56%", top: "52%", rotate: 2.2 },
  { left: "14%", top: "48%", rotate: -1.8 },
  { left: "40%", top: "68%", rotate: 1.2 },
];
