"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Search, Video } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import { useTrybProsty } from "@/components/a11y/tryb-prosty";

export type Pozycja = { id: string; nazwa: string; kategoria: string; problem: string; film: boolean; wybrana: boolean; grupa: string; kto: string; dziala: string };

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

export function ListaBiblioteki({ pozycje, kategorie }: { pozycje: Pozycja[]; kategorie: string[] }) {
  const t = useTranslations("wiedza");
  const prosty = useTrybProsty();
  const [fraza, setFraza] = React.useState("");
  const [kategoria, setKategoria] = React.useState<string | null>(null);
  const [tylkoFilm, setTylkoFilm] = React.useState(false);
  const [tylkoWdrazalne, setTylkoWdrazalne] = React.useState(false);
  const [porownanie, setPorownanie] = React.useState<string[]>([]);
  // Tryb prosty startuje bez listy; „Wszystkie kategorie” pokazuje pełną listę zamiast rzędów.
  const [wszystkieProsto, setWszystkieProsto] = React.useState(false);

  const wyniki = React.useMemo(() => {
    const slowa = fold(fraza).split(/\s+/).filter(Boolean);
    return pozycje.filter(
      (p) => (!kategoria || p.kategoria === kategoria) && (!tylkoFilm || p.film) && (!tylkoWdrazalne || p.wybrana) && slowa.every((s) => fold(`${p.nazwa} ${p.problem} ${p.kategoria}`).includes(s)),
    );
  }, [pozycje, fraza, kategoria, tylkoFilm, tylkoWdrazalne]);

  const karta = (p: Pozycja) => (
    <>
      <Link href={`/wiedza/biblioteka/${p.id}`} className="karta flex w-full flex-1 flex-col gap-3 p-5 text-fg no-underline transition-transform hover:-translate-y-0.5">
        <span className={prosty ? "hidden" : "flex flex-wrap gap-2"}>
          <Chip>{p.kategoria}</Chip>
          {p.film && (
            <Chip className="gap-1">
              <Video aria-hidden className="size-3.5" />
              {t("zFilmem")}
            </Chip>
          )}
        </span>
        <span className="font-display text-xl font-bold leading-snug">{p.nazwa}</span>
        <span className="line-clamp-3 text-muted">{p.problem}</span>
        <span className="mt-auto inline-flex items-center gap-2 pt-2 font-bold text-primary">
          {t("zobacz")}
          <ArrowRight aria-hidden className="size-5" />
        </span>
      </Link>
      <label className={prosty ? "hidden" : "flex min-h-12 cursor-pointer items-center gap-2 px-2 font-semibold"}>
        <input type="checkbox" checked={porownanie.includes(p.id)} disabled={!porownanie.includes(p.id) && porownanie.length >= 3} onChange={(e) => setPorownanie(e.target.checked ? [...porownanie, p.id] : porownanie.filter((x) => x !== p.id))} className="size-5 accent-current" />
        {t("porownaj")}<span className="sr-only">: {p.nazwa}</span>
      </label>
    </>
  );

  // Bez wyszukiwania i filtrów: rzędy tematyczne jak w serwisie z filmami (I-19).
  const widokRzedow = !fraza.trim() && !kategoria && !tylkoFilm && !tylkoWdrazalne;
  const rzedy = React.useMemo(() => {
    const wgKategorii = kategorie
      .map((k) => ({ k, lista: pozycje.filter((p) => p.kategoria === k) }))
      .filter((x) => x.lista.length > 0)
      .sort((a, b) => b.lista.length - a.lista.length);
    return [
      { id: "wybrane", tytul: t("rzadWybrane"), lista: pozycje.filter((p) => p.wybrana), pokaz: () => setTylkoWdrazalne(true) },
      { id: "filmy", tytul: t("rzadFilmy"), lista: pozycje.filter((p) => p.film), pokaz: () => setTylkoFilm(true) },
      ...wgKategorii.map((x, i) => ({ id: `k${i}`, tytul: x.k, lista: x.lista, pokaz: () => setKategoria(x.k) })),
    ].filter((r) => r.lista.length > 0);
  }, [pozycje, kategorie, t]);

  return (
    <div className="space-y-6">
      <div className="karta space-y-4 p-5 sm:p-6">
        <div className="space-y-2">
          <label htmlFor="szukaj-bib" className="block text-lg font-bold">{t("szukaj")}</label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              id="szukaj-bib"
              type="search"
              value={fraza}
              onChange={(e) => setFraza(e.target.value)}
              placeholder={t("szukajPlaceholder")}
              autoComplete="off"
              className="block min-h-14 w-full rounded-xl border-2 border-line bg-card pl-12 pr-4 text-lg hover:border-fg"
            />
          </div>
        </div>
        <div role="group" aria-label="Kategorie" className="flex flex-wrap gap-2">
          {[null, ...kategorie].map((k) => (
            <button
              key={k ?? "wszystkie"}
              type="button"
              aria-pressed={kategoria === k && (k !== null || !prosty || wszystkieProsto)}
              onClick={() => { setKategoria(k); setWszystkieProsto(k === null); }}
              className={cn(
                "min-h-12 rounded-full border-2 px-4 font-semibold transition-colors",
                kategoria === k && (k !== null || !prosty || wszystkieProsto) ? "border-fg bg-fg text-bg" : "border-line-soft bg-soft text-fg hover:border-fg",
              )}
            >
              {k ?? t("wszystkie")}
            </button>
          ))}
        </div>
      </div>

      <div role="group" aria-label={t("filtryDodatkowe")} className={prosty ? "hidden" : "flex flex-wrap gap-2"}>
        <button type="button" aria-pressed={tylkoFilm} onClick={() => setTylkoFilm(!tylkoFilm)} className={cn("min-h-12 rounded-full border-2 px-4 font-semibold", tylkoFilm ? "border-fg bg-fg text-bg" : "border-line-soft bg-soft hover:border-fg")}>{t("zFilmem")}</button>
        <button type="button" aria-pressed={tylkoWdrazalne} onClick={() => setTylkoWdrazalne(!tylkoWdrazalne)} className={cn("min-h-12 rounded-full border-2 px-4 font-semibold", tylkoWdrazalne ? "border-fg bg-fg text-bg" : "border-line-soft bg-soft hover:border-fg")}>{t("doWdrozenia")}</button>
      </div>

      <p role="status" className="font-semibold text-muted">{prosty && widokRzedow && !wszystkieProsto ? t("prostyWybierz") : t("wynikow", { ile: wyniki.length })}</p>

      {porownanie.length >= 2 && !prosty && (
        <section aria-labelledby="por-h" className="karta space-y-3 overflow-x-auto p-5">
          <h2 id="por-h" className="text-2xl font-bold">{t("porownanie")}</h2>
          <table className="w-full min-w-[40rem] text-left">
            <caption className="sr-only">{t("porownanie")}</caption>
            <thead><tr><th scope="col" className="p-2" />{porownanie.map((id) => <th key={id} scope="col" className="p-2 font-display text-lg">{pozycje.find((p) => p.id === id)?.nazwa}</th>)}</tr></thead>
            <tbody className="align-top">
              {([["kategoria", t("kategoria")], ["grupa", t("odbiorcy")], ["kto", t("ktoWdraza")], ["dziala", t("czyDziala")]] as const).map(([k, e]) => (
                <tr key={k} className="border-t border-line-soft"><th scope="row" className="p-2 font-bold">{e}</th>{porownanie.map((id) => <td key={id} className="p-2">{pozycje.find((p) => p.id === id)?.[k]}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => setPorownanie([])} className="min-h-12 rounded-full border-2 border-fg px-4 font-semibold hover:bg-fg hover:text-bg">{t("wyczysc")}</button>
        </section>
      )}

      {widokRzedow && prosty && !wszystkieProsto ? null : widokRzedow && !prosty ? (
        <div className="space-y-10">
          {rzedy.map((r) => (
            <section key={r.id} aria-labelledby={`rz-${r.id}`} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`rz-${r.id}`} className="text-2xl font-bold">{r.tytul}</h2>
                <button type="button" onClick={r.pokaz} className="inline-flex min-h-12 items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">
                  {t("zobaczWszystkie", { n: r.lista.length })}<ArrowRight aria-hidden className="size-5" />
                </button>
              </div>
              <div role="region" tabIndex={0} aria-label={t("rzadPrzewin", { nazwa: r.tytul })} className="relative sm:-mx-1 sm:overflow-x-auto sm:px-1 sm:pb-3">
                <ul className="grid gap-4 sm:flex sm:snap-x sm:snap-mandatory">
                  {r.lista.slice(0, 10).map((p, i) => (
                    <li key={p.id} className={cn("flex flex-col gap-2 sm:w-72 sm:shrink-0 sm:snap-start", i >= 3 && "hidden sm:flex")}>
                      {karta(p)}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      ) : wyniki.length === 0 ? (
        <p className="karta-mala p-6 text-lg">{t("brak")}</p>
      ) : (
        <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wyniki.map((p) => (
            <li key={p.id} className="flex flex-col gap-2">
              {karta(p)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
