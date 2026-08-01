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

// Per-role Google Material Symbols for the Experience section.
const experienceIcon: Record<string, string> = {
  iseehear: "g:genetics",
  getafix: "g:qr_code",
  "healthy-planet": "g:shopping_bag",
  gromor: "g:bar_chart",
};

// Map each social to the closest authentic PSP icon.
const socialIcon: Record<string, string> = {
  instagram: "photo",
  youtube: "video",
  github: "g:commit",
  linkedin: "g:work_history",
  soundcloud: "g:graphic_eq",
  resume: "savedata",
};

export const categories: XmbCategory[] = [
  {
    id: "profile",
    label: "Profile",
    icon: "g:person",
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
        icon: "g:mark_email_read",
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
        icon: "g:description",
        detail: { kind: "app", route: "/resume", blurb: "Open my resume." },
        action: { type: "route", target: "/resume" },
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: "umd",
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
    // the PSP "system" toolbox reads like a briefcase — fitting for work history
    icon: "system",
    items: experience.map((r) => ({
      id: r.id,
      label: r.title,
      sub: r.company,
      icon: experienceIcon[r.id] ?? "g:work",
      detail: { kind: "role", role: r },
      action: r.link ? { type: "external" as const, target: r.link } : undefined,
    })),
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
    icon: "g:build",
    // these map 1:1 to the PSP's own settings (cnf_*) icons
    items: [
      { id: "wave", label: "Color", icon: "cnf_theme", detail: { kind: "profile" } },
      { id: "uiVolume", label: "UI volume", icon: "cnf_sound", detail: { kind: "profile" } },
    ],
  },
];
