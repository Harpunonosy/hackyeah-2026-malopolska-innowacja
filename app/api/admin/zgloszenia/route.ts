import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

export async function GET(req: Request) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  // Początek odczytu: sprawa utworzona podczas zapytań nie może wypaść z okna powiadomień.
  const params = new URL(req.url).searchParams;
  const strona = Math.max(1, Math.min(100000, Math.trunc(Number(params.get("strona")) || 1)));
  const filtr = params.get("typ") || null;
  const od = params.get("od");
  const odDaty = od && Number.isFinite(Date.parse(od)) ? new Date(od).toISOString() : null;
  const teraz = new Date().toISOString();
  const c = db();
  const [{ rows }, m, liczby, nowe] = await Promise.all([
    c.query(
      `select id, numer, status, priorytet, kryzys, obszar, powiat, streszczenie, najlepsze_dopasowanie, termin_sla,
              created_at, (ocena_ai is not null) as ocena_gotowa, syntetyczne, typ, tytul
       from zgloszenia where ($1::text is null or typ=$1) order by (status in ('zamkniete')) , priorytet asc, created_at desc, id limit 50 offset $2`,
      [filtr, (strona - 1) * 50],
    ),
    // Wskaźniki szybkości komunikacji (test Jury): mediana czasu pierwszej odpowiedzi i odsetek odpowiedzi w terminie.
    c.query(
      `select count(*) filter (where pierwsza_odpowiedz_at is not null)::int as odpowiedzianych,
              round((percentile_cont(0.5) within group (order by extract(epoch from (pierwsza_odpowiedz_at - created_at))/60)
                filter (where pierwsza_odpowiedz_at is not null and not syntetyczne))::numeric, 1) as mediana_min,
              count(*) filter (where pierwsza_odpowiedz_at is not null and pierwsza_odpowiedz_at <= termin_sla)::int as w_terminie
       from zgloszenia`,
    ),
    c.query("select count(*)::int as wszystkie, count(*) filter (where status not in ('odpowiedz','zamkniete'))::int as do_odpowiedzi from zgloszenia where ($1::text is null or typ=$1)", [filtr]),
    c.query("select id, numer, typ, created_at from zgloszenia where $1::timestamptz is not null and created_at >= $1 order by created_at desc limit 100", [odDaty]),
  ]);
  return Response.json({ zgloszenia: rows, metryki: m.rows[0], teraz, strona, razem: liczby.rows[0].wszystkie, doOdpowiedzi: liczby.rows[0].do_odpowiedzi, nowe: nowe.rows }, { headers: { "Cache-Control": "no-store" } });
}
