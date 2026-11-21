import { getCommandSearchEntries } from "~/lib/command-search";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { fontSans } from "~/components/ui/fonts";
import { getSEOTags, renderSchemaTags } from "~/lib/seo";
import { cn } from "~/lib/utils";
import RootProviders from "~/providers";
import "~/styles/globals.css";

export const viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata = getSEOTags();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="relative" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <noscript>
          <style>{"[data-site-loader] { display: none !important; }"}</style>
        </noscript>
        {renderSchemaTags()}

        <RootProviders searchEntries={getCommandSearchEntries()}>{children}</RootProviders>

        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
