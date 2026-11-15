"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function StatusBadge() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="h-[30px] w-[190px] max-w-full shrink-0">
      {mounted && (
        <iframe
          title="Service status"
          src={`https://status.sanskargupta.dev/badge?theme=${resolvedTheme === "dark" ? "dark" : "light"}`}
          width="250"
          height="30"
          scrolling="no"
          loading="lazy"
          className="block max-w-full border-0"
          style={{ colorScheme: "normal" }}
        />
      )}
    </div>
  );
}
