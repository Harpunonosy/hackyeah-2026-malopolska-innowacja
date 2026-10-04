"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, BellRing, Siren } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { nazwaObszaru, type ObszarId } from "@/lib/obszary";
import { ETYKIETY_TYPOW, TYPY_SPRAW, type TypSprawy } from "@/lib/sprawy-etykiety";
import { ETYKIETY_PRIORYTETU, ETYKIETY_STATUSOW, type Status } from "@/lib/statusy";
import { noweSprawy, odpytywanie } from "@/lib/odpytywanie";

type Wiersz = {
  id: string; numer: string; status: Status; priorytet: number; kryzys: boolean; obszar: ObszarId | null; powiat: string | null;
  typ: string; tytul: string | null; streszczenie: string | null; najlepsze_dopasowanie: number | null; termin_sla: string; created_at: string; ocena_gotowa: boolean; syntetyczne: boolean;
};

function dzwiek() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch {
    /* brak dźwięku nie jest błędem */
  }
}

/** Powiadomienie systemowe (pulpit), gdy przeglądarka ma zgodę. Kliknięcie przenosi do Centrali. */
function naPulpit(tytul: string, tresc: string) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const n = new Notification(tytul, { body: tresc, tag: "splot-nowe", icon: "/favicon.ico" });
    n.onclick = () => { window.focus(); n.close(); };
  } catch {
    /* brak powiadomień nie jest błędem */
  }
}

function PrzelacznikPulpitu() {
  const t = useTranslations("centralaPulpit");
  const [zgoda, setZgoda] = React.useState<NotificationPermission | "brak" | null>(null);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setZgoda(typeof Notification === "undefined" ? "brak" : Notification.permission));
    return () => cancelAnimationFrame(id);
  }, []);
  if (zgoda === null) return null;
  if (zgoda === "brak") return <p className="text-sm text-muted">{t("brak")}</p>;
  if (zgoda === "denied") return <p className="text-sm text-muted">{t("zablokowane")}</p>;
  if (zgoda === "granted") return <p className="flex items-center gap-2 text-sm font-semibold text-ok"><BellRing aria-hidden className="size-5" />{t("wlaczone")}</p>;
  return (
    <div className="space-y-1">
      <Button type="button" wariant="obrys" onClick={async () => setZgoda(await Notification.requestPermission())}><BellRing aria-hidden className="size-5" />{t("wlacz")}</Button>
      <p className="text-sm text-muted">{t("opis")}</p>
    </div>
  );
}

