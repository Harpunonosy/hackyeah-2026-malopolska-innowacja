import type { ReactNode } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck, CircleDot, CircleHelp, CircleX, Compass, ExternalLink } from "lucide-react";
import { Szczegoly } from "@/components/ui/szczegoly";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { KRYTERIA_DI, type TypInstytucji, type BUDZETY } from "@/lib/krawiec-stale";
import type { Innowacja } from "@/lib/biblioteka";
import type { Kwalifikowalnosc, PlanWdrozenia } from "@/lib/krawiec";

export type DanePlanu = {wskazniki:{nazwa:string;wartosc:number;sredniaRegionu:number}[];limit:number;razem:number;przekroczony:boolean};
export type ProfilPlanu = {typ:TypInstytucji;powiat:string;budzet:keyof typeof BUDZETY;odbiorcy:number};
type Tl = (klucz:string,wartosci?:Record<string,string|number>)=>string;
const zl = (n:number)=>Math.round(n).toLocaleString("pl-PL");
const krotko = (tekst:string)=>tekst.length<=240 ? tekst : tekst.slice(0,240).replace(/\s+\S*$/u,"")+"…";
function Sekcja({tytul,children}: {tytul:string;children:ReactNode}) {
  return <section className="min-w-0 space-y-3 break-inside-avoid"><h3 className="text-xl font-bold">{tytul}</h3>{children}</section>;
}
export function PlanTresc({plan,dane,profil,kw,inn,t,konsultacja}: {plan:PlanWdrozenia;dane:DanePlanu;profil:ProfilPlanu;kw:Kwalifikowalnosc;inn:Innowacja|null;t:Tl;konsultacja?:ReactNode}) {
  const stale=plan.budzet.pozycje.filter(p=>p.rodzaj==="stale");
  const zmienne=plan.budzet.pozycje.filter(p=>p.rodzaj==="zmienne");
  const niespelnione=kw.filter(k=>k.wynik==="nie_spelnia");
  const doSprawdzenia=kw.filter(k=>k.wynik==="do_sprawdzenia");
  const termin=doSprawdzenia.find(k=>k.id==="termin");
  const pierwsze=plan.pierwsze_kroki?.length ? plan.pierwsze_kroki : plan.model_realizacji.map(m=>m.krok);
  const ikona={spelnia:CircleCheck,nie_spelnia:CircleX,do_sprawdzenia:CircleHelp};
  const etykieta={spelnia:t("spelnia"),nie_spelnia:t("nieSpelnia"),do_sprawdzenia:t("doSprawdzenia")};
  const kolor={spelnia:"text-ok",nie_spelnia:"text-primary",do_sprawdzenia:"text-warn"};
  return <div className="min-w-0 space-y-6 break-words">
    <section aria-labelledby="plan-skrot-h" className="karta space-y-5 p-5 sm:p-6">
      <div className="space-y-2"><h2 id="plan-skrot-h" className="text-2xl font-bold">{plan.karta_uslugi.nazwa}</h2><p className="text-lg leading-relaxed">{krotko(plan.karta_uslugi.cel)}</p></div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-soft p-4"><dt className="text-sm font-semibold text-muted">{t("uxKosztCalkowity")}</dt><dd className="mt-1 text-2xl font-bold tabular-nums">{zl(dane.razem)} zł</dd></div>
        <div className="rounded-xl bg-soft p-4"><dt className="text-sm font-semibold text-muted">{t("uxKosztOsoba")}</dt><dd className="mt-1 text-2xl font-bold tabular-nums">{profil.odbiorcy>0 ? `${zl(dane.razem/profil.odbiorcy)} zł` : t("uxBrakLiczby")}</dd></div>
        <div className="rounded-xl bg-soft p-4"><dt className="text-sm font-semibold text-muted">{t("uxLiczbaOdbiorcow")}</dt><dd className="mt-1 text-2xl font-bold tabular-nums">{t("odbiorcow",{n:profil.odbiorcy})}</dd></div>
      </dl>
      <p className="text-sm text-muted">{t("uxKosztySzacunek")} {t("limit",{kwota:zl(dane.limit)})}</p>
      {(dane.przekroczony || niespelnione.length>0 || doSprawdzenia.length>0) && <div className="space-y-3 rounded-xl border-2 border-warn p-4">
        <h3 className="flex items-center gap-2 text-lg font-bold"><CircleAlert aria-hidden className="size-5 shrink-0"/>{t("uxUwagaPrzedStartem")}</h3>
        {dane.przekroczony && <p className="font-bold text-primary">{t("przekroczony")}</p>}
        {niespelnione.length>0 && <div><p className="font-bold text-primary">{t("uxWarunkiNiespelnione",{n:niespelnione.length})}</p><ul className="mt-1 list-disc space-y-1 pl-5">{niespelnione.map(k=><li key={k.id}>{k.warunek}</li>)}</ul></div>}
        {doSprawdzenia.length>0 && <p>{t("uxWarunkiSprawdz",{n:doSprawdzenia.length})}</p>}
        {termin && <p className="text-sm font-semibold">{termin.uwaga}</p>}
        <a href="#plan-grant" className="inline-flex min-h-12 items-center font-semibold underline">{t("uxZobaczWarunki")}</a>
      </div>}
    </section>
    {pierwsze.length>0 && <section aria-labelledby="plan-start-h" className="space-y-3 print:hidden">
      <h2 id="plan-start-h" className="text-2xl font-bold">{t("uxZacznijOd")}</h2>
      <ol className="list-decimal space-y-2 pl-6 text-lg">{pierwsze.slice(0,3).map((k,i)=><li key={i}>{krotko(k)}</li>)}</ol>
      <a href="#plan-realizacja" className="inline-flex min-h-12 items-center font-semibold underline">{t("uxWszystkieKroki")}</a>
    </section>}
    <p className="text-sm text-muted nie-drukuj">{t("uxSzczegolyOpis")}</p>
    <Szczegoly id="plan-usluga" tytul={t("uxGrupaUsluga")} opis={t("uxOpisUsluga")}>
      <Sekcja tytul={t("sekcjaKarta")}>
        <dl className="space-y-2">
          <div><dt className="text-sm font-bold uppercase text-muted">{t("uxNazwaUslugi")}</dt><dd className="font-bold">{plan.karta_uslugi.nazwa}</dd></div>
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
    </Szczegoly>
    <Szczegoly id="plan-realizacja" tytul={t("uxGrupaRealizacja")} opis={t("uxOpisRealizacja")}>
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
      {plan.pierwsze_kroki && plan.pierwsze_kroki.length>0 && <Sekcja tytul={t("pierwszeKroki")}><ol className="list-decimal space-y-2 pl-6">{plan.pierwsze_kroki.map((k,i)=><li key={i}>{k}</li>)}</ol></Sekcja>}
      <Sekcja tytul={t("sekcjaHarmonogram")}>
        <ol className="space-y-4">
          {plan.harmonogram.map((h,i)=><li key={i} className="space-y-2 rounded-xl bg-soft p-4">
            <h4 className="text-lg font-bold">{h.etap}</h4>
            <p className="font-semibold">{h.okres}</p>
            <p>{h.dzialania}</p>
          </li>)}
        </ol>
      </Sekcja>
    </Szczegoly>
    <Szczegoly id="plan-koszty" tytul={t("uxGrupaKoszty")} opis={t("uxOpisKoszty")}>
      <Sekcja tytul={t("sekcjaBudzet")}>
        <p className="text-muted">{plan.budzet.zalozenia}</p>
        {[[t("stale"),stale],[t("zmienne"),zmienne]].map(([nazwa,pozycje])=><div key={nazwa as string} className="space-y-2">
          <h4 className="font-bold">{nazwa as string}</h4>
          <ul className="divide-y divide-line-soft">{(pozycje as typeof stale).map((p,i)=><li key={i} className="space-y-1 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><strong>{p.nazwa}</strong><span className="font-bold tabular-nums">{zl(p.kwota_zl)} zł</span></div>
            {p.uwagi && <p className="text-sm text-muted">{p.uwagi}</p>}
          </li>)}</ul>
        </div>)}
        <p className="flex flex-wrap justify-between gap-2 border-t-2 border-fg pt-3 text-xl font-bold"><span>{t("razem")}</span><span>{zl(dane.razem)} zł</span></p>
        <p className="text-sm text-muted">{t("limit",{kwota:zl(dane.limit)})}</p>
        {profil.odbiorcy>0 && <p className="font-bold">{t("kosztNaOdbiorce",{kwota:zl(dane.razem/profil.odbiorcy)})}</p>}
      </Sekcja>
      {plan.warianty && plan.warianty.length > 0 && (
        <Sekcja tytul={t("sekcjaWarianty")}>
          <p className="text-muted">{t("wariantyOpis")}</p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {plan.warianty.map((w) => (
              <li key={w.wariant} className={`karta-mala space-y-2 border-2 p-4 ${w.wariant === "pelny" ? "border-fg" : "border-line-soft"}`}>
                <h4 className="text-xl font-bold">{t(`wariant_${w.wariant}`)}</h4>
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
      <Sekcja tytul={t("sekcjaFinansowanie")}>
        <ul className="space-y-3">{plan.finansowanie.map((f) => <li key={f.zrodlo}><strong>{f.zrodlo}</strong><span className="block text-muted">{f.opis}</span></li>)}</ul>
      </Sekcja>
    </Szczegoly>
    <Szczegoly id="plan-grant" tytul={t("uxGrupaGrant")} opis={t("uxOpisGrant")}>
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
    </Szczegoly>
    <Szczegoly id="plan-efekty" tytul={t("uxGrupaEfekty")} opis={t("uxOpisEfekty")}>
      <Sekcja tytul={t("sekcjaWskazniki")}>
        <ul className="space-y-3">{plan.wskazniki.map((w,i)=><li key={i} className="space-y-1 rounded-xl bg-soft p-4">
          <h4 className="font-bold">{w.nazwa}</h4>
          <dl className="space-y-1">
            <div className="flex flex-wrap gap-x-2"><dt className="text-muted">{t("typWsk")}:</dt><dd>{t(`uxTyp_${w.typ}`)}</dd></div>
            <div className="flex flex-wrap gap-x-2"><dt className="text-muted">{t("wartosc")}:</dt><dd className="font-semibold">{w.wartosc_docelowa}</dd></div>
          </dl>
        </li>)}</ul>
      </Sekcja>
      <Sekcja tytul={t("sekcjaRyzyka")}>
        <ul className="space-y-3">{plan.ryzyka.map((r) => <li key={r.ryzyko}><strong>{r.ryzyko}</strong><span className="block text-muted">{r.dzialanie}</span></li>)}</ul>
      </Sekcja>
      {inn && (
        <Sekcja tytul={t("sekcjaPakiet")}>
          <p className="text-muted">{t("pakietOpis")}</p>
          <h4 className="text-xl font-bold">{t("materialy")}</h4>
          <ul className="space-y-1 text-lg">
            {[...inn.film.map((u) => [u, t("film")]), ...inn.folderPdf.map((u) => [u, t("folder")]), ...inn.materialyZip.map((u) => [u, t("zip")]), [inn.url, t("kartaRops")]].filter(([u]) => u).map(([u, e]) => (
              <li key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 underline"><ExternalLink aria-hidden className="size-5 shrink-0" />{e}<span className="sr-only"> {t("nowaKarta")}</span></a></li>
            ))}
            <li><Link href="/rynek" className="inline-flex min-h-12 items-center underline">{t("kontaktHub")}</Link></li>
          </ul>
        </Sekcja>
      )}
    </Szczegoly>
    <section className="karta space-y-3 p-5 sm:p-6"><h2 className="text-2xl font-bold">{t("sekcjaAutor")}</h2>
      <p>{plan.kontakt_z_autorem}</p>
      {inn && <Button asChild wariant="obrys" className="nie-drukuj"><Link href={`/wiedza/biblioteka/${inn.id}`}>{inn.nazwa}</Link></Button>}
    </section>
    {konsultacja}
  </div>;
}
