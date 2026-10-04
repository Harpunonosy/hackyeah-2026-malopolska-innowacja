# Wdrożenie Splotu: architektura, skalowanie, integracje

Stan na 4.10.2026. Dokument dla zespołu IT ROPS Kraków i przyszłego wykonawcy. Liczby w rozdz. 3 i 4 pochodzą z pomiarów opisanych przy każdej tabeli.

## 1. Architektura w jednym akapicie

Splot to jedna aplikacja Next.js 16 (React 19, TypeScript) z bazą PostgreSQL. Strony renderuje serwer, więc działają bez ciężkiego JavaScriptu na słabych telefonach. Model AI jest wywoływany tylko przez `lib/ai.ts` (funkcja `zapytajJson` ze strukturalną odpowiedzią i walidacją zod), a przed wysłaniem tekst przechodzi maskowanie danych osobowych (`lib/maskowanie.ts`). Każda funkcja AI ma tryb awaryjny albo czytelny komunikat błędu. Wykrywanie kryzysu i numery pomocy działają bez AI.

```
Przeglądarka / widżet na stronie gminy / systemy Hubu (API, webhooki)
        │
   Next.js (Vercel albo dowolny serwer Node 20+, kontener)
   ├─ strony i API (app/)                  ← bez AI: szybkie, cache w pamięci
   ├─ lib/ai.ts → DeepSeek API (deepseek-flash) ← tylko tekst po maskowaniu
   ├─ lib/powiadomienia.ts → e-mail/SMS (adapter), webhooki HMAC
   └─ lib/db.ts → PostgreSQL (Supabase, UE)
```

| Warstwa | Demo | Produkcja (propozycja) |
|---|---|---|
| Aplikacja | Vercel (funkcje serwerowe, limit 120 s dla Krawca i Pracowni) | Vercel Pro albo 2 kontenery w chmurze w UE / w serwerowni Urzędu Marszałkowskiego |
| Baza | Supabase PostgreSQL (UE) | zarządzany PostgreSQL 16 w UE z kopią zapasową dzienną |
| AI | DeepSeek Flash (DeepSeek API) | to samo albo model w polskiej infrastrukturze (PLLuM, Bielik): podmiana jednego pliku `lib/ai.ts` |
| E-mail, SMS | symulowane (podgląd w Centrali) | adapter SMTP i bramka SMS w `lib/powiadomienia.ts` |
| Logowanie | hasło demo (Centrala, eksperci) | login.gov.pl dla mieszkańców (opcjonalnie), konta pracowników z SSO Urzędu |

## 2. Moduły i dane

- Kod: `app/` (strony i API), `components/` (interfejs), `lib/` (logika), `db/` (migracje SQL `schema.sql`, `002`…`014`), `scripts/` (import danych, testy).
- Dane startowe: Biblioteka Innowacji (115 kart), IOSS (149 wskaźników, 22 powiaty), Mapa Wyzwań (8 obszarów), karta oceny IWS 2.0, kanwa INNO AGH. Import: `scripts/scrape_biblioteka.py`, `scripts/scrape_ioss.py`, `scripts/seed.ts`.
- Treści zmienia pracownik w Centrali (Treści, Nabory, Materiały edukacyjne, Dane IOSS). Każda zmiana trafia do dziennika (`dziennik`).

## 3. Wydajność i skalowanie (pomiar)

**Test obciążenia stron bez AI.** Wersja produkcyjna (`next build && next start`), **jeden proces Node** na laptopie (8 rdzeni), baza Supabase w UE przez internet. Ruch mieszany: strona główna, Biblioteka, karta innowacji, Kondycja Małopolski, profil powiatu, Galeria, API innowacji. Skrypt: `scripts/obciazenie.mjs`.

| Równolegli użytkownicy | Zapytań na sekundę | Mediana | 95. percentyl | Błędy |
|---|---|---|---|---|
| 50 | 86 | 0,63 s | 0,99 s | 0 |
| 100 | 88 | 1,15 s | 2,14 s | 0 |

