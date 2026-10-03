# Droga do 90+: audyt Splotu i plan domknięcia wyzwania HubMI

Stan na: sobota 3.10.2026, ok. 20:00 · kod: commit `2c2406d` · audyt i pomysły: Claude, na prośbę zespołu.
Źródła: opis wyzwania (`~/Downloads/hub.pdf`), `PLAN.md`, kod repozytorium, testy na działającej aplikacji.

> Ten dokument uzupełnia PLAN.md i nie zmienia decyzji z rozdz. 1a i 1b. Zasady z CLAUDE.md obowiązują dalej: teksty w `messages/`, AI tylko przez `lib/ai.ts`, maskowanie przed AI, brak treści zgłoszeń w logach, licencje MIT/Apache/BSD/ISC, WCAG 2.1 AA.

## Spis treści

0. [Najważniejsze w 10 punktach](#0-najważniejsze-w-10-punktach)
1. [Model punktów: skąd 90+](#1-model-punktów-skąd-90)
2. [Co sprawdziłem i jak](#2-co-sprawdziłem-i-jak)
3. [Mocne strony (nie psuć)](#3-mocne-strony-nie-psuć)
4. [Błędy i pułapki (B-xx)](#4-błędy-i-pułapki-b-xx)
5. [Macierz zgodności z PDF: 100% wymagań (W-xx)](#5-macierz-zgodności-z-pdf-100-wymagań-w-xx)
6. [Nowe pomysły i innowacje (I-xx)](#6-nowe-pomysły-i-innowacje-i-xx)
7. [Dostępność na 9+](#7-dostępność-na-9)
8. [Materiały do oddania (M-xx)](#8-materiały-do-oddania-m-xx)
9. [Koszty policzone z pomiaru](#9-koszty-policzone-z-pomiaru)
10. [Harmonogram do 11:00](#10-harmonogram-do-1100)
11. [Ryzyka (R-xx)](#11-ryzyka-r-xx)
12. [Uczciwość: co mówimy, a czego nie](#12-uczciwość-co-mówimy-a-czego-nie)
13. [Pytania Jury: nowe odpowiedzi](#13-pytania-jury-nowe-odpowiedzi)
14. [Lista kontrolna oddania](#14-lista-kontrolna-oddania)
- [Załącznik A: wyniki testów](#załącznik-a-wyniki-testów)
- [Załącznik B: szkic opisu do HackTribe](#załącznik-b-szkic-opisu-do-hacktribe)


> **Stan realizacji (4.10.2026, noc):** zrobione B-01…B-09, B-11, B-13 oraz większość P1 i TOP 8: W-11/12/14, W-21/22/24, W-31, W-34/35/36/37, W-44, W-50/87/91 (sprawy, magistrala powiadomień, wskaźniki czasu odpowiedzi), W-52/74 (panel eksperta), W-53/94 (rozmowy), W-71/72 (profil powiatu, filtry, porównywarka), I-01, I-02, I-03, I-04, I-05, I-06 (UA, część), I-07, I-08, I-09, I-10, I-11, I-12, I-15, I-18, I-19 (bez rzędów), I-21. **Pozostałe zadania: `NEXT.md`.** Szczegóły decyzji: `PLAN.md` rozdz. 1c.

### Jak korzystać z tego dokumentu

- **Priorytety:** P0 (blokery i pułapki, najpierw), P1 (domknięcie 100% wymagań z PDF), P2 (innowacje na 90+), P3 (jeśli zostanie czas).
- **Identyfikatory:** B = błąd, W = wymaganie z PDF, I = innowacja, M = materiał do oddania, R = ryzyko. Odhaczajcie `[x]` przy zrobionych.
- **Rozmiar zadania (praca agenta):** S do ok. 30 min, M ok. 1 h, L ok. 2–3 h.
- **Definicja „gotowe” (DoD) dla każdego zadania:**
  - działa na wdrożonym linku, nie tylko lokalnie;
  - działa z klawiatury, fokus jest widoczny, a axe nie zgłasza błędów;
  - przy szerokości 320 px strona nie przewija się w poziomie;
  - teksty są w `messages/pl.json`, a dla ścieżki mieszkańca także w `uk.json`;
  - treści AI są oznaczone, a dane osobowe zamaskowane;
  - jest zrzut ekranu w `docs/zrzuty`;
  - kluczowe funkcje mają swój krok w „Ścieżce oceny” (I-21) i w filmie.

---

## 0. Najważniejsze w 10 punktach

1. **Fundament jest mocny.** Splot ma wszystkie 7 modułów w działającym kodzie. Jest zbudowany na danych i procesach ROPS, ma Radar i Krawca, a axe nie znajduje żadnego naruszenia.
2. **Dziś to ok. 75%.** To kod z przyzwoitymi materiałami. Dokończony PLAN.md da ok. 84%. 90+ wymaga oceny 9/10 w każdym kryterium naraz (rozdz. 1).
3. **Największa luka względem testów Jury.** Brakuje ścieżki „nowy *pomysł* → powiadomienie ROPS → odpowiedź do autora”, a Jury pyta o to dosłownie (PDF §6).
4. **Pułapka w demo.** Przykład „Dziecko w kryzysie” ze strony głównej daje napis „Nie mamy jeszcze gotowego rozwiązania”. Tymczasem „Bez presji z depresji” to jedna z 5 innowacji w naborze „Usługa Wrażliwa”.
5. **Pułapka merytoryczna.** Krawiec i scenariusz demo (Senior CUDER) obiecują grant „Usługa Wrażliwa”. Nabór 2025/2026 objął tylko 5 konkretnych innowacji i jest już zamknięty.
6. **Brakuje rzeczy wprost wymaganych w PDF:**
   - wniosek dopasowany do konkretnego naboru;
   - powiadomienia o nowych pomysłach i zmianach w naborach;
   - widok eksperta;
   - prezentacja dobrych praktyk;
   - wizualizacja w asystencie;
   - makiety UX/UI.
7. **Dostępność ma dobrą bazę, ale ma luki:**
   - przy 320 px strony przewijają się w poziomie (WCAG 1.4.10);
   - nie ma ukraińskiego ani tekstu łatwego do czytania;
   - tryb prosty jest płytki;
   - nie było testu z ludźmi.
8. **Prywatność:**
   - opis problemu idzie w adresie URL (`/problem?q=…`), więc trafia do logów hostingu;
   - maskowanie gubi telefon na końcu zdania i zwrot „Nazywam się…”.
9. **Osiem nowych funkcji (TOP 8, rozdz. 6) zamienia zbiór modułów w zamkniętą pętlę:** potrzeba → rozwiązanie albo nabór → pomysł → test → wdrożenie → rozwiązanie samo wraca do ludzi, którzy na nie czekali.
10. **Bez linku do demo, PDF, filmu i makiet nie ma oceny.** Materiały to 10% wprost i silny wpływ na pozostałe 90%.

---

## 1. Model punktów: skąd 90+

Skala 1–10 na kryterium, wynik to średnia ważona (PDF §8, PLAN.md rozdz. 1). To szacunek. Jury jest subiektywne, a wynik zależy też od pokazu na żywo i od innych zespołów.

| Kryterium (waga) | Teraz | Po P0+P1 | Po P2 (TOP 8) | Cel |
|---|---|---|---|---|
| Stopień spełnienia wyzwania (40%) | 7,5 | 8,75 | 9,25 | 9,25 |
| Potencjał wdrożeniowy (20%) | 7,5 | 8,0 | 8,75 | 9,0 |
| Dostępność i intuicyjność (20%) | 7,5 | 8,25 | 9,25 | 9,5 |
| Atrakcyjność, pomysłowość, UI (10%) | 7,0 | 8,0 (z makietami) | 8,75 | 9,25 |
| Materiały i MVP (10%) | 8 (zakładane) | 9 | 9,5 | 9,5 |
| **Razem** | **ok. 75%** | **ok. 85%** | **ok. 91%** | **ok. 93%** |

**Co Jury musi zobaczyć, żeby dać 9+:**

- **Spełnienie (40%):**
  - każdy punkt z PDF klika się w demo i pada w filmie;
  - nie ma ślepych zaułków;
  - Swatka trafia słowami kluczowymi Jury;
  - slajd „mapa zgodności” z ✓ przy każdym punkcie (rozdz. 5).
- **Wdrożenie (20%):**
  - działa na danych i procesach ROPS;
  - koszty są z pomiaru;
  - bezpieczeństwo: role, maskowanie, dziennik zmian, hosting w UE;
  - integracje: API, webhooki, eksport, widżet;
  - plan pilotażu z odpowiedzią „kto to utrzyma i ile godzin tygodniowo”.
- **Dostępność (20%):**
  - WCAG 2.1 AA z dowodami: axe, testy ręczne, czytnik ekranu, powiększenie 400%;
  - tryby dla seniorów, głos, prosty język, ukraiński;
  - test z ludźmi w różnym wieku z liczbami.
- **UI (10%):**
  - makiety w Figmie z systemem projektowym i adnotacjami dostępności;
  - 2–3 momenty „wow”: nici rozplątywania (I-01), pętla (I-02), profil powiatu (I-03).
- **Materiały (10%):**
  - film 3:00 z napisami, który pokazuje 4 testy Jury po kolei;
  - 10 slajdów;
  - link z kontami demo;
  - strona „Jak ocenić w 5 minut” (I-21).

---

## 2. Co sprawdziłem i jak

- **Przeczytałem** PDF wyzwania (8 stron), PLAN.md (1232 wiersze) i kod wszystkich modułów (`app/`, `components/`, `lib/`, `db/`, `scripts/`).
- **axe-core (WCAG 2.0/2.1 A i AA):** 54 przebiegi:
  - 16 stron w trybie zwykłym i na telefonie (320 px);
  - 11 stron publicznych w wysokim kontraście i w dużym tekście z trybem prostym.

  Wynik: **0 naruszeń**.
- **Test szerokości 320 px:** 6 stron przewija się w poziomie (B-06).
- **Swatka:** 2 zapytania na żywo plus analiza wyników pomiaru w `docs/eval/`.
- **Maskowanie danych:** test na 3 zdaniach (B-03).
- **Licencje:** skan `node_modules` (B-18).
- **Koszt:** dopasowanie policzone z `usage` (tokeny) i cennika Anthropic (rozdz. 9).
- **Kolejność fokusu na stronie startowej:** poprawna, fokus widoczny na każdym elemencie.
- **Nie zmieniałem** niczego w kodzie ani w bazie.

---

## 3. Mocne strony (nie psuć)

- **Moduły i trafność.** Wszystkie 7 modułów działa. Moduł obowiązkowy ma zmierzoną trafność: Hit@3 96,6% (28 z 29 zapytań). Ma też tryb awaryjny bez AI (Hit@3 79,3%).
- **Dane i procesy ROPS:**
  - Biblioteka: 115 innowacji, w tym 26 z filmem, 33 z folderem PDF i 27 wybranych do upowszechniania;
  - IOSS: 149 wskaźników z danymi dla 22 powiatów;
  - Mapa Wyzwań: 8 obszarów i 9 person;
  - karta oceny IWS 2.0, kanwa INNO AGH, zasady „Usługi Wrażliwej”.

  Jury rozpozna własne dokumenty.
- **Radar.** Białe plamy, ciche potrzeby (wskaźniki IOSS kontra aktywność zgłoszeń), trendy i przycisk „Utwórz temat naboru”. To najbardziej oryginalny element.
- **Krawiec.** Plan wdrożenia z danymi powiatu, budżet, harmonogram, ryzyka i kwalifikowalność. Do tego druk do PDF.
- **Pętla zgłoszenia działa:**
  1. wysyłka i numer;
  2. skrzynka Centrali odświeżana co 3 s z dźwiękiem;
  3. ocena i szkic odpowiedzi od AI;
  4. odpowiedź ROPS;
  5. status u autora odświeżany co 4 s;
  6. ocena pomocy przez autora.
- **Bezpieczeństwo MVP:**
  - maskowanie przed AI;
  - wykrywanie kryzysu bez AI;
  - limity zapytań;
  - cookie admina podpisane HMAC;
  - RLS bez publicznego dostępu;
  - import tylko z domen ROPS (ochrona przed SSRF);
  - `noindex` i nagłówki bezpieczeństwa;
  - logi bez treści.
- **Dostępność:**
  - krój Atkinson Hyperlegible, tekst 18 px, A+/A++, wysoki kontrast;
  - tryb prosty, czytanie na głos, dyktowanie;
  - link „Przejdź do treści”, widoczny fokus, `aria-live`;
  - ustawienia w cookie, więc strona nie migocze.
- **AI Act art. 50.** Wyniki, szkice i plany mają oznaczenia AI.

---

## 4. Błędy i pułapki (B-xx)

### P0: naprawić najpierw (ok. 1,5 h agenta)

- [x] **B-01 Przykład „Dziecko w kryzysie” daje „brak rozwiązania”.**
  - *Dowód:* zapytanie „Mój syn zamknął się w sobie i całe dni siedzi przy komputerze.” zwraca `brakDopasowania: true`. Najlepszy wynik to „Bez presji z depresji”, 50/100 (sprawdzone na żywo 3.10). To ten sam jedyny błąd z pomiaru (q11). Przykład stoi na stronie głównej (`messages/pl.json` → `start.hero.p3`) i w Swatce (`components/swatka/formularz.tsx:25`).
  - *Poprawka:*
    1. W instrukcji Swatki (`lib/swatka.ts`) dodać zasadę: gdy zgadzają się problem i grupa odbiorców, a forma wsparcia jest pokrewna, trafność wynosi co najmniej 60. Dodać 3 krótkie przykłady kalibracji.
    2. Gdy nie ma wyniku ≥ 55, ale są wyniki ≥ 45, nagłówek ma brzmieć „Te rozwiązania mogą pomóc w części sytuacji”, a nie „Nie mamy jeszcze rozwiązania”.
    3. Pytanie doprecyzowujące ma mieć gotowe odpowiedzi (przyciski) i ponawiać wyszukiwanie.
    4. Dodać do zestawu testowego 20 zapytań w stylu Jury i 5 prawdziwych przypadków bez rozwiązania, a potem ponownie zmierzyć.
  - *DoD:* każdy przykład w UI daje co najmniej 1 wynik ≥ 55; Hit@3 ≥ 95%; q30 jest poprawnie oznaczone jako „brak”.
- [x] **B-02 Opis problemu trafia do adresu URL.**
  - `components/home/pole-opisu.tsx:21` wysyła `/problem?q=<opis>&auto=1`.
  - Adres z opisem trafia do logów hostingu, historii przeglądarki i ewentualnej analityki. To łamie zasadę „w logach nie zapisujemy treści zgłoszeń”.
  - *Poprawka:* przekazać tekst przez `sessionStorage` i usunąć go zaraz po odczycie.
  - *DoD:* w adresie nie ma treści opisu.
- [x] **B-03 Maskowanie danych ma dziury** (`lib/maskowanie.ts`):
  - „tel. 600 100 200.” na końcu zdania nie jest maskowany, bo lookahead `(?![\d.])` w linii 12 blokuje kropkę;
  - „Nazywam się Jan Kowalski” z wielkiej litery nie jest maskowane, bo reguła w linii 24 zna tylko małe litery;
  - imiona i nazwiska w zwykłym zdaniu („mamą, Haliną Wiśniewską”) trafiają do modelu, bo AI czyści je dopiero przed zapisem (`oceńZgloszenie`).
  - *Poprawka:*
    - lookahead `(?!\d)`;
    - warianty z wielką literą;
    - słownik najczęstszych imion plus wzorzec „Imię Nazwisko” (np. lista imion z rejestru PESEL na dane.gov.pl — sprawdzić licencję);
    - 20 testów w skrypcie.
  - *DoD:* testy przechodzą, a Karta AI (I-15) uczciwie opisuje, co maskujemy.
- [x] **B-04 Brak `SESSION_SECRET` daje stały podpis.** W `lib/sesja.ts:9` brak zmiennej oznacza podpis cookie admina tekstem „brak-sekretu”, więc da się je podrobić. W produkcji rzucić błąd i ustawić zmienną na hostingu.
- [x] **B-05 Limity zapytań per IP** (`lib/limit.ts`).
  - Jury w jednej sieci (Tauron Arena, biuro ROPS) ma jedno IP. Krawiec pozwala na 4 zapytania na minutę, Pracownia i zgłoszenia na 5.
  - *Poprawka:* kluczem ma być anonimowe cookie sesji, a IP drugim, wyższym limitem. Na czas oceny podnieść limity. Budżet globalny zostaje.
- [x] **B-06 Szerokość 320 px (WCAG 1.4.10).** Poziome przewijanie na 6 stronach:

  | Strona | Szerokość | Przyczyna |
  |---|---|---|
  | Biblioteka | do 417 px | karty siatki |
  | Kondycja Małopolski | 550 px | `<select>` wskaźnika |
  | Rynek | 336 px | `<select>` |
  | karta innowacji | 328 px | |
  | Radar | 333 px | |
  | start | 324 px | |

  *Poprawka:* `min-w-0` w elementach siatki, `break-words` i `hyphens-auto`, `max-w-full` dla `select` (najlepiej zamienić je na przyciski, zob. B-14). *DoD:* przy 320 px żadna strona nie przewija się w poziomie.
- [x] **B-07 Krawiec i „Usługa Wrażliwa”.**
  - Nabór 2025/2026 obejmuje tylko 5 innowacji (`data/nabory_rops.json`):
    - Bez presji z depresji (`bez-presji-z-depresji`);
    - Strażnik (`straznik`);
    - Himalaje autyzmu (`himalaje-autyzmu`);
    - Rodzina adopcyjna dorasta (`rodzina-adopcyjna-dorasta`);
    - Głuchy czytelnik w bibliotece (`gluchy-czytelnik-w-bibliotece`).
  - Składanie wniosków trwało od 22.12.2025 do 30.01.2026 i jest zakończone. Obowiązuje 1 wniosek na kategorię. Jednostki Województwa Małopolskiego są wykluczone.
  - Krawiec tego nie sprawdza. Scenariusz demo w PLAN.md (6.7 i 18.1) używa Senior CUDER, którego w naborze nie ma.
  - *Poprawka:*
    - dodać warunek „Innowacja w kategoriach naboru” z wynikiem „spełnia” albo „nie spełnia”, a przy „nie spełnia” podać inne źródła: budżet gminy, zlecanie zadań, inne działania FEM;
    - dodać wykluczenia;
    - dodać etykietę „na zasadach naboru 2025/2026”;
    - pokazywać demo na Strażniku albo na „Bez presji z depresji”.
- [x] **B-08 „Podobne przypadki” przesadzają.** Licznik liczy wszystkie zgłoszenia z całego obszaru, razem z danymi demo. Przy pytaniu o alarm dla głuchych wychodzi „39 osób zgłosiło podobną sprawę” o całej „niepełnosprawności”. Poprawka: zob. W-11.

### P1: poprawić przy domykaniu wymagań

- [x] **B-09 Pracownia nie działa bez AI.** Nie ma ręcznego formularza fiszki. Dodać 4 pola z PDF wypełniane ręcznie, a „Uzupełnij z opisu (AI)” zostawić jako opcję.
- [ ] **B-10 Długie czekanie.** Pracownia trwa ok. 30 s, Krawiec ok. 60 s, bez żadnej informacji o postępie.
  - Dodać kroki postępu w `role="status"`, np. „Czytam pomysł…”, „Porównuję z 115 innowacjami…”, „Oceniam według karty IWS…”.
  - Albo rozbić analizę na 2 krótsze wywołania.
- [x] **B-11 Wyszarzone przyciski.** Przycisk „Znajdź pomoc” jest nieaktywny, dopóki pole jest puste, i senior nie wie, dlaczego nie działa. Zostawić go aktywnym, a po kliknięciu pokazać komunikat przy polu (WCAG 3.3.1, 3.3.3).
- [ ] **B-12 Teksty na sztywno w komponentach** (Centrala, statusy, Kondycja, „Zapytaj raporty”, „(jeszcze nie)” w `status-zgloszenia.tsx`). CLAUDE.md wymaga `messages/pl.json`. Bez tego nie będzie wersji ukraińskiej.
- [x] **B-13 Formy męskie.** „Jesteś zapisany” i „Czy poleciłbyś” zamienić na neutralne: „Zapisaliśmy Cię”, „Czy polecisz to innym?”.
- [ ] **B-14 Listy rozwijane** (`<select>`) w Rynku, Kondycji, imporcie i formularzu pytania. PLAN 10.1 sam zakłada „bez list rozwijanych”, bo seniorzy mają z nimi najwięcej kłopotu. Zamienić na przyciski radio albo wyszukiwarkę.
- [ ] **B-16 Ocena AI w karcie zgłoszenia.** Centrala pisze „Ocena AI w toku. Odśwież stronę”. Strona ma odświeżać się sama.
- [ ] **B-17 Nieaktualne materiały:**
  - zrzuty w `docs/zrzuty` pokazują kafelki „Wkrótce”;
  - README ma „Status modułów (4.10.2026, rano)”;
  - PLAN 14.2 mówi „domyślnie Opus”, a 1b i `.env` używają Sonnet 5.5;
  - tabela kosztów (PLAN rozdz. 16) zakłada 15–27 tys. tokenów, a pomiar to 43 tys. (rozdz. 9).
- [ ] **B-18 Licencje pośrednie.** Bezpośrednie zależności mają licencje MIT, Apache albo ISC. Pośrednio są jednak:
  - MPL-2.0: axe-core (tylko testy), lightningcss (przez Tailwind), @vercel/og (przez Next);
  - LGPL-3.0: libvips przez sharp z Next.js.

  Wykaz w `docs/zaleznosci.md` ma to uczciwie podać.

### P2–P3: jeśli zostanie czas

- [ ] **B-15** Przyciski A/A+/A++ mają 41 px wysokości, a zasada projektu to 48 px.
- [ ] **B-19 Odporność na odmowy modelu.** Rozważyć server-side fallback w `lib/ai.ts`: `fallbacks: "default"` z nagłówkiem beta `server-side-fallback-2026-07-01` (tylko Claude API). Najpierw sprawdzić zgodność z `messages.parse`. Przetestować 5 opisów kryzysowych: panel z telefonami ma pokazać się zawsze (dziś działa dzięki regułom bez AI).
- [ ] **B-20 Brak nagłówka CSP.** Dodać Content-Security-Policy zgodnie z dokumentacją Next 16 w `node_modules/next/dist/docs/`.

---

## 5. Macierz zgodności z PDF: 100% wymagań (W-xx)

Legenda: ✅ spełnione, ⚠️ częściowo, ❌ brak. Kolumna „Domknięcie” opisuje minimum, które spełnia wymóg. Pełniejsze wersje są w rozdz. 6. Ta tabela, skrócona, to też slajd 5 („Mapa zgodności”).

### 5.1 Cel i charakter rozwiązania (PDF §1–3)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-01 | Zaprojektować, **nazwać** i zbudować prototyp | ✅ „Splot” | hasło + 1 zdanie na slajdzie 1 i w opisie | P1 |
| W-02 | Platforma wykorzystująca AI | ✅ | Karta systemu AI (I-15) | P2 |
| W-03 | Automatyzacja procesów, „eliminować biurokrację” | ⚠️ działa, ale nie jest pokazane | sekcja i slajd „Co Splot robi za człowieka”: triage zgłoszeń, szkic odpowiedzi, import innowacji z tekstu lub PDF, generator wniosku zamiast Webankiety z PDF-ami, temat naboru z danych, raport Puls; przy każdej pozycji czas „przed i po” jako szacunek | P1 |
| W-04 | Łączy: diagnozę, rozwój pomysłów, testowanie, **upowszechnianie**, **partnerstwa** | ⚠️ upowszechnianie i partnerstwa słabe | I-02 (innowacja szuka ludzi i gmin), W-53 | P1 |
| W-05 | „Cyfrowe serce” łączy problemy z dostępnymi **lub nowo powstającymi** rozwiązaniami | ⚠️ tylko z istniejącymi | Swatka pokazuje też dobre praktyki z galerii i testy w Próbowni (oznaczone „nowe, w testach”); I-02 dopasowuje nowe rozwiązania do starych zgłoszeń | P1 |

### 5.2 Moduł I: Matchmaking (obowiązkowy, PDF §2.I)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-10 | Użytkownik opisuje problem | ✅ tekst, głos, przykłady | I-01, I-05 | P2 |
| W-11 | System **wyszukuje podobne przypadki** | ⚠️ licznik całego obszaru | 2–3 zanonimizowane podobne sprawy dobrane po obszarze, tagach i powiecie (pokazywać tylko streszczenie AI, nie treść, i tylko przy co najmniej 5 sprawach); „Co pomogło innym” (innowacje oznaczone „To mi pomoże”); liczba w tym samym powiecie i temacie; dane demo oznaczone | P1 |
| W-12 | …**informacje o danej kwestii** | ⚠️ 1 fakt | sekcja „Co warto wiedzieć”: 2–3 fakty z raportów z numerem strony, dane IOSS dla powiatu, link do lekcji Akademii (I-18) i do Kondycji Małopolski | P1 |
| W-13 | **Proponuje gotowe rozwiązania** | ✅ (po B-01) | do tego nowe rozwiązania (W-05) | P1 |
| W-14 | Trafność po słowach kluczowych (§6) | ✅ | chipy „Rozpoznaliśmy: głusi → osoby niesłyszące”, rozszerzony zestaw testowy, wynik na slajdzie | P1 |

### 5.3 Moduł II: Zasobnik wiedzy (PDF §2.II)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-20 | Kondycja Małopolski z raportów i Mapy Wyzwań | ✅ | persony Mapy Wyzwań i profil powiatu (I-03); kafelki mapy klikane | P2 |
| W-21 | Biblioteka w **ciekawej formie, m.in. filmy** | ⚠️ filmy to linki | I-19 minimum: odtwarzacz ładowany po kliknięciu (youtube-nocookie, z tytułem), miniatury, „Innowacja w 30 sekund” | P1 |
| W-22 | **Materiały edukacyjne** o innowacjach i problemach | ⚠️ 6 linków | Akademia, minimum 5 mikrolekcji (I-18), plus publikacje ROPS z opisem | P1 |
| W-23 | Łatwo uzyskać konkretne informacje | ⚠️ „Zapytaj raporty” na ok. 29 faktach | baza wiedzy z fragmentów diagnozy 2025 (licencja CC BY 4.0) z numerami stron; odpowiedzi z cytatem; „Wyjaśnij prościej” | P2 |
| W-24 | **Sprawna i szybka aktualizacja danych** | ⚠️ tylko dodane innowacje | edycja wszystkich 115 innowacji (nadpisanie w bazie), materiałów, faktów i ekspertów; import z pliku PDF; historia zmian (tabela `dziennik`); przycisk „Zgłoś nieaktualną informację” | P1 |
| W-25 | Ciekawa, pomysłowa i **dostępna** forma | ⚠️ | I-06 (prosty język, UA), I-19, odsłuch | P2 |
| W-26 | Agregacja potrzeb i trendy **tylko dla administratora** | ✅ Radar | pilnować, żeby publiczne strony (I-03) nie pokazywały trendów zgłoszeń | — |

### 5.4 Moduł III: Kreator pomysłów (PDF §2.III)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-30 | Zgłaszanie nowych pomysłów | ✅ | pomysł dostaje numer i śledzenie (W-50) | P0 |
| W-31 | **Prezentowanie dobrych praktyk i rozwiązań testowanych w mikroskali** | ❌ fiszki nie są publiczne | galeria (I-11 minimum): fiszka po akceptacji ROPS jest publiczna, z etapem i powiatem | P1 |
| W-32 | Fiszka: krótki opis, istota, dla kogo, etap; **zawsze dostępna** | ✅ (zob. B-09) | ręczny formularz bez AI | P1 |
| W-33 | Generator wniosków tylko w czasie naboru | ✅ | — | — |
| W-34 | Wniosek **modyfikowany do konkretnego naboru** | ❌ jeden formularz IWS | schemat pól i kryteriów zapisany osobno dla każdego naboru (I-08: minimum to edytor pól w Centrali, pełna wersja to AI z regulaminu) | P1 |
| W-35 | Złożenie wniosku i finansowanie | ⚠️ zapis bez numeru | numer, statusy „złożony / w ocenie / decyzja” w „Moje sprawy”; eksport do bazy grantowej (W-64) | P1 |
| W-36 | Materiały do prototypowania: **kanwy innowacji społecznych** | ⚠️ część kanwy | pełna kanwa INNO AGH (3 arkusze z `data/kanwa_inno_agh.json`) jako kreator, jedna sekcja na ekran; przycisk „Nie wiem, pomóż” przy polu; druk kanwy A4; link do oryginalnych plansz | P1 |
| W-37 | **Asystent kreatora**: jak zbudować, rozwija pomysł, nietuzinkowe rozwiązania, **wizualizacja** (mile widziany) | ⚠️ brak rozmowy i wizualizacji | I-07: rozmowa z asystentem, scenorys usługi, plakat | P1 |

### 5.5 Moduł IV: Tester innowacji (PDF §2.IV)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-40 | Zgłoszenie chęci udziału w testach | ✅ | profil testera (wiek, powiat, potrzeby dostępności), przypomnienie w pliku ICS | P2 |
| W-41 | Ocena istniejących rozwiązań | ✅ | — | — |
| W-42 | Przekazywanie informacji zwrotnej | ✅ | opinia głosem (komponent `Mikrofon` już jest) | P2 |
| W-43 | Proponowanie usprawnień | ✅ | — | — |
| W-44 | (wynika z modułu) innowator ogłasza test i zbiera testerów | ❌ tylko testy z danych demo | I-12 minimum: formularz „Ogłoś test” z akceptacją ROPS | P1 |

### 5.6 Moduł V: Platforma aktywnej komunikacji (PDF §2.V)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-50 | **Bezpośredni dialog** ROPS ↔ użytkownicy | ⚠️ tylko dla zgłoszeń | każda sprawa (problem, pomysł, pytanie, wniosek, zapis) ma numer, wątek i oś czasu w „Moje sprawy”; Centrala odpowiada na każdą (I-09 minimum) | **P0** |
| W-51 | Szybkie zadawanie pytań | ✅ | natychmiastowa odpowiedź AI z bazy wiedzy, z cytatem, oznaczeniem AI i przyciskiem „Przekaż człowiekowi” | P2 |
| W-52 | **Wsparcie od mentorów** | ⚠️ tylko lista ekspertów | widok eksperta (I-10) | P1 |
| W-53 | **Budowanie partnerstw międzysektorowych** | ⚠️ tablica bez odpowiedzi | „Odpowiedz na ogłoszenie” (moderowany wątek, dane kontaktowe ukryte); podpowiedź partnerów według poczwórnej helisy | P1 |

### 5.7 Moduł VI: Panel administratora (PDF §2.VI)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-55 | Szybkie modyfikowanie wiedzy | ⚠️ | W-24 | P1 |
| W-56 | Weryfikacja | ✅ szkic → publikacja | status „do weryfikacji”, informacja kto zatwierdził, dziennik zmian | P2 |
| W-57 | Udostępnianie wiedzy | ✅ publikacja | wysyłka raportu do gminy (I-03), Puls Małopolski (I-17) | P2 |

### 5.8 Moduł VII: Middleman Innowacji (PDF §2.VII)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-58 | Dostosowanie innowacji do formy usługi według potrzeb instytucji (asystent AI) | ✅ | B-07 i I-13 (warianty, koszt na odbiorcę, pakiet startowy, kompas DI) | P1 |

### 5.9 Wymagane elementy (PDF §3)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-60 | Funkcjonalny prototyp z najważniejszymi modułami | ✅ lokalnie | wdrożenie (M-01) | **P0** |
| W-61 | **Wizualizacja: minimum makiety UX/UI** | ❌ | M-03 | **P0** |
| W-62 | WCAG 2.1 AA | ⚠️ (B-06) | rozdz. 7 | P0/P1 |
| W-63 | Skalowalność i dalsza rozbudowa | ⚠️ tylko opis w PLAN | `docs/WDROZENIE.md`: architektura, test obciążenia stron bez AI, cache, kolejka dla zadań AI, konfiguracja dla innych województw | P1 |
| W-64 | Gotowość do integracji z innymi systemami | ⚠️ eksport i API do odczytu | dokumentacja API (OpenAPI), webhooki z podpisem HMAC i dziennikiem, eksport wniosków do bazy grantowej, widżet (I-14) | P1 |
| W-65 | Bezpieczeństwo danych | ⚠️ | B-02, B-03, B-04; role i konta demo; dziennik dostępu; strona „Prywatność”; DPIA w planie wdrożenia | P0/P1 |

### 5.10 Użytkownicy końcowi (PDF §3)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-70 | Mieszkańcy i NGO: intuicyjny interfejs, przejrzysty proces, sprawna komunikacja | ⚠️ | W-50, I-04, test z ludźmi (M-09) | P0/P1 |
| W-71 | JST **diagnozują i zgłaszają** lokalne wyzwania | ⚠️ tylko rola „instytucja” w Swatce | „Zgłoś wyzwanie gminy” (skala, powiat, grupa), które trafia do Radaru jako zgłoszenie instytucji; profil powiatu (I-03) | P1 |
| W-72 | JST: **katalog**, z którego łatwo czerpać i wdrażać | ⚠️ | filtry „kto może wdrożyć”, porównywarka (I-19), Krawiec uruchamiany z profilu powiatu | P1 |
| W-73 | ROPS: prezentowanie wiedzy, monitorowanie zgłoszeń, dialog | ✅ | jedna skrzynka (I-09) | P1 |
| W-74 | **Eksperci**: szybki feedback i współpraca | ❌ | I-10 | P1 |

### 5.11 Wymagania formalne (PDF §4, regulamin §4 ust. 9)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-80 | Nazwa i opis rozwiązania | ⚠️ | M-04, Załącznik B | **P0** |
| W-81 | PDF (maks. 10 slajdów) lub film (maks. 3 min); według regulaminu oba | ❌ | M-05, M-06 | **P0** |
| W-82 | Link do działającego demo i makiety UX/UI | ❌ | M-01, M-03 | **P0** |
| W-83 | Przewidywany koszt utrzymania i opis zasobów | ⚠️ w PLAN, do przeliczenia | M-07, rozdz. 9 | **P0** |

### 5.12 Wymagania techniczne (PDF §5)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-85 | Skalowalność: dane z całego województwa, wielu użytkowników naraz | ⚠️ | W-63 i test obciążenia z wynikiem na slajdzie | P1 |
| W-86 | Współpraca z systemami Hubu (np. bazą grantową) | ⚠️ | W-64 | P1 |
| W-87 | **Automatyczne powiadomienia o nowych pomysłach i zmianach w naborach** | ❌ | jedna magistrala zdarzeń: tabela `powiadomienia` plus skrzynka nadawcza; nowy pomysł → ROPS (plakietka, dźwięk, symulowany e-mail); otwarcie, zmiana lub zamknięcie naboru → autorzy pasujących fiszek i wniosków roboczych | **P0** |
| W-88 | WCAG: seniorzy i osoby z niepełnosprawnościami | ⚠️ | rozdz. 7 | P1 |

### 5.13 Jak Jury testuje (PDF §6)

| ID | Test | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-90 | Intuicyjność: osoba w różnym wieku, bez przygotowania | ⚠️ brak dowodu | test z ludźmi (M-09), I-04 | **P0** |
| W-91 | **Szybkość komunikacji: powiadomienie o nowym pomyśle i ścieżka odpowiedzi do autora** | ❌ | W-50, W-87, wskaźnik czasu odpowiedzi | **P0** |
| W-92 | Trafność dopasowania po słowach kluczowych | ✅ (po B-01) | W-14 | P0 |
| W-93 | Pomysłowość: nowa jakość zamiast składanki funkcji | ⚠️ | rozdz. 6 | P2 |
| W-94 | **Jakość komunikacji pomiędzy użytkownikami** | ❌ | W-53, I-11 | P1 |
| W-95 | Możliwość dalszego rozwoju | ⚠️ | mapa drogowa, API, architektura | P1 |
| W-96 | Łatwość zgłoszenia problemu | ✅ | I-04, I-05 | P2 |

### 5.14 Uwagi (PDF §9)

| ID | Wymaganie | Stan | Domknięcie | P |
|---|---|---|---|---|
| W-98 | Bez prawdziwych danych osobowych i wrażliwych | ✅ | trzymać tak dalej; dane demo oznaczone; konta demo to fikcyjne persony Mapy Wyzwań | — |
| W-99 | Fundament Hubu: sieć liderów innowacji, obsługa grantów wdrożeniowych | ⚠️ | Krawiec (granty); I-20 (sieć liderów) | P2 |

---

## 6. Nowe pomysły i innowacje (I-xx)

### 6.1 Idea przewodnia: Pętla Splotu

```
 Mieszkanka, gmina albo NGO opisuje sytuację (tekst, głos, zdjęcie karty z OPS)
                                   │
                 I-01 Rozplątywanie: 1–3 nici potrzeb
                                   │
                  Swatka: czy jest sprawdzone rozwiązanie?
              ┌────────── tak ─────┴───── nie ──────────┐
              ▼                                          ▼
   Krawiec I-13: plan dla gminy               Radar: biała plama → temat naboru
   (profil powiatu I-03)                      I-08: nabór z regulaminu + powiadomienia
              │                                          │
              │                               Pracownia: pomysł + I-07 asystent i scenorys
              │                                          │  → wniosek dopasowany do naboru
              │                               Próbownia I-12: testerzy = osoby,
              │                                          │  które zgłosiły ten problem
              │                               Biblioteka: nowa innowacja z wynikami testów
              │                                          │
              │                    I-02 Innowacja szuka ludzi i gmin:
              │                    „Jest nowe rozwiązanie dla Twojego zgłoszenia”
              └────────────────► wdrożenie → Radar: plama się zmniejsza
```

**Jedno zdanie dla Jury:** Splot nie jest katalogiem. Każda zgłoszona potrzeba albo dostaje sprawdzone rozwiązanie, albo staje się tematem naboru. Każda nowa innowacja sama odnajduje ludzi i gminy, które na nią czekały.

To odpowiada wprost na zdanie z PDF §2, że Splot ma łączyć problemy z rozwiązaniami „dostępnymi lub nowo powstającymi”. Odpowiada też na cytat z Przewodnika ROPS: „Nawet znakomita innowacja nie upowszechni się sama”.

### 6.2 TOP 8: robić na pewno (P2, po P0 i P1)

#### I-01. Rozplątywanie: Splot dzieli sytuację na nici · rozmiar M

- **Co to jest:**
  - Opis rzadko dotyczy jednej sprawy (np. „samotna po śmierci męża i gubię się w lekach”).
  - Swatka rozpoznaje 1–3 osobne potrzeby, czyli nici, i do każdej dobiera rozwiązania.
  - Ekran wyników mówi: „W Twoim opisie widzimy 2 sprawy: samotność · leki”. Każda nić ma kolor marki i 1–2 innowacje.
  - Niżej są chipy „Rozpoznaliśmy słowa: gubię się w lekach → wielolekowość”.
- **Dlaczego da punkty:**
  - trafność (test 3);
  - intuicyjność: jasna struktura, mniej przewijania;
  - pomysłowość i marka (nazwa „Splot” zaczyna znaczyć coś w działaniu);
  - UI.
- **Jak zrobić:**
  1. Rozszerzyć `schematAI` w `lib/swatka.ts` o `nici: [{ potrzeba, slowa: [{ z_opisu, pojecie }], dopasowania: [{ id, trafnosc, dlaczego }] }]`, maksymalnie 3.
  2. Zachować płaską listę `dopasowania` (najlepsze z nici) dla zgłoszeń i pomiaru.
  3. W UI (`components/swatka/formularz.tsx`) każda nić to sekcja z nagłówkiem `h2`. Kolorowa nić jest dekoracją z `aria-hidden`.
  4. W pomiarze liczyć Hit@3 po sumie nici i dodać 5 zapytań wielowątkowych.
- **DoD:**
  - q01 pokazuje 2 nici, a słowa kluczowe Jury dalej dają 1 nić;
  - Hit@3 ≥ 95%;
  - czas rośnie najwyżej o 1,5 s;
  - czytnik ogłasza „Znaleźliśmy rozwiązania dla 2 spraw”.

#### I-02. Innowacja szuka ludzi: odwrotne dopasowanie i upowszechnianie · rozmiar M–L

- **Co to jest:**
  - Gdy pojawia się nowa innowacja albo dobra praktyka (import w Centrali, wynik testu, galeria), Splot sam szuka:
    - otwartych zgłoszeń bez rozwiązania, które ona rozwiązuje;
    - powiatów z największą potrzebą w jej obszarze (Radar);
    - gmin i OPS, które pytały o podobne sprawy.
  - ROPS jednym kliknięciem wysyła:
    - autorom zgłoszeń: „Jest nowe rozwiązanie dla Twojego zgłoszenia” (w „Moje sprawy” i jako symulowany e-mail);
    - gminom: rekomendację z linkiem do Krawca.
  - Radar pokazuje np. „biała plama zmniejszyła się z 14 do 6”.
- **Dlaczego da punkty:**
  - domyka pętlę, czyli „nową jakość” (test 4);
  - realizuje upowszechnianie (PDF §1) i „nowo powstające rozwiązania” (PDF §2);
  - poprawia szybkość komunikacji;
  - to najlepszy moment filmu.
- **Jak zrobić:**
  1. Nowy plik `lib/odwrotne.ts`.
  2. Kandydaci: zgłoszenia z obszaru innowacji ze statusem innym niż „zamknięte” i z `najlepsze_dopasowanie < 55`. Najwyżej 60 zgłoszeń, tylko treść zamaskowana.
  3. `zapytajJson` zwraca listę id z trafnością i uzasadnieniem.
  4. Wynik zapisać w `dopasowania`, w `historia_statusu` („Pojawiło się nowe rozwiązanie”) i w `powiadomienia`.
  5. Powiaty liczyć z `policzRadar()` i `ryzyko[obszar]`.
  6. W Centrali (Treści) po publikacji pokazać panel „Kogo ta innowacja może ucieszyć?” z liczbami i przyciskami. W `/moje/[numer]` pokazać kartę „Nowe rozwiązanie”.
- **DoD:** w demo w mniej niż 60 s: import innowacji → „Pasuje do N zgłoszeń i 2 białych plam” → „Powiadom” → status Janiny pokazuje nowe rozwiązanie.

#### I-03. Profil powiatu: diagnoza w minutę dla gmin i CUS · rozmiar M–L

- **Co to jest:** strona `/wiedza/powiat/[nazwa]`, która zawiera:
  1. najważniejsze wyzwania powiatu z IOSS na tle regionu, opisane prostym językiem (np. „W powiecie olkuskim 23,6% mieszkańców ma 65 lat lub więcej. To jeden z 3 najwyższych wyników w regionie”);
  2. do każdego wyzwania 2–3 innowacje z Biblioteki, które może wdrożyć gmina albo OPS;
  3. otwarte nabory, ekspertów i ogłoszenia partnerów z powiatu;
  4. przycisk „Przygotuj plan wdrożenia” (Krawiec z wpisanym powiatem);
  5. „Pobierz raport do diagnozy usług społecznych” (wydruk lub PDF).

  Wersja w Centrali dodaje zanonimizowane dane ze zgłoszeń (od 5 wzwyż) i przycisk „Wyślij raport do gminy”.
- **Dlaczego da punkty:**
  - JST to jedna z 4 grup odbiorców i oczekuje „katalogu, z którego łatwo czerpać i implementować”;
  - CUS i OPS przygotowują diagnozy potrzeb, więc to realna oszczędność pracy (potencjał wdrożeniowy);
  - realizuje „diagnozowanie problemów” (PDF §1).
- **Jak zrobić:**
  - dane z `wczytajIoss()` już są;
  - mapowanie obszaru na kategorie innowacji: `OBSZAR_KATEGORII`;
  - klasyfikację „kto może wdrożyć” (gmina, OPS/CUS, DPS/DDP, NGO, szkoła, biblioteka, podmiot ekonomii społecznej) wygenerować raz skryptem przez `zapytajJson` i zapisać w `data/`;
  - kafelki mapy w Kondycji zamienić na linki do profili;
  - dodać widok druku.
- **Uwaga:** trendy zgłoszeń pokazujemy tylko w wersji admina (PDF §2.II).
- **DoD:**
  - działa dla 22 powiatów i przy 320 px;
  - dane są w tabeli dostępnej dla czytnika;
  - wydruk mieści się na 2 stronach A4.

#### I-04. „Jak wolisz korzystać?” i tryb prosty krok po kroku · rozmiar M

- **Co to jest:**
  - Przy pierwszej wizycie strona startowa pokazuje panel (nie okno modalne) z 6 dużymi kafelkami:
    - „Większe litery”;
    - „Czytaj mi na głos”;
    - „Mów zamiast pisać”;
    - „Prosty język”;
    - „Wysoki kontrast”;
    - „Українською”.
  - Jedno kliknięcie włącza ustawienie. Zapis trafia do cookie `splot_a11y`, więc strona nie migocze. Panel mówi: „Zmienisz to w każdej chwili w pasku na górze”.
  - Tryb prosty zamienia Swatkę w kreator z jednym pytaniem na ekran:
    1. „Opisz albo powiedz”;
    2. „Dla kogo szukasz?” (2 duże przyciski);
    3. wynik: 1 najlepsze rozwiązanie, „Pokaż więcej” i „Wyślij do ROPS”.
  - Zawsze widać „Wstecz” i „Pomoc: zadzwoń do ROPS”.
- **Dlaczego da punkty:**
  - kryterium 20% mówi wprost „niezależnie od wieku i poziomu umiejętności cyfrowych”;
  - widać to od pierwszej sekundy;
  - według NN/g osoby 65+ korzystają ze stron o 43% wolniej i gubią się w gęstych ekranach.
- **Jak zrobić:** komponent na stronie głównej; tryb prosty to osobny wariant `FormularzSwatki` (krokowy), gdy `data-prosty="tak"`.
- **DoD:**
  - w teście z seniorem zgłoszenie bez pomocy;
  - pełna obsługa z klawiatury;
  - czytnik ogłasza „Krok 2 z 3”.

#### I-05. Rozmowa głosowa: „Powiedz, a Splot zapyta” · rozmiar M–L

- **Co to jest:**
  - Tryb dla osób, którym trudno czytać lub pisać: seniorów, osób niewidomych, osób z niepełnosprawnością intelektualną.
  - Splot zadaje pytania na głos. Osoba odpowiada głosem albo dużymi przyciskami „Tak”, „Nie”, „Powtórz”.
  - Splot potwierdza, co zrozumiał: „Zrozumiałem: czuje się Pani samotna i myli Pani leki. Czy dobrze?”.
  - Czyta wyniki: „Pierwsza propozycja: Inteligentny organizer do leków. Pomaga pamiętać…”.
  - Pyta: „Czy wysłać zgłoszenie do ROPS?”.
  - Wszystko, co mówi Splot, jest też napisane na ekranie (napisy dla osób głuchych i do pracy w hałasie).
- **Dlaczego da punkty:**
  - włącza osoby wykluczone cyfrowo i osoby z niepełnosprawnościami (kryterium 20%);
  - pomysłowość;
  - mocny moment w filmie.
- **Jak zrobić:**
  - `components/a11y/rozmowa.tsx`: maszyna stanów na `SpeechRecognition` (`pl-PL` / `uk-UA`) i `speechSynthesis`;
  - korzysta z `/api/swatka/dopasuj` i `/api/zgloszenia`;
  - nie ma limitów czasu (Splot czeka na odpowiedź);
  - przycisk „Zatrzymaj” jest zawsze widoczny;
  - gdy przeglądarka nie obsługuje mowy, pokazuje komunikat i tryb tekstowy.
- **DoD:** działa w Chrome i Edge, z klawiatury i z napisami. Nagranie w filmie robimy w ciszy.

#### I-06. Prosty język i ukraiński wszędzie · rozmiar L

- **Co to jest:**
  1. Wersja łatwa do czytania każdej z 115 innowacji: krótkie zdania, jedna myśl w zdaniu. Generujemy ją raz, zapisujemy w `data/` i oznaczamy flagą „sprawdzone przez człowieka”.
  2. Przycisk „Wyjaśnij prościej” przy każdej odpowiedzi AI i przy treściach z raportów.
  3. Interfejs po ukraińsku (i angielsku) na ścieżce mieszkańca: start, Swatka, wyniki, zgłoszenie, „Moje sprawy”, panel dostępności. Odpowiedzi AI są w wybranym języku (Swatka już przyjmuje `jezyk`). Opisy innowacji zostają po polsku i mają przycisk „Przetłumacz (AI)”.
- **Dlaczego da punkty:**
  - dostępność dla osób z niepełnosprawnością intelektualną, seniorów i cudzoziemców (jeden z 8 obszarów Mapy Wyzwań, persona Swietłana);
  - PDF §2.II prosi o „dostępną formę prezentacji”.
- **Jak zrobić:**
  1. Najpierw B-12 (teksty do `pl.json`).
  2. Pliki `messages/uk.json` i `en.json`.
  3. Przełącznik języka w pasku. Cookie `splot_lang` jest już przewidziane w `lib/dostepnosc.ts`.
  4. `lang` na `<html>`.
  5. Skrypt `scripts/etr-biblioteka.ts` przez `zapytajJson`.
  6. Tłumaczenia maszynowe oznaczyć.
- **Uwaga:** nie używać oficjalnego logo „Easy to read” bez zgody Inclusion Europe. Zastąpić je własną ikoną z napisem.
- **DoD:**
  - cała ścieżka mieszkańca działa po ukraińsku z `lang="uk"`;
  - 115 wersji łatwych gotowych;
  - axe nie zgłasza błędów.

#### I-07. Asystent pomysłu i scenorys usługi (wizualizacja) · rozmiar M–L

- **Co to jest:**
  - Po fiszce i kanwie pojawia się panel „Rozwiń pomysł z asystentem”. Ma przyciski z pytaniami:
    - „Jak to przetestować z 5 osobami?”;
    - „Kto może być partnerem?”;
    - „Jak obniżyć koszty?”;
    - „Jak dotrzeć do ludzi bez internetu?”;
    - „Daj 3 nietuzinkowe warianty”.

    Jest też pole na własne pytanie. Odpowiedzi są krótkie i odnoszą się do kanwy i innowacji z Biblioteki.
  - **Wizualizacja:**
    - „Scenorys usługi”: 4 kadry jak w komiksie (kto, gdzie, co się dzieje, co czuje odbiorca). Rysujemy je własnymi komponentami i ikonami z tekstem, więc są dostępne dla czytnika.
    - „Plakat pomysłu” do druku (A4): fiszka, wskaźniki dojrzałości, scenorys i kod QR.
    - Opcjonalnie dla przedmiotu: prosty szkic SVG od AI, wyświetlany jako `<img>` (skrypty się nie wykonają), z tekstem alternatywnym i etykietą „wygenerowane przez AI”.
- **Dlaczego da punkty:**
  - PDF §2.III wymienia wprost asystenta, który „podpowiada, jak zbudować innowację, pomaga rozwinąć pomysł, podpowiada nietuzinkowe rozwiązania, robi jego wizualizację”;
  - atrakcyjność UI;
  - dobry moment w filmie.
- **Jak zrobić:**
  - `zapytajJson` ze schematami `{ odpowiedz, kolejne_pytania[] }` oraz `{ kadry: [{ tytul, kto, gdzie, co_sie_dzieje, emocja, ikona: enum }] }` (4 kadry);
  - maskowanie wejścia;
  - oznaczenia AI;
  - historia rozmowy w stanie klienta.
- **DoD:**
  - scenorys gotowy w mniej niż 10 s;
  - plakat mieści się na 1 stronie;
  - czytnik czyta kadry po kolei.

#### I-08. Nabór z regulaminu i automatyczne powiadomienia o naborach · rozmiar L

- **Co to jest:**
  - W Centrali „Nowy nabór”: pracownik wkleja regulamin albo formularz (lub wgrywa PDF). AI wyciąga:
    - pola wniosku z limitami znaków;
    - kryteria oceny z punktami i progami;
    - limity (kwota, okres);
    - kategorie.
  - Pracownik poprawia wynik i otwiera nabór.
  - Generator w Pracowni używa schematu tego naboru: inne pola, liczniki znaków i przycisk „Sprawdź wniosek według karty tego naboru” (wstępna ocena AI z podpowiedziami).
  - Otwarcie, zmiana terminu i zamknięcie naboru automatycznie powiadamiają autorów pasujących fiszek i wniosków roboczych: „Twój pomysł pasuje do naboru X. Zostało 30 dni”.
- **Dlaczego da punkty:**
  - PDF §2.III: „każdorazowo modyfikowany do konkretnego naboru”;
  - PDF §5: „automatyzować procesy powiadamiania o nowych pomysłach czy zmianach w naborach”;
  - zastępuje Webankietę z PDF-ami, czyli eliminuje biurokrację.
- **Jak zrobić:**
  1. Kolumny `nabory.formularz` i `kryteria` już są — zapisać w nich schemat.
  2. `lib/wniosek.ts` ma czytać schemat naboru zamiast stałego `POLA_IWS`. IWS 2.0 zostaje jako szablon domyślny.
  3. Ekstrakcja przez `zapytajJson`. Dla PDF rozszerzyć `lib/ai.ts` o blok `document` (regulamin nie zawiera danych osobowych).
  4. Zdarzenia zapisywać w `powiadomienia` i w skrzynce nadawczej.
- **DoD:**
  - dwa nabory (IWS 2.0 i „Samotność seniorów 2027” z innymi polami) dają dwa różne formularze;
  - zmiana terminu tworzy powiadomienia widoczne w „Moje sprawy”.

### 6.3 Kolejne pomysły (minimum = P1 tam, gdzie domyka wymaganie)

| ID | Pomysł | Co to jest | Kryterium | P | Rozmiar |
|---|---|---|---|---|---|
| I-09 | Jedno okno komunikacji z terminem odpowiedzi | Każda sprawa (problem, pomysł, pytanie, wniosek, zapis, ogłoszenie) ma numer, oś czasu „jak paczka”, wątek i termin odpowiedzi. Centrala ma jedną skrzynkę z typami, filtrami, triage AI i szkicami. Skrzynka nadawcza pokazuje e-maile i SMS-y (symulacja). Wskaźniki: mediana czasu pierwszej odpowiedzi, % odpowiedzi w terminie. | test 2, moduły V i VI | minimum P0 (pomysł), pełna P1 | L |
| I-10 | Panel eksperta i mentora | Konto demo „Ekspert”. Kolejka pytań z jego obszarów (przydział przez AI), odpowiedź ze szkicem AI, opinia o pomyśle na prośbę ROPS (komentarze przy polach kanwy), dyżury z plikiem ICS. | moduł V, grupa „Eksperci” | P1 | M |
| I-11 | Galeria pomysłów i dobrych praktyk, rozmowy między użytkownikami | Publiczne fiszki po akceptacji ROPS. Przyciski „Chcę pomóc”, „Chcę przetestować”, „Mam podobny problem”, „Mogę być partnerem” otwierają moderowany wątek: dane kontaktowe ukryte, maskowanie, moderacja AI. To samo dla odpowiedzi na ogłoszenia partnerskie. | moduły III i V, test „komunikacja między użytkownikami” | P1 | M |
| I-12 | Próbownia 2.0: 5 testerów w 48 h | Przy zgłoszeniu zgoda „Chcę pomóc testować rozwiązania”. Innowator ogłasza test (AI pisze ogłoszenie prostym językiem), ROPS akceptuje. Splot zaprasza pasujące osoby (obszar, powiat, wiek, potrzeby dostępności) i instytucje, np. kluby seniora. Zapisy uwzględniają potrzeby dostępności, jest plik ICS i opinia głosem. Wyniki testu trafiają do „Czy to działa?”. | moduł IV; cytat ROPS „znalezienie 5 osób… bariera nie do przejścia” | minimum P1, pełna P2 | L |
| I-13 | Krawiec 2.0 | Zgodność z kategoriami i wykluczeniami naboru (B-07). Dwa warianty, minimum i pełny, z kosztem na odbiorcę. „Kompas deinstytucjonalizacji”: ocena zgodności z DI i wskazówki (część B karty IWS). Pakiet startowy: materiały z Biblioteki, kontakt z autorem przez Hub, lista kroków. | moduł VII, wdrożenie | P1 | M |
| I-14 | Widżet „Znajdź pomoc”, API i webhooki | Jedna linijka HTML (iframe z tytułem) na strony gmin, OPS i bibliotek, z parametrem powiatu. Strona dokumentacji API (OpenAPI). Webhooki z podpisem HMAC (nowe zgłoszenie, nowy pomysł, zmiana naboru) z dziennikiem dostaw. | wdrożenie, integracje, upowszechnianie | P1 | M |
| I-15 | Zaufanie i zgodność | Strony: Karta systemu AI (co robi AI, czego nie robi, przepływ danych, maskowanie, nadzór człowieka, wyniki pomiaru, ograniczenia), Deklaracja dostępności, Informacja w tekście łatwym, Prywatność (RODO), Bezpieczeństwo. Do tego `docs/raport-dostepnosci.md`. | wdrożenie, dostępność | P1 | M |
| I-16 | Tryb asystowany i papier | Konto „Pracownik OPS, CUS albo klubu seniora”: zgłoszenie w imieniu osoby (zgoda ustna zaznaczona), kanał „asystowane”. Wydruk „Karty potrzeby” z numerem i kodem QR do statusu (biblioteka `qrcode`, MIT). „Poproś, żeby ROPS oddzwonił” (telefon tylko w polu kontaktu, nie w treści). W Radarze przy cichej potrzebie: „Poproś OPS w powiecie o tryb asystowany”. | dostępność (osoby wykluczone cyfrowo), pomysłowość | P2 | M |
| I-17 | Puls Małopolski | Miesięczny raport dla kierownictwa ROPS (1–2 strony do druku): liczby, nowe trendy, białe plamy, ciche potrzeby, czasy odpowiedzi, oceny pomocy, najczęściej wskazywane innowacje. | moduł VI, wdrożenie | P3 | S–M |
| I-18 | Akademia Splotu | Minimum 5 mikrolekcji (do 3 min): „Czym jest innowacja społeczna”, „Jak przetestować pomysł z 5 osobami”, „Deinstytucjonalizacja w 5 minut”, „Jak napisać wniosek do IWS”, „Jak gmina wdraża innowację”. Każda ma wersję łatwą, odsłuch, 3 pytania „Sprawdź się” i źródła ROPS (streszczenia z cytowaniem, bez kopiowania dużych fragmentów). | moduł II (materiały edukacyjne) | P1 | M |
| I-19 | Biblioteka jak serwis z filmami | Rzędy według kategorii (na telefonie siatka), miniatury filmów, odtwarzacz ładowany po kliknięciu (youtube-nocookie), karta „Innowacja w 30 sekund”, filtry dla JST (kto może wdrożyć, w naborze, z filmem, upowszechniana), porównywarka do 3 innowacji. | moduł II, JST, UI | P1 | M |
| I-20 | Sieć liderów innowacji | Profile organizacji-autorów (z Biblioteki) i instytucji wdrażających (z planów Krawca) na mapie powiatów, z przyciskiem „Skontaktuj przez Hub”. | PDF §9, moduł V | P3 | M |
| I-21 | Ścieżka oceny dla Jury | Strona `/ocena`: 4 testy z PDF jako przyciski z krótką instrukcją, każdy prowadzi we właściwe miejsce. Konta demo jednym kliknięciem: Mieszkanka Janina, Gmina Olkusz, Innowatorka, Ekspert; ROPS przez hasło. Przycisk „Przywróć dane demo”. | materiały, intuicyjność | P1 | S–M |
| I-22 | Test z ludźmi na HackYeah | Opis w M-09. | dostępność (dowód) | P0 | 1 h ludzi |

### 6.4 Świadomie odrzucone (żeby nie tracić czasu)

- **Obrazy z drugiego modelu AI:** inny dostawca łamie zasadę „AI tylko przez `lib/ai.ts`”, dochodzą licencje i koszty. Scenorys (I-07) daje wizualizację bezpieczniej.
- **Generowany awatar migowy (PJM):** niska jakość, może urazić społeczność Głuchych. Właściwe rozwiązanie to nagranie z tłumaczem PJM w pilotażu.
- **Nakładka dostępności (overlay):** środowisko osób z niepełnosprawnościami ją krytykuje. Mamy dostępność natywną i tak zostaje.
- **Prawdziwe SMS-y i login.gov.pl:** za mało czasu, dochodzą koszty. Trafiają do mapy drogowej, a w demo jest uczciwa symulacja.
- **Embeddingi:** przy 115 innowacjach niepotrzebne. Mapa drogowa dla tysięcy pozycji.
- **Grywalizacja (punkty, odznaki):** nie pasuje do tonu instytucji publicznej ani do spraw ludzi w kryzysie.

### 6.5 „Nowa jakość” w czterech zdaniach (do slajdu 3 i na pytanie Jury)

1. **Zamknięta pętla zamiast katalogu.** Potrzeba bez rozwiązania staje się tematem naboru, a nowa innowacja sama szuka ludzi (I-02).
2. **Ciche potrzeby.** Radar pokazuje nie tylko, kto pisze, ale też, gdzie ludzie milczą, choć dane IOSS mówią o ryzyku. To odpowiedź na wykluczenie cyfrowe.
3. **Procesy ROPS w produkcie.** Karta oceny IWS 2.0, kanwa INNO AGH, zasady „Usługi Wrażliwej”, Mapa Wyzwań, IOSS. To nie jest ogólny czat, tylko narzędzie zbudowane na pracy ROPS.
4. **Dostępność jako sposób działania.** Rozmowa głosowa, prosty język, ukraiński, tryb asystowany i papierowa karta z QR zamiast „formularza dla wszystkich”.

---

## 7. Dostępność na 9+

### 7.1 Testy ręczne (wyniki do `docs/raport-dostepnosci.md` i na slajd 7)

- [ ] **Klawiatura:** 3 ścieżki bez myszy (zgłoszenie, pomysł, odpowiedź w Centrali). Sprawdzić kolejność fokusu, brak pułapek i widoczny fokus.
- [ ] **Czytnik ekranu:** NVDA z Firefoxem albo Chrome (Windows) albo VoiceOver (macOS, iOS). Sprawdzić nagłówki, regiony, etykiety i komunikaty o stanie (wyniki, błędy, „Wysłano”).
- [ ] **Powiększenie 200% i 400% (320 px):** bez przewijania w poziomie (B-06).
- [ ] **Odstępy tekstu (WCAG 1.4.12):** po zwiększeniu odstępów nic się nie ucina.
- [ ] **Kontrast:** tryb zwykły i wysoki; elementy nietekstowe (obramowania pól, fokus) co najmniej 3:1.
- [ ] **Język:** `lang="uk"` dla ukraińskiego; fragmenty w innym języku oznaczone.
- [ ] **Błędy formularzy:** komunikat przy polu z podpowiedzią, jak poprawić; `aria-describedby`; nie tylko kolor (B-11).
- [ ] **Brak limitów czasu dla mieszkańców:** sesja admina ostrzega przed wygaśnięciem.
- [ ] **Media:** nasz film z napisami; przy filmach ROPS informacja o napisach.
- [ ] **Telefon:** w pionie i w poziomie (WCAG 1.3.4); cele dotykowe co najmniej 48 px.

### 7.2 Funkcje włączające (podnoszą ocenę ponad samą zgodność z WCAG)

- **I-04** „Jak wolisz korzystać?” i tryb prosty krok po kroku.
- **I-05** Rozmowa głosowa z napisami.
- **I-06** Prosty język i ukraiński.
- **I-16** Tryb asystowany, papierowa karta z QR, „Poproś o telefon”.

### 7.3 Dowody dla Jury

- **Slajd 7:**
  - liczba przebiegów axe z wynikiem 0;
  - lista testów ręcznych;
  - wynik testu z ludźmi (np. „5 z 5 osób zgłosiło problem samodzielnie, średnio w 74 s”).
- **W aplikacji:** Deklaracja dostępności i Informacja w tekście łatwym do czytania (I-15).
- **W filmie:** 20 s z testu z prawdziwą osobą (za zgodą, bez danych osobowych).

---

## 8. Materiały do oddania (M-xx)

- [ ] **M-01 Wdrożenie (P0).**
  - Hosting: Vercel, baza Supabase w UE (eu-central-1 już jest).
  - Zmienne: `ANTHROPIC_API_KEY` (z limitem budżetu), `AI_MODEL`, `AI_EFFORT_SWATKA`, `DATABASE_URL`, `SESSION_SECRET` (obowiązkowo, B-04), `DEMO_ADMIN_PASSWORD`.
  - Sprawdzić limit czasu funkcji na wybranym planie, bo Krawiec i Pracownia trwają do 120 s.
  - `noindex` zostaje.
  - Skrypt `scripts/reset-demo.ts` przywraca dane demo.
  - Przed oceną i przed finałem rozgrzać cache jednym zapytaniem.
  - Test w trybie incognito na telefonie i na laptopie.
- [ ] **M-02 Ścieżka oceny i konta demo (P1).** Zob. I-21.
- [ ] **M-03 Makiety UX/UI w Figmie (P0).** Jury ocenia wprost „atrakcyjność dostarczonych makiet”.
  - Plik zawiera:
    1. okładkę;
    2. system projektowy: kolory z kontrastami, typografię (Atkinson, Bricolage), komponenty ze stanami fokusu, błędu i wyłączenia, cele 48 px;
    3. ekrany desktop i mobile: start z panelem dostępności, Swatka z nićmi, status „jak paczka”, galeria pomysłów, Pracownia z kanwą i scenorysem, Krawiec, profil powiatu, Centrala (skrzynka, Radar), rozmowa głosowa;
    4. przepływy 4 testów Jury;
    5. adnotacje dostępności: nagłówki, regiony, kolejność fokusu.
  - Ekrany można przenieść z działającej aplikacji przez Figma MCP (`generate_figma_design`) i dopracować.
  - Eksport PNG do `docs/makiety/`.
  - Link udostępniony tylko osobom z linkiem, bez publikacji w Community (umowa: utwór nieopublikowany).
- [ ] **M-04 Opis rozwiązania (P0).** Zob. Załącznik B.
- [ ] **M-05 PDF, 10 slajdów (P0):**
  1. **Splot – cyfrowe serce HubMI:** hasło, 1 zdanie, kod QR do demo.
  2. **Problem słowami ROPS:** 3 cytaty, liczby (115 innowacji, 93 gminy bez dziennej opieki i klubu samopomocy), 4 grupy użytkowników.
  3. **Pętla Splotu:** nowa jakość, diagram z 6.1.
  4. **Swatka:** trafność, rozplątywanie, podobne przypadki, czas odpowiedzi.
  5. **7/7 modułów:** mapa zgodności z wyzwaniem (✓ przy każdym punkcie z rozdz. 5).
  6. **Komunikacja (test 2):** ścieżka „jak paczka”, terminy, powiadomienia, eksperci, rozmowy, wskaźnik czasu odpowiedzi.
  7. **Dostępność (test 1):** WCAG 2.1 AA z dowodami, tryby, głos, ukraiński, wynik testu z ludźmi.
  8. **Dane ROPS w działaniu:** Radar (białe plamy, ciche potrzeby), profil powiatu, Krawiec.
  9. **Wdrożenie:** architektura, bezpieczeństwo, RODO i AI Act, integracje (API, webhooki, widżet), koszty z pomiaru, zasoby.
  10. **Pilotaż i rozwój:** 3 powiaty, 3 miesiące, wskaźniki; mapa drogowa (PLLuM lub Bielik, login.gov.pl, SMS, PJM); linki.
- [ ] **M-06 Film MP4, maks. 3:00, po polsku, z napisami (P0).** Ułożony według testów Jury:

  | Czas | Obraz | Test |
  |---|---|---|
  | 0:00–0:12 | Tytuł, 1 zdanie, liczby | — |
  | 0:12–0:50 | Janina: „Jak wolisz korzystać?” → mówi do mikrofonu → nici „samotność” i „leki” → wyniki z „dlaczego” → podobne przypadki → wysyła zgłoszenie. Potem słowa kluczowe „głusi alarm pożarowy” → Strażnik | 1 i 3 |
  | 0:50–1:20 | Podzielony ekran ze stoperem: nowy pomysł → plakietka i dźwięk w Centrali → szkic AI → odpowiedź → autorka widzi status i wiadomość | 2 |
  | 1:20–2:05 | Pętla: biała plama → temat naboru → nabór z regulaminu → powiadomienie autorów → Pracownia (asystent, scenorys) → wniosek → testerzy → nowa innowacja → Janina dostaje „jest rozwiązanie” | 4 |
  | 2:05–2:25 | Gmina: profil powiatu → Krawiec (Strażnik) → plan i kwalifikowalność | — |
  | 2:25–2:45 | Dostępność: tryb prosty, A++, kontrast, czytanie, ukraiński, rozmowa głosowa; wynik testu z ludźmi | 1 |
  | 2:45–3:00 | Koszty, bezpieczeństwo, API i widżet, 7/7 modułów, hasło | — |

  Głos nagrywać w ciszy. Napisy wgrać w film. Mieścić się w limicie czasu.
- [ ] **M-07 Koszty i zasoby (P0).** Rozdz. 9 plus zasoby ludzkie:
  - kto w ROPS moderuje treści (Dział Innowacji Społecznych, np. 4–8 h tygodniowo);
  - kto odpowiada na zgłoszenia (według obszarów);
  - utrzymanie techniczne (pół etatu albo umowa serwisowa);
  - coroczny audyt WCAG i test bezpieczeństwa.
- [ ] **M-08 Dokumentacja (P1):**
  - README z sekcją „Jak ocenić w 5 minut”;
  - `docs/zaleznosci.md` z licencjami, także pośrednimi (B-18);
  - `docs/WDROZENIE.md`, `docs/raport-dostepnosci.md`;
  - aktualne zrzuty i wyniki pomiaru trafności.
- [ ] **M-09 Test z ludźmi (P0).**
  - 5 osób w różnym wieku: inni uczestnicy, wolontariusze, mentorzy ROPS przy stoisku; osoby 60+ i z niepełnosprawnością, jeśli chcą.
  - 3 zadania: zgłoś problem, znajdź rozwiązanie dla gminy, sprawdź status.
  - Mierzyć czas i sukces, zebrać 1 cytat od osoby.
  - Zgoda na nagranie, bez danych osobowych.
  - Pierwszą rundę zrobić dziś wieczorem, żeby w nocy zdążyć poprawić błędy, a krótką drugą rano do filmu.

---

## 9. Koszty policzone z pomiaru

**Pomiar** (Swatka, `claude-sonnet-5-5`, effort `medium`, 3.10.2026). Na jedno dopasowanie:

- ok. **43 259 tokenów odczytu z cache** (instrukcja i katalog 115 innowacji);
- ok. **70 tokenów wejścia**;
- ok. **620 tokenów wyjścia** (średnia z 30 zapytań, razem z myśleniem).

**Cennik Anthropic** (stan na 25.09.2026), Sonnet 5.5, za 1 mln tokenów:

| Pozycja | Cena |
|---|---|
| Wejście | $2 |
| Wyjście | $10 |
| Odczyt z cache | $0,20 |
| Zapis do cache z TTL 1 h (2× cena wejścia) | $4 |

**Wyniki:**

- **Jedno dopasowanie przy ciepłym cache:** 43 259 × 0,20 + 70 × 2 + 620 × 10 (wszystko na 1 mln tokenów) ≈ $0,0087 + $0,0001 + $0,0062 ≈ **$0,015**. Przy kursie 3,7 zł za dolara (założenie z PLAN.md) to **ok. 5,5 gr**.
- **Zapis cache po wygaśnięciu:** 43 259 × $4 / 1 mln ≈ **$0,17 (ok. 64 gr)**, mniej więcej raz na godzinę ruchu.
- **Przykład miesięczny:** 5000 dopasowań (założenie z PLAN.md) to ok. $75. Zapisy cache przy ruchu 12 h dziennie to ok. 360 × $0,17 ≈ $62. Razem **ok. $137, czyli ok. 500 zł miesięcznie za Swatkę**.

**Pozostałe funkcje AI** (ocena zgłoszenia, Pracownia, Krawiec, wniosek, temat naboru, import, podsumowania) trzeba zmierzyć tak samo:

- zapisywać `usage` z `zapytajJson` dla każdej trasy (same liczby, bez treści);
- policzyć sumy skryptem `scripts/koszty.ts`;
- nie wpisywać do tabeli kosztów szacunków bez pomiaru.

**Dźwignie kosztów:**

- cache (już jest);
- wersje łatwe 115 innowacji generowane raz, nie przy każdym wejściu;
- `effort: low` dla prostych zadań (już jest);
- krótszy katalog w prompcie (np. bez pola „kto może wdrożyć” dla mieszkańców) — tylko po pomiarze wpływu na Hit@3.

**Tabela na slajd:**

- AI z pomiaru;
- hosting (sprawdzić aktualne cenniki Vercel i Supabase);
- e-mail i SMS;
- domena;
- utrzymanie;
- audyty raz w roku;
- wariant „model w polskiej infrastrukturze” (PLLuM, Bielik) jako koszt stały zamiast opłaty za tokeny.

---

## 10. Harmonogram do 11:00

| Godzina | Agent | Ludzie |
|---|---|---|
| 20:00–20:45 | P0: B-01, B-02, B-03, B-04, B-05, B-06, B-07 | Sprawdzić checkpoint HackYeah (20:00). Zapytać organizatorów o asystentów AI w kodzie (R-01). Umówić 5 osób do testu. |
| 20:45–21:30 | P0: W-50 i W-87 w minimum (pomysł z numerem, wątkiem i powiadomieniem); M-01 wdrożenie | Test z ludźmi, runda 1 (M-09), na wdrożonej wersji. Spisać problemy. |
| 21:30–01:30 | P1: W-11–W-14, W-21, W-22, W-24, W-31, W-34, W-36, W-37, W-44, W-52, W-53, W-64, W-71, W-72; B-09–B-14 | Sen albo makiety |
| 01:30–05:30 | P2 TOP 8: I-01–I-08 | Sen |
| 05:30–07:00 | I-13, I-14, I-15, I-21; regresja dostępności (axe, 320 px, klawiatura); nowe zrzuty | Makiety w Figmie (M-03) z pomocą agenta |
| 07:00–09:00 | Poprawki po teście, README, `docs/` | Test z ludźmi, runda 2 (krótko); nagranie filmu (M-06); slajdy (M-05) |
| **09:00** | **Zamrożenie kodu**, ostatnie wdrożenie, test w incognito | — |
| 09:00–10:00 | — | Montaż filmu, eksport PDF, opis (M-04) |
| **10:00–10:30** | — | **Oddanie na HackTribe** |
| 10:30–11:00 | — | Zapas |
| 11:00–16:00 | Przywrócić dane demo i rozgrzać cache przed finałem | Próba prezentacji na żywo, pytania Jury (rozdz. 13) |

Zasada: lepiej mniej funkcji bez ślepych zaułków niż więcej funkcji z błędami. Każde zadanie kończy się spełnionym DoD.

---

## 11. Ryzyka (R-xx)

| ID | Ryzyko | Zabezpieczenie |
|---|---|---|
| R-01 | Wzór umowy wymaga oświadczenia, że utwór „został wykonany osobiście” (PLAN 1a, pkt 6), a kod piszą asystenci AI | Zapytać dziś organizatorów, zapisać odpowiedź, w razie wątpliwości uczciwie opisać udział AI |
| R-02 | AI nie odpowiada albo jest wolne podczas pokazu | Tryb awaryjny bez AI (jest), rozgrzanie cache, zapisane odpowiedzi dla scenariusza filmu, film jako zapas |
| R-03 | Limity zapytań przy wspólnym IP Jury | B-05 |
| R-04 | Limit czasu funkcji serwerowych na hostingu | Sprawdzić plan; postęp lub strumieniowanie (B-10) |
| R-05 | Rozpoznawanie mowy w hałasie (Tauron Arena) | Na żywo wpisujemy tekst; głos w filmie nagrany w ciszy |
| R-06 | Ktoś psuje dane na publicznym demo | Admin tylko z hasłem, konta demo bez uprawnień admina, „Przywróć dane demo” |
| R-07 | Za dużo funkcji, za mało jakości | DoD dla każdego zadania, zamrożenie kodu o 9:00 |
| R-08 | Przesadne obietnice w materiałach | Rozdz. 12 |
| R-09 | Wiarygodność danych demo | Etykieta „dane demonstracyjne” wszędzie, gdzie są zgłoszenia |
| R-10 | Nieścisłość wokół „Usługi Wrażliwej” | B-07 |
| R-11 | Prywatność w adresie URL i w logach | B-02 |

---

## 12. Uczciwość: co mówimy, a czego nie

**Mówimy:**

- Tylko o tym, co działa w demo w dniu oddania. Resztę oznaczamy „w planie”.
- Liczby z kontekstem, np. „Hit@3 96,6% na 29 zapytaniach (zestaw własny, oparty na personach ROPS)”. Po B-01 podajemy nowy wynik.
- „Powiadomienia e-mail i SMS są symulowane (podgląd w skrzynce nadawczej).”
- „Zgłoszenia w demo to dane syntetyczne.”
- „Maskujemy PESEL, telefony, e-maile, adresy, numery kont i dokumentów. Imiona i nazwiska dodatkowo usuwa AI przed zapisem.” Tak mówimy dopiero po B-03.
- „Ocena pomysłu według karty IWS to pomoc, a nie decyzja komisji.”
- „Plan wdrożenia to szkic na zasadach naboru 2025/2026.”
- Treści AI oznaczamy zgodnie z AI Act art. 50.

**Nie mówimy, dopóki nie jest prawdą:**

- „Lighthouse 100”;
- „PL/UA/EN”;
- „test z seniorem”;
- „czas rzeczywisty” (dziś to odpytywanie co 3–4 s, co wystarczy, ale nazywajmy to uczciwie).

---

## 13. Pytania Jury: nowe odpowiedzi

- **Skąd wiecie, że to działa dla seniorów?** Z testu z ludźmi: X z Y osób wykonało zadanie samodzielnie, średnio w Z s. Do tego WCAG 2.1 AA z testami ręcznymi i czytnikiem ekranu.
- **Co, jeśli AI się pomyli albo nie odpowie?**
  - AI wybiera tylko z katalogu ROPS i uzasadnia wybór.
  - Publiczne odpowiedzi zatwierdza człowiek.
  - Bez AI działa wyszukiwanie awaryjne: Hit@3 79%.
  - Kryzys wykrywamy regułami, bez AI.
- **Czy dane mieszkańców trafiają do zewnętrznej firmy?**
  - Przed AI maskujemy dane osobowe, a baza stoi w UE.
  - Warstwa `lib/ai.ts` pozwala podmienić model na działający w polskiej infrastrukturze (PLLuM, Bielik).
  - Przed wdrożeniem zrobimy ocenę skutków (DPIA) i podpiszemy umowę powierzenia.
- **Ile to kosztuje?** Dopasowanie kosztuje ok. 5,5 gr (pomiar). Swatka przy 5000 dopasowań miesięcznie to ok. 500 zł. Do tego dochodzi hosting i utrzymanie (rozdz. 9).
- **Czym to się różni od katalogu, np. innowacjespoleczne.pl?** Splot jest pętlą: potrzeba, rozwiązanie albo nabór, test, wdrożenie, a na końcu powrót do ludzi, którzy czekali (I-02). Do tego ciche potrzeby w Radarze.
- **Czy to zastąpi Webankietę?** Tak. Generator ma formularz dopasowany do każdego naboru (I-08), sprawdza wniosek według karty i daje eksport do bazy grantowej.
- **Jak eksperci dostają pytania?** AI przydziela pytania według obszaru. Ekspert ma swoją kolejkę i odpowiada, a autor widzi odpowiedź pod swoim numerem (I-10).
- **Jak to wdrożyć w gminie?** Przez profil powiatu i Krawca: plan z danymi IOSS, budżet, harmonogram i kwalifikowalność (I-03, I-13). Widżet można wkleić na stronę gminy lub OPS (I-14).

---

## 14. Lista kontrolna oddania

- [ ] Link do demo działa w incognito na telefonie i laptopie. Hasło do Centrali jest w opisie, konta demo działają.
- [ ] PDF ma najwyżej 10 slajdów i jest po polsku.
- [ ] MP4 trwa najwyżej 3:00, jest po polsku i ma napisy.
- [ ] Makiety: link do Figmy (dostęp przez link) i pliki PNG.
- [ ] Opis rozwiązania, koszt utrzymania i potrzebne zasoby.
- [ ] Mapa zgodności (slajd 5): wszystkie W-xx mają ✅.
- [ ] axe nie zgłasza błędów na żadnej stronie; przy 320 px nic nie przewija się w poziomie; testy klawiatury i czytnika są w raporcie.
- [ ] W repozytorium nie ma sekretów, `.env.local` jest poza gitem, `SESSION_SECRET` jest ustawiony na hostingu.
- [ ] Nie ma prawdziwych danych osobowych, a dane demo są oznaczone.
- [ ] `docs/zaleznosci.md` zawiera licencje, także pośrednie.
- [ ] Repozytorium jest prywatne; film i kod nie są publikowane (umowa).
- [ ] Zrzuty w `docs/zrzuty` są aktualne.
- [ ] Przed oceną i przed finałem dane demo są przywrócone, a cache rozgrzany.
- [ ] Odpowiedź organizatorów w sprawie asystentów AI jest zapisana (R-01).

---

## Załącznik A: wyniki testów

**A.1 axe-core (WCAG 2.0/2.1 A i AA), 3.10.2026 ok. 19:30, wersja `2c2406d` na `localhost:3000`:**

| Tryb | Strony | Naruszenia |
|---|---|---|
| zwykły, 1280 px | 16 (11 publicznych + 5 Centrali) | 0 |
| wysoki kontrast | 11 publicznych | 0 |
| bardzo duży tekst + tryb prosty | 11 publicznych | 0 |
| telefon, 320 px | 16 | 0 |

**A.2 Szerokość 320 px:** poziome przewijanie na stronach `/` (324 px), `/wiedza/biblioteka` (417 px), `/wiedza/biblioteka/straznik` (328 px), `/wiedza/malopolska` (550 px), `/rynek` (336 px) i `/centrala/radar` (333 px).

**A.3 Pomiar trafności Swatki** (`docs/eval/`):

| Tryb | Hit@3 | Hit@5 | MRR | Średni czas |
|---|---|---|---|---|
| z AI (Sonnet 5.5) | 96,6% (28/29) | 96,6% | 0,966 | 5,1 s |
| bez AI (wyszukiwanie awaryjne) | 79,3% | 82,8% | 0,76 | 0,05 s |

Błędy wersji z AI:

- q11 („syn zamknął się w sobie”) zwraca brak wyników ≥ 55;
- q30 (przypadek bez rozwiązania) zwraca dopasowanie zamiast „brak”.

**A.4 Zapytania na żywo do Swatki:**

| Zapytanie | Wynik | Czas | Uwagi |
|---|---|---|---|
| „głusi alarm pożarowy” | Strażnik, 92/100 | 4,6 s | „podobne przypadki” pokazały 39 z całego obszaru |
| „Mój syn zamknął się w sobie i całe dni siedzi przy komputerze.” | „brak dopasowania”, najbliższe „Bez presji z depresji” 50/100 | 4,6 s | pytanie doprecyzowujące |

**A.5 Maskowanie (`zamaskuj`):**

| Zdanie | Wynik |
|---|---|
| „Moja córka Ania Nowak ma depresję, mieszkamy w Wolbromiu przy ul. Krakowskiej 5, tel. 600 100 200.” | zamaskowany tylko adres; telefon i imię z nazwiskiem zostały |
| „Nazywam się Jan Kowalski, PESEL 85010112345.” | zamaskowany tylko PESEL |
| „Opiekuję się mamą, Haliną Wiśniewską, która ma 82 lata.” | nic nie zamaskowano |

**A.6 Licencje w `node_modules`:**

| Licencja | Pakiety |
|---|---|
| MIT | 440 |
| Apache-2.0 | 29 |
| ISC | 21 |
| BSD | 10 |
| MPL-2.0 | 6 (axe-core, @axe-core/playwright, lightningcss ×3, @vercel/og) |
| LGPL-3.0-or-later | 2 (libvips przez sharp) |
| pozostałe (CC0, Unlicense, 0BSD, BlueOak, Python-2.0, CC-BY-4.0) | po 1 |

---

## Załącznik B: szkic opisu do HackTribe

> Zostawić tylko to, co działa w dniu oddania. Poniżej wersja docelowa.

**Splot – cyfrowe serce Małopolskiego Hubu Innowacji Społecznych**

Mieszkanka, gmina albo organizacja opisuje problem własnymi słowami, pisząc lub mówiąc. Asystent AI rozplątuje sytuację na konkretne potrzeby. Do każdej dobiera sprawdzone innowacje ze 115 pozycji Biblioteki ROPS i wyjaśnia, dlaczego pasują. Gdy rozwiązania nie ma, potrzeba trafia na Radar białych plam, a ROPS jednym kliknięciem robi z niej temat naboru.

Splot prowadzi dalej:

- od pomysłu: fiszka, kanwa INNO AGH, wstępna ocena według karty IWS 2.0, wniosek dopasowany do naboru;
- przez testy z udziałem osób, które zgłosiły problem;
- po plan wdrożenia w gminie z danymi Obserwatora Statystyk Społecznych.

Nowa innowacja sama odnajduje ludzi i gminy, które na nią czekały. ROPS widzi wszystko w jednym panelu: zgłoszenia z terminami odpowiedzi, trendy, ciche potrzeby i nabory.

Wszystko w siedmiu modułach, zgodnie z WCAG 2.1 AA. Jest tryb prosty, rozmowa głosowa, tekst łatwy do czytania i wersja ukraińska. Dane osobowe maskujemy przed AI, a baza działa w UE. Jedno dopasowanie kosztuje ok. 5,5 gr.
