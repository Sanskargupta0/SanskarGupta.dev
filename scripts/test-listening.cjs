// Integration test: use a configured PostgreSQL database after prisma migrate deploy.
// Creates and removes only its own uniquely named test record; never calls Spotify.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { randomUUID } = require("node:crypto");
const ts = require("typescript");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient({ datasources: { db: { url: process.env.POSTGRES_URL_NON_POOLING } } });
const id = "listening-test-" + randomUUID();
const trackId = "1234567890123456789012";
let calls = 0;
let provider = () =>
  new Response(null, { status: 302, headers: { location: "spotify:track:" + trackId } });
const source = fs
  .readFileSync("src/lib/listening.ts", "utf8")
  .replace('const ID = "spotify-profile";', `const ID = "${id}";`);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function freshInstance() {
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    Date,
    AbortSignal,
    console,
    require: (name) =>
      name === "server-only"
        ? {}
        : name === "~/server/listening-db"
          ? { listeningDb: db }
          : require(name),
    fetch: async () => {
      calls++;
      return provider();
    },
  });
  return exports.getListeningStatus;
}
const expire = () =>
  db.spotifyListening.update({ where: { id }, data: { nextCheckAt: new Date(0) } });
(async () => {
  const playing = await freshInstance()();
  assert.equal(playing.state, "playing");
  assert.equal(playing.track.id, trackId);
  const cold = await freshInstance()();
  assert.equal(cold.track.id, trackId);
  assert.equal(calls, 1, "fresh instances share the database freshness window");
  await expire();
  provider = () =>
    new Response("Currently not playing on Spotify", {
      headers: { "content-type": "image/svg+xml" },
    });
  const offline = await freshInstance()();
  assert.equal(offline.state, "offline");
  assert.equal(offline.track.id, trackId);
  assert.equal(offline.track.observedAt, playing.track.observedAt);
  await expire();
  provider = () => {
    throw new Error("Network unavailable");
  };
  const failed = await freshInstance()();
  assert.equal(failed.state, "unavailable");
  assert.equal(failed.track.id, trackId);
  await expire();
  provider = () => new Response(null, { status: 429, headers: { "retry-after": "120" } });
  await freshInstance()();
  const limited = await db.spotifyListening.findUnique({ where: { id } });
  assert.ok(limited.nextCheckAt - limited.checkedAt >= 120000);
  await expire();
  let release;
  let started;
  const called = new Promise((resolve) => {
    started = resolve;
  });
  provider = () =>
    new Promise((resolve) => {
      release = () =>
        resolve(
          new Response(null, { status: 302, headers: { location: "spotify:track:" + trackId } })
        );
      started();
    });
  const before = calls;
  const owner = freshInstance()();
  await called;
  const visitors = await Promise.all(Array.from({ length: 5 }, () => freshInstance()()));
  assert.equal(calls, before + 1, "only one provider call while the lease is held");
  assert.ok(visitors.every((result) => result.track.id === trackId));
  release();
  await owner;
  await db.spotifyListening.update({
    where: { id },
    data: { nextCheckAt: new Date(0), leaseToken: "abandoned", leaseUntil: new Date(0) },
  });
  provider = () =>
    new Response(null, { status: 302, headers: { location: "https://malicious.example/track" } });
  assert.equal((await freshInstance()()).state, "unavailable");
  assert.equal((await freshInstance()()).track.id, trackId);
  console.log(
    "PASS: persistence across fresh instances, freshness, offline retention, error retention, rate limits, concurrent leases, expired lease recovery and invalid redirects."
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.spotifyListening.deleteMany({ where: { id } });
    await db.$disconnect();
  });
