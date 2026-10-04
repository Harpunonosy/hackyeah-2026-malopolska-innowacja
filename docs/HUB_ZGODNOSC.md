# Splot — zgodność z wyzwaniem HubMI

Stan: 4 października 2026. Podstawa: wszystkie 8 stron `hub.pdf`, sześć adresów przekazanych przez organizatora, przegląd kodu i testy na osobnej lokalnej bazie. Zmiany znajdują się na gałęzi `codex/hub-compliance`, w worktree `splot-hub-compliance`, bazującym na `3715db2`. Nie zostały automatycznie włączone do równolegle rozwijanego głównego checkoutu ani wdrożone.

**Ocena: wszystkie siedem modułów mają implementację. Nie oznacza to, że wszystkie są dopracowane do perfekcji ani że platforma jest gotowa na rzeczywiste dane mieszkańców.** Brief wymaga działającego MVP; gotowość produkcyjna jest oddzielnym, znacznie wyższym progiem. Poprawiono konkretne luki przepływów i zgodności, zamiast zaliczać moduł za samą obecność zakładki.

## Wymagania funkcjonalne — strony 3–4 PDF

| Wymaganie | Realizacja i dowód | Granica potwierdzenia / ryzyko |
|---|---|---|
| I. Opis problemu i automatyczne dopasowanie | `/problem`, dyktowanie, PL/UK, katalog ROPS, tryb AI i wyszukiwanie awaryjne. `lib/swatka.ts`, `lib/szukaj.ts`. Wyszukiwanie awaryjne używa aktualnego katalogu, uwzględnia dodane/zmienione/ukryte karty. Test indeksu z pustym i nowym katalogiem. | Trzy rzeczywiste kontrole DeepSeek Flash: organizer leków, odrzucenie tematu lotniczego, Merkury po ukraińsku — oczekiwane zachowanie w każdym przypadku (1,4–4,2 s, ciepły cache). Nie jest to reprezentatywny benchmark trafności. |
| I. Podobne przypadki i informacje | Kontekst Mapy, fakty, agregaty wcześniejszych zgłoszeń i wyniki pomocy w istniejącym module. | Przegląd kodu i istniejące testy kontekstu; próg agregacji nie stanowi pełnego dowodu anonimowości. |
| II. Kondycja Małopolski | `/wiedza/malopolska`, profile 22 powiatów, 8 obszarów Mapy. Świeży import IOSS: 184 pozycje indeksu, 149 z danymi, 3278 wartości (w tym 1 brak wartości). | Dane mają różne lata. Rok pochodzi z zaznaczonej opcji wykresu, nie z daty pobrania ani pierwszej opcji listy. Nie interpretować ich jako danych bieżącego roku. |
| II. Biblioteka sprawdzonych innowacji i filmy | 115 kart ze źródła; opis, odbiorcy, wyniki opisane przez ROPS, linki do filmów, PDF i materiałów wdrożeniowych. Ponownie pobrane karty; usunięcie wykrytego adresu e-mail i nazwiska przy nazwie jednoosobowej organizacji. | Nie jest to pełne, około 200-elementowe portfolio wspomniane w PDF: publiczna wskazana biblioteka udostępniła 115 kart. Nie zmyślono brakujących rekordów. Wyniki skuteczności są opisami wydawcy. |
| II. Raporty, publikacje, edukacja | Nowe `/wiedza/materialy` i `/wiedza/materialy/[id]`; lokalne wyszukiwanie po tytule/temacie, filtry typu, stronicowanie. Akademia i diagnoza prowadzą do źródeł. 57 zweryfikowanych plików; 15 opracowań wybranych fragmentów z konkretnymi stronami. | 57 to katalog metadanych, **nie pełnotekstowy indeks 57 raportów**. Pełne PDF otwierają się u wydawcy. Opracowania nie zastępują całości dokumentów. |
| II. Proste zdobywanie informacji | Wyszukiwanie bez AI; krótkie opracowania, oryginalne źródła, pytanie do raportów. Cytowania Mapy nie są już odrzucane przez błędny zakres indeksów. | Asystent wykorzystuje wybrane fakty i fragmenty, nie całą treść wszystkich PDF. Potrzebna redakcja ROPS i dalsze rozszerzanie opracowań. |
| II. Aktualizacja wiedzy | Skrypty pobierania z kontrolą HTTP/kompletności i atomowym zastępowaniem plików; panel treści, lekcji i importu IOSS. Test integralności importu. Edycja bazowej karty potwierdzona przez publiczne API. | Aktualizacja katalogu dokumentów wymaga uruchomienia skryptu i publikacji nowej wersji. Brak harmonogramu automatycznego importu. |
| II. Agregacja potrzeb tylko dla administratora | Radar/Centrala; `/api/v1/potrzeby` wymaga sesji ROPS, `private, no-store`, bez publicznego CORS i bez rekordów syntetycznych. Test anonimowe 401 / admin 200. Dokumentacja API poprawiona. | Skonfigurowana sesja demo nie zastępuje produkcyjnego zarządzania rolami. |
| III. Stała fiszka: opis, istota, odbiorcy, etap | `/pomysl`, ręczne wypełnienie bez AI lub analiza. Walidacja i maskowanie wszystkich pól, ograniczony kształt oceny/kanwy. Fiszka, sprawa, historia i powiadomienie zapisują się w jednej transakcji. Test kontrolowanej awarii i rollback. | Numer sprawy jest tokenem dostępu. Użytkownik musi go zachować. Robocza fiszka nie ma trwałego autosave; odświeżenie przed wysłaniem może utracić wpisy. Ocena nadesłana z klienta ma charakter pomocniczy; nie jest podpisanym dowodem oceny AI ani decyzją komisji. |
| III. Dobre praktyki i mikropilotaże | `/galeria`, moderacja w Centrali; zapis etapu i wyników testów do `wyniki_testu`. Wcześniej API przyjmowało wyniki bez ich zapisu. | ROPS musi merytorycznie zweryfikować wynik przed publikacją; demonstracyjne przykłady nie są dowodami rzeczywistych wdrożeń. |
| III. Czasowy generator wniosków | Daty od/do w strefie Europe/Warsaw; zamknięcie obowiązuje w liście, publicznym API i przy składaniu. Schemat danego naboru, ręczne wypełnianie bez AI, limity i obowiązkowe pola. Testy pustych pól, duplikatów, przekroczeń, terminu i poprawnego wniosku. Zapis wniosku i sprawy atomowy. | Regulamin i automatycznie wyodrębniony schemat wymagają zatwierdzenia przez ROPS. Pomoc AI nie oznacza przyznania finansowania. |
| III. Kanwa organizatora | Wszystkie 10 sekcji i 26 głównych pól trzech plansz INNO AGH, skale, własne odpowiedzi, wybory do 3 wartości, dodatkowe pola finansowania, wskazanie statusów partnerów, druk. Test rozwiniętej kanwy i wpisywania wielowyrazowych odpowiedzi. | Źródłowe etykiety kanwy są po polsku, oznaczone `lang=pl`. Po wysłaniu jest zapisanym załącznikiem pomysłu; uzupełnienia idą w wątku sprawy. Nie ma edytowalnego konta projektu z wersjami kanwy. |
| III. Asystent i wizualizacja | Istniejący asystent, podpowiedzi, scenorys/szkic; formularze odzyskują możliwość pracy po błędzie sieci. | To funkcja dodatkowa. Nie wykonywano nowego testu jakości generowania wizualizacji przez zewnętrzny model. |
| IV. Chęć udziału w testach | Ogłoszenia, moderacja, zapis, liczba miejsc, numer sprawy. Zapis uczestnika i jego sprawy w jednej transakcji; blokada bazy chroni limit miejsc. | Brak pełnego panelu uczestnika, weryfikacji tożsamości, wypisania i ochrony przed ponownym anonimowym zapisem. |
| IV. Ocena, feedback, usprawnienia | Ocena innowacji **lub konkretnego testu**, także nowego pomysłu bez karty w Bibliotece. Pytania o łatwe/trudne elementy i propozycję poprawy. Zgodne limity 500/800 znaków w UI/API. Opinie widoczne w Centrali. | Opinie są otwarte i anonimowe, więc nie stanowią kontrolowanego badania skuteczności. |
| V. Dialog ROPS–autor, mentorzy, partnerstwa | Sprawy, wiadomości, profil eksperta i przypisanie, rynek współpracy, sieć liderów, kontakt asystowany. Naprawiono zawieszanie formularzy i potwierdzanie niezapisanej oceny/wiadomości. | Powiadomienia e-mail/SMS są symulowane. Działają wpisy w aplikacji; nie zadeklarowano rzeczywistego doręczenia. |
| V. Szybkie powiadamianie | Centrala odpytuje nowe zgłoszenia niezależnie od aktualnej strony listy. Powiadomienia dźwiękowe/pulpitowe wymagają otwartej aplikacji i zgody. | Brak trwałych powiadomień push po zamknięciu przeglądarki; okno odpytywania i limit nowych wpisów wymagają obciążeniowej weryfikacji. |
| VI. Modyfikacja, weryfikacja, publikacja | Treści, lekcje, fiszki, testy, nabory, import IOSS; dziennik. Poprawiona edycja kart ROPS i rzeczywisty błąd usunięcia powiązanej karty. Skrzynka ma filtry serwera, liczbę wszystkich spraw i strony po 50. | Część innych list administracyjnych nadal ma stałe limity; pełne archiwum i wyszukiwanie we wszystkich zasobach wymaga dalszej pracy. |
| VII. Middleman / dostosowanie do instytucji | `/wdrozenie`, Krawiec, profil instytucji, plan, zasoby, ryzyka, kwalifikowalność. Pole partnerów jest maskowane przed AI i zapisem profilu. | Nowa jakość merytoryczna planów nie została potwierdzona z ekspertem ROPS ani pomiarem modelu na tej gałęzi. |

