"use client";
import { MusicPlaybackProvider } from "./music-playback";
import MusicIsland from "~/components/music-island";
import { CommandMenuProvider } from "~/components/command-menu";
import type { CommandSearchEntry } from "~/types/command-search";
import { ReactNode } from "react";

import PetCat from "~/components/pet-cat";
import ScrollProgress from "~/components/scroll-progress";
import { TooltipProvider } from "~/components/ui/tooltip";
import TopLoader from "~/components/ui/top-loader";
import LoadingScreen from "~/components/ui/loading-screen";
import ReactQueryProvider from "./react-query";
import { Toaster } from "~/components/ui/sonner";
import I18nProvider from "~/components/providers/i18n-provider";
import { ThemeProvider } from "~/components/providers/theme-provider";

const RootProviders = ({
  children,
  searchEntries,
}: {
  children: ReactNode;
  searchEntries: CommandSearchEntry[];
}) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      storageKey="portfolioTheme"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <ReactQueryProvider>
          <TooltipProvider>
            <CommandMenuProvider entries={searchEntries}>
              <MusicPlaybackProvider>
                <PetCat />
                <ScrollProgress />
                <TopLoader />
                <LoadingScreen />
                {children}
                <Toaster />
                <MusicIsland />
              </MusicPlaybackProvider>
            </CommandMenuProvider>
          </TooltipProvider>
        </ReactQueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

export default RootProviders;
