"use client";
import { useEffect, useRef } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { formatMusicTime, useMusicPlayback } from "~/providers/music-playback";

export function MusicPlayer({ active = true }: { active?: boolean }) {
  const inlineRef = useRef<HTMLDivElement>(null);
  const {
    track,
    trackIndex,
    isPlaying,
    currentTime,
    duration,
    ready,
    unavailable,
    prepare,
    togglePlay,
    goToTrack,
    seekTo,
    setInlineVisible,
  } = useMusicPlayback();
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  useEffect(() => {
    prepare();
  }, [prepare]);
  useEffect(() => {
    const element = inlineRef.current;
    if (!element || !active) {
      setInlineVisible(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInlineVisible(entry.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
      threshold: 0,
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      setInlineVisible(false);
    };
  }, [active, setInlineVisible]);
  const seek = (clientX: number, bar: HTMLDivElement) => {
    if (!ready || duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    seekTo(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * duration);
  };
  return (
    <div
      ref={inlineRef}
      className="relative h-20 w-full min-w-0 rounded-xl bg-muted/30 p-2"
      data-music-player
    >
      <div className="flex h-full items-center gap-3">
        <div className="relative h-14 w-14 flex-none" aria-hidden="true">
          <div className="absolute -bottom-2 left-1/2 h-3 w-[85%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-md" />
          <div
            className="relative h-full w-full rounded-full"
            style={{
              background: [
                "repeating-radial-gradient(circle at center, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)",
                "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.16) 14deg, transparent 38deg, transparent 140deg, rgba(255,255,255,0.09) 158deg, transparent 176deg, transparent 280deg, rgba(255,255,255,0.13) 296deg, transparent 318deg)",
                "radial-gradient(circle, #121212 0%, #0b0b0b 62%, #050505 100%)",
              ].join(", "),
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 12px 28px rgba(0,0,0,0.75)",
              animation: "vinyl-spin 2s linear infinite",
              animationPlayState: isPlaying ? "running" : "paused",
            }}
          >
            <div
              className="absolute inset-[29%] rounded-full"
              style={{
                background: "radial-gradient(circle at 40% 35%, #2c2c2c, #141414 72%)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
              }}
            >
              <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-neutral-200" />
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.10), transparent 45%)",
            }}
          />

          {/* ── Tonearm ── pivot anchored top-right, swings onto record when playing */}
          <div
            className="pointer-events-none absolute z-10"
            style={{
              top: "-6px",
              right: "-6px",
              // Transform origin matches the SVG pivot circle (cx=40, cy=5 within the 44×56 svg)
              transformOrigin: "40px 5px",
              transform: isPlaying ? "rotate(28deg)" : "rotate(-5deg)",
              transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <svg width="44" height="56" viewBox="0 0 44 56" fill="none">
              {/* Pivot bearing */}
              <circle cx="40" cy="5" r="4" fill="#6b6b6b" />
              <circle cx="40" cy="5" r="2" fill="#c0c0c0" />
              {/* Arm rod — tapered, metallic gradient */}
              <line
                x1="40"
                y1="5"
                x2="8"
                y2="50"
                stroke="url(#toneGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Headshell */}
              <rect
                x="3"
                y="46"
                width="8"
                height="3.5"
                rx="1"
                fill="#999"
                transform="rotate(-52 7 47.5)"
              />
              {/* Stylus tip */}
              <circle cx="5" cy="52" r="1.4" fill="#e0e0e0" />
              <defs>
                <linearGradient
                  id="toneGrad"
                  x1="40"
                  y1="5"
                  x2="8"
                  y2="50"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#888" />
                  <stop offset="45%" stopColor="#d4d4d4" />
                  <stop offset="100%" stopColor="#777" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <p className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
              {track.title}
            </p>
            <div className="flex flex-none items-center gap-1">
              <button
                disabled={!ready}
                type="button"
                onClick={() => goToTrack(trackIndex - 1)}
                aria-label="Previous track"
                className="flex size-6 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:cursor-wait disabled:opacity-40"
              >
                <SkipBack size={13} fill="currentColor" />
              </button>
              <button
                disabled={!ready || unavailable}
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-neutral-600 text-foreground transition-all hover:scale-105 hover:border-neutral-200 active:scale-95 disabled:cursor-wait disabled:opacity-40"
              >
                {isPlaying ? (
                  <Pause size={13} fill="currentColor" />
                ) : (
                  <Play size={13} fill="currentColor" className="ml-0.5" />
                )}
              </button>
              <button
                disabled={!ready}
                type="button"
                onClick={() => goToTrack(trackIndex + 1)}
                aria-label="Next track"
                className="flex size-6 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:cursor-wait disabled:opacity-40"
              >
                <SkipForward size={13} fill="currentColor" />
              </button>
            </div>
          </div>
          {unavailable ? (
            <a
              className="block truncate text-[10px] leading-3 text-muted-foreground underline"
              href={`https://www.youtube.com/watch?v=${track.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Listen on YouTube
            </a>
          ) : (
            <p className="truncate text-[10px] leading-3 text-muted-foreground">{track.artist}</p>
          )}

          <div
            tabIndex={ready && duration > 0 ? 0 : -1}
            aria-disabled={!ready || duration <= 0}
            onKeyDown={(e) => {
              if (!duration) return;
              const target =
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? duration
                    : e.key === "ArrowRight"
                      ? Math.min(duration, currentTime + 5)
                      : e.key === "ArrowLeft"
                        ? Math.max(0, currentTime - 5)
                        : null;
              if (target === null) return;
              e.preventDefault();
              seekTo(target);
            }}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            className="group flex h-3 cursor-pointer items-center"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              seek(e.clientX, e.currentTarget);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) seek(e.clientX, e.currentTarget);
            }}
          >
            <div className="relative h-[3px] w-full rounded-full bg-muted transition-colors group-hover:bg-muted-foreground/30">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[9px] leading-[10px] text-muted-foreground">
            <span>{formatMusicTime(currentTime)}</span>
            <span>{formatMusicTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
