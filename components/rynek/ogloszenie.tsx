"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { OBSZARY } from "@/lib/obszary";

export function DodajOgloszenie() {
  const t = useTranslations("rynek");
  const [szuka, setSzuka] = React.useState<"taniej" | "dotrzec" | "wartosc">("dotrzec");
  const [obszar, setObszar] = React.useState("seniorzy");
  const [tytul, setTytul] = React.useState("");
  const [opis, setOpis] = React.useState("");
  const [powiat, setPowiat] = React.useState("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "ok" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");
  const [numer, setNumer] = React.useState("");

  if (stan === "ok") return <p role="status" className="karta p-5 font-bold text-ok">{t("opublikowano")}{numer && <span className="mt-2 block font-normal text-fg">Numer sprawy: <span className="font-mono font-bold">{numer}</span>. Odpowiedzi zainteresowanych zobaczysz w „Moje sprawy”.</span>}</p>;
  const opcje: ["taniej" | "dotrzec" | "wartosc", string][] = [["taniej", t("szukaTaniej")], ["dotrzec", t("szukaDotrzec")], ["wartosc", t("szukaWartosc")]];
  return (
    <form
      className="karta space-y-4 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setStan("pracuje");
        const r = await fetch("/api/partnerstwa", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tytul, szuka, obszar, powiat, opis }) });
        if (r.ok) { setNumer((await r.json().catch(() => ({}))).numer ?? ""); return setStan("ok"); }
        setKomunikat((await r.json().catch(() => ({}))).komunikat ?? t("blad"));
        setStan("blad");
      }}
    >
      <h3 className="text-2xl font-bold">{t("dodaj")}</h3>
      <fieldset className="space-y-2">
        <legend className="text-lg font-bold">{t("czego")}</legend>
        <div className="flex flex-wrap gap-2">
          {opcje.map(([v, e]) => (
            <label key={v} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
              <input type="radio" name="szuka" checked={szuka === v} onChange={() => setSzuka(v)} className="size-4 accent-current" />
              {e}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-1"><label htmlFor="og-tytul" className="block text-lg font-bold">{t("tytulOgl")}</label><input id="og-tytul" value={tytul} onChange={(e) => setTytul(e.target.value)} className="block min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" /></div>
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1"><label htmlFor="og-obszar" className="block text-lg font-bold">{t("obszarPole")}</label><select id="og-obszar" value={obszar} onChange={(e) => setObszar(e.target.value)} className="block min-h-12 rounded-xl border-2 border-line bg-card px-3 text-lg hover:border-fg">{OBSZARY.map((o) => <option key={o.id} value={o.id}>{o.nazwa}</option>)}</select></div>
        <div className="space-y-1"><label htmlFor="og-powiat" className="block text-lg font-bold">{t("powiatPole")}</label><input id="og-powiat" value={powiat} onChange={(e) => setPowiat(e.target.value)} className="block min-h-12 w-56 rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" /></div>
      </div>
      <div className="space-y-1"><label htmlFor="og-opis" className="block text-lg font-bold">{t("opisOgl")}</label><textarea id="og-opis" rows={3} value={opis} onChange={(e) => setOpis(e.target.value.slice(0, 800))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" /></div>
      <Button type="submit" disabled={tytul.trim().length < 5 || opis.trim().length < 10 || stan === "pracuje"}>{t("opublikuj")}</Button>
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
    </form>
  );
}
