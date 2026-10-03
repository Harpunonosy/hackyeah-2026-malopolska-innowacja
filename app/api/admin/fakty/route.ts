import { z } from "zod";
import { db } from "@/lib/db";
import { zapiszWDzienniku } from "@/lib/dziennik";
import { odswiezFakty } from "@/lib/fakty-baza";
import { OBSZAR_IDS } from "@/lib/obszary";
import { czyAdmin } from "@/lib/sesja";

const Publikacja = z.object({
  zrodlo: z.string().trim().min(3, "Podaj nazwę raportu.").max(200),
  url: z.url().max(500).optional().or(z.literal("")),
  fakty: z.array(z.object({ tekst: z.string().trim().min(10).max(500), obszar: z.enum(OBSZAR_IDS).nullable(), strona: z.number().int().positive().nullable() })).min(1).max(20),
});

// Publikacja zatwierdzonych faktów: od razu widać je w Kondycji Małopolski, w „Zapytaj raporty”, w Swatce i w Krawcu.
export async function POST(req: Request) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const w = Publikacja.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const c = db();
  for (const f of w.data.fakty) {
    await c.query("insert into fakty (temat, tekst, zrodlo, strona, url, obszar, dodany) values ($1,$2,$3,$4,$5,$6,true)", [f.obszar ?? "inne", f.tekst, w.data.zrodlo, f.strona, w.data.url || null, f.obszar]);
  }
  odswiezFakty();
  await zapiszWDzienniku("fakty_dodane", w.data.zrodlo, `${w.data.fakty.length} faktów`);
  return Response.json({ ok: true, liczba: w.data.fakty.length }, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return Response.json({ blad: "walidacja" }, { status: 400 });
  await db().query("delete from fakty where id=$1 and dodany", [id]);
  odswiezFakty();
  await zapiszWDzienniku("fakt_usuniety", String(id));
  return Response.json({ ok: true });
}
