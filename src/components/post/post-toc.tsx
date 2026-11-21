"use client";

import type { Post } from "#site/content";
import * as Dialog from "@radix-ui/react-dialog";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

function ProgressRing({ progress }: { progress: MotionValue<number> }) {
  const indicator = useRef<HTMLSpanElement>(null);
  const offset = useTransform(progress, (value) => 100 - Math.min(1, Math.max(0, value)) * 100);
  useMotionValueEvent(progress, "change", (value) => {
    indicator.current?.setAttribute(
      "aria-valuenow",
      String(Math.round(Math.min(1, Math.max(0, value)) * 100))
    );
  });

  return (
    <span
      ref={indicator}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress.get() * 100)}
      className="relative block size-7 shrink-0"
    >
      <svg viewBox="0 0 28 28" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="14" cy="14" r="11" fill="none" stroke="#52525b" strokeWidth="3" />
        <motion.circle
          cx="14"
          cy="14"
          r="11"
          fill="none"
          stroke="#fafafa"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          style={{ strokeDashoffset: offset }}
        />
      </svg>
    </span>
  );
}

const PostTableOfContent = ({
  toc,
  articleRef,
}: {
  toc: Post["toc"];
  articleRef: RefObject<HTMLElement>;
}) => {
  const [open, setOpen] = useState(false);
  const [activeUrl, setActiveUrl] = useState("");
  const positions = useRef<{ url: string; top: number }[]>([]);
  const pendingTarget = useRef<string | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"],
    layoutEffect: false,
  });
  const items = useMemo(() => {
    const flatten = (
      entries: Post["toc"],
      depth = 0
    ): { title: string; url: string; depth: number }[] =>
      entries.flatMap((entry) => [
        { title: entry.title.replace(/^undefined(?=#)/, ""), url: entry.url, depth },
        ...flatten(entry.items, depth + 1),
      ]);
    return flatten(toc);
  }, [toc]);
  const activeItem = items.find((item) => item.url === activeUrl) ?? items[0];

  const updateSection = useCallback(
    (scrollTop: number) => {
      const marker = scrollTop + Math.min(window.innerHeight * 0.2, 160);
      let current = positions.current[0]?.url ?? "";
      if (scrollYProgress.get() >= 0.995 && positions.current.length > 0) {
        current = positions.current[positions.current.length - 1].url;
      } else {
        for (const item of positions.current) {
          if (item.top > marker) break;
          current = item.url;
        }
      }
      setActiveUrl((previous) => (previous === current ? previous : current));
    },
    [scrollYProgress]
  );

  useMotionValueEvent(scrollY, "change", updateSection);
  useMotionValueEvent(scrollYProgress, "change", () => updateSection(scrollY.get()));

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    const measure = () => {
      positions.current = items.flatMap((item) => {
        const heading = document.getElementById(decodeURIComponent(item.url.slice(1)));
        return heading
          ? [{ url: item.url, top: heading.getBoundingClientRect().top + window.scrollY }]
          : [];
      });
      updateSection(window.scrollY);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(article);
    window.addEventListener("resize", measure);
    document.fonts.ready.then(() => {
      if (article.isConnected) measure();
    });
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [articleRef, items, updateSection]);

  useEffect(() => {
    if (open && activeUrl) {
      document
        .querySelector<HTMLAnchorElement>('[data-toc-link][aria-current="location"]')
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeUrl]);

  const status = (
    <>
      <span className="size-1.5 shrink-0 rounded-full bg-zinc-50" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-left text-xs font-medium">
        {activeItem?.title ?? "Reading article"}
      </span>
      <ProgressRing progress={scrollYProgress} />
    </>
  );

  if (items.length === 0)
    return (
      <div className="article-toc-pill flex items-center gap-3 rounded-full bg-zinc-950 px-4 py-2.5 text-zinc-50 shadow-lg">
        {status}
      </div>
    );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="article-toc-pill flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-50 shadow-lg outline-none transition-colors hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Open table of contents: ${activeItem?.title}`}
        >
          {status}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm" />
        <Dialog.Content
          className="article-toc-panel fixed left-1/2 z-50 flex w-[min(25rem,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-50 shadow-2xl outline-none"
          onCloseAutoFocus={(event) => {
            if (!pendingTarget.current) return;
            event.preventDefault();
            const target = pendingTarget.current;
            pendingTarget.current = null;
            requestAnimationFrame(() => {
              const heading = document.getElementById(decodeURIComponent(target.slice(1)));
              if (!heading) return;
              window.history.replaceState(null, "", target);
              heading.setAttribute("tabindex", "-1");
              heading.focus({ preventScroll: true });
              heading.scrollIntoView({
                behavior: reduceMotion ? "instant" : "smooth",
                block: "start",
              });
            });
          }}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <Dialog.Title className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Table of contents
            </Dialog.Title>
            <Dialog.Close
              className="rounded-md p-1 text-zinc-400 outline-none hover:text-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-50"
              aria-label="Close table of contents"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Choose a section to jump to. The highlighted section follows your reading position.
          </Dialog.Description>
          <nav
            aria-label="Article sections"
            className="max-h-[min(60dvh,30rem)] overflow-y-auto overscroll-contain px-3 pb-3"
          >
            <ol className="space-y-1">
              {items.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    data-toc-link
                    aria-current={item.url === activeItem?.url ? "location" : undefined}
                    className={`flex items-center gap-3 rounded-lg py-2.5 pr-3 text-sm outline-none transition-colors hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-50 ${item.url === activeItem?.url ? "bg-zinc-800 text-zinc-50" : "text-zinc-400"}`}
                    style={{ paddingLeft: 12 + item.depth * 14 }}
                    onClick={(event) => {
                      event.preventDefault();
                      pendingTarget.current = item.url;
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1">{item.title}</span>
                    {item.url === activeItem?.url && (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-zinc-50"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <Dialog.Close
            className="flex w-full items-center gap-3 border-t border-zinc-800 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-50"
            aria-label={`Close table of contents: ${activeItem?.title}`}
          >
            {status}
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PostTableOfContent;
