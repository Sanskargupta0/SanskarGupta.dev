"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Caveat } from "next/font/google";
import { TextEffect } from "~/components/ui/text-effect";
import { VapourExit } from "~/components/ui/vapour-text-effect";
import styles from "./music-source-note.module.css";

const handwriting = Caveat({ weight: "400", subsets: ["latin"], display: "swap" });
const desktopQuery = "(min-width: 1280px) and (hover: hover) and (pointer: fine)";
// Keep the claim across React remounts, with session storage covering reloads too.
const playedAnnotations = new Set<string>();
const writing: { container: Variants; item: Variants } = {
  container: {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
  },
  item: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.08, ease: "linear" } },
  },
};

// Wait for the existing loader, font and visible copy before starting.
function useAnnotationReveal(allSizes: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const key = `portfolio-annotation:${allSizes ? "star" : "music"}:v1`;
  useEffect(() => {
    const element = ref.current;
    if (!element || started) return;
    let played = playedAnnotations.has(key);
    try {
      played ||= sessionStorage.getItem(key) === "played";
    } catch {
      // The in-memory claim still works when browser storage is unavailable.
    }
    if (played) {
      setAlreadyPlayed(true);
      return;
    }
    const desktop = window.matchMedia(desktopQuery);
    let fontsReady = false;
    let disposed = false;
    const reveal = () => {
      if (
        disposed ||
        !fontsReady ||
        (!allSizes && !desktop.matches) ||
        document.querySelector("[data-site-loader]")
      )
        return;
      const bounds = element.getBoundingClientRect();
      const copy = element.querySelector(":scope > span")?.getBoundingClientRect();
      if (allSizes && copy && (copy.top < 16 || copy.bottom > innerHeight - 72)) return;
      if (bounds.width && bounds.bottom > 0 && bounds.top < innerHeight) {
        playedAnnotations.add(key);
        try {
          sessionStorage.setItem(key, "played");
        } catch {
          // Navigation remains protected by the in-memory claim.
        }
        setStarted(true);
      }
    };
    const loader = new MutationObserver(reveal);
    loader.observe(document.body, { childList: true, subtree: true });
    const visibility = new IntersectionObserver(reveal, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: allSizes ? "-16px 0px -72px 0px" : "0px",
    });
    visibility.observe(element);
    desktop.addEventListener("change", reveal);
    void document.fonts.ready.then(() => {
      fontsReady = true;
      reveal();
    });
    return () => {
      disposed = true;
      loader.disconnect();
      visibility.disconnect();
      desktop.removeEventListener("change", reveal);
    };
  }, [started, allSizes, key]);
  return { ref, started, alreadyPlayed };
}

// Expiry continues offscreen; the one-shot exit waits until the visitor can see it.
function useAnnotationExit(
  ref: RefObject<HTMLSpanElement>,
  ready: boolean,
  reducedMotion: boolean,
  allSizes: boolean
) {
  const [phase, setPhase] = useState<"idle" | "dissolving" | "cleared">("idle");
  const deadline = useRef<number | null>(null);
  const finish = useCallback(() => setPhase("cleared"), []);
  useEffect(() => {
    const element = ref.current;
    if (!ready || !element || phase !== "idle") return;
    deadline.current ??= Date.now() + 7000;
    const desktop = matchMedia(desktopQuery);
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      clearTimeout(timer);
      const remaining = deadline.current! - Date.now();
      if (remaining > 0) {
        timer = setTimeout(check, remaining);
        return;
      }
      const bounds = element.getBoundingClientRect();
      const copy = element.querySelector(":scope > span")?.getBoundingClientRect();
      if (allSizes && copy && (copy.top < 16 || copy.bottom > innerHeight - 72)) return;
      if (
        !document.hidden &&
        (allSizes || desktop.matches) &&
        bounds.width > 0 &&
        bounds.bottom > 0 &&
        bounds.top < innerHeight
      ) {
        setPhase(reducedMotion ? "cleared" : "dissolving");
      }
    };
    const observer = new IntersectionObserver(check, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: allSizes ? "-16px 0px -72px 0px" : "0px",
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", check);
    desktop.addEventListener("change", check);
    check();
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", check);
      desktop.removeEventListener("change", check);
    };
  }, [ready, phase, reducedMotion, ref, allSizes]);
  return { phase, finish };
}

