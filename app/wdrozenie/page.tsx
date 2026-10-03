import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FormularzKrawca } from "@/components/krawiec/formularz";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { katalog } from "@/lib/katalog";

export const metadata: Metadata = { title: "Wdróż innowację u siebie" };
export const dynamic = "force-dynamic";

export default async function Wdrozenie(props: PageProps<"/wdrozenie">) {
  const t = await getTranslations("krawiec");
  const sp = await props.searchParams;
  const { lista: innowacje, mapa } = await katalog();
  const id = typeof sp.innowacja === "string" && mapa.has(sp.innowacja) ? sp.innowacja : undefined;
  return (
    <Strona>
      <NaglowekStrony nadtytul={t("nadtytul")} tytul={t("tytul")} opis={t("opis")} />
      <FormularzKrawca innowacje={innowacje.map((i) => ({ id: i.id, nazwa: i.nazwa, kategoria: i.kategoria }))} poczatkowa={id} />
    </Strona>
  );
}
