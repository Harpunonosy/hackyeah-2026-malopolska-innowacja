import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FormularzPomyslu } from "@/components/pracownia/formularz";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Mam pomysł" };

export default async function Pomysl() {
  const t = await getTranslations("pracownia");
  return (
    <Strona>
      <NaglowekStrony nadtytul={t("nadtytul")} tytul={t("tytul")} opis={t("opis")} />
      <FormularzPomyslu />
    </Strona>
  );
}
