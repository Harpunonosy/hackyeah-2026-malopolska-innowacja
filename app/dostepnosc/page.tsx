import type { Metadata } from "next";
import Link from "next/link";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Deklaracja dostępności" };

export default function Dostepnosc() {
  return (
    <Strona>
      <NaglowekStrony nadtytul="Zaufanie i przejrzystość" tytul="Deklaracja dostępności" opis="Splot ma być dostępny dla każdej osoby, niezależnie od wieku, niepełnosprawności i umiejętności cyfrowych. Cel: zgodność z WCAG 2.1 poziom AA. Stan na 4 października 2026 (prototyp)." />
      <div className="max-w-3xl space-y-8 text-lg">
        <section aria-labelledby="co-h" className="space-y-2">
          <h2 id="co-h" className="text-2xl font-bold">Co zrobiliśmy</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Wyraźny krój pisma Atkinson Hyperlegible, domyślnie duży tekst (18 px), trzy rozmiary, wysoki kontrast, tryb prosty.</li>
            <li>Czytanie strony na głos, dyktowanie opisu i rozmowa głosowa z napisami na ekranie.</li>
            <li>Obsługa z klawiatury, widoczny fokus, link „Przejdź do treści”, cele dotykowe co najmniej 48 px.</li>
            <li>Wersja ukraińska ścieżki mieszkańca oraz tekst łatwy do czytania (Akademia, informacja poniżej).</li>
            <li>Brak limitów czasu dla mieszkańców. Układ nie wymaga przewijania w poziomie od szerokości 320 px.</li>
          </ul>
        </section>
        <section aria-labelledby="test-h" className="space-y-2">
          <h2 id="test-h" className="text-2xl font-bold">Jak to sprawdzamy</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Testy automatyczne axe-core (reguły WCAG 2.0 i 2.1 A i AA) na stronach publicznych i panelu: w wersji zwykłej, w wysokim kontraście, z dużym tekstem i na szerokości telefonu.</li>
            <li>Automatyczny test przewijania poziomego przy 320 px.</li>
            <li>Test klawiaturą głównych ścieżek (zgłoszenie, pomysł, odpowiedź w panelu).</li>
          </ul>
          <p>Nie przeprowadziliśmy jeszcze testów z czytnikiem ekranu ani badań z osobami z niepełnosprawnościami. Są zaplanowane przed wdrożeniem. Wyniki szczegółowe: <code>docs/raport-dostepnosci.md</code> w repozytorium.</p>
        </section>
        <section aria-labelledby="og-h" className="space-y-2">
          <h2 id="og-h" className="text-2xl font-bold">Znane ograniczenia</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Filmy ROPS w serwisie YouTube mogą nie mieć napisów ani tłumaczenia na polski język migowy.</li>
            <li>Dyktowanie i czytanie na głos korzystają z przeglądarki (najlepiej Chrome lub Edge). W innych przeglądarkach wpisz tekst.</li>
            <li>Tłumaczenie ukraińskie jest maszynowe, a panel pracowników ROPS jest tylko po polsku.</li>
          </ul>
        </section>
        <section aria-labelledby="kt-h" className="space-y-2">
          <h2 id="kt-h" className="text-2xl font-bold">Kontakt</h2>
          <p>Napotkałeś lub napotkałaś barierę? Napisz w <Link href="/rynek" className="font-semibold">zakładce pytań do ROPS</Link>. Odpowiemy w ciągu 2 dni roboczych.</p>
        </section>
      </div>
    </Strona>
  );
}
