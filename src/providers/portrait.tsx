"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const PortraitContext = createContext<{ showPhoto: boolean; flip: () => void } | null>(null);

export function PortraitProvider({ children }: { children: ReactNode }) {
  const [showPhoto, setShowPhoto] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      setShowPhoto(localStorage.getItem("sanskar-portrait") === "photo");
    } catch {
      /* Storage is optional. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("sanskar-portrait", showPhoto ? "photo" : "mascot");
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
  }, [showPhoto, ready]);

  return (
    <PortraitContext.Provider value={{ showPhoto, flip: () => setShowPhoto((value) => !value) }}>
      {children}
    </PortraitContext.Provider>
  );
}

export function usePortrait() {
  const context = useContext(PortraitContext);
  if (!context) throw new Error("usePortrait requires PortraitProvider");
  return context;
}
