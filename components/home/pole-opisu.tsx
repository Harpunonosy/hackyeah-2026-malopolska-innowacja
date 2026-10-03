"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Mikrofon } from "@/components/a11y/mikrofon";
import { Button } from "@/components/ui/button";

const MAX = 1500;

export function PoleOpisu() {
  const t = useTranslations("start.hero");
  const router = useRouter();
  const jezyk = useLocale();
  const [tekst, setTekst] = React.useState("");

  function idz(e: React.FormEvent) {
    e.preventDefault();
    if (tekst.trim().length < 3) return;
    router.push(`/problem?q=${encodeURIComponent(tekst)}&auto=1`);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={idz} className="karta space-y-4 p-5 sm:p-6">
        <label htmlFor="start-opis" className="sr-only">{t("poleEtykieta")}</label>
        <textarea
          id="start-opis"
          value={tekst}
          onChange={(e) => setTekst(e.target.value.slice(0, MAX))}
          rows={4}
          placeholder={t("placeholder")}
          className="block w-full rounded-2xl border-2 border-line-soft bg-bg p-4 text-xl placeholder:text-muted/80 hover:border-fg"
        />
        <div className="flex flex-wrap items-start gap-3">
          <Mikrofon jezyk={jezyk} onZdanie={(z) => setTekst((p) => (p ? `${p} ${z}` : z).slice(0, MAX))} etykieta={t("powiedz")} />
          <Button type="submit" rozmiar="lg" disabled={tekst.trim().length < 3} className="min-w-52 flex-1">
            {t("szukaj")}
            <ArrowRight aria-hidden className="size-5" />
          </Button>
        </div>
      </form>
      <ul className="flex flex-wrap gap-2">
        {(["p1", "p2", "p3"] as const).map((k) => (
          <li key={k}>
            <button
              type="button"
              onClick={() => setTekst(t(`${k}.tekst`))}
              className="min-h-12 rounded-full bg-soft px-5 font-semibold text-fg hover:bg-fg hover:text-bg"
            >
              {t(`${k}.chip`)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
