import { z } from "zod";
import { db } from "@/lib/db";
import { aktualnyEkspert } from "@/lib/ekspert";
import { zamaskuj } from "@/lib/maskowanie";
import { powiadom } from "@/lib/powiadomienia";
import { zmienStatus } from "@/lib/zgloszenia";

// Odpowiedź eksperta na pytanie lub opinia o pomyśle. Autor widzi ją pod swoim numerem, ROPS dostaje powiadomienie.
export async function POST(req: Request) {
  const e = await aktualnyEkspert();
  if (!e) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const w = z.object({ id: z.string().uuid(), tresc: z.string().trim().min(3).max(3000), zAi: z.boolean().default(false) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const c = db();
  const z0 = (await c.query("select id, numer, ekspert_id, typ from zgloszenia where id=$1", [w.data.id])).rows[0];
  if (!z0 || z0.ekspert_id !== e.id) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  let watek = (await c.query("select id from watki where typ='zgloszenie' and obiekt_id=$1", [z0.id])).rows[0]?.id;
  if (!watek) watek = (await c.query("insert into watki (typ, obiekt_id, temat) values ('zgloszenie',$1,$2) returning id", [z0.id, `Zgłoszenie ${z0.numer}`])).rows[0].id;
  await c.query("insert into wiadomosci (watek_id, tresc, wygenerowane_przez_ai, od, nadawca) values ($1,$2,$3,'ekspert',$4)", [watek, zamaskuj(w.data.tresc).tekst, w.data.zAi, e.nazwa]);
  await zmienStatus(z0.id, "odpowiedz", `Odpowiedź eksperta: ${e.nazwa}`);
  await c.query("update zgloszenia set pierwsza_odpowiedz_at = coalesce(pierwsza_odpowiedz_at, now()) where id=$1", [z0.id]);
  await powiadom({ adresat: "autor", typ: "odpowiedz", tresc: `Ekspert odpowiedział w sprawie ${z0.numer}.`, link: `/moje/${z0.numer}`, numerSprawy: z0.numer, kanal: "email" });
  await powiadom({ adresat: "rops", typ: "odpowiedz", tytul: "Odpowiedź eksperta", tresc: `${e.nazwa} odpowiedział w sprawie ${z0.numer}.`, link: `/centrala/zgloszenia/${z0.id}` });
  return Response.json({ ok: true });
}