- Pojedyncze strony: start 98 zapytań/s, Kondycja 78/s, profil powiatu 57/s, Biblioteka 42/s (115 kart, 60 KB po kompresji).
- Jeden proces to dolna granica. Na Vercelu funkcje skalują się poziomo same. Na własnych serwerach 2–4 procesy za load balancerem dają kilkaset zapytań na sekundę, co z dużym zapasem wystarcza dla całego województwa (3,4 mln mieszkańców; zakładamy setki, a nie tysiące jednoczesnych użytkowników).
- Dane, które zmieniają się rzadko (IOSS, mapa wskaźników, profil powiatu, katalog), są trzymane w pamięci procesu (`lib/pamiec.ts`, 20 s–10 min). Przy wielu procesach każdy ma własną kopię. Przed użyciem IOSS, map i profili instancja sprawdza wspólną wersję importu w dzienniku (najwyższy identyfikator i liczba importów), najwyżej raz na 3 sekundy. Zmiana wersji unieważnia wszystkie te widoki; lokalny import unieważnia je od razu. To okno świeżości obejmuje wyłącznie zmiany przez import w Centrali; bezpośrednie zmiany SQL wymagają odświeżenia cache lub restartu.

**Zapytania z AI** są wolniejsze i droższe, dlatego mają osobne limity (`lib/limit.ts`: na adres i globalnie na godzinę):

Poniższe pomiary czasu, kosztów i trafności pochodzą z wcześniejszej wersji na Claude Haiku 4.5. Po przełączeniu na DeepSeek 4.10.2026 nie stanowią pomiaru nowego modelu; trzy nowe kontrole działania opisano w `HUB_TESTY.md`; nie stanowią one powtórzenia poniższego benchmarku.

| Funkcja | Czas (Haiku 4.5, pomiar 3.10.2026) |
|---|---|
| Swatka (dopasowanie) | 7–11 s, średnio 9,5 s (30 zapytań) |
| Pytanie do raportów, asystent, scenorys, wniosek | 4–9 s |
| Pracownia (analiza pomysłu) | ok. 40 s |
| Krawiec (plan wdrożenia) | ok. 75 s |

Przy dużym ruchu zadania długie (Krawiec, Pracownia) warto przenieść do kolejki (np. tabela zadań + worker), a użytkownikowi pokazywać postęp, jak teraz.

## 4. Koszty AI (pomiar)

Swatka na Haiku 4.5, 30 zapytań testowych: średnio ok. 34 200 tokenów odczytu z cache (instrukcja i katalog), ok. 60 tokenów wejścia, ok. 630 tokenów wyjścia. Cennik Anthropic (wrzesień 2026): Haiku 4.5 $1 wejście, $5 wyjście, $0,10 odczyt z cache, $2 zapis cache z TTL 1 h (za 1 mln tokenów).

- Jedno dopasowanie przy ciepłym cache: ok. **$0,0066 (ok. 2,5 gr)**.
- Zapis cache po wygaśnięciu: ok. $0,07, mniej więcej raz na godzinę ruchu.
- Trafność na Haiku 4.5: **Hit@3 96,6% (28/29)**, MRR 0,948. Tyle samo co na droższym Sonnecie 5.5. Wyniki: `docs/eval/`.

Pozostałe funkcje AI nie były mierzone tak samo. W tabeli kosztów na slajd podajemy tylko liczby z pomiaru.

## 5. Bezpieczeństwo i dane osobowe

- Maskowanie przed AI: PESEL, telefony, e-maile, adresy, numery kont i dokumentów, kody pocztowe, imiona ze słownika. Ograniczenie: rzadkie imiona mogą przejść (opis na `/zaufanie`).
- Telefon do oddzwonienia (tryb asystowany) jest w osobnym polu, nie w treści i nie trafia do AI.
- W logach nie zapisujemy treści zgłoszeń.
- Nagłówki: Content-Security-Policy (bez zewnętrznych skryptów; ramki tylko youtube-nocookie), `X-Frame-Options` (widżet jako jedyny wyjątek), HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Panel ROPS: sesja w podpisanym ciasteczku (`SESSION_SECRET`), produkcyjnie SSO Urzędu i role (pracownik, koordynator, ekspert).
- Webhooki: podpis HMAC-SHA256 z czasem, bez treści zgłoszeń, dziennik dostaw.
- Publiczne API: odczyt katalogu i naborów oraz matchmaking z limitem zapytań. Statystyki potrzeb są dostępne wyłącznie dla zalogowanego administratora (dodatkowo próg minimum 3 zgłoszeń).
- Do zrobienia przed produkcją: DPIA (ocena skutków dla ochrony danych), umowa powierzenia z dostawcą AI i hostingu, test penetracyjny, rotacja kluczy użytych w demo.

