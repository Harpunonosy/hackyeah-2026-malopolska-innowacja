import { z } from "zod";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { OBSZAR_IDS } from "@/lib/obszary";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`reakcja:${ip}`, 20)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ innowacjaId: z.string().min(1).max(200), obszar: z.enum(OBSZAR_IDS).optional(), wartosc: z.union([z.literal(1), z.literal(-1)]) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  await db().query("insert into reakcje (innowacja_id, obszar, wartosc) values ($1,$2,$3)", [w.data.innowacjaId, w.data.obszar ?? null, w.data.wartosc]);
  return Response.json({ ok: true }, { status: 201 });
}
