"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Siren } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { nazwaObszaru, type ObszarId } from "@/lib/obszary";
import { ETYKIETY_TYPOW, TYPY_SPRAW, type TypSprawy } from "@/lib/sprawy-etykiety";
import { ETYKIETY_PRIORYTETU, ETYKIETY_STATUSOW, type Status } from "@/lib/statusy";

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

export function Skrzynka() {
  const router = useRouter();
  const [wiersze, setWiersze] = React.useState<Wiersz[] | null>(null);
  const [nowe, setNowe] = React.useState<string[]>([]);
  const znane = React.useRef<Set<string> | null>(null);
  const [filtr, setFiltr] = React.useState<"wszystkie" | TypSprawy>("wszystkie");
  const [metryki, setMetryki] = React.useState<{ odpowiedzianych: number; mediana_min: string | null; w_terminie: number } | null>(null);

  React.useEffect(() => {
    let aktywny = true;
    async function pobierz() {
      const r = await fetch("/api/admin/zgloszenia", { cache: "no-store" });
      if (r.status === 401) return router.push("/centrala/logowanie");
      if (!r.ok || !aktywny) return;
      const { zgloszenia, metryki: m } = (await r.json()) as { zgloszenia: Wiersz[]; metryki: { odpowiedzianych: number; mediana_min: string | null; w_terminie: number } };
      setMetryki(m);
      if (znane.current) {
        const swieze = zgloszenia.filter((z) => !znane.current!.has(z.id)).map((z) => `${ETYKIETY_TYPOW[z.typ as TypSprawy] ?? z.typ} ${z.numer}`);
        if (swieze.length) {
          setNowe((n) => [...swieze, ...n].slice(0, 5));
          dzwiek();
        }
      }
      znane.current = new Set(zgloszenia.map((z) => z.id));
      setWiersze(zgloszenia);
    }
    pobierz();
    const timer = setInterval(pobierz, 3000);
    return () => {
      aktywny = false;
      clearInterval(timer);
    };
  }, [router]);

  const widoczne = wiersze?.filter((w) => filtr === "wszystkie" || w.typ === filtr) ?? null;
  const doOdpowiedzi = wiersze?.filter((w) => w.status !== "odpowiedz" && w.status !== "zamkniete").length ?? 0;

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
          <Button key={f} type="button" wariant="obrys" aria-pressed={filtr === f} className="aria-pressed:bg-fg aria-pressed:text-bg" onClick={() => setFiltr(f)}>
            {f === "wszystkie" ? "Wszystkie" : ETYKIETY_TYPOW[f]}
          </Button>
        ))}
      </div>

      <div aria-live="assertive">
        {nowe.length > 0 && (
          <p className="flex items-center gap-2 rounded-xl border-4 border-accent bg-card p-4 text-lg font-bold">
            <Bell aria-hidden className="size-6" />
            Nowa sprawa: {nowe.join(", ")}
          </p>
        )}
      </div>

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
