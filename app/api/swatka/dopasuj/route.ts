import { czyWolno } from "@/lib/limit";
import { dopasuj, WejscieSwatki } from "@/lib/swatka";

export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(ip)) {
    return Response.json({ blad: "za_duzo_zapytan" }, { status: 429, headers: { "Retry-After": "30" } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ blad: "zle_zapytanie" }, { status: 400 });
  }

  const wejscie = WejscieSwatki.safeParse(body);
  if (!wejscie.success) {
    return Response.json(
      { blad: "walidacja", komunikat: wejscie.error.issues[0]?.message ?? "Sprawdź opis." },
      { status: 400 },
    );
  }

  const wynik = await dopasuj(wejscie.data);
  return Response.json(wynik, { headers: { "Cache-Control": "no-store" } });
}
