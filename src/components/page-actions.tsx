"use client";

import { usePathname } from "next/navigation";
import HomeSocialDock from "~/components/home-social-dock";
import DownloadResumeBtn from "~/components/ui/download-resume-btn";

export default function PageActions() {
  const pathname = usePathname();
  if (pathname !== "/") return <DownloadResumeBtn />;
  return (
    <>
      <div className="h-24 shrink-0" aria-hidden="true" />
      <HomeSocialDock />
    </>
  );
}
