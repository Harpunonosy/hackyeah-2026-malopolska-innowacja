import { czyWolno } from "@/lib/limit";
import { dopasuj, WejscieSwatki } from "@/lib/swatka";

export const maxDuration = 60;

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// Matchmaking dla innych systemów (np. formularz na stronie gminy): opis problemu → propozycje innowacji.
// Dane osobowe są maskowane przed wysłaniem do modelu AI, a treść opisu nie jest zapisywana.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`v1:${ip}`)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429, headers: { ...CORS, "Retry-After": "30" } });
  const w = WejscieSwatki.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400, headers: CORS });
  const r = await dopasuj(w.data);
  const karta = ({ id, nazwa, kategoria, trafnosc, dlaczego, ktoMozeWdrozyc, film }: (typeof r.dopasowania)[number]) => ({ id, nazwa, kategoria, trafnosc, dlaczego, ktoMozeWdrozyc, film, link: `/wiedza/biblioteka/${id}` });
  return Response.json(
    { wersja: "1", tryb: r.tryb, obszar: r.zrozumiano.obszar, potrzeby: r.zrozumiano.potrzeby, kryzys: r.kryzys, brakDopasowania: r.brakDopasowania, dopasowania: r.dopasowania.map(karta), najblizsze: r.najblizsze.map(karta), pytanie: r.pytanie },
    { headers: { ...CORS, "Cache-Control": "no-store" } },
  );
}
