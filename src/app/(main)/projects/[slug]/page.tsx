import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import projects, { categories } from "~/components/project/_project-mock";
import { buttonVariants } from "~/components/ui/button";
import { getProjectHref, getProjectSlug } from "~/lib/project-links";
import config from "~/config";
import { JsonLd, getSEOTags } from "~/lib/seo";

function getProject(slug: string) {
  const project = projects.find((item) => getProjectSlug(item.title) === slug);
  if (!project) notFound();
  return project;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: getProjectSlug(project.title) }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  return getSEOTags({
    title: project.title + " | Sanskar Gupta",
    description: project.description,
    canonicalUrlRelative: getProjectHref(project.title),
    keywords: [...project.stacks, project.title],
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.cover.src],
    },
  });
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  return (
    <article className="!mt-8 space-y-8 pb-8" aria-labelledby="project-title">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "CreativeWork", "@id": `https://${config.domainName}${getProjectHref(project.title)}#project`,
          name: project.title, description: project.description, url: `https://${config.domainName}${getProjectHref(project.title)}`,
          creator: { "@id": `https://${config.domainName}/#person` }, keywords: project.stacks },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `https://${config.domainName}/` },
          { "@type": "ListItem", position: 2, name: "Projects", item: `https://${config.domainName}/projects` },
          { "@type": "ListItem", position: 3, name: project.title, item: `https://${config.domainName}${getProjectHref(project.title)}` },
        ] },
      ] }} />
      <Link
        href="/projects"
        className="el-focus-styles inline-flex items-center gap-2 rounded-sm text-sm text-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to projects
      </Link>
      <header className="space-y-4">
        <h1 id="project-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {project.title}
        </h1>
        <ul aria-label="Project categories" className="flex flex-wrap gap-2">
          {project.categories.map((category) => (
            <li
              key={category}
              className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"
            >
              {categories.find((item) => item.id === category)?.label ?? category}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          {project.deployedURL && (
            <a
              href={project.deployedURL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              <ExternalLink aria-hidden="true" className="mr-2 size-4" />
              Live Preview
            </a>
          )}
          {project.isRepo && project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Github aria-hidden="true" className="mr-2 size-4" />
              View source
            </a>
          )}
        </div>
      </header>
      <Image
        src={project.cover}
        alt={project.title + " project preview"}
        priority
        placeholder="blur"
        className="h-auto w-full rounded-lg border border-border"
        sizes="(max-width: 960px) 100vw, 880px"
      />
      <section aria-labelledby="project-overview" className="space-y-3">
        <h2 id="project-overview" className="text-xl font-semibold">
          Overview
        </h2>
        <p className="max-w-prose leading-7 text-muted-foreground">{project.description}</p>
      </section>
      <section aria-labelledby="project-stack" className="space-y-3">
        <h2 id="project-stack" className="text-xl font-semibold">
          Technology stack
        </h2>
        <ul className="flex flex-wrap gap-2">
          {project.stacks.map((stack) => (
            <li key={stack} className="rounded-md border border-border px-3 py-1.5 text-sm">
              {stack}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
