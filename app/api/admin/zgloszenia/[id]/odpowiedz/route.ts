import { z } from "zod";
import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";
import { powiadom } from "@/lib/powiadomienia";
import { zmienStatus } from "@/lib/zgloszenia";

const Wejscie = z.object({ tresc: z.string().trim().min(3).max(3000), zAi: z.boolean().default(false) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = Wejscie.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const c = db();
  const z = await c.query("select autor_id, numer from zgloszenia where id=$1", [id]);
  if (!z.rows[0]) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });

  let watek = (await c.query("select id from watki where typ='zgloszenie' and obiekt_id=$1", [id])).rows[0]?.id;
  if (!watek) {
    watek = (await c.query("insert into watki (typ, obiekt_id, temat) values ('zgloszenie',$1,$2) returning id", [id, `Zgłoszenie ${z.rows[0].numer}`])).rows[0].id;
  }
  await c.query("insert into wiadomosci (watek_id, tresc, wygenerowane_przez_ai) values ($1,$2,$3)", [watek, w.data.tresc, w.data.zAi]);
  await zmienStatus(id, "odpowiedz", "Odpowiedź ROPS");

  await c.query("update zgloszenia set pierwsza_odpowiedz_at = coalesce(pierwsza_odpowiedz_at, now()) where id=$1", [id]);
  // Powiadomienie autora (w MVP symulowane: widoczne w "Moje sprawy" i w skrzynce nadawczej Centrali).
  await powiadom({ adresat: "autor", typ: "odpowiedz", tresc: `Masz odpowiedź na sprawę ${z.rows[0].numer}: ${w.data.tresc.slice(0, 160)}`, link: `/moje/${z.rows[0].numer}`, numerSprawy: z.rows[0].numer, kanal: z.rows[0].autor_id ? "email" : "aplikacja" });
  return Response.json({ ok: true });
}
