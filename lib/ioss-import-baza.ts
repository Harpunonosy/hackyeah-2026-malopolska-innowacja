import type { Pool } from 'pg';
import { db } from './db';
import { parsujIossCsv } from './ioss-import';
import { zastosujWersjeIoss } from './ioss-import-cache';

export type ImportIossPodsumowanie = { liczba: number; dodane: number; zaktualizowane: number };

/** Dane i dziennik zapisują się razem; każda awaria wycofuje całą transakcję. */
export async function importujIoss(csv: string, pool: Pick<Pool, 'connect'> = db()): Promise<ImportIossPodsumowanie> {
  const wynik = parsujIossCsv(csv);
  if (!wynik.ok) throw new Error('walidacja');
  const klient = await pool.connect();
  let podsumowanie: ImportIossPodsumowanie;
  try {
    await klient.query('begin');
    const { rows } = await klient.query<{ nowy: boolean }>(
      `insert into ioss (wskaznik_id, kategoria, wskaznik, rok, powiat, wartosc)
       select wskaznik_id, kategoria, wskaznik, rok, powiat, wartosc
       from jsonb_to_recordset($1::jsonb) as w(wskaznik_id int, kategoria text, wskaznik text, rok int, powiat text, wartosc numeric)
       order by wskaznik_id, powiat, rok
       on conflict (wskaznik_id, powiat, rok) do update
       set kategoria=excluded.kategoria, wskaznik=excluded.wskaznik, wartosc=excluded.wartosc
       returning (xmax=0) as nowy`,
      [JSON.stringify(wynik.wiersze)],
    );
    const dodane = rows.filter(r => r.nowy).length;
    podsumowanie = { liczba: rows.length, dodane, zaktualizowane: rows.length - dodane };
    const szczegoly = {
      ...podsumowanie,
      lata: [...new Set(wynik.wiersze.map(w => w.rok))].sort(),
      wskazniki: [...new Set(wynik.wiersze.map(w => w.wskaznik_id))].sort((a, b) => a - b),
      powiaty: [...new Set(wynik.wiersze.map(w => w.powiat))].sort(),
      braki: wynik.wiersze.filter(w => w.wartosc === null).length,
    };
    await klient.query(
      "insert into dziennik (kto, akcja, obiekt, opis, szczegoly) values ('admin', 'ioss.import', 'ioss', $1, $2::jsonb)",
      [`Import CSV IOSS: ${podsumowanie.liczba} rekordów; dodano ${dodane}, zaktualizowano ${podsumowanie.zaktualizowane}.`, JSON.stringify(szczegoly)],
    );
    await klient.query('commit');
  } catch (e) {
    await klient.query('rollback');
    throw e;
  } finally { klient.release(); }
  zastosujWersjeIoss();
  return podsumowanie;
}
