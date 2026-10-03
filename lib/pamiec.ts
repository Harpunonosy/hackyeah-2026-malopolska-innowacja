// Pamięć podręczna w procesie dla danych, które zmieniają się rzadko (IOSS, katalog).
// Równoległe żądania czekają na jedno zapytanie do bazy zamiast wysyłać własne.
type Wpis = { t: number; obietnica: Promise<unknown> };
const g = globalThis as unknown as { __pamiec?: Map<string, Wpis> };
const mapa = (g.__pamiec ??= new Map());

export function zapamietaj<T>(klucz: string, ttlMs: number, pobierz: () => Promise<T>): Promise<T> {
  const w = mapa.get(klucz);
  if (w && Date.now() - w.t < ttlMs) return w.obietnica as Promise<T>;
  const obietnica = pobierz().catch((e) => {
    mapa.delete(klucz); // błędu nie zapamiętujemy
    throw e;
  });
  mapa.set(klucz, { t: Date.now(), obietnica });
  return obietnica;
}

export function zapomnij(klucz: string) {
  mapa.delete(klucz);
}
