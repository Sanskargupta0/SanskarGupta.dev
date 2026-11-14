import "server-only";
import { randomUUID } from "node:crypto";
import type { SpotifyListening } from "@prisma/client";
import { listeningDb as db } from "~/server/listening-db";
import type { ListeningStatus } from "~/types/listening";

const ENDPOINT =
  "https://spotify-github-profile.kittinanx.com/api/view?uid=31ne3c5fannnnfr4vr24ba4tqime&redirect=true&show_offline=true";
const ID = "spotify-profile";

function status(row: SpotifyListening): ListeningStatus {
  return {
    state: row.state === "playing" || row.state === "offline" ? row.state : "unavailable",
    track:
      row.trackId && (row.trackKind === "track" || row.trackKind === "episode") && row.observedAt
        ? { id: row.trackId, kind: row.trackKind, observedAt: row.observedAt.toISOString() }
        : null,
    checkedAt: (row.checkedAt ?? new Date()).toISOString(),
  };
}

export async function getListeningStatus(): Promise<ListeningStatus> {
  let saved: SpotifyListening | null = null;
  let token: string | undefined;
  try {
    saved = await db.spotifyListening.upsert({
      where: { id: ID },
      create: { id: ID, nextCheckAt: new Date(0) },
      update: {},
    });
    const now = new Date();
    if (saved.nextCheckAt > now) return status(saved);
    token = randomUUID();
    // Atomic claim shared by all Vercel instances; an abandoned lease expires.
    const claim = await db.spotifyListening.updateMany({
      where: {
        id: ID,
        nextCheckAt: { lte: now },
        OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }],
      },
      data: { leaseToken: token, leaseUntil: new Date(now.getTime() + 20_000) },
    });
    if (!claim.count) {
      return status((await db.spotifyListening.findUnique({ where: { id: ID } })) ?? saved);
    }
    let state: ListeningStatus["state"] = "unavailable";
    let track: { trackId: string; trackKind: string; observedAt: Date } | undefined;
    let delay = 60_000;
    try {
      const response = await fetch(ENDPOINT, {
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (response.status === 429) {
        const header = response.headers.get("retry-after");
        const seconds = Number(header);
        const retry =
          header && !Number.isFinite(seconds) ? Date.parse(header) - Date.now() : seconds * 1000;
        if (Number.isFinite(retry)) delay = Math.max(delay, retry);
      } else if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location") ?? "";
        const match =
          /^spotify:(track|episode):([a-zA-Z0-9]{22})$/.exec(location) ??
          /^https:\/\/open\.spotify\.com\/(track|episode)\/([a-zA-Z0-9]{22})(?:\?[^#]*)?$/.exec(
            location
          );
        if (!match) throw new Error("Invalid destination");
        state = "playing";
        track = { trackKind: match[1], trackId: match[2], observedAt: new Date() };
        delay = 30_000;
      } else if (
        response.ok &&
        (response.headers.get("content-type") ?? "").includes("image/svg+xml")
      ) {
        const body = await response.text();
        if (!body.includes("Currently not playing on Spotify"))
          throw new Error("Unrecognized badge");
        state = "offline";
        delay = 30_000;
      }
    } catch {
      // Retain the saved song; provider failures must not be reported as offline.
    }
    const checkedAt = new Date();
    const updated = await db.spotifyListening.updateMany({
      where: { id: ID, leaseToken: token },
      data: {
        state,
        ...track,
        checkedAt,
        nextCheckAt: new Date(checkedAt.getTime() + delay),
        leaseToken: null,
        leaseUntil: null,
      },
    });
    const latest = await db.spotifyListening.findUnique({ where: { id: ID } });
    if (!updated.count || !latest) return { ...status(latest ?? saved), state: "unavailable" };
    return status(latest);
  } catch {
    console.error("Spotify listening storage unavailable");
    return {
      state: "unavailable",
      track: saved ? status(saved).track : null,
      checkedAt: new Date().toISOString(),
    };
  }
}
