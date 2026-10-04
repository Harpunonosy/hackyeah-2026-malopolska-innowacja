"use client";
import { apiFetch } from "@/lib/fetch-klient";

import * as React from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type Odp = { odpowiedz: string; brakDanych: boolean; zrodla: { tekst: string; zrodlo: string; strona: number | null; url?: string }[] };
const PRZYKLADY = ["Ile osób 60+ mieszka w Małopolsce?", "Jakie problemy mają opiekunowie rodzinni?", "Ile gmin nie ma dziennego domu pomocy?"];

export function Zapytaj() {
  const [pytanie, setPytanie] = React.useState("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [odp, setOdp] = React.useState<Odp | null>(null);
  async function wyslij(p: string) {
    setStan("pracuje");
    setOdp(null);
    const r = await apiFetch("/api/wiedza/zapytaj", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pytanie: p }) });
    if (!r.ok) return setStan("blad");
    setOdp(await r.json());
    setStan("");
  }
  return (
    <div className="space-y-4">
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); void wyslij(pytanie); }}>
        <div className="min-w-64 flex-1 space-y-1">
          <label htmlFor="zap-p" className="block text-lg font-bold">Twoje pytanie o kondycję Małopolski</label>
          <input id="zap-p" value={pytanie} onChange={(e) => setPytanie(e.target.value)} className="block min-h-14 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
        </div>
        <Button type="submit" rozmiar="lg" disabled={pytanie.trim().length < 5 || stan === "pracuje"}>
          {stan === "pracuje" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Search aria-hidden className="size-5" />}
          Zapytaj raporty
        </Button>
      </form>
      <ul className="flex flex-wrap gap-2">
        {PRZYKLADY.map((p) => <li key={p}><button type="button" onClick={() => { setPytanie(p); void wyslij(p); }} className="min-h-12 rounded-full bg-soft px-4 font-semibold hover:bg-fg hover:text-bg">{p}</button></li>)}
      </ul>
      <div aria-live="polite" className="space-y-3">
        {stan === "blad" && <p role="alert" className="font-semibold text-primary">Nie udało się odpowiedzieć. Spróbuj ponownie.</p>}
        {odp && (
          <div className="karta-mala space-y-3 p-5">
            <p className="text-lg">{odp.odpowiedz}</p>
            {odp.zrodla.length > 0 && (
              <ul className="space-y-1 text-sm text-muted">
                {odp.zrodla.map((z) => <li key={z.tekst}>Źródło: {z.url ? <a href={z.url} target="_blank" rel="noopener noreferrer">{z.zrodlo}</a> : z.zrodlo}{z.strona ? `, s. ${z.strona}` : ""}</li>)}
              </ul>
            )}
            <p className="text-xs text-muted">Odpowiedź przygotowana z pomocą AI wyłącznie na podstawie raportów ROPS, GUS, NIK i Mapy Wyzwań.</p>
          </div>
        )}
      </div>
    </div>
  );
}
