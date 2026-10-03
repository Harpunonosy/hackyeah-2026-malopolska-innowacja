import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusZgloszenia } from "@/components/moje/status-zgloszenia";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Status zgłoszenia" };

export default async function Status(props: PageProps<"/moje/[numer]">) {
  const { numer } = await props.params;
  const t = await getTranslations("moje");
  const tk = await getTranslations("karta");
  return (
    <Strona>
      <NaglowekStrony tytul={t("oS", { numer: numer.toUpperCase() })} nadtytul={t("sledzenie")}>
        <Button asChild wariant="obrys" className="nie-drukuj"><Link href={`/moje/${numer.toUpperCase()}/karta`}><Printer aria-hidden className="size-5" />{tk("wydrukujKarte")}</Link></Button>
      </NaglowekStrony>
      <StatusZgloszenia numer={numer.toUpperCase()} />
    </Strona>
  );
}
