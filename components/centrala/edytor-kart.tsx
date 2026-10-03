"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Karta = { nazwa: string; na_czym_polega: string; problem: string; grupa_docelowa: string; kto_moze_skorzystac: string; czy_to_dziala: string; autor_organizacja: string };
const POLA: [keyof Karta, string, number][] = [
  ["nazwa", "Nazwa", 1], ["na_czym_polega", "Na czym polega rozwiązanie?", 4], ["problem", "Jakich problemów dotyczy?", 3], ["grupa_docelowa", "Odbiorcy", 2],
  ["kto_moze_skorzystac", "Kto może skorzystać (wdrożyć)?", 3], ["czy_to_dziala", "Czy to działa?", 3], ["autor_organizacja", "Autor (organizacja)", 1],
];
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l");

export function EdytorKart({ pozycje }: { pozycje: { id: string; nazwa: string }[] }) {
  const router = useRouter();
  const [fraza, setFraza] = React.useState("");
  const [id, setId] = React.useState<string | null>(null);
  const [karta, setKarta] = React.useState<Karta | null>(null);
  const [info, setInfo] = React.useState("");
  const trafione = fraza.trim().length >= 2 ? pozycje.filter((p) => fold(p.nazwa).includes(fold(fraza.trim()))).slice(0, 8) : [];

  async function otworz(nowyId: string) {
    setId(nowyId); setInfo("");
    const r = await fetch(`/api/admin/innowacje/${nowyId}`);
    if (r.ok) setKarta(await r.json());
  }
  return (
    <div className="karta space-y-4 p-6">
      <div className="space-y-1">
        <label htmlFor="ek-szukaj" className="block text-lg font-bold">Znajdź innowację do edycji</label>
        <input id="ek-szukaj" value={fraza} onChange={(e) => setFraza(e.target.value)} placeholder="Zacznij pisać nazwę" className="block min-h-12 w-full max-w-md rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
      </div>
      {trafione.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {trafione.map((p) => <li key={p.id}><Button type="button" wariant={id === p.id ? "glowny" : "obrys"} onClick={() => otworz(p.id)}>{p.nazwa}</Button></li>)}
        </ul>
      )}
      {karta && id && (
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const r = await fetch(`/api/admin/innowacje/${id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(karta) });
          setInfo(r.ok ? "Zapisano. Zmiana działa od razu w Bibliotece i w Swatce, a wpis trafił do dziennika." : "Nie udało się zapisać (uzupełnij wszystkie pola).");
          if (r.ok) router.refresh();
        }}>
          {POLA.map(([k, e, w]) => (
            <div key={k} className="space-y-1">
              <label htmlFor={`ek-${k}`} className="block font-bold">{e}</label>
              <textarea id={`ek-${k}`} rows={w} value={karta[k]} onChange={(ev) => setKarta({ ...karta, [k]: ev.target.value })} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg" />
            </div>
          ))}
          <Button type="submit">Zapisz zmiany</Button>
        </form>
      )}
      <p role="status" className="font-semibold">{info}</p>
    </div>
  );
}
