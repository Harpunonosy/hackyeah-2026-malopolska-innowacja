import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FormularzKrawca } from "@/components/krawiec/formularz";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { innowacjaPoId } from "@/lib/biblioteka";
import { katalog } from "@/lib/katalog";
import { czyWdrazalna } from "@/lib/swatka";

export const metadata: Metadata = { title: "Wdróż innowację u siebie" };
export const dynamic = "force-dynamic";

export default async function Wdrozenie(props: PageProps<"/wdrozenie">) {
  const t = await getTranslations("krawiec");
  const sp = await props.searchParams;
  const { lista: innowacje } = await katalog();
  // Plan wdrożenia ma sens dla rzetelnych, sprawdzonych innowacji (wybranych do upowszechniania, z naboru lub dodanych i zatwierdzonych w Centrali).
  const wdrazalne = innowacje.filter((i) => !innowacjaPoId.has(i.id) || czyWdrazalna(i));
  const id = typeof sp.innowacja === "string" && wdrazalne.some((i) => i.id === sp.innowacja) ? sp.innowacja : undefined;
  return (
    <Strona>
      <NaglowekStrony nadtytul={t("nadtytul")} tytul={t("tytul")} opis={t("opis")} />
      <FormularzKrawca innowacje={wdrazalne.map((i) => ({ id: i.id, nazwa: i.nazwa, kategoria: i.kategoria }))} poczatkowa={id} />
    </Strona>
  );
}
