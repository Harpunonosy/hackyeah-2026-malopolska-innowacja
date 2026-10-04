"use client";
import { apiFetch } from "@/lib/fetch-klient";

import * as React from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { Building2, Home, GraduationCap, HeartHandshake, Heart, Loader2, MessagesSquare, PenTool, Phone, Printer, Smartphone, Sparkles, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Postep } from "@/components/ui/postep";

type Szkic = { rodzaj: "przedmiot" | "usluga" | "aplikacja" | "miejsce"; nazwa: string; opis_wygladu: string; czesci: { nazwa: string; funkcja: string }[]; materialy: string[]; warianty: string[]; svg: string | null };
const svgDoUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
type Kadr = { tytul: string; kto: string; gdzie: string; co_sie_dzieje: string; emocja: string; ikona: string };
const IKONY: Record<string, React.ElementType> = { dom: Home, spotkanie: Users, telefon: Phone, serce: Heart, miasto: Building2, szkola: GraduationCap, lekarz: Stethoscope, rodzina: Users, aplikacja: Smartphone, wsparcie: HeartHandshake };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function Asystent({ fiszkaTekst, tytul, opis, wskazniki, numer }: { fiszkaTekst: string; tytul: string; opis: string; wskazniki: { nazwa: string; v: number; max: number }[]; numer: string | null }) {
  const t = useTranslations("pracownia");
  const [pytanie, setPytanie] = React.useState("");
  const [odpowiedz, setOdpowiedz] = React.useState<{ pytanie: string; odpowiedz: string }[]>([]);
  const [kolejne, setKolejne] = React.useState<string[]>([]);
  const [stan, setStan] = React.useState<"" | "pytanie" | "scenorys" | "szkic" | "blad">("");
  const [szkic, setSzkic] = React.useState<Szkic | null>(null);
  const naglowekSzkicu = React.useRef<HTMLHeadingElement>(null);
  const [kadry, setKadry] = React.useState<Kadr[] | null>(null);
  const gotowe = t.raw("asystentPytania") as string[];

  async function zapytaj(p: string) {
    if (p.trim().length < 3) return;
    setStan("pytanie");
    const r = await apiFetch("/api/pracownia/asystent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tryb: "pytanie", fiszka: fiszkaTekst, pytanie: p }) });
    if (!r.ok) return setStan("blad");
    const d = await r.json();
    setOdpowiedz((o) => [...o, { pytanie: p, odpowiedz: d.odpowiedz }]);
    setKolejne(d.kolejnePytania ?? []);
    setPytanie("");
    setStan("");
  }
  async function generujScenorys() {
    setStan("scenorys");
    const r = await apiFetch("/api/pracownia/asystent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tryb: "scenorys", fiszka: fiszkaTekst }) });
    if (!r.ok) return setStan("blad");
    setKadry((await r.json()).kadry);
    setStan("");
  }
  async function narysuj() {
    setStan("szkic");
    const r = await apiFetch("/api/pracownia/asystent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tryb: "szkic", fiszka: fiszkaTekst }) });
    if (!r.ok) return setStan("blad");
    setSzkic(await r.json());
    setStan("");
    requestAnimationFrame(() => naglowekSzkicu.current?.focus());
  }
  async function drukujPlakat() {
    const link = typeof window !== "undefined" ? (numer ? `${window.location.origin}/moje/${numer}` : window.location.origin) : "";
    const qr = await QRCode.toDataURL(link, { margin: 1, width: 220 });
    const okno = window.open("", "_blank");
    if (!okno) return;
    okno.document.write(`<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Plakat pomysłu: ${esc(tytul)}</title><style>
      body{font-family:system-ui,Arial,sans-serif;margin:24mm;color:#14213d} h1{font-size:34pt;margin:0 0 6pt} .opis{font-size:15pt;margin-bottom:14pt}
      .wsk{display:flex;gap:10pt;margin:10pt 0}.wsk div{flex:1;border:2px solid #14213d;border-radius:8pt;padding:8pt;font-size:11pt}.wsk b{display:block;font-size:20pt}
      .kadry{display:grid;grid-template-columns:1fr 1fr;gap:8pt}.kadr{border:2px solid #14213d;border-radius:8pt;padding:8pt;font-size:11pt}.kadr h3{margin:0 0 4pt;font-size:13pt}
      .qr{display:flex;align-items:center;gap:12pt;margin-top:14pt;font-size:11pt}.stopka{margin-top:10pt;font-size:9pt;color:#555}</style></head><body>
      <h1>${esc(tytul)}</h1><div class="opis">${esc(opis)}</div>
      <div class="wsk">${wskazniki.map((w) => `<div>${esc(w.nazwa)}<b>${w.v}/${w.max}</b></div>`).join("")}</div>
      ${szkic?.svg ? `<div style="display:flex;gap:12pt;align-items:flex-start;margin:10pt 0"><img src="${svgDoUrl(szkic.svg)}" alt="${esc(szkic.opis_wygladu)}" style="width:60%;border:2px solid #14213d;border-radius:8pt"><div style="font-size:11pt"><b>${esc(szkic.nazwa)}</b><ul>${szkic.czesci.map((c) => `<li><b>${esc(c.nazwa)}</b>: ${esc(c.funkcja)}</li>`).join("")}</ul></div></div>` : ""}
      ${kadry ? `<div class="kadry">${kadry.map((k, i) => `<div class="kadr"><h3>${i + 1}. ${esc(k.tytul)}</h3><div><b>${esc(k.kto)}</b>, ${esc(k.gdzie)}</div><div>${esc(k.co_sie_dzieje)}</div><div><i>Czuje: ${esc(k.emocja)}</i></div></div>`).join("")}</div>` : ""}
      <div class="qr"><img src="${qr}" width="110" height="110" alt="Kod QR do pomysłu"><div>Zeskanuj, aby sprawdzić status pomysłu${numer ? ` (numer ${esc(numer)})` : ""} w Splocie.</div></div>
      <div class="stopka">Plakat przygotowany w Splocie, Małopolski Hub Innowacji Społecznych. Treści scenorysu i oceny przygotowano z pomocą AI.</div>
      <script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
    okno.document.close();
  }

  return (
    <section className="karta space-y-5 p-6" aria-labelledby="h-asystent">
      <div>
        <h2 id="h-asystent" className="text-2xl font-bold">{t("asystent")}</h2>
        <p className="text-muted">{t("asystentOpis")}</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("asystentGotowe")}>
        {gotowe.map((g) => <Button key={g} type="button" wariant="obrys" disabled={stan === "pytanie"} onClick={() => zapytaj(g)}>{g}</Button>)}
      </div>
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); void zapytaj(pytanie); }}>
        <div className="min-w-0 basis-64 flex-1 space-y-1">
          <label htmlFor="as-pytanie" className="block font-bold">{t("asystentWlasne")}</label>
          <input id="as-pytanie" value={pytanie} onChange={(e) => setPytanie(e.target.value)} className="block min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
        </div>
        <Button type="submit" disabled={stan === "pytanie" || pytanie.trim().length < 3}>{stan === "pytanie" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <MessagesSquare aria-hidden className="size-5" />}{t("zapytaj")}</Button>
      </form>
      <div aria-live="polite" className="space-y-3">
        {odpowiedz.map((o) => (
          <div key={o.pytanie + o.odpowiedz.slice(0, 20)} className="karta-mala space-y-1 p-4">
            <p className="font-bold">{o.pytanie}</p>
            <p className="whitespace-pre-line text-lg">{o.odpowiedz}</p>
            <p className="text-sm text-muted">{t("odpowiedzAi")}</p>
          </div>
        ))}
        {kolejne.length > 0 && <div className="flex flex-wrap gap-2">{kolejne.map((k) => <Button key={k} type="button" wariant="cichy" onClick={() => zapytaj(k)}>{k}</Button>)}</div>}
        {stan === "blad" && <p role="alert" className="font-semibold text-primary">{t("asystentBlad")}</p>}
      </div>

      <div className="space-y-3 border-t-2 border-line-soft pt-5">
        <h3 className="text-xl font-bold">{t("scenorysTytul")}</h3>
        <p className="text-muted">{t("scenorysOpis")}</p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" wariant="zloty" disabled={stan === "scenorys"} onClick={generujScenorys}>{stan === "scenorys" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}{stan === "scenorys" ? t("scenorysPracuje") : t("scenorysPrzycisk")}</Button>
          <Button type="button" wariant="obrys" onClick={drukujPlakat}><Printer aria-hidden className="size-5" />{t("plakat")}</Button>
        </div>
        {stan === "scenorys" && <Postep kroki={t("scenorysPostepKroki")} sekund={20} />}
        {kadry && (
          <ol className="grid gap-4 sm:grid-cols-2" aria-label={t("scenorysTytul")}>
            {kadry.map((k, i) => {
              const Ikona = IKONY[k.ikona] ?? Heart;
              return (
                <li key={k.tytul + i} className="karta-mala flex gap-4 border-2 border-fg p-4">
                  <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-fg"><Ikona className="size-8" /></span>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold"><span className="text-primary">{t("kadr", { n: i + 1 })}:</span> {k.tytul}</h4>
                    <p><strong>{k.kto}</strong>, {k.gdzie}</p>
                    <p>{k.co_sie_dzieje}</p>
                    <p className="text-sm font-semibold text-muted">{t("czuje")}: {k.emocja}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {kadry && <p className="text-sm text-muted">{t("scenorysAi")}</p>}
      </div>

      <div className="space-y-3 border-t-2 border-line-soft pt-5">
        <h3 className="text-xl font-bold">{t("szkicTytul")}</h3>
        <p className="text-muted">{t("szkicOpis")}</p>
        <Button type="button" wariant="zloty" disabled={stan === "szkic"} onClick={narysuj}>{stan === "szkic" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <PenTool aria-hidden className="size-5" />}{stan === "szkic" ? t("szkicPracuje") : t("szkicPrzycisk")}</Button>
        {stan === "szkic" && <Postep kroki={t("szkicPostepKroki")} sekund={25} />}
        {szkic && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <figure className="space-y-2">
              {szkic.svg ? (
                // eslint-disable-next-line @next/next/no-img-element -- szkic SVG jako data URL (bez wykonywania skryptów)
                <img src={svgDoUrl(szkic.svg)} alt={szkic.opis_wygladu} className="w-full rounded-2xl border-2 border-fg bg-white" />
              ) : (
                <p className="karta-mala p-4">{t("szkicBrakRysunku")}</p>
              )}
              <figcaption className="text-sm text-muted">{szkic.svg ? szkic.opis_wygladu : ""} {t("szkicAi")}</figcaption>
              {szkic.svg && <a href={svgDoUrl(szkic.svg)} download="szkic-pomyslu.svg" className="inline-flex min-h-12 items-center font-semibold underline">{t("szkicPobierz")}</a>}
            </figure>
            <div className="space-y-3">
              <h4 ref={naglowekSzkicu} tabIndex={-1} className="text-xl font-bold outline-none"><span className="text-sm font-bold uppercase text-muted">{t(`szkicRodzaj_${szkic.rodzaj}`)}</span><span className="block">{szkic.nazwa}</span></h4>
              <p className="font-bold">{t("szkicCzesci")}</p>
              <dl className="space-y-2">{szkic.czesci.map((c) => <div key={c.nazwa}><dt className="font-semibold">{c.nazwa}</dt><dd className="text-muted">{c.funkcja}</dd></div>)}</dl>
              {szkic.materialy.length > 0 && <p><strong>{t("szkicMaterialy")}:</strong> {szkic.materialy.join(", ")}</p>}
              {szkic.warianty.length > 0 && <><p className="font-bold">{t("szkicWarianty")}</p><ul className="list-disc space-y-1 pl-6">{szkic.warianty.map((w) => <li key={w}>{w}</li>)}</ul></>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
