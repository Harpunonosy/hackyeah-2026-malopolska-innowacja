import type { Metadata } from "next";
import Link from "next/link";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Zaufanie: karta systemu AI, prywatność, bezpieczeństwo" };

function Sekcja({ id, tytul, children }: { id: string; tytul: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="karta max-w-4xl space-y-3 p-6 sm:p-8">
      <h2 id={id} className="text-3xl font-extrabold">{tytul}</h2>
      {children}
    </section>
  );
}

export default function Zaufanie() {
  return (
    <Strona>
      <NaglowekStrony nadtytul="Zaufanie i przejrzystość" tytul="Jak działa AI w Splocie" opis="Co robi asystent AI, czego nie robi, dokąd trafiają dane i kto sprawuje nadzór. Stan na 4 października 2026, prototyp na HackYeah." />

      <Sekcja id="ai-h" tytul="Karta systemu AI">
        <h3 className="text-xl font-bold">Do czego używamy AI</h3>
        <ul className="list-disc space-y-1 pl-6 text-lg">
          <li><strong>Swatka:</strong> dopasowanie opisu problemu do innowacji z Biblioteki ROPS (wybiera tylko z katalogu i uzasadnia wybór).</li>
          <li><strong>Skrzynka ROPS:</strong> klasyfikacja zgłoszeń, usuwanie imion z treści, szkic odpowiedzi do zatwierdzenia przez pracownika.</li>
          <li><strong>Pracownia:</strong> fiszka pomysłu, wstępna ocena według karty IWS 2.0, kanwa, asystent, scenorys, projekt wniosku do naboru.</li>
          <li><strong>Krawiec:</strong> szkic planu wdrożenia dla instytucji.</li>
          <li><strong>Centrala:</strong> odczyt regulaminu naboru, import karty innowacji z tekstu, szkic tematu naboru z Radaru, podsumowanie opinii, dopasowanie nowych innowacji do oczekujących zgłoszeń.</li>
        </ul>
        <h3 className="text-xl font-bold">Czego AI nie robi</h3>
        <ul className="list-disc space-y-1 pl-6 text-lg">
          <li>Nie podejmuje decyzji o grantach, naborach ani sprawach mieszkańców. Decyduje człowiek.</li>
          <li>Nie wysyła nic w imieniu użytkownika bez jego zgody.</li>
          <li>Nie wykrywa kryzysu samodzielnie: numery pomocy pokazują reguły bez AI, więc działają także wtedy, gdy model nie odpowiada.</li>
        </ul>
        <h3 className="text-xl font-bold">Dokąd trafiają dane</h3>
        <p className="text-lg">Przed wysłaniem do modelu opis przechodzi maskowanie: ukrywamy PESEL, telefony, adresy e-mail, adresy zamieszkania, numery kont i dokumentów, kody pocztowe oraz imiona i nazwiska ze słownika popularnych imion. Maskowanie nie jest doskonałe: rzadkie imiona mogą zostać niezamaskowane, dlatego prosimy, by ich nie wpisywać. Model DeepSeek działa przez API. Warstwa <code>lib/ai.ts</code> pozwala podmienić go na model w polskiej infrastrukturze (PLLuM, Bielik). W logach serwera nie zapisujemy treści zgłoszeń.</p>
        <h3 className="text-xl font-bold">Nadzór człowieka i oznaczenia</h3>
        <p className="text-lg">Treści przygotowane przez AI są oznaczone (zgodnie z art. 50 AI Act). Odpowiedzi dla mieszkańców zatwierdza pracownik ROPS. Wstępna ocena pomysłów to pomoc, a nie decyzja komisji.</p>
        <h3 className="text-xl font-bold">Jak mierzymy jakość</h3>
        <p className="text-lg">Zestaw własny: 30 zapytań w stylu mieszkańców i słów kluczowych, oparty na personach z Mapy Wyzwań. Wynik Swatki z AI (3.10.2026): trafienie w pierwszych 3 propozycjach 29 z 29 zapytań, które mają odpowiedź w Bibliotece (100%). Wyszukiwanie awaryjne bez AI: 79,3%. Jedno zapytanie bez odpowiedzi w Bibliotece (q30) nadal dostaje propozycję zamiast komunikatu „brak”. To mały zestaw własny, więc wynik jest orientacyjny.</p>
        <h3 className="text-xl font-bold">Ograniczenia</h3>
        <ul className="list-disc space-y-1 pl-6 text-lg">
          <li>AI może się mylić. W razie wątpliwości zapytaj pracownika ROPS.</li>
          <li>Tłumaczenia na język ukraiński są maszynowe i wymagają weryfikacji przed wdrożeniem.</li>
          <li>Odpowiedzi mogą się różnić przy tym samym opisie.</li>
        </ul>
      </Sekcja>

      <Sekcja id="priv-h" tytul="Prywatność">
        <ul className="list-disc space-y-1 pl-6 text-lg">
          <li>Zgłoszenie możesz wysłać bez podawania imienia i nazwiska. E-mail jest nieobowiązkowy i służy tylko do powiadomień.</li>
          <li>Zgłoszenie wysyłasz dopiero po wyrażeniu zgody. Dane osobowe są maskowane przed zapisem.</li>
          <li>Pokazujemy tylko zanonimizowane podobne sprawy i tylko wtedy, gdy takich spraw jest co najmniej 5.</li>
          <li>Nie używamy analityki ani reklam. Pliki cookie służą tylko do zapamiętania ustawień dostępności i języka oraz do logowania pracowników.</li>
          <li>Dane w prototypie są demonstracyjne. Przed wdrożeniem potrzebne są: ocena skutków dla ochrony danych (DPIA), umowa powierzenia przetwarzania, polityka przechowywania danych.</li>
        </ul>
      </Sekcja>

      <Sekcja id="bezp-h" tytul="Bezpieczeństwo">
        <ul className="list-disc space-y-1 pl-6 text-lg">
          <li>Baza danych w Unii Europejskiej, z włączoną blokadą dostępu na poziomie wierszy. Aplikacja łączy się tylko z serwera.</li>
          <li>Panel pracowników chroniony podpisanym ciasteczkiem sesji. Produkcyjnie: login.gov.pl albo Keycloak ROPS, role i dziennik zmian.</li>
          <li>Limity zapytań i budżet dzienny chronią przed nadużyciami.</li>
          <li>Import treści z internetu tylko z domen ROPS (ochrona przed SSRF).</li>
          <li>Nagłówki bezpieczeństwa, brak indeksowania prototypu przez wyszukiwarki.</li>
        </ul>
      </Sekcja>

      <p className="flex flex-wrap gap-4 text-lg"><Link href="/dostepnosc" className="font-semibold">Deklaracja dostępności</Link><Link href="/latwy" className="font-semibold">Informacja w tekście łatwym do czytania</Link><Link href="/ocena" className="font-semibold">Jak ocenić Splot</Link></p>
    </Strona>
  );
}
