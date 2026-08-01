import { portfolio, type Project } from "@content/index";
import type {
  MenuModel,
  MenuCategory,
  MenuItem,
  DrillGroup,
  DrillItem,
  BackdropSpec,
} from "@engine/model/types";
import { projectGroups, groupProjects } from "./projectGroups";
import { pspPalette, pspDefaultColor } from "./pspTheme";

// Per-role Google Material Symbols for the Experience section.
const experienceIcon: Record<string, string> = {
  iseehear: "g:genetics",
  getafix: "g:qr_code",
  "healthy-planet": "g:shopping_bag",
  gromor: "g:bar_chart",
};

// Map each social to the closest authentic PSP (or Material) icon.
const socialIcon: Record<string, string> = {
  instagram: "photo",
  youtube: "video",
  github: "g:commit",
  linkedin: "g:work_history",
  soundcloud: "g:graphic_eq",
  resume: "savedata",
};

// A project's dwell backdrop: its live site (link) and/or media, unless the
// project opts out. The engine decides iframe-vs-media (and skips un-embeddable
// links like GitHub) at render time.
function projectBackdrop(p: Project): BackdropSpec | null {
  if (p.noBackdrop) return null;
  if (!p.link && !p.media) return null;
  return { link: p.link, media: p.media };
}

function toDrillItem(p: Project): DrillItem {
  return {
    id: p.id,
    title: p.title,
    tech: p.tech,
    media: p.media,
    link: p.link,
    internal: p.internal,
    backdrop: projectBackdrop(p),
  };
}

/**
 * Bind the portfolio content to the generic menu model, choosing PSP icons and
 * each item's backdrop. This is the single seam between the data layer and the
 * PSP frontend — a different frontend would provide its own mapping.
 */
export function buildPspModel(): MenuModel {
  const { profile, experience, socials } = portfolio;

  const groups: Record<string, DrillGroup> = {};
  for (const g of projectGroups) {
    groups[g.id] = {
      id: g.id,
      label: g.label,
      icon: g.icon,
      items: groupProjects(g.id).map(toDrillItem),
    };
  }

  const categories: MenuCategory[] = [
    {
      id: "profile",
      label: "Profile",
      icon: "g:person",
      items: [
        { id: "about", label: "About", icon: "manual" },
        {
          id: "email",
          label: "Email",
          sub: profile.email,
          icon: "g:mark_email_read",
          action: { type: "external", target: `mailto:${profile.email}` },
        },
        {
          id: "resume",
          label: "Resume",
          icon: "g:description",
          action: { type: "route", target: "/resume" },
          backdrop: { link: "/resume" },
        },
      ],
    },
    {
      id: "projects",
      label: "Projects",
      icon: "umd",
      // grouped like the PSP "Game" menu; activating a group drills into its thumbnails
      items: projectGroups.map(
        (g): MenuItem => ({
          id: g.id,
          label: g.label,
          sub: `${g.projectIds.length} projects`,
          icon: g.icon,
          drillId: g.id,
        })
      ),
    },
    {
      id: "experience",
      label: "Experience",
      // the PSP "system" toolbox reads like a briefcase — fitting for work history
      icon: "system",
      items: experience.map(
        (r): MenuItem => ({
          id: r.id,
          label: r.title,
          sub: r.company,
          icon: experienceIcon[r.id] ?? "g:work",
          action: r.link ? { type: "external", target: r.link } : undefined,
          backdrop: r.link ? { link: r.link } : null,
        })
      ),
    },
    {
      id: "links",
      label: "Links",
      icon: "network",
      items: socials
        .filter((s) => s.id !== "resume")
        .map(
          (s): MenuItem => ({
            id: s.id,
            label: s.label,
            sub: s.href.replace(/^https?:\/\/(www\.)?/, ""),
            icon: socialIcon[s.id] ?? "network",
            action: { type: s.internal ? "route" : "external", target: s.href },
            backdrop: s.backdrop ? { link: s.backdrop, contain: s.backdropContain } : null,
          })
        ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: "g:build",
      // these map 1:1 to the PSP's own settings (cnf_*) icons
      items: [
        { id: "wave", label: "Color", icon: "cnf_theme", setting: "color" },
        { id: "uiVolume", label: "UI volume", icon: "cnf_sound", setting: "volume" },
      ],
    },
  ];

  return { categories, groups, palette: pspPalette, defaultColorHex: pspDefaultColor };
}
