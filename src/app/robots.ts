import type { MetadataRoute } from "next";
import config from "~/config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "Claude-SearchBot",
          "Claude-User",
          "PerplexityBot",
        ],
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: `https://${config.domainName}/sitemap.xml`,
  };
}
