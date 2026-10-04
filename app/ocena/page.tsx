import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PrzykladLink } from "@/components/ocena/przyklad-link";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { Button } from "@/components/ui/button";


export const metadata: Metadata = { title: "Jak ocenić Splot w 5 minut" };

const MODULY = [
  ["I. Matchmaking (obowiązkowy)", "/problem", "Opis problemu, nici potrzeb, podobne sprawy, gotowe rozwiązania, zgłoszenie do ROPS"],
  ["II. Zasobnik wiedzy", "/wiedza/biblioteka", "115 innowacji z filmami, Akademia, Kondycja Małopolski, profile powiatów"],
  ["III. Kreator pomysłów", "/pomysl", "Fiszka, kanwa INNO AGH, asystent i scenorys, wniosek dopasowany do naboru"],
  ["IV. Tester innowacji", "/testy", "Zapis na test, ocena rozwiązań, ogłoszenia testów"],
  ["V. Platforma komunikacji", "/rynek", "Pytania do ekspertów, tablica partnerów, Sieć liderów innowacji (kontakt przez Hub), galeria pomysłów, panel eksperta"],
  ["VI. Panel administratora", "/centrala", "Skrzynka spraw, Radar, nabory i ocena wniosków, treści, powiadomienia, integracje (hasło w opisie zgłoszenia)"],
  ["VII. Middleman Innowacji", "/wdrozenie", "Krawiec: plan wdrożenia w dwóch wariantach, kompas deinstytucjonalizacji, kwalifikowalność, pakiet startowy"],
] as const;

const GOTOWOSC = [["k1", "/integracje"], ["k2", "/centrala/integracje"], ["k3", "/centrala/nabory"], ["k4", "/asystowane"], ["k5", "/wdrozenie"], ["k7", "/siec"], ["k8", "/pomysl"], ["k6", null]] as const;

