# Przekazanie dla kolejnej sesji (stan: 4.10.2026, ok. 1:00; oddanie do 11:00)

Przeczytaj najpierw: `CLAUDE.md` (zasady), `~/Downloads/hub.pdf` (wymagania i kryteria oceny), ten plik. `PLAN.md` rozdz. 1a–1c i `DROGA_DO_90.md` to tło (część zadań z nich jest już zrobiona, patrz niżej).

## 0. Najważniejsze w 30 sekund

- Aplikacja **Splot** (Next.js 16, React 19, Tailwind 4, PostgreSQL/Supabase, Anthropic API) ma wszystkie 7 modułów z PDF i sporo ponad. Działa lokalnie: `npm run dev` (port 3000).
- **Nic od commita `2d4e1d0` nie jest wypchnięte** (ok. 25 commitów). `git push` uruchamia wdrożenie na Vercelu. Przed pushem zapytaj użytkownika i przypomnij o zmiennych na Vercelu (rozdz. 5).
- **Model AI: `claude-haiku-4-5`** (decyzja użytkownika: tańszy). `lib/ai.ts` nie wysyła `effort` do Haiku. Trafność Swatki zmierzona na Haiku: Hit@3 96,6% (28/29), tyle samo co na Sonnecie 5.5.
- Użytkownik **nie chce** pracy nad slajdami, filmem ani opisem. Chce rozwijać aplikację pod maksimum punktów z PDF. Nie buduj liczenia kosztów AI w aplikacji (odrzucił to).
- Niezacommitowana zmiana w chwili przerwania: powiadomienia na pulpicie w Centrali (rozdz. 3, punkt 1).

## 1. Zasady, których pilnuj (z `CLAUDE.md` i doświadczeń tej sesji)

- Teksty interfejsu do `messages/pl.json` (next-intl); ścieżka mieszkańca także `messages/uk.json` (brakujące klucze UA wracają do PL). Centrala i część starych stron mają teksty na sztywno (B-12, dług techniczny).
- Model AI tylko przez `lib/ai.ts` → `zapytajJson({ schemat, system, uzytkownik, ... })` (strukturalne wyjście zod). Tekst od użytkownika zawsze przez `zamaskuj()` z `lib/maskowanie.ts`. Nie loguj treści zgłoszeń.
- **Haiku i enumy:** SDK przekazuje `z.enum` modelowi tylko jako podpowiedź w opisie, więc Haiku czasem wymyśla wartość i cała odpowiedź pada. Na polach z AI używaj `.catch(...)` i filtruj (wzór: `lib/swatka.ts` stała `NIEZNANE`, `lib/krawiec.ts` `dopasujKompas`, `lib/pracownia.ts`).
- **Haiku i język:** przy odpowiedzi po ukraińsku dopisz wprost w wiadomości użytkownika „WAŻNE: odpowiedz po ukraińsku” (wzór: `lib/prosciej.ts`, `lib/swatka.ts`), inaczej odpowiada po polsku.
- Dostępność (20% oceny): cele min. 48 px, widoczny fokus, **żadnych `<select>`** (używaj `components/ui/wybor.tsx`, raport dostępności to deklaruje), ikony z tekstem, `role="status"` dla komunikatów, długie AI z `components/ui/postep.tsx`. Element `sr-only` w kontenerze z `overflow-x-auto` wymaga `relative` na kontenerze (inaczej poszerza stronę).
- Komponenty klienckie nie mogą importować modułów z `db` (np. `lib/siec.ts`); stałe dla klienta trzymaj w osobnych plikach (`lib/siec-stale.ts`, `lib/krawiec-stale.ts`, `lib/sprawy-etykiety.ts`).
- Dane demo są syntetyczne. **Nie wpisuj do bazy zmyślonych faktów o Małopolsce** (w tej sesji testowe fakty z wymyślonego raportu zostały usunięte).
- Licencje zależności: tylko MIT/Apache/BSD/ISC dla kodu aplikacji (`docs/zaleznosci.md`).
- Migracje SQL stosuj ręcznie: `set -a; source .env.local; set +a; psql "$DATABASE_URL" -f db/0XX_...sql`. Baza jest wspólna dla dev i demo.
- `pkill -f "next start"` zabija też powłokę narzędzia; serwer testowy zatrzymuj przez PID z `ss -ltnp | grep :3100`.

