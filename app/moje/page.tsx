import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SzukajNumeru } from "@/components/moje/szukaj-numeru";

export const metadata: Metadata = { title: "Moje sprawy" };

export default async function Moje() {
  const t = await getTranslations("moje");
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-bold sm:text-5xl">{t("tytul")}</h1>
      <p className="text-xl text-muted">{t("podtytul")}</p>
      <SzukajNumeru />
    </div>
  );
}
