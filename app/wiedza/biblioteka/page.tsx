import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListaBiblioteki } from "@/components/biblioteka/lista";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { skroc } from "@/lib/biblioteka";
import { katalog } from "@/lib/katalog";

export const metadata: Metadata = { title: "Biblioteka innowacji" };
export const dynamic = "force-dynamic";

export default async function Biblioteka() {
  const t = await getTranslations("wiedza");
  const { lista: innowacje } = await katalog();
  const KATEGORIE = [...new Set(innowacje.map((i) => i.kategoria))].sort((a, b) => a.localeCompare(b, "pl"));
  const pozycje = innowacje.map((i) => ({
    id: i.id, nazwa: i.nazwa, kategoria: i.kategoria, problem: skroc(i.problem, 220), film: i.film.length > 0, wybrana: i.upowszechnianaW.length > 0,
  }));
  return (
    <Strona>
      <NaglowekStrony tytul={t("tytul")} nadtytul="Skarbnica wiedzy" opis={t("podtytul")} />
      <Button asChild wariant="obrys" className="w-fit"><Link href="/wiedza/malopolska">Kondycja Małopolski: raporty i mapa wskaźników</Link></Button>
      <ListaBiblioteki pozycje={pozycje} kategorie={KATEGORIE} />
    </Strona>
  );
}
