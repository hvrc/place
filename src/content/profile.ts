export interface Profile {
  name: string;
  email: string;
  bio: string;
  /** The About screen's blurb; `{}` is the slot the `cycle` words rotate through. */
  about: { lines: string[]; cycle: string[] };
}

export const profile: Profile = {
  name: "HARSH RAJMACHIKAR",
  email: "harshrajmachikar@gmail.com",
  bio: "Software developer & generative artist. I build games, tools, simulators and interactive toys, on the web, on hardware, and everywhere in between.",
  about: {
    lines: ["Harsh Rajmachikar is making {}"],
    cycle: ["software", "games", "music"],
  },
};
