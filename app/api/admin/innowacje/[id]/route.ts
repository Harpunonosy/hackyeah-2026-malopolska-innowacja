import { z } from "zod";
import { db } from "@/lib/db";
import { uniewaznijKatalog } from "@/lib/katalog";
import { czyAdmin } from "@/lib/sesja";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = z.object({ status: z.enum(["opublikowana", "szkic"]) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  await db().query("update innowacje set status=$2, updated_at=now() where id=$1 and zrodlo='dodana'", [id, w.data.status]);
  uniewaznijKatalog();
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  await db().query("delete from innowacje where id=$1 and zrodlo='dodana'", [id]).catch(() => null);
  uniewaznijKatalog();
  return Response.json({ ok: true });
}
