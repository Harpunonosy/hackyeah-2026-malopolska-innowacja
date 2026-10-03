"use client";

import * as React from "react";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type Kandydat = { id: string; numer: string; powiat: string | null; streszczenie: string; trafnosc: number; dlaczego: string };
type Odbiorcy = { obszar: string | null; kandydaci: Kandydat[]; bialePlamy: { powiat: string; n: number }[] };

export function Odbiorcy({ id }: { id: string }) {
  const [stan, setStan] = React.useState<"" | "szukam" | "blad" | "wyslano">("");
  const [o, setO] = React.useState<Odbiorcy | null>(null);
  const [wybrani, setWybrani] = React.useState<Set<string>>(new Set());
  const [ile, setIle] = React.useState(0);

  if (!o) {
    return (
      <div className="space-y-2">
        <Button type="button" wariant="zloty" disabled={stan === "szukam"} onClick={async () => {
          setStan("szukam");
          const r = await fetch(`/api/admin/innowacje/${id}/odbiorcy`);
          if (!r.ok) return setStan("blad");
          const d = (await r.json()) as Odbiorcy;
          setO(d);
          setWybrani(new Set(d.kandydaci.map((k) => k.id)));
          setStan("");
        }}>
          {stan === "szukam" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Users aria-hidden className="size-5" />}
          {stan === "szukam" ? "Szukam…" : "Kogo ta innowacja może ucieszyć?"}
        </Button>
        {stan === "blad" && <p role="alert" className="font-semibold text-primary">Nie udało się teraz sprawdzić. Spróbuj ponownie.</p>}
      </div>
    );
  }
  return (
    <div className="karta-mala w-full space-y-3 p-4" aria-live="polite">
      <p className="text-lg font-bold">Pasuje do {o.kandydaci.length} otwartych zgłoszeń i {o.bialePlamy.length} białych plam</p>
      {o.bialePlamy.length > 0 && <p className="text-muted">Białe plamy w tym obszarze: {o.bialePlamy.map((b) => `${b.powiat} (${b.n} zgłoszeń)`).join(", ")}.</p>}
      <ul className="space-y-2">
        {o.kandydaci.map((k) => (
          <li key={k.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-line-soft p-3 hover:border-fg">
              <input type="checkbox" checked={wybrani.has(k.id)} onChange={(e) => { const s = new Set(wybrani); if (e.target.checked) s.add(k.id); else s.delete(k.id); setWybrani(s); }} className="mt-1.5 size-5 accent-current" />
              <span><span className="block font-mono text-sm font-bold">{k.numer} · {k.powiat?.replace("powiat ", "") ?? "bez powiatu"} · {k.trafnosc}/100</span><span className="block">{k.streszczenie}</span><span className="block text-sm text-muted">{k.dlaczego}</span></span>
            </label>
          </li>
        ))}
      </ul>
      {stan === "wyslano" ? <p role="status" className="font-bold text-ok">Powiadomiono autorów: {ile}.</p> : (
        <Button type="button" disabled={wybrani.size === 0} onClick={async () => {
          const r = await fetch(`/api/admin/innowacje/${id}/odbiorcy`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kandydaci: o.kandydaci.filter((k) => wybrani.has(k.id)).map((k) => ({ id: k.id, trafnosc: k.trafnosc, dlaczego: k.dlaczego })) }) });
          if (r.ok) { setIle((await r.json()).powiadomiono); setStan("wyslano"); }
        }}>Powiadom wybranych autorów ({wybrani.size})</Button>
      )}
    </div>
  );
}
