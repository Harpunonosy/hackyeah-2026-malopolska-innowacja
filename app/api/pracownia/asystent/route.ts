import { z } from "zod";
import { odpowiedzNaPytanie, podpowiedzDoPola, scenorysUslugi } from "@/lib/asystent";
import { czyWolno } from "@/lib/limit";

export const maxDuration = 60;

const Wejscie = z.discriminatedUnion("tryb", [
  z.object({ tryb: z.literal("pytanie"), fiszka: z.string().min(10).max(4000), pytanie: z.string().trim().min(3).max(500) }),
  z.object({ tryb: z.literal("podpowiedz"), fiszka: z.string().min(10).max(4000), pole: z.string().max(80), pytanie: z.string().max(300) }),
  z.object({ tryb: z.literal("scenorys"), fiszka: z.string().min(10).max(4000) }),
]);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`asystent:${ip}`, 6)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = Wejscie.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  try {
    if (w.data.tryb === "pytanie") return Response.json(await odpowiedzNaPytanie(w.data.fiszka, w.data.pytanie));
    if (w.data.tryb === "podpowiedz") return Response.json({ opcje: await podpowiedzDoPola(w.data.fiszka, w.data.pole, w.data.pytanie) });
    return Response.json({ kadry: await scenorysUslugi(w.data.fiszka) });
  } catch (e) {
    console.error("Asystent kreatora: błąd AI", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "ai_niedostepne" }, { status: 502 });
  }
}
