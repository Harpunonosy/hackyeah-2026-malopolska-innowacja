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
import { NaglowekStrony } from "@/components/naglowek-strony";
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

function Krok({ n, tytul }: { n: number; tytul: string }) {
  return (
    <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-primary">
      <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-fg">{n}</span>
      {tytul}
    </p>
  );
}

type Stan = { typ: "start" } | { typ: "laduje" } | { typ: "wynik"; wynik: WynikSwatki } | { typ: "blad"; komunikat: string };

export function FormularzSwatki({ poczatkowy = "", auto = false, children }: { poczatkowy?: string; auto?: boolean; children?: React.ReactNode }) {
  const t = useTranslations("swatka");
  const jezyk = useLocale();
  const [tekst, setTekst] = React.useState(poczatkowy);
  const [edycja, setEdycja] = React.useState(false);
  const autoUruchomiono = React.useRef(false);
  const [rola, setRola] = React.useState<"mieszkaniec" | "instytucja">("mieszkaniec");
  const [powiat, setPowiat] = React.useState("");
  const [stan, setStan] = React.useState<Stan>(auto && poczatkowy.trim().length >= 3 ? { typ: "laduje" } : { typ: "start" });
  const naglowekWynikow = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (stan.typ === "wynik") naglowekWynikow.current?.focus();
  }, [stan]);

  React.useEffect(() => {
    if (auto && poczatkowy.trim().length >= 3 && !autoUruchomiono.current) {
      autoUruchomiono.current = true;
      void wyslij();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function wyslij(e?: React.FormEvent) {
    e?.preventDefault();
    if (tekst.trim().length < 3) return;
    setEdycja(false);
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
  const pokazFormularz = stan.typ === "start" || stan.typ === "blad" || edycja;

  const tytul =
    stan.typ === "wynik" && !edycja
      ? stan.wynik.brakDopasowania
        ? t("brakTytul")
        : t("przykladDla", { ile: Math.min(3, stan.wynik.dopasowania.length) })
      : laduje
        ? t("szukamTytul")
        : t("tytul");

  return (
    <div className="space-y-8">
    <div ref={naglowekWynikow} tabIndex={-1} className="outline-none focus-visible:!shadow-none focus-visible:!outline-none">
      <NaglowekStrony tytul={tytul} />
    </div>
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
    <div className="min-w-0 space-y-8">
      {!pokazFormularz && tekst && (
        <div className="karta-mala flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="min-w-0 flex-1"><span className="font-bold">{t("twojOpis")}:</span> <span className="text-muted">{tekst.length > 140 ? tekst.slice(0, 140) + "…" : tekst}</span></p>
          <Button type="button" wariant="obrys" onClick={() => setEdycja(true)}>{t("zmien")}</Button>
        </div>
      )}
      {pokazFormularz && (
      <form onSubmit={wyslij} className="karta space-y-8 p-6 sm:p-8" aria-describedby="swatka-uwaga">
        <div className="space-y-3">
          <Krok n={1} tytul={t("krok1")} />
          <label htmlFor="opis" className="block text-xl font-bold">
            {t("poleEtykieta")}
          </label>
          <p id="swatka-uwaga" className="text-muted">
            {t("podpowiedz")} <strong className="text-fg">{t("uwagaDane")}</strong>
          </p>
          <textarea
            id="opis"
            name="opis"
            value={tekst}
            onChange={(e) => setTekst(e.target.value.slice(0, MAX))}
            rows={6}
            placeholder={t("polePlaceholder")}
            className="block w-full rounded-xl border-2 border-line bg-card p-4 text-lg placeholder:text-muted/80 hover:border-fg"
          />
          <div className="zaawansowane flex justify-end text-sm text-muted" aria-hidden="true">
            {t("licznik", { ile: tekst.length, max: MAX })}
          </div>
          <Mikrofon jezyk={jezyk} onZdanie={(z) => setTekst((p) => (p ? `${p} ${z}` : z).slice(0, MAX))} />
          <div className="space-y-2 pt-2">
            <p className="font-semibold">{t("przyklady")}</p>
            <ul className="flex flex-wrap gap-2">
              {PRZYKLADY.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => setTekst(p)}
                    className="min-h-12 rounded-full border-2 border-line-soft bg-soft px-4 text-left hover:border-fg"
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="sr-only">{t("kimJestem")}</legend>
          <Krok n={2} tytul={t("krok2")} />
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
            {(["mieszkaniec", "instytucja"] as const).map((r) => (
              <label
                key={r}
                className="karta-mala flex cursor-pointer items-start gap-3 border-2 p-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg"
              >
                <input type="radio" name="rola" value={r} checked={rola === r} onChange={() => setRola(r)} className="mt-1.5 size-5 accent-current" />
                <span>
                  <span className="block font-bold">{t(r === "mieszkaniec" ? "rolaMieszkaniec" : "rolaInstytucja")}</span>
                  <span className="block text-sm">{t(r === "mieszkaniec" ? "rolaMieszkaniecOpis" : "rolaInstytucjaOpis")}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="zaawansowane space-y-2 pt-2">
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
              className="block min-h-12 w-full max-w-sm rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg"
            />
            <datalist id="powiaty">
              {POWIATY.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
        </fieldset>

        <div className="space-y-3">
          <Krok n={3} tytul={t("krok3")} />
          <Button type="submit" rozmiar="lg" disabled={laduje || tekst.trim().length < 3} className="w-full sm:w-auto">
            {laduje ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Search aria-hidden className="size-5" />}
            {t("szukaj")}
          </Button>
        </div>
      </form>
      )}

      <div aria-live="polite" className="space-y-6">
        {laduje && (
          <div className="karta flex items-center gap-4 p-6">
            <Loader2 aria-hidden className="size-8 shrink-0 animate-spin text-primary" />
            <p className="text-lg">{t("szukam")}</p>
          </div>
        )}
        {stan.typ === "blad" && (
          <p role="alert" className="karta-mala border-2 border-primary p-4 text-lg font-semibold">
            {stan.komunikat}
          </p>
        )}
      </div>

      {stan.typ === "wynik" && <Wyniki wynik={stan.wynik} />}
    </div>
    <aside className="space-y-4 lg:sticky lg:top-6" aria-label="Informacje pomocnicze">
      {stan.typ === "wynik" && <WyslijZgloszenie tekst={tekst} rola={rola} powiat={powiat} wynik={stan.wynik} />}
      {children}
    </aside>
    </div>
    </div>
  );
}

function Wyniki({ wynik }: { wynik: WynikSwatki }) {
  const t = useTranslations("swatka");
  const tk = useTranslations("kryzys");
  const z = wynik.zrozumiano;
  const telefony = TELEFONY_KRYZYSOWE.filter((x) => wynik.kryzys && (x.rodzaje as readonly string[]).includes(wynik.kryzys));
  const karty = wynik.dopasowania.slice(0, 3);

  return (
    <section aria-label={t("wyniki")} className="space-y-6">
      {wynik.kryzys && (
        <div role="alert" className="karta space-y-3 border-4 border-primary p-5">
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

      {wynik.tryb === "awaryjny" && <p className="karta-mala border-2 border-warn p-4 font-medium">{t("trybAwaryjny")}</p>}

      {wynik.tryb === "ai" && (
        <div className="karta-mala flex flex-wrap items-center gap-x-3 gap-y-2 p-4">
          <span className="font-bold">{t("zrozumialemTak")}:</span>
          <Chip>{z.obszarNazwa}</Chip>
          <span className="min-w-0 text-muted">{z.grupaDocelowa}</span>
        </div>
      )}

      {wynik.brakDopasowania && wynik.tryb === "ai" && <p className="text-lg">{t("brakOpis")}</p>}

      {wynik.pytanie && (
        <p className="karta-mala border-2 border-accent p-4 text-lg">
          <strong>{t("pytanie")}:</strong> {wynik.pytanie}
        </p>
      )}

      <div className="space-y-5">
        {karty.map((k) => (
          <KartaInnowacji key={k.id} k={k} />
        ))}
      </div>

      {wynik.najblizsze.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("najblizsze")}</h2>
          {wynik.najblizsze.slice(0, 2).map((k) => (
            <KartaInnowacji key={k.id} k={k} />
          ))}
        </div>
      )}

      {(wynik.podobnePrzypadki || wynik.fakty.length > 0) && (
        <aside className="karta-mala space-y-2 p-5">
          {wynik.podobnePrzypadki && (
            <p className="font-semibold">{t("podobne", { liczba: wynik.podobnePrzypadki.liczba, zakres: wynik.podobnePrzypadki.zakres })}</p>
          )}
          {wynik.fakty[0] && (
            <p className="text-muted">
              <span className="font-bold text-fg">{t("fakty")}: </span>
              {wynik.fakty[0].tekst} <span className="text-sm">({t("zrodlo", { zrodlo: wynik.fakty[0].zrodlo, strona: wynik.fakty[0].strona ?? "–" })})</span>
            </p>
          )}
        </aside>
      )}

      <div className="space-y-1 text-sm text-muted">
        <p>{t("oznaczenieAi")}</p>
        {wynik.zamaskowano.length > 0 && <p>{t("zamaskowano", { rodzaje: wynik.zamaskowano.join(", ") })}</p>}
      </div>
    </section>
  );
}
