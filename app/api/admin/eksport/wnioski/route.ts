import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

// Eksport wniosków złożonych w naborach (JSON) do importu w bazie grantowej: numer sprawy, etapy oceny, decyzja, pola wniosku.
// ?nowe=1 zwraca tylko wnioski jeszcze nieprzekazane i oznacza je jako przekazane.
export async function GET(req: Request) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const nowe = new URL(req.url).searchParams.get("nowe") === "1";
  const c = db();
  const { rows } = await c.query(
    `select w.id, z.numer as "numerSprawy", w.created_at as "zlozono", w.status as etap, w.etapy, w.decyzja, w.decyzja_at as "decyzjaData",
            w.eksport_at as "przekazano", n.nazwa as nabor, n.program, w.pola
     from wnioski w join nabory n on n.id = w.nabor_id left join zgloszenia z on z.typ='wniosek' and z.obiekt_id = w.id::text
     ${nowe ? "where w.eksport_at is null" : ""} order by w.created_at desc`,
  );
  if (nowe && rows.length) await c.query("update wnioski set eksport_at = now() where id = any($1)", [rows.map((r) => r.id)]);
  return new Response(JSON.stringify({ wersja: "1", zrodlo: "Splot", wygenerowano: new Date().toISOString(), liczba: rows.length, wnioski: rows }, null, 1), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": 'attachment; filename="wnioski.json"' },
  });
}
