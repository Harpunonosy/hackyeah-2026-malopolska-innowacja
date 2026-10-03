import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CentralaNav } from "@/components/centrala/centrala-nav";
import { Drukuj } from "@/components/krawiec/drukuj";
import { db } from "@/lib/db";
import { nazwaObszaru } from "@/lib/obszary";
import { policzRadar } from "@/lib/radar";
import { czyAdmin } from "@/lib/sesja";

export const metadata: Metadata = { title: "Centrala: Puls Małopolski" };

const proc = (a: number, b: number) => (b === 0 ? null : Math.round(((a - b) / b) * 100));
const zmianaTekst = (z: number | null) => (z === null ? "—" : `${z > 0 ? "+" : ""}${z}%`);
const data = (d: Date) => d.toLocaleDateString("pl-PL", { dateStyle: "long" });
const bezPowiatu = (p: string) => p.replace("powiat ", "");

/** Puls Małopolski (I-17): raport miesięczny dla kierownictwa ROPS, liczony z danych Splotu, do druku. */
export default async function Puls() {
  if (!(await czyAdmin())) redirect("/centrala/logowanie");
  const t = await getTranslations("puls");
  const c = db();
  const [liczby, czasy, inn, radar] = await Promise.all([
    c.query(`select
        count(*) filter (where typ='problem' and created_at > now()-interval '30 days')::int as problemy,
        count(*) filter (where typ='problem' and created_at between now()-interval '60 days' and now()-interval '30 days')::int as problemy_wczesniej,
        count(*) filter (where typ='pomysl' and created_at > now()-interval '30 days')::int as pomysly,
        count(*) filter (where typ='wniosek' and created_at > now()-interval '30 days')::int as wnioski,
        avg(ocena_pomocy) filter (where created_at > now()-interval '30 days')::float8 as ocena
      from zgloszenia`),
    c.query(`select percentile_cont(0.5) within group (order by extract(epoch from pierwsza_odpowiedz_at - created_at) / 3600)::float8 as mediana,
        avg(case when pierwsza_odpowiedz_at <= termin_sla then 1 else 0 end)::float8 as w_terminie, count(*)::int as n
      from zgloszenia where pierwsza_odpowiedz_at is not null and created_at > now()-interval '30 days'`),
    c.query(`select i.nazwa, i.id, count(*)::int as n from dopasowania d join zgloszenia z on z.id=d.zgloszenie_id join innowacje i on i.id=d.innowacja_id
      where z.created_at > now()-interval '30 days' and d.pozycja <= 3 group by i.id, i.nazwa order by n desc limit 5`),
    policzRadar(),
  ]);
  const l = liczby.rows[0];
  const cz = czasy.rows[0];
  const teraz = new Date();
  const trendy = [...radar.trendy].filter((x) => x.ostatnie4 > 0).sort((a, b) => (b.zmianaProc ?? 0) - (a.zmianaProc ?? 0)).slice(0, 4);

  const kafel = (etykieta: string, wartosc: string, podpis?: string) => (
    <div className="karta-mala space-y-1 p-4 break-inside-avoid">
      <p className="text-sm font-bold uppercase text-muted">{etykieta}</p>
      <p className="font-display text-3xl font-bold">{wartosc}</p>
      {podpis && <p className="text-sm">{podpis}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="nie-drukuj"><CentralaNav aktywna="puls" /></div>
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">{t("nadtytul")}</p>
        <h1 className="text-4xl font-bold sm:text-5xl">{t("tytul")}</h1>
        <p className="max-w-3xl text-lg text-muted">{t("opis")}</p>
        <p>{t("okres", { od: data(new Date(teraz.getTime() - 30 * 86_400_000)), do: data(teraz) })} {t("demo")}</p>
        <div className="nie-drukuj"><Drukuj etykieta={t("drukuj")} /></div>
      </header>

      <section aria-labelledby="pl-liczby" className="space-y-3">
        <h2 id="pl-liczby" className="text-2xl font-bold">{t("liczby")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {kafel(t("zgloszenia"), String(l.problemy), t("zmiana", { zmiana: zmianaTekst(proc(l.problemy, l.problemy_wczesniej)) }))}
          {kafel(t("pomysly"), String(l.pomysly))}
          {kafel(t("wnioski"), String(l.wnioski))}
          {kafel(t("czas"), !cz.n ? t("brakDanych") : cz.mediana < 1 ? t("min", { n: Math.max(1, Math.round(cz.mediana * 60)) }) : t("godz", { n: Math.round(cz.mediana * 10) / 10 }), cz.n ? t("naPodstawie", { n: cz.n }) : undefined)}
          {kafel(t("wTerminie"), cz.n ? `${Math.round(cz.w_terminie * 100)}%` : t("brakDanych"), cz.n ? t("naPodstawie", { n: cz.n }) : undefined)}
          {kafel(t("ocena"), l.ocena ? `${(Math.round(l.ocena * 10) / 10).toLocaleString("pl-PL")} / 5` : t("brakDanych"))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="pl-trendy" className="karta space-y-2 p-5 break-inside-avoid">
          <h2 id="pl-trendy" className="text-2xl font-bold">{t("trendy")}</h2>
          <p className="text-muted">{t("trendyOpis")}</p>
          {trendy.length ? (
            <ol className="list-decimal space-y-1 pl-6 text-lg">
              {trendy.map((x) => <li key={x.obszar}><strong>{nazwaObszaru(x.obszar)}</strong>: {x.poprzednie4} → {x.ostatnie4} ({zmianaTekst(x.zmianaProc)}){x.nowyTrend && <>, <span className="font-bold text-primary">{t("nowyTrend")}</span></>}</li>)}
            </ol>
          ) : <p>{t("brak")}</p>}
        </section>

        <section aria-labelledby="pl-plamy" className="karta space-y-2 p-5 break-inside-avoid">
          <h2 id="pl-plamy" className="text-2xl font-bold">{t("plamy")}</h2>
          <p className="text-muted">{t("plamyOpis")}</p>
          {radar.luki.length ? (
            <ol className="list-decimal space-y-1 pl-6 text-lg">
              {radar.luki.slice(0, 5).map((x) => <li key={x.powiat + x.obszar}><strong>{bezPowiatu(x.powiat)}</strong>, {nazwaObszaru(x.obszar)} ({t("zgloszen", { n: x.n })})</li>)}
            </ol>
          ) : <p>{t("brak")}</p>}
        </section>

        <section aria-labelledby="pl-ciche" className="karta space-y-2 p-5 break-inside-avoid">
          <h2 id="pl-ciche" className="text-2xl font-bold">{t("ciche")}</h2>
          <p className="text-muted">{t("cicheOpis")}</p>
          {radar.ciche.length ? (
            <ol className="list-decimal space-y-1 pl-6 text-lg">
              {radar.ciche.slice(0, 5).map((x) => <li key={x.powiat + x.obszar}><strong>{bezPowiatu(x.powiat)}</strong>, {nazwaObszaru(x.obszar)} ({t("ryzyko", { r: x.ryzyko.toLocaleString("pl-PL", { maximumFractionDigits: 1 }) })}, {t("zgloszen", { n: x.zgloszen })})</li>)}
            </ol>
          ) : <p>{t("brak")}</p>}
        </section>

        <section aria-labelledby="pl-inn" className="karta space-y-2 p-5 break-inside-avoid">
          <h2 id="pl-inn" className="text-2xl font-bold">{t("innowacje")}</h2>
          <p className="text-muted">{t("innowacjeOpis")}</p>
          {inn.rows.length ? (
            <ol className="list-decimal space-y-1 pl-6 text-lg">
              {inn.rows.map((x) => <li key={x.id}><Link href={`/wiedza/biblioteka/${x.id}`} className="underline">{x.nazwa}</Link> ({t("razy", { n: x.n })})</li>)}
            </ol>
          ) : <p>{t("brak")}</p>}
        </section>
      </div>
      <p className="nie-drukuj"><Link href="/centrala/radar" className="font-semibold underline">{t("wRadarze")}</Link></p>
    </div>
  );
}
