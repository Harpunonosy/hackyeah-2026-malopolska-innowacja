import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Odpowiedz } from "@/components/centrala/odpowiedz";
import { ZmienStatus } from "@/components/centrala/zmien-status";
import { Chip } from "@/components/ui/chip";
import { db } from "@/lib/db";
import { nazwaObszaru, type ObszarId } from "@/lib/obszary";
import { czyAdmin } from "@/lib/sesja";
import { ETYKIETY_TYPOW, type TypSprawy } from "@/lib/sprawy-etykiety";
import { ETYKIETY_PRIORYTETU, ETYKIETY_STATUSOW, type Status } from "@/lib/statusy";
import { zmienStatus } from "@/lib/zgloszenia";

export const metadata: Metadata = { title: "Centrala: zgłoszenie" };

const UUID = /^[0-9a-f-]{36}$/i;
const fmt = (d: Date) => d.toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" });

export default async function Page(props: PageProps<"/centrala/zgloszenia/[id]">) {
  if (!(await czyAdmin())) redirect("/centrala/logowanie");
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();
  const c = db();
  const z = (await c.query("select * from zgloszenia where id=$1", [id])).rows[0];
  if (!z) notFound();
  if (z.status === "wyslane") {
    await zmienStatus(id, "przeczytane", "Otwarte w Centrali");
    z.status = "przeczytane";
  }
  const [dop, hist, wiad, pow] = await Promise.all([
    c.query("select i.id, i.nazwa, i.kategoria, d.trafnosc, d.dlaczego from dopasowania d join innowacje i on i.id=d.innowacja_id where d.zgloszenie_id=$1 order by d.pozycja", [id]),
    c.query("select status, notatka, at from historia_statusu where zgloszenie_id=$1 order by at", [id]),
    c.query("select w.tresc, w.created_at, w.wygenerowane_przez_ai, w.od from wiadomosci w join watki t on t.id=w.watek_id where t.typ='zgloszenie' and t.obiekt_id=$1 order by w.created_at", [id]),
    c.query("select typ, tresc, kanal, created_at from powiadomienia where adresat='autor' and numer_sprawy=$1 order by created_at desc limit 5", [z.numer]),
  ]);

  return (
    <div className="space-y-8">
      <p>
        <Link href="/centrala/zgloszenia">← Skrzynka</Link>
      </p>
      <header className="space-y-3">
        <h1 className="text-4xl font-bold">
          {ETYKIETY_TYPOW[z.typ as TypSprawy] ?? "Zgłoszenie"} <span className="font-mono">{z.numer}</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          {z.tytul && <Chip>{z.tytul}</Chip>}
          {z.kryzys && <Chip className="border-primary bg-primary text-primary-fg">Kryzys, odpowiedz natychmiast</Chip>}
          <Chip>{ETYKIETY_STATUSOW[z.status as Status].etykieta}</Chip>
          <Chip>Priorytet: {ETYKIETY_PRIORYTETU[z.priorytet]}</Chip>
          {z.obszar && <Chip>{nazwaObszaru(z.obszar as ObszarId)}</Chip>}
          {z.powiat && <Chip>{z.powiat}</Chip>}
          <Chip>Kanał: {z.kanal}</Chip>
          {z.ocena_pomocy && <Chip>Ocena pomocy: {z.ocena_pomocy}/5</Chip>}
        </div>
        <p className="text-muted">Wpłynęło {fmt(z.created_at)}. Termin odpowiedzi {fmt(z.termin_sla)}.</p>
      </header>

      {z.typ === "pomysl" && z.obiekt_id && (
        <p><Link href="/centrala/pomysly">Zobacz pełną fiszkę i ocenę wstępną w panelu pomysłów</Link></p>
      )}

      <section aria-labelledby="tresc-h" className="space-y-2">
        <h2 id="tresc-h" className="text-2xl font-bold">Treść (dane osobowe zamaskowane)</h2>
        <p className="whitespace-pre-line karta p-5 text-lg">{z.tresc_zamaskowana}</p>
      </section>

      <section aria-labelledby="ai-h" className="space-y-2">
        <h2 id="ai-h" className="text-2xl font-bold">Ocena asystenta AI</h2>
        {z.ocena_ai ? (
          <div className="space-y-2 karta p-5">
            <p><strong>Streszczenie:</strong> {z.streszczenie}</p>
            <p><strong>Dla kogo:</strong> {z.grupa_docelowa}</p>
            <p className="flex flex-wrap gap-2">{(z.tagi ?? []).map((t: string) => <Chip key={t}>{t}</Chip>)}</p>
            <p className="text-sm text-muted">To propozycja do zatwierdzenia przez pracownika ROPS.</p>
          </div>
        ) : (
          <p role="status">Ocena AI jest w toku. Odśwież stronę za kilka sekund.</p>
        )}
      </section>

      <section aria-labelledby="dop-h" className="space-y-2">
        <h2 id="dop-h" className="text-2xl font-bold">Dopasowane innowacje</h2>
        {dop.rows.length === 0 ? (
          <p className="text-lg">Brak dopasowań: to kandydat na białą plamę.</p>
        ) : (
          <ul className="space-y-2">
            {dop.rows.map((d) => (
              <li key={d.id} className="karta-mala p-3">
                <Link href={`/wiedza/biblioteka/${d.id}`} className="font-bold">{d.nazwa}</Link>{" "}
                <span className="text-sm text-muted">({d.trafnosc ?? "wstępnie"}{d.trafnosc ? "/100" : ""})</span>
                <span className="block">{d.dlaczego}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {wiad.rows.length > 0 && (
        <section aria-labelledby="wyslane-h" className="space-y-2">
          <h2 id="wyslane-h" className="text-2xl font-bold">Wątek z autorem</h2>
          {wiad.rows.map((w) => (
            <p key={w.created_at} className="whitespace-pre-line karta-mala p-3">
              {w.tresc}
              <span className="mt-1 block text-sm text-muted">{w.od === "autor" ? "Autor zgłoszenia · " : "ROPS · "}{fmt(w.created_at)}{w.wygenerowane_przez_ai ? " · ze szkicu AI" : ""}</span>
            </p>
          ))}
          {pow.rows.map((p) => (
            <p key={p.created_at} className="rounded-xl border-2 border-dashed border-line p-3 text-sm">
              Powiadomienie ({p.kanal}, symulacja): {p.tresc}
            </p>
          ))}
        </section>
      )}

      <section aria-labelledby="dzialanie-h" className="space-y-4">
        <h2 id="dzialanie-h" className="text-2xl font-bold">Działanie</h2>
        <ZmienStatus id={id} status={z.status} />
        <Odpowiedz id={id} szkic={z.szkic_odpowiedzi} zablokowane={false} />
      </section>

      <section aria-labelledby="hist-h" className="space-y-2">
        <h2 id="hist-h" className="text-xl font-bold">Historia</h2>
        <ul className="text-sm">
          {hist.rows.map((h) => (
            <li key={h.at}>{fmt(h.at)}: {ETYKIETY_STATUSOW[h.status as Status].etykieta}{h.notatka ? `, ${h.notatka}` : ""}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
