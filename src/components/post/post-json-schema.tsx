import { Post } from "#site/content";
import React from "react";
import config from "~/config";

const JsonSchemaLD = ({ post }: { post: Post }) => {
  return (
    <script
      type="application/ld+json"
      id={`json-ld-article-${post.slugAsParams}`}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://${config.domainName}/blog/${post.slugAsParams}`,
          },
          "@id": `https://${config.domainName}/blog/${post.slugAsParams}#article`,
          isPartOf: { "@id": `https://${config.domainName}/#website` },
          publisher: { "@id": `https://${config.domainName}/#person` },
          name: post.title,
          headline: post.title,
          description: post.description,
          keywords: post.tags.join(", "),
          articleSection: post.tags[0],
          inLanguage: "en",
          image: `https://${config.domainName}${post.cover.src}`,
          datePublished: post.originalPublishedAt ?? post.date,
          dateModified: post.updatedAt ?? post.importedAt ?? post.date,
          author: post.author ? { "@type": "Person", name: post.author } : undefined,
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
};

export default JsonSchemaLD;
