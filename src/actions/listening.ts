"use client";

import { queryOptions } from "@tanstack/react-query";
import type { ListeningStatus } from "~/types/listening";

export const listeningStatusOptions = queryOptions<ListeningStatus>({
  queryKey: ["listening-status"],
  queryFn: async ({ signal }) => {
    const response = await fetch("/api/spotify", { signal, cache: "no-store" });
    if (!response.ok) throw new Error("Listening unavailable");
    return response.json();
  },
  staleTime: 20_000,
  refetchInterval: (query) =>
    query.state.data?.state === "unavailable" || query.state.status === "error" ? 60_000 : 30_000,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: "always",
  retry: false,
});
