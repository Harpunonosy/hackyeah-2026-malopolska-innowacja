import { z } from "zod";
import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";
import { zmienStatus } from "@/lib/zgloszenia";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = z.object({ ekspertId: z.string().uuid().nullable() }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  await db().query("update zgloszenia set ekspert_id=$2 where id=$1", [id, w.data.ekspertId]);
  if (w.data.ekspertId) await zmienStatus(id, "u_eksperta", "Przekazane do eksperta");
  return Response.json({ ok: true });
}
