import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StatusZgloszenia } from "@/components/moje/status-zgloszenia";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Status zgłoszenia" };

export default async function Status(props: PageProps<"/moje/[numer]">) {
  const { numer } = await props.params;
  const t = await getTranslations("moje");
  return (
    <Strona>
      <NaglowekStrony tytul={t("oS", { numer: numer.toUpperCase() })} nadtytul="Śledzenie zgłoszenia" />
      <StatusZgloszenia numer={numer.toUpperCase()} />
    </Strona>
  );
}
