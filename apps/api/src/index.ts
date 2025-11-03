import { Hono } from "hono";
import { logger } from "hono/logger";
import { withPrisma } from "@/lib/prisma.js";
import todos from "@/v1/routes/todos.js";
import { auth, type AuthContext } from "@/lib/auth.js";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { prisma } from "@monotodo/database";

const app = new Hono<AuthContext>();

// Middleware
app.use("*", requestId());
app.use("*", logger());

app.use(
  "/api/v1/*",
  cors({
    origin: process.env.WEB_URL || "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

app.use("/api/v1/*", withPrisma);

// API v1 routes
app.on(["POST", "GET"], "/api/v1/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/api/v1", todos);

// Health check endpoint
app.get("/health", async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    return c.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      503,
    );
  }
});

// Session check endpoint
app.get("/session", (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({
    data: {
      user,
      session,
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

// Error handler
app.onError((err, c) => {
  const requestId = c.get("requestId");
  console.error(`[${requestId}] Error:`, err);

  if (process.env.NODE_ENV === "production") {
    return c.json(
      {
        error: "Internal Server Error",
        requestId, //Help users report issues without exposing details
      },
      500,
    );
  }

  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
      stack: err.stack,
    },
    500,
  );
});

export default app;
