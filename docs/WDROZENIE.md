# Wdrożenie Splotu: architektura, skalowanie, integracje

Stan na 3.10.2026. Dokument dla zespołu IT ROPS Kraków i przyszłego wykonawcy. Liczby w rozdz. 3 i 4 pochodzą z pomiarów opisanych przy każdej tabeli.

## 1. Architektura w jednym akapicie

Splot to jedna aplikacja Next.js 16 (React 19, TypeScript) z bazą PostgreSQL. Strony renderuje serwer, więc działają bez ciężkiego JavaScriptu na słabych telefonach. Model AI jest wywoływany tylko przez `lib/ai.ts` (funkcja `zapytajJson` ze strukturalną odpowiedzią i walidacją zod), a przed wysłaniem tekst przechodzi maskowanie danych osobowych (`lib/maskowanie.ts`). Każda funkcja AI ma tryb awaryjny albo czytelny komunikat błędu. Wykrywanie kryzysu i numery pomocy działają bez AI.

```
Przeglądarka / widżet na stronie gminy / systemy Hubu (API, webhooki)
        │
   Next.js (Vercel albo dowolny serwer Node 20+, kontener)
   ├─ strony i API (app/)                  ← bez AI: szybkie, cache w pamięci
   ├─ lib/ai.ts → model Claude (Anthropic) ← tylko tekst po maskowaniu
   ├─ lib/powiadomienia.ts → e-mail/SMS (adapter), webhooki HMAC
   └─ lib/db.ts → PostgreSQL (Supabase, UE)
```

| Warstwa | Demo | Produkcja (propozycja) |
|---|---|---|
| Aplikacja | Vercel (funkcje serwerowe, limit 120 s dla Krawca i Pracowni) | Vercel Pro albo 2 kontenery w chmurze w UE / w serwerowni Urzędu Marszałkowskiego |
| Baza | Supabase PostgreSQL (UE) | zarządzany PostgreSQL 16 w UE z kopią zapasową dzienną |
| AI | Claude Haiku 4.5 (Anthropic API) | to samo albo model w polskiej infrastrukturze (PLLuM, Bielik): podmiana jednego pliku `lib/ai.ts` |
| E-mail, SMS | symulowane (podgląd w Centrali) | adapter SMTP i bramka SMS w `lib/powiadomienia.ts` |
| Logowanie | hasło demo (Centrala, eksperci) | login.gov.pl dla mieszkańców (opcjonalnie), konta pracowników z SSO Urzędu |

## 2. Moduły i dane

- Kod: `app/` (strony i API), `components/` (interfejs), `lib/` (logika), `db/` (migracje SQL `schema.sql`, `002`…`010`), `scripts/` (import danych, testy).
- Dane startowe: Biblioteka Innowacji (115 kart), IOSS (149 wskaźników, 22 powiaty), Mapa Wyzwań (8 obszarów), karta oceny IWS 2.0, kanwa INNO AGH. Import: `scripts/scrape_biblioteka.py`, `scripts/scrape_ioss.py`, `scripts/seed.ts`.
- Treści zmienia pracownik w Centrali (Treści, Nabory). Każda zmiana trafia do dziennika (`dziennik`).

## 3. Wydajność i skalowanie (pomiar)

**Test obciążenia stron bez AI.** Wersja produkcyjna (`next build && next start`), **jeden proces Node** na laptopie (8 rdzeni), baza Supabase w UE przez internet. Ruch mieszany: strona główna, Biblioteka, karta innowacji, Kondycja Małopolski, profil powiatu, Galeria, API innowacji. Skrypt: `scripts/obciazenie.mjs`.

| Równolegli użytkownicy | Zapytań na sekundę | Mediana | 95. percentyl | Błędy |
|---|---|---|---|---|
| 50 | 86 | 0,63 s | 0,99 s | 0 |
| 100 | 88 | 1,15 s | 2,14 s | 0 |

- Pojedyncze strony: start 98 zapytań/s, Kondycja 78/s, profil powiatu 57/s, Biblioteka 42/s (115 kart, 60 KB po kompresji).
- Jeden proces to dolna granica. Na Vercelu funkcje skalują się poziomo same. Na własnych serwerach 2–4 procesy za load balancerem dają kilkaset zapytań na sekundę, co z dużym zapasem wystarcza dla całego województwa (3,4 mln mieszkańców; zakładamy setki, a nie tysiące jednoczesnych użytkowników).
- Dane, które zmieniają się rzadko (IOSS, mapa wskaźników, profil powiatu, katalog), są trzymane w pamięci procesu (`lib/pamiec.ts`, 20 s–10 min). Przy wielu procesach każdy ma własną kopię; to bezpieczne, bo dane są tylko do odczytu.

**Zapytania z AI** są wolniejsze i droższe, dlatego mają osobne limity (`lib/limit.ts`: na adres i globalnie na godzinę):

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
- Publiczne API: tylko odczyt katalogu, naborów i statystyk z progiem 3 zgłoszeń (k-anonimowość); matchmaking z limitem zapytań.
- Do zrobienia przed produkcją: DPIA (ocena skutków dla ochrony danych), umowa powierzenia z dostawcą AI i hostingu, test penetracyjny, rotacja kluczy użytych w demo.

## 6. Integracje (gotowe w prototypie)

| Integracja | Gdzie | Opis |
|---|---|---|
| API v1 + OpenAPI 3.1 | `/api/v1/*`, `/api/v1/openapi.json`, `/integracje` | katalog, nabory, statystyki potrzeb, matchmaking |
| Webhooki HMAC | Centrala → Integracje | `sprawa.nowa`, `pomysl.nowy`, `nabor.zmiana`, `wniosek.zmiana`, `ogloszenie.nowe`; odbiornik testowy w demo |
| Eksport do bazy grantowej | `/api/admin/eksport/wnioski` (`?nowe=1`) | JSON z numerem sprawy, etapami oceny i decyzją |
| Eksport zgłoszeń | `/api/admin/eksport/zgloszenia` | CSV, treść zamaskowana |
| Widżet „Znajdź pomoc” | `/widzet?powiat=…` | jedna linijka `<iframe>` na stronę gminy, OPS, biblioteki |
| Powiadomienia | `lib/powiadomienia.ts` | jedna magistrala: aplikacja, e-mail, SMS (adapter), webhooki |

## 7. Wdrożenie krok po kroku

1. Baza: utwórz PostgreSQL 16, uruchom `db/schema.sql`, potem migracje `db/002_…sql` do `db/010_…sql` w kolejności.
2. Dane: `npx tsx --env-file=.env.local scripts/seed.ts` (Biblioteka, IOSS, Mapa Wyzwań, nabory, eksperci). Dane demo: `scripts/seed-*.ts`, czyszczenie: `scripts/reset-demo.ts`.
3. Zmienne środowiskowe (`.env.local` lokalnie, ustawienia projektu w hostingu):
   - `DATABASE_URL`: połączenie z bazą;
   - `ANTHROPIC_API_KEY`: klucz do modelu AI;
   - `AI_MODEL`: domyślnie `claude-haiku-4-5`;
   - `SESSION_SECRET`: co najmniej 16 losowych znaków;
   - `DEMO_ADMIN_PASSWORD`: hasło do Centrali w demo;
   - `SPLOT_URL`: publiczny adres (linki w webhookach i kodach QR).
4. Budowanie: `npm ci && npm run build && npm start` (albo połączenie repozytorium z Vercelem).
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
