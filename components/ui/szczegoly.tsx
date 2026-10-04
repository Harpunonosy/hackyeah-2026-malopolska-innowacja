"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Szczegóły pozostają w DOM, więc zwinięcie nie usuwa wpisanych danych. */
export function Szczegoly({ tytul, opis, wartosc, etykiety, children, className, id, poziom = 2 }: {
  tytul: string;
  opis?: string;
  wartosc?: string;
  etykiety?: { rozwin: string; zwin: string };
  children: React.ReactNode;
  className?: string;
  id?: string;
  poziom?: 2 | 3;
}) {
  const ref = React.useRef<HTMLDetailsElement>(null);
  const Naglowek = poziom === 3 ? "h3" : "h2";
  React.useEffect(() => {
    let przedDrukiem: boolean | undefined;
    const otworz = () => {
      if (!ref.current) return;
      przedDrukiem ??= ref.current.open;
      ref.current.open = true;
    };
    const przywroc = () => {
      if (ref.current && przedDrukiem !== undefined) ref.current.open = przedDrukiem;
      przedDrukiem = undefined;
    };
    const przejdz = () => {
      if (id && window.location.hash === `#${id}` && ref.current) ref.current.open = true;
    };
    const kliknijLink = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest("a") : null;
      if (id && link?.getAttribute("href") === `#${id}` && ref.current) {
        ref.current.open = true;
        ref.current.querySelector("summary")?.focus({ preventScroll: true });
      }
    };
    przejdz();
    window.addEventListener("hashchange", przejdz);
    document.addEventListener("click", kliknijLink);
    window.addEventListener("beforeprint", otworz);
    window.addEventListener("afterprint", przywroc);
    return () => {
      window.removeEventListener("beforeprint", otworz);
      window.removeEventListener("afterprint", przywroc);
      window.removeEventListener("hashchange", przejdz);
      document.removeEventListener("click", kliknijLink);
    };
  }, [id]);

  return (
    <details ref={ref} id={id} data-splot-szczegoly className={cn("karta [&[open]>summary_.szczegoly-rozwin]:hidden [&:not([open])>summary_.szczegoly-zwin]:hidden [&[open]>summary_.szczegoly-strzalka]:rotate-180", className)}>
      <summary className="min-h-12 cursor-pointer list-none rounded-[1.25rem] p-5 hover:bg-soft sm:p-6 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Naglowek className={cn("min-w-0 flex-1 text-xl font-bold", etykiety && "basis-full sm:basis-auto")}>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>{tytul}</span>
              {wartosc && <span className="rounded-full bg-soft px-3 py-1 font-sans text-base font-bold tabular-nums">{wartosc}</span>}
            </span>
            {opis && <span className="mt-1 block font-sans text-base font-normal leading-normal text-muted">{opis}</span>}
          </Naglowek>
          <span className={cn("inline-flex shrink-0 items-center gap-2 print:hidden", etykiety && "min-h-12 rounded-xl border-2 border-line-soft px-3 font-semibold")}>
            {etykiety && <><span className="szczegoly-rozwin">{etykiety.rozwin}</span><span className="szczegoly-zwin">{etykiety.zwin}</span></>}
            <ChevronDown aria-hidden className="szczegoly-strzalka size-6 shrink-0 transition-transform" />
          </span>
        </div>
      </summary>
      <div className="space-y-6 border-t border-line-soft p-5 sm:p-6">{children}</div>
    </details>
  );
}
