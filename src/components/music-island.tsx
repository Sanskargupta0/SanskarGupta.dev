"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, SkipForward, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { formatMusicTime, useMusicPlayback } from "~/providers/music-playback";
import styles from "./music-island.module.css";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function SongTitle({
  title,
  reducedMotion,
  onReadingChange,
}: {
  title: string;
  reducedMotion: boolean;
  onReadingChange: (reading: boolean) => void;
}) {
  const viewport = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    const box = viewport.current;
    const label = text.current;
    if (!box || !label) return;
    let disposed = false;
    let lastDistance = -1;
    let animation: Animation | undefined;
    let frame = 0;
    const measure = () => {
      if (disposed) return;
      const distance = Math.max(
        0,
        Math.ceil(label.getBoundingClientRect().width - box.clientWidth)
      );
      if (lastDistance === distance) return;
      lastDistance = distance;
      animation?.cancel();
      cancelAnimationFrame(frame);
      if (!distance || reducedMotion) {
        setScrolling(false);
        onReadingChange(false);
        return;
      }
      setScrolling(true);
      onReadingChange(true);
      frame = requestAnimationFrame(() => {
        if (disposed) return;
        const duration = Math.max(2200, (distance / 30) * 1000 + 1000);
        animation = label.animate(
          [
            { transform: "translateX(0)", offset: 0 },
            { transform: "translateX(0)", offset: 0.15 },
            { transform: "translateX(-" + distance + "px)", offset: 0.8 },
            { transform: "translateX(-" + distance + "px)", offset: 1 },
          ],
          { duration, easing: "linear", fill: "forwards" }
        );
        animation.onfinish = () => {
          animation?.cancel();
          if (!disposed) {
            setScrolling(false);
            onReadingChange(false);
          }
        };
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    void document.fonts.ready.then(measure);
    measure();
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      animation?.cancel();
      onReadingChange(false);
    };
  }, [title, reducedMotion, onReadingChange]);

  return (
    <span ref={viewport} className={styles.label} title={title} data-title-scrolling={scrolling}>
      <span ref={text} className={scrolling ? styles.scrollingTitle : undefined}>
        {title}
      </span>
    </span>
  );
}

