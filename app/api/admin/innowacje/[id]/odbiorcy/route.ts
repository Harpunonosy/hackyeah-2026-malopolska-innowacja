import { z } from "zod";
import { znajdzOdbiorcow, powiadomOWrozwiazaniu } from "@/lib/odwrotne";
import { czyAdmin } from "@/lib/sesja";

export const maxDuration = 90;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const w = await znajdzOdbiorcow(id);
    return w ? Response.json(w) : Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  } catch (e) {
    console.error("Odwrotne dopasowanie: błąd", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "ai_niedostepne" }, { status: 502 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = z.object({ kandydaci: z.array(z.object({ id: z.string().uuid(), trafnosc: z.number().min(0).max(100), dlaczego: z.string().max(400) })).max(60) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  return Response.json({ powiadomiono: await powiadomOWrozwiazaniu(id, w.data.kandydaci) });
}
