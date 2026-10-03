# Splot – cyfrowe serce HubMI

HackYeah 2026, zadanie **HubMI.pl** (Województwo Małopolskie / ROPS Kraków).

Splot łączy każdą potrzebę zgłoszoną w Małopolsce ze sprawdzoną innowacją społeczną i z instytucją, która może ją wdrożyć. Gdy rozwiązania nie ma, potrzeba staje się białą plamą na mapie regionu, a ROPS dostaje gotowy temat następnego naboru.

**Pełny pomysł, dane i plan działania: [PLAN.md](PLAN.md)**

## Moduły

| Moduł z wyzwania | Nazwa w Splocie |
|---|---|
| Matchmaking społeczny (obowiązkowy) | Swatka |
| Zasobnik wiedzy | Skarbnica |
| Kreator pomysłów | Pracownia |
| Tester innowacji | Próbownia |
| Platforma aktywnej komunikacji | Rynek |
| Panel administratora | Centrala |
| Middleman Innowacji | Krawiec |

## Dane (`data/`)

| Plik | Zawartość |
|---|---|
| `zrodla/biblioteka_innowacji_rops.json` / `.csv` | 115 innowacji z Biblioteki ROPS (bez imion i nazwisk autorów) |
| `zrodla/ioss_powiaty.json` / `.csv` | 184 wskaźniki Obserwatora Statystyk Społecznych, 149 z danymi dla 22 powiatów |
| `mapa_wyzwan.json` | 8 obszarów i 9 person z Mapy Wyzwań Społecznych |
| `kanwa_inno_agh.json` | schemat kanwy INNO AGH (Social Innovation Canvas) |
| `nabory_rops.json` | formularz i karty oceny IWS 2.0, parametry naboru „Usługa Wrażliwa” |
| `kondycja_malopolski.json` | kluczowe fakty z raportów ROPS, GUS i NIK z numerami stron |
| `swatka_zestaw_testowy.json` | 30 zapytań do pomiaru trafności dopasowania |

Źródła danych: ROPS Kraków (Biblioteka Innowacji, Mapa Wyzwań, IOSS, raporty, kanwa INNO AGH), GUS, NIK. Linki w [PLAN.md, rozdział 24](PLAN.md#24-źródła). Odświeżenie danych: `python3 scripts/scrape_biblioteka.py` i `python3 scripts/scrape_ioss.py`.

## Status modułów (3.10.2026, wieczór)

| Moduł | Gdzie | Stan |
|---|---|---|
| I. Swatka (matchmaking) | `/`, `/problem`, `/rozmowa`, `/widzet` | tekst i głos, nici potrzeb, uzasadnienia, podobne sprawy, fakty z raportów, tryb awaryjny bez AI; Hit@3 96,6% (Haiku 4.5) |
| II. Skarbnica | `/wiedza/*`, `/galeria` | Biblioteka z filmami, Akademia ze szkicami i publikacją lekcji, Kondycja Małopolski, profile 22 powiatów; import IOSS z CSV w Centrali |
| III. Pracownia | `/pomysl` | fiszka, kanwa INNO AGH, ocena wg karty IWS 2.0, asystent i scenorys, wniosek pod konkretny nabór |
| IV. Próbownia | `/testy` | otwarte testy, zapisy, opinie |
| V. Rynek | `/rynek`, `/moje`, `/ekspert` | pytania do ROPS i ekspertów, panel eksperta, partnerstwa, sprawy z osią czasu |
| VI. Centrala | `/centrala` (hasło) | skrzynka, Radar, nabory i ocena wniosków, treści, edytor Akademii, import danych IOSS z podglądem, powiadomienia, integracje (webhooki) |
| VII. Krawiec | `/wdrozenie` | plan wdrożenia: dwa warianty z kosztem na odbiorcę, kompas DI, kwalifikowalność, pakiet startowy |
| Tryb asystowany | `/asystowane` | zgłoszenie w imieniu osoby bez internetu, karta potrzeby z kodem QR |

Integracje: API v1 z opisem OpenAPI (`/integracje`, `/api/v1/openapi.json`), webhooki HMAC, eksport wniosków do bazy grantowej, widżet „Znajdź pomoc”. Wdrożenie, skalowanie i koszty: `docs/WDROZENIE.md`. Licencje: `docs/zaleznosci.md`. Dostępność: `docs/raport-dostepnosci.md`.

## Uruchomienie

```bash
npm install
cp .env.example .env.local     # wpisz ANTHROPIC_API_KEY (nigdy do repozytorium)
npm run dev                    # http://localhost:3000
npx tsx --env-file=.env.local scripts/eval-swatka.ts   # pomiar trafności Swatki (30 zapytań)
npx tsx scripts/eval-swatka.ts --lex                   # to samo bez AI (wyszukiwanie awaryjne)
```

Stos: Next.js 16, React 19, Tailwind 4, `radix-ui`, `next-intl`, Anthropic SDK, zod. Zależności i licencje: `docs/zaleznosci.md`.

Aktualizacja istniejącego demo na Vercelu: push do podłączonego repozytorium. Konfiguracja `vercel.json` automatycznie wykonuje migracje 013–014 przez istniejące `DATABASE_URL`, a następnie buduje aplikację. Instrukcja i zmienne Vercela: [docs/WDROZENIE.md](docs/WDROZENIE.md). Testy logiki: `npm test`; testy integracyjne wymagają oddzielnej bazy testowej opisanej w instrukcji.

## Status

Start prac: 3.10.2026. Oddanie: 4.10.2026, 11:00 (HackTribe).
