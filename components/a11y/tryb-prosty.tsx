"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Wand2 } from "lucide-react";
import type { UstawieniaDostepnosci } from "@/lib/dostepnosc";
import { ZDARZENIE_A11Y, zastosujUstawienia } from "@/lib/dostepnosc-klient";

const Kontekst = React.createContext<UstawieniaDostepnosci | null>(null);

/** Ustawienia dostępności dla komponentów klienta. Serwer zna je z cookie, więc pierwszy render się zgadza. */
export function UstawieniaDostawca({ poczatkowe, children }: { poczatkowe: UstawieniaDostepnosci; children: React.ReactNode }) {
  const [u, setU] = React.useState(poczatkowe);
  React.useEffect(() => {
    const nasluch = (e: Event) => setU((e as CustomEvent<UstawieniaDostepnosci>).detail);
    window.addEventListener(ZDARZENIE_A11Y, nasluch);
    return () => window.removeEventListener(ZDARZENIE_A11Y, nasluch);
  }, []);
  return <Kontekst.Provider value={u}>{children}</Kontekst.Provider>;
}

/** Czy włączony jest tryb prosty: mniej tekstu, jedna rzecz naraz, reszta pod przyciskiem „Pokaż”. */
export function useTrybProsty() {
  return React.useContext(Kontekst)?.prosty ?? false;
}

/** Pasek pod nagłówkiem: mówi, że część rzeczy jest schowana, i pozwala wszystko pokazać. */
export function PasekTrybuProstego() {
  const t = useTranslations("dostepnosc");
  const u = React.useContext(Kontekst);
  if (!u?.prosty) return null;
  return (
    <div className="nie-drukuj border-b-2 border-fg bg-accent text-accent-fg">
      <div className="kontener flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5">
        <p className="flex items-center gap-2 font-bold">
          <Wand2 aria-hidden className="size-5 shrink-0" />
          {t("prostyWlaczony")}
        </p>
        <button
          type="button"
          onClick={() => zastosujUstawienia({ ...u, prosty: false })}
          className="inline-flex min-h-12 items-center font-bold underline underline-offset-4"
        >
          {t("pokazWszystko")}
        </button>
      </div>
    </div>
  );
}
