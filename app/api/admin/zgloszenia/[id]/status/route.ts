import { z } from "zod";
import { czyAdmin } from "@/lib/sesja";
import { STATUSY } from "@/lib/statusy";
import { zmienStatus } from "@/lib/zgloszenia";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = z.object({ status: z.enum(STATUSY), notatka: z.string().max(300).optional() }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  await zmienStatus(id, w.data.status, w.data.notatka);
  return Response.json({ ok: true });
}
