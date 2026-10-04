"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, CircleX, Loader2, Pencil, Sparkles } from "lucide-react";
import { Mikrofon } from "@/components/a11y/mikrofon";
import { Button } from "@/components/ui/button";
import { Postep } from "@/components/ui/postep";
import { Szczegoly } from "@/components/ui/szczegoly";
import { Kanwa, wskaznikiDojrzalosci, type KanwaStan } from "@/components/pracownia/kanwa";
import { Asystent } from "@/components/pracownia/asystent";
import { KanwaPelna, type KanwaPelnaStan } from "@/components/pracownia/kanwa-pelna";
import { Wniosek } from "@/components/pracownia/wniosek";
import type { WynikAnalizy } from "@/lib/pracownia";

const ETAPY = ["pomysl", "prototyp", "przetestowane", "gotowe"] as const;
type PoleFiszki = Exclude<keyof WynikAnalizy["fiszka"], "etap">;
const LIMITY: Record<PoleFiszki, number> = { tytul: 160, krotki_opis: 600, istota: 1200, dla_kogo: 400 };

export function FormularzPomyslu() {
  const t = useTranslations("pracownia");
  const jezyk = useLocale();
  const etykietySzczegolow = { rozwin: t("rozwinSzczegoly"), zwin: t("zwinSzczegoly") };
  const [opis, setOpis] = React.useState("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");
  const [wynik, setWynik] = React.useState<WynikAnalizy | null>(null);
  const [fiszka, setFiszka] = React.useState<WynikAnalizy["fiszka"] | null>(null);
  const [kanwa, setKanwa] = React.useState<KanwaStan | null>(null);
  const [pelna, setPelna] = React.useState<KanwaPelnaStan>({});
  const [numer, setNumer] = React.useState<string | null>(null);
  const [wysylka, setWysylka] = React.useState<"" | "wysylam" | "ok" | "blad">("");
  const [edycja, setEdycja] = React.useState(false);
  const [bledyPol, setBledyPol] = React.useState<PoleFiszki[]>([]);
  const naglowekFiszki = React.useRef<HTMLHeadingElement>(null);
  const maFiszke = !!fiszka;
  React.useEffect(() => {
    if (maFiszke) naglowekFiszki.current?.focus();
  }, [maFiszke, wynik]);

  async function analizuj(e: React.FormEvent) {
    e.preventDefault();
    if (stan === "pracuje" || wysylka === "wysylam") return;
    setStan("pracuje");
    setKomunikat("");
    try {
      const r = await fetch("/api/pracownia/analiza", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ opis }) });
      const d = await r.json();
      if (!r.ok) {
        setKomunikat(d.komunikat ?? t("blad"));
        return setStan("blad");
      }
      setWynik(d);
      setFiszka(d.fiszka);
      setKanwa(d.kanwa);
      setNumer(null);
      setWysylka("");
      setBledyPol([]);
      setEdycja(false);
      setStan("");
    } catch {
      setKomunikat(t("blad"));
      setStan("blad");
    }
  }

  function sprawdzFiszke() {
    if (!fiszka) return false;
    const bledy = (Object.keys(LIMITY) as PoleFiszki[]).filter((k) => fiszka[k].trim().length < 3 || fiszka[k].trim().length > LIMITY[k]);
    setBledyPol(bledy);
    if (bledy.length) {
      setEdycja(true);
      requestAnimationFrame(() => document.getElementById(`f-${bledy[0]}`)?.focus());
    }
    return bledy.length === 0;
  }

  async function wyslij() {
    if (stan === "pracuje" || wysylka === "wysylam" || !fiszka || !sprawdzFiszke()) return;
    setWysylka("wysylam");
    try {
      const r = await fetch("/api/pracownia/fiszka", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kanwa: { ...(kanwa ?? {}), pelna }, tytul: fiszka.tytul, opis: fiszka.krotki_opis, istota: fiszka.istota, dla_kogo: fiszka.dla_kogo, etap: fiszka.etap, oceny: wynik?.oceny, podobne: wynik?.podobne }),
      });
      if (!r.ok) throw new Error("wysylka");
      setNumer((await r.json()).numer ?? null);
      setWysylka("ok");
      setEdycja(false);
    } catch {
      setWysylka("blad");
    }
  }

  function trybReczny() {
    setFiszka({ tytul: "", krotki_opis: "", istota: "", dla_kogo: "", etap: "pomysl" });
    setWynik(null);
    setKanwa(null);
    setPelna({});
    setNumer(null);
    setWysylka("");
    setBledyPol([]);
    setEdycja(true);
  }

  const tekstFiszki = fiszka ? `Tytuł: ${fiszka.tytul}. Opis: ${fiszka.krotki_opis}. Na czym polega: ${fiszka.istota}. Dla kogo: ${fiszka.dla_kogo}. Etap: ${fiszka.etap}.` : "";

  const pole = (id: PoleFiszki, etykieta: string, wiersze = 2) => (
    <div className="space-y-1">
      <label htmlFor={`f-${id}`} className="block text-lg font-bold">{etykieta}</label>
      <textarea id={`f-${id}`} rows={wiersze} maxLength={LIMITY[id]} disabled={wysylka === "wysylam" || stan === "pracuje"} value={fiszka?.[id] ?? ""} aria-invalid={bledyPol.includes(id) || undefined} aria-describedby={bledyPol.includes(id) ? "fiszka-blad" : undefined} onChange={(e) => { setFiszka((f) => (f ? { ...f, [id]: e.target.value } : f)); setBledyPol((b) => b.filter((p) => p !== id)); }} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
    </div>
  );

  const formularzOpisu = (
      <form onSubmit={analizuj} className="space-y-4">
        <label htmlFor="pomysl" className="block text-xl font-bold">{t("poleEtykieta")}</label>
        <p id="pomysl-pomoc" className="text-muted">{t("polePomoc")}</p>
        <textarea id="pomysl" aria-describedby="pomysl-pomoc" rows={4} value={opis} onChange={(e) => setOpis(e.target.value.slice(0, 2500))} placeholder={t("placeholder")} className="block w-full rounded-xl border-2 border-line bg-card p-4 text-lg hover:border-fg" />
        <div className="flex flex-wrap items-start gap-3">
          <Mikrofon jezyk={jezyk} etykieta={t("powiedz")} onZdanie={(z) => setOpis((p) => (p ? `${p} ${z}` : z).slice(0, 2500))} />
          <Button type="submit" rozmiar="lg" disabled={opis.trim().length < 20 || stan === "pracuje" || wysylka === "wysylam"}>
            {stan === "pracuje" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}
            {t("analizuj")}
          </Button>
        </div>
        {!fiszka && <p><Button type="button" wariant="cichy" disabled={stan === "pracuje"} onClick={trybReczny}>{t("trybReczny")}</Button></p>}
        <div>
          {stan === "pracuje" && <Postep kroki={t("postepKroki")} sekund={40} />}
          {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
        </div>
      </form>
  );

  return (
    <div className="max-w-4xl space-y-6">
      {fiszka ? <Szczegoly tytul={t("zmienOpis")}>{formularzOpisu}</Szczegoly> : <div className="karta p-6 sm:p-8">{formularzOpisu}</div>}

      {fiszka && (
        <div className="space-y-6">
          <section className="karta space-y-4 p-6" aria-labelledby="h-fiszka">
            <h2 ref={naglowekFiszki} tabIndex={-1} id="h-fiszka" className="text-2xl font-bold">{t("fiszka")}</h2>
            <p className="text-sm text-muted">{wynik ? t("oznaczenie") : t("trybRecznyInfo")}</p>
            {edycja ? <div className="space-y-4">
            {pole("tytul", t("tytulPole"), 1)}
            {pole("krotki_opis", t("opisPole"))}
            {pole("istota", t("istotaPole"), 3)}
            {pole("dla_kogo", t("kogoPole"))}
            <fieldset className="space-y-2">
              <legend className="text-lg font-bold">{t("etapPole")}</legend>
              <div className="flex flex-wrap gap-2">
                {ETAPY.map((e) => (
                  <label key={e} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
                    <input type="radio" name="etap" disabled={wysylka === "wysylam" || stan === "pracuje"} checked={fiszka.etap === e} onChange={() => setFiszka({ ...fiszka, etap: e })} className="size-4 accent-current" />
                    {t(`etap.${e}`)}
                  </label>
                ))}
              </div>
            </fieldset>
              <Button type="button" wariant="obrys" disabled={wysylka === "wysylam" || stan === "pracuje"} onClick={() => { if (sprawdzFiszke()) setEdycja(false); }}>{t("zakonczPoprawki")}</Button>
            </div> : <div className="space-y-4">
              <h3 className="text-2xl font-bold">{fiszka.tytul}</h3>
              <p className="max-w-prose text-lg">{fiszka.krotki_opis}</p>
              <div className="rounded-xl bg-soft p-4"><p className="text-sm font-bold text-muted">{t("kogoPole")}</p><p className="text-lg">{fiszka.dla_kogo}</p></div>
              <p className="text-sm"><span className="font-bold">{t("etapPole")}: </span>{t(`etap.${fiszka.etap}`)}</p>
              <Szczegoly poziom={3} className="shadow-none" tytul={t("istotaPole")}><p className="max-w-prose">{fiszka.istota}</p></Szczegoly>
              {wysylka !== "ok" && <Button type="button" wariant="obrys" disabled={wysylka === "wysylam" || stan === "pracuje"} onClick={() => setEdycja(true)}><Pencil aria-hidden className="size-5" />{t("poprawFiszke")}</Button>}
            </div>}
            {bledyPol.length > 0 && <p id="fiszka-blad" role="alert" className="font-semibold text-primary">{t("sprawdzPola")}</p>}
            <div className="space-y-3 border-t border-line-soft pt-5">
              {wysylka === "ok" ? (
                <div role="status" className="space-y-3">
                  <p className="text-lg"><strong>{t("wyslano")}.</strong> {t("wyslanoOpis")}</p>
                  {numer && <><p>{t("numerSprawy")}: <strong className="font-mono text-xl">{numer}</strong></p><Button asChild><Link href={`/moje/${numer}`}>{t("sprawdzStatus")}</Link></Button></>}
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted">{t("gotoweDoWyslania")}</p>
                  <Button type="button" rozmiar="lg" onClick={wyslij} disabled={wysylka === "wysylam" || stan === "pracuje"}>{wysylka === "wysylam" ? t("wysylam") : t("wyslij")}</Button>
                  {wysylka === "blad" && <p role="alert" className="font-semibold text-primary">{t("blad2")}</p>}
                </>
              )}
            </div>
          </section>

          <div className="space-y-2"><h2 className="text-2xl font-bold">{t("dopracujTytul")}</h2><p className="text-muted">{t("dopracujOpis")}</p></div>

          {wynik && (
            <>
              <Szczegoly tytul={t("istnieje")} wartosc={t("liczbaZnalezisk", { n: wynik.podobne.length })} etykiety={etykietySzczegolow}>
                {wynik.podobne.length === 0 ? <p className="text-lg">{t("istniejeBrak")}</p> : (
                  <>
                    <p className="text-muted">{t("istniejeOpis")}</p>
                    <ul className="space-y-3">
                      {wynik.podobne.map((p) => (
                        <li key={p.id} className="karta-mala p-4">
                          <Link href={`/wiedza/biblioteka/${p.id}`} className="font-display text-xl font-bold">{p.nazwa}</Link>
                          <p className="mt-1">{p.roznica}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Szczegoly>

              <Szczegoly tytul={t("ocena")} wartosc={t("wynikKrotki", { suma: wynik.suma })} etykiety={etykietySzczegolow}>
                <p className="text-muted">{t("ocenaOpis")}</p>
                <p className={`flex items-center gap-2 text-xl font-bold ${wynik.spelniaProgi ? "text-ok" : "text-primary"}`}>
                  {wynik.spelniaProgi ? <CircleCheck aria-hidden className="size-6" /> : <CircleX aria-hidden className="size-6" />}
                  {wynik.spelniaProgi ? t("spelniaProgi") : t("niespelniaProgi")}
                </p>
                {wynik.doUzupelnienia.length > 0 && <div className="rounded-xl bg-soft p-4"><h3 className="font-bold">{t("doUzupelnienia")}</h3><ul className="mt-2 list-disc space-y-1 pl-6">{wynik.doUzupelnienia.map((x) => <li key={x}>{x}</li>)}</ul></div>}
                <ul className="space-y-4">
                  {wynik.oceny.map((o) => (
                    <li key={o.id} className="space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-bold">{o.nazwa}</p>
                        <p className={`font-bold ${o.ok ? "text-ok" : "text-primary"}`}>{t("pkt", { p: o.punkty })} <span className="text-sm font-normal text-muted">({t("prog", { prog: o.prog })})</span></p>
                      </div>
                      <div aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${o.punkty * 10}%` }} /></div>
                      <p>{o.uzasadnienie}</p>
                      <p className="text-muted"><strong className="text-fg">{t("wskazowka")}:</strong> {o.wskazowka}</p>
                    </li>
                  ))}
                </ul>
              </Szczegoly>

              <Szczegoly tytul={t("adwokat")} etykiety={etykietySzczegolow}>
                <ul className="list-disc space-y-2 pl-5">{wynik.adwokat.map((x) => <li key={x}>{x}</li>)}</ul>
              </Szczegoly>
              <Szczegoly tytul={t("nietuzinkowe")} etykiety={etykietySzczegolow}>
                <ul className="list-disc space-y-2 pl-5">{wynik.nietuzinkowe.map((x) => <li key={x}>{x}</li>)}</ul>
              </Szczegoly>
            </>
          )}

          {tekstFiszki.length >= 20 && <Szczegoly tytul={t("asystentSzczegoly")} opis={t("asystentSzczegolyOpis")}><Asystent fiszkaTekst={tekstFiszki} tytul={fiszka.tytul} opis={fiszka.krotki_opis} numer={numer} wskazniki={kanwa ? Object.entries(wskaznikiDojrzalosci(kanwa, fiszka.etap)).map(([k, v]) => ({ nazwa: t(`wsk.${k}`), v: v.v, max: v.max })) : []} /></Szczegoly>}

          <Szczegoly tytul={t("kanwaSzczegoly")} opis={t("kanwaSzczegolyOpis")}>
            {kanwa && <Kanwa kanwa={kanwa} zmien={setKanwa} etap={fiszka.etap} />}
            <KanwaPelna stan={pelna} zmien={setPelna} fiszkaTekst={tekstFiszki} />
          </Szczegoly>

          <Szczegoly tytul={t("wniosekSzczegoly")} opis={t("wniosekSzczegolyOpis")}>
          <Wniosek dane={`Tytuł: ${fiszka.tytul}\nOpis: ${fiszka.krotki_opis}\nNa czym polega: ${fiszka.istota}\nDla kogo: ${fiszka.dla_kogo}\nEtap: ${fiszka.etap}\nPodobne w Bibliotece: ${wynik?.podobne.map((p) => `${p.nazwa} (${p.roznica})`).join("; ") || "brak"}\nKanwa: wspierają: ${kanwa?.kto_wspiera}; utrudniają: ${kanwa?.kto_utrudnia}; koszty stałe: ${kanwa?.koszty_stale}; zmienne: ${kanwa?.koszty_zmienne}\nDo uzupełnienia: ${wynik?.doUzupelnienia.join("; ") ?? ""}\nOdbiorcy i wartość: ${Object.values(pelna).filter(Boolean).join("; ")}`} />

          </Szczegoly>
        </div>
      )}
    </div>
  );
}
