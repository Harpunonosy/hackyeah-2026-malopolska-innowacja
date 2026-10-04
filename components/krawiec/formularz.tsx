"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Postep } from "@/components/ui/postep";
import { Wybor } from "@/components/ui/wybor";
import { Szczegoly } from "@/components/ui/szczegoly";
import { BUDZETY, TYPY_INSTYTUCJI } from "@/lib/krawiec-stale";
import { normalizujPowiat, POWIATY_IOSS } from "@/lib/powiaty";
import { cn } from "@/lib/utils";

type Pozycja = { id: string; nazwa: string; kategoria: string };
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

function Krok({ n, tytul }: { n: number; tytul: string }) {
  return (
    <h2 className="flex items-center gap-3 text-base font-bold text-primary">
      <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-fg">{n}</span>
      {tytul}
    </h2>
  );
}

function Liczba({ id, etykieta, wartosc, zmien }: { id: string; etykieta: string; wartosc: string; zmien: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-lg font-bold">{etykieta}</label>
      <input id={id} inputMode="numeric" value={wartosc} onChange={(e) => zmien(e.target.value.replace(/\D/g, "").slice(0, 4))} className="block min-h-12 w-40 rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
    </div>
  );
}

export function FormularzKrawca({ innowacje, poczatkowa, poczatkowyPowiat }: { innowacje: Pozycja[]; poczatkowa?: string; poczatkowyPowiat?: string }) {
  const t = useTranslations("krawiec");
  const router = useRouter();
  const etykietySzczegolow = { rozwin: t("rozwinSzczegoly"), zwin: t("zwinSzczegoly") };
  const [wybrana, setWybrana] = React.useState<string | null>(poczatkowa ?? null);
  const [fraza, setFraza] = React.useState("");
  const [typ, setTyp] = React.useState<keyof typeof TYPY_INSTYTUCJI>("gmina");
  const [powiat, setPowiat] = React.useState(poczatkowyPowiat?.replace(/^powiat\s+/, "") ?? "");
  const [odbiorcy, setOdbiorcy] = React.useState("50");
  const [kadra, setKadra] = React.useState("3");
  const [lata, setLata] = React.useState("3");
  const [budzet, setBudzet] = React.useState<keyof typeof BUDZETY>("od_150_do_350");
  const [partnerzy, setPartnerzy] = React.useState("");
  const [zaleglosci, setZaleglosci] = React.useState<"brak" | "sa" | "nie_wiem">("nie_wiem");
  const [podwojne, setPodwojne] = React.useState<"brak" | "jest" | "nie_wiem">("nie_wiem");
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");

  const wybranaPoz = innowacje.find((i) => i.id === wybrana);
  const wyniki = React.useMemo(() => {
    const slowa = fold(fraza).split(/\s+/).filter(Boolean);
    return slowa.length ? innowacje.filter((i) => slowa.every((s) => fold(`${i.nazwa} ${i.kategoria}`).includes(s))).slice(0, 8) : [];
  }, [fraza, innowacje]);

  async function wyslij(e: React.FormEvent) {
    e.preventDefault();
    if (!wybrana || stan === "pracuje") return;
    const liczbaOK = (v: string, min: number, max: number) => Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max;
    const niepoprawne = [
      { id: "kr-powiat", pole: "powiat", ok: normalizujPowiat(powiat) !== null },
      { id: "kr-odbiorcy", pole: "odbiorcy", ok: liczbaOK(odbiorcy, 1, 5000) },
      { id: "kr-kadra", pole: "kadra", ok: liczbaOK(kadra, 0, 500) },
      { id: "kr-lata", pole: "lata", ok: liczbaOK(lata, 0, 100) },
    ].find((p) => !p.ok);
    if (niepoprawne) {
      setStan("blad");
      setKomunikat(t("sprawdzPole", { pole: t(niepoprawne.pole) }));
      const pole = document.getElementById(niepoprawne.id);
      const szczegoly = pole?.closest("details");
      if (szczegoly) szczegoly.open = true;
      pole?.focus();
      return;
    }
    setStan("pracuje");
    setKomunikat("");
    try {
      const r = await fetch("/api/krawiec/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ innowacjaId: wybrana, typ, powiat, odbiorcy, kadra, lata, budzet, partnerzy, zaleglosci, podwojne }),
      });
      const dane = await r.json();
      if (!r.ok) {
        setKomunikat(dane.komunikat ?? t("blad"));
        return setStan("blad");
      }
      router.push(`/wdrozenie/plan/${dane.id}`);
    } catch {
      setKomunikat(t("blad"));
      setStan("blad");
    }
  }

  return (
    <form onSubmit={wyslij} className="max-w-3xl space-y-6">
      <section className="karta space-y-3 p-5 sm:p-6">
        <Krok n={1} tytul={t("krok1")} />
        {wybranaPoz ? (
          <div className="karta-mala flex flex-wrap items-center justify-between gap-3 p-4">
            <p>
              <span className="text-sm font-bold text-muted">{t("wybrana")}</span>
              <span className="block font-display text-xl font-bold">{wybranaPoz.nazwa}</span>
              <span className="text-muted">{wybranaPoz.kategoria}</span>
            </p>
            <Button type="button" wariant="obrys" onClick={() => setWybrana(null)}>{t("zmien")}</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="szukaj-inn" className="block text-lg font-bold">{t("szukaj")}</label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
              <input id="szukaj-inn" type="search" value={fraza} onChange={(e) => setFraza(e.target.value)} placeholder={t("szukajPlaceholder")} autoComplete="off" className="block min-h-14 w-full rounded-xl border-2 border-line bg-card pl-12 pr-4 text-lg hover:border-fg" />
            </div>
            <ul className="space-y-2">
              {wyniki.map((i) => (
                <li key={i.id}>
                  <button type="button" onClick={() => setWybrana(i.id)} className="karta-mala flex min-h-14 w-full flex-col items-start px-4 py-2 text-left hover:border-fg">
                    <span className="font-bold">{i.nazwa}</span>
                    <span className="text-sm text-muted">{i.kategoria}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="karta space-y-6 p-5 sm:p-6">
        <Krok n={2} tytul={t("krok2")} />
        <Wybor nazwa="typ" legenda={t("typ")} opcje={Object.keys(TYPY_INSTYTUCJI).map((k) => [k, t(`typy.${k}`)] as [keyof typeof TYPY_INSTYTUCJI, string])} wartosc={typ} zmien={setTyp} />
        <div className="space-y-1">
          <label htmlFor="kr-powiat" className="block text-lg font-bold">{t("powiat")}</label>
          <input id="kr-powiat" list="kr-powiaty" value={powiat} onChange={(e) => setPowiat(e.target.value)} placeholder={t("powiatPodpowiedz")} autoComplete="off" className="block min-h-12 w-full max-w-sm rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
          <datalist id="kr-powiaty">{POWIATY_IOSS.map((p) => <option key={p} value={p.replace("powiat ", "")} />)}</datalist>
        </div>
        <Liczba id="kr-odbiorcy" etykieta={t("odbiorcy")} wartosc={odbiorcy} zmien={setOdbiorcy} />
        <Wybor nazwa="budzet" legenda={t("budzet")} opcje={Object.entries(BUDZETY) as [keyof typeof BUDZETY, string][]} wartosc={budzet} zmien={setBudzet} />
      </section>

      <Szczegoly tytul={t("zasobyTytul")} wartosc={t("zasobySkrot", { kadra: kadra || "0", lata: lata || "0" })} etykiety={etykietySzczegolow}>
        <div className="flex flex-wrap gap-6">
          <Liczba id="kr-kadra" etykieta={t("kadra")} wartosc={kadra} zmien={setKadra} />
          <Liczba id="kr-lata" etykieta={t("lata")} wartosc={lata} zmien={setLata} />
        </div>
        <div className="space-y-1">
          <label htmlFor="kr-partnerzy" className="block text-lg font-bold">{t("partnerzy")}</label>
          <input id="kr-partnerzy" value={partnerzy} onChange={(e) => setPartnerzy(e.target.value.slice(0, 300))} placeholder={t("partnerzyPlaceholder")} className="block min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
        </div>
      </Szczegoly>

      <Szczegoly tytul={t("warunkiTytul")} wartosc={t(zaleglosci === "sa" || podwojne === "jest" ? "warunkiPrzeszkody" : zaleglosci === "nie_wiem" || podwojne === "nie_wiem" ? "warunkiDoSprawdzenia" : "warunkiBrakPrzeszkod")} etykiety={etykietySzczegolow}>
        <Wybor nazwa="zaleglosci" legenda={t("zaleglosci")} opcje={[["brak", t("brak")], ["sa", t("sa")], ["nie_wiem", t("nieWiem")]]} wartosc={zaleglosci} zmien={setZaleglosci} />
        <Wybor nazwa="podwojne" legenda={t("podwojne")} opcje={[["brak", t("brak")], ["jest", t("sa")], ["nie_wiem", t("nieWiem")]]} wartosc={podwojne} zmien={setPodwojne} />
      </Szczegoly>

      <div className="space-y-3">
        <Krok n={3} tytul={t("krok3")} />
        <Button type="submit" rozmiar="lg" disabled={!wybrana || stan === "pracuje"} className={cn("w-full sm:w-auto")}>
          {stan === "pracuje" && <Loader2 aria-hidden className="size-5 animate-spin" />}
          {t("przygotuj")}
        </Button>
        <div>
          {stan === "pracuje" && <Postep kroki={t("postepKroki")} sekund={80} />}
          {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
        </div>
      </div>
    </form>
  );
}
