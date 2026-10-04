"use client";
import { apiFetch } from "@/lib/fetch-klient";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogowanieEksperta({ eksperci }: { eksperci: { id: string; nazwa: string; opis: string }[] }) {
  const router = useRouter();
  const [id, setId] = React.useState(eksperci[0]?.id ?? "");
  const [pass, setPass] = React.useState("");
  const [blad, setBlad] = React.useState(false);
  return (
    <form
      className="karta max-w-2xl space-y-5 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await apiFetch("/api/ekspert/logowanie", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, haslo: pass }) });
        if (r.ok) router.refresh(); else setBlad(true);
      }}
    >
      <fieldset className="space-y-2">
        <legend className="text-xl font-bold">Wybierz profil eksperta (konto demo)</legend>
        {eksperci.map((x) => (
          <label key={x.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-2 border-line-soft bg-card p-3 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
            <input type="radio" name="ekspert" checked={id === x.id} onChange={() => setId(x.id)} className="mt-1.5 size-4 accent-current" />
            <span><span className="block font-bold">{x.nazwa}</span><span className="block text-sm">{x.opis}</span></span>
          </label>
        ))}
      </fieldset>
      <div className="space-y-1">
        <label htmlFor="eks-haslo" className="block text-lg font-bold">Hasło demonstracyjne</label>
        <p id="eks-haslo-info" className="text-muted">Hasło otrzymasz od koordynatora Hubu. Każdy ekspert widzi tylko przypisane mu sprawy.</p>
        <input id="eks-haslo" type="password" autoComplete="current-password" aria-describedby="eks-haslo-info" value={pass} onChange={(e) => { setPass(e.target.value); setBlad(false); }} className="block min-h-12 w-full max-w-sm rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
      </div>
      {blad && <p role="alert" className="font-semibold text-primary">Nieprawidłowe hasło.</p>}
      <Button type="submit">Wejdź do panelu eksperta</Button>
    </form>
  );
}

export function WylogujEksperta() {
  const router = useRouter();
  return <Button type="button" wariant="obrys" onClick={async () => { await apiFetch("/api/ekspert/wyloguj", { method: "POST" }); router.refresh(); }}>Wyloguj</Button>;
}
