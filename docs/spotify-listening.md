# Database-backed Spotify listening

The existing public spotify-github-profile connection supplies current status and track IDs. No Spotify developer app or new credentials are required.

## Storage and deployment

A single `SpotifyListening` record (`spotify-profile`) in the existing PostgreSQL database stores the last detected track, observation time, current status, last check time and next refresh time. Offline responses and provider failures never erase the saved song. Nothing is fabricated before the first playing track is detected. No complete listening history is collected.

The additive Prisma migration creates this table and creates the existing schema's `Views` table if absent. Vercel's existing build command runs `prisma generate && prisma migrate deploy && next build`; no new environment variables or services are needed.

## Shared refresh behavior

Every request reads the database. Results remain fresh for 30 seconds; when stale, one request claims an atomic 20-second database lease and checks the provider with an eight-second timeout. Concurrent requests return the previously saved result rather than calling the provider again. Expired leases can be reclaimed, and the lease token prevents a late response from overwriting a newer refresh.

Recognized redirects mean playing; recognized offline SVG responses mean offline. Errors, unexpected content and invalid redirects mean unavailable. Failed checks back off for 60 seconds; provider Retry-After headers can extend the shared delay. Database failures return unavailable without exposing credentials or errors to visitors.

Visible tabs poll every 30 seconds (60 seconds after errors), and check again on focus. There is no scheduled background collector, so songs played without visitors or between checks can be missed. The label is therefore last detected, rather than guaranteed last played.

## Player

The compact Spotify embed loads the detected or saved song without autoplay. It retains its selected track and theme while open; Update song switches to a new detected track only when requested. Switching to the original music player stops the embed. Spotify controls preview and playback availability.

## Verification

After generating the Prisma client and applying migrations, run `node scripts/test-listening.cjs` with database environment variables configured. This integration check creates and removes a uniquely named test row, mocks provider responses, and verifies persistence across fresh module instances, shared freshness, offline/error retention, rate-limit backoff, concurrent refresh leasing and invalid redirects. It never changes the live profile row or calls Spotify.
