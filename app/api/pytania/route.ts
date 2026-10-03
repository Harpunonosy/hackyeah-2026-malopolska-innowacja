import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { utworzSprawe } from "@/lib/sprawy";
import { oceńZgloszenie } from "@/lib/zgloszenia";

export const maxDuration = 60;

// Pytanie do ROPS lub konkretnego eksperta: sprawa typu "pytanie" z numerem, terminem i wątkiem.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`pytanie:${ip}`, 5)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({
    tekst: z.string().trim().min(5, "Napisz pytanie.").max(1500),
    ekspertId: z.string().uuid().optional(),
    email: z.string().trim().email("Podaj poprawny adres e-mail albo zostaw pole puste.").max(120).optional().or(z.literal("")),
    zgoda: z.literal(true, { error: "Zaznacz zgodę na przekazanie pytania." }),
  }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const eks = w.data.ekspertId ? (await db().query("select nazwa from eksperci where uzytkownik_id=$1", [w.data.ekspertId])).rows[0] : null;
  const { id, numer } = await utworzSprawe({ typ: "pytanie", tytul: eks ? `Pytanie do: ${eks.nazwa}` : "Pytanie do ROPS", tresc: w.data.tekst, email: w.data.email || undefined });
  if (eks) await db().query("update zgloszenia set ekspert_id=$2, status='u_eksperta' where id=$1", [id, w.data.ekspertId]);
  after(() => oceńZgloszenie(id));
  return Response.json({ numer }, { status: 201 });
}
