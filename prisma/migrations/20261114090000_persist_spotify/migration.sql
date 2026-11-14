-- Additive migration: preserve any existing page-view data.
CREATE TABLE IF NOT EXISTS "Views" (
  "slug" TEXT NOT NULL PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE "SpotifyListening" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "state" TEXT NOT NULL DEFAULT 'unavailable',
  "trackId" TEXT,
  "trackKind" TEXT,
  "observedAt" TIMESTAMP(3),
  "checkedAt" TIMESTAMP(3),
  "nextCheckAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leaseToken" TEXT,
  "leaseUntil" TIMESTAMP(3)
);
