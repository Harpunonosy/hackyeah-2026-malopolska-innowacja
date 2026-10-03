import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { innowacje, KATEGORIE, skroc } from "@/lib/biblioteka";

export const metadata: Metadata = { title: "Biblioteka innowacji" };

export default async function Biblioteka() {
  const t = await getTranslations("wiedza");
  return (
    <div className="space-y-10">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-bold sm:text-5xl">{t("tytul")}</h1>
        <p className="text-xl text-muted">{t("podtytul")}</p>
        <nav aria-label="Kategorie">
          <ul className="flex flex-wrap gap-2">
            {KATEGORIE.map((k, i) => (
              <li key={k}>
                <a href={`#kat-${i}`} className="inline-flex min-h-12 items-center rounded-full border-2 border-fg px-4 font-semibold no-underline hover:bg-fg hover:text-bg">
                  {k}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {KATEGORIE.map((k, i) => (
        <section key={k} id={`kat-${i}`} aria-labelledby={`kat-h-${i}`} className="space-y-4">
          <h2 id={`kat-h-${i}`} className="text-3xl font-bold">
            {k}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {innowacje
              .filter((x) => x.kategoria === k)
              .map((x) => (
                <li key={x.id}>
                  <Link href={`/wiedza/biblioteka/${x.id}`} className="block h-full space-y-1 rounded-2xl border-2 border-fg bg-card p-4 no-underline hover:bg-fg hover:text-bg">
                    <span className="block font-display text-xl font-bold">{x.nazwa}</span>
                    <span className="block">{skroc(x.problem, 160)}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
