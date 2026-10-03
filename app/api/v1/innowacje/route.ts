import { katalog } from "@/lib/katalog";
import { innowacjaPubliczna } from "@/lib/api-v1";

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

// Publiczne API tylko do odczytu: katalog innowacji (gotowość do integracji z innymi systemami Hubu).
// Filtry: ?q=słowa (wszystkie muszą wystąpić), ?kategoria=nazwa, ?zFilmem=1.
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const slowa = fold(p.get("q") ?? "").split(/\s+/).filter(Boolean).slice(0, 8);
  const kategoria = p.get("kategoria");
  const zFilmem = p.get("zFilmem") === "1";
  const { lista } = await katalog();
  const wynik = lista.filter((i) =>
    (!kategoria || i.kategoria === kategoria) &&
    (!zFilmem || i.film.length > 0) &&
    slowa.every((s) => fold(`${i.nazwa} ${i.kategoria} ${i.problem} ${i.naCzymPolega} ${i.grupaDocelowa}`).includes(s)),
  );
  return Response.json(
    { wersja: "1", zrodlo: "Biblioteka Innowacji Społecznych ROPS Kraków", liczba: wynik.length, innowacje: wynik.map(innowacjaPubliczna) },
    { headers: { "Cache-Control": "public, max-age=60", "Access-Control-Allow-Origin": "*" } },
  );
}
