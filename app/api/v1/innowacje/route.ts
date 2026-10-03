import { katalog } from "@/lib/katalog";

// Publiczne API tylko do odczytu: katalog innowacji (gotowość do integracji z innymi systemami Hubu).
export async function GET() {
  const { lista } = await katalog();
  return Response.json(
    { wersja: "1", zrodlo: "Biblioteka Innowacji Społecznych ROPS Kraków", liczba: lista.length, innowacje: lista.map(({ id, nazwa, kategoria, naCzymPolega, problem, grupaDocelowa, ktoMozeSkorzystac, czyToDziala, url }) => ({ id, nazwa, kategoria, naCzymPolega, problem, grupaDocelowa, ktoMozeSkorzystac, czyToDziala, url })) },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}
