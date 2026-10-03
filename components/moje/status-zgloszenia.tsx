"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ETYKIETY_STATUSOW, STATUSY, type Status } from "@/lib/statusy";

type Dane = {
  numer: string;
  status: Status;
  historia: { status: Status; notatka: string | null; at: string }[];
  wiadomosci: { tresc: string; created_at: string; wygenerowane_przez_ai: boolean; od: string }[];
  dopasowania: { id: string; nazwa: string; dlaczego: string | null }[];
  ocena_pomocy: number | null;
};

const fmt = (d: string) => new Date(d).toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" });

export function StatusZgloszenia({ numer }: { numer: string }) {
  const t = useTranslations("moje");
  const [dane, setDane] = React.useState<Dane | null>(null);
  const [brak, setBrak] = React.useState(false);
  const [ocena, setOcena] = React.useState<number | null>(null);
  const [odp, setOdp] = React.useState("");
  const [wyslano, setWyslano] = React.useState(false);

  React.useEffect(() => {
    let aktywny = true;
    async function pobierz() {
      const r = await fetch(`/api/zgloszenia/${numer}`, { cache: "no-store" });
      if (!aktywny) return;
      if (r.status === 404) return setBrak(true);
      if (r.ok) setDane(await r.json());
    }
    pobierz();
    const timer = setInterval(pobierz, 4000);
    return () => {
      aktywny = false;
      clearInterval(timer);
    };
  }, [numer]);

  async function wystawOcene(n: number) {
    setOcena(n);
    await fetch(`/api/zgloszenia/${numer}/ocena`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ocena: n }) });
  }

  if (brak) return <p role="alert" className="text-lg font-semibold">{t("nieZnaleziono")}</p>;
  if (!dane) return <p role="status">…</p>;

  const osiagniete = new Set(dane.historia.map((h) => h.status));
  const etapy: Status[] = ["wyslane", "przeczytane", "w_analizie", "odpowiedz"];

  return (
    <div className="space-y-8">
      <section aria-labelledby="os-czasu" className="space-y-3">
        <h2 id="os-czasu" className="text-2xl font-bold">
          {t("os")}
        </h2>
        <ol className="space-y-3">
          {etapy.map((s) => {
            const wpis = dane.historia.filter((h) => h.status === s).at(-1);
            const gotowe = osiagniete.has(s);
            return (
              <li key={s} className="flex items-start gap-3" aria-current={dane.status === s ? "step" : undefined}>
                {gotowe ? <CheckCircle2 aria-hidden className="mt-1 size-6 shrink-0 text-ok" /> : <Circle aria-hidden className="mt-1 size-6 shrink-0 text-muted" />}
                <div>
                  <p className={gotowe ? "text-lg font-bold" : "text-lg text-muted"}>
                    {ETYKIETY_STATUSOW[s].etykieta}
                    {gotowe ? "" : " (jeszcze nie)"}
                  </p>
                  <p className="text-sm text-muted">{wpis ? fmt(wpis.at) : ETYKIETY_STATUSOW[s].opis}</p>
                </div>
              </li>
            );
          })}
        </ol>
        {STATUSY.includes(dane.status) && !etapy.includes(dane.status) && (
          <p className="font-semibold">Aktualny status: {ETYKIETY_STATUSOW[dane.status].etykieta}. {ETYKIETY_STATUSOW[dane.status].opis}</p>
        )}
        <p className="text-sm text-muted">{t("odswiezanie")}</p>
      </section>

      {dane.wiadomosci.length > 0 && (
        <section aria-labelledby="odp" className="space-y-3" aria-live="polite">
          <h2 id="odp" className="text-2xl font-bold">
            {t("odpowiedz")}
          </h2>
          {dane.wiadomosci.map((w) => (
            <article key={w.created_at} className="space-y-2 karta p-5">
              <p className="whitespace-pre-line text-lg">{w.tresc}</p>
              <p className="text-sm text-muted">
                {w.od === "autor" ? "Ty · " : "ROPS · "}{fmt(w.created_at)}
                {w.wygenerowane_przez_ai ? ` · ${t("aiOdpowiedz")}` : ""}
              </p>
            </article>
          ))}
          <form className="space-y-2" onSubmit={async (e) => {
            e.preventDefault();
            if (odp.trim().length < 2) return;
            const r = await fetch(`/api/zgloszenia/${numer}/wiadomosc`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tresc: odp }) });
            if (r.ok) { setOdp(""); setWyslano(true); }
          }}>
            <label htmlFor="odp-autora" className="block text-lg font-bold">{t("napisz")}</label>
            <textarea id="odp-autora" rows={3} value={odp} onChange={(e) => setOdp(e.target.value)} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
            <Button type="submit" disabled={odp.trim().length < 2}>{t("wyslijOdp")}</Button>
            {wyslano && <p role="status" className="font-semibold text-ok">{t("wyslanoOdp")}</p>}
          </form>
          <div className="space-y-2">
            <p className="font-semibold" id="ocena-pyt">
              {t("ocenaPytanie")}
            </p>
            {ocena || dane.ocena_pomocy ? (
              <p role="status">{t("ocenaDzieki")}</p>
            ) : (
              <div role="group" aria-labelledby="ocena-pyt" className="flex flex-wrap gap-2">
                {[
                  [1, "Nie"],
                  [3, "Trochę"],
                  [5, "Tak"],
                ].map(([n, e]) => (
                  <Button key={n} type="button" wariant="obrys" onClick={() => wystawOcene(n as number)}>
                    {e}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {dane.dopasowania.length > 0 && (
        <section aria-labelledby="dop" className="space-y-3">
          <h2 id="dop" className="text-2xl font-bold">
            {t("dopasowania")}
          </h2>
          <ul className="space-y-2">
            {dane.dopasowania.map((d) => (
              <li key={d.id}>
                <Link href={`/wiedza/biblioteka/${d.id}`} className="font-semibold">
                  {d.nazwa}
                </Link>
                {d.dlaczego && <span className="block text-muted">{d.dlaczego}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
