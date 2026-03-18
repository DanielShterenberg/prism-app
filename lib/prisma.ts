/**
 * Prisma client singleton for Next.js.
 *
 * In development, Next.js hot-reload creates new module instances on each
 * reload, which would exhaust the database connection pool. We attach the
 * client to `globalThis` so it is reused across reloads.
 *
 * In production, a fresh PrismaClient instance is created per cold start.
 *
 * Usage:
 *   import prisma from "@/lib/prisma";
 *   const assessment = await prisma.assessment.findUnique({ where: { id } });
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
