import { Hono } from "hono";
import { app } from "../server/app.js";

// Vercel passes the FULL path (/api/health) to the function, so re-mount
// the prefix here (same as server/index.ts does for local dev).
const api = new Hono().route("/api", app);

export const GET = api.fetch;
export const POST = api.fetch;
export const PATCH = api.fetch;
export const DELETE = api.fetch;
