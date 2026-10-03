"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Search } from "lucide-react";
import { Mikrofon } from "@/components/a11y/mikrofon";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { KartaInnowacji } from "@/components/swatka/karta";
import type { WynikSwatki } from "@/lib/swatka";
import { TELEFONY_KRYZYSOWE } from "@/lib/kryzys";
import { Phone } from "lucide-react";
import { WyslijZgloszenie } from "@/components/swatka/wyslij-zgloszenie";

const MAX = 1500;
const POWIATY = [
  "bocheński", "brzeski", "chrzanowski", "dąbrowski", "gorlicki", "krakowski", "limanowski", "miechowski",
  "myślenicki", "nowosądecki", "nowotarski", "olkuski", "oświęcimski", "proszowicki", "suski", "tarnowski",
  "tatrzański", "wadowicki", "wielicki", "m. Kraków", "m. Nowy Sącz", "m. Tarnów",
];
const PRZYKLADY = [
  "Od kiedy zmarł mąż, rzadko wychodzę z domu i gubię się w lekach.",
  "Opiekuję się chorą mamą, która wróciła ze szpitala. Nie daję rady.",
  "Mój syn zamknął się w sobie i całe dni siedzi przy komputerze.",
  "głusi alarm pożarowy",
];

type Stan = { typ: "start" } | { typ: "laduje" } | { typ: "wynik"; wynik: WynikSwatki } | { typ: "blad"; komunikat: string };

