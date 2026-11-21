import { PrismaClient } from "@prisma/client";
import { env } from "~/constants/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = !env.POSTGRES_PRISMA_URL
  ? null
  : (globalForPrisma.prisma ??
    new PrismaClient({
      log:
        env.NODE_ENV === "development"
          ? process.env.PRISMA_LOG_QUERIES === "true"
            ? ["query", "error", "warn"]
            : ["error", "warn"]
          : ["error"],
      datasources: {
        db: {
          url: env.POSTGRES_PRISMA_URL,
        },
      },
    }));

if (env.NODE_ENV !== "production" && db) globalForPrisma.prisma = db;
