import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CircleAlert, CircleCheck, CircleDot, CircleHelp, CircleX, Compass, ExternalLink, Sparkles } from "lucide-react";
import { Drukuj } from "@/components/krawiec/drukuj";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Strona } from "@/components/strona";
import { innowacjaPoIdAsync } from "@/lib/katalog";
import { db } from "@/lib/db";
import { BUDZETY, KRYTERIA_DI, NABOR_ETYKIETA, TYPY_INSTYTUCJI, type Kwalifikowalnosc, type PlanWdrozenia, type TypInstytucji } from "@/lib/krawiec";

export const metadata: Metadata = { title: "Plan wdrożenia" };

const UUID = /^[0-9a-f-]{36}$/i;
const zl = (n: number) => Math.round(n).toLocaleString("pl-PL");

function Sekcja({ tytul, children }: { tytul: string; children: React.ReactNode }) {
  return (
    <section className="karta space-y-3 p-6 break-inside-avoid">
      <h2 className="text-2xl font-bold">{tytul}</h2>
      {children}
    </section>
  );
}

export default async function Plan(props: PageProps<"/wdrozenie/plan/[id]">) {
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();
  const { rows } = await db().query("select innowacja_id, profil, plan, kwalifikowalnosc from plany_wdrozenia where id=$1", [id]);
  if (!rows[0]) notFound();
  const t = await getTranslations("krawiec");
  const inn = await innowacjaPoIdAsync(rows[0].innowacja_id);
  const profil = rows[0].profil as { typ: TypInstytucji; powiat: string; budzet: keyof typeof BUDZETY; odbiorcy: number };
  const { plan, dane } = rows[0].plan as { plan: PlanWdrozenia; dane: { wskazniki: { nazwa: string; wartosc: number; sredniaRegionu: number }[]; limit: number; razem: number; przekroczony: boolean } };
  const kw = rows[0].kwalifikowalnosc as Kwalifikowalnosc;
  const stale = plan.budzet.pozycje.filter((p) => p.rodzaj === "stale");
  const zmienne = plan.budzet.pozycje.filter((p) => p.rodzaj === "zmienne");
  const ikona = { spelnia: CircleCheck, nie_spelnia: CircleX, do_sprawdzenia: CircleHelp };
  const etykieta = { spelnia: t("spelnia"), nie_spelnia: t("nieSpelnia"), do_sprawdzenia: t("doSprawdzenia") };
  const kolor = { spelnia: "text-ok", nie_spelnia: "text-primary", do_sprawdzenia: "text-warn" };

  return (
    <Strona className="max-w-4xl">
      <header className="space-y-3">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">{t("nadtytul")}</p>
        <h1 className="text-[clamp(2rem,1.2rem+2.6vw,3.25rem)] font-bold">{t("planDla", { nazwa: inn?.nazwa ?? "" })}</h1>
        <p className="flex flex-wrap gap-2">
          <Chip>{TYPY_INSTYTUCJI[profil.typ]}</Chip>
          <Chip>{profil.powiat.replace("powiat ", "")}</Chip>
          <Chip>{profil.odbiorcy} odbiorców</Chip>
          <Chip>{BUDZETY[profil.budzet]}</Chip>
          <Chip>{NABOR_ETYKIETA}</Chip>
        </p>
        <p className="karta-mala flex items-start gap-3 border-2 border-accent p-4">
          <Sparkles aria-hidden className="mt-0.5 size-5 shrink-0" />
          {t("szkicInfo")}
        </p>
        <div className="nie-drukuj flex flex-wrap gap-3">
          <Drukuj etykieta={t("drukuj")} />
          <Button asChild wariant="obrys"><Link href="/wdrozenie">{t("nowy")}</Link></Button>
        </div>
      </header>

      <Sekcja tytul={t("sekcjaKwal")}>
        <p className="text-muted">{t("kwalOpis")}</p>
        <ul className="space-y-3">
          {kw.map((k) => {
            const I = ikona[k.wynik];
            return (
              <li key={k.id} className="flex items-start gap-3">
                <I aria-hidden className={`mt-1 size-6 shrink-0 ${kolor[k.wynik]}`} />
                <p>
                  <span className={`font-bold ${kolor[k.wynik]}`}>{etykieta[k.wynik]}: </span>
                  {k.warunek}
                  <span className="block text-sm text-muted">{k.uwaga}</span>
                </p>
              </li>
            );
          })}
        </ul>
      </Sekcja>

      <Sekcja tytul={t("sekcjaKarta")}>
        <dl className="space-y-2">
          <div><dt className="font-bold">{plan.karta_uslugi.nazwa}</dt></div>
          {([["cel", plan.karta_uslugi.cel], ["odbiorcyKarta", plan.karta_uslugi.odbiorcy], ["zakres", plan.karta_uslugi.zakres], ["standard", plan.karta_uslugi.standard]] as const).map(([k, v]) => (
            <div key={k}><dt className="text-sm font-bold uppercase text-muted">{t(k)}</dt><dd className="text-lg">{v}</dd></div>
          ))}
        </dl>
      </Sekcja>

      <Sekcja tytul={t("sekcjaLokalne")}>
        <p className="text-lg">{plan.uzasadnienie_lokalne}</p>
        {dane.wskazniki.length > 0 && (
          <div className="rounded-xl bg-soft p-4">
            <p className="text-sm font-bold uppercase text-muted">{t("wskaznikiLokalne")}</p>
            <ul className="mt-1 grid gap-x-6 sm:grid-cols-2">
              {dane.wskazniki.map((w) => (
                <li key={w.nazwa}>{w.nazwa}: <strong>{w.wartosc.toLocaleString("pl-PL")}</strong> <span className="text-sm text-muted">({t("sredniaRegionu")} {w.sredniaRegionu.toLocaleString("pl-PL")})</span></li>
              ))}
            </ul>
          </div>
        )}
      </Sekcja>

      <Sekcja tytul={t("sekcjaModel")}>
        <ol className="space-y-3">
          {plan.model_realizacji.map((m, i) => (
            <li key={m.krok} className="flex gap-3">
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-fg">{i + 1}</span>
              <p><strong>{m.krok}.</strong> {m.opis}</p>
            </li>
          ))}
        </ol>
      </Sekcja>

      <Sekcja tytul={t("sekcjaHarmonogram")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left">
            <thead><tr><th className="p-2">{t("etap")}</th><th className="p-2">{t("okres")}</th><th className="p-2">{t("dzialania")}</th></tr></thead>
            <tbody>
              {plan.harmonogram.map((h) => (
                <tr key={h.etap} className="border-t border-line-soft align-top">
                  <th scope="row" className="p-2 font-bold">{h.etap}</th><td className="p-2">{h.okres}</td><td className="p-2">{h.dzialania}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sekcja>

      <Sekcja tytul={t("sekcjaBudzet")}>
        <p className="text-muted">{plan.budzet.zalozenia}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left">
            <tbody>
              {[[t("stale"), stale], [t("zmienne"), zmienne]].map(([nazwa, poz]) => (
                <Fragment key={nazwa as string}>
                  <tr><th colSpan={3} className="bg-soft p-2 uppercase text-sm">{nazwa as string}</th></tr>
                  {(poz as typeof stale).map((p) => (
                    <tr key={p.nazwa} className="border-t border-line-soft align-top">
                      <td className="p-2 font-semibold">{p.nazwa}</td><td className="p-2 text-right whitespace-nowrap">{zl(p.kwota_zl)} zł</td><td className="p-2 text-sm text-muted">{p.uwagi}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
              <tr className="border-t-2 border-fg"><th className="p-2">{t("razem")}</th><td className="p-2 text-right text-xl font-bold whitespace-nowrap">{zl(dane.razem)} zł</td><td className="p-2 text-sm text-muted">{t("limit", { kwota: zl(dane.limit) })}</td></tr>
            </tbody>
          </table>
        </div>
        {profil.odbiorcy > 0 && <p className="text-lg font-bold">{t("kosztNaOdbiorce", { kwota: zl(dane.razem / profil.odbiorcy) })}</p>}
        {dane.przekroczony && <p role="alert" className="font-bold text-primary">{t("przekroczony")}</p>}
      </Sekcja>

      {plan.warianty && plan.warianty.length > 0 && (
        <Sekcja tytul={t("sekcjaWarianty")}>
          <p className="text-muted">{t("wariantyOpis")}</p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {plan.warianty.map((w) => (
              <li key={w.wariant} className={`karta-mala space-y-2 border-2 p-4 ${w.wariant === "pelny" ? "border-fg" : "border-line-soft"}`}>
                <h3 className="text-xl font-bold">{t(`wariant_${w.wariant}`)}</h3>
                <p className="flex flex-wrap gap-2"><Chip>{t("odbiorcow", { n: w.odbiorcy })}</Chip><Chip>{t("kosztCalk", { kwota: zl(w.koszt_zl) })}</Chip></p>
                {w.odbiorcy > 0 && <p className="text-lg font-bold">{t("kosztNaOdbiorce", { kwota: zl(w.koszt_zl / w.odbiorcy) })}</p>}
                <p>{w.opis}</p>
                <p className="text-sm font-bold uppercase text-muted">{t("obejmuje")}</p>
                <ul className="list-disc pl-5">{w.obejmuje.map((o) => <li key={o}>{o}</li>)}</ul>
                {w.wariant === "minimum" && <p><span className="font-bold">{t("rezygnujemy")}: </span>{w.rezygnujemy_z}</p>}
              </li>
            ))}
          </ul>
        </Sekcja>
      )}

      {plan.kompas_di && plan.kompas_di.length > 0 && (
        <Sekcja tytul={t("sekcjaKompas")}>
          <p className="flex items-start gap-2 text-muted"><Compass aria-hidden className="mt-1 size-5 shrink-0" />{t("kompasOpis")}</p>
          <ul className="space-y-3">
            {plan.kompas_di.map((k) => {
              const I = k.ocena === "mocne" ? CircleCheck : k.ocena === "czesciowe" ? CircleDot : CircleAlert;
              const kol = k.ocena === "mocne" ? "text-ok" : k.ocena === "czesciowe" ? "text-warn" : "text-primary";
              return (
                <li key={k.kryterium} className="flex items-start gap-3">
                  <I aria-hidden className={`mt-1 size-6 shrink-0 ${kol}`} />
                  <div>
                    <p><span className={`font-bold ${kol}`}>{t(`ocena_${k.ocena}`)}: </span><span className="font-semibold">{KRYTERIA_DI[k.kryterium]}</span></p>
                    <p>{k.uzasadnienie}</p>
                    <p className="text-sm"><span className="font-bold">{t("wskazowka")}</span> {k.wskazowka}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Sekcja>
      )}

      <Sekcja tytul={t("sekcjaWskazniki")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left">
            <thead><tr><th className="p-2">{t("wskaznik")}</th><th className="p-2">{t("typWsk")}</th><th className="p-2">{t("wartosc")}</th></tr></thead>
            <tbody>{plan.wskazniki.map((w) => <tr key={w.nazwa} className="border-t border-line-soft"><th scope="row" className="p-2 font-semibold">{w.nazwa}</th><td className="p-2">{w.typ}</td><td className="p-2">{w.wartosc_docelowa}</td></tr>)}</tbody>
          </table>
        </div>
      </Sekcja>

      <Sekcja tytul={t("sekcjaRyzyka")}>
        <ul className="space-y-3">{plan.ryzyka.map((r) => <li key={r.ryzyko}><strong>{r.ryzyko}</strong><span className="block text-muted">{r.dzialanie}</span></li>)}</ul>
      </Sekcja>

      <Sekcja tytul={t("sekcjaFinansowanie")}>
        <ul className="space-y-3">{plan.finansowanie.map((f) => <li key={f.zrodlo}><strong>{f.zrodlo}</strong><span className="block text-muted">{f.opis}</span></li>)}</ul>
      </Sekcja>

      <Sekcja tytul={t("sekcjaAutor")}>
        <p className="text-lg">{plan.kontakt_z_autorem}</p>
        {inn && <Button asChild wariant="obrys" className="nie-drukuj"><Link href={`/wiedza/biblioteka/${inn.id}`}>{inn.nazwa}</Link></Button>}
      </Sekcja>

      {inn && (
        <Sekcja tytul={t("sekcjaPakiet")}>
          <p className="text-muted">{t("pakietOpis")}</p>
          <h3 className="text-xl font-bold">{t("materialy")}</h3>
          <ul className="space-y-1 text-lg">
            {[...inn.film.map((u) => [u, t("film")]), ...inn.folderPdf.map((u) => [u, t("folder")]), ...inn.materialyZip.map((u) => [u, t("zip")]), [inn.url, t("kartaRops")]].filter(([u]) => u).map(([u, e]) => (
              <li key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 underline"><ExternalLink aria-hidden className="size-5 shrink-0" />{e}<span className="sr-only"> {t("nowaKarta")}</span></a></li>
            ))}
            <li><Link href="/rynek" className="inline-flex min-h-12 items-center underline">{t("kontaktHub")}</Link></li>
          </ul>
          {plan.pierwsze_kroki && plan.pierwsze_kroki.length > 0 && (
            <>
              <h3 className="text-xl font-bold">{t("pierwszeKroki")}</h3>
              <ol className="list-decimal space-y-1 pl-6 text-lg">{plan.pierwsze_kroki.map((k) => <li key={k}>{k}</li>)}</ol>
            </>
          )}
        </Sekcja>
      )}
    </Strona>
  );
}
