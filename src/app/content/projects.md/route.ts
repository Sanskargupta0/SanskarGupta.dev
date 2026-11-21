import { projectMarkdown, markdownResponse, origin } from "~/lib/agent-content";
export function GET() {
  return markdownResponse(projectMarkdown(), `${origin}/projects`);
}
