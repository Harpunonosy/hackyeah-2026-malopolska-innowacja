"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, CircleX, Lightbulb, Loader2, Send, Sparkles } from "lucide-react";
import { Mikrofon } from "@/components/a11y/mikrofon";
import { Button } from "@/components/ui/button";
import { Postep } from "@/components/ui/postep";
import { Szczegoly } from "@/components/ui/szczegoly";
import { wskaznikiDojrzalosci, type KanwaStan } from "@/components/pracownia/kanwa";
import { Asystent } from "@/components/pracownia/asystent";
import { KanwaPelna, POLA_KANWY, type KanwaPelnaStan } from "@/components/pracownia/kanwa-pelna";
import { KanwaKrotka, POLA_KROTKIE } from "@/components/pracownia/kanwa-krotka";
import { useTrybProsty } from "@/components/a11y/tryb-prosty";
import { Wniosek } from "@/components/pracownia/wniosek";
import type { KanwaStan as KanwaAI, WynikAnalizy } from "@/lib/pracownia";

const ETAPY = ["pomysl", "prototyp", "przetestowane", "gotowe"] as const;
type PoleFiszki = Exclude<keyof WynikAnalizy["fiszka"], "etap">;
const LIMITY: Record<PoleFiszki, number> = { tytul: 160, krotki_opis: 600, istota: 1200, dla_kogo: 400 };

/** Odpowiedzi AI wpisane wstępnie do pełnej kanwy INNO AGH (tylko pola o tym samym znaczeniu). Użytkownik je sprawdza. */
function kanwaZAnalizy(k: KanwaAI, etap: string): KanwaPelnaStan {
  const skala = (n: number) => String(Math.max(1, Math.min(4, Math.round(n))));
  const tekst = (s: string) => s.trim();
  const wynik: KanwaPelnaStan = {
    intensywnosc: skala(k.intensywnosc), czestotliwosc: skala(k.czestotliwosc), skala: skala(k.skala),
    gotowosc: String(Math.max(1, ETAPY.indexOf(etap as (typeof ETAPY)[number]) + 1)),
    glowny_dochod: skala(k.dochod_pewnosc), skalowanie_dochodu: skala(k.skalowanie),
    wplyw_osoba: skala(k.wplyw_osoba), wplyw_spolecznosc: skala(k.wplyw_spolecznosc), wplyw_srodowisko: skala(k.wplyw_srodowisko),
    wspieraja: tekst(k.kto_wspiera), utrudniaja: tekst(k.kto_utrudnia), koszty_stale: tekst(k.koszty_stale), koszty_zmienne: tekst(k.koszty_zmienne),
  };
  return Object.fromEntries(Object.entries(wynik).filter(([, v]) => v));
}

