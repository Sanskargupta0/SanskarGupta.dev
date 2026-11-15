"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Moon, Shuffle, Sun, X } from "lucide-react";
import { petVariants, startOneko } from "~/lib/oneko";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

type PetState = { variant: string; sleeping: boolean; docked?: boolean };
const send = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));

export default function PetCat() {
  const pathname = usePathname();
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [pet, setPet] = useState<PetState>({ variant: "", sleeping: false });

  useEffect(() => {
    if (isBlog) {
      setEnabled(false);
      setOpen(false);
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop: (() => void) | undefined;
    const openPicker = () => setOpen(true);
    const onState = (event: Event) => setPet((event as CustomEvent<PetState>).detail);
    window.addEventListener("oneko:open-picker", openPicker);
    window.addEventListener("oneko:state", onState);
    const sync = () => {
      stop?.();
      stop = undefined;
      setOpen(false);
      setEnabled(!reducedMotion.matches);
      if (!reducedMotion.matches) {
        stop = startOneko();
        send("oneko:route-change", pathRef.current);
      }
    };
    sync();
    reducedMotion.addEventListener("change", sync);
    return () => {
      stop?.();
      reducedMotion.removeEventListener("change", sync);
      window.removeEventListener("oneko:open-picker", openPicker);
      window.removeEventListener("oneko:state", onState);
    };
  }, [isBlog]);

  useEffect(() => {
    send("oneko:route-change", pathname);
  }, [pathname]);
  useEffect(() => {
    send("oneko:pause", open);
  }, [open]);

  if (!enabled || isBlog) return null;
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 text-foreground shadow-xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("oneko")?.focus({ preventScroll: true });
          }}
        >
          <Dialog.Title className="mt-3 text-center text-lg font-semibold">
            Choose Neko
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-center text-sm text-muted-foreground">
            Choose a pet to keep, or shuffle on every refresh.
          </Dialog.Description>
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 size-7 rounded-full"
              aria-label="Close pet picker"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </Dialog.Close>
          <div className="mx-auto my-6 grid w-fit grid-cols-3 gap-4">
            {petVariants.map(({ id, label }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={label}
                    aria-pressed={pet.variant === id}
                    title={label}
                    onClick={() => {
                      send("oneko:set-variant", id);
                      setOpen(false);
                    }}
                    className="el-focus-styles size-8 rounded-lg border border-border hover:bg-accent aria-pressed:ring-2 aria-pressed:ring-ring"
                    style={{
                      backgroundImage: "url(/oneko/oneko-" + id + ".gif)",
                      backgroundPosition: "-96px -96px",
                      backgroundRepeat: "no-repeat",
                      imageRendering: "pixelated",
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                send("oneko:random");
                setOpen(false);
              }}
            >
              <Shuffle aria-hidden="true" className="mr-2 size-4" />
              Random on refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pet.docked}
              onClick={() => {
                send("oneko:toggle-sleep");
                setOpen(false);
              }}
            >
              {pet.sleeping ? (
                <Sun aria-hidden="true" className="mr-2 size-4" />
              ) : (
                <Moon aria-hidden="true" className="mr-2 size-4" />
              )}
              {pet.docked ? "Resting beside the logo" : pet.sleeping ? "Wake pet" : "Put pet to sleep"}
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {pet.docked ? "Your companion stays beside the logo on this device." : "Drag to move. Double-click to sleep or wake."}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
