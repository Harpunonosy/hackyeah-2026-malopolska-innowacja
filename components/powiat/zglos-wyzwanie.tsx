"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OBSZARY } from "@/lib/obszary";

export function ZglosWyzwanie({ powiat }: { powiat: string }) {
  const [obszar, setObszar] = React.useState("seniorzy");
  const [opis, setOpis] = React.useState("");
  const [skala, setSkala] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [zgoda, setZgoda] = React.useState(false);
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");
  const [numer, setNumer] = React.useState("");

  if (numer) {
    return <p role="status" className="karta border-4 border-ok p-5"><strong className="block text-xl">Wyzwanie zgłoszone.</strong>Numer sprawy: <Link href={`/moje/${numer}`} className="font-mono font-bold">{numer}</Link>. ROPS odpowie w systemie.</p>;
  }
  return (
    <form className="karta space-y-4 p-6" onSubmit={async (e) => {
      e.preventDefault();
      setStan("pracuje");
      const r = await fetch("/api/wyzwania", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ powiat, obszar, opis, skala, email: email || undefined, zgoda }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setKomunikat(d.komunikat ?? "Nie udało się wysłać."); return setStan("blad"); }
      setNumer(d.numer);
    }}>
      <fieldset className="space-y-2">
        <legend className="text-lg font-bold">Obszar wyzwania</legend>
        <div className="flex flex-wrap gap-2">
          {OBSZARY.map((o) => (
            <label key={o.id} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
              <input type="radio" name="wz-obszar" checked={obszar === o.id} onChange={() => setObszar(o.id)} className="size-4 accent-current" />{o.nazwa}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-1"><label htmlFor="wz-opis" className="block text-lg font-bold">Opisz wyzwanie</label><textarea id="wz-opis" rows={4} value={opis} onChange={(e) => setOpis(e.target.value.slice(0, 1200))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" /></div>
      <div className="space-y-1"><label htmlFor="wz-skala" className="block text-lg font-bold">Ilu osób dotyczy? (szacunek)</label><input id="wz-skala" inputMode="numeric" value={skala} onChange={(e) => setSkala(e.target.value.replace(/\D/g, "").slice(0, 6))} className="block min-h-12 w-40 rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" /></div>
      <div className="space-y-1"><label htmlFor="wz-email" className="block text-lg font-bold">Adres e-mail instytucji (nieobowiązkowo)</label><input id="wz-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block min-h-12 w-full max-w-md rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" /></div>
      <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} className="mt-1.5 size-6 accent-current" /><span className="text-lg">Zgadzam się na przekazanie zgłoszenia do ROPS.</span></label>
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
      <Button type="submit" disabled={!zgoda || opis.trim().length < 10 || stan === "pracuje"}>Zgłoś wyzwanie</Button>
    </form>
  );
}