## 2. Co jest zrobione (mapa na wymagania PDF)

### Moduły z PDF §2
| PDF | Gdzie | Stan |
|---|---|---|
| I. Matchmaking (obowiązkowy) | `/`, `/problem`, `/rozmowa` (głos), `/widzet`, API `/api/v1/dopasuj` | Swatka: nici potrzeb, uzasadnienia, podobne sprawy, fakty z raportów, tryb awaryjny bez AI, wykrywanie kryzysu bez AI, UA. Hit@3 96,6% |
| II. Zasobnik wiedzy | `/wiedza/biblioteka` (rzędy tematyczne, filmy, porównywarka, „Wyjaśnij prościej” i UA na karcie), `/wiedza/malopolska` (Kondycja, mapa IOSS, „Zapytaj raporty”), `/wiedza/akademia`, `/wiedza/powiat/[slug]` (22 profile), `/galeria` | **Szybka aktualizacja danych:** Centrala → Treści: import innowacji z tekstu (AI), edytor kart, **fakty z raportów (AI wyciąga z wklejonego fragmentu, pracownik zatwierdza)** → od razu w Kondycji, „Zapytaj raporty”, Swatce, Krawcu. Trendy tylko dla admina (Radar, Puls) |
| III. Kreator pomysłów | `/pomysl` | Fiszka (stale), kanwa INNO AGH, ocena wg karty IWS 2.0, asystent (pytania, podpowiedzi do kanwy), scenorys, **szkic rozwiązania SVG** (wizualizacja przedmiotu, `lib/szkic.ts`, biała lista elementów, pokazywany jako `<img>`), plakat z QR, generator wniosku pod konkretny nabór (gdy nabór otwarty) |
| IV. Tester innowacji | `/testy` | Zapisy na testy, oceny, pole „Co warto usprawnić?”, ogłoszenia testów |
| V. Platforma komunikacji | `/rynek`, `/moje`, `/ekspert`, **`/siec`** | Pytania do ROPS i ekspertów, wątki, panel eksperta, partnerstwa, **Sieć liderów innowacji** (PDF §9; autorzy z Biblioteki + organizacje po weryfikacji ROPS, filtry poczwórnej helisy, kontakt przez Hub jako sprawa z numerem, mapa planów wdrożenia, 6 liderów demo `scripts/seed-siec.ts`) |
| VI. Panel administratora | `/centrala/*` (hasło `DEMO_ADMIN_PASSWORD`) | Skrzynka (odpytywanie co 3 s, dźwięk, baner), karta sprawy z oceną AI (samoodświeżanie), Radar, Puls Małopolski (raport miesięczny do druku), Nabory i ocena wniosków, Treści (import, edycja, fakty, weryfikacja liderów, dziennik zmian), Powiadomienia, Integracje (webhooki) |
| VII. Middleman | `/wdrozenie`, `/wdrozenie/plan/[id]` | Krawiec 2.0: plan wdrożenia, warianty minimum/pełny z kosztem na odbiorcę, kompas deinstytucjonalizacji, kwalifikowalność, pakiet startowy, pierwsze 30 dni, **konsultacja planu z ekspertem** (sprawa trafia do panelu eksperta z linkiem do planu; ekspert polecany wg obszaru) |