## Sześć źródeł — co faktycznie wykorzystano

| Źródło organizatora | Lokalny rezultat | Zastosowanie |
|---|---|---|
| [Biblioteka](https://rops.krakow.pl/innowacje-spoleczne/biblioteka-innowacji-spolecznych/kategorie) | `data/zrodla/biblioteka_innowacji_rops.json`, 115 kart | Katalog, Swatka, podobne pomysły, Krawiec, multimedia |
| [Raporty](https://rops.krakow.pl/badania-analizy-raporty/raporty-z-badan) | 51 dokumentów w `materialy_rops.json`; wybrane opracowania | Wyszukiwarka źródeł, diagnoza i kontekst asystenta |
| [Obserwator IOSS](https://obserwator.rops.krakow.pl/) | JSON/CSV, 3278 wartości, poprawne lata wykresów | Wskaźniki regionalne, profile powiatów, import administracyjny |
| [Mapa Wyzwań](https://rops.krakow.pl/mpliki/IS/IWS_20/za._nr_2._Mapa_Wyzwa_Spoecznych.pdf) | `mapa_wyzwan.json`, źródło PDF 44 strony | 8 obszarów, priorytety, diagnoza, cytowania |
| [Publikacje](https://rops.krakow.pl/innowacje-spoleczne/publikacje-ze-swiata-innowacji) | 4 publikacje i kanwa wskazana również osobno; deduplikacja URL | Wiedza o współpracy, dostępności i procesie innowacji |
| [Social Canvas](https://rops.krakow.pl/mpliki/IS/Moj_folder/INNO_AGH_-_SOCIAL_CANVAS.pdf) | Schemat 3 plansz, 10 sekcji, 26 pól; katalog materiałów | Interaktywny formularz i wydruk w Pracowni |

57 unikalnych dokumentów = 51 raportów + 4 publikacje + Mapa + kanwa. Metadane obejmują URL wydawcy, liczbę stron, typ, język, datę pobrania i SHA-256. 15 opracowań ma numer strony i hash sprawdzonego PDF. Zmiana pliku źródłowego wyłącza stare opracowanie do ponownego przeglądu.

To **rzeczywiste migawki danych publicznych, a nie wymyślone mocki**. Strona nie pobiera ROPS przy każdym wejściu. Nie zapisano pełnej surowej treści wszystkich raportów ani danych ich respondentów. Automatyczne filtrowanie danych osobowych wymaga kontroli redakcyjnej przy kolejnych importach.

## Dostępność, prostota i wykluczenie cyfrowe

- Główne drogi dostępne bez konta: opisz problem, przeglądaj katalog, zgłoś pomysł, sprawdź sprawę po numerze. Brak konta upraszcza wejście, ale zgubienie numeru pozostaje ryzykiem.
- Na stronie startowej są widoczne odnośniki do pełnej rozmowy głosowej, prostych instrukcji i pomocy innej osobie. Nie przywrócono natarczywego panelu pierwszej wizyty.
- Rozmowa odczytuje wszystkie prezentowane propozycje, nie przerywa ich pytaniem po 300 ms. Stop anuluje oczekujący start mikrofonu i wyszukiwanie; ręczny tekst pozostaje alternatywą. Rzeczywiste rozpoznawanie mowy zależy od urządzenia i usługi przeglądarki.
- Fiszka, kanwa i wniosek mają ręczne ścieżki. Długie treści rozwijane są sekcjami. Błąd sieci nie usuwa wpisanej treści ani nie pozostawia trwale zablokowanego formularza w poprawionych ścieżkach.
- Informacja o rzeczywistej skuteczności i zasadach używania mikrofonu nie jest ukrywana przez tryb prosty.
- Oczekiwanie na AI pokazuje orientacyjny czas i zakres pracy, bez fikcyjnych odhaczonych etapów i procentu ukończenia.
- Zdiagnozowano i usunięto przewijanie poziome rozwiniętego asystenta przy 320 px. Same testy stron ze zwiniętymi formularzami wcześniej nie wykrywały tego problemu.
- Nadal potrzebne: badanie zadaniowe z seniorami i osobami z niepełnosprawnościami, NVDA/VoiceOver, powiększenie 200/400%, napisy i audiodeskrypcja rzeczywistych filmów, dostępność zewnętrznych PDF. Wynik axe nie jest certyfikatem WCAG 2.1 AA.
- Ukraiński interfejs nie oznacza pełnego tłumaczenia wszystkich treści edukacyjnych, formularzy źródłowych i odpowiedzi wszystkich asystentów. To zakres do domknięcia, a nie ukończona pełna lokalizacja.

## Bezpieczeństwo, skalowanie i integracje — strony 5–6, 8

Naprawiono ujawnianie skonfigurowanego hasła eksperta w publicznym HTML; wyłączono niejawne hasło domyślne. Zabezpieczono CSV przed interpretacją tekstu mieszkańca jako formuły. Fiszka/kanwa oraz profil partnerów Krawca podlegają maskowaniu. Typy JSON nie pozwalają już łatwo wywrócić Centrali obiektem zamiast listy ocen. Fiszka, wniosek i zapis na test tworzą sprawę atomowo. Pobranie eksportu nie potwierdza odbioru: służy do tego osobny, idempotentny POST. Odczyt strony powiadomień nie oznacza automatycznie wszystkich niepokazanych wiadomości jako przeczytanych.

Przed rzeczywistym wdrożeniem pozostają obowiązkowe prace:

1. Indywidualne konta i role administratorów/ekspertów zamiast wspólnego hasła demo; zarządzanie uprawnieniami, retencją i odzyskaniem dostępu.
2. Rzeczywisty dostawca e-mail/SMS, retry i trwała kolejka zdarzeń/webhooków. Obecny podpis HMAC i dziennik nie gwarantują doręczenia.
3. Wspólny limiter dla wielu instancji, kontrola kosztu AI, ograniczenia egress dla webhooków; pozostałe wieloetapowe procesy wymagają transakcji/idempotencji.
4. Testy obciążenia i awarii na docelowej infrastrukturze, test odtworzenia kopii bazy, monitoring. Historyczne benchmarki w `WDROZENIE.md` nie potwierdzają tej wersji.
5. Weryfikacja polityki prywatności, powierzenia danych, dostawcy AI i procedur przez właściciela wdrożenia. Maskowanie regułowe nie daje gwarancji anonimowości.

## Walidacja wykonanej zmiany

Dowody i polecenia są w [HUB_TESTY.md](HUB_TESTY.md). Testy zapisujące korzystają wyłącznie z osobnego PostgreSQL na `localhost:55433`. Nie używano produkcyjnych danych ani prawdziwych uczestników; nie wysyłano maili/SMS do ludzi.

Przegląd objął implementację siedmiu modułów, a testy interaktywne skupiły się na zmienionych ścieżkach i wykrytych regresjach. Nie należy przedstawiać go jako wyczerpującego testu wszystkich kombinacji stanu każdego modułu.

## Kryteria punktowe i gotowość zgłoszenia

| Kryterium z PDF | Maksimum | Stan i znaczenie |
|---|---:|---|
| Moduły | 40 | Istnieje zakres wszystkich siedmiu modułów: 10 + 6×5. Punkty zależą od jakości demonstracji, nie liczby zakładek. Wykonano trzy kontrole rzeczywistego AI; nadal brakuje reprezentatywnego badania trafności. |
| Potencjał wdrożeniowy | 20 | Struktura danych, importy, API, poprawione transakcje i operacje panelu są mocnym elementem MVP. Wspólne konta demo, symulowane kanały i brak testu docelowej skali ograniczają ocenę gotowości. |
| Dostępność i intuicyjność | 20 | Duże kontrolki, klawiatura, kontrast, proste instrukcje, asysta, druk i aktualne testy automatyczne. Brak badań z docelowymi grupami uniemożliwia zapewnienie „łatwe niezależnie od wieku”. |
| Pomysłowość i interfejs | 10 | Wspólna sprawa łączy zgłoszenie, pomysł, grant i dialog; dane powiatowe, ręczna kanwa i asysta tworzą spójną usługę. Ocena atrakcyjności pozostaje po stronie jury. |
| Materiały i MVP | 10 | Istnieją aplikacja, kod, dokumentacja i raporty testów. W tym zakresie nie przygotowano wymaganego PDF do 10 slajdów lub filmu do 3 minut. |

**Nie ma podstaw do deklaracji 100/100 punktów ani „100% gotowości”.** Funkcjonalny zakres siedmiu modułów jest szeroki, lecz sam kod nie zamyka wymogów formalnych i jakościowych. Do wysłania zgłoszenia potrzebne są jeszcze: działający publiczny adres tej wersji, materiał PDF/film w limicie, wskazane makiety/widoki UI oraz aktualny kosztorys utrzymania i niezbędnych zasobów. Istniejąca dokumentacja kosztów zawiera historyczne pomiary innego modelu; nie wolno ich przedstawiać jako kosztu bieżącego DeepSeek.

Slajdów, filmu, deploymentu i integracji z główną gałęzią nie wykonywano w tym izolowanym worktree. Priorytet przy przekazaniu: włączyć zmiany po uzgodnieniu z równoległym wątkiem, odtworzyć testy na wspólnym wyniku, rozszerzyć pomiar trafności/czasu/kosztu skonfigurowanego AI poza trzy przypadki, a następnie zebrać krótką demonstrację siedmiu przepływów.
