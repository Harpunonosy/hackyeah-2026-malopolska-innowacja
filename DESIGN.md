# DESIGN.md: Splot

Bez Figmy: projekt powstawał od razu w kodzie, sprawdzany zrzutami ekranu (1440 / 1024 / 375 px, zwykły i wysoki kontrast).
Kolory są tokenami w `app/globals.css` (`:root` i `html[data-kontrast="wysoki"]`). Komponenty nie mają wartości hex.

---

## 1. Koncepcja

**Stół w świetlicy sąsiedzkiej.** Mieszkaniec siada przy stole w punkcie pomocy i opowiada, co się dzieje. Po drugiej stronie ktoś splata jego potrzebę z nićmi sprawdzonych rozwiązań. Strona ma być spokojna jak lniany obrus: jedno pytanie, jedno pole, jeden duży przycisk.

| Warstwa | Co zawiera | Implementacja |
|---|---|---|
| 1. Tło | lniany papier, ciepłe światło dnia | `--bg` `#faf7f2`, `--soft` `#f0e9dd` |
| 2. Rama | karta formularza i panel „Jak to działa” połączony nićmi | `.karta`, `components/home/jak-to-dziala.tsx` |
| 3. Pierwszy plan | pole opisu i przycisk „Znajdź pomoc” | `components/home/pole-opisu.tsx` |

**Kotwica:** pole opisu leży na białej karcie. Obok jest panel kroków, a na telefonie pod formularzem. Nie unosi się na pustym tle.

**Charakter:** ciepły, urzędowo wiarygodny, prosty, regionalny bez folkloru.

**Ciemny motyw:** świadomie go nie ma. Jego rolę pełni tryb **wysokiego kontrastu** z paska dostępności: świetlica wieczorem, czarne tło, nici żółta i biała. Mieści się w nim cała paleta i znak.

---

## 2. Znak

`components/logo.tsx`, `app/icon.svg` (favicon, także `app/favicon.ico` i `app/apple-icon.png`).

Dwie nici, granatowa i czerwona, tworzą serce i krzyżują się pod nim jak węzeł. U góry czerwona nić leży na wierzchu, u dołu granatowa: to prawdziwy splot (przeplot nad i pod). Znaczenie: potrzeba mieszkańca i rozwiązanie wiążą się w jedno.

- Nić granatowa = `currentColor` (na ciemnym tle staje się biała).
- Nić czerwona = `--logo-nic` (w wysokim kontraście żółta `#ffd400`).
- Przerwa przy skrzyżowaniu ma kolor tła: `--logo-tlo` (domyślnie `--bg`, w stopce `--hero-bg`).
- Minimalny rozmiar: 24 px. Favicon: biały i różowy znak na granatowym kwadracie.

---

## 3. Kolor

Źródło palety: tusz granatowy, czerwień i złoto (rozdz. 17 PLAN.md) + materiał miejsca (len, papier).

| Token | Zwykły | Wysoki kontrast | Użycie |
|---|---|---|---|
| `--bg` | `#faf7f2` | `#000000` | tło strony |
| `--card` | `#ffffff` | `#0a0a0a` | karty, pola |
| `--soft` | `#f0e9dd` | `#141414` | pasek dostępności, przykłady, panel kroków |
| `--line-soft` | `#ddd4c4` | `#ffffff` | obramowania kart |
| `--border` | `#8a94a8` | `#ffffff` | obramowania pól (≥ 3:1) |
| `--fg` | `#14213d` | `#ffffff` | tekst, aktywne przełączniki |
| `--muted` | `#3d4a66` | `#e6e6e6` | opisy (≥ 7:1 na `--bg`) |
| `--primary` | `#b3203a` | `#ffd400` | główne działanie, ikony kafelków |
| `--accent` | `#d9a21b` | `#ffd400` | wyróżnienia, tylko z ciemnym tekstem |
| `--logo-nic` | `#b3203a` | `#ffd400` | czerwona nić znaku i ilustracji |
| `--nic-zlota` | `#d9a21b` | `#ffffff` | złota nić w „Jak to działa” |

Każdy akcent ma jedno zadanie: czerwień = działanie, złoto = wyróżnienie, granat = treść i stan „włączone”.

---

## 4. Typografia

| Zmienna | Krój | Rola |
|---|---|---|
| `--font-sans` | Atkinson Hyperlegible Next | cały interfejs, 18 px bazowo |
| `--font-display` | Bricolage Grotesque | nagłówki, nazwa marki, numery kroków |

Zasady czytelności: bez wersalików w etykietach (zdania zaczynamy wielką literą), etykiety min. `text-base` przy krokach formularza, opisy `text-lg`, interlinia 1,6 (w trybie prostym 1,75).

---

## 5. Strona startowa

