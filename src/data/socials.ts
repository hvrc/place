export interface SocialLink {
  id: string;
  label: string;
  href: string;
  /** True when the link is a route inside this app. */
  internal?: boolean;
}

export const socials: SocialLink[] = [
  { id: "instagram", label: "instagram", href: "https://www.instagram.com/hvrc2000" },
  { id: "youtube", label: "youtube", href: "https://www.youtube.com/@hvrc0" },
  { id: "github", label: "github", href: "https://github.com/hvrc" },
  { id: "linkedin", label: "linkedin", href: "https://www.linkedin.com/in/hvrc/" },
  { id: "resume", label: "resume", href: "/resume", internal: true },
];

export const profile = {
  name: "HARSH RAJMACHIKAR",
  email: "harshrajmachikar@gmail.com",
  bio: "Software developer & generative artist. I build games, tools, simulators and interactive toys — on the web, on hardware, and everywhere in between.",
};
