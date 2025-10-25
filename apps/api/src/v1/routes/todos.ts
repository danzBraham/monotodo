import { Hono } from "hono";

const todos = new Hono().basePath("/todos");

todos.get("/", (c) => {
  return c.json("Get all todos");
});

todos.post("/", (c) => {
  return c.json("Create todo");
});

todos.get("/:id", (c) => {
  const id = c.req.param("id");
  return c.json(`Get todo: ${id}`);
});

todos.put("/:id", (c) => {
  const id = c.req.param("id");
  return c.json(`Update todo: ${id}`);
});

todos.delete("/:id", (c) => {
  const id = c.req.param("id");
  return c.json(`Delete todo: ${id}`);
});

export default todos;
