import { z } from "zod";
import { czyAdmin } from "@/lib/sesja";
import { DECYZJE, oznaczEksport, zmienEtapWniosku } from "@/lib/wnioski";

const Wejscie = z.discriminatedUnion("akcja", [
  z.object({ akcja: z.literal("etap"), etap: z.enum(["ocena_formalna", "ocena_merytoryczna"]) }),
  z.object({ akcja: z.literal("decyzja"), decyzja: z.enum(DECYZJE), uzasadnienie: z.string().trim().max(600).optional() }),
  z.object({ akcja: z.literal("eksport") }),
]);

// Ścieżka oceny wniosku w Centrali: etap, decyzja, przekazanie do bazy grantowej.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = Wejscie.safeParse(await req.json().catch(() => null));
  if (!w.success || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ blad: "walidacja" }, { status: 400 });
  if (w.data.akcja === "eksport") {
    await oznaczEksport(id);
    return Response.json({ ok: true });
  }
  const wynik = w.data.akcja === "etap" ? await zmienEtapWniosku(id, w.data.etap) : await zmienEtapWniosku(id, "decyzja", w.data.decyzja, w.data.uzasadnienie);
  return wynik ? Response.json(wynik) : Response.json({ blad: "nie_znaleziono" }, { status: 404 });
}
