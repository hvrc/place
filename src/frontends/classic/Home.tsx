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
export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // On mobile the original site prioritised projects that have media.
  const visible = isMobile ? projects.filter((p) => p.media) : projects;

  return (
    <div className="w-full sm:max-w-[95%] md:max-w-[80%] lg:max-w-[1500px] mx-auto space-y-4 px-4 pt-8">
      <Header />
      <SocialLinks />

      <section id="projects" className="p-2 sm:p-6 space-y-6 fade-in">
        <div className="p-1 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 justify-items-center">
            {visible.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
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
