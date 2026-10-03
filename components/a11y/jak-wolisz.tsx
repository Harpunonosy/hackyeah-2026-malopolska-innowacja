"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Contrast, Languages, Mic, Type, Volume2, Wand2 } from "lucide-react";
import { COOKIE_JEZYK, odczytajUstawienia, type UstawieniaDostepnosci } from "@/lib/dostepnosc";
import { ZDARZENIE_A11Y, zastosujUstawienia } from "@/lib/dostepnosc-klient";
import { Button } from "@/components/ui/button";

const COOKIE_WYBOR = "splot_a11y_wybor";

function biezace(): UstawieniaDostepnosci {
  const ciastko = document.cookie.split("; ").find((c) => c.startsWith("splot_a11y="))?.split("=")[1];
  return odczytajUstawienia(ciastko ? decodeURIComponent(ciastko) : undefined);
}

/** Pierwsza wizyta: sześć dużych kafelków zamiast szukania ustawień w pasku. To panel na stronie, a nie okno modalne. */
export function JakWolisz() {
  const t = useTranslations("jakWolisz");
  const router = useRouter();
  const jezyk = useLocale();
  const [ukryty, setUkryty] = React.useState(false);
  const [u, setU] = React.useState<UstawieniaDostepnosci>({ prosty: false, rozmiar: "normalny", kontrast: "normalny" });
  const [czyta, setCzyta] = React.useState(false);
  React.useEffect(() => {
    const synchronizuj = () => setU(biezace());
    const klatka = requestAnimationFrame(synchronizuj);
    window.addEventListener(ZDARZENIE_A11Y, synchronizuj);
    return () => { cancelAnimationFrame(klatka); window.removeEventListener(ZDARZENIE_A11Y, synchronizuj); };
  }, []);
  if (ukryty) return null;

  const ustaw = (zmiana: Partial<UstawieniaDostepnosci>) => {
    const nowe = { ...u, ...zmiana };
    setU(nowe);
    zastosujUstawienia(nowe);
  };
  const czytajStrone = () => {
    const s = window.speechSynthesis;
    if (!s) return;
    if (czyta) { s.cancel(); return setCzyta(false); }
    s.cancel();
    const u2 = new SpeechSynthesisUtterance(document.getElementById("tresc")?.innerText.slice(0, 600) ?? "");
    u2.lang = jezyk === "uk" ? "uk-UA" : "pl-PL";
    u2.onend = () => setCzyta(false);
    s.speak(u2);
    setCzyta(true);
  };
  const zamknij = () => {
    document.cookie = `${COOKIE_WYBOR}=1; path=/; max-age=31536000; samesite=lax`;
    setUkryty(true);
  };

  const kafelki: { id: string; ikona: React.ElementType; etykieta: string; wlaczony: boolean; akcja: () => void }[] = [
    { id: "wieksze", ikona: Type, etykieta: t("wieksze"), wlaczony: u.rozmiar !== "normalny", akcja: () => ustaw({ rozmiar: u.rozmiar === "normalny" ? "duzy" : "normalny" }) },
    { id: "czytaj", ikona: Volume2, etykieta: t("czytaj"), wlaczony: czyta, akcja: czytajStrone },
    { id: "mow", ikona: Mic, etykieta: t("mow"), wlaczony: false, akcja: () => router.push("/rozmowa") },
    { id: "prosty", ikona: Wand2, etykieta: t("prosty"), wlaczony: u.prosty, akcja: () => ustaw({ prosty: !u.prosty }) },
    { id: "kontrast", ikona: Contrast, etykieta: t("kontrast"), wlaczony: u.kontrast === "wysoki", akcja: () => ustaw({ kontrast: u.kontrast === "wysoki" ? "normalny" : "wysoki" }) },
    { id: "ukr", ikona: Languages, etykieta: "Українською", wlaczony: jezyk === "uk", akcja: () => { document.cookie = `${COOKIE_JEZYK}=${jezyk === "uk" ? "pl" : "uk"}; path=/; max-age=31536000; samesite=lax`; router.refresh(); } },
  ];

  return (
    <section aria-labelledby="jw-h" className="kontener nie-drukuj pt-6">
      <div className="karta space-y-4 border-2 border-accent p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="jw-h" className="text-2xl font-extrabold">{t("tytul")}</h2>
          <p className="text-muted">{t("info")}</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kafelki.map(({ id, ikona: Ikona, etykieta, wlaczony, akcja }) => (
            <li key={id}>
              <button
                type="button"
                aria-pressed={id === "mow" ? undefined : wlaczony}
                onClick={akcja}
                lang={id === "ukr" ? "uk" : undefined}
                className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-line-soft bg-card p-3 text-center font-bold hover:border-fg aria-pressed:border-fg aria-pressed:bg-accent aria-pressed:text-accent-fg"
              >
                <Ikona aria-hidden className="size-8" />
                {etykieta}
              </button>
            </li>
          ))}
        </ul>
        <Button type="button" wariant="obrys" onClick={zamknij}>{t("gotowe")}</Button>
      </div>
    </section>
  );
}
