import { articleMarkdown, markdownResponse, origin } from "~/lib/agent-content";
export function generateStaticParams() {
  return [];
}
export function GET(_: Request, { params }: { params: { slug: string[] } }) {
  const path = params.slug.join("/");
  if (!path.endsWith(".md")) return new Response("Not found", { status: 404 });
  const slug = path.slice(0, -3);
  const body = articleMarkdown(slug);
  return body
    ? markdownResponse(body, `${origin}/blog/${slug}`)
    : new Response("Not found", { status: 404 });
}
