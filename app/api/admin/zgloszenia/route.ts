import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

export async function GET() {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { rows } = await db().query(
    `select id, numer, status, priorytet, kryzys, obszar, powiat, streszczenie, najlepsze_dopasowanie, termin_sla,
            created_at, (ocena_ai is not null) as ocena_gotowa, syntetyczne
     from zgloszenia order by (status in ('zamkniete')) , priorytet asc, created_at desc limit 200`,
  );
  return Response.json({ zgloszenia: rows, teraz: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
