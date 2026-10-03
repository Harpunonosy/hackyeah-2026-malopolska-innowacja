"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Szkic = { nazwa: string; kategoria: string; na_czym_polega: string; problem: string; grupa_docelowa: string; kto_moze_skorzystac: string; czy_to_dziala: string; autor_organizacja: string };
const POLA: [keyof Szkic, string, number][] = [
  ["nazwa", "Nazwa innowacji", 1], ["na_czym_polega", "1. Na czym polega rozwiązanie?", 4], ["problem", "2. Jakich problemów dotyczy?", 3],
  ["grupa_docelowa", "3. Do kogo jest skierowane (odbiorcy)?", 2], ["kto_moze_skorzystac", "4. Kto może skorzystać (wdrożyć)?", 3], ["czy_to_dziala", "5. Czy to działa?", 3], ["autor_organizacja", "6. Autor (organizacja)", 1],
];

export function ImportInnowacji({ kategorie }: { kategorie: string[] }) {
  const router = useRouter();
  const [tekst, setTekst] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "zapis">("");
  const [blad, setBlad] = React.useState("");
  const [szkic, setSzkic] = React.useState<Szkic | null>(null);

  async function importuj(e: React.FormEvent) {
    e.preventDefault();
    setStan("pracuje");
    setBlad("");
    const r = await fetch("/api/admin/innowacje/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tekst, url }) });
    const d = await r.json();
    setStan("");
    if (!r.ok) return setBlad(d.komunikat ?? "Nie udało się przygotować karty. Spróbuj ponownie.");
    setSzkic(d.szkic);
  }
  async function zapisz(publikuj: boolean) {
    if (!szkic) return;
    setStan("zapis");
    const r = await fetch("/api/admin/innowacje", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...szkic, url, publikuj }) });
    setStan("");
    if (!r.ok) return setBlad((await r.json().catch(() => ({}))).komunikat ?? "Nie udało się zapisać.");
    setSzkic(null); setTekst(""); setUrl("");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {!szkic ? (
        <form onSubmit={importuj} className="karta space-y-4 p-6">
          <div className="space-y-1">
            <label htmlFor="im-url" className="block text-lg font-bold">Adres strony ROPS (nieobowiązkowo)</label>
            <input id="im-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://rops.krakow.pl/…" className="block min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
          </div>
          <div className="space-y-1">
            <label htmlFor="im-tekst" className="block text-lg font-bold">Albo wklej tekst (opis z PDF, folderu lub strony)</label>
            <textarea id="im-tekst" rows={7} value={tekst} onChange={(e) => setTekst(e.target.value.slice(0, 14000))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg" />
          </div>
          <Button type="submit" rozmiar="lg" disabled={stan === "pracuje" || (!tekst.trim() && !url.trim())}>
            {stan === "pracuje" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}
            Przygotuj kartę z pomocą AI
          </Button>
          <div aria-live="polite">{blad && <p role="alert" className="font-semibold text-primary">{blad}</p>}</div>
        </form>
      ) : (
        <div className="karta space-y-4 p-6">
          <p className="karta-mala border-2 border-accent p-3">Karta przygotowana z pomocą AI. Sprawdź i popraw każde pole przed publikacją.</p>
          <div className="space-y-1">
            <label htmlFor="im-kat" className="block text-lg font-bold">Kategoria</label>
            <select id="im-kat" value={szkic.kategoria} onChange={(e) => setSzkic({ ...szkic, kategoria: e.target.value })} className="min-h-12 rounded-xl border-2 border-line bg-card px-3 text-lg hover:border-fg">
              {kategorie.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          {POLA.map(([k, e, w]) => (
            <div key={k} className="space-y-1">
              <label htmlFor={`im-${k}`} className="block text-lg font-bold">{e}</label>
              <textarea id={`im-${k}`} rows={w} value={szkic[k]} onChange={(ev) => setSzkic({ ...szkic, [k]: ev.target.value })} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg" />
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button type="button" disabled={stan === "zapis"} onClick={() => zapisz(true)}>Opublikuj w Bibliotece</Button>
            <Button type="button" wariant="obrys" disabled={stan === "zapis"} onClick={() => zapisz(false)}>Zapisz jako szkic</Button>
            <Button type="button" wariant="cichy" onClick={() => setSzkic(null)}>Anuluj</Button>
          </div>
          <div aria-live="polite">{blad && <p role="alert" className="font-semibold text-primary">{blad}</p>}</div>
        </div>
      )}
    </div>
  );
}

export function AkcjeDodanej({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const ustaw = async (s: "opublikowana" | "szkic") => { await fetch(`/api/admin/innowacje/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: s }) }); router.refresh(); };
  return (
    <div className="flex flex-wrap gap-2">
      {status === "opublikowana" ? <Button type="button" wariant="obrys" onClick={() => ustaw("szkic")}>Wycofaj z Biblioteki</Button> : <Button type="button" onClick={() => ustaw("opublikowana")}>Opublikuj</Button>}
      <Button type="button" wariant="cichy" onClick={async () => { await fetch(`/api/admin/innowacje/${id}`, { method: "DELETE" }); router.refresh(); }}>Usuń</Button>
    </div>
  );
}
