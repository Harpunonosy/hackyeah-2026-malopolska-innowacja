# Zgodność Splotu z wyzwaniem HubMI

Cel: uzupełnić istniejące siedem modułów według hub.pdf, szczególnie rzeczywiste wykorzystanie sześciu źródeł ROPS, aktualizację wiedzy, obsługę błędów i dostępność. Wykonanie samodzielne, w izolowanym worktree; bez zmian w głównym audycie, pushowania i wdrażania.

Architektura: obecny Next.js/PostgreSQL pozostaje. Publiczna wiedza korzysta z wersjonowanych plików źródłowych i uzupełnień administratora. Pobieranie następuje poza obsługą żądań mieszkańca. Dokumenty mają URL, datę pobrania, zakres i dowody pochodzenia. AI odpowiada na podstawie konkretnych fragmentów. Brak pełnego audytu z użytkownikami nie jest deklarowany jako WCAG AA.

## Zadania

- [x] 1. Źródła: bezpieczne pobieranie, atomowy zapis, kontrola kompletności; aktualizacja Biblioteki/IOSS; katalog raportów i publikacji; weryfikacja Mapy i Kanwy. Testy błędów HTTP/pustych wyników oraz integralności lokalnych danych.
- [x] 2. Wiedza: publiczna wyszukiwarka raportów/publikacji, daty i źródła; powiązanie z Akademią i Kondycją; cytowania Mapy i wyszukiwanie fragmentów w odpowiedziach. Test źródeł odpowiedzi i wyszukiwania.
- [x] 3. Katalog: wspólny aktualny indeks dla Swatki i Pracowni; skuteczna edycja/wycofywanie kart. Regresje dla ukrytej/dodanej/zmienionej innowacji.
- [x] 4. Procesy: walidacja fiszki, schematu i terminu naboru, ręczny wniosek, wyniki testowania, błędy sieci i zapis kanwy. Testy odrzucenia niekompletnych i przeterminowanych wniosków.
- [x] 5. Dostępność i bezpieczeństwo: niezawodny głos, widoczna pomoc, brak publicznych trendów zgłoszeń, brak ujawniania skonfigurowanego hasła eksperta, bezpieczny CSV; kontrola języka i fokusu.
- [x] 6. Weryfikacja: testy jednostkowe, lint, build, przeglądarka 320/1280 px, axe, ścieżki formularzy i dowody źródeł. Macierz wymagań PDF, opis ograniczeń i gotowości do przekazania.

## Reguły

- Zachować istniejący układ i polskie/ukraińskie teksty; nie przywracać usuniętego panelu pierwszej wizyty.
- Nie używać prawdziwych danych osobowych z materiałów ROPS; lokalne dane społeczne nie są danymi fikcyjnymi.
- Nie zapisywać do współdzielonej bazy. Testy zapisujące tylko w osobnej bazie tego worktree.
- Dodatkowe wysyłki e-mail/SMS wymagają rzeczywiście skonfigurowanego operatora; nie przedstawiać symulacji jako doręczenia.
- Świeże pomiary jakości AI są oddzielone od historycznych; brak pomiaru nie jest dowodem trafności.

## Dziennik

- Rozpoznanie: sześć źródeł, 7 modułów, kryteria 40/20/20/10/10; główny wątek prowadzi audyt, dlatego osobny worktree codex/hub-compliance.
- Decyzja: wcześniejsza preferencja repo wyłącza slajdy/film; koncentrujemy prace na aplikacji, materiałach dowodowych i macierzy. Formalne materiały do oddania będą jawnie oznaczone jako odrębny obowiązek.

- Wykonanie: źródła, formularze, transakcje, dostęp administracyjny, kanwa i testy zakończone w osobnym worktree. Szczegółowe ograniczenia i dowody: `docs/HUB_ZGODNOSC.md`, `docs/HUB_TESTY.md`. Pełna produkcyjność i wynik jury nie są deklarowane.
