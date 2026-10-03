# Wykaz zależności i licencji

Stan na 3.10.2026, commit z tego dnia. Wykaz powstał ze skanu `package-lock.json` i plików `package.json` w `node_modules` (skrypt w sekcji „Jak odtworzyć”). Wykaz jest elementem umowy: zasada projektu to licencje MIT, Apache-2.0, BSD i ISC dla bibliotek wchodzących w skład aplikacji.

## Zależności bezpośrednie

### Działają w aplikacji (produkcja)

| Pakiet | Wersja | Licencja | Do czego |
|---|---|---|---|
| next | 16.3.8 | MIT | framework aplikacji (strony, API) |
| react, react-dom | 19.2.8 | MIT | interfejs |
| next-intl | 4.14.9 | MIT | teksty PL i UA |
| radix-ui | 1.6.7 | MIT | dostępne komponenty (przełączniki, grupy przycisków) |
| lucide-react | 1.51.0 | ISC | ikony |
| class-variance-authority | 0.7.1 | Apache-2.0 | warianty przycisków |
| clsx | 2.1.1 | MIT | łączenie klas CSS |
| tailwind-merge | 3.7.0 | MIT | łączenie klas CSS |
| @anthropic-ai/sdk | 0.131.0 | MIT | wywołania modelu AI (tylko przez `lib/ai.ts`) |
| zod | 4.6.5 | MIT | walidacja danych i strukturalne odpowiedzi AI |
| pg | 8.23.1 | MIT | połączenie z bazą PostgreSQL |
| qrcode | 1.5.4 | MIT | kody QR (plakat pomysłu, karta potrzeby) |
| @types/qrcode | 1.5.6 | MIT | typy TypeScript |

### Tylko do budowania, testów i rozwoju (nie trafiają do przeglądarki użytkownika)

| Pakiet | Wersja | Licencja | Do czego |
|---|---|---|---|
| typescript | 5.9.3 | Apache-2.0 | kompilator |
| tailwindcss, @tailwindcss/postcss | 4.3.3 | MIT | style |
| eslint, eslint-config-next | 9.39.5 / 16.3.8 | MIT | kontrola jakości kodu |
| tsx | 4.23.15 | MIT | uruchamianie skryptów |
| playwright-core | 1.63.0 | Apache-2.0 | testy w przeglądarce i zrzuty ekranu |
| **@axe-core/playwright** | 4.13.0 | **MPL-2.0** | testy dostępności (WCAG) |
| @types/node, @types/pg, @types/react, @types/react-dom | różne | MIT | typy TypeScript |

## Zależności pośrednie (cały `package-lock.json`, 643 pakiety)

| Licencja | Liczba | Uwagi |
|---|---|---|
| MIT | 520 | |
| Apache-2.0 | 40 | |
| ISC | 27 | |
| BSD-2-Clause, BSD-3-Clause, 0BSD | 11 | |
| Apache-2.0 AND MIT | 11 | `@swc/core-*` (kompilator wbudowany w Next.js) |
| **MPL-2.0** | 14 | `axe-core`, `@axe-core/playwright` (tylko testy); `lightningcss` i jego warianty platformowe (narzędzie budowania Tailwind, nie trafia do aplikacji) |
| **LGPL-3.0-or-later** (część z Apache-2.0 / MIT) | 14 | `@img/sharp-libvips-*`, `@img/sharp-*`: biblioteka libvips, opcjonalna zależność Next.js do optymalizacji obrazów. Splot nie używa `next/image` |
| CC-BY-4.0 | 1 | `caniuse-lite`: dane o przeglądarkach używane przy budowaniu |
| BlueOak-1.0.0 | 1 | `minimatch` (narzędzia budowania), licencja liberalna |
| Python-2.0 | 1 | `argparse` (narzędzia ESLint), licencja liberalna |
| Unlicense, CC0-1.0 | 2 | `fast-sha256`, `language-subtag-registry`: domena publiczna |

## Ocena zgodności z zasadą MIT/Apache/BSD/ISC

1. **Kod, który działa w aplikacji**, czyli wszystkie zależności bezpośrednie produkcyjne, ma licencje MIT, Apache-2.0 albo ISC. Zasada jest spełniona.
2. **Wyjątki dotyczą wyłącznie narzędzi:**
   - **MPL-2.0** (`axe-core`, `lightningcss`) to licencja „słabego copyleftu” na poziomie pliku. Używamy tych narzędzi bez zmian, tylko przy testach i budowaniu, i nie dystrybuujemy ich w aplikacji.
   - **LGPL-3.0** (`libvips` przez `sharp`) to opcjonalna zależność Next.js, którą instalator pobiera automatycznie. Splot nie korzysta z optymalizacji obrazów. Przy wdrożeniu produkcyjnym można ją wyłączyć (`images: { unoptimized: true }` i instalacja z `--omit=optional`).
   - **CC-BY-4.0, BlueOak, Python-2.0, Unlicense, CC0** to licencje liberalne, które nie nakładają obowiązków na kod Splotu.
3. **Zalecenie dla ROPS:** wykaz warto potwierdzić u prawnika przed podpisaniem umowy o przeniesieniu praw. Jeśli zasada ma objąć także narzędzia testowe, `@axe-core/playwright` można zastąpić ręcznym testem albo uruchamiać poza repozytorium.

## Usługi zewnętrzne (nie są bibliotekami)

| Usługa | Rola | Dane |
|---|---|---|
| Anthropic API (model Claude) | AI: dopasowanie, ocena, szkice | tylko tekst po maskowaniu danych osobowych (`lib/maskowanie.ts`) |
| Supabase (PostgreSQL, UE) | baza danych | dane demo są syntetyczne |
| Vercel | hosting demo | logi bez treści zgłoszeń |
| YouTube (youtube-nocookie.com) | odtwarzanie filmów ROPS po kliknięciu | brak ciasteczek śledzących przed kliknięciem |

Dane: Biblioteka Innowacji Społecznych, Mapa Wyzwań Społecznych, IOSS i raporty ROPS Kraków (materiały udostępnione uczestnikom HackYeah). Czcionki: Atkinson Hyperlegible Next i Bricolage Grotesque (SIL Open Font License 1.1, serwowane z naszego serwera przez `next/font`).

## Jak odtworzyć wykaz

```bash
node -e '
const fs=require("fs"),path=require("path");
const lock=JSON.parse(fs.readFileSync("package-lock.json"));const lic={};
for(const [k,v] of Object.entries(lock.packages)){ if(!k) continue;
  let l=v.license; if(!l){try{l=JSON.parse(fs.readFileSync(path.join(k,"package.json"))).license}catch{}}
  (lic[l||"?"]??=[]).push(k.split("node_modules/").pop()); }
for(const [l,a] of Object.entries(lic)) console.log(l, a.length);'
```
