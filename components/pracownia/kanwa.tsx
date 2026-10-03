"use client";

import { useTranslations } from "next-intl";
import type { KanwaStan } from "@/lib/pracownia";
export type { KanwaStan };
type PoleSkali = "intensywnosc" | "czestotliwosc" | "skala" | "przystepnosc" | "prostota" | "dochod_pewnosc" | "skalowanie" | "wplyw_osoba" | "wplyw_spolecznosc" | "wplyw_srodowisko";
const GRUPY: [string, readonly PoleSkali[]][] = [
  ["problem", ["intensywnosc", "czestotliwosc", "skala"]],
  ["rozwiazanie", ["przystepnosc", "prostota"]],
  ["trwalosc", ["dochod_pewnosc", "skalowanie"]],
  ["wplyw", ["wplyw_osoba", "wplyw_spolecznosc", "wplyw_srodowisko"]],
];
const GOTOWOSC: Record<string, number> = { pomysl: 1, prototyp: 2, przetestowane: 3, gotowe: 4 };

export function wskaznikiDojrzalosci(k: KanwaStan, etap: string) {
  return {
    problem: { v: k.intensywnosc + k.czestotliwosc + k.skala, max: 12 },
    rozwiazanie: { v: k.przystepnosc + k.prostota + (GOTOWOSC[etap] ?? 1), max: 12 },
    trwalosc: { v: k.dochod_pewnosc + k.skalowanie, max: 8 },
    wplyw: { v: k.wplyw_osoba + k.wplyw_spolecznosc + k.wplyw_srodowisko, max: 12 },
  };
}

export function Kanwa({ kanwa, zmien, etap }: { kanwa: KanwaStan; zmien: (k: KanwaStan) => void; etap: string }) {
  const t = useTranslations("pracownia");
  const w = wskaznikiDojrzalosci(kanwa, etap);
  const skala = t.raw("skala") as string[];
  return (
    <section className="karta space-y-6 p-6" aria-labelledby="h-kanwa">
      <div>
        <h2 id="h-kanwa" className="text-2xl font-bold">{t("kanwa")}</h2>
        <p className="text-muted">{t("kanwaOpis")}</p>
      </div>
      <div>
        <h3 className="text-lg font-bold">{t("dojrzalosc")}</h3>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {(Object.keys(w) as (keyof typeof w)[]).map((k) => (
            <li key={k}>
              <p className="flex justify-between font-semibold"><span>{t(`wsk.${k}`)}</span><span>{w[k].v} / {w[k].max}</span></p>
              <div aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${(w[k].v / w[k].max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      </div>
      {GRUPY.map(([g, pola]) => (
        <div key={g} className="space-y-4">
          <h3 className="text-lg font-bold">{t(`wsk.${g}`)}</h3>
          {pola.map((pole) => (
            <fieldset key={pole} className="space-y-2">
              <legend className="font-semibold">{t(`pytania.${pole}`)}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <label key={n} className="flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-line-soft bg-card px-2 py-1 text-center text-sm font-semibold hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
                    <input type="radio" name={`k-${pole}`} checked={kanwa[pole] === n} onChange={() => zmien({ ...kanwa, [pole]: n })} className="sr-only" />
                    {skala[n - 1]}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      ))}
      <div className="grid gap-4 md:grid-cols-2">
        {([["kto_wspiera", t("wspiera")], ["kto_utrudnia", t("utrudnia")], ["koszty_stale", t("stale")], ["koszty_zmienne", t("zmienne")]] as const).map(([k, e]) => (
          <div key={k} className="space-y-1">
            <label htmlFor={`kt-${k}`} className="block font-bold">{e}</label>
            <textarea id={`kt-${k}`} rows={2} value={kanwa[k]} onChange={(ev) => zmien({ ...kanwa, [k]: ev.target.value })} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg" />
          </div>
        ))}
      </div>
    </section>
  );
}
