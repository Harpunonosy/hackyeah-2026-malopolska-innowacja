import zrodlo from '../data/zrodla/ioss_powiaty.json';
import { normalizujPowiat } from './powiaty';

export const MAX_IOSS_BYTES = 1024 * 1024;
export const MAX_IOSS_WIERSZY = 10_000;
const MAX_BLEDOW = 100;
export const NAGLOWEK_IOSS = ['id', 'kategoria', 'wskaznik', 'rok', 'powiat', 'wartosc'] as const;
export type PoleIoss = typeof NAGLOWEK_IOSS[number] | 'plik';
export type KodBleduIoss = 'rozmiar' | 'limit_wierszy' | 'csv' | 'naglowek' | 'pusty' | 'kolumny' | 'id' | 'kategoria' | 'wskaznik' | 'rok' | 'powiat' | 'wartosc' | 'ludnosc' | 'duplikat';
export type BladIoss = { wiersz: number; pole: PoleIoss; kod: KodBleduIoss };
export type WierszIoss = { wskaznik_id: number; kategoria: string; wskaznik: string; rok: number; powiat: string; wartosc: number | null };
export type WynikIoss = { ok: true; wiersze: WierszIoss[] } | { ok: false; bledy: BladIoss[]; liczbaBledow: number };
const wskazniki = new Map(zrodlo.wskazniki.map(w => [w.id, w]));
const ujemne = new Set([91, 98, 99, 138, 139]);

/** Czyta CSV bez rozbijania cytowanych pól zawierających separator lub nowy wiersz. */
function czytajCsv(tekst: string): { pola: string[]; linia: number }[] {
  const separator = tekst.slice(0, tekst.search(/[\r\n]/) < 0 ? undefined : tekst.search(/[\r\n]/)).includes(';') ? ';' : ',';
  const wynik: { pola: string[]; linia: number }[] = [];
  let pola: string[] = [], pole = '', cytowane = false, zamkniete = false, linia = 1, poczatek = 1;
  const zakoncz = () => {
    pola.push(pole);
    // Puste linie nie są rekordami; rekord z separatorami nadal podlega walidacji.
    if (pola.length > 1 || zamkniete || pola.some(p => p.trim())) wynik.push({ pola, linia: poczatek });
    pola = []; pole = ''; zamkniete = false;
    if (wynik.length > MAX_IOSS_WIERSZY + 1) throw new Error('limit_wierszy');
  };
  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i];
    if (cytowane) {
      if (c === '"') {
        if (tekst[i + 1] === '"') { pole += '"'; i++; }
        else { cytowane = false; zamkniete = true; }
      } else {
        pole += c;
        if (c === '\n' || (c === '\r' && tekst[i + 1] !== '\n')) linia++;
      }
    } else if (c === separator) {
      pola.push(pole); pole = ''; zamkniete = false;
    } else if (c === '\n' || c === '\r') {
      zakoncz();
      if (c === '\r' && tekst[i + 1] === '\n') i++;
      linia++; poczatek = linia;
    } else if (c === '"') {
      if (pole || zamkniete) throw new Error('csv');
      cytowane = true;
    } else {
      if (zamkniete) throw new Error('csv');
      pole += c;
    }
  }
  if (cytowane) throw new Error('csv');
  if (pole || pola.length || zamkniete) zakoncz();
  return wynik;
}

/** Każdy błąd blokuje cały import; błędne rekordy nigdy nie są zwracane do zapisu. */
export function parsujIossCsv(csv: string, terazRok = new Date().getUTCFullYear()): WynikIoss {
  const bladPliku = (kod: KodBleduIoss): WynikIoss => ({ ok: false, bledy: [{ wiersz: 1, pole: 'plik', kod }], liczbaBledow: 1 });
  if (Buffer.byteLength(csv, 'utf8') > MAX_IOSS_BYTES) return bladPliku('rozmiar');
  let rekordy: ReturnType<typeof czytajCsv>;
  try { rekordy = czytajCsv(csv.replace(/^\ufeff/, '')); }
  catch (e) { return bladPliku(e instanceof Error && e.message === 'limit_wierszy' ? 'limit_wierszy' : 'csv'); }
  if (!rekordy.length) return bladPliku('pusty');
  if (rekordy.length > MAX_IOSS_WIERSZY + 1) return bladPliku('limit_wierszy');
  if (rekordy[0].pola.map(p => p.trim()).join(',') !== NAGLOWEK_IOSS.join(',')) return bladPliku('naglowek');
  if (rekordy.length === 1) return bladPliku('pusty');
  const bledy: BladIoss[] = [], wiersze: WierszIoss[] = [], klucze = new Set<string>();
  let liczbaBledow = 0;
  for (const { pola, linia } of rekordy.slice(1)) {
    const dodaj = (pole: PoleIoss, kod: KodBleduIoss) => {
      liczbaBledow++;
      if (bledy.length < MAX_BLEDOW) bledy.push({ wiersz: linia, pole, kod });
    };
    if (pola.length !== NAGLOWEK_IOSS.length) { dodaj('plik', 'kolumny'); continue; }
    const [idTekst, kategoria, wskaznik, rokTekst, powiatTekst, wartoscTekst] = pola.map(p => p.trim());
    const id = Number(idTekst), rok = Number(rokTekst), definicja = wskazniki.get(id);
    const powiat = normalizujPowiat(powiatTekst);
    const wartosc = (wartoscTekst === '' || wartoscTekst === 'nan') ? null : Number(wartoscTekst.replace(',', '.'));
    const przed = liczbaBledow;
    if (!/^\d+$/.test(idTekst) || !definicja) dodaj('id', 'id');
    if (definicja && kategoria !== definicja.kategoria) dodaj('kategoria', 'kategoria');
    if (definicja && wskaznik !== definicja.wskaznik.trim()) dodaj('wskaznik', 'wskaznik');
    if (!/^\d{4}$/.test(rokTekst) || rok < 1990 || rok > terazRok) dodaj('rok', 'rok');
    if (!powiat) dodaj('powiat', 'powiat');
    if (wartosc !== null && (!/^-?\d+(?:[.,]\d+)?$/.test(wartoscTekst) || !Number.isFinite(wartosc) || Math.abs(wartosc) > 1e12 || (wartosc < 0 && !ujemne.has(id)))) dodaj('wartosc', 'wartosc');
    if (id === 186 && wartosc !== null && wartosc <= 0) dodaj('wartosc', 'ludnosc');
    const klucz = `${id}:${powiat}:${rok}`;
    if (klucze.has(klucz)) dodaj('id', 'duplikat');
    klucze.add(klucz);
    if (liczbaBledow === przed && definicja && powiat) wiersze.push({ wskaznik_id: id, kategoria: definicja.kategoria, wskaznik: definicja.wskaznik.trim(), rok, powiat, wartosc });
  }
  return liczbaBledow ? { ok: false, bledy, liczbaBledow } : { ok: true, wiersze };
}
