import { z } from "zod";
import { AiNiedostepneError } from "@/lib/ai";
import { wyciagnijFakty } from "@/lib/fakty-baza";
import { czyAdmin } from "@/lib/sesja";

export const maxDuration = 70;

// AI proponuje fakty z wklejonego fragmentu raportu. Nic nie jest publikowane bez zatwierdzenia.
export async function POST(req: Request) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const w = z.object({ tekst: z.string().trim().min(80, "Wklej dłuższy fragment raportu (co najmniej kilka zdań).").max(20_000) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  try {
    return Response.json({ fakty: await wyciagnijFakty(w.data.tekst) });
  } catch (e) {
    return Response.json({ blad: e instanceof AiNiedostepneError ? "ai_niedostepne" : "blad" }, { status: 502 });
  }
}
