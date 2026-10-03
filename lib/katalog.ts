// Katalog innowacji w czasie działania: 115 pozycji z Biblioteki ROPS (plik) + innowacje dodane i opublikowane w Centrali (baza).
import { db } from "./db";
import { innowacje as statyczne, type Innowacja } from "./biblioteka";

type Wpis = { t: number; lista: Innowacja[]; mapa: Map<string, Innowacja> };
const g = globalThis as unknown as { __katalog?: Wpis };
const TTL_MS = 20_000;

let wToku: Promise<Wpis> | null = null;

export async function katalog(): Promise<{ lista: Innowacja[]; mapa: Map<string, Innowacja> }> {
  if (g.__katalog && Date.now() - g.__katalog.t < TTL_MS) return g.__katalog;
  // Po wygaśnięciu pamięci równoległe żądania czekają na jedno odświeżenie.
  wToku ??= odswiezKatalog().finally(() => { wToku = null; });
  return wToku;
}

async function odswiezKatalog(): Promise<Wpis> {
  const teraz = Date.now();
  let dodane: Innowacja[] = [];
  try {
    const { rows } = await db().query("select * from innowacje where zrodlo = 'dodana' and status = 'opublikowana' order by id");
    dodane = rows.map((r) => ({
      id: r.id, nazwa: r.nazwa, kategoria: r.kategoria, naCzymPolega: r.na_czym_polega ?? "", problem: r.problem ?? "", grupaDocelowa: r.grupa_docelowa ?? "",
      ktoMozeSkorzystac: r.kto_moze_skorzystac ?? "", czyToDziala: r.czy_to_dziala ?? "", autor: r.autor_organizacja ?? "", upowszechnianaW: r.upowszechniana_w ?? [],
      film: r.film ? [r.film] : [], folderPdf: r.folder_pdf ? [r.folder_pdf] : [], materialyZip: r.materialy_zip ? [r.materialy_zip] : [], url: r.url ?? "",
    }));
  } catch {
    /* baza chwilowo niedostępna: zostaje katalog z pliku */
  }
  // Nadpisania kart z Biblioteki (edycja w Centrali) i ukryte pozycje.
  const nadpisania = new Map<string, Innowacja>();
  const ukryte = new Set<string>();
  try {
    const { rows } = await db().query("select * from innowacje where zrodlo = 'nadpisana'");
    for (const r of rows) {
      if (r.status === "ukryta") ukryte.add(r.id);
      else nadpisania.set(r.id, { ...(statyczne.find((s) => s.id === r.id) as Innowacja), nazwa: r.nazwa, kategoria: r.kategoria, naCzymPolega: r.na_czym_polega ?? "", problem: r.problem ?? "", grupaDocelowa: r.grupa_docelowa ?? "", ktoMozeSkorzystac: r.kto_moze_skorzystac ?? "", czyToDziala: r.czy_to_dziala ?? "", autor: r.autor_organizacja ?? "" });
    }
  } catch {
    /* brak tabeli lub bazy: katalog z pliku */
  }
  const lista = [...statyczne.filter((i) => !ukryte.has(i.id)).map((i) => nadpisania.get(i.id) ?? i), ...dodane].sort((a, b) => a.id.localeCompare(b.id));
  g.__katalog = { t: teraz, lista, mapa: new Map(lista.map((i) => [i.id, i])) };
  return g.__katalog;
}

export function uniewaznijKatalog() {
  g.__katalog = undefined;
}

export async function innowacjaPoIdAsync(id: string) {
  return (await katalog()).mapa.get(id);
}
