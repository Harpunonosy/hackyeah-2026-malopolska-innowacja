import type { Pool } from 'pg';
import { db } from './db';
import { zapomnij, zapomnijPrefiks } from './pamiec';

const INTERWAL_MS = 3000;

/** Każda instancja sprawdza wspólną wersję przed skorzystaniem z cache widoków. */
export function utworzSynchronizacjeIoss(pobierzWersje: () => Promise<string>, uniewaznij: () => void, teraz = Date.now) {
  let wersja: string | null = null, sprawdzono = -Infinity, generacja = 0;
  let obietnica: Promise<void> | null = null;
  return {
    sprawdz(): Promise<void> {
      if (teraz() - sprawdzono < INTERWAL_MS) return Promise.resolve();
      if (obietnica) return obietnica;
      const biezacaGeneracja = generacja;
      const probe = pobierzWersje().then(nowa => {
        // Wynik zapytania sprzed lokalnego importu nie może przywrócić starej wersji.
        if (generacja !== biezacaGeneracja) return;
        if (wersja !== null && nowa !== wersja) uniewaznij();
        wersja = nowa;
        sprawdzono = teraz();
      }).finally(() => { if (obietnica === probe) obietnica = null; });
      obietnica = probe;
      return probe;
    },
    zastosujWersje(nowa: string | null) {
      generacja++;
      wersja = nowa;
      sprawdzono = nowa === null ? -Infinity : teraz();
      uniewaznij();
    },
  };
}

function uniewaznijWidoki() {
  zapomnij('ioss');
  zapomnij('mapa-wskaznikow');
  zapomnijPrefiks('profil-powiatu:');
}
const g = globalThis as unknown as { __iossSynchronizacja?: ReturnType<typeof utworzSynchronizacjeIoss> };
export async function odczytajWersjeIoss(pool: Pick<Pool, 'query'> = db()): Promise<string> {
  const { rows } = await pool.query<{ wersja: string }>("select coalesce(max(id),0)::text || ':' || count(*)::text as wersja from dziennik where akcja='ioss.import'");
  return rows[0].wersja;
}
const synchronizacja = (g.__iossSynchronizacja ??= utworzSynchronizacjeIoss(() => odczytajWersjeIoss(), uniewaznijWidoki));

export const sprawdzWersjeIoss = () => synchronizacja.sprawdz();
/** Commit usuwa lokalny cache natychmiast; kolejny odczyt ustala wersję całego dziennika. */
export const zastosujWersjeIoss = () => synchronizacja.zastosujWersje(null);
