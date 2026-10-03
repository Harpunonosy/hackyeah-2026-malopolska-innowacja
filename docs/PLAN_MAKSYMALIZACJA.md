# Domknięcie wymagań HubMI

Źródła: `hub.pdf` (§2, §5, §6, §8), `NEXT.md`, `PLAN.md`, `DROGA_DO_90.md`.

Cel: poprawić jakość siedmiu istniejących modułów pod kryteria jury. Wagi są ustalone; ocena jakości jest uznaniowa. Nie deklarujemy gwarantowanej punktacji.

Ograniczenia: lokalne commity bez pushowania i bez współautora; polskie teksty w messages; dostępność 320 px i klawiatura; nie zmieniamy modelu AI; nie przygotowujemy slajdów ani filmu (preferencja z NEXT.md). Pracujemy w istniejącym checkoutcie.

## Zadania

- [ ] Akademia: administrator dodaje i edytuje lekcje, tekst łatwy, quiz oraz źródła; rozdzielenie szkicu i publikacji. Publiczne strony czytają zatwierdzone materiały z bazy, pięć oryginalnych lekcji pozostaje bazą. Walidacja, kontrola admina, dziennik zmian, test zapis → publikacja → odczyt.
- [ ] IOSS: administrator wkleja CSV, widzi podgląd i błędy przed zatwierdzeniem; atomowy import aktualizuje bazę i odświeża mapy oraz profile. Kontrola powiatów, wskaźników, lat, wartości i duplikatów; testy poprawnego importu oraz odrzucenia błędnych danych.
- [ ] Komunikacja: sprawdzić i poprawić niezawodność odpytywania Centrali i powiadomień na pulpicie; sprawdzić nowy pomysł → Centrala → odpowiedź → autor bez wywołań płatnego AI.
- [ ] Weryfikacja: TypeScript, lint, build, testy funkcjonalne i dostępność nowych formularzy; zaktualizować NEXT.md oraz instrukcję migracji.

## Szczególna uwaga podczas przeglądu

1. Niepoprawny CSV nie może częściowo zmienić danych.
2. Szkice lekcji nie mogą pojawić się publicznie, opublikowana lekcja musi działać bez restartu serwera.
3. URL źródła nie może wykonywać skryptów ani prowadzić do niedozwolonego protokołu.
4. Błąd sieci nie może wyłączyć kolejnych powiadomień ani pozostawić nieskończonego ładowania.
5. Formularze muszą działać przy 320 px, z klawiatury i bez uprawnień administratora do API.

## Środowisko

Checkout nie zawiera `.env.local`, Node.js ani przeglądarki. Node.js i czytnik PDF przygotowano lokalnie w `/tmp`; testy wymagające bazy wykonujemy na odrębnej lokalnej bazie, nigdy na wspólnej bazie demo.
