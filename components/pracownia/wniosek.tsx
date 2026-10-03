"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type Nabor = { id: string; nazwa: string; temat: string | null; przyklad: boolean } | null;
type Pole = { nr: number; pole: string; podpowiedz: string; tresc: string; doUzupelnienia: boolean };

export function Wniosek({ dane }: { dane: string }) {
  const t = useTranslations("pracownia");
  const [nabor, setNabor] = React.useState<Nabor | undefined>(undefined);
  const [pola, setPola] = React.useState<Pole[] | null>(null);
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad" | "zlozony">("");

  React.useEffect(() => {
    let ok = true;
    fetch("/api/nabory/aktywny").then((r) => r.json()).then((d) => ok && setNabor(d.nabor)).catch(() => ok && setNabor(null));
    return () => { ok = false; };
  }, []);

  if (nabor === undefined) return null;
  if (!nabor) {
    return (
      <section className="karta-mala space-y-1 border-dashed p-5" aria-labelledby="h-wn">
        <h2 id="h-wn" className="text-xl font-bold">{t("wniosek")}</h2>
        <p className="text-muted">{t("wniosekBrak")}</p>
        <Button type="button" disabled className="mt-2">{t("przygotujWniosek")}</Button>
      </section>
    );
  }

  return (
    <section className="karta space-y-4 p-6" aria-labelledby="h-wn">
      <h2 id="h-wn" className="text-2xl font-bold">{t("wniosek")}</h2>
      <p className="text-lg"><strong>{t("wniosekOtwarty", { nazwa: nabor.nazwa })}</strong>{nabor.przyklad && <span className="block text-sm text-muted">{t("wniosekPrzykład")}</span>}</p>
      {!pola && (
        <Button type="button" rozmiar="lg" disabled={stan === "pracuje"} onClick={async () => {
          setStan("pracuje");
          const r = await fetch("/api/pracownia/wniosek", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ naborId: nabor.id, dane }) });
          if (!r.ok) return setStan("blad");
          setPola((await r.json()).pola);
          setStan("");
        }}>
          {stan === "pracuje" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <FileText aria-hidden className="size-5" />}
          {t("przygotujWniosek")}
        </Button>
      )}
      <div aria-live="polite">
        {stan === "pracuje" && <p className="text-lg">{t("wniosekPracuje")}</p>}
        {stan === "blad" && <p role="alert" className="font-semibold text-primary">{t("wniosekBlad")}</p>}
      </div>
      {pola && (
        <div className="space-y-5">
          <p className="karta-mala border-2 border-accent p-3">{t("wniosekPomoc")}</p>
          {pola.map((p) => (
            <div key={p.nr} className="space-y-1">
              <label htmlFor={`w-${p.nr}`} className="block text-lg font-bold">{p.nr}. {p.pole}{p.doUzupelnienia && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-sm text-accent-fg">{t("doUzup")}</span>}</label>
              <p className="text-sm text-muted">{p.podpowiedz}</p>
              <textarea id={`w-${p.nr}`} rows={4} value={p.tresc} onChange={(e) => setPola((l) => l && l.map((x) => (x.nr === p.nr ? { ...x, tresc: e.target.value } : x)))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg" />
              <p className="text-right text-xs text-muted">{t("znaki", { n: p.tresc.length })}</p>
            </div>
          ))}
          <div className="nie-drukuj flex flex-wrap gap-3">
            {stan === "zlozony" ? <p role="status" className="font-bold text-ok">{t("zlozony")}</p> : (
              <Button type="button" onClick={async () => {
                const r = await fetch("/api/pracownia/wniosek", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ naborId: nabor.id, pola: pola.map((x) => ({ nr: x.nr, tresc: x.tresc })) }) });
                setStan(r.ok ? "zlozony" : "blad");
              }}>{t("zlozWniosek")}</Button>
            )}
            <Button type="button" wariant="obrys" onClick={() => window.print()}><Printer aria-hidden className="size-5" />{t("drukujWniosek")}</Button>
          </div>
        </div>
      )}
    </section>
  );
}