### Wymagania techniczne i walidacja (PDF §3, §5, §6)
- **Powiadomienia o nowych pomysłach i zmianach naborów:** magistrala `lib/powiadomienia.ts` (Centrala + skrzynka nadawcza; e-mail/SMS symulowane) + **webhooki HMAC** (`lib/webhooki.ts`, zdarzenia `sprawa.nowa`, `pomysl.nowy`, `nabor.zmiana`, `wniosek.zmiana`, `ogloszenie.nowe`, odbiornik testowy `/api/v1/odbiornik-testowy/[id]`).
- **Ścieżka odpowiedzi do autora:** „Moje sprawy” `/moje/[numer]` (oś czasu, odpowiedzi, ocena pomocy, czas pierwszej odpowiedzi), **droga wniosku** (złożony → ocena formalna → merytoryczna → decyzja), **karta potrzeby do druku z QR** `/moje/[numer]/karta`.
- **Integracja z bazą grantową:** eksport `/api/admin/eksport/wnioski?nowe=1` (z numerem sprawy, etapami, decyzją), API v1 + OpenAPI 3.1 (`/integracje`, `/api/v1/openapi.json`), widżet „Znajdź pomoc” (iframe).
- **Skalowalność:** `docs/WDROZENIE.md` (test obciążenia: 86 zapytań/s na 1 procesie, 0 błędów; cache w pamięci `lib/pamiec.ts`).
- **Bezpieczeństwo:** CSP (wyjątek ramek dla `/widzet`), HSTS, maskowanie, limity zapytań, sesje podpisane, dziennik zmian.
- **WCAG 2.1 AA:** axe 0 naruszeń (33 strony × 3 tryby), 320 px bez przewijania, test klawiatury OK (`docs/raport-dostepnosci.md`, skrypty `scripts/a11y-i-zrzuty.ts --tryby`, `scripts/szerokosc-320.ts`, `scripts/klawiatura.ts`). Tryb asystowany `/asystowane` (OPS zgłasza w imieniu osoby bez internetu, telefon poza treścią).
- Ścieżka dla Jury: `/ocena` (4 testy z PDF + sekcja gotowości do wdrożenia).

### Dokumenty w repo
`docs/WDROZENIE.md`, `docs/zaleznosci.md`, `docs/raport-dostepnosci.md`, `docs/eval/` (pomiary Swatki), `README.md` (status modułów). PLAN.md zaktualizowany o model Haiku.

## 3. Rozgrzebane w chwili przerwania

1. **Powiadomienia na pulpicie w Centrali** (`components/centrala/skrzynka.tsx`: `naPulpit()`, `PrzelacznikPulpitu`, klucze `centralaPulpit` w `messages/pl.json`). Przełącznik się renderuje, baner „Nowa sprawa” działa, odpytywanie stabilne (bez pętli). **Nie potwierdzono**, że `new Notification(...)` faktycznie się wywołuje (test z atrapą w Playwright zwracał pustą listę; możliwa przyczyna: atrapa, a nie kod). Sprawdź ręcznie w Chrome: zezwól na powiadomienia, w drugiej karcie wyślij zgłoszenie, powinno pojawić się powiadomienie systemowe. Jeśli działa, zostaw; jeśli nie, debuguj (`pageerror`) albo usuń.
2. Po wcześniejszych testach w bazie są testowe sprawy (np. „Test powiadomienia na pulpicie…”, konsultacja SPL-AUCDA95U, wniosek „Sąsiedzka herbatka (test)”). Usunie je `npx tsx --env-file=.env.local scripts/reset-demo.ts` (zachowuje dane syntetyczne, liderów demo; czyści webhooki, fakty dodane, liderów z formularza).

## 4. Czego brakuje i w którą stronę iść (priorytety pod punkty z PDF §8)

Kryteria: spełnienie wyzwania 40% (jakość + liczba modułów), potencjał wdrożeniowy 20%, dostępność i intuicyjność 20%, UI/pomysłowość 10%, materiały 10%.

**P0 (przed oddaniem, decyduje o ocenie):**
1. Wdrożenie: zmienne na Vercelu, `git push`, test na telefonie (rozdz. 5). Bez działającego linku demo nie ma oceny.
2. Regresja po ostatnich zmianach: `npx tsc --noEmit && npm run lint`, axe z `--tryby`, 320 px, klawiatura (lista stron w `scripts/strony.ts`, `/siec` już dopisana). Nowe strony tej nocy: `/siec`, sekcje w `/centrala/tresci` (fakty, liderzy), konsultacja na planie Krawca, szkic w Pracowni.
3. `scripts/reset-demo.ts`, potem `scripts/seed-siec.ts` (jeśli liderzy demo zniknęli), na wdrożonym adresie w Centrali → Integracje „Dodaj odbiornik demonstracyjny”, jedno zapytanie w Swatce (rozgrzanie cache).

