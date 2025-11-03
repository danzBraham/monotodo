import { Hono } from "hono";
import type { PrismaContext } from "@/lib/prisma.js";
import type { AuthenticatedContext } from "@/lib/auth.js";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "@/middleware/auth.js";
import { Prisma } from "@monotodo/database";

type TodosContext = PrismaContext & AuthenticatedContext;

const todos = new Hono<TodosContext>().basePath("/todos");

todos.use("*", requireAuth);

todos.get(
  "/",
  zValidator(
    "query",
    z.object({
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .refine((val) => val <= 100, {
          message: "Limit cannot exceed 100",
        })
        .optional(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const prisma = c.get("prisma");

    const { page = 1, limit = 10 } = c.req.valid("query");

    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.todo.count({ where: { userId: user.id } }),
    ]);

    return c.json({
      data: todos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  },
);

todos.post(
  "/",
  zValidator(
    "json",
    z.object({
      title: z.string().min(1),
      content: z.string().optional(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");
    const prisma = c.get("prisma");

    const newTodo = await prisma.todo.create({
      data: {
        title: body.title,
        content: body.content ?? null,
        userId: user.id,
      },
    });

    return c.json({ data: newTodo }, 201);
  },
);

todos.get(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const prisma = c.get("prisma");

    const todo = await prisma.todo.findUnique({
      where: { id, userId: user.id },
    });

    if (!todo) {
      return c.json({ error: "Todo not found" }, 404);
    }

    return c.json({ data: todo });
  },
);

todos.patch(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().cuid(),
    }),
  ),
  zValidator(
    "json",
    z.object({
      title: z.string().min(1).optional(),
      content: z.string().nullable().optional(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const { title, content } = c.req.valid("json");
    const prisma = c.get("prisma");

    try {
      const updatedTodo = await prisma.todo.update({
        where: { id, userId: user.id },
        data: {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content: content ?? null }),
        },
      });

      return c.json({ data: updatedTodo });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return c.json({ error: "Todo not found" }, 404);
        }
      }
      throw error;
    }
  },
);

todos.delete(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().cuid(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const prisma = c.get("prisma");

    try {
      const todo = await prisma.todo.delete({ where: { id, userId: user.id } });
      return c.json({ data: todo });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return c.json({ error: "Todo not found" }, 404);
        }
      }
      throw error;
    }
  },
);

todos.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error("todos route error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default todos;
