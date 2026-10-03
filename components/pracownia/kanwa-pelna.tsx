"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Szczegoly } from "@/components/ui/szczegoly";

export type KanwaPelnaStan = Record<string, string>;
const POLA: { grupa: string; pola: { id: string; pytanie: string }[] }[] = [
  { grupa: "Odbiorcy", pola: [
    { id: "glowny_uzytkownik", pytanie: "Komu to rozwiązanie ma realnie pomóc?" },
    { id: "klient_platnik", pytanie: "Kto wyciąga portfel albo uruchamia budżet, żeby rozwiązanie działało?" },
    { id: "decydent", pytanie: "Czyja zgoda lub rekomendacja jest potrzebna, żeby rozwiązanie mogło działać?" }] },
  { grupa: "Propozycja wartości", pola: [
    { id: "wartosc_emocjonalna", pytanie: "Co odbiorcy poczują dzięki rozwiązaniu? (maks. 2-3 rzeczy)" },
    { id: "wartosc_funkcjonalna", pytanie: "Co rozwiązanie konkretnie poprawi? (maks. 2-3 rzeczy)" }] },
  { grupa: "Kanały", pola: [
    { id: "kanaly_bezposrednie", pytanie: "Jak ludzie trafiają do Was bezpośrednio?" },
    { id: "kanaly_posrednie", pytanie: "Kto może pomóc Wam dotrzeć do odbiorców?" }] },
  { grupa: "Konstelacja partnerów", pola: [
    { id: "partnerzy_taniej", pytanie: "Jacy partnerzy mogą obniżać koszty rozwiązania?" },
    { id: "partnerzy_dotrzec", pytanie: "Jacy partnerzy mogą wspierać komunikację i dotarcie do odbiorców?" },
    { id: "partnerzy_wartosc", pytanie: "Jacy partnerzy mogą wzmacniać propozycję wartości?" }] },
];

export function KanwaPelna({ stan, zmien, fiszkaTekst }: { stan: KanwaPelnaStan; zmien: (s: KanwaPelnaStan) => void; fiszkaTekst: string }) {
  const t = useTranslations("pracownia");
  const [pracuje, setPracuje] = React.useState<string | null>(null);
  const [opcje, setOpcje] = React.useState<Record<string, string[]>>({});
  async function pomoz(id: string, grupa: string, pytanie: string) {
    setPracuje(id);
    const r = await fetch("/api/pracownia/asystent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tryb: "podpowiedz", fiszka: fiszkaTekst, pole: grupa, pytanie }) });
    setPracuje(null);
    if (r.ok) {
      const d = await r.json();
      setOpcje((o) => ({ ...o, [id]: d.opcje ?? [] }));
    }
  }
  return (
    <section className="space-y-6" aria-labelledby="h-kanwa-pelna">
      <div>
        <h3 id="h-kanwa-pelna" className="text-xl font-bold">{t("kanwaPelna")}</h3>
        <p className="text-muted">{t("kanwaPelnaOpis")}</p>
      </div>
      {POLA.map((g) => (
        <Szczegoly key={g.grupa} poziom={3} tytul={g.grupa} className="shadow-none"><fieldset className="space-y-4">
          <legend className="sr-only">{g.grupa}</legend>
          {g.pola.map((p) => (
            <div key={p.id} className="space-y-2">
              <label htmlFor={`kp-${p.id}`} className="block font-semibold">{p.pytanie}</label>
              <textarea id={`kp-${p.id}`} rows={2} value={stan[p.id] ?? ""} onChange={(e) => zmien({ ...stan, [p.id]: e.target.value })} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg" />
              <Button type="button" wariant="cichy" disabled={pracuje === p.id} onClick={() => pomoz(p.id, g.grupa, p.pytanie)}>
                {pracuje === p.id ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}{t("niewiem")}
              </Button>
              {(opcje[p.id]?.length ?? 0) > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label={t("propozycje")}>
                  {opcje[p.id].map((o) => <li key={o}><Button type="button" wariant="obrys" onClick={() => zmien({ ...stan, [p.id]: stan[p.id] ? `${stan[p.id]}; ${o}` : o })}>{o}</Button></li>)}
                </ul>
              )}
            </div>
          ))}
        </fieldset></Szczegoly>
      ))}
      <button type="button" className="min-h-12 rounded-full border-2 border-fg px-4 font-semibold hover:bg-fg hover:text-bg" onClick={() => window.print()}>{t("drukujKanwe")}</button>
    </section>
  );
}
