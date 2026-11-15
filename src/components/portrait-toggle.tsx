"use client";

import { RotateCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { usePortrait } from "~/providers/portrait";

export default function PortraitToggle() {
  const { showPhoto, flip } = usePortrait();
  const label = showPhoto ? "Show mascot" : "Show profile photo";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={flip}
      aria-label={label}
      title={label}
      aria-pressed={showPhoto}
      className="absolute right-2 top-2 z-10 size-6 rounded-full border border-border bg-background/90 p-0 text-foreground shadow-sm backdrop-blur-sm transition-transform hover:rotate-12 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <RotateCw className="size-4" aria-hidden="true" />
    </Button>
  );
}
