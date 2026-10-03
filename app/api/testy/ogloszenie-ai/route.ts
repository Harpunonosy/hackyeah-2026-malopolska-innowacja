import { z } from "zod";
import { czyWolno } from "@/lib/limit";
import { zamaskuj } from "@/lib/maskowanie";
import { napiszOgloszenie } from "@/lib/testy";

export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`test-ai:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ opis: z.string().trim().min(15).max(1500) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  try {
    return Response.json(await napiszOgloszenie(zamaskuj(w.data.opis).tekst));
  } catch (e) {
    console.error("Ogłoszenie testu: błąd AI", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "ai_niedostepne" }, { status: 502 });
  }
}
