import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FormularzSwatki } from "@/components/swatka/formularz";

export const metadata: Metadata = { title: "Mam problem" };

export default async function Problem() {
  const t = await getTranslations("swatka");
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-bold sm:text-5xl">{t("tytul")}</h1>
      <FormularzSwatki />
    </div>
  );
}
