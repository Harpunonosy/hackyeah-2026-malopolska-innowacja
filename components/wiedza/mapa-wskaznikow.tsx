"use client";

import * as React from "react";
import { OBSZARY } from "@/lib/obszary";
import type { WskaznikMapy } from "@/lib/wiedza";
import { POZYCJE_KAFELKOW } from "@/components/wiedza/uklad";

const krotka = (p: string) => p.replace("powiat ", "");
const liczba = (n: number) => n.toLocaleString("pl-PL", { maximumFractionDigits: 2 });

export function MapaWskaznikow({ powiaty, obszary }: { powiaty: string[]; obszary: Record<string, WskaznikMapy[]> }) {
  const [obszar, setObszar] = React.useState("seniorzy");
  const [wskId, setWskId] = React.useState<number | null>(null);
  const lista = obszary[obszar] ?? [];
  const wsk = lista.find((w) => w.id === wskId) ?? lista[0];
  const wart = powiaty.map((p) => wsk?.wartosci[p] ?? 0);
  const min = Math.min(...wart);
  const max = Math.max(...wart);
  const stopien = (v: number) => (max === min ? 0 : Math.min(4, Math.floor(((v - min) / (max - min)) * 4.999)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <label htmlFor="mw-obszar" className="block font-bold">Obszar</label>
          <select id="mw-obszar" value={obszar} onChange={(e) => { setObszar(e.target.value); setWskId(null); }} className="min-h-12 rounded-xl border-2 border-line bg-card px-3 text-lg hover:border-fg">
            {OBSZARY.map((o) => <option key={o.id} value={o.id}>{o.nazwa}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="mw-wsk" className="block font-bold">Wskaźnik</label>
          <select id="mw-wsk" value={wsk?.id} onChange={(e) => setWskId(Number(e.target.value))} className="min-h-12 max-w-full rounded-xl border-2 border-line bg-card px-3 text-lg hover:border-fg">
            {lista.map((w) => <option key={w.id} value={w.id}>{w.nazwa}</option>)}
          </select>
        </div>
      </div>
      <ul className="grid max-w-3xl grid-cols-6 gap-1.5 sm:gap-2" aria-label="Wartości wskaźnika w powiatach">
        {powiaty.map((p) => {
          const [kol, wier] = POZYCJE_KAFELKOW[p] ?? [0, 0];
          const v = wsk?.wartosci[p];
          return (
            <li key={p} style={{ gridColumn: kol + 1, gridRow: wier + 1 }} className={`kaf-${v === undefined ? 0 : stopien(v)} flex min-h-20 flex-col justify-between rounded-lg border-2 border-line p-1.5 text-xs leading-tight sm:text-sm`}>
              <span className="font-bold">{krotka(p)}</span>
              <span>{v === undefined ? "brak" : liczba(v)}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-muted">Im ciemniejszy kafelek, tym wyższa wartość wskaźnika. Źródło: Internetowy Obserwator Statystyk Społecznych ROPS, najnowszy rok.</p>
    </div>
  );
}
