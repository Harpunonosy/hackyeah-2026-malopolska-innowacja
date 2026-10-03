"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Printer, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WynikSwatki } from "@/lib/swatka";

type Props = { tekst: string; rola: string; powiat: string; wynik: WynikSwatki };

export function WyslijZgloszenie({ tekst, rola, powiat, wynik }: Props) {
  const t = useTranslations("zgloszenie");
  const tk = useTranslations("karta");
  const [krok, setKrok] = React.useState<"start" | "podglad" | "wysylka" | "gotowe">("start");
  const [email, setEmail] = React.useState("");
  const [zgoda, setZgoda] = React.useState(false);
  const [testy, setTesty] = React.useState(false);
  const [numer, setNumer] = React.useState("");
  const [blad, setBlad] = React.useState("");

  async function wyslij(e: React.FormEvent) {
    e.preventDefault();
    setKrok("wysylka");
    setBlad("");
    try {
      const odp = await fetch("/api/zgloszenia", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tekst,
          rola,
          powiat: powiat || undefined,
          zgoda,
          email: email || undefined,
          testy,
          obszar: wynik.tryb === "ai" ? wynik.zrozumiano.obszar : undefined,
          najlepsze: wynik.dopasowania[0]?.trafnosc ?? wynik.najblizsze[0]?.trafnosc ?? null,
          dopasowania: [...wynik.dopasowania, ...wynik.najblizsze].map((d) => ({ id: d.id, trafnosc: d.trafnosc, dlaczego: d.dlaczego })),
        }),
      });
      const dane = await odp.json();
      if (!odp.ok) {
        setBlad(dane.komunikat ?? t("blad"));
        return setKrok("podglad");
      }
      setNumer(dane.numer);
      setKrok("gotowe");
    } catch {
      setBlad(t("blad"));
      setKrok("podglad");
    }
  }

  if (krok === "gotowe") {
    return (
      <section role="status" className="karta space-y-3 border-4 border-ok p-6">
        <h3 className="text-2xl font-bold">{t("gotowe")}</h3>
        <p>{t("numerPomoc")}</p>
        <p className="text-sm font-semibold">{t("numer")}</p>
        <p className="font-mono text-3xl font-bold tracking-wider">{numer}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/moje/${numer}`}>{t("sprawdzStatus")}</Link>
          </Button>
          <Button asChild wariant="obrys">
            <Link href={`/moje/${numer}/karta`}><Printer aria-hidden className="size-5" />{tk("wydrukujKarte")}</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="karta space-y-4 p-6 sm:p-8">
      <h3 className="text-2xl font-bold">{t("tytul")}</h3>
      <p>{t("opis")}</p>
      {krok === "start" ? (
        <Button type="button" onClick={() => setKrok("podglad")}>
          <Send aria-hidden className="size-5" />
          {t("przycisk")}
        </Button>
      ) : (
        <form onSubmit={wyslij} className="space-y-4">
          <h4 className="text-xl font-bold">{t("sprawdz")}</h4>
          <div>
            <p className="font-semibold">{t("twojaTresc")}</p>
            <p className="karta-mala whitespace-pre-line p-3">{tekst}</p>
          </div>
          <div className="space-y-1">
            <label htmlFor="zgl-email" className="block font-semibold">
              {t("email")}
            </label>
            <p id="zgl-email-pomoc" className="text-sm text-muted">
              {t("emailPomoc")}
            </p>
            <input
              id="zgl-email"
              type="email"
              autoComplete="email"
              aria-describedby="zgl-email-pomoc"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block min-h-12 w-full max-w-md rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} className="mt-1.5 size-6 accent-current" />
            <span className="text-lg">{t("zgoda")}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={testy} onChange={(e) => setTesty(e.target.checked)} className="mt-1.5 size-6 accent-current" />
            <span className="text-lg">{t("zgodaTesty")}</span>
          </label>
          {blad && (
            <p role="alert" className="font-semibold text-primary">
              {blad}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={!zgoda || krok === "wysylka"}>
              {krok === "wysylka" ? t("wysylam") : t("wyslij")}
            </Button>
            <Button type="button" wariant="obrys" onClick={() => setKrok("start")}>
              {t("anuluj")}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