export function FormularzPomyslu() {
  const t = useTranslations("pracownia");
  const jezyk = useLocale();
  const prosty = useTrybProsty();
  const [opis, setOpis] = React.useState("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");
  const [wynik, setWynik] = React.useState<WynikAnalizy | null>(null);
  const [fiszka, setFiszka] = React.useState<WynikAnalizy["fiszka"] | null>(null);
  const [kanwa, setKanwa] = React.useState<KanwaStan | null>(null);
  const [pelna, setPelna] = React.useState<KanwaPelnaStan>({});
  const [numer, setNumer] = React.useState<string | null>(null);
  const [wysylka, setWysylka] = React.useState<"" | "wysylam" | "ok" | "blad">("");
  const [bledyPol, setBledyPol] = React.useState<PoleFiszki[]>([]);
  const naglowekFiszki = React.useRef<HTMLDivElement>(null);
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
      setPelna(kanwaZAnalizy(d.kanwa, d.fiszka.etap));
      setNumer(null);
      setWysylka("");
      setBledyPol([]);
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
  }

  const tekstFiszki = fiszka ? `Tytuł: ${fiszka.tytul}. Opis: ${fiszka.krotki_opis}. Na czym polega: ${fiszka.istota}. Dla kogo: ${fiszka.dla_kogo}. Etap: ${fiszka.etap}.` : "";

  const pole = (id: PoleFiszki, etykieta: string, wiersze = 2) => (
    <div className="space-y-1">
      <label htmlFor={`f-${id}`} className="block text-lg font-bold">{etykieta}</label>
      <textarea id={`f-${id}`} rows={wiersze} maxLength={LIMITY[id]} value={fiszka?.[id] ?? ""} aria-invalid={bledyPol.includes(id) || undefined} aria-describedby={bledyPol.includes(id) ? "fiszka-blad" : undefined} onChange={(e) => { setFiszka((f) => (f ? { ...f, [id]: e.target.value } : f)); setBledyPol((b) => b.filter((p) => p !== id)); }} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
    </div>
  );

  const formularzOpisu = (
      <form onSubmit={analizuj} className="space-y-4">
        <label htmlFor="pomysl" className="block text-xl font-bold">{t("poleEtykieta")}</label>
        <p id="pomysl-pomoc" className="text-muted">{t("polePomoc")}</p>
        <textarea id="pomysl" aria-describedby="pomysl-pomoc" rows={4} value={opis} onChange={(e) => setOpis(e.target.value.slice(0, 2500))} placeholder={t("placeholder")} className="block w-full rounded-xl border-2 border-line bg-card p-4 text-lg hover:border-fg" />
        <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
          <Mikrofon jezyk={jezyk} etykieta={t("powiedz")} onZdanie={(z) => setOpis((p) => (p ? `${p} ${z}` : z).slice(0, 2500))} className="contents [&>p]:order-last [&>p]:basis-full" />
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

  // Jeden przewijany formularz: części idą po kolei, a wysyłka do ROPS jest zawsze na samym dole.
  const czesci = [
    { id: "cz-fiszka", tytul: t("fiszka") },
    ...(wynik ? [{ id: "cz-istnieje", tytul: t("istnieje") }] : []),
    { id: "cz-pytania", tytul: t("krotkieTytul") },
    // Ocena na końcu: najpierw uzupełniasz, potem widzisz, co jeszcze można poprawić.
    ...(wynik ? [{ id: "cz-ocena", tytul: t("ocena") }] : []),
    { id: "cz-wyslij", tytul: t("wyslijSekcja") },
  ];
  const nr = (id: string) => czesci.findIndex((c) => c.id === id) + 1;
  const czesc = (id: string, opisCzesci?: string) => (
    <div className="space-y-1">
      <h2 id={`${id}-h`} className="flex items-center gap-3 text-2xl font-bold">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-fg">{nr(id)}</span>
        <span><span className="sr-only">{t("czescNr", { n: nr(id) })}: </span>{czesci.find((c) => c.id === id)?.tytul}</span>
      </h2>
      {opisCzesci && <p className="text-lg text-muted">{opisCzesci}</p>}
    </div>
  );
  const wypelnioneKanwy = POLA_KANWY.filter((p) => pelna[p]?.trim()).length;
  const wypelnioneKrotkie = POLA_KROTKIE.filter((p) => pelna[p]?.trim()).length;
  const zablokowane = wysylka === "ok" || wysylka === "wysylam" || stan === "pracuje";

  const kanwaTresc = (
    <fieldset disabled={zablokowane} className="space-y-4">
      <legend className="sr-only">{t("kanwaPelna")}</legend>
      <KanwaPelna stan={pelna} zmien={setPelna} fiszkaTekst={tekstFiszki} />
      {wysylka === "ok" && <p lang="pl">Kanwa została zapisana wraz z pomysłem. Uzupełnienia prześlij w wątku swojej sprawy.</p>}
    </fieldset>
  );
  const narzedziaTresc = (
    <div className="space-y-4">
      {tekstFiszki.length >= 20 && fiszka && <Szczegoly poziom={3} className="shadow-none" tytul={t("asystentSzczegoly")} opis={t("asystentSzczegolyOpis")}><Asystent fiszkaTekst={tekstFiszki} tytul={fiszka.tytul} opis={fiszka.krotki_opis} numer={numer} wskazniki={kanwa ? Object.entries(wskaznikiDojrzalosci(kanwa, fiszka.etap)).map(([k, v]) => ({ nazwa: t(`wsk.${k}`), v: v.v, max: v.max })) : []} /></Szczegoly>}
      {fiszka && <Szczegoly poziom={3} className="shadow-none" tytul={t("wniosekSzczegoly")} opis={t("wniosekSzczegolyOpis")}>
        <Wniosek dane={`Tytuł: ${fiszka.tytul}\nOpis: ${fiszka.krotki_opis}\nNa czym polega: ${fiszka.istota}\nDla kogo: ${fiszka.dla_kogo}\nEtap: ${fiszka.etap}\nPodobne w Bibliotece: ${wynik?.podobne.map((p) => `${p.nazwa} (${p.roznica})`).join("; ") || "brak"}\nKanwa: wspierają: ${kanwa?.kto_wspiera}; utrudniają: ${kanwa?.kto_utrudnia}; koszty stałe: ${kanwa?.koszty_stale}; zmienne: ${kanwa?.koszty_zmienne}\nDo uzupełnienia: ${wynik?.doUzupelnienia.join("; ") ?? ""}\nOdbiorcy i wartość: ${Object.entries(pelna).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("; ")}`} />
      </Szczegoly>}
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8">
      {fiszka ? <Szczegoly tytul={t("zmienOpis")}>{formularzOpisu}</Szczegoly> : <div className="karta p-6 sm:p-8">{formularzOpisu}</div>}

      {fiszka && (
        <>
          <nav aria-labelledby="spis-h" className="karta-mala space-y-3 border-2 border-fg p-5">
            <h2 id="spis-h" className="text-xl font-bold">{t("spisTytul")}</h2>
            <p className="text-lg">{t("spisOpis")}</p>
            <ol className="grid gap-1 sm:grid-cols-2">
              {czesci.map((c, i) => (
                <li key={c.id}><a href={`#${c.id}`} className="inline-flex min-h-12 items-center gap-2 font-semibold"><span aria-hidden="true">{i + 1}.</span>{c.tytul}</a></li>
              ))}
            </ol>
          </nav>

          <section id="cz-fiszka" aria-labelledby="cz-fiszka-h" className="karta space-y-5 p-6 sm:p-8">
            <div ref={naglowekFiszki} tabIndex={-1} className="outline-none">{czesc("cz-fiszka", wynik ? t("oznaczenie") : t("trybRecznyInfo"))}</div>
            <fieldset disabled={zablokowane} className="space-y-4">
              <legend className="sr-only">{t("fiszka")}</legend>
              {pole("tytul", t("tytulPole"), 1)}
              {pole("krotki_opis", t("opisPole"))}
              {pole("istota", t("istotaPole"), 3)}
              {pole("dla_kogo", t("kogoPole"))}
              <fieldset className="space-y-2">
                <legend className="text-lg font-bold">{t("etapPole")}</legend>
                <div className="flex flex-wrap gap-2">
                  {ETAPY.map((e) => (
                    <label key={e} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
                      <input type="radio" name="etap" checked={fiszka.etap === e} onChange={() => setFiszka({ ...fiszka, etap: e })} className="size-4 accent-current" />
                      {t(`etap.${e}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
            </fieldset>
            {bledyPol.length > 0 && <p id="fiszka-blad" role="alert" className="font-semibold text-primary">{t("sprawdzPola")}</p>}
          </section>

          {wynik && (
            <section id="cz-istnieje" aria-labelledby="cz-istnieje-h" className="karta space-y-4 p-6 sm:p-8">
              {czesc("cz-istnieje", wynik.podobne.length ? t("istniejeOpis") : undefined)}
              {wynik.podobne.length === 0 ? <p className="text-lg">{t("istniejeBrak")}</p> : (
                <ul className="space-y-3">
                  {wynik.podobne.map((p) => (
                    <li key={p.id} className="karta-mala p-4">
                      <Link href={`/wiedza/biblioteka/${p.id}`} className="font-display text-xl font-bold">{p.nazwa}</Link>
                      <p className="mt-1">{p.roznica}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section id="cz-pytania" aria-labelledby="cz-pytania-h" className="karta space-y-6 p-6 sm:p-8">
            {czesc("cz-pytania", t("krotkieOpis"))}
            {wynik && <p className="rounded-xl bg-primary-soft p-4 text-lg">{t("kanwaAiInfo")}</p>}
            <fieldset disabled={zablokowane} className="min-w-0">
              <legend className="sr-only">{t("krotkieTytul")}</legend>
              <KanwaKrotka stan={pelna} zmien={setPelna} />
            </fieldset>
            <Szczegoly id="kanwa-pytania" poziom={3} className="shadow-none" tytul={t("kanwaPelnaNieob")} opis={t("kanwaPelnaNieobOpis")} wartosc={t("kanwaPola", { n: wypelnioneKanwy, z: POLA_KANWY.length })}>{kanwaTresc}</Szczegoly>
          </section>

          {wynik && (
            <section id="cz-ocena" aria-labelledby="cz-ocena-h" className="karta space-y-5 p-6 sm:p-8">
              {czesc("cz-ocena", t("ocenaNaKoniec"))}
              <p className={`flex items-center gap-2 text-xl font-bold ${wynik.spelniaProgi ? "text-ok" : "text-fg"}`}>
                {wynik.spelniaProgi ? <CircleCheck aria-hidden className="size-6 shrink-0" /> : <Lightbulb aria-hidden className="size-6 shrink-0 text-primary" />}
                {t("suma", { suma: wynik.suma })}. {wynik.spelniaProgi ? t("spelniaProgi") : t("niespelniaProgiLagodnie")}
              </p>
              {wynik.doUzupelnienia.length > 0 && <div className="rounded-xl bg-soft p-4"><h3 className="text-lg font-bold">{t("coDopisac")}</h3><ul className="mt-2 list-disc space-y-1 pl-6 text-lg">{wynik.doUzupelnienia.map((x) => <li key={x}>{x}</li>)}</ul></div>}
              {!prosty && (
                <Szczegoly poziom={3} className="shadow-none" tytul={t("ocenaSzczegolyTytul")}>
                  <p className="text-muted">{t("ocenaOpis")}</p>
                  <ul className="space-y-5">
                    {wynik.oceny.map((o) => (
                      <li key={o.id} className="space-y-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="text-lg font-bold">{o.nazwa}</h4>
                          <p className={`font-bold ${o.ok ? "text-ok" : "text-primary"}`}>{t("pkt", { p: o.punkty })} <span className="text-sm font-normal text-muted">({t("prog", { prog: o.prog })})</span></p>
                        </div>
                        <div aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${o.punkty * 10}%` }} /></div>
                        <p>{o.uzasadnienie}</p>
                        <p className="text-muted"><strong className="text-fg">{t("wskazowka")}:</strong> {o.wskazowka}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="grid gap-6 border-t border-line-soft pt-5 md:grid-cols-2">
                    <div className="space-y-2"><h4 className="text-lg font-bold">{t("adwokat")}</h4><ul className="list-disc space-y-2 pl-5">{wynik.adwokat.map((x) => <li key={x}>{x}</li>)}</ul></div>
                    <div className="space-y-2"><h4 className="text-lg font-bold">{t("nietuzinkowe")}</h4><ul className="list-disc space-y-2 pl-5">{wynik.nietuzinkowe.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  </div>
                </Szczegoly>
              )}
            </section>
          )}

          <Szczegoly tytul={t("narzedzia")} opis={t("narzedziaOpis")}>{narzedziaTresc}</Szczegoly>

          <section id="cz-wyslij" aria-labelledby="cz-wyslij-h" className="karta space-y-5 border-2 border-primary p-6 sm:p-8">
            {czesc("cz-wyslij")}
            {wysylka === "ok" ? (
              <div role="status" className="space-y-3">
                <p className="text-lg"><strong>{t("wyslano")}.</strong> {t("wyslanoOpis")}</p>
                {numer && <><p>{t("numerSprawy")}: <strong className="font-mono text-xl">{numer}</strong></p><Button asChild><Link href={`/moje/${numer}`}>{t("sprawdzStatus")}</Link></Button></>}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-lg font-bold">{t("podsumowanie")}</p>
                  <ul className="space-y-1 text-lg">
                    <li className="flex items-start gap-2"><CircleCheck aria-hidden className="mt-1 size-5 shrink-0 text-ok" />{t("podsumFiszka", { tytul: fiszka.tytul || "…" })}</li>
                    <li className="flex items-start gap-2">
                      {wypelnioneKrotkie === POLA_KROTKIE.length ? <CircleCheck aria-hidden className="mt-1 size-5 shrink-0 text-ok" /> : <CircleX aria-hidden className="mt-1 size-5 shrink-0 text-primary" />}
                      <span>{t("krotkiePola", { n: wypelnioneKrotkie, z: POLA_KROTKIE.length })}{wypelnioneKrotkie < POLA_KROTKIE.length && <> · <a href="#cz-pytania">{t("uzupelnijOdpowiedzi")}</a></>}</span>
                    </li>
                    {wypelnioneKanwy > wypelnioneKrotkie && <li className="flex items-start gap-2"><CircleCheck aria-hidden className="mt-1 size-5 shrink-0 text-ok" />{t("kanwaPola", { n: wypelnioneKanwy, z: POLA_KANWY.length })}</li>}
                    {wynik && <li className="flex items-start gap-2"><CircleCheck aria-hidden className="mt-1 size-5 shrink-0 text-ok" />{t("podsumOcena", { suma: wynik.suma })}</li>}
                  </ul>
                </div>
                <p className="text-muted">{t("gotoweDoWyslania")}</p>
                <Button type="button" rozmiar="lg" className="w-full sm:w-auto" onClick={wyslij} disabled={wysylka === "wysylam" || stan === "pracuje"}><Send aria-hidden className="size-5" />{wysylka === "wysylam" ? t("wysylam") : t("wyslij")}</Button>
                {wysylka === "blad" && <p role="alert" className="font-semibold text-primary">{t("blad2")}</p>}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
