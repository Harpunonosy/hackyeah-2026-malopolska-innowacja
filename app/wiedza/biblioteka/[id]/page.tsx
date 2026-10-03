import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Download, ExternalLink, Video } from "lucide-react";
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

function Sekcja({ tytul, tekst, wyroznienie }: { tytul: string; tekst: string; wyroznienie?: boolean }) {
  if (!tekst) return null;
  return (
    <section className={`karta space-y-2 p-6 ${wyroznienie ? "border-l-8 border-l-primary" : ""}`}>
      <h2 className="text-2xl font-bold">{tytul}</h2>
      <p className="whitespace-pre-line text-lg leading-relaxed">{tekst}</p>
    </section>
  );
}

export default async function Innowacja(props: PageProps<"/wiedza/biblioteka/[id]">) {
  const { id } = await props.params;
  const i = innowacjaPoId.get(id);
  if (!i) notFound();
  const t = await getTranslations("wiedza");

  return (
    <article>
      <header className="bg-soft">
        <div className="kontener space-y-4 py-10 sm:py-14">
          <Link href="/wiedza/biblioteka" className="inline-flex min-h-10 items-center gap-1 font-semibold">
            <ArrowLeft aria-hidden className="size-4" />
            {t("tytul")}
          </Link>
          <div className="flex flex-wrap gap-2">
            <Chip className="bg-card">{i.kategoria}</Chip>
            {i.upowszechnianaW.length > 0 && <Chip className="bg-accent text-accent-fg">{t("wybraneKrotko")}</Chip>}
          </div>
          <h1 className="max-w-4xl text-[clamp(2rem,1.2rem+2.6vw,3.25rem)] font-bold">{i.nazwa}</h1>
          {i.autor && <p className="text-lg text-muted">{t("autor")}: {i.autor}</p>}
        </div>
      </header>

      <div className="kontener grid items-start gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Sekcja tytul={t("naCzymPolega")} tekst={i.naCzymPolega} wyroznienie />
          <Sekcja tytul={t("problem")} tekst={i.problem} />
          <Sekcja tytul={t("grupa")} tekst={i.grupaDocelowa} />
          <Sekcja tytul={t("ktoMoze")} tekst={i.ktoMozeSkorzystac} />
          <Sekcja tytul={t("czyDziala")} tekst={i.czyToDziala} />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-28">
          <section className="karta space-y-3 p-5">
            <Button asChild className="w-full">
              <Link href={`/wdrozenie?innowacja=${i.id}`}>{t("wdroz")}</Link>
            </Button>
            <Button asChild wariant="obrys" className="w-full">
              <Link href="/">{t("wroc")}</Link>
            </Button>
            {i.film.map((f, n) => (
              <Button key={f} asChild wariant="obrys" className="w-full">
                <a href={f} target="_blank" rel="noopener noreferrer">
                  <Video aria-hidden className="size-5" />
                  {t("filmy")} {i.film.length > 1 ? n + 1 : ""} (nowa karta)
                </a>
              </Button>
            ))}
          </section>
          {(i.folderPdf.length > 0 || i.materialyZip.length > 0) && (
            <section className="karta space-y-3 p-5">
              <h2 className="text-lg font-bold">{t("materialy")}</h2>
              {[...i.folderPdf.map((f) => [f, t("folder")]), ...i.materialyZip.map((f) => [f, t("paczka")])].map(([f, nazwa]) => (
                <Button key={f} asChild wariant="obrys" className="w-full">
                  <a href={f} target="_blank" rel="noopener noreferrer">
                    <Download aria-hidden className="size-5" />
                    {nazwa}
                  </a>
                </Button>
              ))}
            </section>
          )}
          <p className="px-1 text-sm text-muted">
            {t("zrodlo")}.{" "}
            <a href={i.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold">
              {t("otworz")}
              <ExternalLink aria-hidden className="size-4" />
            </a>
          </p>
        </aside>
      </div>
    </article>
  );
}
