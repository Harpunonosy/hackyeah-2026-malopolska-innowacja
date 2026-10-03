"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, CircleX, Loader2, Sparkles } from "lucide-react";
import { Mikrofon } from "@/components/a11y/mikrofon";
import { Button } from "@/components/ui/button";
import { Kanwa, type KanwaStan } from "@/components/pracownia/kanwa";
import { Wniosek } from "@/components/pracownia/wniosek";
import type { WynikAnalizy } from "@/lib/pracownia";

const ETAPY = ["pomysl", "prototyp", "przetestowane", "gotowe"] as const;

export function FormularzPomyslu() {
  const t = useTranslations("pracownia");
  const jezyk = useLocale();
  const [opis, setOpis] = React.useState("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");
  const [wynik, setWynik] = React.useState<WynikAnalizy | null>(null);
  const [fiszka, setFiszka] = React.useState<WynikAnalizy["fiszka"] | null>(null);
  const [kanwa, setKanwa] = React.useState<KanwaStan | null>(null);
  const [numer, setNumer] = React.useState<string | null>(null);
  const [wysylka, setWysylka] = React.useState<"" | "wysylam" | "ok" | "blad">("");

  async function analizuj(e: React.FormEvent) {
    e.preventDefault();
    setStan("pracuje");
    setKomunikat("");
    setWysylka("");
    try {
      const r = await fetch("/api/pracownia/analiza", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ opis }) });
      const d = await r.json();
      if (!r.ok) {
        setKomunikat(d.komunikat ?? t("blad"));
        return setStan("blad");
      }
      setWynik(d);
      setFiszka(d.fiszka);
      setKanwa(d.kanwa);
      setStan("");
    } catch {
      setKomunikat(t("blad"));
      setStan("blad");
    }
  }

  async function wyslij() {
    if (!fiszka || !wynik) return;
    setWysylka("wysylam");
    const r = await fetch("/api/pracownia/fiszka", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kanwa, tytul: fiszka.tytul, opis: fiszka.krotki_opis, istota: fiszka.istota, dla_kogo: fiszka.dla_kogo, etap: fiszka.etap, oceny: wynik.oceny, podobne: wynik.podobne }),
    });
    if (r.ok) setNumer((await r.json()).numer ?? null);
    setWysylka(r.ok ? "ok" : "blad");
  }

  const pole = (id: keyof WynikAnalizy["fiszka"], etykieta: string, wiersze = 2) => (
    <div className="space-y-1">
      <label htmlFor={`f-${id}`} className="block text-lg font-bold">{etykieta}</label>
      <textarea id={`f-${id}`} rows={wiersze} value={fiszka?.[id] ?? ""} onChange={(e) => setFiszka((f) => (f ? { ...f, [id]: e.target.value } : f))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8">
      <form onSubmit={analizuj} className="karta space-y-4 p-6 sm:p-8">
        <label htmlFor="pomysl" className="block text-xl font-bold">{t("poleEtykieta")}</label>
        <textarea id="pomysl" rows={7} value={opis} onChange={(e) => setOpis(e.target.value.slice(0, 2500))} placeholder={t("placeholder")} className="block w-full rounded-xl border-2 border-line bg-card p-4 text-lg hover:border-fg" />
        <div className="flex flex-wrap items-start gap-3">
          <Mikrofon jezyk={jezyk} etykieta={t("powiedz")} onZdanie={(z) => setOpis((p) => (p ? `${p} ${z}` : z).slice(0, 2500))} />
          <Button type="submit" rozmiar="lg" disabled={opis.trim().length < 20 || stan === "pracuje"}>
            {stan === "pracuje" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}
            {t("analizuj")}
          </Button>
        </div>
        <div aria-live="polite">
          {stan === "pracuje" && <p className="text-lg">{t("pracuje")}</p>}
          {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
        </div>
      </form>

      {wynik && fiszka && (
        <div className="space-y-6">
          <p className="text-sm text-muted">{t("oznaczenie")}</p>

          <section className="karta space-y-4 p-6" aria-labelledby="h-fiszka">
            <h2 id="h-fiszka" className="text-2xl font-bold">{t("fiszka")}</h2>
            <p className="text-muted">{t("fiszkaPomoc")}</p>
            {pole("tytul", t("tytulPole"), 1)}
            {pole("krotki_opis", t("opisPole"))}
            {pole("istota", t("istotaPole"), 3)}
            {pole("dla_kogo", t("kogoPole"))}
            <fieldset className="space-y-2">
              <legend className="text-lg font-bold">{t("etapPole")}</legend>
              <div className="flex flex-wrap gap-2">
                {ETAPY.map((e) => (
                  <label key={e} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
                    <input type="radio" name="etap" checked={fiszka.etap === e} onChange={() => setFiszka({ ...fiszka, etap: e })} className="size-4 accent-current" />
                    {t(`etap.${e}`)}
                  </label>
                ))}
              </div>
            </fieldset>
            {wynik.doUzupelnienia.length > 0 && (
              <div className="rounded-xl bg-soft p-4">
                <p className="font-bold">{t("doUzupelnienia")}</p>
                <ul className="list-disc pl-6">{wynik.doUzupelnienia.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            )}
          </section>

          {kanwa && <Kanwa kanwa={kanwa} zmien={setKanwa} etap={fiszka.etap} />}

          <section className="karta space-y-4 p-6" aria-labelledby="h-istnieje">
            <h2 id="h-istnieje" className="text-2xl font-bold">{t("istnieje")}</h2>
            {wynik.podobne.length === 0 ? <p className="text-lg">{t("istniejeBrak")}</p> : (
              <>
                <p className="text-muted">{t("istniejeOpis")}</p>
                <ul className="space-y-3">
                  {wynik.podobne.map((p) => (
                    <li key={p.id} className="karta-mala p-4">
                      <Link href={`/wiedza/biblioteka/${p.id}`} className="font-display text-xl font-bold">{p.nazwa}</Link>
                      <p className="mt-1">{p.roznica}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="karta space-y-4 p-6" aria-labelledby="h-ocena">
            <h2 id="h-ocena" className="text-2xl font-bold">{t("ocena")}</h2>
            <p className="text-muted">{t("ocenaOpis")}</p>
            <p className={`flex items-center gap-2 text-xl font-bold ${wynik.spelniaProgi ? "text-ok" : "text-primary"}`}>
              {wynik.spelniaProgi ? <CircleCheck aria-hidden className="size-6" /> : <CircleX aria-hidden className="size-6" />}
              {t("suma", { suma: wynik.suma })}. {wynik.spelniaProgi ? t("spelniaProgi") : t("niespelniaProgi")}
            </p>
            <ul className="space-y-4">
              {wynik.oceny.map((o) => (
                <li key={o.id} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-bold">{o.nazwa}</p>
                    <p className={`font-bold ${o.ok ? "text-ok" : "text-primary"}`}>{t("pkt", { p: o.punkty })} <span className="text-sm font-normal text-muted">({t("prog", { prog: o.prog })})</span></p>
                  </div>
                  <div aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${o.punkty * 10}%` }} /></div>
                  <p>{o.uzasadnienie}</p>
                  <p className="text-muted"><strong className="text-fg">{t("wskazowka")}:</strong> {o.wskazowka}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="karta space-y-2 p-6" aria-labelledby="h-adw">
              <h2 id="h-adw" className="text-xl font-bold">{t("adwokat")}</h2>
              <ul className="list-disc space-y-2 pl-5">{wynik.adwokat.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
            <section className="karta space-y-2 p-6" aria-labelledby="h-niet">
              <h2 id="h-niet" className="text-xl font-bold">{t("nietuzinkowe")}</h2>
              <ul className="list-disc space-y-2 pl-5">{wynik.nietuzinkowe.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          </div>

          <Wniosek dane={`Tytuł: ${fiszka.tytul}\nOpis: ${fiszka.krotki_opis}\nNa czym polega: ${fiszka.istota}\nDla kogo: ${fiszka.dla_kogo}\nEtap: ${fiszka.etap}\nPodobne w Bibliotece: ${wynik.podobne.map((p) => `${p.nazwa} (${p.roznica})`).join("; ") || "brak"}\nKanwa: wspierają: ${kanwa?.kto_wspiera}; utrudniają: ${kanwa?.kto_utrudnia}; koszty stałe: ${kanwa?.koszty_stale}; zmienne: ${kanwa?.koszty_zmienne}\nDo uzupełnienia: ${wynik.doUzupelnienia.join("; ")}`} />

          <div className="karta flex flex-wrap items-center gap-4 p-6">
            {wysylka === "ok" ? (
              <div role="status" className="space-y-3">
                <p className="text-lg"><strong>{t("wyslano")}.</strong> {t("wyslanoOpis")}</p>
                {numer && (
                  <>
                    <p className="text-lg">{t("numerSprawy")}: <strong className="font-mono text-2xl">{numer}</strong> <span className="text-muted">{t("zachowajNumer")}</span></p>
                    <Button asChild><Link href={`/moje/${numer}`}>{t("sprawdzStatus")}</Link></Button>
                  </>
                )}
              </div>
            ) : (
              <>
                <Button type="button" rozmiar="lg" onClick={wyslij} disabled={wysylka === "wysylam"}>{wysylka === "wysylam" ? t("wysylam") : t("wyslij")}</Button>
                {wysylka === "blad" && <p role="alert" className="font-semibold text-primary">{t("blad2")}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
