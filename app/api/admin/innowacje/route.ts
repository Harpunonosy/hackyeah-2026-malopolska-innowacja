import { z } from "zod";
import { db } from "@/lib/db";
import { katalog, uniewaznijKatalog } from "@/lib/katalog";
import { OBSZAR_KATEGORII } from "@/lib/obszary";
import { czyAdmin } from "@/lib/sesja";

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

export async function POST(req: Request) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const t = z.string().trim().min(3).max(3000);
  const w = z.object({
    nazwa: z.string().trim().min(3).max(120), kategoria: z.string().max(100), na_czym_polega: t, problem: t, grupa_docelowa: t, kto_moze_skorzystac: t, czy_to_dziala: t,
    autor_organizacja: z.string().trim().max(200).optional().default(""), url: z.string().trim().max(400).optional().default(""), publikuj: z.boolean(),
  }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: "Uzupełnij wszystkie sześć pól karty." }, { status: 400 });
  const d = w.data;
  const { mapa } = await katalog();
  let id = slug(d.nazwa) || "innowacja";
  for (let n = 2; mapa.has(id) || (await db().query("select 1 from innowacje where id=$1", [id])).rowCount; n++) id = `${slug(d.nazwa)}-${n}`;
  await db().query(
    `insert into innowacje (id, nazwa, kategoria, obszary, na_czym_polega, problem, grupa_docelowa, kto_moze_skorzystac, czy_to_dziala, autor_organizacja, url, status, zrodlo)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'dodana')`,
    [id, d.nazwa, d.kategoria, [OBSZAR_KATEGORII[d.kategoria]].filter(Boolean), d.na_czym_polega, d.problem, d.grupa_docelowa, d.kto_moze_skorzystac, d.czy_to_dziala, d.autor_organizacja, d.url || null, d.publikuj ? "opublikowana" : "szkic"],
  );
  uniewaznijKatalog();
  return Response.json({ id }, { status: 201 });
}
