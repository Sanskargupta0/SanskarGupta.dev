"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";

const TopLoader = () => {
  return (
    <>
      <ProgressBar 
        height="4px" 
        color={"#00adb5"} 
        shallowRouting 
        options={{ showSpinner: false }}
      />
      <RouteChangeLoader />
    </>
  );
};

const RouteChangeLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading");
  const pathname = usePathname();

  // Animate loading text with dots
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev === "Loading...") return "Loading";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let safetyTimeoutId: NodeJS.Timeout;

    const handleStart = () => {
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeoutId);
      safetyTimeoutId = setTimeout(() => setIsLoading(false), 15000);
      setIsLoading(true);
      setLoadingText("Loading");
    };

    const handleComplete = () => {
      clearTimeout(safetyTimeoutId);
      // Minimum loading time for better UX
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    // Enhanced route change detection
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    // Hash-only changes scroll within the current document; they do not load a route.
    const routeKey = () => location.pathname + location.search;
    let currentRoute = routeKey();
    const trackHistoryChange = () => {
      const nextRoute = routeKey();
      if (nextRoute === currentRoute) return;
      currentRoute = nextRoute;
      handleStart();
      setTimeout(handleComplete, 100);
    };

    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      trackHistoryChange();
      return result;
    };

    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      trackHistoryChange();
      return result;
    };

    const handlePopState = () => trackHistoryChange();

    // Listen for link clicks that might trigger navigation
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link?.hasAttribute("download") || (link?.target && link.target !== "_self")) return;
      
      if (link && link.href) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Check if it's an internal navigation
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          handleStart();
        }
      }
    };

    window.addEventListener("portfolio:navigation-start", handleStart);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkClick);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("portfolio:navigation-start", handleStart);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick);
      if (timeoutId) clearTimeout(timeoutId);
      if (safetyTimeoutId) clearTimeout(safetyTimeoutId);
    };
  }, []);

  // Complete loading when pathname changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            "bg-background/80 backdrop-blur-sm"
          )}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-4"
          >
            {/* Original Two Half-Circle Spinner */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className={cn(
                  "h-8 w-8 rounded-full border-2 border-muted",
                  "border-t-[#00adb5] border-r-[#00adb5]"
                )}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className={cn(
                  "absolute inset-1 h-6 w-6 rounded-full border-2 border-muted/50",
                  "border-b-[#00adb5]/70 border-l-[#00adb5]/70"
                )}
              />
            </div>

            {/* Loading text with animated dots */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium text-muted-foreground"
            >
              {loadingText}
            </motion.p>

            {/* Animated dots */}
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="h-1 w-1 rounded-full bg-[#00adb5]"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopLoader;
