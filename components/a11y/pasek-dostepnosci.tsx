"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Switch, ToggleGroup } from "radix-ui";
import { Volume2, VolumeX } from "lucide-react";
import { COOKIE_DOSTEPNOSC, type RozmiarTekstu, type UstawieniaDostepnosci } from "@/lib/dostepnosc";
import { cn } from "@/lib/utils";

function zastosuj(u: UstawieniaDostepnosci) {
  const el = document.documentElement;
  el.dataset.prosty = u.prosty ? "tak" : "nie";
  el.dataset.rozmiar = u.rozmiar;
  el.dataset.kontrast = u.kontrast;
  document.cookie = `${COOKIE_DOSTEPNOSC}=${encodeURIComponent(JSON.stringify(u))}; path=/; max-age=31536000; samesite=lax`;
}

function Przelacznik({ id, etykieta, wlaczony, zmien }: { id: string; etykieta: string; wlaczony: boolean; zmien: (v: boolean) => void }) {
  return (
    <div className="flex min-h-12 items-center gap-3">
      <Switch.Root
        id={id}
        checked={wlaczony}
        onCheckedChange={zmien}
        className="relative h-8 w-14 shrink-0 rounded-full border-2 border-fg bg-card data-[state=checked]:bg-primary"
      >
        <Switch.Thumb className="block size-5 translate-x-1 rounded-full bg-fg transition-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-primary-fg" />
      </Switch.Root>
      <label htmlFor={id} className="cursor-pointer font-medium">
        {etykieta}
      </label>
    </div>
  );
}

export function PasekDostepnosci({ poczatkowe }: { poczatkowe: UstawieniaDostepnosci }) {
  const t = useTranslations("dostepnosc");
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

  const rozmiary: { v: RozmiarTekstu; etykieta: string; klasa: string; opis: string }[] = [
    { v: "normalny", etykieta: "A", klasa: "text-base", opis: t("rozmiarNormalny") },
    { v: "duzy", etykieta: "A+", klasa: "text-lg", opis: t("rozmiarDuzy") },
    { v: "bardzo-duzy", etykieta: "A++", klasa: "text-xl", opis: t("rozmiarBardzoDuzy") },
  ];

  return (
    <section aria-label={t("etykieta")} className="nie-drukuj border-b-2 border-line bg-card">
      <div className="mx-auto max-w-6xl px-4 pt-2 sm:hidden">
        <button
          type="button"
          aria-expanded={rozwiniety}
          aria-controls="a11y-panel"
          onClick={() => setRozwiniety((v) => !v)}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-fg px-4 font-semibold"
        >
          {t("przycisk")}
        </button>
      </div>
      <div
        id="a11y-panel"
        className={cn("mx-auto max-w-6xl flex-wrap items-center gap-x-8 gap-y-1 px-4 py-2 sm:flex sm:px-6", rozwiniety ? "flex" : "hidden")}
      >
        <Przelacznik id="a11y-prosty" etykieta={t("trybProsty")} wlaczony={u.prosty} zmien={(v) => ustaw({ prosty: v })} />

        <div className="flex min-h-12 items-center gap-3">
          <span id="a11y-rozmiar" className="font-medium">
            {t("rozmiar")}
          </span>
          <ToggleGroup.Root
            type="single"
            value={u.rozmiar}
            onValueChange={(v) => v && ustaw({ rozmiar: v as RozmiarTekstu })}
            aria-labelledby="a11y-rozmiar"
            className="flex gap-1"
          >
            {rozmiary.map((r) => (
              <ToggleGroup.Item
                key={r.v}
                value={r.v}
                aria-label={r.opis}
                className={cn(
                  "size-12 rounded-lg border-2 border-fg font-bold data-[state=on]:bg-fg data-[state=on]:text-bg",
                  r.klasa,
                )}
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

        <button
          type="button"
          onClick={czytaj}
          aria-pressed={czyta}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-fg px-4 font-medium hover:bg-fg hover:text-bg"
        >
          {czyta ? <VolumeX aria-hidden className="size-5" /> : <Volume2 aria-hidden className="size-5" />}
          {czyta ? t("zatrzymaj") : t("czytaj")}
        </button>
        {blad && (
          <p role="status" className="text-sm font-medium text-warn">
            {t("czytanieNiedostepne")}
          </p>
        )}
      </div>
    </section>
  );
}
