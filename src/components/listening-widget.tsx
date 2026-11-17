"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { listeningStatusOptions } from "~/actions/listening";
import type { ListeningTrack } from "~/types/listening";
import { ArrowLeftRight } from "lucide-react";
import MusicPlayer from "~/components/music-player";
import MusicSourceNote from "~/components/music-source-note";
import { useMusicPlayback } from "~/providers/music-playback";

export default function ListeningWidget() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mode = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => setMounted(true), []);
  const { source, selectSource } = useMusicPlayback();
  const showSpotify = source === "spotify";
  const [preview, setPreview] = useState<ListeningTrack | null>(null);
  const [playerMode, setPlayerMode] = useState<string | null>(null);
  const [embedSession, setEmbedSession] = useState(0);
  const previousSource = useRef(source);
  useEffect(() => {
    // Stop any Spotify audio when leaving it, then preload a fresh idle embed.
    if (previousSource.current === "spotify" && source === "library") {
      setEmbedSession((session) => session + 1);
    }
    previousSource.current = source;
  }, [source]);
  const { data, isError } = useQuery(listeningStatusOptions);
  const state = isError ? "unavailable" : data?.state;
  const track = data?.track;
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(280);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (mounted && track && !preview) {
      setPreview(track);
      setPlayerMode(mode);
    }
  }, [mounted, track, preview, mode]);
  const scale = Math.min(1, width / 280);

  return (
    <div
      className="grid min-w-0 grid-cols-[minmax(0,1fr)_2rem] items-start gap-x-2 gap-y-2"
      ref={container}
      data-listening-widget
    >
      <span className="flex min-h-8 min-w-0 items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        {showSpotify
          ? state === "playing"
            ? "Now playing"
            : state === "offline"
              ? preview || track
                ? "Offline / last detected"
                : "Offline"
              : state === "unavailable"
                ? "Listening status unavailable"
                : "Checking Spotify"
          : "Music"}
        {showSpotify &&
          track &&
          preview &&
          (preview.id !== track.id || preview.kind !== track.kind) && (
            <button
              type="button"
              onClick={() => {
                setPreview(track);
                setPlayerMode(mode);
              }}
              className="shrink-0 text-[10px] normal-case tracking-normal underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Update song
            </button>
          )}
      </span>
      <div className="relative" data-music-source-switch>
        <button
          type="button"
          aria-label={showSpotify ? "Show music player" : "Show Spotify listening status"}
          title={showSpotify ? "Switch to music player" : "Switch to Spotify"}
          onClick={() => {
            selectSource(showSpotify ? "library" : "spotify");
          }}
          className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftRight size={13} />
        </button>
        <MusicSourceNote />
      </div>
      <div
        aria-hidden={!showSpotify}
        className={showSpotify ? "col-span-2 flex h-20 min-w-0 flex-col justify-center" : "hidden"}
      >
          {preview ? (
            <div className="relative overflow-hidden rounded-xl" style={{ height: 80 * scale }}>
              <iframe
                key={preview.kind + preview.id + embedSession}
                title="Spotify song player"
                src={
                  "https://open.spotify.com/embed/" +
                  preview.kind +
                  "/" +
                  preview.id +
                  "?theme=" +
                  (playerMode === "dark" ? "0" : "1")
                }
                width={Math.max(280, width)}
                height="80"
                style={{ transform: "scale(" + scale + ")", transformOrigin: "top left" }}
                className="block border-0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              className="flex h-20 items-center rounded-xl border border-border px-4 text-xs text-muted-foreground"
              role="status"
            >
              {!state
                ? "Loading Spotify"
                : state === "offline"
                  ? "Not playing on Spotify"
                  : "No song available right now"}
            </div>
          )}
      </div>
      <div className="col-span-2 min-w-0" hidden={showSpotify}>
        <MusicPlayer active={!showSpotify} />
      </div>
    </div>
  );
}
