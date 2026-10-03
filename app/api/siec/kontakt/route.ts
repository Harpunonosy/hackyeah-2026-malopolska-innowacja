import { czyWolno } from "@/lib/limit";
import { liderzySieci, KontaktZLiderem } from "@/lib/siec";
import { utworzSprawe } from "@/lib/sprawy";

// „Skontaktuj przez Hub”: wiadomość do lidera trafia do ROPS jako sprawa z numerem. Hub łączy strony bez ujawniania e-maili.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`kontakt:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = KontaktZLiderem.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const { liderzy } = await liderzySieci();
  const lider = liderzy.find((l) => l.id === w.data.liderId);
  if (!lider) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  const sprawa = await utworzSprawe({
    typ: "pytanie",
    tytul: `Kontakt z liderem sieci: ${lider.nazwa}`,
    tresc: `Prośba o kontakt z organizacją „${lider.nazwa}” (sieć liderów innowacji). Wiadomość: ${w.data.tresc}`,
    email: w.data.email || undefined,
  });
  return Response.json({ numer: sprawa.numer }, { status: 201 });
}
