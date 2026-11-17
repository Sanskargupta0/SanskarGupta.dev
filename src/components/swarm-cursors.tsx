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
  const [hasTried, setHasTried] = useState(false);
  const [attention, setAttention] = useState(false);
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

  useEffect(() => {
    document.documentElement.toggleAttribute("data-swarm-active", loading || active);
    return () => document.documentElement.removeAttribute("data-swarm-active");
  }, [loading, active]);

  useEffect(() => {
    if (hasTried) return;
    try {
      if (localStorage.getItem("portfolio:swarm-used") === "true") return;
    } catch { /* Attention still works when storage is unavailable. */ }
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let end: ReturnType<typeof setTimeout>;
    const invite = () => {
      if (preference.matches) return;
      setAttention(true);
      clearTimeout(end);
      end = setTimeout(() => setAttention(false), 2000);
    };
    let repeat: ReturnType<typeof setInterval>;
    // Let the first-load screen finish before the first visible invitation.
    const initial = setTimeout(() => {
      invite();
      repeat = setInterval(invite, 10000);
    }, 4000);
    return () => {
      clearTimeout(initial);
      clearTimeout(end);
      clearInterval(repeat);
    };
  }, [hasTried]);

  async function toggle() {
    if (pending.current) return;
    if (active) { window.__swarmRebuild?.stop(false); return; }
    setHasTried(true);
    setAttention(false);
    try { localStorage.setItem("portfolio:swarm-used", "true"); } catch { /* Optional persistence. */ }
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
      data-attention={attention || undefined}
      data-releasing={loading || undefined}
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-busy={loading}
      aria-pressed={active}
      aria-label={active ? "Stop cursor swarm" : "Rebuild this page with cursor swarm"}
      title="Rebuild this page with cursor swarm"
      className={`${styles.trigger} z-40 flex size-10 items-center justify-center rounded-full bg-transparent text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait`}
    >
      <span aria-hidden="true" className={styles.cage}>
        <MousePointer2 className={styles.pointer} />
        <MousePointer2 className={styles.follower} />
        <MousePointer2 className={styles.last} />
      </span>
    </button>
  );
}
