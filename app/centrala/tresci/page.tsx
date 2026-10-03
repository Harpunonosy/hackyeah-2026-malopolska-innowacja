import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CentralaNav } from "@/components/centrala/centrala-nav";
import { Odbiorcy } from "@/components/centrala/odbiorcy";
import { AkcjeDodanej, ImportInnowacji } from "@/components/centrala/import-innowacji";
import { Chip } from "@/components/ui/chip";
import { db } from "@/lib/db";
import { KATEGORIE } from "@/lib/biblioteka";
import { EdytorKart } from "@/components/centrala/edytor-kart";
import { katalog } from "@/lib/katalog";
import { czyAdmin } from "@/lib/sesja";

export const metadata: Metadata = { title: "Centrala: treści" };
export const dynamic = "force-dynamic";

export default async function Tresci() {
  if (!(await czyAdmin())) redirect("/centrala/logowanie");
  const { rows } = await db().query("select id, nazwa, kategoria, status, updated_at from innowacje where zrodlo='dodana' order by updated_at desc");
  const { lista } = await katalog();
  const dziennik = await db().query("select at, kto, akcja, obiekt, opis from dziennik order by at desc limit 15");
  return (
    <div className="space-y-10">
      <div>
        <CentralaNav aktywna="tresci" />
        <h1 className="text-4xl font-bold sm:text-5xl">Treści: Biblioteka innowacji</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted">Dodaj nową innowację z opisu lub strony ROPS. Asystent AI wypełni sześć pól karty, Ty sprawdzasz i publikujesz. Opublikowana innowacja od razu trafia do Biblioteki i do wyszukiwarki Swatki.</p>
      </div>
      <ImportInnowacji kategorie={KATEGORIE} />
      <section aria-labelledby="edycja-h" className="space-y-4">
        <h2 id="edycja-h" className="text-3xl font-extrabold">Edycja kart innowacji</h2>
        <p className="max-w-3xl text-lg text-muted">Popraw dowolną z {lista.length} kart, także z oryginalnej Biblioteki. Zmiana działa od razu.</p>
        <EdytorKart pozycje={lista.map((i) => ({ id: i.id, nazwa: i.nazwa }))} />
      </section>
      <section aria-labelledby="dodane-h" className="space-y-4">
        <h2 id="dodane-h" className="text-3xl font-extrabold">Dodane innowacje ({rows.length})</h2>
        {rows.length === 0 && <p className="text-lg">Nie dodano jeszcze żadnych innowacji. W Bibliotece jest 115 pozycji z oryginalnej Biblioteki ROPS.</p>}
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="karta flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="space-y-1">
                <p className="flex flex-wrap gap-2"><Chip className={r.status === "opublikowana" ? "bg-ok text-bg" : ""}>{r.status === "opublikowana" ? "Opublikowana" : "Szkic"}</Chip><Chip>{r.kategoria}</Chip></p>
                <p className="font-display text-xl font-bold">{r.status === "opublikowana" ? <Link href={`/wiedza/biblioteka/${r.id}`}>{r.nazwa}</Link> : r.nazwa}</p>
              </div>
              <AkcjeDodanej id={r.id} status={r.status} />
              {r.status === "opublikowana" && <div className="w-full"><Odbiorcy id={r.id} /></div>}
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="dz-h" className="space-y-3">
        <h2 id="dz-h" className="text-3xl font-extrabold">Dziennik zmian</h2>
        <ul className="space-y-1 text-sm">
          {dziennik.rows.map((d, i) => <li key={i}>{new Date(d.at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })} · {d.kto} · {d.akcja} · {d.obiekt}{d.opis ? ` · ${d.opis}` : ""}</li>)}
          {dziennik.rows.length === 0 && <li>Brak wpisów.</li>}
        </ul>
      </section>
    </div>
  );
}
