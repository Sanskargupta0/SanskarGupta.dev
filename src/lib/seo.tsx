import type { Metadata } from "next";
import Script from "next/script";
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
  canonicalUrlRelative,
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
    applicationName: "Sanskar Gupta",
    authors: [{ name: "Sanskar Gupta", url: `https://${config.domainName}/` }],

    metadataBase: new URL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : `https://${config.domainName}/`
    ),

    openGraph: {
      title: openGraph?.title || title || defaultShareTitle,
      description: openGraph?.description || description || defaultShareDescription,
      url: openGraph?.url || `https://${config.domainName}/`,
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
      creator: "@Sanskar362002",
    },

    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),

    ...extraTags,
  };
};

export const renderSchemaTags = () => {
  return (
    <Script
      id="schemaTags"
      strategy="afterInteractive"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "http://schema.org",
          "@type": "ProfilePage",
          name: config.appName,
          description: config.appDescription,
          image: `https://${config.domainName}/icon.png`,
          url: `https://${config.domainName}/`,

          dateCreated: "2022-12-23T12:34:00-05:00",
          dateModified: "2023-12-26T14:53:00-05:00",
          mainEntity: {
            "@type": "Person",
            name: "Sanskar Gupta",
            alternateName: "Sanskar362002",
            identifier: "123475623",
            interactionStatistic: [
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/FollowAction",
                userInteractionCount: 1,
              },
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/LikeAction",
                userInteractionCount: 5,
              },
            ],
          },
          applicationCategory: "ProfilePage",
          agentInteractionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/WriteAction",
            userInteractionCount: 2346,
          },
        }),
      }}
    />
  );
};
