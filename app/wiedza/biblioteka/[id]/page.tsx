import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Download, ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { innowacjaPoId, innowacje } from "@/lib/biblioteka";

export function generateStaticParams() {
  return innowacje.map((i) => ({ id: i.id }));
}

export async function generateMetadata(props: PageProps<"/wiedza/biblioteka/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: innowacjaPoId.get(id)?.nazwa ?? "Innowacja" };
}

function Sekcja({ tytul, tekst }: { tytul: string; tekst: string }) {
  if (!tekst) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-2xl font-bold">{tytul}</h2>
      <p className="max-w-3xl whitespace-pre-line text-lg">{tekst}</p>
    </section>
  );
}

export default async function Innowacja(props: PageProps<"/wiedza/biblioteka/[id]">) {
  const { id } = await props.params;
  const i = innowacjaPoId.get(id);
  if (!i) notFound();
  const t = await getTranslations("wiedza");

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <Chip>{i.kategoria}</Chip>
        <h1 className="text-4xl font-bold sm:text-5xl">{i.nazwa}</h1>
        {i.upowszechnianaW.length > 0 && (
          <p className="font-semibold">{t("wybrane")}</p>
        )}
        {i.autor && (
          <p className="text-muted">
            {t("autor")}: {i.autor}
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <Sekcja tytul={t("naCzymPolega")} tekst={i.naCzymPolega} />
          <Sekcja tytul={t("problem")} tekst={i.problem} />
          <Sekcja tytul={t("grupa")} tekst={i.grupaDocelowa} />
          <Sekcja tytul={t("ktoMoze")} tekst={i.ktoMozeSkorzystac} />
          <Sekcja tytul={t("czyDziala")} tekst={i.czyToDziala} />
        </div>
        <aside className="space-y-6">
          {i.film.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xl font-bold">{t("filmy")}</h2>
              <ul className="space-y-2">
                {i.film.map((f, n) => (
                  <li key={f}>
                    <Button asChild wariant="obrys" className="w-full">
                      <a href={f} target="_blank" rel="noopener noreferrer">
                        <Video aria-hidden className="size-5" />
                        {t("filmy")} {i.film.length > 1 ? n + 1 : ""} (nowa karta)
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {(i.folderPdf.length > 0 || i.materialyZip.length > 0) && (
            <section className="space-y-2">
              <h2 className="text-xl font-bold">{t("materialy")}</h2>
              <ul className="space-y-2">
                {i.folderPdf.map((f) => (
                  <li key={f}>
                    <Button asChild wariant="obrys" className="w-full">
                      <a href={f} target="_blank" rel="noopener noreferrer">
                        <Download aria-hidden className="size-5" />
                        {t("folder")}
                      </a>
                    </Button>
                  </li>
                ))}
                {i.materialyZip.map((f) => (
                  <li key={f}>
                    <Button asChild wariant="obrys" className="w-full">
                      <a href={f} target="_blank" rel="noopener noreferrer">
                        <Download aria-hidden className="size-5" />
                        {t("paczka")}
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="text-sm text-muted">
            {t("zrodlo")}.{" "}
            <a href={i.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold">
              {t("otworz")}
              <ExternalLink aria-hidden className="size-4" />
            </a>
          </p>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild wariant="glowny">
          <Link href="/problem">{t("wroc")}</Link>
        </Button>
        <Button asChild wariant="obrys">
          <Link href="/wiedza/biblioteka">{t("tytul")}</Link>
        </Button>
      </div>
    </article>
  );
}
