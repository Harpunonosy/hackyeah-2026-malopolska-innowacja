"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wybor } from "@/components/ui/wybor";
import { SEKTORY, type Sektor } from "@/lib/siec-stale";

const pole = "block min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg";

/** Formularz „Dołącz do sieci”: wpis czeka na weryfikację ROPS, e-mail nie jest publiczny. */
export function DolaczDoSieci({ obszary }: { obszary: [string, string][] }) {
  const t = useTranslations("siec");
  const [nazwa, setNazwa] = React.useState("");
  const [sektor, setSektor] = React.useState<Sektor>("ngo");
  const [powiat, setPowiat] = React.useState("");
  const [wybrane, setWybrane] = React.useState<string[]>([]);
  const [oferuje, setOferuje] = React.useState("");
  const [szuka, setSzuka] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [zgoda, setZgoda] = React.useState(false);
  const [stan, setStan] = React.useState<"" | "wysyla" | "ok" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");

  if (stan === "ok") return <p role="status" className="karta-mala border-2 border-ok p-5 text-lg font-semibold">{t("dolaczono")}</p>;

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setStan("wysyla");
        const r = await fetch("/api/siec", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nazwa, sektor, powiat: powiat || undefined, obszary: wybrane, oferuje, szuka: szuka || undefined, email, zgoda }) }).catch(() => null);
        const d = r ? await r.json().catch(() => ({})) : {};
        if (r?.ok) return setStan("ok");
        setKomunikat(d.komunikat ?? t("blad"));
        setStan("blad");
      }}
    >
      <div className="space-y-1">
        <label htmlFor="sd-nazwa" className="block text-lg font-bold">{t("nazwa")}</label>
        <input id="sd-nazwa" required minLength={3} value={nazwa} onChange={(e) => setNazwa(e.target.value.slice(0, 160))} autoComplete="organization" className={pole} />
      </div>
      <Wybor nazwa="sd-sektor" legenda={t("sektorLegenda")} opcje={SEKTORY.map((s): [Sektor, string] => [s, t(`sektor_${s}`)])} wartosc={sektor} zmien={setSektor} />
      <div className="space-y-1">
        <label htmlFor="sd-powiat" className="block text-lg font-bold">{t("powiat")}</label>
        <input id="sd-powiat" value={powiat} onChange={(e) => setPowiat(e.target.value.slice(0, 60))} className={`${pole} max-w-sm`} />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-lg font-bold">{t("obszarLegenda")}</legend>
        <div className="flex flex-wrap gap-2">
          {obszary.map(([id, n]) => (
            <label key={id} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
              <input type="checkbox" className="size-4" checked={wybrane.includes(id)} onChange={(e) => setWybrane((l) => (e.target.checked ? [...l, id] : l.filter((x) => x !== id)))} />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-1">
        <label htmlFor="sd-oferuje" className="block text-lg font-bold">{t("oferujePole")}</label>
        <textarea id="sd-oferuje" required minLength={10} rows={3} value={oferuje} onChange={(e) => setOferuje(e.target.value.slice(0, 600))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
      </div>
      <div className="space-y-1">
        <label htmlFor="sd-szuka" className="block text-lg font-bold">{t("szukaPole")}</label>
        <textarea id="sd-szuka" rows={2} value={szuka} onChange={(e) => setSzuka(e.target.value.slice(0, 600))} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
      </div>
      <div className="space-y-1">
        <label htmlFor="sd-email" className="block text-lg font-bold">{t("email")}</label>
        <input id="sd-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 120))} className={`${pole} max-w-md`} />
      </div>
      <label className="flex min-h-12 cursor-pointer items-start gap-3 text-lg">
        <input type="checkbox" required checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} className="mt-1.5 size-5 shrink-0" />
        {t("zgoda")}
      </label>
      <Button type="submit" disabled={stan === "wysyla" || !zgoda}><UserPlus aria-hidden className="size-5" />{t("dolacz")}</Button>
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
    </form>
  );
}
