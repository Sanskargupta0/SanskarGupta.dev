"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const PortraitContext = createContext<{ showPhoto: boolean; flip: () => void } | null>(null);

export function PortraitProvider({ children }: { children: ReactNode }) {
  const [selectedPhoto, setShowPhoto] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<boolean | null>(null);
  const showPhoto = previewPhoto ?? selectedPhoto;
  const introStarted = useRef(false);
  const introTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      setShowPhoto(localStorage.getItem("sanskar-portrait") !== "mascot");
    } catch {
      /* Storage is optional. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || introStarted.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = () => {
      if (introStarted.current) return;
      const picture = document.querySelector("[data-profile-picture]");
      if (!picture || document.hidden || document.querySelector("[data-site-loader]")) return;
      const bounds = picture.getBoundingClientRect();
      if (!bounds.width || bounds.top >= innerHeight || bounds.bottom <= 0) return;
      introStarted.current = true;
      observer.disconnect();
      setPreviewPhoto(true);
      introTimers.current = [
        setTimeout(() => setPreviewPhoto(false), 900),
        setTimeout(() => setPreviewPhoto(true), 2400),
        setTimeout(() => {
          setShowPhoto(true);
          setPreviewPhoto(null);
        }, 3100),
      ];
    };
    const observer = new MutationObserver(start);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", start, { passive: true });
    document.addEventListener("visibilitychange", start);
    start();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", start);
      document.removeEventListener("visibilitychange", start);
    };
  }, [ready]);

  useEffect(() => () => introTimers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("sanskar-portrait", selectedPhoto ? "photo" : "mascot");
    } catch {
      /* Storage is optional. */
    }
    const href = showPhoto ? "/mascots/sanskar-photo-icon.png" : "/mascots/sanskar-icon.png";
    const updateIcons = () => {
      document
        .querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]')
        .forEach((icon) => {
          if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
          icon.type = "image/png";
          icon.sizes.value = "192x192";
        });
    };
    updateIcons();
    // Next can insert metadata again after client-side navigation.
    const observer = new MutationObserver(updateIcons);
    observer.observe(document.head, { childList: true });
    return () => observer.disconnect();
  }, [showPhoto, selectedPhoto, ready]);

  return (
    <PortraitContext.Provider value={{ showPhoto, flip: () => {
      introStarted.current = true;
      introTimers.current.forEach(clearTimeout);
      setPreviewPhoto(null);
      setShowPhoto(!showPhoto);
    } }}>
      {children}
    </PortraitContext.Provider>
  );
}

export function usePortrait() {
  const context = useContext(PortraitContext);
  if (!context) throw new Error("usePortrait requires PortraitProvider");
  return context;
}