export default async function Ocena() {
  const t = await getTranslations("ocena");
  return (
    <Strona>
      <NaglowekStrony nadtytul="Dla Jury" tytul="Jak ocenić Splot w 5 minut" opis="Cztery testy z opisu wyzwania, każdy z gotowymi krokami. Dane w demo są syntetyczne. E-maile i SMS-y są w prototypie symulowane." />

      <ol className="grid gap-5 lg:grid-cols-2">
        <li className="karta space-y-3 p-6">
          <h2 className="text-2xl font-bold"><span className="text-primary">Test 1.</span> Intuicyjność i dostępność</h2>
          <p>Zgłoś problem bez żadnego przygotowania, najlepiej głosem. Zmień rozmiar tekstu i kontrast.</p>
          <ol className="list-decimal space-y-1 pl-6">
            <li>Na stronie głównej wybierz kafelek „Jak wolisz korzystać?”.</li>
            <li>Wypróbuj rozmowę głosową albo wpisz opis.</li>
            <li>Włącz wysoki kontrast i tryb prosty w pasku na górze.</li>
          </ol>
          <p className="flex flex-wrap gap-2"><Button asChild><Link href="/">Strona główna</Link></Button><Button asChild wariant="obrys"><Link href="/rozmowa">Rozmowa głosowa</Link></Button></p>
        </li>
        <li className="karta space-y-3 p-6">
          <h2 className="text-2xl font-bold"><span className="text-primary">Test 2.</span> Szybkość komunikacji</h2>
          <p>Nowy pomysł, powiadomienie dla ROPS i odpowiedź do autora.</p>
          <ol className="list-decimal space-y-1 pl-6">
            <li>W Pracowni opisz pomysł i wyślij go. Zapisz numer sprawy.</li>
            <li>W drugiej karcie wejdź do Centrali: pojawi się plakietka i dźwięk, a szkic odpowiedzi przygotuje AI.</li>
            <li>Odpowiedz. W „Moje sprawy” zobaczysz odpowiedź i czas pierwszej odpowiedzi.</li>
          </ol>
          <p className="flex flex-wrap gap-2"><Button asChild><Link href="/pomysl">Pracownia</Link></Button><Button asChild wariant="obrys"><Link href="/centrala/zgloszenia">Centrala</Link></Button><Button asChild wariant="obrys"><Link href="/moje">Moje sprawy</Link></Button></p>
        </li>
        <li className="karta space-y-3 p-6">
          <h2 className="text-2xl font-bold"><span className="text-primary">Test 3.</span> Trafność dopasowania</h2>
          <p>Wpisz słowa kluczowe, jakie sami wybierzecie. Przykłady jednym kliknięciem:</p>
          <p className="flex flex-wrap gap-2">
            <PrzykladLink tekst="głusi alarm pożarowy" etykieta="głusi alarm pożarowy" />
            <PrzykladLink tekst="autyzm wizyta u lekarza" etykieta="autyzm wizyta u lekarza" />
            <PrzykladLink tekst="Od kiedy zmarł mąż, rzadko wychodzę z domu i gubię się w lekach." etykieta="samotność i leki (dwie nici)" />
            <PrzykladLink tekst="Mój syn zamknął się w sobie i całe dni siedzi przy komputerze." etykieta="dziecko w kryzysie" />
          </p>
        </li>
        <li className="karta space-y-3 p-6">
          <h2 className="text-2xl font-bold"><span className="text-primary">Test 4.</span> Pomysłowość: zamknięta pętla</h2>
          <p>Potrzeba bez rozwiązania staje się tematem naboru, a nowa innowacja sama szuka ludzi, którzy na nią czekali.</p>
          <ol className="list-decimal space-y-1 pl-6">
            <li>W Centrali otwórz Radar i utwórz temat naboru z białej plamy.</li>
            <li>W „Treściach” dodaj innowację i kliknij „Kogo ta innowacja może ucieszyć?”.</li>
            <li>Powiadom autorów. W ich sprawie pojawi się „Jest nowe rozwiązanie”.</li>
          </ol>
          <p className="flex flex-wrap gap-2"><Button asChild><Link href="/centrala/radar">Radar</Link></Button><Button asChild wariant="obrys"><Link href="/centrala/tresci">Treści</Link></Button><Button asChild wariant="obrys"><Link href="/galeria">Galeria</Link></Button></p>
        </li>
      </ol>

      <section aria-labelledby="mod-h" className="space-y-4">
        <h2 id="mod-h" className="text-3xl font-extrabold">Siedem modułów z opisu wyzwania</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {MODULY.map(([n, href, opis]) => (
            <li key={n}><Link href={href} className="karta flex items-center justify-between gap-4 p-4 text-fg no-underline hover:-translate-y-0.5"><span><span className="block font-display text-xl font-bold">{n}</span><span className="block text-muted">{opis}</span></span><ArrowRight aria-hidden className="size-6 shrink-0 text-primary" /></Link></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="wdr-h" className="space-y-4">
        <h2 id="wdr-h" className="text-3xl font-extrabold">{t("wdrTytul")}</h2>
        <p className="max-w-3xl text-lg text-muted">{t("wdrOpis")}</p>
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {GOTOWOSC.map(([k, href]) => (
            <li key={k} className="karta flex flex-col gap-2 p-5">
              <h3 className="text-xl font-bold">{t(`${k}t`)}</h3>
              <p className="flex-1">{t(`${k}o`)}</p>
              {href && <Link href={href} className="font-semibold underline">{t("otworz")}: {href}</Link>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="konta-h" className="space-y-4">
        <h2 id="konta-h" className="text-3xl font-extrabold">Konta demo</h2>
        <div className="overflow-x-auto">
          <table className="karta w-full min-w-[34rem] text-left">
            <caption className="sr-only">Konta demonstracyjne</caption>
            <thead><tr><th scope="col" className="p-3">Rola</th><th scope="col" className="p-3">Gdzie</th><th scope="col" className="p-3">Logowanie</th></tr></thead>
            <tbody>
              <tr className="border-t border-line-soft"><th scope="row" className="p-3">Mieszkaniec, innowator, gmina</th><td className="p-3"><Link href="/">cała strona publiczna</Link></td><td className="p-3">bez logowania</td></tr>
              <tr className="border-t border-line-soft"><th scope="row" className="p-3">Ekspert</th><td className="p-3"><Link href="/ekspert">/ekspert</Link></td><td className="p-3">wybór profilu i hasło przekazane przez koordynatora</td></tr>
              <tr className="border-t border-line-soft"><th scope="row" className="p-3">Pracownik ROPS</th><td className="p-3"><Link href="/centrala">/centrala</Link></td><td className="p-3">hasło w opisie zgłoszenia na HackTribe</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="uczc-h" className="max-w-3xl space-y-2">
        <h2 id="uczc-h" className="text-2xl font-bold">Co jest symulowane</h2>
        <ul className="list-disc space-y-1 pl-6 text-lg">
          <li>E-maile i SMS-y: widać je w skrzynce nadawczej Centrali (zakładka Powiadomienia), ale nie są wysyłane.</li>
          <li>Zgłoszenia mieszkańców w statystykach to dane syntetyczne oznaczone jako demo.</li>
          <li>Logowanie pracowników ROPS to hasło demonstracyjne. Produkcyjnie: login.gov.pl albo Keycloak.</li>
        </ul>
        <p><Link href="/zaufanie" className="font-semibold">Karta systemu AI, prywatność i bezpieczeństwo</Link></p>
      </section>
    </Strona>
  );
}
