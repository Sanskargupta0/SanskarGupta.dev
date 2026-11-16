"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  destroy(): void;
}

interface YTPlayerOptions {
  width: number;
  height: number;
  videoId: string;
  playerVars: Record<string, number | string>;
  events: {
    onReady?: () => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: () => void;
  };
}

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface Track {
  title: string;
  artist: string;
  videoId: string;
}

const TRACKS: Track[] = [
  {
    title: "La Campanella ( 1826 )",
    artist: "Niccolò Paganini",
    videoId: "6ruHDWSNvB8",
  },
  {
    title: "Alla Turca (Sonata No. 11)",
    artist: "Mozart · Tzvi Erez",
    videoId: "SQh1zztmpEk",
  },
  {
    title: "Passacaglia",
    artist: "Handel / Halvorsen",
    videoId: "ApCL2GomTD4",
  },
  {
    title: "Ishq Mubarak",
    artist: "Arijit Singh",
    videoId: "V1oczq_8L0E",
  },
  {
    title: "Reflections",
    artist: "The Neighbourhood",
    videoId: "GJNdR_MKuDM",
  },
  {
    title: "Lights All Around You",
    artist: "Grabbitz",
    videoId: "vy-xswpt7rM",
  },
  {
    title: "This Town",
    artist: "Niall Horan",
    videoId: "xW6YaL_gggk",
  },
  {
    title: "Pahina",
    artist: "Cup of Joe",
    videoId: "QBmFohONyqg",
  },
  {
    title: "Maine Khud Ko",
    artist: "Mustafa Zahid",
    videoId: "xrCAIMx3V90",
  },
  {
    title: "Uska Hi Banana",
    artist: "Arijit Singh",
    videoId: "q-RP99S_qK0",
  },
  {
    title: "Alfaaz - Vocals",
    artist: "Hamza Malik",
    videoId: "paE_AZeFhaM",
  },
  {
    title: "Aashiqana",
    artist: "Chaar Diwaari feat. Indian Ocean, Gini",
    videoId: "b-gjLgT4SUQ",
  },
  {
    title: "Ishq",
    artist: "Faheem Abdullah, Rauhan Malik",
    videoId: "hHuG7FIKgtc",
  },
];

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      window.clearInterval(poll);
      window.clearTimeout(timeout);
      resolve();
    };
    const poll = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(poll);
        window.clearTimeout(timeout);
        resolve();
      }
    }, 200);
    const timeout = window.setTimeout(() => {
      window.clearInterval(poll);
      reject(new Error("Music is unavailable"));
    }, 15000);
  });
}

export function formatMusicTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface MusicPlayback {
  track: Track;
  trackIndex: number;
  isPlaying: boolean;
  hasSession: boolean;
  currentTime: number;
  duration: number;
  ready: boolean;
  unavailable: boolean;
  inlineVisible: boolean;
  source: "spotify" | "library";
  prepare(): void;
  togglePlay(): void;
  goToTrack(index: number): void;
  seekTo(seconds: number): void;
  stop(): void;
  setInlineVisible(visible: boolean): void;
  selectSource(source: "spotify" | "library"): void;
}

const MusicContext = createContext<MusicPlayback | null>(null);

export function MusicPlaybackProvider({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [prepared, setPrepared] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [inlineVisible, setInlineVisible] = useState(false);
  const [source, setSource] = useState<"spotify" | "library">("library");
  const prepare = useCallback(() => setPrepared(true), []);

  useEffect(() => {
    if (!prepared) return;
    let cancelled = false;
    loadYouTubeApi()
      .then(() => {
        if (cancelled || !hostRef.current || !window.YT) return;
        const mount = document.createElement("div");
        hostRef.current.replaceChildren(mount);
        playerRef.current = new window.YT.Player(mount, {
          width: 200,
          height: 200,
          videoId: TRACKS[0].videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (!cancelled) setReady(true);
            },
            onError: () => {
              if (!cancelled) {
                setUnavailable(true);
                setIsPlaying(false);
              }
            },
            onStateChange: ({ data }) => {
              if (cancelled) return;
              if (data === 1) {
                setIsPlaying(true);
                setHasSession(true);
                setUnavailable(false);
              }
              if (data === 2 || data === 5 || data === -1) setIsPlaying(false);
              if (data === 0) {
                playerRef.current?.seekTo(0, true);
                playerRef.current?.playVideo();
              }
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [prepared]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime());
      setDuration(player.getDuration());
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const seekTo = (seconds: number) => {
    if (!ready || !playerRef.current) return;
    const target = Math.max(0, Math.min(duration || seconds, seconds));
    playerRef.current.seekTo(target, true);
    setCurrentTime(target);
  };
  const togglePlay = () => {
    if (!ready || !playerRef.current || unavailable) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      setSource("library");
      setHasSession(true);
      playerRef.current.playVideo();
    }
  };
  const goToTrack = (index: number) => {
    if (!ready || !playerRef.current) return;
    const next = (index + TRACKS.length) % TRACKS.length;
    setTrackIndex(next);
    setCurrentTime(0);
    setDuration(0);
    setUnavailable(false);
    if (isPlaying) playerRef.current.loadVideoById(TRACKS[next].videoId);
    else playerRef.current.cueVideoById(TRACKS[next].videoId);
  };
  const stop = () => {
    playerRef.current?.pauseVideo();
    playerRef.current?.seekTo(0, true);
    setIsPlaying(false);
    setHasSession(false);
    setCurrentTime(0);
  };
  const selectSource = (next: "spotify" | "library") => {
    setSource(next);
    if (next === "spotify") {
      if (ready) playerRef.current?.pauseVideo();
      setIsPlaying(false);
      setHasSession(false);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        track: TRACKS[trackIndex],
        trackIndex,
        isPlaying,
        hasSession,
        currentTime,
        duration,
        ready,
        unavailable,
        inlineVisible,
        source,
        prepare,
        togglePlay,
        goToTrack,
        seekTo,
        stop,
        setInlineVisible,
        selectSource,
      }}
    >
      {children}
      {/* One playback engine survives client-side navigation; controls are separate. */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 h-[200px] w-[200px] overflow-hidden opacity-0"
        aria-hidden="true"
        ref={(node) => {
          node?.setAttribute("inert", "");
        }}
      >
        <div ref={hostRef} />
      </div>
    </MusicContext.Provider>
  );
}

export function useMusicPlayback() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("Music controls require MusicPlaybackProvider");
  return context;
}
