import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ContentNotFound from "../ui/content-not-found";
import CornerHeading from "~/components/ui/corner-heading";
import { TProject } from "./_project-mock";

import ProjectItem from "./project-item";

const ProjectList = ({ projects, metadata }: { projects: TProject[]; metadata?: boolean }) => {
  return (
    <section aria-label="projects" className="mt-5" id="main-content">
      {metadata && <CornerHeading>Featured Projects</CornerHeading>}

      <div className="mt-3">
        {projects.length > 0 ? (
          <ol className="space-y-6" role="list">
            {projects.map((project) => (
              <ProjectItem key={project.id} {...project} />
            ))}
          </ol>
        ) : (
          <ContentNotFound text="No Projects Found" />
        )}
      </div>
      {metadata && projects.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            More Projects
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
};

export default ProjectList;
