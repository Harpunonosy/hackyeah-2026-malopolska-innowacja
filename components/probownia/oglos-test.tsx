"use client";
import { apiFetch } from "@/lib/fetch-klient";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OBSZARY } from "@/lib/obszary";
import { POWIATY_IOSS } from "@/lib/powiaty";

const POLE = "block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg";

export function OglosTest() {
  const t = useTranslations("probownia");
  const [otwarty, setOtwarty] = React.useState(false);
  const [luzny, setLuzny] = React.useState("");
  const [f, setF] = React.useState({ tytul: "", opis: "", kogo: "", dostepnosc: "", powiat: "", termin: "", liczbaMiejsc: "5", obszar: "seniorzy", email: "" });
  const [zgoda, setZgoda] = React.useState(false);
  const [ai, setAi] = React.useState<"" | "pracuje" | "ok" | "blad">("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");
  const [numer, setNumer] = React.useState("");
  const ustaw = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  if (numer) {
    return (
      <section role="status" className="karta space-y-3 border-4 border-ok p-6">
        <h3 className="text-2xl font-bold">{t("oglosGotowe")}</h3>
        <p className="font-mono text-3xl font-bold tracking-wider">{numer}</p>
        <Button asChild><Link href={`/moje/${numer}`}>Sprawdź status</Link></Button>
      </section>
    );
  }
  if (!otwarty) return <Button type="button" rozmiar="lg" onClick={() => setOtwarty(true)}>{t("oglosOtworz")}</Button>;

  return (
    <form
      className="karta max-w-3xl space-y-5 p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setStan("pracuje");
        const r = await apiFetch("/api/testy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, zgoda }) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) { setKomunikat(d.komunikat ?? "Nie udało się wysłać ogłoszenia."); return setStan("blad"); }
        setNumer(d.numer);
      }}
    >
      <div className="space-y-2">
        <label htmlFor="ot-luzny" className="block text-xl font-bold">{t("oglosOpisPole")}</label>
        <textarea id="ot-luzny" rows={4} value={luzny} onChange={(e) => setLuzny(e.target.value)} className={POLE} />
        <Button type="button" wariant="zloty" disabled={ai === "pracuje" || luzny.trim().length < 15} onClick={async () => {
          setAi("pracuje");
          const r = await apiFetch("/api/testy/ogloszenie-ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ opis: luzny }) });
          if (!r.ok) return setAi("blad");
          const d = await r.json();
          setF((x) => ({ ...x, tytul: d.tytul, opis: d.opis, kogo: d.kogo, dostepnosc: d.dostepnosc }));
          setAi("ok");
        }}>
          {ai === "pracuje" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}
          {ai === "pracuje" ? t("oglosAiPracuje") : t("oglosAi")}
        </Button>
        <p aria-live="polite" className="text-sm text-muted">{ai === "ok" && t("oglosAiInfo")}{ai === "blad" && "Nie udało się teraz użyć AI. Wypełnij pola ręcznie."}</p>
      </div>
      <div className="space-y-1"><label htmlFor="ot-tytul" className="block text-lg font-bold">{t("oglosTytulPole")}</label><input id="ot-tytul" required value={f.tytul} onChange={ustaw("tytul")} className={POLE} /></div>
      <div className="space-y-1"><label htmlFor="ot-opis" className="block text-lg font-bold">Opis testu</label><textarea id="ot-opis" required rows={4} value={f.opis} onChange={ustaw("opis")} className={POLE} /></div>
      <div className="space-y-1"><label htmlFor="ot-kogo" className="block text-lg font-bold">{t("oglosKogo")}</label><input id="ot-kogo" required value={f.kogo} onChange={ustaw("kogo")} className={POLE} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1"><label htmlFor="ot-powiat" className="block text-lg font-bold">{t("oglosPowiat")}</label><input id="ot-powiat" required list="ot-powiaty" autoComplete="off" value={f.powiat} onChange={ustaw("powiat")} className={POLE} /><datalist id="ot-powiaty">{POWIATY_IOSS.map((p) => <option key={p} value={p.replace("powiat ", "")} />)}</datalist></div>
        <div className="space-y-1"><label htmlFor="ot-termin" className="block text-lg font-bold">{t("oglosTermin")}</label><input id="ot-termin" required value={f.termin} onChange={ustaw("termin")} placeholder="np. 3 spotkania w listopadzie" className={POLE} /></div>
        <div className="space-y-1"><label htmlFor="ot-miejsca" className="block text-lg font-bold">{t("oglosMiejsca")}</label><input id="ot-miejsca" inputMode="numeric" required value={f.liczbaMiejsc} onChange={(e) => setF({ ...f, liczbaMiejsc: e.target.value.replace(/\D/g, "").slice(0, 3) })} className={POLE} /></div>
        <div className="space-y-1"><label htmlFor="ot-dost" className="block text-lg font-bold">{t("oglosDostepnosc")}</label><input id="ot-dost" value={f.dostepnosc} onChange={ustaw("dostepnosc")} className={POLE} /></div>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-lg font-bold">{t("oglosObszar")}</legend>
        <div className="flex flex-wrap gap-2">
          {OBSZARY.map((o) => (
            <label key={o.id} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
              <input type="radio" name="ot-obszar" checked={f.obszar === o.id} onChange={() => setF({ ...f, obszar: o.id })} className="size-4 accent-current" />{o.nazwa}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-1">
        <label htmlFor="ot-email" className="block text-lg font-bold">Adres e-mail (nieobowiązkowo)</label>
        <input id="ot-email" type="email" autoComplete="email" value={f.email} onChange={ustaw("email")} className={POLE} />
      </div>
      <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} className="mt-1.5 size-6 accent-current" /><span className="text-lg">Zgadzam się na przekazanie tego ogłoszenia do ROPS i jego publikację po akceptacji.</span></label>
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
      <Button type="submit" rozmiar="lg" disabled={!zgoda || stan === "pracuje"}>{t("oglosWyslij")}</Button>
    </form>
  );
}
