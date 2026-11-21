import { posts } from "#site/content";
import projects from "~/components/project/_project-mock";
import config from "~/config";
import { getProjectHref } from "~/lib/project-links";
export const origin = `https://${config.domainName}`;
export const publishedPosts = posts.filter((post) => post.published);
const link = (title: string, path: string, description = "") =>
  `- [${title}](${origin}${path})${description ? `: ${description}` : ""}`;
export function contentIndex() {
  return `# Sanskar Gupta

> ${config.appDescription}

## Portfolio
${[
  link("Profile", "/", "Experience, skills, education, and contact details"),
  link("Projects", "/projects"),
  link("Blog", "/blog"),
  link("Resume", "/resume"),
  link("Profile Markdown", "/content/profile.md"),
  link("Project Markdown", "/content/projects.md"),
].join("\n")}

## Articles
${publishedPosts.map((post) => link(post.title, `/blog/${post.slugAsParams}`, `${post.description} ([Markdown](${origin}/content/blog/${post.slugAsParams}.md))`)).join("\n")}

## Machine-readable resources
${[
  link("Markdown sitemap", "/sitemap.md"),
  link("XML sitemap", "/sitemap.xml"),
  link("RSS feed", "/feed.xml"),
  link("Agent guide", "/AGENTS.md"),
].join("\n")}
`;
}
export function projectMarkdown() {
  return `# Projects by Sanskar Gupta

${projects
  .map(
    (project) =>
      `## ${project.title}

${project.description}

Technologies: ${project.stacks.join(", ")}

Page: ${origin}${getProjectHref(project.title)}
${project.isRepo && project.repoUrl ? `Source: ${project.repoUrl}` : "Source repository: private"}
`
  )
  .join("\n")}`;
}
export function articleMarkdown(slug: string) {
  const post = publishedPosts.find((post) => post.slugAsParams === slug);
  if (!post) return null;
  return `# ${post.title}

${post.description}

Canonical: ${origin}/blog/${post.slugAsParams}
Date: ${post.date} (${post.dateType})
${post.originalPublishedAt ? `Original publication date: ${post.originalPublishedAt}\n` : ""}${post.author ? `Author: ${post.author}\n` : ""}
${post.markdown}
`;
}
export function markdownResponse(body: string, canonical?: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      ...(canonical ? { Link: `<${canonical}>; rel="canonical"`, "X-Robots-Tag": "noindex" } : {}),
    },
  });
}
