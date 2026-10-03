import { z } from "zod";
import { czyWolno } from "@/lib/limit";
import { odpowiedzWlasciciela } from "@/lib/rozmowy";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`rozmowa-odp:${ip}`, 10)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ numer: z.string().min(5).max(20), rozmowaId: z.string().uuid(), tresc: z.string().trim().min(2).max(1500) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  return (await odpowiedzWlasciciela(w.data.numer, w.data.rozmowaId, w.data.tresc)) ? Response.json({ ok: true }) : Response.json({ blad: "nie_znaleziono" }, { status: 404 });
}
