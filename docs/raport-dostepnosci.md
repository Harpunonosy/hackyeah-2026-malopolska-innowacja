# Raport dostępności Splotu

Uzupełnienie po dodaniu edytora Akademii i importu IOSS: na obu nowych ekranach sprawdzono axe-core (0 naruszeń) oraz szerokość 320 px (bez przewijania poziomego). Sprawdzono też publiczną lekcję i wybór odpowiedzi quizu klawiaturą. Testy wykonano na osobnej lokalnej bazie; nie powtarzano całego historycznego zestawu 33 stron po tej zmianie. Poniższe wyniki globalne dotyczą wcześniejszego przebiegu.

Stan na 3.10.2026, wieczór. Cel: WCAG 2.1 poziom AA. Raport opisuje tylko to, co faktycznie sprawdziliśmy. Testy automatyczne nie wykrywają wszystkich barier, więc zgodności z WCAG nie deklarujemy jako pełnej.

## 1. Podsumowanie

| Sprawdzenie | Zakres | Wynik |
|---|---|---|
| axe-core 4.13 (WCAG 2.0 i 2.1, A i AA) | 33 strony × 3 tryby = 99 przebiegów | **0 naruszeń** |
| Reflow 320 px (WCAG 1.4.10) | 33 strony | **brak przewijania poziomego** |
| Klawiatura (WCAG 2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.7) | 11 stron ścieżki mieszkańca i instytucji, każdy element osiągalny klawiszem Tab | **każdy element ma widoczny fokus i nazwę**, pierwszy jest link „Przejdź do treści”, brak pułapek fokusu |
| Czytnik ekranu (NVDA, VoiceOver) | — | **nie przeprowadzono** |
| Badanie z użytkownikami | — | **nie przeprowadzono** |

## 2. Testy automatyczne axe-core

Skrypt: `scripts/a11y-i-zrzuty.ts` (Playwright + `@axe-core/playwright`, tagi `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`). Uruchomienie: `npx tsx --env-file=.env.local scripts/a11y-i-zrzuty.ts http://localhost:3000 --tryby`.

Tryby:
1. zwykły, szerokość 1280 px;
2. tryb prosty + tekst „bardzo duży” + wysoki kontrast;
3. szerokość 320 px (telefon).

Strony (33): start, problem (Swatka), tekst łatwy do czytania, rozmowa głosowa, moje sprawy, Pracownia, Próbownia, Rynek, Krawiec, Galeria, Biblioteka, karta innowacji, Kondycja Małopolski, lista powiatów, profil powiatu, Akademia i lekcja, ścieżka dla Jury, zaufanie (karta AI), deklaracja dostępności, tryb asystowany, strona dla integratorów, widżet „Znajdź pomoc”, panel eksperta, oraz panel ROPS po zalogowaniu: logowanie, skrzynka, karta zgłoszenia, Radar, pomysły, nabory, treści, powiadomienia, integracje.

Naruszenie znalezione i poprawione w tej rundzie: linki w tekście odróżnialne tylko kolorem (`link-in-text-block`, WCAG 1.4.1) na stronie powiadomień. Poprawka: podkreślenie linków w akapitach i listach (globalnie w `app/globals.css`).

## 3. Reflow 320 px

Skrypt: `scripts/szerokosc-320.ts`. Mierzy `scrollWidth` strony przy szerokości 320 px. Wynik: wszystkie 33 strony mieszczą się w szerokości ekranu.

## 4. Klawiatura

Skrypt: `scripts/klawiatura.ts` na wersji produkcyjnej (`next start`). Dla każdej strony naciska Tab do powrotu na początek albo do 120 elementów i sprawdza:
- czy element z fokusem ma widoczny wskaźnik (obrys co najmniej 2 px albo cień);
- czy ma dostępną nazwę (etykieta, `aria-label`, tekst);
- czy pierwszym elementem jest link „Przejdź do treści”.

| Strona | Elementów w kolejności Tab | Wynik |
|---|---|---|
| `/` | 31 | OK |
| `/problem` | 30 | OK |
| `/pomysl` | 22 | OK |
| `/moje` | 21 | OK |
| `/wiedza/biblioteka` | 61 | OK |
| `/rozmowa` | 21 | OK |
| `/asystowane` | 24 | OK |
| `/wdrozenie` | 30 | OK |
| `/testy` | 14 | OK |
| `/rynek` | 17 | OK |
| `/latwy` | 21 | OK |

Ograniczenie: skrypt nie ocenia, czy kolejność jest logiczna, ani czy komunikaty po akcji są zrozumiałe. To wymaga testu ręcznego.

## 5. Rozwiązania projektowe (do weryfikacji ręcznej)

- Krój Atkinson Hyperlegible Next, tekst bazowy 18 px, trzy rozmiary tekstu, wysoki kontrast, tryb prosty; ustawienia w ciasteczku, bez migotania przy wejściu.
- Cele dotykowe co najmniej 48 px, także w pasku dostępności (przyciski A/A+/A++ i PL/UA powiększone 3.10.2026).
- Brak list rozwijanych: wybór jednej opcji to duże przyciski radio (Rynek, Kondycja Małopolski, import innowacji, Radar).
- Długie operacje AI (Krawiec ok. 75 s, Pracownia ok. 40 s) pokazują kroki i czas w `role="status"`; czytnik słyszy zmianę kroku, a nie każdą sekundę.
- Treści AI mają oznaczenie i atrybut `lang` (wersja ukraińska).
- „Wyjaśnij prościej” na karcie innowacji (tekst łatwy do czytania, AI) i tłumaczenie karty na ukraiński.
- Tryb asystowany dla osób bez internetu: zgłoszenie przez pracownika OPS i papierowa karta z kodem QR.
- Brak limitów czasu dla mieszkańców; formularze zachowują wpisany tekst przy błędzie.
- Nagłówki stron i sekcji w kolejności, regiony (`main`, `nav`, `header`, `footer`), komunikaty błędów w `role="alert"`.

## 6. Czego nie sprawdziliśmy (plan przed wdrożeniem)

1. Test z czytnikiem ekranu: NVDA + Firefox i VoiceOver + Safari (iOS) na trzech ścieżkach: zgłoszenie problemu, pomysł, odpowiedź w panelu.
2. Powiększenie 200% i 400% w przeglądarce (zoom) poza testem 320 px.
3. Badanie z użytkownikami: 5 osób (w tym senior 70+, osoba słabowidząca, osoba z niepełnosprawnością intelektualną), 3 zadania, pomiar czasu i liczby błędów.
4. Audyt ekspercki WCAG 2.1 AA przez zewnętrzny podmiot przed uruchomieniem produkcyjnym.
5. Napisy i PJM w filmach ROPS (filmy pochodzą z YouTube ROPS; nie mamy na nie wpływu w prototypie).
