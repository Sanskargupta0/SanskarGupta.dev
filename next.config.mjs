import { cpSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import createJiti from "jiti";
const jiti = createJiti(fileURLToPath(import.meta.url));

// Keep Next.js and Velite on the project's Sharp installation. Vercel's
// global Sharp override loads a second native libvips and can crash the build.
process.env.NEXT_SHARP_PATH = "sharp";

jiti("./src/constants/env");

const isDev = process.argv.indexOf("dev") !== -1;
const isBuild = process.argv.indexOf("build") !== -1;

// Serve the matching PDF.js worker and rendering assets without passing the
// prebuilt ES module worker through Next 14's JavaScript minifier.
if (isDev || isBuild) {
  const pdfAssets = new URL("./public/pdfjs/", import.meta.url);
  mkdirSync(pdfAssets, { recursive: true });
  for (const asset of ["build/pdf.worker.min.mjs", "cmaps", "standard_fonts", "wasm", "LICENSE"]) {
    const source = new URL(`./node_modules/pdfjs-dist/${asset}`, import.meta.url);
    const destination = new URL(asset.replace("build/", ""), pdfAssets);
    cpSync(source, destination, { recursive: true });
  }
}

if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = "1";
  const { build } = await import("velite");
  await build({ watch: isDev, clean: !isDev });
}

/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Webpack cannot statically follow these libraries' runtime imports.
      // Filter only their documented cache-scan notices, preserving the cache
      // and every other infrastructure warning. See velite.js.org/guide/with-nextjs.
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.infrastructureLog.tap(
            "FilterDynamicImportCacheNotices",
            (name, type, args) => {
              if (
                name !== "webpack.cache.PackFileCacheStrategy/webpack.FileSystemInfo" ||
                type !== "warn"
              )
                return;
              const message = args.map(String).join(" ");
              const isJiti =
                /[\\/]node_modules[\\/]jiti[\\/]lib[\\/]jiti\.mjs/.test(message) &&
                message.includes("failed at 'import(id)'");
              const isVelite =
                /[\\/]node_modules[\\/]velite[\\/]dist[\\/]velite-[^\\/]+\.js/.test(message) &&
                message.includes("failed at 'import(configUrl.href)'");
              if (message.startsWith("Parsing of ") && (isJiti || isVelite)) return true;
            }
          );
        },
      });
      // Avoid PDF.js internal Webpack runtime names colliding with Next 14's
      // eval-based development source maps. The minified build is the same version.
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdfjs-dist$": fileURLToPath(
          new URL("./node_modules/pdfjs-dist/build/pdf.min.mjs", import.meta.url)
        ),
      };
    }
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  redirects: async () => {
    return [
      {
        source: "/linkedin",
        destination: "https://www.linkedin.com/in/sanskarguptadev/",
        permanent: true,
      },
      {
        source: "/github",
        destination: "https://github.com/SanskarGupta0",
        permanent: true,
      },
      {
        source: "/support",
        destination: "https://buymeacoffee.com/SanskarGupta0",
        permanent: true,
      },
      {
        source: "/instagram",
        destination: "https://www.instagram.com/sanskargupta.dev/",
        permanent: true,
      },
      {
        source: "/twitter",
        destination: "https://x.com/sanskarGuptaDev",
        permanent: true,
      },
      {
        source: "/youtube",
        destination: "https://www.youtube.com/@sanskargupta9454",
        permanent: true,
      },
      {
        source: "/x",
        destination: "https://x.com/sanskarGuptaDev",
        permanent: true,
      },
      {
        source: "/peerlist",
        destination: "https://peerlist.io/sanskargupta0",
        permanent: true,
      },
      {
        source: "/discord",
        destination: "https://discord.com/users/Sanskargupta0",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
