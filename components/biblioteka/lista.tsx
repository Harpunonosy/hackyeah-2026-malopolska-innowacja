"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Search, Video } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

export type Pozycja = { id: string; nazwa: string; kategoria: string; problem: string; film: boolean; wybrana: boolean };

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

export function ListaBiblioteki({ pozycje, kategorie }: { pozycje: Pozycja[]; kategorie: string[] }) {
  const t = useTranslations("wiedza");
  const [fraza, setFraza] = React.useState("");
  const [kategoria, setKategoria] = React.useState<string | null>(null);

  const wyniki = React.useMemo(() => {
    const slowa = fold(fraza).split(/\s+/).filter(Boolean);
    return pozycje.filter(
      (p) => (!kategoria || p.kategoria === kategoria) && slowa.every((s) => fold(`${p.nazwa} ${p.problem} ${p.kategoria}`).includes(s)),
    );
  }, [pozycje, fraza, kategoria]);

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
              aria-pressed={kategoria === k}
              onClick={() => setKategoria(k)}
              className={cn(
                "min-h-12 rounded-full border-2 px-4 font-semibold transition-colors",
                kategoria === k ? "border-fg bg-fg text-bg" : "border-line-soft bg-soft text-fg hover:border-fg",
              )}
            >
              {k ?? t("wszystkie")}
            </button>
          ))}
        </div>
      </div>

      <p role="status" className="font-semibold text-muted">{t("wynikow", { ile: wyniki.length })}</p>

      {wyniki.length === 0 ? (
        <p className="karta-mala p-6 text-lg">{t("brak")}</p>
      ) : (
        <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wyniki.map((p) => (
            <li key={p.id} className="flex">
              <Link href={`/wiedza/biblioteka/${p.id}`} className="karta flex w-full flex-col gap-3 p-5 text-fg no-underline transition-transform hover:-translate-y-0.5">
                <span className="flex flex-wrap gap-2">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
