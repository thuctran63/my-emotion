import { MongoClient, type Collection, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

let cached: Promise<Db> | undefined;
let client: MongoClient | undefined;

/** Shared singleton connection — safe to reuse across serverless invocations. */
export function getDb(): Promise<Db> {
  if (!uri) {
    // Dev-only in-memory store so the app runs without Atlas.
    // ponytail: swap for a real DB when MONGODB_URI is set.
    return Promise.resolve(memDb());
  }
  if (!cached) {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    cached = client.connect().then((c) => c.db());
  }
  return cached;
}

// --- In-memory fallback (dev, no MONGODB_URI) ---
type MemRow = EntryDoc & { _id: number };
const memRows = new Map<string, MemRow>();
let memSeq = 1;

function memDb(): Db {
  const col = {
    find: (q: Record<string, unknown>) => ({
      sort: () => ({
        toArray: async () => {
          const { date } = q as { date?: { $gte?: string; $lte?: string } };
          let rows = [...memRows.values()];
          if (date?.$gte) rows = rows.filter((r) => r.date >= date.$gte!);
          if (date?.$lte) rows = rows.filter((r) => r.date <= date.$lte!);
          return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
        },
      }),
    }),
    findOneAndUpdate: async (
      filter: { date: string },
      update: { $set: Record<string, unknown>; $setOnInsert?: Record<string, unknown> },
      opts: { upsert?: boolean; returnDocument?: string }
    ) => {
      let row = memRows.get(filter.date);
      if (!row && opts?.upsert) {
        row = { _id: memSeq++, date: filter.date, level: 1, ...(update.$setOnInsert ?? {}) } as MemRow;
        memRows.set(filter.date, row);
      }
      if (!row) return null;
      Object.assign(row, update.$set);
      memRows.set(filter.date, row);
      return { ...row };
    },
    deleteOne: async (filter: { date: string }) => {
      const had = memRows.delete(filter.date);
      return { deletedCount: had ? 1 : 0 };
    },
  };
  return { collection: () => col } as unknown as Db;
}

export type EntryDoc = {
  _id?: unknown;
  date: string; // YYYY-MM-DD (user's local tz)
  level: number; // 1..5
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export function entries(): Promise<Collection<EntryDoc>> {
  return getDb().then((db) => db.collection<EntryDoc>("entries"));
}
