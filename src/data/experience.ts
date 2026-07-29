export interface Role {
  id: string;
  title: string;
  company: string;
  period: string;
  location: string;
  logo?: string;
}

export const experience: Role[] = [
  {
    id: "getafix",
    title: "Freelance Software Developer",
    company: "Getafix Design, Independent",
    period: "Sep 2020 - Present (4+ years)",
    location: "Remote",
    logo: "/images/logos/getafix.png",
  },
  {
    id: "healthy-planet",
    title: "Software Developer / Integration Engineer",
    company: "Healthy Planet",
    period: "Feb 2022 - May 2025 (3 years 4 months)",
    location: "Toronto, Canada",
    logo: "/images/logos/healthy.png",
  },
  {
    id: "gromor",
    title: "Data Analyst",
    company: "Gromor Finance",
    period: "Jun 2019 - Aug 2020 (1 year 3 months)",
    location: "Mumbai, India",
    logo: "/images/logos/gromor.png",
  },
];
