"use client";
import { apiFetch } from "@/lib/fetch-klient";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Printer, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Postep } from "@/components/ui/postep";
import { Wybor } from "@/components/ui/wybor";
import type { WynikSwatki } from "@/lib/swatka";

type Kontakt = "placowka" | "telefon" | "email";
const pole = "block min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg";

/** Tryb asystowany (I-16): pracownik placówki zgłasza potrzebę w imieniu osoby wykluczonej cyfrowo. */
export function FormularzAsystowany() {
  const t = useTranslations("asystowane");
  const [placowka, setPlacowka] = React.useState("");
  const [powiat, setPowiat] = React.useState("");
  const [opis, setOpis] = React.useState("");
  const [kontakt, setKontakt] = React.useState<Kontakt>("placowka");
  const [telefon, setTelefon] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [zgoda, setZgoda] = React.useState(false);
  const [stan, setStan] = React.useState<"" | "szuka" | "wysyla" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");
  const [wynik, setWynik] = React.useState<WynikSwatki | null>(null);
  const [numer, setNumer] = React.useState<string | null>(null);
  const naglowekWyniku = React.useRef<HTMLHeadingElement>(null);

  async function szukaj(e: React.FormEvent) {
    e.preventDefault();
    setStan("szuka");
    setKomunikat("");
    setWynik(null);
    try {
      const r = await apiFetch("/api/swatka/dopasuj", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tekst: opis, powiat: powiat || undefined, rola: "mieszkaniec" }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.komunikat);
      setWynik(d);
      setStan("");
      requestAnimationFrame(() => naglowekWyniku.current?.focus());
    } catch (err) {
      setKomunikat(err instanceof Error && err.message ? err.message : t("blad"));
      setStan("blad");
    }
  }

  async function wyslij() {
    if (!wynik) return;
    setStan("wysyla");
    setKomunikat("");
    const r = await apiFetch("/api/zgloszenia", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tekst: opis,
        rola: "mieszkaniec",
        powiat: powiat || undefined,
        zgoda: true,
        kanal: "asystowane",
        placowka,
        telefon: kontakt === "telefon" ? telefon : undefined,
        email: kontakt === "email" ? email : undefined,
        obszar: wynik.tryb === "ai" ? wynik.zrozumiano.obszar : undefined,
        najlepsze: wynik.dopasowania[0]?.trafnosc ?? wynik.najblizsze[0]?.trafnosc ?? null,
        dopasowania: [...wynik.dopasowania, ...wynik.najblizsze].map((d) => ({ id: d.id, trafnosc: d.trafnosc, dlaczego: d.dlaczego })),
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setKomunikat(d.komunikat ?? t("blad"));
      return setStan("blad");
    }
    setNumer(d.numer);
    setStan("");
  }

  if (numer) {
    return (
      <section role="status" className="karta max-w-3xl space-y-4 border-4 border-ok p-6">
        <h2 className="text-3xl font-bold">{t("wyslano")}</h2>
        <p className="font-mono text-2xl font-bold">{t("numer", { numer })}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild><Link href={`/moje/${numer}/karta`}><Printer aria-hidden className="size-5" />{t("drukuj")}</Link></Button>
          <Button type="button" wariant="obrys" onClick={() => { setNumer(null); setWynik(null); setOpis(""); setTelefon(""); setEmail(""); setZgoda(false); }}>{t("nowa")}</Button>
        </div>
      </section>
    );
  }

  const karty = wynik ? (wynik.dopasowania.length ? wynik.dopasowania : wynik.najblizsze).slice(0, 3) : [];

  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={szukaj} className="karta space-y-6 p-6 sm:p-8">
        <fieldset className="space-y-3">
          <legend className="text-2xl font-bold">1. {t("krok1")}</legend>
          <div className="space-y-1">
            <label htmlFor="as-placowka" className="block text-lg font-bold">{t("placowka")}</label>
            <input id="as-placowka" required value={placowka} onChange={(e) => setPlacowka(e.target.value.slice(0, 120))} placeholder={t("placowkaPrzyklad")} className={pole} />
          </div>
          <div className="space-y-1">
            <label htmlFor="as-powiat" className="block text-lg font-bold">{t("powiat")}</label>
            <input id="as-powiat" value={powiat} onChange={(e) => setPowiat(e.target.value.slice(0, 60))} autoComplete="off" className={`${pole} max-w-sm`} />
          </div>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="text-2xl font-bold">2. {t("krok2")}</legend>
          <div className="space-y-1">
            <label htmlFor="as-opis" className="block text-lg font-bold">{t("opisPole")}</label>
            <p id="as-opis-pomoc" className="text-muted">{t("opisPomoc")}</p>
            <textarea id="as-opis" required minLength={10} rows={5} aria-describedby="as-opis-pomoc" value={opis} onChange={(e) => setOpis(e.target.value.slice(0, 1500))} className="block w-full rounded-xl border-2 border-line bg-card p-4 text-lg hover:border-fg" />
          </div>
        </fieldset>
        <div className="space-y-3">
          <Wybor nazwa="as-kontakt" legenda={`3. ${t("krok3")}`} klasaLegendy="text-2xl font-bold" opcje={[["placowka", t("kontaktPlacowka")], ["telefon", t("kontaktTelefon")], ["email", t("kontaktEmail")]]} wartosc={kontakt} zmien={setKontakt} />
          {kontakt === "telefon" && (
            <div className="space-y-1">
              <label htmlFor="as-tel" className="block text-lg font-bold">{t("telefon")}</label>
              <p id="as-tel-pomoc" className="text-muted">{t("telefonPomoc")}</p>
              <input id="as-tel" type="tel" required inputMode="tel" autoComplete="off" aria-describedby="as-tel-pomoc" value={telefon} onChange={(e) => setTelefon(e.target.value.slice(0, 20))} className={`${pole} max-w-xs`} />
            </div>
          )}
          {kontakt === "email" && (
            <div className="space-y-1">
              <label htmlFor="as-email" className="block text-lg font-bold">{t("email")}</label>
              <input id="as-email" type="email" required autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 120))} className={`${pole} max-w-md`} />
            </div>
          )}
          <label className="flex min-h-12 cursor-pointer items-start gap-3 text-lg">
            <input type="checkbox" required checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} className="mt-1.5 size-5 shrink-0" />
            {t("zgoda")}
          </label>
        </div>
        <Button type="submit" rozmiar="lg" disabled={stan === "szuka" || opis.trim().length < 10 || !zgoda}><Search aria-hidden className="size-5" />{t("szukaj")}</Button>
        {stan === "szuka" && <Postep kroki={t("postepKroki")} sekund={12} />}
        {stan === "blad" && !wynik && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
      </form>

      {wynik && (
        <section aria-labelledby="as-wynik" className="karta space-y-4 p-6 sm:p-8">
          <h2 id="as-wynik" ref={naglowekWyniku} tabIndex={-1} className="text-2xl font-bold outline-none">{t("propozycje")}</h2>
          {wynik.kryzys && <p role="alert" className="rounded-xl border-2 border-primary p-4 font-bold">{t("kryzys")}</p>}
          {karty.length ? (
            <ol className="space-y-3">
              {karty.map((k) => (
                <li key={k.id} className="karta-mala p-4">
                  <Link href={`/wiedza/biblioteka/${k.id}`} className="text-xl font-bold">{k.nazwa}</Link>
                  <p>{k.dlaczego}</p>
                </li>
              ))}
            </ol>
          ) : <p className="text-lg">{t("brak")}</p>}
          <Button type="button" rozmiar="lg" disabled={stan === "wysyla"} onClick={wyslij}><Send aria-hidden className="size-5" />{t("wyslij")}</Button>
          {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
        </section>
      )}
    </div>
  );
}
