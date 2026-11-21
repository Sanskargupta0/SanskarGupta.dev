import { origin, markdownResponse } from "~/lib/agent-content";
export function GET() {
  return markdownResponse(`# Agent guide: Sanskar Gupta

This is a public software developer portfolio and technical blog.

Start with ${origin}/llms.txt and ${origin}/sitemap.xml.
Read ${origin}/content/profile.md and ${origin}/content/projects.md for portfolio content.
Article Markdown is available at /content/blog/{article-slug}.md; preserve the en/ prefix from the article URL.
Use the canonical HTML URL when citing content. Dates marked editorial are collection dates, not original publication dates.
Only published articles are exposed. No authentication is needed to read public content.
Internal /api/ endpoints are not a public agent API; do not submit forms or increment views while crawling.
`);
}
