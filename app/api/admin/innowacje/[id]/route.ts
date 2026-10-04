import { z } from "zod";
import { db } from "@/lib/db";
import { uniewaznijKatalog } from "@/lib/katalog";
import { zapiszWDzienniku } from "@/lib/dziennik";
import { innowacjaPoIdAsync } from "@/lib/katalog";
import { innowacjaPoId } from "@/lib/biblioteka";
import { czyAdmin } from "@/lib/sesja";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = z.object({ status: z.enum(["opublikowana", "szkic"]) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  await db().query("update innowacje set status=$2, updated_at=now() where id=$1 and zrodlo='dodana'", [id, w.data.status]);
  uniewaznijKatalog();
  await zapiszWDzienniku(w.data.status === "opublikowana" ? "publikacja innowacji" : "wycofanie innowacji", id);
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const r = await db().query("delete from innowacje where id=$1 and zrodlo='dodana'", [id]);
    if (!r.rowCount) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  } catch (e) {
    if (!(e && typeof e === "object" && "code" in e && e.code === "23503")) return Response.json({ blad: "zapis_nieudany" }, { status: 500 });
    return Response.json({ blad: "powiazana_innowacja", komunikat: "Ta innowacja ma powiązane sprawy lub testy. Wycofaj ją do szkicu zamiast usuwać." }, { status: 409 });
  }
  uniewaznijKatalog();
  await zapiszWDzienniku("usunięcie innowacji", id);
  return Response.json({ ok: true });
}

// PUT: edycja karty dowolnej innowacji (także ze statycznej Biblioteki ROPS). Zmiana działa od razu w Bibliotece i w Swatce.
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const t = z.string().trim().min(3).max(3000);
  const w = z.object({ nazwa: z.string().trim().min(3).max(120), na_czym_polega: t, problem: t, grupa_docelowa: t, kto_moze_skorzystac: t, czy_to_dziala: t, autor_organizacja: z.string().trim().max(200).optional().default("") }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: "Uzupełnij wszystkie pola karty." }, { status: 400 });
  const d = w.data;
  const stat = innowacjaPoId.get(id);
  if (stat) {
    await db().query(
      `insert into innowacje (id, nazwa, kategoria, na_czym_polega, problem, grupa_docelowa, kto_moze_skorzystac, czy_to_dziala, autor_organizacja, status, zrodlo)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'opublikowana','nadpisana')
       on conflict (id) do update set nazwa=$2, na_czym_polega=$4, problem=$5, grupa_docelowa=$6, kto_moze_skorzystac=$7, czy_to_dziala=$8, autor_organizacja=$9, zrodlo='nadpisana', updated_at=now()`,
      [id, d.nazwa, stat.kategoria, d.na_czym_polega, d.problem, d.grupa_docelowa, d.kto_moze_skorzystac, d.czy_to_dziala, d.autor_organizacja],
    );
  } else {
    await db().query("update innowacje set nazwa=$2, na_czym_polega=$3, problem=$4, grupa_docelowa=$5, kto_moze_skorzystac=$6, czy_to_dziala=$7, autor_organizacja=$8, updated_at=now() where id=$1 and zrodlo='dodana'", [id, d.nazwa, d.na_czym_polega, d.problem, d.grupa_docelowa, d.kto_moze_skorzystac, d.czy_to_dziala, d.autor_organizacja]);
  }
  await zapiszWDzienniku("edycja innowacji", id, `Zmieniono kartę: ${d.nazwa}`);
  uniewaznijKatalog();
  return Response.json({ ok: true });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const i = await innowacjaPoIdAsync(id);
  if (!i) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  return Response.json({ nazwa: i.nazwa, na_czym_polega: i.naCzymPolega, problem: i.problem, grupa_docelowa: i.grupaDocelowa, kto_moze_skorzystac: i.ktoMozeSkorzystac, czy_to_dziala: i.czyToDziala, autor_organizacja: i.autor });
}
