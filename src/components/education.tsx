"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronRight } from "lucide-react";
import { education } from "~/constants/education";
import CornerHeading from "~/components/ui/corner-heading";

function EducationRow({ entry }: { entry: (typeof education)[number] }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <article aria-label={entry.institute} className="relative py-3 pl-11 pr-3 sm:pr-4">
      <span aria-hidden="true" className="absolute left-[29px] top-8 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-teal-600 dark:bg-[#00adb5]" />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-start gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-muted">
          <Image src={entry.logo} alt={entry.institute + " logo"} width={40} height={40} className="size-10 bg-white object-contain p-0.5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4">
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-snug">{entry.institute}</span>
            <span className="mt-1 block text-[13px] leading-5 text-muted-foreground">{entry.degree}</span>
          </span>
          <span className="shrink-0 text-xs leading-5 text-muted-foreground sm:text-right">
            <span className="block">{entry.years}</span>
            <span className="block font-medium text-teal-700 dark:text-[#00adb5]">{entry.grade}</span>
          </span>
        </span>
        {open ? <ChevronDown aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> : <ChevronRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
      </button>
      <div id={id} hidden={!open} className="mt-4 space-y-3 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
        {entry.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </article>
  );
}

export default function Education() {
  return (
    <section id="education" aria-label="Education">
      <CornerHeading>Education</CornerHeading>
      <div className="relative my-3 py-3">
        <div aria-hidden="true" className="absolute bottom-0 left-7 top-0 w-0.5" style={{ backgroundImage: "repeating-linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.5) 0px, hsl(var(--muted-foreground) / 0.5) 6px, transparent 6px, transparent 10px)" }} />
        {education.map((entry) => <EducationRow key={entry.institute} entry={entry} />)}
      </div>
    </section>
  );
}
