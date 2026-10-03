"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Pytanie({ eksperci }: { eksperci: { id: string; nazwa: string }[] }) {
  const t = useTranslations("rynek");
  const [tekst, setTekst] = React.useState("");
  const [doKogo, setDoKogo] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [zgoda, setZgoda] = React.useState(false);
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad" | "ok">("");
  const [numer, setNumer] = React.useState("");
  const [komunikat, setKomunikat] = React.useState("");

  if (stan === "ok") {
    return (
      <section role="status" className="karta space-y-3 border-4 border-ok p-6">
        <h3 className="text-2xl font-bold">{t("gotowe")}</h3>
        <p>{t("numerPomoc")}</p>
        <p className="font-mono text-3xl font-bold tracking-wider">{numer}</p>
        <Button asChild><Link href={`/moje/${numer}`}>{t("sprawdz")}</Link></Button>
      </section>
    );
  }

  return (
    <form
      id="pytanie"
      className="karta space-y-5 p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setStan("pracuje");
        const r = await fetch("/api/zgloszenia", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tekst: (doKogo ? `[Pytanie do: ${doKogo}] ` : "[Pytanie do ROPS] ") + tekst, zgoda, email: email || undefined, kanal: "web" }),
        });
        const d = await r.json();
        if (!r.ok) { setKomunikat(d.komunikat ?? t("blad")); return setStan("blad"); }
        setNumer(d.numer);
        setStan("ok");
      }}
    >
      <div className="space-y-1">
        <label htmlFor="ry-pytanie" className="block text-xl font-bold">{t("pytanie")}</label>
        <textarea id="ry-pytanie" rows={5} value={tekst} onChange={(e) => setTekst(e.target.value.slice(0, 1500))} placeholder={t("pytaniePlaceholder")} className="block w-full rounded-xl border-2 border-line bg-card p-4 text-lg hover:border-fg" />
      </div>
      <div className="space-y-1">
        <label htmlFor="ry-kogo" className="block text-lg font-bold">{t("doKogo")}</label>
        <select id="ry-kogo" value={doKogo} onChange={(e) => setDoKogo(e.target.value)} className="block min-h-12 w-full max-w-md rounded-xl border-2 border-line bg-card px-3 text-lg hover:border-fg">
          <option value="">{t("rops")}</option>
          {eksperci.map((x) => <option key={x.id} value={x.nazwa}>{x.nazwa}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="ry-email" className="block text-lg font-bold">{t("email")}</label>
        <input id="ry-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block min-h-12 w-full max-w-md rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
      </div>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} className="mt-1.5 size-6 accent-current" />
        <span className="text-lg">{t("zgoda")}</span>
      </label>
      <Button type="submit" rozmiar="lg" disabled={!zgoda || tekst.trim().length < 5 || stan === "pracuje"}>{stan === "pracuje" ? t("wysylam") : t("wyslij")}</Button>
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
    </form>
  );
}
