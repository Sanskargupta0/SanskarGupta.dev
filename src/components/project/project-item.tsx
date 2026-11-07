import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { getProjectHref } from "~/lib/project-links";
import { cn } from "~/lib/utils";
import type { TProject } from "./_project-mock";
import styles from "./project-item.module.css";
import ProjectNotice from "./project-notice";

export default function ProjectItem({
  title,
  description,
  deployedURL,
  cover,
  stacks,
  isRepo,
  repoUrl,
  isPrivate,
  demoWarning,
}: TProject) {
  const href = getProjectHref(title);
  const repository =
    !isPrivate && isRepo && repoUrl && !repoUrl.includes("your-username") ? repoUrl : null;
  return (
    <li>
      <article aria-label={title} className={styles.card}>
        <Link
          href={href}
          aria-label={"Read about " + title}
          className={cn(
            styles.banner,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <Image
            alt={title + " project preview"}
            placeholder="blur"
            src={cover}
            fill
            sizes="(max-width: 700px) calc(100vw - 4rem), 300px"
          />
        </Link>
        <div className={styles.details}>
          <div className={styles.header}>
            <h3 className={cn(styles.title, "flex items-center gap-1")}>
              <Link
                href={href}
                className="rounded-sm transition-colors hover:text-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {title}
              </Link>
              {isPrivate && <ProjectNotice kind="private" project={title} />}
              {demoWarning && <ProjectNotice kind="demo" project={title} />}
            </h3>
            <div className={styles.actions}>
              {deployedURL && (
                <a
                  href={deployedURL}
                  aria-label={"Visit " + title + " live"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    styles.action,
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <ExternalLink size={12} aria-hidden="true" />
                  Live
                </a>
              )}
              {repository && (
                <a
                  href={repository}
                  aria-label={"View " + title + " on GitHub"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    styles.action,
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <FaGithub size={13} aria-hidden="true" />
                  GitHub
                </a>
              )}
            </div>
          </div>
          <p className={styles.description}>{description}</p>
          <span className={styles.techLabel}>Technologies Used:</span>
          <ul aria-label={title + " technologies"} role="list" className={styles.technologies}>
            {stacks.map((stack) => (
              <li key={stack} className={styles.tag}>
                {stack}
              </li>
            ))}
          </ul>
          <Link
            href={href}
            className="mt-2 inline-block rounded-sm text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Read project<span className="sr-only">: {title}</span>
          </Link>
        </div>
      </article>
    </li>
  );
}
