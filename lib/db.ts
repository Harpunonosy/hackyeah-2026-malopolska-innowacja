// Połączenie z Postgresem (Supabase przez pooler transakcyjny). Tylko po stronie serwera.
import { Pool } from "pg";

const g = globalThis as unknown as { __pool?: Pool };

export function db(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("Brak DATABASE_URL");
  g.__pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 5,
  });
  return g.__pool;
}
