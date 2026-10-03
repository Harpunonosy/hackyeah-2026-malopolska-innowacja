import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

// Eksport wniosków złożonych w naborach (JSON), np. do importu w systemie grantowym.
export async function GET() {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { rows } = await db().query("select w.id, w.created_at, w.status, w.pola, n.nazwa as nabor from wnioski w join nabory n on n.id = w.nabor_id order by w.created_at desc");
  return new Response(JSON.stringify({ wersja: "1", wnioski: rows }, null, 1), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": 'attachment; filename="wnioski.json"' } });
}
