"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wybor } from "@/components/ui/wybor";

/** JST prosi eksperta o opinię planu wdrożenia (moduł V i VII: eksperci doradzają samorządom). */
export function KonsultacjaPlanu({ planId, eksperci, polecany }: { planId: string; eksperci: { id: string; nazwa: string }[]; polecany: string | null }) {
  const t = useTranslations("krawiec");
  const [ekspert, setEkspert] = React.useState(polecany ?? eksperci[0]?.id ?? "");
  const [pytanie, setPytanie] = React.useState(t("konsultacjaPrzyklad"));
  const [email, setEmail] = React.useState("");
  const [numer, setNumer] = React.useState<string | null>(null);
  const [blad, setBlad] = React.useState("");
  const [pracuje, setPracuje] = React.useState(false);

  if (numer) {
    return (
      <p role="status" className="text-lg font-semibold text-ok">
        {t("konsultacjaWyslano", { numer })} <Link href={`/moje/${numer}`} className="underline">{t("konsultacjaStatus")}</Link>
      </p>
    );
  }
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPracuje(true);
        setBlad("");
        const r = await fetch("/api/krawiec/konsultacja", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ planId, ekspertId: ekspert, pytanie, email }) }).catch(() => null);
        const d = r ? await r.json().catch(() => ({})) : {};
        setPracuje(false);
        if (r?.ok) setNumer(d.numer);
        else setBlad(d.komunikat ?? t("konsultacjaBlad"));
      }}
    >
      <p className="text-muted">{t("konsultacjaOpis")}</p>
      <Wybor nazwa="konsultacja-ekspert" legenda={t("konsultacjaEkspert")} opcje={eksperci.map((x): [string, string] => [x.id, x.id === polecany ? `${x.nazwa} (${t("konsultacjaPolecany")})` : x.nazwa])} wartosc={ekspert} zmien={setEkspert} />
      <div className="space-y-1">
        <label htmlFor="kons-pytanie" className="block text-lg font-bold">{t("konsultacjaPytanie")}</label>
        <textarea id="kons-pytanie" required minLength={10} rows={3} value={pytanie} onChange={(e) => setPytanie(e.target.value.slice(0, 1200))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
      </div>
      <div className="space-y-1">
        <label htmlFor="kons-email" className="block text-lg font-bold">{t("konsultacjaEmail")}</label>
        <input id="kons-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block min-h-12 w-full max-w-md rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
      </div>
      <Button type="submit" disabled={pracuje || !ekspert}><Send aria-hidden className="size-5" />{t("konsultacjaWyslij")}</Button>
      {blad && <p role="alert" className="font-semibold text-primary">{blad}</p>}
    </form>
  );
}
