import sitemap from "~/app/sitemap";
import { markdownResponse } from "~/lib/agent-content";
export function GET() {
  return markdownResponse(
    `# Sitemap: Sanskar Gupta\n\n${sitemap()
      .map((entry) => `- [${new URL(entry.url).pathname}](${entry.url})`)
      .join("\n")}\n`
  );
}
