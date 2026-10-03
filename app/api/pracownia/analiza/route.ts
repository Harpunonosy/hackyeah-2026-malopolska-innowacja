import { z } from "zod";
import { czyWolno } from "@/lib/limit";
import { zamaskuj } from "@/lib/maskowanie";
import { analizujPomysl } from "@/lib/pracownia";

export const maxDuration = 120;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`pracownia:${ip}`, 5)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ opis: z.string().trim().min(20, "Opisz pomysł kilkoma zdaniami.").max(2500) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  try {
    return Response.json(await analizujPomysl(zamaskuj(w.data.opis).tekst));
  } catch (e) {
    console.error("Pracownia: błąd analizy", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "ai_niedostepne" }, { status: 502 });
  }
}
