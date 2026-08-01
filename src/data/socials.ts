export interface SocialLink {
  id: string;
  label: string;
  /** opened on select */
  href: string;
  /** embeddable URL shown as the live backdrop (post/video/player), if any */
  backdrop?: string;
  /** render the backdrop as a centered card (a post) rather than fullscreen */
  backdropContain?: boolean;
  /** True when the link is a route inside this app. */
  internal?: boolean;
}

export const socials: SocialLink[] = [
  {
    id: "instagram",
    label: "instagram",
    href: "https://www.instagram.com/hvrc2000",
    backdrop: "https://www.instagram.com/p/DTKTxUdjgFP/embed/",
    backdropContain: true,
  },
  {
    id: "youtube",
    label: "youtube",
    href: "https://www.youtube.com/@hvrc0",
    backdrop: "https://www.youtube.com/embed/EaMn8rLr-ao?loop=1&playlist=EaMn8rLr-ao&enablejsapi=1",
  },
  { id: "github", label: "github", href: "https://github.com/hvrc" },
  { id: "linkedin", label: "linkedin", href: "https://www.linkedin.com/in/hvrc/" },
  {
    id: "soundcloud",
    label: "soundcloud",
    href: "https://soundcloud.com/hvrc0",
    backdrop:
      "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fhvrc0%2Fits-always-black&auto_play=false&visual=true&hide_related=true&show_comments=false",
  },
  { id: "resume", label: "resume", href: "/resume", internal: true },
];

export const profile = {
  name: "HARSH RAJMACHIKAR",
  email: "harshrajmachikar@gmail.com",
  bio: "Software developer & generative artist. I build games, tools, simulators and interactive toys — on the web, on hardware, and everywhere in between.",
};
