import { projects, type Project } from "@/data/projects";
import { experience, type Role } from "@/data/experience";
import { socials, profile } from "@/data/socials";

/** What the info panel renders for a given item. */
export type XmbDetail =
  | { kind: "profile" }
  | { kind: "project"; project: Project }
  | { kind: "role"; role: Role }
  | { kind: "link"; href: string; internal?: boolean; blurb: string }
  | { kind: "app"; route: string; blurb: string };

export interface XmbItem {
  id: string;
  label: string;
  sub?: string;
  /** Material Symbols (rounded) icon name shown as the item icon. */
  glyph: string;
  detail: XmbDetail;
  /** Primary action target: route (internal) or url (external). */
  action?: { type: "route" | "external"; target: string };
}

export interface XmbCategory {
  id: string;
  label: string;
  /** Material Symbols (rounded) icon name. */
  glyph: string;
  items: XmbItem[];
}

const socialGlyph: Record<string, string> = {
  instagram: "photo_camera",
  youtube: "smart_display",
  github: "code",
  linkedin: "work",
  resume: "description",
};

export const categories: XmbCategory[] = [
  {
    id: "profile",
    label: "Profile",
    glyph: "person",
    items: [
      {
        id: "about",
        label: "About",
        sub: "who is this",
        glyph: "person",
        detail: { kind: "profile" },
      },
      {
        id: "email",
        label: "Email",
        sub: profile.email,
        glyph: "mail",
        detail: {
          kind: "link",
          href: `mailto:${profile.email}`,
          blurb: "Send me an email.",
        },
        action: { type: "external", target: `mailto:${profile.email}` },
      },
      {
        id: "resume",
        label: "Resume",
        sub: "the cv",
        glyph: "description",
        detail: { kind: "app", route: "/resume", blurb: "Open my resume." },
        action: { type: "route", target: "/resume" },
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    glyph: "grid_view",
    items: projects.map((p) => ({
      id: p.id,
      label: p.title,
      sub: p.tech,
      glyph: "folder",
      detail: { kind: "project", project: p },
      action: p.link
        ? { type: p.internal ? "route" : "external", target: p.link }
        : undefined,
    })),
  },
  {
    id: "experience",
    label: "Experience",
    glyph: "work",
    items: experience.map((r) => ({
      id: r.id,
      label: r.title,
      sub: r.company,
      glyph: "business_center",
      detail: { kind: "role", role: r },
    })),
  },
  {
    id: "play",
    label: "Play",
    glyph: "sports_esports",
    items: [
      {
        id: "hom",
        label: "hॐ",
        sub: "generative art wall",
        glyph: "auto_awesome",
        detail: { kind: "app", route: "/hom", blurb: "A wall of generative art made with p5.js. Press Enter to open." },
        action: { type: "route", target: "/hom" },
      },
      {
        id: "prim",
        label: "Prim's Organism",
        sub: "interactive canvas",
        glyph: "blur_on",
        detail: {
          kind: "app",
          route: "/prim",
          blurb: "An interactive organism that grows via Prim's algorithm. Press Enter to play.",
        },
        action: { type: "route", target: "/prim" },
      },
    ],
  },
  {
    id: "links",
    label: "Links",
    glyph: "public",
    items: socials
      .filter((s) => s.id !== "resume")
      .map((s) => ({
        id: s.id,
        label: s.label,
        sub: s.href.replace(/^https?:\/\/(www\.)?/, ""),
        glyph: socialGlyph[s.id] ?? "link",
        detail: {
          kind: "link" as const,
          href: s.href,
          internal: s.internal,
          blurb: `Open ${s.label}.`,
        },
        action: { type: s.internal ? ("route" as const) : ("external" as const), target: s.href },
      })),
  },
  {
    id: "settings",
    label: "Settings",
    glyph: "settings",
    items: [
      { id: "theme", label: "Theme", glyph: "contrast", detail: { kind: "profile" } },
      { id: "wave", label: "Wave color", glyph: "waves", detail: { kind: "profile" } },
      { id: "sound", label: "Navigation sound", glyph: "volume_up", detail: { kind: "profile" } },
      { id: "motion", label: "Reduce motion", glyph: "motion_photos_off", detail: { kind: "profile" } },
    ],
  },
];
