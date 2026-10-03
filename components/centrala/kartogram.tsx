"use client";

import * as React from "react";
import { VolumeX } from "lucide-react";
import type { RadarDane } from "@/lib/radar";
import { OBSZARY } from "@/lib/obszary";
import { Wybor } from "@/components/ui/wybor";

// Układ kafelkowy zbliżony do mapy Małopolski (kolumna, wiersz).
const POZYCJE: Record<string, [number, number]> = {
  "powiat olkuski": [1, 0], "powiat miechowski": [2, 0], "powiat proszowicki": [3, 0],
  "powiat chrzanowski": [0, 1], "powiat krakowski": [1, 1], "powiat m. Kraków": [2, 1], "powiat wielicki": [3, 1], "powiat brzeski": [4, 1], "powiat dąbrowski": [5, 1],
  "powiat oświęcimski": [0, 2], "powiat wadowicki": [1, 2], "powiat myślenicki": [2, 2], "powiat bocheński": [3, 2], "powiat tarnowski": [4, 2], "powiat m. Tarnów": [5, 2],
  "powiat suski": [1, 3], "powiat nowotarski": [2, 3], "powiat limanowski": [3, 3], "powiat nowosądecki": [4, 3], "powiat gorlicki": [5, 3],
  "powiat tatrzański": [2, 4], "powiat m. Nowy Sącz": [4, 4],
};

type Warstwa = "zgloszenia" | "luki" | "ryzyko";
const WARSTWY: { id: Warstwa; etykieta: string; opis: string }[] = [
  { id: "zgloszenia", etykieta: "Zgłoszenia", opis: "liczba zgłoszeń na 10 tys. mieszkańców (26 tygodni)" },
  { id: "luki", etykieta: "Białe plamy", opis: "wynik luki: zgłoszenia bez dopasowanego rozwiązania" },
  { id: "ryzyko", etykieta: "Ryzyko wg IOSS", opis: "średni z-score wskaźników Obserwatora Statystyk Społecznych (wyżej = gorzej)" },
];

const krotka = (p: string) => p.replace("powiat ", "");
const liczba = (n: number, miejsca = 1) => n.toLocaleString("pl-PL", { minimumFractionDigits: miejsca, maximumFractionDigits: miejsca });

export function Kartogram({ dane }: { dane: RadarDane }) {
  const [warstwa, setWarstwa] = React.useState<Warstwa>("zgloszenia");
  const [obszar, setObszar] = React.useState("wszystkie");

  const wartosci = (warstwa === "zgloszenia" ? dane.aktywnosc : warstwa === "luki" ? dane.lukiPoPowiatach : dane.ryzyko)[obszar];
  const wszystkie = dane.powiaty.map((p) => wartosci[p] ?? 0);
  const min = Math.min(...wszystkie);
  const max = Math.max(...wszystkie);
  const stopien = (v: number) => (max === min ? 0 : Math.min(4, Math.floor(((v - min) / (max - min)) * 4.999)));
  const ciche = new Set(dane.ciche.filter((c) => obszar === "wszystkie" || c.obszar === obszar).map((c) => c.powiat));
  const opis = WARSTWY.find((w) => w.id === warstwa)!;

  return (
    <section aria-labelledby="mapa-h" className="space-y-4">
      <h2 id="mapa-h" className="text-3xl font-bold">
        Mapa potrzeb Małopolski
      </h2>
      <div className="flex flex-wrap gap-6">
        <fieldset className="space-y-1">
          <legend className="font-bold">Warstwa</legend>
          <div className="flex flex-wrap gap-2">
            {WARSTWY.map((w) => (
              <label key={w.id} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border-2 border-fg px-3 has-[:checked]:bg-fg has-[:checked]:text-bg">
                <input type="radio" name="warstwa" checked={warstwa === w.id} onChange={() => setWarstwa(w.id)} className="size-4" />
                {w.etykieta}
              </label>
            ))}
          </div>
        </fieldset>
        <Wybor nazwa="obszar" malaLegenda legenda="Obszar" opcje={[["wszystkie", "Wszystkie obszary"], ...OBSZARY.map((o): [string, string] => [o.id, o.nazwa])]} wartosc={obszar} zmien={setObszar} />
      </div>
      <p className="text-muted">{opis.opis}. Kafelki układają się w przybliżony kształt regionu.</p>

      <ul className="grid max-w-3xl grid-cols-6 gap-1.5 sm:gap-2" aria-label="Kartogram powiatów">
        {dane.powiaty.map((p) => {
          const [kol, wier] = POZYCJE[p] ?? [0, 0];
          const v = wartosci[p] ?? 0;
          return (
            <li
              key={p}
              style={{ gridColumn: kol + 1, gridRow: wier + 1 }}
              className={`kaf-${stopien(v)} flex min-h-20 flex-col justify-between rounded-lg border-2 p-1.5 text-xs leading-tight sm:text-sm ${ciche.has(p) ? "border-dashed border-accent border-4" : "border-line"}`}
            >
              <span className="font-bold">{krotka(p)}</span>
              <span>{warstwa === "ryzyko" ? (v > 0 ? "+" : "") + liczba(v, 2) : liczba(v, warstwa === "luki" ? 1 : 1)}</span>
              {ciche.has(p) && (
                <span className="flex items-center gap-1 font-bold">
                  <VolumeX aria-hidden className="size-3.5 shrink-0" />
                  cicha
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2 text-sm" aria-hidden="true">
        <span>mniej</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`kaf-${i} inline-block h-5 w-8 rounded border border-line`} />
        ))}
        <span>więcej</span>
        <span className="ml-4 inline-flex items-center gap-1 rounded border-4 border-dashed border-accent px-2">
          <VolumeX className="size-4" /> cicha potrzeba: duże ryzyko, mało zgłoszeń
        </span>
      </div>

      <details className="rounded-xl border-2 border-line p-3">
        <summary className="min-h-10 cursor-pointer font-semibold">Dane w tabeli (dla czytników ekranu)</summary>
        <table className="mt-2 w-full text-left">
          <caption className="sr-only">Wartości warstwy {opis.etykieta} dla powiatów</caption>
          <thead>
            <tr>
              <th scope="col" className="p-1">Powiat</th>
              <th scope="col" className="p-1">{opis.etykieta}</th>
              <th scope="col" className="p-1">Cicha potrzeba</th>
            </tr>
          </thead>
          <tbody>
            {dane.powiaty.map((p) => (
              <tr key={p}>
                <th scope="row" className="p-1 font-normal">{krotka(p)}</th>
                <td className="p-1">{liczba(wartosci[p] ?? 0, 2)}</td>
                <td className="p-1">{ciche.has(p) ? "tak" : "nie"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
