import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DolaczDoSieci } from "@/components/siec/dolacz";
import { ListaLiderow } from "@/components/siec/lista";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { POZYCJE_KAFELKOW } from "@/components/wiedza/uklad";
import { OBSZARY } from "@/lib/obszary";
import { POWIATY_IOSS } from "@/lib/powiaty";
import { slugPowiatu } from "@/lib/profil-powiatu";
import { liderzySieci } from "@/lib/siec";

export const metadata: Metadata = { title: "Sieć liderów innowacji" };

/** Sieć liderów innowacji (PDF §9): autorzy, partnerzy i miejsca wdrożeń; kontakt przez Hub. */
export default async function Siec() {
  const t = await getTranslations("siec");
  const { liderzy, wdrozenia } = await liderzySieci();
  const obszary = OBSZARY.map((o): [string, string] => [o.id, o.nazwa]);
  const naPowiat = new Map<string, number>();
  for (const w of wdrozenia) naPowiat.set(w.powiat, (naPowiat.get(w.powiat) ?? 0) + 1);
  const maks = Math.max(1, ...naPowiat.values());
  const sektorow = new Set(liderzy.map((l) => l.sektor)).size;
  const innowacji = liderzy.reduce((s, l) => s + l.innowacje.length, 0);

  return (
    <Strona>
      <NaglowekStrony nadtytul={t("nadtytul")} tytul={t("tytul")} opis={t("opis")} />
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([[liderzy.length, t("liderow")], [sektorow, t("sektorow")], [innowacji, t("innowacji")], [wdrozenia.length, t("wdrozen")]] as const).map(([n, e]) => (
          <div key={e} className="karta-mala p-4"><dt className="text-sm font-bold uppercase text-muted">{e}</dt><dd className="font-display text-4xl font-bold">{n}</dd></div>
        ))}
      </dl>

      <ListaLiderow liderzy={liderzy} obszary={obszary} />

      <section aria-labelledby="siec-mapa" className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-3">
          <h2 id="siec-mapa" className="text-3xl font-extrabold">{t("mapaTytul")}</h2>
          <p className="text-muted">{t("mapaOpis")}</p>
          <ul className="grid max-w-3xl grid-cols-6 gap-1.5 sm:gap-2" aria-label={t("mapaEtykieta")}>
            {POWIATY_IOSS.map((p) => {
              const [kol, wier] = POZYCJE_KAFELKOW[p] ?? [0, 0];
              const n = naPowiat.get(p) ?? 0;
              const stopien = n === 0 ? 0 : Math.min(4, 1 + Math.floor((n / maks) * 3.99));
              return (
                <li key={p} style={{ gridColumn: kol + 1, gridRow: wier + 1 }} className={`kaf-${stopien} flex min-h-20 flex-col justify-between rounded-lg border-2 border-line p-1.5 text-xs leading-tight sm:text-sm`}>
                  <Link href={`/wiedza/powiat/${slugPowiatu(p)}`} className="font-bold text-inherit no-underline">{p.replace("powiat ", "")}</Link>
                  <span>{t("planow", { n })}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold">{t("ostatnieWdrozenia")}</h3>
          {wdrozenia.length === 0 ? (
            <p>{t("brakWdrozen")} <Link href="/wdrozenie" className="underline">{t("krawiecLink")}</Link></p>
          ) : (
            <ul className="space-y-2">
              {wdrozenia.slice(0, 8).map((w, i) => (
                <li key={w.kiedy + i} className="karta-mala p-3">
                  {t("planuje", { instytucja: w.instytucja, powiat: w.powiat.replace("powiat ", "pow. ") })}{" "}
                  <Link href={`/wiedza/biblioteka/${w.innowacjaId}`} className="font-semibold underline">{w.innowacja}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="siec-dolacz" className="karta max-w-3xl space-y-4 p-6 sm:p-8">
        <h2 id="siec-dolacz" className="text-3xl font-extrabold">{t("dolaczTytul")}</h2>
        <p className="text-lg">{t("dolaczOpis")}</p>
        <DolaczDoSieci obszary={obszary} />
      </section>
    </Strona>
  );
}
