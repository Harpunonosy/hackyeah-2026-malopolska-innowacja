import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PodsumujOpinie, StatusFiszki } from "@/components/centrala/akcje-pomyslow";
import { CentralaNav } from "@/components/centrala/centrala-nav";
import { Chip } from "@/components/ui/chip";
import { innowacjaPoId } from "@/lib/biblioteka";
import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

export const metadata: Metadata = { title: "Centrala: pomysły, opinie i testy" };
export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
const STATUS: Record<string, string> = { zgloszona: "Nowy", przeczytana: "Przeczytany", w_ocenie: "W ocenie", zaproszona_do_naboru: "Zaproszony do naboru", odrzucona: "Odrzucony" };
const ETAP: Record<string, string> = { pomysl: "pomysł", prototyp: "prototyp", przetestowane: "przetestowane", gotowe: "gotowe" };

type Ocena = { id: string; nazwa: string; punkty: number; ok: boolean };

export default async function Page() {
  if (!(await czyAdmin())) redirect("/centrala/logowanie");
  const c = db();
  const [fiszki, opinie, testy] = await Promise.all([
    c.query("select id, tytul, opis, istota, dla_kogo, etap, ocena_wstepna, podobne, status, created_at from fiszki order by (status='zgloszona') desc, created_at desc limit 40"),
    c.query(`select innowacja_id, count(*)::int as n, round(avg(ocena)::numeric,1) as srednia,
               count(*) filter (where odpowiedzi->>'polecilbys'='tak')::int as polecaja,
               (array_agg(propozycja order by created_at desc) filter (where propozycja <> ''))[1:3] as propozycje
             from opinie group by innowacja_id order by n desc`),
    c.query(`select t.id, t.tytul, t.powiat, t.termin, t.liczba_miejsc, (select count(*)::int from zapisy_testy z where z.test_id=t.id) as zapisani from testy t order by t.tytul`),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <CentralaNav aktywna="pomysly" />
        <h1 className="text-4xl font-bold sm:text-5xl">Pomysły, opinie i testy</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted">Co mieszkańcy i organizacje zgłosili w Pracowni i Próbowni. Ocena pomysłów to wstępna ocena AI według karty ROPS, a nie decyzja komisji.</p>
      </div>

      <section aria-labelledby="fiszki-h" className="space-y-4">
        <h2 id="fiszki-h" className="text-3xl font-extrabold">Zgłoszone pomysły ({fiszki.rows.length})</h2>
        {fiszki.rows.length === 0 && <p className="text-lg">Nie ma jeszcze zgłoszonych pomysłów.</p>}
        <ul className="space-y-4">
          {fiszki.rows.map((f) => {
            const oceny = (f.ocena_wstepna as Ocena[] | null) ?? [];
            const suma = oceny.reduce((s, o) => s + o.punkty, 0);
            const podobne = (f.podobne as { id: string; nazwa: string }[] | null) ?? [];
            return (
              <li key={f.id} className={`karta space-y-3 p-6 ${f.status === "zgloszona" ? "border-l-8 border-l-primary" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip className={f.status === "zgloszona" ? "bg-primary text-primary-fg" : ""}>{STATUS[f.status] ?? f.status}</Chip>
                  <Chip>{ETAP[f.etap] ?? f.etap}</Chip>
                  {oceny.length > 0 && <Chip>Ocena wstępna AI: {suma}/50</Chip>}
                  <span className="text-sm text-muted">{fmt(f.created_at)}</span>
                </div>
                <h3 className="font-display text-2xl font-bold">{f.tytul}</h3>
                <p className="text-lg">{f.opis}</p>
                <details className="karta-mala px-4 py-2">
                  <summary className="min-h-10 cursor-pointer font-semibold">Szczegóły fiszki i ocena</summary>
                  <div className="space-y-3 py-2">
                    <p><strong>Na czym polega:</strong> {f.istota}</p>
                    <p><strong>Dla kogo:</strong> {f.dla_kogo}</p>
                    {oceny.length > 0 && (
                      <ul className="grid gap-x-6 sm:grid-cols-2">{oceny.map((o) => <li key={o.id}>{o.nazwa.split(" (")[0]}: <strong className={o.ok ? "text-ok" : "text-primary"}>{o.punkty}/10</strong></li>)}</ul>
                    )}
                    <p><strong>Podobne w Bibliotece:</strong>{" "}{podobne.length ? podobne.map((p, i) => <span key={p.id}>{i > 0 && ", "}<Link href={`/wiedza/biblioteka/${p.id}`}>{p.nazwa}</Link></span>) : "brak"}</p>
                  </div>
                </details>
                <StatusFiszki id={f.id} status={f.status} />
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="opinie-h" className="space-y-4">
        <h2 id="opinie-h" className="text-3xl font-extrabold">Opinie o rozwiązaniach</h2>
        {opinie.rows.length === 0 && <p className="text-lg">Nie ma jeszcze opinii.</p>}
        <ul className="space-y-4">
          {opinie.rows.map((o) => (
            <li key={o.innowacja_id} className="karta space-y-3 p-6">
              <h3 className="font-display text-2xl font-bold">{innowacjaPoId.get(o.innowacja_id)?.nazwa ?? o.innowacja_id}</h3>
              <p className="flex flex-wrap gap-2">
                <Chip>{o.n} opinii</Chip><Chip>średnia {String(o.srednia).replace(".", ",")}/5</Chip><Chip>poleca {o.polecaja} z {o.n}</Chip>
              </p>
              {o.propozycje?.length > 0 && <ul className="list-disc pl-6 text-muted">{o.propozycje.map((p: string) => <li key={p}>{p}</li>)}</ul>}
              <PodsumujOpinie innowacjaId={o.innowacja_id} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="testy-h" className="space-y-4">
        <h2 id="testy-h" className="text-3xl font-extrabold">Testy i zapisy</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {testy.rows.map((t) => (
            <li key={t.id} className="karta space-y-1 p-5">
              <h3 className="font-display text-xl font-bold">{t.tytul}</h3>
              <p className="text-muted">{String(t.powiat).replace("powiat ", "")}, {t.termin}</p>
              <p className="text-2xl font-extrabold text-primary">{t.zapisani} / {t.liczba_miejsc}</p>
              <p className="text-sm text-muted">zapisanych osób</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
