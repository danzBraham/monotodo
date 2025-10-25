import { Hono } from "hono";
import todos from "./v1/routes/todos.js";
import { logger } from "hono/logger";

const app = new Hono();

// Middleware
app.use("*", logger());

// API v1 routes
app.route("/api/v1", todos);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(err);

  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
    },
    500,
  );
});

export default app;
