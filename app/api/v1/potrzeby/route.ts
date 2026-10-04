import { czyAdmin } from "@/lib/sesja";
import { db } from "@/lib/db";

const PROG = 3; // komórki z mniej niż 3 zgłoszeniami ukrywamy, żeby nie dało się wskazać osoby

// Zbiorcze statystyki potrzeb (liczby zgłoszeń według obszaru i powiatu, ostatnie 12 miesięcy). Bez treści i bez danych osobowych.
export async function GET() {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  const { rows } = await db().query(
    `select coalesce(obszar,'inne') as obszar, coalesce(powiat,'nieznany') as powiat, count(*)::int as liczba
     from zgloszenia where typ = 'problem' and not coalesce(syntetyczne,false) and created_at > now() - interval '12 months'
     group by 1, 2 order by 3 desc`,
  );
  const widoczne = rows.filter((r) => r.liczba >= PROG);
  return Response.json(
    { wersja: "1", okres: "12 miesięcy", progUkrycia: PROG, ukrytychKomorek: rows.length - widoczne.length, potrzeby: widoczne },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