export function Skrzynka() {
  const tp = useTranslations("centralaPulpit");
  // Tłumaczenie przez ref: zmiana funkcji nie restartuje odpytywania.
  const tpRef = React.useRef(tp);
  React.useEffect(() => { tpRef.current = tp; }, [tp]);
  const router = useRouter();
  const [wiersze, setWiersze] = React.useState<Wiersz[] | null>(null);
  const [nowe, setNowe] = React.useState<string[]>([]);
  const znane = React.useRef<Set<string> | null>(null);
  const noweOd = React.useRef<string | undefined>(undefined);
  const [filtr, setFiltr] = React.useState<"wszystkie" | TypSprawy>("wszystkie");
  const [strona, setStrona] = React.useState(1);
  const [razem, setRazem] = React.useState(0);
  const [doOdpowiedzi, setDoOdpowiedzi] = React.useState(0);
  const [metryki, setMetryki] = React.useState<{ odpowiedzianych: number; mediana_min: string | null; w_terminie: number } | null>(null);
  const [bladSieci, setBladSieci] = React.useState(false);

  React.useEffect(() => {
    let aktywny = true;
    async function pobierz(signal: AbortSignal) {
      const params = new URLSearchParams({ strona: String(strona) });
      if (filtr !== "wszystkie") params.set("typ", filtr);
      if (noweOd.current) params.set("od", noweOd.current);
      const r = await fetch(`/api/admin/zgloszenia?${params}`, { cache: "no-store", signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });
      if (!aktywny) return;
      if (r.status === 401) { router.push("/centrala/logowanie"); return; }
      if (!r.ok) throw new Error("skrzynka_niedostepna");
      const { zgloszenia, metryki: m, teraz, razem: liczba, doOdpowiedzi: oczekujace, nowe: aktualne } = (await r.json()) as { zgloszenia: Wiersz[]; teraz: string; razem: number; doOdpowiedzi: number; nowe: Wiersz[]; metryki: { odpowiedzianych: number; mediana_min: string | null; w_terminie: number } };
      if (!aktywny) return;
      setBladSieci(false);
      setMetryki(m); setRazem(liczba); setDoOdpowiedzi(oczekujace);
      {
        const pierwsze = znane.current === null;
        noweOd.current ??= teraz;
        znane.current ??= new Set<string>();
        const swieze = noweSprawy(znane.current, aktualne, pierwsze, noweOd.current).map((z) => `${ETYKIETY_TYPOW[z.typ as TypSprawy] ?? z.typ} ${z.numer}`);
        if (swieze.length) {
          setNowe((n) => [...swieze, ...n].slice(0, 5));
          dzwiek();
          naPulpit(tpRef.current("tytul", { n: swieze.length }), swieze.join(", "));
        }
      }
      noweOd.current = teraz;
      setWiersze(zgloszenia);
    }
    const stop = odpytywanie(pobierz, 3000, () => { if (aktywny) setBladSieci(true); });
    return () => {
      aktywny = false;
      stop();
    };
  }, [router, strona, filtr]);

  const widoczne = wiersze;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">Skrzynka spraw</h1>
          <p className="text-muted">Lista odświeża się co 3 sekundy. Do obsługi: {doOdpowiedzi}.</p>
          {metryki && metryki.odpowiedzianych > 0 && (
            <p className="text-muted">
              Szybkość odpowiedzi: mediana pierwszej odpowiedzi {metryki.mediana_min ? `${metryki.mediana_min} min` : "brak danych"}, w terminie {metryki.w_terminie} z {metryki.odpowiedzianych}.
            </p>
          )}
        </div>
        <PrzelacznikPulpitu />
        <Button
          type="button"
          wariant="obrys"
          onClick={async () => {
            await fetch("/api/centrala/wyloguj", { method: "POST" });
            router.push("/centrala/logowanie");
          }}
        >
          Wyloguj
        </Button>
      </div>

      <div role="group" aria-label="Filtr rodzaju sprawy" className="flex flex-wrap gap-2">
        {(["wszystkie", ...TYPY_SPRAW] as const).map((f) => (
          <Button key={f} type="button" wariant="obrys" aria-pressed={filtr === f} className="aria-pressed:bg-fg aria-pressed:text-bg" onClick={() => { setFiltr(f); setStrona(1); setWiersze(null); }}>
            {f === "wszystkie" ? "Wszystkie" : ETYKIETY_TYPOW[f]}
          </Button>
        ))}
      </div>

      <nav aria-label="Strony skrzynki" className="flex flex-wrap items-center gap-3">
        <Button wariant="obrys" disabled={strona === 1} onClick={() => { setStrona(p => p - 1); setWiersze(null); }}>Poprzednia</Button>
        <span role="status">Strona {strona} z {Math.max(1, Math.ceil(razem / 50))}. Łącznie spraw: {razem}.</span>
        <Button wariant="obrys" disabled={strona * 50 >= razem} onClick={() => { setStrona(p => p + 1); setWiersze(null); }}>Następna</Button>
      </nav>

      <div aria-live="assertive">
        {nowe.length > 0 && (
          <p className="flex items-center gap-2 rounded-xl border-4 border-accent bg-card p-4 text-lg font-bold">
            <Bell aria-hidden className="size-6" />
            Nowa sprawa: {nowe.join(", ")}
          </p>
        )}
      </div>
      {bladSieci && <p role="status" className="rounded-xl border-2 border-primary p-4 font-semibold">{tp("bladSieci")}</p>}

      {widoczne === null ? (
        <p role="status">Ładuję…</p>
      ) : widoczne.length === 0 ? (
        <p className="text-lg">Brak zgłoszeń.</p>
      ) : (
        <ul className="space-y-3">
          {widoczne.map((w) => (
            <li key={w.id}>
              <Link
                href={`/centrala/zgloszenia/${w.id}`}
                className={`block space-y-2 rounded-2xl border-2 bg-card p-4 text-fg no-underline hover:bg-fg hover:text-bg ${w.kryzys ? "border-primary border-4" : "border-fg"}`}
              >
                <span className="flex flex-wrap items-center gap-2">
                  {w.kryzys && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 font-bold text-primary-fg">
                      <Siren aria-hidden className="size-4" /> Kryzys
                    </span>
                  )}
                  <span className="font-mono font-bold">{w.numer}</span>
                  <Chip>{ETYKIETY_TYPOW[w.typ as TypSprawy] ?? w.typ}</Chip>
                  <Chip>{ETYKIETY_STATUSOW[w.status].etykieta}</Chip>
                  <Chip>Priorytet: {ETYKIETY_PRIORYTETU[w.priorytet]}</Chip>
                  {w.obszar && <Chip>{nazwaObszaru(w.obszar)}</Chip>}
                  {w.powiat && <Chip>{w.powiat}</Chip>}
                  {!w.ocena_gotowa && <Chip>Ocena AI w toku…</Chip>}
                  {w.syntetyczne && <Chip>dane demo</Chip>}
                </span>
                <span className="block text-lg">{w.streszczenie ?? w.tytul ?? "Zgłoszenie czeka na ocenę AI."}</span>
                <span className="block text-sm opacity-80">
                  Wpłynęło {new Date(w.created_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })} · termin odpowiedzi{" "}
                  {new Date(w.termin_sla).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
