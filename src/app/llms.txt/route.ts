import { contentIndex } from "~/lib/agent-content";
export function GET() {
  return new Response(contentIndex(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
