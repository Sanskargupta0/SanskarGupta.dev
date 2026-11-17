'use client';

import { cn } from '~/lib/utils';
import { useTheme } from 'next-themes';
import { flushSync } from 'react-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Moon from './theme-icons/moon';
import Sun from './theme-icons/sun';
import { Button } from './button';

export const useThemeToggle = ({
  variant = 'circle',
  start = 'center',
  blur = false,
  gifUrl = '',
}: {
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
  gifUrl?: string;
} = {}) => {
  const { setTheme, resolvedTheme } = useTheme();


  const [isDark, setIsDark] = useState(false);
  const transitioning = useRef(false);

  useEffect(() => {
    setIsDark(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const styleId = 'theme-transition-styles';

  const updateStyles = useCallback((css: string) => {
    if (typeof window === 'undefined') return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const toggleTheme = useCallback(() => {
    if (transitioning.current) return;
    const wasDark = document.documentElement.classList.contains("dark");
    setIsDark(!wasDark);

    const animation = createAnimation(variant, start, blur, gifUrl);

    updateStyles(animation.css);

    if (typeof window === 'undefined') return;

    // Read the displayed theme so hydration or a system-theme update cannot
    // leave the transition direction one render behind.
    const switchTheme = () => {
      setTheme(wasDark ? 'light' : 'dark');
    };

    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      switchTheme();
      return;
    }

    transitioning.current = true;
    document.startViewTransition(() => flushSync(switchTheme)).finished
      .catch(() => {})
      .finally(() => { transitioning.current = false; });
  }, [
    setTheme,
    variant,
    start,
    blur,
    gifUrl,
    updateStyles,
    isDark,
    setIsDark,
  ]);

  const setCrazyLightTheme = useCallback(() => {
    setIsDark(false);

    const animation = createAnimation(variant, start, blur, gifUrl);

    updateStyles(animation.css);

    if (typeof window === 'undefined') return;

    const switchTheme = () => {
      setTheme('light');
    };

    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [setTheme, variant, start, blur, gifUrl, updateStyles, setIsDark]);

  const setCrazyDarkTheme = useCallback(() => {
    setIsDark(true);

    const animation = createAnimation(variant, start, blur, gifUrl);

    updateStyles(animation.css);

    if (typeof window === 'undefined') return;

    const switchTheme = () => {
      setTheme('dark');
    };

    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [setTheme, variant, start, blur, gifUrl, updateStyles, setIsDark]);

  return {
    isDark,
    setIsDark,
    toggleTheme,
    setCrazyLightTheme,
    setCrazyDarkTheme,
  };
};

// ///////////////////////////////////////////////////////////////////////////

export const ThemeToggleButton = ({
  className = '',
  variant = 'circle',
  start = 'center',
  blur = false,
  gifUrl = '',
}: {
  className?: string;
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
  gifUrl?: string;
}) => {
  const { isDark, toggleTheme } = useThemeToggle({
    variant,
    start,
    blur,
    gifUrl,
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'size-10 cursor-pointer p-0 transition-all duration-300 active:scale-95',
        className,
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
};

// ///////////////////////////////////////////////////////////////////////////

export type AnimationVariant =
  | 'circle'
  | 'rectangle'
  | 'gif'
  | 'polygon'
  | 'circle-blur';
export type AnimationStart =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'top-center'
  | 'bottom-center'
  | 'bottom-up'
  | 'top-down'
  | 'left-right'
  | 'right-left';

interface Animation {
  name: string;
  css: string;
}

const getPositionCoords = (position: AnimationStart) => {
  switch (position) {
    case 'top-left':
      return { cx: '0', cy: '0' };
    case 'top-right':
      return { cx: '40', cy: '0' };
    case 'bottom-left':
      return { cx: '0', cy: '40' };
    case 'bottom-right':
      return { cx: '40', cy: '40' };
    case 'top-center':
      return { cx: '20', cy: '0' };
    case 'bottom-center':
      return { cx: '20', cy: '40' };
    // For directional positions, default to center (these are used for rectangle variant)
    case 'bottom-up':
    case 'top-down':
    case 'left-right':
    case 'right-left':
      return { cx: '20', cy: '20' };
  }
};

const generateSVG = (variant: AnimationVariant, start: AnimationStart) => {
  // circle-blur variant handles center case differently, so check it first
  if (variant === 'circle-blur') {
    if (start === 'center') {
      return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="20" cy="20" r="18" fill="white" filter="url(%23blur)"/></svg>`;
    }
    const positionCoords = getPositionCoords(start);
    if (!positionCoords) {
      throw new Error(`Invalid start position: ${start}`);
    }
    const { cx, cy } = positionCoords;
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>`;
  }

  if (start === 'center') return;

  // Rectangle variant doesn't use SVG masks, so return early
  if (variant === 'rectangle') return '';

  const positionCoords = getPositionCoords(start);
  if (!positionCoords) {
    throw new Error(`Invalid start position: ${start}`);
  }
  const { cx, cy } = positionCoords;

  if (variant === 'circle') {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
  }

  return '';
};

const getTransformOrigin = (start: AnimationStart) => {
  switch (start) {
    case 'top-left':
      return 'top left';
    case 'top-right':
      return 'top right';
    case 'bottom-left':
      return 'bottom left';
    case 'bottom-right':
      return 'bottom right';
    case 'top-center':
      return 'top center';
    case 'bottom-center':
      return 'bottom center';
    case 'bottom-up':
    case 'top-down':
    case 'left-right':
    case 'right-left':
      return 'center';
  }
};

export const createAnimation = (
  variant: AnimationVariant,
  start: AnimationStart = 'center',
  blur = false,
  url?: string,
): Animation => {
  const svg = generateSVG(variant, start);
  const transformOrigin = getTransformOrigin(start);

  if (variant === 'rectangle') {
    const getClipPath = (direction: AnimationStart) => {
      switch (direction) {
        case 'bottom-up':
          return {
            from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'top-down':
          return {
            from: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'left-right':
          return {
            from: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'right-left':
          return {
            from: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'top-left':
          return {
            from: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'top-right':
          return {
            from: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'bottom-left':
          return {
            from: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'bottom-right':
          return {
            from: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        default:
          return {
            from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
      }
    };

    const clipPath = getClipPath(start);

    return {
      name: `${variant}-${start}${blur ? '-blur' : ''}`,
      css: `
       ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
      }

      ::view-transition-new(root) {
        animation-name: reveal-light-${start}${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${start}${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      @keyframes reveal-dark-${start}${blur ? '-blur' : ''} {
        from {
          clip-path: ${clipPath.from};
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: ${clipPath.to};
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }

      @keyframes reveal-light-${start}${blur ? '-blur' : ''} {
        from {
          clip-path: ${clipPath.from};
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: ${clipPath.to};
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }
      `,
    };
  }
  if (variant === 'circle' && start == 'center') {
    return {
      name: `${variant}-${start}${blur ? '-blur' : ''}`,
      css: `
       ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
      }

      ::view-transition-new(root) {
        animation-name: reveal-light${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      @keyframes reveal-dark${blur ? '-blur' : ''} {
        from {
          clip-path: circle(0% at 50% 50%);
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: circle(100.0% at 50% 50%);
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }

      @keyframes reveal-light${blur ? '-blur' : ''} {
        from {
           clip-path: circle(0% at 50% 50%);
           ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: circle(100.0% at 50% 50%);
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }
      `,
    };
  }
  if (variant === 'gif') {
    return {
      name: `${variant}-${start}`,
      css: `
      ::view-transition-group(root) {
  animation-timing-function: var(--expo-in);
}

::view-transition-new(root) {
  mask: url('${url}') center / 0 no-repeat;
  animation: scale 3s;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: scale 3s;
}

@keyframes scale {
  0% {
    mask-size: 0;
  }
  10% {
    mask-size: 50vmax;
  }
  90% {
    mask-size: 50vmax;
  }
  100% {
    mask-size: 2000vmax;
  }
}`,
    };
  }

  if (variant === 'circle-blur') {
    if (start === 'center') {
      return {
        name: `${variant}-${start}`,
        css: `
        ::view-transition-group(root) {
          animation-timing-function: var(--expo-out);
        }

        ::view-transition-new(root) {
          mask: url('${svg}') center / 0 no-repeat;
          mask-origin: content-box;
          animation: scale 1s;
          transform-origin: center;
        }

        ::view-transition-old(root),
        .dark::view-transition-old(root) {
          animation: scale 1s;
          transform-origin: center;
          z-index: -1;
        }

        @keyframes scale {
          to {
            mask-size: 350vmax;
          }
        }
        `,
      };
    }

    return {
      name: `${variant}-${start}`,
      css: `
      ::view-transition-group(root) {
        animation-timing-function: var(--expo-out);
      }

      ::view-transition-new(root) {
        mask: url('${svg}') ${start.replace('-', ' ')} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale 1s;
        transform-origin: ${transformOrigin};
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: scale 1s;
        transform-origin: ${transformOrigin};
        z-index: -1;
      }

      @keyframes scale {
        to {
          mask-size: 350vmax;
        }
      }
      `,
    };
  }

  if (variant === 'polygon') {
    const getPolygonClipPaths = (position: AnimationStart) => {
      switch (position) {
        case 'top-left':
          return {
            darkFrom: 'polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)',
            darkTo: 'polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)',
            lightFrom: 'polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)',
            lightTo: 'polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)',
          };
        case 'top-right':
          return {
            darkFrom: 'polygon(150% -71%, 250% 71%, 250% 71%, 150% -71%)',
            darkTo: 'polygon(150% -71%, 250% 71%, 50% 171%, -71% 50%)',
            lightFrom: 'polygon(-71% 50%, 50% 171%, 50% 171%, -71% 50%)',
            lightTo: 'polygon(-71% 50%, 50% 171%, 250% 71%, 150% -71%)',
          };
        default:
          // Default to top-left behavior
          return {
            darkFrom: 'polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)',
            darkTo: 'polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)',
            lightFrom: 'polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)',
            lightTo: 'polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)',
          };
      }
    };

    const clipPaths = getPolygonClipPaths(start);

    return {
      name: `${variant}-${start}${blur ? '-blur' : ''}`,
      css: `
      ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
      }

      ::view-transition-new(root) {
        animation-name: reveal-light-${start}${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${start}${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      @keyframes reveal-dark-${start}${blur ? '-blur' : ''} {
        from {
          clip-path: ${clipPaths.darkFrom};
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: ${clipPaths.darkTo};
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }

      @keyframes reveal-light-${start}${blur ? '-blur' : ''} {
        from {
          clip-path: ${clipPaths.lightFrom};
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: ${clipPaths.lightTo};
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }
      `,
    };
  }

  // Handle circle variants with start positions using clip-path
  if (variant === 'circle' && start !== 'center') {
    const getClipPathPosition = (position: AnimationStart) => {
      switch (position) {
        case 'top-left':
          return '0% 0%';
        case 'top-right':
          return '100% 0%';
        case 'bottom-left':
          return '0% 100%';
        case 'bottom-right':
          return '100% 100%';
        case 'top-center':
          return '50% 0%';
        case 'bottom-center':
          return '50% 100%';
        default:
          return '50% 50%';
      }
    };

    const clipPosition = getClipPathPosition(start);
    const name = `theme-circle-${start}${blur ? '-blur' : ''}`;

    return {
      name,
      css: `
      ::view-transition-group(root) {
        animation-duration: 1s;
        animation-timing-function: ease;
      }
      ::view-transition-old(root),
      ::view-transition-new(root) {
        mix-blend-mode: normal;
      }
      /* Restore the original dark-to-light reveal. */
      ::view-transition-old(root) {
        animation: none;
        z-index: 0;
      }
      ::view-transition-new(root) {
        animation: ${name}-reveal 1s ease both;
        z-index: 1;
      }
      /* Reverse the path for light-to-dark, keeping the outgoing page sharp. */
      .dark::view-transition-old(root) {
        animation: ${name}-path 1s ease reverse both;
        z-index: 1;
      }
      .dark::view-transition-new(root) {
        animation: none;
        z-index: 0;
      }
      @keyframes ${name}-path {
        from { clip-path: circle(0% at ${clipPosition}); }
        to { clip-path: circle(150% at ${clipPosition}); }
      }
      @keyframes ${name}-reveal {
        from {
          clip-path: circle(0% at ${clipPosition});
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: circle(150% at ${clipPosition});
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }
      `,
    };
  }

  return {
    name: `${variant}-${start}${blur ? '-blur' : ''}`,
    css: `
      ::view-transition-group(root) {
        animation-timing-function: var(--expo-in);
      }
      ::view-transition-new(root) {
        mask: url('${svg}') ${start.replace('-', ' ')} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale-${start}${blur ? '-blur' : ''} 1s;
        transform-origin: ${transformOrigin};
        ${blur ? 'filter: blur(2px);' : ''}
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: scale-${start}${blur ? '-blur' : ''} 1s;
        transform-origin: ${transformOrigin};
        z-index: -1;
      }
      @keyframes scale-${start}${blur ? '-blur' : ''} {
        from {
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          mask-size: 2000vmax;
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }
    `,
  };
};
