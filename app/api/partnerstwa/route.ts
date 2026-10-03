import { z } from "zod";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { zamaskuj } from "@/lib/maskowanie";
import { OBSZAR_IDS } from "@/lib/obszary";
import { normalizujPowiat } from "@/lib/powiaty";
import { utworzSprawe } from "@/lib/sprawy";

const W = z.object({
  tytul: z.string().trim().min(5, "Nadaj ogłoszeniu tytuł.").max(140),
  szuka: z.enum(["taniej", "dotrzec", "wartosc"]),
  obszar: z.enum(OBSZAR_IDS),
  powiat: z.string().trim().optional().default(""),
  opis: z.string().trim().min(10, "Opisz, czego szukasz.").max(800),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`partner:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = W.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const d = w.data;
  const { rows } = await db().query("insert into partnerstwa (tytul, szuka, obszar, powiat, opis) values ($1,$2,$3,$4,$5) returning id", [zamaskuj(d.tytul).tekst, d.szuka, d.obszar, normalizujPowiat(d.powiat), zamaskuj(d.opis).tekst]);
  const sprawa = await utworzSprawe({ typ: "ogloszenie", tytul: `Ogłoszenie partnerskie: ${d.tytul}`, tresc: `${d.tytul}. ${d.opis}`.slice(0, 1500), obiektId: rows[0].id, powiat: d.powiat, obszar: d.obszar });
  await db().query("update partnerstwa set numer=$2 where id=$1", [rows[0].id, sprawa.numer]);
  return Response.json({ ok: true, numer: sprawa.numer }, { status: 201 });
}