## 6. Integracje (gotowe w prototypie)

| Integracja | Gdzie | Opis |
|---|---|---|
| API v1 + OpenAPI 3.1 | `/api/v1/*`, `/api/v1/openapi.json`, `/integracje` | katalog, nabory, matchmaking; statystyki wyłącznie dla administratora |
| Webhooki HMAC | Centrala → Integracje | `sprawa.nowa`, `pomysl.nowy`, `nabor.zmiana`, `wniosek.zmiana`, `ogloszenie.nowe`; odbiornik testowy w demo |
| Eksport do bazy grantowej | `/api/admin/eksport/wnioski` (`?nowe=1`) | JSON z numerem sprawy, etapami oceny i decyzją; GET nie zmienia statusu, POST potwierdza odbiór |
| Eksport zgłoszeń | `/api/admin/eksport/zgloszenia` | CSV, treść zamaskowana |
| Widżet „Znajdź pomoc” | `/widzet?powiat=…` | jedna linijka `<iframe>` na stronę gminy, OPS, biblioteki |
| Powiadomienia | `lib/powiadomienia.ts` | jedna magistrala: aplikacja, e-mail, SMS (adapter), webhooki |

## 7. Wdrożenie krok po kroku

1. Baza: utwórz PostgreSQL 16, uruchom `db/schema.sql`, potem migracje `db/002_…sql` do `db/014_…sql` w kolejności.
2. Dane: `npx tsx --env-file=.env.local scripts/seed.ts` (Biblioteka, IOSS, Mapa Wyzwań, nabory, eksperci). Dane demo: `scripts/seed-*.ts`, czyszczenie: `scripts/reset-demo.ts`.
3. Zmienne środowiskowe (`.env.local` lokalnie, ustawienia projektu w hostingu):
   - `DATABASE_URL`: połączenie z bazą;
   - `DEEPSEEK_API_KEY`: klucz do DeepSeek API;
   - `AI_MODEL`: domyślnie `deepseek-flash`; stare wartości `claude-*` są ignorowane;
   - `SESSION_SECRET`: co najmniej 16 losowych znaków;
   - `DEMO_ADMIN_PASSWORD`: hasło do Centrali w demo;
   - `SPLOT_URL`: publiczny adres (linki w webhookach i kodach QR).
   Przy przejściu z Claude ustaw na Vercelu `DEEPSEEK_API_KEY` i zmień `AI_MODEL` na `deepseek-flash` (albo usuń `AI_MODEL`, aby użyć wartości domyślnej). `.env.local` jest ignorowany przez Git i nie przenosi tych zmiennych na hosting. Wszystkie wywołania przechodzą przez DeepSeek JSON Output i lokalną walidację zod. Oficjalna dokumentacja: [JSON Output](https://api-docs.deepseek.com/guides/json_mode/), [modele](https://api-docs.deepseek.com/quick_start/pricing/).
4. Budowanie: `npm ci && npm run build && npm start`. Na istniejącym demo Vercela wystarczy push do podłączonego repozytorium: `vercel.json` uruchamia `npm run build:vercel`, czyli migracje 013–014 przez `DATABASE_URL`, następnie build aplikacji.
5. Kontrola: `npx tsc --noEmit`, `npm run lint`, `scripts/a11y-i-zrzuty.ts` (axe, WCAG 2.1 AA), `scripts/szerokosc-320.ts` (reflow), `scripts/eval-swatka.ts` (trafność).

## 8. Inne województwo albo inny ośrodek

Splot nie ma Małopolski wpisanej na sztywno w logice. Do zmiany:

1. Katalog innowacji: import kart (skrypt albo „Dodaj innowację” w Centrali z odczytem przez AI).
2. Wskaźniki: tabela `ioss` (wskaźnik, powiat, rok, wartość) z regionalnego obserwatorium; lista powiatów w `lib/powiaty.ts`, układ kafelków mapy w `components/wiedza/uklad.ts`.
3. Obszary wyzwań: `lib/obszary.ts` i `data/mapa_wyzwan.json`.
4. Nabory i karta oceny: `data/nabory_rops.json`; nowy nabór dodaje się w Centrali (AI odczytuje formularz z regulaminu).
5. Teksty: `messages/pl.json` (nazwa ośrodka, kontakty); język ukraiński w `messages/uk.json`.

## 9. Utrzymanie (zasoby)

To szacunek zespołu, a nie pomiar. Do potwierdzenia w pilotażu.

| Zadanie | Kto | Czas |
|---|---|---|
| Moderacja zgłoszeń i odpowiedzi | pracownik ROPS | zależnie od liczby spraw; AI przygotowuje szkic odpowiedzi |
| Aktualizacja Biblioteki i naborów | koordynator Hubu | ok. 2 h tygodniowo |
| Aktualizacja IOSS | analityk | raz w roku (import) |
| Utrzymanie techniczne (aktualizacje, kopie, monitoring) | wykonawca IT | ok. 8 h miesięcznie |
| Audyt dostępności i bezpieczeństwa | zewnętrznie | raz w roku |

## Aktualizacja wiedzy i odtwarzanie środowiska

- **Materiały edukacyjne** (`/centrala/akademia`): treść, wersja łatwa, quiz i źródła. Zapis szkicu zachowuje publiczną wersję; publikacja aktualizuje ją bez restartu. Konflikt równoczesnej edycji nie nadpisuje cudzej pracy. Zapis i dziennik działają w jednej transakcji.
- **Dane IOSS** (`/centrala/dane`): UTF-8 CSV z sześcioma kolumnami zgodnymi z `data/zrodla/ioss_powiaty.csv`. Administrator ogląda podgląd przed zatwierdzeniem. Cały plik przechodzi walidację; błąd albo awaria dziennika wycofuje cały import. Podpis podglądu wiąże zatwierdzenie z dokładnie sprawdzonym plikiem. Limit 1 MB, 10 000 wierszy.
- Nowe migracje: `013_akademia.sql` (szkice/publikacje oraz RLS), `014_odtwarzalnosc.sql` (brakujące `nabory.schemat`, generator wniosków). Na Vercelu wykonują się automatycznie przed buildem, przez istniejące `DATABASE_URL`. Nie trzeba ręcznie wykonywać SQL. Na czystej bazie najpierw `schema.sql`, potem wszystkie numerowane migracje rosnąco; automatyczny krok aktualizuje istniejące demo z migracjami do 012. Migracje sprawdzono również przy ponownym zastosowaniu.
- Nie zmieniono modelu AI i nie dodano zależności produkcyjnych. E-mail oraz SMS nadal są symulowane.

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Konfiguracja Vercela jest w repozytorium i nadpisuje polecenie builda w panelu ([dokumentacja `buildCommand`](https://vercel.com/docs/project-configuration/vercel-json#buildcommand)). `scripts/migruj.mjs` używa istniejącego sterownika `pg`, nie wymaga `psql` ani nowych zależności. Migruje w jednej transakcji z blokadą `pg_advisory_xact_lock`, zgodną z poolerem transakcyjnym Supabase. Dziennik `public.splot_migracje` z RLS przechowuje sumy SHA256, więc kolejne wdrożenia pomijają zastosowane pliki. Migracje wykonane wcześniej ręcznie są bezpiecznie ponawiane przez `IF NOT EXISTS`, a następnie zapisane w dzienniku. Błąd połączenia, uprawnień albo SQL zatrzymuje build; nie publikujemy aplikacji z niepełną migracją. `DATABASE_URL` musi być dostępne również podczas builda i wskazywać rolę właściciela istniejącej bazy.

Przy wdrożeniu poza Vercelem migracje można wykonać jawnie: `node --env-file=.env.local scripts/migruj.mjs`. Zwykłe `npm run build` nie łączy się z bazą w celu migracji.

`npm test` uruchamia testy walidacji i logiki; testy bazy są pomijane bez jawnej konfiguracji testowej. Pełny przebieg wymaga odrębnej bazy (nigdy współdzielonego demo): `DATABASE_URL`, `IOSS_TEST_DATABASE_URL`, `SCHEMA_TEST_DATABASE_URL`. Test Akademii dodatkowo wymusza lokalny `localhost:55432/splot_test`. `SCHEMA_TEST_WITHOUT_VECTOR=1` pozwala testować migracje lokalnie bez pgvector, jawnie zamieniając wyłącznie nieużywaną w tych testach kolumnę embedding na text; nie stanowi to testu wyszukiwania wektorowego.

Test pełnej komunikacji (ręczny pomysł → Centrala → odpowiedź → autor, bez płatnego AI): `SPLOT_TEST_BAZA_LOCALNA=1 DEMO_ADMIN_PASSWORD=… npx tsx scripts/komunikacja-test.ts http://localhost:3100`. Test zapisuje syntetyczną sprawę; uruchamiaj tylko z osobną lokalną bazą. Pełne Chromium jest potrzebne do testu natywnego `Notification` (Headless Shell zwraca odmowę mimo nadanych uprawnień).

Skrypty przeglądarkowe korzystają z systemowego Chrome lub cache Playwright. Można podać `SPLOT_BROWSER_PATH` albo `SPLOT_BROWSER_CHANNEL`. Testy axe, 320 px i klawiatury kończą się niezerowym kodem przy naruszeniach oraz odrzucają błędne odpowiedzi HTTP. `--bez-zrzutow` w teście axe zachowuje istniejące zrzuty.


## Aktualizacja zgodności z hub.pdf (4.10.2026)

Szczegółowa macierz, bieżące wyniki testów i ograniczenia: [HUB_ZGODNOSC.md](HUB_ZGODNOSC.md). Historia wcześniejszych pomiarów powyżej nie stanowi testu obciążenia ani jakości AI tej wersji.

- Lokalny katalog raportów/publikacji: `/wiedza/materialy`, 57 plików PDF zweryfikowanych u wydawcy, metadane i 15 opracowań wybranych fragmentów. Pełne PDF pozostają u ROPS.
- Odświeżanie: `python3 scripts/scrape_biblioteka.py`, `python3 scripts/scrape_ioss.py`, `python3 scripts/scrape_materialy.py` (ostatni wymaga `pypdf`; opcjonalnie `--pdf-library /path/to/pypdf.whl`). Przegląd zmian przed publikacją: zakres, rok danych, dane osobowe, poprawność cytowań. Nowy hash PDF wyłącza stare opracowanie do czasu ponownego sprawdzenia.
- Źródła pobierane są podczas przygotowania wersji, nie w żądaniu użytkownika. Nieaktualna kopia nie może być opisywana jako dane na żywo. IOSS odczytuje zaznaczony rok wykresu, nie pierwszy rok z listy.
- Hasło eksperckie jest prywatne (`DEMO_EKSPERT_PASSWORD`). Domyślne hasło demonstracyjne istnieje tylko z jawnym `SPLOT_PUBLIC_DEMO=1`; ten tryb wolno stosować wyłącznie z danymi syntetycznymi.
- Integrator po trwałym imporcie wniosków wywołuje `POST /api/admin/eksport/wnioski` z JSON `{"odebrane":["uuid-wniosku"]}`. Ponowione potwierdzenie nie zmienia pierwotnej daty. Samo pobranie `GET ?nowe=1` nie potwierdza doręczenia.
- Baza testowa tego przeglądu jest osobna od środowiska głównego. Test bez pgvector nie jest walidacją wyszukiwania wektorowego.
