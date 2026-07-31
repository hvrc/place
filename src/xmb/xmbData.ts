import { type Project } from "@/data/projects";
import { experience, type Role } from "@/data/experience";
import { socials, profile } from "@/data/socials";
import { projectGroups, type ProjectGroupId } from "@/xmb/projectsMenu";

/** What the info panel renders for a given item. */
export type XmbDetail =
  | { kind: "profile" }
  | { kind: "project"; project: Project }
  | { kind: "role"; role: Role }
  | { kind: "link"; href: string; internal?: boolean; blurb: string }
  | { kind: "app"; route: string; blurb: string }
  | { kind: "group"; groupId: ProjectGroupId };

export interface XmbItem {
  id: string;
  label: string;
  sub?: string;
  /** Authentic PSP icon stem, e.g. "game" -> /icons/tex_game.32bit.png */
  icon: string;
  detail: XmbDetail;
  /** Primary action target: route (internal) or url (external). */
  action?: { type: "route" | "external"; target: string };
}

export interface XmbCategory {
  id: string;
  label: string;
  /** Authentic PSP icon stem for the category (horizontal list). */
  icon: string;
  items: XmbItem[];
}

// Map each social to the closest authentic PSP icon.
const socialIcon: Record<string, string> = {
  instagram: "camera",
  youtube: "video",
  github: "browser",
  linkedin: "network",
  resume: "savedata",
};

export const categories: XmbCategory[] = [
  {
    id: "profile",
    label: "Profile",
    icon: "photo",
    items: [
      {
        id: "about",
        label: "About",
        sub: "who is this",
        icon: "manual",
        detail: { kind: "profile" },
      },
      {
        id: "email",
        label: "Email",
        sub: profile.email,
        icon: "sharing",
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
        icon: "savedata",
        detail: { kind: "app", route: "/resume", blurb: "Open my resume." },
        action: { type: "route", target: "/resume" },
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: "game",
    // grouped like the PSP "Game" menu; activating a group drills into its thumbnails
    items: projectGroups.map((g) => ({
      id: g.id,
      label: g.label,
      sub: `${g.projectIds.length} projects`,
      icon: g.icon,
      detail: { kind: "group", groupId: g.id },
    })),
  },
  {
    id: "experience",
    label: "Experience",
    // the one section that uses Google Material Symbols (rendered low-res)
    icon: "g:workspace_premium",
    items: experience.map((r) => ({
      id: r.id,
      label: r.title,
      sub: r.company,
      icon: "g:work",
      detail: { kind: "role", role: r },
    })),
  },
  {
    id: "play",
    label: "Play",
    icon: "video",
    items: [
      {
        id: "hom",
        label: "hॐ",
        sub: "generative art wall",
        icon: "camera",
        detail: { kind: "app", route: "/hom", blurb: "A wall of generative art made with p5.js. Press Enter to open." },
        action: { type: "route", target: "/hom" },
      },
      {
        id: "prim",
        label: "Prim's Organism",
        sub: "interactive canvas",
        icon: "game",
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
    icon: "network",
    items: socials
      .filter((s) => s.id !== "resume")
      .map((s) => ({
        id: s.id,
        label: s.label,
        sub: s.href.replace(/^https?:\/\/(www\.)?/, ""),
        icon: socialIcon[s.id] ?? "network",
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
    icon: "system",
    // these map 1:1 to the PSP's own settings (cnf_*) icons
    items: [
      { id: "theme", label: "Theme", icon: "cnf_theme", detail: { kind: "profile" } },
      { id: "wave", label: "Wave color", icon: "cnf_video", detail: { kind: "profile" } },
      { id: "uiVolume", label: "UI volume", icon: "cnf_sound", detail: { kind: "profile" } },
      { id: "musicVolume", label: "Music volume", icon: "music", detail: { kind: "profile" } },
      { id: "motion", label: "Reduce motion", icon: "cnf_save_energy", detail: { kind: "profile" } },
    ],
  },
];
