import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OcenaWniosku } from "@/components/centrala/ocena-wniosku";
import { CentralaNav } from "@/components/centrala/centrala-nav";
import { ResetDemo } from "@/components/centrala/reset-demo";
import { EdytorNaboru, NowyNabor } from "@/components/centrala/nabory";
import { schematNaboru } from "@/lib/nabor-schemat";
import { PrzelaczNabor } from "@/components/centrala/przelacz-nabor";
import { Chip } from "@/components/ui/chip";
import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

export const metadata: Metadata = { title: "Centrala: nabory" };
export const dynamic = "force-dynamic";

type Pole = { nr: number; tresc: string };
const fmt = (d: Date) => d.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });

export default async function Nabory() {
  if (!(await czyAdmin())) redirect("/centrala/logowanie");
  const c = db();
  const nabory = await c.query("select id, nazwa, program, opis, temat, aktywny, przyklad, otwarty_od, otwarty_do, formularz, schemat from nabory order by aktywny desc, nazwa");
  const wnioski = await c.query(`select w.id, w.nabor_id, w.pola, w.status, w.created_at, w.decyzja, w.eksport_at, z.numer
    from wnioski w left join zgloszenia z on z.typ='wniosek' and z.obiekt_id = w.id::text order by w.created_at desc limit 100`);
  return (
    <div className="space-y-10">
      <div>
        <CentralaNav aktywna="nabory" />
        <h1 className="text-4xl font-bold sm:text-5xl">Nabory i wnioski</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted">Otwarcie naboru włącza w Pracowni generator wniosków dla mieszkańców i organizacji. Szkice tematów z Radaru czekają tu na decyzję.</p>
      </div>
      <section aria-labelledby="int-h" className="karta space-y-3 p-6">
        <h2 id="int-h" className="text-2xl font-bold">Integracje z innymi systemami Hubu</h2>
        <p className="text-muted">Eksporty i otwarte API przygotowują platformę do współpracy z bazą grantową i innymi narzędziami ROPS.</p>
        <ul className="flex flex-wrap gap-3">
          <li><a className="inline-flex min-h-12 items-center rounded-xl border-2 border-fg px-4 font-semibold no-underline hover:bg-fg hover:text-bg" href="/api/admin/eksport/zgloszenia">Zgłoszenia (CSV)</a></li>
          <li><a className="inline-flex min-h-12 items-center rounded-xl border-2 border-fg px-4 font-semibold no-underline hover:bg-fg hover:text-bg" href="/api/admin/eksport/wnioski">Wnioski z naborów (JSON)</a></li>
          <li><Link className="inline-flex min-h-12 items-center rounded-xl border-2 border-fg px-4 font-semibold no-underline hover:bg-fg hover:text-bg" href="/centrala/integracje">API, webhooki i widżet</Link></li>
        </ul>
      </section>
      <NowyNabor />
      <ResetDemo />
      <ul className="space-y-5">
        {nabory.rows.map((n) => {
          const w = wnioski.rows.filter((x) => x.nabor_id === n.id);
          return (
            <li key={n.id} className={`karta space-y-3 p-6 ${n.aktywny ? "border-l-8 border-l-ok" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                <Chip className={n.aktywny ? "bg-ok text-bg" : ""}>{n.aktywny ? "Otwarty" : "Zamknięty"}</Chip>
                {n.przyklad && <Chip>przykład / szkic</Chip>}
                <Chip>wniosków: {w.length}</Chip>
              </div>
              <h2 className="font-display text-2xl font-bold">{n.nazwa}</h2>
              <p className="text-muted">{n.temat ?? n.opis}</p>
              {n.formularz?.uzasadnienie && <details className="karta-mala px-4 py-2"><summary className="min-h-10 cursor-pointer font-semibold">Uzasadnienie szkicu (z Radaru)</summary><p className="py-2">{n.formularz.uzasadnienie}</p></details>}
              <EdytorNaboru id={n.id} schemat={schematNaboru(n.schemat)} otwartyDo={n.otwarty_do ? new Date(n.otwarty_do).toISOString().slice(0, 10) : null} />
              <PrzelaczNabor id={n.id} aktywny={n.aktywny} />
              {w.length > 0 && (
                <ul className="space-y-2">
                  {w.map((x) => (
                    <li key={x.id}>
                      <details className="karta-mala px-4 py-2">
                        <summary className="min-h-10 cursor-pointer font-semibold">Wniosek z {fmt(x.created_at)} ({(x.pola as Pole[]).find((p) => p.nr === 1)?.tresc.slice(0, 80) ?? "bez tytułu"})</summary>
                        <dl className="space-y-3 py-2">{(x.pola as Pole[]).map((p) => <div key={p.nr}><dt className="text-sm font-bold text-muted">Pole {p.nr}</dt><dd className="whitespace-pre-line">{p.tresc}</dd></div>)}</dl>
                      </details>
                      <OcenaWniosku id={x.id} etap={x.status === "zlozony" || !x.status ? "zlozony" : x.status} numer={x.numer} decyzja={x.decyzja} przekazano={x.eksport_at ? x.eksport_at.toISOString() : null} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
