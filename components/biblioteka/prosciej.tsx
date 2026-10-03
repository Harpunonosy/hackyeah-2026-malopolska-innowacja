"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Languages, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Prosto } from "@/lib/prosciej";

/** „Wyjaśnij prościej” i tłumaczenie na ukraiński (I-06). Tekst AI jest oznaczony i ma atrybut lang. */
export function Prosciej({ id }: { id: string }) {
  const t = useTranslations("wiedza");
  const [jezyk, setJezyk] = React.useState<"pl" | "uk" | null>(null);
  const [wynik, setWynik] = React.useState<Prosto | null>(null);
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const naglowek = React.useRef<HTMLHeadingElement>(null);

  async function pobierz(j: "pl" | "uk") {
    setJezyk(j);
    setWynik(null);
    setStan("pracuje");
    const r = await fetch("/api/wiedza/prosciej", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, jezyk: j }) }).catch(() => null);
    if (!r?.ok) return setStan("blad");
    setWynik(await r.json());
    setStan("");
    requestAnimationFrame(() => naglowek.current?.focus());
  }

  const uk = jezyk === "uk";
  return (
    <section aria-labelledby="prosciej-h" className="karta space-y-4 border-2 border-accent p-6">
      <h2 id="prosciej-h" className="text-2xl font-bold">{t("prosciejTytul")}</h2>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => pobierz("pl")} disabled={stan === "pracuje"}><Wand2 aria-hidden className="size-5" />{t("prosciej")}</Button>
        <Button type="button" wariant="obrys" lang="uk" onClick={() => pobierz("uk")} disabled={stan === "pracuje"}><Languages aria-hidden className="size-5" />{t("poUkrainsku")}</Button>
      </div>
      <div role="status">
        {stan === "pracuje" && <p className="flex items-center gap-2 text-lg"><Loader2 aria-hidden className="size-5 animate-spin" />{t("prosciejPracuje")}</p>}
        {stan === "blad" && <p className="font-semibold text-primary">{t("prosciejBlad")}</p>}
      </div>
      {wynik && (
        <div lang={uk ? "uk" : "pl"} className="space-y-3 text-xl leading-relaxed">
          <h3 ref={naglowek} tabIndex={-1} className="text-xl font-bold outline-none">{uk ? t("ukWynik") : t("prosciejWynik")}</h3>
          <p>{wynik.w_skrocie}</p>
          <ul className="list-disc space-y-1 pl-6">{wynik.punkty.map((p) => <li key={p}>{p}</li>)}</ul>
          <p><strong>{uk ? t("ukDlaKogo") : t("prosciejDlaKogo")}:</strong> {wynik.dla_kogo}</p>
          <p><strong>{uk ? t("ukJak") : t("prosciejJak")}:</strong> {wynik.jak_skorzystac}</p>
          <p className="text-sm text-muted">{uk ? t("ukAi") : t("prosciejAi")}</p>
        </div>
      )}
    </section>
  );
}
