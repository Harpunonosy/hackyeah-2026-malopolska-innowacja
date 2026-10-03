"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

export type WebhookWidok = {
  id: string;
  nazwa: string;
  url: string;
  zdarzenia: string[];
  aktywny: boolean;
  dostawy: { zdarzenie: string; status_http: number | null; czas_ms: number | null; blad: string | null; created_at: string }[];
};

const fmt = (d: string) => new Date(d).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "medium" });

export function Webhooki({ lista, zdarzenia }: { lista: WebhookWidok[]; zdarzenia: [string, string][] }) {
  const t = useTranslations("integracje");
  const router = useRouter();
  const [nazwa, setNazwa] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [wybrane, setWybrane] = React.useState<string[]>(["sprawa.nowa", "pomysl.nowy", "nabor.zmiana"]);
  const [sekret, setSekret] = React.useState<string | null>(null);
  const [komunikat, setKomunikat] = React.useState("");
  const [pracuje, setPracuje] = React.useState(false);

  async function wyslij(body: unknown) {
    setPracuje(true);
    setKomunikat("");
    const r = await fetch("/api/admin/webhooki", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setPracuje(false);
    if (!r.ok) return setKomunikat(d.komunikat ?? t("blad"));
    setSekret(d.sekret);
    setNazwa("");
    setUrl("");
    router.refresh();
  }

  async function akcja(id: string, a: "test" | "wlacz" | "wylacz" | "usun") {
    if (a === "usun" && !window.confirm(t("potwierdzUsun"))) return;
    setKomunikat("");
    const r = await fetch(`/api/admin/webhooki/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ akcja: a }) });
    const d = await r.json().catch(() => ({}));
    if (a === "test") setKomunikat(t("wynikTestu", { wynik: d.blad ? d.blad : t("ok", { status: d.status }) }));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <p role="status" className="text-lg font-semibold">{komunikat}</p>
      {sekret && (
        <div className="karta-mala space-y-2 border-2 border-accent p-4">
          <h3 className="text-xl font-bold">{t("sekretTytul")}</h3>
          <p>{t("sekretOpis")}</p>
          <p className="break-all font-mono text-lg">{sekret}</p>
        </div>
      )}
      {lista.length === 0 ? (
        <p className="text-lg">{t("brakWebhookow")}</p>
      ) : (
        <ul className="space-y-4">
          {lista.map((w) => (
            <li key={w.id} className="karta space-y-3 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-2xl font-bold">{w.nazwa}</h3>
                <Chip>{w.aktywny ? t("aktywny") : t("wylaczony")}</Chip>
              </div>
              <p className="break-all font-mono text-sm">{w.url}</p>
              <p><strong>{t("zdarzenia")}:</strong> {w.zdarzenia.join(", ")}</p>
              <div>
                <h4 className="font-bold">{t("ostatnieDostawy")}</h4>
                {w.dostawy.length === 0 ? (
                  <p className="text-muted">{t("brakDostaw")}</p>
                ) : (
                  <ul className="text-sm">
                    {w.dostawy.map((d, i) => (
                      <li key={i} className={d.blad ? "font-semibold text-primary" : "text-ok"}>
                        {fmt(d.created_at)} · {d.zdarzenie} · {d.blad ?? t("status", { status: d.status_http ?? 0 })}{d.czas_ms !== null && <> · {t("czas", { ms: d.czas_ms })}</>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => akcja(w.id, "test")}><Send aria-hidden className="size-5" />{t("wyslijTest")}</Button>
                <Button type="button" wariant="obrys" onClick={() => akcja(w.id, w.aktywny ? "wylacz" : "wlacz")}>{w.aktywny ? t("wylacz") : t("wlacz")}</Button>
                <Button type="button" wariant="obrys" onClick={() => akcja(w.id, "usun")}>{t("usun")}</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        className="karta max-w-3xl space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          wyslij({ nazwa, url, zdarzenia: wybrane });
        }}
      >
        <h3 className="text-2xl font-bold">{t("dodajTytul")}</h3>
        <div className="space-y-1">
          <label htmlFor="wh-nazwa" className="block text-lg font-bold">{t("nazwa")}</label>
          <input id="wh-nazwa" required value={nazwa} onChange={(e) => setNazwa(e.target.value)} className="block min-h-12 w-full max-w-md rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
        </div>
        <div className="space-y-1">
          <label htmlFor="wh-url" className="block text-lg font-bold">{t("url")}</label>
          <input id="wh-url" type="url" required inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} className="block min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-lg font-bold">{t("zdarzenia")}</legend>
          {zdarzenia.map(([z, opis]) => (
            <label key={z} className="flex min-h-12 cursor-pointer items-center gap-3">
              <input type="checkbox" className="size-5" checked={wybrane.includes(z)} onChange={(e) => setWybrane((l) => (e.target.checked ? [...l, z] : l.filter((x) => x !== z)))} />
              <span><span className="font-mono text-sm">{z}</span> · {opis}</span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pracuje || wybrane.length === 0}><Plus aria-hidden className="size-5" />{t("dodaj")}</Button>
          <Button type="button" wariant="obrys" disabled={pracuje} onClick={() => wyslij({ demo: true })}>{t("dodajDemo")}</Button>
        </div>
        <p className="text-sm text-muted">{t("dodajDemoOpis")}</p>
      </form>
    </div>
  );
}
