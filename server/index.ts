import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { app } from "./app.js";

// Local server: re-add the /api prefix (see note in app.ts)
const local = new Hono().route("/api", app);

const port = Number(process.env.PORT) || 3001;
serve({ fetch: local.fetch, port }, (info) => {
  console.log(`API ready at http://localhost:${info.port}`);
});
