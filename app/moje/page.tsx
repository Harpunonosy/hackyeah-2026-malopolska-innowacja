import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SzukajNumeru } from "@/components/moje/szukaj-numeru";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Moje sprawy" };

export default async function Moje() {
  const t = await getTranslations("moje");
  return (
    <Strona>
      <NaglowekStrony tytul={t("tytul")} opis={t("podtytul")} nadtytul="Rynek" />
      <div className="karta max-w-2xl p-6 sm:p-8">
        <SzukajNumeru />
      </div>
    </Strona>
  );
}
