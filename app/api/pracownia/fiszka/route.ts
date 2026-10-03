import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { utworzSprawe } from "@/lib/sprawy";
import { oceńZgloszenie } from "@/lib/zgloszenia";

const Fiszka = z.object({
  tytul: z.string().trim().min(3).max(160),
  opis: z.string().trim().min(3).max(600),
  istota: z.string().trim().min(3).max(1200),
  dla_kogo: z.string().trim().min(3).max(400),
  etap: z.enum(["pomysl", "prototyp", "przetestowane", "gotowe"]),
  oceny: z.unknown().optional(),
  podobne: z.unknown().optional(),
  kanwa: z.unknown().optional(),
  powiat: z.string().trim().max(60).optional(),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`fiszka:${ip}`, 6)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = Fiszka.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const d = w.data;
  const { rows } = await db().query(
    `insert into fiszki (tytul, opis, istota, dla_kogo, etap, ocena_wstepna, podobne, kanwa, publiczna, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,false,'zgloszona') returning id`,
    [d.tytul, d.opis, d.istota, d.dla_kogo, d.etap, JSON.stringify(d.oceny ?? null), JSON.stringify(d.podobne ?? null), JSON.stringify(d.kanwa ?? {})],
  );
  // Pomysł jest sprawą jak każda inna: numer, oś czasu, powiadomienie dla ROPS i odpowiedź do autora.
  const sprawa = await utworzSprawe({
    typ: "pomysl",
    tytul: d.tytul,
    tresc: `${d.tytul}. ${d.opis} Na czym polega: ${d.istota} Dla kogo: ${d.dla_kogo}`.slice(0, 1500),
    obiektId: rows[0].id,
    powiat: d.powiat,
  });
  await db().query("update fiszki set numer=$2, powiat=$3 where id=$1", [rows[0].id, sprawa.numer, d.powiat ?? null]);
  after(() => oceńZgloszenie(sprawa.id));
  return Response.json({ id: rows[0].id, numer: sprawa.numer }, { status: 201 });
}
