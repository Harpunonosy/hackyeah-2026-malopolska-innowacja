"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Siren } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { nazwaObszaru, type ObszarId } from "@/lib/obszary";
import { ETYKIETY_PRIORYTETU, ETYKIETY_STATUSOW, type Status } from "@/lib/statusy";

type Wiersz = {
  id: string; numer: string; status: Status; priorytet: number; kryzys: boolean; obszar: ObszarId | null; powiat: string | null;
  streszczenie: string | null; najlepsze_dopasowanie: number | null; termin_sla: string; created_at: string; ocena_gotowa: boolean; syntetyczne: boolean;
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

  React.useEffect(() => {
    let aktywny = true;
    async function pobierz() {
      const r = await fetch("/api/admin/zgloszenia", { cache: "no-store" });
      if (r.status === 401) return router.push("/centrala/logowanie");
      if (!r.ok || !aktywny) return;
      const { zgloszenia } = (await r.json()) as { zgloszenia: Wiersz[] };
      if (znane.current) {
        const swieze = zgloszenia.filter((z) => !znane.current!.has(z.id)).map((z) => z.numer);
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

  const doOdpowiedzi = wiersze?.filter((w) => w.status !== "odpowiedz" && w.status !== "zamkniete").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">Skrzynka zgłoszeń</h1>
          <p className="text-muted">Lista odświeża się co 3 sekundy. Do obsługi: {doOdpowiedzi}.</p>
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

      <div aria-live="assertive">
        {nowe.length > 0 && (
          <p className="flex items-center gap-2 rounded-xl border-4 border-accent bg-card p-4 text-lg font-bold">
            <Bell aria-hidden className="size-6" />
            Nowe zgłoszenie: {nowe.join(", ")}
          </p>
        )}
      </div>

      {wiersze === null ? (
        <p role="status">Ładuję…</p>
      ) : wiersze.length === 0 ? (
        <p className="text-lg">Brak zgłoszeń.</p>
      ) : (
        <ul className="space-y-3">
          {wiersze.map((w) => (
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
                  <Chip>{ETYKIETY_STATUSOW[w.status].etykieta}</Chip>
                  <Chip>Priorytet: {ETYKIETY_PRIORYTETU[w.priorytet]}</Chip>
                  {w.obszar && <Chip>{nazwaObszaru(w.obszar)}</Chip>}
                  {w.powiat && <Chip>{w.powiat}</Chip>}
                  {!w.ocena_gotowa && <Chip>Ocena AI w toku…</Chip>}
                  {w.syntetyczne && <Chip>dane demo</Chip>}
                </span>
                <span className="block text-lg">{w.streszczenie ?? "Zgłoszenie czeka na ocenę AI."}</span>
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
