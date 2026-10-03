import { sprawdzWersjeIoss } from "./ioss-import-cache";
import mapa from "@/data/mapa_wyzwan.json";
import kondycja from "@/data/kondycja_malopolski.json";
import { wczytajIoss, NAZWY_WSKAZNIKOW, WSKAZNIKI_OBSZARU } from "./radar";
import { zapamietaj } from "./pamiec";
import type { ObszarId } from "./obszary";

export type ObszarMapy = { id: ObszarId; nazwa: string; dane: string[]; wyzwania: string[] };
export const obszaryMapy: ObszarMapy[] = (mapa.obszary as { id: ObszarId; nazwa: string; dane: string[]; kluczowe_wyzwania: string[] }[]).map((o) => ({
  id: o.id, nazwa: o.nazwa, dane: o.dane, wyzwania: o.kluczowe_wyzwania,
}));

const ZRODLA: Record<string, { tytul: string; url?: string }> = kondycja.zrodla as Record<string, { tytul: string; url?: string }>;
export type FaktRaportu = { tekst: string; zrodlo: string; strona: number | null; url?: string };
export const faktyRaportow: FaktRaportu[] = (kondycja.fakty as { tekst: string; zrodlo: string; strona?: number }[]).map((f) => ({
  tekst: f.tekst, zrodlo: ZRODLA[f.zrodlo]?.tytul ?? f.zrodlo, strona: f.strona ?? null, url: ZRODLA[f.zrodlo]?.url,
}));

export type WskaznikMapy = { id: number; nazwa: string; kierunek: 1 | -1; wartosci: Record<string, number> };
/** Wartości wskaźników IOSS dla 22 powiatów, pogrupowane według obszarów Mapy Wyzwań (część na 10 tys. mieszkańców). */
export async function wskaznikiDoMapy(): Promise<{ powiaty: string[]; obszary: Record<string, WskaznikMapy[]> }> {
  await sprawdzWersjeIoss();
  return zapamietaj("mapa-wskaznikow", 600_000, wskaznikiDoMapyZDanych);
}

async function wskaznikiDoMapyZDanych(): Promise<{ powiaty: string[]; obszary: Record<string, WskaznikMapy[]> }> {
  const io = await wczytajIoss();
  const obszary: Record<string, WskaznikMapy[]> = {};
  for (const [obszar, lista] of Object.entries(WSKAZNIKI_OBSZARU)) {
    obszary[obszar] = lista.map((w) => ({
      id: w.id,
      nazwa: NAZWY_WSKAZNIKOW[w.id] + (w.na10k ? " (na 10 tys. mieszkańców)" : ""),
      kierunek: w.kierunek,
      wartosci: Object.fromEntries(
        io.powiaty.filter((p) => io.wartosci[w.id]?.[p] !== undefined && (!w.na10k || io.ludnosc[p] > 0)).map((p) => [p, Math.round((w.na10k ? (io.wartosci[w.id][p] / io.ludnosc[p]) * 10000 : io.wartosci[w.id][p]) * 100) / 100]),
      ),
    }));
  }
  return { powiaty: io.powiaty, obszary };
}

export const MATERIALY = [
  { tytul: "Mapa Wyzwań Społecznych Małopolski", opis: "8 obszarów wyzwań z danymi, kluczowymi wyzwaniami i personami.", url: "https://rops.krakow.pl/mpliki/IS/IWS_20/za._nr_2._Mapa_Wyzwa_Spoecznych.pdf" },
  { tytul: "Przewodnik po innowacjach społecznych", opis: "Jak inkubować i upowszechniać innowacje społeczne (ROPS, 2019).", url: "https://rops.krakow.pl/mpliki/IS/ikony_PUBLIKACJE/InnMalopolska_przewodnik_po_innowacjach.pdf" },
  { tytul: "Kanwa innowacji społecznych INNO AGH", opis: "Plansze do prototypowania pomysłu krok po kroku.", url: "https://rops.krakow.pl/mpliki/IS/Moj_folder/INNO_AGH_-_SOCIAL_CANVAS.pdf" },
  { tytul: "Usługi społeczne w Małopolsce: diagnoza 2025", opis: "Deficyty, potrzeby i potencjał rozwojowy (licencja CC BY 4.0).", url: ZRODLA.diagnoza_2025?.url ?? "https://rops.krakow.pl/badania-analizy-raporty/raporty-z-badan" },
  { tytul: "Wszystkie raporty ROPS", opis: "Ponad 30 raportów z badań i analiz z lat 2014–2026.", url: "https://rops.krakow.pl/badania-analizy-raporty/raporty-z-badan" },
  { tytul: "Publikacje ze świata innowacji", opis: "Publikacje i dobre praktyki Inkubatora Innowacji Społecznych.", url: "https://rops.krakow.pl/innowacje-spoleczne/publikacje-ze-swiata-innowacji" },
];
