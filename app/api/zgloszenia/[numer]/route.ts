import { db } from "@/lib/db";

// Status zgłoszenia dla autora (po numerze). Zwraca tylko to, co autor ma widzieć.
export async function GET(_req: Request, ctx: { params: Promise<{ numer: string }> }) {
  const { numer } = await ctx.params;
  const z = await db().query(
    "select id, numer, status, created_at, tresc_zamaskowana, ocena_pomocy, typ, tytul, termin_sla, pierwsza_odpowiedz_at from zgloszenia where numer=$1",
    [numer.toUpperCase()],
  );
  if (!z.rows[0]) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  const id = z.rows[0].id;
  const [hist, wiad, dop, pow] = await Promise.all([
    db().query("select status, notatka, at from historia_statusu where zgloszenie_id=$1 order by at", [id]),
    db().query(
      `select w.tresc, w.created_at, w.wygenerowane_przez_ai, w.od, w.nadawca from wiadomosci w join watki t on t.id=w.watek_id
       where t.typ='zgloszenie' and t.obiekt_id=$1 order by w.created_at`,
      [id],
    ),
    db().query(
      "select i.id, i.nazwa, d.dlaczego from dopasowania d join innowacje i on i.id=d.innowacja_id where d.zgloszenie_id=$1 order by d.pozycja",
      [id],
    ),
    db().query("select typ, tytul, tresc, link, kanal, created_at from powiadomienia where adresat='autor' and numer_sprawy=$1 order by created_at desc limit 20", [z.rows[0].numer]),
  ]);
  // Właściciel pomysłu lub ogłoszenia widzi rozmowy z osobami, które się zgłosiły (bez numerów i danych kontaktowych).
  const odp = await db().query("select id, tytul from zgloszenia where odpowiedz_na=$1 order by created_at", [z.rows[0].numer]);
  const rozmowy = await Promise.all(
    odp.rows.map(async (o) => ({
      id: o.id as string,
      tytul: o.tytul as string,
      wiadomosci: (await db().query("select w.tresc, w.created_at, w.od from wiadomosci w join watki t on t.id=w.watek_id where t.typ='zgloszenie' and t.obiekt_id=$1 order by w.created_at", [o.id])).rows,
    })),
  );
  const { id: _id, ...publiczne } = z.rows[0];
  void _id;
  return Response.json(
    { ...publiczne, historia: hist.rows, wiadomosci: wiad.rows, dopasowania: dop.rows, powiadomienia: pow.rows, rozmowy },
    { headers: { "Cache-Control": "no-store" } },
  );
}
