import { serve } from "@hono/node-server";
import app from "@/index.js";

const PORT = parseInt(process.env.API_PORT || "8000", 10);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
