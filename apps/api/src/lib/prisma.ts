import { prisma, type PrismaClient } from "@monotodo/database";
import type { Context, Next } from "hono";

export function withPrisma(c: Context, next: Next) {
  if (!c.get("prisma")) {
    c.set("prisma", prisma);
  }

  return next();
}

export type PrismaContext = {
  Variables: {
    prisma: PrismaClient;
  };
};
