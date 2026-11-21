import type { Metadata } from "next";

import config from "~/config";

const defaultShareTitle = "Sanskar Gupta, software developer";
const defaultShareDescription = "I am a software developer with over 3 years of experience.";

const defaultSocialImage = {
  url: "/images/og/sanskar-gupta.png",
  width: 1200,
  height: 630,
  alt: "Sanskar Gupta, software developer with over 3 years of experience. I build scalable software and full-stack products and ship them fast.",
};

export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative = "/",
  extraTags,
}: Metadata & {
  canonicalUrlRelative?: string;
  extraTags?: Record<string, any>;
} = {}) => {
  return {
    title: title || defaultShareTitle,
    description: description || defaultShareDescription,
    keywords: keywords || [
      "portfolio",
      "personal portfolio",
      "web developer",
      "software engineer",
      "front-end developer",
      "creative",
      "coder",
      "programmer",
      "developer",
      "portfolio website",
    ],
    robots: { index: true, follow: true },
    applicationName: "Sanskar Gupta",
    authors: [{ name: "Sanskar Gupta", url: `https://${config.domainName}/` }],

    metadataBase: new URL(`https://${config.domainName}/`),

    openGraph: {
      title: openGraph?.title || title || defaultShareTitle,
      description: openGraph?.description || description || defaultShareDescription,
      url: openGraph?.url || `https://${config.domainName}${canonicalUrlRelative}`,
      siteName: "Sanskar Gupta",
      images: openGraph?.images ?? [defaultSocialImage],
      locale: "en_US",
      type: "website",
    },

    twitter: {
      title: openGraph?.title || title || defaultShareTitle,
      description: openGraph?.description || description || defaultShareDescription,
      card: "summary_large_image",
      images: openGraph?.images ?? [defaultSocialImage],
      creator: "@sanskarGuptaDev",
    },

    ...(canonicalUrlRelative && {
      alternates: {
        canonical: canonicalUrlRelative,
        types: {
          "application/rss+xml": `https://${config.domainName}/feed.xml`,
          ...(canonicalUrlRelative === "/" ? { "text/markdown": `https://${config.domainName}/content/profile.md` }
            : canonicalUrlRelative === "/projects" ? { "text/markdown": `https://${config.domainName}/content/projects.md` }
            : canonicalUrlRelative.startsWith("/blog/") ? { "text/markdown": `https://${config.domainName}/content${canonicalUrlRelative}.md` } : {}),
        },
      },
    }),

    ...extraTags,
  };
};

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  }} />;
}

export const renderSchemaTags = () => {
  const origin = `https://${config.domainName}`;
  return <JsonLd data={{
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", "@id": `${origin}/#person`, name: "Sanskar Gupta",
        url: `${origin}/`, jobTitle: config.appDesignation, description: config.appDescription,
        image: `${origin}/images/og/sanskar-gupta.png`,
        sameAs: [config.social.github, config.social.linkedin, config.social.twitter, config.social.instagram] },
      { "@type": "WebSite", "@id": `${origin}/#website`, name: "Sanskar Gupta",
        url: `${origin}/`, inLanguage: "en", publisher: { "@id": `${origin}/#person` } },
    ],
  }} />;
};
