"use client";

import { cn } from "~/lib/utils";
import { PanelBottomClose } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useId, useRef, useState, type MouseEventHandler, type ReactNode } from "react";

export type DockItem = {
  title: string;
  icon: ReactNode;
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  busy?: boolean;
};

const linkProps = (item: DockItem) => ({
  href: item.href,
  onClick: item.onClick,
  "aria-label": item.title,
  "aria-disabled": item.busy || undefined,
  "aria-busy": item.busy || undefined,
  target: item.href.startsWith("https://") ? "_blank" : undefined,
  rel: item.href.startsWith("https://") ? "noopener noreferrer" : undefined,
});

export function FloatingDock({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
}

function FloatingDockMobile({ items, className }: { items: DockItem[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div ref={root} className={cn("relative block w-fit md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 8 }}
            transition={{ duration: reduced ? 0 : 0.15 }}
            className="absolute bottom-full right-0 mb-3 flex max-h-[calc(100dvh-7rem)] flex-col gap-2 overflow-y-auto rounded-full border border-border bg-background p-2 shadow-lg"
          >
            {items.map((item) => (
              <a
                key={item.title}
                {...linkProps(item)}
                title={item.title}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:opacity-50"
              >
                <span className="size-5 [&_svg]:size-full">{item.icon}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        ref={toggle}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close social links" : "Open social links"}
        aria-expanded={open}
        aria-controls={id}
        className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <PanelBottomClose className={cn("size-5", open && "rotate-180")} />
      </button>
    </div>
  );
}

function FloatingDockDesktop({ items, className }: { items: DockItem[]; className?: string }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(event) => mouseX.set(event.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 w-fit items-end gap-3 rounded-2xl border border-border bg-background px-4 pb-3 shadow-lg md:flex",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer key={item.title} mouseX={mouseX} item={item} />
      ))}
    </motion.div>
  );
}

function IconContainer({ mouseX, item }: { mouseX: MotionValue<number>; item: DockItem }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect();
    return value - (bounds?.x ?? 0) - (bounds?.width ?? 0) / 2;
  });
  const size = useSpring(useTransform(distance, [-150, 0, 150], [40, 80, 40]), {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const iconSize = useSpring(useTransform(distance, [-150, 0, 150], [20, 40, 20]), {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  return (
    <motion.a
      ref={ref}
      {...linkProps(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ width: reduced ? 40 : size, height: reduced ? 40 : size }}
      className="relative flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:opacity-50 motion-reduce:!size-10"
    >
      <AnimatePresence>
        {(hovered || focused) && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, y: reduced ? 0 : 6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 0, x: "-50%" }}
            transition={{ duration: reduced ? 0 : 0.12 }}
            className="pointer-events-none absolute -top-9 left-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span
        style={{ width: reduced ? 20 : iconSize, height: reduced ? 20 : iconSize }}
        className="flex items-center justify-center motion-reduce:!size-5 [&_svg]:size-full"
      >
        {item.icon}
      </motion.span>
    </motion.a>
  );
}

export default FloatingDock;
