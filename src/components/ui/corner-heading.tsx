import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export default function CornerHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "relative my-3 inline-block rounded-sm bg-muted px-3 py-1 text-base font-medium text-foreground",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 size-2 rounded-tl-sm border-l-2 border-t-2 border-muted-foreground"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 size-2 rounded-tr-sm border-r-2 border-t-2 border-muted-foreground"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 size-2 rounded-bl-sm border-b-2 border-l-2 border-muted-foreground"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 size-2 rounded-br-sm border-b-2 border-r-2 border-muted-foreground"
      />
      {children}
    </h2>
  );
}
