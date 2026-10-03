import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Lock, Phone } from "lucide-react";
import { Strona } from "@/components/strona";
import { FormularzSwatki } from "@/components/swatka/formularz";

export const metadata: Metadata = { title: "Mam problem" };

export default async function Problem(props: PageProps<"/problem">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 1500) : "";
  const t = await getTranslations("swatka");
  return (
    <Strona>
      <FormularzSwatki poczatkowy={q} auto={sp.auto === "1" && q.length >= 3}>
        <section className="karta space-y-3 border-2 border-primary p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Phone aria-hidden className="size-5 text-primary" />
            {t("pomocTytul")}
          </h2>
          <p className="text-muted">{t("pomocOpis")}</p>
          <p className="font-display text-2xl font-extrabold text-primary">
            <a href="tel:112" className="inline-flex min-h-10 items-center">112</a>
            <span aria-hidden="true"> · </span>
            <a href="tel:116123" className="inline-flex min-h-10 items-center">116 123</a>
          </p>
        </section>
        <section className="karta-mala flex gap-3 p-5 text-sm text-muted">
          <Lock aria-hidden className="mt-0.5 size-5 shrink-0 text-fg" />
          <p>{t("prywatnosc")}</p>
        </section>
      </FormularzSwatki>
    </Strona>
  );
}
