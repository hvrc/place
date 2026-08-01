import { useEffect, useState } from "react";
import { Header } from "./Header";
import { SocialLinks } from "./SocialLinks";
import { ProjectCard } from "./ProjectCard";
import { ExperienceList } from "./ExperienceList";
import { projects } from "@content/projects";
import { profile } from "@content/profile";

/**
 * The refactored "classic" portfolio. A single responsive grid renders every
 * project through <ProjectCard>, replacing the old two-column duplicated markup
 * and the mobile/desktop slice() branching.
 */
// Display order for the grid (fills left→right, top→bottom in the 2-col layout).
const PROJECT_ORDER = [
  "carrom", "boteh",
  "hom", "rts",
  "game-of-life", "bunshi",
  "newsletter", "loan-reports",
  "shutdowner", "midi-controller",
  "pngtoplt", "prims-organism",
];
const byId = new Map(projects.map((p) => [p.id, p]));
const orderedProjects = [
  ...PROJECT_ORDER.map((id) => byId.get(id)).filter((p): p is (typeof projects)[number] => !!p),
  // any project not listed above still shows, after the ordered ones
  ...projects.filter((p) => !PROJECT_ORDER.includes(p.id)),
];

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // On mobile the original site prioritised projects that have media.
  const visible = isMobile ? orderedProjects.filter((p) => p.media) : orderedProjects;
  // Two-column masonry: keep the row-pairing (even indices left, odd right) but
  // let each column stack tightly so tall cards don't leave gaps beside short ones.
  const leftCol = orderedProjects.filter((_, i) => i % 2 === 0);
  const rightCol = orderedProjects.filter((_, i) => i % 2 === 1);

  return (
    <div className="w-full sm:max-w-[95%] md:max-w-[80%] lg:max-w-[1500px] mx-auto space-y-4 px-4 pt-8">
      <Header />
      <SocialLinks />

      <section id="projects" className="p-2 sm:p-6 space-y-6 fade-in">
        <div className="p-1 sm:p-5">
          {isMobile ? (
            <div className="flex flex-col items-center gap-10">
              {visible.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex gap-10 items-start justify-center">
              <div className="flex-1 flex flex-col items-center gap-10">
                {leftCol.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="flex-1 flex flex-col items-center gap-10">
                {rightCol.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-24 lg:mt-0" />
      <ExperienceList />

      <section id="contact" className="p-8 text-center fade-in mt-24">
        <h1 className="text-lg md:text-xl font-bold">{profile.email}</h1>
      </section>
      <div className="h-48" />
    </div>
  );
}
