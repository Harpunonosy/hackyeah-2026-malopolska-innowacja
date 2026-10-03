"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type Pytanie = { pytanie: string; odpowiedzi: string[]; poprawna: number };

export function Lekcja({ akapity, latwe, quiz }: { akapity: string[]; latwe: string[]; quiz: Pytanie[] }) {
  const t = useTranslations("akademiaPubliczna");
  const [latwa, setLatwa] = React.useState(false);
  const [odp, setOdp] = React.useState<Record<number, number>>({});
  const [sprawdzone, setSprawdzone] = React.useState(false);
  const wynik = quiz.filter((q, i) => odp[i] === q.poprawna).length;
  return (
    <div className="space-y-8">
      <div role="group" aria-label={t("wersja")} className="flex flex-wrap gap-2">
        <Button type="button" wariant={latwa ? "obrys" : "glowny"} aria-pressed={!latwa} onClick={() => setLatwa(false)}>{t("zwykly")}</Button>
        <Button type="button" wariant={latwa ? "glowny" : "obrys"} aria-pressed={latwa} onClick={() => setLatwa(true)}>{t("latwy")}</Button>
      </div>
      <div className="max-w-3xl space-y-4 text-xl leading-relaxed">
        {(latwa ? latwe : akapity).map((a) => <p key={a}>{a}</p>)}
      </div>
      <section aria-labelledby="quiz-h" className="karta max-w-3xl space-y-5 p-6">
        <h2 id="quiz-h" className="text-2xl font-bold">{t("quiz")}</h2>
        {quiz.map((q, i) => (
          <fieldset key={q.pytanie} className="space-y-2">
            <legend className="text-lg font-bold">{i + 1}. {q.pytanie}</legend>
            {q.odpowiedzi.map((o, j) => (
              <label key={o} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
                <input type="radio" name={`q-${i}`} checked={odp[i] === j} onChange={() => { setOdp({ ...odp, [i]: j }); setSprawdzone(false); }} className="size-4 accent-current" />
                <span>{o}{sprawdzone && odp[i] === j && <strong> {j === q.poprawna ? t("dobrze") : t("sprobuj")}</strong>}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <Button type="button" onClick={() => setSprawdzone(true)} disabled={Object.keys(odp).length < quiz.length}>{t("sprawdz")}</Button>
        <p role="status" className="text-lg font-bold">{sprawdzone ? t("wynik", {wynik, razem:quiz.length}) : ""}</p>
      </section>
    </div>
  );
}
