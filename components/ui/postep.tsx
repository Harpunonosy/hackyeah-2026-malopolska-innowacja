"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Postęp długiego zapytania do AI (B-10): lista kroków odhaczanych w czasie i licznik sekund.
 * Czytnik ekranu słyszy tylko zmianę kroku (role="status"), a nie każdą sekundę.
 * Kroki to szacunek czasu, a nie stan serwera; ostatni krok trwa aż do odpowiedzi.
 */
export function Postep({ kroki, sekund }: { kroki: string; sekund: number }) {
  const t = useTranslations("postep");
  const lista = kroki.split("|");
  const [minelo, setMinelo] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setMinelo((m) => m + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const naKrok = sekund / lista.length;
  const biezacy = Math.min(lista.length - 1, Math.floor(minelo / naKrok));
  const procent = Math.min(95, Math.round((minelo / sekund) * 100));

  return (
    <div className="karta-mala space-y-3 p-4">
      <p role="status" className="text-lg font-bold">{lista[biezacy]}…</p>
      <div className="h-3 overflow-hidden rounded-full bg-line-soft" aria-hidden>
        <div className="h-full rounded-full bg-primary transition-[width] duration-1000" style={{ width: `${procent}%` }} />
      </div>
      <ol className="space-y-1">
        {lista.map((k, i) => (
          <li key={k} className={i < biezacy ? "flex items-center gap-2 text-ok" : i === biezacy ? "flex items-center gap-2 font-semibold" : "flex items-center gap-2 text-muted"}>
            {i < biezacy ? <Check aria-hidden className="size-5" /> : i === biezacy ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <span aria-hidden className="inline-block size-5" />}
            <span>{k}{i < biezacy && <span className="sr-only"> ({t("zrobione")})</span>}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted" aria-hidden>{minelo > sekund * 1.3 ? t("dluzej") : t("minelo", { n: minelo, z: sekund })}</p>
    </div>
  );
}
