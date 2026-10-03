import { z } from "zod";
import { db } from "@/lib/db";

export async function POST(req: Request, ctx: { params: Promise<{ numer: string }> }) {
  const { numer } = await ctx.params;
  const w = z.object({ ocena: z.number().int().min(1).max(5) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const r = await db().query("update zgloszenia set ocena_pomocy=$2 where numer=$1 and status in ('odpowiedz','zamkniete')", [
    numer.toUpperCase(),
    w.data.ocena,
  ]);
  return Response.json({ ok: (r.rowCount ?? 0) > 0 });
}
