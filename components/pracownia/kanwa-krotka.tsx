"use client";

import { useTranslations } from "next-intl";
import kanwa from "@/data/kanwa_inno_agh.json";
import type { KanwaPelnaStan } from "@/components/pracownia/kanwa-pelna";

type Opcja = string | { wartosc: number; etykieta: string };
type Pole = { id: string; typ: string; opcje?: Opcja[] };
type Sekcja = { pola: Pole[]; skala_wplywu?: Opcja[] };
const sekcje = kanwa.arkusze.flatMap((a) => a.sekcje as Sekcja[]);

/** Sześć pytań, które najbardziej pomagają ROPS ocenić pomysł. Te same pola co w pełnej kanwie, więc odpowiedzi się nie dublują. */
export const POLA_KROTKIE = ["intensywnosc", "skala", "wspieraja", "utrudniaja", "koszty_stale", "glowny_dochod"] as const;

function znajdz(id: string) {
  for (const s of sekcje) {
    const p = s.pola.find((x) => x.id === id);
    if (p) return { pole: p, opcje: p.opcje ?? s.skala_wplywu ?? [] };
  }
  return null;
}

const klasaWyboru = "flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 py-2 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg";
const klasaPola = "block min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg";

export function KanwaKrotka({ stan, zmien }: { stan: KanwaPelnaStan; zmien: (s: KanwaPelnaStan) => void }) {
  const t = useTranslations("pracownia");
  const wpisz = (zmiana: KanwaPelnaStan) => zmien({ ...stan, ...zmiana });

  return (
    <div className="space-y-6">
      {POLA_KROTKIE.map((id) => {
        const z = znajdz(id);
        if (!z) return null;
        const { pole, opcje } = z;
        const pytanie = t(`krotkie.${id}`);

        if (pole.typ === "skala_1_4") {
          return (
            <fieldset key={id} className="space-y-2">
              <legend className="text-lg font-bold">{pytanie}</legend>
              <div className="flex flex-wrap gap-2">
                {opcje.map((o) => {
                  if (typeof o === "string") return null;
                  const v = String(o.wartosc);
                  return (
                    <label key={v} className={klasaWyboru}>
                      <input type="radio" name={`kk-${id}`} value={v} checked={stan[id] === v} onChange={() => wpisz({ [id]: v })} className="size-4 shrink-0 accent-current" />
                      {o.etykieta}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        }

        if (opcje.length > 0) {
          // Wybór wielokrotny: kliknięcie zaznacza, „Inne” dopisuje własne odpowiedzi (jak w pełnej kanwie).
          const lista = opcje.filter((o): o is string => typeof o === "string");
          const wybrane = (stan[id] ?? "").split(";").map((x) => x.trim()).filter(Boolean);
          const gotowe = wybrane.filter((x) => lista.includes(x));
          const wlasne = stan[`${id}_wlasne`] ?? wybrane.filter((x) => !lista.includes(x)).join("; ");
          const zapisz = (noweGotowe: string[], noweWlasne: string) =>
            wpisz({ [id]: [...noweGotowe, ...noweWlasne.split(";").map((x) => x.trim()).filter(Boolean)].join("; "), [`${id}_wlasne`]: noweWlasne });
          return (
            <fieldset key={id} className="space-y-2">
              <legend className="text-lg font-bold">{pytanie}</legend>
              <p className="text-muted">{t("krotkieWiele")}</p>
              <div className="flex flex-wrap gap-2">
                {lista.map((o) => (
                  <label key={o} className={klasaWyboru}>
                    <input type="checkbox" checked={gotowe.includes(o)} onChange={(e) => zapisz(e.target.checked ? [...gotowe, o] : gotowe.filter((x) => x !== o), wlasne)} className="size-4 shrink-0 accent-current" />
                    {o}
                  </label>
                ))}
              </div>
              <label htmlFor={`kk-${id}-inne`} className="block pt-1 font-semibold">{t("krotkieInne")}</label>
              <input id={`kk-${id}-inne`} type="text" maxLength={500} value={wlasne} onChange={(e) => zapisz(gotowe, e.target.value)} className={klasaPola} />
            </fieldset>
          );
        }

        return (
          <div key={id} className="space-y-2">
            <label htmlFor={`kk-${id}`} className="block text-lg font-bold">{pytanie}</label>
            <input id={`kk-${id}`} type="text" maxLength={500} value={stan[id] ?? ""} onChange={(e) => wpisz({ [id]: e.target.value })} className={klasaPola} />
          </div>
        );
      })}
    </div>
  );
}
