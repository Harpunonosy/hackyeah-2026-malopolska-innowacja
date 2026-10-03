import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

// Aktualizacja istniejącego demo (schema.sql + migracje 002–012).
// Nie odtwarzamy bazy ani danych przy każdym wdrożeniu.
const PLIKI = ['013_akademia.sql', '014_odtwarzalnosc.sql'];

export class BladMigracji extends Error {}

export async function odczytajMigracje() {
  return Promise.all(PLIKI.map(async nazwa => {
    const sql = await readFile(new URL(`../db/${nazwa}`, import.meta.url), 'utf8');
    return { nazwa, sql, sha256: createHash('sha256').update(sql).digest('hex') };
  }));
}

/** @param {{ DATABASE_URL?: string }} env */
export function ustawieniaPolaczenia(env) {
  if (!env.DATABASE_URL) throw new BladMigracji('Brak DATABASE_URL w zmiennych środowiskowych Vercela.');
  let url;
  try { url = new URL(env.DATABASE_URL); } catch { throw new BladMigracji('Niepoprawny DATABASE_URL.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new BladMigracji('Niepoprawny DATABASE_URL.');
  const lokalne = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  return {
    connectionString: env.DATABASE_URL,
    ssl: lokalne ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  };
}

/**
 * Jedno połączenie i blokada transakcyjna, także przez pooler Supabase.
 * DDL i dziennik zatwierdzamy razem; błąd nie pozostawia połowy migracji.
 * @param {{ query: (sql: string, params?: string[]) => Promise<{ rows: { nazwa?: string, sha256?: string }[] }> }} klient
 * @param {{ nazwa: string, sql: string, sha256: string }[]} migracje
 * @param {(wiadomosc: string) => void} log
 */
export async function zastosujMigracje(klient, migracje, log = () => {}) {
  await klient.query('BEGIN');
  try {
    await klient.query("SET LOCAL statement_timeout = '60s'");
    await klient.query("SET LOCAL lock_timeout = '20s'");
    await klient.query('SET LOCAL search_path = public');
    await klient.query('SELECT pg_advisory_xact_lock(75627601)');
    await klient.query(`CREATE TABLE IF NOT EXISTS public.splot_migracje (
      nazwa text PRIMARY KEY,
      sha256 text NOT NULL,
      zastosowano timestamptz NOT NULL DEFAULT now()
    )`);
    await klient.query('ALTER TABLE public.splot_migracje ENABLE ROW LEVEL SECURITY');
    const { rows } = await klient.query('SELECT nazwa, sha256 FROM public.splot_migracje');
    const zapisane = new Map(rows.map(r => [r.nazwa, r.sha256]));
    // Sprawdź cały zestaw przed pierwszym DDL aplikacji.
    for (const m of migracje) {
      if (zapisane.has(m.nazwa) && zapisane.get(m.nazwa) !== m.sha256) {
        throw new BladMigracji(`Zmieniono zastosowaną migrację ${m.nazwa}. Dodaj nową migrację zamiast edytować istniejącą.`);
      }
    }
    const zastosowane = [];
    for (const m of migracje) {
      if (zapisane.has(m.nazwa)) continue;
      await klient.query(m.sql);
      await klient.query('INSERT INTO public.splot_migracje (nazwa, sha256) VALUES ($1, $2)', [m.nazwa, m.sha256]);
      zastosowane.push(m.nazwa);
    }
    await klient.query('COMMIT');
    for (const nazwa of zastosowane) log(`Migracja zastosowana: ${nazwa}`);
    if (!zastosowane.length) log('Baza jest aktualna; migracje pominięte.');
  } catch (blad) {
    try { await klient.query('ROLLBACK'); } catch { /* Zachowaj pierwotny błąd. */ }
    throw blad;
  }
}
