import { z } from "zod";
import { innowacjaPoId } from "@/lib/biblioteka";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { zamaskuj } from "@/lib/maskowanie";

const W = z.object({
  innowacjaId: z.string().refine((i) => innowacjaPoId.has(i)),
  ocena: z.number().int().min(1).max(5),
  latwe: z.string().trim().max(500).optional().default(""),
  trudne: z.string().trim().max(500).optional().default(""),
  polecilbys: z.enum(["tak", "nie", "moze"]),
  propozycja: z.string().trim().max(800).optional().default(""),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`opinia:${ip}`, 6)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = W.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const d = w.data;
  await db().query(
    "insert into opinie (innowacja_id, ocena, odpowiedzi, propozycja) values ($1,$2,$3,$4)",
    [d.innowacjaId, d.ocena, JSON.stringify({ latwe: zamaskuj(d.latwe).tekst, trudne: zamaskuj(d.trudne).tekst, polecilbys: d.polecilbys }), zamaskuj(d.propozycja).tekst],
  );
  return Response.json({ ok: true }, { status: 201 });
}
