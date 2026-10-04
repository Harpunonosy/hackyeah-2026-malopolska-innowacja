# Weryfikacja zgodności HubMI — 4.10.2026

W zapisanych logach usunięto wyłącznie końcowe białe znaki i znaki postępu terminala.

Testowane w izolowanym worktree `splot-hub-compliance`. Baza: osobny lokalny PostgreSQL na porcie 55433. Node 22.20.0, Next 16.3.8, Chromium/Playwright. Serwer testowy działał bez klucza AI. Osobny skrypt wykonał później trzy rzeczywiste zapytania do skonfigurowanego DeepSeek na syntetycznych opisach. Nie korzystano z głównej/produkcyjnej bazy ani prawdziwych danych uczestników.

| Sprawdzenie | Wynik | Dowód |
|---|---|---|
| Jednostkowe, kontraktowe i bazodanowe | 91 zaliczonych, 0 błędów, 0 pominiętych | `weryfikacja-hub/testy.log` |
| Scraping: błąd HTTP, zachowanie poprzedniej kopii, parsowanie linków, właściwy rok IOSS | 4/4 | `weryfikacja-hub/python.log`, `scripts/test_sources.py` |
| Produkcyjny build | Zakończony powodzeniem | `weryfikacja-hub/build.log` |
| ESLint i kontrola whitespace | Bez błędów | `weryfikacja-hub/lint.log`, `git diff --check` |
| axe WCAG 2.1 A/AA | 117 sprawdzeń, 0 naruszeń; 39 widoków × standard / duży tekst i wysoki kontrast / 320 px | `weryfikacja-hub/axe-117.log` |
| Reflow 320 px | 39 widoków, bez przewijania poziomego dokumentu | `weryfikacja-hub/reflow-320.log` |
| Rozwinięta Pracownia | Kanwa: skale pierwszej i ostatniej sekcji, własna odpowiedź ze spacjami, limit 3 wartości, 320 px, axe, ponowienie po błędzie sieci | `weryfikacja-hub/formularze.log`, `scripts/hub-ui-check.ts` |
| Rozmowa głosowa | Stop blokuje spóźniony start mikrofonu; odczyt zawiera wszystkie propozycje i pytanie o zgodę | `weryfikacja-hub/glos.log`, `scripts/hub-voice-check.ts` |
| Rzeczywiste AI | 3 syntetyczne przypadki: trafiony organizer leków, poprawny brak wyniku dla silnika samolotu, trafiony Merkury z ukraińskim uzasadnieniem. 1,438–4,223 s przy ciepłym cache dostawcy. | `weryfikacja-hub/ai-3-proby.jsonl`, `scripts/hub-ai-check.ts` |
| API i transakcje | Dostęp admina, edycja bazowej innowacji, zgłoszenie/test/opinia, maskowanie, wyniki testów, walidacja i daty naboru, ACK eksportu, rollback fiszki, filtrowanie spraw | `weryfikacja-hub/integracja.log`, `scripts/hub-compliance-check.ts` |

Audyt 117 widoków wykonano po zmianach interfejsu i formularzy. Następnie dopracowano obsługę dat typu `Date`, anulowania żądania opis pomocniczej oceny w Centrali, widoczność zasad mikrofonu oraz wyłączenie danych syntetycznych ze statystyk; końcowy build/testy oraz ponowienie scenariuszy formularza i API obejmują te poprawki. Nie należy utożsamiać liczby 117 z liczbą wszystkich stanów aplikacji.

## Odtworzenie

1. Zainstaluj zależności zgodnie z `package-lock.json`. Przygotuj oddzielny, lokalny PostgreSQL; wykonaj `db/schema.sql`, migracje `db/002_…`–`014_…` i seedy. Nie uruchamiaj testów zapisujących na produkcji.
2. Zestaw testów DB używa `SCHEMA_TEST_DATABASE_URL`, `IOSS_TEST_DATABASE_URL`, `AKADEMIA_TEST_DATABASE_URL`. Wszystkie ustaw na odrębną bazę testową. Test Akademii dopuszcza tylko lokalne bazy `splot_test:55432` albo nazwę `splot_compliance_*` na porcie 55433. Samo produkcyjne `DATABASE_URL` nie uruchomi testu Akademii.
3. `npm test`; `python3 -m unittest discover -s scripts -p test_sources.py`; `npm run lint`; `npm run build`.
4. W tym środowisku lokalny PostgreSQL nie ma pgvector: test schematu uruchomiono z `SCHEMA_TEST_WITHOUT_VECTOR=1`. Nie jest to test rozszerzenia vector. Domyślny test schematu wymaga rzeczywistego pgvector.
5. Uruchom `npm start -- --port 3201` z testową bazą, `SESSION_SECRET`, `DEMO_ADMIN_PASSWORD` i prywatnym `DEMO_EKSPERT_PASSWORD`.
6. Przeglądarka: wskaż zainstalowany Chromium przez `SPLOT_BROWSER_PATH` lub skorzystaj z obsługiwanej przeglądarki systemowej. `npx tsx scripts/a11y-i-zrzuty.ts http://localhost:3201 --tryby --bez-zrzutow`; `npx tsx scripts/szerokosc-320.ts http://localhost:3201`.
7. `HUB_TEST_BASE=http://localhost:3201 npx tsx scripts/hub-ui-check.ts`; analogicznie `scripts/hub-voice-check.ts` i `scripts/hub-compliance-check.ts`. Ostatni wykonuje syntetyczne zapisy i kontrolowaną awarię triggera, dlatego dodatkowo wymusza bazę `localhost:55433/splot_compliance_*`. Ponowione testy pozostawiają syntetyczne rekordy w tej jednorazowej bazie.

Skrypt `scripts/hub-ai-check.ts` wymaga jawnie skonfigurowanego `DEEPSEEK_API_KEY` i wykonuje 3 płatne zapytania. Włączać oddzielnie od testów automatycznych; nie zawiera sekretów.

## Granice

- Mock usług mowy sprawdza sterowanie, a nie jakość rozpoznawania, głosu, mikrofonu czy zgód na konkretnym telefonie.
- axe i reflow nie zastępują NVDA/VoiceOver, użytkowników docelowych, badania prostego języka, powiększenia 200/400%, dostępności filmów i PDF.
- Testy API używają syntetycznych danych. Nie dowodzą odporności na wszystkie ataki, pełnej anonimowości, zachowania pod obciążeniem ani działania zewnętrznej bazy grantowej.
- Trzy rzeczywiste zapytania do DeepSeek Flash zużyły 90 001 tokenów wejścia (w tym 89 088 odczytanych z cache) i 1178 wyjścia. To mała kontrola działania, nie estymacja Hit@3, czasu zimnego startu ani kosztu produkcyjnego. Nie przeliczano na walutę bez zweryfikowanego bieżącego cennika. Historyczne wyniki innego modelu nie są wynikiem tej wersji.
- Przed połączeniem z równoległymi zmianami i publikacją należy powtórzyć build oraz scenariusze na wspólnym wyniku.
