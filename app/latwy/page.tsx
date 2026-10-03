import type { Metadata } from "next";
import Link from "next/link";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Informacja w tekście łatwym do czytania" };

export default function Latwy() {
  return (
    <Strona>
      <NaglowekStrony nadtytul="Tekst łatwy do czytania" tytul="Czym jest Splot" />
      <div className="max-w-2xl space-y-5 text-2xl leading-relaxed">
        <p>Splot to strona internetowa. Pomaga ludziom w Małopolsce.</p>
        <p>Możesz napisać albo powiedzieć, co się dzieje u ciebie lub u kogoś bliskiego.</p>
        <p>Komputer szuka pomocy wśród rozwiązań, które już działają. Pokazuje, co może ci pomóc.</p>
        <p>Możesz też wysłać zgłoszenie do ROPS. ROPS to urząd, który pomaga w sprawach społecznych.</p>
        <p>Dostaniesz numer. Wpisz go w zakładce „Moje sprawy”. Zobaczysz odpowiedź.</p>
        <p>Nie podawaj swojego imienia i nazwiska. Nie podawaj adresu i numeru telefonu.</p>
        <p>Komputer może się mylić. Dlatego odpowiedzi sprawdza człowiek.</p>
        <p>Jeśli ktoś jest w niebezpieczeństwie, zadzwoń od razu na numer 112.</p>
        <p>Jeśli nie chcesz pisać, kliknij „Rozmowa głosowa”. Wtedy możesz mówić.</p>
        <p className="flex flex-wrap gap-3 pt-2"><Link href="/problem" className="inline-flex min-h-14 items-center rounded-xl bg-primary px-6 font-bold text-primary-fg no-underline">Opisz problem</Link><Link href="/rozmowa" className="inline-flex min-h-14 items-center rounded-xl border-2 border-fg px-6 font-bold no-underline">Rozmowa głosowa</Link></p>
      </div>
    </Strona>
  );
}
