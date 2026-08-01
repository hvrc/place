// The portfolio data layer: pure content, with no knowledge of any frontend
// (PSP or otherwise). A frontend imports `portfolio` and maps it to its own
// presentation model.

import { profile, type Profile } from "./profile";
import { projects, type Project, type Media } from "./projects";
import { experience, type Role } from "./experience";
import { socials, type SocialLink } from "./socials";

export interface Portfolio {
  profile: Profile;
  projects: Project[];
  experience: Role[];
  socials: SocialLink[];
}

export const portfolio: Portfolio = { profile, projects, experience, socials };

export type { Profile, Project, Media, Role, SocialLink };
export { profile, projects, experience, socials };
