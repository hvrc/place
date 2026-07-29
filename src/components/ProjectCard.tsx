import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import { ProjectMedia } from "@/components/ProjectMedia";

export function ProjectCard({ project }: { project: Project }) {
  const Title = (
    <h1 className="text-2xl md:text-4xl font-bold">{project.title}</h1>
  );

  return (
    <div className="w-full max-w-[700px]">
      <div className="w-full max-w-[700px] p-4">
        <div className="flex items-baseline gap-x-4 mb-1">
          {project.link &&
            (project.internal ? (
              <Link to={project.link} className="custom-link">
                {Title}
              </Link>
            ) : (
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="custom-link">
                {Title}
              </a>
            ))}
          {(project.github || project.download) && (
            <div className="text-sm md:text-lg self-baseline space-x-2">
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  Github
                </a>
              )}
              {project.download && (
                <a href={project.download} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              )}
            </div>
          )}
        </div>
        <p
          className="text-sm md:text-lg text-left [&_a]:text-black"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
      </div>
      {project.media && (
        <div className="border-2 border-black w-full max-w-[700px]">
          <ProjectMedia media={project.media} />
        </div>
      )}
    </div>
  );
}
