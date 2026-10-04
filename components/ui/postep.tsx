"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Oczekiwanie na AI: zakres pracy i orientacyjny czas, bez pozornego procentu ukończenia.
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

  return (
    <div className="karta-mala space-y-3 p-4">
      <p role="status" className="flex items-center gap-2 text-lg font-bold"><Loader2 aria-hidden className="size-5 animate-spin" />{t("czekaj")}</p>
      <p className="text-sm text-muted">{t("szacunek", { n: sekund })}</p>
      <ul className="list-disc pl-5 text-muted">{lista.map(k => <li key={k}>{k}</li>)}</ul>
      <p className="text-sm text-muted" aria-hidden>{minelo > sekund * 1.3 ? t("dluzej") : t("minelo", { n: minelo, z: sekund })}</p>
    </div>
  );
}
