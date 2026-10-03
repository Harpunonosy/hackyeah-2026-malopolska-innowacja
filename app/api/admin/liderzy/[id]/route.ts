import { z } from "zod";
import { db } from "@/lib/db";
import { zapiszWDzienniku } from "@/lib/dziennik";
import { czyAdmin } from "@/lib/sesja";

// Weryfikacja wpisu w sieci liderów przez pracownika ROPS.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = z.object({ decyzja: z.enum(["zatwierdzony", "odrzucony"]) }).safeParse(await req.json().catch(() => null));
  if (!w.success || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ blad: "walidacja" }, { status: 400 });
  await db().query("update liderzy set status=$2 where id=$1", [id, w.data.decyzja]);
  await zapiszWDzienniku(`lider_${w.data.decyzja}`, id);
  return Response.json({ ok: true });
}
