"use client";
import { apiFetch } from "@/lib/fetch-klient";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ThumbsDown, ThumbsUp, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import type { KartaDopasowania } from "@/lib/swatka";
import { cn } from "@/lib/utils";

function poziomDopasowania(trafnosc: number | null) {
  if (trafnosc === null) return 0;
  return trafnosc >= 85 ? 3 : trafnosc >= 70 ? 2 : 1;
}

export function KartaInnowacji({ k, obszar, instytucja = false }: { k: KartaDopasowania; obszar?: string; instytucja?: boolean }) {
  const [wysylanie, setWysylanie] = React.useState(false);
  const [blad, setBlad] = React.useState(false);
  const zapisz = async (wartosc: 1 | -1) => {
    if (ocena || wysylanie) return;
    setWysylanie(true); setBlad(false);
    const r = await apiFetch("/api/swatka/reakcja", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ innowacjaId: k.id, obszar, wartosc }) });
    setWysylanie(false);
    if (r.ok) setOcena(wartosc === 1 ? "tak" : "nie"); else setBlad(true);
  };
  const t = useTranslations("swatka");
  const [ocena, setOcena] = React.useState<"tak" | "nie" | null>(null);
  const poziom = poziomDopasowania(k.trafnosc);
  const etykieta = [t("dopasowanieWstepne"), t("dopasowanieCzesciowe"), t("dopasowanieDobre"), t("dopasowanieBardzoDobre")][poziom];

  return (
    <article className={cn("karta flex flex-col gap-4 border-l-8 p-6", poziom === 3 ? "border-l-primary" : poziom === 2 ? "border-l-accent" : "border-l-line")}>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Chip>{k.kategoria}</Chip>
          <span className="inline-flex items-center gap-2 text-sm font-bold">
            <span aria-hidden className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <span key={i} className={cn("size-3 rounded-full border-2 border-fg", i <= poziom ? "bg-fg" : "bg-transparent")} />
              ))}
            </span>
            {etykieta}
          </span>
        </div>
        <h3 className="text-2xl font-bold">{k.nazwa}</h3>
      </header>

      <div className="rounded-xl bg-primary-soft p-4">
        <h4 className="text-sm font-bold uppercase tracking-wide text-primary">{t("dlaczego")}</h4>
        <p className="mt-1 text-lg">{k.dlaczego}</p>
      </div>

      <details className="karta-mala group px-4 py-2">
        <summary className="flex min-h-10 cursor-pointer items-center font-semibold">{t("czyDziala")}</summary>
        <p className="pb-2 pt-1 text-muted">{k.czyToDziala}</p>
        <h4 className="pt-2 text-sm font-bold uppercase tracking-wide text-muted">{t("ktoWdroz")}</h4>
        <p className="pb-2 text-muted">{k.ktoMozeWdrozyc}</p>
      </details>

      <footer className="mt-auto flex flex-wrap items-center gap-3 pt-1">
        <Button asChild>
          <Link href={`/wiedza/biblioteka/${k.id}`}>
            {t("pelnyOpis")}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </Button>
        {instytucja && k.wdrazalna && (
          <Button asChild wariant="obrys" className="zaawansowane">
            <Link href={`/wdrozenie?innowacja=${k.id}`}>{t("wdroz")}</Link>
          </Button>
        )}
        {k.film && (
          <Button asChild wariant="obrys">
            <a href={k.film} target="_blank" rel="noopener noreferrer">
              <Video aria-hidden className="size-5" />
              {t("film")}
            </a>
          </Button>
        )}
        <div className="zaawansowane ml-auto flex items-center gap-2">
          <Button type="button" wariant="cichy" aria-pressed={ocena === "tak"} disabled={wysylanie || ocena !== null} onClick={() => zapisz(1)} className="aria-pressed:bg-fg aria-pressed:text-bg">
            <ThumbsUp aria-hidden className="size-5" />
            {t("pomoze")}
          </Button>
          <Button type="button" wariant="cichy" aria-pressed={ocena === "nie"} disabled={wysylanie || ocena !== null} onClick={() => zapisz(-1)} className="aria-pressed:bg-fg aria-pressed:text-bg">
            <ThumbsDown aria-hidden className="size-5" />
            {t("nieTo")}
          </Button>
        </div>
      </footer>
      <p role="status" className="text-sm font-medium empty:hidden">
        {ocena && t("dzieki")}{blad && t("bladOceny")}
      </p>
    </article>
  );
}
