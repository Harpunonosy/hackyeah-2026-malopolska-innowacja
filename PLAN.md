# Splot – cyfrowe serce HubMI

**HackYeah 2026 · zadanie „HubMI.pl” (Województwo Małopolskie / ROPS Kraków)**
Dokument roboczy zespołu: pomysł, dane, specyfikacja, architektura i plan działania. Jedno źródło prawdy dla wszystkich.

> **Splot łączy każdą potrzebę zgłoszoną w Małopolsce ze sprawdzoną innowacją i z instytucją, która może ją wdrożyć. Gdy rozwiązania nie ma, potrzeba staje się białą plamą na mapie regionu, a ROPS dostaje gotowy temat następnego naboru.**

---

## Spis treści

1. [Najważniejsze terminy i zasady konkursu](#1-najważniejsze-terminy-i-zasady-konkursu)
2. [Wyzwanie w skrócie (co dokładnie trzeba zrobić)](#2-wyzwanie-w-skrócie)
3. [Strategia na 90%+ (mapa punktów)](#3-strategia-na-90-mapa-punktów)
4. [Koncepcja: Splot](#4-koncepcja-splot)
5. [Dane i źródła (co mamy i jak tego używamy)](#5-dane-i-źródła)
6. [Moduły: specyfikacja funkcjonalna](#6-moduły-specyfikacja-funkcjonalna)
7. [Silnik dopasowania (Swatka) krok po kroku](#7-silnik-dopasowania-swatka)
8. [Radar: białe plamy i ciche potrzeby](#8-radar-białe-plamy-i-ciche-potrzeby)
9. [Komunikacja i powiadomienia](#9-komunikacja-i-powiadomienia)
10. [Dostępność (WCAG 2.1 AA i więcej)](#10-dostępność)
11. [Architektura techniczna](#11-architektura-techniczna)
12. [Model danych (SQL)](#12-model-danych-sql)
13. [API](#13-api)
14. [AI: zasady, modele, prompty](#14-ai-zasady-modele-prompty)
15. [Bezpieczeństwo, RODO, AI Act](#15-bezpieczeństwo-rodo-ai-act)
16. [Koszty utrzymania](#16-koszty-utrzymania)
17. [UI/UX i marka](#17-uiux-i-marka)
18. [Demo, film, prezentacja, pytania Jury](#18-demo-film-prezentacja-pytania-jury)
19. [Plan działania do 11:00](#19-plan-działania-do-1100)
20. [Priorytety i definicja „gotowe”](#20-priorytety-i-definicja-gotowe)
21. [Ryzyka i zabezpieczenia](#21-ryzyka-i-zabezpieczenia)
22. [Checklista oddania](#22-checklista-oddania)
23. [Słownik pojęć](#23-słownik-pojęć)
24. [Źródła](#24-źródła)

---

## 1. Najważniejsze terminy i zasady konkursu

| Co | Kiedy / jak |
|---|---|
| Start zadania | sobota 3.10.2026, 11:00 |
| **Checkpoint projektu (HackYeah)** | **sobota 20:00** |
| **Oddanie rozwiązania (HackTribe)** | **niedziela 4.10.2026, do 11:00** (spóźnione nie są oceniane) |
| Ogłoszenie finalistów | niedziela 15:00 |
| Finałowe prezentacje | niedziela 16:00 (po polsku, przed Jury) |
| Wyniki | niedziela ok. 17:45 |
| Nagrody | 6000 / 5000 / 4000 zł |
| Zespół | do 6 osób, tylko stacjonarnie (Tauron Arena) |
| Jury | głównie przedstawiciele Województwa Małopolskiego (ROPS) + Organizator |

**Co musi być w zgłoszeniu (regulamin, §4 ust. 9), wszystko po polsku, przez HackTribe:**
- tytuł projektu, identyfikator zespołu, opis projektu,
- **prezentacja PDF, maks. 10 slajdów**,
- **film MP4, maks. 3 minuty**.

Opcjonalnie: zrzuty ekranu, repozytorium kodu, link do demo, materiały graficzne.

Uwaga: opis wyzwania (PDF) mówi „PDF **lub** film”, ale regulamin mówi „PDF **oraz** film”. Regulamin wiąże, więc robimy **oba**.

**Opis wyzwania dodatkowo oczekuje:** nazwy i opisu rozwiązania, linku do działającego demo i makiet UX/UI oraz przewidywanego kosztu utrzymania z opisem potrzebnych zasobów.

**Ocena (każde kryterium w skali 1–10, wynik to średnia ważona):**

| Kryterium | Waga |
|---|---|
| Stopień spełnienia wyzwania: jakość kluczowych elementów i liczba dodatkowych funkcji (moduł obowiązkowy 10%, każdy kolejny +5%) | 40% |
| Potencjał wdrożeniowy: skalowalność, elastyczność, optymalizacja, efektywność kosztowa, prostota utrzymania | 20% |
| Dostępność i intuicyjność: dla każdego wieku i poziomu umiejętności cyfrowych, z myślą o WCAG 2.1 AA | 20% |
| Atrakcyjność, pomysłowość i jakość interfejsu (makiety UX/UI, nieszablonowość) | 10% |
| Jakość materiałów i MVP: jak komunikujemy koncepcję | 10% |

Próg laureata: 50%. Wszystkie 7 modułów daje maksimum w pierwszym kryterium: 10% + 6 × 5% = 40%.

**Jak Jury będzie testować (punkt 6 wyzwania):**
1. **Intuicyjność:** czy mieszkaniec w każdym wieku, bez przygotowania, wypełni moduły i znajdzie informacje.
2. **Szybkość komunikacji:** jak system powiadamia administratora o nowym pomyśle i jak wygląda ścieżka odpowiedzi do autora.
3. **Trafność dopasowania:** czy narzędzie skutecznie podpowiada istniejące innowacje na podstawie słów kluczowych z opisu potrzeby.
4. **Pomysłowość:** czy to tylko zbiór funkcji innych portali, czy nowa jakość.

Jury zwraca uwagę na: pomysłowość i atrakcyjność, łatwość zgłoszenia problemu, trafność, intuicyjność, jakość komunikacji między użytkownikami i możliwość rozwoju platformy.

**Prawa autorskie:** laureaci przenoszą prawa majątkowe na Organizatora i Województwo i przekazują kod źródłowy z listą bibliotek. Wniosek: tylko własny kod i biblioteki open source na licencjach MIT, Apache lub BSD; żadnych cudzych grafik bez licencji; lista zależności w README.

**Dane:** nie wolno używać prawdziwych danych osobowych ani wrażliwych z materiałów ROPS. W naszej kopii Biblioteki usunęliśmy imiona i nazwiska autorów, zostały tylko organizacje. Zgłoszenia w demo są syntetyczne.

### 1a. Korekty po ponownej lekturze regulaminu i umowy (3.10, ok. 17:00)

1. **Niepublikowanie.** Wzór umowy (§1 ust. 4 lit. b, §2 ust. 12) wymaga oświadczenia, że utwór „nie został dotychczas opublikowany, a jedynie udostępniony na potrzeby oceny”, a pierwsza publikacja należy do Organizatora. Repozytorium zostaje **prywatne**, demo ma `noindex` (meta, nagłówek `X-Robots-Tag`), kod i film nie idą publicznie.
2. **Wykaz narzędzi i bibliotek** z licencjami jest elementem umowy (§1), a kod ma być czytelny, bez szyfrowania i obfuskacji. Przed oddaniem generujemy `docs/zaleznosci.md`. Tylko MIT, Apache, BSD (fonty: SIL OFL).
3. **Trendy tylko dla administratora** (opis modułu II). Radar, wykresy i agregaty potrzeb są wyłącznie w Centrali, za hasłem. Publicznie zostaje zanonimizowane „podobne przypadki” pokazywane od 5 zgłoszeń wzwyż, bo Swatka ma „wyszukiwać podobne przypadki”.
4. **Integracja z bazą grantową:** eksport CSV/JSON wniosków i zgłoszeń, endpoint `/api/v1` tylko do odczytu i webhook przy nowym zgłoszeniu.
5. **Powiadomienia** obejmują też nowe pomysły (fiszki) i zmiany w naborach, nie tylko zgłoszenia problemów. Jedna magistrala zdarzeń.
6. **Narzędzia AI w kodowaniu:** umowa wymaga oświadczenia, że utwór „został wykonany osobiście”. Zespół sprawdza u organizatorów lub w regulaminie Hackathonu, czy asystenci AI do kodowania są dozwoleni.
7. **Oddanie:** regulamin (§4 ust. 9) wymaga PDF **oraz** filmu, wszystko po polsku.

### 1c. Stan implementacji i nowe decyzje (3–4.10.2026, noc)

**Wszystkie 7 modułów działa w kodzie.** Szczegółowy plan prac: `DROGA_DO_90.md`, lista zadań do zrobienia: `NEXT.md`. Ten rozdział nadpisuje starsze zapisy tam, gdzie się różnią.

- **Wspólny model „sprawy”.** Każde zgłoszenie to wiersz w `zgloszenia` z polem `typ` (`problem`, `pomysl`, `pytanie`, `wniosek`, `zapis`, `ogloszenie`, `wyzwanie`), numerem `SPL-XXXXXXXX`, wątkiem (`watki`/`wiadomosci`), terminem odpowiedzi i osią czasu (`historia_statusu`). Centrala ma jedną skrzynkę z filtrem typów i wskaźnikami (mediana czasu pierwszej odpowiedzi, odpowiedzi w terminie). Kod: `lib/sprawy.ts`, `lib/sprawy-etykiety.ts`.
- **Magistrala powiadomień** (`lib/powiadomienia.ts`, tabela `powiadomienia`): adresat `rops` (plakietka i dźwięk w Centrali) albo `autor` (po numerze sprawy w „Moje sprawy”). E-mail i SMS są symulowane i widoczne w skrzynce nadawczej (`/centrala/powiadomienia`). Zdarzenia: nowa sprawa, nowy pomysł, odpowiedź, zmiana naboru (otwarcie, termin, schemat, zamknięcie), nowe rozwiązanie dla zgłoszenia, zaproszenie do testu, odpowiedź na ogłoszenie.
- **Nabór „na miarę”** (`lib/nabor-schemat.ts`): AI wyciąga z regulaminu pola wniosku z limitami, kryteria z progami, limity i kategorie; pracownik edytuje; Pracownia generuje wniosek według schematu i ocenia go według kryteriów tego naboru. Domyślnie IWS 2.0.
- **Nici potrzeb (I-01):** Swatka rozdziela opis na 1–3 sprawy i dobiera rozwiązania do każdej (`nici` w schemacie AI), płaska lista `dopasowania` zostaje do pomiarów. Pomiar po zmianach: Hit@3 100% (29/29), 3.10.2026.
- **„Wdróż u siebie” tylko dla rzetelnych innowacji** (`czyWdrazalna` w `lib/swatka.ts`: wybrane do upowszechniania lub z naboru lub dodane w Centrali) i tylko dla roli „instytucja”. Krawiec sprawdza kategorie naboru Usługa Wrażliwa 2025/2026 (5 innowacji, nabór zamknięty, wykluczenia).
- **Odwrotne dopasowanie (I-02):** `lib/odwrotne.ts`, panel „Kogo ta innowacja może ucieszyć?” w Centrali/Treści; powiadomienie autorów zgłoszeń bez rozwiązania.
- **Panel eksperta** (`/ekspert`, `lib/ekspert.ts`): konta demo (wybór profilu + hasło demo), przydział pytań i pomysłów według obszaru lub ręcznie z Centrali, odpowiedzi z oznaczeniem nadawcy.
- **Rozmowy między użytkownikami** (`lib/rozmowy.ts`): galeria pomysłów (`/galeria`) i tablica partnerów; odpowiedź tworzy moderowaną rozmowę (kontakt ukryty, treść maskowana, ROPS widzi całość).
- **Próbownia:** ogłaszanie testów (AI pisze ogłoszenie), akceptacja przez ROPS, zaproszenia dla osób ze zgodą na testowanie z pasującego obszaru i powiatu.
- **Zasobnik wiedzy:** odtwarzacz filmów po kliknięciu (youtube-nocookie), filtry i porównywarka, edycja wszystkich kart z dziennikiem zmian (nadpisania `zrodlo='nadpisana'` w `innowacje`), Akademia (5 lekcji z tekstem łatwym i quizem), profile powiatów z danymi IOSS (`/wiedza/powiat/[slug]`), zgłaszanie wyzwań gmin (`wyzwanie`, trafia do Radaru).
- **Pracownia:** asystent (pytania, podpowiedzi do pól kanwy), scenorys 4 kadry, plakat A4 z kodem QR (pakiet `qrcode`, MIT), pełna kanwa INNO AGH (arkusze 2–3), tryb ręczny bez AI.
- **Dostępność:** panel „Jak wolisz korzystać?” (pierwsza wizyta), rozmowa głosowa (`/rozmowa`), wersja ukraińska ścieżki mieszkańca (`messages/uk.json`, brakujące klucze wracają do polskiego), test reflow 320 px (`scripts/szerokosc-320.ts`).
- **Prywatność:** opis problemu nie trafia do adresu URL (sessionStorage), maskowanie imion i nazwisk ze słownika, `SESSION_SECRET` obowiązkowy w produkcji (min. 16 znaków), limity zapytań ×5 (wspólne IP Jury), globalny limit godzinowy.
- **Jury i demo:** `/ocena` (4 testy Jury, moduły, konta demo), `/zaufanie` (karta systemu AI, prywatność, bezpieczeństwo), `/dostepnosc`, `/latwy`; `scripts/reset-demo.ts` i przycisk w Centrali przywracają dane demo.
- **Migracje:** `db/004`…`db/009` (sprawy, reakcje, ekspert, testy/galeria, rozmowy, dziennik). Seedy: `scripts/seed-galeria.ts`.
- **Niepublikowanie bez zmian:** repozytorium zostaje prywatne; regulamin §4 ust. 9 traktuje repozytorium jako opcjonalne.

### 1b. Decyzje techniczne z 3.10 (nadpisują dalsze rozdziały)

- Framework: **Next.js 16** (nie 15), React 19, Tailwind 4. Komponenty własne na pakiecie `radix-ui` (generator shadcn odrzucony: instalował nieznany pakiet `cn`).
- Model AI: **`claude-haiku-4-5`** od 3.10.2026 wieczorem (zmienna `AI_MODEL`). Pomiar: Hit@3 96,6% (28/29), tyle samo co na `claude-sonnet-5-5`, przy połowie ceny. Haiku nie przyjmuje parametru `effort` (`lib/ai.ts` go pomija).
- Katalog w prompcie Swatki ma ok. 43 tys. tokenów (pomiar 3.10) (nazwa, kategoria, „na czym polega”, problemy, odbiorcy, „kto może wdrożyć”), z cache 1 h.
- Baza w dev: lokalny Postgres w Dockerze, na demo Supabase (region UE). Ustawienia dostępności trzymane w cookie, więc serwer renderuje je bez migotania.
- Maskowanie: wyszukiwanie przechodzi maskowanie regex, a zapis zgłoszenia dodatkowo maskowanie imion i nazwisk przez AI (do zrobienia).
- Wynik bazowy wyszukiwania awaryjnego (bez AI) na 30 zapytaniach: Hit@3 79,3%, MRR 0,76 (`npx tsx scripts/eval-swatka.ts --lex`).

---

## 2. Wyzwanie w skrócie

ROPS Kraków od 10 lat inkubuje innowacje społeczne. Ma ich blisko 200 w portfolio, w tym 115 opisanych w internetowej Bibliotece. Brakuje miejsca, które łączy diagnozę problemów, rozwój pomysłów, testowanie, upowszechnianie i partnerstwa. Ma nim być Małopolski Hub Innowacji Społecznych, a my budujemy jego cyfrowe serce: platformę z AI.

**Siedem modułów z opisu wyzwania i nasze nazwy:**

| # | Moduł z wyzwania | Nasza nazwa | Najważniejsze wymagania z opisu |
|---|---|---|---|
| I | Matchmaking społeczny **(obowiązkowy)** | **Swatka** | użytkownik opisuje problem, a system wyszukuje podobne przypadki i informacje oraz proponuje gotowe innowacje |
| II | Zasobnik wiedzy | **Skarbnica** | kondycja Małopolski (raporty + Mapa Wyzwań), Biblioteka Innowacji w ciekawej formie (filmy), materiały edukacyjne; łatwe pozyskanie informacji; szybka aktualizacja danych; ciekawa i dostępna prezentacja; **agregacja potrzeb i trendy widoczne tylko dla administratora** |
| III | Kreator pomysłów | **Pracownia** | fiszka zawsze dostępna (krótki opis, istota, dla kogo, etap); **generator wniosków tylko w czasie naborów**, dopasowany do konkretnego naboru; materiały do prototypowania (**kanwy**); mile widziany asystent AI, który podpowiada, rozwija pomysł, proponuje nietuzinkowe rozwiązania i **wizualizuje** (np. przedmiot) |
| IV | Tester innowacji | **Próbownia** | zgłoszenie chęci udziału w testach, ocena istniejących rozwiązań, informacja zwrotna, propozycje usprawnień |
| V | Platforma aktywnej komunikacji | **Rynek** | bezpośredni dialog ROPS ↔ użytkownicy, szybkie pytania, wsparcie mentorów, partnerstwa międzysektorowe |
| VI | Panel administratora | **Centrala** | szybkie modyfikowanie, weryfikacja i udostępnianie wiedzy |
| VII | Middleman Innowacji | **Krawiec** | dostosowanie innowacji do formy usługi według potrzeb zgłaszającej się instytucji (asystent AI) |

**Użytkownicy końcowi:**
- **mieszkańcy i organizacje pozarządowe:** zgłaszają pomysły i problemy, chcą prostego interfejsu i sprawnej komunikacji;
- **samorządy (JST):** diagnozują wyzwania i szukają gotowych rozwiązań jak w katalogu;
- **pracownicy ROPS:** administrują, monitorują zgłoszenia i prowadzą dialog;
- **eksperci:** szybko dają feedback innowatorom i doradzają samorządom.

**Wymagania techniczne:** skalowalność na cały region, integracja z innymi systemami Hubu (np. bazą grantową), automatyczne powiadomienia o nowych pomysłach i zmianach w naborach, WCAG.

**Kontekst wdrożeniowy:** zwycięskie rozwiązanie może stać się fundamentem Hubu. ROPS planuje integrację z regionalną siecią liderów innowacji i obsługę grantów wdrożeniowych.

---

## 3. Strategia na 90%+ (mapa punktów)

| Kryterium | Waga | Czym bierzemy punkty | Cel |
|---|---|---|---|
| Spełnienie wyzwania | 40% | Wszystkie 7 modułów klikalne w demo i pokazane w filmie. Swatka na prawdziwych danych ROPS z uzasadnieniem „dlaczego pasuje” i zmierzoną trafnością (Hit@3 na 30 zapytaniach). Pełna pętla komunikacji pokazana na żywo. | 9,5 |
| Potencjał wdrożeniowy | 20% | Działa na danych i procesach ROPS (Biblioteka, Mapa Wyzwań, Obserwator, kanwa INNO AGH, karty oceny IWS, nabór „Usługa Wrażliwa”). Open source, hosting w Polsce lub UE, wymienny model AI (docelowo PLLuM lub Bielik). RODO, AI Act art. 50, tabela kosztów, skalowanie na 16 województw. | 9,5 |
| Dostępność i intuicyjność | 20% | Tryb prosty, głos, czytanie na głos, „Wyjaśnij prościej”, PL/UA/EN, wysoki kontrast, obsługa z klawiatury. axe bez błędów, Lighthouse 100, nagranie testu z seniorem. Tryb asystowany dla osób offline. | 9,5 |
| Atrakcyjność i pomysłowość UI | 10% | Spójna marka „Splot”, Mapa białych plam, kanwa z emotkami, śledzenie zgłoszenia jak paczki, makiety w Figmie. | 9 |
| Materiały i MVP | 10% | Mocne 10 slajdów, film 3 min z napisami, działający link, README, zrzuty ekranu. | 9,5 |

Średnia ważona: **9,45 / 10, czyli ok. 94%**. To cel, nie gwarancja.

**Trzy rzeczy, które mają wbić się Jury w pamięć:**
1. **Mapa białych plam i cichych potrzeb**, bo ROPS sam pisze, że diagnoza ma pokazywać „białe plamy na mapie dostępności”.
2. **Kanwa INNO AGH jako klikany kreator, oceniana według prawdziwej karty oceny ROPS.**
3. **Krawiec**, który z innowacji i danych gminy robi plan wdrożenia pod grant wdrożeniowy, a ROPS zapowiada „obsługę grantów wdrożeniowych”.

**Cytaty z publikacji ROPS, które otwierają prezentację:**
- „Nawet znakomita innowacja nie upowszechni się sama.” (Przewodnik po innowacjach społecznych, 2019) → Swatka, Krawiec, ambasadorzy.
- „Czasem znalezienie 5 osób, które chciałyby przetestować dane rozwiązanie, jest barierą nie do przejścia.” (tamże) → Próbownia.
- Opiekunowie rodzinni na pierwszym miejscu listy problemów wymieniają „brak informacji” i „sektorowość informacji” (diagnoza ROPS 2025, s. 31) → Skarbnica i Swatka.

---

## 4. Koncepcja: Splot

### 4.1 Nazwa i hasło
- **Splot** to splecione nici: ludzie, instytucje, pomysły. Kojarzy się też ze „splotem słonecznym”, czyli nerwowym centrum ciała, co pasuje do „cyfrowego serca Hubu” z opisu wyzwania.
- **Hasło:** „Splot – tu potrzeby Małopolan spotykają sprawdzone rozwiązania.” Nawiązuje do zdania z wyzwania o przestrzeni, w której spotykają się potrzeby, wiedza, doświadczenie i rozwiązania.
- Platforma działa pod adresem HubMI.pl. Nazwy modułów (Swatka, Skarbnica, Pracownia, Próbownia, Rynek, Centrala, Krawiec) służą do prezentacji. **W interfejsie używamy prostych etykiet**, np. „Mam problem”, „Mam pomysł”, „Chcę testować”.

### 4.2 Pętla, na której stoi pomysł

```
Mieszkaniec / gmina / NGO opisuje problem (tekst, głos, słowa kluczowe)
                         │
              SWATKA (dopasowanie przez AI)
           ┌─────────────┴──────────────┐
    jest rozwiązanie              brak rozwiązania
           │                            │
  KRAWIEC: plan wdrożenia       BIAŁA PLAMA na mapie w CENTRALI
  dla konkretnej gminy          → gotowy temat naboru grantowego
           │                            │
  PRÓBOWNIA: testerzy, opinie   PRACOWNIA: kanwa → wniosek
           └─────────────┬──────────────┘
          BIBLIOTEKA (nowe dowody „czy to działa?”)
                         │
     powiadomienie autorów dawnych zgłoszeń: „jest rozwiązanie”
```

- Pętla odpowiada sześciu etapom innowacji społecznej z modelu Nesta (diagnoza → pomysł → prototyp → utrwalenie → skalowanie → zmiana systemowa) i cyklowi ROPS (nabór → inkubacja → test → upowszechnianie).
- Łączy cztery strony z Przewodnika ROPS, czyli „poczwórną helisę”: administrację, naukę, biznes i mieszkańców.
- **Nowa jakość:** inne portale są katalogami, a Splot zamyka pętlę. Każde zgłoszenie albo dostaje rozwiązanie, albo zasila diagnozę i temat naboru.

### 4.3 Ścieżki czterech grup użytkowników

| Grupa | Wchodzi przez | Najważniejsze ekrany |
|---|---|---|
| Mieszkaniec (np. Janina, 73) | „Mam problem” | Swatka (głos), wyniki z „dlaczego pasuje”, „nie jest Pani sama”, wysłanie zgłoszenia, śledzenie statusu |
| Organizacja / innowator | „Mam pomysł” | Pracownia (fiszka, kanwa, ocena, wizualizacja), Próbownia (szukam testerów), Rynek (partnerzy) |
| Gmina, Centrum Usług Społecznych, ośrodek pomocy społecznej | „Szukam rozwiązania dla instytucji” | Swatka w trybie instytucji, Skarbnica (katalog, „Twoja gmina w liczbach”), Krawiec (plan wdrożenia, kwalifikowalność) |
| Pracownik ROPS | Centrala | skrzynka zgłoszeń z oceną AI, odpowiedzi, Radar (białe plamy, ciche potrzeby, trendy), treści, nabory |
| Ekspert | Rynek | kolejka pytań z jego dziedziny, komentarze przy polach kanwy, dyżury |

### 4.4 Persony do demo (z Mapy Wyzwań ROPS, plik `data/mapa_wyzwan.json`)
Janina 73 (seniorzy), Krystian 38 (niepełnosprawność), Tomek 60 (ubóstwo), Swietłana 37 (cudzoziemcy), Stanisław 56 (zdrowie, opiekun rodzinny), Mateusz 17 i Karina 41 (zdrowie psychiczne), Kuba 22 (bezdomność), Ania i Staś (piecza zastępcza). Persony są fikcyjne, więc wolno ich używać. Jury rozpozna własne persony.

---

## 5. Dane i źródła

Wszystko leży w `data/`. Duże pliki PDF trzymamy poza gitem, w `~/Downloads/hubmi_dane/rops_dokumenty/`, a linki są w [rozdziale 24](#24-źródła).

| Plik | Zawartość | Do czego |
|---|---|---|
| `data/zrodla/biblioteka_innowacji_rops.json` / `.csv` | **115 innowacji** z Biblioteki ROPS (9 kategorii), pola ROPS + linki (film, folder, materiały) | baza Swatki, karty w Skarbnicy, Krawiec |
| `data/zrodla/ioss_powiaty.json` / `.csv` | Obserwator Statystyk (IOSS): **184 wskaźniki, 149 z danymi dla 22 powiatów**, w większości za 2024 r. (3278 wartości) | mapa „Kondycja Małopolski”, „Twoja gmina w liczbach”, ciche potrzeby |
| `data/mapa_wyzwan.json` | 8 obszarów wyzwań + 9 person | taksonomia potrzeb, demo, zestaw testowy |
| `data/kanwa_inno_agh.json` | pełny schemat 3 arkuszy kanwy INNO AGH (pola, skale, opcje) | kreator w Pracowni |
| `data/nabory_rops.json` | formularz IWS 2.0 (pola 1–12), karty oceny (5 + 3 kryteria), nabór „Usługa Wrażliwa” (parametry, warunki) | generator wniosków, wstępna ocena, kwalifikowalność w Krawcu |
| `data/kondycja_malopolski.json` | 20 kluczowych faktów z raportów ROPS, GUS i NIK, z numerami stron | Skarbnica, Radar, slajdy |
| `data/swatka_zestaw_testowy.json` | **30 zapytań testowych** (persony + słowa kluczowe + 1 przypadek bez rozwiązania) z oczekiwanymi innowacjami | pomiar trafności, liczba na slajd |

### 5.1 Biblioteka Innowacji Społecznych (ROPS)
- **Rozkład:** Dzieci, młodzież i rodzina 21 · Seniorzy 20 · Niepełnosprawność sensoryczna 20 · Osoby o ograniczonej mobilności 18 · Niepełnosprawność intelektualna 14 · Zdrowie i medycyna 9 · Cudzoziemcy 6 · Rynek pracy 5 · Kryzys bezdomności 2.
- **Pola każdej innowacji (6 punktów ROPS):** `na_czym_polega` (1. Na czym polega rozwiązanie?), `problem` (2. Jakich problemów dotyczy?), `grupa_docelowa` (3), `kto_moze_skorzystac` (4. Kto może skorzystać, czyli instytucje wdrażające), `czy_to_dziala` (5, dowody z testów), `autor_organizacja` (6, tylko organizacje).
- **Pozostałe pola:** `upowszechniana_w_projekcie`, `film` (YouTube, 26 pozycji), `folder_pdf` (33), `materialy_zip` (115), `url`.
- **Wybrane do upowszechniania:** 27 innowacji (MIIS / IWS).
- **Słownictwo ROPS, którego trzymamy się w UI:** *odbiorcy* to ludzie, którym innowacja pomaga („grupa docelowa”); *użytkownicy* to instytucje, które ją wdrażają („kto może skorzystać”). Swatka dopasowuje po odbiorcach dla mieszkańców i po użytkownikach dla instytucji.
- **Przykłady:** Senior CUDER, BaWita, Merkury (symulator bankomatu i paczkomatu), Inteligentny organizer do leków, Organizator kompleksowej opieki w miejscu zamieszkania, Strażnik (alarmy dla osób głuchych), Himalaje autyzmu, Mój pomocny Virtual World (dzieci z Ukrainy), Agencja pracy incydentalnej, Szlakiem ludzi bezdomnych.
- **Innowacje w Małopolskich Modelach Usług Społecznych:** Senior Cuder, Ścieżka motosensoryczna, Organizator kompleksowej opieki, BaWita, Mobilne centrum pomocy, Centrum antydepresyjne, Terapeuta przestrzeni, Ścieżka treningu umysłu, Talerze zdrowia.

### 5.2 Mapa Wyzwań Społecznych (ROPS)
- **8 obszarów:** rodzina i piecza zastępcza, bezdomność, niepełnosprawność, ubóstwo, integracja cudzoziemców, zdrowie, zdrowie psychiczne, seniorzy.
- **Struktura każdego obszaru:** definicja, analiza danych zastanych, kluczowe wyzwania, persona (cele, wyzwania, motywacje), raporty do doczytania. Dane w Mapie są ogólnopolskie.
- **Każda potrzeba w Splocie dostaje jeden z 8 obszarów.** To nasza taksonomia (pole `obszar`). Formularz IWS i karta oceny pytają wprost o zgodność z Mapą Wyzwań, a my liczymy ją automatycznie.

### 5.3 Internetowy Obserwator Statystyk Społecznych (IOSS)
- **Co to jest:** portal ROPS i WUP. Ok. 184 wskaźniki dla gmin, powiatów, województwa i kraju, od 2007 r. Źródła: GUS BDL, oceny zasobów pomocy społecznej, sprawozdania MRPiPS i inne.
- **Kategorie:** ludność, gospodarstwa domowe, rodzina, pomoc społeczna (kadra, powody korzystania, beneficjenci, świadczenia, infrastruktura), piecza zastępcza, zdrowie, niepełnosprawność, wynagrodzenia i emerytury, kultura, edukacja, rynek pracy, mobilność, budżety gmin.
- **Jak pobraliśmy dane:** strona `https://obserwator.rops.krakow.pl/differenceanalysis/<id>` ma w kodzie tablice JS `myChartLabelsmyChart0` (nazwy 22 powiatów) i `myChartValuesmyChart0` (wartości) dla domyślnego, najnowszego roku. Pobiera je skrypt `scripts/scrape_ioss.py` (zapisuje do `data/zrodla/`), a Bibliotekę pobiera `scripts/scrape_biblioteka.py`.
- **Dane gminne:** dostępne przez „Portret gminy” (`/portrait/...`, eksport XLS) i przez endpointy `portraitcommune/FindData/commune/...`. Na hackathon wystarczą powiaty.
- **Najważniejsze wskaźniki (id → nazwa):**
  - ludność: `186` ludność ogółem, `285` 65+ / współczynnik starości, `257` ludność 60+, `273` wskaźnik podwójnego starzenia, `268` potencjał pielęgnacyjny, `274` wskaźnik wsparcia osób najstarszych;
  - pomoc społeczna, kadra: `27` mieszkańcy na 1 pracownika socjalnego;
  - powody korzystania z pomocy: `31` ubóstwo, `32` bezrobocie, `34` bezdomność, `36` przemoc domowa, `37` niepełnosprawność, `38` bezradność opiekuńczo-wychowawcza, `39` długotrwała choroba, `40` alkoholizm, `41` narkomania, `42` sytuacja kryzysowa;
  - beneficjenci i świadczenia: `17` beneficjenci pomocy społecznej, `175` dożywianie na 1000 mieszkańców, `227` osoby korzystające z usług opiekuńczych, `228` specjalistyczne usługi dla osób z zaburzeniami psychicznymi;
  - infrastruktura: `241` DPS, `245` dzienne domy pomocy, `243` ośrodki interwencji kryzysowej, `244` środowiskowe domy samopomocy, `247` noclegownie i schroniska, `249` placówki wsparcia dziennego, `250` mieszkania treningowe i wspomagane, `253` uniwersytety trzeciego wieku (2021), `254` CIS, `255` KIS, `252` ZAZ;
  - piecza zastępcza: `258` stopień deinstytucjonalizacji, `259` intensywność, `29` rodziny zastępcze;
  - pozostałe: `215` odsetek osób z niepełnosprawnościami, `25` stopa bezrobocia, `65` wynagrodzenie względem średniej krajowej, `97` wydatki gmin na pomoc społeczną, `2` dostępność aptek, `18` dostępność szpitali, `99` saldo migracji zagranicznych.
- **Przykłady z danych (2024):**
  - 65+: najwięcej Tarnów 24,83%, olkuski 23,56%, miechowski 23,51%; najmniej limanowski 15,07%;
  - dzienne domy pomocy: nowotarski 0;
  - uniwersytety trzeciego wieku (2021): tarnowski 0.
- **Uwaga:** jednostki wskaźników bywają różne (liczba, %, na 1000). Przed liczeniem sprawdźcie opis na stronie wskaźnika i normalizujcie przez `186` (ludność ogółem).

### 5.4 Raporty ROPS (najważniejsze dla nas)
Lista: https://rops.krakow.pl/badania-analizy-raporty/raporty-z-badan (ok. 30 raportów z lat 2014–2026, część na licencji CC BY 4.0).

- **Diagnoza 2025 „Usługi społeczne w Małopolsce – deficyty, potrzeby, potencjał rozwojowy. Zaktualizowane wnioski”** (38 s., CC BY 4.0, dane za 2024). To nasz główny materiał do „Kondycji Małopolski”. Fakty z numerami stron są w `data/kondycja_malopolski.json`:
  - diagnoza ma pokazywać „białe plamy na mapie dostępności” (s. 5);
  - 841,5 tys. osób 60+ (24,5%), w tym 147 tys. osób 80+ (s. 25);
  - 15 gmin bez własnych usług opiekuńczych; w połowie gmin brak usług opiekuńczych dla osób z zaburzeniami psychicznymi; nakłady na usługi opiekuńcze wzrosły o 88% bez znaczącego wzrostu dostępności (s. 26);
  - **w 93 gminach (ponad połowie) nie ma ani dziennego domu pomocy, ani klubu samopomocy w sektorze publicznym**; w 142 gminach brak publicznego dziennego domu pomocy (s. 28);
  - opiekunowie rodzinni: na pierwszym miejscu listy problemów „brak informacji” i „sektorowość informacji” (s. 31);
  - 84 gminy bez publicznych placówek wsparcia dziennego dla dzieci (s. 8).
- **Pozostałe przydatne raporty:** 2026 „Wyzwania i potrzeby sektora opiekuńczego”; 2025 „Domy pomocy społecznej wobec wyzwań deinstytucjonalizacji”; 2025 „Mieszkania wspomagane i treningowe”; 2024 „Piecza zastępcza w Małopolsce”; 2023 „Diagnoza potrzeb… Rodzinna Małopolska 2030”; monitoringi współpracy JST z ekonomią społeczną.
- **Format linków:** `https://rops.krakow.pl/pliki-do-pobrania/wpis,<slug>,<id>`, a pod tym adresem jest od razu plik PDF.

### 5.5 Publikacje ROPS ze świata innowacji
- „Przewodnik po innowacjach społecznych” (2019, Małopolski Inkubator Innowacji Społecznych). Opisuje, czy i jak administracja może inkubować innowacje: poczwórna helisa, teoria zmiany, etapy, „upowszechnianie zamiast zakończenia”. Stąd cytaty z rozdziału 3.
- „Połącz kropki, czyli o sile innowacji społecznych w obszarze włączenia społecznego” (2023, IWS), z 9 wybranymi innowacjami.
- „Innowacje społeczne dla dostępności” (2022, Inkubator Dostępności).
- „Guide to social innovations” (EN, 2019).
- Te publikacje trafiają do Skarbnicy jako materiały edukacyjne. Można je też dać do pytań z odpowiedzią opartą na treści i cytatem.

### 5.6 Kanwa INNO AGH (Social Innovation Canvas)
Wersja 1.0 z 5 maja 2026, oparta na Social Innovation Canvas The New Global School. ROPS udostępnił ją uczestnikom HackYeah. Pełny schemat jest w `data/kanwa_inno_agh.json`.

- **Arkusz 1:**
  - PROBLEM: intensywność, częstotliwość i skala, każda na skali 1–4 (z emotkami);
  - AKTORZY ZMIANY: kto wspiera, kto utrudnia, z pytaniami pomocniczymi;
  - ROZWIĄZANIE: przystępność i wartość, gotowość (pomysł / prototyp / przetestowane / gotowe), prostota;
  - STRUKTURA KOSZTÓW: koszty stałe i zmienne (pola wyboru).
- **Arkusz 2:**
  - ODBIORCY: główny użytkownik, klient lub płatnik, decydent;
  - ŹRÓDŁA DOCHODÓW: główny dochód, skalowanie;
  - PROPOZYCJA WARTOŚCI: emocjonalna i funkcjonalna, po 2–3 wybory.
- **Arkusz 3:**
  - KANAŁY: bezpośrednie, pośrednie, dodatkowe;
  - KONSTELACJA PARTNERÓW: jak taniej, jak dotrzeć, jak dać lepszą wartość; statusy: potwierdzony, w rozmowie, potencjalny;
  - WPŁYW: osoba, społeczność, środowisko, każdy na skali od małego do silnego.
- **Dlaczego to złoto dla dostępności:** prawie wszystko to skale i pola wyboru, więc da się to wyklikać bez pisania.
- **Nasz dodatek, wskaźnik dojrzałości:**
  - problem 3–12 (intensywność + częstotliwość + skala);
  - rozwiązanie 3–12 (przystępność + gotowość + prostota);
  - trwałość 2–8 (główny dochód + skalowanie dochodu);
  - wpływ 3–12 (osoba + społeczność + środowisko).

### 5.7 Nabory i kryteria ROPS (`data/nabory_rops.json`)
- **IWS 2.0 (inkubacja pomysłów):**
  - formularz ma pola 1–12: tytuł, dane, opis, innowacyjność, diagnoza z odniesieniem do Mapy Wyzwań, odbiorcy, zmiana, wizja, plan i koszty (przygotowanie do 3 mies., test do 9 mies.), kwota, zespół, oświadczenia (m.in. **niepowielanie istniejących innowacji**);
  - dziś składa się go przez Webankietę i PDF-y.
- **Karta oceny merytorycznej IWS 2.0:**
  - **5 kryteriów po 0–10 pkt:** innowacyjność, adekwatność (w tym zgodność z Mapą Wyzwań), efektywność kosztowa, uniwersalność, wizja rozwoju;
  - progi: min. 21 z 50 pkt, innowacyjność co najmniej 5, pozostałe co najmniej 4;
  - część B (pitching) to 3 kryteria po 0–5 pkt, min. 3 w każdym: koncepcja testowania, potencjał wnioskodawcy, zgodność z deinstytucjonalizacją.
- **„Usługa Wrażliwa”** (FEM 2021–2027, działanie 6.23), czyli granty wdrożeniowe:
  - do 600 tys. zł, 100% kosztów, bez wkładu własnego;
  - wdrożenie do 18 mies., przygotowanie do 6 mies.;
  - ścieżka: ramowy plan wdrożenia innowacji (RPWI) → indywidualny plan wdrożenia (IPWI) → umowa;
  - warunki: siedziba w Małopolsce, co najmniej 3 lata doświadczenia, brak zaległości i podwójnego finansowania itd.

### 5.8 Kontekst zewnętrzny (do slajdów i uzasadnień)
- **NIK (2025):** ok. 3,8 mln Polaków wykluczonych cyfrowo, w 80% osoby w wieku 55–74 lata; 15% nigdy nie korzystało z internetu. Stąd tryb asystowany i tryb prosty.
- **GUS:** udział osób 65+ w Małopolsce 17,0% (2019) → 21,6% (2030) → 25,1% (2040). Wskaźnik starości 105 → 198 (2040).
- **GUS (przez portal Cyfrowy Senior, 2026):** w 2024 r. 66,5% osób w wieku 60–74 lata korzysta z internetu (wobec 96% w wieku 16–59); z e-administracji korzysta tylko 34,2% z nich.
- **Nielsen Norman Group:** osoby 65+ korzystają ze stron o 43% wolniej; listy rozwijane i suwaki sprawiają im najwięcej kłopotu; przy problemach w 90% przypadków obwiniają siebie.
- **AI Act, art. 50 (od 2.08.2026):** trzeba informować, że rozmawia się z AI, i oznaczać treści wygenerowane przez AI. Dotyczy też instytucji publicznych.
- **PLLuM** (rządowy, HIVE AI / NASK) i **Bielik** (SpeakLeash / Cyfronet): polskie modele językowe z otwartymi wagami, część na licencji Apache 2.0. To docelowa opcja dla suwerenności danych.
- **Social Innovation Match (UE, ESF+):** europejska baza do transferu innowacji, przyszła integracja. **innowacjespoleczne.pl** (Fundacja Stocznia): ponad 150 polskich innowacji. Oba to katalogi, nie zamknięte pętle.
- **Telefony kryzysowe** (do komponentu bezpieczeństwa): **112** (alarmowy), **116 123** (Kryzysowy Telefon Zaufania dla dorosłych), **800 70 2222** (Centrum Wsparcia, całodobowo), **116 111** (dla dzieci i młodzieży).

---

## 6. Moduły: specyfikacja funkcjonalna

Każdy moduł ma opisany cel, ekrany, AI, dane, moment w demo i zakres MVP.

### 6.0 Ekran startowy: „Co chcesz zrobić?”
Duże kafelki (min. 48 px wysokości przycisków), każdy z ikoną i jednym zdaniem:
1. **Mam problem i szukam pomocy** → Swatka (tryb mieszkańca)
2. **Szukam rozwiązania dla mojej instytucji** → Swatka (tryb instytucji) → Krawiec
3. **Mam pomysł** → Pracownia
4. **Chcę testować nowe rozwiązania** → Próbownia
5. **Wiedza i inspiracje** → Skarbnica
6. **Zapytaj ROPS lub eksperta** → Rynek
7. **Moje sprawy** → status zgłoszeń i pomysłów

Górny pasek: **Tryb prosty**, rozmiar tekstu (A, A+, A++), kontrast, **Czytaj na głos**, język (PL, UA, EN), „Tekst łatwy do czytania”. Do demo dochodzi przełącznik ról („Zaloguj jako: Mieszkaniec / Gmina / Innowator / Ekspert / ROPS”).

### 6.1 Swatka – matchmaking (obowiązkowy)
- **Cel:** użytkownik opisuje problem własnymi słowami, głosem albo słowami kluczowymi i dostaje trafne innowacje z uzasadnieniem oraz podobne przypadki i informacje.
- **Ekrany:**
  1. **Pole opisu** z dużym przyciskiem mikrofonu i podpowiedzią („Np. Od śmierci męża rzadko wychodzę z domu…”). Opcjonalnie: „Kim jestem?” (mieszkaniec / instytucja / organizacja) i powiat lub gmina, wybierane bez listy rozwijanej (wyszukiwarka albo przyciski).
  2. **Wyniki (3–5 kart innowacji):** nazwa, jedno zdanie streszczenia, „Dlaczego pasuje” (2 zdania), „Czy to działa?” (cytat z pola ROPS), „Kto może to wdrożyć”, film, przyciski „To mi pomoże” / „To nie to” i „Wdroż u siebie” (instytucja).
  3. **Pod wynikami:**
     - „Nie jest Pani sama: 14 osób z powiatu olkuskiego zgłosiło podobny problem” (podobne zgłoszenia);
     - fakt z raportu ROPS z cytatem i stroną;
     - pasujący ekspert;
     - otwarty nabór, jeśli pasuje;
     - rozpoznane słowa kluczowe i obszar z Mapy Wyzwań jako chipy (przejrzystość dla Jury).
  4. **„Wyślij zgłoszenie do ROPS”:** zgoda na kontakt, wybór kanału (e-mail, SMS, telefon), podgląd przed wysłaniem (WCAG 3.3.4). Potem numer zgłoszenia i **śledzenie jak paczki**.
  5. **Brak dopasowania** (najlepszy wynik poniżej progu): „Nie znaleźliśmy jeszcze gotowego rozwiązania. Zgłoszenie trafi na mapę potrzeb Małopolski, a my damy znać, gdy coś się pojawi.” Zgłoszenie zasila Mapę białych plam.
- **Bezpieczeństwo:** gdy opis wskazuje na kryzys (myśli samobójcze, przemoc), od razu pokazujemy duży panel z numerami 112, 116 123, 800 70 2222 i 116 111, a zgłoszenie dostaje priorytet P0.
- **AI:** cały silnik jest opisany w [rozdziale 7](#7-silnik-dopasowania-swatka).
- **Demo:** Janina mówi do mikrofonu, dostaje wyniki, wysyła zgłoszenie i widzi jego status. Potem Jury wpisuje słowa kluczowe, np. „głusi alarm pożarowy” → Strażnik.
- **MVP:** tekst + głos (Web Speech API), dopasowanie po 115 innowacjach, karty z uzasadnieniem, podobne zgłoszenia, wysłanie zgłoszenia, status, panel kryzysowy.

### 6.2 Skarbnica – zasobnik wiedzy
- **Biblioteka:**
  - karty w rzędach według 9 kategorii (jak w serwisie z filmami), filtry: obszar, grupa docelowa, „kto może wdrożyć”, gotowość, z filmem, wybrane do upowszechniania;
  - strona innowacji: 6 pól ROPS, film z napisami i transkrypcją, materiały do pobrania, kontakt do organizacji przez Rynek, „Wdroż u siebie” → Krawiec, „Oceń / przetestuj” → Próbownia, „Podobne innowacje”.
- **Kondycja Małopolski:**
  - mapa 22 powiatów (kartogram) z wyborem wskaźnika IOSS według obszaru;
  - karta powiatu „W liczbach”;
  - kluczowe fakty z diagnozy 2025 (z cytatem i stroną);
  - „Zapytaj raporty”: pytanie, na które AI odpowiada tylko z treści raportów, z cytatem i numerem strony.
- **Mapa Wyzwań:** 8 obszarów z kluczowymi wyzwaniami i personami (karty z ilustracją).
- **Akademia:** publikacje ROPS, kanwa INNO AGH, krótkie lekcje („Czym jest innowacja społeczna”, „Jak przetestować pomysł”, „Deinstytucjonalizacja w 5 minut”).
- **Przy każdym tekście:** „Wyjaśnij prościej” (tekst łatwy do czytania, ETR) i „Czytaj na głos”.
- **Trendy potrzeb tylko dla administratora** (wymóg): zakładka widoczna dla roli ROPS, prowadzi do Radaru w Centrali.
- **Szybka aktualizacja:** w Centrali „Dodaj innowację z PDF lub linku”. AI wypełnia 6 pól, tagi i obszar, administrator poprawia i publikuje (2 minuty zamiast godziny).
- **MVP:** lista i strona innowacji, filtry, mapa z 3–5 wskaźnikami, fakty, „Wyjaśnij prościej”.

### 6.3 Pracownia – kreator pomysłów
- **Fiszka (zawsze dostępna):**
  - 4 pola z wyzwania: krótki opis, istota, dla kogo, etap realizacji (pomysł / prototyp / przetestowane / gotowe, jak w kanwie);
  - można powiedzieć wszystko głosem, a AI rozpisze to na pola.
- **Kanwa INNO AGH:**
  - 9 kroków, jedna sekcja na ekran (problem, aktorzy, rozwiązanie, koszty, odbiorcy, dochody, wartość, kanały, partnerzy i wpływ);
  - skale jako duże przyciski z emotką **i tekstem**, opcje jako pola wyboru;
  - **AI wstępnie wypełnia kanwę z opisu**, a użytkownik tylko potwierdza lub poprawia;
  - przy każdym polu jest przycisk „Nie wiem, pomóż”, który uruchamia asystenta z pytaniami pomocniczymi z kanwy.
- **Podsumowanie:**
  - **wskaźniki dojrzałości** (problem, rozwiązanie, trwałość, wpływ) jako 4 paski;
  - **„Czy to już istnieje?”:** 3 najbardziej podobne innowacje z Biblioteki z wyjaśnieniem różnic, bo formularz IWS wymaga oświadczenia o niepowielaniu;
  - **wstępna ocena według karty IWS 2.0:** 5 kryteriów po 0–10, progi 5 i 4, przy każdym konkretna wskazówka „co dopisać, żeby dostać więcej”, plus pytania o testowanie i deinstytucjonalizację z części B;
  - **wizualizacja:** obraz koncepcyjny przedmiotu, aplikacji lub sceny usługi, opisany jako wygenerowany przez AI (AI Act art. 50), z tekstem alternatywnym;
  - **„Adwokat diabła”:** 3 najtrudniejsze pytania od Jury lub komisji, na podstawie pola „kto utrudnia zmianę”;
  - **„Nietuzinkowe pomysły”:** 3 analogie z innych obszarów lub z Biblioteki („W obszarze niepełnosprawności wzroku zadziałało…”).
- **Generator wniosków (tylko w czasie naboru):**
  - administrator w Centrali otwiera nabór, wgrywa regulamin, a AI mapuje pola formularza i kryteria;
  - użytkownik klika „Przygotuj wniosek do naboru X” i dostaje pola 1–11 wypełnione z fiszki i kanwy, z licznikami znaków i oznaczeniem miejsc, gdzie AI zgadywało („uzupełnij: koszt działania”);
  - eksport PDF i DOCX, wysyłka do ROPS;
  - **każdy nabór ma własny schemat** (wymóg: „każdorazowo modyfikowany do konkretnego naboru”);
  - poza naborem przycisk jest wyszarzony z informacją: „Najbliższy nabór… powiadomimy Cię”.
- **Powiadomienia:** gdy nabór się otwiera, właściciele pasujących fiszek dostają wiadomość: „Twój pomysł pasuje do naboru, masz 30 dni”.
- **MVP:** fiszka, kanwa (co najmniej arkusz 1 i 2), wypełnianie z opisu, „czy to istnieje?”, wstępna ocena, generator dla przykładowego naboru. Wizualizacja jest opcjonalna.

### 6.4 Próbownia – tester innowacji
- **Zaproszenie do testu (innowator):**
  - pola: co testujemy, kogo szukamy (grupa, wiek, powiat), kiedy, gdzie lub online, ile osób, czas, dostosowania dostępności;
  - AI pisze ogłoszenie prostym językiem i podpowiada dopasowanych testerów.
- **Profil testera:**
  - grupa wiekowa, powiat, zainteresowania i obszary, potrzeby dostępności;
  - testerem może być osoba albo instytucja (np. klub seniora, ośrodek dziennego wsparcia).
- **Zapisy:** „Chcę wziąć udział”, potwierdzenie, przypomnienie.
- **Opinie:**
  - skala emotek 1–5 (z tekstem), 3 krótkie pytania („Co było najłatwiejsze? Co było trudne? Czy poleciłbyś?”);
  - nagranie głosowe zamieniane na tekst, propozycja usprawnienia;
  - można też **ocenić istniejące innowacje** z Biblioteki.
- **AI:** podsumowanie „co działa / co poprawić / cytaty”, wysyłane do innowatora. Po akceptacji administratora trafia do „Czy to działa?” w Bibliotece.
- **Argument:** ROPS pisze, że znalezienie 5 testerów bywa „barierą nie do przejścia”. W demo Próbownia zbiera 10 testerów w powiecie olkuskim.
- **MVP:** lista testów, zapisy, formularz opinii, podsumowanie AI.

### 6.5 Rynek – platforma aktywnej komunikacji
- **Wątki:** każde zgłoszenie, fiszka, innowacja i partnerstwo ma wątek. Wiadomości od ROPS, ekspertów i autora; odpowiedzi z pomocą AI są oznaczone.
- **Status zgłoszenia jak paczka:** oś czasu wysłane → przeczytane → w analizie / u eksperta → odpowiedź → zamknięte (szczegóły w [rozdziale 9](#9-komunikacja-i-powiadomienia)).
- **Zapytaj ROPS / Zapytaj eksperta:**
  - AI dobiera eksperta po obszarze i tagach;
  - eksperci mają kolejkę pytań z ich dziedziny, dyżury (np. „czwartek 10–12, online”) i mogą komentować konkretne pola kanwy w Pracowni.
- **Tablica „Szukam partnera”:**
  - ogłoszenia typu „jak taniej”, „jak dotrzeć do odbiorców”, „jak dać lepszą wartość” (z kanwy) plus obszar i powiat;
  - AI podpowiada pasujące organizacje, gminy, podmioty ekonomii społecznej i ekspertów (poczwórna helisa).
- **Ambasadorzy innowacji:** autorzy i pierwsi wdrażający jako zalążek „regionalnej sieci liderów innowacji”, którą zapowiada ROPS.
- **MVP:** wątki i wiadomości, oś czasu statusu, lista ekspertów z dopasowaniem, tablica partnerstw.

### 6.6 Centrala – panel administratora (ROPS)
- **Skrzynka zgłoszeń:**
  - lista z filtrami (status, obszar, powiat, priorytet, termin), nowe zgłoszenia pojawiają się **w czasie rzeczywistym** z dźwiękiem i plakietką;
  - **karta zgłoszenia:** treść zamaskowana, propozycje AI (obszar, tagi, priorytet, duplikaty, flaga kryzysu) do zatwierdzenia jednym kliknięciem, dopasowane innowacje;
  - **szkic odpowiedzi od AI** prostym językiem (przełącznik „wersja łatwa do czytania”); administrator poprawia i wysyła;
  - przypisanie do osoby (reguły według obszaru), licznik czasu na odpowiedź (domyślnie 3 dni robocze, P0 natychmiast), eskalacja po przekroczeniu terminu.
- **Radar** (szczegóły w [rozdziale 8](#8-radar-białe-plamy-i-ciche-potrzeby)): mapa powiatów z warstwami (zgłoszenia, białe plamy, ciche potrzeby, wskaźniki IOSS), trendy tygodniowe według obszaru, lista luk z przyciskiem **„Utwórz temat naboru”** (AI pisze szkic tematu z uzasadnieniem z danych).
- **Treści:**
  - innowacje: dodawanie z PDF lub linku z pomocą AI, edycja, przepływ szkic → weryfikacja → publikacja;
  - materiały i fakty.
- **Nabory:** tworzenie, otwieranie i zamykanie (to włącza i wyłącza generator wniosków), wgranie regulaminu, schemat formularza i kryteria, lista złożonych wniosków.
- **Użytkownicy, moderacja, dziennik zmian, ustawienia** (reguły przypisań, terminy).
- **Raport „Puls Małopolski”:** miesięczne podsumowanie potrzeb i luk do PDF dla kierownictwa i do diagnoz Centrów Usług Społecznych.
- **MVP:** skrzynka (odświeżanie co 5 s lub realtime), karta z oceną AI, szkic odpowiedzi, wysyłka, zmiana statusu, Radar z mapą i listą luk, dodawanie innowacji.

### 6.7 Krawiec – Middleman Innowacji
- **Wejście:** instytucja (gmina, CUS, ośrodek pomocy społecznej, DPS, organizacja pozarządowa, podmiot ekonomii społecznej, szkoła) wybiera innowację, z Biblioteki albo z wyników Swatki. Wypełnia krótki profil: typ, powiat i gmina, ilu odbiorców, orientacyjny budżet, kadra, partnerzy, lata doświadczenia, obszary.
- **AI składa szkic planu wdrożenia** (odpowiednik indywidualnego planu wdrożenia innowacji, IPWI):
  1. karta usługi: nazwa usługi, cel, odbiorcy, zakres, standard;
  2. uzasadnienie lokalne z danymi IOSS i faktami, np. „w powiecie X 23,6% to osoby 65+, 0 dziennych domów pomocy”;
  3. model realizacji: kroki, kadra, role partnerów;
  4. budżet orientacyjny według struktury kosztów z kanwy (stałe i zmienne), z założeniami;
  5. harmonogram: przygotowanie do 6 mies., wdrożenie do 18 mies. (tabela miesięcy);
  6. wskaźniki: produktu i rezultatu, np. „min. 50 odbiorców” jak w „Usłudze Wrażliwej”, plus wpływ z kanwy;
  7. ryzyka i działania zaradcze (z pola „kto utrudnia zmianę”);
  8. źródła finansowania: grant wdrożeniowy ROPS lub FEM, budżet gminy (zlecanie zadań publicznych), ekonomia społeczna, inne programy;
  9. **kwalifikowalność:** lista kontrolna z `data/nabory_rops.json` (siedziba w Małopolsce, co najmniej 3 lata doświadczenia, brak zaległości, brak podwójnego finansowania…) z wynikiem spełnia / nie spełnia / do sprawdzenia;
  10. kontakt z autorem innowacji (ambasadorem) przez Rynek.
- **Wyjście:** dokument na ekranie, eksport PDF i DOCX, wyraźna adnotacja „szkic przygotowany z pomocą AI, wymaga weryfikacji”.
- **Demo:** CUS w Olkuszu wybiera „Senior CUDER” → plan + kwalifikowalność w niecałą minutę.
- **MVP:** formularz profilu, generowanie planu, lista kwalifikowalności, eksport do PDF przez druk.

---

## 7. Silnik dopasowania (Swatka)

### 7.1 Przepływ
```
opis / głos / słowa kluczowe
  → [1] maskowanie danych osobowych (regex + AI)    → zapis tylko wersji zamaskowanej
  → [2] wykrycie kryzysu                              → panel z telefonami, priorytet P0
  → [3] zrozumienie potrzeby (AI, JSON): obszar (1 z 8), grupa docelowa, potrzeby, słowa kluczowe,
        przeformułowania (język potoczny → fachowy, np. „gubi się w lekach” → wielolekowość)
  → [4] kandydaci:
        a) wyszukiwanie słów (PostgreSQL pg_trgm / pełny tekst) po nazwie, problemie, grupie, rozwiązaniu → top 20
        b) semantyczne: MVP = cała Biblioteka (115 streszczeń, ok. 15 tys. tokenów) w cache'owanym kontekście modelu;
           produkcja = embeddingi (pgvector, np. BAAI/bge-m3 albo sdadas/mmlw-retrieval) → top 30
        c) połączenie list metodą Reciprocal Rank Fusion
  → [5] ranking i uzasadnienie (AI, JSON): trafność 0–100, „dlaczego pasuje”, „kto może wdrożyć”, cytat z „czy to działa?”
  → [6] dodatki: podobne zgłoszenia (obszar + tagi + powiat), fakt z raportu (obszar), ekspert, otwarty nabór
  → [7] próg: najlepszy wynik < 55 → „brak dopasowania” → biała plama
  → [8] opinia użytkownika (przydatne / nieprzydatne) → zapis do oceny jakości
```

### 7.2 Dlaczego tak (MVP)
- 115 innowacji mieści się w kontekście modelu, więc pełna lista z cache'owaniem promptu daje świetną trafność i prostą implementację.
- Wyszukiwanie słów jest **zabezpieczeniem**: gdy AI nie odpowie, nadal pokazujemy wyniki.
- Przy tysiącach innowacji (cały region, kolejne lata) przechodzimy na embeddingi. Architektura już to przewiduje.

### 7.3 Wynik (format JSON)
```json
{
  "obszar": "seniorzy",
  "grupa_docelowa": "osoba starsza mieszkająca samotnie",
  "potrzeby": ["samotność po stracie męża", "zarządzanie lekami"],
  "slowa_kluczowe": ["samotność", "wdowieństwo", "leki", "suplementy"],
  "kryzys": false,
  "dopasowania": [
    {
      "id": "inteligentny-organizer-do-lekow",
      "trafnosc": 88,
      "dlaczego": "Pomaga osobom starszym pamiętać o lekach i wspiera opiekunów, co odpowiada na problem z nadmiarem leków i suplementów.",
      "kto_moze_wdrozyc": "Opiekunowie rodzinni, ośrodki pomocy społecznej, usługi opiekuńcze",
      "dowod": "fragment pola „Czy to działa?” z Biblioteki"
    }
  ],
  "brak_dopasowania": false,
  "pytanie_doprecyzowujace": null
}
```

### 7.4 Ocena trafności (na slajd)
- **Zestaw:** `data/swatka_zestaw_testowy.json`, 30 zapytań. Każda z 9 person w dwóch wersjach (opis i same słowa kluczowe), 11 zapytań z samych słów kluczowych w stylu Jury i 1 przypadek bez rozwiązania.
- **Metryki:** Hit@3 (czy co najmniej jedna oczekiwana innowacja jest w pierwszej trójce), Hit@5, MRR i poprawne oznaczenie braku dopasowania.
- **Cel:** Hit@3 ≥ 85%. Wynik wpisujemy do prezentacji i README, np. „Trafność top 3: 90% na 30 zapytaniach opartych na personach ROPS”.
- **Skrypt:** `scripts/eval-swatka.ts` (do napisania). Przy zmianie promptów uruchamiamy go ponownie.

---

## 8. Radar: białe plamy i ciche potrzeby

### 8.1 Agregacja potrzeb (widoczna tylko dla administratora)
- Liczba zgłoszeń według powiatu, obszaru i tygodnia; trend: ostatnie 4 tygodnie wobec poprzednich 4 (w procentach).
- **Nowy trend:** tygodniowa liczba zgłoszeń w obszarze ma z-score > 2 względem średniej z 8 tygodni.
- Chmura najczęstszych tagów w obszarze („samotność”, „transport do lekarza”…).

### 8.2 Biała plama (potrzeba jest, rozwiązania nie ma)
- Liczona dla pary (powiat, obszar) na zgłoszeniach z `najlepsze_dopasowanie < 55`.
- `wynik_luki = liczba_takich_zgłoszeń × (1 − średnie_najlepsze_dopasowanie/100) × waga_obszaru`
- Lista top 10 luk zawiera opis wygenerowany przez AI z grupowania tagów, np. „samotność mężczyzn 60+ na wsi bez transportu”.
- **Przycisk „Utwórz temat naboru”:** AI pisze szkic tematu z uzasadnieniem (liczby zgłoszeń, wskaźniki IOSS, fakty z diagnozy) i z przykładowymi kierunkami. Szkic zapisuje się jako przykładowy nabór.

### 8.3 Cicha potrzeba (ryzyko wysokie, zgłoszeń brak)
- **Ryzyko** dla pary (powiat, obszar) to średnia z-score'ów wskaźników IOSS przypisanych do obszaru. Kierunek odwracamy tam, gdzie więcej znaczy lepiej, np. liczba dziennych domów pomocy.
- **Aktywność:** liczba zgłoszeń na 10 tys. mieszkańców (wskaźnik `186`).
- **Cicha potrzeba:** ryzyko (średni z-score) ≥ 0,5 przy aktywności ≤ połowy średniej regionalnej (zgłoszeń na 10 tys. mieszkańców w danym obszarze), gdy w obszarze jest co najmniej 20 zgłoszeń. Próg 0,5, a nie 1, bo uśrednianie wskaźników rozcieńcza z-score.
- **Podpowiedź działania:** „Uruchom zgłoszenia w trybie asystowanym przez ośrodki pomocy społecznej i kluby seniora w powiecie X”. To odpowiedź na wykluczenie cyfrowe.
- **Wskaźniki IOSS przypisane do obszarów:**

| Obszar | Wskaźniki (id) |
|---|---|
| seniorzy | 285 (65+), 273 (podwójne starzenie), 268 (potencjał pielęgnacyjny, odwrócony), 245 (dzienne domy pomocy, odwrócony, na mieszkańca), 227 (usługi opiekuńcze, odwrócony), 253 (uniwersytety trzeciego wieku, odwrócony) |
| niepelnosprawnosc | 215 (odsetek osób z niepełnosprawnościami), 37 (powód: niepełnosprawność), 244 (środowiskowe domy samopomocy, odwrócony), 252 (ZAZ, odwrócony) |
| ubostwo | 31 (powód: ubóstwo), 175 (dożywianie), 25 (bezrobocie), 65 (wynagrodzenia, odwrócony), 17 (beneficjenci) |
| bezdomnosc | 34 (powód: bezdomność), 247 (noclegownie i schroniska, odwrócony) |
| zdrowie_psychiczne | 42 (sytuacja kryzysowa), 40 (alkoholizm), 41 (narkomania), 243 (OIK, odwrócony), 228 (usługi dla osób z zaburzeniami psychicznymi, odwrócony) |
| rodzina_piecza | 38 (bezradność opiekuńczo-wychowawcza), 36 (przemoc domowa), 259 (intensywność pieczy), 258 (deinstytucjonalizacja pieczy, odwrócony), 249 (placówki wsparcia dziennego, odwrócony) |
| zdrowie | 39 (długotrwała choroba), 121 (zgony z chorób krążenia), 2 (apteki, odwrócony), 18 (szpitale, odwrócony) |
| cudzoziemcy | 99 (saldo migracji zagranicznych) + dane z raportów |

### 8.4 Dane do demo
- Zgłoszenia w demo są **syntetyczne**: skrypt `scripts/generate-synthetic.ts` tworzy ok. 250 zgłoszeń z ostatnich 6 miesięcy. Rozkład obszarów jest ważony wskaźnikami IOSS, np. więcej zgłoszeń seniorów w powiatach starszych.
- Celowo zostawiamy 1–2 powiaty z wysokim ryzykiem i małą liczbą zgłoszeń, żeby pokazać ciche potrzeby.
- W interfejsie dane mają etykietę „dane demonstracyjne”.

---

## 9. Komunikacja i powiadomienia

### 9.1 Statusy zgłoszenia
`wysłane` → `przeczytane` → `w analizie` / `u eksperta` / `potrzebne informacje` → `odpowiedź udzielona` → `zamknięte`.
Każda zmiana trafia do historii (`historia_statusu`) i jest widoczna dla autora jako oś czasu, jak przy śledzeniu paczki.

### 9.2 Ścieżka (pytanie Jury o szybkość komunikacji)
1. **0 s:** mieszkaniec wysyła zgłoszenie (formularz, głos lub tryb asystowany).
2. **ok. 1 s:** maskowanie danych, ocena AI (obszar, priorytet, duplikaty, kryzys), automatyczne przypisanie do osoby w ROPS według obszaru, termin odpowiedzi.
3. **ok. 2 s:** **powiadomienie w panelu w czasie rzeczywistym** (plakietka i dźwięk) + e-mail. Przy kryzysie dodatkowo SMS do osoby dyżurnej.
4. **minuty:** administrator otwiera kartę, widzi szkic odpowiedzi od AI, poprawia i wysyła.
5. Autor dostaje **e-mail lub SMS** (to, co wybrał) i widzi nowy status oraz odpowiedź w wątku.
6. Wątek trwa dalej, można dołączyć eksperta. Po zamknięciu autor ocenia pomoc (1–5).

W demo pokazujemy to na podzielonym ekranie w mniej niż 30 sekund.

### 9.3 Zdarzenia → powiadomienia

| Zdarzenie | Kto dostaje | Kanał |
|---|---|---|
| nowe zgłoszenie lub pomysł | przypisany pracownik ROPS | panel (realtime), e-mail; P0: SMS |
| zmiana statusu, nowa odpowiedź | autor | panel, e-mail lub SMS (wybór użytkownika) |
| przekroczony termin odpowiedzi | pracownik + kierownik | panel, e-mail |
| nowa innowacja pasująca do starego zgłoszenia (odwrotne dopasowanie) | autor zgłoszenia (jeśli się zgodził) | e-mail lub SMS |
| otwarcie naboru pasującego do fiszki | właściciel fiszki | e-mail, panel |
| zmiana w naborze (termin, regulamin) | osoby z wnioskami roboczymi | e-mail, panel |
| zaproszenie do testu | dopasowani testerzy | e-mail lub SMS |
| nowe pytanie w dziedzinie eksperta | ekspert | panel, e-mail |
| codzienne podsumowanie | zespół ROPS | e-mail |

W MVP e-mail i SMS są symulowane: log w panelu z podglądem treści. Integracja z bramką SMS i SMTP jest na mapie drogowej.

---

## 10. Dostępność

### 10.1 Zasady projektowe dla seniorów i osób z niskimi kompetencjami cyfrowymi
- **Tryb prosty:** jedno pytanie na ekran, duże przyciski (min. 48 × 48 px), bez list rozwijanych i suwaków, zawsze widoczne „Wstecz” i „Pomoc”, bez limitów czasu.
- Czcionka bazowa 18 px, powiększanie do A++ (ok. 24 px), interlinia 1,5, krótkie zdania, prosty język.
- **Głos wszędzie:** dyktowanie (Web Speech API w Chrome, `pl-PL`, a docelowo Whisper na własnym serwerze) i czytanie na głos (SpeechSynthesis).
- **„Wyjaśnij prościej”:** AI przepisuje tekst według zasad ETR (krótkie zdania, bez żargonu, jedna myśl na zdanie).
- **Języki:** PL, UA, EN (`next-intl`; treści dynamiczne tłumaczy AI). W Krakowie mieszka duża społeczność ukraińska.
- **Tryb asystowany:** pracownik ośrodka pomocy społecznej, CUS lub klubu seniora zgłasza problem w imieniu osoby bez internetu (zgoda zaznaczana w formularzu, kanał „asystowane”).
- **Karta papierowa:** „Karta potrzeby” do wydruku z kodem QR; pracownik przepisuje ją do systemu.
- Emotki z kanwy **zawsze mają tekst** obok i w `aria-label`.

### 10.2 WCAG 2.1 AA: lista kontrolna

| Kryterium | Jak spełniamy |
|---|---|
| 1.1.1 alternatywy tekstowe | `alt` dla obrazów (AI proponuje, człowiek zatwierdza), `aria-label` dla ikon |
| 1.2.2 / 1.2.5 napisy, transkrypcja | linki do filmów ROPS z napisami YouTube + transkrypcja tekstowa |
| 1.3.1 informacje i relacje | semantyczny HTML, nagłówki h1–h3, `fieldset` i `legend` w kanwie |
| 1.3.5 cel pola | atrybuty `autocomplete` w formularzach kontaktowych |
| 1.4.3 kontrast | tekst ≥ 4,5:1 (celujemy w 7:1), duży tekst ≥ 3:1 |
| 1.4.4 / 1.4.10 powiększanie, układ | 200% bez utraty treści, układ działa przy szerokości 320 px |
| 1.4.11 kontrast elementów | obramowania pól i fokus ≥ 3:1 |
| 1.4.12 odstępy tekstu | brak sztywnych wysokości dla tekstu |
| 1.4.13 treść na najechanie | podpowiedzi zamykane klawiszem Esc |
| 2.1.1 / 2.1.2 klawiatura | wszystko obsługiwalne z klawiatury, bez pułapek fokusu (modale) |
| 2.2.1 czas | brak limitów; sesja ostrzega i pozwala przedłużyć |
| 2.4.1 pomijanie bloków | link „Przejdź do treści” |
| 2.4.3 / 2.4.7 kolejność i widoczny fokus | obramowanie 3 px w kolorze akcentu |
| 2.5.3 etykieta w nazwie | widoczny tekst przycisku = nazwa dostępna |
| 3.1.1 / 3.1.2 język | `lang="pl"`, fragmenty UA z `lang="uk"` |
| 3.2.3 / 3.2.4 spójność | ta sama nawigacja i nazwy na każdej stronie |
| 3.3.1 / 3.3.3 błędy | komunikat tekstowy przy polu z podpowiedzią, jak poprawić |
| 3.3.4 zapobieganie błędom | ekran „Sprawdź przed wysłaniem” |
| 4.1.2 nazwa, rola, wartość | komponenty Radix (shadcn/ui) z poprawnymi rolami ARIA |
| 4.1.3 komunikaty o stanie | odpowiedzi AI i statusy w `aria-live="polite"` |

Dodatkowo spełniamy część WCAG 2.2: rozmiar celu (2.5.8), fokus niezasłonięty (2.4.11) i brak testów pamięci przy logowaniu (3.3.8).

### 10.3 Jak to udowadniamy (do slajdu i README)
- **axe-core** (Playwright) na głównych ekranach: 0 błędów; **Lighthouse Accessibility = 100**; ESLint `jsx-a11y`.
- Test ręczny: tylko klawiatura, czytnik NVDA (Firefox) i VoiceOver (iOS), powiększenie 200% i 400%.
- **Test z prawdziwą osobą 60+** (choćby przez wideorozmowę z babcią lub dziadkiem): 20-sekundowy fragment do filmu.
- Strony wymagane prawem: **„Deklaracja dostępności”** i **„Informacja w tekście łatwym do czytania”**.

---

## 11. Architektura techniczna

### 11.1 Stos technologiczny (rekomendacja: szybko i do utrzymania)
| Warstwa | Wybór | Dlaczego |
|---|---|---|
| Frontend + API | **Next.js 16 (App Router) + TypeScript** | jeden projekt, szybkie wdrożenie, route handlers jako API |
| UI | **Tailwind CSS 4 + własne komponenty na `radix-ui`** | gotowe, dostępne komponenty (role ARIA, fokus) |
| Baza | **PostgreSQL + pgvector + pg_trgm**, na hackathon **Supabase** | relacje, wyszukiwanie tekstowe i wektorowe, realtime do powiadomień, storage na pliki |
| ORM | Drizzle albo klient Supabase | szybko, typowane |
| Hosting demo | **Vercel** (frontend/API) + Supabase (baza) | publiczny link w kilka minut |
| AI | **Anthropic Claude API**, model `claude-haiku-4-5` (zmierzona trafność jak na `claude-sonnet-5-5`), za warstwą `lib/ai.ts` (wymienny dostawca) | najlepsza jakość po polsku w prototypie; docelowo PLLuM lub Bielik |
| Embeddingi (etap 2) | `BAAI/bge-m3` albo `sdadas/mmlw-retrieval-roberta-large` (polski) na małym serwisie w Pythonie; na hackathon niepotrzebne (pełny kontekst) | otwarte, bez kosztów za zapytanie |
| Głos | Web Speech API (rozpoznawanie `pl-PL`) + SpeechSynthesis; docelowo Whisper na własnym serwerze | zero kosztów w demo |
| Mapa | react-leaflet albo kartogram SVG + GeoJSON powiatów Małopolski | czytelny Radar |
| Wykresy | Recharts | trendy w Centrali |
| i18n | next-intl (pl, uk, en) | języki |
| Eksport | widok do druku (PDF) + biblioteka `docx` | plany Krawca, wnioski |
| Testy dostępności | @axe-core/playwright, Lighthouse CI, eslint-plugin-jsx-a11y | dowód dla Jury |

Granice powiatów (GeoJSON) bierzemy z otwartych zbiorów (np. państwowy rejestr granic PRG albo publiczne repozytoria z GeoJSON Polski). Licencję zapisujemy w README. Jeśli zabraknie czasu, wystarczy kartogram z 22 kafelkami.

### 11.2 Schemat
```
[Przeglądarka: Next.js UI, tryb prosty, głos, PL/UA/EN]
        │  HTTPS
[Next.js route handlers /api/*] ──► [lib/ai.ts: maskowanie → prompt → JSON → walidacja (zod)] ──► Claude API (docelowo PLLuM/Bielik)
        │                                         ▲
        ▼                                         │ kontekst: Biblioteka (cache), fakty, IOSS
[Supabase: Postgres + pgvector + pg_trgm, Realtime (powiadomienia), Storage (PDF, obrazy), RLS]
        │
[Skrypty: seed (Biblioteka, IOSS, Mapa Wyzwań, fakty), dane syntetyczne, eval-swatka, import IOSS]
```

### 11.3 Struktura repozytorium (propozycja)
```
hackyeah/
├─ PLAN.md                ← ten dokument
├─ README.md              ← opis, jak uruchomić, linki, lista zależności
├─ data/                  ← dane źródłowe i pomocnicze (rozdział 5)
│  ├─ zrodla/
│  └─ seed/               ← generowane: zgłoszenia syntetyczne, eksperci, organizacje, testy
├─ app/
│  ├─ page.tsx            ← „Co chcesz zrobić?”
│  ├─ problem/            ← Swatka
│  ├─ wiedza/             ← Skarbnica: biblioteka/[id], malopolska, mapa-wyzwan, akademia
│  ├─ pomysl/             ← Pracownia: fiszka, kanwa, ocena, wniosek
│  ├─ testy/              ← Próbownia
│  ├─ rozmowy/            ← Rynek
│  ├─ wdrozenie/          ← Krawiec
│  ├─ moje/               ← moje sprawy (statusy)
│  ├─ centrala/           ← panel ROPS: zgloszenia, radar, tresci, nabory
│  ├─ dostepnosc/         ← deklaracja dostępności + tekst łatwy do czytania
│  └─ api/                ← route handlers (rozdział 13)
├─ components/            ← ui (shadcn), a11y (TrybProsty, Mikrofon, CzytajNaGlos, Uprosc), karty, mapa
├─ lib/                   ← ai.ts, prompts/, swatka.ts, radar.ts, krawiec.ts, maskowanie.ts, db.ts, ioss.ts
├─ db/                    ← schema.sql / migracje
├─ scripts/               ← seed.ts, generate-synthetic.ts, eval-swatka.ts, ioss-import.ts
├─ public/geo/            ← powiaty-malopolska.geojson
└─ docs/                  ← slajdy, scenariusz filmu, raport dostępności, koszty, zrzuty ekranu
```

---

## 12. Model danych (SQL)

```sql
create extension if not exists vector;
create extension if not exists pg_trgm;

create type rola as enum ('mieszkaniec','organizacja','jst','ekspert','admin');
create type status_zgloszenia as enum ('wyslane','przeczytane','w_analizie','u_eksperta','potrzebne_info','odpowiedz','zamkniete');

create table uzytkownicy (
  id uuid primary key default gen_random_uuid(),
  rola rola not null default 'mieszkaniec',
  nazwa text, email text, telefon text,
  powiat text, gmina text, jezyk text default 'pl',
  ustawienia_dostepnosci jsonb default '{}'::jsonb,   -- tryb prosty, rozmiar, kontrast, czytanie na głos
  created_at timestamptz default now()
);

create table organizacje (
  id uuid primary key default gen_random_uuid(),
  nazwa text not null,
  typ text check (typ in ('ngo','gmina','powiat','cus','ops','dps','pes','szkola','firma','uczelnia')),
  powiat text, gmina text, lata_doswiadczenia int, obszary text[] default '{}'
);

create table obszary (id text primary key, nazwa text not null, dane jsonb);   -- 8 obszarów Mapy Wyzwań

create table innowacje (
  id text primary key,                                -- slug z Biblioteki ROPS
  nazwa text not null, kategoria text not null, obszary text[] default '{}',
  na_czym_polega text, problem text, grupa_docelowa text, kto_moze_skorzystac text, czy_to_dziala text,
  autor_organizacja text, upowszechniana_w text[] default '{}',
  film text, folder_pdf text, materialy_zip text, url text,
  gotowosc text default 'gotowe', tagi text[] default '{}',
  streszczenie text, streszczenie_etr text,          -- generowane przez AI, zatwierdzane
  embedding vector(1024),
  status text default 'opublikowana', zrodlo text default 'rops',
  updated_at timestamptz default now()
);
create index innowacje_trgm on innowacje using gin ((nazwa || ' ' || coalesce(problem,'') || ' ' || coalesce(grupa_docelowa,'') || ' ' || coalesce(na_czym_polega,'')) gin_trgm_ops);

create table zgloszenia (
  id uuid primary key default gen_random_uuid(),
  numer text unique,                                   -- np. SPL-2026-000123 (do śledzenia)
  autor_id uuid references uzytkownicy(id),
  kanal text default 'web' check (kanal in ('web','glos','asystowane','papier')),
  tresc_zamaskowana text not null,                     -- surowej treści z danymi osobowymi nie przechowujemy
  obszar text references obszary(id), tagi text[] default '{}', grupa_docelowa text,
  powiat text, gmina text,
  priorytet smallint default 2,                        -- 0 kryzys, 1 wysoki, 2 normalny, 3 niski
  kryzys boolean default false,
  status status_zgloszenia default 'wyslane',
  przypisane_do uuid references uzytkownicy(id),
  termin_sla timestamptz,
  najlepsze_dopasowanie smallint,                      -- 0–100, do białych plam
  zgoda_kontakt boolean default false, kanal_kontaktu text,
  syntetyczne boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table dopasowania (
  zgloszenie_id uuid references zgloszenia(id) on delete cascade,
  innowacja_id text references innowacje(id),
  pozycja smallint, trafnosc smallint, dlaczego text, kto_moze_wdrozyc text, dowod text,
  ocena_uzytkownika smallint,                          -- 1 przydatne, -1 nieprzydatne
  primary key (zgloszenie_id, innowacja_id)
);

create table historia_statusu (
  id bigserial primary key, zgloszenie_id uuid references zgloszenia(id) on delete cascade,
  status status_zgloszenia, kto uuid references uzytkownicy(id), notatka text, at timestamptz default now()
);

create table fiszki (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid references uzytkownicy(id), organizacja_id uuid references organizacje(id),
  tytul text, opis text, istota text, dla_kogo text,
  etap text check (etap in ('pomysl','prototyp','przetestowane','gotowe')),
  kanwa jsonb default '{}'::jsonb,                     -- odpowiedzi wg data/kanwa_inno_agh.json
  wskazniki jsonb, ocena_wstepna jsonb, podobne jsonb, wizualizacja_url text,
  publiczna boolean default false, status text default 'robocza',
  created_at timestamptz default now()
);

create table nabory (
  id uuid primary key default gen_random_uuid(),
  nazwa text, program text, opis text, temat text,
  otwarty_od date, otwarty_do date, aktywny boolean default false,
  regulamin text, formularz jsonb, kryteria jsonb, przyklad boolean default true
);

create table wnioski (
  id uuid primary key default gen_random_uuid(),
  nabor_id uuid references nabory(id), fiszka_id uuid references fiszki(id),
  pola jsonb, status text default 'roboczy', created_at timestamptz default now()
);

create table plany_wdrozenia (
  id uuid primary key default gen_random_uuid(),
  innowacja_id text references innowacje(id), organizacja_id uuid references organizacje(id),
  profil jsonb, plan jsonb, kwalifikowalnosc jsonb, created_at timestamptz default now()
);

create table testy (
  id uuid primary key default gen_random_uuid(),
  fiszka_id uuid references fiszki(id), innowacja_id text references innowacje(id),
  tytul text, opis text, kogo_szukamy jsonb, powiat text, termin text, liczba_miejsc int,
  dostepnosc text, status text default 'otwarty'
);
create table testerzy (
  uzytkownik_id uuid primary key references uzytkownicy(id),
  grupa_wiekowa text, powiat text, zainteresowania text[], potrzeby_dostepnosci text[]
);
create table zapisy_testy (
  test_id uuid references testy(id) on delete cascade, uzytkownik_id uuid references uzytkownicy(id),
  status text default 'zapisany', primary key (test_id, uzytkownik_id)
);
create table opinie (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references testy(id), innowacja_id text references innowacje(id),
  autor_id uuid references uzytkownicy(id),
  ocena smallint check (ocena between 1 and 5), odpowiedzi jsonb, transkrypcja text, propozycja text,
  created_at timestamptz default now()
);

create table watki (
  id uuid primary key default gen_random_uuid(),
  typ text check (typ in ('zgloszenie','fiszka','innowacja','partnerstwo','pytanie')),
  obiekt_id text, temat text, created_at timestamptz default now()
);
create table wiadomosci (
  id uuid primary key default gen_random_uuid(),
  watek_id uuid references watki(id) on delete cascade, autor_id uuid references uzytkownicy(id),
  tresc text, wygenerowane_przez_ai boolean default false, created_at timestamptz default now()
);
create table eksperci (
  uzytkownik_id uuid primary key references uzytkownicy(id),
  dziedziny text[], obszary text[], opis text, dyzury text
);
create table partnerstwa (
  id uuid primary key default gen_random_uuid(),
  organizacja_id uuid references organizacje(id),
  szuka text check (szuka in ('taniej','dotrzec','wartosc')), obszar text, powiat text, opis text,
  created_at timestamptz default now()
);

create table powiadomienia (
  id bigserial primary key, uzytkownik_id uuid references uzytkownicy(id),
  typ text, tresc text, link text, kanal text default 'aplikacja',
  przeczytane_at timestamptz, created_at timestamptz default now()
);

create table ioss (
  wskaznik_id int, kategoria text, wskaznik text, rok int, powiat text, wartosc numeric,
  primary key (wskaznik_id, powiat, rok)
);
create table fakty (id serial primary key, temat text, tekst text, zrodlo text, strona int, url text, obszar text);
create table dziennik (id bigserial primary key, kto uuid, akcja text, obiekt text, szczegoly jsonb, at timestamptz default now());
```

W Supabase włączamy RLS: autor widzi swoje zgłoszenia, rola `admin` widzi wszystko, rola `ekspert` widzi wątki przypisane do siebie. Realtime włączamy na tabelach `zgloszenia`, `wiadomosci` i `powiadomienia`.

---

## 13. API

| Metoda i ścieżka | Co robi |
|---|---|
| `POST /api/swatka/dopasuj` | `{tekst, rola, powiat?, jezyk?}` → wynik z [7.3](#73-wynik-format-json) + podobne zgłoszenia, fakty, eksperci, nabory |
| `POST /api/zgloszenia` | tworzy zgłoszenie (maskowanie, ocena AI, przypisanie, termin, powiadomienie) → `{numer}` |
| `GET /api/zgloszenia/:numer` | status i oś czasu (dla autora) |
| `POST /api/zgloszenia/:id/odpowiedz` | odpowiedź administratora (z AI lub bez), zmiana statusu, powiadomienie |
| `POST /api/zgloszenia/:id/szkic` | szkic odpowiedzi od AI (opcja `etr: true`) |
| `POST /api/pracownia/fiszka` | zapis fiszki; `POST /api/pracownia/z-opisu` → fiszka i kanwa z opisu |
| `POST /api/pracownia/ocena` | wstępna ocena wg karty IWS + wskazówki + „adwokat diabła” |
| `POST /api/pracownia/czy-istnieje` | 3 podobne innowacje z wyjaśnieniem różnic |
| `POST /api/pracownia/wizualizacja` | obraz koncepcyjny (opcjonalnie) |
| `GET/POST /api/nabory` | lista, tworzenie, otwieranie i zamykanie (admin) |
| `POST /api/nabory/:id/wniosek` | generator wniosku z fiszki i kanwy |
| `POST /api/krawiec/plan` | `{innowacjaId, profil}` → plan wdrożenia + kwalifikowalność |
| `GET/POST /api/testy`, `POST /api/testy/:id/zapis`, `POST /api/testy/:id/opinia`, `GET /api/testy/:id/podsumowanie` | Próbownia |
| `GET/POST /api/watki`, `POST /api/watki/:id/wiadomosci` | Rynek |
| `POST /api/eksperci/dopasuj`, `GET/POST /api/partnerstwa` | Rynek |
| `GET /api/admin/radar` | agregaty, trendy, białe plamy, ciche potrzeby |
| `POST /api/admin/temat-naboru` | szkic tematu naboru z luki |
| `POST /api/admin/innowacje/import` | PDF lub link → 6 pól (do zatwierdzenia) |
| `POST /api/wiedza/zapytaj` | pytanie do raportów i faktów → odpowiedź z cytatem i stroną |
| `POST /api/wiedza/uprosc` | tekst → wersja łatwa do czytania |
| `GET /api/ioss?wskaznik=285` | wartości dla 22 powiatów |
| `GET /api/powiadomienia` | powiadomienia użytkownika |

---

## 14. AI: zasady, modele, prompty

### 14.1 Zasady
- **AI doradza, człowiek decyduje.** AI nie decyduje o grantach, świadczeniach ani publicznych odpowiedziach bez akceptacji człowieka.
- **Zamknięty katalog:** Swatka poleca tylko innowacje z naszej bazy (po id). Nie wymyśla rozwiązań spoza listy. Fakty mają źródło i stronę.
- **Ustrukturyzowane wyjście:** każda funkcja AI zwraca JSON walidowany schematem (zod). Przy błędzie robimy jedną ponowną próbę, a potem uruchamiamy zabezpieczenie (wyszukiwanie słów).
- **Prywatność:** do modelu trafia tylko tekst zamaskowany (`lib/maskowanie.ts`: PESEL `\b\d{11}\b`, telefon, e-mail, adresy „ul. …”, imiona i nazwiska wykrywane przez AI w kroku maskowania).
- **Przejrzystość:** „Rozmawiasz z asystentem AI” na początku każdej interakcji; oznaczenia „przygotowane z pomocą AI” przy szkicach, planach i obrazach.
- **Bezpieczeństwo:** wykrywanie kryzysu przed wszystkim innym; AI nie prowadzi terapii, tylko kieruje do pomocy.

### 14.2 Modele i ustawienia (Claude API)
- Domyślnie **`claude-opus-5-5`**. Głębokość myślenia ustawiamy parametrem `output_config.effort`:
  - `low`: maskowanie, ocena i przypisanie zgłoszenia, „Wyjaśnij prościej”;
  - `medium`: Swatka, szkice odpowiedzi, kanwa, asystent;
  - `high`: Krawiec, generator wniosków, temat naboru.
- Wymianę na tańszy model (np. `claude-sonnet-5-5`, `claude-haiku-4-5`) przy dużym ruchu decyduje zespół po pomiarze jakości na zestawie testowym.
- Uwagi techniczne dla `claude-opus-5-5`:
  - myślenia nie da się wyłączyć, kosztem sterujemy przez `effort`;
  - wymuszony `tool_choice` zwraca błąd, więc JSON bierzemy przez structured outputs (`output_config.format`);
  - trzeba obsłużyć `stop_reason: "refusal"`;
  - przy długich odpowiedziach używamy streamingu.
- **Cache promptu:** statyczny kontekst (instrukcja + streszczenia 115 innowacji, ok. 15 tys. tokenów) idzie na początek z `cache_control`. Odczyt z cache jest ok. 20 razy tańszy niż zwykłe wejście.
- **Klucz API** w `.env.local` (`ANTHROPIC_API_KEY`), nigdy w repozytorium.

### 14.3 Szkice promptów (po polsku; wyjście zawsze JSON wg schematu)

**A. Swatka: zrozumienie potrzeby i ranking (jedno wywołanie w MVP)**
```
SYSTEM (cache): Jesteś asystentem Małopolskiego Hubu Innowacji Społecznych (ROPS Kraków).
Dopasowujesz opis potrzeby do innowacji społecznych WYŁĄCZNIE z poniższej listy (po id).
Nie wymyślaj innowacji spoza listy. Jeśli nic nie pasuje dobrze, ustaw brak_dopasowania=true.
Obszary (Mapa Wyzwań): rodzina_piecza, bezdomnosc, niepelnosprawnosc, ubostwo, cudzoziemcy, zdrowie, zdrowie_psychiczne, seniorzy.
Zasady oceny: trafność 0-100; liczy się zgodność problemu i grupy docelowej, potem forma wsparcia i "kto może skorzystać".
Język potoczny tłumacz na fachowy (np. "gubi się w lekach" = wielolekowość u seniora).
"dlaczego" pisz prostym językiem, max 2 zdania, zwracając się do użytkownika.
LISTA INNOWACJI: [id | nazwa | kategoria | problem (1 zd.) | grupa docelowa | kto może skorzystać]
USER: rola={rola}; powiat={powiat}; opis="{tekst_zamaskowany}"
→ JSON: {obszar, grupa_docelowa, potrzeby[], slowa_kluczowe[], kryzys, dopasowania[{id,trafnosc,dlaczego,kto_moze_wdrozyc}], brak_dopasowania, pytanie_doprecyzowujace}
```

**B. Ocena i przypisanie zgłoszenia (Centrala)**
```
Na podstawie zgłoszenia zwróć: obszar (1 z 8), tagi (max 5), grupa_docelowa, priorytet (0 kryzys, 1 wysoki, 2 normalny, 3 niski),
kryzys (bool, z uzasadnieniem), czy_duplikat_z [id ostatnich podobnych], streszczenie (1 zdanie).
Kryzys = zagrożenie życia lub zdrowia, myśli samobójcze, przemoc. W razie wątpliwości oznacz kryzys=true.
```

**C. Szkic odpowiedzi (Centrala)**
```
Napisz odpowiedź ROPS do autora zgłoszenia. Prosty język, ciepło, konkretnie, max 120 słów.
Wskaż 1-3 dopasowane innowacje (nazwy + dlaczego), następny krok i kontakt. Bez obietnic, których ROPS nie może dać.
Jeśli etr=true: zasady tekstu łatwego do czytania (krótkie zdania, jedna myśl w zdaniu, bez trudnych słów).
```

**D. Kanwa z opisu (Pracownia)**
```
Na podstawie opisu pomysłu wypełnij fiszkę (opis, istota, dla_kogo, etap) i kanwę INNO AGH zgodnie ze schematem.
Dla skal wybierz wartość 1-4 tylko gdy opis to uzasadnia, w przeciwnym razie null + pytanie do użytkownika.
Nie zmyślaj faktów (kwot, liczb osób); zostaw puste i dodaj do listy "do_uzupelnienia".
```

**E. Wstępna ocena według karty IWS 2.0 (Pracownia)**
```
Oceń fiszkę i kanwę jak ekspert Komisji Oceny Innowacji ROPS wg 5 kryteriów (0-10):
innowacyjność (na poziomie krajowym; porównaj z podanymi podobnymi innowacjami), adekwatność (w tym zgodność z Mapą Wyzwań),
efektywność kosztowa, uniwersalność, wizja rozwoju. Progi: innowacyjność >=5, pozostałe >=4, suma >=21.
Dla każdego kryterium: punkty, uzasadnienie (1 zd.), wskazówka "co dopisać, żeby dostać więcej" (konkretnie).
Dodaj 3 pytania "adwokata diabła" i ocenę gotowości do części B (testowanie, potencjał, deinstytucjonalizacja).
Zaznacz, że to wstępna ocena pomocnicza, a nie decyzja ROPS.
```

**F. Krawiec: plan wdrożenia**
```
Przygotuj szkic indywidualnego planu wdrożenia innowacji {nazwa} w instytucji {profil}.
Użyj: 6 pól innowacji, danych powiatu (IOSS) i faktów (z podaniem źródeł), parametrów naboru "Usługa Wrażliwa"
(przygotowanie <=6 mies., wdrożenie <=18 mies., grant <=600 tys. zł). Sekcje: karta usługi, uzasadnienie lokalne,
model realizacji, budżet (koszty stałe/zmienne z założeniami), harmonogram (tabela miesięcy), wskaźniki, ryzyka,
finansowanie, kwalifikowalność (lista kontrolna z wynikiem: spełnia / nie spełnia / do sprawdzenia). Kwoty jako szacunki z założeniami.
```

**G. Wyjaśnij prościej (ETR)** · **H. Podsumowanie opinii z testów** · **I. Temat naboru z luki** · **J. Import innowacji z PDF (6 pól ROPS)** · **K. Odpowiedź z raportów (tylko z podanych fragmentów, z cytatem i stroną)**: budujemy według tego samego wzoru.

---

## 15. Bezpieczeństwo, RODO, AI Act

- **Minimalizacja:** do zgłoszenia nie są potrzebne imię ani nazwisko; kontakt jest opcjonalny i za zgodą. Przechowujemy tylko treść zamaskowaną.
- **Dane szczególnej kategorii** (zdrowie, w tym psychiczne): komunikat przy formularzu, maskowanie, dostęp tylko dla przypisanego pracownika, dziennik dostępu. Przed wdrożeniem wymagana ocena skutków (DPIA).
- **Hosting w UE lub Polsce**, szyfrowanie w spoczynku i w transmisji, kopie zapasowe, retencja (np. zgłoszenia zamknięte anonimizowane po 24 miesiącach).
- **Uprawnienia:** role i RLS w bazie, dziennik zmian (`dziennik`), limity zapytań do endpointów AI, CSP, sekrety w zmiennych środowiskowych, brak danych osobowych w logach.
- **Dostawca AI:** brak trenowania na danych użytkowników; docelowo model w polskiej infrastrukturze (PLLuM lub Bielik). Warstwa `lib/ai.ts` pozwala zmienić dostawcę bez przepisywania aplikacji.
- **AI Act:** art. 50 (od 2.08.2026), czyli informacja o rozmowie z AI i oznaczanie treści AI. Splot nie decyduje o świadczeniach ani grantach, więc nie jest systemem wysokiego ryzyka; nadzór człowieka jest wbudowany.
- **Moderacja:** filtr treści obraźliwych w wątkach publicznych, zgłaszanie nadużyć.

---

## 16. Koszty utrzymania

Szacunek dla całego województwa w pierwszym roku. Założenie kursu: 1 USD ≈ 3,7 zł.

**Założony ruch miesięcznie:** 5000 zapytań do Swatki, 3000 zgłoszeń, 12 000 wiadomości w asystentach, 300 planów Krawca, 500 ocen lub wniosków.

| Pozycja | Szacunek miesięczny | Uwagi |
|---|---|---|
| AI (Claude Opus 5.5: 4 USD / 1 mln tokenów wejścia, 20 USD / 1 mln wyjścia, cache 0,20 USD) | ok. 1,5–2,5 tys. zł | Swatka ok. 0,03 USD (ok. 10 gr) za dopasowanie dzięki cache Biblioteki; mniejszy model to taniej (decyzja po pomiarze jakości) |
| Serwery (2 instancje aplikacji, zarządzany Postgres, kopie, monitoring, storage) w chmurze PL/UE | ok. 1–1,5 tys. zł | na pilotaż wystarczy Vercel Pro + Supabase Pro, ok. 200 zł |
| SMS (ok. 3000 × ok. 0,10 zł) | ok. 300 zł | e-mail praktycznie bez kosztów |
| Domena, certyfikaty, poczta | ok. 50 zł | |
| **Razem infrastruktura i AI** | **ok. 3–4,5 tys. zł** | |
| Utrzymanie i rozwój (pół etatu albo umowa serwisowa) | ok. 8–10 tys. zł | prowadzenie treści: obecny Dział Innowacji Społecznych ROPS |
| Rocznie: audyt WCAG + test bezpieczeństwa | ok. 15–25 tys. zł / rok | |

**Wariant suwerenny:** PLLuM lub Bielik (Apache 2.0) na własnym GPU w polskiej chmurze, ok. 4–8 tys. zł miesięcznie. Zamiast płacenia za tokeny jest koszt stały, co opłaca się przy dużym ruchu albo z powodów suwerenności danych.

**Skalowanie:** aplikacja jest bezstanowa i skaluje się poziomo, Postgres obsłuży cały region. Kolejne województwa (16 ROPS) mogą dostać osobne instancje z tym samym kodem, a dane podobne do IOSS dostępne są w BDL GUS przez API.

---

## 17. UI/UX i marka

- **Charakter:** ciepły, urzędowo-wiarygodny, regionalny, ale nie folklorystyczny.
- **Motyw graficzny:** splecione nici, które tworzą serce lub węzeł. Delikatne nawiązanie do małopolskich wzorów (np. parzenica) jako akcent w logo i ilustracjach, nigdy kosztem kontrastu.
- **Kolory (do dopracowania przez projektanta):**
  - tusz granatowy `#14213D` (tekst, tła ciemne);
  - jasne tło `#F4F6FA`;
  - akcent czerwony `#B3203A` (przyciski, fokus; biały tekst ma na nim kontrast ok. 6:1);
  - złoty `#D9A21B` (wyróżnienia, tylko z ciemnym tekstem);
  - zielony i pomarańczowy tylko do statusów, zawsze z tekstem.
- **Typografia:**
  - **Atkinson Hyperlegible Next** do tekstu (zaprojektowana dla osób słabowidzących, ma polskie znaki, Google Fonts);
  - **Bricolage Grotesque** do nagłówków (charakterystyczna, z polskimi znakami).
- **Komponenty:** kafelki startowe, karta innowacji, oś czasu statusu, przycisk mikrofonu, panel kryzysowy, pasek dostępności, kartogram powiatów, skale kanwy z emotkami i tekstem.
- **Makiety (Figma), wymagane przez opis wyzwania:** start, Swatka (opis i wyniki), status zgłoszenia, karta innowacji, kanwa (1 krok), wstępna ocena, plan Krawca, Centrala (skrzynka i Radar), Próbownia, tryb prosty, wersja mobilna. Eksport do PNG idzie do `docs/` i do zgłoszenia.
- **Teksty:** z perspektywy użytkownika, aktywne czasowniki („Wyślij zgłoszenie”, „Sprawdź status”), błędy mówią, jak je naprawić.

---

## 18. Demo, film, prezentacja, pytania Jury

### 18.1 Ścieżka demo na żywo (ok. 3 min)
1. **Start:** „Co chcesz zrobić?”. Włączamy tryb prosty i powiększamy tekst (10 s).
2. **Janina (Olkusz):** mikrofon, opis, wyniki z „dlaczego pasuje”, „nie jest Pani sama”, wysłanie zgłoszenia, numer i status (40 s).
3. **Centrala (podzielony ekran):** powiadomienie w czasie rzeczywistym, ocena AI, szkic odpowiedzi, wysłanie, status u Janiny zmienia się na „odpowiedź” (30 s).
4. **Radar:** mapa powiatów, biała plama „samotność 75+ bez dziennej opieki”, cicha potrzeba w powiecie z wysokim ryzykiem, „Utwórz temat naboru” (25 s).
5. **Krawiec:** CUS w Olkuszu wybiera „Senior CUDER”, dostaje plan i kwalifikowalność (25 s).
6. **Pracownia:** pomysł głosem, kanwa wypełniona, „czy to istnieje?”, wstępna ocena, wizualizacja; potem Próbownia: zaproszenie do testu i 10 testerów (35 s).
7. **Jury wpisuje własne słowa kluczowe** (np. „głusi alarm pożarowy” → Strażnik) (15 s).

### 18.2 Scenariusz filmu (MP4, maks. 3:00, z napisami)
| Czas | Obraz | Lektor (skrót) |
|---|---|---|
| 0:00–0:15 | tytuł Splot, mapa Małopolski | „115 innowacji w Bibliotece ROPS. 93 gminy bez dziennej opieki dla seniorów. Jak je połączyć?” |
| 0:15–0:25 | cytat z Przewodnika ROPS | „Nawet znakomita innowacja nie upowszechni się sama.” |
| 0:25–1:05 | Janina, mikrofon, wyniki, wysłanie, status | Swatka: mówisz własnymi słowami, dostajesz sprawdzone rozwiązania i wiesz, co dalej |
| 1:05–1:30 | Centrala: powiadomienie, ocena AI, odpowiedź | ścieżka komunikacji w kilka sekund |
| 1:30–1:50 | Radar: białe plamy i ciche potrzeby | dane IOSS + zgłoszenia = gotowe tematy naborów |
| 1:50–2:10 | Krawiec | plan wdrożenia na miarę gminy i kwalifikowalność |
| 2:10–2:35 | Pracownia (kanwa INNO AGH, ocena wg karty ROPS) + Próbownia | od pomysłu do testu |
| 2:35–2:50 | dostępność: tryb prosty, głos, UA, wynik axe/Lighthouse, test z seniorem | dla każdego, także offline (tryb asystowany) |
| 2:50–3:00 | architektura, koszty, 7/7 modułów, link | „Splot – cyfrowe serce HubMI.” |

### 18.3 Prezentacja PDF (maks. 10 slajdów)
1. **Splot – cyfrowe serce HubMI:** hasło, zespół, linki.
2. **Problem:** 115 innowacji kontra 93 gminy bez dziennej opieki; cytat „nie upowszechni się sama”; opiekunowie: „brak informacji”.
3. **Rozwiązanie:** pętla i 4 grupy użytkowników.
4. **Swatka:** zrzut ekranu i liczba trafności (Hit@3 na 30 zapytaniach).
5. **Radar:** białe plamy i ciche potrzeby (mapa).
6. **Krawiec:** plan wdrożenia i grant wdrożeniowy.
7. **Pracownia i Próbownia:** kanwa INNO AGH, karta oceny IWS, testerzy.
8. **Dostępność i komunikacja:** tryb prosty, głos, UA, WCAG, ścieżka zgłoszenia.
9. **Wdrożenie:** architektura, RODO i AI Act, koszty, skalowanie, mapa drogowa (pilotaż w 3 powiatach).
10. **Podsumowanie:** 7/7 modułów, dane ROPS, linki (demo, repozytorium, film).

### 18.4 Pytania Jury i odpowiedzi
- **Skąd dane?** Biblioteka ROPS (115), Mapa Wyzwań, IOSS (184 wskaźniki, 2024), raporty ROPS (CC BY), kanwa INNO AGH, karty oceny IWS. Administrator dodaje innowację z PDF w kilka minut.
- **Co z RODO i danymi o zdrowiu?** Maskowanie przed AI, minimalizacja, zgody, hosting w UE, ocena skutków (DPIA), dostęp tylko dla przypisanej osoby.
- **A jeśli AI się pomyli?** AI wybiera tylko z naszej bazy, podaje uzasadnienie i źródło, publiczne odpowiedzi zatwierdza człowiek, a opinie użytkowników poprawiają jakość. Trafność mierzymy (Hit@3).
- **Kto to utrzyma i za ile?** Treści prowadzi Dział Innowacji Społecznych, technikę pół etatu albo umowa serwisowa; infrastruktura i AI ok. 3–4,5 tys. zł miesięcznie.
- **Seniorzy bez internetu?** Tryb asystowany przez ośrodki pomocy społecznej, CUS i kluby seniora, karta papierowa z QR, tryb prosty, głos. Radar pokazuje, gdzie ludzie milczą.
- **Czym się różnicie od innowacjespoleczne.pl albo bazy SIM?** Tamte są katalogami. Splot zamyka pętlę: dopasowanie, wdrożenie, test, luka, nabór, a wszystko na procesach ROPS.
- **Integracje?** API i automatyczne powiadomienia dla innych systemów, import IOSS i BDL, eksporty; generator wniosków zastępuje Webankietę; później login.gov.pl i system grantowy.
- **AI Act?** Przejrzystość z art. 50, brak automatycznych decyzji o świadczeniach, nadzór człowieka.
- **Skalowalność?** Aplikacja bezstanowa, Postgres, cache, instancje dla innych województw.

---

## 19. Plan działania do 11:00

Teraz jest ok. 16:30 w sobotę. Zostaje ok. 18,5 h.

**Role (przy 6 osobach; przy mniejszym zespole łączymy 1+6, 2+3 i 4+5):**

| # | Rola | Odpowiada za |
|---|---|---|
| 1 | Lider, prezentacja, film | koordynacja, scenariusz demo, slajdy, film, oddanie, pilnowanie czasu |
| 2 | Frontend A | układ, nawigacja, pasek dostępności, tryb prosty, głos, i18n, Swatka UI, Skarbnica, Próbownia |
| 3 | Frontend B | Pracownia (kanwa), Krawiec UI, Centrala UI, Radar (mapa, wykresy), Rynek UI |
| 4 | Backend i baza | schemat, seed, API, realtime, statusy, przełącznik ról, wdrożenie (Vercel + Supabase) |
| 5 | AI | `lib/ai.ts`, prompty, Swatka, ocena zgłoszeń, Krawiec, wstępna ocena, maskowanie i kryzys, skrypt `eval-swatka` |
| 6 | Projektant i dostępność | marka, makiety w Figmie, kontrast, testy axe i Lighthouse, test z seniorem, grafiki do slajdów |

**Harmonogram:**

| Godzina | Cel | Kto |
|---|---|---|
| 16:30–17:00 | wszyscy czytają PLAN.md, podział ról, `create-next-app`, Supabase, Vercel, klucze w `.env.local` | wszyscy |
| 17:00–19:30 | schemat + seed (Biblioteka, Mapa, IOSS, fakty), szkielet UI (start, pasek dostępności), **Swatka od wejścia do wyników**, pierwsze wdrożenie | 2, 4, 5 |
| 17:00–19:30 | marka, kolory, fonty, makiety startu i Swatki | 6 |
| **19:30–20:00** | **checkpoint HackYeah:** działający link ze Swatką + zrzut ekranu + krótki opis | 1 |
| 20:00–23:00 | zgłoszenie → Centrala (realtime) → odpowiedź → status (pełna pętla); biblioteka (karty i strona innowacji); Krawiec v1 | 2, 3, 4, 5 |
| 23:00–02:00 | Pracownia (fiszka, kanwa, ocena, „czy istnieje”); Radar (mapa, luki, ciche potrzeby, dane syntetyczne); Rynek (wątki, eksperci, partnerstwa); Próbownia (testy, zapisy, opinie, podsumowanie) | 2, 3, 4, 5 |
| 02:00–05:00 | głos, czytanie na głos, „Wyjaśnij prościej”, UA, generator wniosków, Kondycja Małopolski; **eval Hit@3**; poprawki dostępności (axe, Lighthouse) | 2, 3, 5, 6 |
| 05:00–08:00 | dopracowanie UI, dane demo, nagranie filmu, 10 slajdów, README, koszty, zrzuty ekranu, makiety | 1, 6 + reszta poprawki |
| 08:00–10:00 | test z seniorem (wideorozmowa), poprawki błędów, **zamrożenie kodu o 9:30**, ostateczne wdrożenie | wszyscy |
| **10:00–10:30** | **oddanie na HackTribe**: tytuł, ID zespołu, opis, PDF, MP4, linki, repozytorium | 1 |
| 10:30–11:00 | zapas na awarie | — |
| 11:00–16:00 | odpoczynek, próba prezentacji na żywo i odpowiedzi na pytania | 1 + prezenter |

---

## 20. Priorytety i definicja „gotowe”

**Muszą być:**
- Swatka od wejścia do wyników z uzasadnieniem;
- zgłoszenie → Centrala → odpowiedź → status;
- biblioteka (karty i strona innowacji);
- Krawiec (plan i kwalifikowalność);
- Pracownia (fiszka, kanwa, ocena);
- Radar (białe plamy na mapie);
- tryb prosty, rozmiar tekstu, kontrast, klawiatura;
- wdrożenie, film, slajdy.

**Powinny być:**
- głos (wejście i czytanie), „Wyjaśnij prościej”, UA;
- ciche potrzeby;
- Próbownia (zapisy, opinie, podsumowanie);
- Rynek (wątki, eksperci, partnerstwa);
- generator wniosków;
- eval Hit@3;
- Kondycja Małopolski (IOSS + fakty).

**Mogą być:** wizualizacja obrazem, dopasowanie partnerów przez AI, PDF „Puls Małopolski”, import innowacji z PDF, eksport DOCX.

**Nie robimy teraz (pokazujemy jako mapę drogową):** logowanie login.gov.pl, prawdziwe SMS, PLLuM na własnym serwerze, integracja z systemem grantowym, embeddingi.

**Definicja „gotowe” dla każdego modułu:**
- da się go przejść w demo bez błędów na wdrożonym linku;
- działa z klawiatury, ma etykiety i nie ma błędów axe na ekranie;
- ma sensowne dane demo;
- ma zrzut ekranu w `docs/`.

---

## 21. Ryzyka i zabezpieczenia

| Ryzyko | Zabezpieczenie |
|---|---|
| AI nie odpowiada lub jest wolne podczas demo | zabezpieczenie przez wyszukiwanie słów; zapisane odpowiedzi dla zapytań z demo; film jako główny materiał |
| AI się pomyli | zamknięty katalog, uzasadnienia, próg „brak dopasowania”, akceptacja człowieka |
| Brak czasu na 7 modułów | priorytety z rozdziału 20; każdy moduł choć w wersji minimalnej, ale klikalny |
| Problemy z rozpoznawaniem mowy (sala, hałas) | w demo wpisywanie tekstem jako zapas; nagranie głosu w filmie robimy w ciszy |
| Dane osobowe | tylko persony i dane syntetyczne; maskowanie; brak imion i nazwisk autorów w Bibliotece |
| Nieczytelny kontrast lub błędy dostępności | stałe testy axe i Lighthouse od 02:00, projektant pilnuje palety |
| Zbyt długi film lub za dużo slajdów | limit 3:00 i 10 slajdów sprawdzamy przed oddaniem |
| Oddanie w ostatniej chwili | oddajemy o 10:00–10:30, nie o 10:59 |
| Prawa autorskie | tylko własny kod i biblioteki MIT/Apache/BSD; lista w README; grafiki własne lub na wolnej licencji |

---

## 22. Checklista oddania

- [ ] Tytuł projektu: **„Splot – cyfrowe serce HubMI”**
- [ ] Identyfikator zespołu
- [ ] Opis projektu po polsku (problem, rozwiązanie, 7 modułów, dane, dostępność, koszty, linki)
- [ ] **PDF, maks. 10 slajdów**
- [ ] **MP4, maks. 3:00**, z napisami
- [ ] Link do działającego demo + dane logowania lub przełącznik ról
- [ ] Makiety UX/UI (Figma i PNG)
- [ ] Repozytorium (README: jak uruchomić, lista zależności i licencji, źródła danych)
- [ ] Przewidywany koszt utrzymania i potrzebne zasoby (z rozdziału 16)
- [ ] Zrzuty ekranu
- [ ] Wynik trafności Swatki i wyniki testów dostępności w README i na slajdach
- [ ] Sprawdzone: brak prawdziwych danych osobowych, brak sekretów w repozytorium

---

## 23. Słownik pojęć

| Skrót / pojęcie | Znaczenie |
|---|---|
| ROPS | Regionalny Ośrodek Polityki Społecznej w Krakowie (jednostka Województwa Małopolskiego) |
| HubMI | Małopolski Hub Innowacji Społecznych (HubMI.pl) |
| JST | jednostka samorządu terytorialnego (gmina, powiat, województwo) |
| CUS | Centrum Usług Społecznych (gminna instytucja organizująca usługi społeczne, robi diagnozę potrzeb i program usług) |
| OPS / GOPS / MOPS | ośrodek pomocy społecznej |
| DPS / DDP | dom pomocy społecznej / dzienny dom pomocy |
| PES / NGO | podmiot ekonomii społecznej / organizacja pozarządowa |
| IWS, MIIS | Inkubator Włączenia Społecznego (2.0), Małopolski Inkubator Innowacji Społecznych (projekty ROPS) |
| KOI, RIS | Komisja Oceny Innowacji, Rada Innowacji Społecznych (oceniają i wybierają innowacje) |
| RPWI / IPWI | ramowy / indywidualny plan wdrożenia innowacji („Usługa Wrażliwa”) |
| DI | deinstytucjonalizacja: przejście od opieki w placówkach do usług w środowisku lokalnym |
| RPDI | Regionalny Plan Rozwoju Usług Społecznych i Deinstytucjonalizacji |
| Odbiorcy / użytkownicy innowacji | odbiorcy to ci, którym innowacja pomaga; użytkownicy to instytucje, które ją wdrażają |
| IOSS | Internetowy Obserwator Statystyk Społecznych (obserwator.rops.krakow.pl) |
| BDL | Bank Danych Lokalnych GUS (ma API) |
| ETR | tekst łatwy do czytania i zrozumienia (easy-to-read) |
| WCAG 2.1 AA | standard dostępności cyfrowej wymagany od instytucji publicznych |
| Hit@3 | odsetek zapytań, w których trafna innowacja jest w pierwszej trójce wyników |
| Poczwórna helisa | współpraca administracji, nauki, biznesu i mieszkańców |

---

## 24. Źródła

**Od organizatorów (HubMI):**
- Biblioteka Innowacji Społecznych: https://rops.krakow.pl/innowacje-spoleczne/biblioteka-innowacji-spolecznych/kategorie
- Raporty z badań ROPS: https://rops.krakow.pl/badania-analizy-raporty/raporty-z-badan
- Internetowy Obserwator Statystyk Społecznych: https://obserwator.rops.krakow.pl/
- Mapa Wyzwań Społecznych: https://rops.krakow.pl/mpliki/IS/IWS_20/za._nr_2._Mapa_Wyzwa_Spoecznych.pdf
- Publikacje ze świata innowacji: https://rops.krakow.pl/innowacje-spoleczne/publikacje-ze-swiata-innowacji
- Kanwa INNO AGH (Social Innovation Canvas): https://rops.krakow.pl/mpliki/IS/Moj_folder/INNO_AGH_-_SOCIAL_CANVAS.pdf

**Dokumenty ROPS użyte w planie:**
- Diagnoza 2025 „Usługi społeczne w Małopolsce”: https://rops.krakow.pl/pliki-do-pobrania/wpis,2025-uslugi-spoleczne-w-malopolsce-deficyty-potrzeby-potencjal-rozwojowy-zaktualizowane-wnioski-z-diagnozy,1348
- Przewodnik po innowacjach społecznych (2019): https://rops.krakow.pl/mpliki/IS/ikony_PUBLIKACJE/InnMalopolska_przewodnik_po_innowacjach.pdf
- „Połącz kropki” (2023): https://rops.krakow.pl/mpliki/IS/PUBLIKACJE_INKUBATOROW/Pocz_kropki_Publikacja_IWS.pdf
- „Innowacje społeczne dla dostępności” (2022): https://rops.krakow.pl/mpliki/IS/ikony_PUBLIKACJE/Innowacje_spoleczne_dla_dostepnosci.pdf
- Nabór IWS 2.0 (formularz, karty oceny): https://rops.krakow.pl/nabory-szkolenia-granty-dotacje-wizyty-studyjne-studia-specjalizacje-superwizje/granty-na-innowacje-spoleczne,nabor-aplikacji-wnioskow-na-innowacje-spoleczne-w-ramach-projektu-pn-inkubator-wlaczenia-spolecznego-20
- „Usługa Wrażliwa”, ogłoszenie naboru: https://rops.krakow.pl/mpliki/IS_2/za._1_do_Zarzdzenia_IS-430-3_25_-_ogoszenie_naboru.pdf

**Kontekst:**
- GUS, procesy demograficzne w Małopolsce do 2040: https://rrl.stat.gov.pl/Files/publikacje/Problemy-rozwoju-demograficznego-Polski/7._malopolskie.pdf
- NIK, „Wykluczeni w cyfrowym państwie” (2025): https://www.nik.gov.pl/aktualnosci/administracja/wykluczeni-w-cyfrowym-panstwie.html
- Cyfrowy Senior (dane GUS 2024): https://senior.issa.org.pl/2026/02/23/seniorzy-online-miedzy-rosnaca-aktywnoscia-a-luka-kompetencyjna/
- Nielsen Norman Group, użyteczność dla seniorów: https://www.nngroup.com/articles/usability-for-senior-citizens/
- AI Act art. 50 od 2.08.2026: https://www.inforlex.pl/dok/tresc,FOB0000000000007643377,Od-2-sierpnia-2026-r-urzad-musi-oznaczac-tresci-AI.html
- PLLuM (Hugging Face): https://huggingface.co/CYFRAGOVPL/PLLuM-12B-instruct-2412
- Bielik (SpeakLeash): https://huggingface.co/speakleash
- PL-MTEB (embeddingi dla polskiego): https://arxiv.org/abs/2405.10138
- Nesta, Open Book of Social Innovation: https://www.nesta.org.uk/report/the-open-book-of-social-innovation/
- Social Innovation Match (ESF+): https://european-social-fund-plus.ec.europa.eu/en/social-innovation-match
- innowacjespoleczne.pl (Fundacja Stocznia): https://innowacjespoleczne.pl/
- ENoLL, Living Labs: https://enoll.org/living-labs/
- HackYeah 2026 (harmonogram): https://hackyeah.pl/
