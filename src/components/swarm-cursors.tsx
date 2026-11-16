"use client";

import { useEffect, useRef, useState } from "react";
import { MousePointer2 } from "lucide-react";
import { toast } from "sonner";
import styles from "./swarm-cursors.module.css";

type SwarmEngine = { start: () => void; stop: (reveal?: boolean) => void };
declare global {
  interface Window { __swarmRebuild?: SwarmEngine }
}

let engineLoading: Promise<void> | null = null;
function loadEngine() {
  if (window.__swarmRebuild) return Promise.resolve();
  if (!engineLoading) {
    engineLoading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/vendor/swarm-rebuild.js";
      script.async = true;
      script.onload = () => {
        if (window.__swarmRebuild) resolve();
        else { script.remove(); engineLoading = null; reject(new Error("Swarm unavailable")); }
      };
      script.onerror = () => { script.remove(); engineLoading = null; reject(new Error("Swarm unavailable")); };
      document.body.appendChild(script);
    });
  }
  return engineLoading;
}

export default function SwarmCursors() {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const mounted = useRef(false);
  const pending = useRef(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    mounted.current = true;
    const update = (event: Event) => {
      const running = (event as CustomEvent<{ active: boolean }>).detail.active;
      setActive(running);
      if (!running) button.current?.focus({ preventScroll: true });
    };
    window.addEventListener("swarm:state", update);
    return () => {
      mounted.current = false;
      window.removeEventListener("swarm:state", update);
      window.__swarmRebuild?.stop(false);
    };
  }, []);

  async function toggle() {
    if (pending.current) return;
    if (active) { window.__swarmRebuild?.stop(false); return; }
    pending.current = true;
    setLoading(true);
    try {
      await Promise.all([
        loadEngine(),
        new Promise<void>((resolve) => window.setTimeout(resolve, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 480)),
      ]);
      if (mounted.current) window.__swarmRebuild?.start();
    } catch {
      if (mounted.current) toast.error("The cursor swarm could not load. Please try again.");
    } finally {
      pending.current = false;
      if (mounted.current) setLoading(false);
    }
  }

  return (
    <button
      ref={button}
      data-swarm-ignore
      data-releasing={loading || undefined}
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-busy={loading}
      aria-pressed={active}
      aria-label={active ? "Stop cursor swarm" : "Rebuild this page with cursor swarm"}
      title="Rebuild this page with cursor swarm"
      className={`${styles.trigger} fixed right-3 top-1/2 z-40 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait sm:right-5`}
    >
      <span aria-hidden="true" className={styles.cage}>
        <MousePointer2 className={styles.pointer} />
        <MousePointer2 className={styles.follower} />
        <MousePointer2 className={styles.last} />
      </span>
    </button>
  );
}
