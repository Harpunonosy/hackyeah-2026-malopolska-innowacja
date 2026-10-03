"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileSearch, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Postep } from "@/components/ui/postep";
import { Wybor } from "@/components/ui/wybor";

type Propozycja = { tekst: string; obszar: string | null; strona: number | null; wybrany: boolean };
const pole = "block min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg";

/** Szybka aktualizacja Skarbnicy: AI wyciąga fakty z fragmentu raportu, pracownik ROPS poprawia i publikuje. */
export function FaktyRaportow({ obszary, dodane }: { obszary: [string, string][]; dodane: { id: number; tekst: string; zrodlo: string; strona: number | null }[] }) {
  const t = useTranslations("faktyCentrala");
  const router = useRouter();
  const [zrodlo, setZrodlo] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [tekst, setTekst] = React.useState("");
  const [propozycje, setPropozycje] = React.useState<Propozycja[]>([]);
  const [stan, setStan] = React.useState<"" | "pracuje" | "publikuje">("");
  const [info, setInfo] = React.useState("");
  const naglowek = React.useRef<HTMLHeadingElement>(null);

  async function wyciagnij(e: React.FormEvent) {
    e.preventDefault();
    setStan("pracuje");
    setInfo("");
    const r = await fetch("/api/admin/fakty/wyciagnij", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tekst }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setStan("");
    if (!r?.ok) return setInfo(d.komunikat ?? t("blad"));
    setPropozycje((d.fakty as Omit<Propozycja, "wybrany">[]).map((f) => ({ ...f, wybrany: true })));
    requestAnimationFrame(() => naglowek.current?.focus());
  }

  async function publikuj() {
    setStan("publikuje");
    const wybrane = propozycje.filter((p) => p.wybrany).map(({ tekst, obszar, strona }) => ({ tekst, obszar, strona }));
    const r = await fetch("/api/admin/fakty", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ zrodlo, url, fakty: wybrane }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setStan("");
    if (!r?.ok) return setInfo(d.komunikat ?? t("blad"));
    setInfo(t("opublikowano", { n: d.liczba }));
    setPropozycje([]);
    setTekst("");
    router.refresh();
  }

  const zmien = (i: number, z: Partial<Propozycja>) => setPropozycje((l) => l.map((p, j) => (j === i ? { ...p, ...z } : p)));
  const ileWybranych = propozycje.filter((p) => p.wybrany).length;

  return (
    <div className="space-y-5">
      <form onSubmit={wyciagnij} className="karta max-w-4xl space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="fk-zrodlo" className="block text-lg font-bold">{t("zrodlo")}</label>
            <input id="fk-zrodlo" required value={zrodlo} onChange={(e) => setZrodlo(e.target.value.slice(0, 200))} placeholder={t("zrodloPrzyklad")} className={pole} />
          </div>
          <div className="space-y-1">
            <label htmlFor="fk-url" className="block text-lg font-bold">{t("url")}</label>
            <input id="fk-url" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value.slice(0, 500))} className={pole} />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="fk-tekst" className="block text-lg font-bold">{t("tekst")}</label>
          <textarea id="fk-tekst" required minLength={80} rows={8} value={tekst} onChange={(e) => setTekst(e.target.value.slice(0, 20_000))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg" />
        </div>
        <Button type="submit" disabled={stan !== "" || tekst.trim().length < 80 || zrodlo.trim().length < 3}><FileSearch aria-hidden className="size-5" />{t("wyciagnij")}</Button>
        {stan === "pracuje" && <Postep kroki={t("pracuje")} sekund={15} />}
        <p role="status" className="font-semibold">{info}</p>
      </form>

      {propozycje.length > 0 && (
        <section aria-labelledby="fk-prop" className="karta max-w-4xl space-y-4 p-5">
          <h3 id="fk-prop" ref={naglowek} tabIndex={-1} className="text-2xl font-bold outline-none">{t("propozycje")}</h3>
          <p className="text-muted">{t("propozycjeOpis")} {t("aiOznaczenie")}</p>
          <ol className="space-y-4">
            {propozycje.map((p, i) => (
              <li key={i} className="karta-mala space-y-2 p-4">
                <label className="flex min-h-12 cursor-pointer items-center gap-3 font-bold">
                  <input type="checkbox" className="size-5" checked={p.wybrany} onChange={(e) => zmien(i, { wybrany: e.target.checked })} />
                  {t("fakt", { n: i + 1 })}
                </label>
                <label htmlFor={`fk-t-${i}`} className="sr-only">{t("fakt", { n: i + 1 })}</label>
                <textarea id={`fk-t-${i}`} rows={2} value={p.tekst} onChange={(e) => zmien(i, { tekst: e.target.value.slice(0, 500) })} className="block w-full rounded-xl border-2 border-line bg-card p-3 hover:border-fg" />
                <div className="space-y-3">
                  <Wybor nazwa={`fk-o-${i}`} malaLegenda legenda={t("obszar")} opcje={[["", t("bezObszaru")], ...obszary]} wartosc={p.obszar ?? ""} zmien={(v) => zmien(i, { obszar: v || null })} />
                  <div className="space-y-1">
                    <label htmlFor={`fk-s-${i}`} className="block text-sm font-bold">{t("strona")}</label>
                    <input id={`fk-s-${i}`} inputMode="numeric" value={p.strona ?? ""} onChange={(e) => zmien(i, { strona: e.target.value ? Number(e.target.value.replace(/\D/g, "")) || null : null })} className="block min-h-12 w-24 rounded-xl border-2 border-line bg-card px-3 hover:border-fg" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <Button type="button" disabled={stan !== "" || ileWybranych === 0} onClick={publikuj}><Upload aria-hidden className="size-5" />{t("publikuj", { n: ileWybranych })}</Button>
        </section>
      )}

      <details className="karta-mala max-w-4xl px-5 py-3">
        <summary className="min-h-12 cursor-pointer content-center text-lg font-bold">{t("dodane", { n: dodane.length })}</summary>
        {dodane.length === 0 ? <p className="py-2">{t("brakDodanych")}</p> : (
          <ul className="space-y-2 py-2">
            {dodane.map((f) => (
              <li key={f.id} className="flex flex-wrap items-start justify-between gap-2 border-t border-line-soft pt-2">
                <span className="max-w-3xl">{f.tekst} <span className="text-sm text-muted">({f.zrodlo}{f.strona ? `, s. ${f.strona}` : ""})</span></span>
                <Button type="button" wariant="obrys" onClick={async () => { await fetch(`/api/admin/fakty?id=${f.id}`, { method: "DELETE" }); router.refresh(); }}>{t("usun")}<span className="sr-only">: {f.tekst.slice(0, 40)}</span></Button>
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}
