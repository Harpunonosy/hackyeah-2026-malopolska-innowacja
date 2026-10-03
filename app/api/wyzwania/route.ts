import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { OBSZAR_IDS, nazwaObszaru } from "@/lib/obszary";
import { normalizujPowiat } from "@/lib/powiaty";
import { utworzSprawe } from "@/lib/sprawy";
import { oceńZgloszenie } from "@/lib/zgloszenia";

export const maxDuration = 60;

// Wyzwanie gminy/powiatu zgłoszone przez instytucję: trafia do Radaru jako zgłoszenie instytucji.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`wyzwanie:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({
    powiat: z.string().refine((p) => normalizujPowiat(p) !== null),
    obszar: z.enum(OBSZAR_IDS),
    opis: z.string().trim().min(10, "Opisz wyzwanie (co najmniej kilka słów).").max(1200),
    skala: z.string().regex(/^\d{0,6}$/).optional(),
    email: z.string().trim().email("Podaj poprawny adres e-mail albo zostaw pole puste.").max(120).optional().or(z.literal("")),
    zgoda: z.literal(true, { error: "Zaznacz zgodę na przekazanie zgłoszenia." }),
  }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const d = w.data;
  const tresc = `Wyzwanie instytucji (${nazwaObszaru(d.obszar)}): ${d.opis}${d.skala ? ` Szacunkowo dotyczy ${d.skala} osób.` : ""}`;
  const { id, numer } = await utworzSprawe({ typ: "wyzwanie", tytul: `Wyzwanie gminy: ${nazwaObszaru(d.obszar)}`, tresc, powiat: d.powiat, obszar: d.obszar, email: d.email || undefined });
  await db().query("update zgloszenia set kanal_kontaktu = coalesce(kanal_kontaktu, 'instytucja') where id=$1", [id]);
  after(() => oceńZgloszenie(id));
  return Response.json({ numer }, { status: 201 });
}
