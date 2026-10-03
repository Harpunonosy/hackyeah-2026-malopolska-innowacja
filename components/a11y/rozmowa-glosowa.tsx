"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Mic, Phone, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TELEFONY_KRYZYSOWE } from "@/lib/kryzys";
import type { WynikSwatki } from "@/lib/swatka";

type Rozpoznawanie = {
  lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; abort(): void;
  onresult: ((e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type Konstruktor = new () => Rozpoznawanie;
const konstruktor = (): Konstruktor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: Konstruktor; webkitSpeechRecognition?: Konstruktor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

type Krok = "start" | "slucham" | "potwierdz" | "szukam" | "wyniki" | "wyslac" | "koniec";
type Wpis = { kto: "splot" | "ty"; tekst: string };

export function RozmowaGlosowa() {
  const t = useTranslations("rozmowaGlosowa");
  const jezyk = useLocale();
  const lang = jezyk === "uk" ? "uk-UA" : "pl-PL";
  const [krok, setKrok] = React.useState<Krok>("start");
  const [wpisy, setWpisy] = React.useState<Wpis[]>([]);
  const [opis, setOpis] = React.useState("");
  const [tekstReczny, setTekstReczny] = React.useState("");
  const [zywy, setZywy] = React.useState("");
  const [wynik, setWynik] = React.useState<WynikSwatki | null>(null);
  const [numer, setNumer] = React.useState("");
  const [blad, setBlad] = React.useState("");
  const rozp = React.useRef<Rozpoznawanie | null>(null);
  const mowaDostepna = React.useSyncExternalStore(() => () => {}, () => konstruktor() !== null, () => true);

  const mow = React.useCallback((tekst: string) => {
    setWpisy((w) => [...w, { kto: "splot", tekst }]);
    const s = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(tekst);
    u.lang = lang;
    s.speak(u);
  }, [lang]);

  const zatrzymaj = React.useCallback(() => {
    rozp.current?.abort();
    window.speechSynthesis?.cancel();
  }, []);
  React.useEffect(() => zatrzymaj, [zatrzymaj]);

  function sluchaj(przy: (tekst: string) => void) {
    const K = konstruktor();
    if (!K) return;
    const r = new K();
    r.lang = lang;
    r.continuous = false;
    r.interimResults = true;
    let koncowy = "";
    r.onresult = (e) => {
      let chwilowy = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) koncowy += e.results[i][0].transcript + " ";
        else chwilowy += e.results[i][0].transcript;
      }
      setZywy((koncowy + chwilowy).trim());
    };
    r.onerror = () => setBlad(t("blad"));
    r.onend = () => {
      setZywy("");
      if (koncowy.trim()) przy(koncowy.trim());
    };
    rozp.current = r;
    try { r.start(); } catch { setBlad(t("blad")); }
  }

  function zacznij() {
    setBlad("");
    setKrok("slucham");
    mow(t("pytaniePoczatek"));
    if (mowaDostepna) setTimeout(() => sluchaj(zrozumialem), 4500);
  }

  function zrozumialem(tekst: string) {
    setOpis(tekst);
    setWpisy((w) => [...w, { kto: "ty", tekst }]);
    setKrok("potwierdz");
    mow(t("potwierdz", { tekst }));
  }

  async function szukaj(tekst: string) {
    setKrok("szukam");
    mow(t("szukam"));
    try {
      const r = await fetch("/api/swatka/dopasuj", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tekst, rola: "mieszkaniec", jezyk }) });
      if (!r.ok) throw new Error();
      const w = (await r.json()) as WynikSwatki;
      setWynik(w);
      setKrok("wyniki");
      if (w.kryzys) mow(t("kryzys"));
      const karty = w.dopasowania.slice(0, 3);
      if (karty.length === 0) mow(t("brak"));
      else {
        mow(t("znalazlem", { ile: karty.length }));
        karty.forEach((k, i) => setTimeout(() => setWpisy((x) => [...x, { kto: "splot", tekst: t("propozycja", { n: i + 1, nazwa: k.nazwa, dlaczego: k.dlaczego }) }]), 0));
        const s = window.speechSynthesis;
        if (s) karty.slice(0, 1).forEach((k) => { const u = new SpeechSynthesisUtterance(t("propozycja", { n: 1, nazwa: k.nazwa, dlaczego: k.dlaczego })); u.lang = lang; s.speak(u); });
      }
      setTimeout(() => { setKrok("wyslac"); mow(t("czyWyslac")); }, 300);
    } catch {
      setBlad(t("blad"));
      setKrok("potwierdz");
    }
  }

  async function wyslij() {
    if (!wynik) return;
    const r = await fetch("/api/zgloszenia", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ tekst: opis, rola: "mieszkaniec", zgoda: true, kanal: "glos", obszar: wynik.tryb === "ai" ? wynik.zrozumiano.obszar : undefined, najlepsze: wynik.dopasowania[0]?.trafnosc ?? null, dopasowania: [...wynik.dopasowania, ...wynik.najblizsze].map((d) => ({ id: d.id, trafnosc: d.trafnosc, dlaczego: d.dlaczego })) }),
    });
    if (!r.ok) return setBlad(t("blad"));
    const { numer: n } = await r.json();
    setNumer(n);
    setKrok("koniec");
    mow(t("wyslano", { numer: String(n).split("").join(" ") }));
  }

  const telefony = wynik?.kryzys ? TELEFONY_KRYZYSOWE.filter((x) => (x.rodzaje as readonly string[]).includes(wynik.kryzys!)) : [];

  return (
    <div className="space-y-6">
      {!mowaDostepna && <p className="karta-mala border-2 border-warn p-4 font-medium">{t("niedostepne")}</p>}

      <section aria-label={t("wypowiedzi")} aria-live="polite" className="karta min-h-40 space-y-3 p-5">
        {wpisy.length === 0 && <p className="text-lg text-muted">{t("opis")}</p>}
        {wpisy.map((w, i) => (
          <p key={i} className={w.kto === "splot" ? "text-xl" : "rounded-xl bg-primary-soft p-3 text-xl"}>
            <strong className="mr-2 inline-flex items-center gap-1 text-primary">{w.kto === "splot" ? <Volume2 aria-hidden className="size-5" /> : <Mic aria-hidden className="size-5" />}{w.kto === "splot" ? t("splot") : t("ty")}:</strong>
            {w.tekst}
          </p>
        ))}
        {zywy && <p className="text-xl text-muted" aria-hidden="true">{zywy}…</p>}
        {blad && <p role="alert" className="font-semibold text-primary">{blad}</p>}
      </section>

      {telefony.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {telefony.map((x) => (
            <li key={x.numer}><a href={`tel:${x.numer}`} className="flex min-h-14 items-center gap-3 rounded-xl border-2 border-primary bg-primary px-4 py-2 text-primary-fg no-underline"><Phone aria-hidden className="size-6" /><span className="text-2xl font-bold">{"wyswietl" in x ? x.wyswietl : x.numer}</span></a></li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        {krok === "start" && <Button rozmiar="lg" onClick={zacznij}><Mic aria-hidden className="size-6" />{t("start")}</Button>}
        {krok === "slucham" && (
          <>
            {mowaDostepna && <Button rozmiar="lg" wariant="obrys" onClick={() => { rozp.current?.stop(); sluchaj(zrozumialem); }}><Mic aria-hidden className="size-5" />{t("slucham")}</Button>}
          </>
        )}
        {krok === "potwierdz" && (
          <>
            <Button rozmiar="lg" onClick={() => szukaj(opis)}>{t("tak")}</Button>
            <Button rozmiar="lg" wariant="obrys" onClick={() => { setKrok("slucham"); mow(t("pytaniePoczatek")); if (mowaDostepna) setTimeout(() => sluchaj(zrozumialem), 4500); }}>{t("nie")}</Button>
          </>
        )}
        {krok === "wyslac" && (
          <>
            <Button rozmiar="lg" onClick={wyslij}>{t("wyslij")}</Button>
            <Button rozmiar="lg" wariant="obrys" onClick={() => { setKrok("koniec"); mow(t("koniec")); }}>{t("niewysylaj")}</Button>
          </>
        )}
        {krok === "koniec" && (
          <>
            {numer && <Button asChild rozmiar="lg"><Link href={`/moje/${numer}`}>{t("otworzStatus")}: {numer}</Link></Button>}
            <Button rozmiar="lg" wariant="obrys" onClick={() => { zatrzymaj(); setWpisy([]); setWynik(null); setNumer(""); setOpis(""); setKrok("start"); }}>{t("odNowa")}</Button>
          </>
        )}
        {krok !== "start" && krok !== "koniec" && <Button rozmiar="lg" wariant="cichy" onClick={zatrzymaj}><Square aria-hidden className="size-5" />{t("stop")}</Button>}
      </div>

      {(krok === "slucham" || krok === "potwierdz") && (
        <form className="karta max-w-2xl space-y-3 p-5" onSubmit={(e) => { e.preventDefault(); if (tekstReczny.trim().length >= 3) { zatrzymaj(); zrozumialem(tekstReczny.trim()); setTekstReczny(""); } }}>
          <label htmlFor="rg-tekst" className="block text-lg font-bold">{t("napisCoSie")}</label>
          <textarea id="rg-tekst" rows={3} value={tekstReczny} onChange={(e) => setTekstReczny(e.target.value)} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
          <Button type="submit" wariant="obrys">{t("wyslijTekst")}</Button>
        </form>
      )}
    </div>
  );
}
