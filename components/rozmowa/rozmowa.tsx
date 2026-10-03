"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RODZAJE_ETYKIETY, type RodzajRozmowy } from "@/lib/rozmowy-etykiety";

export function Rozmowa({ cel, celId, rodzaje, id }: { cel: "fiszka" | "partnerstwo"; celId: string; rodzaje: RodzajRozmowy[]; id: string }) {
  const [otwarty, setOtwarty] = React.useState(false);
  const [rodzaj, setRodzaj] = React.useState<RodzajRozmowy>(rodzaje[0]);
  const [tresc, setTresc] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [zgoda, setZgoda] = React.useState(false);
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");
  const [numer, setNumer] = React.useState("");

  if (numer) {
    return (
      <p role="status" className="karta-mala space-y-1 border-2 border-ok p-4">
        <strong className="block">Wiadomość wysłana.</strong>
        Dane kontaktowe są ukryte, a odpowiedź zobaczysz pod numerem <Link href={`/moje/${numer}`} className="font-mono font-bold">{numer}</Link>.
      </p>
    );
  }
  if (!otwarty) {
    return (
      <div className="flex flex-wrap gap-2">
        {rodzaje.map((r) => (
          <Button key={r} type="button" wariant="obrys" onClick={() => { setRodzaj(r); setOtwarty(true); }}>{RODZAJE_ETYKIETY[r]}</Button>
        ))}
      </div>
    );
  }
  return (
    <form
      className="karta-mala space-y-3 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setStan("pracuje");
        const r = await fetch("/api/rozmowy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cel, celId, rodzaj, tresc, email: email || undefined, zgoda }) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) { setKomunikat(d.komunikat ?? "Nie udało się wysłać."); return setStan("blad"); }
        setNumer(d.numer);
      }}
    >
      {rodzaje.length > 1 && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Rodzaj wiadomości</legend>
          {rodzaje.map((r) => (
            <label key={r} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-3 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
              <input type="radio" name={`rodzaj-${id}`} checked={rodzaj === r} onChange={() => setRodzaj(r)} className="size-4 accent-current" />{RODZAJE_ETYKIETY[r]}
            </label>
          ))}
        </fieldset>
      )}
      <label htmlFor={`rt-${id}`} className="block font-bold">{RODZAJE_ETYKIETY[rodzaj]}: napisz kilka słów</label>
      <textarea id={`rt-${id}`} rows={3} value={tresc} onChange={(e) => setTresc(e.target.value.slice(0, 1200))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
      <label htmlFor={`re-${id}`} className="block font-bold">Adres e-mail (nieobowiązkowo, służy tylko do powiadomień)</label>
      <input id={`re-${id}`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block min-h-12 w-full max-w-md rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
      <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} className="mt-1.5 size-6 accent-current" /><span>Zgadzam się na przekazanie wiadomości autorowi i ROPS. Moje dane kontaktowe pozostają ukryte.</span></label>
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
      <div className="flex gap-2"><Button type="submit" disabled={!zgoda || tresc.trim().length < 5 || stan === "pracuje"}>Wyślij</Button><Button type="button" wariant="obrys" onClick={() => setOtwarty(false)}>Anuluj</Button></div>
    </form>
  );
}
