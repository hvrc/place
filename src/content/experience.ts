export interface Role {
  id: string;
  title: string;
  company: string;
  period: string;
  location: string;
  logo?: string;
  /** company / product site — opened on select and shown as the live backdrop */
  link?: string;
}

export const experience: Role[] = [
  {
    id: "iseehear",
    title: "Creative Systems Developer",
    company: "Iseehear",
    period: "Present",
    location: "Remote",
    link: "https://login.streamcell.com/",
  },
  {
    id: "getafix",
    title: "Freelance Software Developer",
    company: "Getafix Design",
    period: "Sep 2020 - Present (4+ years)",
    location: "Remote",
    logo: "/images/logos/getafix.png",
    link: "https://www.getafixdesign.com/",
  },
  {
    id: "healthy-planet",
    title: "Integrations Engineer",
    company: "Healthy Planet",
    period: "Feb 2022 - May 2025 (3 years 4 months)",
    location: "Toronto, Canada",
    logo: "/images/logos/healthy.png",
    link: "https://www.autostoresystem.com/system/grid",
  },
  {
    id: "gromor",
    title: "Data Analyst",
    company: "Gromor Finance",
    period: "Jun 2019 - Aug 2020 (1 year 3 months)",
    location: "Mumbai, India",
    logo: "/images/logos/gromor.png",
    link: "https://gromor.in/",
  },
];
