"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Switch, ToggleGroup } from "radix-ui";
import { Accessibility, Volume2, VolumeX } from "lucide-react";
import { COOKIE_JEZYK, type RozmiarTekstu, type UstawieniaDostepnosci } from "@/lib/dostepnosc";
import { ZDARZENIE_A11Y, zastosujUstawienia as zastosuj } from "@/lib/dostepnosc-klient";
import { cn } from "@/lib/utils";

function Przelacznik({ id, etykieta, wlaczony, zmien }: { id: string; etykieta: string; wlaczony: boolean; zmien: (v: boolean) => void }) {
  return (
    <div className="flex min-h-12 items-center">
      <Switch.Root
        id={id}
        checked={wlaczony}
        onCheckedChange={zmien}
        className="relative h-8 w-14 shrink-0 rounded-full border-2 border-hero-fg/70 bg-transparent data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      >
        <Switch.Thumb className="block size-5 translate-x-1 rounded-full bg-hero-fg transition-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-accent-fg" />
      </Switch.Root>
      {/* Cała etykieta (48 px wysokości) przełącza ustawienie, nie tylko mały suwak. */}
      <label htmlFor={id} className="flex min-h-12 cursor-pointer items-center ps-2.5 text-sm font-semibold">
        {etykieta}
      </label>
    </div>
  );
}

export function PasekDostepnosci({ poczatkowe }: { poczatkowe: UstawieniaDostepnosci }) {
  const t = useTranslations("dostepnosc");
  const router = useRouter();
  const jezyk = useLocale();
  const [u, setU] = React.useState(poczatkowe);
  const [czyta, setCzyta] = React.useState(false);
  const [blad, setBlad] = React.useState(false);
  const [rozwiniety, setRozwiniety] = React.useState(false);

  function ustaw(zmiana: Partial<UstawieniaDostepnosci>) {
    const nowe = { ...u, ...zmiana };
    setU(nowe);
    zastosuj(nowe);
  }

  function zatrzymaj() {
    window.speechSynthesis?.cancel();
    setCzyta(false);
  }

  function czytaj() {
    if (czyta) return zatrzymaj();
    const synteza = window.speechSynthesis;
    if (!synteza) return setBlad(true);
    setBlad(false);
    const tekst = document.getElementById("tresc")?.innerText ?? "";
    // Chrome przerywa długie wypowiedzi, więc czytamy zdaniami.
    const zdania = tekst.match(/[^.!?\n]+[.!?]?/g)?.map((z) => z.trim()).filter(Boolean) ?? [];
    const glos = synteza.getVoices().find((g) => g.lang.toLowerCase().startsWith(document.documentElement.lang || "pl"));
    synteza.cancel();
    zdania.forEach((z, i) => {
      const w = new SpeechSynthesisUtterance(z);
      w.lang = document.documentElement.lang === "uk" ? "uk-UA" : document.documentElement.lang === "en" ? "en-GB" : "pl-PL";
      if (glos) w.voice = glos;
      if (i === zdania.length - 1) w.onend = () => setCzyta(false);
      synteza.speak(w);
    });
    setCzyta(true);
  }

  React.useEffect(() => () => window.speechSynthesis?.cancel(), []);
  React.useEffect(() => {
    const nasluch = (e: Event) => setU((e as CustomEvent<UstawieniaDostepnosci>).detail);
    window.addEventListener(ZDARZENIE_A11Y, nasluch);
    return () => window.removeEventListener(ZDARZENIE_A11Y, nasluch);
  }, []);

  const rozmiary: { v: RozmiarTekstu; etykieta: string; opis: string }[] = [
    { v: "normalny", etykieta: "A", opis: t("rozmiarNormalny") },
    { v: "duzy", etykieta: "A+", opis: t("rozmiarDuzy") },
    { v: "bardzo-duzy", etykieta: "A++", opis: t("rozmiarBardzoDuzy") },
  ];

  return (
    <section aria-label={t("etykieta")} className="nie-drukuj bg-hero text-hero-fg">
      <div className="kontener sm:hidden">
        <button
          type="button"
          aria-expanded={rozwiniety}
          aria-controls="a11y-panel"
          onClick={() => setRozwiniety((v) => !v)}
          className="inline-flex min-h-12 items-center gap-2 font-semibold"
        >
          <Accessibility aria-hidden className="size-5" />
          {t("przycisk")}
        </button>
      </div>
      <div
        id="a11y-panel"
        className={cn("kontener flex-wrap items-center gap-x-6 gap-y-0 pb-1 sm:flex sm:py-0.5", rozwiniety ? "flex" : "hidden")}
      >
        <Accessibility aria-hidden className="hidden size-5 text-accent sm:block" />
        <Przelacznik id="a11y-prosty" etykieta={t("trybProsty")} wlaczony={u.prosty} zmien={(v) => ustaw({ prosty: v })} />

        <div className="flex min-h-12 items-center gap-2.5">
          <span id="a11y-rozmiar" className="text-sm font-semibold">
            {t("rozmiar")}
          </span>
          <ToggleGroup.Root
            type="single"
            value={u.rozmiar}
            onValueChange={(v) => v && ustaw({ rozmiar: v as RozmiarTekstu })}
            aria-labelledby="a11y-rozmiar"
            className="flex overflow-hidden rounded-lg border-2 border-hero-fg/70"
          >
            {rozmiary.map((r) => (
              <ToggleGroup.Item
                key={r.v}
                value={r.v}
                aria-label={r.opis}
                className="h-12 min-w-12 px-2 text-sm font-bold data-[state=on]:bg-accent data-[state=on]:text-accent-fg"
              >
                {r.etykieta}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>

        <Przelacznik
          id="a11y-kontrast"
          etykieta={t("kontrast")}
          wlaczony={u.kontrast === "wysoki"}
          zmien={(v) => ustaw({ kontrast: v ? "wysoki" : "normalny" })}
        />

        <div role="group" aria-label={t("jezyk")} className="flex min-h-12 items-center gap-2.5">
          <span className="text-sm font-semibold" aria-hidden="true">{t("jezyk")}</span>
          <div className="flex overflow-hidden rounded-lg border-2 border-hero-fg/70">
            {([["pl", "PL", t("jezykPlOpis"), "pl"], ["uk", "UA", t("jezykUkOpis"), "uk"]] as const).map(([kod, skrot, opis, lang]) => (
              <button
                key={kod}
                type="button"
                lang={lang}
                aria-label={opis}
                aria-pressed={jezyk === kod}
                onClick={() => {
                  document.cookie = `${COOKIE_JEZYK}=${kod}; path=/; max-age=31536000; samesite=lax`;
                  router.refresh();
                }}
                className="h-12 min-w-12 px-2 text-sm font-bold aria-pressed:bg-accent aria-pressed:text-accent-fg"
              >
                {skrot}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={czytaj}
          aria-pressed={czyta}
          className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
        >
          {czyta ? <VolumeX aria-hidden className="size-5" /> : <Volume2 aria-hidden className="size-5" />}
          {czyta ? t("zatrzymaj") : t("czytaj")}
        </button>
        {blad && (
          <p role="status" className="text-sm font-medium text-accent">
            {t("czytanieNiedostepne")}
          </p>
        )}
      </div>
    </section>
  );
}
