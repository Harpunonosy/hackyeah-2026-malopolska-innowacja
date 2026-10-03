"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ThumbsDown, ThumbsUp, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import type { KartaDopasowania } from "@/lib/swatka";

function etykietaDopasowania(trafnosc: number | null, t: (k: string) => string) {
  if (trafnosc === null) return t("dopasowanieWstepne");
  if (trafnosc >= 85) return t("dopasowanieBardzoDobre");
  if (trafnosc >= 70) return t("dopasowanieDobre");
  return t("dopasowanieCzesciowe");
}

export function KartaInnowacji({ k }: { k: KartaDopasowania }) {
  const t = useTranslations("swatka");
  const [ocena, setOcena] = React.useState<"tak" | "nie" | null>(null);
  const poziom = k.trafnosc === null ? 0 : k.trafnosc >= 85 ? 3 : k.trafnosc >= 70 ? 2 : 1;

  return (
    <article className="space-y-4 rounded-2xl border-2 border-fg bg-card p-5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>{k.kategoria}</Chip>
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <span aria-hidden className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <span key={i} className={`size-3 rounded-full border-2 border-fg ${i <= poziom ? "bg-fg" : "bg-transparent"}`} />
              ))}
            </span>
            {etykietaDopasowania(k.trafnosc, t)}
          </span>
        </div>
        <h3 className="text-2xl font-bold">{k.nazwa}</h3>
      </header>

      <div>
        <h4 className="font-bold">{t("dlaczego")}</h4>
        <p className="text-lg">{k.dlaczego}</p>
      </div>

      <details className="rounded-xl border-2 border-line p-3">
        <summary className="min-h-10 cursor-pointer font-semibold">{t("czyDziala")}</summary>
        <p className="mt-2">{k.czyToDziala}</p>
      </details>

      <div className="zaawansowane">
        <h4 className="font-bold">{t("ktoWdroz")}</h4>
        <p>{k.ktoMozeWdrozyc}</p>
      </div>

      <footer className="flex flex-wrap items-center gap-3">
        <Button asChild wariant="glowny">
          <Link href={`/wiedza/biblioteka/${k.id}`}>{t("pelnyOpis")}</Link>
        </Button>
        {k.film && (
          <Button asChild wariant="obrys">
            <a href={k.film} target="_blank" rel="noopener noreferrer">
              <Video aria-hidden className="size-5" />
              {t("film")}
            </a>
          </Button>
        )}
        <div className="zaawansowane ml-auto flex items-center gap-2">
          <Button type="button" wariant="obrys" aria-pressed={ocena === "tak"} onClick={() => setOcena("tak")}>
            <ThumbsUp aria-hidden className="size-5" />
            {t("pomoze")}
          </Button>
          <Button type="button" wariant="obrys" aria-pressed={ocena === "nie"} onClick={() => setOcena("nie")}>
            <ThumbsDown aria-hidden className="size-5" />
            {t("nieTo")}
          </Button>
        </div>
      </footer>
      <p role="status" className="min-h-6 text-sm font-medium">
        {ocena && t("dzieki")}
      </p>
    </article>
  );
}
