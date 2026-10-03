"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ETYKIETY_STATUSOW, STATUSY, type Status } from "@/lib/statusy";
import { ETYKIETY_TYPOW, type TypSprawy } from "@/lib/sprawy-etykiety";

type Dane = {
  numer: string;
  status: Status;
  historia: { status: Status; notatka: string | null; at: string }[];
  wiadomosci: { tresc: string; created_at: string; wygenerowane_przez_ai: boolean; od: string; nadawca: string | null }[];
  dopasowania: { id: string; nazwa: string; dlaczego: string | null }[];
  ocena_pomocy: number | null;
  created_at: string;
  typ: string;
  tytul: string | null;
  termin_sla: string;
  pierwsza_odpowiedz_at: string | null;
  rozmowy: { id: string; tytul: string; wiadomosci: { tresc: string; created_at: string; od: string }[] }[];
  powiadomienia: { typ: string; tytul: string; tresc: string; link: string | null; kanal: string; created_at: string }[];
};

function czasOdpowiedzi(od: string, do_: string) {
  const min = Math.max(1, Math.round((new Date(do_).getTime() - new Date(od).getTime()) / 60000));
  return min < 120 ? `${min} min` : min < 2880 ? `${Math.round(min / 60)} godz.` : `${Math.round(min / 1440)} dni`;
}
const fmt = (d: string) => new Date(d).toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" });

function RozmowaWlasciciela({ numer, nr, r }: { numer: string; nr: number; r: Dane["rozmowy"][number] }) {
  const t = useTranslations("moje");
  const [tresc, setTresc] = React.useState("");
  const [info, setInfo] = React.useState("");
  return (
    <article className="karta space-y-3 p-5">
      <h3 className="text-xl font-bold">{t("osoba", { n: nr })}: {r.tytul}</h3>
      {r.wiadomosci.map((w) => (
        <p key={w.created_at} className="karta-mala whitespace-pre-line p-3">
          {w.tresc}
          <span className="mt-1 block text-sm text-muted">{w.od === "wlasciciel" ? "Ty" : t("osoba", { n: nr })} · {fmt(w.created_at)}</span>
        </p>
      ))}
      <form className="space-y-2" onSubmit={async (e) => {
        e.preventDefault();
        const odp = await fetch("/api/rozmowy/odpowiedz", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ numer, rozmowaId: r.id, tresc }) });
        if (odp.ok) { setTresc(""); setInfo(t("wyslanoOdp")); }
      }}>
        <label htmlFor={`rozm-${r.id}`} className="block font-bold">{t("odpiszOsobie")}</label>
        <textarea id={`rozm-${r.id}`} rows={3} value={tresc} onChange={(e) => setTresc(e.target.value)} className="block w-full rounded-xl border-2 border-line bg-card p-3 text-lg hover:border-fg" />
        <Button type="submit" disabled={tresc.trim().length < 2}>{t("wyslijOdp")}</Button>
        <p role="status" className="font-semibold text-ok">{info}</p>
      </form>
    </article>
  );
}

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
      <p className="flex flex-wrap items-center gap-2">
        <Chip>{ETYKIETY_TYPOW[dane.typ as TypSprawy] ?? dane.typ}</Chip>
        {dane.tytul && <span className="font-display text-xl font-bold">{dane.tytul}</span>}
        <span className="text-muted">
          {dane.pierwsza_odpowiedz_at
            ? t("odpowiedzianoW", { czas: czasOdpowiedzi(dane.created_at, dane.pierwsza_odpowiedz_at) })
            : t("terminOdpowiedzi", { data: fmt(dane.termin_sla) })}
        </span>
      </p>
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
                {w.od === "wlasciciel" ? "Autor ogłoszenia · " : w.od === "autor" ? "Ty · " : w.od === "ekspert" ? `${w.nadawca ?? "Ekspert"} · ` : "ROPS · "}{fmt(w.created_at)}
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

      {dane.rozmowy.length > 0 && (
        <section aria-labelledby="roz" className="space-y-4" aria-live="polite">
          <h2 id="roz" className="text-2xl font-bold">{t("rozmowy")}</h2>
          <p className="text-muted">{t("rozmowyInfo")}</p>
          {dane.rozmowy.map((r, i) => (
            <RozmowaWlasciciela key={r.id} numer={numer} nr={i + 1} r={r} />
          ))}
        </section>
      )}

      {dane.powiadomienia.length > 0 && (
        <section aria-labelledby="pow" className="space-y-3" aria-live="polite">
          <h2 id="pow" className="text-2xl font-bold">{t("powiadomienia")}</h2>
          <ul className="space-y-2">
            {dane.powiadomienia.map((p) => (
              <li key={p.created_at + p.typ} className="karta-mala space-y-1 p-4">
                <p className="font-bold">{p.tytul}</p>
                <p>{p.tresc}</p>
                <p className="text-sm text-muted">{fmt(p.created_at)} · {p.kanal === "email" ? t("kanalEmail") : t("kanalAplikacja")}{p.link && <> · <Link href={p.link}>{t("otworz")}</Link></>}</p>
              </li>
            ))}
          </ul>
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
