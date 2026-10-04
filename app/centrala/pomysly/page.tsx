import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AkceptujTest, PodsumujOpinie, StatusFiszki } from "@/components/centrala/akcje-pomyslow";
import { CentralaNav } from "@/components/centrala/centrala-nav";
import { Chip } from "@/components/ui/chip";
import { katalog } from "@/lib/katalog";
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
  const { mapa: innowacjaPoId } = await katalog();
  const c = db();
  const [fiszki, opinie, testy, doAkceptacji] = await Promise.all([
    c.query("select id, tytul, opis, istota, dla_kogo, etap, ocena_wstepna, podobne, status, publiczna, wyniki_testu, created_at from fiszki order by (status='zgloszona') desc, created_at desc limit 40"),
    c.query(`select innowacja_id, test_id, (select tytul from testy where id=opinie.test_id) as tytul_testu, count(*)::int as n, round(avg(ocena)::numeric,1) as srednia,
               count(*) filter (where odpowiedzi->>'polecilbys'='tak')::int as polecaja,
               (array_agg(propozycja order by created_at desc) filter (where propozycja <> ''))[1:3] as propozycje
             from opinie group by innowacja_id, test_id order by n desc`),
    c.query(`select t.id, t.tytul, t.powiat, t.termin, t.liczba_miejsc, (select count(*)::int from zapisy_testy z where z.test_id=t.id) as zapisani from testy t where t.status='otwarty' order by t.tytul`),
    c.query("select id, tytul, opis, powiat, termin, liczba_miejsc, numer from testy where status='do_akceptacji' order by created_at"),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <CentralaNav aktywna="pomysly" />
        <h1 className="text-4xl font-bold sm:text-5xl">Pomysły, opinie i testy</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted">Co mieszkańcy i organizacje zgłosili w Pracowni i Próbowni. Ocena pomysłów to wstępna ocena AI według karty ROPS, a nie decyzja komisji.</p>
      </div>

      {doAkceptacji.rows.length > 0 && (
        <section aria-labelledby="dotest-h" className="space-y-4">
          <h2 id="dotest-h" className="text-3xl font-extrabold">Testy do akceptacji ({doAkceptacji.rows.length})</h2>
          <ul className="space-y-4">
            {doAkceptacji.rows.map((t) => (
              <li key={t.id} className="karta space-y-2 border-l-8 border-l-primary p-6">
                <h3 className="font-display text-2xl font-bold">{t.tytul}</h3>
                <p>{t.opis}</p>
                <p className="text-muted">{String(t.powiat).replace("powiat ", "")} · {t.termin} · miejsc: {t.liczba_miejsc}{t.numer ? ` · sprawa ${t.numer}` : ""}</p>
                <AkceptujTest id={t.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="fiszki-h" className="space-y-4">
        <h2 id="fiszki-h" className="text-3xl font-extrabold">Zgłoszone pomysły ({fiszki.rows.length})</h2>
        {fiszki.rows.length === 0 && <p className="text-lg">Nie ma jeszcze zgłoszonych pomysłów.</p>}
        <ul className="space-y-4">
          {fiszki.rows.map((f) => {
            const oceny = Array.isArray(f.ocena_wstepna) ? (f.ocena_wstepna as Ocena[]).filter(o=>o && typeof o.nazwa === "string" && Number.isFinite(o.punkty)) : [];
            const suma = oceny.reduce((s, o) => s + o.punkty, 0);
            const podobne = Array.isArray(f.podobne) ? (f.podobne as { id: string; nazwa: string }[]).filter(p=>p && typeof p.id === "string" && typeof p.nazwa === "string") : [];
            return (
              <li key={f.id} className={`karta space-y-3 p-6 ${f.status === "zgloszona" ? "border-l-8 border-l-primary" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip className={f.status === "zgloszona" ? "bg-primary text-primary-fg" : ""}>{STATUS[f.status] ?? f.status}</Chip>
                  <Chip>{ETAP[f.etap] ?? f.etap}</Chip>
                  {oceny.length > 0 && <Chip>Ocena pomocnicza: {suma}/50</Chip>}
                  <span className="text-sm text-muted">{fmt(f.created_at)}</span>
                </div>
                <h3 className="font-display text-2xl font-bold">{f.tytul}</h3>
                <p className="text-lg">{f.opis}</p>
                <details className="karta-mala px-4 py-2">
                  <summary className="min-h-10 cursor-pointer font-semibold">Szczegóły fiszki i ocena</summary>
                  <div className="space-y-3 py-2">
                    <p><strong>Na czym polega:</strong> {f.istota}</p>
                    <p><strong>Dla kogo:</strong> {f.dla_kogo}</p>
                    {oceny.length > 0 && <p className="text-sm text-muted">Ocena przesłana z formularza autora; nie jest zweryfikowaną oceną komisji.</p>}
                    {oceny.length > 0 && (
                      <ul className="grid gap-x-6 sm:grid-cols-2">{oceny.map((o) => <li key={o.id}>{o.nazwa.split(" (")[0]}: <strong className={o.ok ? "text-ok" : "text-primary"}>{o.punkty}/10</strong></li>)}</ul>
                    )}
                    <p><strong>Podobne w Bibliotece:</strong>{" "}{podobne.length ? podobne.map((p, i) => <span key={p.id}>{i > 0 && ", "}<Link href={`/wiedza/biblioteka/${p.id}`}>{p.nazwa}</Link></span>) : "brak"}</p>
                  </div>
                </details>
                <StatusFiszki id={f.id} status={f.status} publiczna={f.publiczna} etap={f.etap} wyniki={f.wyniki_testu ?? ""} />
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
            <li key={o.test_id ?? o.innowacja_id} className="karta space-y-3 p-6">
              <h3 className="font-display text-2xl font-bold">{o.tytul_testu ?? innowacjaPoId.get(o.innowacja_id)?.nazwa ?? o.innowacja_id}</h3>
              <p className="flex flex-wrap gap-2">
                <Chip>{o.n} opinii</Chip><Chip>średnia {String(o.srednia).replace(".", ",")}/5</Chip><Chip>poleca {o.polecaja} z {o.n}</Chip>
              </p>
              {o.propozycje?.length > 0 && <ul className="list-disc pl-6 text-muted">{o.propozycje.map((p: string) => <li key={p}>{p}</li>)}</ul>}
              {o.innowacja_id && <PodsumujOpinie innowacjaId={o.innowacja_id} />}
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
