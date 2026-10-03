# Co dalej: stan na 3.10.2026, ok. 23:30 (do oddania do 11:00)

Wklej do nowej sesji: `PLAN.md` (rozdz. 1a–1c), `DROGA_DO_90.md`, ten plik oraz `CLAUDE.md`. Zasady z `CLAUDE.md` obowiązują (teksty w `messages/`, AI tylko przez `lib/ai.ts`, maskowanie przed AI, WCAG 2.1 AA, licencje MIT/Apache/BSD/ISC).

## Stan w jednym akapicie
Wszystkie 7 modułów działa lokalnie (`npm run dev`, port 3000). **Model AI: `claude-haiku-4-5`** (połowa ceny Sonneta 5.5; Hit@3 96,6% jak na Sonnecie; `lib/ai.ts` nie wysyła `effort` do Haiku). **Commity po `2d4e1d0` nie są wypchnięte** (`git push` uruchomi wdrożenie na Vercelu). Migracja `db/010_integracje.sql` jest już zastosowana w bazie Supabase (ta sama baza dla dev i demo). axe: 0 naruszeń na 33 stronach × 3 tryby; 320 px bez przewijania; test klawiatury OK (`docs/raport-dostepnosci.md`).

## Zrobione 3.10 wieczorem (ta sesja)
- B-10 postęp długich zapytań AI (`components/ui/postep.tsx`), B-14 przyciski radio zamiast `<select>` (`components/ui/wybor.tsx`), B-15 cele 48 px w pasku dostępności, B-16 samoodświeżanie oceny AI w Centrali, B-18 `docs/zaleznosci.md`, B-20 nagłówek CSP (wyjątek dla `/widzet`).
- W-63/W-64/I-14: API v1 (`/api/v1/innowacje`, `/innowacje/{id}`, `/nabory`, `/potrzeby`, `/dopasuj`, `/openapi.json`), strona `/integracje`, webhooki HMAC z dziennikiem dostaw i odbiornikiem testowym (Centrala → Integracje), widżet `/widzet?powiat=…`, `docs/WDROZENIE.md` (test obciążenia: 86 zapytań/s na 1 procesie, 0 błędów; koszt dopasowania ok. 2,5 gr z pomiaru).
- W-35: etapy wniosku (złożony → ocena formalna → merytoryczna → decyzja) w Centrali (Nabory) i w „Moje sprawy”, eksport do bazy grantowej z numerem sprawy (`?nowe=1`), zdarzenie `wniosek.zmiana`.
- I-13 Krawiec 2.0: warianty minimum/pełny z kosztem na odbiorcę, kompas DI, pakiet startowy, pierwsze 30 dni.
- I-16: `/asystowane` (zgłoszenie w imieniu osoby, telefon poza treścią), karta potrzeby z kodem QR `/moje/{numer}/karta`.
- I-06: „Wyjaśnij prościej” i tłumaczenie karty innowacji na ukraiński (`lib/prosciej.ts`, pamięć 24 h); Swatka wymusza język odpowiedzi.
- I-17: Puls Małopolski `/centrala/puls` (raport miesięczny do druku, bez AI). I-19: rzędy tematyczne w Bibliotece.
- Wydajność: `lib/pamiec.ts` (IOSS, mapa wskaźników, profil powiatu w pamięci); profil powiatu 10 → 57 zapytań/s.
- Odporność na mniejszy model: `.catch()` na identyfikatorach z AI (Swatka, Pracownia, scenorys), tolerancyjny kompas DI.

## P0: przed oddaniem
1. **Vercel:** ustaw `AI_MODEL=claude-haiku-4-5` (albo usuń zmienną; domyślnie jest Haiku), opcjonalnie `SPLOT_URL`. Sprawdź `SESSION_SECRET` (min. 16 znaków), `DEMO_ADMIN_PASSWORD`, `ANTHROPIC_API_KEY`, `DATABASE_URL`. Limit czasu funkcji: Krawiec ok. 75 s (limit 120 s).
2. `git push`, test w incognito na telefonie (Swatka, Pracownia, Krawiec, widżet, karta potrzeby).
3. `npx tsx --env-file=.env.local scripts/reset-demo.ts` (czyści też webhooki), potem w Centrali → Integracje „Dodaj odbiornik demonstracyjny” **na wdrożonym adresie** (adres odbiornika bierze się z domeny) i jedno zapytanie w Swatce (rozgrzanie cache).
4. Ścieżka „Test 4”: 1–2 zgłoszenia seniorów z powiatu olkuskiego bez rozwiązania (biała plama).

## P1: jeśli zostanie czas
- B-12 teksty na sztywno w Centrali i `/ocena` → `messages/pl.json`.
- I-20 sieć liderów (profile organizacji-autorów na mapie powiatów).
- Test z czytnikiem ekranu (NVDA/VoiceOver) i z ludźmi; wpisać wyniki do `docs/raport-dostepnosci.md` tylko po wykonaniu.
- Zrzuty w `docs/zrzuty` odświeża `scripts/a11y-i-zrzuty.ts` (bez `--tryby` robi zrzuty wszystkich stron).

## Materiały do oddania (rób od ok. 8:00)
- **M-03 makiety w Figmie** (plik `pxtlOeWsjdigHdpwz4sYx3`): dodać nowe ekrany (widżet, karta potrzeby, droga wniosku, Puls, Krawiec 2.0, rzędy Biblioteki).
- **M-04 opis**, **M-05 PDF 10 slajdów**, **M-06 film ≤ 3:00 z napisami**, **M-07 koszty i zasoby** (`docs/WDROZENIE.md` rozdz. 4 i 9 — koszt AI jest z pomiaru, godziny ludzi to szacunek i tak trzeba je opisać).
- R-01: potwierdź u organizatorów, że asystenci AI do kodowania są dozwoleni.
- Po hackathonie: zrotuj klucze (Supabase, Anthropic).

## Znane luki i uczciwość materiałów
- E-mail i SMS tylko symulowane; logowanie hasłem demo; tłumaczenia UA maszynowe; brak testu z czytnikiem ekranu i z ludźmi; „czas rzeczywisty” to odpytywanie co 3–4 s. Nie pisz „Lighthouse 100”, „PL/UA/EN” ani „test z seniorem”.
- Haiku czasem gorzej pisze po polsku (literówki w tekstach AI); trafność dopasowania zmierzona i taka sama.
- Maskowanie imion opiera się na słowniku (rzadkie imiona mogą przejść).

## Przydatne polecenia
```
npm run dev                       # port 3000
npx tsc --noEmit && npm run lint
npx tsx --env-file=.env.local scripts/eval-swatka.ts          # trafność (ok. 5 min, na Haiku ok. $0,20)
npx tsx --env-file=.env.local scripts/a11y-i-zrzuty.ts http://localhost:3000 --tryby
npx tsx --env-file=.env.local scripts/szerokosc-320.ts
npx tsx --env-file=.env.local scripts/klawiatura.ts http://localhost:3100   # na next start
node scripts/obciazenie.mjs http://localhost:3100 50 20                    # test obciążenia
npx tsx --env-file=.env.local scripts/reset-demo.ts
```
