import { z } from "zod";
import { czyWolno } from "@/lib/limit";
import { RODZAJE_ROZMOWY, zacznijRozmowe } from "@/lib/rozmowy";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`rozmowa:${ip}`, 6)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({
    cel: z.enum(["fiszka", "partnerstwo"]),
    celId: z.string().uuid(),
    rodzaj: z.enum(Object.keys(RODZAJE_ROZMOWY) as [keyof typeof RODZAJE_ROZMOWY, ...(keyof typeof RODZAJE_ROZMOWY)[]]),
    tresc: z.string().trim().min(5, "Napisz kilka słów.").max(1200),
    email: z.string().trim().email("Podaj poprawny adres e-mail albo zostaw pole puste.").max(120).optional().or(z.literal("")),
    zgoda: z.literal(true, { error: "Zaznacz zgodę na przekazanie wiadomości." }),
  }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const wynik = await zacznijRozmowe({ cel: w.data.cel, celId: w.data.celId, rodzaj: w.data.rodzaj, tresc: w.data.tresc, email: w.data.email || undefined });
  if (!wynik) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  return Response.json({ numer: wynik.numer }, { status: 201 });
}