export function FormularzSwatki() {
  const t = useTranslations("swatka");
  const jezyk = useLocale();
  const [tekst, setTekst] = React.useState("");
  const [rola, setRola] = React.useState<"mieszkaniec" | "instytucja">("mieszkaniec");
  const [powiat, setPowiat] = React.useState("");
  const [stan, setStan] = React.useState<Stan>({ typ: "start" });
  const naglowekWynikow = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (stan.typ === "wynik") naglowekWynikow.current?.focus();
  }, [stan]);

  async function wyslij(e: React.FormEvent) {
    e.preventDefault();
    if (tekst.trim().length < 3) return;
    setStan({ typ: "laduje" });
    try {
      const odp = await fetch("/api/swatka/dopasuj", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tekst, rola, powiat: powiat || undefined, jezyk }),
      });
      if (odp.status === 429) return setStan({ typ: "blad", komunikat: t("zaDuzo") });
      const dane = await odp.json();
      if (!odp.ok) return setStan({ typ: "blad", komunikat: dane.komunikat ?? t("blad") });
      setStan({ typ: "wynik", wynik: dane as WynikSwatki });
    } catch {
      setStan({ typ: "blad", komunikat: t("blad") });
    }
  }

  const laduje = stan.typ === "laduje";

  return (
    <div className="space-y-8">
      <form onSubmit={wyslij} className="space-y-6" aria-describedby="swatka-uwaga">
        <div className="space-y-2">
          <label htmlFor="opis" className="block text-xl font-bold">
            {t("poleEtykieta")}
          </label>
          <p id="swatka-uwaga" className="text-muted">
            {t("podpowiedz")} <strong>{t("uwagaDane")}</strong>
          </p>
          <textarea
            id="opis"
            name="opis"
            value={tekst}
            onChange={(e) => setTekst(e.target.value.slice(0, MAX))}
            rows={6}
            placeholder={t("polePlaceholder")}
            className="block w-full rounded-xl border-2 border-fg bg-card p-4 text-lg"
          />
          <div className="zaawansowane flex justify-end text-sm text-muted" aria-hidden="true">
            {t("licznik", { ile: tekst.length, max: MAX })}
          </div>
        </div>

        <Mikrofon jezyk={jezyk} onZdanie={(z) => setTekst((p) => (p ? `${p} ${z}` : z).slice(0, MAX))} />

        <div className="space-y-2">
          <p className="text-base font-semibold">{t("przyklady")}</p>
          <ul className="flex flex-wrap gap-2">
            {PRZYKLADY.map((p) => (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => setTekst(p)}
                  className="min-h-12 rounded-full border-2 border-line bg-card px-4 text-left hover:border-fg"
                >
                  {p}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xl font-bold">{t("kimJestem")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["mieszkaniec", "instytucja"] as const).map((r) => (
              <label
                key={r}
                className="flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border-2 border-line bg-card p-4 has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg has-[:focus-visible]:outline-3"
              >
                <input type="radio" name="rola" value={r} checked={rola === r} onChange={() => setRola(r)} className="mt-1.5 size-5 accent-current" />
                <span>
                  <span className="block font-bold">{t(r === "mieszkaniec" ? "rolaMieszkaniec" : "rolaInstytucja")}</span>
                  <span className="block text-sm">{t(r === "mieszkaniec" ? "rolaMieszkaniecOpis" : "rolaInstytucjaOpis")}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="zaawansowane space-y-2">
          <label htmlFor="powiat" className="block text-lg font-bold">
            {t("powiat")}
          </label>
          <input
            id="powiat"
            list="powiaty"
            value={powiat}
            onChange={(e) => setPowiat(e.target.value)}
            placeholder={t("powiatPodpowiedz")}
            autoComplete="off"
            className="block min-h-12 w-full max-w-sm rounded-xl border-2 border-fg bg-card px-4 text-lg"
          />
          <datalist id="powiaty">
            {POWIATY.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        <Button type="submit" rozmiar="lg" disabled={laduje || tekst.trim().length < 3}>
          {laduje ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Search aria-hidden className="size-5" />}
          {t("szukaj")}
        </Button>
      </form>

      <div aria-live="polite" className="space-y-6">
        {laduje && <p className="rounded-xl border-2 border-line bg-card p-4 text-lg">{t("szukam")}</p>}
        {stan.typ === "blad" && (
          <p role="alert" className="rounded-xl border-2 border-primary bg-card p-4 text-lg font-semibold">
            {stan.komunikat}
          </p>
        )}
      </div>

      {stan.typ === "wynik" && (
        <>
          <Wyniki wynik={stan.wynik} naglowek={naglowekWynikow} />
          <WyslijZgloszenie tekst={tekst} rola={rola} powiat={powiat} wynik={stan.wynik} />
        </>
      )}
    </div>
  );
}

function Wyniki({ wynik, naglowek }: { wynik: WynikSwatki; naglowek: React.RefObject<HTMLHeadingElement | null> }) {
  const t = useTranslations("swatka");
  const tk = useTranslations("kryzys");
  const z = wynik.zrozumiano;
  const telefony = TELEFONY_KRYZYSOWE.filter((x) => wynik.kryzys && (x.rodzaje as readonly string[]).includes(wynik.kryzys));

  return (
    <section aria-labelledby="wyniki-naglowek" className="space-y-6 border-t-4 border-fg pt-8">
      {wynik.kryzys && (
        <div role="alert" className="space-y-3 rounded-2xl border-4 border-primary bg-card p-5">
          <h2 className="text-2xl font-bold">{wynik.kryzys === "zycie" ? tk("tytulZycie") : tk("tytulPrzemoc")}</h2>
          <p className="text-lg">{tk("opis")}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {telefony.map((x) => (
              <li key={x.numer}>
                <a href={`tel:${x.numer}`} className="flex min-h-14 items-center gap-3 rounded-xl border-2 border-primary bg-primary px-4 py-2 text-primary-fg no-underline">
                  <Phone aria-hidden className="size-6 shrink-0" />
                  <span>
                    <span className="block text-2xl font-bold">{"wyswietl" in x ? x.wyswietl : x.numer}</span>
                    <span className="block text-sm">{x.opis}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 id="wyniki-naglowek" ref={naglowek} tabIndex={-1} className="text-3xl font-bold outline-none">
        {wynik.brakDopasowania ? t("brakTytul") : t("znalezionoN", { ile: wynik.dopasowania.length })}
      </h2>

      {wynik.tryb === "awaryjny" && <p className="rounded-xl border-2 border-warn bg-card p-4 font-medium">{t("trybAwaryjny")}</p>}

      {wynik.tryb === "ai" && (
        <div className="space-y-2 rounded-xl border-2 border-line bg-card p-4">
          <h3 className="font-bold">{t("zrozumialemTak")}</h3>
          <p>
            <strong>{t("obszar")}:</strong> {z.obszarNazwa}. <strong>{t("grupa")}:</strong> {z.grupaDocelowa}.
          </p>
          {z.potrzeby.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label={t("potrzeby")}>
              {z.potrzeby.map((p) => (
                <li key={p}>
                  <Chip>{p}</Chip>
                </li>
              ))}
            </ul>
          )}
          {z.slowaKluczowe.length > 0 && (
            <ul className="zaawansowane flex flex-wrap gap-2 text-sm text-muted">
              {z.slowaKluczowe.map((s) => (
                <li key={s}>#{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {wynik.brakDopasowania && wynik.tryb === "ai" && <p className="text-lg">{t("brakOpis")}</p>}

      {wynik.pytanie && (
        <p className="rounded-xl border-2 border-accent bg-card p-4 text-lg">
          <strong>{t("pytanie")}:</strong> {wynik.pytanie}
        </p>
      )}

      <div className="space-y-5">
        {wynik.dopasowania.map((k) => (
          <KartaInnowacji key={k.id} k={k} />
        ))}
      </div>

      {wynik.najblizsze.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">{t("najblizsze")}</h3>
          {wynik.najblizsze.map((k) => (
            <KartaInnowacji key={k.id} k={k} />
          ))}
        </div>
      )}

      {wynik.fakty.length > 0 && (
        <aside className="zaawansowane space-y-2 rounded-xl border-2 border-line bg-card p-4">
          <h3 className="font-bold">{t("fakty")}</h3>
          <ul className="space-y-2">
            {wynik.fakty.map((f) => (
              <li key={f.tekst}>
                {f.tekst}{" "}
                <span className="text-sm text-muted">({t("zrodlo", { zrodlo: f.zrodlo, strona: f.strona ?? "–" })})</span>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="space-y-1 text-sm text-muted">
        <p>{t("oznaczenieAi")}</p>
        {wynik.zamaskowano.length > 0 && <p>{t("zamaskowano", { rodzaje: wynik.zamaskowano.join(", ") })}</p>}
      </div>
    </section>
  );
}
