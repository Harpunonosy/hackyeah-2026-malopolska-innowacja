import { z } from "zod";
import { db } from "@/lib/db";
import { powiadom } from "@/lib/powiadomienia";
import { czyAdmin } from "@/lib/sesja";
import { zaprosTesterow } from "@/lib/testy";

// ROPS akceptuje albo odrzuca ogłoszenie testu. Po akceptacji autor dostaje powiadomienie, a pasujące osoby zaproszenia.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = z.object({ decyzja: z.enum(["akceptuj", "odrzuc"]) }).safeParse(await req.json().catch(() => null));
  if (!w.success || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ blad: "walidacja" }, { status: 400 });
  const t = (await db().query("select numer, tytul from testy where id=$1", [id])).rows[0];
  if (!t) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  const akceptuj = w.data.decyzja === "akceptuj";
  const zmiana = await db().query("update testy set status=$2 where id=$1 and status='do_akceptacji' returning id", [id, akceptuj ? "otwarty" : "odrzucony"]);
  if (!zmiana.rowCount) return Response.json({ blad: "juz_rozpatrzony" }, { status: 409 });
  if (t.numer) await powiadom({ adresat: "autor", typ: "odpowiedz", tresc: akceptuj ? `Twój test „${t.tytul}” został zaakceptowany i jest widoczny na liście testów.` : `Test „${t.tytul}” nie został zaakceptowany. Napisz do nas w tej sprawie, jeśli chcesz go poprawić.`, link: `/moje/${t.numer}`, numerSprawy: t.numer, kanal: "email" });
  const zaproszono = akceptuj ? await zaprosTesterow(id) : 0;
  return Response.json({ ok: true, zaproszono });
}
