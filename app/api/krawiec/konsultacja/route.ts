import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { innowacjaPoIdAsync } from "@/lib/katalog";
import { TYPY_INSTYTUCJI, type TypInstytucji } from "@/lib/krawiec-stale";
import { czyWolno } from "@/lib/limit";
import { utworzSprawe } from "@/lib/sprawy";
import { oceńZgloszenie } from "@/lib/zgloszenia";

// Konsultacja planu wdrożenia z ekspertem (eksperci doradzają JST): sprawa trafia do panelu eksperta z linkiem do planu.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`konsultacja:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({
    planId: z.string().uuid(),
    ekspertId: z.string().uuid(),
    pytanie: z.string().trim().min(10, "Napisz, o co chcesz zapytać.").max(1200),
    email: z.string().trim().email("Podaj poprawny adres e-mail albo zostaw pole puste.").max(120).optional().or(z.literal("")),
  }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const c = db();
  const [plan, eks] = await Promise.all([
    c.query("select innowacja_id, profil from plany_wdrozenia where id=$1", [w.data.planId]),
    c.query("select nazwa from eksperci where uzytkownik_id=$1", [w.data.ekspertId]),
  ]);
  if (!plan.rows[0] || !eks.rows[0]) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  const p = plan.rows[0].profil as { typ: TypInstytucji; powiat: string; odbiorcy: number };
  const inn = await innowacjaPoIdAsync(plan.rows[0].innowacja_id);
  const { id, numer } = await utworzSprawe({
    typ: "pytanie",
    tytul: `Konsultacja planu: ${inn?.nazwa ?? "innowacja"} (${p.powiat.replace("powiat ", "pow. ")})`,
    tresc: `${TYPY_INSTYTUCJI[p.typ] ?? "Instytucja"}, ${p.powiat}, ${p.odbiorcy} odbiorców. Prośba o opinię eksperta o planie wdrożenia innowacji „${inn?.nazwa ?? ""}”.\n\nPytanie: ${w.data.pytanie}`,
    obiektId: `plan:${w.data.planId}`,
    powiat: p.powiat,
    email: w.data.email || undefined,
  });
  await c.query("update zgloszenia set ekspert_id=$2, status='u_eksperta' where id=$1", [id, w.data.ekspertId]);
  after(() => oceńZgloszenie(id));
  return Response.json({ numer }, { status: 201 });
}
