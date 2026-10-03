# Co dalej: stan na 4.10.2026, noc (do oddania do 11:00)

Wklej do nowej sesji: `PLAN.md` (rozdz. 1a–1c), `DROGA_DO_90.md`, ten plik oraz `CLAUDE.md`. Zasady z `CLAUDE.md` obowiązują (teksty w `messages/`, AI tylko przez `lib/ai.ts`, maskowanie przed AI, WCAG 2.1 AA, licencje MIT/Apache/BSD/ISC).

## Stan w jednym akapicie
Wszystkie 7 modułów działa lokalnie (`npm run dev`, port 3000). Ostatni commit zawiera ścieżkę oceny `/ocena`, strony zaufania i reset danych demo. **Commity po `3410205` nie są wypchnięte** (`git push` uruchomi wdrożenie na Vercelu). Baza Supabase ma jeszcze dane testowe z prób (zostaną usunięte przez `scripts/reset-demo.ts`). Hasło do Centrali: `DEMO_ADMIN_PASSWORD` z `.env.local`; hasło eksperta demo: `ekspert-demo`.

## P0: zrób najpierw (ok. 1–1,5 h)
1. **Regresja po dużych zmianach:** `npx tsc --noEmit`, `npm run lint`, `npx tsx --env-file=.env.local scripts/a11y-i-zrzuty.ts http://localhost:3000` (axe; dodaj nowe strony: `/galeria`, `/ekspert`, `/rozmowa`, `/ocena`, `/zaufanie`, `/dostepnosc`, `/latwy`, `/wiedza/akademia`, `/wiedza/powiat/olkuski`, `/centrala/powiadomienia`, `/centrala/nabory`) oraz `scripts/szerokosc-320.ts`. Dodaj te strony do list w skryptach. Napraw naruszenia (kontrast, etykiety, `aria`).
2. **Wdrożenie (M-01):** `git push`; na Vercelu sprawdź zmienne: `SESSION_SECRET` (min. 16 znaków, inaczej logowanie do Centrali rzuci błąd), `DEMO_ADMIN_PASSWORD`, `ANTHROPIC_API_KEY`, `AI_MODEL`, `DATABASE_URL`. Migracje `db/004`…`db/009` są już zastosowane w bazie Supabase (ta sama baza dla dev i demo). Sprawdź limit czasu funkcji (Krawiec i Pracownia do 120 s), test w incognito na telefonie.
3. **Wypełnij na demo ścieżkę „Test 4”:** sprawdź w Centrali (Radar → temat naboru; Treści → dodaj innowację → „Kogo ta innowacja może ucieszyć?”). Dodaj do demo 1–2 ręczne zgłoszenia w obszarze seniorów z powiatu olkuskiego bez rozwiązania, żeby biała plama była widoczna.
4. **Przed oddaniem i przed finałem:** `npx tsx --env-file=.env.local scripts/reset-demo.ts`, potem jedno zapytanie w Swatce (rozgrzanie cache).

