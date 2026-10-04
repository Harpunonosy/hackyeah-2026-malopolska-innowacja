"use client";
import { apiFetch } from "@/lib/fetch-klient";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Szczegoly } from "@/components/ui/szczegoly";
import kanwa from "@/data/kanwa_inno_agh.json";

export type KanwaPelnaStan = Record<string, string>;
type Opcja = string | { wartosc: number; etykieta: string; opis?: string };
type Pole = { id: string; nazwa: string; pytanie?: string; opis?: string; typ: string; opcje?: Opcja[]; pytania_pomocnicze?: string[]; pole_tekstowe?: string };
type Sekcja = { id: string; nazwa: string; opis?: string; pytanie?: string; pola: Pole[]; status_partnera?: string[]; skala_wplywu?: Opcja[] };
const sekcje: Sekcja[] = kanwa.arkusze.flatMap<Sekcja>(a => a.sekcje as Sekcja[]);
const liczbaPol = sekcje.reduce((n, s) => n + s.pola.length, 0);
const klasaPola = "block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg";

export function KanwaPelna({ stan, zmien, fiszkaTekst }: { stan: KanwaPelnaStan; zmien: (s: KanwaPelnaStan) => void; fiszkaTekst: string }) {
  const t = useTranslations("pracownia");
  const [pracuje, setPracuje] = React.useState<string | null>(null);
  const [blad, setBlad] = React.useState("");
  const [opcjeAI, setOpcjeAI] = React.useState<Record<string, string[]>>({});
  const wpisz = (id: string, wartosc: string) => zmien({ ...stan, [id]: wartosc.slice(0, 3000) });
  async function pomoz(p: Pole, grupa: string) {
    setPracuje(p.id); setBlad("");
    const r = await apiFetch("/api/pracownia/asystent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tryb: "podpowiedz", fiszka: fiszkaTekst, pole: grupa, pytanie: p.pytanie ?? p.nazwa }) });
    setPracuje(null);
    if (!r.ok) { setBlad(t("blad")); return; }
    const d = await r.json();
    setOpcjeAI(o => ({ ...o, [p.id]: Array.isArray(d.opcje) ? d.opcje.filter((x: unknown) => typeof x === "string").slice(0, 3) : [] }));
  }
  return <section className="space-y-6" aria-labelledby="h-kanwa-pelna">
    <div><h3 id="h-kanwa-pelna" className="text-xl font-bold">{t("kanwaPelna")}</h3><p className="text-muted">{t("kanwaPelnaOpis")}</p></div>
    <div lang="pl" className="space-y-2">
      <p>Możesz wypełniać sekcje w dowolnej kolejności, bez pomocy AI. Zacznij od tych, na które znasz odpowiedź.</p>
      <p role="status">Uzupełnione pola: {sekcje.flatMap(s => s.pola).filter(p => stan[p.id]?.trim()).length} z {liczbaPol}.</p>
      <a href={kanwa.url}>Oryginalna kanwa INNO AGH (PDF, 3 strony)</a>
    </div>
    {blad && <p role="alert">{blad}</p>}
    {sekcje.map((s, nr) => <div key={s.id} lang="pl"><Szczegoly poziom={3} tytul={`${nr + 1}. ${s.nazwa}`} className="shadow-none">
      <div className="space-y-6">
        {(s.opis || s.pytanie) && <p>{s.opis ?? s.pytanie}</p>}
        {s.status_partnera && <p>Przy każdym partnerze dopisz status: {s.status_partnera.join(", ")}.</p>}
        {s.pola.map(p => {
          const skala = p.typ === "skala_1_4";
          const opcje = p.opcje ?? s.skala_wplywu ?? [];
          const limit = p.typ === "wybor_max_3_z_wlasnymi" ? 3 : Infinity;
          const wybrane = (stan[p.id] ?? "").split(";").map(x => x.trim()).filter(Boolean);
          const inne = wybrane.filter(x => !opcje.includes(x)).join("; ");
          const przełącz = (v: string, checked: boolean) => wpisz(p.id, (checked ? [...wybrane, v] : wybrane.filter(x => x !== v)).slice(0, limit).join("; "));
          return <fieldset key={p.id} className="space-y-3 rounded-xl border border-line p-4">
            <legend className="px-2 font-bold">{p.nazwa}</legend>
            {p.pytanie && <p>{p.pytanie}</p>}{p.opis && <p>{p.opis}</p>}
            {p.pytania_pomocnicze && <ul className="list-disc pl-5">{p.pytania_pomocnicze.map(q => <li key={q}>{q}</li>)}</ul>}
            {Number.isFinite(limit) && <p>Wybierz lub wpisz łącznie do 3 odpowiedzi. Własne odpowiedzi oddziel średnikiem.</p>}
            {opcje.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{opcje.map(o => {
              const v = typeof o === "string" ? o : String(o.wartosc);
              const etykieta = typeof o === "string" ? o : o.etykieta;
              return <label key={v} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line p-3 has-[:checked]:bg-primary-soft has-[:focus-visible]:outline-2">
                <input type={skala ? "radio" : "checkbox"} name={`kp-${p.id}`} value={v} checked={skala ? stan[p.id] === v : wybrane.includes(v)} disabled={!skala && !wybrane.includes(v) && wybrane.length >= limit} onChange={e => skala ? wpisz(p.id, v) : przełącz(v, e.target.checked)} className="mt-1 size-5 shrink-0 accent-primary" />
                <span>{etykieta}{typeof o !== "string" && o.opis && <span className="block text-sm text-muted">{o.opis}</span>}</span>
              </label>;
            })}</div>}
            {skala ? <>
              {stan[p.id] && <button type="button" className="min-h-11 underline" onClick={() => wpisz(p.id, "")}>Wyczyść wybór</button>}
              {p.pole_tekstowe && <><label htmlFor={`kp-${p.id}-opis`} className="block font-semibold">{p.pole_tekstowe}</label><textarea id={`kp-${p.id}-opis`} maxLength={3000} rows={2} value={stan[`${p.id}_opis`] ?? ""} onChange={e => wpisz(`${p.id}_opis`, e.target.value)} className={klasaPola} /></>}
            </> : <>
              <label htmlFor={`kp-${p.id}`} className="block font-semibold">{opcje.length ? "Własna odpowiedź" : p.nazwa}</label>
              <textarea id={`kp-${p.id}`} rows={2} maxLength={3000} value={opcje.length ? stan[`${p.id}_wlasne`] ?? inne : stan[p.id] ?? ""} onChange={e => {
                if (!opcje.length) wpisz(p.id, e.target.value);
                else { const gotowe = wybrane.filter(x => opcje.includes(x)); const wlasne = e.target.value.split(";").slice(0, limit - gotowe.length).join(";"); zmien({ ...stan, [p.id]: [...gotowe, ...wlasne.split(";").map(x => x.trim()).filter(Boolean)].join("; "), [`${p.id}_wlasne`]: wlasne }); }
              }} className={klasaPola} />
              <Button type="button" wariant="cichy" disabled={pracuje !== null} onClick={() => pomoz(p, s.nazwa)}>{pracuje === p.id ? "Przygotowuję podpowiedzi…" : t("niewiem")}</Button>
              {opcjeAI[p.id]?.length > 0 && <div className="space-y-2"><p>Podpowiedzi AI — sprawdź, czy pasują do Twojego pomysłu:</p><ul className="list-disc pl-5">{opcjeAI[p.id].map(o => <li key={o}>{o}</li>)}</ul></div>}
            </>}
          </fieldset>;
        })}
      </div>
    </Szczegoly></div>)}
    <button type="button" className="min-h-12 rounded-full border-2 border-fg px-4 font-semibold hover:bg-fg hover:text-bg" onClick={() => window.print()}>{t("drukujKanwe")}</button>
  </section>;
}