export default function MusicIsland() {
  const music = useMusicPlayback();
  const pathname = usePathname();
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  );
  const [position, setPosition] = useState({
    left: 0,
    top: 10,
    inNavbar: false,
    ready: false,
  });
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [interaction, setInteraction] = useState(0);
  const [readingTitle, setReadingTitle] = useState(false);
  const compactButton = useRef<HTMLButtonElement>(null);
  const playButton = useRef<HTMLButtonElement>(null);
  const visible =
    music.hasSession && music.source === "library" && (pathname !== "/" || !music.inlineVisible);

  useLayoutEffect(() => {
    const navigation = document.querySelector('nav[role="navigation"]');
    let frame = 0;
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const rect = navigation?.getBoundingClientRect();
      const inNavbar = Boolean(rect && rect.top >= 0 && rect.bottom <= innerHeight);
      const next = {
        left: innerWidth / 2,
        top: inNavbar && rect ? rect.top + (rect.height - 36) / 2 : 10,
        inNavbar,
        ready: true,
      };
      setPosition((previous) =>
        Object.keys(next).every(
          (key) => previous[key as keyof typeof next] === next[key as keyof typeof next]
        )
          ? previous
          : next
      );
    };
    const schedule = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    if (navigation) observer.observe(navigation);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    void document.fonts.ready.then(schedule);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  useEffect(() => {
    if (visible) setExpanded(true);
    else {
      setHovered(false);
      setKeyboardFocus(false);
    }
  }, [visible, music.track.videoId]);

  useEffect(() => {
    if (!visible || !expanded || hovered || keyboardFocus || readingTitle) return;
    const timer = window.setTimeout(() => setExpanded(false), 2000);
    return () => window.clearTimeout(timer);
  }, [visible, expanded, hovered, keyboardFocus, readingTitle, interaction, music.track.videoId]);

  const collapse = (restoreFocus = false) => {
    setKeyboardFocus(false);
    setExpanded(false);
    if (restoreFocus) requestAnimationFrame(() => compactButton.current?.focus());
  };
  const reveal = (keyboard = false, moveFocus = false) => {
    setExpanded(true);
    setInteraction((value) => value + 1);
    setKeyboardFocus(keyboard);
    if (keyboard && moveFocus) {
      requestAnimationFrame(() => playButton.current?.focus());
    }
  };
  const artwork = (
    <Image
      unoptimized
      src={`https://i.ytimg.com/vi/${music.track.videoId}/default.jpg`}
      alt=""
      width={24}
      height={24}
      className={styles.artwork}
    />
  );

  return (
    <div
      className="pointer-events-none fixed z-40 max-w-[calc(100vw-24px)] -translate-x-1/2"
      data-music-nav-aligned={position.inNavbar}
      style={{
        left: position.left,
        top: position.inNavbar ? position.top : "calc(10px + env(safe-area-inset-top, 0px))",
      }}
    >
      <AnimatePresence>
        {visible && position.ready && (
          <motion.div
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.65, y: position.inNavbar ? 0 : -12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0, width: expanded ? 264 : 72 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.8, y: position.inNavbar ? 0 : -8 }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 230, damping: 25, mass: 0.9 }
            }
            role="region"
            aria-label="Music controls"
            data-music-island
            data-expanded={expanded}
            className={styles.island}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                setHovered(true);
                setExpanded(true);
              }
            }}
            onPointerLeave={() => setHovered(false)}
            onFocusCapture={(event) => {
              if (event.target.matches(":focus-visible")) setKeyboardFocus(true);
            }}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && expanded) {
                event.preventDefault();
                collapse(true);
              }
            }}
          >
            {expanded && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.15 }}
                className={styles.body}
              >
                <button
                  type="button"
                  onClick={(event) => collapse(event.detail === 0)}
                  aria-label="Collapse music controls"
                  title={`${music.track.title} - ${music.track.artist}`}
                  className={styles.main}
                >
                  {artwork}
                  <SongTitle
                    title={music.track.title}
                    reducedMotion={Boolean(reducedMotion)}
                    onReadingChange={setReadingTitle}
                  />
                </button>
                <span className={styles.time} aria-hidden="true">
                  {formatMusicTime(music.currentTime)}
                </span>
                <button
                  ref={playButton}
                  type="button"
                  onClick={(event) => {
                    music.togglePlay();
                    reveal(event.detail === 0);
                  }}
                  disabled={!music.ready || music.unavailable}
                  aria-label={music.isPlaying ? "Pause music" : "Resume music"}
                  title={music.isPlaying ? "Pause" : "Resume"}
                  className={styles.action}
                >
                  {music.isPlaying ? (
                    <Pause size={13} fill="currentColor" aria-hidden="true" />
                  ) : (
                    <Play size={13} fill="currentColor" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    music.goToTrack(music.trackIndex + 1);
                    reveal(event.detail === 0);
                  }}
                  disabled={!music.ready}
                  aria-label="Next music track"
                  title="Next track"
                  className={styles.action}
                >
                  <SkipForward size={13} fill="currentColor" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={music.stop}
                  aria-label="Stop music"
                  title="Stop and close"
                  className={styles.action}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </motion.div>
            )}
            {!expanded && (
              <button
                ref={compactButton}
                type="button"
                onClick={(event) => reveal(event.detail === 0, true)}
                aria-label={`Expand music controls: ${music.track.title}`}
                aria-expanded={expanded}
                title={`${music.track.title} - ${music.isPlaying ? "Playing" : "Paused"}`}
                className={styles.compact}
              >
                {artwork}
                {music.isPlaying ? (
                  <span className={styles.equalizer} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <Pause
                    size={13}
                    fill="currentColor"
                    aria-hidden="true"
                    className="text-white/60"
                  />
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
