import { zamaskuj } from "@/lib/maskowanie";
import { z } from "zod";
import { db } from "@/lib/db";
import { powiadom } from "@/lib/powiadomienia";
import { czyAdmin } from "@/lib/sesja";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = z.object({ status: z.enum(["zgloszona", "przeczytana", "w_ocenie", "zaproszona_do_naboru", "odrzucona"]).optional(), publiczna: z.boolean().optional(), etap: z.enum(["pomysl", "prototyp", "przetestowane", "gotowe"]).optional(), wyniki: z.string().max(600).optional() }).safeParse(await req.json().catch(() => null));
  if (!w.success || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ blad: "walidacja" }, { status: 400 });
  if (!(await db().query("select id from fiszki where id=$1", [id])).rowCount) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  if (w.data.etap) await db().query("update fiszki set etap=$2 where id=$1", [id, w.data.etap]);
  if (w.data.status) await db().query("update fiszki set status=$2, publiczna = case when $2='odrzucona' then false else publiczna end where id=$1", [id, w.data.status]);
  if (w.data.publiczna !== undefined) {
    const f = (await db().query("update fiszki set publiczna=$2 where id=$1 returning numer, tytul", [id, w.data.publiczna])).rows[0];
    if (f?.numer && w.data.publiczna) await powiadom({ adresat: "autor", typ: "odpowiedz", tresc: `Twój pomysł „${f.tytul}” został opublikowany w galerii. Osoby, które chcą pomóc, napiszą w Twojej sprawie.`, link: `/moje/${f.numer}`, numerSprawy: f.numer, kanal: "email" });
  }
  if (w.data.wyniki !== undefined) await db().query("update fiszki set wyniki_testu=$2 where id=$1", [id, zamaskuj(w.data.wyniki).tekst]);
  return Response.json({ ok: true });
}
