import { czyAdmin } from '@/lib/sesja';
import { importujIoss } from '@/lib/ioss-import-baza';
import { NAGLOWEK_IOSS, parsujIossCsv } from '@/lib/ioss-import';
import { odczytajIossRequest, podpiszPodglad, sprawdzPodglad } from '@/lib/ioss-import-request';

export const runtime = 'nodejs';

/** Szablon nie zawiera wartości przykładowych, które można pomylić z pomiarem. */
export async function GET() {
  if (!(await czyAdmin())) return Response.json({ blad: 'brak_dostepu' }, { status: 401 });
  return new Response('\ufeff' + NAGLOWEK_IOSS.join(',') + '\r\n', {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="ioss-szablon.csv"', 'cache-control': 'no-store' },
  });
}

export async function POST(req: Request) {
  if (!(await czyAdmin())) return Response.json({ blad: 'brak_dostepu' }, { status: 401 });
  const akce = new URL(req.url).searchParams.get('akcja');
  if (akce !== 'podglad' && akce !== 'import') return Response.json({ blad: 'akcja' }, { status: 400 });
  let csv: string;
  try { csv = await odczytajIossRequest(req); }
  catch (e) {
    const blad = e instanceof Error && e.message === 'rozmiar' ? 'rozmiar' : 'kodowanie';
    return Response.json({ blad }, { status: blad === 'rozmiar' ? 413 : 400 });
  }
  const wynik = parsujIossCsv(csv);
  if (!wynik.ok) return Response.json({ blad: 'walidacja', bledy: wynik.bledy, liczbaBledow: wynik.liczbaBledow }, { status: 400 });
  if (akce === 'podglad') {
    return Response.json({
      token: podpiszPodglad(csv),
      liczba: wynik.wiersze.length,
      lata: [...new Set(wynik.wiersze.map(w => w.rok))].sort(),
      powiaty: [...new Set(wynik.wiersze.map(w => w.powiat))].length,
      wskazniki: [...new Set(wynik.wiersze.map(w => w.wskaznik_id))].length,
      braki: wynik.wiersze.filter(w => w.wartosc === null).length,
      wiersze: wynik.wiersze.slice(0, 100),
    }, { headers: { 'cache-control': 'no-store' } });
  }
  if (!sprawdzPodglad(csv, req.headers.get('x-ioss-podglad') ?? '')) return Response.json({ blad: 'podglad' }, { status: 409 });
  try { return Response.json(await importujIoss(csv)); }
  catch (e) {
    console.error('Import IOSS: błąd transakcji', e instanceof Error ? e.message : '?');
    return Response.json({ blad: 'zapis' }, { status: 500 });
  }
}
