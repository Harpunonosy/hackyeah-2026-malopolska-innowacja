import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import QRCode from "qrcode";
import { Drukuj } from "@/components/krawiec/drukuj";
import { Button } from "@/components/ui/button";
import { Strona } from "@/components/strona";
import { db } from "@/lib/db";
import { TELEFONY_KRYZYSOWE } from "@/lib/kryzys";

export const metadata: Metadata = { title: "Karta potrzeby" };

/** Papierowa „Karta potrzeby” (I-16): numer, kod QR do statusu, opis potrzeby i propozycje. Dla osób, które nie korzystają z internetu. */
export default async function Karta(props: PageProps<"/moje/[numer]/karta">) {
  const numer = (await props.params).numer.toUpperCase();
  if (!/^SPL-[0-9A-Z]{8}$/.test(numer)) notFound();
  const z = (await db().query("select id, created_at, tresc_zamaskowana, placowka from zgloszenia where numer=$1", [numer])).rows[0];
  if (!z) notFound();
  const dop = (await db().query("select i.nazwa, d.dlaczego from dopasowania d join innowacje i on i.id=d.innowacja_id where d.zgloszenie_id=$1 order by d.pozycja limit 3", [z.id])).rows;
  const t = await getTranslations("karta");
  const h = await headers();
  const adres = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}/moje/${numer}`;
  const qr = await QRCode.toDataURL(adres, { margin: 1, width: 240, errorCorrectionLevel: "M" });

  return (
    <Strona className="max-w-3xl">
      <div className="nie-drukuj flex flex-wrap gap-3">
        <Drukuj etykieta={t("drukuj")} />
        <Button asChild wariant="obrys"><Link href={`/moje/${numer}`}>{t("wroc")}</Link></Button>
      </div>
      <article className="karta space-y-5 border-4 border-fg p-6 text-lg print:border-2 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold">{t("tytul")}</h1>
            <p className="text-sm font-bold text-muted">{t("numer")}</p>
            <p className="font-mono text-4xl font-bold tracking-wider">{numer}</p>
            <p>{t("zachowaj")}</p>
          </div>
          <figure className="space-y-1 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- kod QR jako data URL, bez optymalizacji */}
            <img src={qr} width={160} height={160} alt={t("qrAlt", { numer })} className="mx-auto" />
            <figcaption className="max-w-44 text-sm">{t("qr")}</figcaption>
          </figure>
        </header>
        <p className="text-sm">{t("albo")} <span className="break-all font-mono">{adres}</span></p>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div><dt className="text-sm font-bold text-muted">{t("data")}</dt><dd>{new Date(z.created_at).toLocaleDateString("pl-PL", { dateStyle: "long" })}</dd></div>
          {z.placowka && <div><dt className="text-sm font-bold text-muted">{t("przyjeta")}</dt><dd>{z.placowka}</dd></div>}
        </dl>
        <section aria-labelledby="k-potrzeba" className="space-y-1">
          <h2 id="k-potrzeba" className="text-2xl font-bold">{t("potrzeba")}</h2>
          <p className="whitespace-pre-line">{z.tresc_zamaskowana}</p>
        </section>
        <section aria-labelledby="k-prop" className="space-y-1">
          <h2 id="k-prop" className="text-2xl font-bold">{t("propozycje")}</h2>
          {dop.length ? (
            <ol className="list-decimal space-y-2 pl-6">{dop.map((d) => <li key={d.nazwa}><strong>{d.nazwa}.</strong> {d.dlaczego}</li>)}</ol>
          ) : <p>{t("brakPropozycji")}</p>}
        </section>
        <section aria-labelledby="k-dalej" className="space-y-1">
          <h2 id="k-dalej" className="text-2xl font-bold">{t("coDalej")}</h2>
          <ol className="list-decimal space-y-1 pl-6">{(["krok1", "krok2", "krok3"] as const).map((k) => <li key={k}>{t(k)}</li>)}</ol>
        </section>
        <section aria-labelledby="k-pomoc" className="space-y-1 rounded-xl border-2 border-primary p-4">
          <h2 id="k-pomoc" className="text-xl font-bold">{t("pomocTeraz")}</h2>
          <ul className="space-y-1">{TELEFONY_KRYZYSOWE.slice(0, 3).map((x) => <li key={x.numer}><strong>{"wyswietl" in x ? x.wyswietl : x.numer}</strong>: {x.opis}</li>)}</ul>
        </section>
        <p className="text-sm text-muted">{t("stopka")}</p>
      </article>
    </Strona>
  );
}
