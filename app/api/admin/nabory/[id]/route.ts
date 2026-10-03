import { z } from "zod";
import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = z.object({ aktywny: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!w.success || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ blad: "walidacja" }, { status: 400 });
  await db().query("update nabory set aktywny=$2, otwarty_od = case when $2 then current_date else otwarty_od end where id=$1", [id, w.data.aktywny]);
  return Response.json({ ok: true });
}
