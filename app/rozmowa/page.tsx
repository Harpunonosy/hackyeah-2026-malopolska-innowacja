import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RozmowaGlosowa } from "@/components/a11y/rozmowa-glosowa";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Rozmowa głosowa" };

export default async function Page() {
  const t = await getTranslations("rozmowaGlosowa");
  return (
    <Strona>
      <NaglowekStrony nadtytul={t("nadtytul")} tytul={t("tytul")} opis={t("opis")} />
      <RozmowaGlosowa />
    </Strona>
  );
}
