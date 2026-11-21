import { posts } from "#site/content";
import { notFound } from "next/navigation";
import { JsonSchemaLD } from "~/components/post";
import config from "~/config";
import { JsonLd, getSEOTags } from "~/lib/seo";
import "~/styles/mdx.css";
import BlogDetailClient from "./blog-detail-client";

interface BlogPostParams {
  params: {
    slug: string[];
  };
}

async function getPostFromParams(params: BlogPostParams["params"]) {
  const slug = params?.slug?.join("/");
  const post = posts.find((post) => post.slugAsParams === slug);

  if (post === undefined || !post.published) {
    return notFound();
  }

  return post;
}

export async function generateStaticParams(): Promise<BlogPostParams["params"][]> {
  return posts.map((post) => ({ slug: post.slugAsParams.split("/") }));
}

export async function generateMetadata({ params }: BlogPostParams) {
  const post = await getPostFromParams(params);

  return getSEOTags({
    title: post.title,
    description: post.description,
    keywords: post.tags.map((tag) => tag.replaceAll("-", " ")),
    canonicalUrlRelative: `/blog/${post.slugAsParams}`,
    extraTags: {
      authors: post.author ? [{ name: post.author }] : null,
      openGraph: {
        title: post.title,
        description: post.description,
        url: `https://${config.domainName}/blog/${post.slugAsParams}`,
        images: [
          {
            url: post.cover.src,
            width: 1200,
            height: 660,
          },
        ],
        locale: "en_US",
        type: "article",
        publishedTime: post.originalPublishedAt ?? post.date,
        modifiedTime: post.updatedAt ?? post.importedAt ?? post.date,
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
        images: [post.cover.src],
      },
    },
  });
}

export default async function BlogDetail({ params }: BlogPostParams) {
  const post = await getPostFromParams(params);

  return (
    <>
      <JsonSchemaLD post={post} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `https://${config.domainName}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `https://${config.domainName}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: `https://${config.domainName}/blog/${post.slugAsParams}` },
      ] }} />
      <BlogDetailClient post={{ ...post, markdown: "" }} />
    </>
  );
}
