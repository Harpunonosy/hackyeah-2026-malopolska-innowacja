"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const SKALA = [
  ["1", "😞"], ["2", "🙁"], ["3", "😐"], ["4", "🙂"], ["5", "😀"],
] as const;

export function Opinia({ innowacjaId }: { innowacjaId: string }) {
  const t = useTranslations("opinia");
  const [ocena, setOcena] = React.useState(0);
  const [latwe, setLatwe] = React.useState("");
  const [trudne, setTrudne] = React.useState("");
  const [polecilbys, setPolecilbys] = React.useState<"tak" | "nie" | "moze">("tak");
  const [propozycja, setPropozycja] = React.useState("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "ok" | "blad">("");

  if (stan === "ok") return <p role="status" className="karta p-6 text-lg font-bold text-ok">{t("dzieki")}</p>;

  return (
    <form
      className="karta space-y-5 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!ocena) return;
        setStan("pracuje");
        const r = await fetch("/api/opinie", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ innowacjaId, ocena, latwe, trudne, polecilbys, propozycja }) });
        setStan(r.ok ? "ok" : "blad");
      }}
    >
      <div>
        <h2 className="text-2xl font-bold">{t("tytul")}</h2>
        <p className="text-muted">{t("opis")}</p>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-lg font-bold">{t("skala")}</legend>
        <div className="flex flex-wrap gap-2">
          {SKALA.map(([n, e]) => (
            <label key={n} className="flex min-h-16 min-w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-line-soft bg-card px-3 py-2 text-center hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
              <input type="radio" name="ocena" value={n} checked={ocena === Number(n)} onChange={() => setOcena(Number(n))} className="sr-only" />
              <span aria-hidden className="text-2xl">{e}</span>
              <span className="text-sm font-bold">{t(`o${n}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {([["latwe", t("latwe"), latwe, setLatwe], ["trudne", t("trudne"), trudne, setTrudne], ["propozycja", t("propozycja"), propozycja, setPropozycja]] as const).map(([id, et, w, set]) => (
        <div key={id} className="space-y-1">
          <label htmlFor={`op-${id}`} className="block text-lg font-bold">{et}</label>
          <textarea id={`op-${id}`} rows={2} value={w} onChange={(e) => set(e.target.value.slice(0, 800))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
        </div>
      ))}
      <fieldset className="space-y-2">
        <legend className="text-lg font-bold">{t("polecilbys")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["tak", "nie", "moze"] as const).map((v) => (
            <label key={v} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
              <input type="radio" name="polecilbys" checked={polecilbys === v} onChange={() => setPolecilbys(v)} className="size-4 accent-current" />
              {t(v)}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" disabled={!ocena || stan === "pracuje"}>{stan === "pracuje" ? t("wysylam") : t("wyslij")}</Button>
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">{t("blad")}</p>}
    </form>
  );
}
