"use client";

import { useState, type MouseEvent } from "react";
import { Download, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { socialsIcons } from "~/components/socials";
import { FloatingDock, type DockItem } from "~/components/ui/floating-dock";
import config from "~/config";
import { resumeConfig } from "~/constants/resume";

export default function HomeSocialDock() {
  const [downloading, setDownloading] = useState(false);
  async function download(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(resumeConfig.downloadUrl, {
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Download unavailable");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = resumeConfig.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error("Resume download failed. Please try again or visit the Resume page.");
    } finally {
      setDownloading(false);
    }
  }
  const items: DockItem[] = [
    ...socialsIcons
      .filter((social) => !["Discord", "YouTube", "Buy Me a Coffee"].includes(social.label))
      .map((social) => ({
        title: social.label,
        icon: social.icon,
        href: social.href,
      })),
    { title: "Email", icon: <Mail />, href: "mailto:" + config.social.email },
    {
      title: "Download resume",
      icon: downloading ? <Loader2 className="animate-spin" /> : <Download />,
      href: resumeConfig.downloadUrl,
      onClick: download,
      busy: downloading,
    },
  ];
  return (
    <nav
      aria-label="Social links and resume"
      className="pointer-events-none fixed inset-x-4 z-40 md:inset-x-0"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <FloatingDock
        items={items}
        desktopClassName="pointer-events-auto"
        mobileClassName="pointer-events-auto ml-auto"
      />
    </nav>
  );
}
