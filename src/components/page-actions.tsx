"use client";

import { usePathname } from "next/navigation";
import HomeSocialDock from "~/components/home-social-dock";

export default function PageActions() {
  const pathname = usePathname();
  if (pathname?.startsWith("/blog/")) return null;

  return (
    <>
      <div className="h-16 shrink-0" aria-hidden="true" />
      <HomeSocialDock />
    </>
  );
}
