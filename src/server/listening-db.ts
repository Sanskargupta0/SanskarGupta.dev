import "server-only";
import { PrismaClient } from "@prisma/client";
import { env } from "~/constants/env";

// Listening state must be read live. Use PostgreSQL directly rather than the
// HTTP Accelerate transport, whose fetches can pass through framework caches.
const globalForListening = globalThis as unknown as {
  listeningDb: PrismaClient | undefined;
};

const connection = new URL(env.POSTGRES_URL_NON_POOLING);
connection.searchParams.set("connection_limit", "2");
connection.searchParams.set("pool_timeout", "10");

export const listeningDb =
  globalForListening.listeningDb ??
  new PrismaClient({
    datasources: { db: { url: connection.toString() } },
    log: ["error"],
  });

globalForListening.listeningDb = listeningDb;
