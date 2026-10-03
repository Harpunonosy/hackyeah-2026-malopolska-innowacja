import { z } from "zod";
import { db } from "@/lib/db";
import { wyciagnijSchemat } from "@/lib/nabor-schemat";
import { czyAdmin } from "@/lib/sesja";

export const maxDuration = 120;

// Nowy nabór z regulaminu: AI wyciąga pola wniosku, kryteria, limity i kategorie. Pracownik poprawia schemat i otwiera nabór.
export async function POST(req: Request) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const w = z.object({
    nazwa: z.string().trim().min(3).max(200),
    temat: z.string().trim().max(300).optional(),
    otwartyDo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    regulamin: z.string().trim().min(40, "Wklej regulamin lub opis formularza (co najmniej kilka zdań).").max(40_000),
  }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  let schemat;
  try {
    schemat = await wyciagnijSchemat(w.data.regulamin);
  } catch (e) {
    console.error("Nowy nabór: błąd AI", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "ai_niedostepne" }, { status: 502 });
  }
  const { rows } = await db().query(
    "insert into nabory (nazwa, program, opis, temat, otwarty_do, aktywny, regulamin, schemat, przyklad) values ($1,'Dodany w Centrali',$2,$3,$4,false,$5,$6,false) returning id",
    [w.data.nazwa, w.data.regulamin.slice(0, 300), w.data.temat ?? null, w.data.otwartyDo ?? null, w.data.regulamin, JSON.stringify(schemat)],
  );
  return Response.json({ id: rows[0].id, schemat }, { status: 201 });
}
