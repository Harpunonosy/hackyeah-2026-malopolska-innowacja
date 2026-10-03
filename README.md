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

## Status

Start prac: 3.10.2026. Oddanie: 4.10.2026, 11:00 (HackTribe).
