import type { Metadata } from "next";
import Link from "next/link";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { POWIATY_IOSS } from "@/lib/powiaty";
import { nazwaPowiatu, slugPowiatu } from "@/lib/profil-powiatu";

export const metadata: Metadata = { title: "Profile powiatów" };

export default function Page() {
  return (
    <Strona>
      <NaglowekStrony nadtytul="Skarbnica wiedzy" tytul="Profile powiatów" opis="Wybierz powiat, żeby zobaczyć jego największe wyzwania społeczne, pasujące innowacje i plan działania. To skrót do diagnozy dla gmin, OPS i CUS." />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {POWIATY_IOSS.map((p) => (
          <li key={p}><Link href={`/wiedza/powiat/${slugPowiatu(p)}`} className="karta flex min-h-14 items-center p-4 font-display text-xl font-bold text-fg no-underline hover:-translate-y-0.5">{nazwaPowiatu(p)}</Link></li>
        ))}
      </ul>
    </Strona>
  );
}
