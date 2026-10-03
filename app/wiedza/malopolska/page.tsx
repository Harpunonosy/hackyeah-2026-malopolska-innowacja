import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { MapaWskaznikow } from "@/components/wiedza/mapa-wskaznikow";
import { Zapytaj } from "@/components/wiedza/zapytaj";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { faktyDodane } from "@/lib/fakty-baza";
import { faktyRaportow, MATERIALY, obszaryMapy, wskaznikiDoMapy } from "@/lib/wiedza";

export const metadata: Metadata = { title: "Kondycja Małopolski" };

export default async function Malopolska() {
  const mapa = await wskaznikiDoMapy();
  const dodane = await faktyDodane();
  const fakty = [...dodane.slice(0, 6), ...faktyRaportow.filter((f) => f.strona !== null)].slice(0, 9);
  const noweTeksty = new Set(dodane.map((f) => f.tekst));
  return (
    <Strona>
      <NaglowekStrony nadtytul="Skarbnica wiedzy" tytul="Kondycja Małopolski" opis="Najważniejsze wyzwania społeczne regionu na podstawie raportów ROPS i Mapy Wyzwań Społecznych." />

      <section aria-labelledby="wyz-h" className="space-y-5">
        <h2 id="wyz-h" className="text-3xl font-extrabold">8 obszarów wyzwań</h2>
        <ul className="grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-4">
          {obszaryMapy.map((o) => (
            <li key={o.id} className="karta flex flex-col gap-3 p-5">
              <h3 className="font-display text-xl font-bold">{o.nazwa}</h3>
              <ul className="list-disc space-y-1 pl-5 text-muted">{o.wyzwania.slice(0, 3).map((w) => <li key={w}>{w}</li>)}</ul>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mapa-h" className="space-y-4">
        <h2 id="mapa-h" className="text-3xl font-extrabold">Mapa wskaźników w powiatach</h2>
        <MapaWskaznikow powiaty={mapa.powiaty} obszary={mapa.obszary} />
        <p className="text-lg">Szukasz diagnozy dla swojej gminy? <Link href="/wiedza/powiat" className="font-semibold">Zobacz profile powiatów</Link>.</p>
      </section>

      <section aria-labelledby="zap-h" className="max-w-4xl space-y-4">
        <h2 id="zap-h" className="text-3xl font-extrabold">Zapytaj raporty</h2>
        <Zapytaj />
      </section>

      <section aria-labelledby="fakty-h" className="space-y-4">
        <h2 id="fakty-h" className="text-3xl font-extrabold">Co mówią raporty</h2>
        <ul className="grid auto-rows-fr gap-4 md:grid-cols-3">
          {fakty.map((f) => (
            <li key={f.tekst} className="karta flex flex-col gap-2 p-5">
              {noweTeksty.has(f.tekst) && <p><span className="rounded-full bg-accent px-3 py-0.5 text-sm font-bold text-accent-fg">Nowe</span></p>}
              <p className="text-lg">{f.tekst}</p>
              <p className="mt-auto text-sm text-muted">{f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline">{f.zrodlo}</a> : f.zrodlo}{f.strona ? `, s. ${f.strona}` : ""}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mat-h" className="space-y-4">
        <h2 id="mat-h" className="text-3xl font-extrabold">Materiały do poczytania</h2>
        <ul className="grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MATERIALY.map((m) => (
            <li key={m.tytul} className="flex">
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="karta flex w-full flex-col gap-2 p-5 text-fg no-underline transition-transform hover:-translate-y-0.5">
                <span className="font-display text-xl font-bold">{m.tytul}</span>
                <span className="text-muted">{m.opis}</span>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 font-bold text-primary">Otwórz stronę ROPS (nowa karta)<ExternalLink aria-hidden className="size-4" /></span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Strona>
  );
}
