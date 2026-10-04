import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListaBiblioteki } from "@/components/biblioteka/lista";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { skroc } from "@/lib/biblioteka";
import { katalog } from "@/lib/katalog";
import { czyWdrazalna } from "@/lib/swatka";

export const metadata: Metadata = { title: "Biblioteka innowacji" };
export const dynamic = "force-dynamic";

export default async function Biblioteka() {
  const t = await getTranslations("wiedza");
  const { lista: innowacje } = await katalog();
  const KATEGORIE = [...new Set(innowacje.map((i) => i.kategoria))].sort((a, b) => a.localeCompare(b, "pl"));
  const pozycje = innowacje.map((i) => ({
    id: i.id, nazwa: i.nazwa, kategoria: i.kategoria, problem: skroc(i.problem, 220), film: i.film.length > 0, wybrana: czyWdrazalna(i),
    grupa: skroc(i.grupaDocelowa, 160), kto: skroc(i.ktoMozeSkorzystac, 200), dziala: skroc(i.czyToDziala, 200),
  }));
  return (
    <Strona>
      <p className="prosty:hidden"><Link href="/wiedza/materialy" className="inline-flex min-h-12 items-center font-semibold underline" lang="pl">Raporty i publikacje ROPS — pełny katalog materiałów</Link></p>
      <NaglowekStrony tytul={t("tytul")} nadtytul="Skarbnica wiedzy" opis={t("podtytul")} />
      <div className="flex flex-wrap gap-3 prosty:hidden">
        <Button asChild wariant="obrys"><Link href="/wiedza/malopolska">Kondycja Małopolski: raporty i mapa wskaźników</Link></Button>
        <Button asChild wariant="obrys"><Link href="/wiedza/akademia">Akademia: krótkie lekcje</Link></Button>
        <Button asChild wariant="obrys"><Link href="/galeria">Galeria pomysłów i dobrych praktyk</Link></Button>
      </div>
      <ListaBiblioteki pozycje={pozycje} kategorie={KATEGORIE} />
    </Strona>
  );
}
