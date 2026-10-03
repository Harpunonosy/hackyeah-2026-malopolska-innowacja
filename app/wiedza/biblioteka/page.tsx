import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ListaBiblioteki } from "@/components/biblioteka/lista";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { innowacje, KATEGORIE, skroc } from "@/lib/biblioteka";

export const metadata: Metadata = { title: "Biblioteka innowacji" };

export default async function Biblioteka() {
  const t = await getTranslations("wiedza");
  const pozycje = innowacje.map((i) => ({
    id: i.id, nazwa: i.nazwa, kategoria: i.kategoria, problem: skroc(i.problem, 220), film: i.film.length > 0, wybrana: i.upowszechnianaW.length > 0,
  }));
  return (
    <Strona>
      <NaglowekStrony tytul={t("tytul")} nadtytul="Skarbnica wiedzy" opis={t("podtytul")} />
      <ListaBiblioteki pozycje={pozycje} kategorie={KATEGORIE} />
    </Strona>
  );
}
