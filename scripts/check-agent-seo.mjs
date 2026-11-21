import assert from "node:assert/strict";
const base = process.argv[2] || "http://localhost:3000";
for (const path of [
  "/robots.txt",
  "/llms.txt",
  "/sitemap.md",
  "/AGENTS.md",
  "/content/profile.md",
  "/content/projects.md",
  "/content/blog/en/fafo-learning.md",
  "/sitemap.xml",
]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const text = await response.text();
  assert.ok(text.length > 100, path);
  assert.ok(!(response.headers.get("content-type") || "").includes("text/html"), path);
  if (path.endsWith(".md") || path === "/llms.txt") assert.ok(text.startsWith("# "), path);
  if (path === "/robots.txt")
    assert.ok(text.includes("Sitemap: https://www.sanskargupta.dev/sitemap.xml"));
  if (path === "/content/blog/en/fafo-learning.md") {
    assert.ok(text.includes("## The problem with conventional learning"));
    assert.equal(response.headers.get("x-robots-tag"), "noindex");
  }
}
for (const path of ["/content/blog/en/nonexistent.md", "/this-page-does-not-exist-seo-check"]) {
  assert.equal((await fetch(new URL(path, base))).status, 404, path);
}
for (const path of ["/", "/blog/en/fafo-learning", "/projects/studdy-buddy"]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const canonical = /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/.exec(html)?.[1];
  assert.equal(
    canonical?.replace(/\/$/, ""),
    `https://www.sanskargupta.dev${path === "/" ? "" : path}`
  );
  const schemas = [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((match) => JSON.parse(match[1]));
  assert.ok(schemas.length >= 2, path);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path);
  assert.equal((html.match(/<main(?:\s|>)/g) || []).length, 1, path);
  assert.ok(!JSON.stringify(schemas).includes("userInteractionCount"), path);
}
console.log(
  "Agent SEO checks passed: discovery, Markdown, canonical URLs, schema, landmarks, and 404s."
);
