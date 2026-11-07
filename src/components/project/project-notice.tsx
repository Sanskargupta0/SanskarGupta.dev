"use client";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { FaInfoCircle } from "react-icons/fa";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export default function ProjectNotice({
  kind,
  project,
}: {
  kind: "private" | "demo";
  project: string;
}) {
  const [open, setOpen] = useState(false);
  const privateRepo = kind === "private";
  return (
    <Tooltip open={open} onOpenChange={setOpen} delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={privateRepo ? project + " repository is private" : project + " demo warning"}
          onClick={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm align-middle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {privateRepo ? (
            <LockKeyhole
              size={14}
              aria-hidden="true"
              className="text-green-600 dark:text-[#02ff67]"
            />
          ) : (
            <FaInfoCircle
              size={14}
              aria-hidden="true"
              className="text-amber-600 dark:text-amber-400"
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipPrimitive.Portal>
        <TooltipContent
          side="top"
          sideOffset={6}
          collisionPadding={16}
          className="max-w-[calc(100vw-2rem)] space-y-0.5 px-3 py-2 text-center text-xs font-normal"
        >
          <p className="text-red-600 dark:text-red-400">
            {privateRepo ? "This is a private project" : "Live demo might not work properly"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {privateRepo
              ? "GitHub repository/code is not publicly available."
              : "Check GitHub for code and setup instructions."}
          </p>
        </TooltipContent>
      </TooltipPrimitive.Portal>
    </Tooltip>
  );
}
