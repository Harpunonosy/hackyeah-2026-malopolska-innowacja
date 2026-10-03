import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StatusZgloszenia } from "@/components/moje/status-zgloszenia";

export const metadata: Metadata = { title: "Status zgłoszenia" };

export default async function Status(props: PageProps<"/moje/[numer]">) {
  const { numer } = await props.params;
  const t = await getTranslations("moje");
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-bold">{t("oS", { numer: numer.toUpperCase() })}</h1>
      <StatusZgloszenia numer={numer.toUpperCase()} />
    </div>
  );
}
