import { projects, type Project } from "@content/projects";

export type ProjectGroupId = "apps" | "games" | "music" | "art" | "misc";

export interface ProjectGroup {
  id: ProjectGroupId;
  label: string;
  /** PSP icon stem shown for the group in the Projects column. */
  icon: string;
  projectIds: string[];
}

export const projectGroups: ProjectGroup[] = [
  { id: "apps", label: "Apps", icon: "g:apps", projectIds: ["bunshi", "shutdowner"] },
  { id: "games", label: "Games", icon: "game", projectIds: ["carrom", "rts", "prims-organism", "game-of-life"] },
  { id: "music", label: "Music", icon: "music", projectIds: ["boteh", "midi-controller"] },
  { id: "misc", label: "Misc", icon: "g:package_2", projectIds: ["hom", "newsletter", "pngtoplt", "loan-reports"] },
];

const byId = new Map(projects.map((p) => [p.id, p]));

/** Projects belonging to a group, in declared order. */
export function groupProjects(id: ProjectGroupId): Project[] {
  const g = projectGroups.find((x) => x.id === id);
  if (!g) return [];
  return g.projectIds.map((pid) => byId.get(pid)).filter((p): p is Project => Boolean(p));
}
