import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FormularzAsystowany } from "@/components/asystowane/formularz";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Tryb asystowany: zgłoszenie w imieniu osoby" };

export default async function Asystowane() {
  const t = await getTranslations("asystowane");
  return (
    <Strona>
      <NaglowekStrony nadtytul={t("nadtytul")} tytul={t("tytul")} opis={t("opis")}>
        <p className="text-muted">{t("demo")}</p>
      </NaglowekStrony>
      <FormularzAsystowany />
    </Strona>
  );
}
