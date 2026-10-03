"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Wybor } from "@/components/ui/wybor";
import type { Lider } from "@/lib/siec";
import type { Sektor } from "@/lib/siec-stale";

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
const NA_STRONE = 12;

function Kontakt({ lider, zamknij }: { lider: Lider; zamknij: () => void }) {
  const t = useTranslations("siec");
  const [tresc, setTresc] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [wynik, setWynik] = React.useState<{ ok: boolean; tekst: string } | null>(null);
  const [pracuje, setPracuje] = React.useState(false);
  const id = `k-${lider.id}`;
  return (
    <form
      className="space-y-3 border-t-2 border-line-soft pt-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setPracuje(true);
        const r = await fetch("/api/siec/kontakt", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ liderId: lider.id, tresc, email }) }).catch(() => null);
        const d = r ? await r.json().catch(() => ({})) : {};
        setPracuje(false);
        setWynik(r?.ok ? { ok: true, tekst: t("wyslano", { numer: d.numer }) } : { ok: false, tekst: d.komunikat ?? t("blad") });
      }}
    >
      <p className="text-sm text-muted">{t("kontaktOpis")}</p>
      {wynik?.ok ? (
        <p role="status" className="font-semibold text-ok">{wynik.tekst} <Link href="/moje" className="underline">{t("mojeLink")}</Link></p>
      ) : (
        <>
          <div className="space-y-1">
            <label htmlFor={`${id}-t`} className="block font-bold">{t("kontaktTresc")}</label>
            <textarea id={`${id}-t`} required minLength={10} rows={3} value={tresc} onChange={(e) => setTresc(e.target.value.slice(0, 1200))} className="block w-full rounded-xl border-2 border-line bg-card p-3 hover:border-fg" />
          </div>
          <div className="space-y-1">
            <label htmlFor={`${id}-e`} className="block font-bold">{t("kontaktEmail")}</label>
            <input id={`${id}-e`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block min-h-12 w-full rounded-xl border-2 border-line bg-card px-3 hover:border-fg" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pracuje || tresc.trim().length < 10}><Send aria-hidden className="size-5" />{t("wyslij")}</Button>
            <Button type="button" wariant="obrys" onClick={zamknij}>{t("anuluj")}</Button>
          </div>
          {wynik && <p role="alert" className="font-semibold text-primary">{wynik.tekst}</p>}
        </>
      )}
    </form>
  );
}

/** Lista liderów z filtrami: sektor (poczwórna helisa), obszar, nazwa. Kontakt zawsze przez Hub. */
export function ListaLiderow({ liderzy, obszary }: { liderzy: Lider[]; obszary: [string, string][] }) {
  const t = useTranslations("siec");
  const [sektor, setSektor] = React.useState<"" | Sektor>("");
  const [obszar, setObszar] = React.useState("");
  const [fraza, setFraza] = React.useState("");
  const [ile, setIle] = React.useState(NA_STRONE);
  const [otwarty, setOtwarty] = React.useState<string | null>(null);
  const nazwyObszarow = new Map(obszary);

  const wyniki = React.useMemo(() => {
    const f = fold(fraza.trim());
    return liderzy.filter((l) => (!sektor || l.sektor === sektor) && (!obszar || l.obszary.includes(obszar as never)) && (!f || fold(`${l.nazwa} ${l.innowacje.map((i) => i.nazwa).join(" ")}`).includes(f)));
  }, [liderzy, sektor, obszar, fraza]);

  const sektory = (["ngo", "samorzad", "nauka", "biznes", "es", "grupa"] as const).filter((s) => liderzy.some((l) => l.sektor === s));

  return (
    <div className="space-y-6">
      <div className="karta space-y-5 p-5 sm:p-6">
        <h2 className="text-2xl font-bold">{t("filtry")}</h2>
        <div className="space-y-1">
          <label htmlFor="siec-szukaj" className="block text-lg font-bold">{t("szukaj")}</label>
          <div className="relative max-w-xl">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input id="siec-szukaj" type="search" value={fraza} onChange={(e) => { setFraza(e.target.value); setIle(NA_STRONE); }} autoComplete="off" className="block min-h-12 w-full rounded-xl border-2 border-line bg-card pl-12 pr-4 text-lg hover:border-fg" />
          </div>
        </div>
        <Wybor nazwa="siec-sektor" legenda={t("sektorLegenda")} opcje={[["", t("wszystkie")], ...sektory.map((s): [string, string] => [s, t(`sektor_${s}`)])]} wartosc={sektor} zmien={(v) => { setSektor(v as "" | Sektor); setIle(NA_STRONE); }} />
        <Wybor nazwa="siec-obszar" legenda={t("obszarLegenda")} opcje={[["", t("wszystkie")], ...obszary]} wartosc={obszar} zmien={(v) => { setObszar(v); setIle(NA_STRONE); }} />
      </div>

      <p role="status" className="font-semibold text-muted">{t("wynikow", { n: wyniki.length })}</p>
      {wyniki.length === 0 ? (
        <p className="karta-mala p-6 text-lg">{t("brak")}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wyniki.slice(0, ile).map((l) => (
            <li key={l.id} id={l.id} className="karta flex flex-col gap-3 p-5">
              <p className="flex flex-wrap gap-2">
                <Chip>{t(`sektor_${l.sektor}`)}</Chip>
                <Chip>{l.powiat ? l.powiat.replace("powiat ", "") : t("malopolska")}</Chip>
                {l.zrodlo === "biblioteka" && <Chip className="bg-accent text-accent-fg">{t("zBiblioteki")}</Chip>}
              </p>
              <h3 className="font-display text-xl font-bold leading-snug">{l.nazwa}</h3>
              {l.obszary.length > 0 && <p className="text-sm text-muted">{l.obszary.map((o) => nazwyObszarow.get(o) ?? o).join(" · ")}</p>}
              {l.oferuje && <p><strong>{t("oferuje")}:</strong> {l.oferuje}</p>}
              {l.szuka && <p><strong>{t("szukaJ")}:</strong> {l.szuka}</p>}
              {l.innowacje.length > 0 && (
                <div>
                  <p className="font-bold">{t("innowacjeAutora")}</p>
                  <ul className="list-disc pl-5">{l.innowacje.slice(0, 4).map((i) => <li key={i.id}><Link href={`/wiedza/biblioteka/${i.id}`} className="underline">{i.nazwa}</Link></li>)}</ul>
                </div>
              )}
              <div className="mt-auto">
                {otwarty === l.id ? (
                  <Kontakt lider={l} zamknij={() => setOtwarty(null)} />
                ) : (
                  <Button type="button" wariant="obrys" onClick={() => setOtwarty(l.id)}><Send aria-hidden className="size-5" />{t("kontakt")}<span className="sr-only">: {l.nazwa}</span></Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {wyniki.length > ile && <Button type="button" wariant="obrys" onClick={() => setIle((n) => n + NA_STRONE)}>{t("pokazWiecej", { n: wyniki.length - ile })}</Button>}
    </div>
  );
}
