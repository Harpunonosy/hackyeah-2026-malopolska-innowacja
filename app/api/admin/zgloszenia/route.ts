import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

export async function GET() {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const c = db();
  const [{ rows }, m] = await Promise.all([
    c.query(
      `select id, numer, status, priorytet, kryzys, obszar, powiat, streszczenie, najlepsze_dopasowanie, termin_sla,
              created_at, (ocena_ai is not null) as ocena_gotowa, syntetyczne, typ, tytul
       from zgloszenia order by (status in ('zamkniete')) , priorytet asc, created_at desc limit 200`,
    ),
    // Wskaźniki szybkości komunikacji (test Jury): mediana czasu pierwszej odpowiedzi i odsetek odpowiedzi w terminie.
    c.query(
      `select count(*) filter (where pierwsza_odpowiedz_at is not null)::int as odpowiedzianych,
              round((percentile_cont(0.5) within group (order by extract(epoch from (pierwsza_odpowiedz_at - created_at))/60)
                filter (where pierwsza_odpowiedz_at is not null and not syntetyczne))::numeric, 1) as mediana_min,
              count(*) filter (where pierwsza_odpowiedz_at is not null and pierwsza_odpowiedz_at <= termin_sla)::int as w_terminie
       from zgloszenia`,
    ),
  ]);
  return Response.json({ zgloszenia: rows, metryki: m.rows[0], teraz: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