```
1440 px, kontener 72rem (1296 px)
┌ pasek dostępności (len) ─────────────────────────────────────────────┐
├ [znak] Splot / Małopolski Hub…        Start · Biblioteka · Galeria · Moje ┤
│                                                                      │
│ W czym możemy Ci pomóc?   (~760 px)                                   │
│ Opisz swoją sytuację…                                                 │
│ ┌ karta ─────────────────────┐        ┌ Jak to działa (~500 px) ──┐  │
│ │ [ pole opisu             ] │        │ (1) Opisz                 │  │
│ │ [Powiedz] [Znajdź pomoc →] │        │  ┆  nici                 │  │
│ └────────────────────────────┘        │ (2) Dopasujemy            │  │
│ Nie wiesz, jak zacząć? (przykłady)    │  ┆                        │  │
│ Inne sposoby: [mikrofon][książka][ręka]│ (3) Zgłoś i śledź        │  │
│                                       └───────────────────────────┘  │
│ Albo wybierz, co chcesz zrobić: 6 kafelków, 3 kolumny                │
└──────────────────────────────────────────────────────────────────────┘
```

375 px: jedna kolumna; menu w siatce 2×2 (każda pozycja wygląda jak przycisk); panel kroków pod formularzem.

---

## 6. Charakterystyczny moment

**Nici się splatają.** W panelu „Jak to działa” czerwona i złota nić odsłaniają się z góry na dół (1,6 s, `clip-path`) i krzyżują się na numerach kroków. Przy `prefers-reduced-motion` są od razu całe. Ruch nie opóźnia ani nie zasłania formularza.

---

## 7. Tryb prosty

Cel: senior dostaje minimum tekstu, ale nic nie ginie. To, co schowane, jest pod jednym przyciskiem albo pod „Pokaż wszystko”.

Mechanika: `data-prosty="tak"` na `<html>` (cookie, bez migotania). Style: wariant Tailwind `prosty:` (np. `prosty:hidden`). Komponenty klienta: `useTrybProsty()` z `components/a11y/tryb-prosty.tsx`. Przełączenie działa od razu, bez przeładowania.

| Miejsce | Tryb prosty |
|---|---|
| Cały serwis | tekst 20 px, złoty pasek „Tryb prosty… / Pokaż wszystko”, bez nadtytułów, w stopce tylko linki dla mieszkańca |
| Start | bez „Jak to działa”; 3 kafelki mieszkańca, reszta pod „Więcej możliwości” |
| Opisz problem | jedno pole i jeden przycisk; bez numerów kroków, wyboru roli i powiatu; krótka podpowiedź |
| Wyniki | karta = nazwa, poziom dopasowania, „dlaczego pasuje”, „Zobacz pełny opis”; bez kategorii, „Czy to działa”, „Tak rozumiemy”, „Co warto wiedzieć” |
| Zgłoszenie | bez zgody na testy; duży przycisk na całą szerokość |
| Karta rozwiązania | od razu tekst łatwy do czytania (AI); pełna karta ROPS pod „Pokaż pełny opis” (otwiera się sama, gdy AI zawiedzie) |
| Biblioteka | wyszukiwarka i tematy zamiast 11 rzędów; bez porównywarki i dodatkowych filtrów |
| Moja sprawa | duża karta „Twoja sprawa teraz” (status, krok X z 4, termin) zamiast osi czasu i listy powiadomień |
| Fiszka pomysłu | ocena tylko w skrócie, bez „Trudnych pytań”; kanwa zwinięta z licznikiem pól |

## 8. Fiszka pomysłu

Jeden przewijany formularz z ponumerowanymi częściami i spisem treści na górze: 1 Fiszka (pola od razu do edycji), 2 Czy to już istnieje, 3 Wstępna ocena, 4 Trudne pytania, 5 Kanwa (wszystkie obszary rozwinięte, wstępnie wypełnione odpowiedziami AI), 6 Dodatkowe narzędzia (zwinięte, nieobowiązkowe), 7 Wyślij do ROPS. Wysyłka jest zawsze na samym dole i pokazuje, co trafi do ROPS (w tym „Kanwa: uzupełnione X z 26 pól”).

## 9. Zasady, które pilnujemy

- Główne działanie („Znajdź pomoc”) widać bez przewijania przy 1440 i 375 px.
- Cele dotykowe min. 48 px, widoczny fokus (3 px + poświata), każda ikona z tekstem.
- Przykłady i „Inne sposoby” mają widoczną etykietę, nie są samymi przyciskami bez kontekstu.
- Kafelki: najechanie zmienia obramowanie i przesuwa strzałkę; bez unoszenia kart.
- Kontrola: `npx tsx scripts/a11y-i-zrzuty.ts` (axe) i `scripts/szerokosc-320.ts`.