function useStarFit(ref: RefObject<HTMLSpanElement>, enabled: boolean) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const note = ref.current;
    const anchor = note?.parentElement;
    const column = anchor?.closest<HTMLElement>("#about > div");
    if (!enabled || !note || !anchor || !column) return;
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;
    let disposed = false;
    const fit = () => {
      if (disposed) return;
      const right = Math.min(column.getBoundingClientRect().right, innerWidth - 16);
      const available = Math.max(1, right - anchor.getBoundingClientRect().right - 2);
      const narrow = available < 110;
      const fontSize = Math.min(20, Math.max(12, available / 8));
      context.font = `400 ${fontSize}px ${getComputedStyle(note).fontFamily}`;
      const lines = narrow
        ? ["like this", "portfolio?", "drop a star!"]
        : ["like this portfolio?", "drop a star!"];
      const textWidth = Math.max(...lines.map((line) => context.measureText(line).width));
      const angle = Math.PI / 30;
      const rotatedWidth = textWidth * Math.cos(angle) + lines.length * fontSize * Math.sin(angle);
      const scale = Math.min(1, Math.max(0.12, (available - rotatedWidth - 4) / 100));
      note.style.setProperty("--star-note-width", `${Math.min(270, available)}px`);
      note.style.setProperty("--star-font-size", `${fontSize}px`);
      note.style.setProperty("--star-arrow-scale", String(scale));
      note.dataset.starFitted = "true";
      setCompact(narrow);
    };
    const observer = new ResizeObserver(fit);
    observer.observe(column);
    observer.observe(anchor);
    window.addEventListener("resize", fit);
    fit();
    void document.fonts.ready.then(fit);
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [ref, enabled]);
  return compact;
}

function HandwrittenAnnotation({ star }: { star: boolean }) {
  const { ref, started, alreadyPlayed } = useAnnotationReveal(star);
  const compact = useStarFit(ref, star);
  const prefersReducedMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const reducedMotion = !!(hydrated && prefersReducedMotion);
  const [complete, setComplete] = useState(false);
  const { phase, finish } = useAnnotationExit(
    ref,
    started && (complete || reducedMotion),
    reducedMotion,
    star
  );
  const delay = star ? 0 : 2.1;
  const reveal = started || !!reducedMotion;
  const paths = star
    ? ["M112 40C104 0 55 0 8 30", "m10 15-2 15 15-3"]
    : ["M48 6C48 58 28 62 6 62", "m13 56-7 6 7 6"];

  if (alreadyPlayed) return null;

  return (
    <span
      ref={ref}
      className={`${handwriting.className} ${styles.note}${star ? ` ${styles.starNote}` : ""}`}
      aria-hidden="true"
      data-music-source-note={star ? undefined : true}
      data-portfolio-star-note={star ? true : undefined}
      data-annotation-ready={started ? true : undefined}
      data-annotation-state={
        phase !== "idle"
          ? phase
          : complete || reducedMotion
            ? "complete"
            : started
              ? "playing"
              : "waiting"
      }
    >
      {/* Handwritten annotation inspired by chanhdai.com; see public/licenses/chanhdai.txt. */}
      <svg
        className={star ? styles.starArrow : styles.arrow}
        viewBox={star ? "0 0 120 50" : "0 0 56 70"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            data-annotation-stroke={index ? "head" : "shaft"}
            vectorEffect={star ? "non-scaling-stroke" : undefined}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={reveal ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    pathLength: {
                      duration: index ? 0.16 : 0.65,
                      delay: delay + index * 0.65,
                      ease: "easeInOut",
                    },
                    opacity: { duration: 0.01, delay: delay + index * 0.65 },
                  }
            }
          />
        ))}
      </svg>
      <TextEffect
        as="span"
        per="char"
        variants={writing}
        reserveSpace
        initial={!complete}
        className={star ? styles.starText : styles.text}
        trigger={reveal}
        delay={delay + 0.88}
        onAnimationComplete={() => {
          if (started) setComplete(true);
        }}
      >
        {star
          ? compact
            ? "like this\nportfolio?\ndrop a star!"
            : "like this portfolio?\ndrop a star!"
          : "switch between my picks\n& my last Spotify listen"}
      </TextEffect>
      <VapourExit
        target={ref}
        active={phase === "dissolving"}
        reducedMotion={reducedMotion}
        allSizes={star}
        onComplete={finish}
      />
    </span>
  );
}

export default function MusicSourceNote() {
  return <HandwrittenAnnotation star={false} />;
}

export function PortfolioStarNote() {
  return <HandwrittenAnnotation star />;
}
