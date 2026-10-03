"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, Loader2, Printer, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Postep } from "@/components/ui/postep";

type Nabor = { id: string; nazwa: string; temat: string | null; przyklad: boolean; otwarty_do: string | null; schemat: { limity: string } } | null;
type Pole = { nr: number; pole: string; podpowiedz: string; limit: number | null; tresc: string; doUzupelnienia: boolean };
type Ocena = { kryteria: { id: string; nazwa: string; max: number; prog: number | null; punkty: number; ok: boolean; uzasadnienie: string; wskazowka: string }[]; suma: number; maxSuma: number; braki: string[] };

export function Wniosek({ dane }: { dane: string }) {
  const t = useTranslations("pracownia");
  const [wszystkie, setWszystkie] = React.useState<NonNullable<Nabor>[]>([]);
  const [wybrany, setWybrany] = React.useState<string | null>(null);
  const [ladowanie, setLadowanie] = React.useState(true);
  const [pola, setPola] = React.useState<Pole[] | null>(null);
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad" | "zlozony">("");
  const [numer, setNumer] = React.useState<string | null>(null);
  const [ocena, setOcena] = React.useState<Ocena | null>(null);
  const [ocenianie, setOcenianie] = React.useState(false);

  React.useEffect(() => {
    let ok = true;
    fetch("/api/nabory/aktywny").then((r) => r.json()).then((d) => { if (ok) { setWszystkie(d.nabory ?? []); setLadowanie(false); } }).catch(() => ok && setLadowanie(false));
    return () => { ok = false; };
  }, []);

  if (ladowanie) return null;
  const nabor: Nabor = wszystkie.find((n) => n.id === wybrany) ?? wszystkie[0] ?? null;
  if (!nabor) {
    return (
      <section className="karta-mala space-y-1 border-dashed p-5" aria-labelledby="h-wn">
        <h2 id="h-wn" className="text-xl font-bold">{t("wniosek")}</h2>
        <p className="text-muted">{t("wniosekBrak")}</p>
        <Button type="button" disabled className="mt-2">{t("przygotujWniosek")}</Button>
      </section>
    );
  }

  return (
    <section className="karta space-y-4 p-6" aria-labelledby="h-wn">
      <h2 id="h-wn" className="text-2xl font-bold">{t("wniosek")}</h2>
      {wszystkie.length > 1 && !pola && (
        <fieldset className="space-y-2">
          <legend className="text-lg font-bold">{t("wybierzNabor")}</legend>
          {wszystkie.map((n) => (
            <label key={n.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
              <input type="radio" name="nabor" checked={nabor.id === n.id} onChange={() => setWybrany(n.id)} className="size-4 accent-current" />
              <span>{n.nazwa}{n.otwarty_do ? ` (do ${new Date(n.otwarty_do).toLocaleDateString("pl-PL")})` : ""}</span>
            </label>
          ))}
        </fieldset>
      )}
      <p className="text-lg"><strong>{t("wniosekOtwarty", { nazwa: nabor.nazwa })}</strong>{nabor.przyklad && <span className="block text-sm text-muted">{t("wniosekPrzykład")}</span>}</p>
      {nabor.schemat.limity && <p className="text-muted">{t("limityNaboru")}: {nabor.schemat.limity}</p>}
      {!pola && (
        <Button type="button" rozmiar="lg" disabled={stan === "pracuje"} onClick={async () => {
          setStan("pracuje");
          const r = await fetch("/api/pracownia/wniosek", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ naborId: nabor.id, dane }) });
          if (!r.ok) return setStan("blad");
          setPola((await r.json()).pola);
          setStan("");
        }}>
          {stan === "pracuje" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <FileText aria-hidden className="size-5" />}
          {t("przygotujWniosek")}
        </Button>
      )}
      <div>
        {stan === "pracuje" && <Postep kroki={t("wniosekPostepKroki")} sekund={30} />}
        {stan === "blad" && <p role="alert" className="font-semibold text-primary">{t("wniosekBlad")}</p>}
      </div>
      {pola && (
        <div className="space-y-5">
          <p className="karta-mala border-2 border-accent p-3">{t("wniosekPomoc")}</p>
          {pola.map((p) => (
            <div key={p.nr} className="space-y-1">
              <label htmlFor={`w-${p.nr}`} className="block text-lg font-bold">{p.nr}. {p.pole}{p.doUzupelnienia && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-sm text-accent-fg">{t("doUzup")}</span>}</label>
              <p className="text-sm text-muted">{p.podpowiedz}</p>
              <textarea id={`w-${p.nr}`} rows={4} value={p.tresc} onChange={(e) => setPola((l) => l && l.map((x) => (x.nr === p.nr ? { ...x, tresc: e.target.value } : x)))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg" />
              <p className={`text-right text-xs ${p.limit && p.tresc.length > p.limit ? "font-bold text-primary" : "text-muted"}`}>{p.limit ? t("znakiLimit", { n: p.tresc.length, limit: p.limit }) : t("znaki", { n: p.tresc.length })}</p>
            </div>
          ))}
          <div className="nie-drukuj flex flex-wrap gap-3">
            {stan === "zlozony" ? (
              <div role="status" className="space-y-2">
                <p className="font-bold text-ok">{t("zlozony")}</p>
                {numer && <p>{t("numerSprawy")}: <strong className="font-mono text-xl">{numer}</strong> · <Link href={`/moje/${numer}`}>{t("sprawdzStatus")}</Link></p>}
              </div>
            ) : (
              <>
                <Button type="button" wariant="zloty" disabled={ocenianie} onClick={async () => {
                  setOcenianie(true);
                  const r = await fetch("/api/pracownia/wniosek", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ naborId: nabor.id, pola: pola.map((x) => ({ nr: x.nr, tresc: x.tresc })) }) });
                  setOcenianie(false);
                  if (r.ok) setOcena(await r.json()); else setStan("blad");
                }}>
                  {ocenianie ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}
                  {ocenianie ? t("oceniamWniosek") : t("sprawdzWniosek")}
                </Button>
                <Button type="button" onClick={async () => {
                  const r = await fetch("/api/pracownia/wniosek", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ naborId: nabor.id, pola: pola.map((x) => ({ nr: x.nr, tresc: x.tresc })) }) });
                  if (r.ok) setNumer((await r.json()).numer ?? null);
                  setStan(r.ok ? "zlozony" : "blad");
                }}>{t("zlozWniosek")}</Button>
              </>
            )}
            <Button type="button" wariant="obrys" onClick={() => window.print()}><Printer aria-hidden className="size-5" />{t("drukujWniosek")}</Button>
          </div>
          {ocena && (
            <section className="karta-mala space-y-3 p-5" aria-labelledby="h-ocena-wn" aria-live="polite">
              <h3 id="h-ocena-wn" className="text-xl font-bold">{t("ocenaWniosku")}: {ocena.suma}/{ocena.maxSuma}</h3>
              <p className="text-sm text-muted">{t("ocenaWnioskuInfo")}</p>
              <ul className="space-y-3">
                {ocena.kryteria.map((k) => (
                  <li key={k.id}>
                    <p className="font-bold">{k.nazwa}: <span className={k.ok ? "text-ok" : "text-primary"}>{k.punkty}/{k.max}</span>{k.prog !== null && <span className="text-sm font-normal text-muted"> ({t("prog", { prog: k.prog })})</span>}</p>
                    <p>{k.uzasadnienie}</p>
                    <p className="text-muted"><strong className="text-fg">{t("wskazowka")}:</strong> {k.wskazowka}</p>
                  </li>
                ))}
              </ul>
              {ocena.braki.length > 0 && <p><strong>{t("doUzup")}:</strong> {ocena.braki.join("; ")}</p>}
            </section>
          )}
        </div>
      )}
    </section>
  );
}
