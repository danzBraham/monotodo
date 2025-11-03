import { prisma } from "@monotodo/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  basePath: "/api/v1/auth",
  rateLimit: {
    // Enable in production or when explicitly enabled for testing in development
    enabled:
      process.env.NODE_ENV === "production" ||
      process.env.ENABLE_RATE_LIMIT === "true",

    // Global rate limit: 100 requests per 60 seconds
    window: 60,
    max: 100,

    // Use database storage for persistence across restarts and multi-instance deployments
    storage: "database",
    modelName: "rateLimit", // Must match Prisma model name (camelCase)

    // Custom rules for specific endpoints
    customRules: {
      // Sign-in: Very strict to prevent brute force attacks (3 attempts per 10 seconds)
      "/sign-in/email": {
        window: 10,
        max: 3,
      },
      // Sign-up: Prevent spam registrations (5 sign-ups per 60 seconds)
      "/sign-up/email": {
        window: 60,
        max: 5,
      },
      // Session checks: More lenient as they're read-only (200 per minute)
      "/get-session": {
        window: 60,
        max: 200,
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});

export type AuthContext = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export type AuthenticatedContext = {
  Variables: {
    user: NonNullable<AuthContext["Variables"]["user"]>;
    session: NonNullable<AuthContext["Variables"]["session"]>;
  };
};