**P1 (najwięcej punktów za mało pracy):**
- **Intuicyjność dla seniora (20%):** przejdź ścieżki mieszkańca w trybie prostym i dużym tekście na 320 px i popraw to, co niezrozumiałe. Sprawdź, czy z każdej strony jest jasny „następny krok”.
- **B-12:** przenieś teksty na sztywno do `messages/pl.json` w `/ocena`, `/dostepnosc`, `/zaufanie`, `/wiedza/malopolska`, Centrali, panelu eksperta (zgodność z CLAUDE.md; jakość kodu).
- **Akademia (materiały edukacyjne):** lekcje są w `data/akademia.json` na sztywno; dodaj w Centrali dodawanie/edycję lekcji (wymóg „szybka aktualizacja danych” obejmuje materiały edukacyjne).
- **IOSS:** import nowych danych wskaźników z CSV w Centrali (po imporcie `zapomnij("ioss")`, `zapomnij("mapa-wskaznikow")`, profile `profil-powiatu:*`).
- **Wersja ukraińska:** dopisz brakujące klucze UA dla nowych ekranów mieszkańca (`siec`, `asystowane`, `karta` jest, `wiedza.rzad*` jest).
- **E-mail naprawdę:** adapter SMTP/Resend w `lib/powiadomienia.ts` (tylko jeśli użytkownik da klucz; inaczej zostaje symulacja i uczciwy opis).

**P2 (pomysłowość, jeśli czas):**
- Szkic (`lib/szkic.ts`) na Haiku bywa prosty; można dodać „Popraw szkic” (druga iteracja z uwagami użytkownika).
- Sieć liderów: dopasowanie „kto pasuje do mojego pomysłu” (fiszka → liderzy z tego obszaru i sektora, którego brakuje w poczwórnej helisie).
- Powiadomienie autora pomysłu, gdy w sieci pojawi się lider z jego obszaru.
- Test z ludźmi (5 osób, 3 zadania) i czytnik ekranu: wpisz do `docs/raport-dostepnosci.md` tylko po faktycznym wykonaniu.

## 5. Wdrożenie (Vercel) – lista kontrolna

- Zmienne: `AI_MODEL=claude-haiku-4-5` (albo usuń; domyślnie Haiku), `ANTHROPIC_API_KEY`, `DATABASE_URL`, `SESSION_SECRET` (min. 16 znaków), `DEMO_ADMIN_PASSWORD`, opcjonalnie `SPLOT_URL` (linki w webhookach), `DEMO_EKSPERT_PASSWORD` (domyślnie `ekspert-demo`).
- Migracje `db/010_integracje.sql`, `db/011_siec.sql`, `db/012_fakty.sql` są już zastosowane w bazie Supabase.
- Limity czasu funkcji: Krawiec ok. 75 s (`maxDuration = 120`), Pracownia ok. 40 s, szkic ok. 25 s (`maxDuration = 90` w asystencie).

## 6. Uczciwość materiałów (nie łam tego)

- E-mail i SMS są symulowane; logowanie hasłem demo; tłumaczenia UA maszynowe; brak testu z czytnikiem ekranu i z ludźmi; „czas rzeczywisty” to odpytywanie co 3–4 s.
- Koszt AI z pomiaru: ok. 2,5 gr za dopasowanie na Haiku (`docs/WDROZENIE.md` rozdz. 4). Godziny utrzymania to szacunek. Nie podawaj liczb, których nie zmierzono („Lighthouse 100”, „PL/UA/EN”, „test z seniorem”).
- Haiku robi czasem błędy językowe w tekstach AI; trafność dopasowania zmierzona i taka sama jak na Sonnecie.

## 7. Przydatne polecenia

```
npm run dev                                                   # port 3000
npx tsc --noEmit && npm run lint
npx tsx --env-file=.env.local scripts/a11y-i-zrzuty.ts http://localhost:3000 --tryby
npx tsx --env-file=.env.local scripts/szerokosc-320.ts
npm run build && npx next start -p 3100                       # wersja produkcyjna do testów
npx tsx --env-file=.env.local scripts/klawiatura.ts http://localhost:3100
node scripts/obciazenie.mjs http://localhost:3100 50 20
npx tsx --env-file=.env.local scripts/eval-swatka.ts          # trafność (ok. 5 min, ok. $0,20 na Haiku)
npx tsx --env-file=.env.local scripts/reset-demo.ts
npx tsx --env-file=.env.local scripts/seed-siec.ts
npx next typegen                                              # po dodaniu tras (typy PageProps)
```
