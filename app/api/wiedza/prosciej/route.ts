import { z } from "zod";
import { AiNiedostepneError } from "@/lib/ai";
import { czyWolno } from "@/lib/limit";
import { wyjasnijProsciej } from "@/lib/prosciej";

export const maxDuration = 45;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`prosciej:${ip}`, 10)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ id: z.string().min(1).max(200), jezyk: z.enum(["pl", "uk"]) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  try {
    const wynik = await wyjasnijProsciej(w.data.id, w.data.jezyk);
    return wynik ? Response.json(wynik) : Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  } catch (e) {
    return Response.json({ blad: e instanceof AiNiedostepneError ? "ai_niedostepne" : "blad" }, { status: 502 });
  }
}
