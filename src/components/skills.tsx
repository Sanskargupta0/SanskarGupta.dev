"use client";

import { useRef } from "react";
import { BACKEND_STACKS, FRONTEND_STACKS, type stacksProps } from "~/constants/stack";
import CornerHeading from "~/components/ui/corner-heading";
import { cn } from "~/lib/utils";
import styles from "./skills.module.css";

const iconColors: Record<string, string> = {
  Vite: "text-violet-600 dark:text-yellow-50",
  Bun: "text-amber-800 dark:text-yellow-50",
  Flask: "text-neutral-700 dark:text-neutral-200",
  GitHub: "text-neutral-800 dark:text-neutral-100",
};

function SkillRow({
  stacks,
  reverse,
  label,
}: {
  stacks: stacksProps;
  reverse?: boolean;
  label: string;
}) {
  const drag = useRef<{ x: number; scrollLeft: number } | null>(null);
  return (
    <div
      className={cn(
        styles.viewport,
        "select-none rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      role="group"
      aria-label={label}
      tabIndex={0}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        drag.current = { x: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const groupWidth =
          event.currentTarget.firstElementChild?.firstElementChild?.getBoundingClientRect().width ??
          0;
        event.currentTarget.scrollLeft = Math.max(
          0,
          Math.min(groupWidth, drag.current.scrollLeft + drag.current.x - event.clientX)
        );
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <div className={cn(styles.track, reverse && styles.reverse)}>
        {[0, 1, 2].map((copy) => (
          <ul key={copy} className={styles.copy} role="list" aria-hidden={copy > 0 || undefined}>
            {Object.entries(stacks).map(([name, { Icon, className }]) => (
              <li key={name} className={cn(styles.item, "text-foreground")}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon className={iconColors[name] ?? className} />
                </span>
                <span className={styles.name}>{name}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section aria-label="skills" className="min-w-0 bg-background">
      <CornerHeading>My Skills</CornerHeading>
      <SkillRow stacks={FRONTEND_STACKS} label="Frontend skills" />
      <SkillRow stacks={BACKEND_STACKS} reverse label="Backend skills and tools" />
    </section>
  );
}
