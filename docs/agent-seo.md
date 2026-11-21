# Search and agent discovery

The production canonical hostname is https://www.sanskargupta.dev. Metadata,
XML sitemap, RSS, structured data, and agent resources use this hostname.

## Resources

- `/robots.txt`: public crawling allowed; internal API paths excluded. Explicit
  AI search/user agent groups do not change the wildcard policy for training bots.
- `/llms.txt`: generated portfolio and published article index.
- `/sitemap.xml` and `/sitemap.md`: canonical URL inventories.
- `/AGENTS.md`: public read-only crawling guide, not repository instructions.
- `/content/profile.md`: experience, skills, education, and links.
- `/content/projects.md`: descriptions, technologies, and public source links.
- `/content/blog/en/{slug}.md`: raw article Markdown, with date semantics preserved.

Markdown mirrors send a canonical Link header and `X-Robots-Tag: noindex` to
avoid duplicate search results. They remain crawlable. All content is generated
from the existing collections/shared constants; unpublished posts are excluded.
There is no user-agent cloaking or separate content written for search engines.

JSON-LD is rendered in the original HTML. Person and WebSite entities have stable
IDs; the home page adds ProfilePage, articles add BlogPosting and breadcrumbs,
and project pages add CreativeWork and breadcrumbs. Missing article authors
are not replaced with the portfolio owner's name. No invented engagement counts
or freshness dates are published.

## Checks

Run `node scripts/check-agent-seo.mjs http://localhost:3000` against a running
server, plus TypeScript and production build checks. A production build should
run in a separate checkout if a development server is active.

## Skill workflows and baseline

Guidance reviewed from:
- https://github.com/BartWaardenburg/isagentready-skills (discovery, structured data, semantics)
- https://github.com/mlava/agent-ready-skills (Agent Ready API workflow)
- https://github.com/iannuttall/seo (technical crawl and SEO evidence workflow)

Production baseline, 2026-11-21: SEO CLI 0.12.0 completed a 147-page crawl;
all 147 responses were HTTP 200, with no failed requests. The crawl reported
missing robots.txt and homepage canonical, plus other observations requiring
separate review. This baseline is not a claim of Google indexing or rankings.
The repository's documented `seo next` command was unavailable in the published
CLI, so the supported `seo crawl --url https://www.sanskargupta.dev --json` was used.

Agent Ready's paid scan requires AGENT_READY_API_KEY (Pro); no key is configured.
Search Console/Bing account reports require the owner to authenticate using
`seo login`. Neither credential is needed to serve these website resources.
No paid scans, ranking guarantees, or invented scanner scores are included.
Re-run the production crawl after deployment; local changes cannot alter the
current live site's crawl results. Optional llms.txt/Markdown discovery does not
guarantee adoption by every crawler.
