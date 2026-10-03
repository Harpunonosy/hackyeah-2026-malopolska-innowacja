import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import akademia from "@/data/akademia.json";

export const metadata: Metadata = { title: "Akademia Splotu" };

export default function Akademia() {
  return (
    <Strona>
      <NaglowekStrony nadtytul="Skarbnica wiedzy" tytul="Akademia Splotu" opis="Krótkie lekcje o innowacjach społecznych. Każda ma wersję łatwą do czytania, odsłuch i trzy pytania na koniec." />
      <ul className="grid auto-rows-fr gap-5 md:grid-cols-2">
        {akademia.lekcje.map((l, i) => (
          <li key={l.slug} className="flex">
            <Link href={`/wiedza/akademia/${l.slug}`} className="karta flex w-full flex-col gap-3 p-6 text-fg no-underline transition-transform hover:-translate-y-0.5">
              <span className="text-sm font-bold uppercase tracking-wider text-primary">Lekcja {i + 1}</span>
              <span className="font-display text-2xl font-bold">{l.tytul}</span>
              <span className="mt-auto flex items-center justify-between text-muted"><span className="inline-flex items-center gap-2"><Clock aria-hidden className="size-5" />{l.minuty} min</span><ArrowRight aria-hidden className="size-6 text-primary" /></span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="max-w-3xl text-sm text-muted">{akademia.uwaga}</p>
    </Strona>
  );
}