## P1: brakujące wymagania i poprawki
- **B-10 postęp przy długich zapytaniach** (Pracownia ~30 s, Krawiec ~60 s): kroki w `role="status"`.
- **B-12 teksty na sztywno** w Centrali, statusach, Kondycji, „Zapytaj raporty”, Radarze: przenieś do `messages/pl.json` (UA tylko dla ścieżki mieszkańca).
- **B-14 listy `<select>`** (Rynek, Kondycja, import) zamień na przyciski radio.
- **B-15 przyciski A/A+/A++** 41 px → 48 px (`components/a11y/pasek-dostepnosci.tsx`).
- **B-16 automatyczne odświeżanie** karty zgłoszenia w Centrali, gdy ocena AI jest w toku.
- **B-17 nieaktualne materiały:** zrzuty w `docs/zrzuty` (kafelki „Wkrótce”), README („Status modułów”), PLAN rozdz. 14.2 (model domyślny Sonnet 5.5), PLAN rozdz. 16 (koszt z pomiaru: 43 tys. tokenów cache, ok. 5,5 gr na dopasowanie, ok. 500 zł/mies. przy 5000 dopasowań; nici zwiększyły czas odpowiedzi do ok. 6–12 s).
- **B-18 `docs/zaleznosci.md`:** licencje bezpośrednie i pośrednie (MPL-2.0: axe-core, lightningcss, @vercel/og; LGPL-3.0: libvips przez sharp; MIT: qrcode). Element umowy.
- **B-20 nagłówek CSP** (dokumentacja w `node_modules/next/dist/docs/`).
- **W-63/W-64 dokumentacja integracji:** `docs/WDROZENIE.md` (architektura, skalowanie, test obciążenia stron bez AI, konfiguracja dla innych województw), strona z dokumentacją API (OpenAPI) dla `/api/v1/innowacje`, webhooki z podpisem HMAC (nowe zgłoszenie, nowy pomysł, zmiana naboru) i widżet „Znajdź pomoc” (iframe z parametrem powiatu) (I-14).
- **I-13 Krawiec 2.0:** dwa warianty (minimum/pełny) z kosztem na odbiorcę, pakiet startowy, „kompas DI” (część B karty IWS). Obecnie jest sprawdzenie kategorii naboru i wykluczeń.
- **I-06 prosty język:** wersje łatwe 115 kart (skrypt `scripts/etr-biblioteka.ts` przez `zapytajJson`, zapis w `data/`), przycisk „Wyjaśnij prościej”, przycisk „Przetłumacz (AI)” przy kartach.
- **I-16 tryb asystowany i papier:** zgłoszenie w imieniu osoby (kanał `asystowane`), wydruk „Karty potrzeby” z kodem QR do statusu.
- **I-17 Puls Małopolski** (raport miesięczny do druku), **I-19** rzędy według kategorii w Bibliotece, **I-20** sieć liderów (jeśli zostanie czas).
- **W-35** statusy wniosku w „Moje sprawy” (złożony / w ocenie / decyzja) i eksport wniosków do bazy grantowej z numerem sprawy.
- **Test klawiaturą** trzech ścieżek i **test ręczny czytnika ekranu** (NVDA/VoiceOver): wpisz wyniki do `docs/raport-dostepnosci.md` (plik do utworzenia; deklaracja `/dostepnosc` już się do niego odwołuje, więc zrób go uczciwie: tylko to, co faktycznie sprawdzono).
- **M-09 test z ludźmi** (5 osób, 3 zadania, czasy), jeśli się da na HackYeah.

## Materiały do oddania (tego jeszcze nie ma, rób od ok. 8:00)
- **M-03 makiety w Figmie** (plik `pxtlOeWsjdigHdpwz4sYx3`): dodaj ekrany Swatki z nićmi, status „jak paczka”, Centralę (skrzynka, Radar, powiadomienia), Pracownię (kanwa, scenorys), profil powiatu, rozmowę głosową, galerię; adnotacje dostępności; eksport PNG do `docs/makiety/`; link „dostęp przez link”, bez publikacji w Community.
- **M-04 opis** (Załącznik B w `DROGA_DO_90.md` jest szkicem; krótkie pola do formularza draftu były już przygotowane), **M-05 PDF 10 slajdów**, **M-06 film MP4 ≤ 3:00 z napisami** (kolejność według testów Jury w `DROGA_DO_90.md` M-06), **M-07 koszty i zasoby** (rozdz. 9 + godziny ludzi).
- **R-01:** potwierdź u organizatorów, że asystenci AI do kodowania są dozwoleni (umowa wymaga oświadczenia o „wykonaniu osobiście”), zapisz odpowiedź.
- Po hackathonie: **zrotuj klucze** (Supabase DB, anon, service_role; klucz Anthropic), bo były wklejane w rozmowie.

## Znane luki i uczciwość materiałów
- E-mail i SMS tylko symulowane; panel pracowników i ekspertów chroni hasło demo; tłumaczenie UA jest maszynowe; brak testu z czytnikiem ekranu i z ludźmi; q30 w pomiarze Swatki nadal dostaje propozycję zamiast „brak”; „czas rzeczywisty” to odpytywanie co 3–4 s. Nie pisz w materiałach „Lighthouse 100”, „PL/UA/EN” (EN nie ma) ani „test z seniorem”, dopóki to nie jest prawda.
- Maskowanie imion opiera się na słowniku (rzadkie imiona mogą przejść). Karta AI (`/zaufanie`) to opisuje.

## Przydatne polecenia
```
npm run dev                       # port 3000
npx tsc --noEmit && npm run lint
npx tsx --env-file=.env.local scripts/eval-swatka.ts          # pomiar trafności (ok. 4 min, koszt AI)
npx tsx --env-file=.env.local scripts/a11y-i-zrzuty.ts http://localhost:3000
npx tsx --env-file=.env.local scripts/szerokosc-320.ts
npx tsx --env-file=.env.local scripts/reset-demo.ts
npx tsx --env-file=.env.local scripts/seed-galeria.ts         # galeria i numery ogłoszeń demo
npx next typegen                  # po dodaniu nowych tras (typy PageProps)
```
