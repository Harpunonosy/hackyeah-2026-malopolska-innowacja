import { z } from "zod";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { zamaskuj } from "@/lib/maskowanie";
import { powiadom } from "@/lib/powiadomienia";
import { zmienStatus } from "@/lib/zgloszenia";

export async function POST(req: Request, ctx: { params: Promise<{ numer: string }> }) {
  const { numer } = await ctx.params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`wiad:${ip}`, 8)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ tresc: z.string().trim().min(2, "Napisz wiadomość.").max(2000) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const c = db();
  const z0 = (await c.query("select id, numer from zgloszenia where numer=$1", [numer.toUpperCase()])).rows[0];
  if (!z0) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  let watek = (await c.query("select id from watki where typ='zgloszenie' and obiekt_id=$1", [z0.id])).rows[0]?.id;
  if (!watek) watek = (await c.query("insert into watki (typ, obiekt_id, temat) values ('zgloszenie',$1,$2) returning id", [z0.id, `Zgłoszenie ${z0.numer}`])).rows[0].id;
  await c.query("insert into wiadomosci (watek_id, tresc, wygenerowane_przez_ai, od) values ($1,$2,false,'autor')", [watek, zamaskuj(w.data.tresc).tekst]);
  await zmienStatus(z0.id, "w_analizie", "Odpowiedź autora");
  await powiadom({ adresat: "rops", typ: "pytanie_autora", tresc: `Autor odpisał w sprawie ${z0.numer}.`, link: `/centrala/zgloszenia/${z0.id}`, numerSprawy: z0.numer });
  return Response.json({ ok: true });
}
