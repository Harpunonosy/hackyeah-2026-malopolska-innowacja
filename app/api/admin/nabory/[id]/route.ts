import { z } from "zod";
import { db } from "@/lib/db";
import { SchematNaboru } from "@/lib/nabor-schemat";
import { powiadomONaborze } from "@/lib/nabory-powiadomienia";
import { czyAdmin } from "@/lib/sesja";

const Wejscie = z.object({
  aktywny: z.boolean().optional(),
  otwartyDo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  schemat: SchematNaboru.optional(),
});

// Otwarcie, zamknięcie, zmiana terminu lub schematu naboru. Każda zmiana automatycznie powiadamia autorów pasujących pomysłów.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = Wejscie.safeParse(await req.json().catch(() => null));
  if (!w.success || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ blad: "walidacja" }, { status: 400 });
  const c = db();
  const przed = (await c.query("select aktywny, otwarty_do from nabory where id=$1", [id])).rows[0];
  if (!przed) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  let powiadomiono = 0;
  if (w.data.aktywny !== undefined && w.data.aktywny !== przed.aktywny) {
    await c.query("update nabory set aktywny=$2, otwarty_od = case when $2 then current_date else otwarty_od end, zmiana_at=now() where id=$1", [id, w.data.aktywny]);
    powiadomiono += await powiadomONaborze(id, w.data.aktywny ? "nabor_otwarty" : "nabor_zamkniety");
  }
  if (w.data.otwartyDo !== undefined) {
    await c.query("update nabory set otwarty_do=$2, zmiana_at=now() where id=$1", [id, w.data.otwartyDo]);
    powiadomiono += await powiadomONaborze(id, "nabor_zmiana", w.data.otwartyDo ? `nowy termin ${new Date(w.data.otwartyDo).toLocaleDateString("pl-PL")}` : "usunięto termin");
  }
  if (w.data.schemat) {
    await c.query("update nabory set schemat=$2, zmiana_at=now() where id=$1", [id, JSON.stringify(w.data.schemat)]);
    powiadomiono += await powiadomONaborze(id, "nabor_zmiana", "zmieniły się pola lub kryteria wniosku");
  }
  return Response.json({ ok: true, powiadomiono });
}
