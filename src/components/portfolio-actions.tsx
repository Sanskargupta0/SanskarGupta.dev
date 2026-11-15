"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { portfolioRepositoryUrl } from "~/constants/portfolio";
import { useCommandMenu } from "~/components/command-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import styles from "./portfolio-star.module.css";

export function PortfolioStar({ celebrationTrigger = 0 }: { celebrationTrigger?: number }) {
  const [clickCelebration, setCelebration] = useState(0);
  const celebration = clickCelebration + celebrationTrigger;
  const [burstVisible, setBurstVisible] = useState(false);
  useEffect(() => {
    if (!celebration) return;
    setBurstVisible(true);
    const reset = setTimeout(() => setBurstVisible(false), 700);
    return () => clearTimeout(reset);
  }, [celebration]);
  const openTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(openTimer.current), []);
  function celebrateAndOpen(event: MouseEvent<HTMLAnchorElement>) {
    // Preserve native modifier-click behavior and avoid delaying reduced-motion users.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    clearTimeout(openTimer.current);
    setCelebration((value) => value + 1);
    openTimer.current = setTimeout(() => {
      window.open(portfolioRepositoryUrl, "_blank", "noopener,noreferrer");
    }, 800);
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={portfolioRepositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Star this portfolio on GitHub"
          onClick={celebrateAndOpen}
          className="el-focus-styles inline-grid size-5 place-items-center rounded-sm align-middle text-muted-foreground transition-colors hover:text-foreground"
        >
          {/* Star artwork adapted from Uiverse.io by anishwij. */}
          <span className={styles.star} data-celebrating={burstVisible} aria-hidden="true">
            <svg className={styles.outline} viewBox="0 0 24 24">
              <path d="M12 2.5L9.45 8.5L3 9.06L7.725 13.39L6.25 19.82L12 16.5L17.75 19.82L16.275 13.39L21 9.06L14.55 8.5L12 2.5ZM12 4.75L14 9.33L18.7 9.75L15 13.07L16.18 17.75L12 15.16L7.82 17.75L9 13.07L5.3 9.75L10 9.33L12 4.75Z" />
            </svg>
            <svg key={`star-${celebration}`} className={styles.filled} viewBox="0 0 24 24">
              <path d="M12 2.5L9.45 8.5L3 9.06L7.725 13.39L6.25 19.82L12 16.5L17.75 19.82L16.275 13.39L21 9.06L14.55 8.5L12 2.5Z" />
            </svg>
            {burstVisible && (
              <svg key={`burst-${celebration}`} className={styles.celebrate} viewBox="0 0 100 100">
                {Array.from({ length: 8 }, (_, index) => {
                  const angle = index * Math.PI / 4;
                  return <circle key={index} r="2" cx="50" cy="50" style={{
                    "--particle-x": `${Math.cos(angle) * 38}px`,
                    "--particle-y": `${Math.sin(angle) * 38}px`,
                  } as CSSProperties} />;
                })}
              </svg>
            )}
          </span>
        </a>
      </TooltipTrigger>
      <TooltipContent>Star this portfolio</TooltipContent>
    </Tooltip>
  );
}

export default function PortfolioActions() {
  const openSearch = useCommandMenu();
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search portfolio (Ctrl+K or Command+K)"
        data-command-search-trigger=""
        aria-keyshortcuts="Control+k Meta+k"
        className="el-focus-styles inline-flex h-8 cursor-pointer items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
        title="Open Command Palette (Ctrl+K)"
      >
        <Search aria-hidden="true" className="size-3.5" />
        <kbd aria-hidden="true" className="font-sans text-xs leading-none">
          {String.fromCharCode(0x2318)}K
        </kbd>
      </button>
    </div>
  );
}
