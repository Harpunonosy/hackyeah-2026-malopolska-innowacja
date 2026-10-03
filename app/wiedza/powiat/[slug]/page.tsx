import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import { Drukuj } from "@/components/krawiec/drukuj";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { ZglosWyzwanie } from "@/components/powiat/zglos-wyzwanie";
import { Strona } from "@/components/strona";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { db } from "@/lib/db";
import { nazwaPowiatu, powiatZeSluga, profilPowiatu } from "@/lib/profil-powiatu";

export const metadata: Metadata = { title: "Profil powiatu" };
export const dynamic = "force-dynamic";

export default async function Page(props: PageProps<"/wiedza/powiat/[slug]">) {
  const { slug } = await props.params;
  const powiat = powiatZeSluga(slug);
  if (!powiat) notFound();
  const p = await profilPowiatu(powiat);
  const c = db();
  const [nabory, eksperci, ogloszenia] = await Promise.all([
    c.query("select nazwa, otwarty_do from nabory where aktywny"),
    c.query("select nazwa, dyzury, obszary from eksperci order by nazwa"),
    c.query("select id, tytul, opis from partnerstwa where powiat=$1 order by created_at desc limit 5", [powiat]),
  ]);
  return (
    <Strona>
      <p className="nie-drukuj"><Link href="/wiedza/powiat">← Wszystkie powiaty</Link></p>
      <NaglowekStrony nadtytul="Profil powiatu" tytul={`Powiat ${nazwaPowiatu(powiat)}`} opis={p.ludnosc ? `Mieszkańców: ${Math.round(p.ludnosc).toLocaleString("pl-PL")}. Dane z Obserwatora Statystyk Społecznych (IOSS) na tle 22 powiatów Małopolski.` : "Dane z Obserwatora Statystyk Społecznych (IOSS)."} />
      <div className="nie-drukuj flex flex-wrap gap-3">
        <Drukuj etykieta="Pobierz raport do diagnozy (druk lub PDF)" />
        <Button asChild wariant="obrys"><Link href={`/wdrozenie?powiat=${encodeURIComponent(powiat)}`}>Przygotuj plan wdrożenia dla tego powiatu</Link></Button>
      </div>

      <section aria-labelledby="wyz-h" className="space-y-4">
        <h2 id="wyz-h" className="text-3xl font-extrabold">Największe wyzwania</h2>
        <ol className="space-y-3">
          {p.wyzwania.map((w, i) => (
            <li key={w.nazwa + w.obszar} className="karta flex gap-4 p-5 break-inside-avoid">
              <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-fg">{i + 1}</span>
              <div className="space-y-1">
                <p><Chip>{w.obszarNazwa}</Chip></p>
                <p className="text-lg">{w.opis}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="inn-h" className="space-y-4">
        <h2 id="inn-h" className="text-3xl font-extrabold">Rozwiązania, które możecie wdrożyć</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {p.innowacje.map((o) => (
            <div key={o.obszar} className="karta space-y-3 p-5 break-inside-avoid">
              <h3 className="font-display text-xl font-bold">{o.obszarNazwa}</h3>
              <ul className="space-y-2">
                {o.lista.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/wiedza/biblioteka/${i.id}`} className="font-semibold">{i.nazwa}</Link>
                    <Link href={`/wdrozenie?innowacja=${i.id}&powiat=${encodeURIComponent(powiat)}`} className="nie-drukuj text-sm font-semibold">Plan wdrożenia</Link>
                  </li>
                ))}
                {o.lista.length === 0 && <li className="text-muted">Brak wybranych rozwiązań w tym obszarze.</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="inf-h" className="grid gap-5 md:grid-cols-3 break-inside-avoid">
        <div className="karta space-y-2 p-5"><h2 id="inf-h" className="text-xl font-bold">Otwarte nabory</h2>{nabory.rows.length === 0 ? <p className="text-muted">Obecnie brak otwartych naborów.</p> : <ul className="list-disc pl-5">{nabory.rows.map((n) => <li key={n.nazwa}>{n.nazwa}</li>)}</ul>}</div>
        <div className="karta space-y-2 p-5"><h2 className="text-xl font-bold">Eksperci</h2><ul className="list-disc pl-5">{eksperci.rows.map((e) => <li key={e.nazwa}>{e.nazwa}</li>)}</ul><Link href="/rynek" className="nie-drukuj font-semibold">Zapytaj eksperta</Link></div>
        <div className="karta space-y-2 p-5"><h2 className="text-xl font-bold">Ogłoszenia partnerów w powiecie</h2>{ogloszenia.rows.length === 0 ? <p className="text-muted">Brak ogłoszeń.</p> : <ul className="list-disc pl-5">{ogloszenia.rows.map((o) => <li key={o.id}>{o.tytul}</li>)}</ul>}</div>
      </section>

      <section aria-labelledby="zgl-h" className="nie-drukuj max-w-3xl space-y-3">
        <h2 id="zgl-h" className="text-3xl font-extrabold">Zgłoś wyzwanie swojej gminy</h2>
        <p className="text-lg text-muted">Diagnozujecie problem w gminie? Zgłoście go. Trafi do Radaru potrzeb ROPS jako zgłoszenie instytucji i pomoże planować nabory.</p>
        <ZglosWyzwanie powiat={powiat} />
      </section>
      <p className="print:block hidden text-sm"><Printer aria-hidden className="mr-1 inline size-4" />Raport wygenerowany w Splocie na podstawie danych IOSS (ROPS Kraków). Dane statystyczne mają charakter orientacyjny.</p>
    </Strona>
  );
}
