/**
 * Smoke test — exercises the full CRUD API against a running local server.
 * Usage: npm run dev:api  (in one terminal)  then  npm run smoke
 * Requires MONGODB_URI in .env (or environment).
 */
try {
  process.loadEnvFile();
} catch {
  /* no .env — rely on environment variables */
}

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3001/api";
const today = new Date().toISOString().slice(0, 10);
const date = `2099-01-01`; // far-future test date, won't collide with real data

let failures = 0;
function check(name, cond) {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.error(`  ✗ ${name}`);
  }
}

async function main() {
  console.log(`Smoke test against ${BASE}`);

  // health
  const health = await fetch(`${BASE}/health`).then((r) => r.json());
  check("health ok", health.ok === true);

  // create
  const created = await fetch(`${BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, level: 4, note: "smoke test entry" }),
  }).then((r) => r.json());
  check("create returns entry", created.date === date && created.level === 4);

  // upsert (same date, new level)
  const upserted = await fetch(`${BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, level: 2 }),
  }).then((r) => r.json());
  check("upsert updates level", upserted.level === 2);

  // list
  const list = await fetch(`${BASE}/entries?from=${date}&to=${date}`).then((r) => r.json());
  check("list returns entry", Array.isArray(list) && list.length === 1 && list[0].date === date);

  // patch
  const patched = await fetch(`${BASE}/entries/${date}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: "updated note" }),
  }).then((r) => r.json());
  check("patch updates note", patched.note === "updated note" && patched.level === 2);

  // validation: bad level
  const bad = await fetch(`${BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, level: 9 }),
  });
  check("rejects invalid level", bad.status === 400);

  // validation: bad date
  const badDate = await fetch(`${BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: "2026-13-99", level: 3 }),
  });
  check("rejects invalid date", badDate.status === 400);

  // delete
  const del = await fetch(`${BASE}/entries/${date}`, { method: "DELETE" }).then((r) => r.json());
  check("delete ok", del.ok === true && del.deleted === 1);

  // confirm gone
  const after = await fetch(`${BASE}/entries?from=${date}&to=${date}`).then((r) => r.json());
  check("entry removed", after.length === 0);

  console.log(failures === 0 ? "\nAll checks passed ✅" : `\n${failures} check(s) failed ❌`);
  // use exitCode instead of process.exit() to avoid a Node/undici
  // assertion on Windows when sockets are still open
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error("Smoke test crashed:", err.message);
  console.error("Is the API running? Start it with: npm run dev:api");
  process.exitCode = 1;
});