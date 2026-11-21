import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCodeTitles from "rehype-code-titles";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";
import rehypeExternalLink from "rehype-external-links";

const computedFields = <T extends { slug: string }>(data: T) => ({
  ...data,
  slugAsParams: data.slug.split("/").slice(1).join("/"),
});

const posts = defineCollection({
  name: "Post",
  pattern: "posts/en/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(99),
      slug: s.path(),
      description: s.string().max(999),
      cover: s.image(),
      date: s.isodate(),
      updatedAt: s.isodate().optional(),
      published: s.boolean().default(true),
      author: s.string().nullable().default("Sanskar Gupta"),
      dateType: s.enum(["published", "editorial"]).default("published"),
      importedAt: s.isodate().optional(),
      originalPublishedAt: s.isodate().optional(),
      body: s.mdx(),
      markdown: s.raw(),
      toc: s.toc(),
      tags: s.array(s.string()),
      metadata: s.metadata(),
    })
    .transform(computedFields),
});

export default defineConfig({
  root: "src/content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      rehypeCodeTitles,
      [rehypePrettyCode, { theme: "catppuccin-mocha" }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["subheading-anchor"],
          },
        },
      ],
      [
        rehypeExternalLink,
        {
          properties: { target: "_blank", rel: "noopener noreferrer" },
        },
      ],
    ],
    remarkPlugins: [],
  },
});
